import Taro from '@tarojs/taro'
import {
  Account,
  Budget,
  Category,
  FinanceState,
  MoneyRecord,
  RecordType,
  Tag,
  UserProfile
} from '@/types'
import { createId, currentMonth, monthOf, sumByType, todayISO, yearOf } from '@/utils/format'

const STORAGE_KEY = 'money-ledger-state-v1'

export const defaultCategories: Category[] = [
  { id: 'food', name: '餐饮', type: 'expense', icon: '餐', color: '#006d33' },
  { id: 'transport', name: '交通', type: 'expense', icon: '行', color: '#3d4a3d' },
  { id: 'shopping', name: '购物', type: 'expense', icon: '购', color: '#ffa504' },
  { id: 'entertainment', name: '娱乐', type: 'expense', icon: '乐', color: '#a23d33' },
  { id: 'housing', name: '居住', type: 'expense', icon: '住', color: '#006d33' },
  { id: 'medical', name: '医疗', type: 'expense', icon: '医', color: '#a23d33' },
  { id: 'salary', name: '工资', type: 'income', icon: '薪', color: '#07c160' },
  { id: 'bonus', name: '奖金', type: 'income', icon: '奖', color: '#45e17c' },
  { id: 'transfer_in', name: '转入', type: 'income', icon: '入', color: '#006d33' }
]

export const defaultTags: Tag[] = [
  { id: 'work', name: '工作日' },
  { id: 'family', name: '家庭' },
  { id: 'urgent', name: '刚需' },
  { id: 'reimburse', name: '可报销' }
]

export const defaultAccounts: Account[] = [
  { id: 'wechat', name: '微信钱包', type: 'wechat', balance: 42180.5, color: '#07c160' },
  { id: 'bank', name: '银行卡', type: 'bank', balance: 66500, color: '#006d33' },
  { id: 'alipay', name: '支付宝', type: 'alipay', balance: 15400, color: '#1677ff' },
  { id: 'cash', name: '现金', type: 'cash', balance: 499.92, color: '#6c7b6c' }
]

const seedRecords: MoneyRecord[] = [
  sampleRecord('expense', 45, 'food', 'wechat', todayISO(), '午餐', ['work']),
  sampleRecord('income', 1200, 'bonus', 'bank', todayISO(), '项目尾款', ['reimburse']),
  sampleRecord('expense', 22.8, 'shopping', 'alipay', todayISO(), '便利店', []),
  sampleRecord('expense', 34, 'transport', 'wechat', todayISO(), '打车', ['work']),
  sampleRecord('expense', 120, 'shopping', 'alipay', offsetDate(-1), '优衣库购物', ['family']),
  sampleRecord('income', 7000, 'salary', 'bank', offsetDate(-2), '月薪', []),
  sampleRecord('expense', 5.5, 'food', 'cash', offsetDate(-3), '咖啡', [])
]

function sampleRecord(
  type: RecordType,
  amount: number,
  categoryId: string,
  accountId: string,
  date: string,
  note: string,
  tags: string[]
): MoneyRecord {
  const now = new Date().toISOString()
  return {
    id: createId('record'),
    type,
    amount,
    categoryId,
    accountId,
    date,
    note,
    tags,
    createdAt: now,
    updatedAt: now
  }
}

function offsetDate(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function createInitialState(): FinanceState {
  return {
    categories: defaultCategories,
    tags: defaultTags,
    accounts: defaultAccounts,
    records: seedRecords,
    budgets: [
      {
        month: currentMonth(),
        total: 7000,
        categories: {
          food: 2000,
          transport: 600,
          shopping: 1500,
          entertainment: 800
        }
      }
    ],
    settings: {
      theme: 'light',
      currency: 'CNY',
      syncMode: 'local',
      privacyMode: false,
      reminder: {
        enabled: true,
        repeat: 'daily',
        time: '21:00'
      }
    }
  }
}

export function loadState(): FinanceState {
  try {
    const cached = Taro.getStorageSync<FinanceState>(STORAGE_KEY)
    return cached || createInitialState()
  } catch (error) {
    return createInitialState()
  }
}

export function saveState(state: FinanceState) {
  Taro.setStorageSync(STORAGE_KEY, state)
}

export function resetState() {
  const state = createInitialState()
  saveState(state)
  return state
}

export function setUserProfile(profile: UserProfile) {
  const state = loadState()
  state.user = profile
  saveState(state)
  return state
}

export function upsertRecord(record: Omit<MoneyRecord, 'createdAt' | 'updatedAt'> & { createdAt?: string }) {
  const state = loadState()
  const now = new Date().toISOString()
  const index = state.records.findIndex((item) => item.id === record.id)
  const previous = index >= 0 ? state.records[index] : undefined
  const next: MoneyRecord = {
    ...record,
    createdAt: record.createdAt || previous?.createdAt || now,
    updatedAt: now
  }

  if (previous) {
    state.accounts = reverseAccountEffect(state.accounts, previous)
    state.records[index] = next
  } else {
    state.records.unshift(next)
  }

  state.accounts = applyAccountEffect(state.accounts, next)
  saveState(state)
  return state
}

export function removeRecord(id: string) {
  const state = loadState()
  const record = state.records.find((item) => item.id === id)
  if (record) {
    state.accounts = reverseAccountEffect(state.accounts, record)
  }
  state.records = state.records.filter((item) => item.id !== id)
  saveState(state)
  return state
}

export function addCustomCategory(name: string, type: RecordType) {
  const state = loadState()
  const category: Category = {
    id: createId('category'),
    name,
    type,
    icon: name.slice(0, 1),
    color: type === 'income' ? '#07c160' : '#ffa504',
    custom: true
  }
  state.categories.push(category)
  saveState(state)
  return category
}

export function addAccount(name: string, balance: number) {
  const state = loadState()
  state.accounts.push({
    id: createId('account'),
    name,
    type: 'other',
    balance,
    color: '#6c7b6c'
  })
  saveState(state)
  return state
}

export function transferBetweenAccounts(fromId: string, toId: string, amount: number) {
  const state = loadState()
  state.accounts = state.accounts.map((account) => {
    if (account.id === fromId) return { ...account, balance: account.balance - amount }
    if (account.id === toId) return { ...account, balance: account.balance + amount }
    return account
  })
  saveState(state)
  return state
}

export function updateBudget(budget: Budget) {
  const state = loadState()
  const index = state.budgets.findIndex((item) => item.month === budget.month)
  if (index >= 0) state.budgets[index] = budget
  else state.budgets.push(budget)
  saveState(state)
  return state
}

export function updateSettings(settings: FinanceState['settings']) {
  const state = loadState()
  state.settings = settings
  saveState(state)
  return state
}

export function getMonthRecords(state: FinanceState, month = currentMonth()) {
  return state.records.filter((item) => monthOf(item.date) === month)
}

export function getYearRecords(state: FinanceState, year = todayISO().slice(0, 4)) {
  return state.records.filter((item) => yearOf(item.date) === year)
}

export function getDashboardStats(state: FinanceState, month = currentMonth()) {
  const records = getMonthRecords(state, month)
  const expense = sumByType(records, 'expense')
  const income = sumByType(records, 'income')
  const budget = state.budgets.find((item) => item.month === month)
  const totalBudget = budget?.total || 0
  return {
    records,
    expense,
    income,
    balance: income - expense,
    budgetUsage: totalBudget ? (expense / totalBudget) * 100 : 0,
    totalBudget
  }
}

export function groupRecordsByDay(records: MoneyRecord[]) {
  return records.reduce<Record<string, MoneyRecord[]>>((groups, record) => {
    groups[record.date] = groups[record.date] || []
    groups[record.date].push(record)
    return groups
  }, {})
}

export function getCategoryTotals(state: FinanceState, records: MoneyRecord[], type: RecordType) {
  return state.categories
    .filter((category) => category.type === type || category.type === 'both')
    .map((category) => {
      const total = records
        .filter((record) => record.type === type && record.categoryId === category.id)
        .reduce((sum, record) => sum + record.amount, 0)
      return { category, total }
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function getMonthlyTrend(state: FinanceState, months = 6) {
  const now = new Date()
  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1)
    const month = date.toISOString().slice(0, 7)
    const records = getMonthRecords(state, month)
    return {
      month: `${date.getMonth() + 1}月`,
      income: sumByType(records, 'income'),
      expense: sumByType(records, 'expense')
    }
  })
}

export async function syncToCloud(state: FinanceState) {
  const cloud = (Taro as unknown as {
    cloud?: {
      database: () => {
        collection: (name: string) => {
          add: (payload: { data: Record<string, unknown> }) => Promise<unknown>
        }
      }
    }
  }).cloud

  if (!cloud) {
    saveState(state)
    return { mode: 'local' as const }
  }

  const db = cloud.database()
  await db.collection('money_backups').add({
    data: {
      payload: state,
      updatedAt: new Date().toISOString()
    }
  })
  return { mode: 'cloud' as const }
}

export function exportCsv(state: FinanceState) {
  const header = '日期,类型,金额,分类,账户,标签,备注'
  const rows = state.records.map((record) => {
    const category = state.categories.find((item) => item.id === record.categoryId)?.name || ''
    const account = state.accounts.find((item) => item.id === record.accountId)?.name || ''
    const tags = record.tags
      .map((tagId) => state.tags.find((tag) => tag.id === tagId)?.name)
      .filter(Boolean)
      .join('|')
    return [record.date, record.type, record.amount, category, account, tags, record.note]
      .map((item) => `"${String(item).replace(/"/g, '""')}"`)
      .join(',')
  })
  return [header, ...rows].join('\n')
}

function applyAccountEffect(accounts: Account[], record: MoneyRecord) {
  return accounts.map((account) => {
    if (account.id !== record.accountId) return account
    return {
      ...account,
      balance: record.type === 'income' ? account.balance + record.amount : account.balance - record.amount
    }
  })
}

function reverseAccountEffect(accounts: Account[], record: MoneyRecord) {
  return accounts.map((account) => {
    if (account.id !== record.accountId) return account
    return {
      ...account,
      balance: record.type === 'income' ? account.balance - record.amount : account.balance + record.amount
    }
  })
}
