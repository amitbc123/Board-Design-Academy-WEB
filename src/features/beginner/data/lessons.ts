/**
 * The full Rev A curriculum — transcribed verbatim from the original
 * single-file app's `LESSONS` array (the `L({...})` identity-helper wrapper
 * is dropped). Hebrew-language lessons stay Hebrew, English stay English —
 * do not translate either direction. HTML markup inside `d`/`concept.b`/quiz
 * strings is preserved exactly as authored, including double-escaped
 * `&lt;sub&gt;`-style sequences that appear in some English quiz options.
 */
import type { Lesson, QuizQuestion, ResistorPart } from '../engine/types'
import { checkLED, checkPull, checkI2C, checkFet, checkFlyback } from '../engine/checks'
import { fmtI, fmtP, fmtR } from '../engine/format'

export const LESSONS: Lesson[] = [
  /* U0 */
  {
    id: 50, u: 0, t: 'Reading a Block Diagram', short: 'Block diagrams', xp: 35, mode: 'quiz',
    d: 'The drawing that exists before any schematic. Blocks, interfaces and signal flow — the level where architecture is decided.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'What does a block diagram deliberately hide?', o: ['Every component and connection — it shows function and interfaces only', 'The power supply', 'The software', 'Nothing, it is just a simplified schematic'], a: 0, e: 'That omission is the point. A block diagram lets you argue about architecture — what functions exist, what talks to what, which rails are needed — without a single part chosen. Decisions made here cost nothing to change; the same decisions discovered during layout cost a respin.' },
      { q: 'On a well-drawn block diagram, why are power and signal usually drawn differently?', o: ['They flow independently — signal left to right, power distributed top down from a supply tree', 'It is only a drawing convention', 'Power is less important', 'To save space'], a: 0, e: 'Mixing them makes both unreadable. Signal flow answers what processes what; the power tree answers which rails exist, what each feeds and how much current each must supply. Most beginner block diagrams omit the power tree entirely, and that is exactly where the budget errors hide.' },
      { q: 'A block is labelled <code>3.3 V / 400 mA</code> with arrows in and out. What is that block a contract for?', o: ['Its interfaces and its budget — anyone can design inside it as long as the boundary holds', 'The exact regulator part number', 'The PCB area it occupies', 'Its firmware'], a: 0, e: 'Blocks are contracts. Fix the input, the output and the budget, and the internals become an isolated problem that one person can solve and swap later. This is the same reasoning as an API boundary in software, and it is why block diagrams are how hardware teams divide work.' },
      { q: 'When should you stop refining a block diagram and start the schematic?', o: ['When every interface has a defined voltage, protocol and current, and no block is still labelled with a question', 'As soon as the blocks are named', 'After the parts are ordered', 'Block diagrams are optional'], a: 0, e: 'An interface that is still vague is an unresolved decision, and it will surface as a level-shifter you did not plan for or a rail that cannot supply what it must. Once every arrow carries a voltage, a protocol and a current, the schematic becomes transcription rather than design.' },
    ],
  },
  {
    id: 51, u: 0, t: 'System Partitioning', short: 'Partitioning', xp: 40, mode: 'quiz',
    d: 'Deciding what goes in which block — and where to put the boundaries so the hard problems stay contained.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'You have a noisy motor driver and a 16-bit ADC. Where does the partition go?', o: ['Between them — separate blocks, separate supply branches, a defined and narrow interface', 'In the same block for shorter traces', 'Partitioning is a layout concern only', 'Split the ADC across both'], a: 0, e: "Partitioning is not just an organisational exercise; it decides which problems can couple. Putting a switching load and a precision measurement in the same block means they share rails, ground and space, and every noise problem becomes everyone's problem. A boundary here forces the interface to be explicit and narrow." },
      { q: 'What is the strongest argument for putting a function in firmware rather than hardware?', o: ['It can be changed after the boards are manufactured', 'Firmware is always cheaper', 'Hardware is unreliable', 'It uses less power'], a: 0, e: 'A hardware mistake costs a respin and weeks; a firmware mistake costs a rebuild. So push decisions into firmware where timing and safety allow. The counter-argument is equally real: anything that must respond in microseconds, or must stay safe while the processor is resetting, belongs in hardware.' },
      { q: 'A robot has motors, sensors and a radio. Which partitioning fault is most common?', o: ['One shared ground and one shared rail for everything, so motor noise reaches the sensors and radio', 'Too many separate boards', 'Using a single microcontroller', 'Too much decoupling'], a: 0, e: 'It is the default outcome of not partitioning at all. Motor current is amps switching fast; sensor signals are millivolts; the radio needs a clean rail to meet its sensitivity specification. Separate supply branches from a common point, and a deliberate ground strategy, are what keep them from interacting.' },
      { q: 'Why define the connector pinout between two blocks early?', o: ['It is the physical contract — changing it later invalidates both boards and any cable already made', 'Connectors are cheap to change', 'It only matters for production', 'So the mechanical team can start'], a: 0, e: 'A pinout binds two independent designs plus a cable and often an enclosure. Once anything is manufactured against it, a change ripples through all of them. Pinouts, like block interfaces, are worth freezing early and changing only deliberately.' },
    ],
  },
  {
    id: 52, u: 0, t: 'From Block Diagram to Schematic', short: 'Decomposition', xp: 40, mode: 'quiz',
    d: 'Turning a boundary into parts: choosing a topology, then a part number, then the support components nobody drew.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A block says <code>5 V in → 3.3 V out, 800 mA</code>. What decides LDO or buck?', o: ['The dissipation — 1.7 V × 0.8 A is 1.4 W in an LDO, which needs real copper or a switcher', 'Always use an LDO for 3.3 V', 'Always use a buck, it is more efficient', 'The output capacitor value'], a: 0, e: 'Run the number before choosing the topology. 1.4 W in a small package is a thermal design problem; a buck at 90 % efficiency dissipates around 0.3 W instead. The trade is noise, cost, inductor selection and layout difficulty. Blocks become topologies through arithmetic, not preference.' },
      { q: 'Having chosen a part number, what is usually missing from your schematic?', o: ['The support components the datasheet requires — input and output caps, feedback network, enable pull-up, bootstrap', 'Nothing, the part is self-contained', 'Only the decoupling', 'The reference designator'], a: 0, e: 'The typical application circuit on page one of the datasheet is the actual deliverable, not the pinout. Enable pins left floating, missing bootstrap capacitors and absent feedback dividers are the classic first-schematic omissions — and each one produces a board that does nothing at all.' },
      { q: "Why does the schematic need the block diagram's budget written on it?", o: ['So reviewers can check the design against the intent rather than only against itself', 'It is required by standards', 'For the bill of materials', 'It is not needed'], a: 0, e: 'A schematic shows what you drew; it does not show what you meant. Noting the rail currents, expected voltages and interface levels lets a reviewer catch a regulator that cannot supply what its block promised. Most schematic review failures are failures to state intent.' },
      { q: 'You finish the schematic and the pin count exceeds the MCU. What went wrong, and where?', o: ['The block diagram never counted interface pins — a partitioning error found far too late', 'The schematic is drawn wrongly', 'The MCU is faulty', 'Nothing, use a port expander'], a: 0, e: 'Pin count is an interface budget and belongs on the block diagram alongside current and voltage. Discovering it at schematic stage means revisiting partitioning after the expensive work has started — which is precisely the cost the block diagram exists to avoid.' },
    ],
  },
  /* U1 */
  {
    id: 1, u: 1, t: 'Schematic Symbols', short: 'Symbols', xp: 20, mode: 'quiz',
    d: "Before you can build a circuit you have to read one. Learn the symbols every schematic assumes you already know.",
    tags: ['Quiz', '5 questions'],
    quiz: [
      { q: 'Which statement about a <code>net</code> is true?', o: ['Every pin touching the same net is at the same electrical potential', 'A net is a physical wire drawn on the board', 'A net can only connect exactly two pins', 'Nets only exist after you route the PCB'], a: 0, e: 'A net is a set of pins that are electrically one point. How it is drawn — one wire, five wires, or just a shared label — changes nothing. This is why two pins on one net can never have a voltage between them.' },
      { q: 'On a schematic, what does the reference designator <code>C7</code> tell you?', o: ['It is the 7th capacitor placed in the design', 'It is a 7 µF capacitor', 'It is on layer 7 of the board', 'It is a 7-pin connector'], a: 0, e: 'Reference designators are type letter + sequence: R for resistors, C for capacitors, D for diodes, Q for transistors, U for ICs, J for connectors, L for inductors. The value is written separately — the designator carries no electrical meaning.' },
      { q: 'Two wires cross on a schematic with <b>no dot</b> at the intersection. What does that mean?', o: ['They are not connected', 'They are connected', 'It depends on the layer', 'It is a drawing error'], a: 0, e: 'A junction dot means connection. No dot means the wires simply pass over each other. This convention causes real bugs — good practice is to avoid four-way crossings entirely and offset them into two T-junctions.' },
      { q: 'Why do schematics use <code>GND</code> symbols instead of drawing every return wire back to the supply?', o: ['It removes clutter — all GND symbols are one net', 'Ground wires do not carry current', 'It saves copper on the PCB', 'Ground is not a real connection'], a: 0, e: 'Every GND symbol is the same net, so the drawing stays readable. The current is absolutely real and must return through copper — forgetting that return path is one of the most common causes of a board that works on the bench and fails in the field.' },
      { q: 'What is a <code>netlist</code>?', o: ['The machine-readable list of which pins connect to which nets', 'A list of parts to order', 'The routing order for the PCB', 'A list of test points'], a: 0, e: 'The netlist is the contract between schematic and layout. Layout tools import it, show unrouted connections as a ratsnest, and refuse to call the board finished until every net has copper. It is the single source of truth.' },
    ],
  },
  {
    id: 2, u: 1, t: 'מחלק המתח', short: 'מחלק', xp: 35, mode: 'build',
    d: 'שני נגדים — אחד המעגלים הנפוצים בכל האלקטרוניקה. תבנה אחד שהופך 5 V ל-רפרנס של 3.3 V.',
    tags: ['בנייה', 'Solver'],
    concept: {
      h: 'מחלקים מתח',
      b: `<p>שים שני נגדים בטור על פני מקור מתח, ונקודת האמצע תיושב בשבר צפוי ממנו. אותו זרם זורם בשניהם, אז המתח מתחלק ביחס להתנגדות:</p>
   <div class="fml">V<sub>out</sub> = V<sub>in</sub> · R2 / (R1 + R2)</div>
   <p>זה נמצא בכל מקום: קביעת מתח ה-feedback בתוך רגולטור, הקטנת סוללת 12 V למשהו ש-ADC יכול לקרוא, biasing לטרנזיסטור, יצירת רפרנס.</p>
   <p><b>המכשלה שתופסת מתחילים:</b> מחלק מתח הוא לא מקור הספק. שאב זרם מנקודת האמצע והפלט שוקע (sags), כי הזרם הזה כבר לא זורם דרך R2. מחלק שומר על המתח שלו רק כשמה שהוא מזין שואב כמעט כלום — כניסת ADC, כניסת op-amp, קומפרטור.</p>
   <p><b>המשימה שלך:</b> השתמש בשני נגדים כדי שנקודת האמצע תיושב על <code>3.3 V ± 0.2 V</code> מ-rail של 5 V. חשב את היחס קודם: אתה צריך R2/(R1+R2) = 0.66.</p>`,
    },
    palette: ['R'],
    preset: [
      { id: 'PWR1', type: 'VCC', x: 200, y: 80 },
      { id: 'GND1', type: 'GND', x: 200, y: 380 },
    ],
    goal: 'נקודת האמצע ב-3.3 V ± 0.2 V',
    check: (s, S) => {
      const rs = S.comps.filter((c) => c.type === 'R')
      if (rs.length < 2) {
        return [{
          s: 'bad', t: 'פחות משני נגדים',
          what: 'מחלק מתח צריך שני נגדים בטור.', why: 'עם נגד אחד אין נקודת אמצע — כל המקור מופיע עליו.',
          prin: 'החלוקה נובעת מהיחס בין שתי התנגדויות, לא מאחת.', fix: 'הצב נגד שני.',
        }]
      }
      const mids = s.nets.filter((n) => n.name !== 'GND' && n.name !== '+5V' && n.pins.length > 1)
      if (!mids.length) {
        return [{
          s: 'bad', t: 'אין צומת אמצע',
          what: 'אין צומת בין שני נגדים.', why: 'או שהנגדים לא בטור, או שהשרשרת לא מחוברת לשני ה-rails.',
          prin: 'מחלק מתח הוא +V → R1 → אמצע → R2 → GND.', fix: 'חבר +5V ל-R1, R1 ל-R2, ו-R2 ל-GND.',
        }]
      }
      const m = mids[0]
      const V = s.V[m.name]
      const err = Math.abs(V - 3.3)
      const r1 = (rs[0].part as ResistorPart).R
      const r2 = (rs[1].part as ResistorPart).R
      if (err <= 0.2) {
        return [{
          s: 'ok', t: `נקודת האמצע ב-${V.toFixed(2)} V`,
          what: `ה-net <code>${m.name}</code> יושב על ${V.toFixed(2)} V, בתוך החלון של ±0.2 V.`,
          why: `היחס מתברר כ-${(V / 5).toFixed(3)}. זרם השרשרת הכולל הוא ${fmtI(5 / (r1 + r2))}, אז הזוג שורף ${fmtP(25 / (r1 + r2))} כדי לא לעשות כלום מלבד להחזיק מתח.`,
          prin: 'פלט מחלק המתח תלוי רק ביחס. הערכים המוחלטים קובעים את הזרם שאתה מבזבז ואיזה עומס הוא יכול לסבול.',
          fix: 'בוצע — שים לב כמה מעט זרם אתה יכול לשאוב לפני שזה שוקע.',
        }]
      }
      return [{
        s: 'bad', t: `נקודת האמצע ב-${V.toFixed(2)} V`,
        what: `אתה צריך 3.3 V ± 0.2 V; הצומת נמצאת ב-${V.toFixed(2)} V.`,
        why: `עם ${fmtR(r1)} מלמעלה ו-${fmtR(r2)} מלמטה היחס הוא ${(V / 5).toFixed(3)}, לא ה-0.66 שאתה רוצה.`,
        prin: 'V<sub>out</sub> = V<sub>in</sub> · R2 / (R1 + R2).',
        fix: 'נסה 1.5 kΩ מלמעלה ו-3 kΩ מלמטה — זה בדיוק 2/3.',
      }]
    },
  },
  {
    id: 30, u: 1, t: 'Choosing a Resistor', short: 'Resistors', xp: 35, mode: 'quiz',
    d: '220 Ω is not a part number. Tolerance, TCR, package voltage and pulse energy decide which 220 Ω you actually buy.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: "You need a divider whose <b>ratio</b> sets an ADC reference. Which resistor technology?", o: ['Thin film — 25–50 ppm/°C TCR keeps the ratio stable over temperature', 'Thick film — cheaper and the ratio is fixed anyway', 'Wirewound — highest power rating', 'Carbon film — lowest noise'], a: 0, e: 'Thick film runs 100–200 ppm/°C, thin film 25–50 ppm/°C. Over a 60 °C swing a thick-film pair can drift the ratio by roughly 1 %, which on a 12-bit ADC is dozens of counts of error. Where a ratio defines a measured value or a setpoint, pay for thin film. Where it is just a pull-up, do not.' },
      { q: 'A resistor sits at the input of a connector exposed to ESD and surge. Which do you choose?', o: ['Thick film — its thicker resistive layer absorbs pulse energy far better', 'Thin film — better precision means better reliability', 'Either, pulse rating is the same', 'Whichever has the higher power rating'], a: 0, e: 'This is the one case where the cheaper technology wins outright. A thin-film layer is only nanometres thick and has almost no thermal mass, so a fast high-energy pulse melts or vaporises it locally. Thick film survives the same transient. Precision parts belong in quiet nodes, not at the surge front door.' },
      { q: 'An 0805 resistor is rated 0.125 W and has a maximum working voltage of 150 V. You put 200 V across a 1 MΩ. What fails?', o: ['The voltage rating — dissipation is only 40 mW, but 200 V exceeds the package limit', 'The power rating, from 40 mW of dissipation', 'Nothing, both limits are satisfied', 'The tolerance drifts but nothing fails'], a: 0, e: 'P = V²/R = 40 mW, comfortably inside 0.125 W — so a power-only check passes and the part still fails. Maximum working voltage is a separate limit set by the physical gap and the resistive track geometry. At high resistance you hit the voltage wall long before the thermal one, which is why high-voltage dividers are built from several resistors in series.' },
      { q: 'A datasheet derating curve shows full rated power only to 70 °C, falling linearly to zero at 155 °C. Your part runs at 100 °C ambient. What is its usable rating?', o: ['About 65 % of nominal — roughly 80 mW for an 0805', 'The full 0.125 W, the curve is advisory', 'Zero — it is past 70 °C', '0.125 W as long as you use a heatsink'], a: 0, e: 'Linear derating from 70 °C to 155 °C means you lose about 1.18 % per °C. At 100 °C that is 30 °C past the knee, so roughly 35 % is gone and you have about 80 mW. Power ratings are always quoted at an ambient the inside of your enclosure may never see — check the curve, not the headline number.' },
    ],
  },
  {
    id: 34, u: 1, t: 'Choosing a Transistor', short: 'Transistors', xp: 45, mode: 'quiz',
    d: 'BJT or MOSFET, and which one. Current gain against gate charge, saturation against R&lt;sub&gt;DS(on)&lt;/sub&gt;.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'You need to switch 2 A from a 3.3 V logic pin. BJT or MOSFET, and why?', o: ['A logic-level MOSFET — it is voltage controlled, so the pin supplies almost no steady current', 'A BJT — higher current capability', 'Either, they are equivalent', 'A BJT, because MOSFETs need 10 V'], a: 0, e: 'A BJT is current controlled: at a typical forced beta of 20 you would need 100 mA of base drive for 2 A, which no MCU pin can supply. A MOSFET gate is a capacitor — it takes a charge pulse to switch and essentially nothing to hold. The catch is that you must pick a logic-level part whose R&lt;sub&gt;DS(on)&lt;/sub&gt; is specified at V&lt;sub&gt;GS&lt;/sub&gt; = 2.5 V or 4.5 V, not only at 10 V.' },
      { q: 'What does <code>R&lt;sub&gt;DS(on)&lt;/sub&gt; @ V&lt;sub&gt;GS&lt;/sub&gt; = 10 V</code> on a datasheet tell you about 3.3 V drive?', o: ['Almost nothing — you must read the R&lt;sub&gt;DS(on)&lt;/sub&gt; versus V&lt;sub&gt;GS&lt;/sub&gt; curve at your actual drive', 'It scales linearly with gate voltage', 'It is the same at any V&lt;sub&gt;GS&lt;/sub&gt; above threshold', 'It only matters for high voltage'], a: 0, e: 'Headline R&lt;sub&gt;DS(on)&lt;/sub&gt; is quoted at the most flattering gate drive. At 3.3 V the same part can be several times higher, and the resulting dissipation is I²R with that larger R. Every MOSFET datasheet has a transfer curve — that curve, at your gate voltage and your junction temperature, is the number to design with.' },
      { q: 'Why does gate charge Q&lt;sub&gt;g&lt;/sub&gt; matter more than R&lt;sub&gt;DS(on)&lt;/sub&gt; in a 500 kHz converter?', o: ['Switching loss scales with Q&lt;sub&gt;g&lt;/sub&gt; and frequency, and can exceed conduction loss', 'Q&lt;sub&gt;g&lt;/sub&gt; sets the on-resistance', 'It only affects turn-off', 'It determines the voltage rating'], a: 0, e: 'Total loss is conduction plus switching. Conduction is I²·R&lt;sub&gt;DS(on)&lt;/sub&gt; and is frequency independent; switching loss is proportional to Q&lt;sub&gt;g&lt;/sub&gt;, gate voltage and frequency. Manufacturers trade the two against each other — a bigger die lowers R&lt;sub&gt;DS(on)&lt;/sub&gt; but raises Q&lt;sub&gt;g&lt;/sub&gt;. Above a few hundred kilohertz the lowest-R&lt;sub&gt;DS(on)&lt;/sub&gt; part is often the worse choice.' },
      { q: 'Where is a BJT still the better answer?', o: ['Low-current level shifting and current sources, where V&lt;sub&gt;BE&lt;/sub&gt; matching and low cost win', 'Anywhere above 1 A', 'High-frequency switching', 'It never is'], a: 0, e: 'For small signals a BJT is cheap, needs no gate-charge budget, and its predictable V&lt;sub&gt;BE&lt;/sub&gt; makes current mirrors and simple current sources possible. A matched pair tracks to a millivolt. MOSFETs win on power switching; BJTs still win on cheap analog building blocks.' },
    ],
  },
  {
    id: 3, u: 1, t: 'מתדלק LED', short: 'LED', xp: 45, mode: 'build', pcb: true,
    d: 'המעגל הראשון של כולם, והרכיב הראשון שכולם שורפים. תלמד למה LED לא יכול להתחבר ישירות ל-rail.',
    tags: ['בנייה', 'PCB', 'Solver'],
    concept: {
      h: 'למה ל-LED צריך נגד',
      b: `<p>נגד מקיים את חוק אוהם: הכפל את המתח, הכפל את הזרם. <b>LED לא.</b> זו דיודה — הזרם עולה <i>אקספוננציאלית</i> עם המתח:</p>
   <div class="fml">I = I<sub>S</sub> · (e<sup>V / nV<sub>T</sub></sup> − 1)</div>
   <p>Lite-On מציינים ל-<code>LTST-C170KRKT</code> נפילת מתח ישירה של 2.0 V כשדוחפים את הזרם המדורג של 20 mA. ב-2.1 V זה לוקח בערך 50 mA. ב-2.3 V זה כבר משמיד את עצמו. אין מתח שאתה יכול <i>להחיל</i> בבטחה — ל-rail של 5 V יש בקושי התנגדות פלט, אז הוא דוחף אמפרים לתוך ה-die עד שחוט ההלחמה מוותר.</p>
   <p>אז אתה לא שולט ב-LED עם מתח. <b>אתה שולט בו עם זרם</b>, ומקור הזרם הזול ביותר הוא נגד בטור שמבליע את ההפרש:</p>
   <div class="fml">R = (V<sub>supply</sub> − V<sub>f</sub>) / I<sub>target</sub> = (5 − 2.0) / 0.015 = 200 Ω → 220 Ω</div>
   <p>העקרון הזה לא הולך לשום מקום: <b>רכיב אקספוננציאלי חייב להיות מוטה על ידי אלמנט לינארי.</b> אותו היגיון עומד מאחורי נגד ה-base ב-BJT ומחלק ה-feedback בכל רגולטור.</p>
   <p><b>נסה את ה-LED הכחול</b> כשזה עובד. נפילת המתח הישירה שלו היא 3.2 V, אז אותו נגד נותן זרם שונה בהחלט. זו הסיבה שדאטה-שיטים קיימים.</p>`,
    },
    palette: ['R', 'LED'],
    preset: [
      { id: 'PWR1', type: 'VCC', x: 200, y: 80 },
      { id: 'GND1', type: 'GND', x: 200, y: 380 },
    ],
    goal: 'D1 בין 5 mA ל-20 mA',
    check: (s, S) => checkLED(s, S),
  },
  {
    id: 4, u: 1, t: 'נגדי Pull-Up', short: 'Pull-up', xp: 40, mode: 'build',
    d: 'כפתור מחבר פין ל-GND. אבל מה מחזיק את הפין ב-high כשאף אחד לא לוחץ?',
    tags: ['בנייה', 'רמות לוגיות'],
    concept: {
      h: 'משהו צריך להגדיר את מצב המנוחה',
      b: `<p>חבר כפתור לחיצה בין פין MCU ל-GND. תלחץ עליו והפין קורא 0 V — low לוגי נקי. תשחרר אותו והמתג הוא מעגל פתוח, אז הפין מחובר ל<b>שום דבר בכלל</b>. הוא לא קורא high. הוא קורא כל מטען שקורה להיות עליו: הזמזום מהחשמל, הפס הסמוך, האצבע שלך קרוב ללוח.</p>
   <p><b>נגד Pull-up</b> מהפין למקור פותר את זה. כשהכפתור פתוח, הנגד מושך בעדינות את הפין ל-3.3 V. כשהכפתור סגור, הוא מקצר את הפין ל-GND והנגד רק מבזבז מעט זרם.</p>
   <div class="fml">I<sub>מבוזבז</sub> = V<sub>DD</sub> / R<sub>pullup</sub> = 3.3 / 10,000 = 330 µA</div>
   <p><b>בחירת הערך היא מסחר (trade-off):</b></p>
   <ul><li><b>קטן מדי</b> (למשל 200 Ω) — מבזבז 16 mA כל פעם שהכפתור מוחזק, ובמוצר סוללה זה משנה.</li>
   <li><b>גדול מדי</b> (למשל 1 MΩ) — הפין הופך שוב לעכבה גבוהה, איטי לעלות וקל להפריע לו ברעש.</li>
   <li><b>10 kΩ</b> היא ברירת המחדל מטעם. היא יושבת באמצע בין שתי הבעיות.</li></ul>
   <p>כניסת STM32 היא Schmitt trigger עם V<sub>IH</sub> ב-0.7 × V<sub>DD</sub> = 2.31 V. ה-pull-up שלך צריך להעלות את הפין מעל זה. <b>הפעל/כבה את הכפתור</b> ותצפה בשינוי הרמה.</p>`,
    },
    palette: ['R', 'SW'],
    preset: [
      { id: 'PWR1', type: 'V33', x: 180, y: 70 },
      { id: 'GND1', type: 'GND', x: 180, y: 390 },
      { id: 'U1', type: 'IO', x: 520, y: 230 },
    ],
    goal: 'הפין קורא HIGH כשפתוח, LOW כשלחוץ',
    check: (s, S) => checkPull(s, S, 'up'),
  },
  {
    id: 5, u: 1, t: 'כניסות צפות', short: 'צף', xp: 40, mode: 'build',
    d: 'אותה בעיה, בהיפוך. עכשיו הכפתור מתחבר למקור המתח — אז אתה צריך pull-down במקום.',
    tags: ['בנייה', 'רמות לוגיות'],
    concept: {
      h: 'לעולם אל תשאיר כניסה דיגיטלית לא מוזנת',
      b: `<p>הפוך את המעגל הקודם: הכפתור עכשיו מחבר את הפין ל-<b>+3.3 V</b>. לחיצה עליו נותנת high נקי. שחרור משאיר את הפין צף שוב — וכניסת CMOS צפה היא מסוכנת ממש, לא רק לא אמינה.</p>
   <p>שלב כניסת CMOS מכיל טרנזיסטור P-channel וטרנזיסטור N-channel בערמה בין ה-rails. ב-high או low תקפים, בדיוק אחד מהם דלוק. במתח באמצע, <b>שניהם מעבירים זרם בו-זמנית</b> וזרם זורם ישר דרך הצ'יפ. פין צף סוחף (drifts) באזור הזה כל הזמן, אז הרכיב מתחמם והכניסה מתנדנדת, מייצרת רעש על פני כל הלוח.</p>
   <p><b>נגד Pull-down</b> מהפין ל-GND מגדיר את מצב המנוחה כ-low. אותו 10 kΩ, אותו מסחר, כיוון מנוגד.</p>
   <p><b>החוק:</b> כל כניסה דיגיטלית צריכה מצב מוגדר כל הזמן — מוזנת מצ'יפ אחר, pull-up, או pull-down. פינים לא בשימוש על IC לא פטורים. בדוק את טבלת הפינים של כל דאטה-שיט: היא תגיד לך במפורש אילו כניסות לא בשימוש יכולות להיות צפות ואילו חייבות להיות מחוברות.</p>`,
    },
    palette: ['R', 'SW'],
    preset: [
      { id: 'PWR1', type: 'V33', x: 180, y: 70 },
      { id: 'GND1', type: 'GND', x: 180, y: 390 },
      { id: 'U1', type: 'IO', x: 520, y: 230 },
    ],
    goal: 'הפין קורא LOW כשפתוח, HIGH כשלחוץ',
    check: (s, S) => checkPull(s, S, 'down'),
  },
  /* U2 */
  {
    id: 6, u: 2, t: 'קבלי פריקה (Decoupling)', short: 'פריקה', xp: 45, mode: 'pcbonly',
    d: 'החוק הכי חזור בתכן לוחות: שים את הקבל קרוב לפין ההזנה כמה שפיזית אפשר. הנה למה, במספרים.',
    tags: ['PCB', 'שטח לולאה'],
    concept: {
      h: 'הקבל הוא סוללה מקומית',
      b: `<p>כשצ'יפ דיגיטלי מתג, הוא דורש זרם בתוך כמה ננו-שניות. הרגולטור נמצא סנטימטרים משם ואיטי בהרבה מכדי להגיב כך מהר. קבל הפריקה יושב ממש בפין ההזנה ומספק את הפרץ הזה מקומית.</p>
   <p>מה שהורס את זה זו <b>השראות לולאה</b> — השטח שסוגר המסלול מהקבל, דרך הצ'יפ, וחזרה ל-GND. כל מילימטר מסילה מוסיף בערך 1 nH, והמתח שמופיע על פניה הוא:</p>
   <div class="fml">V = L · dI/dt</div>
   <p>קצה מיתוג של 50 mA ב-2 ns דרך רק 5 nH מייצר שקיעה של 125 mV ב-rail ההזנה. תעשה את זה על שמונה פינים בו-זמנית והצ'יפ נכנס ל-brownout.</p>
   <p><b>המשימה שלך:</b> שים את C1 בצד פיני ההזנה של U1 ונתב אותו עם הלולאה הקצרה ביותר האפשרית. ה-DRC ימדוד את שטח הלולאה האמיתי שלך וידרג אותו. מרחק כאן הוא לא עניין של סטייל — זה כל התפקוד של הרכיב.</p>`,
    },
    pcbLesson: 'decap',
    goal: 'שטח לולאה מתחת ל-12 mm²',
  },
  {
    id: 31, u: 2, t: 'Choosing a Capacitor', short: 'Capacitors', xp: 50, mode: 'quiz',
    d: 'The specification most engineers get wrong. A 10 uF ceramic is very often not 10 uF once you apply voltage to it.',
    tags: ['Quiz', '5 questions'],
    quiz: [
      { q: 'You fit a <b>10 µF X5R 0805 rated 6.3 V</b> and run it at 5 V. Roughly how much capacitance do you actually get?', o: ['About 2–3 µF — DC bias collapses it', 'The full 10 µF', 'About 9 µF', 'About 12 µF'], a: 0, e: 'This is DC bias derating and it is the single most expensive capacitor mistake in the industry. Class II ceramics are ferroelectric: applied field re-orients the dielectric domains and permittivity falls. At roughly 80 % of rated voltage a 10 µF X5R can be down to 2–3 µF. Your carefully calculated bulk capacitance quietly became a quarter of the design value, and nothing on the schematic shows it.' },
      { q: 'The standard defence against DC bias derating is to:', o: ['Rate the capacitor at two to three times the working voltage, or move up a package size', 'Use a tighter tolerance part', 'Add a series resistor', 'Use a lower ESR part'], a: 0, e: 'Derating depends on the ratio of applied voltage to rated voltage, so a 25 V part at 5 V sits in the flat part of its curve and keeps most of its value. Package size is the other lever — more dielectric volume means less field for the same voltage, so a 10 µF 0805 holds up far better than the same value in 0603. Both cost board area or money, which is why the shortcut is so tempting and so damaging.' },
      { q: 'For a 1 % accurate analog filter or a precise timing network, which dielectric?', o: ['C0G/NP0 — Class I, essentially no DC bias effect and ±30 ppm/°C', 'X7R — good enough for anything', 'X5R — best capacitance density', 'Y5V — cheapest'], a: 0, e: 'C0G/NP0 is a Class I dielectric: it is not ferroelectric, so it has virtually no DC bias effect, no ageing, and a temperature coefficient around ±30 ppm/°C. The trade is capacitance density, so C0G is only practical up to a few nanofarads in small packages. Anywhere a capacitor sets a frequency, a time constant, or a ratio, it should be C0G.' },
      { q: 'What does the <code>X7R</code> code actually specify?', o: ['−55 to +125 °C operation with capacitance within ±15 % across that range', '±7 % tolerance at 25 °C', 'A 7 volt rating', 'A 7-layer construction'], a: 0, e: 'The three characters are a temperature code: X = −55 °C low limit, 7 = +125 °C high limit, R = ±15 % change over that span. X5R is the same ±15 % but only to +85 °C. Y5V is a trap — it is +22 %/−82 %, meaning it can legitimately lose four-fifths of its value while still meeting specification.' },
      { q: 'A ceramic capacitor measured fine at manufacture but reads low a year later. Why?', o: ['Class II ceramics age — capacitance falls logarithmically with time after firing', 'It was damaged in assembly', 'Moisture ingress', 'The measurement was wrong'], a: 0, e: 'Class II dielectrics lose a few percent per decade-hour of time as the crystal structure relaxes, typically 1–2 % per decade for X7R. Heating the part above its Curie point resets the clock. It is rarely fatal, but combined with DC bias, temperature and tolerance it is another slice off a budget that engineers assume is the printed value.' },
    ],
  },
  {
    id: 53, u: 2, t: 'Capacitor Types & Parasitics', short: 'Cap types', xp: 50, mode: 'quiz',
    d: 'Ceramic, electrolytic, tantalum, polymer, film. ESR, ESL and the frequency where your capacitor stops being one.',
    tags: ['Quiz', '5 questions'],
    quiz: [
      { q: 'Why does a 100 nF ceramic stop decoupling above its self-resonant frequency?', o: ['Its own lead and plate inductance dominates — above resonance it behaves as an inductor', 'The capacitance drops to zero', 'It overheats', 'It only works at DC'], a: 0, e: 'Every real capacitor is C in series with ESL and ESR. Below resonance impedance falls with frequency as a capacitor should; above it, impedance rises with frequency because the inductance takes over. A 100 nF 0805 resonates somewhere around 10–20 MHz, which is why fast designs pair values and, more importantly, minimise mounting inductance.' },
      { q: "Where does most of a decoupling capacitor's inductance actually come from?", o: ['The mounting loop — pads, traces and vias — not the capacitor body', 'The dielectric', 'The solder joints', 'The capacitance value'], a: 0, e: 'Package ESL for an 0805 is around 1 nH, but a careless via-and-trace connection easily adds several. That is why the layout advice — pads close, vias in the pads or immediately beside them, shortest possible loop — matters more than agonising over which value to fit.' },
      { q: 'You need 470 µF of bulk on a 12 V rail. Which technology, and why?', o: ['Aluminium electrolytic or polymer — ceramics of that value at that voltage are impractically large and costly', 'Ceramic, always lowest ESR', 'Film, for stability', 'Tantalum, for size'], a: 0, e: 'Ceramics dominate below a few microfarads and become absurd above it, especially with DC bias derating factored in. Electrolytics give bulk capacitance cheaply, at the cost of ESR, limited life and a temperature dependence. Polymer types sit between the two: much lower ESR and longer life than wet electrolytic, at higher cost.' },
      { q: 'What is the standard derating rule for a tantalum capacitor, and why is it stricter than for ceramic?', o: ['Use at most 50 % of rated voltage — tantalum can fail short and ignite under surge', 'No derating is needed', 'Derate to 90 %', 'Same rule as ceramic'], a: 0, e: "Tantalum's characteristic failure is a low-impedance short that can burn. Surge current during hot-plug or power-on is the usual trigger, so the convention is a 50 % voltage derating and often a surge-rated variant. It is one of the few places where a component choice is a safety decision." },
      { q: "Why does an electrolytic capacitor's ESR matter more than its capacitance in a switching supply?", o: ['Output ripple is dominated by ESR × ripple current, and ESR also causes self-heating that ages the part', 'ESR sets the switching frequency', 'Capacitance is irrelevant', 'ESR only matters at DC'], a: 0, e: 'Ripple voltage is roughly the ripple current multiplied by ESR, so a large capacitor with poor ESR gives worse ripple than a smaller one with good ESR. Worse, that ripple current heats the part internally, the electrolyte dries, ESR rises further and the process accelerates — the classic path to a supply that fails after two years.' },
    ],
  },
  {
    id: 7, u: 2, t: 'Linear Regulators', short: 'LDO', xp: 35, mode: 'quiz',
    d: 'Turning 5 V into 3.3 V with a TI LDO. Dropout, quiescent current, and the heat you forgot to budget for.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'An LDO drops 5 V to 3.3 V while supplying 500 mA. How much power does it dissipate?', o: ['850 mW', '1.65 W', '2.5 W', 'Almost none — it is a regulator'], a: 0, e: 'P = (V_in − V_out) × I_out = 1.7 V × 0.5 A = 850 mW. A linear regulator throws away the voltage difference as heat; it does not convert it. In a SOT-223 package that is enough to run 60 °C above ambient without a decent copper pour. This is exactly when you switch to a buck converter.' },
      { q: 'What does <code>dropout voltage</code> mean?', o: ['The minimum V_in − V_out needed to still regulate', 'The voltage at which the LDO shuts down', 'The ripple on the output', 'The voltage lost in the input capacitor'], a: 0, e: 'Below the dropout voltage the pass element is fully on and the output simply follows the input minus a small resistive drop — regulation is gone. It also rises with load current, so a part that regulates fine at 10 mA can drop out at 500 mA on the same input.' },
      { q: 'Why do LDO datasheets specify a minimum output capacitance and an ESR range?', o: [
          "The output capacitor is part of the feedback loop's stability", 'To store energy for load steps', 'To filter input ripple', 'To meet EMC regulations',
        ], a: 0, e: 'The output capacitor and its ESR set a pole-zero pair in the control loop. Fit a modern ceramic with near-zero ESR into an older LDO that expected a tantalum and the loop can oscillate. Always check the stability region in the datasheet, not just the capacitance number.' },
      { q: 'Your board draws 2 mA in sleep. Which LDO specification matters most?', o: ['Quiescent current (I_Q)', 'Dropout voltage', 'Line regulation', 'Output noise'], a: 0, e: 'Quiescent current is what the regulator itself burns just being on. An older part at 5 mA I_Q would more than double your sleep budget and dominate battery life. Modern low-I_Q parts get down to single-digit microamps — that choice alone can be the difference between weeks and months of runtime.' },
    ],
  },
  {
    id: 8, u: 2, t: 'Reverse Polarity Protection', short: 'Reverse', xp: 40, mode: 'quiz',
    d: 'Someone will plug the connector in backwards. Diode, P-MOSFET or bridge — each costs you something different.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A series Schottky is the classic cheap protection. What does it cost you?', o: ['A permanent 0.3–0.5 V drop and its I²·V dissipation, on every amp, forever', 'Nothing measurable', 'Only reverse leakage', 'Extra board area only'], a: 0, e: 'The diode conducts during normal operation, so its forward drop is subtracted from your supply and turned into heat continuously. At 2 A a 0.4 V Schottky burns 800 mW and costs you headroom your regulator may need. It is the right answer for low current and the wrong one for anything substantial.' },
      { q: 'A P-channel MOSFET in the supply line is wired with its <b>body diode facing the load</b>. Why that orientation?', o: ['The body diode conducts first, the gate then pulls low and the channel takes over at near-zero drop', 'It blocks forward current until enabled', 'It is arbitrary', 'To protect the gate'], a: 0, e: 'On correct polarity the body diode conducts, the source rises, V&lt;sub&gt;GS&lt;/sub&gt; goes negative and the channel enhances — after which the drop is I·R&lt;sub&gt;DS(on)&lt;/sub&gt;, often a few tens of millivolts. On reverse polarity the body diode is reverse biased and the gate never enhances, so nothing conducts. Almost all of a diode\'s protection at a fraction of the loss.' },
      { q: 'What must you add across the gate and source of that P-MOSFET?', o: ['A gate resistor and a Zener clamp — V&lt;sub&gt;GS&lt;/sub&gt; is typically limited to ±20 V', 'Nothing, the gate is self-limiting', 'A pull-up to the input', 'A series inductor'], a: 0, e: 'The gate sits at ground through a resistor while the source is at the input voltage, so V&lt;sub&gt;GS&lt;/sub&gt; equals the full input. On a 24 V rail that destroys a part rated ±20 V instantly. A Zener clamps it and the resistor limits the Zener current. This is the most common way a working prototype becomes a field failure.' },
      { q: 'Why is a full bridge rectifier used for protection in some industrial equipment?', o: ['It works with either polarity — the load always sees correct polarity, at the cost of two diode drops', 'It is cheaper than one diode', 'It provides isolation', 'It reduces EMI'], a: 0, e: 'The bridge does not merely block reverse connection, it corrects it, so the equipment simply works either way round. That is worth two forward drops when a field technician is wiring screw terminals in a cabinet. It is a usability decision as much as an electrical one.' },
    ],
  },
  {
    id: 9, u: 2, t: 'Power Budget & Rails', short: 'Budget', xp: 40, mode: 'quiz',
    d: "Add up every rail's worst case before you choose a regulator, not after the boards come back.",
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'You size a 3.3 V regulator from the typical current in each datasheet. What goes wrong?', o: ['Typical figures carry no guarantee — sum the maximums plus margin, at the worst temperature', 'Nothing, typical is representative', 'Only the MCU matters', 'You should use minimum values'], a: 0, e: 'Typical is a statistical centre with no guarantee behind it. Worst-case analysis sums the maximum for every load, at the highest ambient and the lowest input voltage, then adds margin. A supply sized on typical values works on most boards and fails on some — the worst kind of failure, because it survives your bench and dies in production.' },
      { q: 'Your 3.3 V rail feeds an RF transmitter that draws 10 mA average but 300 mA in 2 ms bursts. How do you size it?', o: ['Regulator for the average, bulk capacitance to supply the burst without the rail collapsing', 'Regulator for the full 300 mA continuous', 'Regulator for 10 mA, the burst is brief', 'Use two regulators'], a: 0, e: 'Sizing the regulator for peak wastes cost and quiescent current. Instead let a bulk capacitor supply the burst: C = I·Δt/ΔV. For 290 mA extra over 2 ms with 100 mV of allowed droop that is about 5.8 mF — which tells you immediately that 100 mV is too tight and you should relax the droop or reconsider. The calculation is the point.' },
      { q: 'Which is the correct order to bring up rails on a board with a core and I/O supply?', o: ["Whatever the device datasheet's power sequencing section specifies — violating it can latch up the die", 'Always core first', 'Always I/O first', 'Order does not matter'], a: 0, e: 'Many devices have internal ESD structures between rails, so bringing I/O up before core can forward-bias a path into an unpowered domain and trigger latch-up. FPGAs and SoCs specify sequences and maximum ramp times explicitly. This is not a guideline — it is a condition of the device working at all.' },
      { q: 'Why does efficiency matter even on a mains-powered board?', o: ['Wasted power becomes heat inside the enclosure, and heat sets your component lifetime', 'It only matters on battery', 'It affects EMC only', 'It does not'], a: 0, e: 'Every watt lost is a watt heating the box. Electrolytic capacitor life roughly halves for each 10 °C rise, and semiconductor failure rates climb with junction temperature. Efficiency on a mains product is a reliability specification wearing a different name.' },
    ],
  },
  /* U3 */
  {
    id: 10, u: 3, t: 'מתג MOSFET בצד ה-Low', short: 'MOSFET', xp: 50, mode: 'build',
    d: 'פין MCU יכול לתת עד 20 mA. העומס שלך צריך 500 mA. MOSFET יחיד מסוג N-channel מגשר על הפער.',
    tags: ['בנייה', 'Solver'],
    concept: {
      h: 'מיתוג עומס ש-MCU לא יכול להזין',
      b: `<p>פין STM32 יכול לספק בערך 20 mA. מנוע, סליל ריליי, או מערך LED חזק רוצים הרבה יותר. התשובה הסטנדרטית היא <b>MOSFET מסוג N-channel בצד ה-low</b>: העומס יושב בין המקור ל-drain, ה-source הולך ל-GND, וה-gate מוזן על ידי ה-MCU.</p>
   <p>Low-side פירושו שהמתג נמצא בצד ה-GND של העומס. זה חשוב כי MOSFET נדלק לפי <b>V<sub>GS</sub></b> — מתח ה-gate יחסית ל-<i>source</i>. עם ה-source מוצמד ל-GND, V<sub>GS</sub> הוא פשוט מתח הפין, אז פלט של 3.3 V יכול להעביר זרם מלא ב-FET מסוג logic-level. שים את המתג בצד ה-high במקום, וה-source עולה עם העומס, אז אתה צריך gate מעל ה-rail ומשאבת מטען (charge pump) שתעשה את זה.</p>
   <p>ה-<code>2N7002</code> מציין V<sub>GS(th)</sub> בין 1.0 V ל-2.5 V. <b>הסף הוא המקום שבו הוא בקושי מתחיל להעביר זרם, לא המקום שבו הוא דלוק.</b> הנע אותו הרבה מעבר לזה, אחרת הוא יושב באזור הלינארי ומפזר הספק אמיתי.</p>
   <p><b>עוד דבר אחד:</b> לפני שה-MCU עולה (boot), הפין ההוא הוא high-impedance וה-gate צף. נגד pull-down על ה-gate מחזיק את ה-FET כבוי בזמן reset — בלעדיו, המנוע שלך יכול לרעוד בכל עלייה.</p>
   <p><b>תבנה את זה:</b> +5 V → נגד → LED → drain, source → GND, ותזין את ה-gate מהכפתור כך שתוכל להפעיל/לכבות אותו. הוסף pull-down על ה-gate.</p>`,
    },
    palette: ['R', 'LED', 'Q', 'SW'],
    preset: [
      { id: 'PWR1', type: 'VCC', x: 170, y: 70 },
      { id: 'GND1', type: 'GND', x: 170, y: 400 },
      { id: 'PWR2', type: 'V33', x: 560, y: 70 },
    ],
    goal: 'ה-LED מתג עם הכפתור, ה-gate לא צף לעולם',
    check: (s, S) => checkFet(s, S),
  },
  {
    id: 60, u: 3, t: 'קפיצת מתח השראתית', short: 'Flyback', xp: 60, mode: 'build', transient: true,
    d: 'תכבה מנוע או ריליי בלי דיודת flyback, ותהרוג את הטרנזיסטור. בכל פעם. כאן רואים את זה קורה.',
    tags: ['בנייה', 'סימולציית זמן'],
    concept: {
      h: 'סליל לא נותן לזרם להיפסק',
      b: `<p>נגד לא אכפת לו אם תנתק אותו. <b>סליל כן.</b> סליל מאחסן אנרגיה בשדה מגנטי, והוא מתנגד לכל שינוי בזרם שזורם בו:</p>
   <div class="fml">V = L · di/dt</div>
   <p>כל עוד ה-MOSFET דלוק, זרם קבוע זורם דרך הסליל. ברגע שאתה מכבה אותו, אתה מנסה להביא את הזרם לאפס תוך <b>מיקרו-שניות</b>. ה-di/dt עצום, אז הסליל מייצר כל מתח שנדרש כדי להמשיך לדחוף את הזרם.</p>
   <p>מקור של 5 V יכול לייצר קפיצה של <b>עשרות או מאות וולט</b>. הסליל מחפש מסלול, ואם לא נתת לו אחד — הוא פורץ דרך ה-drain-source של הטרנזיסטור. כל האנרגיה שאוחסנה, <code>½·L·I²</code>, נשרפת בתוך ה-die.</p>
   <p><b>הפתרון</b> הוא <b>דיודת flyback</b> מקבילה לסליל, מוטה לאחור: אנודה ל-drain, קתודה ל-+5V. בפעולה רגילה היא חסומה ולא עושה כלום. ברגע הכיבוי, כשהמתח על ה-drain קופץ מעל המקור, היא נהיית מוטה קדימה ונותנת לזרם לולאה בטוחה לדעוך בה.</p>
   <p><b>תבנה את זה בלי הדיודה קודם</b> ותסתכל על האוסילוסקופ. אחר כך תוסיף אותה ותראה את ההבדל.</p>`,
    },
    palette: ['L', 'Q', 'R', 'SW', 'D'],
    preset: [
      { id: 'PWR1', type: 'VCC', x: 180, y: 70 },
      { id: 'GND1', type: 'GND', x: 180, y: 400 },
      { id: 'PWR2', type: 'V33', x: 580, y: 70 },
    ],
    goal: 'תכבה את הסליל בלי לחרוג מ-60 V על ה-MOSFET',
    check: (s, S) => checkFlyback(s, S),
  },
  {
    id: 11, u: 3, t: 'Motors & Flyback', short: 'Flyback', xp: 40, mode: 'quiz',
    d: 'Switch off an inductive load without a flyback diode and you will destroy the transistor. Every time.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Why does switching off a motor or relay destroy an unprotected transistor?', o: ['Inductor current cannot stop instantly, so voltage spikes until something breaks down', 'The motor generates a reverse current', 'The transistor overheats', 'The supply voltage doubles'], a: 0, e: "An inductor resists change in current: V = L·dI/dt. Interrupt the current abruptly and dI/dt is enormous, so the inductor generates whatever voltage it takes to keep current flowing — hundreds of volts. It finds a path by punching through the transistor's drain-source junction." },
      { q: 'Where does the flyback diode go across an inductive load?', o: ['Reverse-biased across the load, cathode to the supply', 'Forward-biased across the load', 'In series with the load', "Across the transistor's gate and source"], a: 0, e: "Reverse-biased, so it does nothing during normal operation. When the switch opens and the inductor's voltage flips polarity, the diode becomes forward-biased and gives the current a harmless loop to circulate in until it decays." },
      { q: 'A brushed DC motor is stalled. Compared with running freely, its current is:', o: ['Much higher — only winding resistance limits it', 'Lower, because it is not moving', 'The same', 'Zero'], a: 0, e: 'A spinning motor generates back-EMF that opposes the supply and limits current. Stalled, back-EMF is zero and only the winding resistance is left — stall current is commonly 5 to 10 times the running figure. Size the MOSFET, the fuse, and the traces for stall, not for the nice number on the label.' },
      { q: 'Why keep motor ground separate from logic ground until they meet at one point?', o: ['Motor current through shared copper creates voltage offsets that corrupt logic', 'Motors need a thicker ground wire', 'To meet safety isolation rules', 'To reduce the number of vias'], a: 0, e: 'Copper has resistance and inductance. Amps of pulsed motor current flowing through a shared ground return develops a voltage across it, and every logic signal referenced to that ground shifts with it. Star grounding forces the noisy return to its own path so it never appears in the quiet one.' },
    ],
  },
  {
    id: 12, u: 3, t: 'H-Bridge & Shoot-Through', short: 'H-bridge', xp: 50, mode: 'quiz',
    d: 'Four switches to run a motor both directions — and the failure mode that destroys them all at once.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'What is shoot-through in an H-bridge?', o: ['High and low side of one leg conduct simultaneously, shorting the supply through both', 'Current flowing backwards through the motor', 'The motor stalling', 'Excessive PWM frequency'], a: 0, e: 'For a moment during the transition both devices in a leg can be partially on, creating a near-zero-resistance path from rail to ground. The current is limited only by R&lt;sub&gt;DS(on)&lt;/sub&gt; and layout inductance and can reach hundreds of amps. It usually destroys both devices and often the gate driver too.' },
      { q: 'What prevents it?', o: ['Dead time — a deliberate gap where both devices are off during every transition', 'A larger bulk capacitor', 'A higher PWM frequency', 'A flyback diode'], a: 0, e: 'Dead time delays the turn-on of one device until the other has definitely turned off, accounting for gate charge, driver strength and temperature. Too little and you get shoot-through; too much and the body diode conducts for longer, wasting power and distorting the output. Most dedicated driver ICs generate it internally, which is a strong argument for using one.' },
      { q: 'Why does a high-side N-channel MOSFET need a bootstrap capacitor or charge pump?', o: ['Its source rides at the load voltage, so the gate must be driven above the supply rail', 'To limit inrush', 'To filter the PWM', 'To protect against reverse polarity'], a: 0, e: 'A MOSFET turns on according to V&lt;sub&gt;GS&lt;/sub&gt;. On the high side the source sits at the switched node, which rises to the supply when on — so the gate needs to be roughly 10 V above the rail. A bootstrap capacitor charges while the low side is on and then floats up to provide that. It is also why a high-side switch cannot stay on indefinitely without a true charge pump.' },
      { q: 'Where should the bulk capacitor for an H-bridge be placed?', o: ["Directly across the bridge's supply and ground pins, with the smallest possible loop", 'At the connector', 'Near the MCU', 'Anywhere on the same net'], a: 0, e: 'The commutation loop carries the full motor current switching in nanoseconds. Any loop inductance turns that di/dt into a voltage spike across the devices, exceeding their V&lt;sub&gt;DS&lt;/sub&gt; rating. The capacitor must close that loop physically, at the pins — this is one of the few places where a centimetre of trace genuinely destroys parts.' },
    ],
  },
  {
    id: 13, u: 3, t: 'Inrush & Soft Start', short: 'Inrush', xp: 45, mode: 'quiz',
    d: 'A discharged bulk capacitor is a short circuit at power-on. Limit it or weld your connector.',
    tags: ['Quiz', '3 questions'],
    quiz: [
      { q: 'You hot-plug a board with 1000 µF of bulk capacitance onto a 24 V supply. What is the initial current?', o: ['Limited only by source impedance and wiring — tens to hundreds of amps for a few microseconds', '24 A', 'Zero until the capacitor charges', '1 A'], a: 0, e: 'An uncharged capacitor holds zero volts, so at the instant of connection the full supply appears across the loop resistance, which may be milliohms. The result pits connector contacts, can trip upstream protection, and produces a di/dt that radiates. Nothing in the schematic hints at it.' },
      { q: 'An NTC thermistor is a common inrush limiter. What is its weakness?', o: ['It stays hot and low resistance — a brief power cycle sees almost no limiting', 'It is too expensive', 'It fails short', 'It only works on AC'], a: 0, e: 'The NTC limits when cold and drops to a low resistance once warmed by the load current, which is exactly what you want in steady state. But if power is removed and reapplied within a few seconds it is still hot, so the next inrush is unlimited. For equipment that may be power-cycled quickly, an active soft-start is the correct answer.' },
      { q: 'How does a MOSFET soft-start circuit limit inrush?', o: ['An RC on the gate ramps it slowly, so the device acts as a controlled resistance during charging', 'It switches on faster', 'It disconnects the capacitor', 'It adds a fixed series resistor'], a: 0, e: 'Ramping the gate keeps the MOSFET in its linear region for the duration of the charge, so it behaves as a resistance that falls gradually. The critical design check is the energy the device absorbs while doing this — it must stay inside the safe operating area for that pulse width, which is a curve in the datasheet, not a single number.' },
    ],
  },
  /* U4 */
  {
    id: 14, u: 4, t: 'Reading a Datasheet', short: 'Datasheet', xp: 40, mode: 'quiz',
    d: 'The single most valuable hardware skill. Absolute maximums, recommended operating conditions, and the difference between them.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A datasheet lists <code>Absolute Maximum V_DD = 4.0 V</code> and <code>Recommended Operating = 1.8–3.6 V</code>. You design for 3.9 V. What happens?', o: ['It may work, but no parameter in the datasheet is guaranteed and life is reduced', 'It works fine — 3.9 V is under the maximum', 'It fails immediately', 'Only the current draw changes'], a: 0, e: 'Absolute maximums are the point of damage, not an operating range. Between the recommended maximum and the absolute maximum the part is out of specification: timing, accuracy, and leakage are all unguaranteed, and stress accumulates. Design inside the recommended conditions, always.' },
      { q: 'A parameter is given as <code>min / typ / max</code>. Which column should your design tolerate?', o: ['Both min and max — typ is only a statistical centre', 'Typ, since most parts land there', 'Max only', 'Min only'], a: 0, e: 'Typical is what a part measured on an average day. It carries no guarantee. If your circuit only works at the typical value it will fail on a percentage of production units. Design so that every combination of min and max across all parts still works — that is worst-case analysis.' },
      { q: 'What does a <code>θ_JA</code> figure of 60 °C/W tell you?', o: ['Junction rises 60 °C above ambient for each watt dissipated', 'The part fails above 60 °C', 'It can dissipate 60 W', 'Thermal resistance of the PCB alone'], a: 0, e: 'Junction-to-ambient thermal resistance. Dissipate 1.5 W and the die runs 90 °C above ambient — at 25 °C ambient that is 115 °C, close to a typical 125 °C maximum. Note θ_JA is measured on a specified test board, so your real number depends on your copper area.' },
      { q: 'An I²C sensor lists <code>V_IH min = 0.7 × V_DD</code>. Your MCU outputs 3.3 V and the sensor runs at 1.8 V. What is wrong?', o: ["3.3 V exceeds the sensor's absolute maximum input — you need level shifting", 'Nothing, 3.3 V is above the threshold', 'You need a stronger pull-up', 'The clock is too fast'], a: 0, e: 'Meeting V_IH is necessary but not sufficient — you must also respect the absolute maximum input voltage, usually V_DD + 0.3 V. Driving 3.3 V into a 1.8 V part forward-biases its ESD protection diode into the supply rail, which either damages the part or drags the whole 1.8 V rail up.' },
    ],
  },
  {
    id: 32, u: 4, t: 'Choosing a Serial Bus', short: 'SPI/I²C/UART', xp: 45, mode: 'quiz',
    d: 'SPI, I²C or UART. Three buses, three completely different trade-offs — and picking wrong costs you a board spin.',
    tags: ['Quiz', '5 questions'],
    quiz: [
      { q: 'You need to stream from an ADC at 20 Mbit/s. Which bus?', o: ['SPI — full duplex, push-pull drivers, tens of Mbit/s', 'I²C — up to 3.4 Mbit/s in high-speed mode', 'UART at 1 Mbit/s', 'RS-232'], a: 0, e: 'SPI is the only one of the three in that class. It reaches tens of Mbit/s because it is push-pull and synchronous with a dedicated clock — no open-drain RC edge to wait for and no framing overhead. The price is four wires plus one chip select per device.' },
      { q: 'You have eleven small sensors and very few free pins. Which bus, and what is the cost?', o: ['I²C — two wires for all of them, but you share bandwidth and must manage addresses', 'SPI — simplest to wire', 'UART — one per sensor', 'Separate GPIO for each'], a: 0, e: 'I²C addresses devices in-band, so eleven parts still need only SDA and SCL. The costs are real: every device shares the bandwidth, address collisions between identical parts force you to use address pins or a mux, and one device holding the line low hangs the entire bus.' },
      { q: 'Why does SPI scale badly to many devices while I²C does not?', o: ['SPI selects devices with a dedicated chip-select pin each; I²C addresses them over the data lines', 'SPI is slower with more devices', 'I²C has more wires', 'SPI cannot be shared at all'], a: 0, e: 'Every SPI peripheral needs its own CS line from the controller, so ten devices means ten pins on top of the three shared ones. I²C spends one byte of protocol instead of a pin. That single difference is usually what decides the choice on a pin-limited MCU.' },
      { q: 'A GPS module sits 3 m away on a cable. Which is the right interface?', o: ['UART — asynchronous, no clock to skew, point to point over distance', 'I²C — fewest wires', 'SPI — fastest', 'Parallel bus'], a: 0, e: "I²C is designed for on-board use: its 400 pF total bus capacitance budget is consumed quickly by cable, and there is no noise margin to spare. SPI carries a separate clock that skews against data over length. UART has no clock line at all — each end recovers timing from the start bit — which is exactly why it survives cable runs." },
      { q: 'Which statement about I²C bus capacitance is correct?', o: ['The specification caps total bus capacitance at 400 pF, which limits length and device count', 'Capacitance does not matter below 100 kHz', 'Only the controller capacitance counts', 'Pull-ups eliminate the effect'], a: 0, e: 'Every device pin, connector and centimetre of trace adds capacitance, and the pull-up must charge all of it within the specified rise time. Past 400 pF you cannot meet the rise time at any practical pull-up value — stronger pull-ups start exceeding the 3 mA sink limit of the output stages. That is the real reason I²C stays on the board.' },
    ],
  },
  {
    id: 33, u: 4, t: 'RS-485, Cables & Termination', short: 'RS-485', xp: 55, mode: 'quiz',
    d: 'Off the board and down a cable. Differential signalling, characteristic impedance, and the two resistors everyone forgets.',
    tags: ['Quiz', '5 questions'],
    quiz: [
      { q: 'Why does RS-485 reach 1200 m where RS-232 struggles past 15 m?', o: ['RS-485 is differential — noise couples equally into both wires and the receiver subtracts it', 'RS-485 uses higher voltage', 'RS-485 is faster', 'RS-232 has no ground wire'], a: 0, e: 'RS-232 is single-ended: it measures each signal against a ground that may be at a different potential at the far end, and every bit of coupled noise adds directly to the signal. RS-485 sends the same data on two wires in opposite polarity. Interference couples into both nearly equally as common mode, and a differential receiver rejects it. That is the entire reason it survives an industrial cable run.' },
      { q: 'How many 120 Ω termination resistors belong on an RS-485 bus?', o: ['Exactly two — one at each physical end of the cable', 'One at the controller only', 'One per device', 'None, termination is optional'], a: 0, e: 'The resistors match the cable\'s characteristic impedance so the signal is absorbed instead of reflected at the ends. Two is correct because a transmission line has two ends. Adding one at every node loads the bus down until no driver can produce a valid level — a classic failure when someone adds a device using a board with termination jumpered on by default.' },
      { q: 'Why is 120 Ω the standard value?', o: ['It matches the characteristic impedance of typical twisted pair, around 100–120 Ω', 'It is the maximum the driver can sink', 'It gives the lowest power', 'It is an arbitrary convention'], a: 0, e: 'Characteristic impedance is set by the geometry of the pair — conductor spacing, diameter and insulation — not by its length. Standard RS-485 twisted pair lands near 120 Ω, so a matched termination absorbs the incoming wave completely. Use 50 Ω coax with a 120 Ω terminator and you get reflections regardless of how carefully you routed the board.' },
      { q: 'What do <b>fail-safe bias</b> resistors do, and where do they go?', o: ['They hold the idle bus in a defined state; one pull-up and one pull-down, once per bus', 'They terminate the line', 'They protect against ESD', 'They are fitted at every node'], a: 0, e: 'When no driver is enabled the bus is floating, and a differential receiver with near-zero volts across its inputs outputs noise — which the UART reads as framing errors or phantom start bits. A pull-up on A and a pull-down on B, commonly 4.7 kΩ, force a defined idle. Fit them once for the whole bus: repeating them at every node skews the idle level and reduces the noise margin for everyone.' },
      { q: 'Which topology does a multidrop differential bus require?', o: ['A single daisy chain with short stubs — star wiring creates unterminated reflections', 'A star from the controller', 'Any topology, it is robust', 'A ring'], a: 0, e: 'A transmission line can only be terminated at its two ends. Each branch of a star is an unterminated line whose reflections land back on the bus and corrupt edges. The rule is one linear run from end to end, with every device on a stub short enough that its round-trip is a small fraction of the edge rate.' },
    ],
  },
  {
    id: 15, u: 4, t: 'Pull-ups לאפיק I²C', short: 'I²C', xp: 50, mode: 'build',
    d: 'רכיבי I²C יכולים רק למשוך את הקו למטה. בלי pull-ups האפיק לעולם לא חוזר ל-high ושום דבר לא עובד.',
    tags: ['בנייה', 'Open drain'],
    concept: {
      h: 'אפיק open-drain צריך pull-ups חיצוניים',
      b: `<p>I²C משתמש בשני חוטים, <code>SDA</code> ו-<code>SCL</code>, משותפים לכל רכיב על האפיק. כדי לאפשר לכל רכיב לדבר בלי לקצר נגד רכיב אחר, הפלטים הם <b>open drain</b>: רכיב יכול למשוך את הקו ל-GND, או לשחרר. הוא לעולם לא יכול לנהוג (drive) ל-high.</p>
   <p>אז משהו צריך להחזיר את הקו למקור, וזה <b>נגד ה-pull-up</b>. בלעדיו האפיק נופל לכל רמה שדליפה משאירה אותו בה ונשאר שם. זה הכשל הנפוץ ביותר בהעלאת I²C, והוא נראה בדיוק כמו חיישן מת.</p>
   <p>הערך הוא מסחר אמיתי מול מהירות האפיק. כל פין רכיב, כל מחבר, וכל סנטימטר מסילה מוסיפים קיבול — נגיד 100 pF ללוח קטן. ה-pull-up צריך לטעון את הקיבול הזה בקבוע זמן RC:</p>
   <div class="fml">t<sub>rise</sub> ≈ 0.85 · R · C</div>
   <p>מפרט I²C מגביל את זמן העלייה ל-1 µs במצב standard ו-300 ns במצב fast. עם 100 pF, pull-up של 10 kΩ נותן בערך 850 ns — בסדר ב-100 kHz, איטי בהרבה מדי ב-400 kHz. <b>4.7 kΩ</b> היא הפשרה השכיחה; אפיקים עמוסים מאוד יורדים ל-2.2 kΩ.</p>
   <p><b>תבנה את זה:</b> משוך את <code>SDA</code> ל-3.3 V ותן לכפתור לפעול כרכיב ה-open-drain שמושך אותו למטה. הכנס את ה-pull-up לתחום 1 kΩ – 10 kΩ.</p>`,
    },
    palette: ['R', 'SW'],
    preset: [
      { id: 'PWR1', type: 'V33', x: 180, y: 70 },
      { id: 'GND1', type: 'GND', x: 180, y: 390 },
      { id: 'U1', type: 'IO', x: 530, y: 230 },
    ],
    goal: 'SDA נמצא ב-high במנוחה עם pull-up של 1 kΩ – 10 kΩ',
    check: (s, S) => checkI2C(s, S),
  },
  {
    id: 16, u: 4, t: 'Analog Front End', short: 'AFE', xp: 50, mode: 'quiz',
    d: 'Anti-alias filtering, input protection, and driving an ADC without destroying its accuracy.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Why must an anti-alias filter be analog, before the ADC?', o: ['Once a signal above Nyquist is sampled it folds into the band and no later processing can remove it', 'Digital filters are too slow', 'It reduces ADC power', 'To protect the input'], a: 0, e: 'Aliasing is not distortion added on top of the signal, it is frequency content moved on top of it — a 51 kHz tone sampled at 100 kHz becomes indistinguishable from 49 kHz. The information is destroyed at the sampling instant. The filter must remove it before the sample-and-hold, in the analog domain.' },
      { q: "A SAR ADC's input is a switched capacitor. What does that mean for the driving circuit?", o: ['Each sample dumps charge that the driver must settle within the acquisition window', 'The input is high impedance so anything can drive it', 'It needs a current source', 'It must be DC coupled'], a: 0, e: 'Closing the sampling switch connects your source to an uncharged capacitor, producing a current spike. The driver must recover to within half an LSB before the converter takes the sample. This is why ADC datasheets recommend a specific op-amp and an RC charge reservoir at the pin — a high-impedance source alone will not settle in time.' },
      { q: 'What is the standard input protection for an ADC pin exposed to a connector?', o: ['Series resistance plus clamping to the rails, sized so the clamp current stays within the injection limit', 'A capacitor to ground', 'A ferrite bead', 'Nothing, the internal diodes suffice'], a: 0, e: 'Internal ESD diodes will clamp, but they are rated for a small injected current — commonly ±5 mA — and exceeding it disturbs the conversion on other channels or damages the die. A series resistor sets that current for a given overvoltage. Schottky clamps to the rails take the bulk before the internal diodes engage.' },
      { q: 'Why does injected current on one ADC channel corrupt readings on another?', o: ['Injection forward-biases a substrate path that couples into the shared multiplexer and reference', 'The channels share a single pin', 'Firmware error', 'It does not happen'], a: 0, e: 'Beyond the rails the pin\'s protection diode conducts into the substrate, and that current disturbs the shared analog front end — the multiplexer, the sampling capacitor and sometimes the reference. The classic symptom is a channel that reads wrong only when a completely unrelated input is overdriven.' },
    ],
  },
  {
    id: 17, u: 4, t: 'Current Sensing', short: 'Sensing', xp: 50, mode: 'quiz',
    d: 'Shunt sizing, Kelvin connections, and why the sense traces must not carry load current.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Why is a current-sense shunt connected with four terminals rather than two?', o: ['Kelvin sensing keeps the solder and trace resistance out of the measurement', 'For higher current capability', 'To allow bidirectional sensing', 'For mechanical strength'], a: 0, e: 'A 5 mΩ shunt is comparable to the resistance of its own solder joints and the copper approaching it. If the sense connection shares that path, the drop across it adds to your reading. Kelvin connections tap the resistive element itself, so only the intended resistance is measured — and it is why sense traces must leave from the inner pads and carry no load current.' },
      { q: 'You choose a shunt for 5 A. What is the trade-off in picking its value?', o: ['Larger resistance gives more signal but more dissipation and more voltage lost from the rail', 'Larger is always better', 'Smaller is always better', 'Value does not affect accuracy'], a: 0, e: 'At 5 A a 10 mΩ shunt gives 50 mV of signal and burns 250 mW; a 1 mΩ shunt gives 5 mV and burns 25 mW. The small signal then demands a low-offset amplifier, because amplifier offset and shunt TCR become the dominant errors. You are trading power and rail headroom against how good the amplifier has to be.' },
      { q: 'High-side or low-side sensing — what does low-side cost you?', o: ["It puts a shunt in the ground path, so the load's ground is no longer at zero volts", 'It cannot measure DC', 'It requires a more expensive amplifier', 'It is less accurate at high current'], a: 0, e: 'Low-side is easy because the amplifier works near ground, but the load now sits above true ground by I·R&lt;sub&gt;shunt&lt;/sub&gt;, which corrupts any signal referenced to it and means a short to chassis bypasses your sensing entirely. High-side keeps ground intact but demands a common-mode range up to the supply.' },
      { q: "What does a shunt's temperature coefficient do to a current limit?", o: ['The resistance drifts with self-heating, so the trip point moves as the load rises', 'Nothing, it is calibrated out', 'It only affects accuracy at low current', 'It changes the power rating'], a: 0, e: 'The shunt heats itself with the very current you are measuring, so its resistance rises, so the measured voltage rises faster than the current does. For protection circuits this shifts the trip point exactly when it matters. Metal-alloy shunts specified at a few ppm/°C exist for this reason.' },
    ],
  },
  /* U5 */
  {
    id: 18, u: 5, t: 'MCU Minimum Circuit', short: 'MCU', xp: 55, mode: 'quiz',
    d: 'Every power pin pair, every decoupling cap, VDDA filtering — what an STM32 needs before it will boot.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'An LQFP-48 MCU has three VDD/VSS pin pairs. How many decoupling capacitors do you place?', o: ['One 100 nF per pair, each at its own pin, plus one bulk 4.7–10 µF for the device', 'One 100 nF for the whole chip', 'One per side of the package', 'Only bulk capacitance is needed'], a: 0, e: 'Each pin pair feeds a different part of the die through its own bond wire inductance. A single shared capacitor cannot service all of them, because the inductance between pins is exactly what you are trying to bypass. The rule is one small ceramic per pair, placed at that pair, plus bulk for the slower demand.' },
      { q: 'Why does VDDA usually get a ferrite bead from VDD rather than a direct connection?', o: ['It isolates the ADC reference from digital switching noise on the main rail', 'It drops the voltage to the analog level', 'It limits inrush current', 'It is required for ESD'], a: 0, e: 'The ADC measures against VDDA, so any noise on that rail appears directly as conversion error. On a 12-bit ADC at 3.3 V one LSB is 0.8 mV, and even small digital ripple costs you real bits. A bead plus its own decoupling forms a low-pass filter between the noisy digital rail and the analog reference.' },
      { q: 'What is the purpose of the VCAP pin on many STM32 parts?', o: ['It decouples the internal core regulator and needs a specified capacitor value and ESR', 'It is a backup battery input', 'It sets the clock frequency', 'It is a spare GPIO'], a: 0, e: 'An internal LDO generates the 1.2 V core supply, and VCAP is where its output capacitor goes. The datasheet specifies both value and ESR because that capacitor sets the regulator loop stability. Omit it and the part either fails to start or behaves erratically — and it is invisible on a schematic review unless you know to look for it.' },
      { q: 'Your board boots on the bench but resets randomly when a motor starts. Most likely cause?', o: ['Motor current through shared ground shifts the reference and dips VDD below brown-out', 'The firmware has a bug', 'The MCU is too slow', 'The crystal is the wrong frequency'], a: 0, e: 'Inrush and commutation currents develop a voltage across the shared ground return and pull the rail down. The brown-out detector is doing exactly its job. The fix is layout, not firmware: separate the motor return path, add bulk capacitance at the motor supply, and join the grounds at a single point near the source.' },
    ],
  },
  {
    id: 19, u: 5, t: 'Reset & Boot Pins', short: 'Reset', xp: 40, mode: 'quiz',
    d: 'The pins that decide whether your board starts at all — and the classic mistakes that leave it bricked.',
    tags: ['Quiz', '3 questions'],
    quiz: [
      { q: 'Why does an MCU reset pin usually need a capacitor to ground?', o: ['To hold reset asserted while the supply rises to a valid level', 'To filter EMI only', 'To speed up the reset', 'Reset pins never need capacitors'], a: 0, e: 'The core cannot execute reliably until VDD is valid. An RC on the reset pin holds it low while the rail ramps, releasing it only once the supply has settled. Many MCUs have internal power-on reset, but an external RC adds margin on slow-ramping or noisy supplies.' },
      { q: 'You add a 10 µF capacitor to the reset pin for extra noise immunity. What breaks?', o: ['The debugger can no longer pull reset low quickly enough to connect', 'Nothing, more capacitance is always better', 'The MCU never leaves reset', 'Power consumption rises sharply'], a: 0, e: 'The debug probe drives reset with a weak open-drain output. Too much capacitance means it cannot pull the pin low within the expected window, and connection fails intermittently — a genuinely painful bug to chase. 100 nF is the conventional value for a reason.' },
      { q: 'A BOOT0 pin is left floating on a production board. What is the risk?', o: ['The MCU may randomly enter the bootloader instead of running your firmware', 'It only affects debugging', 'Nothing, it is sampled once', 'The MCU will not power up'], a: 0, e: 'BOOT0 is sampled at reset to choose the boot source. Floating, it samples whatever noise is present — so some boards boot your application and some sit in the ROM bootloader looking completely dead. Always tie boot-mode pins with a resistor, never leave them to chance.' },
    ],
  },
  {
    id: 20, u: 5, t: 'Crystals & Load Capacitors', short: 'Crystal', xp: 50, mode: 'quiz',
    d: 'Load capacitance, stray capacitance, drive level, and the guard ring that keeps the oscillator alive.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A crystal specifies <code>C&lt;sub&gt;L&lt;/sub&gt; = 12 pF</code>. What capacitors do you fit?', o: ['Two capacitors of about 2·(C&lt;sub&gt;L&lt;/sub&gt; − C&lt;sub&gt;stray&lt;/sub&gt;), roughly 18 pF each for 3 pF of stray', 'Two 12 pF capacitors', 'One 12 pF capacitor', '12 pF total across the crystal'], a: 0, e: 'The crystal sees the two load capacitors in series, plus pin and trace capacitance. So C&lt;sub&gt;L&lt;/sub&gt; = C1·C2/(C1+C2) + C&lt;sub&gt;stray&lt;/sub&gt;. Fitting 12 pF each gives an effective load of about 9 pF, and the oscillator runs fast — typically tens of ppm, enough to break USB or drift a real-time clock noticeably.' },
      { q: "What happens if the oscillator's drive level exceeds the crystal's rating?", o: ['The quartz is mechanically overdriven — ageing accelerates and it can fracture', 'Frequency rises', 'Nothing, more drive is more reliable', 'Startup fails'], a: 0, e: 'A crystal is a vibrating mechanical resonator. Excess drive means excess amplitude, which accelerates ageing and can crack the blank. Low-power crystals in small packages are especially vulnerable. The fix is a series resistor between the driver output and the crystal, sized so drive sits inside the specification.' },
      { q: 'Why is a guard ring recommended around a crystal?', o: ['It intercepts coupled noise and keeps stray capacitance to other signals from pulling the frequency', 'It provides mechanical support', 'It shields against heat', 'It is only cosmetic'], a: 0, e: 'The oscillator node is high impedance and low amplitude, so a neighbouring fast signal couples into it easily and can inject jitter or stop oscillation altogether. A grounded ring plus a solid plane beneath, and no other trace routed underneath, is standard practice for a reason.' },
      { q: 'Your crystal starts reliably at 25 °C but not at −20 °C. Most likely cause?', o: ['Insufficient negative resistance margin — the loop gain is too low at temperature extremes', 'The load capacitors are too small', 'The crystal is faulty', 'Supply noise'], a: 0, e: "Oscillator startup requires the amplifier's negative resistance to exceed the crystal's ESR by a healthy factor, usually 5 times, across the full range. ESR rises at cold and with ageing. A design that starts at room temperature with a margin of 2 is not a working design, it is a coincidence." },
    ],
  },
  {
    id: 21, u: 5, t: 'Debug & Test Access', short: 'SWD', xp: 40, mode: 'quiz',
    d: 'Four pins that save you a week, and the test points that make production possible.',
    tags: ['Quiz', '3 questions'],
    quiz: [
      { q: 'Why does an SWD header need a ground pin immediately adjacent to the signals?', o: ['It provides the return path — a distant ground makes the loop large and the signals unreliable', 'For safety', 'To power the probe', 'To detect connection'], a: 0, e: 'SWD runs at tens of megahertz. Its return current needs a low-inductance path back alongside the signal, and a ground pin at the other end of the connector creates a large loop that turns the ribbon into an antenna and corrupts edges. This is why standard debug pinouts alternate signal and ground.' },
      { q: 'What is the risk of leaving a debug interface enabled on a shipped product?', o: ['Anyone with physical access can read firmware and memory unless readout protection is set', 'It draws too much power', 'It causes EMC failures', 'There is no risk'], a: 0, e: 'SWD gives full memory and register access. On a product with any intellectual property or credentials in flash, shipping with debug open means shipping the firmware. MCUs provide readout protection levels; enabling them is usually irreversible on the highest setting, which is precisely the point.' },
      { q: 'Why do production boards need test points rather than probing pads directly?', o: ['A bed-of-nails fixture needs defined, exposed, spaced targets to make reliable contact', 'Test points look more professional', 'They reduce EMI', 'They are required by standards'], a: 0, e: 'In-circuit test presses spring pins against the board. They need bare copper of a minimum diameter, on a grid the fixture can build to, on one side where possible, and away from tall components. Retrofitting them after layout is painful, which is why test strategy belongs in the placement phase.' },
    ],
  },
  /* U6 */
  {
    id: 40, u: 6, t: 'What a PCB Is Made Of', short: 'Materials', xp: 40, mode: 'quiz',
    d: 'Before any rule makes sense: laminate, prepreg, copper foil, and what FR-4 actually is.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'What is FR-4?', o: ['Woven glass cloth impregnated with epoxy resin — <b>FR</b> means flame retardant, <b>4</b> is the grade', 'A type of copper alloy', 'A solder mask material', 'A surface finish'], a: 0, e: 'FR-4 is the substrate: fibreglass cloth in cured epoxy, clad with copper foil. Because the glass is woven, the material is not uniform — it is stiffer and has different dielectric properties along the weave than across it, which matters once signals get fast enough to notice.' },
      { q: 'What is the difference between <b>core</b> and <b>prepreg</b>?', o: ['Core is cured laminate already clad with copper; prepreg is uncured resin sheet that bonds layers together', 'They are the same material', 'Core is thinner', 'Prepreg contains no glass'], a: 0, e: 'A multilayer board is a sandwich: cores carry the inner copper layers, prepreg sheets go between them and melt under heat and pressure to bond the stack. That is why prepreg thickness is only nominal before pressing — it flows, and the finished dimension depends on how much copper it has to flow around.' },
      { q: 'Your fab quotes <code>Tg 150</code>. What does that tell you?', o: ['Glass transition temperature — above 150 °C the resin softens and the board loses dimensional stability', 'It survives 150 °C indefinitely', 'The maximum operating temperature is 150 °C', 'It has 150 layers available'], a: 0, e: 'Above Tg the resin changes from rigid to rubbery, expanding sharply in the Z axis and stressing plated barrels. Standard FR-4 sits near 130–140 °C, which is uncomfortably close to lead-free reflow peaks around 245 °C. High-Tg material is a routine upgrade for multilayer or lead-free assembly, and it is cheap insurance.' },
      { q: 'What is <code>Er</code> (dielectric constant) used for in design?', o: ['It sets propagation delay and, with geometry, the trace impedance', 'It measures thermal conductivity', 'It is the flame rating', 'It sets the copper thickness'], a: 0, e: 'Er around 4.2–4.5 for FR-4 determines how fast a signal travels and how much capacitance a trace has to its reference plane. Because it also varies with frequency and with glass weave, controlled-impedance and high-speed designs often move to materials with a lower and more stable Er.' },
    ],
  },
  {
    id: 41, u: 6, t: 'Copper Weight & Stackup Basics', short: 'Copper', xp: 40, mode: 'quiz',
    d: 'One ounce, two ounce, half ounce — what the numbers mean and what they cost you.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: '<code>1 oz copper</code> refers to what physical dimension?', o: ['One ounce of copper spread over one square foot — about 35 µm thick', 'The weight of the finished board', 'A copper purity grade', 'The trace width'], a: 0, e: 'It is a weight-per-area convention that translates to thickness: 1 oz is roughly 35 µm, 2 oz about 70 µm, 0.5 oz about 17 µm. Every current-capacity and impedance calculation needs the thickness, so the ounce figure is really a thickness in disguise.' },
      { q: 'Why can outer layers end up thicker than the copper you ordered?', o: ['Plating adds copper during via metallisation, typically 1 oz becomes closer to 1.5–2 oz', 'Etching removes copper unevenly', 'The mask adds thickness', 'They do not'], a: 0, e: 'Making the holes conductive means plating the whole outer surface, and that plating lands on your traces as well. Fabs quote base foil plus plating, so an outer layer specified as 1 oz finishes noticeably thicker. Inner layers are not plated, which is one reason they etch finer features.' },
      { q: 'Why do inner layers achieve finer trace and space than outer layers?', o: ['Inner layers are not plated, so the etch is more predictable and features stay tighter', 'Inner layers use better copper', 'Inner layers are cooled during etching', 'Outer layers are thicker only for cost'], a: 0, e: 'Plating thickness varies across the panel, and etching thicker copper produces more undercut, so outer-layer geometry is less controlled. If a design needs very fine pitch routing, moving those tracks to an inner layer is often the cheaper fix.' },
      { q: 'When do you actually need 2 oz copper?', o: ['When power traces carry currents where 1 oz would need impractically wide copper', 'For all four-layer boards', 'To improve signal integrity', 'Whenever the board is large'], a: 0, e: 'Doubling thickness halves the width needed for the same temperature rise, which matters when amps are involved and area is short. The costs are real: higher price, coarser minimum trace and space because thick copper etches with more undercut, and larger mask clearances.' },
    ],
  },
  {
    id: 42, u: 6, t: 'How a Board Is Manufactured', short: 'Fab process', xp: 45, mode: 'quiz',
    d: 'Image, etch, drill, plate, mask, finish. Understand the process and every design rule explains itself.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Why does etching produce trapezoidal rather than rectangular traces?', o: ['Etchant attacks from above and sideways at once, undercutting the top of the track', 'The copper is deposited at an angle', 'Heat distorts the copper', 'They are rectangular'], a: 0, e: 'The etch works down and outward simultaneously, so the top of the trace is narrower than the base. This <b>etch factor</b> is why fabs specify minimum trace width by copper weight, and why impedance models use a trapezoidal cross-section rather than a rectangle.' },
      { q: 'What makes a via conductive?', o: ['Electroless copper seeds the drilled barrel, then electroplating builds it up', 'The drill smears copper down the hole', 'A conductive ink is injected', 'The layers touch inside the hole'], a: 0, e: 'Drilling leaves a bare, non-conductive resin and glass wall. A thin electroless copper layer makes it conductive enough to electroplate, then plating builds the barrel to about 20–25 µm. Since the same bath plates your surface traces, hole plating and outer copper thickness are linked.' },
      { q: 'What is <b>aspect ratio</b> and why does it limit via size?', o: ['Board thickness divided by drill diameter — plating chemistry cannot reach reliably down deep, narrow holes', 'Trace width over spacing', 'Pad size over hole size', 'Board length over width'], a: 0, e: 'A standard fab handles roughly 8:1 or 10:1. On a 1.6 mm board that means about 0.2 mm minimum drill. Push past it and the barrel plates thin in the middle, where it later cracks under thermal cycling — a failure that passes electrical test and appears in the field.' },
      { q: 'Why is solder mask applied before the surface finish?', o: ['So the finish only lands on exposed pads, keeping the rest of the copper protected', 'It is applied after', 'Mask cannot survive the finish chemistry', 'To make it flat'], a: 0, e: 'Mask defines what is a pad and what is not. Applying it first means expensive finish chemistry only touches the areas that will be soldered, and everything else stays sealed against oxidation and shorts. It is also why mask-defined pads behave differently from copper-defined ones.' },
    ],
  },
  {
    id: 43, u: 6, t: 'Surface Finish & Solder Mask', short: 'Finish', xp: 40, mode: 'quiz',
    d: 'HASL, ENIG, OSP — the thin layer between your copper and a reliable joint.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Why is HASL a poor choice for fine-pitch components?', o: ['Hot air levelling leaves an uneven dome of solder, so tight pads are not coplanar', 'It oxidises immediately', 'It is not RoHS compliant', 'It costs more than ENIG'], a: 0, e: 'HASL blows molten solder off the board with hot air, leaving a surface that varies by tens of microns. A 0.4 mm pitch QFN or BGA needs pads within a few microns of one another, so the uneven surface causes opens and bridges. HASL remains perfectly good for through-hole and larger passives, and it is the cheapest option.' },
      { q: 'ENIG has a known failure mode. What is it?', o: ['Black pad — corrosion of the nickel layer during gold plating, giving brittle joints that fail later', 'The gold dissolves and shorts', 'It cannot be reworked', 'It oxidises within days'], a: 0, e: 'The gold is only a protective skin; the nickel underneath does the work. If the immersion gold process over-corrodes the nickel, the joint looks acceptable and passes test, then fractures under mechanical or thermal stress. It is a process-control issue, which is why ENIG is a place to care which fab you use.' },
      { q: 'What does <b>solder mask expansion</b> control?', o: ['How much larger the mask opening is than the pad, setting copper-defined or mask-defined pads', 'The thickness of the mask', 'The colour saturation', 'The distance between boards on a panel'], a: 0, e: 'A positive expansion exposes copper beyond the pad edge — copper-defined, giving a fillet all round. Zero or negative makes the mask overlap the pad — mask-defined, common for BGA balls because it controls the ball diameter precisely. Choosing wrongly for a BGA is a well-known cause of poor yield.' },
      { q: 'Why does a mask sliver between fine-pitch pads matter?', o: ['Mask thinner than about 0.1 mm does not adhere and flakes off, allowing solder bridges', 'It only affects appearance', 'It changes impedance', 'It blocks optical inspection'], a: 0, e: 'Below roughly 0.1 mm the mask has too little contact area and lifts during assembly. Once gone, the pads are bare and paste bridges them. Fabs usually flag it, but the decision — accept mask-defined pads, adjust the footprint, or move to a finer-capability fab — belongs to you.' },
    ],
  },
  {
    id: 44, u: 6, t: 'Design Rules, DFM & Cost', short: 'DFM', xp: 45, mode: 'quiz',
    d: 'Where minimum trace, space and drill actually come from, and which choices double your invoice.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A fab advertises <code>4/4 mil</code> capability. What does that mean, and should you design to it?', o: ['Minimum 0.1 mm trace and space — design with margin, because yield falls at the limit', 'It is the drill size', 'It is the board tolerance', 'Always design at the stated minimum'], a: 0, e: "Advertised capability is what the process can achieve, not what it achieves reliably at high yield. Designing at the limit means every panel has fewer good boards, and the fab prices that in or scraps your job. Sitting one step back — 6/6 where 4/4 is possible — costs nothing and buys yield." },
      { q: 'Which single choice most commonly doubles bare-board cost?', o: ['Moving from through-hole vias to blind or buried vias, which requires extra lamination cycles', 'Choosing a different mask colour', 'Adding more silkscreen', 'Making the board slightly larger'], a: 0, e: 'Blind and buried vias mean the stack is drilled, plated and pressed more than once. Each sequential lamination is a full extra pass through the factory. Layer count and board area raise cost roughly linearly; sequential lamination steps it. Exhaust ordinary routing before reaching for them.' },
      { q: 'Why does <b>annular ring</b> appear in every fab\'s rule list?', o: ['It is the copper remaining around a drilled hole after tolerance stack-up, and too little breaks the connection', 'It sets the via resistance', 'It is only a cosmetic requirement', 'It controls impedance'], a: 0, e: 'Drill position, layer registration and hole size all have tolerances that can stack against you. The annular ring is the margin that keeps the pad connected to its barrel when everything lands unfavourably. A tangency or breakout means an open circuit, and it appears on some boards of a batch and not others.' },
      { q: 'Your board is 100 × 80 mm and the panel is 450 × 600 mm. Why should you care?', o: ['Panel utilisation drives price — a small dimension change can fit another board per panel', 'Panel size does not affect cost', 'Larger boards are always cheaper', 'It only affects lead time'], a: 0, e: 'Fabs charge by panel, not by board. If your outline wastes a strip of panel, you pay for that strip on every order. Trimming a few millimetres, or rotating the outline, can sometimes add a whole board per panel — a permanent unit-cost reduction for an hour of work at layout time.' },
    ],
  },
  {
    id: 22, u: 6, t: 'Footprints & Land Patterns', short: 'Footprints', xp: 45, mode: 'quiz',
    d: 'The bridge between the datasheet and reality. Get this wrong and the board is scrap before it powers on.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: "What is the difference between a component's <code>package</code> and its <code>land pattern</code>?", o: ['Package is the physical part; land pattern is the copper you design to solder it to', 'They are the same thing', 'Package is 3D, land pattern is 2D', 'Land pattern includes the silkscreen only'], a: 0, e: 'The package is the manufactured body with its own tolerances. The land pattern is your copper, deliberately larger than the leads to form a solder fillet and absorb placement tolerance. IPC-7351 defines three densities — Most, Nominal, and Least — trading board area against assembly yield.' },
      { q: 'Why is a solder mask sliver between fine-pitch pads a problem?', o: ['Mask thinner than about 0.1 mm flakes off, allowing solder bridges', 'It looks unprofessional', 'It increases capacitance', 'It blocks optical inspection'], a: 0, e: 'Below roughly 0.1 mm the mask does not adhere reliably and lifts during assembly. Once it is gone the pads are bare and paste bridges them. Fabs usually flag it, but the fix is yours: either accept mask-defined pads or move to a fab with finer mask capability.' },
      { q: "A 0805 resistor's land pattern is <b>larger</b> than the component body. Why?", o: ['To form a solder fillet and absorb placement tolerance', 'To dissipate more heat', 'To make hand soldering easier only', 'It is a drawing convention'], a: 0, e: 'The fillet is what gives the joint mechanical strength and makes it inspectable. Pads sized exactly to the terminations produce weak joints that crack under thermal cycling, and automated optical inspection cannot confirm the joint formed at all.' },
      { q: 'What does <code>via-in-pad</code> solve, and what does it cost?', o: ['Escapes fine-pitch BGAs; needs filling and plating or solder wicks away', 'It reduces cost with no downside', 'It improves solder mask adhesion', 'It is only for thermal pads'], a: 0, e: 'On tight-pitch BGAs there is no room to route between balls, so the via goes inside the pad. Unfilled, molten solder wicks down the barrel and starves the joint. The fix is filled-and-capped vias — a real cost adder that must be agreed with the fab before you commit.' },
    ],
  },
  {
    id: 23, u: 6, t: 'מיקום רכיבים', short: 'מיקום', xp: 50, mode: 'pcbonly',
    d: 'המיקום קובע כמה קשה יהיה הניתוב. תעשה אותו טוב, והמסילות כמעט מציירות את עצמן.',
    tags: ['PCB', 'Ratsnest'],
    concept: {
      h: 'מיקום הוא 80% מהלייאאוט',
      b: `<p>מהנדסים חדשים בלייאאוט ממהרים למקם רכיבים כדי להגיע לניתוב, וזה בדיוק הפוך. <b>המיקום קובע אם הניתוב יהיה קל, קשה, או בלתי אפשרי.</b> מעצבים מנוסים מבזבזים כאן את רוב הזמן שלהם.</p>
   <p>סדר העבודה:</p>
   <ul><li><b>רכיבים קבועים ראשון</b> — מחברים, חורי הרכבה, כל דבר עם אילוץ מכני. אלה לא נתונים למשא ומתן.</li>
   <li><b>אז עקוב אחרי זרימת האותות</b> — כניסה בצד אחד, פלט בצד השני. אם הסכמה נקראת משמאל לימין, גם הלוח צריך.</li>
   <li><b>קבץ לפי פונקציה</b> — קטע הספק ביחד, אנלוגי ביחד, דיגיטלי ביחד. השאר את הרגולטור המיתוגי הרועש הרחק מהחלק האנלוגי השקט.</li>
   <li><b>פריקה (decoupling) אחרון, אבל לא נתון למשא ומתן</b> — כל קבל ממש בפין שלו.</li></ul>
   <p>המדד שאפשר למדוד הוא <b>אורך ratsnest כולל</b>. לפני שאתה מנתב מסילה אחת, גרור רכיבים עד שסכום כל חיבורי הגומייה קצר כמו שאתה יכול. קווי ratsnest חוצים פירושם vias בהמשך; nets קצרים יותר פירושם פחות צימוד ופחות השראות.</p>
   <p><b>המשימה שלך:</b> תשיג אורך ratsnest כולל מתחת ל-32 mm בלי שרכיב אחד חופף לשני.</p>`,
    },
    pcbLesson: 'placement',
    goal: 'סך ה-ratsnest מתחת ל-32 mm, בלי חפיפות',
  },
  {
    id: 24, u: 6, t: 'רוחב מסילה וזרם', short: 'רוחב מסילה', xp: 45, mode: 'pcbonly',
    d: 'כמה רחבה מסילה צריכה להיות? יש נוסחה ממשית, וזו לא הנוסחה שרוב האנשים מנחשים.',
    tags: ['PCB', 'IPC-2221'],
    concept: {
      h: 'רוחב נחושת הוא חישוב תרמי',
      b: `<p>מסילה היא נגד. תדחוף זרם דרכה והיא מתחממת. IPC-2221 נותן את הקשר האמפירי בין חתך, זרם, ועליית טמפרטורה:</p>
   <div class="fml">I = k · ΔT<sup>0.44</sup> · A<sup>0.725</sup></div>
   <p>כש-A הוא שטח החתך ב-mils², ΔT היא העלייה המורשית ב-°C, ו-k הוא 0.048 לשכבות חיצוניות או 0.024 לפנימיות — <b>מסילות פנימיות נושאות בערך חצי</b>, כי אין להן אוויר להעביר חום בהסעה.</p>
   <p>לנחושת סטנדרטית של 1 oz העובי הסופי הוא בערך 35 µm, אז הרוחב נובע ישירות מהשטח. כמה עוגנים ששווה לזכור לשכבות חיצוניות 1 oz בעליית 10 °C:</p>
   <ul><li><code>0.25 mm</code> → בערך 0.9 A</li>
   <li><code>0.5 mm</code> → בערך 1.5 A</li>
   <li><code>1.0 mm</code> → בערך 2.5 A</li></ul>
   <p><b>התובנה שרוב האנשים מפספסים:</b> בשביל אותות, החישוב הזה לא רלוונטי. קו I²C של 10 mA צריך מסילה דקה יותר מכל מה שמפעל יכול לתקוע (etch). רוחב מסילת אות נקבע על ידי <b>מינימום ייצור</b> — בדרך כלל 0.15 mm — ועל ידי בקרת עכבה, לעולם לא על ידי חום. רק מסילות הספק הן בעיה תרמית.</p>
   <p><b>המשימה שלך:</b> הלוח הזה מריץ 1.2 A לתוך driver מנוע. נתב אותו, ובחר רוחב ששומר על העלייה מתחת ל-10 °C.</p>`,
    },
    pcbLesson: 'width',
    goal: 'נתב את ה-rail של 1.2 A רחב מספיק',
  },
  {
    id: 25, u: 6, t: 'Ground Planes & Return Paths', short: 'Ground', xp: 50, mode: 'quiz',
    d: 'Current always returns to its source. Where it chooses to flow decides whether your board passes EMC.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'A high-speed signal runs over a solid ground plane. Where does its return current flow?', o: ['Directly beneath the trace, mirroring its path', 'Spread evenly across the whole plane', 'Along the shortest straight line to the source', 'Through the power plane instead'], a: 0, e: 'Above roughly 100 kHz return current follows the path of lowest inductance, not lowest resistance — and that is the path that minimises loop area, which sits directly under the trace. This single fact explains most of high-speed layout.' },
      { q: 'You route a fast signal across a <b>slot</b> in the ground plane. What happens?', o: ['Return current detours around the slot, creating a large loop that radiates', 'Nothing, the plane is still connected', 'The signal is blocked', 'Impedance drops'], a: 0, e: 'The return current cannot cross the slot, so it travels around the end of it. That detour turns a tiny loop into a large one — an efficient antenna, plus crosstalk into everything nearby. Splitting a ground plane under signals is one of the most reliable ways to fail EMC testing.' },
      { q: 'Why is a single solid ground plane usually better than separate analog and digital grounds?', o: ['Split planes create return-path discontinuities that cause more noise than they prevent', 'It uses less copper', 'Split grounds are not manufacturable', 'It lowers board cost'], a: 0, e: 'Splitting was standard advice decades ago and is now mostly obsolete. A solid plane gives every return current a direct path home. The real control is placement: keep noisy and quiet sections in separate areas of the same plane, and never route a signal across the boundary between them.' },
      { q: 'A signal changes layers through a via. What should sit near that via?', o: ['A ground via, so the return current can change reference too', 'A decoupling capacitor', 'A test point', 'Nothing is needed'], a: 0, e: 'When the signal switches reference planes its return current must also get from one plane to the other. Without a nearby ground via it detours to the closest connection — sometimes centimetres away — creating exactly the loop you were avoiding. Stitching vias beside signal vias is standard practice on fast designs.' },
    ],
  },
  {
    id: 26, u: 6, t: 'Vias, Stitching & Thermals', short: 'Vias', xp: 45, mode: 'quiz',
    d: 'Vias as thermal paths and as plane stitching — spacing, count, and the wavelength rule.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: "How do you size the thermal via array under a QFN's exposed pad?", o: ['From the total thermal resistance needed — each via is a parallel path, typically 30–60 °C/W', 'One via is always sufficient', 'As many as physically fit, always', 'Vias do not conduct heat'], a: 0, e: 'Each via is a thermal resistance in parallel, so nine vias give roughly a ninth of the resistance of one. Work backwards from your allowed junction rise and the package θ&lt;sub&gt;JC&lt;/sub&gt;. More vias help until the copper plane they feed becomes the limit — beyond that you need more copper area, not more holes.' },
      { q: 'Why must thermal vias under a pad be filled or tented for assembly?', o: ['Open vias wick solder paste away from the joint, starving it', 'They collect dust', 'They short to the layer below', 'Only for appearance'], a: 0, e: 'Molten solder follows the plated barrel down and out of the joint. On an exposed pad that means voiding and poor thermal contact — exactly what the pad exists to prevent. Options are filled-and-capped vias, or small enough via diameters that surface tension holds the paste, agreed with the assembler beforehand.' },
      { q: 'What sets the spacing of ground stitching vias between planes?', o: ['A fraction of the wavelength at the highest frequency of concern, commonly λ/20 or closer', 'A fixed 10 mm grid', 'Whatever fits', 'Only mechanical considerations'], a: 0, e: 'Stitching vias tie planes together so they behave as one reference. Spaced too far apart, the gap between them resonates and the planes stop looking like a single conductor at high frequency. Scaling with wavelength is why a 100 MHz design and a 2 GHz design have very different stitching densities.' },
      { q: 'Why place ground vias next to a signal via that changes reference planes?', o: ['The return current must also change planes, and without a nearby path it detours and radiates', 'To improve heat flow', 'To strengthen the board', 'To reduce resistance'], a: 0, e: "The signal's return current has been flowing in the plane directly beneath it. When the signal changes layers the return must follow, and its only route between planes is a via or the interplane capacitance. Without a stitching via close by it travels to the nearest connection — sometimes centimetres — creating the large loop you spent the whole layout avoiding." },
    ],
  },
  /* U7 */
  {
    id: 27, u: 7, t: 'Layer Stackup', short: 'Stackup', xp: 55, mode: 'quiz',
    d: 'Why a 4-layer board is almost always worth the money, and which order to put the layers in.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Which 4-layer stackup is the better default for a mixed digital design?', o: ['Signal / GND / Power / Signal', 'Signal / Signal / GND / Power', 'GND / Signal / Signal / GND', 'Power / Signal / Signal / GND'], a: 0, e: 'Putting ground directly beneath the top signal layer gives every fast trace a continuous, adjacent return path, and places the power plane close to ground for useful interplane capacitance. The alternative with two adjacent signal layers invites broadside crosstalk and leaves outer traces referenced to nothing nearby.' },
      { q: 'Why does the prepreg thickness between a signal layer and its reference plane matter?', o: ['It sets both trace impedance and how tightly the return current is coupled', 'It only affects board cost', 'It determines the copper weight', 'It sets the drill size'], a: 0, e: 'Impedance depends on the ratio of trace width to dielectric height. Halve the height and you must roughly halve the width for the same impedance. Thinner dielectric also confines return current under the trace, cutting loop area and crosstalk — which is why fast designs push the reference plane close to the surface.' },
      { q: 'You need controlled impedance. What must the fabricator give you before you fix trace widths?', o: ['Their actual stackup with dielectric constants and finished copper thickness', 'Only the board thickness', 'The panel size', 'The solder mask colour'], a: 0, e: 'Impedance calculators are meaningless without real numbers. Er varies by material, prepreg presses to a different thickness than nominal, and plating adds copper on outer layers. Fabs supply a stackup drawing and will usually adjust widths to hit the target — but only if you tell them which nets are controlled.' },
      { q: 'Why is an asymmetric stackup a manufacturing problem?', o: ['Uneven copper and resin distribution makes the board warp during reflow', 'It costs more to drill', 'It cannot be electrically tested', 'Impedance cannot be controlled'], a: 0, e: 'The laminate cures under heat and pressure. If copper coverage and dielectric thicknesses are not balanced about the centreline, the board bows as it cools and again during reflow — enough to crack BGA joints. This is why fabs ask for balanced copper and why thieving is added to sparse layers.' },
    ],
  },
  {
    id: 28, u: 7, t: 'Differential Pairs', short: 'Diff pairs', xp: 60, mode: 'quiz',
    d: '90 Ω USB, 100 Ω Ethernet — coupling, spacing, length matching, and what actually matters.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'USB 2.0 specifies 90 Ω differential. What does that number describe?', o: ['The impedance between the two conductors when driven differentially', 'The impedance of each trace to ground', 'The termination resistor value', 'The cable resistance'], a: 0, e: 'Differential impedance is measured between the pair when driven with opposite polarity. It is not simply twice the single-ended impedance, because the two traces couple to each other — tighter coupling lowers the differential impedance. That is why spacing is part of the specification, not just width.' },
      { q: 'Within a differential pair, which matching requirement is tightest?', o: ['Intra-pair skew between P and N — mismatch converts differential signal into common mode', 'Total length versus other pairs', 'Distance to the ground plane', 'Via count'], a: 0, e: 'If P and N arrive at different times, the receiver sees a moment where both have the same polarity. That energy becomes common mode, which neither the twisted pair nor the receiver can reject — and common mode is what radiates and fails EMC. Intra-pair matching is typically held to a few mils; inter-pair budgets are far looser.' },
      { q: 'Why should a differential pair never be routed over a plane split?', o: ['The return path breaks, converting differential to common mode and radiating', 'It increases resistance', 'It changes the trace width', 'Solder mask cannot cover it'], a: 0, e: 'Even a tightly coupled pair sends some return current into the reference plane. Crossing a split forces that current to detour around the gap, unbalancing the pair and creating a large radiating loop. This is one of the most common reasons a product fails radiated emissions on its first attempt.' },
      { q: 'Adding a via to one side of a pair costs you what, primarily?', o: ['Skew and an impedance discontinuity — vias must be added symmetrically to both traces', 'Only a small amount of resistance', 'Nothing measurable', 'Extra manufacturing cost only'], a: 0, e: 'A via adds delay and a stub whose capacitance disturbs impedance. Doing it to one trace and not the other injects skew exactly where you were trying to remove it. If a pair must change layers, both traces transition at the same point, with ground vias alongside so the return current can follow.' },
    ],
  },
  {
    id: 29, u: 7, t: 'Capstone: Sensor Board', short: 'Capstone', xp: 120, mode: 'quiz',
    d: 'A complete design from specification. Every decision from the earlier stages, applied at once.',
    tags: ['Quiz', '4 questions'],
    quiz: [
      { q: 'Specification: battery-powered, BME280 over I²C, RS-485 uplink, 10-year life. What dominates the power budget?', o: ['Quiescent current of every always-on part — regulator I&lt;sub&gt;Q&lt;/sub&gt;, pull-ups and bias resistors', 'The sensor conversion current', 'The MCU active current', 'The RS-485 transmit burst'], a: 0, e: 'Active bursts are brief and easy to budget. What kills a ten-year design is anything drawing current continuously: an LDO with milliamps of I&lt;sub&gt;Q&lt;/sub&gt;, 4.7 kΩ I²C pull-ups sitting across the rail, and RS-485 fail-safe bias resistors. Those bias resistors alone can exceed the entire sleep budget, which is why such designs switch the transceiver rail entirely.' },
      { q: 'The RS-485 pair leaves the board through a connector. What belongs at that boundary?', o: ['TVS clamping to the local ground, placed before anything else, with the shield handled deliberately', 'Only the 120 Ω terminator', 'Series resistors alone', 'Nothing, the transceiver is rugged'], a: 0, e: 'A cable is an antenna and a conductor for surge. Protection goes at the entry point, so transient energy is diverted before it reaches internal copper, and it must return to the same ground the transceiver references. Placing the TVS after the transceiver protects nothing — the energy has already passed through it.' },
      { q: 'Your board has a switching regulator and a 12-bit ADC. What is the single most important placement rule?', o: ["Keep the converter's high di/dt loop physically away from the analog section, and never route analog across it", 'Put them as close as possible for short traces', 'Use separate ground planes', 'Place the ADC nearest the connector'], a: 0, e: 'The switching loop — input capacitor, high-side switch, low-side switch — carries fast, large current changes and is the noisiest structure on the board. Physical separation on a shared solid plane beats splitting the plane, because splits break return paths. Distance is free; a corrupted least significant bit is not.' },
      { q: 'Before releasing to fabrication, which review step catches the most expensive errors?', o: ['Checking every footprint against its datasheet drawing, pin 1 included', 'Re-running DRC', 'Checking trace widths', 'Reviewing the silkscreen'], a: 0, e: 'DRC verifies your board against your rules, but it cannot know that your footprint has the wrong pin 1 orientation or a pitch copied from a different package variant. A wrong footprint is unfixable without a respin, while most other errors can be bodged. Footprint verification against the manufacturer\'s recommended land pattern is the highest-value hour in the whole process.' },
    ],
  },
]

/** Trail position among practical (build/pcbonly) stages only — assigned at load time. */
export const PRACTICAL: Lesson[] = LESSONS.filter((l) => l.mode === 'build' || l.mode === 'pcbonly')
PRACTICAL.forEach((l, i) => {
  l.pos = i + 1
})

export const QUESTION_BANK: (QuizQuestion & { topic: string; unit: number })[] = []
LESSONS.filter((l) => l.quiz).forEach((l) => {
  l.quiz!.forEach((q) => {
    QUESTION_BANK.push({ ...q, topic: l.t, unit: l.u })
  })
})

export function lessonById(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}
