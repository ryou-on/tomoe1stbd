// src/utils/migration.js
// ─────────────────────────────────────────────
// データスキーマ バージョン管理 & マイグレーション
//
// 使い方:
//   1. CURRENT_SCHEMA_VERSION を上げる
//   2. migrations 配列に変換関数を追加
//   3. アプリ起動時に runMigrations() が自動実行
//
// 例: v1→v2 で schedule に description フィールドを追加する場合
//   migrations.push({
//     version: 2,
//     up: async () => {
//       const snap = await getDocs(collection(db, 'schedule'));
//       const batch = writeBatch(db);
//       snap.docs.forEach(d => {
//         if (!d.data().description) {
//           batch.update(d.ref, { description: '' });
//         }
//       });
//       await batch.commit();
//     }
//   });
// ─────────────────────────────────────────────

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const CURRENT_SCHEMA_VERSION = 1;

// マイグレーション定義（バージョン昇順）
const migrations = [
  // {
  //   version: 2,
  //   description: 'Add description field to schedule',
  //   up: async () => { ... }
  // },
];

/**
 * 必要なマイグレーションを順次実行
 * @param {object} currentConfig - Firestore から読んだ現在の config
 */
export async function runMigrations(currentConfig) {
  const currentVersion = currentConfig.schemaVersion || 0;

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return; // 最新、何もしない
  }

  console.log(`[Migration] v${currentVersion} → v${CURRENT_SCHEMA_VERSION}`);

  const pending = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const m of pending) {
    console.log(`[Migration] Running v${m.version}: ${m.description || ''}`);
    try {
      await m.up();
      // バージョンを段階的に更新
      await setDoc(
        doc(db, 'app', 'config'),
        { schemaVersion: m.version },
        { merge: true }
      );
      console.log(`[Migration] v${m.version} complete`);
    } catch (e) {
      console.error(`[Migration] v${m.version} FAILED:`, e);
      throw e; // 失敗したら止める
    }
  }

  // 最終バージョンに更新
  await setDoc(
    doc(db, 'app', 'config'),
    { schemaVersion: CURRENT_SCHEMA_VERSION },
    { merge: true }
  );

  console.log('[Migration] All migrations complete');
}
