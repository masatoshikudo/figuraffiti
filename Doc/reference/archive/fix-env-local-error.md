# .env.localファイルのパースエラー修正方法

## エラー内容

```
failed to parse environment file: .env.local (unexpected character '\n' in variable name)
```

## 原因

`.env.local`ファイルに以下の問題がある可能性があります：

1. **変数名に改行文字が含まれている**
   - 例: `VAR\nNAME=value` （変数名の途中に改行）
   
2. **行の途中で改行されている**
   - 例: `VAR=value\n` の後に続く行が変数名として解釈されている

3. **引用符が正しく閉じられていない**
   - 例: `VAR="value` （閉じ引用符がない）

4. **特殊文字がエスケープされていない**
   - 例: 変数値に改行が含まれているが、適切にエスケープされていない

## 解決方法

### 方法1: .env.localファイルを確認して修正

1. `.env.local`ファイルを開く
2. 以下の点を確認：
   - 各行が正しく終わっているか（改行が1つだけ）
   - 変数名にスペースや特殊文字が含まれていないか
   - 値が引用符で囲まれている場合、閉じ引用符があるか
   - 値に改行が含まれている場合、適切にエスケープされているか

### 方法2: .env.localファイルを再作成

問題が特定できない場合は、`.env.local`ファイルを再作成してください：

1. 現在の`.env.local`ファイルをバックアップ：
   ```bash
   cp .env.local .env.local.backup
   ```

2. `.env.local`ファイルを削除：
   ```bash
   rm .env.local
   ```

3. 新しい`.env.local`ファイルを作成：
   ```bash
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_SUPABASE_URL=https://uheuaetcwqabmbpyhnio.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   DISCORD_PUBLIC_KEY=your_discord_public_key_here
   EOF
   ```

4. 実際の値を設定：
   - `your_anon_key_here` を実際のSupabase Anon Keyに置き換え
   - `your_mapbox_token_here` を実際のMapbox Tokenに置き換え
   - `your_discord_public_key_here` を実際のDiscord Public Keyに置き換え

### 方法3: 一時的に.env.localを無視して実行

`.env.local`ファイルの問題を一時的に回避する場合：

```bash
# .env.localを一時的にリネーム
mv .env.local .env.local.broken

# Supabase CLIコマンドを実行
npx supabase link --project-ref uheuaetcwqabmbpyhnio

# .env.localを復元（後で修正）
mv .env.local.broken .env.local
```

## .env.localファイルの正しい形式

### 正しい例

```env
# コメントは#で始まる
NEXT_PUBLIC_SUPABASE_URL=https://uheuaetcwqabmbpyhnio.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGVhbiJ9...
DISCORD_PUBLIC_KEY=e8c1a0f5c03328bba3a4f2bd589365f1dfd9070cdf8aa55b124a9bb5851b0575
```

### 間違った例

```env
# ❌ 変数名にスペースが含まれている
NEXT_PUBLIC SUPABASE_URL=https://...

# ❌ 値が引用符で囲まれていない（値にスペースが含まれる場合）
NEXT_PUBLIC_SUPABASE_URL=https://uheuaetcwqabmbpyhnio.supabase.co

# ❌ 閉じ引用符がない
NEXT_PUBLIC_SUPABASE_URL="https://...

# ❌ 変数名の途中に改行がある
NEXT_PUBLIC_
SUPABASE_URL=https://...
```

## 確認方法

### 1. ファイルの内容を確認

```bash
# ファイルの内容を表示
cat .env.local

# 改行文字を確認（macOSの場合）
cat .env.local | od -c | head -30
```

### 2. 構文エラーを確認

```bash
# 各行が正しい形式か確認
grep -n "=" .env.local

# 変数名に不正な文字が含まれていないか確認
grep -n "^[^#=]*[^A-Za-z0-9_]" .env.local
```

## 次のステップ

1. `.env.local`ファイルを修正
2. 再度Supabase CLIコマンドを実行：
   ```bash
   npx supabase link --project-ref uheuaetcwqabmbpyhnio
   ```

## トラブルシューティング

### エラーが続く場合

- `.env.local`ファイルを削除して、必要最小限の環境変数だけを設定し直す
- Supabase CLIの`--debug`フラグを使用して詳細なエラー情報を取得：
  ```bash
  npx supabase link --project-ref uheuaetcwqabmbpyhnio --debug
  ```

