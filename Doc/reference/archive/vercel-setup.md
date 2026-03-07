# Vercel設定ガイド

## 問題
VercelでNext.jsが検出されないエラーが発生している場合の対処法

## 確認事項

### 1. Root Directory設定（最重要）

Vercelダッシュボードで以下を確認：

1. **Settings** → **General** → **Root Directory**
2. **空（ルートディレクトリ）** に設定されているか確認
3. サブディレクトリが設定されている場合は、**削除**して空にする

**重要**: `package.json`はリポジトリのルートディレクトリにあります。

### 2. Framework Preset

1. **Settings** → **General** → **Framework Preset**
2. **Next.js** が選択されているか確認
3. 未選択の場合は **Next.js** を選択

### 3. Build & Development Settings

1. **Settings** → **General** → **Build & Development Settings**
2. 以下の設定を確認：
   - **Build Command**: `npm run build` または空（自動検出）
   - **Output Directory**: `.next` または空（自動検出）
   - **Install Command**: `npm install` または空（自動検出）
   - **Development Command**: `npm run dev` または空（自動検出）

### 4. Node.js Version

1. **Settings** → **General** → **Node.js Version**
2. **18.x** または **20.x** を選択（`package.json`の`engines`フィールドに合わせる）

### 5. リポジトリの再デプロイ

設定変更後：

1. **Deployments** タブを開く
2. 最新のデプロイメントを選択
3. **Redeploy** ボタンをクリック
4. または、GitHubに新しいコミットをプッシュして自動デプロイをトリガー

## 確認コマンド（ローカル）

リポジトリのルートディレクトリで以下を実行：

```bash
# package.jsonが存在するか確認
test -f package.json && echo "OK" || echo "NOT FOUND"

# Next.jsが含まれているか確認
node -e "const pkg = require('./package.json'); console.log('Next.js:', pkg.dependencies.next || 'NOT FOUND')"

# package.jsonの場所を確認
pwd
ls -la package.json
```

## トラブルシューティング

### エラーが続く場合

1. **Vercelプロジェクトを削除して再作成**
   - 既存のプロジェクトを削除
   - GitHubリポジトリから新規プロジェクトを作成
   - 自動検出に任せる

2. **Vercel CLIを使用してデプロイ**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

3. **Vercelサポートに連絡**
   - エラーログを添付
   - リポジトリのURLを共有

## 現在の設定

- **package.json**: リポジトリのルートに存在
- **Next.js version**: 16.0.10
- **Node.js version**: >=18.0.0（enginesフィールドで指定）
- **Build command**: `npm run build --webpack`

