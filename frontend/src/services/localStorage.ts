export const CYCLE_STORAGE_KEY = 'herhealth_cycle_data'
export const USER_PROFILE_STORAGE_KEY = 'herhealth_user_profile'

export type PeriodsRegular = 'yes' | 'no' | 'sometimes' | 'not_sure' | 'prefer_not_to_say'
export type PeriodPain = 'never' | 'rarely' | 'sometimes' | 'often' | 'almost_every_period' | 'prefer_not_to_say'
export type PeriodFlow = 'light' | 'medium' | 'heavy' | 'varies' | 'not_sure' | 'prefer_not_to_say'
export type CycleMoodChanges = 'never' | 'sometimes' | 'often' | 'almost_every_cycle' | 'not_sure' | 'prefer_not_to_say'
export type PregnancyStatus = 'no' | 'pregnant' | 'recently_postpartum' | 'prefer_not_to_say'

export interface UserProfile {
  anonymousId: string
  age?: number
  periodsRegular?: PeriodsRegular
  periodPain?: PeriodPain
  periodFlow?: PeriodFlow
  periodSymptoms?: string[]
  cycleMoodChanges?: CycleMoodChanges
  pregnancyStatus?: PregnancyStatus
  trackingPreferences?: string[]
  createdAt: string
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return typeof data.anonymousId === 'string' && /^HH-[A-Z0-9]{7}$/.test(data.anonymousId) && typeof data.createdAt === 'string'
}

function generateAnonymousId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = new Uint32Array(7)
  crypto.getRandomValues(values)
  return `HH-${Array.from(values, (value) => alphabet[value % alphabet.length]).join('')}`
}

export function getUserProfile(): UserProfile | null {
  try {
    const storedData = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (!storedData) return null
    const parsedData: unknown = JSON.parse(storedData)
    return isUserProfile(parsedData) ? parsedData : null
  } catch {
    return null
  }
}

export function hasUserProfile(): boolean {
  return getUserProfile() !== null
}

export function saveUserProfile(profile: Omit<UserProfile, 'anonymousId' | 'createdAt'> & Partial<Pick<UserProfile, 'anonymousId' | 'createdAt'>> = {}): UserProfile {
  const existing = getUserProfile()
  const savedProfile: UserProfile = {
    ...profile,
    anonymousId: existing?.anonymousId ?? profile.anonymousId ?? generateAnonymousId(),
    createdAt: existing?.createdAt ?? profile.createdAt ?? new Date().toISOString(),
  }
  try {
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(savedProfile))
  } catch {
    return savedProfile
  }
  return savedProfile
}

export function clearUserProfile(): void {
  try {
    window.localStorage.removeItem(USER_PROFILE_STORAGE_KEY)
  } catch {
    return
  }
}

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

export const WELLNESS_STORAGE_KEY = 'herhealth_wellness_data'
export const WELLNESS_MOODS = ['Happy', 'Neutral', 'Low', 'Anxious', 'Irritable', 'Tired', 'Energetic'] as const
export const SLEEP_QUALITIES = ['Poor', 'Fair', 'Good', 'Excellent'] as const
export const WELLNESS_APPETITES = ['Decreased', 'Normal', 'Increased'] as const
export type WellnessMood = typeof WELLNESS_MOODS[number]
export type SleepQuality = typeof SLEEP_QUALITIES[number]
export type WellnessAppetite = typeof WELLNESS_APPETITES[number]

export interface WellnessRecord {
  id: string
  date: string
  mood: WellnessMood
  energy: number
  sleepHours: number
  sleepQuality: SleepQuality
  appetite: WellnessAppetite
  notes?: string
}

export type WellnessPeriod = 'week' | 'month' | '3months' | '6months'

function isWellnessRecord(value: unknown): value is WellnessRecord {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return typeof data.id === 'string' && isValidDate(data.date) && isOneOf(data.mood, WELLNESS_MOODS) && typeof data.energy === 'number' && data.energy >= 1 && data.energy <= 5 && typeof data.sleepHours === 'number' && data.sleepHours >= 0 && data.sleepHours <= 24 && isOneOf(data.sleepQuality, SLEEP_QUALITIES) && isOneOf(data.appetite, WELLNESS_APPETITES) && (data.notes === undefined || typeof data.notes === 'string')
}

function readWellnessRecords(): WellnessRecord[] {
  try {
    const storedData = window.localStorage.getItem(WELLNESS_STORAGE_KEY)
    if (!storedData) return []
    const parsedData: unknown = JSON.parse(storedData)
    return Array.isArray(parsedData) ? parsedData.filter(isWellnessRecord) : []
  } catch {
    return []
  }
}

function writeWellnessRecords(records: WellnessRecord[]): void {
  try {
    window.localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(records))
  } catch {
    return
  }
}

export function getWellnessHistory(): WellnessRecord[] {
  return readWellnessRecords().sort((first, second) => second.date.localeCompare(first.date))
}

export function saveWellnessRecord(record: Omit<WellnessRecord, 'id'> | WellnessRecord): WellnessRecord {
  const savedRecord = 'id' in record ? record : { ...record, id: `wellness-${record.date}` }
  const records = readWellnessRecords().filter((item) => item.date !== savedRecord.date && item.id !== savedRecord.id)
  writeWellnessRecords([...records, savedRecord])
  return savedRecord
}

export function updateWellnessRecord(record: WellnessRecord): WellnessRecord {
  return saveWellnessRecord(record)
}

export function deleteWellnessRecord(id: string): void {
  writeWellnessRecords(readWellnessRecords().filter((record) => record.id !== id))
}

export function clearWellnessHistory(): void {
  try {
    window.localStorage.removeItem(WELLNESS_STORAGE_KEY)
  } catch {
    return
  }
}

export function getRecordsForPeriod(records: WellnessRecord[], period: WellnessPeriod, now = new Date()): WellnessRecord[] {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  let start = new Date(today)
  if (period === 'week') {
    start.setUTCDate(today.getUTCDate() - today.getUTCDay())
  } else if (period === 'month') {
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
  } else {
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (period === '3months' ? 2 : 5), 1))
  }
  const startKey = start.toISOString().slice(0, 10)
  const endKey = today.toISOString().slice(0, 10)
  return records.filter((record) => record.date >= startKey && record.date <= endKey)
}
