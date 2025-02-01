import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleTheme: () => 
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          document.documentElement.classList.toggle('dark', newDarkMode);
          return { isDarkMode: newDarkMode };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
) 