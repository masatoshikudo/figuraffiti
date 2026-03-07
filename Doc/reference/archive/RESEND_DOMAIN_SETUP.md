# Resendでのドメイン登録について

## ドメイン登録が必要かどうか

### 現在の設定を確認

Supabaseダッシュボードの **SMTP Settings** で、**Sender email address** を確認してください：

- **`noreply@resend.dev`** の場合: **ドメイン登録は不要**（テストドメイン）
- **`noreply@yourdomain.com`** の場合: **ドメイン登録が必要**（独自ドメイン）

## テストドメイン（`resend.dev`）を使用する場合

### ドメイン登録は不要

`noreply@resend.dev` を使用している場合、**ドメイン登録は不要**です。

**メリット**:
- すぐに使用できる
- 設定が簡単

**デメリット**:
- テスト用のドメインのため、本番環境には適さない
- 迷惑メールフォルダに入りやすい可能性がある

## 独自ドメインを使用する場合（推奨）

### ドメイン登録が必要

`noreply@yourdomain.com` のような独自ドメインを使用する場合、**ドメイン登録と検証が必要**です。

### ドメイン登録の手順

1. [Resendダッシュボード](https://resend.com/)にログイン
2. **Domains** に移動
3. **Add Domain** をクリック
4. ドメイン名を入力（例: `skateright.io`）
5. Resendが提供するDNSレコードをドメインのDNS設定に追加：
   - **SPFレコード**: `v=spf1 include:resend.com ~all`
   - **DKIMレコード**: Resendが提供する値（複数のレコード）
   - **DMARCレコード**: `v=DMARC1; p=none; rua=mailto:dmarc@skateright.io`
6. DNS設定の反映を待つ（数分〜数時間）
7. Resendダッシュボードで **Verify** をクリックして検証

### ドメイン検証後の設定

1. Supabaseダッシュボードの **SMTP Settings** に移動
2. **Sender email address** を `noreply@skateright.io` に変更
3. **Save changes** をクリック

## 現在の状況の確認

### 確認方法

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. **Sender email address** を確認：
   - `noreply@resend.dev` → ドメイン登録不要（テストドメイン）
   - `noreply@skateright.io` → ドメイン登録必要（独自ドメイン）

### 推奨設定

**本番環境では独自ドメインの使用を推奨**します：

- より信頼性が高い
- 迷惑メールフォルダに入りにくい
- ブランドイメージの向上

## メールが届かない場合の確認

### テストドメインを使用している場合

1. メールボックスを確認（迷惑メールフォルダも確認）
2. `noreply@resend.dev` で検索
3. Resendダッシュボードの **Logs** を確認

### 独自ドメインを使用している場合

1. ドメインが検証されているか確認
2. DNSレコードが正しく設定されているか確認
3. Resendダッシュボードの **Logs** を確認

## 次のステップ

1. **現在のSender email addressを確認**
2. テストドメイン（`resend.dev`）を使用している場合: ドメイン登録は不要
3. 独自ドメインを使用する場合: ドメイン登録と検証が必要

## 重要

**現在 `noreply@resend.dev` を使用している場合、ドメイン登録は不要です。**

メールが届かない原因は、ドメイン登録の問題ではなく、**SMTP設定またはResendへの接続**の問題である可能性が高いです。

Resendダッシュボードの **Logs** を確認して、メール送信の試行が記録されているかどうかを確認してください。

