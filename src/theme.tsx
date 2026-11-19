import { createContext, useContext, type ReactNode } from 'react';

export type Palette = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  tabBar: string;
  tabInactive: string;
  input: string;
};

export const lightPalette: Palette = {
  background: '#F3F5F7',
  surface: '#FFFFFF',
  text: '#14181D',
  muted: '#5E6973',
  border: '#E1E6EB',
  accent: '#0F7A4A',
  accentText: '#FFFFFF',
  accentSoft: '#E7F6EE',
  danger: '#B42318',
  tabBar: '#FFFFFF',
  tabInactive: '#66707A',
  input: '#F7F8FA',
};

export const darkPalette: Palette = {
  background: '#0F1216',
  surface: '#1A2027',
  text: '#F3F5F7',
  muted: '#A3ADB6',
  border: '#2C343D',
  accent: '#3DDC97',
  accentText: '#062215',
  accentSoft: '#143228',
  danger: '#FF8A80',
  tabBar: '#14191F',
  tabInactive: '#9AA3AD',
  input: '#12171C',
};

const ThemeContext = createContext<Palette>(lightPalette);

export function ThemeProvider({
  value,
  children,
}: {
  value: Palette;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
