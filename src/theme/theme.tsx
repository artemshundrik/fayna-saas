// src/theme/theme.tsx

import { MantineProvider, createTheme } from '@mantine/core';
import type { ReactNode } from 'react';

import { colorPalette, typography, spacing, radius, shadows, toMantineTuple } from './designTokens';

// number → "NNpx"
const px = (v: number): string => `${v}px`;
// number → "NN" (for lineHeight, Mantine wants string)
const lh = (v: number): string => `${v}`;

const theme = createTheme({
  primaryColor: 'primary',

  // Colors
  colors: {
    primary: toMantineTuple(colorPalette.primary),
    success: toMantineTuple(colorPalette.success),
    warning: toMantineTuple(colorPalette.warning),
    danger: toMantineTuple(colorPalette.danger),
    gray: toMantineTuple(colorPalette.gray),
    purple: toMantineTuple(colorPalette.purple),
    mint: toMantineTuple(colorPalette.mint),
    orange: toMantineTuple(colorPalette.orange),
    pink: toMantineTuple(colorPalette.pink),
    teal: toMantineTuple(colorPalette.teal),
    lime: toMantineTuple(colorPalette.lime),
  },

  // Base font
  fontFamily: typography.fontFamily,

  // Headings
  headings: {
    fontFamily: typography.headingFontFamily,
    sizes: {
      h1: {
        fontSize: px(typography.fontSizes['4xl']),
        lineHeight: lh(typography.lineHeights.tight),
      },
      h2: {
        fontSize: px(typography.fontSizes['3xl']),
        lineHeight: lh(typography.lineHeights.tight),
      },
      h3: {
        fontSize: px(typography.fontSizes['2xl']),
        lineHeight: lh(typography.lineHeights.normal),
      },
      h4: {
        fontSize: px(typography.fontSizes.xl),
        lineHeight: lh(typography.lineHeights.normal),
      },
      h5: {
        fontSize: px(typography.fontSizes.lg),
        lineHeight: lh(typography.lineHeights.normal),
      },
      h6: {
        fontSize: px(typography.fontSizes.md),
        lineHeight: lh(typography.lineHeights.relaxed),
      },
    },
  },

  // Font sizes
  fontSizes: {
    xs: px(typography.fontSizes.xs),
    sm: px(typography.fontSizes.sm),
    md: px(typography.fontSizes.md),
    lg: px(typography.fontSizes.lg),
    xl: px(typography.fontSizes.xl),
  },

  // Radius
  radius: {
    xs: px(radius.xs),
    sm: px(radius.sm),
    md: px(radius.md),
    lg: px(radius.lg),
    xl: px(radius.xl),
  },

  // Spacing
  spacing: {
    xs: px(spacing.xs),
    sm: px(spacing.sm),
    md: px(spacing.md),
    lg: px(spacing.lg),
    xl: px(spacing.xl),
  },

  // Shadows
  shadows: {
    xs: shadows.xs,
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
  },

  // Component defaults
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        padding: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xl',
        size: 'sm',
      },
    },
  },
});

type ThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      forceColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}
