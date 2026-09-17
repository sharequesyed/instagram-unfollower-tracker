import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Upload, Users, UserMinus, UserCheck, UserX, UserPlus,
  Search, ShieldCheck, BookmarkCheck, RotateCcw,
  Sparkles, CheckCircle2, ArrowRight, Bookmark, HelpCircle,
  X, History
} from 'lucide-react';
import ParticleWave from './components/ParticleWave';
import LiquidGlass from './components/LiquidGlass';
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

  // Persistent All-Time Follower Ledger
  // Automatically logs all followers seen across all sessions to catch anyone who followed and unfollowed in between
  const [allTimeLedger, setAllTimeLedger] = useState(() => {
    try {
      const raw = localStorage.getItem('ig_all_time_followers');
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('Failed to load all time followers ledger:', err);
      return {};
    }
  });

  // Extract both username, full profile name, profile pic, and href from both bookmarklet and official Meta JSONs
  const extractUserData = (data) => {
    const users = [];
    const list = Array.isArray(data)
      ? data
      : data?.relationships_following || data?.relationships_followers || [];

    for (const item of list) {
      if (item.string_list_data && item.string_list_data.length > 0) {
        const u = item.string_list_data[0];
        const username = u.value || item.title || '';
        const rawTitle = item.title && item.title !== username ? item.title : '';
        const fullName = rawTitle || item.name || item.full_name || '';
        users.push({
          username: username,
          fullName: fullName.trim(),
          href: u.href || `https://instagram.com/${username}`,
          profilePic: item.profile_pic_url || u.profile_pic_url || '',
        });
      } else if (item.value) {
        const username = item.value;
        const rawFull = item.full_name && item.full_name !== username ? item.full_name : '';
        const fullName = rawFull || item.name || item.title || '';
        users.push({
          username: username,
          fullName: fullName.trim(),
          href: item.href || `https://instagram.com/${username}`,
          profilePic: item.profile_pic_url || '',
        });
      } else if (item.username) {
        const username = item.username;
        const rawFull = item.full_name && item.full_name !== username ? item.full_name : '';
        const fullName = rawFull || item.name || item.title || '';
        users.push({
          username: username,
          fullName: fullName.trim(),
          href: item.href || `https://instagram.com/${username}`,
          profilePic: item.profile_pic_url || '',
        });
      }
    }
    return users;
  };

  // Sync uploaded followers into the permanent history ledger
  const syncFollowersToLedger = (followerList) => {
    if (!followerList || followerList.length === 0) return;
    setAllTimeLedger((prev) => {
      const updated = { ...prev };
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      for (const u of followerList) {
        const key = u.username.toLowerCase();
        if (!updated[key]) {
          updated[key] = {
            username: u.username,
            fullName: u.fullName || '',
            profilePic: u.profilePic || '',
            href: u.href,
            firstSeen: today,
            lastSeen: today,
          };
        } else {
          updated[key] = {
            ...updated[key],
            username: u.username || updated[key].username,
            fullName: u.fullName || updated[key].fullName || '',
            profilePic: u.profilePic || updated[key].profilePic || '',
            href: u.href || updated[key].href,
            lastSeen: today,
          };
        }
      }
      try {
        localStorage.setItem('ig_all_time_followers', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist all-time followers to localStorage:', err);
      }
      return updated;
    });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const parsedList = extractUserData(json);
        if (type === 'followers') {
          setFollowers(parsedList);
          setFollowersFileName(file.name);
          syncFollowersToLedger(parsedList);
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
      users: followers.map(u => ({
        username: u.username.toLowerCase(),
        originalUsername: u.username,
        fullName: u.fullName || '',
        profilePic: u.profilePic || '',
        href: u.href
      })),
      usernames: followers.map(u => u.username.toLowerCase())
    };
    localStorage.setItem('ig_follower_snapshot', JSON.stringify(snapshotData));
    setSavedSnapshot(snapshotData);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.85 },
      colors: ['#833AB4', '#E1306C', '#FD1D1D', '#F77737', '#FFFFFF']
    });
  };

  const handleClearSnapshot = () => {
    localStorage.removeItem('ig_follower_snapshot');
    setSavedSnapshot(null);
  };

  const handleClearLedger = () => {
    if (window.confirm('Clear all-time follower history ledger? This will erase historical record of past followers.')) {
      localStorage.removeItem('ig_all_time_followers');
      setAllTimeLedger({});
    }
  };

  const analysis = useMemo(() => {
    const followerSet = new Set(followers.map(f => f.username.toLowerCase()));
    const followingSet = new Set(following.map(f => f.username.toLowerCase()));

    const notFollowingBack = following.filter(user => !followerSet.has(user.username.toLowerCase()));
    const fans = followers.filter(user => !followingSet.has(user.username.toLowerCase()));
    const mutual = following.filter(user => followerSet.has(user.username.toLowerCase()));

    let lost = [];
    let gained = [];

    if (followers.length > 0) {
      const lostMap = new Map();

      // 1. From saved snapshot baseline
      if (savedSnapshot) {
        const baselineUsers = savedSnapshot.users || (savedSnapshot.usernames || []).map(u => ({
          username: u,
          originalUsername: u,
          fullName: '',
          profilePic: '',
          href: `https://instagram.com/${u}`
        }));

        for (const bUser of baselineUsers) {
          const uName = (bUser.username || '').toLowerCase();
          if (uName && !followerSet.has(uName)) {
            lostMap.set(uName, {
              username: bUser.originalUsername || bUser.username || uName,
              fullName: bUser.fullName || '',
              profilePic: bUser.profilePic || '',
              href: bUser.href || `https://instagram.com/${uName}`,
              tag: 'Lost since baseline',
              tagColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            });
          }
        }

        const baselineSet = new Set(
          (savedSnapshot.users ? savedSnapshot.users.map(u => u.username.toLowerCase()) : savedSnapshot.usernames || [])
        );
        gained = followers
          .filter(u => !baselineSet.has(u.username.toLowerCase()))
          .map(u => ({ ...u }));
      }

      // 2. From all-time follower ledger: catches anyone who followed in an intermediate session and later unfollowed!
      Object.keys(allTimeLedger).forEach(key => {
        if (!followerSet.has(key)) {
          const ledgerUser = allTimeLedger[key];
          if (!lostMap.has(key)) {
            lostMap.set(key, {
              username: ledgerUser.username,
              fullName: ledgerUser.fullName || '',
              profilePic: ledgerUser.profilePic || '',
              href: ledgerUser.href || `https://instagram.com/${ledgerUser.username}`,
              tag: ledgerUser.lastSeen ? `Followed & vanished (${ledgerUser.lastSeen})` : 'Ever Followed',
              tagColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            });
          }
        }
      });

      lost = Array.from(lostMap.values());
    }

    return { notFollowingBack, fans, mutual, lost, gained };
  }, [followers, following, savedSnapshot, allTimeLedger]);

  // Dual search: match both @username and profile display name
  const currentList = useMemo(() => {
    const list = analysis[activeTab] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(item => {
      const usernameMatch = item.username && item.username.toLowerCase().includes(q);
      const nameMatch = item.fullName && item.fullName.toLowerCase().includes(q);
      return usernameMatch || nameMatch;
    });
  }, [analysis, activeTab, searchQuery]);

  const isReady = followers.length > 0 && following.length > 0;
  const ledgerCount = Object.keys(allTimeLedger).length;

  const tabs = [
    { id: 'lost', label: 'Ghosted You', count: analysis.lost.length, icon: UserX, color: 'text-rose-400', badgeBg: 'bg-rose-500/15 text-rose-300 border border-rose-500/30' },
    { id: 'gained', label: 'New Followers', count: analysis.gained.length, icon: UserPlus, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' },
    { id: 'notFollowingBack', label: "Don't Follow Back", count: analysis.notFollowingBack.length, icon: UserMinus, color: 'text-amber-400', badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
    { id: 'fans', label: 'Fans', count: analysis.fans.length, icon: Users, color: 'text-sky-400', badgeBg: 'bg-sky-500/15 text-sky-300 border border-sky-500/30' },
    { id: 'mutual', label: 'Mutuals', count: analysis.mutual.length, icon: UserCheck, color: 'text-purple-400', badgeBg: 'bg-purple-500/15 text-purple-300 border border-purple-500/30' },
  ];

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-x-hidden font-sans">
      {/* 3D GPU Particle Wave Background */}
      <ParticleWave />

      {/* Bookmarklet & JSON Downloader Modal */}
      <DownloadInfoModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      <main className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg text-zinc-300 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Private</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600 inline-block" />
            <span>Zero Credentials</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white select-none">
            Ghosted<span className="text-[#E1306C]">.</span>
          </h1>

          <p className="text-zinc-200 mt-3 text-lg sm:text-xl font-semibold tracking-tight">
            They vanished. You noticed.
          </p>

          <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 font-normal max-w-md mx-auto leading-relaxed">
            A private, ban-safe tool to discover who unfollowed you and audit your Instagram circle.
          </p>
        </motion.div>

        {/* Baseline & Follower Ledger Bar (Liquid Glass) */}
        {followers.length > 0 && (
          <LiquidGlass
            hoverEffect={false}
            className="p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-white/10"
          >
            <div className="flex flex-col gap-1 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                {savedSnapshot ? (
                  <span>
                    Baseline active: <strong className="text-white font-semibold">{savedSnapshot.date} at {savedSnapshot.time}</strong> ({savedSnapshot.usernames ? savedSnapshot.usernames.length : savedSnapshot.users?.length} followers)
                  </span>
                ) : (
                  <span>No baseline locked. Save baseline to track changes from this moment.</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 pl-4.5">
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  All-Time Ledger: <strong className="text-zinc-200 font-medium">{ledgerCount}</strong> total followers logged across uploads
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Catches quick follow & unfollows</span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={handleSaveSnapshot}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#833AB4] to-[#E1306C] hover:opacity-95 text-white shadow-lg shadow-[#E1306C]/25 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" /> Save Baseline
              </button>
              {savedSnapshot && (
                <button
                  onClick={handleClearSnapshot}
                  title="Reset saved baseline snapshot"
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-medium transition border border-white/10 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Baseline
                </button>
              )}
              {ledgerCount > 0 && (
                <button
                  onClick={handleClearLedger}
                  title="Clear all-time history ledger"
                  className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 px-2.5 py-2 rounded-xl text-xs font-medium transition border border-white/5 active:scale-95 cursor-pointer"
                >
                  Clear Ledger
                </button>
              )}
            </div>
          </LiquidGlass>
        )}

        {/* Upload Cards (Liquid Morphism with Specular Highlight) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Followers Card */}
          <motion.label
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.6)] ${followers.length > 0
                ? 'border-emerald-500/70 bg-emerald-950/20'
                : 'border-zinc-800 hover:border-white/20 bg-zinc-950/60 hover:bg-zinc-900/40'
              }`}
          >
            {/* Top specular edge */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }}
            />

            <div className={`p-4 rounded-2xl mb-3 transition shadow-inner ${followers.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900/90 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 border border-white/5'}`}>
              {followers.length > 0 ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              {followersFileName || 'Upload followers_1.json'}
            </span>
            <span className="text-xs text-zinc-400 mt-1">
              {followers.length > 0 ? `${followers.length} followers loaded` : 'Drop or click to select file'}
            </span>
            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'followers')} className="hidden" />
          </motion.label>

          {/* Following Card */}
          <motion.label
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.6)] ${following.length > 0
                ? 'border-emerald-500/70 bg-emerald-950/20'
                : 'border-zinc-800 hover:border-white/20 bg-zinc-950/60 hover:bg-zinc-900/40'
              }`}
          >
            {/* Top specular edge */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }}
            />

            <div className={`p-4 rounded-2xl mb-3 transition shadow-inner ${following.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900/90 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 border border-white/5'}`}>
              {following.length > 0 ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              {followingFileName || 'Upload following.json'}
            </span>
            <span className="text-xs text-zinc-400 mt-1">
              {following.length > 0 ? `${following.length} following loaded` : 'Drop or click to select file'}
            </span>
            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'following')} className="hidden" />
          </motion.label>
        </div>

        {/* Results Container (Liquid Morphism) */}
        {isReady ? (
          <LiquidGlass hoverEffect={false} className="p-6">
            {/* Stat Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${isActive
                        ? 'bg-white text-zinc-950 border-white shadow-xl shadow-white/10 scale-[1.02]'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : tab.color}`} />
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-200 text-zinc-950' : tab.badgeBg}`}>
                        {tab.count}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box with username and display name query */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by username or name in this list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E1306C]/40 focus:border-[#E1306C] transition shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <>
                    <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-white/5">
                      {currentList.length} found
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-400 hover:text-white transition p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User List with Small Profile Name Under Username */}
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {currentList.length > 0 ? (
                  currentList.map((user, idx) => (
                    <motion.div
                      key={user.username}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.12, delay: idx * 0.012 }}
                      className="flex items-center justify-between py-3 px-3 hover:bg-white/[0.04] rounded-2xl transition gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.username}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="w-9 h-9 rounded-full object-cover border border-white/15 shadow-inner flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#833AB4]/30 via-[#E1306C]/30 to-[#F77737]/30 text-white font-bold text-xs flex items-center justify-center border border-white/15 shadow-inner flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-zinc-100 truncate">
                              @{user.username}
                            </span>
                            {user.tag && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${user.tagColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                {user.tag}
                              </span>
                            )}
                          </div>
                          {user.fullName ? (
                            <span className="text-xs text-zinc-400 truncate leading-tight mt-0.5">
                              {user.fullName}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-600 truncate leading-tight mt-0.5 italic">
                              No display name
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={user.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex-shrink-0 flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition shadow-sm"
                      >
                        Profile <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-sm font-medium">
                    {searchQuery ? (
                      <div>
                        <p className="text-zinc-400">No matches found for "{searchQuery}"</p>
                        <p className="text-xs text-zinc-600 mt-1">Try searching by username or profile display name</p>
                      </div>
                    ) : activeTab === 'lost' && !savedSnapshot && ledgerCount === 0 ? (
                      'Click "Save Baseline" above to begin tracking who ghosted you.'
                    ) : (
                      'No users found in this tab.'
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </LiquidGlass>
        ) : (
          <LiquidGlass hoverEffect={false} className="p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#E1306C]" />
                <span>How to Get Your JSON Files</span>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E1306C] hover:text-[#f43f5e] transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Full Guide</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mb-5">
              Click the <strong className="text-zinc-200">Download Info</strong> button below to get our 1-click bookmark. Once added to your bookmarks bar, visit Instagram, click it, and it will automatically save both <code className="text-[#E1306C] font-mono bg-white/5 px-1.5 py-0.5 rounded">followers_1.json</code> and <code className="text-[#E1306C] font-mono bg-white/5 px-1.5 py-0.5 rounded">following.json</code> with profile names and pictures.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(225,48,108,0.35)] transition active:scale-95 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-white/20 transition shadow-xs cursor-grab active:cursor-grabbing"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>Drag: Download Info</span>
              </a>
            </div>
          </LiquidGlass>
        )}
      </main>
    </div>
  );
}