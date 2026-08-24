<template>
  <div class="reports">
    <div class="page-header">
      <h2>{{ t('reports.title') }}</h2>
      <p>{{ t('reports.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div
      v-else-if="quarterlyData.length === 0 && monthlyData.length === 0"
      class="no-data"
    >
      {{ t('reports.noData') }}
    </div>
    <div v-else>
      <!-- Quarterly Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.quarterly.title') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.quarterly.quarter') }}</th>
                <th>{{ t('reports.quarterly.totalOrders') }}</th>
                <th>{{ t('reports.quarterly.totalRevenue') }}</th>
                <th>{{ t('reports.quarterly.avgOrderValue') }}</th>
                <th>{{ t('reports.quarterly.fulfillmentRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quarterlyData" :key="q.quarter">
                <td>
                  <strong>{{ q.quarter }}</strong>
                </td>
                <td>{{ q.total_orders }}</td>
                <td>
                  {{
                    formatCurrencyWithDecimals(
                      q.total_revenue,
                      selectedCurrency,
                      2,
                    )
                  }}
                </td>
                <td>
                  {{
                    formatCurrencyWithDecimals(
                      q.avg_order_value,
                      selectedCurrency,
                      2,
                    )
                  }}
                </td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.monthlyTrend.title') }}</h3>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div
              v-for="month in monthlyData"
              :key="month.month"
              class="bar-wrapper"
            >
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: getBarHeight(month.revenue) + 'px' }"
                  :title="
                    formatCurrencyWithDecimals(
                      month.revenue,
                      selectedCurrency,
                      2,
                    )
                  "
                ></div>
              </div>
              <div class="bar-label">{{ formatMonth(month.month) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.monthOverMonth.title') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.monthOverMonth.month') }}</th>
                <th>{{ t('reports.monthOverMonth.orders') }}</th>
                <th>{{ t('reports.monthOverMonth.revenue') }}</th>
                <th>{{ t('reports.monthOverMonth.change') }}</th>
                <th>{{ t('reports.monthOverMonth.growthRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, index) in monthlyData" :key="month.month">
                <td>
                  <strong>{{ formatMonth(month.month) }}</strong>
                </td>
                <td>{{ month.order_count }}</td>
                <td>
                  {{
                    formatCurrencyWithDecimals(
                      month.revenue,
                      selectedCurrency,
                      2,
                    )
                  }}
                </td>
                <td>
                  <span
                    v-if="index > 0"
                    :class="
                      getChangeClass(
                        month.revenue,
                        monthlyData[index - 1].revenue,
                      )
                    "
                  >
                    {{
                      getChangeValue(
                        month.revenue,
                        monthlyData[index - 1].revenue,
                      )
                    }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span
                    v-if="index > 0"
                    :class="
                      getChangeClass(
                        month.revenue,
                        monthlyData[index - 1].revenue,
                      )
                    "
                  >
                    {{
                      getGrowthRate(
                        month.revenue,
                        monthlyData[index - 1].revenue,
                      )
                    }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">
            {{ t('reports.summary.totalRevenueYTD') }}
          </div>
          <div class="stat-value">
            {{ formatCurrencyWithDecimals(totalRevenue, selectedCurrency, 2) }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            {{ t('reports.summary.avgMonthlyRevenue') }}
          </div>
          <div class="stat-value">
            {{
              formatCurrencyWithDecimals(avgMonthlyRevenue, selectedCurrency, 2)
            }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            {{ t('reports.summary.totalOrdersYTD') }}
          </div>
          <div class="stat-value">{{ totalOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.summary.bestQuarter') }}</div>
          <div class="stat-value">{{ bestQuarter || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrencyWithDecimals } from '../utils/currency'

export default {
  name: 'Reports',
  setup() {
    const { t, currentCurrency } = useI18n()

    const loading = ref(true)
    const error = ref(null)
    const quarterlyData = ref([])
    const monthlyData = ref([])

    // Use shared filters so Reports respects the global filter bar like every other page
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters,
    } = useFilters()

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()

        const [quarterly, monthly] = await Promise.all([
          api.getQuarterlyReports(filters),
          api.getMonthlyTrends(filters),
        ])

        quarterlyData.value = quarterly
        monthlyData.value = monthly
      } catch (err) {
        error.value = t('reports.loadError') + ': ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Derived summary stats as computed properties so they stay in sync with
    // quarterlyData/monthlyData automatically instead of being manually
    // recalculated after every load.
    const totalRevenue = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + m.revenue, 0),
    )

    const avgMonthlyRevenue = computed(() =>
      monthlyData.value.length > 0
        ? totalRevenue.value / monthlyData.value.length
        : 0,
    )

    const totalOrders = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + m.order_count, 0),
    )

    const bestQuarter = computed(() => {
      let best = ''
      let bestRevenue = 0
      quarterlyData.value.forEach((q) => {
        if (q.total_revenue > bestRevenue) {
          bestRevenue = q.total_revenue
          best = q.quarter
        }
      })
      return best
    })

    const maxMonthlyRevenue = computed(() => {
      if (monthlyData.value.length === 0) return 0
      return Math.max(...monthlyData.value.map((m) => m.revenue))
    })

    const getBarHeight = (revenue) => {
      if (maxMonthlyRevenue.value === 0) return 0
      return (revenue / maxMonthlyRevenue.value) * 200
    }

    const monthKeys = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ]

    const formatMonth = (monthStr) => {
      if (!monthStr) return '-'
      const parts = monthStr.split('-')
      const year = parts[0]
      const monthIndex = parseInt(parts[1], 10) - 1
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11)
        return monthStr
      return `${t(`months.${monthKeys[monthIndex]}`)} ${year}`
    }

    const getFulfillmentClass = (rate) => {
      if (rate >= 90) return 'badge success'
      if (rate >= 75) return 'badge warning'
      return 'badge danger'
    }

    const getChangeValue = (current, previous) => {
      const change = current - previous
      if (change > 0)
        return (
          '+' + formatCurrencyWithDecimals(change, currentCurrency.value, 2)
        )
      if (change < 0)
        return (
          '-' +
          formatCurrencyWithDecimals(Math.abs(change), currentCurrency.value, 2)
        )
      return formatCurrencyWithDecimals(0, currentCurrency.value, 2)
    }

    const getChangeClass = (current, previous) => {
      const change = current - previous
      if (change > 0) return 'positive-change'
      if (change < 0) return 'negative-change'
      return ''
    }

    const getGrowthRate = (current, previous) => {
      if (previous === 0) return 'N/A'
      const rate = ((current - previous) / previous) * 100
      const sign = rate > 0 ? '+' : ''
      return sign + rate.toFixed(1) + '%'
    }

    // Watch for filter changes and reload data
    watch(
      [selectedPeriod, selectedLocation, selectedCategory, selectedStatus],
      () => {
        loadData()
      },
    )

    onMounted(loadData)

    return {
      t,
      loading,
      error,
      quarterlyData,
      monthlyData,
      totalRevenue,
      avgMonthlyRevenue,
      totalOrders,
      bestQuarter,
      getBarHeight,
      formatMonth,
      getFulfillmentClass,
      getChangeValue,
      getChangeClass,
      getGrowthRate,
      formatCurrencyWithDecimals,
      selectedCurrency: currentCurrency,
    }
  },
}
</script>

<style scoped>
.reports {
  padding: 0;
}

.card-header {
  margin-bottom: 1.5rem;
  border-bottom: none;
  padding-bottom: 0;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th {
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.reports-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.reports-table tr:hover {
  background: #f8fafc;
}

.chart-container {
  padding: 2rem 1rem;
  min-height: 300px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
}

.bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
  margin-top: 1.5rem;
}

.stats-grid {
  margin-top: 1.5rem;
}

.stat-card {
  border-left: 4px solid #3b82f6;
}

.positive-change {
  color: #16a34a;
  font-weight: 600;
}

.negative-change {
  color: #dc2626;
  font-weight: 600;
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.938rem;
}
</style>
