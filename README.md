# אקדמיית תכנון לוחות — Board Design Academy

קורס עומק אישי ל-PWA בעברית (RTL) בנושא תכנון PCB במהירות גבוהה: שלמות אות, שלמות הספק,
תאימות EMC וסידור פיזי. 12 פרקים, 48 נושאים עם הסברים מעמיקים ותרשימי SVG מותאמים אישית,
12 מבחני פרק, מעקב התקדמות מקומי (IndexedDB), ופאנל שאלות מבוסס Gemini AI.

## פיתוח מקומי

```bash
npm install
npm run dev       # שרת פיתוח על http://localhost:5173
npm run build      # בנייה לייצור אל dist/
npm run preview    # הרצת build הייצור מקומית
npm run lint        # oxlint
npx tsc -b           # type-check (חשוב: לא npx tsc --noEmit — זהו no-op על tsconfig מסוג solution)
```

הפרויקט משתמש ב-React 19, Vite, TypeScript strict, React Compiler, Tailwind v4,
shadcn/ui (מסופק ידנית — ראו הערה למטה), react-router v8 (data mode), TanStack Query
(עבור קריאות Gemini בלבד), Zustand (ערכת נושא ומצב UI קטן בלבד), ו-`idb` להתקדמות מקומית.

### הערה: shadcn/ui מסופק ידנית

בזמן הבנייה `ui.shadcn.com` היה חסום על ידי מדיניות הרשת של סביבת הפיתוח, ולכן רכיבי
ה-UI תחת `src/components/ui/` נכתבו ידנית (Radix UI + CVA + tailwind-merge) במקום
להיווצר על ידי `npx shadcn add`. הם קוד רגיל בבעלותכם — ניתן לערוך ישירות.

## מבנה תוכן

- `src/content/chapters/` — קובץ TypeScript אחד לכל פרק (נושאים + שאלות מבחן).
- `src/content/diagrams/` — קובץ אחד לכל פרק עם רכיבי ה-SVG של התרשימים שלו.
- `src/content/types.ts` — מודל הנתונים (`Chapter`, `Topic`, `ExamQuestion`).

הוספת נושא/תרשים/שאלה חדשים נעשית ישירות בקבצים האלה — אין build step נפרד לתוכן.

## מפתח Gemini API

יש להזין מפתח Gemini API אישי במסך ההגדרות באפליקציה עצמה (טאב "AI"). המפתח נשמר
מקומית ב-IndexedDB בדפדפן בלבד ואינו נשלח לשום מקום מלבד ישירות ל-API של Google.
אין קובץ `.env` בפרויקט — אין משתני סביבה סודיים.

## פריסה ל-GitHub Pages

הפרויקט כולל workflow מוכן (`.github/workflows/deploy.yml`) שבונה ומפרסם ל-GitHub Pages
בכל push לענף המוגדר בו. כדי להפעיל בפועל:

1. בהגדרות המאגר ב-GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. ה-workflow קובע את `VITE_BASE_PATH` אוטומטית ל-`/<שם-המאגר>/`, כך שהאפליקציה עובדת
   נכון גם תחת נתיב משנה (project page), לא רק בשורש דומיין.
3. אם משנים את שם ענף ברירת המחדל של המאגר, יש לעדכן בהתאם את `branches:` ב-workflow.

לפריסה לאחסון אחר (Netlify, Vercel וכו׳) שמשרת מהשורש: `npm run build` ללא הגדרת
`VITE_BASE_PATH` (ברירת המחדל `/`), ולוודא שהמארח מפנה את כל הנתיבים ל-`index.html`
(היסטוריית SPA).

## PWA ועבודה לא מקוונת

כל התוכן הסטטי (טקסט, תרשימים, נתוני שאלות, מעטפת האפליקציה, והתקדמות שמורה) עובד
במלואו במצב לא מקוון לאחר טעינה ראשונה, בזכות `vite-plugin-pwa`. פאנל ה-AI מוחרג
במפורש מהמטמון — הוא דורש חיבור פעיל.
