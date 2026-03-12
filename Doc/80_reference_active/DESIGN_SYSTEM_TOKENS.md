# デザインシステムトークン使用ガイド

このドキュメントでは、デザインシステムで定義されたトークンの使用方法を説明します。

## 📐 スペーシング（8pxベースのグリッドシステム）

すべてのスペーシングは8pxの倍数で定義されています。

### 利用可能なトークン

| トークン | 値 | 生成されるクラス名 |
|---------|-----|----------------|
| `spacing-01` | 8px (0.5rem) | `p-spacing-01`, `px-spacing-01`, `py-spacing-01`, `m-spacing-01`, `gap-spacing-01` など |
| `spacing-02` | 16px (1rem) | `p-spacing-02`, `px-spacing-02`, `py-spacing-02`, `m-spacing-02`, `gap-spacing-02` など |
| `spacing-03` | 24px (1.5rem) | `p-spacing-03`, `px-spacing-03`, `py-spacing-03`, `m-spacing-03`, `gap-spacing-03` など |
| `spacing-04` | 32px (2rem) | `p-spacing-04`, `px-spacing-04`, `py-spacing-04`, `m-spacing-04`, `gap-spacing-04` など |
| `spacing-05` | 40px (2.5rem) | `p-spacing-05`, `px-spacing-05`, `py-spacing-05`, `m-spacing-05`, `gap-spacing-05` など |
| `spacing-06` | 48px (3rem) | `p-spacing-06`, `px-spacing-06`, `py-spacing-06`, `m-spacing-06`, `gap-spacing-06` など |
| `spacing-07` | 56px (3.5rem) | `p-spacing-07`, `px-spacing-07`, `py-spacing-07`, `m-spacing-07`, `gap-spacing-07` など |
| `spacing-08` | 64px (4rem) | `p-spacing-08`, `px-spacing-08`, `py-spacing-08`, `m-spacing-08`, `gap-spacing-08` など |
| `spacing-09` | 72px (4.5rem) | `p-spacing-09`, `px-spacing-09`, `py-spacing-09`, `m-spacing-09`, `gap-spacing-09` など |
| `spacing-10` | 80px (5rem) | `p-spacing-10`, `px-spacing-10`, `py-spacing-10`, `m-spacing-10`, `gap-spacing-10` など |

### 使用例

```tsx
// ❌ 悪い例: ハードコードされた値
<div className="p-4 m-2 gap-3">

// ✅ 良い例: getSpacingClassesヘルパー関数を使用（推奨）
import { getSpacingClasses } from '@/lib/design-tokens'

<div className={getSpacingClasses({ p: '02', m: '01', gap: '03' })}>
// 生成されるクラス: 'p-spacing-02 m-spacing-01 gap-spacing-03'

// ✅ 良い例: 直接クラス名を使用（可能だが非推奨）
<div className="p-spacing-02 m-spacing-01 gap-spacing-03">
```

**注意**: `getSpacingClasses`ヘルパー関数を使用することで、型安全性が確保され、トークン名の間違いを防ぐことができます。直接クラス名を使用する場合は、トークン名の形式（`p-spacing-02`など）を正確に記述する必要があります。

### 要素間のスペーシング（ボタン、カード、コンポーネント間）

複数の要素を並べる際は、`gap`プロパティを使用して要素間のスペースを確保します。

#### 推奨されるスペーシング値

| 用途 | 推奨トークン | 値 | 使用例 |
|------|------------|-----|--------|
| **ボタン間（横並び）** | `spacing-02` | 16px | `gap-spacing-02` |
| **ボタン間（縦並び）** | `spacing-02` | 16px | `gap-y-spacing-02` |
| **カード間（グリッド）** | `spacing-04` | 32px | `gap-spacing-04` |
| **フォーム要素間** | `spacing-03` | 24px | `gap-y-spacing-03` |
| **リストアイテム間** | `spacing-02` | 16px | `gap-y-spacing-02` |

#### 使用例

```tsx
import { getSpacingClasses } from '@/lib/design-tokens'

// ✅ 良い例: ボタングループ（横並び）
<div className={getSpacingClasses({ gap: '02' })}>
  <Button>保存</Button>
  <Button variant="outline">キャンセル</Button>
</div>
// 生成されるクラス: 'gap-spacing-02'
// ボタン間に16pxのスペースが確保される

// ✅ 良い例: ボタングループ（縦並び）
<div className={getSpacingClasses({ gapY: '02' })}>
  <Button>保存</Button>
  <Button variant="outline">キャンセル</Button>
</div>
// 生成されるクラス: 'gap-y-spacing-02'

// ✅ 良い例: カードグリッド
<div className={combineTokens(
  'grid md:grid-cols-3',
  getSpacingClasses({ gap: '04' })
)}>
  <Card>カード1</Card>
  <Card>カード2</Card>
  <Card>カード3</Card>
</div>
// カード間に32pxのスペースが確保される

// ❌ 悪い例: marginで個別に設定
<div>
  <Button className="mr-2">保存</Button>
  <Button variant="outline">キャンセル</Button>
</div>
// 最後の要素にもmarginが適用されてしまう可能性がある

// ✅ 良い例: gapを使用（推奨）
<div className={getSpacingClasses({ gap: '02' })}>
  <Button>保存</Button>
  <Button variant="outline">キャンセル</Button>
</div>
// 最初と最後の要素にも適切にスペースが確保される
```

**ベストプラクティス**:
- 複数の要素を並べる場合は、`gap`プロパティを使用することを推奨します
- `margin`で個別に設定するよりも、親要素に`gap`を設定する方が保守性が高くなります
- `flex`や`grid`レイアウトを使用する場合は、必ず`gap`を設定してください

### コンテナ・div要素へのpadding設定

コンテナやdiv要素には、適切なpaddingを設定することを推奨します。これにより、コンテンツと境界線の間に適切なスペースが確保されます。

#### 推奨されるpadding値

| 要素の種類 | 推奨トークン | 値 | 使用例 |
|----------|------------|-----|--------|
| **一般的なコンテナ** | `spacing-04` | 32px | `p-spacing-04` または `px-spacing-04 py-spacing-04` |
| **カードコンテナ** | `spacing-04` | 32px | `p-spacing-04` |
| **セクションコンテナ** | `spacing-05` | 40px | `py-spacing-05 px-spacing-02` |
| **小さなコンテナ** | `spacing-02` | 16px | `p-spacing-02` |
| **大きなコンテナ** | `spacing-06` | 48px | `p-spacing-06` |

#### 使用例

```tsx
import { getSpacingClasses, combineTokens } from '@/lib/design-tokens'

// ✅ 良い例: 一般的なコンテナにpaddingを設定
<div className={getSpacingClasses({ p: '04' })}>
  <h2>タイトル</h2>
  <p>コンテンツ</p>
</div>
// 生成されるクラス: 'p-spacing-04'
// コンテナの全方向に32pxのpaddingが設定される

// ✅ 良い例: セクションコンテナ（上下に40px、左右に16px）
<div className={getSpacingClasses({ py: '05', px: '02' })}>
  <h2>セクションタイトル</h2>
  <p>セクションコンテンツ</p>
</div>
// 生成されるクラス: 'py-spacing-05 px-spacing-02'

// ✅ 良い例: カードコンテナ
<div className={combineTokens(
  'bg-card rounded-lg border',
  getSpacingClasses({ p: '04' })
)}>
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</div>

// ❌ 悪い例: paddingが設定されていないコンテナ
<div>
  <h2>タイトル</h2>
  <p>コンテンツ</p>
</div>
// コンテンツが境界線に密着して見える

// ✅ 良い例: 必ずpaddingを設定
<div className={getSpacingClasses({ p: '04' })}>
  <h2>タイトル</h2>
  <p>コンテンツ</p>
</div>
```

**ベストプラクティス**:
- **コンテナやdiv要素には必ずpaddingを設定する**: コンテンツと境界線の間に適切なスペースを確保します
- **用途に応じて適切な値を選択**: 一般的なコンテナは`spacing-04`（32px）、セクションは`spacing-05`（40px）を推奨
- **レスポンシブ対応**: モバイルでは小さめのpadding、デスクトップでは大きめのpaddingを設定することも検討してください

---

## 📐 グリッドシステム（カラムレイアウト）

IBMの2x Gridを参考にした、8pxベースのグリッドシステムです。カラム間のスペーシング（ガター）も8pxの倍数で定義されています。

### カラム間のガター（推奨値）

| ガターサイズ | 値 | 用途 | 生成されるクラス |
|------------|-----|------|---------------|
| `tight` | 16px (spacing-02) | 密なレイアウト、カードが小さい場合 | `gap-spacing-02` |
| `default` | 32px (spacing-04) | **標準的なカラム間スペーシング** | `gap-spacing-04` |
| `loose` | 48px (spacing-06) | ゆったりしたレイアウト、大きなカードの場合 | `gap-spacing-06` |

### 使用例

```tsx
import { getGridClasses } from '@/lib/design-tokens'

// ✅ 良い例: 標準的なガターを使用
const gridClasses = getGridClasses({ 
  cols: 3, 
  gap: 'default',  // 32px
  responsive: true 
})
// 戻り値: 'grid grid-cols-1 md:grid-cols-3 gap-spacing-04'

// ✅ 良い例: 密なレイアウト
const tightGridClasses = getGridClasses({ 
  cols: 4, 
  gap: 'tight',  // 16px
  breakpoint: 'lg' 
})
// 戻り値: 'grid lg:grid-cols-4 gap-spacing-02'

// ❌ 悪い例: ガターなし
<div className="grid md:grid-cols-3">
  {/* カラム間が詰まって見える */}
</div>

// ✅ 良い例: 適切なガターを設定
<div className={getGridClasses({ cols: 3, gap: 'default' })}>
  {/* カラム間に適切なスペースがある */}
</div>
```

### セクション間のスペーシング（IBM Design Language準拠）

IBM Design Languageに基づき、セクション間のスペーシングも均等に設定します。

| 設定 | 値 | 説明 |
|------|-----|------|
| **セクション間の合計ガター** | 80px | セクション間の合計スペーシング |
| **各セクションの上下マージン** | 40px (spacing-05) | 各セクションの上下に40pxずつ設定することで、セクション間の合計が80pxになる |

### 使用例

```tsx
import { GRID_CONFIG, getSpacingClasses } from '@/lib/design-tokens'

// ✅ 良い例: 標準的なセクション間スペーシング
const sectionClasses = combineTokens(
  'bg-white',
  getSpacingClasses({ py: GRID_CONFIG.SECTION_GAP, px: '02' })
)
// 各セクションの上下に40pxずつ設定され、セクション間の合計が80pxになる
```

### グリッドのベストプラクティス

1. **常にガターを設定**: カラム間のスペーシングは必須です。`gap`プロパティを必ず指定してください。
2. **標準は32px**: 特に指定がない場合は、`default`（32px）を使用してください。
3. **レスポンシブ対応**: モバイルでは1カラム、デスクトップでは複数カラムになるよう、`responsive: true`を使用してください。
4. **セクション間の均等なスペーシング**: セクション間の合計ガターは80px。各セクションの上下に40pxずつ設定することで均等にします。

---

## 📝 タイポグラフィ

### フォントサイズ

| トークン | 値 | Tailwindクラス |
|---------|-----|---------------|
| `text-xs` | 12px (0.75rem) | `text-xs` |
| `text-sm` | 14px (0.875rem) | `text-sm` |
| `text-base` | 16px (1rem) | `text-base` |
| `text-lg` | 18px (1.125rem) | `text-lg` |
| `text-xl` | 20px (1.25rem) | `text-xl` |
| `text-2xl` | 24px (1.5rem) | `text-2xl` |
| `text-3xl` | 30px (1.875rem) | `text-3xl` |
| `text-4xl` | 36px (2.25rem) | `text-4xl` |
| `text-5xl` | 48px (3rem) | `text-5xl` |

### 行の高さ

| トークン | 値 | Tailwindクラス |
|---------|-----|---------------|
| `leading-tight` | 1.25 | `leading-tight` |
| `leading-normal` | 1.5 | `leading-normal` |
| `leading-relaxed` | 1.75 | `leading-relaxed` |

### フォントウェイト

| トークン | 値 | Tailwindクラス |
|---------|-----|---------------|
| `font-normal` | 400 | `font-normal` |
| `font-medium` | 500 | `font-medium` |
| `font-semibold` | 600 | `font-semibold` |
| `font-bold` | 700 | `font-bold` |

### 使用例

```tsx
// ❌ 悪い例: ハードコードされた値
<h1 className="text-[24px] leading-[1.5] font-[600]">

// ✅ 良い例: トークンを使用
<h1 className="text-2xl leading-normal font-semibold">
```

---

## 🎨 カラー

セマンティックなカラー名を使用してください。これにより、ダークモード対応や将来的なテーマ変更が容易になります。

### 利用可能なカラートークン

| トークン | 用途 | Tailwindクラス例 |
|---------|------|----------------|
| `background` | ページ背景 | `bg-background` |
| `foreground` | テキスト色 | `text-foreground` |
| `primary` | プライマリカラー | `bg-primary text-primary-foreground` |
| `secondary` | セカンダリカラー | `bg-secondary text-secondary-foreground` |
| `muted` | 控えめな背景/テキスト | `bg-muted text-muted-foreground` |
| `accent` | アクセントカラー | `bg-accent text-accent-foreground` |
| `destructive` | 破壊的なアクション | `bg-destructive text-destructive-foreground` |
| `border` | ボーダー色 | `border-border` |
| `input` | 入力フィールド背景 | `bg-input` |
| `ring` | フォーカスリング | `ring-ring` |

### 使用例

```tsx
// ❌ 悪い例: ハードコードされたカラー値
<button className="bg-[#e53935] text-[#ffffff]">

// ✅ 良い例: セマンティックなカラートークンを使用
<button className="bg-primary text-primary-foreground">
```

---

## 🔲 ボーダー

### ボーダー幅

| トークン | 値 | Tailwindクラス |
|---------|-----|---------------|
| `border-width-01` | 1px | `border-[1px]` |
| `border-width-02` | 2px | `border-[2px]` |
| `border-width-03` | 3px | `border-[3px]` |

### ボーダー角丸

| トークン | Tailwindクラス |
|---------|---------------|
| `radius-sm` | `rounded-sm` |
| `radius-md` | `rounded-md` |
| `radius-lg` | `rounded-lg` |
| `radius-xl` | `rounded-xl` |

### 使用例

```tsx
// ❌ 悪い例: ハードコードされた値
<div className="border-[2px] rounded-[8px]">

// ✅ 良い例: トークンを使用
<div className="border-[2px] rounded-md">
```

---

## 🛠️ TypeScriptヘルパー関数の使用

`lib/design-tokens.ts`で提供されているヘルパー関数を使用することで、型安全性を確保できます。

### 基本的なヘルパー関数（フェーズ1）

```tsx
import { getSpacing, getFontSize, getColor } from '@/lib/design-tokens'

// スペーシング
const spacing = getSpacing('02') // 'spacing-02'

// フォントサイズ
const fontSize = getFontSize('lg') // 'text-lg'

// カラー
const color = getColor('primary') // 'bg-primary text-primary-foreground'
```

### 高度なヘルパー関数（フェーズ2）

#### タイポグラフィコンビネーション

```tsx
import { getTypography } from '@/lib/design-tokens'

// フォントサイズ、ウェイト、行の高さを組み合わせ
const headingClasses = getTypography({
  size: '2xl',
  weight: 'bold',
  lineHeight: 'tight'
})
// 戻り値: 'text-2xl font-bold leading-tight'

const bodyClasses = getTypography({
  size: 'base',
  weight: 'normal',
  lineHeight: 'normal'
})
// 戻り値: 'text-base font-normal leading-normal'
```

#### スペーシングコンビネーション

```tsx
import { getSpacingClasses } from '@/lib/design-tokens'

// 複数のスペーシングを一度に指定
const containerClasses = getSpacingClasses({
  p: '04',    // padding: 32px
  m: '02',    // margin: 16px
  gap: '03'   // gap: 24px
})
// 戻り値: 'p-spacing-04 m-spacing-02 gap-spacing-03'

const cardClasses = getSpacingClasses({
  px: '04',   // padding-x: 32px
  py: '03',   // padding-y: 24px
  mb: '02'    // margin-bottom: 16px
})
// 戻り値: 'px-spacing-04 py-spacing-03 mb-spacing-02'

// 利用可能なオプション
const allOptions = getSpacingClasses({
  p: '02',      // padding (全方向)
  px: '04',     // padding-x (左右)
  py: '03',     // padding-y (上下)
  pt: '01',     // padding-top
  pr: '02',     // padding-right
  pb: '03',     // padding-bottom
  pl: '04',     // padding-left
  m: '02',      // margin (全方向)
  mx: '04',     // margin-x (左右)
  my: '03',     // margin-y (上下)
  mt: '01',     // margin-top
  mr: '02',     // margin-right
  mb: '03',     // margin-bottom
  ml: '04',     // margin-left
  gap: '02',    // gap (全方向)
  gapX: '03',   // gap-x (横方向)
  gapY: '04',   // gap-y (縦方向)
})
```

#### クラス名の結合

```tsx
import { combineTokens, getTypography, getColor, getSpacingClasses } from '@/lib/design-tokens'

// 複数のトークンを組み合わせてクラス名を生成
const buttonClasses = combineTokens(
  getColor('primary'),
  getSpacingClasses({ px: '04', py: '02' }),
  getTypography({ size: 'base', weight: 'semibold' }),
  'rounded-md'
)
// 戻り値: 'bg-primary text-primary-foreground px-4 py-2 text-base font-semibold rounded-md'
```

#### バリデーション関数

```tsx
import { isValidSpacing, isValidSpacingToken } from '@/lib/design-tokens'

// 値が8pxの倍数かチェック
if (isValidSpacing(16)) {
  // true: 16pxは8pxの倍数
}

if (isValidSpacing(15)) {
  // false: 15pxは8pxの倍数ではない
}

// トークンが有効かチェック
if (isValidSpacingToken('spacing-02')) {
  // true: 有効なトークン
}
```

#### コンポーネントプリセット

```tsx
import { getButtonPreset, getCardPreset, getContainerPreset } from '@/lib/design-tokens'

// ボタンプリセット
const primaryButton = getButtonPreset('primary', 'md')
// 戻り値: 'inline-flex items-center justify-center ... bg-primary text-primary-foreground ...'

const outlineButton = getButtonPreset('outline', 'sm')
// 戻り値: 'inline-flex items-center justify-center ... border border-border ...'

// カードプリセット
const defaultCard = getCardPreset('default')
// 戻り値: 'bg-card text-card-foreground rounded-lg border border-border shadow-sm'

const elevatedCard = getCardPreset('elevated')
// 戻り値: 'bg-card text-card-foreground rounded-lg shadow-md'

// コンテナプリセット
const container = getContainerPreset('md', { p: '04' })
// 戻り値: 'max-w-4xl mx-auto p-4'

const wideContainer = getContainerPreset('lg', { px: '06', py: '04' })
// 戻り値: 'max-w-6xl mx-auto px-6 py-4'
```

### 実践的な使用例

```tsx
import { 
  getTypography, 
  getSpacingClasses, 
  getCardPreset,
  combineTokens 
} from '@/lib/design-tokens'

// カードコンポーネントの例
export function MyCard() {
  const cardClasses = combineTokens(
    getCardPreset('default'),
    getSpacingClasses({ p: '04' })
  )
  
  const titleClasses = getTypography({
    size: 'xl',
    weight: 'bold',
    lineHeight: 'tight'
  })
  
  const bodyClasses = getTypography({
    size: 'base',
    weight: 'normal',
    lineHeight: 'normal'
  })
  
  return (
    <div className={cardClasses}>
      <h2 className={titleClasses}>タイトル</h2>
      <p className={bodyClasses}>本文テキスト</p>
    </div>
  )
}
```

---

## 📋 チェックリスト

新しいコンポーネントを作成する際は、以下のチェックリストを確認してください：

- [ ] スペーシング値は8pxの倍数になっているか？
- [ ] ハードコードされたカラー値（`#ffffff`, `rgb(...)`など）を使用していないか？
- [ ] ハードコードされたフォントサイズ（`text-[16px]`など）を使用していないか？
- [ ] 既存のshadcn/uiコンポーネントを再利用できているか？
- [ ] デザイントークンを使用しているか？

---

## 🚫 禁止事項

以下の行為は禁止されています：

1. **ハードコードされたスペーシング値**: `p-[13px]`, `m-[7px]`など、8pxの倍数でない値
2. **ハードコードされたカラー値**: `#e53935`, `rgb(229, 57, 53)`など、直接的なカラー値
3. **ハードコードされたフォントサイズ**: `text-[15px]`など、定義されていないサイズ
4. **デザインシステム外のコンポーネント作成**: 既存のコンポーネントで代替できない場合のみ、承認を得てから作成

---

## 📚 参考資料

- [デザインシステム実装フロー](./デザインシステム実装フロー.md)
- [バイブコーディングのためのデザインシステム構成案](./バイブコーディングのためのデザインシステム構成案.md)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)

