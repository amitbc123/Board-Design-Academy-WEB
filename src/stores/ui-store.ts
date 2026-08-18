import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

type UIState = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  activeSettingsTab: string
  setActiveSettingsTab: (tab: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      activeSettingsTab: 'ai',
      setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
    }),
    {
      name: 'bda-ui',
      version: 1,
      partialize: (state) => ({ theme: state.theme, activeSettingsTab: state.activeSettingsTab }),
    },
  ),
)
