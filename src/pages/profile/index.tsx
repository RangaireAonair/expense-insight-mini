import { Button, Image, Picker, Switch, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { exportCsv, loadState, resetState, saveState, setUserProfile, syncToCloud, updateSettings } from '@/store/finance'
import { AppSettings, FinanceState } from '@/types'
import './index.scss'

const currencies: AppSettings['currency'][] = ['CNY', 'USD']
const themes: AppSettings['theme'][] = ['light', 'dark']
const repeats: AppSettings['reminder']['repeat'][] = ['daily', 'weekly']

export default function ProfilePage() {
  const [state, setState] = useState<FinanceState>(() => loadState())

  useDidShow(() => setState(loadState()))

  const patchSettings = (patch: Partial<AppSettings>) => {
    const next = updateSettings({ ...state.settings, ...patch })
    setState(next)
  }

  const patchReminder = (patch: Partial<AppSettings['reminder']>) => {
    patchSettings({ reminder: { ...state.settings.reminder, ...patch } })
  }

  const login = async () => {
    try {
      const res = await Taro.getUserProfile({ desc: '用于展示记账系统头像和昵称' })
      const next = setUserProfile({
        avatarUrl: res.userInfo.avatarUrl,
        nickName: res.userInfo.nickName
      })
      setState(next)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '已取消授权', icon: 'none' })
    }
  }

  const copyCsv = () => {
    const csv = exportCsv(state)
    Taro.setClipboardData({
      data: csv,
      success: () => Taro.showToast({ title: 'CSV 已复制', icon: 'success' })
    })
  }

  const backup = async () => {
    await syncToCloud(state)
    Taro.showToast({ title: '备份完成', icon: 'success' })
  }

  const restoreLocal = () => {
    Taro.showModal({
      title: '恢复示例数据',
      content: '会重置为内置示例数据，当前本地记录会被覆盖。',
      success: (res) => {
        if (res.confirm) {
          const next = resetState()
          setState(next)
          Taro.showToast({ title: '已恢复', icon: 'success' })
        }
      }
    })
  }

  const clearData = () => {
    Taro.showModal({
      title: '清理数据',
      content: '确认清空全部账单、账户和设置吗？',
      success: (res) => {
        if (res.confirm) {
          const next = resetState()
          next.records = []
          next.accounts = []
          saveState(next)
          setState(next)
          Taro.showToast({ title: '已清理', icon: 'success' })
        }
      }
    })
  }

  const showComingSoon = (name: string) => {
    Taro.showToast({ title: `${name} 已预留扩展入口`, icon: 'none' })
  }

  return (
    <View className="page profile-page">
      <View className="top-title">
        <Text className="brand">我的</Text>
      </View>

      <View className="profile-card">
        {state.user?.avatarUrl ? (
          <Image className="profile-card__avatar" src={state.user.avatarUrl} />
        ) : (
          <View className="profile-card__avatar profile-card__avatar--empty">未</View>
        )}
        <View className="profile-card__body">
          <Text className="profile-card__name">{state.user?.nickName || '未登录用户'}</Text>
          <Text className="caption">微信授权登录后可同步头像和昵称</Text>
        </View>
        <Button className="profile-card__button" onClick={login}>
          授权
        </Button>
      </View>

      <View className="setting-group">
        <Text className="setting-group__title">系统设置</Text>
        <Picker mode="selector" range={themes} value={themes.indexOf(state.settings.theme)} onChange={(event) => patchSettings({ theme: themes[Number(event.detail.value)] })}>
          <View className="setting-row">
            <Text>主题模式</Text>
            <Text>{state.settings.theme === 'light' ? '浅色' : '深色'}</Text>
          </View>
        </Picker>
        <Picker mode="selector" range={currencies} value={currencies.indexOf(state.settings.currency)} onChange={(event) => patchSettings({ currency: currencies[Number(event.detail.value)] })}>
          <View className="setting-row">
            <Text>货币单位</Text>
            <Text>{state.settings.currency}</Text>
          </View>
        </Picker>
        <View className="setting-row">
          <Text>隐私金额隐藏</Text>
          <Switch checked={state.settings.privacyMode} color="#07c160" onChange={(event) => patchSettings({ privacyMode: event.detail.value })} />
        </View>
      </View>

      <View className="setting-group">
        <Text className="setting-group__title">记账提醒</Text>
        <View className="setting-row">
          <Text>开启提醒</Text>
          <Switch checked={state.settings.reminder.enabled} color="#07c160" onChange={(event) => patchReminder({ enabled: event.detail.value })} />
        </View>
        <Picker mode="selector" range={repeats} value={repeats.indexOf(state.settings.reminder.repeat)} onChange={(event) => patchReminder({ repeat: repeats[Number(event.detail.value)] })}>
          <View className="setting-row">
            <Text>提醒频率</Text>
            <Text>{state.settings.reminder.repeat === 'daily' ? '每日' : '每周'}</Text>
          </View>
        </Picker>
        <Picker mode="time" value={state.settings.reminder.time} onChange={(event) => patchReminder({ time: String(event.detail.value) })}>
          <View className="setting-row">
            <Text>提醒时间</Text>
            <Text>{state.settings.reminder.time}</Text>
          </View>
        </Picker>
      </View>

      <View className="setting-group">
        <Text className="setting-group__title">数据管理</Text>
        <View className="action-grid">
          <Button className="action-button" onClick={copyCsv}>
            导出 CSV
          </Button>
          <Button className="action-button" onClick={backup}>
            云端备份
          </Button>
          <Button className="action-button" onClick={restoreLocal}>
            恢复备份
          </Button>
          <Button className="action-button action-button--danger" onClick={clearData}>
            数据清理
          </Button>
        </View>
      </View>

      <View className="setting-group">
        <Text className="setting-group__title">扩展能力</Text>
        <View className="extension-list">
          <View className="extension-item" onClick={() => showComingSoon('发票 OCR')}>
            <Text>发票/收据 OCR</Text>
            <Text>拍照识别</Text>
          </View>
          <View className="extension-item" onClick={() => showComingSoon('AI 消费分析')}>
            <Text>AI 消费分析</Text>
            <Text>建议入口</Text>
          </View>
          <View className="extension-item" onClick={() => showComingSoon('语音记账')}>
            <Text>语音记账</Text>
            <Text>快速输入</Text>
          </View>
          <View className="extension-item" onClick={() => showComingSoon('家庭共享账本')}>
            <Text>家庭共享账本</Text>
            <Text>多人协作</Text>
          </View>
        </View>
      </View>

      <BottomNav active="profile" />
    </View>
  )
}
