<script>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

// Mirrors server/main.py CATEGORY_LEAD_TIMES exactly, used only to preview
// the lead time the backend will compute for a submitted order.
const LEAD_TIMES_BY_CATEGORY = {
  'Circuit Boards': 7,
  Sensors: 5,
  Actuators: 12,
  Controllers: 10,
  'Power Supplies': 14,
}
const DEFAULT_LEAD_TIME = 10

const leadTimeForCategory = (category) => {
  return LEAD_TIMES_BY_CATEGORY[category] ?? DEFAULT_LEAD_TIME
}

const BUDGET_MIN = 10000
const BUDGET_MAX = 500000
const BUDGET_STEP = 5000
const DEFAULT_BUDGET = 100000

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency } = useI18n()
    const { selectedLocation } = useFilters()

    const currencySymbol = computed(() => {
      return currentCurrency.value === 'JPY' ? '¥' : '$'
    })

    const loading = ref(true)
    const error = ref(null)
    const inventoryItems = ref([])
    const forecasts = ref([])
    const ordersInContext = ref([])

    const budget = ref(DEFAULT_BUDGET)

    // Which recommended SKUs are checked for inclusion in the order.
    // Kept as a Set of skus rather than a boolean-per-item map so it
    // survives the recommendation list being recomputed (e.g. when the
    // warehouse filter or budget changes) without stale entries piling up.
    const selectedSkus = ref(new Set())

    const submitting = ref(false)
    const submitSuccess = ref(false)
    const submitError = ref(null)

    const loadData = async () => {
      loading.value = true
      error.value = null
      try {
        const [inventoryData, forecastData, ordersData] = await Promise.all([
          api.getInventory({ warehouse: selectedLocation.value }),
          api.getDemandForecasts(),
          api.getOrders({ warehouse: selectedLocation.value }),
        ])
        inventoryItems.value = inventoryData
        forecasts.value = forecastData
        ordersInContext.value = ordersData
      } catch (err) {
        error.value = 'Failed to load restocking data: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Join demand forecasts to the (warehouse-filtered) inventory by SKU.
    const candidates = computed(() => {
      const forecastBySku = new Map(forecasts.value.map((f) => [f.item_sku, f]))
      const list = []

      for (const item of inventoryItems.value) {
        const forecast = forecastBySku.get(item.sku)
        list.push({
          sku: item.sku,
          name: forecast ? forecast.item_name : item.name,
          category: item.category,
          warehouse: item.warehouse,
          unit_cost: item.unit_cost,
          quantity_on_hand: item.quantity_on_hand,
          forecasted_demand: forecast ? forecast.forecasted_demand : 0,
          trend: forecast ? forecast.trend : null,
        })
      }

      return list
    })

    // Highest forecasted demand first, as required by the recommendation
    // algorithm - this is the sole ranking signal (no trend/shortfall
    // weighting), independent of budget.
    const rankedCandidates = computed(() => {
      return [...candidates.value].sort(
        (a, b) => b.forecasted_demand - a.forecasted_demand,
      )
    })

    // Greedily walk the demand-ranked list and recommend a purchase
    // quantity (capped at the forecasted demand) for every item that still
    // fits in the remaining budget. Unlike a "stop at first miss" approach,
    // we keep scanning past items that don't fit so cheaper, lower-ranked
    // items further down the list can still use leftover budget.
    const recommendation = computed(() => {
      let remaining = budget.value
      const recommended = []
      const skipped = []

      for (const candidate of rankedCandidates.value) {
        if (candidate.forecasted_demand <= 0) continue

        const qty = Math.min(
          candidate.forecasted_demand,
          Math.floor(remaining / candidate.unit_cost),
        )

        if (qty <= 0) {
          skipped.push(candidate)
          continue
        }

        const subtotal = qty * candidate.unit_cost
        remaining -= subtotal

        recommended.push({
          ...candidate,
          quantity: qty,
          subtotal,
          leadTime: leadTimeForCategory(candidate.category),
        })
      }

      return { recommended, skipped, remaining }
    })

    // Keep the checkbox selection in sync with whatever is currently
    // recommended - default everything to checked, but drop skus that fell
    // out of the recommendation list (e.g. after a budget/warehouse change).
    watch(
      () => recommendation.value.recommended,
      (items) => {
        selectedSkus.value = new Set(items.map((i) => i.sku))
      },
    )

    const isSelected = (sku) => selectedSkus.value.has(sku)

    const toggleItem = (sku) => {
      const next = new Set(selectedSkus.value)
      if (next.has(sku)) {
        next.delete(sku)
      } else {
        next.add(sku)
      }
      selectedSkus.value = next
    }

    const selectedItems = computed(() => {
      return recommendation.value.recommended.filter((item) =>
        selectedSkus.value.has(item.sku),
      )
    })

    const selectedTotal = computed(() => {
      return selectedItems.value.reduce((sum, item) => sum + item.subtotal, 0)
    })

    const remainingBudget = computed(() => budget.value - selectedTotal.value)

    const hasSkippedItems = computed(
      () => recommendation.value.skipped.length > 0,
    )

    const canPlaceOrder = computed(() => {
      return (
        selectedItems.value.length > 0 &&
        selectedTotal.value <= budget.value &&
        !submitting.value
      )
    })

    const placeOrder = async () => {
      if (!canPlaceOrder.value) return

      submitting.value = true
      submitError.value = null
      submitSuccess.value = false

      try {
        const payload = {
          budget: budget.value,
          warehouse: selectedLocation.value,
          items: selectedItems.value.map((item) => ({
            sku: item.sku,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          })),
        }
        await api.createRestockOrder(payload)
        submitSuccess.value = true

        // Clear the recommendation state and reset the budget slider so the
        // page is ready for building the next restock order from scratch.
        selectedSkus.value = new Set()
        budget.value = DEFAULT_BUDGET
        inventoryItems.value = []
        forecasts.value = []
      } catch (err) {
        submitError.value =
          err.response?.data?.detail ||
          'Failed to place restock order: ' + err.message
      } finally {
        submitting.value = false
      }
    }

    watch(selectedLocation, () => {
      submitSuccess.value = false
      loadData()
    })

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
      selectedItems,
      selectedTotal,
      remainingBudget,
      hasSkippedItems,
      canPlaceOrder,
      isSelected,
      toggleItem,
      submitting,
      submitSuccess,
      submitError,
      placeOrder,
      ordersInContext,
      selectedLocation,
    }
  },
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
          <div class="budget-value">
            {{ currencySymbol }}{{ budget.toLocaleString() }}
          </div>
        </div>

        <div class="budget-summary">
          <div class="budget-stat">
            <span class="budget-stat-label">{{
              t('restocking.totalCost')
            }}</span>
            <span class="budget-stat-value"
              >{{ currencySymbol }}{{ selectedTotal.toLocaleString() }}</span
            >
          </div>
          <div class="budget-stat">
            <span class="budget-stat-label">{{
              t('restocking.remaining')
            }}</span>
            <span
              class="budget-stat-value"
              :class="{ negative: remainingBudget < 0 }"
            >
              {{ currencySymbol }}{{ remainingBudget.toLocaleString() }}
            </span>
          </div>
          <div class="budget-stat">
            <span class="budget-stat-label">{{
              t('restocking.itemsRecommended')
            }}</span>
            <span class="budget-stat-value">{{ selectedItems.length }}</span>
          </div>
        </div>

        <div v-if="ordersInContext.length" class="context-note">
          {{ ordersInContext.length }} existing order(s) on file for the
          selected warehouse filter.
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
                <th class="col-select">Select</th>
                <th>{{ t('restocking.table.itemName') }}</th>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.category') }}</th>
                <th>{{ t('demand.table.forecastedDemand') }}</th>
                <th>{{ t('restocking.table.unitCost') }}</th>
                <th>{{ t('restocking.table.quantity') }}</th>
                <th>{{ t('restocking.table.subtotal') }}</th>
                <th>{{ t('restocking.table.leadTime') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in recommendation.recommended"
                :key="item.sku"
                :class="{ 'row-unselected': !isSelected(item.sku) }"
              >
                <td class="col-select">
                  <input
                    type="checkbox"
                    :checked="isSelected(item.sku)"
                    @change="toggleItem(item.sku)"
                  />
                </td>
                <td>{{ item.name }}</td>
                <td>
                  <strong>{{ item.sku }}</strong>
                </td>
                <td>
                  <span class="badge category-badge">{{ item.category }}</span>
                </td>
                <td>{{ item.forecasted_demand }}</td>
                <td>
                  {{ currencySymbol }}{{ item.unit_cost.toLocaleString() }}
                </td>
                <td>{{ item.quantity }}</td>
                <td>
                  <strong
                    >{{ currencySymbol
                    }}{{ item.subtotal.toLocaleString() }}</strong
                  >
                </td>
                <td>{{ item.leadTime }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="hasSkippedItems" class="over-budget-note">
          {{
            t('restocking.overBudgetNote', {
              count: recommendation.skipped.length,
            })
          }}
        </div>

        <div class="place-order-row">
          <button
            class="place-order-btn"
            :disabled="!canPlaceOrder"
            @click="placeOrder"
          >
            {{
              submitting
                ? t('restocking.placingOrder')
                : t('restocking.placeOrder')
            }}
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
  color: var(--color-text-strong);
  min-width: 120px;
  text-align: right;
}

.budget-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-subtle);
}

.budget-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.budget-stat-label {
  font-size: 0.813rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.budget-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-strong);
}

.budget-stat-value.negative {
  color: #dc2626;
}

.context-note {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-subtle);
  font-size: 0.813rem;
  color: var(--color-text-muted);
}

.category-badge {
  background: #f1f5f9;
  color: #475569;
}

.col-select {
  width: 48px;
  text-align: center;
}

.row-unselected {
  opacity: 0.5;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
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
