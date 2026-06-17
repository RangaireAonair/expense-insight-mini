import { Button, Input, Picker, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { getCategoryPathLabel } from '@/modules/categories'
import { groupRecordsByDay, loadState, removeRecord, upsertRecord } from '@/store/finance'
import { FinanceState, MoneyRecord, RecordType } from '@/types'
import { createId, formatMoney, getAccount, getCategory, signedMoney, todayISO } from '@/utils/format'
import { useThemeClass } from '@/utils/theme'
import './index.scss'

const periodOptions = ['按月', '按年']
const typeOptions = ['全部', '支出', '收入']

export default function BillsPage() {
  const [state, setState] = useState<FinanceState>(() => loadState())
  const currentThemeClass = useThemeClass(state.settings.theme)
  const [keyword, setKeyword] = useState('')
  const [periodIndex, setPeriodIndex] = useState(0)
  const [typeIndex, setTypeIndex] = useState(0)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [year, setYear] = useState(new Date().toISOString().slice(0, 4))
  const [openRecordId, setOpenRecordId] = useState('')
  const [touchStartX, setTouchStartX] = useState(0)

  useDidShow(() => setState(loadState()))

  const filtered = useMemo(() => {
    const typeMap: Array<'all' | RecordType> = ['all', 'expense', 'income']
    const type = typeMap[typeIndex]
    return state.records
      .filter((record) => (periodIndex === 0 ? record.date.startsWith(month) : record.date.startsWith(year)))
      .filter((record) => (type === 'all' ? true : record.type === type))
      .filter((record) => {
        if (!keyword.trim()) return true
        const category = getCategoryPathLabel(state.categories, record.categoryId)
        const account = getAccount(state.accounts, record.accountId)?.name || ''
        const tags = record.tags.map((tagId) => state.tags.find((tag) => tag.id === tagId)?.name).join(' ')
        const haystack = `${record.note} ${category} ${account} ${tags}`
        return haystack.includes(keyword.trim())
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [keyword, month, periodIndex, state, typeIndex, year])

  const groups = groupRecordsByDay(filtered)
  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a))
  const expense = filtered.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const income = filtered.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)

  const editRecord = (record: MoneyRecord) => {
    setOpenRecordId('')
    Taro.navigateTo({ url: `/pages/add/index?id=${record.id}` })
  }

  const refundRecord = (record: MoneyRecord) => {
    if (record.type === 'income') {
      Taro.showToast({ title: '收入账单无需退款', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '生成退款',
      content: `确认按 ${formatMoney(record.amount, state.settings.currency)} 生成退款记录吗？`,
      success: (res) => {
        if (!res.confirm) return
        const nextState = upsertRecord({
          id: createId('refund'),
          type: 'income',
          amount: record.amount,
          categoryId: 'transfer_in',
          accountId: record.accountId,
          date: todayISO(),
          note: `退款：${record.note || getCategoryPathLabel(state.categories, record.categoryId)}`,
          tags: record.tags
        })
        setOpenRecordId('')
        setState(nextState)
        Taro.showToast({ title: '已生成退款', icon: 'success' })
      }
    })
  }

  const deleteRecord = (record: MoneyRecord) => {
    Taro.showModal({
      title: '删除账单',
      content: `确认删除「${record.note || '这笔账'}」吗？`,
      success: (res) => {
        if (res.confirm) {
          setState(removeRecord(record.id))
          setOpenRecordId('')
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  const handleTouchEnd = (recordId: string, event: TouchEvent) => {
    const endX = event.changedTouches?.[0]?.clientX || touchStartX
    const deltaX = endX - touchStartX
    if (deltaX < -36) setOpenRecordId(recordId)
    if (deltaX > 28) setOpenRecordId('')
  }

  return (
    <View className={`page bills-page ${currentThemeClass}`}>
      <View className="top-title">
        <Text className="brand">账单明细</Text>
        <Button className="ghost-button" onClick={() => Taro.navigateTo({ url: '/pages/add/index' })}>
          记一笔
        </Button>
      </View>

      <View className="bills-search">
        <Input
          className="bills-search__input"
          value={keyword}
          placeholder="搜索备注、分类、账户或标签"
          onInput={(event) => setKeyword(String(event.detail.value))}
        />
      </View>

      <View className="filter-row">
        <Picker
          mode="selector"
          range={periodOptions}
          value={periodIndex}
          onChange={(event) => setPeriodIndex(Number(event.detail.value))}
        >
          <View className="filter-chip">{periodOptions[periodIndex]}</View>
        </Picker>
        {periodIndex === 0 ? (
          <Picker mode="date" fields="month" value={month} onChange={(event) => setMonth(String(event.detail.value))}>
            <View className="filter-chip filter-chip--active">{month}</View>
          </Picker>
        ) : (
          <Picker mode="date" fields="year" value={year} onChange={(event) => setYear(String(event.detail.value))}>
            <View className="filter-chip filter-chip--active">{year}</View>
          </Picker>
        )}
        <Picker
          mode="selector"
          range={typeOptions}
          value={typeIndex}
          onChange={(event) => setTypeIndex(Number(event.detail.value))}
        >
          <View className="filter-chip">{typeOptions[typeIndex]}</View>
        </Picker>
      </View>

      <View className="summary-strip">
        <View>
          <Text className="caption">支出</Text>
          <Text className="summary-strip__value amount-negative">{formatMoney(expense, state.settings.currency)}</Text>
        </View>
        <View>
          <Text className="caption">收入</Text>
          <Text className="summary-strip__value amount-positive">{formatMoney(income, state.settings.currency)}</Text>
        </View>
        <View>
          <Text className="caption">净额</Text>
          <Text className="summary-strip__value">{formatMoney(income - expense, state.settings.currency)}</Text>
        </View>
      </View>

      <View className="bill-groups">
        {dates.length === 0 && <View className="empty">没有找到符合条件的账单</View>}
        {dates.map((date) => {
          const records = groups[date]
          const dayExpense = records
            .filter((item) => item.type === 'expense')
            .reduce((sum, item) => sum + item.amount, 0)
          const dayIncome = records.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
          return (
            <View key={date} className="bill-group">
              <View className="bill-group__head">
                <Text>{date}</Text>
                <Text>
                  支 {formatMoney(dayExpense, state.settings.currency)} / 收{' '}
                  {formatMoney(dayIncome, state.settings.currency)}
                </Text>
              </View>
              {records.map((record) => {
                const category = getCategory(state.categories, record.categoryId)
                const categoryLabel = getCategoryPathLabel(state.categories, record.categoryId)
                const account = getAccount(state.accounts, record.accountId)
                return (
                  <View
                    key={record.id}
                    className={`bill-swipe ${openRecordId === record.id ? 'bill-swipe--open' : ''}`}
                    onTouchStart={
                      // @ts-expect-error Taro touch event exposes changedTouches at runtime.
                      (event) => setTouchStartX(event.changedTouches?.[0]?.clientX || 0)
                    }
                    // @ts-expect-error Taro touch event exposes changedTouches at runtime.
                    onTouchEnd={(event) => handleTouchEnd(record.id, event)}
                  >
                    <View className="bill-actions">
                      <Button className="bill-action bill-action--edit" onClick={() => editRecord(record)}>
                        编辑
                      </Button>
                      <Button className="bill-action bill-action--refund" onClick={() => refundRecord(record)}>
                        退款
                      </Button>
                      <Button className="bill-action bill-action--delete" onClick={() => deleteRecord(record)}>
                        删除
                      </Button>
                    </View>
                    <View className="bill-card">
                      <View className="bill-card__main" onClick={() => editRecord(record)}>
                        <View
                          className="bill-card__icon"
                          style={{ background: `${category?.color || '#006d33'}1a`, color: category?.color }}
                        >
                          <Text>{category?.icon || '账'}</Text>
                        </View>
                        <View className="bill-card__body">
                          <Text className="bill-card__title">{record.note || category?.name}</Text>
                          <Text className="caption">
                            {categoryLabel || category?.name} · {account?.name}
                          </Text>
                        </View>
                        <Text className={record.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                          {signedMoney(record, state.settings.currency)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}
      </View>

      <BottomNav active="bills" />
    </View>
  )
}
