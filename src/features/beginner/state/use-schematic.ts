import { useMemo, useReducer } from 'react'
import type { AnyPart, ComponentType, Lesson, PlacedComponent, SolveResult, Verdict, Wire } from '../engine/types'
import { LIB } from '../data/symbols'
import { PARTS } from '../data/parts'
import { solve } from '../engine/solver'
import { GRID, snap } from '../engine/netlist'

export interface SchematicUiState {
  comps: PlacedComponent[]
  wires: Wire[]
  sel: string | null
  pinSel: string | null
  placing: ComponentType | null
  nextId: Record<string, number>
}

type Action =
  | { type: 'RESET'; preset: Lesson['preset'] }
  | { type: 'START_PLACING'; kind: ComponentType }
  | { type: 'CANCEL_PLACING' }
  | { type: 'PLACE_AT'; x: number; y: number }
  | { type: 'SELECT'; id: string | null }
  | { type: 'PIN_CLICK'; pin: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'ROTATE'; id: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'UNDO_WIRE' }
  | { type: 'TOGGLE_SWITCH'; id: string }
  | { type: 'SET_PART'; id: string; part: AnyPart }

const clampX = (x: number) => Math.max(60, Math.min(660, x))
const clampY = (y: number) => Math.max(60, Math.min(400, y))

function initState(preset: Lesson['preset']): SchematicUiState {
  return {
    comps: (preset || []).map((p) => ({ id: p.id, type: p.type, x: p.x, y: p.y, rot: p.rot ?? 0 })),
    wires: [],
    sel: null,
    pinSel: null,
    placing: null,
    nextId: {},
  }
}

function reducer(state: SchematicUiState, action: Action): SchematicUiState {
  switch (action.type) {
    case 'RESET':
      return initState(action.preset)
    case 'START_PLACING':
      return { ...state, placing: state.placing === action.kind ? null : action.kind, pinSel: null }
    case 'CANCEL_PLACING':
      return { ...state, placing: null, pinSel: null }
    case 'PLACE_AT': {
      if (!state.placing) return state
      const def = LIB[state.placing]
      const nextId = { ...state.nextId }
      const seq = (nextId[def.ref] = (nextId[def.ref] || 0) + 1)
      const id = def.ref + seq
      const comp: PlacedComponent = {
        id,
        type: state.placing,
        x: clampX(snap(action.x)),
        y: clampY(snap(action.y)),
        rot: 0,
        ...(def.db ? { part: PARTS[def.db][0] as AnyPart } : {}),
        ...(state.placing === 'SW' ? { closed: false } : {}),
      }
      return { ...state, comps: [...state.comps, comp], sel: id, placing: null, nextId }
    }
    case 'SELECT':
      return { ...state, sel: action.id, pinSel: null }
    case 'PIN_CLICK': {
      if (state.pinSel === action.pin) return { ...state, pinSel: null }
      if (!state.pinSel) return { ...state, pinSel: action.pin, sel: null }
      const a = state.pinSel
      const b = action.pin
      const sameComp = a.split('.')[0] === b.split('.')[0]
      const exists = state.wires.some((w) => (w.a === a && w.b === b) || (w.a === b && w.b === a))
      const wires = !sameComp && !exists ? [...state.wires, { a, b }] : state.wires
      return { ...state, wires, pinSel: null }
    }
    case 'MOVE': {
      const nx = clampX(snap(action.x))
      const ny = clampY(snap(action.y))
      return {
        ...state,
        comps: state.comps.map((c) => (c.id === action.id ? { ...c, x: nx, y: ny } : c)),
      }
    }
    case 'ROTATE':
      return {
        ...state,
        comps: state.comps.map((c) => (c.id === action.id ? { ...c, rot: ((c.rot || 0) + 90) % 360 } : c)),
      }
    case 'DELETE_SELECTED': {
      if (!state.sel) return state
      const id = state.sel
      return {
        ...state,
        comps: state.comps.filter((c) => c.id !== id),
        wires: state.wires.filter((w) => w.a.split('.')[0] !== id && w.b.split('.')[0] !== id),
        sel: null,
      }
    }
    case 'UNDO_WIRE':
      return { ...state, wires: state.wires.slice(0, -1) }
    case 'TOGGLE_SWITCH':
      return {
        ...state,
        comps: state.comps.map((c) => (c.id === action.id && c.type === 'SW' ? { ...c, closed: !c.closed } : c)),
      }
    case 'SET_PART':
      return {
        ...state,
        comps: state.comps.map((c) => (c.id === action.id ? { ...c, part: action.part } : c)),
      }
    default:
      return state
  }
}

export interface UseSchematicResult {
  state: SchematicUiState
  dispatch: React.Dispatch<Action>
  sim: SolveResult
  verdicts: Verdict[]
}

/** Grid snap step, exported for the canvas's click→world coordinate math. */
export { GRID }

export function useSchematic(lesson: Lesson): UseSchematicResult {
  const [state, dispatch] = useReducer(reducer, lesson.preset, initState)
  const sim = useMemo(() => solve(state.comps, state.wires), [state.comps, state.wires])
  const verdicts = useMemo(
    () => (lesson.check ? lesson.check(sim, { comps: state.comps, wires: state.wires }) : []),
    [lesson, sim, state.comps, state.wires],
  )
  return { state, dispatch, sim, verdicts }
}
