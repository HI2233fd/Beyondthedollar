import { useEffect, useRef } from 'react'
import { BACKGROUND, BUILDINGS, POIS, ROADS_EW, ROADS_NS, ROAD_HALF, WORLD } from '../cityLayout'
import { openingLabel } from './hours'
import { drivingPath, pedestrianPath } from './nav'

export type MapViewState = {
  px: number
  pz: number
  yaw: number
  destX?: number
  destZ?: number
  driving: boolean
  view?: { minX: number; maxX: number; minZ: number; maxZ: number }
}

const CATEGORY: Record<string, string> = {
  home: 'home',
  apartments: 'home',
  townhouse: 'home',
  bank: 'money',
  grocery: 'food',
  cafe: 'food',
  kitchen: 'food',
  high: 'learn',
  college: 'learn',
  clinic: 'health',
  motors: 'transit',
  fuel: 'transit',
}

function placeCategory(id: string) {
  if (id.startsWith('bus')) return 'transit'
  return CATEGORY[id] ?? 'work'
}

function project(x: number, z: number, view: { minX: number; maxX: number; minZ: number; maxZ: number }, w: number, h: number) {
  const nx = (x - view.minX) / (view.maxX - view.minX)
  const nz = (z - view.minZ) / (view.maxZ - view.minZ)
  return { x: nx * w, y: nz * h }
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: MapViewState,
  opts: { labels: boolean; windowed: boolean; minutes: number; filter: string },
) {
  const span = opts.windowed ? 72 : WORLD.maxX - WORLD.minX
  const view = state.view
    ? state.view
    : opts.windowed
      ? { minX: state.px - span / 2, maxX: state.px + span / 2, minZ: state.pz - span / 2, maxZ: state.pz + span / 2 }
      : { minX: WORLD.minX, maxX: WORLD.maxX, minZ: WORLD.minZ, maxZ: WORLD.maxZ }

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#1a3328'
  ctx.fillRect(0, 0, w, h)

  const roadPaint = (x: number, z: number, rw: number, rd: number) => {
    const a = project(x - rw / 2, z - rd / 2, view, w, h)
    const b = project(x + rw / 2, z + rd / 2, view, w, h)
    ctx.fillStyle = '#3d4a44'
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y)
    ctx.fillStyle = '#5c6b62'
    ctx.fillRect(a.x, a.y, b.x - a.x, Math.max(1, (b.y - a.y) * 0.12))
  }
  for (const z of ROADS_EW) roadPaint(0, z, WORLD.maxX - WORLD.minX, ROAD_HALF * 2)
  for (const x of ROADS_NS) roadPaint(x, 0, ROAD_HALF * 2, WORLD.maxZ - WORLD.minZ)

  const footprint = (x: number, z: number, bw: number, bd: number, fill: string) => {
    const a = project(x - bw / 2, z - bd / 2, view, w, h)
    const b = project(x + bw / 2, z + bd / 2, view, w, h)
    ctx.fillStyle = fill
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y)
  }
  for (const b of BACKGROUND) footprint(b.x, b.z, b.w, b.d, '#243044')
  for (const b of BUILDINGS) {
    const cat = placeCategory(b.id)
    if (opts.filter !== 'all' && cat !== opts.filter) continue
    const closed = openingLabel(b.id, opts.minutes).startsWith('Closed')
    footprint(b.x, b.z, b.w, b.d, closed ? '#4b5563' : b.accent)
    if (opts.labels && w > 280) {
      const p = project(b.x, b.z, view, w, h)
      ctx.fillStyle = '#f8fafc'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(b.name, p.x, p.y)
    }
    const door = project(b.x, b.z + b.facing * (b.d / 2), view, w, h)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(door.x - 2, door.y - 2, 4, 4)
  }

  const pois = [
    { id: 'garden', ...POIS.garden },
    { id: 'stall', ...POIS.stall },
    { id: 'fuel', ...POIS.fuel },
    { id: 'fountain', ...POIS.fountain },
    ...POIS.buses,
  ]
  for (const p of pois) {
    if (opts.filter !== 'all' && placeCategory(p.id) !== opts.filter && opts.filter !== 'transit') continue
    const pt = project(p.x, p.z, view, w, h)
    ctx.strokeStyle = '#d6d3d1'
    ctx.strokeRect(pt.x - 4, pt.y - 4, 8, 8)
  }

  if (state.destX != null && state.destZ != null) {
    const route = state.driving
      ? drivingPath(state.px, state.pz, state.destX, state.destZ)
      : pedestrianPath(state.px, state.pz, state.destX, state.destZ)
    if (route && route.length > 1) {
      ctx.beginPath()
      route.forEach((p, i) => {
        const q = project(p.x, p.z, view, w, h)
        if (i === 0) ctx.moveTo(q.x, q.y)
        else ctx.lineTo(q.x, q.y)
      })
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    const pin = project(state.destX, state.destZ, view, w, h)
    const inside = pin.x >= 0 && pin.y >= 0 && pin.x <= w && pin.y <= h
    const px = inside ? pin.x : Math.min(w - 10, Math.max(10, pin.x))
    const py = inside ? pin.y : Math.min(h - 10, Math.max(10, pin.y))
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.moveTo(px, py - 8)
    ctx.lineTo(px + 6, py + 6)
    ctx.lineTo(px - 6, py + 6)
    ctx.fill()
  }

  const you = project(state.px, state.pz, view, w, h)
  ctx.save()
  ctx.translate(you.x, you.y)
  ctx.rotate(state.yaw)
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.lineTo(5, -6)
  ctx.lineTo(-5, -6)
  ctx.fill()
  ctx.restore()
  if (opts.labels) {
    ctx.fillStyle = '#ecfeff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('You', you.x + 8, you.y - 6)
    ctx.fillText('N', 8, 14)
  }
}

export function MapCanvas({
  read,
  labels,
  windowed,
  minutes,
  filter,
  className,
}: {
  read: () => MapViewState
  labels: boolean
  windowed: boolean
  minutes: number
  filter: string
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const readRef = useRef(read)
  readRef.current = read

  useEffect(() => {
    let raf = 0
    const draw = () => {
      const canvas = ref.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) drawWorld(ctx, canvas.width, canvas.height, readRef.current(), { labels, windowed, minutes, filter })
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [labels, windowed, minutes, filter])

  return <canvas ref={ref} width={windowed ? 168 : 640} height={windowed ? 168 : 480} className={className} />
}
