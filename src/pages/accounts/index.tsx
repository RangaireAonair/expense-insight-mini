import { Button, Input, Picker, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { addAccount, getDashboardStats, loadState, transferBetweenAccounts, updateBudget } from '@/store/finance'
import { FinanceState } from '@/types'
import { clampPercent, currentMonth, formatMoney } from '@/utils/format'
import { useThemeClass } from '@/utils/theme'
import './index.scss'

export default function AccountsPage() {
  const [state, setState] = useState<FinanceState>(() => loadState())
  const currentThemeClass = useThemeClass(state.settings.theme)
  const [newAccount, setNewAccount] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [fromIndex, setFromIndex] = useState(0)
  const [toIndex, setToIndex] = useState(1)
  const [transferAmount, setTransferAmount] = useState('')
  const [budgetInput, setBudgetInput] = useState('')

  useDidShow(() => setState(loadState()))

  const stats = getDashboardStats(state)
  const totalAssets = state.accounts.reduce((sum, account) => sum + account.balance, 0)
  const monthBudget = state.budgets.find((budget) => budget.month === currentMonth())
  const accountNames = state.accounts.map((account) => account.name)

  const createAccount = () => {
    if (!newAccount.trim()) return
    setState(addAccount(newAccount.trim(), Number(newBalance) || 0))
    setNewAccount('')
    setNewBalance('')
    Taro.showToast({ title: '账户已添加', icon: 'success' })
  }

  const transfer = () => {
    const amount = Number(transferAmount)
    const from = state.accounts[fromIndex]
    const to = state.accounts[toIndex]
    if (!from || !to || from.id === to.id || amount <= 0) {
      Taro.showToast({ title: '请检查转账信息', icon: 'none' })
      return
    }
    setState(transferBetweenAccounts(from.id, to.id, amount))
    setTransferAmount('')
    Taro.showToast({ title: '转账完成', icon: 'success' })
  }

  const saveBudget = () => {
    const value = Number(budgetInput)
    if (value <= 0) return
    setState(updateBudget({ month: currentMonth(), total: value, categories: monthBudget?.categories || {} }))
    setBudgetInput('')
    Taro.showToast({ title: '预算已更新', icon: 'success' })
  }

  return (
    <View className={`page accounts-page ${currentThemeClass}`}>
      <View className="top-title">
        <Text className="brand">账户预算</Text>
        <Button className="ghost-button" onClick={() => Taro.redirectTo({ url: '/pages/profile/index' })}>
          设置
        </Button>
      </View>

      <View className="asset-card">
        <Text className="asset-card__label">总资产</Text>
        <Text className="asset-card__amount">{formatMoney(totalAssets, state.settings.currency)}</Text>
        <View className="asset-card__meta">
          <View>
            <Text>本月支出</Text>
            <Text>{formatMoney(stats.expense, state.settings.currency)}</Text>
          </View>
          <View>
            <Text>本月现金流</Text>
            <Text>{formatMoney(stats.income - stats.expense, state.settings.currency)}</Text>
          </View>
        </View>
      </View>

      <View className="section-heading">
        <Text className="section-title">账户</Text>
      </View>
      <View className="account-list">
        {state.accounts.map((account) => (
          <View key={account.id} className="account-card">
            <View className="account-card__icon" style={{ background: `${account.color}1a`, color: account.color }}>
              {account.name.slice(0, 1)}
            </View>
            <View className="account-card__body">
              <Text>{account.name}</Text>
              <Text className="caption">{account.type}</Text>
            </View>
            <Text>{formatMoney(account.balance, state.settings.currency)}</Text>
          </View>
        ))}
      </View>

      <View className="tool-card">
        <Text className="section-title">新增账户</Text>
        <View className="inline-form">
          <Input
            className="inline-form__input"
            placeholder="账户名"
            value={newAccount}
            onInput={(event) => setNewAccount(String(event.detail.value))}
          />
          <Input
            className="inline-form__input"
            type="digit"
            placeholder="初始余额"
            value={newBalance}
            onInput={(event) => setNewBalance(String(event.detail.value))}
          />
          <Button className="inline-form__button" onClick={createAccount}>
            添加
          </Button>
        </View>
      </View>

      <View className="tool-card">
        <Text className="section-title">账户转账</Text>
        <View className="transfer-grid">
          <Picker
            mode="selector"
            range={accountNames}
            value={fromIndex}
            onChange={(event) => setFromIndex(Number(event.detail.value))}
          >
            <View className="select-box">从 {accountNames[fromIndex]}</View>
          </Picker>
          <Picker
            mode="selector"
            range={accountNames}
            value={toIndex}
            onChange={(event) => setToIndex(Number(event.detail.value))}
          >
            <View className="select-box">到 {accountNames[toIndex]}</View>
          </Picker>
          <Input
            className="select-box"
            type="digit"
            placeholder="金额"
            value={transferAmount}
            onInput={(event) => setTransferAmount(String(event.detail.value))}
          />
          <Button className="select-box select-box--button" onClick={transfer}>
            转账
          </Button>
        </View>
      </View>

      <View className="budget-card">
        <View className="row space-between">
          <View>
            <Text className="section-title">月度预算</Text>
            <Text className="caption">超额会在首页和设置页提醒</Text>
          </View>
          <Text className="budget-card__percent">{clampPercent(stats.budgetUsage).toFixed(0)}%</Text>
        </View>
        <View className="budget-progress">
          <View className="budget-progress__bar" style={{ width: `${clampPercent(stats.budgetUsage)}%` }} />
        </View>
        <View className="row space-between budget-card__numbers">
          <Text>已用 {formatMoney(stats.expense, state.settings.currency)}</Text>
          <Text>预算 {formatMoney(monthBudget?.total || 0, state.settings.currency)}</Text>
        </View>
        <View className="inline-form">
          <Input
            className="inline-form__input"
            type="digit"
            placeholder="设置本月总预算"
            value={budgetInput}
            onInput={(event) => setBudgetInput(String(event.detail.value))}
          />
          <Button className="inline-form__button" onClick={saveBudget}>
            保存
          </Button>
        </View>
      </View>

      <BottomNav active="bills" />
    </View>
  )
}
