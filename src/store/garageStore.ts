import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Car } from '../types/car'

interface GarageState {
  cars: Car[]
  addCar: (car: Car) => void
  updateCar: (id: string, updates: Partial<Omit<Car, 'id' | 'createdAt'>>) => void
  deleteCar: (id: string) => void
  setCars: (cars: Car[]) => void
}

export const useGarageStore = create<GarageState>()(
  persist(
    (set) => ({
      cars: [],

      addCar: (car) =>
        set((state) => ({ cars: [...state.cars, car] })),

      updateCar: (id, updates) =>
        set((state) => ({
          cars: state.cars.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCar: (id) =>
        set((state) => ({ cars: state.cars.filter((c) => c.id !== id) })),

      setCars: (cars) => set({ cars }),
    }),
    { name: 'garage-store' }
  )
)
