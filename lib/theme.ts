import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(220, 20%, 10%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(220, 20%, 10%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(220, 20%, 10%)',
    primary: 'hsl(246, 97%, 52%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(246, 98%, 60%)',
    secondaryForeground: 'hsl(0, 0%, 100%)',
    muted: 'hsl(220, 14%, 96%)',
    mutedForeground: 'hsl(220, 10%, 46%)',
    accent: 'hsl(246, 98%, 66%)',
    accentForeground: 'hsl(0, 0%, 100%)',
    destructive: 'hsl(0, 84%, 60%)',
    border: 'hsl(220, 13%, 91%)',
    input: 'hsl(220, 13%, 91%)',
    ring: 'hsl(246, 97%, 52%)',
  },
  dark: {
    background: 'hsl(210, 25%, 8%)',
    foreground: 'hsl(0, 0%, 98%)',
    card: 'hsl(210, 20%, 11%)',
    cardForeground: 'hsl(0, 0%, 98%)',
    popover: 'hsl(210, 20%, 13%)',
    popoverForeground: 'hsl(0, 0%, 98%)',
    primary: 'hsl(246, 97%, 52%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(246, 98%, 60%)',
    secondaryForeground: 'hsl(0, 0%, 100%)',
    muted: 'hsl(210, 15%, 15%)',
    mutedForeground: 'hsl(210, 10%, 55%)',
    accent: 'hsl(246, 98%, 66%)',
    accentForeground: 'hsl(0, 0%, 100%)',
    destructive: 'hsl(0, 72%, 51%)',
    border: 'hsl(210, 15%, 18%)',
    input: 'hsl(210, 15%, 18%)',
    ring: 'hsl(246, 97%, 52%)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
