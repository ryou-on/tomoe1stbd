# 🎂 ともえ生誕祭 2026

誕生日パーティー専用ウェブサイト — Firebase + Vite + React + Tailwind CSS

## アーキテクチャ

```
┌─────────────────────────────────────────────┐
│  ブラウザ (React SPA)                        │
│  ┌───────────┐  ┌────────────────────────┐  │
│  │ App.jsx   │  │ useFirestore.js (hook) │  │
│  │ (UI のみ) │→ │ (データ読み書き)        │  │
│  └───────────┘  └──────────┬─────────────┘  │
└────────────────────────────┼─────────────────┘
                             ↓
         ┌───────────────────────────────────┐
         │  Firebase                          │
         │  ├── Firestore (データ永続化)      │
         │  ├── Storage   (画像保存)          │
         │  ├── Auth      (匿名認証)          │
         │  └── Hosting   (静的ホスティング)  │
         └───────────────────────────────────┘
```

**設計の要点:**
- `App.jsx`（UI）と `useFirestore.js`（データ層）を完全分離
- App.jsx を差し替えても Firestore のデータはそのまま残る
- `migration.js` でスキーマバージョンを管理 → 安全にアップグレード可能

---

## セットアップ手順

### 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」→ 名前を入力して作成
3. 左メニュー → **Firestore Database** → 「データベースを作成」→ **テストモードで開始**
4. 左メニュー → **Authentication** → **ログイン方法** → **匿名** を有効化
5. 左メニュー → **Storage** → 「始める」→ テストモードで開始
6. ⚙️ → **プロジェクトの設定** → **マイアプリ** → ウェブアプリを追加（`</>`アイコン）
7. 表示される設定値をメモ

### 2. 環境変数を設定

```bash
cp .env.example .env
```

`.env` をエディタで開き、手順1でメモした値を記入:

```env
VITE_FB_API_KEY=AIzaSy...
VITE_FB_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FB_PROJECT_ID=my-project
VITE_FB_STORAGE_BUCKET=my-project.appspot.com
VITE_FB_MESSAGING_ID=123456789
VITE_FB_APP_ID=1:123456789:web:abcdef123

# AI メール生成を使う場合（省略可）
VITE_CLAUDE_API_KEY=sk-ant-...
```

### 3. インストール & 起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く

### 4. デプロイ

```bash
npm install -g firebase-tools
firebase login
firebase init  # Hosting, Firestore, Storage を選択（既存ファイル上書きしない）
```

`.firebaserc` の `your-firebase-project-id` を自分のプロジェクトIDに変更:

```json
{
  "projects": {
    "default": "my-actual-project-id"
  }
}
```

デプロイ実行:

```bash
npm run deploy
```

---

## ファイル構成

```
tomoe-festival/
├── .env.example          # 環境変数テンプレート
├── .firebaserc           # Firebase プロジェクト紐付け
├── .gitignore
├── firebase.json         # Firebase Hosting/Firestore/Storage 設定
├── firestore.rules       # Firestore セキュリティルール
├── firestore.indexes.json
├── storage.rules         # Storage セキュリティルール
├── index.html            # エントリーHTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # React エントリーポイント
    ├── index.css          # Tailwind ベースCSS
    ├── firebase.js        # Firebase 初期化（環境変数から読み込み）
    ├── App.jsx            # ★ UIレイヤー（差し替え可能）
    ├── hooks/
    │   └── useFirestore.js # ★ データ層（Firestore CRUD + リアルタイム同期）
    └── utils/
        └── migration.js   # ★ スキーマバージョン管理 & マイグレーション
```

---

## バージョンアップの方法

### UIのみ変更（データそのまま）

`src/App.jsx` を編集 → `npm run deploy` だけでOK。
Firestore のデータは一切影響を受けません。

### データ構造を変更（マイグレーション）

1. `src/utils/migration.js` の `CURRENT_SCHEMA_VERSION` を +1
2. `migrations` 配列にマイグレーション関数を追加

```js
// 例: v1 → v2 で schedule に description フィールドを追加
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const migrations = [
  {
    version: 2,
    description: 'Add description to schedule',
    up: async () => {
      const snap = await getDocs(collection(db, 'schedule'));
      const batch = writeBatch(db);
      snap.docs.forEach(d => {
        if (d.data().description === undefined) {
          batch.update(d.ref, { description: '' });
        }
      });
      await batch.commit();
    }
  },
];
```

3. デプロイ → ユーザーがアクセスした瞬間にマイグレーションが自動実行

### Firestore コレクション一覧

| コレクション | 用途 | 主なフィールド |
|---|---|---|
| `app/config` | サイト設定（1ドキュメント） | name, venue, color, style, schemaVersion |
| `rsvps` | 参加表明 | name, email, att, msg, ts |
| `messages` | お祝いメッセージ | name, text, ts |
| `photos` | 写真ギャラリー | uploader, url, storagePath, likes, ts |
| `schedule` | 当日スケジュール | time, title |
| `news` | お知らせ | title, content, ts |
| `emailDrafts` | AI生成メール下書き | name, email, body, subject, status, rsvpId |

---

## 管理画面

- URL: サイトのフッター →「管理者ログイン」
- ID: `20250211` / PW: `20250211`（管理画面の基本設定から変更可能）

### 管理タブ

| タブ | 機能 |
|---|---|
| 基本 | サイト名、会場、日程、RSVP締切 |
| デザイン | テーマカラー、フォントスタイル、トップ画像 |
| 自動返信 | AI生成メールの確認・Gmail送信 |
| スケジュール | 追加・編集・削除 |
| お知らせ | ニュース投稿 |
| ゲスト | RSVP一覧・一括メール |
| AI Tools | 未来予想・スピーチ原稿生成 |
| データ | JSON エクスポート / インポート |

---

## 技術スタック

- **フロントエンド:** React 18 + Vite 5 + Tailwind CSS 3
- **バックエンド:** Firebase (Firestore / Auth / Storage / Hosting)
- **AI:** Claude API (Sonnet) — メール生成・文章校正・スピーチ作成
- **アイコン:** Lucide React

---

## トラブルシューティング

### Firestore の権限エラー
→ Firebase Console → Firestore → ルール で `firestore.rules` の内容を貼り付け

### 画像がアップロードできない
→ Firebase Console → Storage → ルール で `storage.rules` の内容を貼り付け

### AI機能が動かない
→ `.env` の `VITE_CLAUDE_API_KEY` を設定。未設定の場合はフォールバックテンプレートが使われます。

### ローカルで Firestore に接続できない
→ `.env` の Firebase 設定値が正しいか確認。ブラウザの開発者ツール Console でエラーを確認。
