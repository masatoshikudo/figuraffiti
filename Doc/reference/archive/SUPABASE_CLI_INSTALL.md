# Supabase CLI インストールガイド

## エラー: `Installing Supabase CLI as a global module is not supported`

**重要**: Supabase CLIは`npm install -g`でのグローバルインストールをサポートしていません。

## 解決方法

### 方法1: npxを使用（最も簡単・推奨）

インストール不要で、`npx`を使用して直接実行できます：

```bash
# プロジェクトディレクトリに移動
cd "/Users/kudoumasatoshi/NaTRIUM Dropbox/NaTRIUM/自社-8/mywebsite/skateright"

# npxで実行（初回は自動的にダウンロードされます）
npx supabase start
npx supabase status
npx supabase stop
```

**メリット**: 
- インストール不要
- プロジェクトごとに異なるバージョンを使用可能
- グローバルな設定変更が不要

### 方法2: Homebrewを使用（macOS推奨）

Homebrewがインストールされている場合：

```bash
# Homebrewをインストール（未インストールの場合）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Supabase CLIをインストール
brew install supabase/tap/supabase
```

### 方法3: バイナリを直接ダウンロード

1. [Supabase CLIのリリースページ](https://github.com/supabase/cli/releases)から最新版をダウンロード
2. ダウンロードしたバイナリを`/usr/local/bin`に配置（またはPATHが通っている場所に配置）

## 前提条件: Docker Desktopが必要

**重要**: Supabaseローカル開発環境を使用するには、**Docker Desktop**が必要です。

### Docker Desktopのインストール

1. [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)をダウンロード
2. インストール後、Docker Desktopを起動
3. Docker Desktopが起動していることを確認（メニューバーにDockerアイコンが表示される）

### Docker Desktopがインストールされていない場合

ローカル開発環境を使わずに、**本番環境のSupabase**を使用することもできます：

1. Supabaseダッシュボードでメール認証設定を確認
2. 実際のメールアドレスでサインアップしてテスト
3. メールボックスで確認メールを受信

詳細は`EMAIL_TROUBLESHOOTING.md`の「本番環境の確認」セクションを参照してください。

## ローカルSupabaseの起動

Docker Desktopが起動していることを確認してから：

```bash
# プロジェクトディレクトリに移動
cd "/Users/kudoumasatoshi/NaTRIUM Dropbox/NaTRIUM/自社-8/mywebsite/skateright"

# Supabaseローカル環境を起動
npx supabase start
# または
npm run supabase:start
```

起動後、以下のURLが表示されます：
- **API URL**: http://127.0.0.1:54321
- **Studio URL**: http://127.0.0.1:54323
- **Inbucket URL**: http://127.0.0.1:54324（メール確認用）

## 注意事項

開発環境でローカルSupabaseを使用する場合、`.env.local`を以下のように設定する必要があります：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**重要**: 本番環境にデプロイする際は、本番環境のSupabase URLに戻す必要があります。

