export const CYCLE_STORAGE_KEY = 'herhealth_cycle_data'

export const FLOW_OPTIONS = ['Light', 'Medium', 'Heavy', 'Very heavy'] as const
export const PAIN_OPTIONS = ['None', 'Mild', 'Moderate', 'Severe'] as const
export const MOOD_OPTIONS = ['Happy', 'Neutral', 'Low', 'Irritable', 'Anxious', 'Tired', 'Energetic'] as const
export const APPETITE_OPTIONS = ['Normal', 'Increased', 'Decreased'] as const
export const CRAVING_OPTIONS = ['Sweet', 'Salty', 'Spicy', 'None'] as const
export const SYMPTOM_OPTIONS = ['Cramps', 'Headache', 'Back pain', 'Bloating', 'Breast tenderness', 'Acne', 'Nausea', 'Fatigue'] as const

export type Flow = typeof FLOW_OPTIONS[number]
export type Pain = typeof PAIN_OPTIONS[number]
export type Mood = typeof MOOD_OPTIONS[number]
export type Appetite = typeof APPETITE_OPTIONS[number]
export type Craving = typeof CRAVING_OPTIONS[number]
export type PhysicalSymptom = typeof SYMPTOM_OPTIONS[number]

export interface CycleRecord {
  id: string
  startDate: string
  endDate: string
  cycleLength: number
  periodLength: number
  flow?: Flow
  pain?: Pain
  mood?: Mood[]
  appetite?: Appetite
  cravings?: Craving[]
  symptoms?: PhysicalSymptom[]
  weight?: number
}

export type CycleData = CycleRecord

interface LegacyCycleData {
  lastPeriodStart: string
  lastPeriodEnd: string
  averageCycleLength: number
  averagePeriodLength: number
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === 'string' && options.includes(value)
}

function isArrayOf<T extends readonly string[]>(value: unknown, options: T): value is T[number][] {
  return Array.isArray(value) && value.every((item) => isOneOf(item, options))
}

function isCycleRecord(value: unknown): value is CycleRecord {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return typeof data.id === 'string' && isValidDate(data.startDate) && isValidDate(data.endDate) && typeof data.cycleLength === 'number' && Number.isFinite(data.cycleLength) && data.cycleLength > 0 && typeof data.periodLength === 'number' && Number.isFinite(data.periodLength) && data.periodLength > 0 && (data.flow === undefined || isOneOf(data.flow, FLOW_OPTIONS)) && (data.pain === undefined || isOneOf(data.pain, PAIN_OPTIONS)) && (data.mood === undefined || isArrayOf(data.mood, MOOD_OPTIONS)) && (data.appetite === undefined || isOneOf(data.appetite, APPETITE_OPTIONS)) && (data.cravings === undefined || isArrayOf(data.cravings, CRAVING_OPTIONS)) && (data.symptoms === undefined || isArrayOf(data.symptoms, SYMPTOM_OPTIONS)) && (data.weight === undefined || (typeof data.weight === 'number' && Number.isFinite(data.weight) && data.weight >= 0))
}

function fromLegacyData(value: unknown): CycleRecord | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Partial<LegacyCycleData>
  if (!isValidDate(data.lastPeriodStart) || !isValidDate(data.lastPeriodEnd) || typeof data.averageCycleLength !== 'number' || typeof data.averagePeriodLength !== 'number' || data.averageCycleLength <= 0 || data.averagePeriodLength <= 0) return null
  return { id: `cycle-${data.lastPeriodStart}`, startDate: data.lastPeriodStart, endDate: data.lastPeriodEnd, cycleLength: data.averageCycleLength, periodLength: data.averagePeriodLength }
}

function readRecords(): CycleRecord[] {
  try {
    const storedData = window.localStorage.getItem(CYCLE_STORAGE_KEY)
    if (!storedData) return []
    const parsedData: unknown = JSON.parse(storedData)
    if (Array.isArray(parsedData)) return parsedData.filter(isCycleRecord)
    const migratedRecord = fromLegacyData(parsedData)
    return migratedRecord ? [migratedRecord] : []
  } catch {
    return []
  }
}

function writeRecords(records: CycleRecord[]): void {
  try {
    window.localStorage.setItem(CYCLE_STORAGE_KEY, JSON.stringify(records))
  } catch {
    return
  }
}

export function getCycleRecords(): CycleRecord[] {
  return readRecords().sort((first, second) => second.startDate.localeCompare(first.startDate))
}

export function saveCycleRecord(record: Omit<CycleRecord, 'id'> | CycleRecord): CycleRecord {
  const savedRecord = 'id' in record ? record : { ...record, id: `cycle-${record.startDate}-${Date.now()}` }
  const records = readRecords().filter((item) => item.id !== savedRecord.id)
  writeRecords([...records, savedRecord])
  return savedRecord
}

export function deleteCycleRecord(id: string): void {
  writeRecords(readRecords().filter((record) => record.id !== id))
}

export function clearCycleData(): void {
  try {
    window.localStorage.removeItem(CYCLE_STORAGE_KEY)
  } catch {
    return
  }
}

export function getCycleData(): CycleRecord | null {
  return getCycleRecords()[0] ?? null
}

export function saveCycleData(data: CycleRecord): void {
  saveCycleRecord(data)
}
