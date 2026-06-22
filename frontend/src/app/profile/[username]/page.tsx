'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ToastProvider';
import { apiRequest } from '../../utils/api';
import { 
  ArrowLeft, 
  Flame, 
  Award, 
  Clock, 
  BookOpen, 
  Star, 
  MessageSquare,
  Shield,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Send,
  Trophy
} from 'lucide-react';

interface PublicProfile {
  id: string;
  fullName: string;
  username: string;
  role: 'student' | 'mentor' | 'admin';
  streakCount: number;
  totalStudyHours: number;
  avatarUrl?: string;
  gender?: string;
  bio?: string;
  department?: string;
  badges: string; // JSON String
  level: number;
  xp: number;
  learningGoal?: string;
  reputation?: {
    doubtsSolved: number;
    sessionsHeld: number;
    avgRating: number;
    reputationScore: number;
  };
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user: currentUser } = useApp();

  const usernameParam = params?.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<any[]>([]);
  
  // Rating form states
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchProfileData = async () => {
    try {
      const data = await apiRequest(`/auth/profile/${usernameParam}`);
      if (data && data.profile) {
        setProfile(data.profile);
        
        // If profile is a mentor, fetch their ratings/reviews
        if (data.profile.role === 'mentor' || data.profile.role === 'admin') {
          const ratingData = await apiRequest(`/auth/mentors/${data.profile.id}/ratings`);
          setRatings(ratingData.ratings || []);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching user profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usernameParam) {
      fetchProfileData();
    }
  }, [usernameParam]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSubmittingRating(true);
    try {
      await apiRequest(`/auth/mentors/${profile.id}/rate`, {
        method: 'POST',
        body: JSON.stringify({
          rating: ratingVal,
          feedback: feedbackText.trim()
        })
      });
      showToast('Thank you! Your rating has been recorded.', 'success');
      setShowRateModal(false);
      setFeedbackText('');
      // Reload profile details to reflect updated reputation score and averages
      fetchProfileData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913]">
        <RefreshCw className="h-8 w-8 text-[#10B981] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060913] text-slate-100 p-6">
        <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2">User Not Found</h2>
        <p className="text-slate-400 text-xs mb-6">The username "{usernameParam}" does not correspond to any active StudyCircle account.</p>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-xs font-bold rounded-xl text-white transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Parse Badges
  let badgeList: Array<{ id: string; name: string; earnedAt: string }> = [];
  try {
    badgeList = JSON.parse(profile.badges || '[]');
  } catch (e) {
    badgeList = [];
  }

  // Determine Level Curve bounds
  const getXpThresholdForLevel = (level: number) => {
    let totalXp = 0;
    for (let l = 1; l < level; l++) {
      totalXp += Math.floor(100 * Math.pow(l, 1.3));
    }
    return totalXp;
  };

  const levelMinXp = getXpThresholdForLevel(profile.level);
  const levelMaxXp = getXpThresholdForLevel(profile.level + 1);
  const levelProgressPercent = Math.min(100, Math.max(0, ((profile.xp - levelMinXp) / (levelMaxXp - levelMinXp)) * 100));

  // Check custom themes / frames equipped
  const hasEmeraldTheme = badgeList.some(b => b.id === 'theme_emerald_cosmic');
  const hasSolarTheme = badgeList.some(b => b.id === 'theme_solar_glow');
  const hasDarkNebula = badgeList.some(b => b.id === 'theme_dark_nebula');

  // Active avatar frames
  const hasCyanFrame = badgeList.some(b => b.id === 'frame_neon_cyan');
  const hasGoldFrame = badgeList.some(b => b.id === 'frame_gold_shine');

  let themeBg = 'bg-[#0B0F19] border-white/5';
  let accentColor = 'text-[#10B981]';
  let progressBg = 'bg-[#10B981]';

  if (hasEmeraldTheme) {
    themeBg = 'bg-gradient-to-br from-[#061510] to-[#04090b] border-[#10B981]/20 shadow-[#10B981]/5';
    accentColor = 'text-[#10B981]';
    progressBg = 'bg-gradient-to-r from-emerald-400 to-[#10B981]';
  } else if (hasSolarTheme) {
    themeBg = 'bg-gradient-to-br from-[#1c1209] to-[#090604] border-amber-500/20 shadow-amber-500/5';
    accentColor = 'text-amber-500';
    progressBg = 'bg-gradient-to-r from-amber-400 to-orange-500';
  } else if (hasDarkNebula) {
    themeBg = 'bg-gradient-to-br from-[#120a1c] to-[#06040a] border-purple-500/20 shadow-purple-500/5';
    accentColor = 'text-purple-400';
    progressBg = 'bg-gradient-to-r from-purple-400 to-indigo-500';
  }

  // Frame classes
  let frameClass = '';
  if (hasCyanFrame) {
    frameClass = 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0B0F19] shadow-lg shadow-cyan-400/20 animate-pulse';
  } else if (hasGoldFrame) {
    frameClass = 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#0B0F19] shadow-lg shadow-amber-400/20';
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans relative flex flex-col items-center justify-center p-6 overflow-x-hidden">
      
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#10B981]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0F19] border border-white/5 hover:border-white/10 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all shadow-md backdrop-blur-sm group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative z-10">
        
        {/* Left Side: Avatar Card */}
        <div className={`md:col-span-1 border rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl ${themeBg}`}>
          
          <div className="relative mb-5">
            <div className={`h-24 w-24 rounded-full overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center ${frameClass}`}>
              <img 
                src={profile.avatarUrl || (profile.gender === 'female' ? '/swathi-avatar.png' : '/charan-avatar.png')} 
                className="h-full w-full object-cover" 
                alt={`${profile.fullName}'s Avatar`} 
              />
            </div>
            {profile.streakCount > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                <Flame className="h-3 w-3 fill-white" />
                <span>{profile.streakCount}</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-black text-white leading-tight flex items-center gap-1.5">
            {profile.fullName}
            {profile.role === 'admin' && <Shield className="h-4 w-4 text-red-500 inline fill-red-500/20" />}
            {profile.role === 'mentor' && <GraduationCap className="h-4 w-4 text-blue-400 inline" />}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">@{profile.username}</span>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5`}>
              {profile.role}
            </span>
            {profile.department && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-slate-300">
                {profile.department}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-350 font-medium italic mt-5 leading-relaxed border-t border-white/5 pt-4 w-full">
              "{profile.bio}"
            </p>
          )}

          {/* Rating button for students viewing mentors */}
          {currentUser && currentUser.id !== profile.id && currentUser.role === 'student' && (profile.role === 'mentor' || profile.role === 'admin') && (
            <button
              onClick={() => setShowRateModal(true)}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star className="h-3.5 w-3.5 fill-white/10" />
              <span>Rate this Mentor</span>
            </button>
          )}

        </div>

        {/* Right Side: stats and badges */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Level Curve & Study Hours Card */}
          <div className={`border rounded-3xl p-6 shadow-xl ${themeBg}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Level & Progress</h3>
                <span className="text-2xl font-black text-white mt-1 block">Level {profile.level}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-400 block">Total Experience</span>
                <span className="text-sm font-black text-white mt-0.5 block">{profile.xp} XP</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/[0.03] border border-white/5 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-450 font-bold mt-1.5">
              <span>{levelMinXp} XP</span>
              <span>{levelProgressPercent.toFixed(0)}% to Level {profile.level + 1}</span>
              <span>{levelMaxXp} XP</span>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/5">
              <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/5 text-orange-400 border border-orange-500/10">
                  <Flame className="h-5 w-5 fill-orange-500/10" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Active Streak</span>
                  <span className="text-base font-black text-white mt-0.5 block">{profile.streakCount} Days</span>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/5 text-blue-400 border border-blue-500/10">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Study Time</span>
                  <span className="text-base font-black text-white mt-0.5 block">{profile.totalStudyHours} Hours</span>
                </div>
              </div>
            </div>

            {profile.learningGoal && (
              <div className="mt-5 bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#10B981]/5 text-[#10B981] border border-[#10B981]/10 mt-0.5">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Learning Objective</span>
                  <p className="text-xs font-semibold text-white mt-1 leading-relaxed">{profile.learningGoal}</p>
                </div>
              </div>
            )}

          </div>

          {/* Dynamic Reputation Score (Mentor/Admin only) */}
          {(profile.role === 'mentor' || profile.role === 'admin') && profile.reputation && (
            <div className="border border-blue-500/10 rounded-3xl p-6 bg-gradient-to-br from-[#0a1128] to-[#040813] shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-5">
                <Trophy className="h-4 w-4" />
                <span>Mentor Reputation Console</span>
              </h3>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-lg font-black text-white block">{profile.reputation.reputationScore}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Rep Score</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-lg font-black text-blue-400 block flex items-center justify-center gap-0.5">
                    {profile.reputation.avgRating}
                    <Star className="h-3.5 w-3.5 fill-blue-400/20" />
                  </span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Avg Star</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-lg font-black text-emerald-400 block">{profile.reputation.doubtsSolved}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Solved Qs</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-lg font-black text-purple-400 block">{profile.reputation.sessionsHeld}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Sessions</span>
                </div>
              </div>
            </div>
          )}

          {/* Badges Shelf */}
          <div className={`border rounded-3xl p-6 shadow-xl ${themeBg}`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Earned Achievements & Badges Shelf</span>
            </h3>

            {badgeList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <Award className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <span className="text-[10px] text-slate-500 font-bold block uppercase">No badges unlocked yet</span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Complete study streaks and claim rewards to display cards here.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badgeList.map((badge, idx) => {
                  let isTheme = badge.id.startsWith('theme_');
                  let isFrame = badge.id.startsWith('frame_');
                  let badgeLabel = isTheme ? 'Custom Profile Theme' : isFrame ? 'Exclusive Avatar Frame' : 'Milestone Achievement';
                  let iconColor = isTheme ? 'text-teal-400 bg-teal-500/5' : isFrame ? 'text-cyan-400 bg-cyan-500/5' : 'text-amber-400 bg-amber-500/5';
                  
                  return (
                    <div key={idx} className="bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center gap-3 transition-all">
                      <div className={`p-2.5 rounded-xl border border-white/5 ${iconColor}`}>
                        {isTheme || isFrame ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <Trophy className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white block">{badge.name}</span>
                        <span className="text-[8px] text-slate-450 font-bold block mt-0.5 uppercase tracking-wide">{badgeLabel}</span>
                        <span className="text-[8px] text-slate-500 block mt-0.5">Unlocked on {badge.earnedAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback & Ratings wall (Mentor/Admin only) */}
          {(profile.role === 'mentor' || profile.role === 'admin') && (
            <div className={`border rounded-3xl p-6 shadow-xl ${themeBg}`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span>Student Review & Evaluation Wall</span>
              </h3>

              {ratings.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">No reviews posted yet</span>
                  <span className="text-[9px] text-slate-600 block mt-0.5">Students who participate in this mentor's circles can rate and comment here.</span>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {ratings.map((review) => {
                    const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
                    return (
                      <div key={review.id} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-left space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <img 
                              src={review.Student?.avatarUrl || (review.Student?.gender === 'female' ? '/swathi-avatar.png' : '/charan-avatar.png')} 
                              className="h-6 w-6 rounded-full border border-white/10"
                              alt=""
                            />
                            <div>
                              <span className="text-[10px] font-black text-white block">{review.Student?.fullName || 'Anonymous'}</span>
                              <span className="text-[8px] text-slate-550 block">@{review.Student?.username || 'anonymous'}</span>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-0.5">
                            {stars.map((filled, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        {review.feedback && (
                          <p className="text-xs text-slate-300 font-medium leading-relaxed bg-white/[0.005] p-2.5 rounded-xl border border-white/[0.02]">
                            "{review.feedback}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Review / Rate Mentor Dialog Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0B0F19] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Evaluate Mentor: {profile.fullName}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Your feedback supports the academic ranking of this guide and calculates their global reputation score.</p>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              
              {/* Stars selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRatingVal(val)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`h-7 w-7 ${val <= ratingVal ? 'text-amber-400 fill-amber-400' : 'text-slate-655'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Write Comments</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share details about their sessions, doubts answered, or notes accuracy..."
                  rows={4}
                  maxLength={500}
                  className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500/50 outline-none transition-all font-semibold resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingRating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
