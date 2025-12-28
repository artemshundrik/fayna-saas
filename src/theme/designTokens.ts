// =============================
//  TYPES
// =============================

// 10-ступенева шкала кольору (Mantine вимагає рівно 10 значень)
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

// =============================
//  COLOR PALETTE
// =============================

export const colorPalette: {
  primary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  gray: ColorScale;
  purple: ColorScale;
  mint: ColorScale;
  orange: ColorScale;
  pink: ColorScale;
  teal: ColorScale;
  lime: ColorScale;
} = {
  primary: {
    50: '#F2F7FF',
    100: '#DBE8FF',
    200: '#B9D3FF',
    300: '#8CB7FF',
    400: '#5F99FF',
    500: '#2E74FF', // Твій основний синій 🔥
    600: '#1C5BE6',
    700: '#1443B5',
    800: '#0D2C80',
    900: '#07174D',
  },

  success: {
    50: '#EDFFF6',
    100: '#C9FCE3',
    200: '#A5F7D0',
    300: '#86F3BE',
    400: '#5CDCA1',
    500: '#38D08F',
    600: '#25B377',
    700: '#1A9F63',
    800: '#0E7242',
    900: '#06492A',
  },

  warning: {
    50: '#FFF9E8',
    100: '#FFEFB8',
    200: '#FFE28A',
    300: '#FFD874',
    400: '#FFCA4B',
    500: '#FFBF2E',
    600: '#E0A020',
    700: '#B98210',
    800: '#8A5E00',
    900: '#5A3B00',
  },

  danger: {
    50: '#FFECEF',
    100: '#FFC7D0',
    200: '#FFA4B0',
    300: '#FF8A9F',
    400: '#FF657D',
    500: '#FF4A68',
    600: '#E12D4D',
    700: '#C41731',
    800: '#8E0F22',
    900: '#570916',
  },

  gray: {
    50: '#F7F8FA',
    100: '#F0F2F5',
    200: '#E1E4EA',
    300: '#CDD1D8',
    400: '#A9AFB9',
    500: '#7C8493',
    600: '#5A6270',
    700: '#3E4551',
    800: '#272C35',
    900: '#16181D',
  },

  purple: {
    50: '#F6F2FF',
    100: '#E9DEFF',
    200: '#D2BDFF',
    300: '#B091FF',
    400: '#936CFF',
    500: '#7A4DFF',
    600: '#6437E6',
    700: '#4A27B5',
    800: '#331A80',
    900: '#1F0F4D',
  },

  mint: {
    50: '#F1FFFA',
    100: '#D9FFF2',
    200: '#B2FFE5',
    300: '#81F7D2',
    400: '#4FEAC0',
    500: '#22D7AB',
    600: '#0FB18C',
    700: '#0A8266',
    800: '#065848',
    900: '#03342D',
  },

  orange: {
    50: '#FFF8F1',
    100: '#FFEBD4',
    200: '#FFD4A8',
    300: '#FFB771',
    400: '#FF9742',
    500: '#FF7A14',
    600: '#E65F06',
    700: '#B94604',
    800: '#7A2D02',
    900: '#3D1600',
  },

  pink: {
    50: '#FFF0F8',
    100: '#FFE0F0',
    200: '#FFB8DC',
    300: '#FF8EC7',
    400: '#FF5FB1',
    500: '#FF2E9B',
    600: '#E61185',
    700: '#B30C66',
    800: '#800844',
    900: '#4D0427',
  },

  teal: {
    50: '#F0FFFE',
    100: '#CCFCF8',
    200: '#99F5EE',
    300: '#66E9E1',
    400: '#33D8D2',
    500: '#00C3BF',
    600: '#009E9A',
    700: '#007775',
    800: '#004F50',
    900: '#002A2B',
  },

  lime: {
    50: '#F6FFE8',
    100: '#E5FFC2',
    200: '#CCFF85',
    300: '#B0F54B',
    400: '#96E120',
    500: '#7ACC00',
    600: '#5F9E00',
    700: '#487800',
    800: '#2F4D00',
    900: '#1A2B00',
  },
};

// =============================
//  HELPERS
// =============================

// Mantine хоче масив рівно з 10 елементів–рядків
export const toMantineTuple = (
  scale: ColorScale
): [
  string, string, string, string, string,
  string, string, string, string, string
] => [
  scale[50],
  scale[100],
  scale[200],
  scale[300],
  scale[400],
  scale[500],
  scale[600],
  scale[700],
  scale[800],
  scale[900],
];

// =============================
//  TYPOGRAPHY, SPACING, RADIUS, SHADOWS
// =============================

export const typography = {
  fontFamily: `'Inter', sans-serif`,
  headingFontFamily: `'Inter', sans-serif`,
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.45,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
};

export const shadows = {
  xs: '0 1px 2px rgba(0,0,0,0.05)',
  sm: '0 1px 4px rgba(0,0,0,0.06)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.1)',
};
