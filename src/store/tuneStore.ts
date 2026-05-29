import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Tune } from '../types/tune'
import { DEFAULT_TUNE_SETTINGS } from '../types/tune'

interface TuneState {
  tunes: Tune[]
  addTune: (tune: Tune) => void
  updateTune: (id: string, updates: Partial<Omit<Tune, 'id' | 'carId' | 'createdAt'>>) => void
  deleteTune: (id: string) => void
  deleteTunesByCarId: (carId: string) => void
  duplicateTune: (sourceId: string, newName: string) => Tune | null
}

export const useTuneStore = create<TuneState>()(
  persist(
    (set, get) => ({
      tunes: [],

      addTune: (tune) =>
        set((state) => ({ tunes: [...state.tunes, tune] })),

      updateTune: (id, updates) =>
        set((state) => ({
          tunes: state.tunes.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTune: (id) =>
        set((state) => ({ tunes: state.tunes.filter((t) => t.id !== id) })),

      deleteTunesByCarId: (carId) =>
        set((state) => ({ tunes: state.tunes.filter((t) => t.carId !== carId) })),

      duplicateTune: (sourceId, newName) => {
        const source = get().tunes.find((t) => t.id === sourceId)
        if (!source) return null

        const now = new Date().toISOString()
        const newTune: Tune = {
          ...source,
          // Deep-copy nested objects to avoid reference sharing
          settings: JSON.parse(JSON.stringify(source.settings)) as typeof DEFAULT_TUNE_SETTINGS,
          lapRecords: [],
          id: nanoid(),
          parentTuneId: source.id,
          name: newName,
          status: 'testing',
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({ tunes: [...state.tunes, newTune] }))
        return newTune
      },
    }),
    { name: 'tune-store' }
  )
)
