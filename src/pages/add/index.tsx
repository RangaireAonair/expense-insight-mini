import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { addCustomCategory, loadState, upsertRecord } from '@/store/finance'
import { Category, FinanceState, RecordType } from '@/types'
import { createId, todayISO } from '@/utils/format'
import './index.scss'

export default function AddPage() {
  const router = useRouter()
  const recordId = String(router.params.id || '')
  const [state, setState] = useState<FinanceState>(() => loadState())
  const editing = state.records.find((record) => record.id === recordId)
  const [type, setType] = useState<RecordType>(editing?.type || 'expense')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '0')
  const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food')
  const [accountId, setAccountId] = useState(editing?.accountId || 'wechat')
  const [date, setDate] = useState(editing?.date || todayISO())
  const [note, setNote] = useState(editing?.note || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(editing?.tags || [])
  const [customCategory, setCustomCategory] = useState('')

  useDidShow(() => setState(loadState()))

  const categories = useMemo(
    () => state.categories.filter((category) => category.type === type || category.type === 'both'),
    [state.categories, type]
  )

  const accountNames = state.accounts.map((account) => account.name)
  const accountIndex = Math.max(
    0,
    state.accounts.findIndex((account) => account.id === accountId)
  )

  const append = (value: string) => {
    setAmount((current) => {
      if (current === '0') {
        if (value === '.') return '0.'
        if (value === '0' || value === '00') return current
        return value
      }
      if (value === '.' && current.includes('.')) return current
      if (current.includes('.') && current.split('.')[1].length >= 2) return current
      return `${current}${value}`
    })
  }

  const removeLast = () => {
    setAmount((current) => (current.length <= 1 ? '0' : current.slice(0, -1)))
  }

  const toggleTag = (id: string) => {
    setSelectedTags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const createCategory = () => {
    const name = customCategory.trim()
    if (!name) return
    const category = addCustomCategory(name, type)
    setState(loadState())
    setCategoryId(category.id)
    setCustomCategory('')
    Taro.showToast({ title: '已添加分类', icon: 'success' })
  }

  const submit = () => {
    const value = Number(amount)
    if (!value || value <= 0) {
      Taro.showToast({ title: '请输入金额', icon: 'none' })
      return
    }

    upsertRecord({
      id: editing?.id || createId('record'),
      type,
      amount: value,
      categoryId,
      accountId,
      date,
      note,
      tags: selectedTags,
      createdAt: editing?.createdAt
    })
    Taro.showToast({ title: editing ? '已更新' : '已保存', icon: 'success' })
    setTimeout(() => Taro.redirectTo({ url: '/pages/bills/index' }), 450)
  }

  const selectCategory = (category: Category) => setCategoryId(category.id)

  return (
    <View className="add-page">
      <View className="add-header">
        <View className="type-tabs">
          <View
            className={`type-tab ${type === 'expense' ? 'type-tab--active' : ''}`}
            onClick={() => setType('expense')}
          >
            支出
          </View>
          <View className={`type-tab ${type === 'income' ? 'type-tab--active' : ''}`} onClick={() => setType('income')}>
            收入
          </View>
        </View>
        <View className="amount-line">
          <Text className="amount-line__currency">{state.settings.currency}</Text>
          <Text className={`amount-line__number ${type === 'income' ? 'amount-positive' : ''}`}>
            {amount === '0' ? '0.00' : amount}
          </Text>
        </View>
      </View>

      <View className="add-scroll">
        <View className="form-section">
          <Text className="form-label">选择分类</Text>
          <View className="category-grid">
            {categories.map((category) => (
              <View
                key={category.id}
                className={`category-item ${category.id === categoryId ? 'category-item--active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                <Text className="category-item__icon">{category.icon}</Text>
                <Text>{category.name}</Text>
              </View>
            ))}
          </View>
          <View className="custom-category">
            <Input
              className="custom-category__input"
              placeholder="自定义分类"
              value={customCategory}
              onInput={(event) => setCustomCategory(String(event.detail.value))}
            />
            <Button className="custom-category__button" onClick={createCategory}>
              添加
            </Button>
          </View>
        </View>

        <View className="form-section">
          <Text className="form-label">标签</Text>
          <View className="tag-row">
            {state.tags.map((tag) => (
              <View
                key={tag.id}
                className={`tag-chip ${selectedTags.includes(tag.id) ? 'tag-chip--active' : ''}`}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </View>
            ))}
          </View>
        </View>

        <View className="field-list">
          <Picker
            mode="selector"
            range={accountNames}
            value={accountIndex}
            onChange={(event) => setAccountId(state.accounts[Number(event.detail.value)].id)}
          >
            <View className="field-row">
              <Text>账户</Text>
              <Text className="field-row__value">{state.accounts[accountIndex]?.name}</Text>
            </View>
          </Picker>
          <Picker mode="date" value={date} onChange={(event) => setDate(String(event.detail.value))}>
            <View className="field-row">
              <Text>记账时间</Text>
              <Text className="field-row__value">{date}</Text>
            </View>
          </Picker>
          <View className="note-row">
            <Text>备注</Text>
            <Textarea
              className="note-row__textarea"
              value={note}
              placeholder="补充说明、商户、用途"
              autoHeight
              onInput={(event) => setNote(String(event.detail.value))}
            />
          </View>
        </View>
      </View>

      <View className="keypad">
        {['1', '2', '3'].map((key) => (
          <Button key={key} className="keypad__button" onClick={() => append(key)}>
            {key}
          </Button>
        ))}
        <Button className="keypad__button keypad__button--soft" onClick={removeLast}>
          退格
        </Button>
        {['4', '5', '6'].map((key) => (
          <Button key={key} className="keypad__button" onClick={() => append(key)}>
            {key}
          </Button>
        ))}
        <Button className="keypad__button keypad__button--soft" onClick={() => setAmount('0')}>
          清空
        </Button>
        {['7', '8', '9'].map((key) => (
          <Button key={key} className="keypad__button" onClick={() => append(key)}>
            {key}
          </Button>
        ))}
        <Button className="keypad__button keypad__button--ok" onClick={submit}>
          完成
        </Button>
        {['.', '0', '00'].map((key) => (
          <Button key={key} className="keypad__button" onClick={() => append(key)}>
            {key}
          </Button>
        ))}
      </View>

      <BottomNav active="add" />
    </View>
  )
}
