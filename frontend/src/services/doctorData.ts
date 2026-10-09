import type { ConsultationType } from './localStorage'

export interface DemoDoctor {
  id: string
  name: string
  initials: string
  color: string
  specialization: string
  qualifications: string
  experience: number
  rating: number
  reviews: number
  bio: string
  duration: number
  coins: number
  consultationTypes: ConsultationType[]
  availability: { date: string; slots: string[] }[]
}

export const DEMO_DOCTORS: DemoDoctor[] = [
  { id: 'dr-ananya', name: 'Dr. Ananya Rao', initials: 'AR', color: '#dcefe5', specialization: 'Gynecology', qualifications: 'MBBS, MD (OB-GYN)', experience: 12, rating: 4.9, reviews: 128, bio: 'A warm, practical approach to menstrual health, preventive care, and common gynecological concerns.', duration: 30, coins: 120, consultationTypes: ['chat', 'video'], availability: [{ date: '2026-10-12', slots: ['10:00 AM', '2:30 PM', '5:00 PM'] }, { date: '2026-10-14', slots: ['11:00 AM', '4:00 PM'] }] },
  { id: 'dr-meera', name: 'Dr. Meera Iyer', initials: 'MI', color: '#fce7ed', specialization: 'Reproductive Health', qualifications: 'MBBS, DNB (Reproductive Medicine)', experience: 9, rating: 4.8, reviews: 96, bio: 'Supports patients with fertility questions, hormonal health, and informed reproductive choices.', duration: 45, coins: 180, consultationTypes: ['video', 'chat'], availability: [{ date: '2026-10-13', slots: ['9:30 AM', '1:00 PM'] }, { date: '2026-10-16', slots: ['3:00 PM', '6:30 PM'] }] },
  { id: 'dr-sara', name: 'Dr. Sara Thomas', initials: 'ST', color: '#e9e5fb', specialization: 'Mental Wellness', qualifications: 'MA Clinical Psychology, RCI', experience: 8, rating: 4.9, reviews: 74, bio: 'Offers a calm, non-judgmental space for stress, body image, mood, and life transitions.', duration: 45, coins: 150, consultationTypes: ['chat', 'video'], availability: [{ date: '2026-10-11', slots: ['12:00 PM', '7:00 PM'] }, { date: '2026-10-15', slots: ['10:30 AM', '2:00 PM'] }] },
  { id: 'dr-kavya', name: 'Dr. Kavya Menon', initials: 'KM', color: '#fff0d9', specialization: 'Dermatology', qualifications: 'MBBS, MD (Dermatology)', experience: 10, rating: 4.7, reviews: 83, bio: 'Helps with acne, pigmentation, hair changes, and skin concerns connected to hormonal shifts.', duration: 30, coins: 130, consultationTypes: ['chat', 'video'], availability: [{ date: '2026-10-12', slots: ['9:00 AM', '1:30 PM'] }, { date: '2026-10-17', slots: ['11:30 AM', '4:30 PM'] }] },
  { id: 'dr-rhea', name: 'Rhea Kapoor, RD', initials: 'RK', color: '#e4f0f4', specialization: 'Nutrition', qualifications: 'MSc Nutrition, Registered Dietitian', experience: 7, rating: 4.8, reviews: 61, bio: 'Evidence-informed nutrition coaching for energy, cycle-aware eating, and sustainable routines.', duration: 30, coins: 100, consultationTypes: ['chat', 'video'], availability: [{ date: '2026-10-13', slots: ['10:00 AM', '5:30 PM'] }, { date: '2026-10-18', slots: ['9:00 AM', '12:30 PM'] }] },
  { id: 'dr-nisha', name: 'Dr. Nisha Verma', initials: 'NV', color: '#f5e6df', specialization: 'Gynecology', qualifications: 'MBBS, MS (OB-GYN)', experience: 15, rating: 4.9, reviews: 142, bio: 'Experienced in period pain, PCOS education, and helping patients prepare for in-person care.', duration: 30, coins: 140, consultationTypes: ['video', 'chat'], availability: [{ date: '2026-10-14', slots: ['8:30 AM', '12:00 PM'] }, { date: '2026-10-19', slots: ['3:30 PM', '6:00 PM'] }] },
]
