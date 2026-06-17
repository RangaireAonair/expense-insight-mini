export type RecordType = 'expense' | 'income'

export interface UserProfile {
  avatarUrl: string
  nickName: string
  syncedAt?: string
}

export interface Category {
  id: string
  name: string
  type: RecordType | 'both'
  icon: string
  color: string
  parentId?: string
  level?: 1 | 2 | 3
  custom?: boolean
}

export interface Tag {
  id: string
  name: string
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'wechat' | 'alipay' | 'credit' | 'other'
  balance: number
  color: string
}

export interface MoneyRecord {
  id: string
  type: RecordType
  amount: number
  categoryId: string
  accountId: string
  date: string
  note: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Budget {
  month: string
  total: number
  categories: Record<string, number>
}

export interface ReminderSetting {
  enabled: boolean
  repeat: 'daily' | 'weekly'
  time: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  currency: 'CNY' | 'USD'
  syncMode: 'local' | 'cloud'
  privacyMode: boolean
  reminder: ReminderSetting
}

export interface FinanceState {
  user?: UserProfile
  categories: Category[]
  tags: Tag[]
  accounts: Account[]
  records: MoneyRecord[]
  budgets: Budget[]
  settings: AppSettings
}
