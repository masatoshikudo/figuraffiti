# パルスアニメーション現状整理

## 実装概要

### 1. 表示条件と優先順位（実装済み）

| 優先順位 | 条件 | パルスカラー | 波紋の強弱 | 実装状況 |
|---------|------|------------|-----------|---------|
| 1 | 更新可能性 + ホットスポット | 赤 (#ef4444) | 強（周期1.5秒、拡大率2.0、サイズ1.2倍） | ✅ 実装済み |
| 2 | 更新可能性のみ | オレンジ/金色 (#f59e0b) | 中（周期2秒、拡大率1.5、サイズ1.0倍） | ✅ 実装済み |
| 3 | ホットスポットのみ | 青 (#3b82f6) | 中（周期2秒、拡大率1.5、サイズ1.0倍） | ✅ 実装済み |
| 4 | どちらでもない | パルスなし | - | ✅ 実装済み |

### 2. 表示タイミング（実装済み）

- **ホバー時**: 一時表示（マウスを離すと消える） ✅
- **クリック時**: 固定表示（地図を移動/ズームしても表示を維持） ✅

### 3. クラスタのピンとの連動（実装済み）

- パルスの中心位置はクラスタのピンの位置を使用 ✅
- `clusterCenter`パラメータでクラスタのピンの位置を渡している ✅

## 問題点の整理

### 問題1: ズームレベル18でのサイズ計算が適切でない

**現状の実装**:
```typescript
// lib/mapbox/mapbox-utils.ts:786-797
const updateSize = () => {
  const zoom = map.getZoom()
  const radiusPixels = getRadiusInPixels(zoom, radiusMeters)
  
  // ズームレベル18以上（個別スポット表示時）では、クラスタ内のスポット範囲を正確に表示
  // ズームレベル14以下（クラスタ表示時）では、最小サイズを設定して視認性を確保
  const isSpotDetailZoom = zoom >= SPOT_DETAIL_ZOOM
  const minSize = isSpotDetailZoom ? 0 : 40 // ズームレベル18以上では最小サイズ制限なし
  
  // サイズ倍率を適用
  const baseSize = radiusPixels * 2 * config.sizeMultiplier
  const size = Math.max(minSize, baseSize)
  // ...
}
```

**問題点**:
1. `radiusMeters`は`calculateClusterRange`で計算された値（クラスタ内の全スポットの範囲）
2. ズームレベル18では、この`radiusMeters`をピクセルに変換しているが、固定サイズに見える
3. ユーザーの要望: ズームレベル18では、クラスタが内包している該当範囲のエリアをパルスのサークルサイズとして表示したい

**期待される動作**:
- ズームレベル14: クラスタ表示時 → パルスサイズは適切（現状OK）
- ズームレベル18: 個別スポット表示時 → クラスタ内のスポット範囲を正確にパルスで表示

### 問題2: サイズ計算のロジック

**現状のサイズ計算**:
1. `calculateClusterRange(clusterSpots)`でクラスタ内の全スポットの範囲を計算
   - 中心点から最も遠いスポットまでの距離
   - スポット間の最大距離
   - 50%の余裕を持たせる（`baseRadius * 1.5`）
   - 最小半径: 10メートル
2. `getRadiusInPixels(zoom, radiusMeters)`でメートルをピクセルに変換
3. `baseSize = radiusPixels * 2 * config.sizeMultiplier`でサイズを計算
4. 最小サイズ制限を適用（ズームレベル18以上では0、それ以下では40px）

**問題点**:
- ズームレベル18で固定サイズに見える原因が不明確
- `radiusMeters`の計算は正しいが、ピクセル変換後のサイズが適切でない可能性

### 問題3: クラスタのピン位置とパルスの中心位置

**現状の実装**:
- パルスの中心位置: `clusterCenter`（クラスタのピンの位置） ✅
- サイズ計算の基準: `calculateClusterRange`で計算された中心点（クラスタ内の全スポットの中心）

**問題点**:
- パルスの中心はクラスタのピンの位置だが、サイズ計算はクラスタ内の全スポットの中心点から計算している
- この不一致が、ズームレベル18での表示に影響している可能性

## 現状の動作

### ズームレベル14（クラスタ表示時）
- ✅ パルスアニメーションが適切に表示される
- ✅ クラスタのピンを中心にパルスが表示される
- ✅ サイズは適切（最小サイズ40pxが適用される）

### ズームレベル18（個別スポット表示時）
- ❌ パルスアニメーションが固定サイズで表示される
- ❌ クラスタ内のスポット範囲を正確に反映していない
- ❌ ユーザーの要望: クラスタが内包している該当範囲のエリアをパルスのサークルサイズとして表示したい

## 技術的な詳細

### サイズ計算の流れ

1. **クラスタ範囲の計算** (`calculateClusterRange`)
   ```typescript
   // クラスタ内の全スポットの中心点を計算
   const centerLat = clusterSpots.reduce((sum, s) => sum + s.lat, 0) / clusterSpots.length
   const centerLng = clusterSpots.reduce((sum, s) => sum + s.lng, 0) / clusterSpots.length
   
   // 中心点から最も遠いスポットまでの距離を計算
   const maxDistance = Math.max(...clusterSpots.map((s) => calculateDistanceInMeters(centerLat, centerLng, s.lat, s.lng)))
   
   // スポット間の最大距離も考慮
   const maxSpotDistance = Math.max(...spotDistances)
   
   // より大きい方を使用し、50%の余裕を持たせる
   const baseRadius = Math.max(maxDistance, maxSpotDistance / 2)
   const radiusMeters = Math.max(10, baseRadius * 1.5) // 最小10m、50%の余裕
   ```

2. **ピクセル変換** (`getRadiusInPixels`)
   ```typescript
   const metersPerDegree = 111000
   const pixelsPerDegree = 256 * Math.pow(2, zoom)
   return (radiusMeters / metersPerDegree) * pixelsPerDegree
   ```

3. **サイズ計算** (`updateSize`)
   ```typescript
   const radiusPixels = getRadiusInPixels(zoom, radiusMeters)
   const baseSize = radiusPixels * 2 * config.sizeMultiplier
   const size = Math.max(minSize, baseSize)
   ```

### 問題の原因の仮説

1. **ズームレベル18でのサイズが小さすぎる可能性**
   - `radiusMeters`は正しく計算されているが、ズームレベル18でのピクセル変換後のサイズが小さすぎる
   - 最小サイズ制限を0にしたが、実際のサイズが期待より小さい

2. **クラスタのピン位置とサイズ計算の基準点の不一致**
   - パルスの中心はクラスタのピンの位置
   - サイズ計算はクラスタ内の全スポットの中心点から計算
   - この不一致により、ズームレベル18で表示がずれる可能性

3. **サイズ倍率（`config.sizeMultiplier`）の影響**
   - 強: 1.2倍
   - 中: 1.0倍
   - この倍率が、ズームレベル18での表示に影響している可能性

## 修正方針の提案

### 方針1: サイズ計算の基準点をクラスタのピン位置に統一

**変更内容**:
- `calculateClusterRange`の代わりに、クラスタのピン位置（`clusterCenter`）を基準にサイズを計算
- クラスタのピン位置から最も遠いスポットまでの距離を計算
- この距離を`radiusMeters`として使用

**メリット**:
- パルスの中心位置とサイズ計算の基準点が一致
- ズームレベル18での表示が正確になる

**デメリット**:
- クラスタのピン位置がクラスタ内のスポットの中心と異なる場合、サイズが不正確になる可能性

### 方針2: ズームレベル18でのサイズ計算を別ロジックにする

**変更内容**:
- ズームレベル18以上では、クラスタのピン位置を基準にサイズを計算
- ズームレベル14以下では、現状のロジックを維持

**メリット**:
- ズームレベルごとに最適なサイズ計算が可能
- 既存の動作に影響を与えない

**デメリット**:
- ロジックが複雑になる

### 方針3: サイズ計算のロジックを見直す

**変更内容**:
- `radiusMeters`の計算方法を見直す
- ズームレベル18では、クラスタのピン位置から最も遠いスポットまでの距離を正確に計算
- 余裕（1.5倍）を調整する

**メリット**:
- シンプルな修正
- 既存のロジックを活用

**デメリット**:
- 根本的な問題が解決されない可能性

## 推奨される修正方針

**方針2を推奨**: ズームレベル18でのサイズ計算を別ロジックにする

**理由**:
1. ズームレベル14と18では表示の目的が異なる
   - ズームレベル14: クラスタの範囲を視覚的に示す
   - ズームレベル18: クラスタ内のスポット範囲を正確に表示
2. クラスタのピン位置を基準にサイズを計算することで、表示が正確になる
3. 既存の動作（ズームレベル14）に影響を与えない

## 実装の詳細（方針2）

### 修正内容

1. **`createClusterRangePulseMarker`関数の修正**
   - ズームレベル18以上では、クラスタのピン位置（`clusterCenter`）を基準にサイズを計算
   - クラスタのピン位置から最も遠いスポットまでの距離を計算
   - この距離を`radiusMeters`として使用

2. **`updateSize`関数の修正**
   - ズームレベル18以上では、クラスタのピン位置を基準にサイズを再計算
   - ズームレベル14以下では、現状のロジックを維持

### 実装コード（案）

```typescript
// ズームレベル18以上では、クラスタのピン位置を基準にサイズを計算
const calculateRadiusFromClusterCenter = (clusterCenter: { lat: number; lng: number }, clusterSpots: Array<{ lat: number; lng: number }>): number => {
  const { calculateDistanceInMeters } = require("@/lib/spot/spot-utils")
  
  // クラスタのピン位置から最も遠いスポットまでの距離を計算
  const maxDistance = Math.max(
    ...clusterSpots.map((s) => calculateDistanceInMeters(clusterCenter.lat, clusterCenter.lng, s.lat, s.lng))
  )
  
  // スポット間の最大距離も考慮
  const spotDistances: number[] = []
  for (let i = 0; i < clusterSpots.length; i++) {
    for (let j = i + 1; j < clusterSpots.length; j++) {
      const distance = calculateDistanceInMeters(
        clusterSpots[i].lat,
        clusterSpots[i].lng,
        clusterSpots[j].lat,
        clusterSpots[j].lng
      )
      spotDistances.push(distance)
    }
  }
  const maxSpotDistance = spotDistances.length > 0 ? Math.max(...spotDistances) : 0
  
  // より大きい方を使用し、50%の余裕を持たせる
  const baseRadius = Math.max(maxDistance, maxSpotDistance / 2)
  const radiusMeters = Math.max(10, baseRadius * 1.5) // 最小10m、50%の余裕
  
  return radiusMeters
}

// updateSize関数内で
const updateSize = () => {
  const zoom = map.getZoom()
  let radiusMetersToUse = radiusMeters
  
  // ズームレベル18以上では、クラスタのピン位置を基準にサイズを再計算
  if (zoom >= SPOT_DETAIL_ZOOM) {
    radiusMetersToUse = calculateRadiusFromClusterCenter(clusterCenter, clusterSpots)
  }
  
  const radiusPixels = getRadiusInPixels(zoom, radiusMetersToUse)
  const minSize = zoom >= SPOT_DETAIL_ZOOM ? 0 : 40
  const baseSize = radiusPixels * 2 * config.sizeMultiplier
  const size = Math.max(minSize, baseSize)
  // ...
}
```

## まとめ

### 現状の問題
1. ✅ 表示条件と優先順位: 実装済み
2. ✅ 表示タイミング: 実装済み
3. ✅ クラスタのピンとの連動: 実装済み
4. ❌ ズームレベル18でのサイズ計算: 不適切（固定サイズに見える）

### 修正が必要な点
- ズームレベル18では、クラスタのピン位置を基準にサイズを計算する
- クラスタのピン位置から最も遠いスポットまでの距離を正確に反映する

### 推奨される修正方針
- **方針2**: ズームレベル18でのサイズ計算を別ロジックにする
- クラスタのピン位置を基準にサイズを計算することで、表示が正確になる

