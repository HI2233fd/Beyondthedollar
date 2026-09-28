import { BUILDINGS } from '../cityLayout'
import { businessOpen, type BusinessId } from '../life/day/schedule'

const HOURS: Record<string, BusinessId> = {
  bank: 'bank',
  grocery: 'grocery',
  office: 'office',
  cafe: 'cafe',
  college: 'college',
  high: 'high',
  motors: 'automart',
  kitchen: 'kitchen',
  lantern: 'lantern',
  clinic: 'clinic',
  workshop: 'workshop',
  commons: 'commons',
}

const HOURS_TEXT: Record<string, string> = {
  bank: 'Weekdays 9–5',
  grocery: '7–22 every day',
  office: 'Weekdays 8:30–18',
  cafe: '7–20 every day',
  college: 'Weekdays 7:30–15',
  high: 'Weekdays 7:30–15',
  automart: 'Weekdays 9–19',
  kitchen: '11–22 every day',
  lantern: '16–23 every day',
  clinic: 'Weekdays 8–18',
  workshop: '8–18 every day',
  commons: '9–21 every day',
}

export function openingLabel(buildingId: string, totalMinutes: number) {
  const id = HOURS[buildingId]
  if (!id) return 'Open'
  return businessOpen(id, totalMinutes) ? 'Open' : `Closed · ${HOURS_TEXT[id] ?? 'outside posted hours'}`
}

export function neighborhoodOf(id: string) {
  return BUILDINGS.find((b) => b.id === id)?.neighborhood ?? ''
}
