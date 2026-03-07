# SMTP設定が正しく入力されている場合の確認手順

## ✅ SMTP設定の確認

表示されているSMTP設定は正しく入力されています：
- ✅ **Sender email address**: `noreply@resend.dev`
- ✅ **Sender name**: `Skateright`
- ✅ **Host**: `smtp.resend.com`
- ✅ **Port number**: `587`
- ✅ **Username**: `resend`
- ✅ **Password**: 設定済み（マスク表示）

## 重要な確認ポイント

### 1. 「Enable custom SMTP」が有効になっているか確認

**最重要**: 設定画面の上部に **「Enable custom SMTP」** のトグルスイッチがあるはずです。

- [ ] **Enable custom SMTP** のトグルスイッチが **ON** になっているか確認
- [ ] 無効（OFF）になっている場合は、有効（ON）にする

**注意**: すべてのフィールドが入力されていても、**「Enable custom SMTP」** が無効だとメールは送信されません。

### 2. 設定を保存したか確認

- [ ] **Save changes** ボタンをクリックして保存したか確認
- [ ] 保存後、ページをリロードして設定が保存されているか確認

### 3. リダイレクトURLの設定を確認

1. **Authentication** → **URL Configuration** に移動
2. 以下を確認：
   - ✅ **Site URL** が設定されているか（例: `https://your-domain.vercel.app`）
   - ✅ **Redirect URLs** に以下が追加されているか：
     ```
     https://your-domain.vercel.app/auth/callback
     https://your-domain.vercel.app/**
     ```

## テスト手順

1. **「Enable custom SMTP」** が有効になっていることを確認
2. **Save changes** をクリックして保存
3. ページをリロードして設定が保存されていることを確認
4. アプリでサインアップを実行
5. Resendダッシュボードの **Logs** を確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか
6. Supabaseダッシュボードの **Authentication** → **Logs** を確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

## よくある問題

### 問題: 「Enable custom SMTP」が無効になっている

**症状**: すべてのフィールドが入力されているが、メールが送信されない

**原因**: **「Enable custom SMTP」** のトグルスイッチが無効になっている

**解決策**:
1. 設定画面の上部で **「Enable custom SMTP」** のトグルスイッチを確認
2. 無効（OFF）の場合は、有効（ON）にする
3. **Save changes** をクリックして保存

### 問題: 設定が保存されていない

**症状**: 設定を入力したが、ページをリロードすると設定が消えている

**原因**: **Save changes** をクリックしていない

**解決策**:
1. すべてのフィールドを入力
2. **Save changes** をクリック
3. ページをリロードして設定が保存されていることを確認

## 確認チェックリスト

- [x] SMTP設定が正しく入力されている ✅（確認済み）
- [ ] **「Enable custom SMTP」** が有効になっている（確認が必要）
- [ ] **Save changes** をクリックして保存した（確認が必要）
- [ ] リダイレクトURLが設定されている（確認が必要）

## 次のステップ

1. **「Enable custom SMTP」** のトグルスイッチが有効（ON）になっているか確認（最重要）
2. 無効の場合は有効にする
3. **Save changes** をクリックして保存
4. リダイレクトURLが設定されているか確認
5. すべて確認後、サインアップを再試行
6. Resendダッシュボードの **Logs** を確認

## 重要

設定が正しく入力されていても、**「Enable custom SMTP」** が無効だとメールは送信されません。

まずは **「Enable custom SMTP」** のトグルスイッチが有効になっているか確認してください。

