import { useMemo, useReducer } from 'react'
import type { BoardDef, PcbLessonKind, PcbState, PlacedComponent, SolveResult, Verdict } from '../engine/types'
import { BOARDS, FP, allPads, initPcb, nearP, runDRC, snap45 } from '../engine/pcb'

type Action =
  | { type: 'RESET' }
  | { type: 'SELECT'; id: string | null }
  | { type: 'MOVE_PART'; id: string; mmX: number; mmY: number }
  | { type: 'PAD_CLICK'; padKey: string }
  | { type: 'ROUTE_POINT'; mm: { x: number; y: number } }
  | { type: 'ROUTE_CURSOR'; mm: { x: number; y: number } }
  | { type: 'CANCEL_ROUTE' }
  | { type: 'UNDO_TRACE' }
  | { type: 'SET_WIDTH'; width: number }

export interface UsePcbResult {
  pcb: PcbState
  board: BoardDef
  dispatch: React.Dispatch<Action>
  drc: Verdict[]
}

function reducer(
  state: PcbState,
  action: Action,
  ctx: { kind: PcbLessonKind; board: BoardDef; schComps: PlacedComponent[]; schSim: SolveResult | null },
): PcbState {
  switch (action.type) {
    case 'RESET':
      return initPcb(ctx.kind, ctx.schComps, ctx.schSim)
    case 'SELECT':
      return { ...state, sel: action.id }
    case 'MOVE_PART': {
      const pt = state.parts.find((p) => p.id === action.id)
      if (!pt) return state
      const f = FP[pt.fp]
      const q = (v: number) => Math.round(v * 2) / 2
      const nx = Math.max(f.body[0] / 2 + 0.5, Math.min(ctx.board.w - f.body[0] / 2 - 0.5, q(action.mmX)))
      const ny = Math.max(f.body[1] / 2 + 0.5, Math.min(ctx.board.h - f.body[1] / 2 - 0.5, q(action.mmY)))
      const parts = state.parts.map((p) => (p.id === action.id ? { ...p, x: nx, y: ny } : p))
      const moved = { ...state, parts }
      const pads = allPads(moved)
      const traces = state.traces.filter(
        (t) => pads.some((z) => nearP(z, t.pts[0])) && pads.some((z) => nearP(z, t.pts[t.pts.length - 1])),
      )
      return { ...moved, traces, sel: action.id }
    }
    case 'PAD_CLICK': {
      const pad = allPads(state).find((p) => p.key === action.padKey)
      if (!pad || !pad.net) return state
      if (!state.routing) {
        return { ...state, routing: { net: pad.net, pts: [{ x: pad.x, y: pad.y }], cur: null } }
      }
      if (pad.net !== state.routing.net) return state
      if (state.routing.pts.length === 1 && nearP(pad, state.routing.pts[0])) {
        return { ...state, routing: null }
      }
      const pts = [...state.routing.pts, { x: pad.x, y: pad.y }]
      return {
        ...state,
        traces: [...state.traces, { net: state.routing.net, width: state.width, pts }],
        routing: null,
      }
    }
    case 'ROUTE_POINT': {
      if (!state.routing) return state
      const anchor = state.routing.pts[state.routing.pts.length - 1]
      return { ...state, routing: { ...state.routing, pts: [...state.routing.pts, snap45(anchor, action.mm)] } }
    }
    case 'ROUTE_CURSOR': {
      if (!state.routing) return state
      const anchor = state.routing.pts[state.routing.pts.length - 1]
      return { ...state, routing: { ...state.routing, cur: snap45(anchor, action.mm) } }
    }
    case 'CANCEL_ROUTE':
      return { ...state, routing: null }
    case 'UNDO_TRACE':
      return { ...state, traces: state.traces.slice(0, -1) }
    case 'SET_WIDTH':
      return { ...state, width: action.width }
    default:
      return state
  }
}

export function usePcb(kind: PcbLessonKind, schComps: PlacedComponent[], schSim: SolveResult | null): UsePcbResult {
  const board = BOARDS[kind]
  const ctx = { kind, board, schComps, schSim }
  const [pcb, dispatch] = useReducer(
    (s: PcbState, a: Action) => reducer(s, a, ctx),
    undefined,
    () => initPcb(kind, schComps, schSim),
  )
  const drc = useMemo(() => runDRC(pcb), [pcb])
  return { pcb, board, dispatch, drc }
}
