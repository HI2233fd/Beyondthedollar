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

export function openingLabel(buildingId: string, totalMinutes: number) {
  const id = HOURS[buildingId]
  if (!id) return 'Open'
  return businessOpen(id, totalMinutes) ? 'Open' : 'Closed'
}

export function neighborhoodOf(id: string) {
  return BUILDINGS.find((b) => b.id === id)?.neighborhood ?? ''
}
