# アーカイブ（Figuraffiti 転用時に不要・後で参照用）

本ディレクトリは、Skateright 由来のコードベースを **Figuraffiti** 向けに転用する際に、**削除または無効化した機能**の記録用です。必要に応じてここにファイルのコピーを置き、後から参照できます。

## 無効化・削除したもの（本番コード側で対応）

- **Discord 連携**: `app/api/discord/interactions/route.ts` は 410 を返すスタブのまま。Discord 通知呼び出しは既に削除済み。
- **スキルレベル・更新可能性**: Figuraffiti では「技の難易度」「記録の更新」は使わない。`user_profiles.skill_level` 等は DB に残すが、UI では未使用。必要なら `lib/api/user-profile-utils.ts` のスキル関連や `lib/spot/spot-utils.ts` の更新可能性ロジックをここに退避可能。

## このフォルダに置くもの（任意）

- 将来削除するコンポーネントのコピー（例: 信頼ユーザー管理 UI、Discord 用設定手順など）
- スケート特化の設計メモ

## 参照

- `Doc/figuraffiti事業_転用コード一覧.md` の「7. 必要のないコード」に一覧あり。
