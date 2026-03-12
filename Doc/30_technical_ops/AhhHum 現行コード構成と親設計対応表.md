# AhhHum 現行コード構成と親設計対応表

本ドキュメントは、`AhhHum Webアプリ全体設計マスタードキュメント.md` を親設計とし、現在のリポジトリ内コードが**どのモジュールに対応しているか**を整理したものである。  
旧Skateright由来の「転用候補」一覧ではなく、**今のコードを親設計へどう接続するか**を把握するための技術メモとして扱う。

---

## 1. 使い方

- 親設計の画面ID・モジュール名を起点に、今ある実装との対応を確認する
- `実装済み / 部分実装 / 未実装 / 要整理` の4段階で見る
- 旧構想の説明ではなく、今後の設計・実装判断の基準として使う

---

## 2. 親設計モジュールとの対応

| 親設計モジュール | 主なファイル | 状態 | コメント |
|------------------------|----------------------|------|------|
| **Identity Module** | `components/auth/auth-dialog.tsx`, `app/profile/*`, `app/api/profile/*` | 部分実装 | 認証はあるが親設計上のプロフィール導線へ再整理が必要 |
| **Discovery Map Module** | `app/mapping/page.tsx`, `components/map/ahhhum-map-view.tsx`, `lib/mapbox/mapbox-utils.ts` | 実装済み | 現行ルートは `/mapping`。親設計では `/discover/mapping` に揃える余地あり |
| **Signal Module** | `components/discovery/discovery-ticker.tsx`, `app/api/discoveries/route.ts` | 実装済み | ティッカーと発見ログ更新の中核 |
| **Spot Detail Module** | `components/spot/ahhhum-spot-detail.tsx` | 実装済み | ヒント・文脈・CTA を扱う |
| **Proof Module** | `app/discover/page.tsx`, `app/api/discoveries/route.ts` | 部分実装 | ルートと成功演出を親設計へ寄せる必要あり |
| **Admin Core Module** | `app/admin/*`, `app/api/spots/*`, `lib/api/admin-utils.ts` | 部分実装 | スポット管理中心。発見管理 / コンテンツ管理は拡張余地あり |
| **Collection Module** | なし | 未実装 | Phase2 対応 |
| **Legend Module** | なし | 未実装 | Phase2 対応 |
| **Shop Module** | なし | 未実装 | Phase2 対応 |
| **Co-Creation Module** | `app/submit/page.tsx`, `app/api/spots/route.ts` など一部資産 | 要整理 | 旧投稿導線を Phase3 の設置申請へ転換する前提 |

---

## 3. そのまま使える主力資産

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/mapping/page.tsx` | 現行マップ画面 | 親設計の `SCR-002` に相当 |
| `components/map/ahhhum-map-view.tsx` | 曖昧サークル表示 | Discovery Map の中心 |
| `components/discovery/discovery-ticker.tsx` | ティッカー | Signal Module の中心 |
| `components/spot/ahhhum-spot-detail.tsx` | サークル詳細 | Spot Detail の中心 |
| `app/discover/page.tsx` | 現行読み取り / 記録画面 | 親設計の `SCR-004` へ寄せる前提 |
| `app/api/discoveries/route.ts` | 発見記録API | Proof Module の中核 |
| `app/admin/page.tsx` | 管理画面入口 | Admin Core の入口 |
| `app/api/spots/*` | スポット管理系API | スポット供給管理に利用 |
| `lib/mapbox/mapbox-utils.ts` | Mapbox関連共通処理 | サークル描画・地図制御に利用 |
| `components/auth/auth-dialog.tsx` | 認証ダイアログ | Identity Module の入口 |

---

## 4. 再設計して使う資産

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/submit/page.tsx` | 旧投稿フォーム | Phase3 の `設置申請` に転換する前提で再設計する |
| `types/spot.ts` | Spot 型 | 親設計の `Character / Spot / Discovery` 分離に合わせて整理する |
| `types/database.ts` | DB型 | `Tag`, `Collection`, `Legend`, `PlacementApplication` を見据えて更新する |
| `app/page.tsx` | トップ導線 | ランディング or 親設計ルートへ再整理する |
| `app/terms/page.tsx` | 利用規約ページ | 文言更新のみで利用可能 |

---

## 5. 旧前提が強く、整理が必要な領域

| 領域 | 状態 | コメント |
|------|------|------|
| 旧Skateright起源の難易度 / 更新可能性 | 要削減 | AhhHum の探索体験とは直接関係しない |
| `trusted_users` 系 | 現在不使用 | 将来のアンバサダー制度へ再設計余地あり |
| 旧 `map-view.tsx` ベースの記述 | 無効 | 現行は `ahhhum-map-view.tsx` を正とする |
| Discord前提の説明 | 無効 | 現在の親設計には不要 |

---

## 6. 親設計から見た次の実装論点

1. `SCR-005` キャラクターページの新設または再導入
2. `SCR-004` を `/discover/nfc` に合わせたルート再編
3. `Collection / Legend / Shop` のためのデータモデル拡張
4. `submit` を Phase3 の `設置申請` として再定義
5. 管理画面を `spots / discoveries / content / co-create` に分離

---

## 7. 優先アクション

1. 親設計のルートと現行ルートの差分表を維持する
2. `submit` を「投稿」ではなく「将来の設置申請資産」として扱い直す
3. キャラクター / Spot / Discovery の役割分離をコードと文書で揃える
4. Phase2 用の `Collection / Legend / Shop` を新規実装前提で切り分ける
5. 旧Skateright文脈の説明を追加せず、現行モジュール名で管理する

---

## 8. メモ

- 旧Skateright起源の説明は今後増やさない
- 親設計のモジュール名で技術会話を統一する
- 「転用候補」ではなく「今ある実装資産」として管理する
- Phase2 / Phase3 の未実装領域は、先に文書上でモジュール分離してから実装する
