# パルスアニメーション実装検証

## 実装計画との比較

### ✅ 実装済みの要件

#### 1. ズームレベル14（クラスタ表示時）

**要件**:
- 更新可能性: クラスタピンに対してパルス表示
- ホットスポット: クラスタピンに対してパルス表示
- 色: 更新可能性あり + ホットスポット = 赤 (#ef4444)
- 色: 更新可能性なし + ホットスポット = 青 (#3b82f6)

**実装状況**: ✅ 実装済み
- `showClusterRangePulse`関数で、ズームレベル14以下で条件分岐
- `isUpdatable && isHotSpot` → 赤色のパルス（`isUpdatable: true, isHotSpot: true`）
- `isUpdatable && !isHotSpot` → オレンジ色のパルス（`isUpdatable: true, isHotSpot: false`）
- `!isUpdatable && isHotSpot` → 青色のパルス（`isUpdatable: false, isHotSpot: true`）

#### 2. ズームレベル18（個別スポット表示時）

**要件**:
- 更新可能性: 個別のスポットピンに対してパルス表示（更新可能性があるスポットのみ）
- ホットスポット: クラスタのピン位置を中心に、クラスタ全体の範囲をパルスで表示（常に青）

**実装状況**: ✅ 実装済み
- `showClusterRangePulse`関数で、ズームレベル18以上で分岐
- ホットスポットのパルス: `isUpdatable: false, isHotSpot: true` → 青色
- 更新可能性のパルス: `showUpdatableSpotPulses`関数で個別スポットに表示

#### 3. ズームレベル18でのサイズ計算

**要件**:
- クラスタのピン位置を基準にサイズを計算
- `calculateRadiusFromClusterCenter`関数を使用

**実装状況**: ✅ 実装済み
- `createClusterRangePulseMarker`関数内で`calculateRadiusFromClusterCenter`関数を定義
- `updateSize`関数で、ズームレベル18以上では`calculateRadiusFromClusterCenter`を使用
- ズームレベル18以上では`minSize = 0`（最小サイズ制限なし）

## ⚠️ 潜在的な問題点

### 問題1: マーカーの位置設定

**現状**:
```typescript
// lib/mapbox/mapbox-utils.ts:894-902
const centerLat = clusterSpots.reduce((sum, s) => sum + s.lat, 0) / clusterSpots.length
const centerLng = clusterSpots.reduce((sum, s) => sum + s.lng, 0) / clusterSpots.length

const marker = new mapboxgl.Marker({
  element: el,
  anchor: "center",
})
  .setLngLat([centerLng, centerLat])
  .addTo(map)
```

**問題**:
- マーカーの位置が`clusterSpots`の平均座標で計算されている
- しかし、`clusterCenter`パラメータが渡されているが使用されていない
- 実装計画では「クラスタのピン位置を中心に」とあるが、実際にはスポットの平均座標を使用している

**修正が必要**:
- `clusterCenter`パラメータを使用してマーカーの位置を設定する必要がある

### 問題2: ホバー時のパルス表示

**現状**:
- `showHoverClusterRangePulse`関数でホバー時のパルスを表示
- ズームレベル18以上では、ホバー時はクラスタ全体のパルスのみ表示（個別スポットのパルスは表示しない）

**実装計画との比較**:
- 実装計画にはホバー時の動作について明記されていない
- 現在の実装は妥当と思われるが、確認が必要

## 修正が必要な箇所

### 修正1: マーカーの位置を`clusterCenter`に変更

```typescript
// lib/mapbox/mapbox-utils.ts:894-902
// 修正前
const centerLat = clusterSpots.reduce((sum, s) => sum + s.lat, 0) / clusterSpots.length
const centerLng = clusterSpots.reduce((sum, s) => sum + s.lng, 0) / clusterSpots.length

const marker = new mapboxgl.Marker({
  element: el,
  anchor: "center",
})
  .setLngLat([centerLng, centerLat])
  .addTo(map)

// 修正後
const marker = new mapboxgl.Marker({
  element: el,
  anchor: "center",
})
  .setLngLat([clusterCenter.lng, clusterCenter.lat])
  .addTo(map)
```

## まとめ

### 実装状況
- ✅ ズームレベル14でのパルス表示: 実装済み
- ✅ ズームレベル18でのパルス表示: 実装済み
- ✅ ズームレベル18でのサイズ計算: 実装済み
- ✅ マーカーの位置設定: 修正完了（`clusterCenter`を使用）

### 修正完了
1. ✅ `createClusterRangePulseMarker`関数で、マーカーの位置を`clusterCenter`に変更（修正完了）

## 最終確認

実装計画のすべての要件が実装されています：

1. ✅ **ズームレベル14（クラスタ表示時）**
   - 更新可能性: クラスタピンに対してパルス表示
   - ホットスポット: クラスタピンに対してパルス表示
   - 色の分岐: 更新可能性あり + ホットスポット = 赤、更新可能性なし + ホットスポット = 青

2. ✅ **ズームレベル18（個別スポット表示時）**
   - 更新可能性: 個別のスポットピンに対してパルス表示（更新可能性があるスポットのみ）
   - ホットスポット: クラスタのピン位置を中心に、クラスタ全体の範囲をパルスで表示（常に青）

3. ✅ **ズームレベル18でのサイズ計算**
   - クラスタのピン位置を基準にサイズを計算
   - `calculateRadiusFromClusterCenter`関数を使用

4. ✅ **マーカーの位置**
   - クラスタのピン位置（`clusterCenter`）を使用

