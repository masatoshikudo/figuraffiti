# 通常モードUI/UX改善 実装計画

## 概要

提案B（チュートリアル）実装前に、通常モードでのUI/UX改善を実装します。これにより、チュートリアルで紹介する機能が既に存在し、ユーザー体験の一貫性を保つことができます。

## 実装対象機能

1. ✅ **ステータス別ピンデザイン**（承認済み、承認待ち、更新可能、高難易度）
2. ✅ **リッチな情報ポップアップ**（動画プレビュー、トリック難易度、承認者情報、コメント機能）
3. ✅ **一般的なホバーエフェクト**（通常モード）
4. ✅ **承認ステータスの可視化**（マイページ）※既に実装済み
5. ✅ **チャレンジ機能とスキルツリー**（オプション：後回し可）

## 実装タスク分解

### Phase 1-1: ステータス別ピンデザインの実装（最優先）

#### Task 1-1: 更新可能性判定ロジックの拡張

**目的**: 地図上のすべてのスポットについて、更新可能性を判定できるようにする

**実装内容:**
- [ ] `lib/spot/spot-utils.ts`に`findUpdatableSpots()`関数を追加
  - すべての承認済み記録を取得
  - 各記録について、より高難易度の技で更新可能かを判定
  - 更新可能な記録のリストを返す
- [ ] `lib/spot/spot-utils.ts`に`getDifficultyLevel()`関数を確認・拡張
  - 既存の関数を確認し、必要に応じて拡張
- [ ] 更新可能性判定のキャッシュ機能を実装
  - パフォーマンス向上のため、判定結果をキャッシュ

**依存関係**: なし（既存の`canUpdateRecord()`と`getDifficultyLevel()`を使用）

**推定工数**: 2-3時間

---

#### Task 1-2: ステータス別ピンデザインシステムの実装

**目的**: 記録の状態に応じて、ピンの色、形状、アニメーションを変化させる

**実装内容:**
- [ ] `lib/mapbox/mapbox-utils.ts`を更新
  - `createSpotMarker()`関数を拡張
  - ステータス（承認済み、承認待ち、更新可能、高難易度）に応じたデザインを適用
  - ピンの形状を変更（円形、星形、ダイヤモンド形など）
  - ピンの色を変更（ステータス別のカラーパレット）
  - アニメーション効果を追加（更新可能なスポットはパルス、高難易度はグローなど）
- [ ] `lib/constants.ts`にステータス別デザイン設定を追加
  - 承認済み: 緑系、円形
  - 承認待ち: グレー系、円形（点線ボーダー）
  - 更新可能: オレンジ/金色、星形、パルスアニメーション
  - 高難易度: 紫/赤系、ダイヤモンド形、グローエフェクト
- [ ] `components/map/map-view.tsx`を更新
  - スポットのステータス情報を取得
  - 更新可能性を判定
  - ステータスに応じたマーカーを作成

**依存関係**: Task 1-1

**推定工数**: 5-6時間

---

#### Task 1-3: 高難易度記録の判定ロジック

**目的**: 高難易度の記録を識別し、特別なデザインを適用

**実装内容:**
- [ ] `lib/spot/spot-utils.ts`に`isHighDifficulty()`関数を追加
  - 難易度レベルが3以上（または設定可能な閾値）の記録を判定
  - 高難易度記録のリストを返す
- [ ] `lib/constants.ts`に高難易度の閾値を追加
  - デフォルト: 難易度レベル3以上

**依存関係**: Task 1-1

**推定工数**: 1-2時間

---

### Phase 1-2: リッチな情報ポップアップの実装

#### Task 2-1: 動画プレビューの統合

**目的**: スポット情報ポップアップに動画プレビューを追加

**実装内容:**
- [ ] `components/spot/spot-window.tsx`を更新
  - 動画URLがある場合、動画プレビューを表示
  - YouTube、Instagram、Twitterなどの埋め込み対応
  - 動画のサムネイル表示
- [ ] `components/spot/spot-media-viewer.tsx`を確認・拡張
  - 既存のメディアビューアーを確認
  - 動画プレビュー機能を追加
- [ ] `lib/oembed.ts`を確認・拡張
  - OEmbed APIを使用した動画情報の取得
  - サムネイルURLの取得

**依存関係**: なし

**推定工数**: 4-5時間

---

#### Task 2-2: トリック難易度の表示

**目的**: スポット情報ポップアップにトリック難易度を表示

**実装内容:**
- [ ] `components/spot/spot-window.tsx`を更新
  - トリック難易度レベルを表示
  - 難易度バッジまたはスター表示
  - 難易度レベルの説明（レベル1: 基本技、レベル2: 中級技など）
- [ ] `lib/spot/spot-utils.ts`の`getDifficultyLevel()`関数を活用
- [ ] 難易度表示用のUIコンポーネントを作成
  - `components/spot/difficulty-badge.tsx`を作成

**依存関係**: Task 1-1

**推定工数**: 2-3時間

---

#### Task 2-3: 承認者情報の表示

**目的**: スポット情報ポップアップに承認者情報を表示

**実装内容:**
- [ ] `components/spot/spot-window.tsx`を更新
  - 承認者情報を表示（承認済みの場合）
  - 承認日時を表示
  - 承認者のアバターまたは名前を表示
- [ ] 承認者情報の取得
  - APIから承認者情報を取得（必要に応じて）
  - 承認者のユーザー情報を表示

**依存関係**: なし

**推定工数**: 2-3時間

---

#### Task 2-4: コメント機能の追加

**目的**: スポット情報ポップアップにコメント機能を追加

**実装内容:**
- [ ] データベーススキーマの設計
  - コメントテーブルの設計
  - マイグレーションファイルの作成
- [ ] APIエンドポイントの実装
  - `app/api/spots/[id]/comments/route.ts`を作成
  - コメントの取得、投稿、削除機能
- [ ] `components/spot/spot-comments.tsx`を作成
  - コメント一覧の表示
  - コメント投稿フォーム
  - コメント削除機能（自分のコメントのみ）
- [ ] `components/spot/spot-window.tsx`を更新
  - コメントセクションを追加

**依存関係**: なし

**推定工数**: 8-10時間

---

### Phase 1-3: 一般的なホバーエフェクトの実装

#### Task 3-1: ホバーエフェクトの強化

**目的**: マーカーのホバー時に、より豊かなエフェクトを表示

**実装内容:**
- [ ] `lib/mapbox/mapbox-utils.ts`の`createSpotMarker()`関数を更新
  - ホバー時のアニメーション効果を強化
  - グローエフェクトの追加
  - スケールアニメーションの改善
  - シャドウエフェクトの強化
- [ ] CSSアニメーションの追加
  - `app/globals.css`にホバーエフェクト用のアニメーションを追加
  - キーフレームアニメーションの定義

**依存関係**: Task 1-2

**推定工数**: 2-3時間

---

#### Task 3-2: ホバー時の情報プレビュー

**目的**: マーカーホバー時に、より詳細な情報をプレビュー表示

**実装内容:**
- [ ] `lib/mapbox/mapbox-utils.ts`の`createStreetViewPopup()`関数を拡張
  - スポット名、技名、難易度などの情報を表示
  - デザインの改善
  - アニメーション効果の追加
- [ ] ホバー時のツールチップコンポーネントを作成
  - `components/map/spot-tooltip.tsx`を作成

**依存関係**: Task 1-2, Task 2-2

**推定工数**: 3-4時間

---

### Phase 1-4: 承認ステータスの可視化（既に実装済み）

#### Task 4-1: 既存実装の確認と改善

**目的**: 既存の承認ステータス可視化機能を確認し、必要に応じて改善

**実装内容:**
- [ ] `components/profile/my-submissions-tab.tsx`を確認
  - 既存の実装を確認
  - 改善点を特定
- [ ] 却下理由の表示改善
  - 既に実装されているが、UI/UXの改善
- [ ] 承認日時の表示改善
  - 既に実装されているが、UI/UXの改善

**依存関係**: なし

**推定工数**: 1-2時間（改善が必要な場合）

---

### Phase 1-5: チャレンジ機能とスキルツリー（オプション）

#### Task 5-1: チャレンジ機能の実装

**目的**: 特定のスポットに「チャレンジ」を設定し、達成者にバッジやポイントを付与

**実装内容:**
- [ ] データベーススキーマの設計
  - チャレンジテーブルの設計
  - ユーザー達成記録テーブルの設計
  - マイグレーションファイルの作成
- [ ] APIエンドポイントの実装
  - `app/api/challenges/route.ts`を作成
  - チャレンジの取得、作成、更新機能
  - `app/api/challenges/[id]/complete/route.ts`を作成
  - チャレンジ達成機能
- [ ] UIコンポーネントの実装
  - `components/challenge/challenge-badge.tsx`を作成
  - `components/challenge/challenge-list.tsx`を作成
  - スポット情報にチャレンジ情報を表示

**依存関係**: なし

**推定工数**: 10-12時間

---

#### Task 5-2: スキルツリーの可視化

**目的**: メイクしたトリックを「スキルツリー」として可視化

**実装内容:**
- [ ] データベーススキーマの設計
  - ユーザーの達成記録テーブルの設計
  - マイグレーションファイルの作成
- [ ] APIエンドポイントの実装
  - `app/api/skills/route.ts`を作成
  - ユーザーのスキル情報を取得
- [ ] UIコンポーネントの実装
  - `components/skills/skill-tree.tsx`を作成
  - スキルツリーの可視化
  - プロフィールページにスキルツリーを表示

**依存関係**: Task 5-1

**推定工数**: 8-10時間

---

## 実装順序の推奨

### Phase 1-1: 基盤UI改善（最優先）
1. **Task 1-1** → **Task 1-3** → **Task 1-2**（ステータス別ピンデザイン）
2. **Task 3-1** → **Task 3-2**（ホバーエフェクト）

### Phase 1-2: 情報ポップアップの拡張
3. **Task 2-2** → **Task 2-1** → **Task 2-3** → **Task 2-4**（リッチな情報ポップアップ）

### Phase 1-3: 既存機能の確認
4. **Task 4-1**（承認ステータスの可視化）

### Phase 1-4: エンゲージメント機能（オプション）
5. **Task 5-1** → **Task 5-2**（チャレンジ機能とスキルツリー）

---

## 合計推定工数

### Phase 1-1: 基盤UI改善
- 最小: 10時間
- 最大: 14時間

### Phase 1-2: 情報ポップアップの拡張
- 最小: 16時間
- 最大: 21時間

### Phase 1-3: 既存機能の確認
- 最小: 1時間
- 最大: 2時間

### Phase 1-4: エンゲージメント機能（オプション）
- 最小: 18時間
- 最大: 22時間

### 合計（エンゲージメント機能除く）
- 最小: 27時間
- 最大: 37時間

### 合計（エンゲージメント機能含む）
- 最小: 45時間
- 最大: 59時間

---

## 技術的な考慮事項

### 1. ステータス別ピンデザイン

**デザイン仕様:**
```typescript
export const SPOT_MARKER_STYLES = {
  approved: {
    color: "#10b981", // 緑
    shape: "circle",
    size: 24,
    border: "2px solid white",
    animation: null,
  },
  pending: {
    color: "#6b7280", // グレー
    shape: "circle",
    size: 24,
    border: "2px dashed #6b7280",
    animation: null,
  },
  updatable: {
    color: "#f59e0b", // オレンジ/金色
    shape: "star",
    size: 28,
    border: "2px solid white",
    animation: "pulse", // パルスアニメーション
  },
  highDifficulty: {
    color: "#8b5cf6", // 紫
    shape: "diamond",
    size: 26,
    border: "2px solid white",
    animation: "glow", // グローエフェクト
  },
}
```

### 2. 更新可能性の判定

既存の`canUpdateRecord()`関数を活用しますが、地図上のすべてのスポットについて更新可能性を判定する必要があります。

**実装方法:**
- 各スポットについて、近接するスポットを取得
- 代表記録を選択
- 更新可能性を判定
- 結果をキャッシュしてパフォーマンスを最適化

### 3. パフォーマンス最適化

- 更新可能性の判定は事前に計算してキャッシュ
- マーカーの作成は必要最小限に
- アニメーション効果は`requestAnimationFrame`を使用して最適化
- ビューポート内のスポットのみを処理

### 4. コメント機能

**データベーススキーマ:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. チャレンジ機能

**データベーススキーマ:**
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
```

---

## 次のステップ

実装を開始する前に、以下を確認・決定してください：

1. **デザイン仕様**: ステータス別ピンデザインの詳細なデザイン仕様
2. **コメント機能**: コメント機能の実装範囲（認証必須か、匿名コメント可かなど）
3. **チャレンジ機能**: チャレンジ機能の実装範囲（Phase 1で実装するか、後回しにするか）
4. **スキルツリー**: スキルツリーの実装範囲（Phase 1で実装するか、後回しにするか）

承認後、実装を開始いたします。

