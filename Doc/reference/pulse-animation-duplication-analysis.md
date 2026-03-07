# パルスアニメーション重複箇所の分析

## 重複箇所のリスト

### 1. `showClusterRangePulse`の呼び出しが複数箇所で重複

#### 問題箇所1: 地図移動/ズーム時の再描画が重複
**場所**: `components/map/map-view.tsx:247-265`
- `moveend`イベントで`showClusterRangePulse`を呼び出し
- `zoomend`イベントで`showClusterRangePulse`を呼び出し
- **問題**: ズーム完了時に`moveend`と`zoomend`の両方が発火し、同じパルスが2回作成される可能性がある

#### 問題箇所2: クラスタクリック時の処理が重複
**場所**: `components/map/map-view.tsx:978` と `components/map/map-view.tsx:1076`
- クラスタクリック時に`showClusterRangePulse`を呼び出し（978行目）
- ズーム完了後の`moveend`イベント内で再度`showClusterRangePulse`を呼び出し（1076行目）
- **問題**: クラスタクリック時にパルスが2回作成される可能性がある

#### 問題箇所3: ホバー時の処理
**場所**: `components/map/map-view.tsx:1167`
- `mouseenter`イベントで`showClusterRangePulse`を呼び出し
- **問題**: ホバー時にパルスが作成されるが、クリック時にも作成されるため、重複する可能性がある

### 2. `clearClusterRangePulse`の呼び出しが複数箇所で重複

#### 問題箇所4: `showClusterRangePulse`内での削除処理
**場所**: `components/map/map-view.tsx:480`
- `showClusterRangePulse`内で`clearClusterRangePulse`を呼び出し
- **問題**: その後、新しいパルスを作成するが、削除と作成のタイミングが不安定

#### 問題箇所5: ホバー解除時の削除処理
**場所**: `components/map/map-view.tsx:1184`
- `mouseleave`イベントで`clearClusterRangePulse`を呼び出し
- **問題**: 選択されたクラスタがある場合は削除しないが、ホバー時のパルスが残る可能性がある

### 3. `showUpdatableSpotPulses`の呼び出しが重複

#### 問題箇所6: ズームレベル18での更新可能性パルス表示
**場所**: `components/map/map-view.tsx:555`
- `showClusterRangePulse`内で`showUpdatableSpotPulses`を呼び出し
- **問題**: `showClusterRangePulse`が複数回呼ばれると、`showUpdatableSpotPulses`も複数回呼ばれる
- **問題**: `showUpdatableSpotPulses`内で既存のパルスを削除しているが、`clearClusterRangePulse`でも削除しているため、二重削除の可能性がある

### 4. イベントリスナーの重複登録

#### 問題箇所7: `moveend`と`zoomend`のイベントリスナー
**場所**: `components/map/map-view.tsx:247` と `components/map/map-view.tsx:254`
- 地図初期化時に`moveend`と`zoomend`のイベントリスナーを登録
- **問題**: これらのイベントリスナーが複数回登録される可能性がある（`initMap`が複数回呼ばれる場合）

#### 問題箇所8: クラスタクリック時の`moveend`イベント
**場所**: `components/map/map-view.tsx:1074`
- クラスタクリック時のズーム完了後に`moveend`イベントで`showClusterRangePulse`を呼び出し
- **問題**: グローバルな`moveend`イベントリスナー（247行目）と重複する可能性がある

### 5. マーカー管理の重複

#### 問題箇所9: `clusterRangePulseMarkersRef`と`updatableSpotPulseMarkersRef`の管理
**場所**: 複数箇所
- `clusterRangePulseMarkersRef`: クラスタ範囲表示用のパルス
- `updatableSpotPulseMarkersRef`: 個別スポットピン用の更新可能性パルス
- **問題**: 両方が`clearClusterRangePulse`内で削除されるが、作成タイミングが異なるため、削除タイミングが不安定

## 問題の影響

1. **パルスアニメーションの重複表示**: 同じパルスが複数回作成され、画面に複数のパルスが表示される
2. **パフォーマンスの低下**: 不要なマーカーの作成と削除が繰り返される
3. **アニメーションの不安定性**: ホバー時にパルスが表示/非表示を繰り返す
4. **メモリリーク**: 削除されないマーカーが蓄積される可能性

## 修正方針

### 方針1: イベントリスナーの統合
- `moveend`と`zoomend`のイベントリスナーを統合
- クラスタクリック時の`moveend`イベントを削除（グローバルなイベントリスナーで処理）

### 方針2: パルス作成の重複防止
- `showClusterRangePulse`内で、既存のパルスを確認してから作成
- 同じクラスタのパルスが既に存在する場合は、再作成しない

### 方針3: ホバー時の処理の改善
- ホバー時のパルスとクリック時のパルスを明確に分離
- ホバー時のパルスは一時的なものとして管理

### 方針4: マーカー管理の改善
- マーカーの作成と削除を一箇所で管理
- マーカーのIDを管理して、重複作成を防止

## 推奨される修正内容

1. **`showClusterRangePulse`の改善**
   - 既存のパルスを確認してから作成
   - 同じクラスタのパルスが既に存在する場合は、更新のみ行う

2. **イベントリスナーの統合**
   - `moveend`と`zoomend`のイベントリスナーを統合
   - クラスタクリック時の`moveend`イベントを削除

3. **ホバー時の処理の分離**
   - ホバー時のパルス用のrefを追加
   - ホバー時のパルスとクリック時のパルスを明確に分離

4. **マーカー管理の改善**
   - マーカーのIDを管理して、重複作成を防止
   - マーカーの作成と削除を一箇所で管理

