import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { AppSettings } from '@/types'

export type ResolvedTheme = 'light' | 'dark'

export function resolveTheme(theme: AppSettings['theme']): ResolvedTheme {
  if (theme !== 'system') return theme

  try {
    const systemInfo = Taro.getSystemInfoSync()
    return systemInfo.theme === 'dark' ? 'dark' : 'light'
  } catch (_error) {
    return 'light'
  }
}

export function useThemeClass(theme: AppSettings['theme']) {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme))

  const refreshSystemTheme = () => {
    setResolvedTheme(resolveTheme(theme))
  }

  useDidShow(() => {
    refreshSystemTheme()
  })

  useEffect(() => {
    refreshSystemTheme()

    if (theme !== 'system') return undefined

    const handleThemeChange = (result: { theme: string }) => {
      setResolvedTheme(result.theme === 'dark' ? 'dark' : 'light')
    }

    Taro.onThemeChange?.(handleThemeChange)

    return () => {
      Taro.offThemeChange?.(handleThemeChange)
    }
  }, [theme])

  return `theme-${resolvedTheme}`
}

export function themeLabel(theme: AppSettings['theme']) {
  const labels: Record<AppSettings['theme'], string> = {
    system: '跟随系统',
    light: '浅色',
    dark: '深色'
  }

  return labels[theme]
}
