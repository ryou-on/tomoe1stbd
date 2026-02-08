// src/firebase.js
// ─────────────────────────────────────────────
// Firebase 設定ファイル
//
// 手順:
// 1. Firebase Console (https://console.firebase.google.com/) でプロジェクトを作成
// 2. 「ウェブアプリを追加」で設定値を取得
// 3. .env ファイルに設定値を記入（.env.example を参照）
// 4. Firestore Database を作成（テストモードで開始）
// 5. Authentication → 匿名ログイン を有効化
// 6. Storage を有効化（画像アップロード用）
// ─────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

// 匿名認証（自動サインイン）
signInAnonymously(auth).catch(e => console.warn('Auth error:', e));

export default app;
