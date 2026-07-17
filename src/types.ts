/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "customer" | "professional" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  gender?: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface SavedAddress {
  id: string;
  label: string; // Home, Work, etc.
  address: string;
  city: string;
  zip: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "wallet";
  details: string; // e.g. **** 4242 or user@upi
  isDefault: boolean;
}

export interface CustomerProfile {
  userId: string;
  walletBalance: number;
  savedAddresses: SavedAddress[];
  paymentMethods: PaymentMethod[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
}

export interface AvailabilitySlot {
  day: string; // e.g. "Monday", "2026-07-16"
  slots: string[]; // e.g. ["09:00 AM", "11:00 AM"]
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  category: string;
  title: string;
  bio: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  hourlyRate: number;
  city: string;
  isVerified: boolean;
  avatar: string;
  portfolio: PortfolioItem[];
  availability: AvailabilitySlot[];
  skills: string[];
  certificates: string[];
  analytics: {
    totalEarnings: number;
    completedJobs: number;
    profileViews: number;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  serviceCategory: string;
  bookingDate: string;
  bookingTime: string;
  status: "pending" | "confirmed" | "accepted" | "work_done" | "completed" | "cancelled";
  address: string;
  instructions?: string;
  price: number;
  tax: number;
  platformFee: number;
  discount: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  professionalId: string;
  rating: number;
  comment: string;
  helpfulVotes: number;
  isVerified: boolean;
  createdAt: string;
  reply?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon string name
  description: string;
  basePrice: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minBookingValue: number;
  description: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "g1ai";
  text: string;
  timestamp: string;
  suggestions?: string[];
  bookingSummary?: {
    service: string;
    proName: string;
    price: number;
    date: string;
  };
}
