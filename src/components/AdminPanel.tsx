import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { BarChart3, Users, ShieldAlert, CheckCircle, ShieldCheck, Activity, UserCheck, Database, Copy, ExternalLink, RefreshCw, Mail } from "lucide-react";
import { ProfessionalProfile } from "../types";

interface AdminPanelProps {
  user: any;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [stats, setStats] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<"audit" | "emails">("audit");

  useEffect(() => {
    loadStats();
    loadDbStatus();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await fetchApi("/api/admin/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDbStatus = async () => {
    try {
      const data = await fetchApi("/api/supabase/status");
      setDbStatus(data);
    } catch (err) {
      console.error("Failed loading Supabase status:", err);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const res = await fetchApi("/api/supabase/sync", { method: "POST" });
      alert(res.message || "Synchronization completed successfully!");
      loadDbStatus();
    } catch (err: any) {
      alert(`Sync failed: Make sure you run the SQL schema script in your Supabase dashboard first! Error: ${err.message || ""}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPro = async (proId: string, isVerified: boolean) => {
    try {
      await fetchApi("/api/admin/verify-pro", {
        method: "POST",
        body: JSON.stringify({ proId, isVerified })
      });
      alert(`Professional status successfully updated to ${isVerified ? "Verified" : "Pending"}`);
      loadStats();
    } catch (err) {
      alert("Error executing verification status.");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await fetchApi(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      alert(`Booking status successfully set to ${status}!`);
      loadStats();
    } catch (err) {
      alert("Error updating booking status.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 glass-card rounded-2xl border border-slate-200/40 dark:border-white/10 max-w-md mx-auto my-8">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Retrieving Master Admin metrics ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Platform Level KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Platform GMV</p>
              <h3 className="text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400">${(stats?.totalRevenue || 0).toFixed(2)}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">Includes 18% GST and platform fees</div>
        </div>

        {/* Customer Count Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Customers</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{stats?.activeCustomersCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">Verified active sessions</div>
        </div>

        {/* Professional Counter Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Experts</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{stats?.activeProfessionalsCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">Pending Verifications: <span className="font-bold text-amber-500">{stats?.pendingVerifications}</span></div>
        </div>

        {/* Bookings Counter Card */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Completed Bookings</p>
              <h3 className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{stats?.completedBookingsCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">Success rate: 100%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Request Inbox */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 border-slate-200/40 dark:border-white/10 mb-6">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Expert Verification Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Perform background check validations and approve registrations</p>
            </div>
          </div>

          <div className="space-y-4">
            {(stats?.professionals || []).map((pro: ProfessionalProfile) => (
              <div key={pro.id} className="border border-slate-200/40 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/45 dark:bg-slate-950/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <img src={pro.avatar} alt={pro.name} className="w-11 h-11 rounded-full object-cover border border-slate-200/40 dark:border-white/10" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{pro.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{pro.title}</p>
                    <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                      <span>Rate: <strong className="font-mono text-emerald-600 dark:text-emerald-400">${pro.hourlyRate}/hr</strong></span>
                      <span>City: <strong>{pro.city}</strong></span>
                      <span>Exp: <strong>{pro.experienceYears} Years</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  {pro.isVerified ? (
                    <button
                      id={`unverify-btn-${pro.id}`}
                      onClick={() => handleVerifyPro(pro.id, false)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200/30 dark:border-rose-500/20 transition-all active:scale-95 shadow-sm"
                    >
                      Revoke Approval
                    </button>
                  ) : (
                    <button
                      id={`verify-btn-${pro.id}`}
                      onClick={() => handleVerifyPro(pro.id, true)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                      Approve Expert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs panel */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/40 dark:border-white/10">
              <div className="flex items-center gap-2">
                {activeLogTab === "audit" ? (
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Mail className="w-5 h-5 text-indigo-500" />
                )}
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    {activeLogTab === "audit" ? "Real-time Audit Logs" : "Email Dispatch Logs"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeLogTab === "audit" ? "Security event streams and operations telemetry" : "Automated email delivery confirmation receipts"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tab switchers */}
            <div className="flex gap-2 mt-3 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/20">
              <button
                id="tab-audit-logs"
                onClick={() => setActiveLogTab("audit")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeLogTab === "audit"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Audit Logs ({(stats?.auditLogs || []).length})
              </button>
              <button
                id="tab-email-logs"
                onClick={() => setActiveLogTab("emails")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeLogTab === "emails"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email Logs ({(stats?.emailLogs || []).length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] space-y-4 pr-1">
            {activeLogTab === "audit" ? (
              <>
                {(stats?.auditLogs || []).map((log: any) => (
                  <div key={log.id} className="border-l-2 border-blue-500 dark:border-blue-400 pl-3 py-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">{log.action}</span>
                      <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{log.details}</p>
                  </div>
                ))}
                {(stats?.auditLogs || []).length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-12">No audit logs stream loaded.</p>
                )}
              </>
            ) : (
              <>
                {(stats?.emailLogs || []).map((email: any) => (
                  <div key={email.id} className="border-l-2 border-indigo-500 pl-3 py-1.5 space-y-1.5 bg-indigo-50/10 dark:bg-indigo-950/5 rounded-r-lg p-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono truncate max-w-[120px]">{email.recipient}</span>
                      <span className="font-mono text-slate-400">{new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{email.subject}</h4>
                    <pre className="text-[10px] text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200/20 max-h-[120px]">
                      {email.body}
                    </pre>
                  </div>
                ))}
                {(stats?.emailLogs || []).length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-12">No emails sent yet.</p>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Service Bookings & Completion Control */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mt-8 border border-slate-200/40 dark:border-white/10">
        <div className="flex items-center gap-2 border-b pb-4 border-slate-200/40 dark:border-white/10 mb-6">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Service Bookings & Completion Control</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitor all live requests, acceptances, and verify professional work completion</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Booking ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Specialist</th>
                <th className="p-3">Service</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.bookings || []).slice().reverse().map((book: any) => (
                <tr key={book.id} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-500">#{book.id}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{book.customerName}</span>
                      {book.customerEmail && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{book.customerEmail}</span>
                      )}
                      {book.customerPhone && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{book.customerPhone}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{book.professionalName}</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">{book.serviceCategory}</span>
                  </td>
                  <td className="p-3 font-bold font-mono text-emerald-600 dark:text-emerald-400">${book.totalPrice.toFixed(2)}</td>
                  <td className="p-3">
                    {book.status === "pending" && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20 font-semibold">Pending</span>
                    )}
                    {(book.status === "confirmed" || book.status === "accepted") && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-500/20 font-semibold">Accepted</span>
                    )}
                    {book.status === "work_done" && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-500/20 font-bold animate-pulse">Work Done</span>
                    )}
                    {book.status === "completed" && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-500/20 font-semibold">Finished Successfully</span>
                    )}
                    {book.status === "cancelled" && (
                      <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-500 px-2 py-0.5 rounded border border-rose-200/50 dark:border-rose-500/20 font-semibold">Cancelled</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {book.status === "work_done" ? (
                      <button
                        onClick={() => handleUpdateBookingStatus(book.id, "completed")}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all active:scale-95 shadow-sm text-[10px]"
                      >
                        Approve & Complete
                      </button>
                    ) : book.status === "completed" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Approved</span>
                    ) : (
                      <span className="text-slate-400 italic">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
              {(stats?.bookings || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">No bookings recorded on the platform yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Database Integration Dashboard */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mt-8 border border-slate-200/40 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200/40 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Supabase Live Database Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage real-time cloud data storage for user registrations, bookings, and contact inquiries</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadDbStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Status
            </button>
            {dbStatus?.configured && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? "Syncing..." : "Sync Local Seeds"}
              </button>
            )}
          </div>
        </div>

        {/* Integration State Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/20">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Integration Status</span>
            {dbStatus?.configured ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Configured</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Missing Credentials</span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {dbStatus?.configured 
                ? `Connected to project: ${dbStatus.url}` 
                : "Add SUPABASE_URL and SUPABASE_ANON_KEY in Settings to enable real-time storage."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/20">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Database Schema Health</span>
            {dbStatus?.connectionOk ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Schema Active</span>
              </div>
            ) : dbStatus?.configured ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Tables Missing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Inactive</span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {dbStatus?.connectionOk 
                ? "Tables (users, bookings, support_tickets) successfully detected!" 
                : dbStatus?.configured 
                  ? "Ensure you create the required tables in your Supabase SQL editor using the schema below." 
                  : "Tables will be verified upon providing credentials."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/20">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Live Row Statistics</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="text-center bg-white/50 dark:bg-slate-950/30 p-1.5 rounded border border-slate-200/10">
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Users</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{dbStatus?.counts?.users || 0}</span>
              </div>
              <div className="text-center bg-white/50 dark:bg-slate-950/30 p-1.5 rounded border border-slate-200/10">
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Book</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{dbStatus?.counts?.bookings || 0}</span>
              </div>
              <div className="text-center bg-white/50 dark:bg-slate-950/30 p-1.5 rounded border border-slate-200/10">
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Msg</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{dbStatus?.counts?.supportTickets || 0}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Counts of synchronized live rows inside Supabase.</p>
          </div>
        </div>

        {/* Latest Sync / Write Error alert */}
        {dbStatus?.error && (
          <div className="p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
            <div className="flex gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-bold text-xs">Supabase Database Connection/Write Status Code</h4>
                <p className="text-xs mt-1 font-mono font-medium opacity-90">{dbStatus.error}</p>
                <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                  💡 <strong>Immediate fix:</strong> If you see a <code>permission denied</code> or <code>row-level security policy</code> warning, please copy and run the <code>DISABLE ROW LEVEL SECURITY</code> SQL commands shown below. By default, new Supabase tables block direct anonymous writes until security guidelines are run!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Database setup / Copy SQL Schema guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-100/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/20">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                Supabase SQL Setup Instructions
              </span>
              <p className="text-[11px] text-slate-500">Copy the schema code below, open your Supabase SQL Editor, paste and click 'Run'.</p>
            </div>
            <button
              onClick={() => copyToClipboard(dbStatus?.sqlSchema || "")}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy SQL Code"}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-[160px] border border-slate-800/80 leading-relaxed select-all">
              {dbStatus?.sqlSchema || "Loading SQL schema instructions..."}
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}
