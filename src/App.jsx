// src/App.jsx - 完全版（多言語対応）
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Heart, Calendar, MapPin, Camera, Send, Users, Gift, Play,
  X, Plus, MessageSquare, Quote, Settings, Lock, Unlock,
  ExternalLink, Mail, Trash2, Upload, Download, Bell,
  AlertCircle, Share2, ChevronDown, Palette, HelpCircle,
  Database, Newspaper, ListTodo, Layout, FileUp, Check,
  Sparkles, Loader2, CheckCircle2, Eye,
  MailOpen, RefreshCw, Copy, Menu, Wand2, Pencil, Globe
} from 'lucide-react';
import { useFirestore } from './hooks/useFirestore';

/* ─── 翻訳データ ─── */
const translations = {
  ja: {
    nav_home: 'ホーム',
    nav_rsvp: '参加表明',
    nav_telegram: 'お祝い電報',
    nav_gallery: '写真館',
    nav_media: 'メディア',
    birthday_congrats: '歳 おめでとう',
    rsvp_button: '参加を表明する',
    send_message: 'お祝いメッセージを送る',
    scroll: 'Scroll',
    updates: 'お知らせ',
    schedule: '当日の流れ',
    schedule_note: '当日はオープンハウス形式です。いつ来ていつ退出されても構いません。ご都合の良い時間帯にお越しください。',
    schedule_caution: '※ 本人の体調や機嫌により、スケジュールが前後したり予告なく中止になる場合がございます。ご了承ください。',
    venue: '会場',
    venue_locked: '参加表明をしていただくと会場の詳細が表示されます',
    view_map: '大きな地図で見る',
    gift_list: 'ギフトリスト',
    gift_desc: 'Amazon欲しいものリストより',
    view_list: 'リストを見る',
    rsvp_title: '参加表明',
    rsvp_closed: '受付は終了しました',
    name_required: 'お名前 *',
    name_placeholder: '例: 山田太郎',
    email_label: 'メールアドレス',
    email_thank_you: '（お礼メール送付先）',
    email_placeholder: 'example@mail.com',
    email_ai_note: '✉️ AIが作成したお礼メールが届きます',
    attendance: '出欠',
    attend_yes: '🎉 出席します',
    attend_no: '😢 欠席します',
    message_optional: 'メッセージ（任意）',
    message_placeholder: 'お祝いメッセージ...',
    ai_refine: 'AI校正',
    ai_tip: 'AIが文章を整えてくれます',
    submit: '回答を送信',
    telegrams_title: '皆様からのメッセージ',
    send_telegram: 'メッセージを送る',
    waiting_messages: 'メッセージを待っています...',
    gallery_title: '思い出の写真館',
    slideshow: 'スライドショー',
    upload_photo: '写真を投稿',
    no_photos: 'まだ写真がありません',
    media_title: 'メディア',
    media_subtitle: 'Tomoeちゃんの思い出と楽曲',
    songs: '楽曲',
    scores: '楽譜',
    timeline: '成長の記録',
    back_to_top: '← トップへ戻る',
    message_modal_title: 'お祝いメッセージ',
    message_modal_subtitle: 'ちゃんへ心を込めて',
    upload_modal_title: '写真を投稿',
    uploader_name: '投稿者のお名前',
    upload_button: 'アップロード',
    max_photos: '最大10枚',
    admin_login: '管理画面',
    admin_id: 'Admin ID',
    password: 'Password',
    login: 'ログイン',
    admin_panel: '管理パネル',
    login_success: 'ログインしました',
    login_failed: 'IDまたはパスワードが違います',
    rsvp_success: '登録ありがとうございます！',
    rsvp_ai_preparing: '登録完了！お礼メールを準備中...',
    message_sent: 'メッセージを送信しました',
    photo_shared: '写真を共有しました',
    ai_refined: 'AIが文章を整えました ✨',
    ai_failed: 'AI校正に失敗',
    copied: 'コピーしました',
    url_copied: 'URLをコピー',
    admin_login_link: '管理者ログイン',
    share_site: 'サイトをシェア',
    birthday_party: '歳 生誕祭 🎂',
    loading: '読み込み中...',
    creating_email: 'AIメール作成中...',
  },
  en: {
    nav_home: 'Home',
    nav_rsvp: 'RSVP',
    nav_telegram: 'Messages',
    nav_gallery: 'Gallery',
    nav_media: 'Media',
    birthday_congrats: 'years old',
    rsvp_button: 'RSVP Now',
    send_message: 'Send Message',
    scroll: 'Scroll',
    updates: 'Updates',
    schedule: 'Schedule',
    schedule_note: 'This is an open house format. You can arrive and leave at your convenience.',
    schedule_caution: '* Schedule may change due to the birthday child\'s condition.',
    venue: 'Venue',
    venue_locked: 'Venue details will be shown after RSVP',
    view_map: 'View on Map',
    gift_list: 'Gift Registry',
    gift_desc: 'Amazon Wishlist',
    view_list: 'View List',
    rsvp_title: 'RSVP',
    rsvp_closed: 'RSVP is now closed',
    name_required: 'Name *',
    name_placeholder: 'e.g. John Smith',
    email_label: 'Email',
    email_thank_you: '(for thank you email)',
    email_placeholder: 'example@mail.com',
    email_ai_note: '✉️ You\'ll receive an AI-generated thank you email',
    attendance: 'Attendance',
    attend_yes: '🎉 I will attend',
    attend_no: '😢 I cannot attend',
    message_optional: 'Message (optional)',
    message_placeholder: 'Your message...',
    ai_refine: 'AI Polish',
    ai_tip: 'AI will refine your message',
    submit: 'Submit',
    telegrams_title: 'Messages from Guests',
    send_telegram: 'Send Message',
    waiting_messages: 'Waiting for messages...',
    gallery_title: 'Photo Gallery',
    slideshow: 'Slideshow',
    upload_photo: 'Upload Photo',
    no_photos: 'No photos yet',
    media_title: 'Media',
    media_subtitle: 'Memories and Songs',
    songs: 'Songs',
    scores: 'Sheet Music',
    timeline: 'Growth Timeline',
    back_to_top: '← Back to Top',
    message_modal_title: 'Send Message',
    message_modal_subtitle: 'With love',
    upload_modal_title: 'Upload Photos',
    uploader_name: 'Your Name',
    upload_button: 'Upload',
    max_photos: 'Max 10 photos',
    admin_login: 'Admin Login',
    admin_id: 'Admin ID',
    password: 'Password',
    login: 'Login',
    admin_panel: 'Admin Panel',
    login_success: 'Logged in successfully',
    login_failed: 'Invalid ID or password',
    rsvp_success: 'Thank you for your RSVP!',
    rsvp_ai_preparing: 'RSVP received! Preparing thank you email...',
    message_sent: 'Message sent successfully',
    photo_shared: 'Photos uploaded successfully',
    ai_refined: 'AI refined your message ✨',
    ai_failed: 'AI refinement failed',
    copied: 'Copied to clipboard',
    url_copied: 'URL copied',
    admin_login_link: 'Admin Login',
    share_site: 'Share Site',
    birthday_party: 'Birthday Party 🎂',
    loading: 'Loading...',
    creating_email: 'Creating AI email...',
  }
};

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

export default function App() {
  // ── 言語設定 ──
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ja');
  const t = (key) => translations[lang][key] || key;
  
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);
  
  const toggleLang = () => setLang(l => l === 'ja' ? 'en' : 'ja');

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

  const [page, setPage]       = useState('home');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [toast, setToast]     = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [aTab, setATab]       = useState('settings');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const [genLoading, setGenLoading] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);

  const [rName, setRName]   = useState('');
  const [rEmail, setREmail] = useState('');
  const [rAtt, setRAtt]     = useState('yes');
  const [rMsg, setRMsg]     = useState('');
  const [mName, setMName]   = useState('');
  const [mText, setMText]   = useState('');
  const [uName, setUName]   = useState('');
  const [uImgs, setUImgs]   = useState([]);

  const [showMsg, setShowMsg] = useState(false);
  const [showUp, setShowUp]   = useState(false);
  const [slide, setSlide]     = useState(-1);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiResult, setAiResult]     = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);

  const [showSchedForm, setShowSchedForm]   = useState(false);
  const [newSchedTime, setNewSchedTime]     = useState('');
  const [newSchedTitle, setNewSchedTitle]   = useState('');
  const [editSchedId, setEditSchedId]       = useState(null);
  const [editSchedTime, setEditSchedTime]   = useState('');
  const [editSchedTitle, setEditSchedTitle] = useState('');

  const [showNewsForm, setShowNewsForm]     = useState(false);
  const [newNewsTitle, setNewNewsTitle]     = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');

  const [selGuests, setSelGuests] = useState([]);

  const fileRef = useRef(null);
  const topRef  = useRef(null);
  const impRef  = useRef(null);

  const notify = useCallback(m => setToast(m), []);
  const sc = (c) => updateConfig(c);

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

  const imeHandlers = {
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
  };

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
    try { setRMsg(await callAI(`以下のお祝いメッセージを温かみのある洗練された文章に校正。元の気持ちを大切に。校正後のみ出力:\n\n${rMsg}`)); notify(t('ai_refined')); }
    catch { notify(t('ai_failed')); } finally { setAiRefining(false); }
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

  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  const doLogin = () => {
    if (loginId === cfg.adminId && loginPw === cfg.adminPass) { setIsAdmin(true); setPage('admin'); notify(t('login_success')); }
    else notify(t('login_failed'));
  };

  const doRsvp = async () => {
    if (!rName || closed || isComposing) return;
    const { id: rid, name: n, email: e, att: a } = await submitRsvp({ name: rName, email: rEmail, att: rAtt, msg: rMsg });
    setRName(''); setREmail(''); setRAtt('yes'); setRMsg('');
    setHasRsvped(true);
    go('telegram');
    notify(e && cfg.autoReplyEnabled ? t('rsvp_ai_preparing') : t('rsvp_success'));
    if (e && cfg.autoReplyEnabled) autoGenDraft(rid, n, e, a);
  };

  const doMsg = async () => {
    if (!mName || !mText || isComposing) return;
    await submitMessage({ name: mName, text: mText });
    setMName(''); setMText(''); setShowMsg(false); go('telegram'); notify(t('message_sent'));
  };

  const doFiles = async e => { const f = Array.from(e.target.files).slice(0, 10); if (!f.length) return; setUImgs(await Promise.all(f.map(x => compress(x)))); };
  const doUpload = async () => {
    if (!uImgs.length || !uName || isComposing) return;
    await submitPhotos(uName, uImgs);
    setUName(''); setUImgs([]); setShowUp(false); notify(t('photo_shared'));
  };
  const doTopImg = async e => { const f = e.target.files[0]; if (!f) return; const d = await compress(f, 0.5); const url = await uploadImage(d, 'topImage/hero.jpg'); sc({ topImg: url }); notify('更新'); };
  const doLike = (id) => { const p = photos.find(x => x.id === id); if (p) likePhoto(id, p.likes); };

  const doAddSched = async () => { if (!newSchedTime || !newSchedTitle || isComposing) return; await addSchedule(newSchedTime, newSchedTitle); setNewSchedTime(''); setNewSchedTitle(''); setShowSchedForm(false); notify('追加'); };
  const startEditSched = (s) => { setEditSchedId(s.id); setEditSchedTime(s.time); setEditSchedTitle(s.title); };
  const saveEditSched = async () => { if (!editSchedTime || !editSchedTitle || isComposing) return; await updateSchedule(editSchedId, editSchedTime, editSchedTitle); setEditSchedId(null); notify('更新'); };
  const cancelEditSched = () => setEditSchedId(null);

  const doAddNews = async () => { if (!newNewsTitle || isComposing) return; await addNews(newNewsTitle, newNewsContent); setNewNewsTitle(''); setNewNewsContent(''); setShowNewsForm(false); notify('追加'); };

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
  const copyTxt = txt => { navigator.clipboard?.writeText(txt); notify(t('copied')); };

  const draftCt = emailDrafts.filter(d => d.status === 'draft').length;
  const sentCt  = emailDrafts.filter(d => d.status === 'sent').length;

  const guestNavs = [
    { id: 'home', icon: Calendar, l: t('nav_home') },
    { id: 'rsvp', icon: Send, l: t('nav_rsvp') },
    { id: 'telegram', icon: Heart, l: t('nav_telegram') },
    { id: 'gallery', icon: Camera, l: t('nav_gallery') },
    ...(cfg.showMediaPage ? [{ id: 'media', icon: Play, l: t('nav_media') }] : []),
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

  const isGuestPage = ['home', 'rsvp', 'telegram', 'gallery', 'media'].includes(page);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: cfg.color || '#be123c' }} />
          <p className="text-sm text-neutral-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800" style={{ fontFamily: T.font }}>
      {cfg.announcement && (
        <div className="fixed top-0 inset-x-0 z-[50] text-white text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: T.c }}><Bell size={12} className="animate-pulse" />{cfg.announcement}</div>
      )}
      {genLoading && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[50] bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold border"><Loader2 size={14} className="animate-spin" style={{ color: T.c }} /><span className="text-neutral-600">{t('creating_email')}</span></div>
      )}

      {isGuestPage && (
        <nav className={`hidden md:block fixed top-0 inset-x-0 z-[80] bg-white border-b border-neutral-100 shadow-sm ${cfg.announcement ? 'mt-8' : ''}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
            <span className="text-sm font-semibold" style={{ color: T.c }}>{cfg.name}{lang === 'ja' ? 'の生誕祭' : '\'s Birthday'}</span>
            <div className="flex gap-1">{guestNavs.map(n => (
              <button key={n.id} onClick={() => go(n.id)} className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${page === n.id ? 'text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`} style={page === n.id ? { backgroundColor: T.c } : {}}><n.icon size={14} />{n.l}</button>
            ))}</div>
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50">
              <Globe size={13} />
              {lang === 'ja' ? 'EN' : '日本語'}
            </button>
          </div>
        </nav>
      )}

      {isGuestPage && (
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden fixed top-3 right-3 z-[100] w-10 h-10 bg-white/90 backdrop-blur-lg rounded-full shadow-lg flex items-center justify-center border border-neutral-200">
          {menuOpen ? <X size={18} className="text-neutral-700" /> : <Menu size={18} className="text-neutral-700" />}
        </button>
      )}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl flex flex-col" style={{ animation: 'fadeIn .15s ease-out' }}>
            <div className="pt-16 px-6 pb-4">
              <p className="text-[10px] font-semibold tracking-[.3em] uppercase text-neutral-400 mb-4">MENU</p>
              <nav className="space-y-1">{guestNavs.map(n => (
                <button key={n.id} onClick={() => go(n.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${page === n.id ? 'text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-50'}`} style={page === n.id ? { backgroundColor: T.c } : {}}><n.icon size={16} />{n.l}</button>
              ))}</nav>
              <button onClick={() => { toggleLang(); setMenuOpen(false); }} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50">
                <Globe size={14} />
                {lang === 'ja' ? 'English' : '日本語'}
              </button>
            </div>
            <div className="mt-auto p-6 border-t border-neutral-100"><button onClick={() => { if (navigator.share) navigator.share({ title: `${cfg.name}${lang === 'ja' ? 'の生誕祭' : '\'s Birthday'}`, url: location.href }); else { navigator.clipboard?.writeText(location.href); notify(t('url_copied')); } setMenuOpen(false); }} className="text-xs text-neutral-400 flex items-center gap-1.5 hover:text-neutral-600"><Share2 size={12} /> {t('share_site')}</button></div>
          </div>
        </div>
      )}

      {!closed && isGuestPage && page !== 'rsvp' && (
        <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[40]"><button onClick={() => go('rsvp')} className="px-6 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 active:scale-95 transition-transform" style={btnS}><Send size={14} /> {t('rsvp_button')}</button></div>
      )}

      <div className={`${cfg.announcement ? 'pt-8' : ''} ${isGuestPage ? 'md:pt-14' : ''} pb-24 md:pb-8`}>

{/* 続きは次のメッセージで送ります */}