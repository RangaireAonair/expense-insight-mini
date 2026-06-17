import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

type NavKey = 'home' | 'bills' | 'add' | 'analytics' | 'profile'

interface NavItem {
  key: NavKey
  label: string
  url: string
}

const items: NavItem[] = [
  { key: 'home', label: '首页', url: '/pages/index/index' },
  { key: 'bills', label: '账单', url: '/pages/bills/index' },
  { key: 'add', label: '记账', url: '/pages/add/index' },
  { key: 'analytics', label: '统计', url: '/pages/analytics/index' },
  { key: 'profile', label: '我的', url: '/pages/profile/index' }
]

export default function BottomNav({ active }: { active: NavKey }) {
  const go = (item: NavItem) => {
    if (item.key === active) return
    Taro.reLaunch({
      url: item.url,
      fail: () => {
        Taro.redirectTo({
          url: item.url,
          fail: () => {
            Taro.navigateTo({ url: item.url })
          }
        })
      }
    })
  }

  return (
    <View className="bottom-nav">
      {items.map((item) => (
        <View
          key={item.key}
          className={`bottom-nav__item bottom-nav__item--${item.key} ${
            active === item.key ? 'bottom-nav__item--active' : ''
          }`}
          onClick={() => go(item)}
        >
          <View className="bottom-nav__icon">
            <View className={`bottom-nav__glyph bottom-nav__glyph--${item.key}`} />
          </View>
          <Text className="bottom-nav__label">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
