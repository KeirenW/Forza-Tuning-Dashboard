# Forza Horizon 6 Tune Tracker — Technical Specification & Implementation Plan

## Project Overview

Build a local-first web application for tracking and comparing tuning setups in Forza Horizon 6, specifically focused on time attack workflows.

The app must:

* run fully client-side
* require no backend/server
* work locally or via static hosting
* support deployment to GitHub Pages
* persist data locally using browser storage
* support JSON import/export

The app should function similarly to a lightweight version-control system for car tunes.

Users create:

* cars
* tune revisions
* lap records

Users compare tune changes against performance outcomes.

---

# Core Product Philosophy

## Immutable Tune Revisions

Tune revisions are immutable snapshots.

Users NEVER edit existing revisions directly.

Instead:

```text
Duplicate Tune
→ Modify
→ Save New Revision
```

This allows:

* reliable history
* clean comparisons
* reverting to older tunes
* timeline tracking

---

# Core Features

## Cars

Users can:

* create cars
* edit cars
* delete cars

Car metadata:

* manufacturer
* model
* class
* optional notes

---

## Tune Revisions

Each tune revision contains:

* full tuning setup
* revision metadata
* lap records
* timestamps
* notes
* parent revision reference

Features:

* duplicate tune
* save revision
* revert by duplicating old revision
* autosaved draft editing

---

## Time Attack Tracking

Tracks are predefined only.

Allowed tracks:

* Soni
* Hokubu
* Sekibe

Each tune can store:

* best lap per track

Lap format shown to users:

```text
mm:ss.sss
```

Internally store laps as:

```text
milliseconds
```

Example:

```text
1:42.381
```

Stored as:

```text
102381
```

---

## Tune Comparison

Tunes are compared against:

* the fastest tune for the SAME car
* on the SAME track

This ensures apples-to-apples comparison.

Comparison should:

* highlight changed values only
* show current value
* show reference PB value
* show delta

Example:

| Setting      | Current | PB   | Delta |
| ------------ | ------- | ---- | ----- |
| Front Camber | -2.1    | -1.8 | -0.3  |

Performance delta examples:

```text
-0.173s faster
+0.241s slower
```

---

## Tune Timeline

Each car has a linear timeline of tune revisions.

No branching UI.

Example:

```text
Baseline
  ↓
V2
  ↓
V3
  ↓
PB Tune ★
```

Timeline nodes should display:

* tune name
* timestamp
* PB badge if applicable
* best lap
* track

---

## Autosave Drafts

While editing:

* autosave draft state every few seconds

Drafts are NOT revisions.

Only clicking:

```text
Save Revision
```

creates a permanent immutable revision.

Drafts should restore automatically if page reloads.

---

## Import / Export

Support:

* export all data as JSON
* import JSON backups

JSON should contain:

* schema version
* export timestamp
* cars
* tunes

---

# Technical Requirements

## Stack

Use:

* React
* TypeScript
* Vite
* Bootstrap
* Zustand

Avoid:

* Redux
* backend frameworks
* databases
* server APIs

---

## Hosting

Must support:

* local execution
* GitHub Pages deployment

No server-side rendering.

No backend required.

---

# State Management

Use Zustand.

Persist application state via:

```text
localStorage
```

Use Zustand persistence middleware.

---

# Data Persistence

Use:

```text
localStorage
```

for:

* cars
* tunes
* settings
* drafts

Add schema versioning immediately.

Example:

```json
{
  "schemaVersion": 1
}
```

---

# UI Requirements

## Design Direction

Desktop-first.

Must remain usable on mobile.

Use Bootstrap components heavily.

Preferred UI style:

* dark theme
* motorsport-inspired
* clean telemetry/tooling feel

Suggested accents:

* orange
* cyan
* lime

---

# Main Pages

## Garage Page

Displays:

* all cars
* PB summaries
* search/filter

---

## Car Page

Displays:

* tune timeline
* track PBs
* tune list

---

## Tune Editor Page

Contains:

* all tuning fields
* notes
* lap records
* save revision actions
* duplicate tune action

Use Bootstrap accordions for tuning categories.

---

## Comparison Page

Displays:

* tune diffs
* changed values only
* performance deltas
* PB reference values

---

# Tuning Categories

All tuning values are numeric.

Use UK-style units.

---

## Tyres

* Front PSI
* Rear PSI

---

## Gearing

* Final Drive
* Gear 1–10

---

## Alignment

* Front Camber
* Rear Camber
* Front Toe
* Rear Toe
* Caster

---

## Anti-Roll Bars

* Front
* Rear

---

## Springs

* Front Spring Rate
* Rear Spring Rate
* Front Ride Height
* Rear Ride Height

---

## Damping

* Front Rebound
* Rear Rebound
* Front Bump
* Rear Bump

---

## Aero

* Front
* Rear

---

## Brakes

* Balance
* Pressure

---

## Differential

* Front Accel
* Front Decel
* Rear Accel
* Rear Decel
* Center Balance

---

# Units

| Category     | Unit    |
| ------------ | ------- |
| Power        | BHP     |
| Torque       | Nm      |
| Pressure     | PSI     |
| Weight       | KG      |
| Alignment    | Degrees |
| Differential | %       |
| Ride Height  | CM/MM   |

---

# Tune Status System

Allowed statuses:

* baseline
* testing
* pb
* retired

PB statuses should be auto-assigned.

If a tune sets a faster lap for a track:

* mark new tune as PB
* remove PB from previous tune for that track

---

# Recommended TypeScript Models

```ts
type Track =
  | "Soni"
  | "Hokubu"
  | "Sekibe"

type TuneStatus =
  | "baseline"
  | "testing"
  | "pb"
  | "retired"

type LapRecord = {
  track: Track
  bestLapMs: number
}

type Tune = {
  id: string
  parentTuneId?: string

  carId: string

  name: string
  status: TuneStatus

  createdAt: string
  updatedAt: string

  notes?: string

  settings: {
    tyres: {
      frontPsi: number
      rearPsi: number
    }

    gearing: {
      finalDrive: number
      gears: number[]
    }

    alignment: {
      frontCamber: number
      rearCamber: number
      frontToe: number
      rearToe: number
      caster: number
    }

    antiRollBars: {
      front: number
      rear: number
    }

    springs: {
      front: number
      rear: number
      frontRideHeight: number
      rearRideHeight: number
    }

    damping: {
      frontRebound: number
      rearRebound: number
      frontBump: number
      rearBump: number
    }

    aero: {
      front: number
      rear: number
    }

    brakes: {
      balance: number
      pressure: number
    }

    differential: {
      frontAccel: number
      frontDecel: number
      rearAccel: number
      rearDecel: number
      centerBalance: number
    }
  }

  lapRecords: LapRecord[]
}
```

---

# Utility Requirements

## Lap Utilities

Implement:

* parseLapTime()
* formatLapTime()

Examples:

```ts
parseLapTime("1:42.381")
```

Returns:

```ts
102381
```

---

```ts
formatLapTime(102381)
```

Returns:

```text
1:42.381
```

---

# Diff Engine

Implement field-level tune comparison.

Expected output shape:

```ts
{
  field: "frontCamber",
  current: -2.1,
  reference: -1.8,
  delta: -0.3
}
```

Only changed values should display in comparison UI.

---

# Autosave Requirements

Drafts should:

* autosave every 2–5 seconds
* restore automatically
* remain separate from revisions

Suggested key format:

```text
draft:tune_123
```

---

# Suggested Folder Structure

```text
src/
├── components/
│   ├── garage/
│   ├── tune-editor/
│   ├── comparison/
│   ├── timeline/
│   └── shared/
│
├── pages/
│   ├── GaragePage
│   ├── CarPage
│   ├── TunePage
│   └── ComparePage
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
```

---

# Recommended Libraries

Core:

```bash
npm install react-router-dom zustand bootstrap nanoid date-fns
```

Optional:

```bash
npm install clsx
```

---

# Implementation Phases

## Phase 0 — Foundation

* Vite setup
* Bootstrap
* routing
* Zustand persistence
* dark theme setup

---

## Phase 1 — Models & Persistence

* TypeScript schemas
* localStorage persistence
* import/export
* schema versioning

---

## Phase 2 — Garage & Cars

* garage page
* create/delete cars
* navigation
* PB summaries

---

## Phase 3 — Tune Revision System

* tune editor
* duplicate workflow
* immutable revisions
* autosave drafts

---

## Phase 4 — Timeline

* revision timeline
* revision selection
* change summaries
* PB badges

---

## Phase 5 — Lap Tracking

* lap input
* parsing/formatting
* PB assignment
* PB summaries

---

## Phase 6 — Comparison Engine

* diff generation
* comparison page
* delta calculations
* changed-only display

---

## Phase 7 — Polish

* responsive layout
* dark UI refinement
* toast notifications
* keyboard UX
* empty states

---

# Important Constraints

DO:

* keep architecture simple
* prioritize clean UX
* prioritize immutable revision history
* optimize for static hosting
* optimize for local-first usage

DO NOT:

* add backend systems
* add multiplayer/collaboration
* add cloud sync
* add telemetry ingestion
* add AI recommendation systems
* add branching timelines

This is intentionally a focused single-user tool.
