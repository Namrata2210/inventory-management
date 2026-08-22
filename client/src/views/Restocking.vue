<script>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'

// Mirrors server/main.py lead-time-per-category lookup exactly
const LEAD_TIMES_BY_CATEGORY = {
  'Circuit Boards': 7,
  'Sensors': 5,
  'Actuators': 12,
  'Controllers': 10,
  'Power Supplies': 14
}
const DEFAULT_LEAD_TIME = 10

const leadTimeForCategory = (category) => {
  return LEAD_TIMES_BY_CATEGORY[category] ?? DEFAULT_LEAD_TIME
}

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency } = useI18n()

    const currencySymbol = computed(() => {
      return currentCurrency.value === 'JPY' ? '¥' : '$'
    })

    const loading = ref(true)
    const error = ref(null)
    const inventoryItems = ref([])
    const forecasts = ref([])

    const budget = ref(10000)
    const BUDGET_MIN = 0
    const BUDGET_MAX = 50000
    const BUDGET_STEP = 500

    const submitting = ref(false)
    const submitSuccess = ref(false)
    const submitError = ref(null)

    const loadData = async () => {
      loading.value = true
      error.value = null
      try {
        const [inventoryData, forecastData] = await Promise.all([
          api.getInventory(),
          api.getDemandForecasts()
        ])
        inventoryItems.value = inventoryData
        forecasts.value = forecastData
      } catch (err) {
        error.value = 'Failed to load restocking data: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Join demand forecasts to inventory by SKU, then filter down to items
    // that qualify as "needing restocking"
    const candidates = computed(() => {
      const inventoryBySku = new Map(inventoryItems.value.map(item => [item.sku, item]))
      const list = []

      for (const forecast of forecasts.value) {
        const inv = inventoryBySku.get(forecast.item_sku)
        if (!inv) continue

        const needsRestock =
          forecast.forecasted_demand > inv.quantity_on_hand ||
          inv.quantity_on_hand <= inv.reorder_point

        if (!needsRestock) continue

        list.push({
          sku: inv.sku,
          name: forecast.item_name,
          category: inv.category,
          warehouse: inv.warehouse,
          trend: forecast.trend,
          quantity_on_hand: inv.quantity_on_hand,
          reorder_point: inv.reorder_point,
          unit_cost: inv.unit_cost,
          forecasted_demand: forecast.forecasted_demand
        })
      }

      return list
    })

    // Rank: increasing trend first, then by shortfall descending
    const rankedCandidates = computed(() => {
      return [...candidates.value].sort((a, b) => {
        const aIncreasing = a.trend === 'increasing' ? 1 : 0
        const bIncreasing = b.trend === 'increasing' ? 1 : 0
        if (aIncreasing !== bIncreasing) return bIncreasing - aIncreasing

        const aShortfall = a.forecasted_demand - a.quantity_on_hand
        const bShortfall = b.forecasted_demand - b.quantity_on_hand
        return bShortfall - aShortfall
      })
    })

    // Greedily distribute the budget across ranked candidates
    const recommendation = computed(() => {
      let remaining = budget.value
      const recommended = []
      const skipped = []
      let exhausted = false

      for (const candidate of rankedCandidates.value) {
        if (exhausted) {
          skipped.push({ ...candidate, reason: 'exhausted' })
          continue
        }

        const needed = Math.max(
          candidate.forecasted_demand - candidate.quantity_on_hand,
          candidate.reorder_point - candidate.quantity_on_hand,
          1
        )

        const affordableQty = Math.min(needed, Math.floor(remaining / candidate.unit_cost))

        if (affordableQty <= 0) {
          skipped.push({ ...candidate, reason: 'over-budget' })
          continue
        }

        const subtotal = affordableQty * candidate.unit_cost
        remaining -= subtotal

        recommended.push({
          ...candidate,
          quantity: affordableQty,
          subtotal,
          leadTime: leadTimeForCategory(candidate.category)
        })

        if (remaining <= 0) {
          remaining = 0
          exhausted = true
        }
      }

      return { recommended, skipped, remaining }
    })

    const totalCost = computed(() => {
      return recommendation.value.recommended.reduce((sum, item) => sum + item.subtotal, 0)
    })

    const remainingBudget = computed(() => budget.value - totalCost.value)

    const hasSkippedItems = computed(() => recommendation.value.skipped.length > 0)

    const placeOrder = async () => {
      if (recommendation.value.recommended.length === 0 || submitting.value) return

      submitting.value = true
      submitError.value = null
      submitSuccess.value = false

      try {
        const payload = {
          budget: budget.value,
          items: recommendation.value.recommended.map(item => ({
            sku: item.sku,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit_cost: item.unit_cost
          }))
        }
        await api.createRestockOrder(payload)
        submitSuccess.value = true
      } catch (err) {
        submitError.value = err.response?.data?.detail || 'Failed to place restock order: ' + err.message
      } finally {
        submitting.value = false
      }
    }

    onMounted(loadData)

    return {
      t,
      currencySymbol,
      loading,
      error,
      budget,
      BUDGET_MIN,
      BUDGET_MAX,
      BUDGET_STEP,
      recommendation,
      totalCost,
      remainingBudget,
      hasSkippedItems,
      submitting,
      submitSuccess,
      submitError,
      placeOrder
    }
  }
}
</script>

<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="card budget-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.budget') }}</h3>
        </div>
        <div class="budget-control">
          <input
            type="range"
            :min="BUDGET_MIN"
            :max="BUDGET_MAX"
            :step="BUDGET_STEP"
            v-model.number="budget"
            class="budget-slider"
          />
          <div class="budget-value">{{ currencySymbol }}{{ budget.toLocaleString() }}</div>
        </div>

        <div class="budget-summary">
          <div class="budget-stat">
            <span class="budget-stat-label">{{ t('restocking.totalCost') }}</span>
            <span class="budget-stat-value">{{ currencySymbol }}{{ totalCost.toLocaleString() }}</span>
          </div>
          <div class="budget-stat">
            <span class="budget-stat-label">{{ t('restocking.remaining') }}</span>
            <span class="budget-stat-value" :class="{ negative: remainingBudget < 0 }">
              {{ currencySymbol }}{{ remainingBudget.toLocaleString() }}
            </span>
          </div>
          <div class="budget-stat">
            <span class="budget-stat-label">{{ t('restocking.itemsRecommended') }}</span>
            <span class="budget-stat-value">{{ recommendation.recommended.length }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.recommendedOrders') }}</h3>
        </div>

        <div v-if="recommendation.recommended.length === 0" class="empty-state">
          {{ t('restocking.noRecommendations') }}
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('restocking.table.itemName') }}</th>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.category') }}</th>
                <th>{{ t('restocking.table.trend') }}</th>
                <th>{{ t('restocking.table.quantity') }}</th>
                <th>{{ t('restocking.table.unitCost') }}</th>
                <th>{{ t('restocking.table.subtotal') }}</th>
                <th>{{ t('restocking.table.leadTime') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recommendation.recommended" :key="item.sku">
                <td>{{ item.name }}</td>
                <td><strong>{{ item.sku }}</strong></td>
                <td><span class="badge category-badge">{{ item.category }}</span></td>
                <td><span :class="['badge', item.trend]">{{ t(`trends.${item.trend}`) }}</span></td>
                <td>{{ item.quantity }}</td>
                <td>{{ currencySymbol }}{{ item.unit_cost.toLocaleString() }}</td>
                <td><strong>{{ currencySymbol }}{{ item.subtotal.toLocaleString() }}</strong></td>
                <td>{{ item.leadTime }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="hasSkippedItems" class="over-budget-note">
          {{ t('restocking.overBudgetNote', { count: recommendation.skipped.length }) }}
        </div>

        <div class="place-order-row">
          <button
            class="place-order-btn"
            :disabled="recommendation.recommended.length === 0 || submitting"
            @click="placeOrder"
          >
            {{ submitting ? t('restocking.placingOrder') : t('restocking.placeOrder') }}
          </button>
        </div>

        <div v-if="submitSuccess" class="success-message">
          {{ t('restocking.orderPlacedSuccess') }}
        </div>
        <div v-if="submitError" class="error">{{ submitError }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-card {
  margin-bottom: 1.25rem;
}

.budget-control {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.budget-slider {
  flex: 1;
  accent-color: #2563eb;
}

.budget-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  min-width: 120px;
  text-align: right;
}

.budget-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.budget-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.budget-stat-label {
  font-size: 0.813rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.budget-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.budget-stat-value.negative {
  color: #dc2626;
}

.category-badge {
  background: #f1f5f9;
  color: #475569;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.938rem;
}

.over-budget-note {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  border-radius: 8px;
  font-size: 0.875rem;
}

.place-order-row {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
}

.place-order-btn {
  padding: 0.625rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.place-order-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.place-order-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  border-radius: 8px;
  font-size: 0.938rem;
}
</style>
