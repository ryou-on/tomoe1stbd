// src/hooks/useFirestore.js
// ─────────────────────────────────────────────
// Firestore リアルタイム同期フック
//
// 設計思想:
//   UIコード (App.jsx) は「見た目」だけを担当。
//   データの読み書きはすべてこのフックが担当。
//   → App.jsx を差し替えてもデータは Firestore に残る。
//   → スキーマバージョンで将来のマイグレーションにも対応。
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc, collection, onSnapshot, setDoc, deleteDoc,
  writeBatch, query, orderBy, getDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { runMigrations, CURRENT_SCHEMA_VERSION } from '../utils/migration';

// デフォルト設定（初回起動時に Firestore に書き込まれる）
const DEFAULT_CONFIG = {
  name: 'ともえ',
  heroSub: 'A Special Day for Our Little Princess',
  eventDate: '2026-02-11',
  birthDate: '2025-02-11',
  venue: '新大塚第3シカゴマンション1階',
  address: '東京都豊島区南大塚2丁目17-8',
  amazonUrl: 'https://www.amazon.jp/hz/wishlist/ls/3OUWEIUUHU024?ref_=wl_share',
  adminId: '20250211',
  adminPass: '20250211',
  announcement: '',
  rsvpDeadline: '2026-12-31',
  color: '#be123c',
  style: 'elegant',
  topImg: '',
  senderName: 'ともえの両親',
  autoReplyEnabled: true,
  schemaVersion: CURRENT_SCHEMA_VERSION,
};

const DEFAULT_SCHEDULE = [
  { id: 's1', time: '11:00', title: '受付開始' },
  { id: 's2', time: '11:30', title: '一升餅・選び取り' },
  { id: 's3', time: '12:00', title: 'お食事タイム' },
  { id: 's4', time: '13:00', title: 'ケーキ＆記念撮影' },
];

export function useFirestore() {
  const [cfg, setCfg]               = useState(DEFAULT_CONFIG);
  const [rsvps, setRsvps]           = useState([]);
  const [msgs, setMsgs]             = useState([]);
  const [photos, setPhotos]         = useState([]);
  const [sched, setSched]           = useState([]);
  const [news, setNews]             = useState([]);
  const [emailDrafts, setEmailDrafts] = useState([]);
  const [ready, setReady]           = useState(false);

  const initDone = useRef(false);

  // ── 初回ロード＋リアルタイム購読 ──
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    let unsubscribers = [];

    const init = async () => {
      // 1. config ドキュメントの存在チェック
      const cfgRef = doc(db, 'app', 'config');
      const cfgSnap = await getDoc(cfgRef);

      if (!cfgSnap.exists()) {
        // 初回: デフォルトデータを書き込み
        await setDoc(cfgRef, DEFAULT_CONFIG);
        const batch = writeBatch(db);
        DEFAULT_SCHEDULE.forEach(s => {
          batch.set(doc(db, 'schedule', s.id), s);
        });
        await batch.commit();
      } else {
        // マイグレーション実行
        await runMigrations(cfgSnap.data());
      }

      // 2. リアルタイム購読を開始
      unsubscribers.push(
        onSnapshot(cfgRef, snap => {
          if (snap.exists()) setCfg(prev => ({ ...DEFAULT_CONFIG, ...snap.data() }));
        })
      );

      const subscribe = (col, setter, sortField) => {
        const q = sortField
          ? query(collection(db, col), orderBy(sortField, 'desc'))
          : collection(db, col);
        unsubscribers.push(
          onSnapshot(q, snap => {
            setter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          })
        );
      };

      subscribe('rsvps',       setRsvps,       'ts');
      subscribe('messages',    setMsgs,        'ts');
      subscribe('photos',      setPhotos,      'ts');
      subscribe('schedule',    setSched,       null);
      subscribe('news',        setNews,        'ts');
      subscribe('emailDrafts', setEmailDrafts, 'ts');

      setReady(true);
    };

    init().catch(e => {
      console.error('Firestore init error:', e);
      // オフラインフォールバック: ローカルステートで動作
      setSched(DEFAULT_SCHEDULE);
      setReady(true);
    });

    return () => unsubscribers.forEach(u => u());
  }, []);

  // ── 書き込みヘルパー ──

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const updateConfig = useCallback(async (changes) => {
    try {
      await setDoc(doc(db, 'app', 'config'), changes, { merge: true });
    } catch (e) {
      console.error('Config update error:', e);
      // フォールバック: ローカル更新
      setCfg(prev => ({ ...prev, ...changes }));
    }
  }, []);

  const addDoc_ = useCallback(async (col, data) => {
    const id = data.id || uid();
    const docData = { ...data, id, ts: data.ts || new Date().toISOString() };
    try {
      await setDoc(doc(db, col, id), docData);
    } catch (e) {
      console.error(`Add ${col} error:`, e);
    }
    return id;
  }, []);

  const updateDoc_ = useCallback(async (col, id, changes) => {
    try {
      await setDoc(doc(db, col, id), changes, { merge: true });
    } catch (e) {
      console.error(`Update ${col}/${id} error:`, e);
    }
  }, []);

  const deleteDoc_ = useCallback(async (col, id) => {
    try {
      await deleteDoc(doc(db, col, id));
    } catch (e) {
      console.error(`Delete ${col}/${id} error:`, e);
    }
  }, []);

  // ── 画像アップロード (Firebase Storage) ──
  const uploadImage = useCallback(async (dataUrl, path) => {
    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (e) {
      console.error('Upload error:', e);
      // フォールバック: dataURL をそのまま返す（Storageなしでも動く）
      return dataUrl;
    }
  }, []);

  const deleteImage = useCallback(async (path) => {
    try {
      await deleteObject(ref(storage, path));
    } catch (e) {
      console.warn('Image delete error:', e);
    }
  }, []);

  // ── RSVP 送信 ──
  const submitRsvp = useCallback(async ({ name, email, att, msg }) => {
    const id = uid();
    await addDoc_('rsvps', { id, name, email, att, msg });
    if (msg) {
      await addDoc_('messages', { id: uid(), name, text: msg });
    }
    return { id, name, email, att };
  }, [addDoc_]);

  // ── メッセージ送信 ──
  const submitMessage = useCallback(async ({ name, text }) => {
    return addDoc_('messages', { id: uid(), name, text });
  }, [addDoc_]);

  // ── 写真アップロード ──
  const submitPhotos = useCallback(async (uploaderName, dataUrls) => {
    const results = [];
    for (const dataUrl of dataUrls) {
      const id = uid();
      const url = await uploadImage(dataUrl, `photos/${id}.jpg`);
      await addDoc_('photos', { id, uploader: uploaderName, url, likes: 0, storagePath: `photos/${id}.jpg` });
      results.push(id);
    }
    return results;
  }, [addDoc_, uploadImage]);

  const likePhoto = useCallback(async (id, currentLikes) => {
    await updateDoc_('photos', id, { likes: (currentLikes || 0) + 1 });
  }, [updateDoc_]);

  // ── スケジュール CRUD ──
  const addSchedule = useCallback(async (time, title) => {
    const id = uid();
    await addDoc_('schedule', { id, time, title, ts: new Date().toISOString() });
    return id;
  }, [addDoc_]);

  const updateSchedule = useCallback(async (id, time, title) => {
    await updateDoc_('schedule', id, { time, title });
  }, [updateDoc_]);

  const deleteSchedule = useCallback(async (id) => {
    await deleteDoc_('schedule', id);
  }, [deleteDoc_]);

  // ── ニュース CRUD ──
  const addNews = useCallback(async (title, content) => {
    return addDoc_('news', { id: uid(), title, content });
  }, [addDoc_]);

  const deleteNews = useCallback(async (id) => {
    await deleteDoc_('news', id);
  }, [deleteDoc_]);

  // ── Email Draft CRUD ──
  const addEmailDraft = useCallback(async (draft) => {
    return addDoc_('emailDrafts', draft);
  }, [addDoc_]);

  const updateEmailDraft = useCallback(async (id, changes) => {
    await updateDoc_('emailDrafts', id, changes);
  }, [updateDoc_]);

  const deleteEmailDraft = useCallback(async (id) => {
    await deleteDoc_('emailDrafts', id);
  }, [deleteDoc_]);

  // ── 削除（汎用） ──
  const deleteItem = useCallback(async (col, id) => {
    // 写真の場合は Storage も削除
    if (col === 'photos') {
      const photo = photos.find(p => p.id === id);
      if (photo?.storagePath) await deleteImage(photo.storagePath);
    }
    // RSVP 削除時は関連 emailDraft も削除
    if (col === 'rsvps') {
      const drafts = emailDrafts.filter(d => d.rsvpId === id);
      for (const d of drafts) await deleteDoc_('emailDrafts', d.id);
    }
    await deleteDoc_(col, id);
  }, [deleteDoc_, deleteImage, photos, emailDrafts]);

  // ── エクスポート / インポート ──
  const exportAll = useCallback(() => {
    return {
      exportedAt: new Date().toISOString(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      cfg, rsvps, msgs, photos, sched, news, emailDrafts,
    };
  }, [cfg, rsvps, msgs, photos, sched, news, emailDrafts]);

  const importAll = useCallback(async (data) => {
    if (data.cfg)         await setDoc(doc(db, 'app', 'config'), { ...data.cfg, schemaVersion: CURRENT_SCHEMA_VERSION }, { merge: true });
    const batchImport = async (col, items) => {
      for (const item of (items || [])) {
        await setDoc(doc(db, col, item.id), item);
      }
    };
    await batchImport('rsvps',       data.rsvps);
    await batchImport('messages',    data.msgs);
    await batchImport('photos',      data.photos);
    await batchImport('schedule',    data.sched);
    await batchImport('news',        data.news);
    await batchImport('emailDrafts', data.emailDrafts);
  }, []);

  return {
    // State (read-only, auto-synced)
    cfg, rsvps, msgs, photos, sched, news, emailDrafts, ready,

    // Config
    updateConfig,

    // RSVP
    submitRsvp,

    // Messages
    submitMessage,
    deleteMessage: (id) => deleteItem('messages', id),

    // Photos
    submitPhotos, likePhoto,
    deletePhoto: (id) => deleteItem('photos', id),

    // Schedule
    addSchedule, updateSchedule, deleteSchedule,

    // News
    addNews, deleteNews,

    // Email Drafts
    addEmailDraft, updateEmailDraft, deleteEmailDraft,

    // RSVP delete
    deleteRsvp: (id) => deleteItem('rsvps', id),

    // Bulk
    exportAll, importAll,

    // Image upload (for top image etc)
    uploadImage,
  };
}
