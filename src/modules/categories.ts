import { Category, RecordType } from '@/types'
import { createId } from '@/utils/format'

export const defaultCategories: Category[] = [
  { id: 'food', name: '餐饮', type: 'expense', icon: '餐', color: '#006d33', level: 1 },
  { id: 'food-breakfast', name: '早餐', type: 'expense', icon: '早', color: '#006d33', parentId: 'food', level: 2 },
  { id: 'food-lunch', name: '午餐', type: 'expense', icon: '午', color: '#006d33', parentId: 'food', level: 2 },
  { id: 'food-dinner', name: '晚餐', type: 'expense', icon: '晚', color: '#006d33', parentId: 'food', level: 2 },
  { id: 'food-night', name: '夜宵', type: 'expense', icon: '夜', color: '#006d33', parentId: 'food', level: 2 },
  { id: 'food-drink', name: '饮品', type: 'expense', icon: '饮', color: '#006d33', parentId: 'food', level: 2 },
  {
    id: 'food-drink-coffee',
    name: '咖啡',
    type: 'expense',
    icon: '咖',
    color: '#006d33',
    parentId: 'food-drink',
    level: 3
  },
  {
    id: 'food-drink-milk-tea',
    name: '奶茶',
    type: 'expense',
    icon: '茶',
    color: '#006d33',
    parentId: 'food-drink',
    level: 3
  },

  { id: 'transport', name: '交通', type: 'expense', icon: '行', color: '#3d4a3d', level: 1 },
  {
    id: 'transport-taxi',
    name: '打车',
    type: 'expense',
    icon: '车',
    color: '#3d4a3d',
    parentId: 'transport',
    level: 2
  },
  {
    id: 'transport-public',
    name: '公交地铁',
    type: 'expense',
    icon: '铁',
    color: '#3d4a3d',
    parentId: 'transport',
    level: 2
  },
  {
    id: 'transport-fuel',
    name: '加油充电',
    type: 'expense',
    icon: '能',
    color: '#3d4a3d',
    parentId: 'transport',
    level: 2
  },

  { id: 'shopping', name: '购物', type: 'expense', icon: '购', color: '#ffa504', level: 1 },
  {
    id: 'shopping-daily',
    name: '日用品',
    type: 'expense',
    icon: '日',
    color: '#ffa504',
    parentId: 'shopping',
    level: 2
  },
  {
    id: 'shopping-clothes',
    name: '服饰',
    type: 'expense',
    icon: '衣',
    color: '#ffa504',
    parentId: 'shopping',
    level: 2
  },
  {
    id: 'shopping-digital',
    name: '数码',
    type: 'expense',
    icon: '数',
    color: '#ffa504',
    parentId: 'shopping',
    level: 2
  },

  { id: 'daily', name: '日用', type: 'expense', icon: '日', color: '#3d4a3d', level: 1 },
  { id: 'clothes', name: '服饰', type: 'expense', icon: '衣', color: '#ffa504', level: 1 },
  { id: 'skincare', name: '护肤', type: 'expense', icon: '护', color: '#a23d33', level: 1 },
  { id: 'beauty', name: '美妆', type: 'expense', icon: '美', color: '#a23d33', level: 1 },
  { id: 'family', name: '家人', type: 'expense', icon: '家', color: '#006d33', level: 1 },
  { id: 'vegetables', name: '蔬菜', type: 'expense', icon: '蔬', color: '#006d33', level: 1 },
  { id: 'fruit', name: '水果', type: 'expense', icon: '果', color: '#006d33', level: 1 },
  { id: 'sports', name: '运动', type: 'expense', icon: '动', color: '#3d4a3d', level: 1 },
  { id: 'entertainment', name: '娱乐', type: 'expense', icon: '乐', color: '#a23d33', level: 1 },
  {
    id: 'entertainment-movie',
    name: '电影演出',
    type: 'expense',
    icon: '影',
    color: '#a23d33',
    parentId: 'entertainment',
    level: 2
  },
  {
    id: 'entertainment-game',
    name: '游戏',
    type: 'expense',
    icon: '游',
    color: '#a23d33',
    parentId: 'entertainment',
    level: 2
  },
  {
    id: 'entertainment-travel',
    name: '旅行',
    type: 'expense',
    icon: '旅',
    color: '#a23d33',
    parentId: 'entertainment',
    level: 2
  },
  { id: 'travel', name: '旅行', type: 'expense', icon: '旅', color: '#3d4a3d', level: 1 },
  { id: 'vacation', name: '度假', type: 'expense', icon: '假', color: '#3d4a3d', level: 1 },
  { id: 'digital', name: '数码', type: 'expense', icon: '数', color: '#3d4a3d', level: 1 },
  { id: 'car', name: '汽车', type: 'expense', icon: '车', color: '#3d4a3d', level: 1 },

  { id: 'housing', name: '居住', type: 'expense', icon: '住', color: '#006d33', level: 1 },
  { id: 'housing-rent', name: '房租', type: 'expense', icon: '租', color: '#006d33', parentId: 'housing', level: 2 },
  {
    id: 'housing-utilities',
    name: '水电燃气',
    type: 'expense',
    icon: '电',
    color: '#006d33',
    parentId: 'housing',
    level: 2
  },
  {
    id: 'housing-property',
    name: '物业维修',
    type: 'expense',
    icon: '修',
    color: '#006d33',
    parentId: 'housing',
    level: 2
  },

  { id: 'medical', name: '医疗', type: 'expense', icon: '医', color: '#a23d33', level: 1 },
  {
    id: 'medical-medicine',
    name: '买药',
    type: 'expense',
    icon: '药',
    color: '#a23d33',
    parentId: 'medical',
    level: 2
  },
  {
    id: 'medical-hospital',
    name: '医院门诊',
    type: 'expense',
    icon: '诊',
    color: '#a23d33',
    parentId: 'medical',
    level: 2
  },
  { id: 'books', name: '书籍', type: 'expense', icon: '书', color: '#3d4a3d', level: 1 },
  { id: 'education', name: '教育', type: 'expense', icon: '学', color: '#006d33', level: 1 },
  { id: 'gift', name: '礼物', type: 'expense', icon: '礼', color: '#ffa504', level: 1 },

  { id: 'salary', name: '工资', type: 'income', icon: '薪', color: '#07c160', level: 1 },
  { id: 'bonus', name: '奖金', type: 'income', icon: '奖', color: '#45e17c', level: 1 },
  { id: 'transfer_in', name: '转入', type: 'income', icon: '入', color: '#006d33', level: 1 }
]

export function getCategory(categories: Category[], id: string) {
  return categories.find((item) => item.id === id)
}

export function getCategoryChildren(categories: Category[], parentId?: string, type?: RecordType) {
  return categories.filter((category) => {
    const sameParent = parentId ? category.parentId === parentId : !category.parentId
    const sameType = type ? category.type === type || category.type === 'both' : true
    return sameParent && sameType
  })
}

export function getCategoryPath(categories: Category[], id: string) {
  const path: Category[] = []
  let current = getCategory(categories, id)
  while (current) {
    path.unshift(current)
    current = current.parentId ? getCategory(categories, current.parentId) : undefined
  }
  return path
}

export function getCategoryPathLabel(categories: Category[], id: string) {
  const path = getCategoryPath(categories, id)
  return path.map((category) => category.name).join(' / ')
}

export function categoryContains(categories: Category[], ancestorId: string, categoryId: string) {
  if (ancestorId === categoryId) return true
  return getCategoryPath(categories, categoryId).some((category) => category.id === ancestorId)
}

export function normalizeCategories(categories: Category[] = defaultCategories) {
  const byId = new Map<string, Category>()
  defaultCategories.forEach((category) => byId.set(category.id, category))
  categories.forEach((category) => {
    byId.set(category.id, {
      ...category,
      level: category.level || resolveLevel(categories, category)
    })
  })
  return Array.from(byId.values())
}

export function createCustomCategory(name: string, type: RecordType, parent?: Category): Category {
  const level = parent ? Math.min((parent.level || 1) + 1, 3) : 1
  return {
    id: createId('category'),
    name,
    type,
    icon: name.slice(0, 1),
    color: parent?.color || (type === 'income' ? '#07c160' : '#ffa504'),
    parentId: parent?.id,
    level: level as 1 | 2 | 3,
    custom: true
  }
}

function resolveLevel(categories: Category[], category: Category): 1 | 2 | 3 {
  if (!category.parentId) return 1
  const parent = categories.find((item) => item.id === category.parentId)
  if (!parent?.parentId) return 2
  return 3
}
