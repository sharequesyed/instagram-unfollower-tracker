import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Download, Copy, Check, ExternalLink, X,
  Code, ShieldCheck, Sparkles, Info, HelpCircle
} from 'lucide-react';

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

// User's optimized URI-encoded bookmarklet string
export const BOOKMARKLET_HREF = `javascript:(async function(){const d=document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];if(!d){alert(%22Log%20into%20Instagram%20first!%22);return;}async%20function%20f(e){let%20u=[],m=null;while(true){let%20l=\`https://www.instagram.com/api/v1/friendships/\${d}/\${e}/?count=50\`;if(m)l+=\`&max_id=\${m}\`;const%20r=await%20fetch(l,{headers:{%22X-IG-App-ID%22:%22936619743392459%22,%22X-Requested-With%22:%22XMLHttpRequest%22}});if(!r.ok)break;const%20j=await%20r.json(),s=j.users||[];u=u.concat(s.map(x=%3E({value:x.username,href:\`https://instagram.com/\${x.username}\`})));m=j.next_max_id;if(!m||s.length===0)break;await%20new%20Promise(w=%3EsetTimeout(w,500));}return%20u;}function%20dl(n,t){const%20b=new%20Blob([JSON.stringify(t,null,2)],{type:%22application/json%22}),a=document.createElement(%22a%22);a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();document.body.removeChild(a);}const%20fg=await%20f(%22following%22),fr=await%20f(%22followers%22);dl(%22following.json%22,fg);dl(%22followers_1.json%22,fr);})();`;

export default function DownloadInfoModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDirectClickTip, setShowDirectClickTip] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(RAW_DOWNLOAD_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = RAW_DOWNLOAD_SCRIPT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
    // If user clicks the bookmark directly instead of dragging it, show a friendly guide
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
          className="fixed inset-0 bg-slate-900/55 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.2)] text-slate-900 z-10 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Bookmark JSON Downloader
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Get your <code className="text-indigo-600 font-mono font-semibold">followers_1.json</code> and <code className="text-indigo-600 font-mono font-semibold">following.json</code> in 1 click
              </p>
            </div>
          </div>

          {/* Draggable Bookmark Action Box */}
          <div className="my-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/40 border-2 border-indigo-200/80 shadow-inner text-center relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider font-bold text-indigo-700 mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Browser Bookmarklet
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
              Drag this button directly up to your browser&apos;s <strong>Bookmarks Bar</strong>:
            </p>

            {/* The Draggable Bookmarklet Link */}
            <div className="flex flex-col items-center justify-center">
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                href={BOOKMARKLET_HREF}
                onClick={handleBookmarkClick}
                draggable="true"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 cursor-grab active:cursor-grabbing select-none border border-white/20 transition-all"
                title="Drag me to your Bookmarks Bar!"
              >
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Download Info</span>
                <span className="text-[11px] font-medium bg-white/25 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Drag to Bookmarks
                </span>
              </motion.a>

              <AnimatePresence>
                {showDirectClickTip && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-xs font-semibold text-indigo-800 bg-indigo-100/90 border border-indigo-200 px-4 py-2 rounded-xl flex items-center gap-2 max-w-md"
                  >
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Don&apos;t click it here! <strong>Drag it up</strong> into your browser bookmarks bar, or click &quot;Copy Script&quot; below.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Bookmarks bar hidden? Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono shadow-xs">Ctrl + Shift + B</kbd> (Windows) or <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono shadow-xs">Cmd + Shift + B</kbd> (Mac)</span>
            </div>
          </div>

          {/* Step-by-step Visual Workflow */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
              How It Works (4 Easy Steps)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">Save the Bookmark</span>
                  <span className="text-slate-600 leading-normal">
                    Drag the <strong>Download Info</strong> button into your bookmarks bar (or copy the script).
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-800">Open Instagram</span>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5"
                    >
                      instagram.com <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-slate-600 leading-normal">
                    Open instagram.com in a new tab and make sure you are logged into your account.
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">Click the Bookmark</span>
                  <span className="text-slate-600 leading-normal">
                    Click <strong>Download Info</strong> on Instagram. It will download <code className="text-indigo-600 font-mono">following.json</code> and <code className="text-indigo-600 font-mono">followers_1.json</code>.
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">Upload & Compare</span>
                  <span className="text-slate-600 leading-normal">
                    Return to this page and drag both downloaded JSON files into the upload boxes!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Script!' : 'Copy Script Code'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-300 transition shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Save .js File</span>
              </button>
            </div>

            <button
              onClick={() => setShowCode(!showCode)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition"
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
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto border border-slate-800 select-all shadow-inner">
                  <pre>{RAW_DOWNLOAD_SCRIPT}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy & Safe Notice */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>100% Safe & Ban-Free:</strong> This bookmarklet runs directly inside your own browser using your active Instagram session. No passwords, tokens, or personal information are sent to any server.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
