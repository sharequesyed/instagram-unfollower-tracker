import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Upload, Users, UserMinus, UserCheck, UserX, UserPlus,
  Search, ShieldCheck, BookmarkCheck, RotateCcw,
  Sparkles, CheckCircle2, ArrowRight, Bookmark, HelpCircle
} from 'lucide-react';
import AestheticBackground from './components/AestheticBackground';
import DownloadInfoModal, { BOOKMARKLET_HREF } from './components/DownloadInfoModal';

/* --- Main Application --- */
export default function App() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersFileName, setFollowersFileName] = useState('');
  const [followingFileName, setFollowingFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('lost');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Lazy snapshot initialization from localStorage
  const [savedSnapshot, setSavedSnapshot] = useState(() => {
    try {
      const raw = localStorage.getItem('ig_follower_snapshot');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Failed to load saved snapshot:', err);
      return null;
    }
  });

  const extractUsernames = (data) => {
    const usernames = [];
    const list = Array.isArray(data) ? data : data?.relationships_following || data?.relationships_followers || [];

    for (const item of list) {
      if (item.string_list_data && item.string_list_data.length > 0) {
        usernames.push({
          username: item.string_list_data[0].value,
          href: item.string_list_data[0].href || `https://instagram.com/${item.string_list_data[0].value}`,
        });
      } else if (item.value) {
        usernames.push({
          username: item.value,
          href: item.href || `https://instagram.com/${item.value}`,
        });
      }
    }
    return usernames;
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const parsedList = extractUsernames(json);
        if (type === 'followers') {
          setFollowers(parsedList);
          setFollowersFileName(file.name);
        } else {
          setFollowing(parsedList);
          setFollowingFileName(file.name);
        }
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Invalid JSON file format. Please upload Instagram export JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSnapshot = () => {
    if (followers.length === 0) return;
    const snapshotData = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usernames: followers.map(u => u.username.toLowerCase())
    };
    localStorage.setItem('ig_follower_snapshot', JSON.stringify(snapshotData));
    setSavedSnapshot(snapshotData);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.85 } });
  };

  const handleClearSnapshot = () => {
    localStorage.removeItem('ig_follower_snapshot');
    setSavedSnapshot(null);
  };

  const analysis = useMemo(() => {
    const followerSet = new Set(followers.map(f => f.username.toLowerCase()));
    const followingSet = new Set(following.map(f => f.username.toLowerCase()));

    const notFollowingBack = following.filter(user => !followerSet.has(user.username.toLowerCase()));
    const fans = followers.filter(user => !followingSet.has(user.username.toLowerCase()));
    const mutual = following.filter(user => followerSet.has(user.username.toLowerCase()));

    let lost = [];
    let gained = [];
    if (savedSnapshot && followers.length > 0) {
      const pastSet = new Set(savedSnapshot.usernames);
      lost = savedSnapshot.usernames
        .filter(u => !followerSet.has(u))
        .map(u => ({ username: u, href: `https://instagram.com/${u}` }));

      gained = followers
        .filter(u => !pastSet.has(u.username.toLowerCase()))
        .map(u => ({ username: u.username, href: u.href }));
    }

    return { notFollowingBack, fans, mutual, lost, gained };
  }, [followers, following, savedSnapshot]);

  const currentList = useMemo(() => {
    let list = analysis[activeTab] || [];
    if (!searchQuery.trim()) return list;
    return list.filter(item => item.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [analysis, activeTab, searchQuery]);

  const isReady = followers.length > 0 && following.length > 0;

  const tabs = [
    { id: 'lost', label: 'Unfollowed You', count: analysis.lost.length, icon: UserX, color: 'text-rose-600', badgeBg: 'bg-rose-100 text-rose-800' },
    { id: 'gained', label: 'New Followers', count: analysis.gained.length, icon: UserPlus, color: 'text-emerald-600', badgeBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'notFollowingBack', label: "Don't Follow Back", count: analysis.notFollowingBack.length, icon: UserMinus, color: 'text-amber-600', badgeBg: 'bg-amber-100 text-amber-800' },
    { id: 'fans', label: 'Fans', count: analysis.fans.length, icon: Users, color: 'text-sky-600', badgeBg: 'bg-sky-100 text-sky-800' },
    { id: 'mutual', label: 'Mutuals', count: analysis.mutual.length, icon: UserCheck, color: 'text-indigo-600', badgeBg: 'bg-indigo-100 text-indigo-800' },
  ];

  return (
    <div className="relative min-h-screen text-slate-900 overflow-x-hidden font-sans">
      <AestheticBackground />

      {/* Bookmarklet & JSON Downloader Modal */}
      <DownloadInfoModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      <main className="max-w-4xl mx-auto px-5 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-slate-700 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Private</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            <span>Zero Credentials</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Instagram <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Unfollower</span> Tracker
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base font-medium max-w-lg mx-auto">
            A clean, ban-safe tool to discover who unfollowed you and explore connection diffs.
          </p>
        </motion.div>

        {/* Baseline Snapshot Bar (Frosted Glass) */}
        {followers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl p-4 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="text-xs text-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              {savedSnapshot ? (
                <span>
                  Baseline active: <strong className="text-slate-900">{savedSnapshot.date} at {savedSnapshot.time}</strong> ({savedSnapshot.usernames.length} followers)
                </span>
              ) : (
                <span>No baseline saved. Lock in your current list to track future unfollowers.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSnapshot}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95"
              >
                <BookmarkCheck className="w-4 h-4" /> Save Baseline
              </button>
              {savedSnapshot && (
                <button
                  onClick={handleClearSnapshot}
                  className="flex items-center gap-1.5 bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium transition border border-slate-200/80 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Upload Cards (Frosted Glass with Hover Glow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Followers Card */}
          <motion.label
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${followers.length > 0
                ? 'border-emerald-400/80 bg-emerald-50/50'
                : 'border-white/90 bg-white/45 hover:border-indigo-400 hover:bg-white/70'
              }`}
          >
            <div className={`p-3.5 rounded-2xl mb-3 transition shadow-sm ${followers.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-white/80 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
              {followers.length > 0 ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              {followersFileName || 'Upload followers_1.json'}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              {followers.length > 0 ? `${followers.length} followers loaded` : 'Drop or click to select file'}
            </span>
            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'followers')} className="hidden" />
          </motion.label>

          {/* Following Card */}
          <motion.label
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${following.length > 0
                ? 'border-emerald-400/80 bg-emerald-50/50'
                : 'border-white/90 bg-white/45 hover:border-indigo-400 hover:bg-white/70'
              }`}
          >
            <div className={`p-3.5 rounded-2xl mb-3 transition shadow-sm ${following.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-white/80 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
              {following.length > 0 ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              {followingFileName || 'Upload following.json'}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              {following.length > 0 ? `${following.length} following loaded` : 'Drop or click to select file'}
            </span>
            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'following')} className="hidden" />
          </motion.label>
        </div>

        {/* Results Container (Glassmorphism Modal) */}
        {isReady ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            {/* Stat Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10 scale-[1.02]'
                        : 'bg-white/70 hover:bg-white border-white/80 text-slate-700 shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-800 text-slate-100' : tab.badgeBg}`}>
                        {tab.count}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search username in this list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-inner"
              />
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100/80 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {currentList.length > 0 ? (
                  currentList.map((user, idx) => (
                    <motion.div
                      key={user.username}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.12, delay: idx * 0.012 }}
                      className="flex items-center justify-between py-3 px-3 hover:bg-white/80 rounded-2xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200/60 shadow-inner">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-slate-900">@{user.username}</span>
                      </div>
                      <a
                        href={user.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white/90 hover:bg-white border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition shadow-sm"
                      >
                        Profile <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    {activeTab === 'lost' && !savedSnapshot
                      ? 'Click "Save Baseline" above to begin tracking future unfollowers.'
                      : 'No users found in this tab.'}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>How to Get Your JSON Files</span>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Full Guide</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
              Click the <strong>Download Info</strong> button below to get our 1-click bookmark. Once added to your bookmarks bar, visit Instagram, click it, and it will automatically save both <code className="text-indigo-600 font-mono">followers_1.json</code> and <code className="text-indigo-600 font-mono">following.json</code> to your computer.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95"
              >
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Download Info</span>
              </button>
              <a
                ref={(node) => {
                  if (node) {
                    node.setAttribute('href', BOOKMARKLET_HREF);
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsDownloadModalOpen(true);
                }}
                draggable="true"
                title="Drag to your Bookmarks Bar!"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs cursor-grab active:cursor-grabbing"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>Drag: Download Info</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}