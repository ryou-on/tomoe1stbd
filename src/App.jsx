// src/App.jsx
// ─────────────────────────────────────────────
// UI レイヤー — データは useFirestore フックが管理
// このファイルを差し替えてもデータは Firestore に残ります
// ─────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Heart, Calendar, MapPin, Camera, Send, Users, Gift, Play,
  X, Plus, MessageSquare, Quote, Settings, Lock, Unlock,
  ExternalLink, Mail, Trash2, Upload, Download, Bell,
  AlertCircle, Share2, ChevronDown, Palette, HelpCircle,
  Database, Newspaper, ListTodo, Layout, FileUp, Check,
  Sparkles, Loader2, CheckCircle2, Eye,
  MailOpen, RefreshCw, Copy, Menu, Wand2, Pencil
} from 'lucide-react';
import { useFirestore } from './hooks/useFirestore';

/* ─── 小部品 ─── */
const Tip = ({ text }) => {
  const [o, setO] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <HelpCircle size={13} className="text-neutral-400 hover:text-rose-500 cursor-help" onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)} onClick={() => setO(!o)} />
      {o && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 bg-neutral-900 text-white text-[11px] leading-relaxed rounded-lg shadow-xl z-[999] pointer-events-none">{text}<span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neutral-900" /></span>}
    </span>
  );
};
const Toast = ({ msg, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2" style={{ animation: 'slideUp .3s ease-out' }}><Check size={14} className="text-emerald-400" />{msg}</div>;
};
const ST = ({ title, sub, help }) => (
  <div className="text-center mb-10">
    <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 mb-1.5">{title}{help && <Tip text={help} />}</h2>
    {sub && <p className="text-[11px] font-semibold tracking-[.25em] uppercase text-neutral-400">{sub}</p>}
  </div>
);
const Field = ({ label, children }) => (
  <div><div className="text-[11px] font-semibold text-neutral-500 mb-1 select-none">{label}</div>{children}</div>
);

/* ════════════════════════════════════════════ */
export default function App() {
  // ── Firestore フック（全データ） ──
  const store = useFirestore();
  const {
    cfg, rsvps, msgs, photos, sched, news, emailDrafts, ready,
    updateConfig, submitRsvp, submitMessage, submitPhotos,
    likePhoto, addSchedule, updateSchedule, deleteSchedule,
    addNews, deleteNews, addEmailDraft, updateEmailDraft,
    deleteEmailDraft, deleteRsvp, deletePhoto,
    exportAll, importAll, uploadImage,
  } = store;

  const deleteMessage = store.deleteMessage;

  // ── ローカル UI ステート ──
  const [page, setPage]       = useState('home');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [toast, setToast]     = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [aTab, setATab]       = useState('settings');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasRsvped, setHasRsvped] = useState(false);

  const [genLoading, setGenLoading] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);

  // Forms
  const [rName, setRName]   = useState('');
  const [rEmail, setREmail] = useState('');
  const [rAtt, setRAtt]     = useState('yes');
  const [rMsg, setRMsg]     = useState('');
  const [mName, setMName]   = useState('');
  const [mText, setMText]   = useState('');
  const [uName, setUName]   = useState('');
  const [uImgs, setUImgs]   = useState([]);

  // Modals
  const [showMsg, setShowMsg] = useState(false);
  const [showUp, setShowUp]   = useState(false);
  const [slide, setSlide]     = useState(-1);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiResult, setAiResult]     = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);

  // Schedule edit
  const [showSchedForm, setShowSchedForm]   = useState(false);
  const [newSchedTime, setNewSchedTime]     = useState('');
  const [newSchedTitle, setNewSchedTitle]   = useState('');
  const [editSchedId, setEditSchedId]       = useState(null);
  const [editSchedTime, setEditSchedTime]   = useState('');
  const [editSchedTitle, setEditSchedTitle] = useState('');

  // News form
  const [showNewsForm, setShowNewsForm]     = useState(false);
  const [newNewsTitle, setNewNewsTitle]     = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');

  const [selGuests, setSelGuests] = useState([]);

  const fileRef = useRef(null);
  const topRef  = useRef(null);
  const impRef  = useRef(null);

  const notify = useCallback(m => setToast(m), []);
  const sc = (c) => updateConfig(c);

  /* ─ Theme ─ */
  const T = useMemo(() => {
    const s = cfg.style;
    return {
      c: cfg.color || '#be123c',
      font: s === 'elegant' ? "'Noto Serif JP',Georgia,serif" : s === 'playful' ? "'M PLUS Rounded 1c',Nunito,sans-serif" : "'Inter','Helvetica Neue',sans-serif",
      r: s === 'playful' ? '1.25rem' : s === 'modern' ? '.375rem' : '.625rem',
      cr: s === 'playful' ? '1.5rem' : s === 'modern' ? '.5rem' : '.875rem',
    };
  }, [cfg.color, cfg.style]);

  const age = useMemo(() => {
    const b = new Date(cfg.birthDate), e = new Date(cfg.eventDate);
    if (isNaN(b) || isNaN(e)) return 0;
    let a = e.getFullYear() - b.getFullYear();
    if (e.getMonth() < b.getMonth() || (e.getMonth() === b.getMonth() && e.getDate() < b.getDate())) a--;
    return Math.max(0, a);
  }, [cfg.birthDate, cfg.eventDate]);

  const closed = useMemo(() => new Date() > new Date(cfg.rsvpDeadline), [cfg.rsvpDeadline]);
  const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(cfg.address)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(cfg.address)}&output=embed`;

  const slideItems = useMemo(() => [
    ...photos.map(p => ({ ...p, _t: 'img' })),
    ...msgs.map(m => ({ ...m, _t: 'msg' })),
  ].sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0)), [photos, msgs]);

  useEffect(() => {
    if (slide < 0 || !slideItems.length) return;
    const t = setInterval(() => setSlide(p => (p + 1) % slideItems.length), 6000);
    return () => clearInterval(t);
  }, [slide, slideItems.length]);

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const compress = (file, q = 0.45) => new Promise(res => {
    const r = new FileReader();
    r.onload = e => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const M = 1200; let w = img.width, h = img.height; if (w > h) { if (w > M) { h *= M / w; w = M; } } else { if (h > M) { w *= M / h; h = M; } } c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); res(c.toDataURL('image/jpeg', q)); }; img.src = e.target.result; };
    r.readAsDataURL(file);
  });

  const btnS = { backgroundColor: T.c, borderRadius: T.r, color: '#fff' };
  const iCls = "w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200/60 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none";

  /* ─── Claude API ─── */
  const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
  const callAI = async (prompt) => {
    const headers = { "Content-Type": "application/json" };
    if (CLAUDE_KEY) headers["x-api-key"] = CLAUDE_KEY;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers,
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    const d = await res.json();
    return (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  };

  const refineMsg = async () => {
    if (!rMsg || rMsg.length < 3) return;
    setAiRefining(true);
    try { setRMsg(await callAI(`以下のお祝いメッセージを温かみのある洗練された文章に校正。元の気持ちを大切に。校正後のみ出力:\n\n${rMsg}`)); notify('AIが文章を整えました ✨'); }
    catch { notify('AI校正に失敗'); } finally { setAiRefining(false); }
  };

  const genEmail = async (name, att) => {
    const schedT = [...sched].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(s => `  ${s.time} - ${s.title}`).join('\n');
    const p = att === 'yes'
      ? `あなたは「${cfg.senderName}」です。${name}さんが${cfg.name}の${age}歳誕生日会に出席表明。感謝メールを日本語で。
冒頭に必ず記載:
- 日付: 2026年2月11日（祝日）11時〜
- 公式サイト: https://ryou-on.github.io/tomoe1stbd/

含める:
- ${name}さんへの温かい感謝
- 会場: ${cfg.venue}（${cfg.address}）
- 地図: ${mapUrl}
- 当日のスケジュール:
${schedT}
- 【重要】当日はオープンハウス形式です。いつ来ていつ退出しても構いません。ご都合の良い時間帯にお越しください。
- 【注意】本人の体調や機嫌によりスケジュールが前後したり、予告なく中止になる場合があります。ご了承ください。
- プレゼント: Amazon欲しいものリスト → ${cfg.amazonUrl}
ルール: 350文字程度、温かい文体、本文のみ、「${cfg.senderName}より」で締める`
      : `あなたは「${cfg.senderName}」です。${name}さんが${cfg.name}の誕生日会に欠席返信。気遣いのある返信100文字程度。本文のみ。「${cfg.senderName}より」で締める。`;
    try { return await callAI(p); }
    catch { return att === 'yes' ? `${name}さん、ご出席ありがとうございます！\n\n📍${cfg.venue}（${cfg.address}）\n🗺️${mapUrl}\n\n当日はオープンハウス形式です。いつ来ていつ退出しても構いません。\n※本人の体調や機嫌によりスケジュールが変更になる場合がございます。\n\n🎁${cfg.amazonUrl}\n\n${cfg.senderName}より` : `${name}さん、お返事ありがとうございます。\n\n${cfg.senderName}より`; }
  };

  const autoGenDraft = async (rid, name, email, att) => {
    if (!cfg.autoReplyEnabled || !email) return;
    setGenLoading(rid);
    try {
      const body = await genEmail(name, att);
      const subj = att === 'yes' ? `ご出席ありがとうございます🎉 ${cfg.name}の生誕祭` : `お返事ありがとうございます - ${cfg.name}の生誕祭`;
      await addEmailDraft({ id: uid(), rsvpId: rid, name, email, att, body, subject: subj, status: 'draft' });
    } catch {} finally { setGenLoading(null); }
  };

  const openGmail = async (d) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(d.email)}&su=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`, '_blank');
    await updateEmailDraft(d.id, { status: 'sent', sentAt: new Date().toISOString() });
    notify(`${d.name}さんへのメールをGmailで開きました`);
  };

  const regenDraft = async (id) => {
    const d = emailDrafts.find(x => x.id === id); if (!d) return;
    setGenLoading(d.rsvpId);
    try {
      const body = await genEmail(d.name, d.att);
      await updateEmailDraft(id, { body, status: 'draft' });
      notify('再生成しました');
    } catch { notify('失敗'); } finally { setGenLoading(null); }
  };

  const aiTool = async (type) => {
    setAiLoading(true); setAiResult(null);
    const prompts = {
      future: `${cfg.name}ちゃんは今日${age}歳の誕生日。10年後の幸せな未来予想図を温かくユーモラスに300文字程度で日本語で。`,
      speech: `${cfg.name}の${age}歳誕生日会で${cfg.senderName}が述べる挨拶スピーチ原稿を400文字程度で。感謝と愛情が伝わる感動的な内容。`,
    };
    try { setAiResult({ type, text: await callAI(prompts[type]) }); }
    catch { notify('AI生成に失敗'); } finally { setAiLoading(false); }
  };

  /* ─── Actions ─── */
  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  const doLogin = () => {
    if (loginId === cfg.adminId && loginPw === cfg.adminPass) { setIsAdmin(true); setPage('admin'); notify('ログインしました'); }
    else notify('IDまたはパスワードが違います');
  };

  const doRsvp = async () => {
    if (!rName || closed) return;
    const { id: rid, name: n, email: e, att: a } = await submitRsvp({ name: rName, email: rEmail, att: rAtt, msg: rMsg });
    setRName(''); setREmail(''); setRAtt('yes'); setRMsg('');
    setHasRsvped(true);
    go('telegram');
    notify(e && cfg.autoReplyEnabled ? '登録完了！お礼メールを準備中...' : '登録ありがとうございます！');
    if (e && cfg.autoReplyEnabled) autoGenDraft(rid, n, e, a);
  };

  const doMsg = async () => {
    if (!mName || !mText) return;
    await submitMessage({ name: mName, text: mText });
    setMName(''); setMText(''); setShowMsg(false); go('telegram'); notify('メッセージを送信しました');
  };

  const doFiles = async e => { const f = Array.from(e.target.files).slice(0, 10); if (!f.length) return; setUImgs(await Promise.all(f.map(x => compress(x)))); };
  const doUpload = async () => {
    if (!uImgs.length || !uName) return;
    await submitPhotos(uName, uImgs);
    setUName(''); setUImgs([]); setShowUp(false); notify('写真を共有しました');
  };
  const doTopImg = async e => { const f = e.target.files[0]; if (!f) return; const d = await compress(f, 0.5); const url = await uploadImage(d, 'topImage/hero.jpg'); sc({ topImg: url }); notify('更新'); };
  const doLike = (id) => { const p = photos.find(x => x.id === id); if (p) likePhoto(id, p.likes); };

  // Schedule
  const doAddSched = async () => { if (!newSchedTime || !newSchedTitle) return; await addSchedule(newSchedTime, newSchedTitle); setNewSchedTime(''); setNewSchedTitle(''); setShowSchedForm(false); notify('追加'); };
  const startEditSched = (s) => { setEditSchedId(s.id); setEditSchedTime(s.time); setEditSchedTitle(s.title); };
  const saveEditSched = async () => { if (!editSchedTime || !editSchedTitle) return; await updateSchedule(editSchedId, editSchedTime, editSchedTitle); setEditSchedId(null); notify('更新'); };
  const cancelEditSched = () => setEditSchedId(null);

  // News
  const doAddNews = async () => { if (!newNewsTitle) return; await addNews(newNewsTitle, newNewsContent); setNewNewsTitle(''); setNewNewsContent(''); setShowNewsForm(false); notify('追加'); };

  // Export / Import
  const doExport = () => {
    const data = exportAll();
    const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `tomoe_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };
  const doImport = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => { try { await importAll(JSON.parse(ev.target.result)); notify('復元しました'); } catch { notify('無効'); } };
    r.readAsText(f);
  };

  const doBulkMail = () => { const em = rsvps.filter(g => selGuests.includes(g.id) && g.email).map(g => g.email).join(','); if (em) window.location.href = `mailto:${em}?subject=${encodeURIComponent(cfg.name + 'の誕生日会')}`; };
  const copyTxt = t => { navigator.clipboard?.writeText(t); notify('コピーしました'); };

  const draftCt = emailDrafts.filter(d => d.status === 'draft').length;
  const sentCt  = emailDrafts.filter(d => d.status === 'sent').length;

  const guestNavs = [
    { id: 'home', icon: Calendar, l: 'ホーム' },
    { id: 'rsvp', icon: Send, l: '参加表明' },
    { id: 'telegram', icon: Heart, l: 'お祝い電報' },
    { id: 'gallery', icon: Camera, l: '写真館' },
  ];

  const Modal = ({ children, onClose, wide }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-white ${wide ? 'max-w-lg' : 'max-w-md'} w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto`} style={{ borderRadius: T.cr }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 z-10"><X size={18} /></button>
        {children}
      </div>
    </div>
  );

  const isGuestPage = ['home', 'rsvp', 'telegram', 'gallery'].includes(page);

  // ── ローディング画面 ──
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: cfg.color || '#be123c' }} />
          <p className="text-sm text-neutral-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     以下は以前の artifact と同じ JSX（データ操作を hook 経由に変更済み）
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800" style={{ fontFamily: T.font }}>
      {cfg.announcement && (
        <div className="fixed top-0 inset-x-0 z-[50] text-white text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: T.c }}><Bell size={12} className="animate-pulse" />{cfg.announcement}</div>
      )}
      {genLoading && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[50] bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold border"><Loader2 size={14} className="animate-spin" style={{ color: T.c }} /><span className="text-neutral-600">AIメール作成中...</span></div>
      )}

      {/* PC タブナビ */}
      {isGuestPage && (
        <nav className={`hidden md:block fixed top-0 inset-x-0 z-[80] bg-white border-b border-neutral-100 shadow-sm ${cfg.announcement ? 'mt-8' : ''}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
            <span className="text-sm font-semibold" style={{ color: T.c }}>{cfg.name}の生誕祭</span>
            <div className="flex gap-1">{guestNavs.map(n => (
              <button key={n.id} onClick={() => go(n.id)} className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${page === n.id ? 'text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`} style={page === n.id ? { backgroundColor: T.c } : {}}><n.icon size={14} />{n.l}</button>
            ))}</div>
          </div>
        </nav>
      )}

      {/* モバイル ハンバーガー */}
      {isGuestPage && (
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden fixed top-3 right-3 z-[100] w-10 h-10 bg-white/90 backdrop-blur-lg rounded-full shadow-lg flex items-center justify-center border border-neutral-200">
          {menuOpen ? <X size={18} className="text-neutral-700" /> : <Menu size={18} className="text-neutral-700" />}
        </button>
      )}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl flex flex-col" style={{ animation: 'fadeIn .15s ease-out' }}>
            <div className="pt-16 px-6 pb-4"><p className="text-[10px] font-semibold tracking-[.3em] uppercase text-neutral-400 mb-4">MENU</p><nav className="space-y-1">{guestNavs.map(n => (
              <button key={n.id} onClick={() => go(n.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${page === n.id ? 'text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-50'}`} style={page === n.id ? { backgroundColor: T.c } : {}}><n.icon size={16} />{n.l}</button>
            ))}</nav></div>
            <div className="mt-auto p-6 border-t border-neutral-100"><button onClick={() => { if (navigator.share) navigator.share({ title: `${cfg.name}の生誕祭`, url: location.href }); else { navigator.clipboard?.writeText(location.href); notify('URLをコピー'); } setMenuOpen(false); }} className="text-xs text-neutral-400 flex items-center gap-1.5 hover:text-neutral-600"><Share2 size={12} /> サイトをシェア</button></div>
          </div>
        </div>
      )}

      {/* 固定RSVPボタン */}
      {!closed && isGuestPage && page !== 'rsvp' && (
        <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[40]"><button onClick={() => go('rsvp')} className="px-6 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 active:scale-95 transition-transform" style={btnS}><Send size={14} /> 参加を表明する</button></div>
      )}

      <div className={`${cfg.announcement ? 'pt-8' : ''} ${isGuestPage ? 'md:pt-14' : ''} pb-24 md:pb-8`}>

        {/* ═══ HOME ═══ */}
        {page === 'home' && (
          <div className="fin">
            <div className="relative min-h-[92vh] md:min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden bg-white">
              {cfg.topImg ? (<div className="absolute inset-0"><img src={cfg.topImg} className="w-full h-full object-cover opacity-25 scale-105 blur-[1px]" alt="" /><div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-neutral-50" /></div>) : <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]"><Heart size={480} style={{ color: T.c }} /></div>}
              <div className="relative z-10 max-w-xl px-6 text-center">
                <p className="tracking-[.5em] text-[11px] uppercase mb-5 font-medium" style={{ color: T.c + 'aa' }}>{cfg.heroSub}</p>
                <h1 className="text-5xl md:text-8xl font-light text-neutral-900 mb-3 tracking-tight leading-none">{cfg.name}</h1>
                <p className="text-2xl md:text-4xl font-light mb-3 tracking-tight" style={{ color: T.c }}>{age}歳 おめでとう</p>
                <p className="text-sm md:text-base text-neutral-500 mb-10 tracking-wide">{new Date(cfg.eventDate).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => go('rsvp')} className="px-7 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" style={btnS}>参加を表明する</button>

                  <button onClick={() => setShowMsg(true)} className="px-7 py-3.5 text-sm font-semibold bg-white border border-neutral-200 shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2" style={{ borderRadius: T.r, color: T.c }}><MessageSquare size={15} /> お祝いメッセージを送る</button>
                </div>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-neutral-400 sb"><span className="text-[10px] tracking-[.3em] uppercase font-medium">Scroll</span><ChevronDown size={15} /></div>
            </div>

            {news.length > 0 && (<section className="max-w-3xl mx-auto px-5 py-16"><ST title="お知らせ" sub="Updates" /><div className="space-y-3">{news.sort((a, b) => new Date(b.ts) - new Date(a.ts)).map(u => (<div key={u.id} className="bg-white p-5 shadow-sm border border-neutral-100 flex items-start gap-3.5" style={{ borderRadius: T.cr }}><div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: T.c + '10', color: T.c }}><Newspaper size={16} /></div><div><h4 className="font-semibold text-neutral-900 text-sm mb-0.5">{u.title}</h4><p className="text-[13px] text-neutral-500 leading-relaxed">{u.content}</p><time className="text-[10px] text-neutral-300 mt-1 block">{new Date(u.ts).toLocaleDateString('ja-JP')}</time></div></div>))}</div></section>)}

            {sched.length > 0 && (<section className="max-w-3xl mx-auto px-5 py-16"><ST title="当日の流れ" sub="Schedule" /><div className="bg-white p-5 border border-neutral-100 shadow-sm mb-8 text-[13px] text-neutral-600 leading-relaxed" style={{ borderRadius: T.cr }}><p className="mb-2">当日は<span className="font-semibold text-neutral-800">オープンハウス</span>形式です。いつ来ていつ退出されても構いません。ご都合の良い時間帯にお越しください。</p><p className="text-[11px] text-neutral-400">※ 本人の体調や機嫌により、スケジュールが前後したり予告なく中止になる場合がございます。ご了承ください。</p></div><div className="relative ml-3"><div className="absolute left-0 top-1 bottom-1 w-px" style={{ backgroundColor: T.c + '20' }} /><div className="space-y-6">{[...sched].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(s => (<div key={s.id} className="relative pl-7"><div className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[calc(50%-.5px)] ring-[3px] ring-neutral-50" style={{ backgroundColor: T.c }} /><div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-5"><time className="text-lg font-semibold tabular-nums" style={{ color: T.c }}>{s.time}</time><span className="text-neutral-700 font-medium text-[15px]">{s.title}</span></div></div>))}</div></div></section>)}

            <section className="max-w-3xl mx-auto px-5 py-16">
              <div className={`grid grid-cols-1 ${hasRsvped || isAdmin ? 'md:grid-cols-2' : ''} gap-5`}>
                {(hasRsvped || isAdmin) ? (
                  <div className="bg-white shadow-sm border border-neutral-100 overflow-hidden" style={{ borderRadius: T.cr }}><div className="p-6 text-center"><div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: T.c + '08', color: T.c }}><MapPin size={22} /></div><h3 className="text-base font-semibold text-neutral-900 mb-1">会場</h3><p className="text-neutral-600 font-medium text-sm">{cfg.venue}</p><p className="text-neutral-400 text-xs mb-3">{cfg.address}</p><button onClick={() => window.open(mapUrl)} className="text-xs font-semibold hover:underline flex items-center gap-1 mx-auto" style={{ color: T.c }}>大きな地図で見る <ExternalLink size={11} /></button></div><iframe src={mapEmbed} className="w-full h-48 border-0 border-t border-neutral-100" allowFullScreen loading="lazy" title="map" /></div>
                ) : (
                  <div className="bg-white p-6 shadow-sm border border-neutral-100 text-center flex flex-col justify-center" style={{ borderRadius: T.cr }}><div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: T.c + '08', color: T.c }}><MapPin size={22} /></div><h3 className="text-base font-semibold text-neutral-900 mb-1">会場</h3><p className="text-neutral-500 text-xs mb-4">参加表明をしていただくと会場の詳細が表示されます</p><button onClick={() => go('rsvp')} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white text-xs font-semibold shadow-md mx-auto active:scale-95 transition-transform" style={btnS}><Send size={12} /> 参加表明する</button></div>
                )}
                <div className="bg-white p-6 shadow-sm border border-neutral-100 text-center flex flex-col justify-center" style={{ borderRadius: T.cr }}><div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: T.c + '08', color: T.c }}><Gift size={22} /></div><h3 className="text-base font-semibold text-neutral-900 mb-1">ギフトリスト</h3><p className="text-xs text-neutral-500 mb-4">Amazon欲しいものリストより</p><a href={cfg.amazonUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white text-xs font-semibold shadow-md mx-auto active:scale-95 transition-transform" style={btnS}><ExternalLink size={12} /> リストを見る</a></div>
              </div>
            </section>
          </div>
        )}

        {/* ═══ RSVP ═══ */}
        {page === 'rsvp' && (<div className="max-w-md mx-auto px-5 py-16 fin"><ST title="参加表明" sub="RSVP" /><div className="bg-white p-6 shadow-lg border border-neutral-100" style={{ borderRadius: T.cr }}>{closed ? <div className="text-center py-10"><AlertCircle size={36} className="mx-auto text-neutral-300 mb-3" /><h3 className="text-lg font-semibold text-neutral-700">受付は終了しました</h3></div> : (<div className="space-y-4"><Field label="お名前 *"><input key="rsvp-name" className={iCls} placeholder="例: 山田太郎" value={rName} onChange={e => setRName(e.target.value)} /></Field><Field label={<>メールアドレス {cfg.autoReplyEnabled && <span className="text-rose-400 font-normal">（お礼メール送付先）</span>}</>}><input key="rsvp-email" type="email" className={iCls} placeholder="example@mail.com" value={rEmail} onChange={e => setREmail(e.target.value)} />{cfg.autoReplyEnabled && <p className="text-[10px] text-neutral-400 mt-1">✉️ AIが作成したお礼メールが届きます</p>}</Field><Field label="出欠"><div className="grid grid-cols-2 gap-2">{['yes', 'no'].map(v => (<button key={v} onClick={() => setRAtt(v)} className={`py-2.5 text-sm font-semibold border-2 rounded-lg transition-all ${rAtt === v ? 'text-white shadow-md' : 'bg-white text-neutral-400 border-neutral-100'}`} style={rAtt === v ? { backgroundColor: T.c, borderColor: T.c } : {}}>{v === 'yes' ? '🎉 出席します' : '😢 欠席します'}</button>))}</div></Field><Field label={<span className="flex items-center gap-2">メッセージ（任意）<Tip text="AIが文章を整えてくれます" />{rMsg && <button onClick={refineMsg} disabled={aiRefining} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-40">{aiRefining ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />} AI校正</button>}</span>}><textarea key="rsvp-msg" className={iCls + " h-24 resize-none"} placeholder="お祝いメッセージ..." value={rMsg} onChange={e => setRMsg(e.target.value)} /></Field><button onClick={doRsvp} disabled={!rName} className="w-full py-3 text-sm font-semibold shadow-lg disabled:opacity-40 active:scale-[0.98] transition-all" style={btnS}>回答を送信</button></div>)}</div></div>)}

        {/* ═══ TELEGRAMS ═══ */}
        {page === 'telegram' && (<div className="max-w-3xl mx-auto px-5 py-16 fin"><ST title="皆様からのメッセージ" sub="Telegrams" /><div className="flex justify-center mb-8"><button onClick={() => setShowMsg(true)} className="px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95" style={btnS}><Plus size={13} /> メッセージを送る</button></div>{msgs.length === 0 ? <p className="text-center text-neutral-300 py-14 italic text-sm">メッセージを待っています...</p> : (<div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">{[...msgs].sort((a, b) => new Date(b.ts) - new Date(a.ts)).map(m => (<div key={m.id} className="break-inside-avoid bg-white p-5 shadow-sm border border-neutral-100 relative group" style={{ borderRadius: T.cr }}><Quote className="absolute top-3 right-3 opacity-[.06]" size={28} style={{ color: T.c }} /><p className="text-neutral-600 leading-relaxed mb-3 text-[13px] italic">"{m.text}"</p><div className="flex items-center justify-between border-t border-neutral-50 pt-2.5"><span className="text-xs font-semibold" style={{ color: T.c }}>{m.name} 様</span>{isAdmin && <button onClick={() => deleteMessage(m.id)} className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>}</div></div>))}</div>)}</div>)}

        {/* ═══ GALLERY ═══ */}
        {page === 'gallery' && (<div className="max-w-4xl mx-auto px-5 py-16 fin"><ST title="思い出の写真館" sub="Gallery" /><div className="flex justify-center gap-3 mb-8"><button onClick={() => slideItems.length > 0 && setSlide(0)} className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95" style={{ borderRadius: T.r }}><Play size={13} /> スライドショー</button><button onClick={() => setShowUp(true)} className="px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95" style={btnS}><Plus size={13} /> 写真を投稿</button></div>{photos.length === 0 ? <p className="text-center text-neutral-300 py-14 italic text-sm">まだ写真がありません</p> : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{[...photos].sort((a, b) => new Date(b.ts) - new Date(a.ts)).map(p => (<div key={p.id} className="aspect-square bg-white p-1 shadow-sm border border-neutral-100 overflow-hidden group relative" style={{ borderRadius: T.cr }}><img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ borderRadius: `calc(${T.cr} - 4px)` }} /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"><span className="text-white text-[10px] font-medium mb-1.5 truncate">by {p.uploader}</span><div className="flex justify-between items-center"><button onClick={() => doLike(p.id)} className="text-rose-400 flex items-center gap-1 text-xs font-semibold"><Heart size={12} fill={p.likes > 0 ? 'currentColor' : 'none'} /> {p.likes || 0}</button>{isAdmin && <button onClick={() => deletePhoto(p.id)} className="text-white/50 hover:text-red-400"><Trash2 size={12} /></button>}</div></div></div>))}</div>)}</div>)}

        {/* ═══ ADMIN ═══ */}
        {page === 'media' && (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 py-16 px-5">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: cfg.themeColor || '#e11d48' }}>
            メディア
          </h1>
          <p className="text-sm text-neutral-500">Tomoeちゃんの思い出と楽曲</p>
        </div>

        {/* 楽曲セクション */}
        {cfg.media?.songs && cfg.media.songs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-6 text-neutral-800">楽曲</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {cfg.media.songs.map((song, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4 text-neutral-800">{song.title}</h3>
                  {song.type === 'suno' && (
                    <iframe
                      src={song.url.replace('/song/', '/embed/')}
                      className="w-full h-48 rounded-lg"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 楽譜セクション */}
        {cfg.media?.scores && cfg.media.scores.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-6 text-neutral-800">楽譜</h2>
            <div className="grid gap-6">
              {cfg.media.scores.map((score, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4 text-neutral-800">{score.title}</h3>
                  <iframe
                    src={score.url}
                    className="w-full h-[600px] rounded-lg"
                    frameBorder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* タイムラインセクション */}
        {cfg.media?.timeline && cfg.media.timeline.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-6 text-neutral-800">成長の記録</h2>
            <div className="space-y-8">
              {[...cfg.media.timeline].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-24 text-right">
                    <div className="text-sm font-medium text-neutral-600">
                      {new Date(event.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.themeColor || '#e11d48' }} />
                  </div>
                  <div className="flex-1 pb-8 border-b border-neutral-100">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full max-w-md h-48 object-cover rounded-lg mb-4 shadow-md"
                      />
                    )}
                    <h3 className="text-lg font-medium mb-2 text-neutral-800">{event.title}</h3>
                    <p className="text-sm text-neutral-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 戻るボタン */}
        <div className="text-center mt-12">
          <button
            onClick={() => go('home')}
            className="px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-full"
            style={{ backgroundColor: cfg.themeColor || '#e11d48', color: 'white' }}
          >
            ← トップへ戻る
          </button>
        </div>
      </div>
    </div>
  )}

    {page === 'admin' && (<div className="max-w-3xl mx-auto px-5 py-10 fin">{!isAdmin ? (<div className="max-w-xs mx-auto pt-8"><ST title="管理画面" sub="CMS Login" /><div className="bg-white p-7 shadow-lg border border-neutral-100" style={{ borderRadius: T.cr }}><div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center mx-auto mb-5"><Lock size={20} className="text-neutral-400" /></div><div className="space-y-3"><input className={iCls} placeholder="Admin ID" value={loginId} onChange={e => setLoginId(e.target.value)} /><input className={iCls} type="password" placeholder="Password" value={loginPw} onChange={e => setLoginPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} /><button onClick={doLogin} className="w-full py-3 text-sm font-semibold shadow-lg active:scale-[0.98]" style={btnS}>ログイン</button></div></div><button onClick={() => go('home')} className="text-xs text-neutral-400 mt-4 mx-auto block hover:text-neutral-600">← トップへ戻る</button></div>) : (<div className="space-y-5">
          <div className="bg-white p-4 border border-neutral-100 shadow-sm flex flex-col gap-3" style={{ borderRadius: T.cr }}><div className="flex justify-between items-center"><h2 className="text-base font-semibold text-neutral-900">管理パネル</h2><div className="flex items-center gap-2"><button onClick={() => go('home')} className="text-xs text-neutral-400 hover:text-neutral-600">トップへ</button><button onClick={() => { setIsAdmin(false); go('home'); }} className="text-neutral-300 hover:text-neutral-500"><Unlock size={16} /></button></div></div><div className="flex gap-1 overflow-x-auto pb-1 flex-wrap">{[{ id: 'settings', icon: Settings, l: '基本' },{ id: 'design', icon: Palette, l: 'デザイン' },{ id: 'email', icon: Sparkles, l: '自動返信', badge: draftCt },{ id: 'schedule', icon: ListTodo, l: 'スケジュール' },{ id: 'updates', icon: Newspaper, l: 'お知らせ' },{ id: 'guests', icon: Users, l: 'ゲスト' },{ id: 'aitools', icon: Wand2, l: 'AI Tools' },{ id: 'data', icon: Database, l: 'データ' }].map(t => (<button key={t.id} onClick={() => setATab(t.id)} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap rounded-md transition-all ${aTab === t.id ? 'text-white shadow-md' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`} style={aTab === t.id ? { backgroundColor: T.c } : {}}><t.icon size={12} />{t.l}{t.badge > 0 && <span className="ml-0.5 bg-amber-400 text-amber-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>}</button>))}</div></div>

          {/* Admin tabs content — 同じ構造、操作は hook 経由 */}
          {aTab === 'settings' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><h3 className="font-semibold text-neutral-900 mb-5 text-sm">基本設定</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="space-y-3"><Field label="主役の名前"><input className={iCls} value={cfg.name} onChange={e => sc({ name: e.target.value })} /></Field><Field label="会場名"><input className={iCls} value={cfg.venue} onChange={e => sc({ venue: e.target.value })} /></Field><Field label="詳細住所"><input className={iCls} value={cfg.address} onChange={e => sc({ address: e.target.value })} /></Field><Field label="Amazon URL"><input className={iCls} value={cfg.amazonUrl} onChange={e => sc({ amazonUrl: e.target.value })} /></Field></div><div className="space-y-3"><div className="grid grid-cols-2 gap-2"><Field label="生年月日"><input type="date" className={iCls} value={cfg.birthDate} onChange={e => sc({ birthDate: e.target.value })} /></Field><Field label="イベント日"><input type="date" className={iCls} value={cfg.eventDate} onChange={e => sc({ eventDate: e.target.value })} /></Field></div><Field label="RSVP締切日"><input type="date" className={iCls} value={cfg.rsvpDeadline} onChange={e => sc({ rsvpDeadline: e.target.value })} /></Field><Field label="告知バナー"><input className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-200/60 text-sm rounded-lg focus:outline-none" placeholder="空欄で非表示" value={cfg.announcement} onChange={e => sc({ announcement: e.target.value })} /></Field><Field label="サブタイトル"><input className={iCls} value={cfg.heroSub} onChange={e => sc({ heroSub: e.target.value })} /></Field></div></div></div>)}

          {aTab === 'design' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><h3 className="font-semibold text-neutral-900 mb-5 text-sm">デザイン</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-5"><Field label="テーマカラー"><div className="flex items-center gap-3"><input type="color" className="w-10 h-10 cursor-pointer rounded-lg border-0" value={cfg.color} onChange={e => sc({ color: e.target.value })} /><span className="font-mono text-sm font-semibold" style={{ color: T.c }}>{cfg.color}</span></div></Field><Field label="スタイル"><div className="grid grid-cols-3 gap-2">{[{ id: 'elegant', l: 'エレガント', d: '明朝体' }, { id: 'modern', l: 'モダン', d: 'ゴシック' }, { id: 'playful', l: 'ポップ', d: '丸文字' }].map(s => (<button key={s.id} onClick={() => sc({ style: s.id })} className={`py-2.5 px-2 text-center border-2 rounded-lg transition-all ${cfg.style === s.id ? '' : 'border-neutral-100 text-neutral-400'}`} style={cfg.style === s.id ? { borderColor: T.c, backgroundColor: T.c + '08', color: T.c } : {}}><div className="text-[11px] font-bold">{s.l}</div><div className="text-[9px] opacity-60">{s.d}</div></button>))}</div></Field></div><Field label="トップ画像"><div onClick={() => topRef.current?.click()} className="w-full aspect-video bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer overflow-hidden rounded-lg">{cfg.topImg ? <img src={cfg.topImg} className="w-full h-full object-cover" alt="" /> : <div className="text-neutral-300 flex flex-col items-center gap-1.5"><Camera size={28} /><span className="text-[11px]">クリック</span></div>}<input ref={topRef} type="file" accept="image/*" onChange={doTopImg} className="hidden" /></div>{cfg.topImg && <button onClick={() => sc({ topImg: '' })} className="text-[11px] text-red-400 mt-1">削除</button>}</Field><Field label="メディアページ"><div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg mb-3"><span className="text-sm font-semibold text-neutral-800">メディアページを表示</span><button onClick={() => sc({ showMediaPage: !cfg.showMediaPage })} className={`w-12 h-7 rounded-full transition-all relative ${cfg.showMediaPage ? '' : 'bg-neutral-200'}`} style={cfg.showMediaPage ? { backgroundColor: T.c } : {}}><div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${cfg.showMediaPage ? 'left-6' : 'left-1'}`} /></button></div>{cfg.showMediaPage && <button onClick={() => go('media')} className="w-full py-2.5 text-sm font-semibold bg-white border border-neutral-200 shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 rounded-lg" style={{ color: T.c }}><Eye size={14} /> メディアページをプレビュー</button>}</Field></div></div>)}

          {aTab === 'email' && (<div className="space-y-5"><div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><div className="flex items-center gap-2 mb-4"><Sparkles size={16} style={{ color: T.c }} /><h3 className="font-semibold text-neutral-900 text-sm">AI自動返信メール</h3><Tip text="オープンハウス案内・スケジュール注意事項も自動で含まれます" /></div><div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg mb-4"><span className="text-sm font-semibold text-neutral-800">自動返信を有効にする</span><button onClick={() => sc({ autoReplyEnabled: !cfg.autoReplyEnabled })} className={`w-12 h-7 rounded-full transition-all relative ${cfg.autoReplyEnabled ? '' : 'bg-neutral-200'}`} style={cfg.autoReplyEnabled ? { backgroundColor: T.c } : {}}><div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${cfg.autoReplyEnabled ? 'left-6' : 'left-1'}`} /></button></div><div className="flex gap-3 items-end"><div className="flex-1"><Field label="差出人名"><input className={iCls} value={cfg.senderName} onChange={e => sc({ senderName: e.target.value })} /></Field></div><button onClick={async () => { setGenLoading('test'); const body = await genEmail('テスト太郎', 'yes'); setPreviewDraft({ id: 'test', name: 'テスト太郎', email: 'test@example.com', subject: `ご出席ありがとうございます🎉`, body, att: 'yes' }); setGenLoading(null); }} disabled={!!genLoading} className="px-4 py-2.5 text-[11px] font-semibold shadow-md disabled:opacity-50 flex items-center gap-1 shrink-0" style={btnS}>{genLoading === 'test' ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />} プレビュー</button></div></div><div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-neutral-900 text-sm">返信メール一覧 <span className="text-xs font-normal">{draftCt > 0 && <span className="text-amber-600">{draftCt}件未送信</span>}{sentCt > 0 && <span className="text-emerald-600 ml-1">{sentCt}件済</span>}</span></h3>{draftCt > 0 && <button onClick={() => emailDrafts.filter(d => d.status === 'draft').forEach((d, i) => setTimeout(() => openGmail(d), i * 800))} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold shadow-md" style={btnS}><Mail size={12} /> 一括送信</button>}</div>{emailDrafts.length === 0 ? <div className="text-center py-8"><MailOpen size={32} className="mx-auto text-neutral-200 mb-2" /><p className="text-sm text-neutral-400">RSVPが届くとAIがメールを作成</p></div> : (<div className="space-y-3">{[...emailDrafts].sort((a, b) => new Date(b.ts) - new Date(a.ts)).map(d => (<div key={d.id} className={`p-4 rounded-lg border ${d.status === 'sent' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-neutral-100 shadow-sm'}`}><div className="flex items-center justify-between mb-2 flex-wrap gap-1"><div className="flex items-center gap-2 flex-wrap">{d.status === 'sent' ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Mail size={15} style={{ color: T.c }} />}<span className="text-sm font-semibold">{d.name}</span><span className="text-[10px] text-neutral-400">{d.email}</span><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${d.att === 'yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{d.att === 'yes' ? '出席' : '欠席'}</span></div><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${d.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status === 'sent' ? '送信済' : '未送信'}</span></div><p className="text-[12px] text-neutral-500 leading-relaxed mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.body}</p><div className="flex items-center gap-1.5 flex-wrap">{d.status === 'draft' && <button onClick={() => openGmail(d)} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white rounded-md bg-blue-600 shadow-md"><Mail size={11} /> Gmail</button>}<button onClick={() => setPreviewDraft(d)} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 text-neutral-600 rounded-md"><Eye size={11} /></button><button onClick={() => regenDraft(d.id)} disabled={!!genLoading} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 text-neutral-600 rounded-md disabled:opacity-30">{genLoading === d.rsvpId ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}</button><button onClick={() => copyTxt(d.body)} className="px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 text-neutral-600 rounded-md"><Copy size={11} /></button><button onClick={() => deleteEmailDraft(d.id)} className="text-neutral-300 hover:text-red-500 ml-auto"><Trash2 size={12} /></button></div></div>))}</div>)}</div></div>)}

          {aTab === 'schedule' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><div className="flex justify-between items-center mb-5"><h3 className="font-semibold text-neutral-900 text-sm">スケジュール</h3><button onClick={() => setShowSchedForm(!showSchedForm)} className="px-3 py-1.5 text-[11px] font-semibold shadow-md active:scale-95" style={btnS}>{showSchedForm ? '× 閉じる' : '+ 追加'}</button></div>{showSchedForm && (<div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg mb-4 space-y-3"><div className="grid grid-cols-3 gap-2"><Field label="時間"><input className={iCls} placeholder="14:00" value={newSchedTime} onChange={e => setNewSchedTime(e.target.value)} /></Field><div className="col-span-2"><Field label="内容"><input className={iCls} placeholder="イベント名" value={newSchedTitle} onChange={e => setNewSchedTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && doAddSched()} /></Field></div></div><button onClick={doAddSched} disabled={!newSchedTime || !newSchedTitle} className="px-4 py-2 text-[11px] font-semibold shadow-md disabled:opacity-40 active:scale-95" style={btnS}>追加する</button></div>)}<div className="space-y-2">{[...sched].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(s => (<div key={s.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-lg">{editSchedId === s.id ? (<div className="space-y-2"><div className="grid grid-cols-3 gap-2"><input className={iCls} value={editSchedTime} onChange={e => setEditSchedTime(e.target.value)} /><input className={iCls + " col-span-2"} value={editSchedTitle} onChange={e => setEditSchedTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEditSched()} /></div><div className="flex gap-2"><button onClick={saveEditSched} disabled={!editSchedTime || !editSchedTitle} className="px-3 py-1.5 text-[11px] font-semibold text-white rounded-md shadow-sm disabled:opacity-40" style={{ backgroundColor: T.c }}>保存</button><button onClick={cancelEditSched} className="px-3 py-1.5 text-[11px] font-semibold bg-neutral-200 text-neutral-600 rounded-md">キャンセル</button></div></div>) : (<div className="flex items-center justify-between"><div className="flex items-center gap-4"><span className="font-semibold tabular-nums" style={{ color: T.c }}>{s.time}</span><span className="text-sm text-neutral-700">{s.title}</span></div><div className="flex items-center gap-1.5"><button onClick={() => startEditSched(s)} className="text-neutral-300 hover:text-blue-500"><Pencil size={13} /></button><button onClick={() => deleteSchedule(s.id)} className="text-neutral-300 hover:text-red-500"><Trash2 size={13} /></button></div></div>)}</div>))}{!sched.length && <p className="text-center text-neutral-300 py-6 text-sm">未設定</p>}</div></div>)}

          {aTab === 'updates' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><div className="flex justify-between items-center mb-5"><h3 className="font-semibold text-neutral-900 text-sm">お知らせ</h3><button onClick={() => setShowNewsForm(!showNewsForm)} className="px-3 py-1.5 text-[11px] font-semibold shadow-md active:scale-95" style={btnS}>{showNewsForm ? '× 閉じる' : '+ 投稿'}</button></div>{showNewsForm && (<div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg mb-4 space-y-3"><Field label="タイトル *"><input className={iCls} placeholder="タイトル" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} /></Field><Field label="内容"><textarea className={iCls + " h-20 resize-none"} placeholder="詳細" value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} /></Field><button onClick={doAddNews} disabled={!newNewsTitle} className="px-4 py-2 text-[11px] font-semibold shadow-md disabled:opacity-40 active:scale-95" style={btnS}>投稿する</button></div>)}<div className="space-y-2">{[...news].sort((a, b) => new Date(b.ts) - new Date(a.ts)).map(u => (<div key={u.id} className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg flex justify-between items-start"><div><h4 className="font-semibold text-neutral-900 text-sm mb-0.5">{u.title}</h4><p className="text-[13px] text-neutral-500">{u.content}</p></div><button onClick={() => deleteNews(u.id)} className="text-neutral-300 hover:text-red-500 shrink-0"><Trash2 size={14} /></button></div>))}{!news.length && <p className="text-center text-neutral-300 py-6 text-sm">未設定</p>}</div></div>)}

          {aTab === 'guests' && (<div className="bg-white border border-neutral-100 shadow-sm overflow-hidden" style={{ borderRadius: T.cr }}><div className="p-5 border-b border-neutral-100 flex justify-between items-center"><h3 className="font-semibold text-neutral-900 text-sm">ゲスト ({rsvps.length})</h3><button onClick={doBulkMail} disabled={!selGuests.length} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-md disabled:opacity-20 shadow-md flex items-center gap-1"><Mail size={12} /> 一括メール</button></div>{!rsvps.length ? <p className="text-center text-neutral-300 py-10 text-sm">まだ登録なし</p> : (<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-[10px] text-neutral-400 font-semibold uppercase"><tr><th className="px-3 py-2 text-center w-8"><input type="checkbox" checked={selGuests.length === rsvps.length} onChange={() => setSelGuests(selGuests.length === rsvps.length ? [] : rsvps.map(g => g.id))} /></th><th className="px-3 py-2">名前</th><th className="px-3 py-2">メール</th><th className="px-3 py-2 text-center">出欠</th><th className="px-3 py-2 text-center">返信</th><th className="px-3 py-2 w-8"></th></tr></thead><tbody className="divide-y divide-neutral-50">{rsvps.map(g => { const dr = emailDrafts.find(d => d.rsvpId === g.id); return (<tr key={g.id} className="hover:bg-neutral-50/50"><td className="px-3 py-2 text-center"><input type="checkbox" checked={selGuests.includes(g.id)} onChange={() => setSelGuests(p => p.includes(g.id) ? p.filter(i => i !== g.id) : [...p, g.id])} /></td><td className="px-3 py-2 font-medium">{g.name}</td><td className="px-3 py-2 text-neutral-400 text-xs">{g.email || '—'}</td><td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${g.att === 'yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{g.att === 'yes' ? '出席' : '欠席'}</span></td><td className="px-3 py-2 text-center">{dr?.status === 'sent' ? <CheckCircle2 size={13} className="text-emerald-500 mx-auto" /> : dr?.status === 'draft' ? <button onClick={() => setATab('email')} className="text-amber-500 text-[10px] font-semibold">未送信</button> : <span className="text-neutral-200">—</span>}</td><td className="px-3 py-2 text-center"><button onClick={() => deleteRsvp(g.id)} className="text-neutral-300 hover:text-red-500"><Trash2 size={12} /></button></td></tr>); })}</tbody></table></div>)}</div>)}

          {aTab === 'aitools' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm" style={{ borderRadius: T.cr }}><div className="flex items-center gap-2 mb-5"><Wand2 size={16} style={{ color: T.c }} /><h3 className="font-semibold text-neutral-900 text-sm">AI Tools</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"><button onClick={() => aiTool('future')} disabled={aiLoading} className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg text-left hover:shadow-md disabled:opacity-50"><div className="text-2xl mb-2">🔮</div><h4 className="text-sm font-semibold text-purple-900 mb-1">10年後の未来予想</h4><p className="text-[11px] text-purple-600/70">{cfg.name}ちゃんのハッピーな未来</p></button><button onClick={() => aiTool('speech')} disabled={aiLoading} className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg text-left hover:shadow-md disabled:opacity-50"><div className="text-2xl mb-2">🎤</div><h4 className="text-sm font-semibold text-amber-900 mb-1">スピーチ原稿作成</h4><p className="text-[11px] text-amber-600/70">感動的な挨拶案</p></button></div>{aiLoading && <div className="flex items-center justify-center gap-2 py-8"><Loader2 size={20} className="animate-spin" style={{ color: T.c }} /><span className="text-sm text-neutral-500">AIが考え中...</span></div>}{aiResult && !aiLoading && (<div className="p-5 bg-neutral-50 border border-neutral-100 rounded-lg"><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold">{aiResult.type === 'future' ? '🔮 未来予想' : '🎤 スピーチ原稿'}</h4><button onClick={() => copyTxt(aiResult.text)} className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold bg-white rounded-md border text-neutral-500"><Copy size={11} /> コピー</button></div><pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">{aiResult.text}</pre></div>)}</div>)}

          {aTab === 'data' && (<div className="bg-white p-6 border border-neutral-100 shadow-sm text-center" style={{ borderRadius: T.cr }}><h3 className="font-semibold text-neutral-900 mb-6 text-sm">データ管理</h3><div className="grid grid-cols-2 gap-3 max-w-sm mx-auto"><button onClick={doExport} className="flex flex-col items-center gap-2 p-6 bg-neutral-50 border border-neutral-100 rounded-lg hover:bg-emerald-50 hover:border-emerald-100 transition-all group"><Download size={28} className="text-neutral-300 group-hover:text-emerald-600" /><span className="text-[11px] font-semibold">エクスポート</span></button><button onClick={() => impRef.current?.click()} className="flex flex-col items-center gap-2 p-6 bg-neutral-50 border border-neutral-100 rounded-lg hover:bg-blue-50 hover:border-blue-100 transition-all group"><FileUp size={28} className="text-neutral-300 group-hover:text-blue-600" /><span className="text-[11px] font-semibold">インポート</span><input ref={impRef} type="file" accept=".json" onChange={doImport} className="hidden" /></button></div></div>)}
        </div>)}</div>)}
      </div>

      {/* Footer */}
      {isGuestPage && (<footer className="bg-white border-t border-neutral-100 py-8 px-6 text-center"><p className="text-xs text-neutral-300 mb-3">{cfg.name}の{age}歳 生誕祭 🎂</p><button onClick={() => go('admin')} className="text-[10px] text-neutral-300 hover:text-neutral-500 flex items-center gap-1 mx-auto"><Lock size={10} /> 管理者ログイン</button></footer>)}

      {/* Modals */}
      {showUp && <Modal onClose={() => { setShowUp(false); setUImgs([]); setUName(''); }}><h3 className="text-lg font-semibold text-neutral-900 mb-4">写真を投稿</h3><div className="space-y-4"><div onClick={() => fileRef.current?.click()} className="w-full aspect-[16/10] bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer overflow-hidden rounded-lg">{uImgs.length ? <div className="grid grid-cols-3 gap-1 p-2 w-full h-full overflow-y-auto">{uImgs.map((p, i) => <img key={i} src={p} className="w-full h-16 object-cover rounded" alt="" />)}</div> : <div className="text-neutral-300 flex flex-col items-center gap-1.5"><Upload size={28} /><span className="text-[11px]">最大10枚</span></div>}<input ref={fileRef} type="file" accept="image/*" multiple onChange={doFiles} className="hidden" /></div><input className={iCls + " text-center font-medium"} placeholder="投稿者のお名前" value={uName} onChange={e => setUName(e.target.value)} /><button onClick={doUpload} disabled={!uImgs.length || !uName} className="w-full py-3 text-sm font-semibold shadow-lg disabled:opacity-40 active:scale-[0.98]" style={btnS}>アップロード</button></div></Modal>}

      {showMsg && <Modal onClose={() => setShowMsg(false)}><h3 className="text-lg font-semibold text-neutral-900 mb-0.5">お祝いメッセージ</h3><p className="text-[11px] text-neutral-400 mb-5">{cfg.name}ちゃんへ心を込めて</p><div className="space-y-4"><input className={iCls + " font-medium"} placeholder="お名前" value={mName} onChange={e => setMName(e.target.value)} /><textarea className={iCls + " h-28 resize-none"} placeholder="メッセージ..." value={mText} onChange={e => setMText(e.target.value)} /><button onClick={doMsg} disabled={!mName || !mText} className="w-full py-3 text-sm font-semibold shadow-lg disabled:opacity-40 active:scale-[0.98]" style={btnS}>送信</button></div></Modal>}

      {previewDraft && <Modal onClose={() => setPreviewDraft(null)} wide><div className="flex items-center gap-2 mb-4"><Sparkles size={16} style={{ color: T.c }} /><h3 className="text-lg font-semibold">AIメール プレビュー</h3></div><div className="space-y-1.5 mb-4 text-xs"><div className="flex gap-2"><span className="font-semibold text-neutral-500 w-10">To:</span><span>{previewDraft.name} &lt;{previewDraft.email}&gt;</span></div><div className="flex gap-2"><span className="font-semibold text-neutral-500 w-10">件名:</span><span>{previewDraft.subject}</span></div><div className="flex gap-2"><span className="font-semibold text-neutral-500 w-10">From:</span><span>{cfg.senderName}</span></div></div><div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 mb-4"><pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">{previewDraft.body}</pre></div><div className="flex gap-2 justify-end"><button onClick={() => copyTxt(previewDraft.body)} className="flex items-center gap-1 px-3 py-2 text-[11px] font-semibold bg-neutral-100 text-neutral-600 rounded-md"><Copy size={12} /> コピー</button>{previewDraft.id !== 'test' && previewDraft.status !== 'sent' && <button onClick={() => { openGmail(previewDraft); setPreviewDraft(null); }} className="flex items-center gap-1 px-3 py-2 text-[11px] font-semibold text-white rounded-md bg-blue-600 shadow-md"><Mail size={12} /> Gmail送信</button>}</div></Modal>}

      {slide >= 0 && slideItems.length > 0 && (<div className="fixed inset-0 bg-black z-[250] flex items-center justify-center"><button onClick={() => setSlide(-1)} className="absolute top-5 right-5 text-white/30 hover:text-white z-10"><X size={32} /></button>{slideItems.map((item, i) => (<div key={item.id || i} className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-[1500ms] ${i === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>{item._t === 'img' ? <div className="text-center"><img src={item.url} alt="" className="max-w-[88vw] max-h-[72vh] object-contain rounded-xl shadow-2xl" /><p className="mt-4 text-white/40 text-sm italic">by {item.uploader}</p></div> : <div className="max-w-2xl w-full text-center px-6"><Quote size={48} className="mx-auto mb-5 text-white/10" /><p className="text-2xl md:text-4xl font-light text-white leading-relaxed mb-6 italic">"{item.text}"</p><div className="w-12 h-px mx-auto mb-3" style={{ backgroundColor: T.c }} /><p className="text-white/40">{item.name} 様</p></div>}</div>))}<div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">{slideItems.slice(0, 20).map((_, i) => (<button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === slide % 20 ? 'w-7' : 'w-1.5 bg-white/15'}`} style={i === slide % 20 ? { backgroundColor: T.c } : {}} />))}</div></div>)}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
