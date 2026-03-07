# Figuraffiti事業：転用可能コード一覧

本ドキュメントは、「グラフィティアートのニッチ市場戦略：反逆からビジネスへ」および「Figuraffiti戦略：都市空間を舞台にしたIPビジネスのフレームワーク」を前提に、現在のリポジトリ（Skateright 系コードベース）から **figuraffiti 事業で転用できるもの** を抽出・整理したものです。

---

## 1. 戦略との対応関係（要約）

| 戦略ドキュメントの要素 | 転用できる既存コード |
|------------------------|----------------------|
| **TikTok/Instagram を主戦場** | Instagram oEmbed API、メディアURL（Instagram/YouTube等）対応済み |
| **「オンラインマップ」で発見位置を共有**（Figuraffiti戦略） | 地図表示・スポット登録・承認フロー一式 |
| **入口商品（ステッカー等）・バリューラダー** | 収益計画・CF分析用 Python スクリプト |
| **コミュニティ・ファン参加** | 認証・プロフィール・投稿者管理・管理者/信頼ユーザー |

---

## 2. 転用度：高（そのまま流用 or 軽い差し替えで使える）

### 2.1 地図・スポット基盤（Figuraffiti「オンラインマップ」に直結）

戦略ドキュメントの「**② オンラインマップ：発見されたFiguraffitiの位置を共有するマップ**」にそのまま対応できます。

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `components/map/map-view.tsx` | Mapbox 地図、クラスター、ピン、ホバー、ズーム | 表示対象を「技の記録」→「Figuraffiti/グラフィティスポット」に読み替え。データ構造の差は `Spot` 型の拡張で吸収可能 |
| `app/mapping/page.tsx` | 地図アーカイブ表示ページ | ルートを `/mapping` のまま or `/map` に変更。文言・メタデータを figuraffiti 用に差し替え |
| `app/submit/page.tsx` | 位置ピック + メディアURL + 投稿 | 「技名」→「作品名/アーティスト名」等に変更。フォーム項目のラベル・バリデーションのみ調整 |
| `lib/mapbox/mapbox-utils.ts` | 地図初期化、マーカー生成、パルス等 | そのまま利用可能 |
| `lib/mapbox/cluster-range-utils.ts` | クラスタ範囲計算 | そのまま利用可能 |
| `lib/spot/spot-utils.ts` | スポット関連ユーティリティ | ドメインに依存する部分（例: 更新可能性・難易度）だけ fig 用にオプション化 or 簡略化 |
| `hooks/use-spots.ts` | スポット一覧取得 | そのまま利用可能 |

### 2.2 認証・ユーザー・管理者

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `contexts/auth-context.tsx` | 認証状態の共有 | そのまま利用 |
| `app/auth/callback/route.ts` | Supabase Auth コールバック | そのまま利用 |
| `app/profile/page.tsx` | プロフィール・自分の投稿一覧 | 「記録」→「投稿したスポット」に文言変更で転用 |
| `app/admin/page.tsx` | 承認待ち一覧・承認/却下 | そのまま流用可能（スポット＝Figuraffiti位置 or 作品として扱う） |
| `app/api/admin/trusted-users/` | 信頼ユーザー CRUD | そのまま利用可能 |
| `app/api/profile/user-profile/route.ts` | ユーザープロフィール API | そのまま利用可能 |
| `app/api/profile/check-admin/route.ts` | 管理者チェック | そのまま利用可能 |

### 2.3 スポット API・データ永続化

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/api/spots/route.ts` | スポット GET/POST | そのまま利用。Body の意味だけ「グラフィティスポット/Figuraffiti」に読み替え |
| `app/api/spots/approve/route.ts` | 承認 | そのまま利用 |
| `app/api/spots/reject/route.ts` | 却下 | そのまま利用 |
| `app/api/spots/pending/route.ts` | 承認待ち一覧 | そのまま利用 |
| `app/api/spots/my-submissions/route.ts` | 自分の投稿一覧 | そのまま利用 |
| `supabase/schema.sql` | spots, spot_media, admin_users, trusted_users, RLS | カラムの「意味」を fig 用に解釈。必要なら `trick` → `artist_name` 等のマイグレーションでリネーム |
| `lib/spot/spot-converter.ts`（存在する場合） | DB ↔ Spot 型変換 | フィールドマッピングだけ fig 用に調整 |

### 2.4 SNS 埋め込み（TikTok/Instagram 戦略に直結）

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/api/instagram/oembed/route.ts` | Instagram oEmbed 取得 | **そのまま転用推奨**。グラフィティ制作過程・完成作の Reel/投稿を埋め込むのに使える。User-Agent 等の文言だけ「Figuraffiti」に変更可 |

### 2.5 場所検索（投稿時の住所・スポット名）

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/api/places/autocomplete/route.ts` | 住所・場所サジェスト | そのまま利用可能（日本語対応済み） |
| `app/api/places/details/route.ts` | 場所詳細（緯度経度等） | そのまま利用可能 |

### 2.6 UI 基盤・レイアウト

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/layout.tsx` | ルートレイアウト、AuthProvider、Toaster、Analytics | タイトル・description・OGP を figuraffiti 用に差し替え |
| `app/globals.css` | グローバルスタイル | そのまま利用可能 |
| `app/loading.tsx`, `app/not-found.tsx` | ローディング・404 | そのまま利用可能 |
| `components/ui/*` | shadcn/ui コンポーネント群 | そのまま利用可能 |
| `components/layout/site-header.tsx` | ヘッダー・ナビ | リンク・ラベルを fig 用に変更 |
| `components/map/location-picker.tsx` | 地図上の位置選択 | そのまま利用可能 |

### 2.7 定数・設定

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `lib/constants.ts` | Mapbox、API エンドポイント、メッセージ、ステータス等 | 文言・SOURCE_COLORS 等を「グラフィティ/Figuraffiti」用に一部差し替え |
| `middleware.ts` | ミドルウェア | そのまま利用可能 |

---

## 3. 転用度：中（ドメインの読み替え or スキーマの小幅拡張で対応）

### 3.1 型定義

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `types/spot.ts` | Spot, FilterOptions | **trick** → 作品名/アーティスト名、**skater** → アーティスト名 等に意味づけ。media.source に TikTok を追加する拡張を検討 |
| `types/user.ts` | UserProfile, スキルレベル | コミュニティ用途ならそのまま。グッズ販売だけならスキルレベルは未使用でも可 |
| `types/database.ts` | DB 関連型 | スキーマに合わせて維持 or 軽く修正 |

### 3.2 ページ・ルート

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `app/page.tsx` | トップ → `/mapping` リダイレクト | リダイレクト先をそのまま or ランディング用に差し替え |
| `app/how-it-works/page.tsx` | 遊び方・説明 | 文言を「Figuraffitiの探し方・投稿の仕方」に変更 |
| `app/guidelines/page.tsx` | 投稿ガイドライン | グラフィティ/Figuraffiti 用のガイドラインに差し替え |
| `app/terms/page.tsx` | 利用規約 | サービス名・事業者情報を fig 用に更新 |

---

## 4. 転用度：低 or ドメイン特化（必要に応じて削除・置き換え）

| パス | 内容 | 備考 |
|------|------|------|
| `app/api/discord/interactions/route.ts` | Discord 連携 | 承認通知を Discord で行っている場合のみ維持。不要なら削除可 |
| スキルレベル・更新可能性ロジック | `spot-utils.ts` 内の canUpdateRecord, isHighDifficulty 等 | スケートの「技の難易度」に特化しているため、fig では使わない or 別コンセプト（例：レア度）に置き換え |
| `user_profiles` の skill_level | スケーター難易度用 | ランク・バッジ等に流用するか、fig では未使用にするかで判断 |

---

## 5. 事業計画・収益化（Doc 内：そのまま転用推奨）

戦略ドキュメントの「バリューラダー」「CF 計画」と直接対応します。

| パス | 内容 | 転用の仕方 |
|------|------|------------|
| `Doc/python/cf_chart_v3.py` | 3ヵ年 CF シナリオ比較（A/B）、グラフ出力 | **そのまま figuraffiti 事業の数値に差し替えて利用可能**。変数名・ラベルを fig 用に変更すれば継続利用可 |
| `Doc/python/analyze_cf.py` | CF 分析 | 同上 |
| `Doc/python/analyze_cf_v2.py` | CF 分析 v2 | 同上 |
| `Doc/python/cf_chart.py`, `cf_chart_v2.py` | CF チャート | 必要に応じて v3 に統一 or シナリオ追加 |
| `Doc/python/make_excel.py` | Excel 出力 | 計画書・資金調達用にそのまま転用可能 |
| `Doc/Figuraffiti 3ヵ年CF計画書*.md` | 既存の fig 向け CF ドキュメント | 戦略ドキュメントと合わせて単一の「事業計画セット」として維持 |

---

## 6. 推奨アクション（優先順）

1. **ブランディング・メタデータの差し替え**  
   `app/layout.tsx` の title / description / OGP、`README.md` のサービス名・説明を「Figuraffiti」用に変更する。

2. **Spot の意味づけの明確化**  
   - 現行スキーマを活かす場合：`trick` = 作品名 or キャッチコピー、`skater` = アーティスト名、`spot_name` = 設置場所名 などとドキュメントとコード内コメントで統一。  
   - 必要なら `spot_media.source` に `TikTok` を追加するマイグレーションを実行。

3. **地図・投稿フローの文言統一**  
   `app/mapping/page.tsx`、`app/submit/page.tsx`、`lib/constants.ts` の「記録」「技」「スポット」等を「Figuraffiti／グラフィティスポット／作品」等に置き換え。

4. **Instagram oEmbed の活用**  
   制作過程・完成作の Reel をスポット詳細やプロフィールで埋め込む箇所で、既存 `app/api/instagram/oembed/route.ts` をそのまま利用する。

5. **CF・事業計画の継続利用**  
   `Doc/python/` の CF スクリプトと `Doc/Figuraffiti 3ヵ年CF計画書*.md` を、今回の戦略ドキュメントの数字・シナリオに合わせて更新し、入口商品（ステッカー等）・バリューラダーと紐づける。

---

## 7. 必要のないコード（削除 or 無効化候補）

figuraffiti 事業では使わないため、**削除してよい**または**無効化・表示オフにしてよい**コードです。

### 7.1 Discord 連携一式（承認を Web 管理のみにする場合）【実施済】

| パス | 内容 | 対応 |
|------|------|------|
| `app/api/discord/interactions/route.ts` | Discord Bot 経由の承認/却下 | 410 を返すスタブに変更（外部連携切断） |
| `lib/discord/verify-signature.ts` | Discord 署名検証 | 削除 |
| `app/api/spots/route.ts` 内の `sendDiscordNotification()` | 新規投稿時の Discord 通知 | 削除 |
| Supabase Edge Function `send-discord-notification` | 同上 | 当リポジトリから削除 |
| `lib/constants.ts` の `DISCORD`、フッターの Discord リンク | 外部リンク | 削除・コメントアウト |
| `SETUP.md` / `TROUBLESHOOTING.md` の Discord 記述 | 手順書 | 削除 |

---

### 7.2 スケート特化：スキルレベル・更新可能性・難易度

「同じスポットでより難しい技を決めた記録で更新できる」というスケート用の機能です。figuraffiti では「スポット＝1 作品」が基本なので、**丸ごと不要**にできます。

| パス | 内容 | 理由 |
|------|------|------|
| `lib/spot/spot-utils.ts` | `canUpdateRecord`, `findUpdatableSpots`, `isHighDifficulty`, `getHighDifficultySpots`, `getDifficultyLevel`, `selectRepresentativeRecord`（代表記録選択） | 技の難易度・更新可能性の判定。fig では使わない |
| `lib/constants.ts` | `DIFFICULTY_LEVELS`, `DIFFICULTY_LEVEL_NUMBERS`, `HIGH_DIFFICULTY_THRESHOLD`, `UPDATABLE_CONFIG`, `SPOT_MARKER_STYLES.updatable` | 難易度・更新可能性用の定数。fig では未使用でよい |
| `lib/mapbox/mapbox-utils.ts` | `createUpdatableSpotPulseMarker`, `createClusterRangePulseMarker` の「更新可能性」用パルス・スタイル | 更新可能スポットのハイライト。fig では表示しない |
| `components/map/map-view.tsx` | 更新可能性判定・`updatable_count`・「更新可能」バッジ表示・`showUpdatableSpotPulses`・`userSkillLevel` 取得 | 地図上の「更新可能」表示。fig では削除 or 常にオフ |
| `components/spot/multiple-records-list.tsx` | 代表記録・「更新可能」バッジ | 同スポット複数記録＋更新可能性の UI。fig では同スポット複数作品を使わないなら不要 |
| `lib/api/user-profile-utils.ts` | スキルレベル取得・更新・自動判定（`detectSkillLevelFromSkaterName` 等） | 更新可能性判定のためだけに使用。fig では未使用でよい |
| `app/api/profile/user-profile/route.ts` | `skillLevel`, `levelSetBy`, `detectedSkaterName` の読み書き | 同上。プロフィールは「表示名・アバター」だけにするなら簡略化可 |
| `app/profile/page.tsx` | プロフィール取得時の `skillLevel` 利用 | 地図の更新可能性用。fig では不要 |
| `types/user.ts` | `UserProfile.skillLevel`, `UserSkillLevelQuestionnaire`, `SKILL_LEVEL_MAPPING` | スキルレベル用の型。fig でランク等に流用しないなら未使用 |
| DB: `user_profiles` テーブルの `skill_level`, `level_set_by`, `detected_skater_name` | スケーター難易度用 | fig では使わない。テーブル自体は「プロフィール拡張」用に残しても可 |

**進め方の例**: まずは「更新可能性・難易度」の**表示だけオフ**（定数でフラグ切り）にして、地図・スポット詳細から該当 UI を消す。その後、使わない関数・定数・API を削除していくと安全です。

---

### 7.3 メディアソースのスケート雑誌名

| パス | 内容 | 理由 |
|------|------|------|
| `types/spot.ts` | `source: "Thrasher" | "KAWA" | "Transworld" | ...` | スケート雑誌。fig では TikTok 等に差し替えたい |
| `lib/constants.ts` | `SOURCE_COLORS` の Thrasher, KAWA, Transworld | ピン色分け用。fig では Instagram/TikTok 等に変更 |
| `supabase/schema.sql` / migrations | `spot_media.source` の CHECK 制約 | 新ソース（例: TikTok）を追加するマイグレーションで更新 |

**注意**: 「不要」というより**差し替え**。Thrasher/KAWA/Transworld を削除し、TikTok などを追加する形がよいです。

---

### 7.4 その他（オプションで削除してよいもの）

| パス | 内容 | 理由 |
|------|------|------|
| `components/profile/settings-tab.tsx` の「スキルレベル」UI | 未実装の TODO が残っている可能性 | スキルレベル機能自体をやめるなら、該当 UI があれば削除 |
| `supabase/seed.sql` のダミーデータ | Thrasher/KAWA 等のスケート用ダミー | 開発用。fig 用のダミーに差し替えるか、クリアして使う |
| Doc 内の `doc/DESIGN.md`, `doc/normal-mode-ui-ux-improvement-plan.md` 等 | スケート用の設計・改善計画 | 参照しなければ削除可（アーカイブフォルダへ移動でも可） |

---

## 8. まとめ

- **地図＋スポット＋認証＋承認＋プロフィール＋管理者**の一連の実装は、**Figuraffiti の「オンラインマップ」とコミュニティ基盤**としてほぼそのまま転用可能です。
- **Instagram oEmbed** は、戦略ドキュメントで想定している **TikTok/Instagram を主戦場にした発信** をサイト内に取り込むためにそのまま使えます。
- **Doc 内の Python（CF 分析・チャート・Excel）** は、**バリューラダーと収益計画**の検証に転用できます。
- 変更は主に「ドメインの読み替え」「文言・ラベル」「メタデータ」に留め、スキーマは必要最小限の拡張（例：TikTok source、任意で artist_name など）に抑えると、転用コストを最小にできます。
