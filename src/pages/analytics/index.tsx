import { Canvas, Picker, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useReady } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getCategoryTotals,
  getDashboardStats,
  getMonthRecords,
  getMonthlyTrend,
  getYearRecords,
  loadState
} from '@/store/finance'
import { FinanceState, RecordType } from '@/types'
import { clampPercent, formatMoney } from '@/utils/format'
import './index.scss'

const tabLabels = ['支出', '收入']
const rangeLabels = ['月度', '年度']

export default function AnalyticsPage() {
  const [state, setState] = useState<FinanceState>(() => loadState())
  const [type, setType] = useState<RecordType>('expense')
  const [rangeIndex, setRangeIndex] = useState(0)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [year, setYear] = useState(new Date().toISOString().slice(0, 4))

  useDidShow(() => setState(loadState()))

  const records = useMemo(
    () => (rangeIndex === 0 ? getMonthRecords(state, month) : getYearRecords(state, year)),
    [month, rangeIndex, state, year]
  )

  const stats = useMemo(() => {
    if (rangeIndex === 0) return getDashboardStats(state, month)

    const expense = records.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
    const income = records.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)

    return {
      expense,
      income,
      balance: income - expense,
      budgetUsage: 0,
      totalBudget: 0,
      records
    }
  }, [month, rangeIndex, records, state])

  const categoryTotals = useMemo(() => getCategoryTotals(state, records, type), [records, state, type])
  const trend = useMemo(() => getMonthlyTrend(state), [state])

  const drawCharts = useCallback(() => {
    drawPie(categoryTotals.map((item) => ({ value: item.total, color: item.category.color })))
    drawTrend(trend)
  }, [categoryTotals, trend])

  useReady(() => setTimeout(drawCharts, 100))

  useEffect(() => {
    setTimeout(drawCharts, 100)
  }, [drawCharts])

  return (
    <View className="page analytics-page">
      <View className="top-title">
        <Text className="brand">统计报表</Text>
        <Picker
          mode="selector"
          range={rangeLabels}
          value={rangeIndex}
          onChange={(event) => setRangeIndex(Number(event.detail.value))}
        >
          <View className="ghost-button">{rangeLabels[rangeIndex]}</View>
        </Picker>
      </View>

      <View className="analytics-filter">
        <View className="segment">
          {tabLabels.map((label, index) => {
            const value: RecordType = index === 0 ? 'expense' : 'income'
            return (
              <View
                key={label}
                className={`segment__item ${type === value ? 'segment__item--active' : ''}`}
                onClick={() => setType(value)}
              >
                {label}
              </View>
            )
          })}
        </View>

        {rangeIndex === 0 ? (
          <Picker mode="date" fields="month" value={month} onChange={(event) => setMonth(String(event.detail.value))}>
            <View className="period-card">
              <Text className="caption">分析周期</Text>
              <Text>{month}</Text>
            </View>
          </Picker>
        ) : (
          <Picker mode="date" fields="year" value={year} onChange={(event) => setYear(String(event.detail.value))}>
            <View className="period-card">
              <Text className="caption">分析周期</Text>
              <Text>{year}</Text>
            </View>
          </Picker>
        )}
      </View>

      <View className="chart-card">
        <View className="row space-between chart-card__head">
          <Text className="section-title">分类占比</Text>
          <Text className="amount-positive">
            合计 {formatMoney(type === 'expense' ? stats.expense : stats.income, state.settings.currency)}
          </Text>
        </View>
        <View className="pie-layout">
          <View className="pie-wrap">
            <Canvas canvasId="pieCanvas" className="pie-canvas" />
            <View className="pie-center">
              <Text>最大项</Text>
              <Text>{categoryTotals[0]?.category.name || '暂无'}</Text>
            </View>
          </View>
          <View className="legend-list">
            {categoryTotals.slice(0, 4).map((item) => {
              const base = type === 'expense' ? stats.expense : stats.income
              return (
                <View key={item.category.id} className="legend-item">
                  <View className="legend-dot" style={{ background: item.category.color }} />
                  <Text>{item.category.name}</Text>
                  <Text>{clampPercent((item.total / (base || 1)) * 100).toFixed(0)}%</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      <View className="chart-card">
        <View className="row space-between chart-card__head">
          <Text className="section-title">收支趋势</Text>
          <View className="trend-legend">
            <Text className="trend-legend__in">收入</Text>
            <Text className="trend-legend__out">支出</Text>
          </View>
        </View>
        <Canvas canvasId="trendCanvas" className="trend-canvas" />
        <View className="trend-months">
          {trend.map((item) => (
            <Text key={item.month}>{item.month}</Text>
          ))}
        </View>
      </View>

      <View className="top-list">
        <View className="row space-between top-list__head">
          <Text className="section-title">高频分类</Text>
          <Text className="caption">按金额排序</Text>
        </View>
        {categoryTotals.slice(0, 5).map((item) => {
          const base = type === 'expense' ? stats.expense : stats.income
          const percent = clampPercent((item.total / (base || 1)) * 100)
          return (
            <View key={item.category.id} className="top-item">
              <View
                className="top-item__icon"
                style={{ color: item.category.color, background: `${item.category.color}1a` }}
              >
                {item.category.icon}
              </View>
              <View className="top-item__body">
                <View className="row space-between">
                  <Text>{item.category.name}</Text>
                  <Text>{formatMoney(item.total, state.settings.currency)}</Text>
                </View>
                <View className="progress-track">
                  <View className="progress-bar" style={{ width: `${percent}%`, background: item.category.color }} />
                </View>
              </View>
            </View>
          )
        })}
      </View>

      <BottomNav active="analytics" />
    </View>
  )
}

type CanvasCtx = ReturnType<typeof Taro.createCanvasContext>

function drawPie(items: Array<{ value: number; color: string }>) {
  const ctx = Taro.createCanvasContext('pieCanvas')
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  let start = -Math.PI / 2

  ctx.clearRect(0, 0, 220, 220)
  items.forEach((item) => {
    const angle = (item.value / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(110, 110)
    ctx.arc(110, 110, 88, start, start + angle)
    ctx.setFillStyle(item.color)
    ctx.fill()
    start += angle
  })

  ctx.beginPath()
  ctx.arc(110, 110, 54, 0, Math.PI * 2)
  ctx.setFillStyle('#ffffff')
  ctx.fill()
  ctx.draw()
}

function drawTrend(rows: Array<{ month: string; income: number; expense: number }>) {
  const ctx = Taro.createCanvasContext('trendCanvas')
  const width = 320
  const height = 150
  const padding = 18
  const max = Math.max(...rows.map((item) => Math.max(item.income, item.expense)), 1)

  ctx.clearRect(0, 0, width, height)
  ctx.setStrokeStyle('#dce5d9')
  ctx.setLineWidth(1)

  for (let i = 1; i <= 3; i += 1) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  drawLine(
    ctx,
    rows.map((item) => item.income),
    max,
    '#006d33',
    width,
    height,
    padding
  )
  drawLine(
    ctx,
    rows.map((item) => item.expense),
    max,
    '#ba1a1a',
    width,
    height,
    padding
  )
  ctx.draw()
}

function drawLine(
  ctx: CanvasCtx,
  values: number[],
  max: number,
  color: string,
  width: number,
  height: number,
  padding: number
) {
  ctx.beginPath()
  ctx.setStrokeStyle(color)
  ctx.setLineWidth(2)
  values.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1)
    const y = height - padding - (value / max) * (height - padding * 2)
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
}
