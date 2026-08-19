import type {
  DiodePart,
  InductorPart,
  LedPart,
  MosfetPart,
  ResistorPart,
  SchState,
  SolveResult,
  Verdict,
} from './types'
import { solve } from './solver'
import { runTransient } from './transient'
import { fmtI, fmtP, fmtR } from './format'

/**
 * Every check returns Verdict[] with all four fields filled: what is wrong,
 * why it is wrong, the engineering principle, and the fix. Never a bare
 * pass/fail — that's the core of the product (see project CONTEXT.md).
 */

export function checkLED(sim: SolveResult, state: SchState): Verdict[] {
  const leds = state.comps.filter((c) => c.type === 'LED')
  const rs = state.comps.filter((c) => c.type === 'R')
  if (!leds.length) {
    return [
      {
        s: 'bad',
        t: 'אין LED על הלוח',
        what: 'המעגל לא מכיל LED.',
        why: 'המשימה היא להדליק את D1 — אין מה להדליק.',
        prin: 'התחל מהעומס וחזור אחורה לכיוון המקור.',
        fix: 'הקש על <b>LED</b> בפאנל הרכיבים, ואז הקש על הלוח.',
      },
    ]
  }
  const D = leds[0]
  const P = D.part as LedPart
  const an = sim.pinNet[D.id + '.A']
  const ka = sim.pinNet[D.id + '.K']
  const wired = (k: string) => state.wires.some((w) => w.a === k || w.b === k)
  if (!wired(D.id + '.A') || !wired(D.id + '.K')) {
    return [
      {
        s: 'bad',
        t: 'לD1 יש פין צף',
        what: `${!wired(D.id + '.A') ? 'האנודה' : 'הקתודה'} של D1 לא מחוברת לשום דבר.`,
        why: 'אין מעגל סגור, אז זרם לא יכול לזרום. בלוח אמיתי צומת צפה היא לא מוגדרת — היא קולטת רעש ומצטמדת (couples) לכל מה שרץ לידה.',
        prin: 'זרם זורם רק במעגל סגור. לכל net צריך להיות לפחות שני פינים.',
        fix: 'הקש על הפין הלא מחובר, ואז על הפין שאליו אתה רוצה לחבר אותו.',
      },
    ]
  }
  if (an === '+5V' && ka === 'GND' && !rs.length) {
    return [
      {
        s: 'bad',
        t: 'LED מחובר ישירות על 5 V',
        what: `D1 שואב <b>${fmtI(sim.led[0] ? sim.led[0].I : 0)}</b>. <span class="mp">${P.mpn}</span> מדורג ל-20 mA רציף.`,
        why: 'שום דבר לא מגביל את הזרם מלבד המקור וחוטי ההלחמה. Absolute maximum ratings הם גבולות הרס — ה-die מתחמם בתוך אלפיות שנייה.',
        prin: 'רכיב אקספוננציאלי חייב להיות מוטה (biased) על ידי אלמנט לינארי, ולא מוזן ישירות ממקור מתח.',
        fix: 'הכנס נגד בטור בין ה-5 V לאנודה של D1.',
      },
    ]
  }
  if (an === ka) {
    return [
      {
        s: 'bad',
        t: 'D1 מקוצר',
        what: 'שני הפינים של D1 יושבים על אותו net.',
        why: 'קצר על פני ה-LED פירושו אפס וולט על פניו, ולכן אפס זרם בתוכו.',
        prin: 'שני פינים על net אחד הם אותה נקודה חשמלית.',
        fix: 'הסר את החוט שמגשר בין האנודה לקתודה.',
      },
    ]
  }
  const I = sim.led[0] ? sim.led[0].I : 0
  const out: Verdict[] = []
  if (I < 1e-6) {
    if ((sim.V[ka] || 0) > (sim.V[an] || 0) + 0.1) {
      return [
        {
          s: 'bad',
          t: 'D1 מחובר הפוך',
          what: `הקתודה יושבת ${((sim.V[ka] || 0) - (sim.V[an] || 0)).toFixed(2)} V מעל האנודה — מוטה לאחור (reverse-biased), לא מעביר כלום.`,
          why: `דיודה מעבירה זרם בכיוון אחד בלבד. הפוך, היא חוסמת עד לפריצה לאחור — <span class="mp">${P.mpn}</span> מדורג ל-5 V בלבד בכיוון ההפוך, בדיוק איפה ששמת אותו.`,
          prin: 'קוטביות היא לא אופציונלית. המשולש מצביע על כיוון הזרם הקונבנציונלי.',
          fix: 'סבב את D1 פעמיים, או חבר מחדש כך שהאנודה פונה לצד ה-5 V.',
        },
      ]
    }
    return [
      {
        s: 'bad',
        t: 'אין זרם זורם',
        what: 'הזרם הפתור דרך D1 הוא בעצם אפס.',
        why: 'או שהלולאה פתוחה, או שאלמנט בטור חוסם אותה.',
        prin: 'עקוב אחרי הלולאה פין-פין: מקור → מגביל → עומס → GND.',
        fix: 'בדוק שכל חוט באמת נוגע בפין.',
      },
    ]
  }
  const R = rs[0]
  const rr = R ? sim.res.find((z) => z.c.id === R.id) : null
  const vR = rr ? Math.abs((sim.V[rr.a] || 0) - (sim.V[rr.b] || 0)) : 0
  if (I > 0.02) {
    out.push({
      s: 'bad',
      t: `הזרם הישיר הוא ${fmtI(I)}`,
      what: `D1 רץ ב-<b>${fmtI(I)}</b>, מעל המקסימום הרציף של 20 mA שב-datasheet של <span class="mp">${P.mpn}</span>.`,
      why: `ההתנגדות בטור נמוכה מדי. עם נפילת מתח ישירה של ${sim.led[0].vd.toFixed(2)} V, יש לנגד רק ${vR.toFixed(2)} V עליו.`,
      prin: 'Absolute maximum ratings הם גבולות הרס, לא נקודות עבודה.',
      fix: `R = (5 − ${P.Vf.toFixed(1)}) / 0.015 ≈ ${Math.round((5 - P.Vf) / 0.015)} Ω. בחר 220 Ω מהבורר.`,
    })
  } else if (I < 0.005) {
    out.push({
      s: 'warn',
      t: `הזרם הישיר הוא רק ${fmtI(I)}`,
      what: `D1 מעביר זרם, אבל ב-${fmtI(I)} הוא יהיה כמעט לא נראה.`,
      why: `Lite-On מציינים עצימות תאורה ב-20 mA. מתחת ל-5 mA בערך, LED מחוון מסוג ${P.tag} נותן כמעט אור.`,
      prin: 'רציפות (continuity) זה לא אותו דבר כמו לעבוד. בדוק את נקודת העבודה.',
      fix: `הנמך את הנגד לכיוון ${Math.round((5 - P.Vf) / 0.015)} Ω.`,
    })
  } else {
    out.push({
      s: 'ok',
      t: `הזרם הישיר הוא ${fmtI(I)}`,
      what: `D1 נמצא בתוך החלון של 5–20 mA, מתחת לדירוג הרציף של <span class="mp">${P.mpn}</span>.`,
      why: `הנגד מפיל ${vR.toFixed(2)} V ומפזר ${fmtP(vR * I)} — בנוח מתחת לדירוג של 125 mW של 0805.`,
      prin: 'הנגד בטור הופך מקור מתח נוקשה למקור זרם צפוי.',
      fix: 'שום דבר לתקן. עוברים ללוח.',
    })
  }
  if (rr && Math.abs(rr.I * rr.I * (R!.part as ResistorPart).R) > 0.125) {
    out.push({
      s: 'bad',
      t: 'הנגד חורג מדירוג ההספק שלו',
      what: `${R!.id} מפזר ${fmtP(rr.I * rr.I * (R!.part as ResistorPart).R)}; <span class="mp">${(R!.part as ResistorPart).mpn}</span> מדורג ל-0.125 W.`,
      why: 'נגד 0805 יכול לפזר חום מוגבל בלבד לתוך ה-pads שלו. מעבר לדירוג הוא סוחף (drifts), משנה צבע, ואז נהיה מעגל פתוח.',
      prin: 'P = I²R הוא אילוץ תכן, לא תרגיל.',
      fix: 'העלה את ההתנגדות או עבור למארז גדול יותר.',
    })
  }
  return out
}

export function pinLevel(
  sim: SolveResult,
  net: string,
  vdd: number,
): { lvl: '1' | '0' | '~' | '?'; v: number | null; float: boolean } {
  const V = sim.V[net]
  if (!sim.driven[net]) return { lvl: '?', v: null, float: true }
  if (V >= 0.7 * vdd) return { lvl: '1', v: V, float: false }
  if (V <= 0.3 * vdd) return { lvl: '0', v: V, float: false }
  return { lvl: '~', v: V, float: false }
}

export function checkPull(sim: SolveResult, state: SchState, dir: 'up' | 'down'): Verdict[] {
  const io = state.comps.find((c) => c.type === 'IO')
  const sw = state.comps.find((c) => c.type === 'SW')
  const rs = state.comps.filter((c) => c.type === 'R')
  const dirHe = dir === 'up' ? 'Up' : 'Down'
  if (!sw) {
    return [
      {
        s: 'bad',
        t: 'לא הוצב כפתור',
        what: 'אין מתג במעגל.',
        why: 'בלי מתג אין מה שישנה את מצב הפין.',
        prin: 'כניסה דיגיטלית צריכה גם מצב מנוחה מוגדר וגם משהו שמשנה אותו.',
        fix: 'הצב את כפתור הלחיצה.',
      },
    ]
  }
  if (!rs.length) {
    return [
      {
        s: 'bad',
        t: `אין נגד Pull-${dirHe}`,
        what: 'למעגל אין נגד שמחזיק את הפין במצב המנוחה שלו.',
        why: 'כשהכפתור פתוח, הפין מחובר לכלום. כניסת CMOS שנשארת צפה סוחפת (drifts) באזור הסף שלה, מושכת זרם shoot-through ומתנדנדת.',
        prin: 'לכל כניסה דיגיטלית חייב להיות מצב מוגדר כל הזמן.',
        fix: `הוסף נגד מהפין ל-${dir === 'up' ? '+3V3' : 'GND'}.`,
      },
    ]
  }
  const pinNet = sim.pinNet[io!.id + '.1']
  const rail = dir === 'up' ? '+3V3' : 'GND'
  const other = dir === 'up' ? 'GND' : '+3V3'
  const withSwitch = (closed: boolean) => state.comps.map((c) => (c.id === sw.id ? { ...c, closed } : c))
  const sOpen = solve(withSwitch(false), state.wires)
  const sClosed = solve(withSwitch(true), state.wires)
  const lo = pinLevel(sOpen, pinNet, 3.3)
  const lc = pinLevel(sClosed, pinNet, 3.3)
  const wantOpen = dir === 'up' ? '1' : '0'
  const wantClosed = dir === 'up' ? '0' : '1'
  const out: Verdict[] = []
  if (lo.float) {
    return [
      {
        s: 'bad',
        t: 'הפין צף כשהכפתור פתוח',
        what: `ל-net <code>${pinNet}</code> אין מסלול DC לאף rail כשהכפתור משוחרר.`,
        why: 'כניסת CMOS בעכבה גבוהה בלי שום דבר שמזין אותה היא לא מוגדרת. היא תיקרא באקראי, ושני טרנזיסטורי הכניסה יכולים להעביר זרם בו-זמנית.',
        prin: 'צף זה לא אותו דבר כמו נמוך. לא מוזן פירושו לא מוגדר.',
        fix: `חבר נגד מ-${pinNet} ל-${rail}.`,
      },
    ]
  }
  if (lo.lvl !== wantOpen || lc.lvl !== wantClosed) {
    out.push({
      s: 'bad',
      t: 'רמות הלוגיקה שגויות',
      what: `כשהכפתור פתוח הפין קורא <b>${lo.lvl === '1' ? 'HIGH' : lo.lvl === '0' ? 'LOW' : 'לא מוגדר'}</b> (${lo.v !== null ? lo.v.toFixed(2) + ' V' : '—'}), כשלחוץ הוא קורא <b>${lc.lvl === '1' ? 'HIGH' : lc.lvl === '0' ? 'LOW' : 'לא מוגדר'}</b> (${lc.v !== null ? lc.v.toFixed(2) + ' V' : '—'}).`,
      why: `אתה צריך ${wantOpen === '1' ? 'HIGH' : 'LOW'} כשפתוח ו-${wantClosed === '1' ? 'HIGH' : 'LOW'} כשלחוץ. STM32 צריך מעל 2.31 V בשביל high תקף ומתחת ל-0.99 V בשביל low תקף.`,
      prin: `Pull-${dirHe} מגדיר את מצב המנוחה; המתג עוקף אותו על ידי חיבור ל-${other}.`,
      fix: `חבר את הנגד מהפין ל-${rail}, ואת הכפתור מהפין ל-${other}.`,
    })
    return out
  }
  const R = (rs[0].part as ResistorPart).R
  if (R < 1000) {
    out.push({
      s: 'warn',
      t: `Pull-${dirHe} הוא רק ${fmtR(R)}`,
      what: `הנגד מבזבז ${fmtI(3.3 / R)} כל עוד הכפתור מוחזק.`,
      why: 'Pull-up חזק עובד חשמלית אבל שורף זרם ברצף במצב הפעיל. במוצר סוללה זה שולט בתקציב האנרגיה.',
      prin: 'חוזק ה-pull הוא מסחר בין חסינות רעש לזרם.',
      fix: '10 kΩ הוא הבחירה המקובלת.',
    })
  } else if (R > 100000) {
    out.push({
      s: 'warn',
      t: `Pull-${dirHe} הוא ${fmtR(R)} — חלש מאוד`,
      what: 'הפין קרוב שוב לעכבה גבוהה.',
      why: 'Pull חלש מאוד טוען את הפין לאט ומופרע בקלות על ידי צימוד קיבולי (capacitive coupling) מפסים סמוכים.',
      prin: 'חלש מדי גרוע כמו לא קיים, רק פחות בבירור.',
      fix: 'הורד ל-10 kΩ.',
    })
  } else {
    out.push({
      s: 'ok',
      t: `Pull-${dirHe} של ${fmtR(R)} נבחר טוב`,
      what: `הוא מבזבז רק ${fmtI(3.3 / R)} במצב הפעיל בעוד הוא מחזיק את הפין נהדר.`,
      why: 'ערכים באמצע נמצאים בין זרם מבוזבז לרגישות לרעש.',
      prin: '10 kΩ הוא ברירת המחדל מטעם.',
      fix: '—',
    })
  }
  out.unshift({
    s: 'ok',
    t: 'רמות הלוגיקה תקינות',
    what: `פתוח → ${lo.v!.toFixed(2)} V (${wantOpen === '1' ? 'HIGH' : 'LOW'}), לחוץ → ${lc.v!.toFixed(2)} V (${wantClosed === '1' ? 'HIGH' : 'LOW'}).`,
    why: 'שני המצבים עוברים את הספים 2.31 V / 0.99 V של STM32 עם מרווח.',
    prin: `Pull-${dirHe} קובע את מצב המנוחה; הכפתור עוקף אותו.`,
    fix: '—',
  })
  return out
}

export function checkI2C(sim: SolveResult, state: SchState): Verdict[] {
  const io = state.comps.find((c) => c.type === 'IO')
  const rs = state.comps.filter((c) => c.type === 'R')
  const sw = state.comps.find((c) => c.type === 'SW')
  if (!rs.length) {
    return [
      {
        s: 'bad',
        t: 'אין Pull-up על SDA',
        what: 'לאפיק אין נגד למקור.',
        why: 'רכיבי I²C הם open drain — הם יכולים רק למשוך את הקו לGND. בלי משהו שמחזיר אותו למעלה, SDA לא חוזר ל-high וכל טרנזקציה נכשלת. זה הבאג הנפוץ ביותר בהעלאת I²C, והוא נראה בדיוק כמו חיישן מת.',
        prin: 'אפיקי open-drain דורשים pull-up חיצוני. תמיד.',
        fix: 'הוסף נגד מ-SDA ל-+3V3.',
      },
    ]
  }
  if (!sw) {
    return [
      {
        s: 'bad',
        t: 'אין רכיב שמושך את האפיק',
        what: 'שום דבר לא יכול למשוך את SDA ל-low.',
        why: 'אפיק שיכול להיות רק high לא נושא מידע.',
        prin: 'Open drain פירושו שהרכיבים מושכים ל-low ומשחררים.',
        fix: 'הצב את כפתור הלחיצה כרכיב ה-open-drain.',
      },
    ]
  }
  const net = sim.pinNet[io!.id + '.1']
  const withSwitch = (closed: boolean) => state.comps.map((c) => (c.id === sw.id ? { ...c, closed } : c))
  const so = solve(withSwitch(false), state.wires)
  const sc = solve(withSwitch(true), state.wires)
  const hi = so.V[net]
  const lo = sc.V[net]
  const out: Verdict[] = []
  if (!so.driven[net] || hi < 2.31) {
    return [
      {
        s: 'bad',
        t: 'SDA לא נמצא ב-high במנוחה',
        what: `כשמשוחרר, הקו יושב ב-${so.driven[net] ? hi.toFixed(2) + ' V' : 'רמה לא מוגדרת'}.`,
        why: 'ה-pull-up חסר או לא מחובר בין SDA ל-rail של 3.3 V. Idle high הוא מצב המנוחה של האפיק — תנאי START מוגדר כ-SDA שנופל בזמן שSCL הוא high, וזה בלתי אפשרי אם SDA לעולם לא עולה.',
        prin: 'ה-pull-up מגדיר את מצב המנוחה של אפיק open-drain.',
        fix: 'חבר את הנגד מ-SDA ל-+3V3.',
      },
    ]
  }
  if (lo > 0.99) {
    return [
      {
        s: 'bad',
        t: 'לא ניתן למשוך את SDA נמוך מספיק',
        what: `כשהרכיב מושך למטה, SDA מגיע רק ל-${lo.toFixed(2)} V — מעל הסף 0.99 V עבור low תקף.`,
        why: 'ה-pull-up חזק מדי יחסית ליכולת המשיכה-למטה של הרכיב, כך ששניהם נלחמים והקו יושב באמצע.',
        prin: 'V_OL הוא מחלק מתח בין ה-pull-up להתנגדות ה-on של הרכיב.',
        fix: 'השתמש ב-pull-up חלש יותר — 4.7 kΩ.',
      },
    ]
  }
  const R = (rs[0].part as ResistorPart).R
  const C = 100e-12
  const tr = 0.85 * R * C
  out.push({
    s: 'ok',
    t: 'רמות האפיק תקינות',
    what: `Idle ${hi.toFixed(2)} V, asserted ${lo.toFixed(2)} V — משני צידי הספים 2.31 V / 0.99 V.`,
    why: 'ה-pull-up משחזר את הקו, ורכיב ה-open-drain עדיין יכול להטביע (swamp) אותו.',
    prin: 'Open drain: הרכיבים מושכים למטה, הנגד מושך למעלה.',
    fix: '—',
  })
  if (R < 1000) {
    out.push({
      s: 'warn',
      t: `${fmtR(R)} הוא pull-up חזק מאוד`,
      what: `הוא סופג (sinks) ${fmtI(3.3 / R)} בכל פעם שרכיב מטביע את הקו.`,
      why: 'שלבי הפלט של I²C מוגדרים לספוג עד 3 mA. pull-up חזק כזה מתקרב לגבול ומבזבז הספק על כל ביט.',
      prin: 'חוזק ה-pull-up הוא מסחר בין זמן עלייה לזרם ספיגה.',
      fix: '4.7 kΩ הוא הפשרה הסטנדרטית.',
    })
  } else if (R > 10000) {
    out.push({
      s: 'warn',
      t: `${fmtR(R)} חלש מדי לתזמון אמין`,
      what: `עם כ-100 pF של קיבול אפיק, זמן העלייה הוא בערך ${(tr * 1e9).toFixed(0)} ns.`,
      why: 'I²C מגביל את זמן העלייה ל-1 µs במצב standard ו-300 ns במצב fast. pull-up חלש מעגל את הקצוות עד שהמקלט קורא לא נכון.',
      prin: 't_rise ≈ 0.85 · R · C_bus.',
      fix: 'רד ל-4.7 kΩ.',
    })
  } else {
    const fast = tr <= 300e-9
    out.push({
      s: 'ok',
      t: `${fmtR(R)} נותן זמן עלייה של ${(tr * 1e9).toFixed(0)} ns`,
      what: fast
        ? `עם כ-100 pF של קיבול אפיק זה עומד גם בגבול ה-standard-mode של 1 µs וגם בגבול ה-fast-mode של 300 ns.`
        : `עם כ-100 pF של קיבול אפיק זה עומד בגבול ה-standard-mode של 1 µs, אבל חורג מגבול ה-fast-mode של 300 ns — האפיק הזה מוגבל ל-100 kHz.`,
      why: fast
        ? 'ה-pull-up חייב לטעון את קיבול האפיק בתוך זמן העלייה שהוגדר, והערך הזה עושה זאת עם מרווח ב-400 kHz.'
        : 'ה-pull-up חייב לטעון את קיבול האפיק בתוך זמן העלייה שהוגדר. תקף, אבל אם בהמשך תצטרך 400 kHz תצטרך לרדת לכ-2.2 kΩ או להקטין את קיבול האפיק.',
      prin: 't_rise ≈ 0.85 · R · C_bus. מהירות וזרם ספיגה מושכים בכיוונים מנוגדים.',
      fix: '—',
    })
  }
  return out
}

export function checkFet(sim: SolveResult, state: SchState): Verdict[] {
  const q = state.comps.find((c) => c.type === 'Q')
  const leds = state.comps.filter((c) => c.type === 'LED')
  const rs = state.comps.filter((c) => c.type === 'R')
  const sw = state.comps.find((c) => c.type === 'SW')
  if (!q) {
    return [
      {
        s: 'bad',
        t: 'לא הוצב MOSFET',
        what: 'למעגל אין רכיב מיתוג.',
        why: 'כל העניין הוא לתת מיתוג לעומס שפין MCU לא יכול להזין ישירות.',
        prin: 'מתג low-side שם את ה-FET בין העומס ל-GND.',
        fix: 'הצב את ה-N-MOSFET.',
      },
    ]
  }
  if (!leds.length || !rs.length) {
    return [
      {
        s: 'bad',
        t: 'העומס לא שלם',
        what: 'אתה צריך נגד ו-LED כעומס.',
        why: 'אין ל-FET מה למתג.',
        prin: 'העומס יושב בין המקור ל-drain.',
        fix: 'הוסף את הנגד וה-LED.',
      },
    ]
  }
  const g = sim.pinNet[q.id + '.G']
  const d = sim.pinNet[q.id + '.D']
  const src = sim.pinNet[q.id + '.S']
  if (src !== 'GND') {
    return [
      {
        s: 'bad',
        t: 'ה-Source לא מוארק',
        what: `ה-source של ${q.id} יושב על <code>${src}</code>, לא GND.`,
        why: 'MOSFET נדלק לפי V_GS — מתח השער יחסית ל-source. אם ה-source צף עם העומס, נהיגת שער של 3.3 V לא יכולה יותר להעביר זרם מספיק. זה ההבדל בין מתג low-side ל-high-side.',
        prin: 'מיתוג low-side עובד כי ה-source מוצמד ל-GND.',
        fix: 'חבר את פין ה-source ישירות ל-GND.',
      },
    ]
  }
  if (d === 'GND' || d === '+5V') {
    return [
      {
        s: 'bad',
        t: 'העומס לא על ה-drain',
        what: `ה-drain יושב על <code>${d}</code>.`,
        why: 'עם ה-drain מחובר ישירות ל-rail אין מה למתג — או קצר מוחלט או אין עומס בכלל.',
        prin: 'מקור → עומס → drain, source → GND.',
        fix: 'שים את הנגד וה-LED בין +5V ל-drain.',
      },
    ]
  }
  const out: Verdict[] = []
  const withSwitch = (closed: boolean) =>
    sw ? state.comps.map((c) => (c.id === sw.id ? { ...c, closed } : c)) : state.comps
  const sOff = solve(withSwitch(false), state.wires)
  const sOn = solve(withSwitch(true), state.wires)
  if (!sOff.driven[g]) {
    out.push({
      s: 'bad',
      t: 'השער צף כשהכפתור משוחרר',
      what: `ל-net <code>${g}</code> אין מסלול DC ל-rail כשהמתג פתוח.`,
      why: 'שער MOSFET הוא קבל. אם משאירים אותו צף הוא מחזיק כל מטען שהיה לו לאחרונה, ודליפה או צימוד יכולים לסחוף אותו מעל הסף — כך שהעומס נדלק מעצמו. לפני שה-MCU עולה (boot), הפין שלו הוא high-impedance בדיוק במצב הזה.',
      prin: 'לעולם אל תשאיר שער לא מוזן. pull-down מגדיר את מצב הכיבוי.',
      fix: 'הוסף נגד מהשער ל-GND.',
    })
  }
  const iOff = sOff.led[0] ? sOff.led[0].I : 0
  const iOn = sOn.led[0] ? sOn.led[0].I : 0
  const vgsOn = (sOn.V[g] || 0) - (sOn.V[src] || 0)
  if (iOn < 0.002) {
    out.push({
      s: 'bad',
      t: 'העומס לא נדלק',
      what: `עם הכפתור לחוץ ה-LED שואב רק ${fmtI(iOn)}. V_GS הוא ${vgsOn.toFixed(2)} V.`,
      why: `2N7002 מציין V_GS(th) בין 1.0 V ל-2.5 V — והסף הוא המקום שבו הוא בקושי מתחיל להעביר זרם, לא המקום שבו הוא דלוק. הנע את השער לכל ה-rail של 3.3 V.`,
      prin: 'סף הוא תחילת ההולכה, לא הפעלה מלאה.',
      fix: 'חבר את הכפתור בין השער ל-+3V3.',
    })
  } else if (iOff > 0.0005) {
    out.push({
      s: 'bad',
      t: 'העומס לא נכבה',
      what: `עם הכפתור משוחרר ה-LED עדיין שואב ${fmtI(iOff)}.`,
      why: 'השער מוחזק מעל הסף במצב המנוחה.',
      prin: 'כבוי פירושו V_GS מתחת לסף, לא רק נמוך יותר.',
      fix: 'בדוק שה-pull-down של השער מגיע ל-GND.',
    })
  } else {
    out.push({
      s: 'ok',
      t: 'העומס עובר מיתוג נכון',
      what: `משוחרר ${fmtI(iOff)}, לחוץ ${fmtI(iOn)} עם V_GS = ${vgsOn.toFixed(2)} V.`,
      why: `השער מונע הרבה מעל הסף הגרוע-ביותר של 2.5 V של 2N7002, כך ש-R_DS(on) נמצא בערך המדורג שלו של 2 Ω במקום איפשהו באזור הלינארי.`,
      prin: 'מתג N-channel בצד low-side הוא הדרך הזולה ביותר להזין עומס ש-MCU לא יכול.',
      fix: '—',
    })
  }
  if (sOff.driven[g] && iOn >= 0.002 && iOff <= 0.0005) {
    out.push({
      s: 'ok',
      t: 'השער לעולם לא נשאר צף',
      what: 'pull-down מחזיק את השער ב-0 V בכל פעם ששום דבר לא מזין אותו.',
      why: 'זה שומר על העומס כבוי בזמן העלייה (power-up), כשפיני ה-MCU עדיין high-impedance.',
      prin: 'הגדר את המצב של כל שער וכל כניסה דיגיטלית.',
      fix: '—',
    })
  }
  return out
}

export function checkFlyback(sim: SolveResult, state: SchState): Verdict[] {
  const L = state.comps.find((c) => c.type === 'L')
  const q = state.comps.find((c) => c.type === 'Q')
  const d = state.comps.find((c) => c.type === 'D')
  if (!L || !q) {
    return [
      {
        s: 'bad',
        t: 'המעגל לא שלם',
        what: 'צריך סליל (עומס השראתי) ו-MOSFET שימתג אותו.',
        why: 'בלי עומס השראתי אין קפיצת מתח ללמוד ממנה.',
        prin: '+5V → סליל → drain, source → GND.',
        fix: 'הצב את הסליל ואת ה-MOSFET.',
      },
    ]
  }
  const src = sim.pinNet[q.id + '.S']
  const dr = sim.pinNet[q.id + '.D']
  if (src !== 'GND') {
    return [
      {
        s: 'bad',
        t: 'ה-Source לא מוארק',
        what: `ה-source של ${q.id} על <code>${src}</code>.`,
        why: 'מיתוג low-side דורש שה-source יהיה מוצמד ל-GND.',
        prin: 'V_GS נמדד יחסית ל-source.',
        fix: 'חבר את ה-source ל-GND.',
      },
    ]
  }
  if (sim.pinNet[L.id + '.2'] !== dr && sim.pinNet[L.id + '.1'] !== dr) {
    return [
      {
        s: 'bad',
        t: 'הסליל לא מחובר ל-drain',
        what: 'העומס ההשראתי חייב לשבת בין המקור ל-drain.',
        why: 'אחרת אין מה למתג.',
        prin: 'מקור → עומס → drain.',
        fix: 'חבר את הסליל בין +5V ל-drain.',
      },
    ]
  }
  /* the whole point: run the switching event and look at the drain */
  const tr = runTransient(state.comps, state.wires, { tEnd: 6e-3, n: 600, tOpen: 3e-3 })
  if (!tr.length) {
    return [
      {
        s: 'bad',
        t: 'הסימולציה לא התכנסה',
        what: 'פותר הזמן לא הצליח לפתור את המעגל.',
        why: 'בדוק שאין קצר או צומת צפה.',
        prin: '—',
        fix: 'בדוק את החיווט.',
      },
    ]
  }
  const qPart = q.part as MosfetPart
  const Vbr = qPart.Vbr || 60
  const peak = Math.max(...tr.map((pt) => pt.V[dr] || 0))
  const iL = Math.max(...tr.filter((pt) => pt.t < 2.9e-3).map((pt) => Math.abs(pt.il[L.id] || 0)))
  const out: Verdict[] = []
  const lPart = L.part as InductorPart
  out.push({
    s: 'ok',
    t: `זרם הסליל במצב יציב: ${fmtI(iL)}`,
    what: `עם ה-MOSFET דלוק, הסליל מושך ${fmtI(iL)}.`,
    why: `במצב יציב הסליל הוא קצר חשמלי — רק התנגדות הכריכה (${lPart.Rs} Ω) והתנגדות ה-MOSFET מגבילות. I = 5 / (${lPart.Rs} + ${qPart.Ron}).`,
    prin: 'בזרם DC סליל הוא פשוט התנגדות הכריכה שלו.',
    fix: '—',
  })
  if (!d || peak > Vbr * 0.9) {
    out.push({
      s: 'bad',
      t: `קפיצת מתח ל-${peak.toFixed(0)} V על ה-drain`,
      what: `ברגע הכיבוי המתח על ה-drain קפץ ל-<b>${peak.toFixed(0)} V</b> ממקור של 5 V בלבד. ה-<span class="mp">${qPart.mpn}</span> מדורג ל-${Vbr} V.`,
      why: `סליל מתנגד לשינוי בזרם: V = L·di/dt. כשאתה מנתק ${fmtI(iL)} תוך מיקרו-שניות, dt קטן מאוד, אז הסליל מייצר כל מתח שנדרש כדי להמשיך את הזרם. הוא מוצא מסלול דרך פריצת ה-drain-source של הטרנזיסטור — וכל אנרגיית הסליל (½·L·I² = ${(0.5 * lPart.L * iL * iL * 1e6).toFixed(0)} µJ) נשרפת בתוך ה-die.`,
      prin: 'עומס השראתי חייב מסלול פריקה. אחרת הטרנזיסטור הוא המסלול.',
      fix: d ? 'הפוך את הדיודה: הקתודה ל-+5V, האנודה ל-drain.' : 'הוסף דיודת flyback: אנודה ל-drain, קתודה ל-+5V.',
    })
    return out
  }
  const dPart = d.part as DiodePart
  const iD = Math.max(...tr.map((pt) => Math.abs((pt.dioI || {})[d.id] || 0)))
  out.push({
    s: 'ok',
    t: `הקפיצה נחסמה ב-${peak.toFixed(1)} V`,
    what: `הדיודה מגבילה את ה-drain ל-${peak.toFixed(1)} V — כלומר 5 V של המקור ועוד נפילת המתח הישירה של <span class="mp">${dPart.mpn}</span>.`,
    why: `ברגע שהמתח על ה-drain עולה מעל המקור, הדיודה נהיית מוטה קדימה ונותנת לזרם הסליל לולאה לזרום בה. שיא הזרם בדיודה הוא ${fmtI(iD)} — כמעט בדיוק זרם הסליל שהיה לפני הכיבוי, כמו שצריך.`,
    prin: 'זרם בסליל לא נעצר מיידית. תן לו לאן ללכת.',
    fix: '—',
  })
  if (iD > 0.3) {
    out.push({
      s: 'warn',
      t: 'הדיודה קרובה לדירוג שלה',
      what: `שיא של ${fmtI(iD)} מול דירוג רציף של 300 mA ל-1N4148.`,
      why: 'בפריקה חד-פעמית זה בסדר כי הפולס קצר, אבל ב-PWM בתדר גבוה הזרם הממוצע מצטבר.',
      prin: 'בדוק גם זרם שיא וגם זרם ממוצע.',
      fix: 'לזרמים גבוהים יותר עבור לדיודת schottky הספק.',
    })
  }
  return out
}
