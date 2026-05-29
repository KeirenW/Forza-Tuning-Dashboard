import type { Track } from './track'

export type TuneStatus = 'baseline' | 'testing' | 'pb' | 'retired'

export interface LapRecord {
  track: Track
  bestLapMs: number
}

export interface TuneSettings {
  tyres: {
    frontPsi: number
    rearPsi: number
  }
  gearing: {
    finalDrive: number
    gearCount: number
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

export interface Tune {
  id: string
  parentTuneId?: string
  carId: string
  name: string
  status: TuneStatus
  createdAt: string
  updatedAt: string
  notes?: string
  settings: TuneSettings
  lapRecords: LapRecord[]
}

export const DEFAULT_TUNE_SETTINGS: TuneSettings = {
  tyres: {
    frontPsi: 0,
    rearPsi: 0,
  },
  gearing: {
    finalDrive: 0,
    gearCount: 6,
    gears: [0, 0, 0, 0, 0, 0],
  },
  alignment: {
    frontCamber: 0,
    rearCamber: 0,
    frontToe: 0,
    rearToe: 0,
    caster: 0,
  },
  antiRollBars: {
    front: 0,
    rear: 0,
  },
  springs: {
    front: 0,
    rear: 0,
    frontRideHeight: 0,
    rearRideHeight: 0,
  },
  damping: {
    frontRebound: 0,
    rearRebound: 0,
    frontBump: 0,
    rearBump: 0,
  },
  aero: {
    front: 0,
    rear: 0,
  },
  brakes: {
    balance: 0,
    pressure: 0,
  },
  differential: {
    frontAccel: 0,
    frontDecel: 0,
    rearAccel: 0,
    rearDecel: 0,
    centerBalance: 0,
  },
}
