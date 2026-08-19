/**
 * Shared types for the beginner-path circuit engine.
 *
 * This engine is a TypeScript port of a real MNA (modified nodal analysis)
 * SPICE-style DC/transient solver, a schematic netlist extractor, a PCB
 * DRC checker and an RS-274X Gerber writer. All functions here are pure:
 * they take component/wire arrays as input and return fresh results, so
 * React owns all mutable state (see `state/schematic-store.ts`).
 */

export type ComponentType = 'R' | 'LED' | 'C' | 'SW' | 'L' | 'D' | 'Q' | 'IO' | 'VCC' | 'V33' | 'GND'

/** Category keys into the PARTS catalog. Fixed-net symbols (VCC/V33/GND) have no catalog entry. */
export type PartCategory = 'R' | 'LED' | 'C' | 'L' | 'D' | 'SW' | 'Q' | 'IO'

export type SpecTuple = [label: string, value: string]

export interface BasePart {
  mpn: string
  mfr: string
  pkg: string
  spec: SpecTuple[]
  amr: SpecTuple[]
}

export interface ResistorPart extends BasePart {
  R: number
}
export interface LedPart extends BasePart {
  Vf: number
  col: string
  tag: 'red' | 'green' | 'blue'
}
export interface CapacitorPart extends BasePart {
  C: number
}
export interface InductorPart extends BasePart {
  L: number
  Rs: number
}
export interface DiodePart extends BasePart {
  Vfd: number
}
export type SwitchPart = BasePart
export interface MosfetPart extends BasePart {
  Vth: number
  Ron: number
  Vbr: number
}
export type IoPart = BasePart

export type AnyPart =
  | ResistorPart
  | LedPart
  | CapacitorPart
  | InductorPart
  | DiodePart
  | SwitchPart
  | MosfetPart
  | IoPart

export interface PartsDb {
  R: ResistorPart[]
  LED: LedPart[]
  C: CapacitorPart[]
  L: InductorPart[]
  D: DiodePart[]
  SW: SwitchPart[]
  Q: MosfetPart[]
  IO: IoPart[]
}

/** A pin position, local to the component's own (unrotated) coordinate frame. */
export interface SymbolPin {
  n: string
  x: number
  y: number
}

export interface SymbolDef {
  label: string
  ref: string
  /** category key into PARTS, or null for fixed-net power symbols */
  db: PartCategory | null
  pins: SymbolPin[]
  /** power symbols (VCC/V33/GND): fixed net, cannot be placed twice with different values */
  fixed?: true
  net?: string
  v?: number
}

/** A component placed on the schematic canvas. */
export interface PlacedComponent {
  id: string
  type: ComponentType
  x: number
  y: number
  rot: number
  part?: AnyPart
  /** SW only */
  closed?: boolean
}

/** "compId.pinName" endpoints, exactly like the original engine's wire keys. */
export interface Wire {
  a: string
  b: string
}

export interface Net {
  name: string
  pins: string[]
}

export interface NetlistResult {
  nets: Net[]
  pinNet: Record<string, string>
}

/** One backward-Euler timestep's carried state: previous capacitor voltages / inductor currents. */
export interface TransientCtx {
  h: number
  vc: Record<string, number>
  il: Record<string, number>
}

export interface SolveOptions {
  tr?: TransientCtx | null
  /** 0..1 supply multiplier, driven by the DC-sweep scope */
  vscale?: number
}

export interface LedSolveEntry {
  c: PlacedComponent
  a: string
  b: string
  vd: number
  IS: number
  I: number
}
export interface ResSolveEntry {
  c: PlacedComponent
  a: string
  b: string
  I: number
}
export interface SwitchSolveEntry {
  c: PlacedComponent
  a: string
  b: string
}
export interface FetSolveEntry {
  c: PlacedComponent
  g: string
  d: string
  s: string
  on: boolean
  avV?: number
}
export interface DiodeSolveEntry {
  c: PlacedComponent
  a: string
  b: string
  vd: number
  IS: number
  I: number
}
export interface InductorSolveEntry {
  c: PlacedComponent
  a: string
  b: string
  I: number
  V: number
}
export interface CapacitorSolveEntry {
  c: PlacedComponent
  a: string
  b: string
  V: number
}

export interface SolveResult {
  ok: boolean
  V: Record<string, number>
  pinNet: Record<string, string>
  nets: Net[]
  led: LedSolveEntry[]
  res: ResSolveEntry[]
  fets: FetSolveEntry[]
  sws: SwitchSolveEntry[]
  dio: DiodeSolveEntry[]
  inds: InductorSolveEntry[]
  caps: CapacitorSolveEntry[]
  /** nets touched by a driven pin — used to detect floating nodes */
  driven: Record<string, true>
}

export interface TransientSample {
  t: number
  V: Record<string, number>
  il: Record<string, number>
  dioI: Record<string, number>
}

export interface TransientOptions {
  tEnd: number
  n: number
  tOpen: number
}

export type VerdictSeverity = 'ok' | 'warn' | 'bad'

/**
 * The core of the product: every check returns these four fields, always.
 * Never a bare pass/fail — what is wrong, why it is wrong, the engineering
 * principle involved, and the fix. `t` is the short verdict title.
 */
export interface Verdict {
  s: VerdictSeverity
  t: string
  what: string
  why: string
  prin: string
  fix: string
}

/** The schematic working state a lesson's check() function inspects. */
export interface SchState {
  comps: PlacedComponent[]
  wires: Wire[]
}

export type LessonMode = 'quiz' | 'build' | 'pcbonly' | 'soon'

export interface QuizQuestion {
  q: string
  o: [string, string, string, string]
  a: 0 | 1 | 2 | 3
  e: string
}

export interface LessonConcept {
  h: string
  /** rich HTML body (RTL/LTR mixed, <sub>/<code>/<b> etc.) — rendered via a sanitized-HTML block */
  b: string
}

export interface PresetComponent {
  id: string
  type: ComponentType
  x: number
  y: number
  rot?: number
}

export type PcbLessonKind = 'led' | 'decap' | 'width' | 'placement'

export interface Lesson {
  id: number
  /** unit index, 0-7 */
  u: number
  t: string
  short: string
  xp: number
  mode: LessonMode
  d: string
  tags: string[]
  transient?: true
  concept?: LessonConcept
  quiz?: QuizQuestion[]
  palette?: ComponentType[]
  preset?: PresetComponent[]
  goal?: string
  /** build-mode lessons that continue into a PCB step share the schematic's solved nets */
  pcb?: true
  /** pcbonly lessons (and the PCB step of build lessons with `pcb:true`) pick a board */
  pcbLesson?: PcbLessonKind
  check?: (sim: SolveResult, s: SchState) => Verdict[]
  /** trail position among practical (build/pcbonly) stages only — assigned at load time */
  pos?: number
}

export interface PcbPad {
  n: string
  x: number
  y: number
  w: number
  h: number
  /** true = round pad */
  r?: true
}

export interface FootprintDef {
  pads: PcbPad[]
  /** [width, height] mm courtyard used for overlap checking */
  body: [number, number]
  pin1?: 1
  /** LED-style polarized footprint (A/K, not symmetric) */
  pol?: 1
}

export type FootprintKind = 'R' | 'C' | 'LED' | 'J' | 'SOIC8'

export interface PcbPart {
  id: string
  fp: FootprintKind
  x: number
  y: number
  rot: number
  mpn: string
  /** pad name -> net name ('' = unconnected) */
  map: Record<string, string>
}

export interface PcbTrace {
  net: string
  width: number
  pts: { x: number; y: number }[]
}

export interface BoardDef {
  w: number
  h: number
  cur: number
  layer: string
  goal?: 'loop' | 'width' | 'rats'
  build: (schComps: PlacedComponent[], schSim: SolveResult | null) => { parts: PcbPart[]; cur: number }
}

export interface PcbRouting {
  net: string
  pts: { x: number; y: number }[]
  cur: { x: number; y: number } | null
}

export interface PcbState {
  kind: PcbLessonKind
  parts: PcbPart[]
  traces: PcbTrace[]
  width: number
  cur: number
  sel: string | null
  routing: PcbRouting | null
}

export interface PcbPad_Located {
  key: string
  net: string
  x: number
  y: number
  pd: PcbPad
  part: PcbPart
}
