import { create } from 'zustand'
import type { Track } from '../types/track'

interface UiState {
  selectedCarId: string | null
  selectedTuneId: string | null
  activeTrack: Track | null
  setSelectedCarId: (id: string | null) => void
  setSelectedTuneId: (id: string | null) => void
  setActiveTrack: (track: Track | null) => void
}

export const useUiStore = create<UiState>()((set) => ({
  selectedCarId: null,
  selectedTuneId: null,
  activeTrack: null,

  setSelectedCarId: (id) => set({ selectedCarId: id }),
  setSelectedTuneId: (id) => set({ selectedTuneId: id }),
  setActiveTrack: (track) => set({ activeTrack: track }),
}))
