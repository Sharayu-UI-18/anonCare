import { getCycleData, getWellnessHistory, type WellnessRecord } from './localStorage'

export const CONTEXT_OPT_IN_KEY = 'herhealth_share_context_optin'

export interface PersonalContext {
  cycle_phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown'
  cycle_day: number | null
  sleep_level: 'low' | 'typical' | 'good' | 'unknown'
  energy_level: 'low' | 'moderate' | 'high' | 'unknown'
  mood_trend: 'low' | 'mixed' | 'positive' | 'unknown'
}

export function getContextOptIn(): boolean {
  try {
    return window.localStorage.getItem(CONTEXT_OPT_IN_KEY) === 'true'
  } catch {
    return false
  }
}

export function setContextOptIn(value: boolean): void {
  try {
    if (value) window.localStorage.setItem(CONTEXT_OPT_IN_KEY, 'true')
    else window.localStorage.removeItem(CONTEXT_OPT_IN_KEY)
  } catch {
    return
  }
}

const DAY_MS = 86_400_000

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

function recentWeek(records: WellnessRecord[], now: Date): WellnessRecord[] {
  const end = now.toISOString().slice(0, 10)
  const start = new Date(now.getTime() - 6 * DAY_MS).toISOString().slice(0, 10)
  return records.filter((record) => record.date >= start && record.date <= end)
}

/** Builds coarse, derived features on-device. No dates, ids, notes or raw logs are included. */
export function buildPersonalContext(now = new Date()): PersonalContext {
  const context: PersonalContext = { cycle_phase: 'unknown', cycle_day: null, sleep_level: 'unknown', energy_level: 'unknown', mood_trend: 'unknown' }

  const cycle = getCycleData()
  if (cycle) {
    const start = Date.parse(`${cycle.startDate}T00:00:00Z`)
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const day = Math.floor((today - start) / DAY_MS) + 1
    if (day >= 1 && day <= 60) {
      context.cycle_day = day
      const length = Math.max(cycle.cycleLength, day)
      if (day <= cycle.periodLength) context.cycle_phase = 'menstrual'
      else if (day < length - 16) context.cycle_phase = 'follicular'
      else if (day <= length - 12) context.cycle_phase = 'ovulatory'
      else context.cycle_phase = 'luteal'
    }
  }

  const week = recentWeek(getWellnessHistory(), now)
  const sleep = average(week.map((record) => record.sleepHours))
  if (sleep !== null) context.sleep_level = sleep < 6 ? 'low' : sleep < 7.5 ? 'typical' : 'good'
  const energy = average(week.map((record) => record.energy))
  if (energy !== null) context.energy_level = energy < 2.5 ? 'low' : energy < 3.75 ? 'moderate' : 'high'
  if (week.length) {
    const negative = week.filter((record) => ['Low', 'Anxious', 'Irritable', 'Tired'].includes(record.mood)).length / week.length
    const positive = week.filter((record) => ['Happy', 'Energetic'].includes(record.mood)).length / week.length
    context.mood_trend = negative >= 0.5 ? 'low' : positive >= 0.5 ? 'positive' : 'mixed'
  }
  return context
}
