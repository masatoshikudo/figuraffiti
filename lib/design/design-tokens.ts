/**
 * デザインシステムトークンの型定義とヘルパー関数
 * 
 * このファイルは、デザインシステムのトークンをTypeScriptで型安全に使用するための
 * 型定義とヘルパー関数を提供します。
 */

/**
 * スペーシングトークン（8pxベースのグリッドシステム）
 */
export const SPACING_TOKENS = {
  '01': 'spacing-01', // 8px
  '02': 'spacing-02', // 16px
  '03': 'spacing-03', // 24px
  '04': 'spacing-04', // 32px
  '05': 'spacing-05', // 40px
  '06': 'spacing-06', // 48px
  '07': 'spacing-07', // 56px
  '08': 'spacing-08', // 64px
  '09': 'spacing-09', // 72px
  '10': 'spacing-10', // 80px
} as const

export type SpacingToken = typeof SPACING_TOKENS[keyof typeof SPACING_TOKENS]

/**
 * フォントサイズトークン
 */
export const FONT_SIZE_TOKENS = {
  xs: 'text-xs',      // 12px
  sm: 'text-sm',      // 14px
  base: 'text-base',  // 16px
  lg: 'text-lg',      // 18px
  xl: 'text-xl',      // 20px
  '2xl': 'text-2xl',  // 24px
  '3xl': 'text-3xl',  // 30px
  '4xl': 'text-4xl',  // 36px
  '5xl': 'text-5xl',  // 48px
} as const

export type FontSizeToken = typeof FONT_SIZE_TOKENS[keyof typeof FONT_SIZE_TOKENS]

/**
 * 行の高さトークン
 */
export const LINE_HEIGHT_TOKENS = {
  tight: 'leading-tight',     // 1.25
  normal: 'leading-normal',   // 1.5
  relaxed: 'leading-relaxed', // 1.75
} as const

export type LineHeightToken = typeof LINE_HEIGHT_TOKENS[keyof typeof LINE_HEIGHT_TOKENS]

/**
 * フォントウェイトトークン
 */
export const FONT_WEIGHT_TOKENS = {
  normal: 'font-normal',     // 400
  medium: 'font-medium',     // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',         // 700
} as const

export type FontWeightToken = typeof FONT_WEIGHT_TOKENS[keyof typeof FONT_WEIGHT_TOKENS]

/**
 * ボーダー幅トークン
 */
export const BORDER_WIDTH_TOKENS = {
  '01': 'border-[1px]', // 1px
  '02': 'border-[2px]', // 2px
  '03': 'border-[3px]', // 3px
} as const

export type BorderWidthToken = typeof BORDER_WIDTH_TOKENS[keyof typeof BORDER_WIDTH_TOKENS]

/**
 * ボーダー角丸トークン
 */
export const BORDER_RADIUS_TOKENS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
} as const

export type BorderRadiusToken = typeof BORDER_RADIUS_TOKENS[keyof typeof BORDER_RADIUS_TOKENS]

/**
 * カラートークン（セマンティックなカラー名）
 */
export const COLOR_TOKENS = {
  background: 'bg-background',
  foreground: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  border: 'border-border',
  input: 'bg-input',
  ring: 'ring-ring',
} as const

export type ColorToken = typeof COLOR_TOKENS[keyof typeof COLOR_TOKENS]

/**
 * スペーシング値を取得するヘルパー関数
 * 
 * @example
 * getSpacing('02') // returns 'spacing-02' (16px)
 */
export function getSpacing(token: keyof typeof SPACING_TOKENS): SpacingToken {
  return SPACING_TOKENS[token]
}

/**
 * フォントサイズクラス名を取得するヘルパー関数
 * 
 * @example
 * getFontSize('lg') // returns 'text-lg'
 */
export function getFontSize(token: keyof typeof FONT_SIZE_TOKENS): FontSizeToken {
  return FONT_SIZE_TOKENS[token]
}

/**
 * 行の高さクラス名を取得するヘルパー関数
 * 
 * @example
 * getLineHeight('normal') // returns 'leading-normal'
 */
export function getLineHeight(token: keyof typeof LINE_HEIGHT_TOKENS): LineHeightToken {
  return LINE_HEIGHT_TOKENS[token]
}

/**
 * フォントウェイトクラス名を取得するヘルパー関数
 * 
 * @example
 * getFontWeight('semibold') // returns 'font-semibold'
 */
export function getFontWeight(token: keyof typeof FONT_WEIGHT_TOKENS): FontWeightToken {
  return FONT_WEIGHT_TOKENS[token]
}

/**
 * ボーダー幅クラス名を取得するヘルパー関数
 * 
 * @example
 * getBorderWidth('02') // returns 'border-[2px]'
 */
export function getBorderWidth(token: keyof typeof BORDER_WIDTH_TOKENS): BorderWidthToken {
  return BORDER_WIDTH_TOKENS[token]
}

/**
 * ボーダー角丸クラス名を取得するヘルパー関数
 * 
 * @example
 * getBorderRadius('lg') // returns 'rounded-lg'
 */
export function getBorderRadius(token: keyof typeof BORDER_RADIUS_TOKENS): BorderRadiusToken {
  return BORDER_RADIUS_TOKENS[token]
}

/**
 * カラークラス名を取得するヘルパー関数
 * 
 * @example
 * getColor('primary') // returns 'bg-primary text-primary-foreground'
 */
export function getColor(token: keyof typeof COLOR_TOKENS): ColorToken {
  return COLOR_TOKENS[token]
}

/**
 * デザインシステムの基本単位（8px）
 */
export const DESIGN_SYSTEM_BASE_UNIT = 8

/**
 * スペーシング値をピクセル単位で取得
 * 
 * @example
 * getSpacingPx('02') // returns 16
 */
export function getSpacingPx(token: keyof typeof SPACING_TOKENS): number {
  const spacingMap: Record<keyof typeof SPACING_TOKENS, number> = {
    '01': 8,
    '02': 16,
    '03': 24,
    '04': 32,
    '05': 40,
    '06': 48,
    '07': 56,
    '08': 64,
    '09': 72,
    '10': 80,
  }
  return spacingMap[token]
}

// ============================================================================
// フェーズ2: 高度なヘルパー関数
// ============================================================================

/**
 * タイポグラフィの設定オプション
 */
export interface TypographyOptions {
  size?: keyof typeof FONT_SIZE_TOKENS
  weight?: keyof typeof FONT_WEIGHT_TOKENS
  lineHeight?: keyof typeof LINE_HEIGHT_TOKENS
}

/**
 * タイポグラフィのクラス名を組み合わせて取得するヘルパー関数
 * 
 * @example
 * getTypography({ size: 'lg', weight: 'semibold', lineHeight: 'normal' })
 * // returns 'text-lg font-semibold leading-normal'
 * 
 * getTypography({ size: '2xl', weight: 'bold' })
 * // returns 'text-2xl font-bold'
 */
export function getTypography(options: TypographyOptions): string {
  const classes: string[] = []
  
  if (options.size) {
    classes.push(getFontSize(options.size))
  }
  
  if (options.weight) {
    classes.push(getFontWeight(options.weight))
  }
  
  if (options.lineHeight) {
    classes.push(getLineHeight(options.lineHeight))
  }
  
  return classes.join(' ')
}

/**
 * スペーシングの設定オプション
 */
export interface SpacingOptions {
  p?: keyof typeof SPACING_TOKENS // padding
  px?: keyof typeof SPACING_TOKENS // padding-x
  py?: keyof typeof SPACING_TOKENS // padding-y
  pt?: keyof typeof SPACING_TOKENS // padding-top
  pr?: keyof typeof SPACING_TOKENS // padding-right
  pb?: keyof typeof SPACING_TOKENS // padding-bottom
  pl?: keyof typeof SPACING_TOKENS // padding-left
  m?: keyof typeof SPACING_TOKENS  // margin
  mx?: keyof typeof SPACING_TOKENS  // margin-x
  my?: keyof typeof SPACING_TOKENS  // margin-y
  mt?: keyof typeof SPACING_TOKENS  // margin-top
  mr?: keyof typeof SPACING_TOKENS  // margin-right
  mb?: keyof typeof SPACING_TOKENS  // margin-bottom
  ml?: keyof typeof SPACING_TOKENS  // margin-left
  gap?: keyof typeof SPACING_TOKENS // gap
  gapX?: keyof typeof SPACING_TOKENS // gap-x
  gapY?: keyof typeof SPACING_TOKENS // gap-y
}

/**
 * スペーシングのクラス名を組み合わせて取得するヘルパー関数
 * 
 * @example
 * getSpacingClasses({ p: '02', m: '01', gap: '03' })
 * // returns 'p-2 m-1 gap-3' (Tailwind標準クラス)
 * 
 * getSpacingClasses({ px: '04', py: '02' })
 * // returns 'px-4 py-2'
 */
export function getSpacingClasses(options: SpacingOptions): string {
  const classes: string[] = []
  
  // デザイントークン専用クラスにマッピング
  const spacingToTokenClass: Record<keyof typeof SPACING_TOKENS, string> = {
    '01': 'spacing-01',
    '02': 'spacing-02',
    '03': 'spacing-03',
    '04': 'spacing-04',
    '05': 'spacing-05',
    '06': 'spacing-06',
    '07': 'spacing-07',
    '08': 'spacing-08',
    '09': 'spacing-09',
    '10': 'spacing-10',
  }
  
  if (options.p) classes.push(`p-${spacingToTokenClass[options.p]}`)
  if (options.px) classes.push(`px-${spacingToTokenClass[options.px]}`)
  if (options.py) classes.push(`py-${spacingToTokenClass[options.py]}`)
  if (options.pt) classes.push(`pt-${spacingToTokenClass[options.pt]}`)
  if (options.pr) classes.push(`pr-${spacingToTokenClass[options.pr]}`)
  if (options.pb) classes.push(`pb-${spacingToTokenClass[options.pb]}`)
  if (options.pl) classes.push(`pl-${spacingToTokenClass[options.pl]}`)
  if (options.m) classes.push(`m-${spacingToTokenClass[options.m]}`)
  if (options.mx) classes.push(`mx-${spacingToTokenClass[options.mx]}`)
  if (options.my) classes.push(`my-${spacingToTokenClass[options.my]}`)
  if (options.mt) classes.push(`mt-${spacingToTokenClass[options.mt]}`)
  if (options.mr) classes.push(`mr-${spacingToTokenClass[options.mr]}`)
  if (options.mb) classes.push(`mb-${spacingToTokenClass[options.mb]}`)
  if (options.ml) classes.push(`ml-${spacingToTokenClass[options.ml]}`)
  if (options.gap) classes.push(`gap-${spacingToTokenClass[options.gap]}`)
  if (options.gapX) classes.push(`gap-x-${spacingToTokenClass[options.gapX]}`)
  if (options.gapY) classes.push(`gap-y-${spacingToTokenClass[options.gapY]}`)
  
  return classes.join(' ')
}

/**
 * 複数のクラス名を結合するヘルパー関数
 * 
 * @example
 * combineTokens(['text-lg', 'font-semibold', 'bg-primary'])
 * // returns 'text-lg font-semibold bg-primary'
 * 
 * combineTokens([getFontSize('lg'), getColor('primary')])
 * // returns 'text-lg bg-primary text-primary-foreground'
 */
export function combineTokens(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 値が8pxの倍数かどうかを検証する関数
 * 
 * @example
 * isValidSpacing(16) // returns true (8pxの倍数)
 * isValidSpacing(15) // returns false
 * isValidSpacing(24) // returns true
 */
export function isValidSpacing(value: number): boolean {
  return value % DESIGN_SYSTEM_BASE_UNIT === 0 && value >= 0
}

/**
 * スペーシングトークンが有効かどうかを検証する関数
 * 
 * @example
 * isValidSpacingToken('spacing-02') // returns true
 * isValidSpacingToken('spacing-99') // returns false
 */
export function isValidSpacingToken(token: string): token is SpacingToken {
  return Object.values(SPACING_TOKENS).includes(token as SpacingToken)
}

/**
 * フォントサイズトークンが有効かどうかを検証する関数
 * 
 * @example
 * isValidFontSizeToken('text-lg') // returns true
 * isValidFontSizeToken('text-xxl') // returns false
 */
export function isValidFontSizeToken(token: string): token is FontSizeToken {
  return Object.values(FONT_SIZE_TOKENS).includes(token as FontSizeToken)
}

/**
 * カラートークンが有効かどうかを検証する関数
 * 
 * @example
 * isValidColorToken('bg-primary text-primary-foreground') // returns true
 * isValidColorToken('bg-custom') // returns false
 */
export function isValidColorToken(token: string): token is ColorToken {
  return Object.values(COLOR_TOKENS).includes(token as ColorToken)
}

/**
 * ボタンプリセットのサイズ
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * ボタンプリセットのバリアント
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

/**
 * ボタン用のプリセットクラスを取得する関数
 * 
 * @example
 * getButtonPreset('primary', 'md')
 * // returns 'bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium'
 * 
 * getButtonPreset('outline', 'sm')
 * // returns 'border border-border bg-background px-3 py-1.5 rounded-md text-sm'
 */
export function getButtonPreset(variant: ButtonVariant, size: ButtonSize = 'md'): string {
  const baseClasses = 'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }
  
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-9 px-4 py-2 rounded-md',
    lg: 'h-10 px-6 rounded-md',
  }
  
  return combineTokens(baseClasses, variantClasses[variant], sizeClasses[size])
}

/**
 * カードプリセットのバリアント
 */
export type CardVariant = 'default' | 'outline' | 'elevated'

/**
 * カード用のプリセットクラスを取得する関数
 * 
 * @example
 * getCardPreset('default')
 * // returns 'bg-card text-card-foreground rounded-lg border border-border shadow-sm'
 * 
 * getCardPreset('elevated')
 * // returns 'bg-card text-card-foreground rounded-lg shadow-md'
 */
export function getCardPreset(variant: CardVariant = 'default'): string {
  const baseClasses = 'bg-card text-card-foreground rounded-lg'
  
  const variantClasses: Record<CardVariant, string> = {
    default: 'border border-border shadow-sm',
    outline: 'border-2 border-border',
    elevated: 'shadow-md',
  }
  
  return combineTokens(baseClasses, variantClasses[variant])
}

/**
 * コンテナプリセットのサイズ
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * コンテナ用のプリセットクラスを取得する関数
 * 
 * @example
 * getContainerPreset('md', { p: '04' })
 * // returns 'max-w-4xl mx-auto p-4'
 * 
 * getContainerPreset('lg', { px: '06', py: '04' })
 * // returns 'max-w-6xl mx-auto px-6 py-4'
 */
export function getContainerPreset(
  size: ContainerSize = 'md',
  spacing?: SpacingOptions
): string {
  const sizeClasses: Record<ContainerSize, string> = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }
  
  const baseClasses = `${sizeClasses[size]} mx-auto`
  const spacingClasses = spacing ? getSpacingClasses(spacing) : ''
  
  return combineTokens(baseClasses, spacingClasses)
}

/**
 * グリッドシステムの設定
 * 
 * 注意: このオブジェクトは、getGridClasses関数より前に定義する必要があります。
 */
export const GRID_CONFIG = {
  // カラム間のガター（推奨値）
  DEFAULT_GAP: '04' as const, // 32px - 標準的なカラム間スペーシング
  TIGHT_GAP: '02' as const,    // 16px - 密なレイアウト用
  LOOSE_GAP: '06' as const,    // 48px - ゆったりしたレイアウト用
  
  // セクション間のスペーシング（IBM Design Language準拠）
  // セクション間の合計ガターは80px。各セクションの上下に40pxずつ設定することで均等にする
  SECTION_GAP: '05' as const,   // 40px - セクションの上下マージン（合計80px）
  
  // ブレイクポイント（Tailwind標準）
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // コンテナの最大幅
  CONTAINER_MAX_WIDTH: {
    sm: 'max-w-2xl',   // 672px
    md: 'max-w-4xl',   // 896px
    lg: 'max-w-6xl',   // 1152px
    xl: 'max-w-7xl',   // 1280px
  },
} as const

/**
 * グリッド用のクラス名を取得する関数
 * 
 * @example
 * getGridClasses({ cols: 3, gap: 'default' })
 * // returns 'grid md:grid-cols-3 gap-4'
 * 
 * getGridClasses({ cols: 2, gap: 'tight', responsive: true })
 * // returns 'grid grid-cols-1 sm:grid-cols-2 gap-2'
 */
export function getGridClasses(options: {
  cols: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'default' | 'tight' | 'loose' | keyof typeof SPACING_TOKENS
  responsive?: boolean
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}): string {
  const { cols, gap = 'default', responsive = false, breakpoint = 'md' } = options
  
  // ガターの決定
  let gapToken: keyof typeof SPACING_TOKENS
  if (gap === 'default') {
    gapToken = GRID_CONFIG.DEFAULT_GAP as keyof typeof SPACING_TOKENS
  } else if (gap === 'tight') {
    gapToken = GRID_CONFIG.TIGHT_GAP as keyof typeof SPACING_TOKENS
  } else if (gap === 'loose') {
    gapToken = GRID_CONFIG.LOOSE_GAP as keyof typeof SPACING_TOKENS
  } else {
    gapToken = gap
  }
  
  const gapClasses = getSpacingClasses({ gap: gapToken })
  
  // グリッドカラムのクラス（Tailwindの標準クラスを使用）
  // 完全なクラス名をマッピングして、Tailwindが認識できるようにする
  const responsiveColsMap: Record<string, string> = {
    'sm-1': 'sm:grid-cols-1',
    'sm-2': 'sm:grid-cols-2',
    'sm-3': 'sm:grid-cols-3',
    'sm-4': 'sm:grid-cols-4',
    'sm-5': 'sm:grid-cols-5',
    'sm-6': 'sm:grid-cols-6',
    'sm-12': 'sm:grid-cols-12',
    'md-1': 'md:grid-cols-1',
    'md-2': 'md:grid-cols-2',
    'md-3': 'md:grid-cols-3',
    'md-4': 'md:grid-cols-4',
    'md-5': 'md:grid-cols-5',
    'md-6': 'md:grid-cols-6',
    'md-12': 'md:grid-cols-12',
    'lg-1': 'lg:grid-cols-1',
    'lg-2': 'lg:grid-cols-2',
    'lg-3': 'lg:grid-cols-3',
    'lg-4': 'lg:grid-cols-4',
    'lg-5': 'lg:grid-cols-5',
    'lg-6': 'lg:grid-cols-6',
    'lg-12': 'lg:grid-cols-12',
    'xl-1': 'xl:grid-cols-1',
    'xl-2': 'xl:grid-cols-2',
    'xl-3': 'xl:grid-cols-3',
    'xl-4': 'xl:grid-cols-4',
    'xl-5': 'xl:grid-cols-5',
    'xl-6': 'xl:grid-cols-6',
    'xl-12': 'xl:grid-cols-12',
  }
  
  const key = `${breakpoint}-${cols}` as string
  const responsiveColClass = responsiveColsMap[key] || `md:grid-cols-${cols}`
  
  const gridColsClass = responsive
    ? `grid grid-cols-1 ${responsiveColClass}`
    : `grid ${responsiveColClass}`
  
  return combineTokens(gridColsClass, gapClasses)
}

