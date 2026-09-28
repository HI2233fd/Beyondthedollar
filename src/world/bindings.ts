export interface ControlBindings {
  forward: string
  back: string
  left: string
  right: string
  run: string
  interact: string
  phone: string
  map: string
  calendar: string
}

export const DEFAULT_BINDINGS: ControlBindings = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  run: 'ShiftLeft',
  interact: 'KeyE',
  phone: 'KeyP',
  map: 'KeyM',
  calendar: 'KeyT',
}
