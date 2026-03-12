# パルスアニメーション実装計画

## 実装方針

### 方針2: ズームレベル18でのサイズ計算を別ロジックにする

## 要件の整理

### 1. 更新可能性のパルス表示

#### ズームレベル14（クラスタ表示時）
- **表示位置**: クラスタピンに対してパルス表示
- **サイズ**: クラスタ内の更新可能なスポットの範囲に基づいて計算
- **動作**: 既存の実装を維持

#### ズームレベル18（個別スポット表示時）
- **表示位置**: 個別のスポットピンに対してパルス表示
- **対象**: 更新可能性があるスポットのみ
- **例**: 
  - ズームレベル14で更新可能性クラスタ内にピン8個
  - ズームレベル18に遷移
  - 8個のうち3つが更新可能性あり
  - → この3つのスポットピンに更新可能性パルスを表示

### 2. ホットスポットのパルス表示

#### ズームレベル14（クラスタ表示時）
- **表示位置**: クラスタピンに対してパルス表示
- **サイズ**: クラスタが内包している範囲全体（クラスタのピン位置を中心に）
- **色**:
  - 更新可能性あり + ホットスポット: 赤 (#ef4444)
  - 更新可能性なし + ホットスポット: 青 (#3b82f6)
- **動作**: 既存の実装を維持

#### ズームレベル18（個別スポット表示時）
- **表示位置**: クラスタのピン位置を中心に
- **サイズ**: クラスタが内包している範囲全体（8個のスポットを内包したクラスタサイズのサークル）
- **色**: 青 (#3b82f6) - 更新可能性の有無に関係なく、ホットスポットの場合は常に青
  - **理由**: 更新可能性パルスは個別のスポットピンに表示されるため、ホットスポットのパルスは青のみで問題ない
- **動作**: クラスタ全体の範囲をパルスで表示（個別スポットではなく、クラスタ全体）

## 実装の詳細

### 1. ズームレベル18でのサイズ計算の修正

#### 現状の問題
- クラスタのピン位置とサイズ計算の基準点が不一致
- ズームレベル18で固定サイズに見える

#### 修正内容
- ズームレベル18以上では、クラスタのピン位置（`clusterCenter`）を基準にサイズを計算
- クラスタのピン位置から最も遠いスポットまでの距離を計算
- この距離を`radiusMeters`として使用

### 2. 更新可能性のパルス表示（ズームレベル18）

#### 実装内容
- ズームレベル18以上では、個別のスポットピンに対して更新可能性パルスを表示
- 更新可能性があるスポットのみにパルスを表示
- 既存の`createUpdatableClusterMarker`関数を活用するか、新しい関数を作成

#### 表示条件
- スポットが更新可能性がある場合のみ
- ズームレベル18以上で個別スポットが表示されている場合

### 3. ホットスポットのパルス表示（ズームレベル18）

#### 実装内容
- ズームレベル18以上でも、クラスタ全体の範囲をパルスで表示
- クラスタのピン位置を中心に、クラスタが内包している範囲全体をパルスで表示
- 色は更新可能性の有無に応じて変更（赤 or 青）

#### 表示条件
- クラスタがホットスポットである場合
- ズームレベル18以上でも、クラスタ全体の範囲を表示

## 実装の流れ

### ステップ1: ズームレベル18でのサイズ計算の修正

1. `createClusterRangePulseMarker`関数を修正
   - ズームレベル18以上では、クラスタのピン位置を基準にサイズを計算
   - `calculateRadiusFromClusterCenter`関数を追加

2. `updateSize`関数を修正
   - ズームレベル18以上では、クラスタのピン位置を基準にサイズを再計算
   - ズームレベル14以下では、現状のロジックを維持

### ステップ2: 更新可能性のパルス表示（ズームレベル18）

1. 個別スポット表示時の更新可能性パルス表示機能を追加
   - ズームレベル18以上で、更新可能性があるスポットを検出
   - 各スポットピンに対してパルスを表示

2. 既存の`createUpdatableClusterMarker`関数を活用
   - または、新しい関数`createUpdatableSpotPulseMarker`を作成

### ステップ3: ホットスポットのパルス表示（ズームレベル18）

1. ズームレベル18でもクラスタ全体の範囲をパルスで表示
   - クラスタのピン位置を中心に、クラスタが内包している範囲全体をパルスで表示
   - 色は更新可能性の有無に応じて変更

2. 既存の`createClusterRangePulseMarker`関数を活用
   - ズームレベル18でも、クラスタ全体の範囲を表示するように修正

## 技術的な詳細

### サイズ計算のロジック（ズームレベル18）

```typescript
// クラスタのピン位置を基準にサイズを計算
const calculateRadiusFromClusterCenter = (
  clusterCenter: { lat: number; lng: number },
  clusterSpots: Array<{ lat: number; lng: number }>
): number => {
  const { calculateDistanceInMeters } = require("@/lib/spot/spot-utils")
  
  // クラスタのピン位置から最も遠いスポットまでの距離を計算
  const maxDistance = Math.max(
    ...clusterSpots.map((s) => 
      calculateDistanceInMeters(clusterCenter.lat, clusterCenter.lng, s.lat, s.lng)
    )
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
```

### 更新可能性のパルス表示（ズームレベル18）

```typescript
// 個別スポット表示時に、更新可能性があるスポットにパルスを表示
const showUpdatableSpotPulses = (
  mapInstance: mapboxgl.Map,
  spots: Spot[],
  updatableSpots: Spot[]
) => {
  // ズームレベル18以上の場合のみ
  if (mapInstance.getZoom() < SPOT_DETAIL_ZOOM) return
  
  // 更新可能性があるスポットに対してパルスを表示
  updatableSpots.forEach((spot) => {
    const marker = createUpdatableSpotPulseMarker(spot, mapInstance)
    // マーカーを管理
  })
}
```

### ホットスポットのパルス表示（ズームレベル18）

```typescript
// ズームレベル18でも、クラスタ全体の範囲をパルスで表示
const showHotSpotClusterPulse = (
  mapInstance: mapboxgl.Map,
  clusterSpots: Spot[],
  clusterCenter: { lat: number; lng: number },
  isHotSpot: boolean
) => {
  // ホットスポットの場合のみ
  if (!isHotSpot) return
  
  // ズームレベル18では、更新可能性の有無に関係なく常に青で表示
  // 更新可能性パルスは個別のスポットピンに表示されるため
  const marker = createClusterRangePulseMarker(
    clusterSpots,
    mapInstance,
    false, // isUpdatable: 常にfalse（更新可能性は個別スポットに表示）
    true,   // isHotSpot: true
    clusterCenter
  )
  // ズームレベル18でも、クラスタのピン位置を中心に、クラスタが内包している範囲全体を表示
}
```

## まとめ

### 実装の優先順位

1. **ステップ1**: ズームレベル18でのサイズ計算の修正（方針2）
2. **ステップ2**: 更新可能性のパルス表示（ズームレベル18）
3. **ステップ3**: ホットスポットのパルス表示（ズームレベル18）

### 期待される動作

#### ズームレベル14
- 更新可能性クラスタ: クラスタピンに対してパルス表示
- ホットスポットクラスタ: クラスタピンに対してパルス表示（色は更新可能性の有無に応じて）

#### ズームレベル18
- 更新可能性: 個別のスポットピンに対してパルス表示（更新可能性があるスポットのみ）
- ホットスポット: クラスタ全体の範囲をパルスで表示（クラスタのピン位置を中心に、クラスタが内包している範囲全体）

