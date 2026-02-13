// src/App.jsx - 完全版（多言語対応 + IME完全修正 + Modal外部化）
import { useState, useEffect, useMemo, useRef, useCallback } from ‘react’;
import {
Heart, Calendar, MapPin, Camera, Send, Users, Gift, Play,
X, Plus, MessageSquare, Quote, Settings, Lock, Unlock,
ExternalLink, Mail, Trash2, Upload, Download, Bell,
AlertCircle, Share2, ChevronDown, Palette, HelpCircle,
Database, Newspaper, ListTodo, Layout, FileUp, Check,
Sparkles, Loader2, CheckCircle2, Eye,
MailOpen, RefreshCw, Copy, Menu, Wand2, Pencil, Globe
} from ‘lucide-react’;
import { useFirestore } from ‘./hooks/useFirestore’;

/* ─── 翻訳データ ─── */
const translations = {
ja: {
nav_home: ‘ホーム’, nav_rsvp: ‘参加表明’, nav_telegram: ‘お祝い電報’, nav_gallery: ‘写真館’, nav_media: ‘メディア’,
birthday_congrats: ‘歳 おめでとう’, rsvp_button: ‘参加を表明する’, send_message: ‘お祝いメッセージを送る’,
scroll: ‘Scroll’, updates: ‘お知らせ’, schedule: ‘当日の流れ’,
schedule_note: ‘当日はオープンハウス形式です。いつ来ていつ退出されても構いません。ご都合の良い時間帯にお越しください。’,
schedule_caution: ‘※ 本人の体調や機嫌により、スケジュールが前後したり予告なく中止になる場合がございます。ご了承ください。’,
venue: ‘会場’, venue_locked: ‘参加表明をしていただくと会場の詳細が表示されます’, view_map: ‘大きな地図で見る’,
gift_list: ‘ギフトリスト’, gift_desc: ‘Amazon欲しいものリストより’, view_list: ‘リストを見る’,
rsvp_title: ‘参加表明’, rsvp_closed: ‘受付は終了しました’, name_required: ‘お名前 *’, name_placeholder: ‘例: 山田太郎’,
email_label: ‘メールアドレス’, email_thank_you: ‘（お礼メール送付先）’, email_placeholder: ‘example@mail.com’,
email_ai_note: ‘✉️ AIが作成したお礼メールが届きます’, attendance: ‘出欠’, attend_yes: ‘🎉 出席します’, attend_no: ‘😢 欠席します’,
message_optional: ‘メッセージ（任意）’, message_placeholder: ‘お祝いメッセージ…’, ai_refine: ‘AI校正’,
ai_tip: ‘AIが文章を整えてくれます’, submit: ‘回答を送信’, telegrams_title: ‘皆様からのメッセージ’,
send_telegram: ‘メッセージを送る’, waiting_messages: ‘メッセージを待っています…’, gallery_title: ‘思い出の写真館’,
slideshow: ‘スライドショー’, upload_photo: ‘写真を投稿’, no_photos: ‘まだ写真がありません’,
media_title: ‘メディア’, media_subtitle: ‘Tomoeちゃんの思い出と楽曲’, songs: ‘楽曲’, scores: ‘楽譜’, timeline: ‘成長の記録’,
back_to_top: ‘← トップへ戻る’, message_modal_title: ‘お祝いメッセージ’, message_modal_subtitle: ‘ちゃんへ心を込めて’,
upload_modal_title: ‘写真を投稿’, uploader_name: ‘投稿者のお名前’, upload_button: ‘アップロード’, max_photos: ‘最大10枚’,
admin_login: ‘管理画面’, admin_id: ‘Admin ID’, password: ‘Password’, login: ‘ログイン’, admin_panel: ‘管理パネル’,
login_success: ‘ログインしました’, login_failed: ‘IDまたはパスワードが違います’, rsvp_success: ‘登録ありがとうございます！’,
rsvp_ai_preparing: ‘登録完了！お礼メールを準備中…’, message_sent: ‘メッセージを送信しました’, photo_shared: ‘写真を共有しました’,
ai_refined: ‘AIが文章を整えました ✨’, ai_failed: ‘AI校正に失敗’, copied: ‘コピーしました’, url_copied: ‘URLをコピー’,
admin_login_link: ‘管理者ログイン’, share_site: ‘サイトをシェア’, birthday_party: ‘歳 生誕祭 🎂’,
loading: ‘読み込み中…’, creating_email: ‘AIメール作成中…’,
},
en: {
nav_home: ‘Home’, nav_rsvp: ‘RSVP’, nav_telegram: ‘Messages’, nav_gallery: ‘Gallery’, nav_media: ‘Media’,
birthday_congrats: ‘years old’, rsvp_button: ‘RSVP Now’, send_message: ‘Send Message’,
scroll: ‘Scroll’, updates: ‘Updates’, schedule: ‘Schedule’,
schedule_note: ‘This is an open house format. You can arrive and leave at your convenience.’,
schedule_caution: ’* Schedule may change due to the birthday child's condition.’,
venue: ‘Venue’, venue_locked: ‘Venue details will be shown after RSVP’, view_map: ‘View on Map’,
gift_list: ‘Gift Registry’, gift_desc: ‘Amazon Wishlist’, view_list: ‘View List’,
rsvp_title: ‘RSVP’, rsvp_closed: ‘RSVP is now closed’, name_required: ‘Name *’, name_placeholder: ‘e.g. John Smith’,
email_label: ‘Email’, email_thank_you: ‘(for thank you email)’, email_placeholder: ‘example@mail.com’,
email_ai_note: ‘✉️ You'll receive an AI-generated thank you email’, attendance: ‘Attendance’,
attend_yes: ‘🎉 I will attend’, attend_no: ‘😢 I cannot attend’, message_optional: ‘Message (optional)’,
message_placeholder: ‘Your message…’, ai_refine: ‘AI Polish’, ai_tip: ‘AI will refine your message’, submit: ‘Submit’,
telegrams_title: ‘Messages from Guests’, send_telegram: ‘Send Message’, waiting_messages: ‘Waiting for messages…’,
gallery_title: ‘Photo Gallery’, slideshow: ‘Slideshow’, upload_photo: ‘Upload Photo’, no_photos: ‘No photos yet’,
media_title: ‘Media’, media_subtitle: ‘Memories and Songs’, songs: ‘Songs’, scores: ‘Sheet Music’, timeline: ‘Growth Timeline’,
back_to_top: ‘← Back to Top’, message_modal_title: ‘Send Message’, message_modal_subtitle: ‘With love’,
upload_modal_title: ‘Upload Photos’, uploader_name: ‘Your Name’, upload_button: ‘Upload’, max_photos: ‘Max 10 photos’,
admin_login: ‘Admin Login’, admin_id: ‘Admin ID’, password: ‘Password’, login: ‘Login’, admin_panel: ‘Admin Panel’,
login_success: ‘Logged in successfully’, login_failed: ‘Invalid ID or password’, rsvp_success: ‘Thank you for your RSVP!’,
rsvp_ai_preparing: ‘RSVP received! Preparing thank you email…’, message_sent: ‘Message sent successfully’,
photo_shared: ‘Photos uploaded successfully’, ai_refined: ‘AI refined your message ✨’, ai_failed: ‘AI refinement failed’,
copied: ‘Copied to clipboard’, url_copied: ‘URL copied’, admin_login_link: ‘Admin Login’, share_site: ‘Share Site’,
birthday_party: ‘Birthday Party 🎂’, loading: ‘Loading…’, creating_email: ‘Creating AI email…’,
}
};

/* ─── 共通コンポーネント（App外部で定義） ─── */

const Tip = ({ text }) => {
const [o, setO] = useState(false);
return (
<span className="relative inline-flex items-center ml-1">
<HelpCircle size={13} className=“text-neutral-400 hover:text-rose-500 cursor-help” onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)} onClick={() => setO(!o)} />
{o && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 bg-neutral-900 text-white text-[11px] leading-relaxed rounded-lg shadow-xl z-[999] pointer-events-none">{text}<span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neutral-900" /></span>}
</span>
);
};

const Toast = ({ msg, onClose }) => {
useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
return <div className=“fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2” style={{ animation: ‘slideUp .3s ease-out’ }}><Check size={14} className="text-emerald-400" />{msg}</div>;
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

/* ✅ IME対応バッファ付き入力 — 変換中はFirestore書き込みを抑止 */
const BufferedInput = ({ value, onSave, className, placeholder, type = ‘text’, …rest }) => {
const [local, setLocal] = useState(value);
const composing = useRef(false);
const saved = useRef(value);
useEffect(() => { if (!composing.current) { setLocal(value); saved.current = value; } }, [value]);
const flush = (v) => { if (v !== saved.current) { saved.current = v; onSave(v); } };
const handleKeyDown = (e) => { if (e.key === ‘Enter’ && !composing.current) { e.target.blur(); } };
return type === ‘textarea’ ? (
<textarea
value={local}
onChange={e => setLocal(e.target.value)}
onCompositionStart={() => { composing.current = true; }}
onCompositionEnd={e => { composing.current = false; setLocal(e.target.value); }}
onBlur={() => flush(local)}
className={className}
placeholder={placeholder}
{…rest}
/>
) : (
<input
type={type}
value={local}
onChange={e => setLocal(e.target.value)}
onCompositionStart={() => { composing.current = true; }}
onCompositionEnd={e => { composing.current = false; setLocal(e.target.value); }}
onBlur={() => flush(local)}
onKeyDown={handleKeyDown}
className={className}
placeholder={placeholder}
{…rest}
/>
);
};

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
const [lang, setLang] = useState(() => localStorage.getItem(‘lang’) || ‘ja’);
const t = (key) => translations[lang][key] || key;

useEffect(() => {
localStorage.setItem(‘lang’, lang);
}, [lang]);

const toggleLang = () => setLang(l => l === ‘ja’ ? ‘en’ : ‘ja’);

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

const [page, setPage] = useState(‘home’);
const [toast, setToast] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [aTab, setATab] = useState(‘settings’);
const [loginId, setLoginId] = useState(’’);
const [loginPw, setLoginPw] = useState(’’);
const [menuOpen, setMenuOpen] = useState(false);
const [hasRsvped, setHasRsvped] = useState(false);
const [isComposing, setIsComposing] = useState(false);

const [genLoading, setGenLoading] = useState(null);
const [previewDraft, setPreviewDraft] = useState(null);

const [rName, setRName] = useState(’’);
const [rEmail, setREmail] = useState(’’);
const [rAtt, setRAtt] = useState(‘yes’);
const [rMsg, setRMsg] = useState(’’);
const [mName, setMName] = useState(’’);
const [mText, setMText] = useState(’’);
const [uName, setUName] = useState(’’);
const [uImgs, setUImgs] = useState([]);

const [showMsg, setShowMsg] = useState(false);
const [showUp, setShowUp] = useState(false);
const [slide, setSlide] = useState(-1);
const [aiRefining, setAiRefining] = useState(false);
const [aiResult, setAiResult] = useState(null);
const [aiLoading, setAiLoading] = useState(false);

const [showSchedForm, setShowSchedForm] = useState(false);
const [newSchedTime, setNewSchedTime] = useState(’’);
const [newSchedTitle, setNewSchedTitle] = useState(’’);
const [editSchedId, setEditSchedId] = useState(null);
const [editSchedTime, setEditSchedTime] = useState(’’);
const [editSchedTitle, setEditSchedTitle] = useState(’’);

const [showNewsForm, setShowNewsForm] = useState(false);
const [newNewsTitle, setNewNewsTitle] = useState(’’);
const [newNewsContent, setNewNewsContent] = useState(’’);

const [showScore, setShowScore] = useState(false);
const [uVideoUrl, setUVideoUrl] = useState(’’);
const [newEmbedTitle, setNewEmbedTitle] = useState(’’);
const [newEmbedUrl, setNewEmbedUrl] = useState(’’);

const [selGuests, setSelGuests] = useState([]);

const [editPhotoId, setEditPhotoId] = useState(null);
const [editPhotoName, setEditPhotoName] = useState(’’);
const [adminUpImgs, setAdminUpImgs] = useState([]);
const [adminUpName, setAdminUpName] = useState(’’);
const [selPhotos, setSelPhotos] = useState([]);

const fileRef = useRef(null);
const topRef = useRef(null);
const impRef = useRef(null);

const notify = useCallback(m => setToast(m), []);
const sc = (c) => updateConfig(c);

const T = useMemo(() => {
const s = cfg.style;
return {
c: cfg.color || ‘#be123c’,
font: s === ‘elegant’ ? “‘Noto Serif JP’,Georgia,serif” : s === ‘playful’ ? “‘M PLUS Rounded 1c’,Nunito,sans-serif” : “‘Inter’,‘Helvetica Neue’,sans-serif”,
r: s === ‘playful’ ? ‘1.25rem’ : s === ‘modern’ ? ‘.375rem’ : ‘.625rem’,
cr: s === ‘playful’ ? ‘1.5rem’ : s === ‘modern’ ? ‘.5rem’ : ‘.875rem’,
};
}, [cfg.color, cfg.style]);

const age = useMemo(() => {
const b = new Date(cfg.birthDate), e = new Date(cfg.eventDate);
if (isNaN(b) || isNaN(e)) return 0;
let a = e.getFullYear() - b.getFullYear();
if (e.getMonth() < b.getMonth() || (e.getMonth() === b.getMonth() && e.getDate() < b.getDate())) a–;
return Math.max(0, a);
}, [cfg.birthDate, cfg.eventDate]);

const closed = useMemo(() => new Date() > new Date(cfg.rsvpDeadline), [cfg.rsvpDeadline]);
const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(cfg.address)}`;
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(cfg.address)}&output=embed`;

const slideItems = useMemo(() => [
…photos.filter(p => !p.url || !p.url.startsWith(’__video:’)).map(p => ({ …p, _t: ‘img’ })),
…msgs.map(m => ({ …m, _t: ‘msg’ })),
].sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0)), [photos, msgs]);

useEffect(() => {
if (slide < 0 || !slideItems.length) return;
const ms = (cfg.slideInterval || 2.7) * 1000;
const t = setInterval(() => setSlide(p => (p + 1) % slideItems.length), ms);
return () => clearInterval(t);
}, [slide, slideItems.length, cfg.slideInterval]);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const compress = (file, q = 0.45) => new Promise(res => {
const r = new FileReader();
r.onload = e => { const img = new Image(); img.onload = () => { const c = document.createElement(‘canvas’); const M = 1200; let w = img.width, h = img.height; if (w > h) { if (w > M) { h *= M / w; w = M; } } else { if (h > M) { w *= M / h; h = M; } } c.width = w; c.height = h; c.getContext(‘2d’).drawImage(img, 0, 0, w, h); res(c.toDataURL(‘image/jpeg’, q)); }; img.src = e.target.result; };
r.readAsDataURL(file);
});

const btnS = { backgroundColor: T.c, borderRadius: T.r, color: ‘#fff’ };
const iCls = “w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200/60 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none”;

const imeHandlers = {
onCompositionStart: () => setIsComposing(true),
onCompositionEnd: () => setIsComposing(false),
};

const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const callAI = async (prompt) => {
const headers = { “Content-Type”: “application/json” };
if (CLAUDE_KEY) headers[“x-api-key”] = CLAUDE_KEY;
const res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”, headers,
body: JSON.stringify({ model: “claude-sonnet-4-20250514”, max_tokens: 1000, messages: [{ role: “user”, content: prompt }] }),
});
const d = await res.json();
return (d.content || []).filter(b => b.type === ‘text’).map(b => b.text).join(’’).trim();
};

const refineMsg = async () => {
if (!rMsg || rMsg.length < 3) return;
setAiRefining(true);
try { setRMsg(await callAI(`以下のお祝いメッセージを温かみのある洗練された文章に校正。元の気持ちを大切に。校正後のみ出力:\n\n${rMsg}`)); notify(t(‘ai_refined’)); }
catch { notify(t(‘ai_failed’)); } finally { setAiRefining(false); }
};

const genEmail = async (name, att) => {
const schedT = […sched].sort((a, b) => (a.time || ‘’).localeCompare(b.time || ‘’)).map(s => `  ${s.time} - ${s.title}`).join(’\n’);
const p = att === ‘yes’
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
  ルール: 350文字程度、温かい文体、本文のみ、「${cfg.senderName}より」で締める`:`あなたは「${cfg.senderName}」です。${name}さんが${cfg.name}の誕生日会に欠席返信。気遣いのある返信100文字程度。本文のみ。「${cfg.senderName}より」で締める。`; try { return await callAI(p); } catch { return att === 'yes' ? `${name}さん、ご出席ありがとうございます！\n\n📍${cfg.venue}（${cfg.address}）\n🗺️${mapUrl}\n\n当日はオープンハウス形式です。いつ来ていつ退出しても構いません。\n※本人の体調や機嫌によりスケジュールが変更になる場合がございます。\n\n🎁${cfg.amazonUrl}\n\n${cfg.senderName}より`:`${name}さん、お返事ありがとうございます。\n\n${cfg.senderName}より`; }
  };
  
  const autoGenDraft = async (rid, name, email, att) => {
  if (!cfg.autoReplyEnabled || !email) return;
  setGenLoading(rid);
  try {
  const body = await genEmail(name, att);
  const subj = att === ‘yes’ ? `ご出席ありがとうございます🎉 ${cfg.name}の生誕祭` : `お返事ありがとうございます - ${cfg.name}の生誕祭`;
  await addEmailDraft({ id: uid(), rsvpId: rid, name, email, att, body, subject: subj, status: ‘draft’ });
  } catch {} finally { setGenLoading(null); }
  };
  
  const openGmail = async (d) => {
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(d.email)}&su=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`, ‘_blank’);
  await updateEmailDraft(d.id, { status: ‘sent’, sentAt: new Date().toISOString() });
  notify(`${d.name}さんへのメールをGmailで開きました`);
  };
  
  const regenDraft = async (id) => {
  const d = emailDrafts.find(x => x.id === id); if (!d) return;
  setGenLoading(d.rsvpId);
  try {
  const body = await genEmail(d.name, d.att);
  await updateEmailDraft(id, { body, status: ‘draft’ });
  notify(‘再生成しました’);
  } catch { notify(‘失敗’); } finally { setGenLoading(null); }
  };
  
  const aiTool = async (type) => {
  setAiLoading(true); setAiResult(null);
  const prompts = {
  future: `${cfg.name}ちゃんは今日${age}歳の誕生日。10年後の幸せな未来予想図を温かくユーモラスに300文字程度で日本語で。`,
  speech: `${cfg.name}の${age}歳誕生日会で${cfg.senderName}が述べる挨拶スピーチ原稿を400文字程度で。感謝と愛情が伝わる感動的な内容。`,
  };
  try { setAiResult({ type, text: await callAI(prompts[type]) }); }
  catch { notify(‘AI生成に失敗’); } finally { setAiLoading(false); }
  };
  
  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };
  
  const doLogin = () => {
  if (loginId === cfg.adminId && loginPw === cfg.adminPass) { setIsAdmin(true); setPage(‘admin’); notify(t(‘login_success’)); }
  else notify(t(‘login_failed’));
  };
  
  const doRsvp = async () => {
  if (!rName || closed || isComposing) return;
  const { id: rid, name: n, email: e, att: a } = await submitRsvp({ name: rName, email: rEmail, att: rAtt, msg: rMsg });
  setRName(’’); setREmail(’’); setRAtt(‘yes’); setRMsg(’’);
  setHasRsvped(true);
  go(‘telegram’);
  notify(e && cfg.autoReplyEnabled ? t(‘rsvp_ai_preparing’) : t(‘rsvp_success’));
  if (e && cfg.autoReplyEnabled) autoGenDraft(rid, n, e, a);
  };
  
  const doMsg = async () => {
  if (!mName || !mText || isComposing) return;
  await submitMessage({ name: mName, text: mText });
  setMName(’’); setMText(’’); setShowMsg(false); go(‘telegram’); notify(t(‘message_sent’));
  };
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const doFiles = async e => { const f = Array.from(e.target.files).slice(0, 10); if (!f.length) return; setUImgs(await Promise.all(f.map(x => compress(x)))); e.target.value = ‘’; };
  const doUpload = async () => {
  if ((!uImgs.length && !uVideoUrl) || !uName || isComposing || uploading) return;
  const imgs = […uImgs]; const name = uName; const videoUrl = uVideoUrl;
  const totalItems = imgs.length + (videoUrl ? 1 : 0);
  setUploading(true); setUImgs([]); setUploadProgress({ current: 0, total: totalItems });
  try {
  // 写真を1枚ずつアップロード
  for (let i = 0; i < imgs.length; i++) {
  setUploadProgress({ current: i, total: totalItems });
  await submitPhotos(name, [imgs[i]]);
  }
  // 動画URL
  if (videoUrl) {
  setUploadProgress({ current: imgs.length, total: totalItems });
  const embed = videoUrl.includes(‘youtu’) ? videoUrl.replace(‘watch?v=’, ‘embed/’).replace(‘youtu.be/’, ‘youtube.com/embed/’) : videoUrl.includes(‘vimeo’) ? videoUrl.replace(‘vimeo.com/’, ‘player.vimeo.com/video/’) : videoUrl;
  if (store.addVideo) { await store.addVideo(name, embed); }
  else if (submitPhotos) { await submitPhotos(name, [’__video:’ + embed]); }
  }
  setUploadProgress({ current: totalItems, total: totalItems });
  setUName(’’); setUVideoUrl(’’); setShowUp(false); notify(t(‘photo_shared’));
  } catch (err) {
  console.error(‘Upload error:’, err);
  setUImgs(imgs);
  notify(lang === ‘ja’ ? ’アップロード失敗: ’ + (err.message || ‘’) : ’Upload failed: ’ + (err.message || ‘’));
  } finally { setUploading(false); setUploadProgress({ current: 0, total: 0 }); }
  };
  const doTopImg = async e => { const f = e.target.files[0]; if (!f) return; const d = await compress(f, 0.5); const url = await uploadImage(d, ‘topImage/hero.jpg’); sc({ topImg: url }); notify(‘更新’); };
  const doScorePdf = async e => {
  const f = e.target.files[0]; if (!f) return;
  if (f.type !== ‘application/pdf’) { notify(lang === ‘ja’ ? ‘PDFファイルを選択してください’ : ‘Please select a PDF file’); return; }
  notify(lang === ‘ja’ ? ‘アップロード中…’ : ‘Uploading…’);
  try {
  const reader = new FileReader();
  const dataUrl = await new Promise((res, rej) => { reader.onload = () => res(reader.result); reader.onerror = rej; reader.readAsDataURL(f); });
  const url = await uploadImage(dataUrl, ‘scores/score.pdf’);
  sc({ scoreUrl: url }); notify(lang === ‘ja’ ? ‘楽譜をアップロードしました’ : ‘Score uploaded’);
  } catch (err) { console.error(err); notify(lang === ‘ja’ ? ‘アップロード失敗’ : ‘Upload failed’); }
  e.target.value = ‘’;
  };
  const doLike = (id) => { const p = photos.find(x => x.id === id); if (p) likePhoto(id, p.likes); };
  
  const doAddSched = async () => { if (!newSchedTime || !newSchedTitle || isComposing) return; await addSchedule(newSchedTime, newSchedTitle); setNewSchedTime(’’); setNewSchedTitle(’’); setShowSchedForm(false); notify(‘追加’); };
  
  const doAdminUpFiles = async e => { const f = Array.from(e.target.files).slice(0, 10); if (!f.length) return; setAdminUpImgs(await Promise.all(f.map(x => compress(x)))); e.target.value = ‘’; };
  const doAdminUpload = async () => {
  if (!adminUpImgs.length || !adminUpName || isComposing || uploading) return;
  const imgs = […adminUpImgs]; const name = adminUpName;
  setUploading(true); setAdminUpImgs([]); setUploadProgress({ current: 0, total: imgs.length });
  try {
  for (let i = 0; i < imgs.length; i++) {
  setUploadProgress({ current: i, total: imgs.length });
  await submitPhotos(name, [imgs[i]]);
  }
  setUploadProgress({ current: imgs.length, total: imgs.length });
  setAdminUpName(’’); notify(lang === ‘ja’ ? ‘写真を追加しました’ : ‘Photos added’);
  } catch (err) {
  console.error(‘Admin photo upload error:’, err);
  setAdminUpImgs(imgs);
  notify(lang === ‘ja’ ? ‘アップロード失敗: ’ + (err.message || ‘’) : ‘Upload failed: ’ + (err.message || ‘’));
  } finally { setUploading(false); setUploadProgress({ current: 0, total: 0 }); }
  };
  const startEditPhoto = (p) => { setEditPhotoId(p.id); setEditPhotoName(p.name || ‘’); };
  const saveEditPhoto = async () => {
  if (!editPhotoName || !editPhotoId) return;
  if (store.updatePhoto) { await store.updatePhoto(editPhotoId, { name: editPhotoName }); }
  setEditPhotoId(null); setEditPhotoName(’’); notify(lang === ‘ja’ ? ‘更新しました’ : ‘Updated’);
  };
  const toggleSelPhoto = (id) => setSelPhotos(s => s.includes(id) ? s.filter(x => x !== id) : […s, id]);
  const selectAllPhotos = () => setSelPhotos(selPhotos.length === photos.length ? [] : photos.map(p => p.id));
  const deleteSelPhotos = async () => {
  if (!selPhotos.length) return;
  for (const id of selPhotos) { await deletePhoto(id); }
  setSelPhotos([]); notify(lang === ‘ja’ ? `${selPhotos.length}枚削除しました` : `Deleted ${selPhotos.length} photos`);
  };
  const downloadPhoto = async (url, name) => {
  try {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement(‘a’);
  a.href = URL.createObjectURL(blob);
  a.download = `${name || 'photo'}_${Date.now()}.jpg`;
  a.click();
  URL.revokeObjectURL(a.href);
  } catch { window.open(url, ‘_blank’); }
  };
  const startEditSched = (s) => { setEditSchedId(s.id); setEditSchedTime(s.time); setEditSchedTitle(s.title); };
  const saveEditSched = async () => { if (!editSchedTime || !editSchedTitle || isComposing) return; await updateSchedule(editSchedId, editSchedTime, editSchedTitle); setEditSchedId(null); notify(‘更新’); };
  const cancelEditSched = () => setEditSchedId(null);
  
  const doAddNews = async () => { if (!newNewsTitle || isComposing) return; await addNews(newNewsTitle, newNewsContent); setNewNewsTitle(’’); setNewNewsContent(’’); setShowNewsForm(false); notify(‘追加’); };
  
  const doExport = () => {
  const data = exportAll();
  const b = new Blob([JSON.stringify(data, null, 2)], { type: ‘application/json’ });
  const a = document.createElement(‘a’); a.href = URL.createObjectURL(b); a.download = `tomoe_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };
  const doImport = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async (ev) => { try { await importAll(JSON.parse(ev.target.result)); notify(‘復元しました’); } catch { notify(‘無効’); } };
  r.readAsText(f);
  };
  
  const doBulkMail = () => { const em = rsvps.filter(g => selGuests.includes(g.id) && g.email).map(g => g.email).join(’,’); if (em) window.location.href = `mailto:${em}?subject=${encodeURIComponent(cfg.name + 'の誕生日会')}`; };
  const copyTxt = txt => { navigator.clipboard?.writeText(txt); notify(t(‘copied’)); };
  
  const draftCt = emailDrafts.filter(d => d.status === ‘draft’).length;
  const sentCt = emailDrafts.filter(d => d.status === ‘sent’).length;
  
  const guestNavs = [
  { id: ‘home’, icon: Calendar, l: t(‘nav_home’) },
  { id: ‘rsvp’, icon: Send, l: t(‘nav_rsvp’) },
  { id: ‘telegram’, icon: Heart, l: t(‘nav_telegram’) },
  { id: ‘gallery’, icon: Camera, l: t(‘nav_gallery’) },
  …(cfg.showMediaPage ? [{ id: ‘media’, icon: Play, l: t(‘nav_media’) }] : []),
  ];
  
  const isGuestPage = [‘home’, ‘rsvp’, ‘telegram’, ‘gallery’, ‘media’, ‘news’].includes(page);
  
  if (!ready) {
  return (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
  <div className="text-center">
  <Loader2 size={32} className=“animate-spin mx-auto mb-4” style={{ color: cfg.color || ‘#be123c’ }} />
  <p className="text-sm text-neutral-400">{t(‘loading’)}</p>
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
  
  ```
  {isGuestPage && (
    <nav className={`hidden md:block fixed top-0 inset-x-0 z-[80] bg-white border-b border-neutral-100 shadow-sm ${cfg.announcement ? 'mt-8' : ''}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
        <span className="text-sm font-semibold" style={{ color: T.c }}>{lang === 'en' ? (cfg.nameEn || 'Tomoe') : cfg.name}{lang === 'ja' ? 'の生誕祭' : '\'s Birthday'}</span>
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
      <div className="fin">
        <div className="relative flex items-center justify-center overflow-hidden bg-white" style={{ minHeight: 'min(70vh, 520px)' }}>
          {cfg.topImg ? (<div className="absolute inset-0"><img src={cfg.topImg} className="w-full h-full object-cover opacity-25 scale-105 blur-[1px]" alt="" /><div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-neutral-50" /></div>) : <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]"><Heart size={480} style={{ color: T.c }} /></div>}
          <div className="relative z-10 max-w-xl px-6 text-center">
            <p className="tracking-[.5em] text-[11px] uppercase mb-5 font-medium" style={{ color: T.c + 'aa' }}>{cfg.heroSub}</p>
            <h1 className="text-5xl md:text-8xl font-light text-neutral-900 mb-3 tracking-tight leading-none">{lang === 'en' ? (cfg.nameEn || 'TOMOE') : cfg.name}</h1>
            <p className="text-2xl md:text-4xl font-light mb-3 tracking-tight" style={{ color: T.c }}>{age} {lang === 'en' ? (age === 1 ? 'year old' : 'years old') : t('birthday_congrats')}</p>
            <p className="text-sm md:text-base text-neutral-500 mb-10 tracking-wide">{new Date(cfg.eventDate).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', { year: "numeric", month: "long", day: "numeric" })}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => go('rsvp')} className="px-7 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" style={btnS}>{t('rsvp_button')}</button>
              <button onClick={() => setShowMsg(true)} className="px-7 py-3.5 text-sm font-semibold bg-white border border-neutral-200 shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2" style={{ borderRadius: T.r, color: T.c }}><MessageSquare size={15} /> {t('send_message')}</button>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-neutral-400 sb"><span className="text-[10px] tracking-[.3em] uppercase font-medium">{t('scroll')}</span><ChevronDown size={15} /></div>
        </div>
  
        {/* 写真カルーセル */}
        {photos.filter(p => !p.url?.startsWith('__video:')).length > 0 && (
          <div className="py-10 md:py-16 overflow-hidden">
            <div className="mb-6 text-center">
              <button onClick={() => go('gallery')} className="text-xs font-semibold tracking-[.2em] uppercase hover:underline" style={{ color: T.c + 'aa' }}>
                {lang === 'ja' ? '📷 みんなの写真' : '📷 Guest Photos'}
              </button>
            </div>
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {photos.filter(p => !p.url?.startsWith('__video:')).map(p => (
                  <div key={p.id} className="snap-center shrink-0 w-48 md:w-64 aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-md hover:shadow-xl transition-all cursor-pointer relative group" onClick={() => setSlide(photos.indexOf(p))}>
                    <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-3 right-3">
                        <div className="text-white text-xs font-medium">{p.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* ギャラリーへのリンクカード */}
                <div className="snap-center shrink-0 w-48 md:w-64 aspect-square rounded-xl overflow-hidden border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all" onClick={() => go('gallery')}>
                  <Camera size={28} className="text-neutral-300" />
                  <span className="text-xs font-medium text-neutral-400">{lang === 'ja' ? 'もっと見る →' : 'View all →'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* お知らせ */}
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <ST title={t('updates')} />
          <div className="space-y-4">
            {news.length ? news.slice(0, 5).map(n => (
              <div key={n.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 hover:shadow-md transition-shadow">
                <div className="text-[10px] text-neutral-400 mb-1">{new Date(n.ts).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
                <h3 className="font-semibold text-neutral-900 mb-1">{n.title}</h3>
                {n.content && <p className="text-sm text-neutral-600 whitespace-pre-wrap">{n.content}</p>}
              </div>
            )) : <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'お知らせはまだありません' : 'No updates yet'}</p>}
            {news.length > 5 && (
              <div className="text-center pt-2">
                <button onClick={() => go('news')} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all" style={{ color: T.c }}><Newspaper size={14} /> {lang === 'ja' ? 'すべてのお知らせを見る' : 'View all updates'} ({news.length})</button>
              </div>
            )}
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
  
        {/* QRコード シェア */}
        <div className="py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <ST title={lang === 'ja' ? 'このサイトをシェア' : 'Share This Site'} />
            <div className="inline-block bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(location.href)}&color=${(T.c || '#be123c').replace('#', '')}`} alt="QR Code" className="w-44 h-44 md:w-48 md:h-48" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{lang === 'ja' ? 'カメラでスキャンしてサイトにアクセス' : 'Scan to visit this site'}</p>
            <button onClick={() => { if (navigator.share) navigator.share({ title: `${cfg.name}${lang === 'ja' ? 'の生誕祭' : '\'s Birthday'}`, url: location.href }); else { navigator.clipboard?.writeText(location.href); notify(t('url_copied')); } }} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-500 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-all"><Share2 size={12} /> {t('share_site')}</button>
          </div>
        </div>
      </div>
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
        <ST title={lang === 'ja' ? '思い出の写真・動画館' : 'Photo & Video Gallery'} />
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => photos.length && setSlide(0)} disabled={!photos.length} className="px-5 py-2.5 text-sm font-medium bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"><Play size={14} /> {t('slideshow')}</button>
          <button onClick={() => setShowUp(true)} className="px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2" style={btnS}><Upload size={14} /> {lang === 'ja' ? '投稿する' : 'Upload'}</button>
        </div>
        {photos.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map(p => {
              const isVideo = p.url && p.url.startsWith('__video:');
              const videoSrc = isVideo ? p.url.replace('__video:', '') : null;
              return (
                <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => !isVideo && setSlide(photos.indexOf(p))}>
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                      <iframe src={videoSrc} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video" />
                    </div>
                  ) : (
                    <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2.5 pt-10">
                    <div className="text-white text-[13px] font-semibold truncate drop-shadow-sm">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {!isVideo && <button className="flex items-center gap-1 text-white/80 text-[11px] hover:text-white" onClick={e => { e.stopPropagation(); doLike(p.id); }}><Heart size={11} className={p.likes > 0 ? 'fill-current text-rose-400' : ''} /> {p.likes || 0}</button>}
                      {isVideo && <span className="text-white/60 text-[10px] flex items-center gap-1"><Play size={10} /> {lang === 'ja' ? '動画' : 'Video'}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Camera size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-neutral-400 text-sm">{t('no_photos')}</p>
          </div>
        )}
      </div>
    )}
  
    {/* NEWS - お知らせ一覧 */}
    {page === 'news' && (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <ST title={lang === 'ja' ? 'お知らせ一覧' : 'All Updates'} sub={`${news.length} ${lang === 'ja' ? '件' : 'items'}`} />
        <div className="space-y-4">
          {news.length ? news.map(n => (
            <div key={n.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 hover:shadow-md transition-shadow">
              <div className="text-[10px] text-neutral-400 mb-1">{new Date(n.ts).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}</div>
              <h3 className="font-semibold text-neutral-900 mb-1">{n.title}</h3>
              {n.content && <p className="text-sm text-neutral-600 whitespace-pre-wrap">{n.content}</p>}
            </div>
          )) : <p className="text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'お知らせはまだありません' : 'No updates yet'}</p>}
        </div>
        <button onClick={() => go('home')} className="mt-8 mx-auto flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"><ChevronDown size={14} className="rotate-90" /> {t('back_to_top')}</button>
      </div>
    )}
  
    {/* MEDIA */}
    {page === 'media' && (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <ST title={t('media_title')} sub={t('media_subtitle')} />
        <div className="space-y-6">
          {cfg.youtubeUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Play size={16} style={{ color: T.c }} /> {t('songs')}</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
                <iframe src={cfg.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video" />
              </div>
            </div>
          )}
          {cfg.scoreUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FileUp size={16} style={{ color: T.c }} /> {t('scores')}</h3>
              <button onClick={() => setShowScore(true)} className="w-full p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"><FileUp size={18} className="text-neutral-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{lang === 'ja' ? '楽譜を見る' : 'View Score'}</div>
                    <div className="text-xs text-neutral-500">PDF</div>
                  </div>
                  <Eye size={14} className="text-neutral-400" />
                </div>
              </button>
            </div>
          )}
          {(cfg.mediaEmbeds || []).map((m, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Play size={16} style={{ color: T.c }} /> {m.title}</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
                <iframe src={m.url} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={m.title} />
              </div>
            </div>
          ))}
          {!cfg.youtubeUrl && !cfg.scoreUrl && !(cfg.mediaEmbeds || []).length && (
            <div className="text-center py-16">
              <Play size={48} className="mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-400 text-sm">{lang === 'ja' ? 'メディアはまだありません' : 'No media yet'}</p>
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
              <Field label={lang === 'ja' ? 'お子様の名前' : 'Child Name'}><BufferedInput value={cfg.name} onSave={v => sc({ name: v })} className={iCls} /></Field>
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
                  <input type="file" accept="image/*" onChange={doTopImg} id="top-img-upload" className="hidden" />
                  <label htmlFor="top-img-upload" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer"><Upload size={14} /> {lang === 'ja' ? 'アップロード' : 'Upload'}</label>
                  {cfg.topImg && <img src={cfg.topImg} alt="" className="w-full h-32 object-cover rounded-lg" />}
                </div>
              </Field>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><MapPin size={16} /> {lang === 'ja' ? '会場情報' : 'Venue'}</h3>
              <Field label={lang === 'ja' ? '会場名' : 'Venue Name'}><BufferedInput value={cfg.venue} onSave={v => sc({ venue: v })} className={iCls} /></Field>
              <Field label={lang === 'ja' ? '住所' : 'Address'}><BufferedInput value={cfg.address} onSave={v => sc({ address: v })} className={iCls} /></Field>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Gift size={16} /> {lang === 'ja' ? 'リンク' : 'Links'}</h3>
              <Field label={lang === 'ja' ? 'Amazon欲しいものリスト' : 'Amazon Wishlist'}><BufferedInput value={cfg.amazonUrl} onSave={v => sc({ amazonUrl: v })} className={iCls} /></Field>
              <Field label={lang === 'ja' ? 'YouTube URL' : 'YouTube URL'}><BufferedInput value={cfg.youtubeUrl} onSave={v => sc({ youtubeUrl: v })} className={iCls} /></Field>
              <Field label={lang === 'ja' ? '楽譜PDF' : 'Score PDF'}>
                {cfg.scoreUrl && <div className="mb-2 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> {lang === 'ja' ? 'アップロード済み' : 'Uploaded'}</div>}
                <input type="file" accept="application/pdf" onChange={doScorePdf} id="score-pdf-upload" className="hidden" />
                <label htmlFor="score-pdf-upload" className="w-full px-4 py-3 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 hover:border-neutral-400 transition-all flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> {lang === 'ja' ? 'PDFをアップロード' : 'Upload PDF'}</label>
                {cfg.scoreUrl && <button onClick={() => sc({ scoreUrl: '' })} className="mt-2 text-xs text-red-500 hover:text-red-700">{lang === 'ja' ? '楽譜を削除' : 'Remove score'}</button>}
              </Field>
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={cfg.showMediaPage} onChange={e => sc({ showMediaPage: e.target.checked })} className="w-4 h-4 rounded" />
                {lang === 'ja' ? 'メディアページを表示' : 'Show Media Page'}
              </label>
              <Field label={lang === 'ja' ? 'スライドショー間隔（秒）' : 'Slideshow Interval (seconds)'}>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="10" step="0.1" value={cfg.slideInterval || 2.7} onChange={e => sc({ slideInterval: parseFloat(e.target.value) })} className="flex-1" />
                  <span className="text-sm font-semibold min-w-[3rem] text-right" style={{ color: T.c }}>{(cfg.slideInterval || 2.7).toFixed(1)}s</span>
                </div>
              </Field>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Layout size={16} /> {lang === 'ja' ? 'メディア（iframe埋め込み）' : 'Media Embeds (iframe)'}</h3>
              <p className="text-xs text-neutral-500">{lang === 'ja' ? 'YouTube, Spotify, SoundCloud, Google Maps等の埋め込みURLを追加できます' : 'Add embed URLs from YouTube, Spotify, SoundCloud, Google Maps, etc.'}</p>
              {(cfg.mediaEmbeds || []).map((m, i) => (
                <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 truncate flex-1">{m.title || `Media ${i + 1}`}</span>
                    <button onClick={() => { const arr = [...(cfg.mediaEmbeds || [])]; arr.splice(i, 1); sc({ mediaEmbeds: arr }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                  <div className="text-xs text-neutral-400 truncate">{m.url}</div>
                </div>
              ))}
              <div className="space-y-2 p-3 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                <input type="text" value={newEmbedTitle} onChange={e => setNewEmbedTitle(e.target.value)} className={iCls} placeholder={lang === 'ja' ? 'タイトル（例: テーマソング）' : 'Title (e.g. Theme Song)'} {...imeHandlers} />
                <input type="url" value={newEmbedUrl} onChange={e => setNewEmbedUrl(e.target.value)} className={iCls} placeholder={lang === 'ja' ? '埋め込みURL（iframe srcのURL）' : 'Embed URL (iframe src)'} />
                <button onClick={() => { if (!newEmbedUrl) return; const arr = [...(cfg.mediaEmbeds || []), { title: newEmbedTitle || 'Media', url: newEmbedUrl }]; sc({ mediaEmbeds: arr }); setNewEmbedTitle(''); setNewEmbedUrl(''); notify(lang === 'ja' ? '追加しました' : 'Added'); }} disabled={!newEmbedUrl} className="w-full py-2 text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-40" style={btnS}><Plus size={14} className="inline mr-1" /> {lang === 'ja' ? 'メディアを追加' : 'Add Media'}</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Mail size={16} /> {lang === 'ja' ? 'メール設定' : 'Email Settings'}</h3>
              <Field label={lang === 'ja' ? '送信者名' : 'Sender Name'}><BufferedInput value={cfg.senderName} onSave={v => sc({ senderName: v })} className={iCls} /></Field>
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={cfg.autoReplyEnabled} onChange={e => sc({ autoReplyEnabled: e.target.checked })} className="w-4 h-4 rounded" />
                {lang === 'ja' ? 'AI自動返信を有効化' : 'Enable AI Auto-Reply'}
              </label>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Bell size={16} /> {lang === 'ja' ? 'お知らせバー' : 'Announcement'}</h3>
              <Field label={lang === 'ja' ? 'アナウンスメント（空欄で非表示）' : 'Announcement (leave blank to hide)'}><BufferedInput value={cfg.announcement} onSave={v => sc({ announcement: v })} className={iCls} placeholder={lang === 'ja' ? '例: 当日は雨予報です' : 'e.g. Rain expected on the day'} /></Field>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Lock size={16} /> {lang === 'ja' ? 'セキュリティ' : 'Security'}</h3>
              <Field label={lang === 'ja' ? '管理者ID' : 'Admin ID'}><BufferedInput value={cfg.adminId} onSave={v => sc({ adminId: v })} className={iCls} /></Field>
              <Field label={lang === 'ja' ? 'パスワード' : 'Password'}><BufferedInput type="password" value={cfg.adminPass} onSave={v => sc({ adminPass: v })} className={iCls} /></Field>
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
  
            {/* 管理者アップロード */}
            <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2"><Upload size={14} /> {lang === 'ja' ? '写真を追加' : 'Add Photos'}</h4>
              <div className="space-y-3">
                <input type="text" value={adminUpName} onChange={e => setAdminUpName(e.target.value)} className={iCls} placeholder={lang === 'ja' ? '投稿者名' : 'Uploader name'} {...imeHandlers} />
                <input type="file" accept="image/*" multiple onChange={doAdminUpFiles} id="admin-photo-upload" className="hidden" />
                <label htmlFor="admin-photo-upload" className="w-full px-4 py-3 bg-white border-2 border-dashed border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 hover:border-neutral-400 transition-all flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> {lang === 'ja' ? '写真を選択' : 'Select Photos'}</label>
                {adminUpImgs.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {adminUpImgs.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setAdminUpImgs(adminUpImgs.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80"><X size={12} className="text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={doAdminUpload} disabled={!adminUpImgs.length || !adminUpName || isComposing} className="w-full py-2.5 text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={btnS}>{lang === 'ja' ? 'アップロード' : 'Upload'}</button>
              </div>
            </div>
  
            {/* 一括操作バー */}
            {photos.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button onClick={selectAllPhotos} className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all flex items-center gap-1.5">
                  <Check size={12} /> {selPhotos.length === photos.length ? (lang === 'ja' ? '全解除' : 'Deselect All') : (lang === 'ja' ? '全選択' : 'Select All')}
                </button>
                {selPhotos.length > 0 && (
                  <>
                    <span className="text-xs text-neutral-500">{selPhotos.length}{lang === 'ja' ? '枚選択中' : ' selected'}</span>
                    <button onClick={deleteSelPhotos} className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all flex items-center gap-1.5"><Trash2 size={12} /> {lang === 'ja' ? '一括削除' : 'Delete Selected'}</button>
                  </>
                )}
              </div>
            )}
  
            {/* 写真一覧 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map(p => {
                const isSel = selPhotos.includes(p.id);
                return (
                  <div key={p.id} className={`relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border-2 transition-all ${isSel ? 'border-rose-500 ring-2 ring-rose-200' : 'border-neutral-200'}`}>
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    {/* チェックボックス（常時表示） */}
                    <button onClick={() => toggleSelPhoto(p.id)} className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${isSel ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}>
                      {isSel && <Check size={14} />}
                    </button>
                    {/* アクションボタン（常時表示） */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button onClick={() => downloadPhoto(p.url, p.name)} className="w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all" title={lang === 'ja' ? 'ダウンロード' : 'Download'}><Download size={13} /></button>
                      <button onClick={() => startEditPhoto(p)} className="w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all" title={lang === 'ja' ? '編集' : 'Edit'}><Pencil size={13} /></button>
                      <button onClick={() => { deletePhoto(p.id); setSelPhotos(s => s.filter(x => x !== p.id)); }} className="w-7 h-7 bg-red-500/80 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all" title={lang === 'ja' ? '削除' : 'Delete'}><Trash2 size={13} /></button>
                    </div>
                    {/* 投稿者情報 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 pt-6">
                      <div className="text-white text-xs truncate">{p.name}</div>
                      <div className="text-white/70 text-[10px] flex items-center gap-1"><Heart size={10} /> {p.likes || 0}</div>
                    </div>
                  </div>
                );
              })}
              {!photos.length && <div className="col-span-full text-center text-neutral-400 text-sm py-8">{lang === 'ja' ? 'まだ写真がありません' : 'No photos yet'}</div>}
            </div>
  
            {/* 写真編集モーダル */}
            {editPhotoId && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setEditPhotoId(null)}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative bg-white max-w-sm w-full p-6 shadow-2xl rounded-xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditPhotoId(null)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Pencil size={16} /> {lang === 'ja' ? '写真を編集' : 'Edit Photo'}</h3>
                  <div className="space-y-4">
                    <Field label={lang === 'ja' ? '投稿者名' : 'Uploader Name'}>
                      <input type="text" value={editPhotoName} onChange={e => setEditPhotoName(e.target.value)} className={iCls} {...imeHandlers} />
                    </Field>
                    <div className="flex gap-2">
                      <button onClick={saveEditPhoto} disabled={!editPhotoName || isComposing} className="flex-1 py-2.5 text-sm font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-40" style={btnS}>{lang === 'ja' ? '保存' : 'Save'}</button>
                      <button onClick={() => setEditPhotoId(null)} className="px-4 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50">{lang === 'ja' ? 'キャンセル' : 'Cancel'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    <Modal onClose={() => { setShowUp(false); setUVideoUrl(''); }} borderRadius={T.cr}>
      <ST title={lang === 'ja' ? '写真・動画を投稿' : 'Upload Photos & Videos'} />
      <div className="space-y-4">
        <Field label={t('uploader_name')}>
          <input type="text" value={uName} onChange={e => setUName(e.target.value)} className={iCls} placeholder={t('name_placeholder')} {...imeHandlers} />
        </Field>
        <Field label={`${lang === 'ja' ? '写真' : 'Photos'} (${t('max_photos')})`}>
          <input type="file" accept="image/*" multiple onChange={doFiles} id="photo-upload-input" className="hidden" />
          <label htmlFor="photo-upload-input" className="w-full px-4 py-3 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 hover:border-neutral-400 transition-all flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> {lang === 'ja' ? '写真を選択' : 'Select Photos'}</label>
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
        <Field label={lang === 'ja' ? '動画URL（YouTube等・任意）' : 'Video URL (YouTube etc. - optional)'}>
          <input type="url" value={uVideoUrl} onChange={e => setUVideoUrl(e.target.value)} className={iCls} placeholder="https://www.youtube.com/watch?v=..." {...imeHandlers} />
          {uVideoUrl && <p className="text-[11px] text-neutral-400 mt-1">{lang === 'ja' ? '※ YouTube, Vimeo等の共有URLに対応' : 'Supports YouTube, Vimeo share URLs'}</p>}
        </Field>
        {uploading && uploadProgress.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>{lang === 'ja' ? 'アップロード中...' : 'Uploading...'}</span>
              <span>{uploadProgress.current + 1 > uploadProgress.total ? uploadProgress.total : uploadProgress.current + 1} / {uploadProgress.total}</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.min(((uploadProgress.current + 0.5) / uploadProgress.total) * 100, 100)}%`, backgroundColor: T.c }} />
            </div>
          </div>
        )}
        <button onClick={doUpload} disabled={(!uImgs.length && !uVideoUrl) || !uName || isComposing || uploading} className="w-full py-3 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={btnS}>{uploading ? <><Loader2 size={16} className="animate-spin" /> {lang === 'ja' ? `アップロード中 (${uploadProgress.current + 1}/${uploadProgress.total})` : `Uploading (${uploadProgress.current + 1}/${uploadProgress.total})`}</> : (lang === 'ja' ? '投稿する' : 'Submit')}</button>
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
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <img src={slideItems[slide].url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-3 flex items-center gap-3 text-white/80">
              <button onClick={e => { e.stopPropagation(); doLike(slideItems[slide].id); }} className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"><Heart size={16} className={slideItems[slide].likes > 0 ? 'fill-current text-rose-400' : ''} /> {slideItems[slide].likes || 0}</button>
              <span className="text-sm font-medium">{slideItems[slide].name}</span>
            </div>
          </div>
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
  
  {showScore && cfg.scoreUrl && (
    <div className="fixed inset-0 z-[200] flex flex-col" onClick={() => setShowScore(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative flex-1 flex flex-col m-3 md:m-6 rounded-xl overflow-hidden bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 border-b border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><FileUp size={15} /> {lang === 'ja' ? '楽譜' : 'Sheet Music'}</h3>
          <div className="flex items-center gap-2">
            <a href={cfg.scoreUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-200 flex items-center gap-1"><ExternalLink size={12} /> {lang === 'ja' ? '新しいタブで開く' : 'Open in new tab'}</a>
            <button onClick={() => setShowScore(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700"><X size={18} /></button>
          </div>
        </div>
        <iframe src={cfg.scoreUrl} className="flex-1 w-full" title="Score PDF" />
      </div>
    </div>
  )}
  
  {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
  
  {!isAdmin && (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-[50]">
      <button onClick={() => go('login')} className="w-10 h-10 bg-neutral-800 text-white shadow-lg rounded-full flex items-center justify-center hover:bg-neutral-700 hover:shadow-xl active:scale-95 transition-all"><Lock size={15} /></button>
    </div>
  )}
  
  <style>{`
    .fin { animation: fadeIn .6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
    .sb { animation: bounce 2s infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
  ```
  
    </div>
  );

}
