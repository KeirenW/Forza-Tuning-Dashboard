# Forza Tuning Dashboard — Implementation Plan

## Decisions Locked In

| Topic | Decision |
|---|---|
| Car class | Dropdown: `D / C / B / A / S1 / S2 / X` |
| Drivetrain | `FWD / RWD / AWD` field on Car — drives conditional Center Balance in Differential |
| Gearing | Gear count dropdown (1–10); only that many gear inputs render; stored as `number[]` |
| Ride height | Decimal CM display (e.g. `23.45 CM`) |
| Comparison | Auto-compare vs PB by default + manual tune picker option |
| Vite base path | `/Forza-Tuning-Dashboard/` |
| First tune | "Create Baseline Tune" button on CarPage opens blank editor |

---

## Phase 0 — Foundation

1. Scaffold Vite + React + TypeScript project inside workspace root
2. Install dependencies: `react-router-dom zustand bootstrap nanoid date-fns clsx`
3. Configure `vite.config.ts` with `base: '/Forza-Tuning-Dashboard/'`
4. Import Bootstrap CSS + custom dark theme overrides in `src/styles/`
5. Configure react-router-dom with placeholder routes: `/`, `/car/:carId`, `/car/:carId/tune/:tuneId`, `/car/:carId/compare`
6. Create `AppShell` layout with top navbar (logo, nav links)

---

## Phase 1 — Types & Data Layer

> Depends on: Phase 0

7. Define TypeScript types in `src/types/`:
   - `track.ts` — `Track` union type, `TRACKS` constant array
   - `car.ts` — `Car` type with `id, manufacturer, model, class (CarClass), drivetrain (Drivetrain), notes?, createdAt`
   - `tune.ts` — `Tune` type per spec + `gearCount: number` on gearing settings
8. Create `src/data/tracks.ts` — `TRACKS = ["Soni", "Hokubu", "Sekibe"]`
9. Build `garageStore.ts` — Zustand store with `persist` middleware; state: `cars[]`; actions: `addCar, updateCar, deleteCar`
10. Build `tuneStore.ts` — Zustand store with `persist`; state: `tunes[]`; actions: `addTune, duplicateTune, updateDraft, saveDraftAsRevision`
11. Build `uiStore.ts` — ephemeral UI state (selected car, selected tune, active track filter)
12. Create `src/utils/storage.ts` — schema version guard; validates `schemaVersion === 1` on load, warns on mismatch
13. Create `src/utils/laps.ts` — `parseLapTime(str): number` and `formatLapTime(ms): string`
14. Create `src/utils/export.ts` — `exportData(): void` (triggers JSON download), `importData(json): void`

---

## Phase 2 — Garage & Cars

> Depends on: Phase 1

15. Build `GaragePage` — card grid of cars, each showing manufacturer/model/class badge + best lap per track
16. Build `CarCard` component — class badge, drivetrain badge, PB summary per track, click navigates to CarPage
17. Build `CreateCarModal` — form with manufacturer (text), model (text), class dropdown, drivetrain dropdown, notes (textarea)
18. Build `EditCarModal` — same form, pre-populated
19. Wire delete car with confirmation prompt; cascade-delete associated tunes from tuneStore

---

## Phase 3 — Tune Revision System

> Depends on: Phase 1 (can run parallel with Phase 2)

20. Build `TunePage` — route `/car/:carId/tune/:tuneId`; loads tune from store or draft from localStorage
21. Structure editor using Bootstrap accordions: Tyres / Gearing / Alignment / Anti-Roll Bars / Springs / Damping / Aero / Brakes / Differential
22. Gearing section: gear count dropdown (1–10); renders that many gear inputs dynamically
23. Differential section: conditionally render Center Balance field only when `car.drivetrain === "AWD"`
24. Autosave: `useEffect` + `setInterval` every 3s, write draft to `localStorage` key `draft:{tuneId}`
25. On page load: check for existing draft, offer "Restore draft?" prompt with dismiss option
26. "Save Revision" button: validate form → call `saveDraftAsRevision` → clear draft → navigate to CarPage
27. "Duplicate Tune" button: call `duplicateTune` (copies tune, sets `parentTuneId`) → navigate to new tune editor
28. "Create Baseline Tune" from CarPage: creates blank tune with `status: "baseline"`, navigates to editor

---

## Phase 4 — Car Page & Timeline

> Depends on: Phase 3

29. Build `CarPage` — route `/car/:carId`; shows timeline + per-track PB table + action buttons
30. Build `TuneTimeline` component — vertical list ordered by `createdAt`; each node shows tune name, timestamp, status badge, best lap
31. PB badge: highlight nodes where `status === "pb"` with star icon + accent colour
32. "Compare" button per tune node → navigates to ComparePage with that tune pre-selected

---

## Phase 5 — Lap Tracking & PB Assignment

> Depends on: Phase 3

33. Add lap record inputs to `TunePage` — one row per track: track name + `mm:ss.sss` input, validated on blur
34. On blur/change: call `parseLapTime()`, validate format, store as milliseconds
35. Build `src/utils/pb.ts` — `recalculatePBs(carId, tunes[]): Tune[]`:
    - Group tunes by car
    - For each track, find tune with lowest `bestLapMs`
    - Set that tune's `status = "pb"`, leave others unchanged (unless `"retired"`)
36. Call `recalculatePBs` on every `addTune` / `saveDraftAsRevision` action in tuneStore

---

## Phase 6 — Comparison Engine

> Depends on: Phase 5

37. Build `src/utils/comparison.ts` — `diffTunes(current: Tune, reference: Tune): DiffEntry[]`; output: `{ field, path, current, reference, delta }`; only include entries where values differ
38. Build `ComparePage` — route `/car/:carId/compare`
39. Default mode: auto-select reference = tune with `status === "pb"` for the selected track
40. Manual mode: two tune dropdowns to pick any two tunes from the car's timeline
41. Track selector tabs (Soni / Hokubu / Sekibe) to switch which lap delta is shown
42. Diff table: columns — Setting | Current | PB/Reference | Delta; improvements (faster lap) highlighted green, regressions red
43. Lap delta headline at top: e.g. `-0.173s faster` / `+0.241s slower`

---

## Phase 7 — Polish

> Depends on: all prior phases

44. Toast notifications (Bootstrap toasts) for: tune saved, car deleted, import success/fail, draft restored
45. Empty states: Garage with no cars, Car with no tunes, Compare with no PB set
46. Responsive layout audit — ensure mobile usability (stacked accordions, scrollable timeline)
47. Export/Import UI — button in navbar: Export JSON (download) + Import JSON (file picker)
48. Add `gh-pages` package; add `deploy` script to package.json

---

## Folder Structure

```
src/
├── components/
│   ├── garage/
│   │   ├── CarCard.tsx
│   │   ├── CreateCarModal.tsx
│   │   └── EditCarModal.tsx
│   ├── tune-editor/
│   │   └── (accordion section components)
│   ├── timeline/
│   │   └── TuneTimeline.tsx
│   ├── comparison/
│   │   └── DiffTable.tsx
│   └── shared/
│       ├── LapInput.tsx
│       ├── StatusBadge.tsx
│       └── ToastContainer.tsx
│
├── pages/
│   ├── GaragePage.tsx
│   ├── CarPage.tsx
│   ├── TunePage.tsx
│   └── ComparePage.tsx
│
├── store/
│   ├── garageStore.ts
│   ├── tuneStore.ts
│   └── uiStore.ts
│
├── types/
│   ├── car.ts
│   ├── tune.ts
│   └── track.ts
│
├── utils/
│   ├── comparison.ts
│   ├── pb.ts
│   ├── export.ts
│   ├── laps.ts
│   └── storage.ts
│
├── data/
│   └── tracks.ts
│
└── styles/
    └── theme.css
```

---

## Verification Checklist

- [ ] `npm run dev` — app loads with dark Bootstrap theme
- [ ] Create a car → appears on GaragePage with class + drivetrain badges
- [ ] Create Baseline Tune → editor opens with all accordion sections
- [ ] AWD car → Center Balance field visible; FWD/RWD car → field hidden
- [ ] Gear count set to 6 → only 6 gear inputs render
- [ ] Enter lap `1:42.381` → stored as `102381`, displayed back correctly
- [ ] Save Revision → tune appears in CarPage timeline, draft cleared from localStorage
- [ ] Duplicate tune → new tune created with `parentTuneId` set
- [ ] Enter faster lap on duplicated tune → PB badge migrates to new tune
- [ ] Navigate to ComparePage → diff table shows only changed fields, lap delta headline shown
- [ ] Export JSON → valid JSON with `schemaVersion: 1`, re-import fully restores data
- [ ] `npm run deploy` → app live at `https://{user}.github.io/Forza-Tuning-Dashboard/`
