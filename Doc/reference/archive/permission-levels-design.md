# 権限レベル設計案

## 現状の分析

現在のadminページには以下の機能が含まれています：

### 1. 承認管理
- 投稿の承認/却下
- 承認待ちリストの閲覧
- 承認履歴の確認

### 2. データ管理
- **全スポットの閲覧・編集・削除**（重要）
- CSVインポート
- 統計情報の閲覧
- データの一括操作

### 3. ユーザー管理
- 信頼ユーザーの追加/削除
- 管理者の管理（将来的に必要）

これらの機能は、確かに「オーナー権限」相当の機能です。

## 権限レベルの階層設計案

### レベル1: 一般ユーザー（User）
**権限:**
- 自分の投稿のみ閲覧・編集可能
- 投稿の作成（承認待ちとして投稿）
- 自分のプロフィール設定

**アクセス可能なページ:**
- **フロントエンド:**
  - `/` - 地図表示（承認済みスポットのみ閲覧）
  - `/list` - スポット一覧（承認済みスポットのみ）
  - `/spot/[id]` - スポット詳細（承認済みスポットのみ）
  - `/submit` - スポット提案フォーム
  - `/profile` - プロフィール（自分の投稿のみ）
  - `/mapping` - マッピングページ
  - `/guidelines` - ガイドライン
  - `/terms` - 利用規約
- **バックエンド:**
  - `/admin` ❌（アクセス不可）

---

### レベル2: 管理者（Admin）
**権限:**
- 一般ユーザーの権限すべて
- **承認管理**
  - 投稿の承認/却下
  - 承認待ちリストの閲覧
- **データ管理（読み取り専用）**
  - 全スポットの閲覧（承認待ち含む）
  - 統計情報の閲覧
- **信頼ユーザー管理**
  - 信頼ユーザーの追加/削除

**アクセス可能なページ:**
- **フロントエンド:**
  - 一般ユーザーがアクセス可能なすべてのページ ✅
  - `/profile` ✅（マイ投稿、設定のみ）
- **バックエンド:**
  - `/admin` ✅（管理者タブが表示される）

**制限事項:**
- スポットの編集・削除は**不可**（または自分の投稿のみ）
- 管理者の追加/削除は**不可**
- CSVインポートは**不可**

---

### レベル3: オーナー（Owner）
**権限:**
- 管理者の権限すべて
- **完全なデータ管理**（Supabase管理画面で実行）
  - 全スポットの編集・削除
  - CSVインポート（SQL Editorで実行）
  - データの一括操作
- **管理者管理**（Supabase管理画面で実行）
  - 管理者の追加/削除（`admin_users`テーブルを直接編集）
  - 権限レベルの変更
- **システム設定**（Supabase管理画面で実行）
  - RLSポリシーの変更
  - システム設定の変更

**アクセス可能なページ:**
- **フロントエンド:**
  - 管理者がアクセス可能なすべてのページ ✅
  - `/profile` ✅（マイ投稿、設定のみ）
- **バックエンド:**
  - `/admin` ⚠️（オプション: 実装しない、または管理者と同じ機能を提供）
- **Supabase管理画面:**
  - 直接アクセス可能 ✅（推奨: より効率的な操作が可能）

---

## データベーススキーマの変更案

### 現在のスキーマ
```sql
admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  note TEXT
)
```

### 提案するスキーマ
```sql
-- 権限レベルを管理するテーブル
user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  -- オーナーは1人のみ（制約）
  CONSTRAINT only_one_owner CHECK (
    (role = 'owner' AND (SELECT COUNT(*) FROM user_roles WHERE role = 'owner') <= 1) OR
    role != 'owner'
  )
)

-- 既存のadmin_usersはuser_rolesに統合
-- マイグレーション時に既存データを移行（role='admin'）
-- trusted_usersは独立したテーブルとして残す（権限レベルではなく属性）
```

### 後方互換性のためのビュー
```sql
-- admin_usersビュー（既存コードとの互換性のため）
CREATE VIEW admin_users AS
SELECT id, user_id, created_at, created_by, note
FROM user_roles
WHERE role IN ('admin', 'owner');

-- trusted_usersは独立したテーブルとして残す
-- （権限レベルではなく、オーナー/管理者が管理する属性）
```

---

## 実装方針

### フェーズ1: 権限レベルの追加（最小限の変更）
1. `user_roles`テーブルを作成（role: 'user', 'admin', 'owner'）
2. 既存の`admin_users`を`user_roles`に移行（role='admin'）
3. 最初のオーナーを手動で設定（role='owner'）
4. 後方互換性のためのビューを作成
5. `lib/admin-utils.ts`を更新して権限チェック関数を追加
6. `trusted_users`テーブルは独立したテーブルとして残す（権限レベルではない）

### フェーズ2: 機能の権限チェック
1. APIルートに権限チェックを追加
   - `/api/spots` (PUT/DELETE): Ownerのみ
   - `/api/spots/approve`: Admin以上
   - `/api/spots/reject`: Admin以上
   - `/api/admin/trusted-users`: Admin以上
   - `/api/admin/admins`: Ownerのみ（新規）
2. フロントエンドで権限に応じたUIを表示

### フェーズ3: オーナー管理機能の追加
1. オーナー管理ページの作成
2. 管理者の追加/削除機能
3. 権限レベルの変更機能

---

## 権限チェック関数の設計

```typescript
// lib/permission-utils.ts

export type UserRole = 'user' | 'admin' | 'owner'

export async function getUserRole(userId: string | null): Promise<UserRole> {
  if (!userId) return 'user'
  
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return data?.role || 'user'
}

export async function hasRole(
  userId: string | null,
  requiredRole: UserRole
): Promise<boolean> {
  const userRole = await getUserRole(userId)
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    owner: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 後方互換性のための関数
export async function isAdmin(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'admin')
}

export async function isOwner(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'owner')
}
```

---

## UIの変更案

### フロントエンドとバックエンドの分離

#### `/profile`ページ（フロントエンド - 一般ユーザー向け）
**すべてのユーザー共通:**
- **マイ投稿タブ**: 自分の投稿一覧（全ステータス）
- **設定タブ**: アカウント設定、通知設定

**特徴**: 管理機能は含まない、純粋なユーザープロフィールページ

#### `/admin`ページ（バックエンド - 管理者/オーナー専用）
**管理者（Admin）のタブ構成:**
- **承認管理タブ**: 承認待ちスポットの承認/却下
- **データ閲覧タブ**: 全スポットの閲覧（読み取り専用）、統計情報
- **ユーザー管理タブ**: 信頼ユーザーの追加/削除

**オーナー（Owner）のタブ構成:**
- 管理者のタブすべて
- **データ管理タブ**: 全スポットの編集・削除
- **CSVインポートタブ**: スポットデータの一括インポート
- **管理者管理タブ**: 管理者の追加/削除、権限レベルの変更

**特徴**: 管理機能専用ページ、権限チェック必須

---

## セキュリティ考慮事項

1. **RLSポリシーの更新**
   - オーナーのみが全データを編集・削除可能
   - 管理者は承認管理と信頼ユーザー管理のみ

2. **APIルートの権限チェック**
   - すべてのAPIルートで権限をチェック
   - 権限不足の場合は403を返す

3. **フロントエンドの権限チェック**
   - UIの表示/非表示はUXのため
   - **セキュリティはAPIルートで保証**

---

## マイグレーション手順

1. `user_roles`テーブルを作成（role: 'user', 'admin', 'owner'）
2. 既存の`admin_users`からデータを移行（role='admin'）
3. 最初のオーナーを手動で設定（role='owner'）
4. 後方互換性のためのビューを作成
5. `trusted_users`テーブルは独立したテーブルとして残す（権限レベルではない）
6. コードを段階的に更新

---

## 質問・検討事項

1. **オーナーの数**: 1人のみか、複数人可能か？
   - 提案: 1人のみ（制約で保証）

2. **管理者のスポット編集権限**: 
   - 提案: 自分の投稿のみ編集可能、または編集不可

3. **権限の降格**: オーナーから管理者への降格は可能か？
   - 提案: 可能（ただし、最後のオーナーは削除不可）

4. **既存のadmin_usersテーブル**: 
   - 提案: ビューで後方互換性を保つ

5. **実装の優先順位**:
   - フェーズ1（権限レベルの追加）を最優先
   - フェーズ2（機能の権限チェック）を次に実装
   - フェーズ3（オーナー管理機能）は後回しでも可

