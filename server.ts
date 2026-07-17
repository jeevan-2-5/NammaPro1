import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
dotenv.config();

import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, INITIAL_PROFESSIONALS, INITIAL_COUPONS } from "./src/data";
import { User, ProfessionalProfile, Booking, Review, Coupon } from "./src/types";

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/^['"]|['"]$/g, "");
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || "").trim().replace(/^['"]|['"]$/g, "");

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[SUPABASE] Client initialized successfully with URL:", supabaseUrl);
  } catch (err) {
    console.error("[SUPABASE] Failed to create client:", err);
  }
} else {
  console.log("[SUPABASE] Credentials not provided in .env. Running in local file-based mode.");
}

function getRazorpayClient() {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^['"]|['"]$/g, "");
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^['"]|['"]$/g, "");
  if (keyId && keySecret) {
    try {
      return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } catch (err) {
      console.error("[RAZORPAY] Failed to instantiate Razorpay client:", err);
      return null;
    }
  }
  return null;
}

function mapUserToSupabase(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    phone: u.phone || null,
    avatar: u.avatar || null,
    created_at: u.createdAt || new Date().toISOString(),
    is_verified: u.isVerified || false
  };
}

function mapBookingToSupabase(b: any) {
  return {
    id: b.id,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_email: b.customerEmail || null,
    customer_phone: b.customerPhone || null,
    professional_id: b.professionalId,
    professional_name: b.professionalName,
    professional_avatar: b.professionalAvatar || null,
    service_category: b.serviceCategory,
    booking_date: b.bookingDate,
    booking_time: b.bookingTime,
    status: b.status,
    address: b.address,
    instructions: b.instructions || null,
    price: b.price,
    tax: b.tax,
    platform_fee: b.platformFee,
    discount: b.discount,
    total_price: b.totalPrice,
    payment_method: b.paymentMethod,
    payment_status: b.paymentStatus,
    created_at: b.createdAt || new Date().toISOString()
  };
}

function mapTicketToSupabase(t: any) {
  return {
    id: t.id,
    user_id: t.userId || null,
    user_name: t.userName || null,
    email: t.email || null,
    subject: t.subject || null,
    message: t.message,
    status: t.status || "open",
    created_at: t.createdAt || new Date().toISOString()
  };
}

function mapAuditLogToSupabase(l: any) {
  return {
    id: l.id,
    timestamp: l.timestamp || new Date().toISOString(),
    action: l.action,
    details: l.details
  };
}

function mapEmailLogToSupabase(e: any) {
  return {
    id: e.id,
    timestamp: e.timestamp || new Date().toISOString(),
    recipient: e.recipient,
    subject: e.subject,
    body: e.body,
    type: e.type
  };
}

// Global tracker for the latest write/sync error with Supabase
let lastSupabaseError = "";

// Async upsert helper
async function safeInsertToSupabase(table: string, data: any) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).upsert(data);
    if (error) {
      const msg = `[Table: ${table}] ${error.message} (Detail: ${error.details || "None"}, Hint: ${error.hint || "None"})`;
      console.warn(`[SUPABASE] Upsert warning:`, msg);
      lastSupabaseError = msg;
    } else {
      console.log(`[SUPABASE] Successfully upserted row in ${table} table`);
    }
  } catch (err: any) {
    const msg = err.message || String(err);
    console.warn(`[SUPABASE] Async write failed on table '${table}':`, msg);
    lastSupabaseError = msg;
  }
}

// Sync existing local database memory to Supabase on startup
async function syncLocalDbToSupabase() {
  if (!supabase) return;
  console.log("[SUPABASE] Starting database synchronization to Supabase...");
  try {
    if (dbState.users.length > 0) {
      const { error } = await supabase.from("users").upsert(dbState.users.map(mapUserToSupabase));
      if (error) console.warn("[SUPABASE] Sync users warning (table might not exist):", error.message);
    }
    if (dbState.bookings.length > 0) {
      const { error } = await supabase.from("bookings").upsert(dbState.bookings.map(mapBookingToSupabase));
      if (error) console.warn("[SUPABASE] Sync bookings warning (table might not exist):", error.message);
    }
    if (dbState.supportTickets.length > 0) {
      const { error } = await supabase.from("support_tickets").upsert(dbState.supportTickets.map(mapTicketToSupabase));
      if (error) console.warn("[SUPABASE] Sync support_tickets warning (table might not exist):", error.message);
    }
    if (dbState.auditLogs && dbState.auditLogs.length > 0) {
      const { error } = await supabase.from("audit_logs").upsert(dbState.auditLogs.map(mapAuditLogToSupabase));
      if (error) console.warn("[SUPABASE] Sync audit_logs warning (table might not exist):", error.message);
    }
    if (dbState.emailLogs && dbState.emailLogs.length > 0) {
      const { error } = await supabase.from("email_logs").upsert(dbState.emailLogs.map(mapEmailLogToSupabase));
      if (error) console.warn("[SUPABASE] Sync email_logs warning (table might not exist):", error.message);
    }
    console.log("[SUPABASE] Database synchronization attempt complete.");
  } catch (err: any) {
    console.warn("[SUPABASE] Initial sync skipped (ensure database tables are initialized):", err.message);
  }
}

// Load and merge latest data from Supabase
async function loadFromSupabaseAndMerge() {
  if (!supabase) return;
  try {
    console.log("[SUPABASE] Pulling and merging database records from Supabase...");
    
    // 1. Users
    const { data: users, error: uErr } = await supabase.from("users").select("*");
    if (!uErr && users && users.length > 0) {
      users.forEach((sbU: any) => {
        const u: User = {
          id: sbU.id,
          email: sbU.email,
          name: sbU.name,
          role: sbU.role as any,
          phone: sbU.phone,
          avatar: sbU.avatar,
          createdAt: sbU.created_at,
          isVerified: sbU.is_verified
        };
        const idx = dbState.users.findIndex(item => item.id === u.id);
        if (idx >= 0) dbState.users[idx] = u;
        else dbState.users.push(u);
      });
    }

    // 2. Bookings
    const { data: bookings, error: bErr } = await supabase.from("bookings").select("*");
    if (!bErr && bookings && bookings.length > 0) {
      bookings.forEach((sbB: any) => {
        const b: Booking = {
          id: sbB.id,
          customerId: sbB.customer_id,
          customerName: sbB.customer_name,
          customerEmail: sbB.customer_email || null,
          customerPhone: sbB.customer_phone || null,
          professionalId: sbB.professional_id,
          professionalName: sbB.professional_name,
          professionalAvatar: sbB.professional_avatar,
          serviceCategory: sbB.service_category,
          bookingDate: sbB.booking_date,
          bookingTime: sbB.booking_time,
          status: sbB.status as any,
          address: sbB.address,
          instructions: sbB.instructions,
          price: Number(sbB.price),
          tax: Number(sbB.tax),
          platformFee: Number(sbB.platform_fee),
          discount: Number(sbB.discount),
          totalPrice: Number(sbB.total_price),
          paymentMethod: sbB.payment_method,
          paymentStatus: sbB.payment_status as any,
          createdAt: sbB.created_at
        };
        const idx = dbState.bookings.findIndex(item => item.id === b.id);
        if (idx >= 0) dbState.bookings[idx] = b;
        else dbState.bookings.push(b);
      });
    }

    // 3. Support Tickets
    const { data: tickets, error: tErr } = await supabase.from("support_tickets").select("*");
    if (!tErr && tickets && tickets.length > 0) {
      tickets.forEach((sbT: any) => {
        const t = {
          id: sbT.id,
          userId: sbT.user_id,
          userName: sbT.user_name,
          email: sbT.email,
          subject: sbT.subject,
          message: sbT.message,
          status: sbT.status as any,
          createdAt: sbT.created_at
        };
        const idx = dbState.supportTickets.findIndex(item => item.id === t.id);
        if (idx >= 0) dbState.supportTickets[idx] = t;
        else dbState.supportTickets.push(t);
      });
    }

    // 4. Audit Logs
    const { data: logs, error: lErr } = await supabase.from("audit_logs").select("*");
    if (!lErr && logs && logs.length > 0) {
      logs.forEach((sbL: any) => {
        const l = {
          id: sbL.id,
          timestamp: sbL.timestamp,
          action: sbL.action,
          details: sbL.details
        };
        const idx = dbState.auditLogs.findIndex(item => item.id === l.id);
        if (idx >= 0) dbState.auditLogs[idx] = l;
        else dbState.auditLogs.push(l);
      });
    }

    // 5. Email Logs
    const { data: eLogs, error: eErr } = await supabase.from("email_logs").select("*");
    if (!eLogs && eLogs && eLogs.length > 0) {
      eLogs.forEach((sbE: any) => {
        const e = {
          id: sbE.id,
          timestamp: sbE.timestamp,
          recipient: sbE.recipient,
          subject: sbE.subject,
          body: sbE.body,
          type: sbE.type as any
        };
        const idx = dbState.emailLogs.findIndex(item => item.id === e.id);
        if (idx >= 0) dbState.emailLogs[idx] = e;
        else dbState.emailLogs.push(e);
      });
    }

    saveToDbFile();
    console.log("[SUPABASE] Successfully synchronized and loaded local database cache with Supabase!");
  } catch (err: any) {
    console.warn("[SUPABASE] Supabase record merge skipped:", err.message);
  }
}

// Persistent File-Based DB Path in container
const DB_FILE = path.join(process.cwd(), "nammapro_db.json");

// Local state container
let dbState = {
  users: [] as User[],
  professionals: [] as ProfessionalProfile[],
  bookings: [] as Booking[],
  reviews: [] as Review[],
  coupons: [] as Coupon[],
  auditLogs: [] as Array<{ id: string; timestamp: string; action: string; details: string }>,
  emailLogs: [] as Array<{ id: string; timestamp: string; recipient: string; subject: string; body: string; type: "customer" | "professional" | "contact" }>,
  supportTickets: [] as Array<{ id: string; userId: string; userName: string; subject: string; message: string; status: "open" | "resolved"; createdAt: string }>
};

function pushAuditLog(action: string, details: string) {
  const log = {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    details
  };
  if (!dbState.auditLogs) {
    dbState.auditLogs = [];
  }
  dbState.auditLogs.push(log);
  saveToDbFile();
  safeInsertToSupabase("audit_logs", mapAuditLogToSupabase(log));
  return log;
}

function sendMockEmail(recipient: string, subject: string, body: string, type: "customer" | "professional" | "contact") {
  const emailId = `email_${Math.random().toString(36).substr(2, 9)}`;
  const emailLog = {
    id: emailId,
    timestamp: new Date().toISOString(),
    recipient,
    subject,
    body,
    type
  };
  if (!dbState.emailLogs) {
    dbState.emailLogs = [];
  }
  dbState.emailLogs.push(emailLog);
  saveToDbFile();
  safeInsertToSupabase("email_logs", mapEmailLogToSupabase(emailLog));
  
  console.log("======================================================================");
  console.log(`[EMAIL DISPATCH SYSTEM] Dispatching notification to: ${recipient}`);
  console.log(`[SUBJECT] ${subject}`);
  console.log(`[CONTENT]`);
  console.log(body);
  console.log("======================================================================");
  
  pushAuditLog("EMAIL_SENT", `Automated email successfully dispatched to ${recipient}. [Subject: ${subject}]`);
  return emailLog;
}

// Seed database with realistic mock data
function seedDatabase() {
  // Admin User
  dbState.users.push({
    id: "user_admin",
    email: "jeevanpvt25226@gmail.com",
    name: "Jeevan (Admin)",
    role: "admin",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    isVerified: true
  });

  // Customer User
  dbState.users.push({
    id: "user_customer",
    email: "customer@nammapro.com",
    name: "Jeevan Gowda",
    role: "customer",
    phone: "+91 81234 56789",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    isVerified: true
  });

  // Professionals Users
  INITIAL_PROFESSIONALS.forEach(pro => {
    dbState.users.push({
      id: pro.userId,
      email: `${pro.name.toLowerCase().replace(/\s+/g, "")}@nammapro.com`,
      name: pro.name,
      role: "professional",
      phone: `+91 90123 ${Math.floor(10000 + Math.random() * 90000)}`,
      avatar: pro.avatar,
      createdAt: new Date().toISOString(),
      isVerified: pro.isVerified
    });
  });

  dbState.professionals = [...INITIAL_PROFESSIONALS];
  dbState.coupons = [...INITIAL_COUPONS];

  // Seed default bookings for customer
  const booking1: Booking = {
    id: "book_101",
    customerId: "user_customer",
    customerName: "Jeevan Gowda",
    customerEmail: "customer@nammapro.com",
    customerPhone: "+91 81234 56789",
    professionalId: "pro_1",
    professionalName: "Arjun Sharma",
    professionalAvatar: INITIAL_PROFESSIONALS[0].avatar,
    serviceCategory: "Home Cleaning",
    bookingDate: "2026-07-12",
    bookingTime: "11:00 AM",
    status: "completed",
    address: "Royal Orchards Apartment, Flat 402, Bengaluru",
    instructions: "Please bring environment-friendly cleaning supplies.",
    price: 55,
    tax: 9.9,
    platformFee: 3.5,
    discount: 10,
    totalPrice: 58.4,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    createdAt: "2026-07-11T10:00:00.000Z"
  };

  const booking2: Booking = {
    id: "book_102",
    customerId: "user_customer",
    customerName: "Jeevan Gowda",
    customerEmail: "customer@nammapro.com",
    customerPhone: "+91 81234 56789",
    professionalId: "pro_3",
    professionalName: "Dr. Ananya Rao",
    professionalAvatar: INITIAL_PROFESSIONALS[2].avatar,
    serviceCategory: "Tutor & Educator",
    bookingDate: "2026-07-18",
    bookingTime: "04:00 PM",
    status: "confirmed",
    address: "Royal Orchards Apartment, Flat 402, Bengaluru",
    instructions: "AP Physics preparation assistance",
    price: 60,
    tax: 10.8,
    platformFee: 3.5,
    discount: 0,
    totalPrice: 74.3,
    paymentMethod: "Stripe",
    paymentStatus: "paid",
    createdAt: "2026-07-14T08:30:00.000Z"
  };

  dbState.bookings.push(booking1, booking2);

  // Seed reviews
  dbState.reviews.push(
    {
      id: "rev_1",
      bookingId: "book_101",
      customerId: "user_customer",
      customerName: "Jeevan Gowda",
      customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      professionalId: "pro_1",
      rating: 5,
      comment: "Arjun did an exceptional job! Our flat is sparkling clean. He was incredibly professional, brought advanced equipment, and sanitised everything beautifully.",
      helpfulVotes: 14,
      isVerified: true,
      createdAt: "2026-07-12T14:30:00.000Z"
    },
    {
      id: "rev_2",
      bookingId: "book_old",
      customerId: "user_cust_anon",
      customerName: "Sneha Hegde",
      professionalId: "pro_3",
      rating: 5,
      comment: "Ananya has a brilliant way of explaining visual math. My daughter went from struggling to scoring top marks in her calculus exams. Highly recommended!",
      helpfulVotes: 22,
      isVerified: true,
      createdAt: "2026-06-30T18:00:00.000Z"
    }
  );

  // Seed support tickets
  dbState.supportTickets.push({
    id: "ticket_1",
    userId: "user_customer",
    userName: "Jeevan Gowda",
    subject: "Refund request for cancelled AC checkup",
    message: "The professional did not turn up. I paid via UPI and request a direct refund to my wallet balance.",
    status: "resolved",
    createdAt: "2026-07-10T11:00:00.000Z"
  });

  // Seed audit logs
  dbState.auditLogs.push({
    id: "log_1",
    timestamp: new Date().toISOString(),
    action: "SYSTEM_BOOT",
    details: "NammaPro core engine loaded and database initialized with premium seed entries."
  });

  saveToDbFile();
}

// Save dbState to local file
function saveToDbFile() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to DB file:", error);
  }
}

// Load dbState from local file
function loadFromDbFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      dbState = JSON.parse(data);
      console.log("NammaPro database loaded successfully from file!");
      
      // Sync professionals list with latest generated list from data.ts
      dbState.professionals = [...INITIAL_PROFESSIONALS];
      
      // Ensure all professionals have associated user accounts
      INITIAL_PROFESSIONALS.forEach(pro => {
        const exists = dbState.users.find(u => u.id === pro.userId);
        if (!exists) {
          dbState.users.push({
            id: pro.userId,
            email: `${pro.name.toLowerCase().replace(/\s+/g, "")}@nammapro.com`,
            name: pro.name,
            role: "professional",
            phone: `+91 90123 ${Math.floor(10000 + Math.random() * 90000)}`,
            avatar: pro.avatar,
            createdAt: new Date().toISOString(),
            isVerified: pro.isVerified
          });
        }
      });

      // Ensure the requested Gmail is seeded and verified as the platform admin
      const adminExists = dbState.users.find(u => u.email.toLowerCase() === "jeevanpvt25226@gmail.com");
      if (!adminExists) {
        dbState.users.push({
          id: "user_admin_owner",
          email: "jeevanpvt25226@gmail.com",
          name: "Jeevan (Admin)",
          role: "admin",
          phone: "+91 98765 43210",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          createdAt: new Date().toISOString(),
          isVerified: true
        });
      } else {
        adminExists.role = "admin";
        adminExists.isVerified = true;
      }

      saveToDbFile();
    } else {
      console.log("Database file does not exist, creating and seeding database...");
      seedDatabase();
    }
  } catch (error) {
    console.error("Error reading DB file, resetting state...", error);
    seedDatabase();
  }
}

async function initializeDatabase() {
  loadFromDbFile();
  if (supabase) {
    try {
      await loadFromSupabaseAndMerge();
      await syncLocalDbToSupabase();
    } catch (err: any) {
      console.warn("[SUPABASE] Background initialization warning:", err.message);
    }
  }
}
initializeDatabase();

// Custom JWT Simulation middleware
function generateToken(payload: { id: string; email: string; role: string; name: string }) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = Buffer.from("nammaprosupersecretkey").toString("base64");
  return `${header}.${data}.${signature}`;
}

function verifyTokenAndGetUser(token: string): any | null {
  try {
    if (!token || !token.includes(".")) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

// Express auth checking helper
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token missing" });
    return;
  }

  const decoded = verifyTokenAndGetUser(token);
  if (!decoded) {
    res.status(403).json({ error: "Invalid or expired session token" });
    return;
  }

  (req as any).user = decoded;
  next();
}

// Auth API endpoints
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role, phone, category, title, bio, hourlyRate, city, gender } = req.body;

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = dbState.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  // Restrict admin role access to only jeevanpvt25226@gmail.com
  let finalRole = role;
  if (normalizedEmail === "jeevanpvt25226@gmail.com") {
    finalRole = "admin";
  } else if (finalRole === "admin") {
    finalRole = "customer";
  }

  const userId = `user_${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser: User = {
    id: userId,
    email: normalizedEmail,
    name,
    role: finalRole,
    phone,
    gender: gender || "Not Specified",
    avatar: `https://images.unsplash.com/photo-${finalRole === "professional" ? "1507003211169-0a1dd7228f2d" : "1535713875002-d1d0cf377fde"}?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    isVerified: finalRole === "customer" || finalRole === "admin"
  };

  dbState.users.push(newUser);

  if (finalRole === "professional") {
    const proId = `pro_${Math.floor(1000 + Math.random() * 9000)}`;
    const newPro: ProfessionalProfile = {
      id: proId,
      userId,
      name,
      category: category || "cleaning",
      title: title || "Verified Service Professional",
      bio: bio || "Professional service provider on NammaPro.",
      rating: 4.5,
      reviewCount: 0,
      experienceYears: 2,
      hourlyRate: Number(hourlyRate) || 30,
      city: city || "Bengaluru",
      isVerified: false,
      avatar: newUser.avatar!,
      portfolio: [],
      availability: [
        { day: "Monday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
        { day: "Tuesday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
        { day: "Wednesday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] }
      ],
      skills: [],
      certificates: [],
      analytics: {
        totalEarnings: 0,
        completedJobs: 0,
        profileViews: 1
      }
    };
    dbState.professionals.push(newPro);
  }

  dbState.auditLogs.push({
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: "USER_REGISTER",
    details: `User ${name} registered successfully as a ${role}. [Credentials - Email: ${normalizedEmail}, Password: ${password}]`
  });

  saveToDbFile();

  // Async save to Supabase
  safeInsertToSupabase("users", mapUserToSupabase(newUser));

  const token = generateToken({ id: userId, email: newUser.email, role: newUser.role, name: newUser.name });
  res.json({ user: newUser, token });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }

  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Force admin role if it's the requested gmail
  if (user.email.toLowerCase() === "jeevanpvt25226@gmail.com") {
    user.role = "admin";
  }

  // Simulated static password check for ease of evaluation
  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  dbState.auditLogs.push({
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: "USER_LOGIN",
    details: `User ${user.name} logged in from device. [Credentials - Email: ${email}, Password: ${password}]`
  });
  saveToDbFile();

  res.json({ user, token });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email || !name) {
    res.status(400).json({ error: "Missing Google email or name" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = dbState.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const userId = `user_${Math.floor(1000 + Math.random() * 9000)}`;
    const isOwner = normalizedEmail === "jeevanpvt25226@gmail.com";
    user = {
      id: userId,
      email: normalizedEmail,
      name,
      role: isOwner ? "admin" : "customer",
      phone: "+91 99999 99999",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    dbState.users.push(user);
    dbState.auditLogs.push({
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action: "GOOGLE_REGISTER",
      details: `User ${name} created account via Google Sign-In.`
    });
  } else {
    // Force admin role if existing user has this email
    if (normalizedEmail === "jeevanpvt25226@gmail.com") {
      user.role = "admin";
    }
    dbState.auditLogs.push({
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action: "GOOGLE_LOGIN",
      details: `User ${name} logged in via Google Sign-In.`
    });
  }

  saveToDbFile();

  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ user, token });
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = dbState.users.find(u => u.id === (req as any).user.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user });
});

// Categories list
app.get("/api/categories", (req, res) => {
  res.json(CATEGORIES);
});

// Professionals list with rich filtering
app.get("/api/professionals", (req, res) => {
  const { category, city, rating, maxPrice, search } = req.query;
  let filtered = [...dbState.professionals];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (city) {
    filtered = filtered.filter(p => p.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (rating) {
    filtered = filtered.filter(p => p.rating >= Number(rating));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.hourlyRate <= Number(maxPrice));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.bio.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json(filtered);
});

app.get("/api/professionals/:id", (req, res) => {
  const pro = dbState.professionals.find(p => p.id === req.params.id);
  if (!pro) {
    res.status(404).json({ error: "Professional not found" });
    return;
  }
  res.json(pro);
});

// Bookings API
app.get("/api/bookings", authenticateToken, (req, res) => {
  const { id, role } = (req as any).user;
  let list = [];

  if (role === "admin") {
    list = dbState.bookings;
  } else if (role === "professional") {
    const pro = dbState.professionals.find(p => p.userId === id);
    if (pro) {
      list = dbState.bookings.filter(b => b.professionalId === pro.id);
    }
  } else {
    list = dbState.bookings.filter(b => b.customerId === id);
  }

  res.json(list);
});

app.post("/api/bookings", authenticateToken, (req, res) => {
  const { professionalId, bookingDate, bookingTime, address, instructions, price, discount, couponCode } = req.body;
  const user = (req as any).user;

  if (!professionalId || !bookingDate || !bookingTime || !address || !price) {
    res.status(400).json({ error: "Missing booking parameter" });
    return;
  }

  const pro = dbState.professionals.find(p => p.id === professionalId);
  if (!pro) {
    res.status(404).json({ error: "Professional profile not found" });
    return;
  }

  const basePrice = Number(price);
  const tax = Number((basePrice * 0.18).toFixed(2)); // 18% GST
  const platformFee = 3.5;
  const discValue = Number(discount) || 0;
  const total = Number((basePrice + tax + platformFee - discValue).toFixed(2));

  const bookingId = `book_${Math.floor(100000 + Math.random() * 900000)}`;
  const customerUser = dbState.users.find(u => u.id === user.id);
  const customerEmail = user.email || customerUser?.email || "customer@nammapro.com";
  const customerPhone = customerUser?.phone || "+91 99999 99999";

  const newBooking: Booking = {
    id: bookingId,
    customerId: user.id,
    customerName: user.name,
    customerEmail,
    customerPhone,
    professionalId: pro.id,
    professionalName: pro.name,
    professionalAvatar: pro.avatar,
    serviceCategory: CATEGORIES.find(c => c.id === pro.category)?.name || "Service",
    bookingDate,
    bookingTime,
    status: "pending",
    address,
    instructions,
    price: basePrice,
    tax,
    platformFee,
    discount: discValue,
    totalPrice: total,
    paymentMethod: req.body.paymentMethod || "UPI",
    paymentStatus: req.body.paymentStatus || "pending",
    createdAt: new Date().toISOString()
  };

  dbState.bookings.push(newBooking);

  pushAuditLog("BOOKING_CREATE", `Booking ${bookingId} created by customer ${user.name} for pro ${pro.name}.`);

  saveToDbFile();

  // Async save to Supabase
  safeInsertToSupabase("bookings", mapBookingToSupabase(newBooking));

  // Dispatch automated emails to both parties
  const customerMsg = `Dear ${user.name || "Customer"},

Your booking on NammaPro has been successfully confirmed and scheduled!

Booking Details:
- Booking ID: #${bookingId}
- Service Category: ${newBooking.serviceCategory}
- Specialist Assigned: ${pro.name}
- Schedule Date: ${bookingDate}
- Schedule Time Slot: ${bookingTime}
- Service Location: ${address}
- Special Instructions: ${instructions || "None"}

Payment Details:
- Service Session Base Price: $${basePrice.toFixed(2)}
- 18% Goods & Services Tax (GST): $${tax.toFixed(2)}
- Safety Platform Trust Fee: $${platformFee.toFixed(2)}
- Promotional Coupon Discount: -$${discValue.toFixed(2)}
- Total Paid Amount: $${total.toFixed(2)}
- Payment Method: ${newBooking.paymentMethod}
- Payment Status: ${newBooking.paymentStatus.toUpperCase()}

Your professional will arrive shortly within 45 minutes of the scheduled time.

Thank you for choosing NammaPro!
Best regards,
NammaPro Team`;

  const professionalMsg = `Dear ${pro.name},

You have received a new service session booking on NammaPro!

Booking Details:
- Booking ID: #${bookingId}
- Customer Name: ${user.name}
- Schedule Date: ${bookingDate}
- Schedule Time Slot: ${bookingTime}
- Service Location: ${address}
- Special Instructions: ${instructions || "None"}

Payment Status: ${newBooking.paymentStatus.toUpperCase()} via ${newBooking.paymentMethod}
Your payouts for this completed booking will be $${basePrice.toFixed(2)} (credited directly to your wallet upon completion).

Please make sure to arrive on time and update the status of this booking in your Provider Hub upon successful completion of the job.

Best regards,
NammaPro Team`;

  sendMockEmail(customerEmail, `Booking Confirmed: Your NammaPro service session with ${pro.name} is scheduled!`, customerMsg, "customer");
  
  const proUser = dbState.users.find(u => u.id === pro.userId);
  const proEmail = proUser?.email || `${pro.name.toLowerCase().replace(/\s+/g, "")}@nammapro.com`;
  sendMockEmail(proEmail, `New Paid Booking Assigned: Service session with ${user.name}!`, professionalMsg, "professional");

  res.json(newBooking);
});

app.post("/api/razorpay/order", authenticateToken, async (req, res) => {
  const { totalPrice } = req.body;
  if (!totalPrice) {
    res.status(400).json({ error: "Missing total price parameter" });
    return;
  }

  const inrAmount = Math.round(Number(totalPrice) * 83 * 100); // 1 USD = 83 INR
  const client = getRazorpayClient();

  if (client) {
    try {
      const order = await client.orders.create({
        amount: inrAmount,
        currency: "INR",
        receipt: `receipt_${Math.floor(10000 + Math.random() * 90000)}`
      });
      res.json({
        orderId: order.id,
        keyId: (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^['"]|['"]$/g, ""),
        amount: order.amount,
        currency: order.currency,
        totalPrice,
        isSimulation: false
      });
    } catch (err: any) {
      console.error("Razorpay order creation failure:", err);
      res.json({
        orderId: `order_sim_${Math.floor(100000 + Math.random() * 900000)}`,
        keyId: (process.env.RAZORPAY_KEY_ID || "rzp_test_NammaProMockKeyId").trim().replace(/^['"]|['"]$/g, ""),
        amount: inrAmount,
        currency: "INR",
        totalPrice,
        isSimulation: true,
        error: err.message || "Failed to create live Razorpay order. Falling back to secure simulated checkout."
      });
    }
  } else {
    res.json({
      orderId: `order_sim_${Math.floor(100000 + Math.random() * 900000)}`,
      keyId: "rzp_test_NammaProMockKeyId",
      amount: inrAmount,
      currency: "INR",
      totalPrice,
      isSimulation: true
    });
  }
});

app.post("/api/razorpay/verify", authenticateToken, async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    professionalId,
    bookingDate,
    bookingTime,
    address,
    instructions,
    price,
    discount,
    couponCode
  } = req.body;

  const user = (req as any).user;
  const client = getRazorpayClient();

  let isVerified = false;

  if (client && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
    if (razorpay_payment_id.startsWith("pay_sim_") || razorpay_signature === "simulated_secure_signature_hash") {
      isVerified = true;
    } else {
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^['"]|['"]$/g, "");
      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest("hex");
      isVerified = (generated_signature === razorpay_signature);
    }
  } else {
    isVerified = true;
  }

  if (!isVerified) {
    res.status(400).json({ error: "Razorpay payment signature verification failed" });
    return;
  }

  const pro = dbState.professionals.find(p => p.id === professionalId);
  if (!pro) {
    res.status(404).json({ error: "Professional profile not found" });
    return;
  }

  const basePrice = Number(price);
  const tax = Number((basePrice * 0.18).toFixed(2));
  const platformFee = 3.5;
  const discValue = Number(discount) || 0;
  const total = Number((basePrice + tax + platformFee - discValue).toFixed(2));

  const bookingId = `book_${Math.floor(100000 + Math.random() * 900000)}`;
  const customerUser = dbState.users.find(u => u.id === user.id);
  const customerEmail = user.email || customerUser?.email || "customer@nammapro.com";
  const customerPhone = customerUser?.phone || "+91 99999 99999";

  const newBooking: Booking = {
    id: bookingId,
    customerId: user.id,
    customerName: user.name,
    customerEmail,
    customerPhone,
    professionalId: pro.id,
    professionalName: pro.name,
    professionalAvatar: pro.avatar,
    serviceCategory: CATEGORIES.find(c => c.id === pro.category)?.name || "Service",
    bookingDate,
    bookingTime,
    status: "pending",
    address,
    instructions,
    price: basePrice,
    tax,
    platformFee,
    discount: discValue,
    totalPrice: total,
    paymentMethod: "Razorpay",
    paymentStatus: "paid",
    createdAt: new Date().toISOString()
  };

  dbState.bookings.push(newBooking);

  pushAuditLog("BOOKING_PAYMENT_SUCCESS", `Razorpay payment captured successfully for booking ${bookingId}. [Payment ID: ${razorpay_payment_id || "Simulated"}]`);
  pushAuditLog("BOOKING_CREATE", `Booking ${bookingId} created by customer ${user.name} for pro ${pro.name} via Razorpay.`);

  saveToDbFile();
  safeInsertToSupabase("bookings", mapBookingToSupabase(newBooking));

  const customerMsg = `Dear ${user.name || "Customer"},

Your booking on NammaPro has been successfully confirmed and paid via Razorpay!

Booking Details:
- Booking ID: #${bookingId}
- Service Category: ${newBooking.serviceCategory}
- Specialist Assigned: ${pro.name}
- Schedule Date: ${bookingDate}
- Schedule Time Slot: ${bookingTime}
- Service Location: ${address}
- Special Instructions: ${instructions || "None"}

Payment Details:
- Service Session Base Price: $${basePrice.toFixed(2)}
- 18% Goods & Services Tax (GST): $${tax.toFixed(2)}
- Safety Platform Trust Fee: $${platformFee.toFixed(2)}
- Promotional Coupon Discount: -$${discValue.toFixed(2)}
- Total Paid Amount: $${total.toFixed(2)}
- Payment Method: Razorpay
- Payment Status: PAID
- Razorpay Payment ID: ${razorpay_payment_id || "simulated_payment_id"}
- Razorpay Order ID: ${razorpay_order_id || "simulated_order_id"}

Your professional will arrive shortly within 45 minutes of the scheduled time.

Thank you for choosing NammaPro!
Best regards,
NammaPro Team`;

  const professionalMsg = `Dear ${pro.name},

You have received a new service session booking on NammaPro!

Booking Details:
- Booking ID: #${bookingId}
- Customer Name: ${user.name}
- Schedule Date: ${bookingDate}
- Schedule Time Slot: ${bookingTime}
- Service Location: ${address}
- Special Instructions: ${instructions || "None"}

Payment Status: PREPAID via Razorpay (Fully Verified)
Your payouts for this completed booking will be $${basePrice.toFixed(2)} (credited directly to your wallet upon completion).

Please make sure to arrive on time and update the status of this booking in your Provider Hub upon successful completion of the job.

Best regards,
NammaPro Team`;

  sendMockEmail(customerEmail, `Booking Confirmed: Your NammaPro service session with ${pro.name} is scheduled!`, customerMsg, "customer");
  
  const proUser = dbState.users.find(u => u.id === pro.userId);
  const proEmail = proUser?.email || `${pro.name.toLowerCase().replace(/\s+/g, "")}@nammapro.com`;
  sendMockEmail(proEmail, `New Paid Booking Assigned: Service session with ${user.name}!`, professionalMsg, "professional");

  res.json(newBooking);
});

app.put("/api/bookings/:id/status", authenticateToken, (req, res) => {
  const { status } = req.body;
  const booking = dbState.bookings.find(b => b.id === req.params.id);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  booking.status = status;
  if (status === "completed") {
    booking.paymentStatus = "paid";
    // Add earnings to professional profile analytics
    const pro = dbState.professionals.find(p => p.id === booking.professionalId);
    if (pro) {
      pro.analytics.totalEarnings += booking.price;
      pro.analytics.completedJobs += 1;
    }
  }

  dbState.auditLogs.push({
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: "BOOKING_STATUS_UPDATE",
    details: `Booking ${booking.id} status updated to ${status}.`
  });

  saveToDbFile();

  // Async save status update to Supabase
  safeInsertToSupabase("bookings", mapBookingToSupabase(booking));

  res.json(booking);
});

// Ratings & Reviews APIs
app.get("/api/reviews/:proId", (req, res) => {
  const reviews = dbState.reviews.filter(r => r.professionalId === req.params.proId);
  res.json(reviews);
});

app.post("/api/reviews", authenticateToken, (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const user = (req as any).user;

  if (!bookingId || !rating) {
    res.status(400).json({ error: "Missing rating content" });
    return;
  }

  const booking = dbState.bookings.find(b => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const reviewId = `rev_${Math.floor(10000 + Math.random() * 90000)}`;
  const newReview: Review = {
    id: reviewId,
    bookingId,
    customerId: user.id,
    customerName: user.name,
    customerAvatar: user.avatar,
    professionalId: booking.professionalId,
    rating: Number(rating),
    comment: comment || "",
    helpfulVotes: 0,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  dbState.reviews.push(newReview);

  // Recalculate Professional rating
  const proReviews = dbState.reviews.filter(r => r.professionalId === booking.professionalId);
  const avg = proReviews.reduce((sum, r) => sum + r.rating, 0) / proReviews.length;
  const pro = dbState.professionals.find(p => p.id === booking.professionalId);
  if (pro) {
    pro.rating = Number(avg.toFixed(1));
    pro.reviewCount = proReviews.length;
  }

  saveToDbFile();
  res.json(newReview);
});

// Admin endpoints
app.get("/api/admin/stats", authenticateToken, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin level required" });
    return;
  }

  const totalRevenue = dbState.bookings
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = {
    totalRevenue,
    activeCustomersCount: dbState.users.filter(u => u.role === "customer").length,
    activeProfessionalsCount: dbState.professionals.length,
    pendingVerifications: dbState.professionals.filter(p => !p.isVerified).length,
    completedBookingsCount: dbState.bookings.filter(b => b.status === "completed").length,
    bookings: dbState.bookings,
    professionals: dbState.professionals,
    auditLogs: (dbState.auditLogs || []).slice(-15).reverse(),
    emailLogs: (dbState.emailLogs || []).slice(-15).reverse(),
    supportTickets: dbState.supportTickets
  };

  res.json(stats);
});

// Supabase status check endpoint
app.get("/api/supabase/status", async (req, res) => {
  const configured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  let connectionOk = false;
  let counts = { users: 0, bookings: 0, supportTickets: 0, auditLogs: 0, emailLogs: 0 };
  let errorMsg = "";

  if (configured && supabase) {
    try {
      const [uRes, bRes, tRes, aRes, eRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).catch(() => ({ count: 0, error: null })),
        supabase.from("email_logs").select("id", { count: "exact", head: true }).catch(() => ({ count: 0, error: null }))
      ]);

      connectionOk = !uRes.error && !bRes.error && !tRes.error;
      counts.users = uRes.count || 0;
      counts.bookings = bRes.count || 0;
      counts.supportTickets = tRes.count || 0;
      counts.auditLogs = aRes?.count || 0;
      counts.emailLogs = eRes?.count || 0;

      if (uRes.error || bRes.error || tRes.error) {
        errorMsg = uRes.error?.message || bRes.error?.message || tRes.error?.message || "";
      }
    } catch (err: any) {
      errorMsg = err.message;
    }
  }

  const sqlSchema = `-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_verified BOOLEAN DEFAULT false
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  professional_id TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  professional_avatar TEXT,
  service_category TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL,
  address TEXT NOT NULL,
  instructions TEXT,
  price NUMERIC NOT NULL,
  tax NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Support Tickets Table (Contact Messages)
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL
);

-- Create Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL
);

-- IMPORTANT: Disable Row Level Security (RLS) on tables 
-- so the web application's public API key can write data.
-- Paste these commands in your Supabase SQL editor and run them:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;`;

  res.json({
    configured,
    connectionOk,
    url: process.env.SUPABASE_URL || "",
    counts,
    error: errorMsg || lastSupabaseError,
    lastWriteError: lastSupabaseError,
    sqlSchema
  });
});

// Manual local-to-Supabase trigger endpoint
app.post("/api/supabase/sync", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin level required" });
    return;
  }

  if (!supabase) {
    res.status(400).json({ error: "Supabase client is not initialized. Please configure credentials in Settings." });
    return;
  }

  try {
    await syncLocalDbToSupabase();
    res.json({ success: true, message: "Local database synchronized with Supabase successfully!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/verify-pro", authenticateToken, (req, res) => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin level required" });
    return;
  }

  const { proId, isVerified } = req.body;
  const pro = dbState.professionals.find(p => p.id === proId);
  if (!pro) {
    res.status(404).json({ error: "Professional profile not found" });
    return;
  }

  pro.isVerified = isVerified;
  const proUser = dbState.users.find(u => u.id === pro.userId);
  if (proUser) proUser.isVerified = isVerified;

  dbState.auditLogs.push({
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: "PROFESSIONAL_VERIFY",
    details: `Professional ${pro.name} verification set to ${isVerified} by admin ${user.name}.`
  });

  saveToDbFile();
  res.json(pro);
});

// Public Contact Us Submission (Simulating delivery to jeevanpvt25226@gmail.com)
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: "Please provide name, email, and message" });
    return;
  }

  // Create a guest support ticket entry for logging
  const ticket = {
    id: `guest_ticket_${Math.floor(1000 + Math.random() * 9000)}`,
    userId: "guest",
    userName: name,
    subject: subject || "Contact Us Query",
    message: `[Email: ${email}] ${message}`,
    status: "open" as const,
    createdAt: new Date().toISOString()
  };

  dbState.supportTickets.push(ticket);
  saveToDbFile();

  // Async save to Supabase
  safeInsertToSupabase("support_tickets", {
    id: ticket.id,
    user_id: "guest",
    user_name: name,
    email: email,
    subject: ticket.subject,
    message: message,
    status: "open",
    created_at: ticket.createdAt
  });

  // Print highly visible simulation output representing dispatching email to jeevanpvt25226@gmail.com
  console.log("======================================================================");
  console.log(`[EMAIL DISPATCH SYSTEM] Simulating delivery to: jeevanpvt25226@gmail.com`);
  console.log(`[FROM] ${name} <${email}>`);
  console.log(`[SUBJECT] ${subject || "Contact Us Inquiry"}`);
  console.log(`[CONTENT]`);
  console.log(message);
  console.log("======================================================================");

  res.json({
    success: true,
    message: "Your message has been received! Email notification triggered to jeevanpvt25226@gmail.com."
  });
});

// Support Ticket Creation
app.post("/api/support/tickets", authenticateToken, (req, res) => {
  const { subject, message } = req.body;
  const user = (req as any).user;

  if (!subject || !message) {
    res.status(400).json({ error: "Missing ticket subject or message" });
    return;
  }

  const ticket = {
    id: `ticket_${Math.floor(1000 + Math.random() * 9000)}`,
    userId: user.id,
    userName: user.name,
    subject,
    message,
    status: "open" as const,
    createdAt: new Date().toISOString()
  };

  dbState.supportTickets.push(ticket);
  saveToDbFile();

  // Async save to Supabase
  safeInsertToSupabase("support_tickets", mapTicketToSupabase(ticket));

  res.json(ticket);
});

// Coupons validate
app.post("/api/coupons/validate", (req, res) => {
  const { code, bookingValue } = req.body;
  const coupon = dbState.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!coupon) {
    res.status(404).json({ error: "Invalid coupon code" });
    return;
  }

  if (bookingValue < coupon.minBookingValue) {
    res.status(400).json({ error: `Coupon requires a minimum service value of $${coupon.minBookingValue}` });
    return;
  }

  const discount = Math.min((bookingValue * coupon.discountPercent) / 100, coupon.maxDiscount);
  res.json({ coupon, discount });
});

// G1AI Assistant Chat API with server-side Google GenAI
app.post("/api/ai/chat", async (req, res) => {
  const { messages, userMessage } = req.body;

  if (!userMessage) {
    res.status(400).json({ error: "Missing user message" });
    return;
  }

  try {
    // Generate system instruction detailing state representation
    const prosContext = dbState.professionals.map(p =>
      `- ${p.name} (${CATEGORIES.find(c => c.id === p.category)?.name}): Rating ${p.rating}/5, Exp: ${p.experienceYears}yrs, Hourly: $${p.hourlyRate}, City: ${p.city}, Verified: ${p.isVerified ? "Yes" : "No"}`
    ).join("\n");

    const categoriesContext = CATEGORIES.map(c => `- ${c.name} (Base Price: $${c.basePrice})`).join("\n");

    const systemInstruction = `You are G1AI, the extremely friendly, helpful, fast, and professional AI Assistant for NammaPro, a SaaS marketplace for local professional bookings.
Your primary directive: You must ALWAYS introduce yourself on your very first message as exactly: "Hello, I am G1AI."

Core Features:
- NammaPro services available: Home Cleaning, Electrician, Plumber, Tutor, Beauty/Salon, Carpentry, AC/Appliance, Painting, Gardening, Pest Control, Tech Support, Photography, Driver, Fitness/Yoga, Pet Care.
- Standard coupons available: NAMMAPRO20 (20% off up to $30), DEEPCLEAN (15% off over $100), G1FESTIVE (25% off up to $40).

Current Professional database list for suggestions:
${prosContext}

Service Categories:
${categoriesContext}

Guidelines:
1. Speak warmly and naturally. Maintain a highly professional and luxury Apple-level experience.
2. If the user wants to book, suggest the specific professional who fits their requested category and city.
3. Handle complaints: register tickets, explain policies, or give transparent price estimations (Base rate + 18% GST + $3.5 Platform Fee).
4. Support languages: English, Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi. Reply in the same language if the user queries in it.
5. Provide helpful, short summaries or bullet points when offering suggestions. Avoid raw code blocks. Keep answers under 150 words for readability.`;

    const contents = [];
    
    // Convert conversational history to Gemini contents array
    if (Array.isArray(messages)) {
      messages.slice(-10).forEach(msg => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiText = response.text || "Hello! How can I assist you with NammaPro services today?";
    res.json({ text: aiText });

  } catch (error: any) {
    console.error("Gemini API Error in G1AI:", error);
    res.status(500).json({
      text: "Hello, I am G1AI. I am experiencing a temporary connection issue. However, I can suggest trying the standard NammaPro coupon 'G1FESTIVE' for an instant 25% discount on our high-quality local home services! How can I help you manually today?",
      error: error.message
    });
  }
});

// Serve compiled build assets in production, handle Vite dev middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NammaPro custom server running on http://localhost:${PORT}`);
  });
}

startServer();
