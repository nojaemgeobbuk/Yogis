/**
 * Yogilog Design System
 * Deezer-inspired dark mode theme with purple & neon lime accents
 */

export const theme = {
  // ============================================
  // 1. Colors (색상)
  // ============================================
  colors: {
    // Brand - Deezer Purple
    primary: '#A238FF',
    primaryLight: '#B85FFF',
    primaryDark: '#8A2BE2',

    // Accent - Neon Lime
    accent: '#CCFF00',
    accentDark: '#A3CC00',

    // Background - Deep Dark
    bg_main: '#121216',
    bg_card: '#1A1A1F',
    bg_elevated: '#222228',
    bg_surface: '#2A2A32',

    // Text
    txt_primary: '#FFFFFF',
    txt_secondary: '#A0A0B0',
    txt_muted: '#6B6B7B',

    // Border
    border_light: '#2D2D38',
    border_medium: '#3D3D4A',

    // Semantic
    error: '#FF4757',
    success: '#2ED573',
    warning: '#FFA502',
    info: '#70A1FF',

    // Additional
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Gradient stops (for reference)
    gradient: {
      purpleStart: '#A238FF',
      purpleEnd: '#6B1FB8',
      limeStart: '#CCFF00',
      limeEnd: '#99CC00',
    },
  },

  // ============================================
  // 2. Spacing (간격) - 8단위 그리드
  // ============================================
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // ============================================
  // 3. Border Radius (둥글기) - Chunky & Bubbly
  // ============================================
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    card: 24,       // Album cards - chunky rounded corners
    button: 12,     // Standard buttons
    pill: 9999,     // Pill buttons (rounded-full)
    circle: 9999,   // Perfect circle
  },

  // ============================================
  // 4. Typography (폰트 스타일)
  // ============================================
  typography: {
    // Display - Unbounded (for branding, headers)
    display: {
      fontFamily: 'Unbounded',
      fontSize: 32,
      fontWeight: '800' as const,
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    header: {
      fontFamily: 'Unbounded',
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    title: {
      fontFamily: 'Pretendard',
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
    body: {
      fontFamily: 'Pretendard',
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#FFFFFF',
    },
    caption: {
      fontFamily: 'Pretendard',
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#A0A0B0',
    },
    label: {
      fontFamily: 'Pretendard',
      fontSize: 11,
      fontWeight: '600' as const,
      color: '#6B6B7B',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
  },

  // ============================================
  // 5. Shadows (그림자) - Glow Effects
  // ============================================
  shadows: {
    // Standard card shadow
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    // Elevated card shadow
    cardElevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    // Purple glow effect
    glowPurple: {
      shadowColor: '#A238FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    // Lime glow effect
    glowLime: {
      shadowColor: '#CCFF00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    // FAB with purple glow
    fab: {
      shadowColor: '#A238FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 12,
    },
    // Inner glow (for inputs)
    innerGlow: {
      shadowColor: '#A238FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 0,
    },
  },

  // ============================================
  // 6. Album Card Sizes
  // ============================================
  albumCard: {
    sm: {
      width: 128,
      height: 128,
    },
    md: {
      width: 160,
      height: 160,
    },
    lg: {
      width: 224,
      height: 224,
    },
    xl: {
      width: 280,
      height: 280,
    },
  },

  // ============================================
  // 7. Common Styles (자주 사용하는 스타일)
  // ============================================
  common: {
    // Album card style
    albumCard: {
      backgroundColor: '#1A1A1F',
      borderRadius: 24,
      overflow: 'hidden' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },

    // Standard card
    card: {
      backgroundColor: '#1A1A1F',
      borderRadius: 24,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },

    // Input field
    input: {
      backgroundColor: '#1A1A1F',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 14,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#2D2D38',
    },

    // Input field focused
    inputFocused: {
      backgroundColor: '#1A1A1F',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 14,
      color: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#A238FF',
    },

    // Primary button (purple)
    buttonPrimary: {
      backgroundColor: '#A238FF',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    // Primary button pill
    buttonPrimaryPill: {
      backgroundColor: '#A238FF',
      borderRadius: 9999,
      paddingVertical: 12,
      paddingHorizontal: 28,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    // Accent button (lime)
    buttonAccent: {
      backgroundColor: '#CCFF00',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    // Secondary button (outline)
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 2,
      borderColor: '#A238FF',
    },

    // Ghost button
    buttonGhost: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    // Progress bar track
    progressTrack: {
      backgroundColor: '#2D2D38',
      borderRadius: 4,
      height: 6,
    },

    // Progress bar fill
    progressFill: {
      backgroundColor: '#A238FF',
      borderRadius: 4,
      height: 6,
    },

    // Bottom navigation
    bottomNav: {
      backgroundColor: '#121216',
      borderTopWidth: 1,
      borderTopColor: '#2D2D38',
      paddingVertical: 8,
    },

    // Bottom nav item active
    bottomNavActive: {
      color: '#A238FF',
    },

    // Bottom nav item inactive
    bottomNavInactive: {
      color: '#6B6B7B',
    },
  },

  // ============================================
  // 8. Animation Durations
  // ============================================
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
};

// TypeScript 타입 정의
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeShadows = typeof theme.shadows;
export type ThemeTypography = typeof theme.typography;
