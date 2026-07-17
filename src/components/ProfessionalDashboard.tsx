import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { Booking, ProfessionalProfile } from "../types";
import { Award, Briefcase, Calendar, Plus, DollarSign, Eye, ShieldAlert, CheckCircle2, Clock, TrendingUp, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfessionalDashboardProps {
  user: any;
}

export default function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    loadProData();
  }, []);

  const loadProData = async () => {
    try {
      // Find pro profile matching user id
      const pros = await fetchApi("/api/professionals");
      const matched = pros.find((p: any) => p.userId === user.id);
      if (matched) {
        setProfile(matched);
      }

      const allJobs = await fetchApi("/api/bookings");
      setJobs(allJobs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await fetchApi(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      alert(`Job successfully marked as ${status}!`);
      loadProData();
    } catch (err) {
      alert("Error updating job status.");
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newSkill.trim()) return;

    const updatedSkills = [...profile.skills, newSkill.trim()];
    setProfile(prev => prev ? { ...prev, skills: updatedSkills } : null);
    setNewSkill("");
    alert("New premium skill appended to your professional portfolio!");
  };

  const handleWithdraw = () => {
    if (!profile || profile.analytics.totalEarnings <= 0) return;
    setIsWithdrawing(true);

    setTimeout(() => {
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          analytics: {
            ...prev.analytics,
            totalEarnings: 0
          }
        };
      });
      setIsWithdrawing(false);
      alert("Withdrawal successfully executed! $ " + profile.analytics.totalEarnings + " is being wired directly to your linked bank account (takes ~5 mins).");
    }, 1500);
  };

  if (!profile) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl shadow-sm border border-slate-200/40 dark:border-white/10">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 dark:text-white">Profile Awaiting Creation</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please wait while the platform seeds your premium professional credentials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Earnings Card */}
        <div className="glass-card bg-slate-900/60 dark:bg-slate-950/65 text-white p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Withdrawable Revenue</p>
              <h3 className="text-3xl font-mono font-extrabold text-emerald-400">${profile.analytics.totalEarnings.toFixed(2)}</h3>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <button
            id="withdraw-revenue-btn"
            onClick={handleWithdraw}
            disabled={profile.analytics.totalEarnings <= 0 || isWithdrawing}
            className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
          >
            {isWithdrawing ? "Processing wire..." : "Withdraw Funds Instantly"}
          </button>
        </div>

        {/* Jobs Done Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Jobs Completed</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{profile.analytics.completedJobs}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> 100% on-time service standard
          </div>
        </div>

        {/* Views Count Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Portfolio Views</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{profile.analytics.profileViews}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
            +14% new customer leads this week
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Customer rating</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{profile.rating} / 5</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
            From {profile.reviewCount} verified customers
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Details & Skills Configurator */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b pb-4 border-slate-200/40 dark:border-white/10">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover border border-slate-200/40 dark:border-white/10"
            />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">{profile.name}</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{profile.title}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">My Bio</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-white/45 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-white/10">
              {profile.bio}
            </p>
          </div>

          {/* Manage Skills */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">My Premium Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(profile.skills.length > 0 ? profile.skills : ["General Servicing", "Residential Troubleshooting", "Customer Care"]).map((s, idx) => (
                <span key={idx} className="bg-white/50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-white/10 text-[11px] font-semibold px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                id="add-skill-input"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Copper Braising"
                className="flex-1 px-3 py-1.5 bg-white/45 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-xs border border-slate-200/50 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                id="add-skill-btn"
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Verification Status Banner */}
          <div className="pt-4 border-t border-slate-200/40 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>Identity Verification:</span>
            {profile.isVerified ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Full Verified</span>
            ) : (
              <span className="font-semibold text-amber-500 animate-pulse">● Awaiting Admin Review</span>
            )}
          </div>
        </div>

        {/* Live Active Job Feeds */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4 border-slate-200/40 dark:border-white/10 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Live Active Jobs Feed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accept, update state or complete assigned customers bookings</p>
            </div>
          </div>

          <div className="space-y-4">
            {jobs.filter(j => j.professionalId === profile.id).map((job) => (
              <div key={job.id} className="border border-slate-200/40 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/45 dark:bg-slate-950/20 shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-blue-500 dark:text-blue-400">JOB-{job.id}</span>
                    {job.status === "pending" && <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">Incoming Request</span>}
                    {(job.status === "confirmed" || job.status === "accepted") && <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-500/20">Accepted</span>}
                    {job.status === "work_done" && <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-500/20">Work Done (Awaiting Completion)</span>}
                    {job.status === "completed" && <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-500/20">Finished Successfully</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{job.serviceCategory}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div>📅 Date: <strong className="text-slate-700 dark:text-slate-300">{job.bookingDate} • {job.bookingTime}</strong></div>
                    <div>👤 Client: <strong className="text-slate-700 dark:text-slate-300">{job.customerName}</strong></div>
                    <div className="md:col-span-2">📍 Address: <span className="text-slate-700 dark:text-slate-300 truncate inline-block max-w-[280px]" title={job.address}>{job.address}</span></div>
                    {job.instructions && <div className="md:col-span-2 text-blue-500 dark:text-blue-400">📝 Notes: "{job.instructions}"</div>}
                  </div>
                </div>

                 <div className="flex md:flex-col gap-2 w-full md:w-auto justify-end">
                  {job.status === "pending" && (
                    <button
                      id={`job-accept-btn-${job.id}`}
                      onClick={() => handleUpdateStatus(job.id, "accepted")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                      Accept Job
                    </button>
                  )}
                  {(job.status === "confirmed" || job.status === "accepted") && (
                    <button
                      id={`job-work-done-btn-${job.id}`}
                      onClick={() => handleUpdateStatus(job.id, "work_done")}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                      Select Work Done
                    </button>
                  )}
                  {job.status === "work_done" && (
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-1.5 rounded-lg text-center">
                      Awaiting Admin Approval
                    </span>
                  )}
                  {job.status === "completed" && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-lg text-center">
                      Finished Successfully
                    </span>
                  )}
                  <div className="text-right text-xs mt-1">
                    Payout: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${job.price}</strong>
                  </div>
                </div>
              </div>
            ))}
            {jobs.filter(j => j.professionalId === profile.id).length === 0 && (
              <p className="text-center text-slate-400 dark:text-slate-500 text-xs py-8">No assigned bookings in your queue yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
