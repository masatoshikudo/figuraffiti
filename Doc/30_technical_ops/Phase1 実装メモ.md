# AhhHum Phase1 実装メモ

本ドキュメントは、`AhhHum Webアプリ全体設計マスタードキュメント.md` を親設計としたうえで、Phase1 の**実装済み / 未実装 / 今後対応**を記録する運用メモです。  
親設計と本メモに差分がある場合は、**親設計を優先**します。

---

## 1. 実装済み機能

1. **曖昧なサークル表示**  
   マップ上に半径50mのサークルのみ表示し、正確なピンは出さない
2. **鮮度別サークル色**  
   24h以内=赤、7日以内=黄、7日超=グレー
3. **グローバル・ティッカー**  
   `User_X just found #N in [地名].` 形式の表示
4. **サークル詳細**  
   Last Seen、文脈、発見CTAを表示
5. **発見記録**  
   現行実装では `/discover` ページでスポット番号入力または URL パラメータで記録
6. **認証ゲート**  
   未ログイン時はCTA押下でログインダイアログ表示

---

## 2. 親設計との対応

| 親設計の画面 / モジュール | 現行実装 | 状態 |
|------|------|------|
| `SCR-002` マップメイン | `app/mapping/page.tsx` | 実装済み |
| `SCR-003` サークル詳細 | `components/spot/ahhhum-spot-detail.tsx` | 実装済み |
| `SCR-004` NFC/QR読み取り | `app/discover/page.tsx` | 部分実装 |
| Identity Module | 認証ダイアログ、プロフィール最小構成 | 実装済み |
| Signal Module | `discovery-ticker` | 実装済み |
| Admin Core Module | `app/admin`, `app/api/spots/*` | 部分実装 |
| `SCR-005` キャラクターページ | 専用画面なし | 未実装 |
| `SCR-007` Legends | 未実装 | Phase2予定 |
| `SCR-107` 設置申請 | 未実装 | Phase3予定 |

### 現在の差分

- 親設計上の探索ルートは ` /discover/mapping ` だが、現行コードは ` /mapping ` を使用
- 親設計上の読み取り画面は ` /discover/nfc ` だが、現行コードは ` /discover ` を使用
- 親設計上のキャラクターページは存在するが、現行では未実装

この差分は「廃止」ではなく、**実装段階でまだ揃っていない差分** として扱う。

---

## 3. 事前作業: DBスキーマの適用

**必ず以下を実行してください。**

### 方法A: Supabase SQL Editor（Cloud）

1. Supabase ダッシュボード → **SQL Editor**
2. `supabase/run-full-schema.sql` の内容を実行

### 方法B: ローカル（Supabase CLI）

```bash
npx supabase start
npx supabase db reset
```

---

## 4. 動作確認の手順

1. スキーマ適用後、`npm run dev` で起動
2. 現行ルート `/mapping` にアクセスし、曖昧サークルとティッカーが表示されることを確認
3. サークルをタップし、Last Seen と「NFC/QRで発見を記録する」が表示されることを確認
4. 未ログインでCTA押下し、認証ダイアログが開くことを確認
5. ログイン後、CTA押下で現行ルート `/discover` に遷移することを確認
6. `/discover` でスポット番号を入力して「記録する」→ 成功後マップに戻り、ティッカーに表示されることを確認

### 将来の親設計ルート

親設計に合わせる最終ルートは以下。

- `SCR-002`: `/discover/mapping`
- `SCR-004`: `/discover/nfc`

現行コードはそこへの移行前段階とみなす。

---

## 5. 主なファイル

| 種類 | パス |
|------|------|
| マップ | `app/mapping/page.tsx`, `components/map/ahhhum-map-view.tsx` |
| 発見記録 | `app/discover/page.tsx`, `app/api/discoveries/route.ts` |
| ティッカー | `components/discovery/discovery-ticker.tsx` |
| サークル詳細 | `components/spot/ahhhum-spot-detail.tsx` |
| 認証 | `components/auth/auth-dialog.tsx` |
| 管理 | `app/admin/page.tsx`, `app/api/spots/*` |
| スキーマ | `supabase/run-full-schema.sql` |

---

## 6. Phase1で未実装 / 今後対応

- **キャラクターページ（`/characters/[slug]`）** … 親設計では必要。現行コードでは未実装
- **Legends** … Phase2で追加予定
- **コレクション / 共鳴** … Phase2で追加予定
- **設置申請 / 共創審査** … Phase3で追加予定
- **Shop / 物理キー導線** … Phase2で追加予定

### 廃止ではなく縮小したもの

- **スポット申請フォーム** … Phase1では停止中。Phase3で `設置申請` として再設計予定
- **trusted_users** … Phase1では使用しない。将来のアンバサダー / 権限設計へ再統合の余地あり
- **spot_media の多層管理** … Phase1では簡略化。Phase2以降で再整理可能

---

## 7. 関連ドキュメント

- [AhhHum Phase1 UX設計書（MVP）](../20_product_design/AhhHum%20Phase1%20UX設計書（MVP）.md)
- [AhhHum Webアプリ全体設計マスタードキュメント](../20_product_design/AhhHum%20Webアプリ全体設計マスタードキュメント.md)
- [AhhHum 必要テーブル一覧](./AhhHum%20必要テーブル一覧.md)
- [Mapboxトークン設定](./Mapboxトークン設定.md)
