import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { Booking, Review } from "../types";
import { Wallet, Star, Calendar, Clock, MapPin, CheckCircle, Clock3, MessageSquareText, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomerDashboardProps {
  user: any;
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [walletBalance, setWalletBalance] = useState(150);
  const [topupAmount, setTopupAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await fetchApi("/api/bookings");
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(topupAmount);
    if (isNaN(amt) || amt <= 0) return;
    setIsToppingUp(true);

    // Simulate luxury card payment delay
    setTimeout(() => {
      setWalletBalance(prev => prev + amt);
      setTopupAmount("");
      setCardName("");
      setCardNumber("");
      setIsToppingUp(false);
      alert(`Successfully added $${amt} to your NammaPro secure wallet!`);
    }, 1500);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId) return;
    setIsSubmittingReview(true);

    try {
      await fetchApi("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: reviewBookingId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      alert("Thank you for your valuable feedback! Review submitted successfully.");
      setReviewBookingId(null);
      setReviewComment("");
      setReviewRating(5);
      loadBookings();
    } catch (err) {
      alert("Error submitting review. Please retry.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5" /> Finished Successfully</span>;
      case "accepted":
      case "confirmed":
        return <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-500/20"><Clock className="w-3.5 h-3.5" /> Accepted</span>;
      case "work_done":
        return <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200/50 dark:border-purple-500/20"><Clock className="w-3.5 h-3.5" /> Work Done (Awaiting Verification)</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200/50 dark:border-rose-500/20">Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-500/20"><Clock3 className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5 object-cover"
              />
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">Verified Customer Profile</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200/40 dark:border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Account Created:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">July 2026</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Contact Number:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{user.phone || "+91 81234 56789"}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Default Address:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]" title="Bengaluru, India">Bengaluru, IN</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl flex items-start gap-2.5 border border-blue-100/50 dark:border-blue-900/20">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              All NammaPro bookings are fully protected by our <strong>$500 Satisfaction Guarantee policy</strong>.
            </p>
          </div>
        </div>

        {/* Secure Digital Wallet */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-800 dark:text-white">NammaPro Digital Wallet</h3>
            </div>
            <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">${walletBalance.toFixed(2)}</span>
          </div>

          <form onSubmit={handleTopup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Top-Up Amount ($)</label>
                  <input
                    id="wallet-topup-input"
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-white/45 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                  <input
                    id="wallet-card-name"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Jeevan Gowda"
                    className="w-full px-3.5 py-2.5 bg-white/45 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    required={!!topupAmount}
                  />
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Credit/Debit Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 text-slate-400 w-4.5 h-4.5" />
                    <input
                      id="wallet-card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="**** **** **** 4242"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/45 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      required={!!topupAmount}
                    />
                  </div>
                </div>

                <button
                  id="wallet-submit-btn"
                  type="submit"
                  disabled={isToppingUp || !topupAmount}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-40"
                >
                  {isToppingUp ? "Topping Up..." : "Securely Charge Card"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bookings Tracker Module */}
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200/40 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Service Appointments Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track current jobs, access receipts, or submit feedback reviews</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm">No recent bookings found. Go to home to explore premium professionals!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/40 dark:bg-slate-900/40 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-white/10">
                  <th className="p-4 pl-6">Appointment details</th>
                  <th className="p-4">Assigned Expert</th>
                  <th className="p-4">Schedule date</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {bookings.map((book) => (
                  <tr key={book.id} className="hover:bg-white/50 dark:hover:bg-slate-900/20 transition-all">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 dark:text-white">{book.serviceCategory}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {book.address}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={book.professionalAvatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"}
                          alt="Pro Avatar"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200/40 dark:border-white/10"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{book.professionalName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {book.bookingDate}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {book.bookingTime}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">${book.totalPrice.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(book.status)}</td>
                    <td className="p-4 pr-6 text-right">
                      {book.status === "completed" ? (
                        <button
                          id={`review-btn-${book.id}`}
                          onClick={() => setReviewBookingId(book.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg border border-blue-200/30 dark:border-blue-500/20 transition-all flex items-center gap-1 ml-auto"
                        >
                          <MessageSquareText className="w-3.5 h-3.5" /> Rate Expert
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Invoice Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dialog Overlay */}
      <AnimatePresence>
        {reviewBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              id="review-modal-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/40 dark:border-white/10 mb-4">
                <h4 className="font-bold text-slate-800 dark:text-white">Rate Service Session</h4>
                <button
                  id="close-review-modal"
                  onClick={() => setReviewBookingId(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>

              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Service Quality Rating</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        id={`star-btn-${star}`}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-1 transition-transform active:scale-125 ${
                          star <= reviewRating ? "text-yellow-400" : "text-slate-200 dark:text-slate-800"
                        }`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Detailed Comments</label>
                  <textarea
                    id="review-comment-textarea"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other customers about your clean, punctual experience with our expert..."
                    className="w-full px-4 py-2.5 bg-white/45 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  id="review-submit-btn"
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Publish Verified Review"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
