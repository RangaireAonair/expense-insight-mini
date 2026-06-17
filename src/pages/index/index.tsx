import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { getCategoryPathLabel } from '@/modules/categories'
import { getCategoryTotals, getDashboardStats, getMonthRecords, loadState, syncToCloud } from '@/store/finance'
import { FinanceState } from '@/types'
import { clampPercent, currentMonth, formatMoney, getAccount, getCategory, signedMoney, todayISO } from '@/utils/format'
import { useThemeClass } from '@/utils/theme'
import './index.scss'

const shortcuts = [
  { label: '明细', mark: 'TX', url: '/pages/bills/index' },
  { label: '预算', mark: 'BD', url: '/pages/accounts/index' },
  { label: '统计', mark: 'AN', url: '/pages/analytics/index' },
  { label: '管理', mark: 'MG', url: '/pages/profile/index' }
]

export default function HomePage() {
  const [state, setState] = useState<FinanceState>(() => loadState())
  const currentThemeClass = useThemeClass(state.settings.theme)

  useDidShow(() => setState(loadState()))

  const stats = getDashboardStats(state, currentMonth())
  const todayRecords = getMonthRecords(state).filter((item) => item.date === todayISO())
  const topCategories = getCategoryTotals(state, stats.records, 'expense')
  const topCategory = topCategories[0]
  const budgetPercent = clampPercent(stats.budgetUsage)

  const recentRecords = useMemo(() => {
    return (todayRecords.length ? todayRecords : stats.records).slice(0, 4)
  }, [stats.records, todayRecords])

  const handleSync = async () => {
    await syncToCloud(state)
    Taro.showToast({ title: '同步完成', icon: 'success' })
  }

  return (
    <View className={`page dashboard-page ${currentThemeClass}`}>
      <View className="top-title dashboard-top">
        <View>
          <Text className="mono-label">Emerald Ledger</Text>
          <Text className="brand">账务工作台</Text>
        </View>
        <Button className="ghost-button dashboard-sync" onClick={handleSync}>
          同步
        </Button>
      </View>

      <View className="hero-card">
        <View className="hero-card__head">
          <View>
            <Text className="mono-label">Budget Balance</Text>
            <Text className="hero-card__amount">{formatMoney(stats.balance, state.settings.currency)}</Text>
          </View>
          <View className="hero-card__badge">LIVE</View>
        </View>

        <View className="hero-card__metrics">
          <View>
            <Text className="caption">Monthly Income</Text>
            <Text className="hero-card__metric amount-positive">
              {formatMoney(stats.income, state.settings.currency)}
            </Text>
          </View>
          <View>
            <Text className="caption">Monthly Expense</Text>
            <Text className="hero-card__metric amount-negative">
              {formatMoney(stats.expense, state.settings.currency)}
            </Text>
          </View>
        </View>

        <View className="budget-panel">
          <View className="row space-between">
            <Text className="caption">Monthly Budget Usage</Text>
            <Text className="caption">{budgetPercent.toFixed(1)}%</Text>
          </View>
          <View className="progress-track">
            <View className="progress-bar" style={{ width: `${budgetPercent}%` }} />
          </View>
        </View>
      </View>

      <View className="quick-grid">
        {shortcuts.map((item) => (
          <View key={item.label} className="quick-card" onClick={() => Taro.reLaunch({ url: item.url })}>
            <Text className="quick-card__mark">{item.mark}</Text>
            <Text>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className="insight-card surface-card">
        <View>
          <Text className="mono-label">Analysis & Tips</Text>
          <Text className="insight-card__title">本周消费洞察</Text>
        </View>
        <Text className="insight-card__text">
          {topCategory
            ? `${topCategory.category.name} 是本月最高支出分类，占总支出的 ${clampPercent(
                (topCategory.total / (stats.expense || 1)) * 100
              ).toFixed(0)}%。`
            : '还没有足够的账单数据，先记录几笔交易吧。'}
        </Text>
      </View>

      <View className="section-row">
        <Text className="section-title">Today&apos;s Bills</Text>
        <Text className="section-link" onClick={() => Taro.reLaunch({ url: '/pages/bills/index' })}>
          查看全部
        </Text>
      </View>

      <View className="record-stack">
        {recentRecords.map((record) => {
          const category = getCategory(state.categories, record.categoryId)
          const categoryLabel = getCategoryPathLabel(state.categories, record.categoryId)
          const account = getAccount(state.accounts, record.accountId)
          return (
            <View key={record.id} className="ledger-row surface-card">
              <View className="ledger-row__icon" style={{ color: category?.color || '#45e17c' }}>
                <Text>{category?.icon || '账'}</Text>
              </View>
              <View className="ledger-row__body">
                <Text className="ledger-row__title">{record.note || category?.name || '未命名账单'}</Text>
                <Text className="caption">
                  {categoryLabel || category?.name || '分类'} · {account?.name || '账户'}
                </Text>
              </View>
              <Text
                className={
                  record.type === 'income' ? 'amount-positive ledger-row__amount' : 'amount-negative ledger-row__amount'
                }
              >
                {signedMoney(record, state.settings.currency)}
              </Text>
            </View>
          )
        })}
      </View>

      <Button className="fab" onClick={() => Taro.navigateTo({ url: '/pages/add/index' })}>
        +
      </Button>
      <BottomNav active="home" />
    </View>
  )
}
