import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { getCategory, getCategoryChildren, getCategoryPath, getCategoryPathLabel } from '@/modules/categories'
import { addCustomCategory, loadState, upsertRecord } from '@/store/finance'
import { Category, FinanceState, RecordType } from '@/types'
import { createId, todayISO } from '@/utils/format'
import { useThemeClass } from '@/utils/theme'
import './index.scss'

type EntryTab = RecordType | 'transfer'

const tabs: Array<{ label: string; value: EntryTab }> = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
  { label: '转账', value: 'transfer' }
]

export default function AddPage() {
  const router = useRouter()
  const recordId = String(router.params.id || '')
  const [state, setState] = useState<FinanceState>(() => loadState())
  const currentThemeClass = useThemeClass(state.settings.theme)
  const editing = state.records.find((record) => record.id === recordId)
  const [type, setType] = useState<RecordType>(editing?.type || 'expense')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '0')
  const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food')
  const [accountId, setAccountId] = useState(editing?.accountId || 'wechat')
  const [date, setDate] = useState(editing?.date || todayISO())
  const [note, setNote] = useState(editing?.note || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(editing?.tags || [])
  const [customCategory, setCustomCategory] = useState('')
  const [keypadVisible, setKeypadVisible] = useState(true)

  useDidShow(() => setState(loadState()))

  const topCategories = useMemo(() => getCategoryChildren(state.categories, undefined, type), [state.categories, type])
  const categoryPath = getCategoryPath(state.categories, categoryId)
  const activeRoot = categoryPath[0]?.id || topCategories[0]?.id
  const secondCategories = useMemo(
    () => (activeRoot ? getCategoryChildren(state.categories, activeRoot, type) : []),
    [activeRoot, state.categories, type]
  )
  const activeSecond = categoryPath[1]?.id
  const thirdCategories = useMemo(
    () => (activeSecond ? getCategoryChildren(state.categories, activeSecond, type) : []),
    [activeSecond, state.categories, type]
  )
  const categoryPathLabel = getCategoryPathLabel(state.categories, categoryId)
  const accountNames = state.accounts.map((account) => account.name)
  const accountIndex = Math.max(
    0,
    state.accounts.findIndex((account) => account.id === accountId)
  )

  const append = (value: string) => {
    setKeypadVisible(true)
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
    setKeypadVisible(true)
    setAmount((current) => (current.length <= 1 ? '0' : current.slice(0, -1)))
  }

  const toggleTag = (id: string) => {
    setSelectedTags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const switchTab = (nextType: EntryTab) => {
    if (nextType === 'transfer') {
      Taro.showToast({ title: '转账请到账户页操作', icon: 'none' })
      return
    }
    setType(nextType)
    const firstCategory = getCategoryChildren(state.categories, undefined, nextType)[0]
    if (firstCategory) setCategoryId(firstCategory.id)
  }

  const createCategory = () => {
    const name = customCategory.trim()
    if (!name) return
    const currentCategory = getCategory(state.categories, categoryId)
    const parentId = currentCategory?.level === 3 ? currentCategory.parentId : currentCategory?.id
    const category = addCustomCategory(name, type, parentId)
    setState(loadState())
    setCategoryId(category.id)
    setCustomCategory('')
    Taro.showToast({ title: '已添加分类', icon: 'success' })
  }

  const closePage = () => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  const saveRecord = (stay = false) => {
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
    Taro.showToast({ title: editing ? '已保存' : '已完成', icon: 'success' })

    if (stay && !editing) {
      setAmount('0')
      setNote('')
      setSelectedTags([])
      setState(loadState())
      return
    }

    setTimeout(() => Taro.redirectTo({ url: '/pages/bills/index' }), 450)
  }

  const selectCategory = (category: Category) => setCategoryId(category.id)
  const currentCategory = getCategory(state.categories, categoryId)

  return (
    <View className={`add-entry-page ${currentThemeClass}`}>
      <View className="entry-shell">
        <View className="entry-top">
          <Button className="entry-close" onClick={closePage}>
            ×
          </Button>
          <View className="entry-tabs">
            {tabs.map((tab) => (
              <View
                key={tab.value}
                className={`entry-tab ${tab.value === type ? 'entry-tab--active' : ''}`}
                onClick={() => switchTab(tab.value)}
              >
                {tab.label}
              </View>
            ))}
          </View>
          <Picker
            mode="selector"
            range={accountNames}
            value={accountIndex}
            onChange={(event) => setAccountId(state.accounts[Number(event.detail.value)].id)}
          >
            <View className="entry-account">{state.accounts[accountIndex]?.name || '默认账本'}</View>
          </Picker>
        </View>

        <View className="entry-category-grid">
          {topCategories.map((category) => (
            <View
              key={category.id}
              className={`entry-category ${category.id === activeRoot ? 'entry-category--active' : ''}`}
              onClick={() => selectCategory(category)}
            >
              <View className="entry-category__icon">
                <Text>{category.icon}</Text>
                {getCategoryChildren(state.categories, category.id, type).length > 0 && (
                  <Text className="entry-category__more">•••</Text>
                )}
              </View>
              <Text className="entry-category__name">{category.name}</Text>
            </View>
          ))}
        </View>

        {(secondCategories.length > 0 || thirdCategories.length > 0) && (
          <View className="entry-subcategories">
            {secondCategories.map((category) => (
              <View
                key={category.id}
                className={`entry-subcategory ${category.id === categoryId || category.id === activeSecond ? 'entry-subcategory--active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                {category.name}
              </View>
            ))}
            {thirdCategories.map((category) => (
              <View
                key={category.id}
                className={`entry-subcategory entry-subcategory--third ${category.id === categoryId ? 'entry-subcategory--active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                {category.name}
              </View>
            ))}
          </View>
        )}

        <View className="entry-options">
          <View className="entry-pill entry-pill--account">
            <Text className="entry-pill__mark">A</Text>
            <Text>{state.accounts[accountIndex]?.name || '默认账户'}</Text>
          </View>
          <View className="entry-pill" onClick={() => toggleTag('reimburse')}>
            <Text className={selectedTags.includes('reimburse') ? 'entry-radio entry-radio--active' : 'entry-radio'} />
            <Text>报销</Text>
          </View>
          <View className="entry-pill" onClick={() => toggleTag('discount')}>
            <Text className="entry-pill__mark entry-pill__mark--green">券</Text>
            <Text>优惠</Text>
          </View>
          <View className="entry-pill" onClick={() => setKeypadVisible(false)}>
            <Text className="entry-pill__mark entry-pill__mark--blue">签</Text>
            <Text>标签</Text>
          </View>
          <Button className="entry-setting" onClick={createCategory}>
            ⚙
          </Button>
        </View>

        <View className="entry-amount-card" onClick={() => setKeypadVisible(true)}>
          <Text className={`entry-amount ${type === 'income' ? 'entry-amount--income' : ''}`}>
            {state.settings.currency === 'USD' ? '$' : '¥'} {amount === '0' ? '0.00' : amount}
          </Text>
          <View className="entry-note-line">
            <Picker mode="date" value={date} onChange={(event) => setDate(String(event.detail.value))}>
              <View className="entry-time">◷ {date.slice(5)}</View>
            </Picker>
            <Textarea
              className="entry-note"
              value={note}
              placeholder="点击填写备注"
              autoHeight
              onFocus={() => setKeypadVisible(false)}
              onInput={(event) => setNote(String(event.detail.value))}
            />
            <Button className="entry-collapse" onClick={() => setKeypadVisible(!keypadVisible)}>
              ⌃
            </Button>
          </View>
        </View>

        <View className="entry-custom">
          <Text>当前：{categoryPathLabel || currentCategory?.name || '请选择分类'}</Text>
          <Input
            className="entry-custom__input"
            value={customCategory}
            placeholder="添加子类"
            onFocus={() => setKeypadVisible(false)}
            onInput={(event) => setCustomCategory(String(event.detail.value))}
          />
          <Button className="entry-custom__button" onClick={createCategory}>
            添加
          </Button>
        </View>

        {keypadVisible && (
          <View className="entry-keypad">
            {['1', '2', '3'].map((key) => (
              <Button key={key} className="entry-key" onClick={() => append(key)}>
                {key}
              </Button>
            ))}
            <Button className="entry-key entry-key--operator">+ ×</Button>
            {['4', '5', '6'].map((key) => (
              <Button key={key} className="entry-key" onClick={() => append(key)}>
                {key}
              </Button>
            ))}
            <Button className="entry-key entry-key--operator">- ÷</Button>
            {['7', '8', '9'].map((key) => (
              <Button key={key} className="entry-key" onClick={() => append(key)}>
                {key}
              </Button>
            ))}
            <Button className="entry-key entry-key--save-again" onClick={() => saveRecord(true)}>
              {editing ? '保存' : '保存再记'}
            </Button>
            <Button className="entry-key" onClick={() => append('.')}>
              .
            </Button>
            <Button className="entry-key" onClick={() => append('0')}>
              0
            </Button>
            <Button className="entry-key" onClick={removeLast}>
              ⌫
            </Button>
            <Button className="entry-key entry-key--done" onClick={() => saveRecord(false)}>
              {editing ? '保存' : '完成'}
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}
