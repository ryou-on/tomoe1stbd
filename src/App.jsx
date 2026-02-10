// src/App.jsx - 完全版（多言語対応 + IME完全修正 + Modal外部化）
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
    nav_home: 'ホーム', nav_rsvp: '参加表明', nav_telegram: 'お祝い電報', nav_gallery: '写真館', nav_media: 'メディア',
    birthday_congrats: '歳 おめでとう', rsvp_button: '参加を表明する', send_message: 'お祝いメッセージを送る',
    scroll: 'Scroll', updates: 'お知らせ', schedule: '当日の流れ',
    schedule_note: '当日はオープンハウス形式です。いつ来ていつ退出されても構いません。ご都合の良い時間帯にお越しください。',
    schedule_caution: '※ 本人の体調や機嫌により、スケジュールが前後したり予告なく中止になる場合がございます。ご了承ください。',
    venue: '会場', venue_locked: '参加表明をしていただくと会場の詳細が表示されます', view_map: '大きな地図で見る',
    gift_list: 'ギフトリスト', gift_desc: 'Amazon欲しいものリストより', view_list: 'リストを見る',
    rsvp_title: '参加表明', rsvp_closed: '受付は終了しました', name_required: 'お名前 *', name_placeholder: '例: 山田太郎',
    email_label: 'メールアドレス', email_thank_you: '（お礼メール送付先）', email_placeholder: 'example@mail.com',
    email_ai_note: '✉️ AIが作成したお礼メールが届きます', attendance: '出欠', attend_yes: '🎉 出席します', attend_no: '😢 欠席します',
    message_optional: 'メッセージ（任意）', message_placeholder: 'お祝いメッセージ...', ai_refine: 'AI校正',
    ai_tip: 'AIが文章を整えてくれます', submit: '回答を送信', telegrams_title: '皆様からのメッセージ',
    send_telegram: 'メッセージを送る', waiting_messages: 'メッセージを待っています...', gallery_title: '思い出の写真館',
    slideshow: 'スライドショー', upload_photo: '写真を投稿', no_photos: 'まだ写真がありません',
    media_title: 'メディア', media_subtitle: 'Tomoeちゃんの思い出と楽曲', songs: '楽曲', scores: '楽譜', timeline: '成長の記録',
    back_to_top: '← トップへ戻る', message_modal_title: 'お祝いメッセージ', message_modal_subtitle: 'ちゃんへ心を込めて',
    upload_modal_title: '写真を投稿', uploader_name: '投稿者のお名前', upload_button: 'アップロード', max_photos: '最大10枚',
    admin_login: '管理画面', admin_id: 'Admin ID', password: 'Password', login: 'ログイン', admin_panel: '管理パネル',
    login_success: 'ログインしました', login_failed: 'IDまたはパスワードが違います', rsvp_success: '登録ありがとうございます！',
    rsvp_ai_preparing: '登録完了！お礼メールを準備中...', message_sent: 'メッセージを送信しました', photo_shared: '写真を共有しました',
    ai_refined: 'AIが文章を整えました ✨', ai_failed: 'AI校正に失敗', copied: 'コピーしました', url_copied: 'URLをコピー',
    admin_login_link: '管理者ログイン', share_site: 'サイトをシェア', birthday_party: '歳 生誕祭 🎂',
    loading: '読み込み中...', creating_email: 'AIメール作成中...',
  },
  en: {
    nav_home: 'Home', nav_rsvp: 'RSVP', nav_telegram: 'Messages', nav_gallery: 'Gallery', nav_media: 'Media',
    birthday_congrats: 'years old', rsvp_button: 'RSVP Now', send_message: 'Send Message',
    scroll: 'Scroll', updates: 'Updates', schedule: 'Schedule',
    schedule_note: 'This is an open house format. You can arrive and leave at your convenience.',
    schedule_caution: '* Schedule may change due to the birthday child\'s condition.',
    venue: 'Venue', venue_locked: 'Venue details will be shown after RSVP', view_map: 'View on Map',
    gift_list: 'Gift Registry', gift_desc: 'Amazon Wishlist', view_list: 'View List',
    rsvp_title: 'RSVP', rsvp_closed: 'RSVP is now closed', name_required: 'Name *', name_placeholder: 'e.g. John Smith',
    email_label: 'Email', email_thank_you: '(for thank you email)', email_placeholder: 'example@mail.com',
    email_ai_note: '✉️ You\'ll receive an AI-generated thank you email', attendance: 'Attendance',
    attend_yes: '🎉 I will attend', attend_no: '😢 I cannot attend', message_optional: 'Message (optional)',
    message_placeholder: 'Your message...', ai_refine: 'AI Polish', ai_tip: 'AI will refine your message', submit: 'Submit',
    telegrams_title: 'Messages from Guests', send_telegram: 'Send Message', waiting_messages: 'Waiting for messages...',
    gallery_title: 'Photo Gallery', slideshow: 'Slideshow', upload_photo: 'Upload Photo', no_photos: 'No photos yet',
    media_title: 'Media', media_subtitle: 'Memories and Songs', songs: 'Songs', scores: 'Sheet Music', timeline: 'Growth Timeline',
    back_to_top: '← Back to Top', message_modal_title: 'Send Message', message_modal_subtitle: 'With love',
    upload_modal_title: 'Upload Photos', uploader_name: 'Your Name', upload_button: 'Upload', max_photos: 'Max 10 photos',
    admin_login: 'Admin Login', admin_id: 'Admin ID', password: 'Password', login: 'Login', admin_panel: 'Admin Panel',
    login_success: 'Logged in successfully', login_failed: 'Invalid ID or password', rsvp_success: 'Thank you for your RSVP!',
    rsvp_ai_preparing: 'RSVP received! Preparing thank you email...', message_sent: 'Message sent successfully',
    photo_shared: 'Photos uploaded successfully', ai_refined: 'AI refined your message ✨', ai_failed: 'AI refinement failed',
    copied: 'Copied to clipboard', url_copied: 'URL copied', admin_login_link: 'Admin Login', share_site: 'Share Site',
    birthday_party: 'Birthday Party 🎂', loading: 'Loading...', creating_email: 'Creating AI email...',
  }
};

/* ─── 共通コンポーネント（App外部で定義） ─── */

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

/* ✅ Modal を App の外で定義（安定した参照でフォーカス消失を防止） */
const Modal = ({ children, onClose, wide, borderRadius }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <div
      className={`relative bg-white ${wide ? 'max-w-lg' : 'max-w-md'} w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}
      style={{ borderRadius }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 z-10"><X size={18} /></button>
      {children}
    </div>
  </div>
);

/* ─── メインApp ─── */

export default function App() {
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

  const [page, setPage] = useState('home');
  const [toast, setToast] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [aTab, setATab] = useState('settings');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const [genLoading, setGenLoading] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);

  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rAtt, setRAtt] = useState('yes');
  const [rMsg, setRMsg] = useState('');
  const [mName, setMName] = useState('');
  const [mText, setMText] = useState('');
  const [uName, setUName] = useState('');
  const [uImgs, setUImgs] = useState([]);

  const [showMsg, setShowMsg] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [slide, setSlide] = useState(-1);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [showSchedForm, setShowSchedForm] = useState(false);
  const [newSchedTime, setNewSchedTime] = useState('');
  const [newSchedTitle, setNewSchedTitle] = useState('');
  const [editSchedId, setEditSchedId] = useState(null);
  const [editSchedTime, setEditSchedTime] = useState('');
  const [editSchedTitle, setEditSchedTitle] = useState('');

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');

  const [selGuests, setSelGuests] = useState([]);

  const fileRef = useRef(null);
  const topRef = useRef(null);
  const impRef = useRef(null);

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
  const sentCt = emailDrafts.filter(d => d.status === 'sent').length;

  const guestNavs = [
    { id: 'home', icon: Calendar, l: t('nav_home') },
    { id: 'rsvp', icon: Send, l: t('nav_rsvp') },
    { id: 'telegram', icon: Heart, l: t('nav_telegram') },
    { id: 'gallery', icon: Camera, l: t('nav_gallery') },
    ...(cfg.showMediaPage ? [{ id: 'media', icon: Play, l: t('nav_media') }] : []),
  ];

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
        {/* HOME */}
        {page === 'home' && (
          <>
            {/* お知らせ */}
            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
              <ST title={t('updates')} />
              <div className="space-y-4">
                {news.length ? news.map(n => (
                  <div key={n.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 hover:shadow-md transition-shadow">
                    <div className="text-[10px] text-neutral-400 mb-1">{new Date(n.ts).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{n.title}</h3>
                    {n.content && <p className="text-sm text-neutral-600 whitespace-pre-wrap">{n.content}</p>}
                  </div>
                )) : <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'お知らせはまだありません' : 'No updates yet'}</p>}
              </div>
            </div>

            {/* スケジュール */}
            <div className="bg-white py-16 md:py-24">
              <div className="max-w-2xl mx-auto px-6">
                <ST title={t('schedule')} />
                <p className="text-sm text-neutral-600 mb-8 text-center">{t('schedule_note')}</p>
                <div className="space-y-3">
                  {[...sched].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(s => (
                    <div key={s.id} className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-sm font-semibold min-w-[70px]" style={{ color: T.c }}>{s.time}</div>
                      <div className="text-sm text-neutral-700">{s.title}</div>
                    </div>
                  ))}
                  {!sched.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'スケジュールはまだありません' : 'Schedule not available yet'}</p>}
                </div>
                <p className="text-xs text-neutral-400 mt-6 text-center">{t('schedule_caution')}</p>
              </div>
            </div>

            {/* 会場 */}
            <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
              <ST title={t('venue')} />
              {hasRsvped ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                    <h3 className="font-semibold text-neutral-900 mb-2">{cfg.venue}</h3>
                    <p className="text-sm text-neutral-600 mb-4">{cfg.address}</p>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: T.c }}><MapPin size={14} /> {t('view_map')}</a>
                  </div>
                  {cfg.address && (
                    <div className="rounded-xl overflow-hidden border border-neutral-200 h-64">
                      <iframe src={mapEmbed} width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="map" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
                  <Lock size={32} className="mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm text-neutral-500">{t('venue_locked')}</p>
                </div>
              )}
            </div>

            {/* ギフトリスト */}
            {cfg.amazonUrl && (
              <div className="bg-white py-16 md:py-24">
                <div className="max-w-2xl mx-auto px-6 text-center">
                  <ST title={t('gift_list')} sub={t('gift_desc')} />
                  <a href={cfg.amazonUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" style={btnS}><Gift size={15} /> {t('view_list')}</a>
                </div>
              </div>
            )}
          </>
        )}

        {/* RSVP */}
        {page === 'rsvp' && (
          <div className="max-w-lg mx-auto px-6 py-12 md:py-20">
            <ST title={t('rsvp_title')} />
            {closed ? (
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-neutral-400" />
                <p className="text-sm text-neutral-600">{t('rsvp_closed')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 md:p-8 space-y-5">
                <Field label={t('name_required')}>
                  <input type="text" value={rName} onChange={e => setRName(e.target.value)} className={iCls} placeholder={t('name_placeholder')} {...imeHandlers} />
                </Field>
                <Field label={<span>{t('email_label')} <span className="text-xs text-neutral-400">{t('email_thank_you')}</span></span>}>
                  <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} className={iCls} placeholder={t('email_placeholder')} {...imeHandlers} />
                  {cfg.autoReplyEnabled && <p className="text-xs text-neutral-500 mt-1.5">{t('email_ai_note')}</p>}
                </Field>
                <Field label={t('attendance')}>
                  <div className="flex gap-3">
                    {[{ v: 'yes', l: t('attend_yes') }, { v: 'no', l: t('attend_no') }].map(o => (
                      <label key={o.v} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${rAtt === o.v ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>
                        <input type="radio" name="att" value={o.v} checked={rAtt === o.v} onChange={e => setRAtt(e.target.value)} className="sr-only" />
                        <span className="text-sm font-medium">{o.l}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label={t('message_optional')}>
                  <div className="relative">
                    <textarea value={rMsg} onChange={e => setRMsg(e.target.value)} className={`${iCls} min-h-[100px] resize-none`} placeholder={t('message_placeholder')} {...imeHandlers} />
                    {CLAUDE_KEY && (
                      <button onClick={refineMsg} disabled={aiRefining || !rMsg || rMsg.length < 3} className="absolute bottom-2 right-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: T.c }}>
                        {aiRefining ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        {t('ai_refine')}
                      </button>
                    )}
                  </div>
                  {CLAUDE_KEY && <p className="text-xs text-neutral-400 mt-1.5">{t('ai_tip')}</p>}
                </Field>
                <button onClick={doRsvp} disabled={!rName || isComposing} className="w-full py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={btnS}><Send size={15} /> {t('submit')}</button>
              </div>
            )}
          </div>
        )}

        {/* TELEGRAM */}
        {page === 'telegram' && (
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
            <ST title={t('telegrams_title')} />
            <div className="mb-8 text-center">
              <button onClick={() => setShowMsg(true)} className="px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" style={btnS}>{t('send_telegram')}</button>
            </div>
            <div className="space-y-4">
              {msgs.length ? msgs.map(m => (
                <div key={m.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-semibold text-neutral-900">{m.name}</div>
                    <div className="text-[10px] text-neutral-400">{new Date(m.ts).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              )) : (
                <div className="text-center py-16">
                  <MessageSquare size={48} className="mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-400 text-sm">{t('waiting_messages')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GALLERY */}
        {page === 'gallery' && (
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            <ST title={t('gallery_title')} />
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => photos.length && setSlide(0)} disabled={!photos.length} className="px-5 py-2.5 text-sm font-medium bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"><Play size={14} /> {t('slideshow')}</button>
              <button onClick={() => setShowUp(true)} className="px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2" style={btnS}><Upload size={14} /> {t('upload_photo')}</button>
            </div>
            {photos.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map(p => (
                  <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => setSlide(photos.indexOf(p))}>
                    <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-white text-xs font-medium mb-1">{p.name}</div>
                        <button onClick={e => { e.stopPropagation(); doLike(p.id); }} className="flex items-center gap-1 text-white/90 text-xs"><Heart size={12} className={p.likes > 0 ? 'fill-current' : ''} /> {p.likes || 0}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Camera size={48} className="mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-400 text-sm">{t('no_photos')}</p>
              </div>
            )}
          </div>
        )}

        {/* MEDIA */}
        {page === 'media' && (
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            <ST title={t('media_title')} sub={t('media_subtitle')} />
            <div className="grid md:grid-cols-2 gap-6">
              {cfg.youtubeUrl && (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Play size={16} style={{ color: T.c }} /> {t('songs')}</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
                    <iframe src={cfg.youtubeUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video" />
                  </div>
                </div>
              )}
              {cfg.scoreUrl && (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><FileUp size={16} style={{ color: T.c }} /> {t('scores')}</h3>
                  <a href={cfg.scoreUrl} target="_blank" rel="noopener noreferrer" className="block p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"><FileUp size={18} className="text-neutral-600" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">{lang === 'ja' ? '楽譜を見る' : 'View Score'}</div>
                        <div className="text-xs text-neutral-500">PDF</div>
                      </div>
                      <ExternalLink size={14} className="text-neutral-400" />
                    </div>
                  </a>
                </div>
              )}
            </div>
            <button onClick={() => go('home')} className="mt-8 mx-auto flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"><ChevronDown size={14} className="rotate-90" /> {t('back_to_top')}</button>
          </div>
        )}

        {/* LOGIN */}
        {page === 'login' && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
              <div className="text-center mb-6">
                <Lock size={32} className="mx-auto mb-3" style={{ color: T.c }} />
                <h2 className="text-xl font-semibold text-neutral-900">{t('admin_login')}</h2>
              </div>
              <div className="space-y-4">
                <Field label={t('admin_id')}>
                  <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} className={iCls} onKeyDown={e => e.key === 'Enter' && doLogin()} {...imeHandlers} />
                </Field>
                <Field label={t('password')}>
                  <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)} className={iCls} onKeyDown={e => e.key === 'Enter' && doLogin()} {...imeHandlers} />
                </Field>
                <button onClick={doLogin} className="w-full py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all" style={btnS}>{t('login')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {page === 'admin' && isAdmin && (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-neutral-900">{t('admin_panel')}</h1>
              <button onClick={() => { setIsAdmin(false); go('home'); }} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"><X size={14} className="inline mr-1" /> {lang === 'ja' ? '閉じる' : 'Close'}</button>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['settings', 'schedule', 'news', 'rsvps', 'messages', 'photos', 'emails'].map(tab => (
                <button key={tab} onClick={() => setATab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${aTab === tab ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </div>

            {/* Settings */}
            {aTab === 'settings' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Settings size={16} /> {lang === 'ja' ? '基本設定' : 'Basic Settings'}</h3>
                  <Field label={lang === 'ja' ? 'お子様の名前' : 'Child Name'}><input type="text" value={cfg.name} onChange={e => sc({ name: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <Field label={lang === 'ja' ? '生年月日' : 'Birth Date'}><input type="date" value={cfg.birthDate} onChange={e => sc({ birthDate: e.target.value })} className={iCls} /></Field>
                  <Field label={lang === 'ja' ? 'イベント日' : 'Event Date'}><input type="date" value={cfg.eventDate} onChange={e => sc({ eventDate: e.target.value })} className={iCls} /></Field>
                  <Field label={lang === 'ja' ? 'RSVP締切' : 'RSVP Deadline'}><input type="date" value={cfg.rsvpDeadline} onChange={e => sc({ rsvpDeadline: e.target.value })} className={iCls} /></Field>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Palette size={16} /> {lang === 'ja' ? 'デザイン' : 'Design'}</h3>
                  <Field label={lang === 'ja' ? 'テーマカラー' : 'Theme Color'}><input type="color" value={cfg.color} onChange={e => sc({ color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" /></Field>
                  <Field label={lang === 'ja' ? 'スタイル' : 'Style'}>
                    <select value={cfg.style} onChange={e => sc({ style: e.target.value })} className={iCls}>
                      <option value="modern">Modern</option>
                      <option value="elegant">Elegant</option>
                      <option value="playful">Playful</option>
                    </select>
                  </Field>
                  <Field label={lang === 'ja' ? 'トップ画像' : 'Hero Image'}>
                    <div className="space-y-2">
                      <input type="file" accept="image/*" onChange={doTopImg} ref={topRef} className="hidden" />
                      <button onClick={() => topRef.current?.click()} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-100 flex items-center justify-center gap-2"><Upload size={14} /> {lang === 'ja' ? 'アップロード' : 'Upload'}</button>
                      {cfg.topImg && <img src={cfg.topImg} alt="" className="w-full h-32 object-cover rounded-lg" />}
                    </div>
                  </Field>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><MapPin size={16} /> {lang === 'ja' ? '会場情報' : 'Venue'}</h3>
                  <Field label={lang === 'ja' ? '会場名' : 'Venue Name'}><input type="text" value={cfg.venue} onChange={e => sc({ venue: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <Field label={lang === 'ja' ? '住所' : 'Address'}><input type="text" value={cfg.address} onChange={e => sc({ address: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Gift size={16} /> {lang === 'ja' ? 'リンク' : 'Links'}</h3>
                  <Field label={lang === 'ja' ? 'Amazon欲しいものリスト' : 'Amazon Wishlist'}><input type="url" value={cfg.amazonUrl} onChange={e => sc({ amazonUrl: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <Field label={lang === 'ja' ? 'YouTube URL' : 'YouTube URL'}><input type="url" value={cfg.youtubeUrl} onChange={e => sc({ youtubeUrl: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <Field label={lang === 'ja' ? '楽譜 URL' : 'Score URL'}><input type="url" value={cfg.scoreUrl} onChange={e => sc({ scoreUrl: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={cfg.showMediaPage} onChange={e => sc({ showMediaPage: e.target.checked })} className="w-4 h-4 rounded" />
                    {lang === 'ja' ? 'メディアページを表示' : 'Show Media Page'}
                  </label>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Mail size={16} /> {lang === 'ja' ? 'メール設定' : 'Email Settings'}</h3>
                  <Field label={lang === 'ja' ? '送信者名' : 'Sender Name'}><input type="text" value={cfg.senderName} onChange={e => sc({ senderName: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={cfg.autoReplyEnabled} onChange={e => sc({ autoReplyEnabled: e.target.checked })} className="w-4 h-4 rounded" />
                    {lang === 'ja' ? 'AI自動返信を有効化' : 'Enable AI Auto-Reply'}
                  </label>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Bell size={16} /> {lang === 'ja' ? 'お知らせバー' : 'Announcement'}</h3>
                  <Field label={lang === 'ja' ? 'アナウンスメント（空欄で非表示）' : 'Announcement (leave blank to hide)'}><input type="text" value={cfg.announcement} onChange={e => sc({ announcement: e.target.value })} className={iCls} placeholder={lang === 'ja' ? '例: 当日は雨予報です' : 'e.g. Rain expected on the day'} {...imeHandlers} /></Field>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Lock size={16} /> {lang === 'ja' ? 'セキュリティ' : 'Security'}</h3>
                  <Field label={lang === 'ja' ? '管理者ID' : 'Admin ID'}><input type="text" value={cfg.adminId} onChange={e => sc({ adminId: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                  <Field label={lang === 'ja' ? 'パスワード' : 'Password'}><input type="password" value={cfg.adminPass} onChange={e => sc({ adminPass: e.target.value })} className={iCls} {...imeHandlers} /></Field>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Database size={16} /> {lang === 'ja' ? 'データ管理' : 'Data Management'}</h3>
                  <button onClick={doExport} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-100 flex items-center justify-center gap-2"><Download size={14} /> {lang === 'ja' ? 'バックアップ' : 'Backup'}</button>
                  <input type="file" accept=".json" onChange={doImport} ref={impRef} className="hidden" />
                  <button onClick={() => impRef.current?.click()} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-100 flex items-center justify-center gap-2"><Upload size={14} /> {lang === 'ja' ? '復元' : 'Restore'}</button>
                </div>
              </div>
            )}

            {/* Schedule */}
            {aTab === 'schedule' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2"><ListTodo size={16} /> {lang === 'ja' ? 'スケジュール管理' : 'Schedule Management'}</h3>
                  <button onClick={() => setShowSchedForm(!showSchedForm)} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 active:scale-95 transition-all"><Plus size={14} className="inline mr-1" /> {lang === 'ja' ? '追加' : 'Add'}</button>
                </div>
                {showSchedForm && (
                  <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <Field label={lang === 'ja' ? '時刻' : 'Time'}><input type="text" value={newSchedTime} onChange={e => setNewSchedTime(e.target.value)} className={iCls} placeholder="10:00" {...imeHandlers} /></Field>
                      <div className="col-span-2"><Field label={lang === 'ja' ? 'タイトル' : 'Title'}><input type="text" value={newSchedTitle} onChange={e => setNewSchedTitle(e.target.value)} className={iCls} placeholder={lang === 'ja' ? '例: ケーキ入刀' : 'e.g. Cake cutting'} {...imeHandlers} /></Field></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={doAddSched} disabled={!newSchedTime || !newSchedTitle || isComposing} className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 disabled:opacity-40"><Check size={14} className="inline mr-1" /> {lang === 'ja' ? '保存' : 'Save'}</button>
                      <button onClick={() => { setShowSchedForm(false); setNewSchedTime(''); setNewSchedTitle(''); }} className="px-4 py-2 bg-white border border-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-50"><X size={14} className="inline mr-1" /> {lang === 'ja' ? 'キャンセル' : 'Cancel'}</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {[...sched].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      {editSchedId === s.id ? (
                        <>
                          <input type="text" value={editSchedTime} onChange={e => setEditSchedTime(e.target.value)} className="w-20 px-2 py-1 bg-white border border-neutral-300 rounded text-sm" {...imeHandlers} />
                          <input type="text" value={editSchedTitle} onChange={e => setEditSchedTitle(e.target.value)} className="flex-1 px-2 py-1 bg-white border border-neutral-300 rounded text-sm" {...imeHandlers} />
                          <button onClick={saveEditSched} disabled={!editSchedTime || !editSchedTitle || isComposing} className="px-3 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700 disabled:opacity-40"><Check size={12} /></button>
                          <button onClick={cancelEditSched} className="px-3 py-1 bg-white border border-neutral-200 text-xs rounded hover:bg-neutral-50"><X size={12} /></button>
                        </>
                      ) : (
                        <>
                          <div className="w-20 text-sm font-semibold text-rose-600">{s.time}</div>
                          <div className="flex-1 text-sm text-neutral-700">{s.title}</div>
                          <button onClick={() => startEditSched(s)} className="p-1.5 hover:bg-neutral-100 rounded"><Pencil size={14} className="text-neutral-500" /></button>
                          <button onClick={() => deleteSchedule(s.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-500" /></button>
                        </>
                      )}
                    </div>
                  ))}
                  {!sched.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'スケジュールがありません' : 'No schedule items'}</p>}
                </div>
              </div>
            )}

            {/* News */}
            {aTab === 'news' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2"><Newspaper size={16} /> {lang === 'ja' ? 'お知らせ管理' : 'News Management'}</h3>
                  <button onClick={() => setShowNewsForm(!showNewsForm)} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 active:scale-95 transition-all"><Plus size={14} className="inline mr-1" /> {lang === 'ja' ? '追加' : 'Add'}</button>
                </div>
                {showNewsForm && (
                  <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                    <Field label={lang === 'ja' ? 'タイトル' : 'Title'}><input type="text" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} className={iCls} {...imeHandlers} /></Field>
                    <Field label={lang === 'ja' ? '内容（任意）' : 'Content (optional)'}><textarea value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} className={`${iCls} min-h-[80px] resize-none`} {...imeHandlers} /></Field>
                    <div className="flex gap-2">
                      <button onClick={doAddNews} disabled={!newNewsTitle || isComposing} className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 disabled:opacity-40"><Check size={14} className="inline mr-1" /> {lang === 'ja' ? '保存' : 'Save'}</button>
                      <button onClick={() => { setShowNewsForm(false); setNewNewsTitle(''); setNewNewsContent(''); }} className="px-4 py-2 bg-white border border-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-50"><X size={14} className="inline mr-1" /> {lang === 'ja' ? 'キャンセル' : 'Cancel'}</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {news.map(n => (
                    <div key={n.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="font-semibold text-neutral-900 mb-1">{n.title}</div>
                          {n.content && <p className="text-sm text-neutral-600 whitespace-pre-wrap">{n.content}</p>}
                        </div>
                        <button onClick={() => deleteNews(n.id)} className="p-1.5 hover:bg-red-50 rounded shrink-0"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                      <div className="text-xs text-neutral-400">{new Date(n.ts).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                    </div>
                  ))}
                  {!news.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'お知らせがありません' : 'No news'}</p>}
                </div>
              </div>
            )}

            {/* RSVPs */}
            {aTab === 'rsvps' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2"><Users size={16} /> {lang === 'ja' ? '参加者管理' : 'RSVP Management'} ({rsvps.length})</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setSelGuests(selGuests.length === rsvps.length ? [] : rsvps.map(g => g.id))} className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded hover:bg-neutral-50">{selGuests.length === rsvps.length ? (lang === 'ja' ? '全解除' : 'Deselect All') : (lang === 'ja' ? '全選択' : 'Select All')}</button>
                    {selGuests.length > 0 && <button onClick={doBulkMail} className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"><Mail size={12} className="inline mr-1" /> {lang === 'ja' ? '一括メール' : 'Bulk Email'} ({selGuests.length})</button>}
                  </div>
                </div>
                <div className="space-y-2">
                  {rsvps.map(g => (
                    <div key={g.id} className={`p-4 rounded-lg border-2 transition-all ${selGuests.includes(g.id) ? 'border-rose-300 bg-rose-50' : 'border-neutral-200 bg-neutral-50'}`}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selGuests.includes(g.id)} onChange={e => setSelGuests(e.target.checked ? [...selGuests, g.id] : selGuests.filter(x => x !== g.id))} className="mt-1 w-4 h-4 rounded" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-neutral-900">{g.name}</div>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${g.att === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'}`}>{g.att === 'yes' ? (lang === 'ja' ? '出席' : 'Attending') : (lang === 'ja' ? '欠席' : 'Not Attending')}</span>
                          </div>
                          {g.email && <div className="text-xs text-neutral-500 mb-1">{g.email}</div>}
                          {g.msg && <p className="text-sm text-neutral-600 mt-2 whitespace-pre-wrap">{g.msg}</p>}
                          <div className="text-[10px] text-neutral-400 mt-2">{new Date(g.ts).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                        </div>
                        <button onClick={() => deleteRsvp(g.id)} className="p-1.5 hover:bg-red-50 rounded shrink-0"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                  {!rsvps.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'まだRSVPがありません' : 'No RSVPs yet'}</p>}
                </div>
              </div>
            )}

            {/* Messages */}
            {aTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2"><MessageSquare size={16} /> {lang === 'ja' ? 'メッセージ管理' : 'Messages'} ({msgs.length})</h3>
                <div className="space-y-3">
                  {msgs.map(m => (
                    <div key={m.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="font-semibold text-neutral-900">{m.name}</div>
                        <button onClick={() => deleteMessage(m.id)} className="p-1.5 hover:bg-red-50 rounded shrink-0"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap mb-2">{m.text}</p>
                      <div className="text-xs text-neutral-400">{new Date(m.ts).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                    </div>
                  ))}
                  {!msgs.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'まだメッセージがありません' : 'No messages yet'}</p>}
                </div>
              </div>
            )}

            {/* Photos */}
            {aTab === 'photos' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2"><Camera size={16} /> {lang === 'ja' ? '写真管理' : 'Photos'} ({photos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map(p => (
                    <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => deletePhoto(p.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 size={16} /></button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                        <div className="text-white text-xs truncate">{p.name}</div>
                        <div className="text-white/70 text-[10px] flex items-center gap-1"><Heart size={10} /> {p.likes || 0}</div>
                      </div>
                    </div>
                  ))}
                  {!photos.length && <div className="col-span-full text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'まだ写真がありません' : 'No photos yet'}</div>}
                </div>
              </div>
            )}

            {/* Emails */}
            {aTab === 'emails' && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2"><Mail size={16} /> {lang === 'ja' ? 'お礼メール管理' : 'Thank You Emails'} <span className="text-xs font-normal text-neutral-500">({lang === 'ja' ? '下書き' : 'Draft'}: {draftCt}, {lang === 'ja' ? '送信済' : 'Sent'}: {sentCt})</span></h3>
                <div className="space-y-3">
                  {emailDrafts.map(d => {
                    const r = rsvps.find(x => x.id === d.rsvpId);
                    return (
                      <div key={d.id} className={`p-4 rounded-lg border-2 ${d.status === 'sent' ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-neutral-900">{d.name}</div>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${d.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status === 'sent' ? (lang === 'ja' ? '送信済' : 'Sent') : (lang === 'ja' ? '下書き' : 'Draft')}</span>
                              {d.att === 'yes' && <span className="text-xs text-neutral-500">{lang === 'ja' ? '出席者' : 'Attending'}</span>}
                            </div>
                            <div className="text-xs text-neutral-500">{d.email}</div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {d.status === 'draft' && (
                              <>
                                <button onClick={() => setPreviewDraft(d)} className="p-1.5 hover:bg-neutral-100 rounded" title={lang === 'ja' ? 'プレビュー' : 'Preview'}><Eye size={14} className="text-neutral-600" /></button>
                                <button onClick={() => openGmail(d)} className="p-1.5 hover:bg-emerald-50 rounded" title={lang === 'ja' ? 'Gmailで開く' : 'Open in Gmail'}><MailOpen size={14} className="text-emerald-600" /></button>
                                <button onClick={() => regenDraft(d.id)} disabled={genLoading === d.rsvpId} className="p-1.5 hover:bg-blue-50 rounded disabled:opacity-40" title={lang === 'ja' ? '再生成' : 'Regenerate'}>{genLoading === d.rsvpId ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <RefreshCw size={14} className="text-blue-600" />}</button>
                              </>
                            )}
                            <button onClick={() => deleteEmailDraft(d.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-500" /></button>
                          </div>
                        </div>
                        {d.status === 'sent' && d.sentAt && (
                          <div className="text-[10px] text-emerald-600 mb-2">{lang === 'ja' ? '送信日時' : 'Sent at'}: {new Date(d.sentAt).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                        )}
                      </div>
                    );
                  })}
                  {!emailDrafts.length && <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'まだメールがありません' : 'No emails yet'}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals - borderRadius={T.cr} を渡す */}
      {showMsg && (
        <Modal onClose={() => setShowMsg(false)} borderRadius={T.cr}>
          <ST title={t('message_modal_title')} sub={t('message_modal_subtitle') + cfg.name} />
          <div className="space-y-4">
            <Field label={t('uploader_name')}>
              <input type="text" value={mName} onChange={e => setMName(e.target.value)} className={iCls} placeholder={t('name_placeholder')} {...imeHandlers} />
            </Field>
            <Field label={t('message_optional')}>
              <textarea value={mText} onChange={e => setMText(e.target.value)} className={`${iCls} min-h-[120px] resize-none`} placeholder={t('message_placeholder')} {...imeHandlers} />
            </Field>
            <button onClick={doMsg} disabled={!mName || !mText || isComposing} className="w-full py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={btnS}>{t('send_message')}</button>
          </div>
        </Modal>
      )}

      {showUp && (
        <Modal onClose={() => setShowUp(false)} borderRadius={T.cr}>
          <ST title={t('upload_modal_title')} />
          <div className="space-y-4">
            <Field label={t('uploader_name')}>
              <input type="text" value={uName} onChange={e => setUName(e.target.value)} className={iCls} placeholder={t('name_placeholder')} {...imeHandlers} />
            </Field>
            <Field label={`${lang === 'ja' ? '写真' : 'Photos'} (${t('max_photos')})`}>
              <input type="file" accept="image/*" multiple onChange={doFiles} ref={fileRef} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-full px-4 py-3 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 hover:border-neutral-400 transition-all flex items-center justify-center gap-2"><Upload size={16} /> {lang === 'ja' ? '写真を選択' : 'Select Photos'}</button>
              {uImgs.length > 0 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {uImgs.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setUImgs(uImgs.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80"><X size={12} className="text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
            <button onClick={doUpload} disabled={!uImgs.length || !uName || isComposing} className="w-full py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={btnS}>{t('upload_button')}</button>
          </div>
        </Modal>
      )}

      {previewDraft && (
        <Modal onClose={() => setPreviewDraft(null)} wide borderRadius={T.cr}>
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-1">{lang === 'ja' ? 'メールプレビュー' : 'Email Preview'}</h3>
            <div className="text-sm text-neutral-500">{previewDraft.name} ({previewDraft.email})</div>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs text-neutral-500 mb-1">{lang === 'ja' ? '件名' : 'Subject'}</div>
              <div className="font-semibold text-neutral-900">{previewDraft.subject}</div>
            </div>
            <div className="p-4 bg-white border border-neutral-200 rounded-lg">
              <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{previewDraft.body}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { openGmail(previewDraft); setPreviewDraft(null); }} className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"><MailOpen size={14} className="inline mr-1" /> {lang === 'ja' ? 'Gmailで開く' : 'Open in Gmail'}</button>
              <button onClick={() => { copyTxt(previewDraft.body); }} className="px-4 py-2.5 bg-white border border-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-50"><Copy size={14} className="inline mr-1" /> {lang === 'ja' ? 'コピー' : 'Copy'}</button>
            </div>
          </div>
        </Modal>
      )}

      {slide >= 0 && slideItems.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black" onClick={() => setSlide(-1)}>
          <button onClick={() => setSlide(-1)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"><X size={20} /></button>
          <div className="h-full flex items-center justify-center p-8">
            {slideItems[slide]._t === 'img' ? (
              <img src={slideItems[slide].url} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Quote size={24} className="text-white/60" />
                  <div className="font-semibold text-xl">{slideItems[slide].name}</div>
                </div>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{slideItems[slide].text}</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slideItems.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setSlide(i); }} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}

      {aiResult && (
        <Modal onClose={() => setAiResult(null)} wide borderRadius={T.cr}>
          <div className="text-center mb-6">
            <Sparkles size={32} className="mx-auto mb-3" style={{ color: T.c }} />
            <h3 className="text-xl font-semibold">{aiResult.type === 'future' ? (lang === 'ja' ? '10年後の未来予想図' : 'Future Vision (10 years)') : (lang === 'ja' ? '誕生日スピーチ' : 'Birthday Speech')}</h3>
          </div>
          <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{aiResult.text}</div>
          <button onClick={() => copyTxt(aiResult.text)} className="mt-4 w-full py-2.5 bg-white border border-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2"><Copy size={14} /> {lang === 'ja' ? 'コピー' : 'Copy'}</button>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {!isAdmin && !['home', 'rsvp', 'telegram', 'gallery', 'media'].includes(page) && (
        <div className="fixed bottom-6 left-6 z-[30]">
          <button onClick={() => go('login')} className="px-4 py-2 bg-white/90 backdrop-blur-lg border border-neutral-200 shadow-lg rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:shadow-xl transition-all flex items-center gap-1.5"><Lock size={12} /> {t('admin_login_link')}</button>
        </div>
      )}

      <style>{`
        .fin { animation: fadeIn .6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .sb { animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}
