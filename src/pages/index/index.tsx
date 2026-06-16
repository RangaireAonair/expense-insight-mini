import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { getCategoryTotals, getDashboardStats, getMonthRecords, loadState, syncToCloud } from '@/store/finance'
import { FinanceState } from '@/types'
import { clampPercent, currentMonth, formatMoney, getAccount, getCategory, signedMoney } from '@/utils/format'
import './index.scss'

export default function HomePage() {
  const [state, setState] = useState<FinanceState>(() => loadState())

  useDidShow(() => {
    setState(loadState())
  })

  const stats = getDashboardStats(state, currentMonth())
  const todayRecords = getMonthRecords(state).filter((item) => item.date === new Date().toISOString().slice(0, 10))
  const topCategories = getCategoryTotals(state, stats.records, 'expense').slice(0, 3)

  const goAdd = () => Taro.navigateTo({ url: '/pages/add/index' })
  const goAccounts = () => Taro.navigateTo({ url: '/pages/accounts/index' })
  const goBills = () => Taro.redirectTo({ url: '/pages/bills/index' })

  const handleSync = async () => {
    await syncToCloud(state)
    Taro.showToast({ title: '同步完成', icon: 'success' })
  }

  return (
    <View className="page home-page">
      <View className="top-title">
        <View>
          <Text className="brand">记账系统</Text>
          <Text className="home-page__hello">今天也把钱花明白</Text>
        </View>
        <Button className="home-page__sync" onClick={handleSync}>
          同步
        </Button>
      </View>

      <View className="wallet-card">
        <Text className="wallet-card__label">本月预算余额</Text>
        <Text className="wallet-card__amount">{formatMoney(stats.balance, state.settings.currency)}</Text>
        <View className="wallet-card__grid">
          <View>
            <Text className="wallet-card__meta">月支出</Text>
            <Text className="wallet-card__value">{formatMoney(stats.expense, state.settings.currency)}</Text>
          </View>
          <View>
            <Text className="wallet-card__meta">月收入</Text>
            <Text className="wallet-card__value">{formatMoney(stats.income, state.settings.currency)}</Text>
          </View>
        </View>
        <View className="budget-line">
          <View className="row space-between">
            <Text>预算使用</Text>
            <Text>{clampPercent(stats.budgetUsage).toFixed(1)}%</Text>
          </View>
          <View className="budget-line__track">
            <View className="budget-line__bar" style={{ width: `${clampPercent(stats.budgetUsage)}%` }} />
          </View>
        </View>
      </View>

      <View className="shortcut-grid">
        <View className="shortcut" onClick={goAdd}>
          <Text className="shortcut__icon">记</Text>
          <Text>快速记账</Text>
        </View>
        <View className="shortcut" onClick={goBills}>
          <Text className="shortcut__icon">单</Text>
          <Text>账单明细</Text>
        </View>
        <View className="shortcut" onClick={goAccounts}>
          <Text className="shortcut__icon">户</Text>
          <Text>账户预算</Text>
        </View>
        <View className="shortcut" onClick={() => Taro.redirectTo({ url: '/pages/analytics/index' })}>
          <Text className="shortcut__icon">析</Text>
          <Text>统计分析</Text>
        </View>
      </View>

      <View className="section-heading">
        <Text className="section-title">今日账单</Text>
        <Text className="section-more" onClick={goBills}>
          查看全部
        </Text>
      </View>

      <View className="record-list">
        {todayRecords.slice(0, 4).map((record) => {
          const category = getCategory(state.categories, record.categoryId)
          const account = getAccount(state.accounts, record.accountId)
          return (
            <View key={record.id} className="record-card">
              <View
                className="record-card__icon"
                style={{ background: `${category?.color || '#006d33'}1a`, color: category?.color }}
              >
                <Text>{category?.icon || '账'}</Text>
              </View>
              <View className="record-card__body">
                <Text className="record-card__name">{record.note || category?.name}</Text>
                <Text className="caption">
                  {category?.name} · {account?.name}
                </Text>
              </View>
              <Text className={record.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                {signedMoney(record, state.settings.currency)}
              </Text>
            </View>
          )
        })}
      </View>

      <View className="insight-grid">
        <View className="insight-card insight-card--warm">
          <Text className="insight-card__label">消费洞察</Text>
          <Text className="insight-card__text">
            {topCategories[0]?.category.name || '餐饮'} 是本月最大支出项，记得关注预算节奏。
          </Text>
        </View>
        <View className="insight-card insight-card--soft">
          <Text className="insight-card__label">提醒</Text>
          <Text className="insight-card__text">
            {state.settings.reminder.enabled ? `${state.settings.reminder.time} 记账提醒已开启` : '记账提醒未开启'}
          </Text>
        </View>
      </View>

      <BottomNav active="home" />
    </View>
  )
}
