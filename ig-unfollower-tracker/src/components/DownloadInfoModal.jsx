import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Download, Copy, Check, X,
  Code, ShieldCheck, Sparkles, Info, HelpCircle,
  Smartphone, Monitor, Compass
} from 'lucide-react';

function InstagramIcon({ className = "w-3.5 h-3.5 text-[#E1306C]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const RAW_DOWNLOAD_SCRIPT = `(async function getInstaData() {
  const d = document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];
  if (!d) {
    alert("Log into Instagram first!");
    return;
  }

  async function f(e) {
    let u = [], m = null;
    while (true) {
      let l = \`https://www.instagram.com/api/v1/friendships/\${d}/\${e}/?count=50\`;
      if (m) l += \`&max_id=\${m}\`;
      const r = await fetch(l, {
        headers: {
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      if (!r.ok) break;
      const j = await r.json(), s = j.users || [];
      u = u.concat(s.map(x => ({
        value: x.username,
        full_name: x.full_name || "",
        profile_pic_url: x.profile_pic_url || "",
        href: \`https://instagram.com/\${x.username}\`
      })));
      m = j.next_max_id;
      if (!m || s.length === 0) break;
      await new Promise(w => setTimeout(w, 500));
    }
    return u;
  }

  function dl(n, t) {
    const b = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = n;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const fg = await f("following"), fr = await f("followers");
  dl("following.json", fg);
  dl("followers_1.json", fr);
})();`;

// User's optimized URI-encoded bookmarklet string with full_name & profile_pic_url
export const BOOKMARKLET_HREF = `javascript:(async function(){const d=document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];if(!d){alert(%22Log%20into%20Instagram%20first!%22);return;}async%20function%20f(e){let%20u=[],m=null;while(true){let%20l=\`https://www.instagram.com/api/v1/friendships/\${d}/\${e}/?count=50\`;if(m)l+=\`&max_id=\${m}\`;const%20r=await%20fetch(l,{headers:{%22X-IG-App-ID%22:%22936619743392459%22,%22X-Requested-With%22:%22XMLHttpRequest%22}});if(!r.ok)break;const%20j=await%20r.json(),s=j.users||[];u=u.concat(s.map(x=%3E({value:x.username,full_name:x.full_name||%22%22,profile_pic_url:x.profile_pic_url||%22%22,href:\`https://instagram.com/\${x.username}\`})));m=j.next_max_id;if(!m||s.length===0)break;await%20new%20Promise(w=%3EsetTimeout(w,500));}return%20u;}function%20dl(n,t){const%20b=new%20Blob([JSON.stringify(t,null,2)],{type:%22application/json%22}),a=document.createElement(%22a%22);a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();document.body.removeChild(a);}const%20fg=await%20f(%22following%22),fr=await%20f(%22followers%22);dl(%22following.json%22,fg);dl(%22followers_1.json%22,fr);})();`;

export default function DownloadInfoModal({ isOpen, onClose }) {
  const [deviceTab, setDeviceTab] = useState('desktop');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDirectClickTip, setShowDirectClickTip] = useState(false);

  if (!isOpen) return null;

  const copyText = async (text, setFlag) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      setTimeout(() => setFlag(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setFlag(true);
      setTimeout(() => setFlag(false), 2500);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([RAW_DOWNLOAD_SCRIPT], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download_following_list.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    setShowDirectClickTip(true);
    setTimeout(() => setShowDirectClickTip(false), 4500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window (Dark Liquid Glass) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-2xl bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_25px_80px_rgba(0,0,0,0.85)] text-zinc-100 z-10 my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Top specular edge */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white flex items-center justify-center shadow-lg shadow-[#E1306C]/25 shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                How to Download Your Data
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Fast, private download guide for computer, iPhone, and Android
              </p>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-1.5 rounded-2xl bg-zinc-950/80 border border-white/5">
            <button
              onClick={() => setDeviceTab('desktop')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                deviceTab === 'desktop'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceTab('iphone')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                deviceTab === 'iphone'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>iPhone Safari</span>
            </button>
            <button
              onClick={() => setDeviceTab('android')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                deviceTab === 'android'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android Chrome</span>
            </button>
            <button
              onClick={() => setDeviceTab('official')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                deviceTab === 'official'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>IG App Export</span>
            </button>
          </div>

          {/* TAB 1: DESKTOP */}
          {deviceTab === 'desktop' && (
            <div>
              <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-zinc-900/60 border border-white/[0.08] shadow-inner text-center relative overflow-hidden">
                <div className="text-xs uppercase tracking-wider font-bold text-[#E1306C] mb-2 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Click Desktop Bookmarklet
                </div>

                <p className="text-xs text-zinc-300 max-w-md mx-auto mb-4">
                  Drag this button directly up to your browser&apos;s <strong>Bookmarks Bar</strong>:
                </p>

                <div className="flex flex-col items-center justify-center">
                  <motion.a
                    ref={(node) => {
                      if (node) {
                        node.setAttribute('href', BOOKMARKLET_HREF);
                      }
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookmarkClick}
                    draggable="true"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-95 shadow-xl shadow-[#E1306C]/30 hover:shadow-[#E1306C]/45 cursor-grab active:cursor-grabbing select-none border border-white/20 transition-all"
                    title="Drag me to your Bookmarks Bar!"
                  >
                    <Bookmark className="w-4 h-4 fill-white" />
                    <span>Download Info</span>
                    <span className="text-[11px] font-medium bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                      Drag to Bookmarks
                    </span>
                  </motion.a>

                  <AnimatePresence>
                    {showDirectClickTip && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-xs font-semibold text-rose-300 bg-rose-950/70 border border-rose-800/60 px-4 py-2 rounded-xl flex items-center gap-2 max-w-md"
                      >
                        <Info className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Don&apos;t click it here! <strong>Drag it up</strong> into your browser bookmarks bar.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-3.5 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Bookmarks bar hidden? Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-[10px]">Ctrl + Shift + B</kbd> (Windows) or <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-[10px]">Cmd + Shift + B</kbd> (Mac)</span>
                </div>
              </div>

              {/* 4 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-white/10">1</div>
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">Drag to Bookmarks</span>
                    <span className="text-zinc-400">Drag the button above into your bookmarks bar.</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-white/10">2</div>
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">Open Instagram</span>
                    <span className="text-zinc-400">Log in at <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#E1306C] hover:underline">instagram.com</a> in a tab.</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-white/10">3</div>
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">Click the Bookmark</span>
                    <span className="text-zinc-400">Click Download Info. Your files download automatically.</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-white/10">4</div>
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">Upload Here</span>
                    <span className="text-zinc-400">Drop both downloaded files into the upload boxes!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IPHONE (SAFARI) */}
          {deviceTab === 'iphone' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-purple-950/30 to-zinc-950/60 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                    Mobile Bookmarklet for iPhone (Safari)
                  </div>
                  <p className="text-xs text-zinc-300">
                    Works on any iPhone in Safari without installing any apps!
                  </p>
                </div>
                <button
                  onClick={() => copyText(BOOKMARKLET_HREF, setCopiedBookmarklet)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-zinc-950 transition active:scale-95 cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  {copiedBookmarklet ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBookmarklet ? 'Copied Bookmark Code!' : '1. Copy Mobile Script'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-white block mb-0.5">Tap the blue &quot;Copy Mobile Script&quot; button above</strong>
                    <span className="text-zinc-400">This copies the special downloader code to your clipboard.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-white block mb-0.5">Bookmark any page in Safari</strong>
                    <span className="text-zinc-400">Tap Safari&apos;s Share button <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-zinc-200">[↑]</span>, tap <strong>Add Bookmark</strong>, name it <code className="text-sky-400 font-mono">Ghosted Info</code>, and tap Save.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-white block mb-0.5">Edit the Bookmark URL</strong>
                    <span className="text-zinc-400">Tap Safari&apos;s Bookmarks icon (📖) &gt; Tap <strong>Edit</strong> (bottom right) &gt; Tap <strong>Ghosted Info</strong>. Delete the URL and <strong>Paste</strong> the script you copied in Step 1. Tap Done.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-white block mb-0.5">Run it on Instagram in Safari</strong>
                    <span className="text-zinc-400">Open <strong className="text-white">instagram.com</strong> in Safari (logged in). Tap the address bar, type <strong className="text-sky-400">Ghosted Info</strong>, and tap the bookmark in search results!</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">✓</span>
                  <div>
                    <strong className="text-white block mb-0.5">Files saved to iPhone Downloads</strong>
                    <span className="text-zinc-400">Safari downloads both JSON files straight into your iPhone&apos;s <strong className="text-zinc-200">Files / Downloads</strong> folder. Return here and tap the upload cards!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID (CHROME) */}
          {deviceTab === 'android' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-zinc-950/60 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Mobile Bookmarklet for Android (Chrome)
                  </div>
                  <p className="text-xs text-zinc-300">
                    Works on Samsung, Pixel, OnePlus and any Android phone in Chrome!
                  </p>
                </div>
                <button
                  onClick={() => copyText(BOOKMARKLET_HREF, setCopiedBookmarklet)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {copiedBookmarklet ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBookmarklet ? 'Copied Bookmark Code!' : '1. Copy Mobile Script'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-white block mb-0.5">Tap the green &quot;Copy Mobile Script&quot; button above</strong>
                    <span className="text-zinc-400">Copies the script code to your clipboard.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-white block mb-0.5">Bookmark this page in Chrome</strong>
                    <span className="text-zinc-400">Tap the 3 dots menu <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-zinc-200">⋮</span> in top-right and tap the <strong>Star (⭐)</strong> icon.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-white block mb-0.5">Edit Bookmark in Chrome</strong>
                    <span className="text-zinc-400">Tap 3 dots <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-zinc-200">⋮</span> &gt; <strong>Bookmarks</strong> &gt; tap 3 dots next to the bookmark &gt; <strong>Edit</strong>. Name it <code className="text-emerald-400 font-mono">Ghosted Info</code>, clear the URL box and <strong>Paste</strong> the copied script.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-white block mb-0.5">Run on instagram.com</strong>
                    <span className="text-zinc-400">Visit <strong className="text-white">instagram.com</strong> in Chrome (logged in). In the address bar, type <strong className="text-emerald-400">Ghosted Info</strong> and tap the star bookmark that appears in suggestions!</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">✓</span>
                  <div>
                    <strong className="text-white block mb-0.5">Files saved to Android Downloads</strong>
                    <span className="text-zinc-400">Chrome downloads both JSON files into your phone&apos;s Downloads. Switch back here to upload them!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL INSTAGRAM APP EXPORT */}
          {deviceTab === 'official' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-rose-950/30 to-zinc-950/60 border border-[#E1306C]/20">
                <div className="text-xs font-bold text-[#E1306C] uppercase tracking-wider mb-1">
                  Built-In Instagram App Export (Zero Code)
                </div>
                <p className="text-xs text-zinc-300">
                  Don&apos;t want to use bookmarks? You can request your official data directly inside the Instagram app.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#E1306C]/20 text-rose-300 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-white block mb-0.5">Open Instagram App &gt; Settings</strong>
                    <span className="text-zinc-400">Go to your Profile &gt; Tap the Menu icon (☰) in top-right &gt; Tap <strong>Accounts Center</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#E1306C]/20 text-rose-300 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-white block mb-0.5">Your Information and Permissions</strong>
                    <span className="text-zinc-400">Tap <strong>Your information and permissions</strong> &gt; <strong>Download your information</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#E1306C]/20 text-rose-300 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-white block mb-0.5">Select Followers and Following</strong>
                    <span className="text-zinc-400">Tap <strong>Download or transfer information</strong> &gt; Pick your profile &gt; Choose <strong>Some of your information</strong> &gt; Check <strong>Followers and following</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-white block mb-0.5">Set Format to JSON (Important!)</strong>
                    <span className="text-zinc-400">Select <strong>Download to device</strong>. Under Format, select <strong className="text-rose-400 font-semibold">JSON</strong> (not HTML). Tap <strong>Create files</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">5</span>
                  <div>
                    <strong className="text-white block mb-0.5">Download & Extract</strong>
                    <span className="text-zinc-400">Instagram will email you when ready (usually 2-5 min). Download the zip, open the folder, and upload <code className="text-[#E1306C] font-mono">followers_1.json</code> and <code className="text-[#E1306C] font-mono">following.json</code> here!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyText(RAW_DOWNLOAD_SCRIPT, setCopiedScript)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Raw Script!' : 'Copy Raw Script'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-white/20 transition shadow-xs active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>Save .js File</span>
              </button>
            </div>

            <button
              onClick={() => setShowCode(!showCode)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showCode ? 'Hide Source Code' : 'View Source Code'}</span>
            </button>
          </div>

          {/* Code Viewer Drawer */}
          <AnimatePresence>
            {showCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-black/90 text-zinc-300 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto border border-white/10 select-all shadow-inner">
                  <pre>{RAW_DOWNLOAD_SCRIPT}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy & Safe Notice */}
          <div className="mt-5 p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-start gap-2.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-zinc-300">100% Safe & Ban-Free:</strong> This bookmarklet runs directly inside your own browser using your active Instagram session. No passwords, tokens, or personal information are sent to any server.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

