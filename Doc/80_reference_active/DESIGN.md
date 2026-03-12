# AhhHum Phase1 設計

## コア機能

1. **曖昧サークル** … マップ上に半径50mのサークルのみ表示（正確な位置は非表示）
2. **グローバル・ティッカー** … 「User_X just found #N in [地名]」形式の発見ログ
3. **NFC/QR タギング** … 発見時に読み取り、Last Seen を鮮度更新

詳細は [AhhHum Phase1 UX設計書（MVP）](../AhhHum%20Phase1%20UX設計書（MVP）.md) を参照。

---

## データベース

### テーブル

| テーブル | 役割 |
|----------|------|
| spots | 発見場所（承認済みのみ公開） |
| discovery_logs | 発見履歴（ティッカー用） |
| admin_users | 管理者（承認権限） |
| user_profiles | ユーザー表示名（ティッカー用） |

詳細は [Figuraffiti 必要テーブル一覧](../Figuraffiti%20必要テーブル一覧.md) を参照。

---

## 承認フロー

1. ユーザーがスポット申請（`status: pending`）
2. 管理者にメール通知
3. 管理画面（`/admin`）で承認/却下
4. 投稿者にメール通知

詳細は [submission-flow.md](./submission-flow.md) を参照。
