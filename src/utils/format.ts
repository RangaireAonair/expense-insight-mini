import { Account, Category, MoneyRecord, RecordType } from '@/types'

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonth() {
  return todayISO().slice(0, 7)
}

export function formatMoney(amount: number, currency = 'CNY') {
  const symbol = currency === 'USD' ? '$' : '¥'
  return `${symbol}${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function signedMoney(record: Pick<MoneyRecord, 'type' | 'amount'>, currency = 'CNY') {
  return `${record.type === 'income' ? '+' : '-'}${formatMoney(record.amount, currency)}`
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function monthOf(date: string) {
  return date.slice(0, 7)
}

export function yearOf(date: string) {
  return date.slice(0, 4)
}

export function getCategory(categories: Category[], id: string) {
  return categories.find((item) => item.id === id)
}

export function getAccount(accounts: Account[], id: string) {
  return accounts.find((item) => item.id === id)
}

export function sumByType(records: MoneyRecord[], type: RecordType) {
  return records.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0)
}

export function clampPercent(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}
