# メールテンプレート設定の確認方法

## この設定画面について

表示されているのは **Email Templates** の設定画面です。メールが届かない問題と**直接関係があります**。

## 重要な設定: 「Confirm sign up」

### 確認すべき設定

**Authentication** → **Confirm sign up** の設定を確認してください：

- ✅ **有効になっている場合**: サインアップ時に確認メールが送信されます
- ❌ **無効になっている場合**: 確認メールが送信されません

### 設定方法

1. **Confirm sign up** のトグルスイッチを確認
2. **有効になっていることを確認**（ONになっている必要があります）
3. 無効になっている場合は、**有効にする**

## その他のメールテンプレート設定

### 推奨設定

以下のメールテンプレートも有効にすることを推奨します：

- ✅ **Confirm sign up**: 有効（必須）
- ✅ **Reset password**: 有効（推奨）
- ✅ **Change email address**: 有効（推奨）
- ✅ **Magic link**: 任意

### セキュリティ通知（Security）

セキュリティ通知も有効にすることを推奨します：

- ✅ **Password changed**: 有効（推奨）
- ✅ **Email address changed**: 有効（推奨）

## メールが届かない場合の確認手順

### 1. 「Confirm sign up」が有効になっているか確認

1. **Authentication** → **Confirm sign up** の設定を確認
2. 有効になっていることを確認
3. 無効の場合は有効にする

### 2. SMTP設定が有効になっているか確認

1. **SMTP Settings** タブに移動
2. **Enable custom SMTP** が有効になっているか確認
3. すべてのフィールドが入力されているか確認

### 3. リダイレクトURLの設定を確認

1. **Authentication** → **URL Configuration** に移動
2. **Site URL** が設定されているか確認
3. **Redirect URLs** に以下が追加されているか確認：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

## 設定の優先順位

メールが届かない問題を解決するには、以下の順序で確認してください：

1. **「Confirm sign up」が有効になっているか**（最重要）
2. **SMTP設定が有効になっているか**
3. **リダイレクトURLが設定されているか**

## 確認チェックリスト

- [ ] **Confirm sign up** が有効になっている
- [ ] **SMTP Settings** で **Enable custom SMTP** が有効になっている
- [ ] すべてのSMTPフィールドが入力されている
- [ ] リダイレクトURLが設定されている

## 次のステップ

1. **「Confirm sign up」が有効になっているか確認**（最重要）
2. 無効の場合は有効にする
3. アプリでサインアップを再試行
4. Resendダッシュボードの **Logs** を確認

