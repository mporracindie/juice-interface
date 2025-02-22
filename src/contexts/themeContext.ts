import { juiceTheme } from 'constants/theme'
import { ThemeOption } from 'constants/theme/theme-option'
import { SemanticTheme } from 'models/semantic-theme/theme'
import { createContext } from 'react'

const defaultThemeOption: ThemeOption = ThemeOption.dark

export type ThemeContext = {
  themeOption: ThemeOption
  theme: SemanticTheme
  isDarkMode: boolean
  setThemeOption: (themeOption: ThemeOption) => void
  forThemeOption?: <T>(map: Record<ThemeOption, T>) => T
}

export const ThemeContext = createContext<ThemeContext>({
  themeOption: defaultThemeOption,
  theme: juiceTheme(defaultThemeOption),
  setThemeOption: (themeOption: ThemeOption) => {},
  isDarkMode: defaultThemeOption === ThemeOption.dark
})
