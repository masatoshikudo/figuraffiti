# パルス表示の問題分析

## 現在の実装の問題点

### 問題1: ズームレベル14での重複表示

**現状**:
- `showClusterRangePulse`関数で、ホットスポットと更新可能性の両方がある場合、2つのパルスを別々に作成している
- ホットスポットのパルスを先に作成（`isUpdatable: false, isHotSpot: true` → 青）
- その後、更新可能性のパルスを作成（`isUpdatable: true, isHotSpot: false` → オレンジ）

**期待される動作**:
- 更新可能性 + ホットスポットの場合、赤色のパルスが1つだけ表示されるべき
- `isUpdatable: true, isHotSpot: true` → 赤色（#ef4444）

### 問題2: ズームレベル18での表示ロジック

**現状**:
- ホットスポットのパルスを先に作成（`isUpdatable: false, isHotSpot: true` → 青）
- その後、更新可能性のパルスを個別スポットに表示

**期待される動作**:
- ホットスポットのパルスは常に青で表示される（正しい）
- 更新可能性のパルスは個別スポットに表示される（正しい）
- しかし、ホットスポットのパルスが正しく表示されていない可能性がある

## 修正方針

### 方針1: 条件分岐の改善

1. **ズームレベル14以下**:
   - `isUpdatable && isHotSpot` → 赤色のパルスを1つだけ作成（`isUpdatable: true, isHotSpot: true`）
   - `isUpdatable && !isHotSpot` → オレンジ色のパルスを1つだけ作成（`isUpdatable: true, isHotSpot: false`）
   - `!isUpdatable && isHotSpot` → 青色のパルスを1つだけ作成（`isUpdatable: false, isHotSpot: true`）

2. **ズームレベル18以上**:
   - ホットスポットがある場合 → 青色のパルスを1つ作成（`isUpdatable: false, isHotSpot: true`）
   - 更新可能性がある場合 → 個別スポットにパルスを表示

### 修正コード

```typescript
// ズームレベルを確認
const currentZoom = mapInstance.getZoom()
const isSpotDetailZoom = currentZoom >= MAPBOX_CONFIG.SPOT_DETAIL_ZOOM

if (isSpotDetailZoom) {
  // ズームレベル18以上
  // ホットスポットのパルスを表示（常に青）
  if (isHotSpot) {
    const marker = createClusterRangePulseMarker(
      clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
      mapInstance,
      false, // isUpdatable: false（更新可能性は個別スポットに表示）
      true,  // isHotSpot: true
      clusterCenter
    )
    clusterRangePulseMarkersRef.current.push(marker)
  }
  
  // 更新可能性のパルスを個別スポットに表示
  if (isUpdatable && updatableSpots.length > 0) {
    showUpdatableSpotPulses(mapInstance, updatableSpots)
  }
} else {
  // ズームレベル14以下
  // 条件に応じて1つのパルスを作成
  if (isUpdatable && isHotSpot) {
    // 更新可能性 + ホットスポット: 赤色
    const marker = createClusterRangePulseMarker(
      clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
      mapInstance,
      true,  // isUpdatable: true
      true,  // isHotSpot: true
      clusterCenter
    )
    clusterRangePulseMarkersRef.current.push(marker)
  } else if (isUpdatable && !isHotSpot) {
    // 更新可能性のみ: オレンジ
    const marker = createClusterRangePulseMarker(
      clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
      mapInstance,
      true,  // isUpdatable: true
      false, // isHotSpot: false
      clusterCenter
    )
    clusterRangePulseMarkersRef.current.push(marker)
  } else if (!isUpdatable && isHotSpot) {
    // ホットスポットのみ: 青
    const marker = createClusterRangePulseMarker(
      clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
      mapInstance,
      false, // isUpdatable: false
      true,  // isHotSpot: true
      clusterCenter
    )
    clusterRangePulseMarkersRef.current.push(marker)
  }
}
```

