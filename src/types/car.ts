export type CarClass = 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X'

export const CAR_CLASSES: CarClass[] = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']

export type Drivetrain = 'FWD' | 'RWD' | 'AWD'

export const DRIVETRAINS: Drivetrain[] = ['FWD', 'RWD', 'AWD']

export interface Car {
  id: string
  manufacturer: string
  model: string
  carClass: CarClass
  drivetrain: Drivetrain
  notes?: string
  createdAt: string
}
