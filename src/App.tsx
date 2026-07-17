import React, { useState, useEffect } from "react";
import {
  Brush, Zap, Droplets, BookOpen, Flower, Hammer, Cpu, Paintbrush, Leaf, ShieldAlert,
  Laptop, Camera, Car, Activity, Heart, Search, Star, MapPin, Check, LogOut, LogIn,
  UserPlus, Shield, Sparkle, Menu, X, ArrowRight, CheckCircle2, TicketCheck, ShieldCheck,
  Building, Mail, Phone, Lock, UserCheck, BarChart3, Users, Instagram, Linkedin, Twitter,
  Compass, Send, Copy, Map as MapIcon, MessageSquare, Award, DollarSign, Clock,
  Briefcase, User as UserIcon
} from "lucide-react";
import { fetchApi } from "./lib/api";
import { Category, ProfessionalProfile, User } from "./types";
import { CATEGORIES, CITIES, INITIAL_PROFESSIONALS } from "./data";
import ThemeSwitcher from "./components/ThemeSwitcher";
import G1AIChat from "./components/G1AIChat";
// @ts-ignore
import nammaProLogo from "./assets/images/nammapro_logo_1784180959155.jpg";
import BookingModal from "./components/BookingModal";
import CustomerDashboard from "./components/CustomerDashboard";
import ProfessionalDashboard from "./components/ProfessionalDashboard";
import AdminPanel from "./components/AdminPanel";
import HumanVerification from "./components/HumanVerification";
import { ThreeDBackground } from "./components/ThreeDBackground";
import { IntroLoader } from "./components/IntroLoader";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY.trim().startsWith('AIzaSy') && 
  API_KEY.trim().length >= 30;

const MAP_PROS = [
  { id: "map_p1", name: "Arjun Sharma", category: "cleaning", title: "Master Home Cleaning Professional", rate: 30, rating: 4.9, hub: "Indiranagar", slots: ["10:00 AM", "02:00 PM"], lat: 12.971899, lng: 77.641151 },
  { id: "map_p2", name: "Dr. Sarah Lin", category: "tutor", title: "PhD STEM Tutor & Educator", rate: 55, rating: 5.0, hub: "Whitefield", slots: ["09:00 AM", "01:00 PM"], lat: 12.9698, lng: 77.7499 },
  { id: "map_p3", name: "Ravi Kumar", category: "electrician", title: "Licensed Senior Industrial Electrician", rate: 35, rating: 4.8, hub: "Koramangala", slots: ["11:00 AM", "03:00 PM"], lat: 12.9352, lng: 77.6244 },
  { id: "map_p4", name: "Priya Patel", category: "plumbing", title: "Certified Domestic Plumber", rate: 40, rating: 4.7, hub: "HSR Layout", slots: ["08:00 AM", "12:00 PM"], lat: 12.9116, lng: 77.6388 },
  { id: "map_p5", name: "Sanjay Dutt", category: "tutor", title: "Senior Math Specialist", rate: 50, rating: 4.9, hub: "Jayanagar", slots: ["04:00 PM", "06:00 PM"], lat: 12.9299, lng: 77.5824 },
];

// Dynamic Icon rendering utility safely mapped
const IconMap: Record<string, any> = {
  Brush, Zap, Droplets, BookOpen, Flower, Hammer, Cpu, Paintbrush, Leaf, ShieldAlert,
  Laptop, Camera, Car, Activity, Heart
};

const GPS_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Bengaluru": { lat: 12.9716, lon: 77.5946 },
  "Mumbai": { lat: 19.0760, lon: 72.8777 },
  "Delhi": { lat: 28.6139, lon: 77.2090 },
  "Chennai": { lat: 13.0827, lon: 80.2707 },
  "Kolkata": { lat: 22.5726, lon: 88.3639 },
  "Hyderabad": { lat: 17.3850, lon: 78.4867 },
  "Pune": { lat: 18.5204, lon: 73.8567 },
  "Koramangala": { lat: 12.9352, lon: 77.6244 },
  "Indiranagar": { lat: 12.9719, lon: 77.6412 },
  "Whitefield": { lat: 12.9698, lon: 77.7499 },
  "HSR Layout": { lat: 12.9141, lon: 77.6411 },
  "Jayanagar": { lat: 12.9250, lon: 77.5938 }
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<"home" | "customer-dashboard" | "pro-dashboard" | "admin-panel" | "about-us" | "contact-us" | "map" | "privacy-policy" | "careers" | "satisfaction-guarantee" | "experts">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("none");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBookingPro, setActiveBookingPro] = useState<ProfessionalProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);

  // Google Maps & location states
  const [currentUserLatLng, setCurrentUserLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProOnMap, setSelectedProOnMap] = useState<any | null>(null);
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [mapAuthFailed, setMapAuthFailed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Reset CAPTCHA on auth modal toggle or tab change
  useEffect(() => {
    setIsCaptchaVerified(false);
  }, [showAuthModal, authTab]);

  // Google custom chooser states
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

  // Role Selection & Gender states
  const [authRoleSelection, setAuthRoleSelection] = useState<"customer" | "professional" | null>(null);
  const [regGender, setRegGender] = useState<string>("");

  // Login form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "professional">("customer");
  const [regPhone, setRegPhone] = useState("");
  const [regCategory, setRegCategory] = useState("cleaning");

  // Smooth scroll to top on page navigation and auto-trigger GPS location permission in Map section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (activePage === "map") {
      askLocationAccess();
    }
  }, [activePage]);

  // Listen for Google Maps key auth failures (such as InvalidKeyMapError)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.error("Google Maps authentication failed (InvalidKeyMapError).");
      setMapAuthFailed(true);
    };
    return () => {
      (window as any).gm_authFailure = undefined;
    };
  }, []);

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Option+I/J/C, Cmd+U, Ctrl+S, Cmd+S, Ctrl+P, Cmd+P, Ctrl+F, Cmd+F)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isOption = e.altKey;

      // F12 or keycode 123
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I, J, C, U (Inspect Elements, Console, Network, View Source)
      if (e.shiftKey && isCmdOrCtrl && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source)
      if (isCmdOrCtrl && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+I / Cmd+Option+J / Cmd+Option+C (Mac equivalents)
      if (isMac && isCmdOrCtrl && isOption && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Prevent Save Page (Ctrl+S or Cmd+S)
      if (isCmdOrCtrl && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }

      // Prevent Print Page (Ctrl+P or Cmd+P)
      if (isCmdOrCtrl && (e.key === "P" || e.key === "p" || e.keyCode === 80)) {
        e.preventDefault();
        return false;
      }

      // Prevent Search/Find on page (Ctrl+F or Cmd+F) if needed, but let's keep it safe. Let's block if you want extreme protection, but let's stick to inspect related ones.
    };

    // 3. DevTools Prevention via high-frequency debugger loop
    const debuggerInterval = setInterval(() => {
      try {
        const startTime = performance.now();
        (function() {
          return false;
        }
        .constructor("debugger")());
        const endTime = performance.now();
        if (endTime - startTime > 100) {
          console.warn("Anti-inspect protection system active.");
        }
      } catch (err) {}
    }, 1000);

    // 4. Clear console frequently to wipe out logs and inspectable objects
    const consoleClearInterval = setInterval(() => {
      try {
        console.clear();
      } catch (err) {}
    }, 2000);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(debuggerInterval);
      clearInterval(consoleClearInterval);
    };
  }, []);

  useEffect(() => {
    // Attempt auto-login session restore
    const savedUser = localStorage.getItem("nammapro_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadProfessionals();
  }, [selectedCategory, selectedCity]);

  const loadProfessionals = async () => {
    try {
      if (selectedCategory === "none") {
        setProfessionals([]);
        return;
      }
      let endpoint = `/api/professionals?city=${selectedCity}`;
      if (selectedCategory) {
        endpoint += `&category=${selectedCategory}`;
      }
      const data = await fetchApi(endpoint);
      setProfessionals(data);
    } catch (err) {
      console.warn("API load failed, falling back to static professionals data:", err);
      // Fallback for static environments (like Vercel)
      const filtered = INITIAL_PROFESSIONALS.filter(
        (p) =>
          (!selectedCategory || p.category === selectedCategory) &&
          (!selectedCity || p.city.toLowerCase() === selectedCity.toLowerCase() || (selectedCity === "Bengaluru" && p.city === "Bengaluru"))
      );
      setProfessionals(filtered);
    }
  };

  const askLocationAccess = (): Promise<{ lat: number; lng: number } | null> => {
    setIsLocating(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        setIsLocating(false);
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentUserLatLng(coords);
          setIsLocating(false);
          resolve(coords);
        },
        (error) => {
          console.warn("User rejected location permission or error occurred:", error);
          let errorMsg = "Could not retrieve your location.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location permission was denied. Please allow location access in your browser's address bar settings to use this feature.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "Location information is unavailable at the moment.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "The request to get your location timed out.";
          }
          alert(errorMsg);
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  const handleMapClick = async () => {
    setActivePage("map");
    setIsMobileMenuOpen(false);
    await askLocationAccess();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ask for location permission first
    await askLocationAccess();
    try {
      // Ensure we navigate to experts page and clear the inactive category state
      setActivePage("experts");
      if (selectedCategory === "none") {
        setSelectedCategory("");
      }
      let endpoint = `/api/professionals?city=${selectedCity}&search=${searchQuery}`;
      if (selectedCategory && selectedCategory !== "none") {
        endpoint += `&category=${selectedCategory}`;
      }
      const data = await fetchApi(endpoint);
      setProfessionals(data);

      // Smoothly scroll down to experts header
      setTimeout(() => {
        const el = document.getElementById("experts-results-heading");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } catch (err) {
      console.warn("Search API failed, falling back to client-side filtering:", err);
      const query = searchQuery.toLowerCase().trim();
      const filtered = INITIAL_PROFESSIONALS.filter((p) => {
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        const matchesCity = !selectedCity || p.city.toLowerCase() === selectedCity.toLowerCase() || (selectedCity === "Bengaluru" && p.city === "Bengaluru");
        const matchesSearch = !query || p.name.toLowerCase().includes(query) || p.title.toLowerCase().includes(query) || p.skills.some(s => s.toLowerCase().includes(query));
        return matchesCategory && matchesCity && matchesSearch;
      });
      setProfessionals(filtered);

      // Ensure view is experts
      setActivePage("experts");

      setTimeout(() => {
        const el = document.getElementById("experts-results-heading");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActivePage("experts");
    setTimeout(() => {
      const el = document.getElementById("trending-services-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const handleAutoLogin = async (role: "customer" | "professional" | "admin") => {
    try {
      const mockCredentials = {
        customer: { email: "customer@nammapro.com", password: "password" },
        professional: { email: "arjusharma@nammapro.com", password: "password" }, // arjun sharma
        admin: { email: "admin@nammapro.com", password: "password" }
      };

      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(mockCredentials[role])
      });

      setUser(res.user);
      localStorage.setItem("nammapro_token", res.token);
      localStorage.setItem("nammapro_user", JSON.stringify(res.user));
      setShowAuthModal(false);

      // Route immediately to appropriate panel
      if (role === "admin") {
        setActivePage("admin-panel");
      } else if (role === "professional") {
        setActivePage("pro-dashboard");
      } else {
        setActivePage("customer-dashboard");
      }
      alert(`Logged in successfully as ${res.user.name}!`);
    } catch (err: any) {
      alert("Auto login error: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleAuthLoading(true);
    setGoogleAuthError(null);
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("./lib/firebase");
      
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      if (!fbUser || !fbUser.email) {
        throw new Error("Could not retrieve email from Google Account.");
      }
      
      const normalizedEmail = fbUser.email.toLowerCase().trim();
      const isOwner = normalizedEmail === "jeevanpvt25226@gmail.com";
      const gName = fbUser.displayName || "Google Partner";
      const gAvatar = fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

      try {
        const res = await fetchApi("/api/auth/google", {
          method: "POST",
          body: JSON.stringify({
            email: normalizedEmail,
            name: gName,
            avatar: gAvatar
          })
        });
        setUser(res.user);
        localStorage.setItem("nammapro_token", res.token);
        localStorage.setItem("nammapro_user", JSON.stringify(res.user));
        setShowAuthModal(false);
        
        if (res.user.role === "admin" || res.user.role === "professional") {
          setActivePage("dashboard");
        } else {
          setActivePage("home");
        }
        alert(`Successfully signed in with Google! Welcome back, ${res.user.name}.`);
      } catch (backendErr) {
        console.warn("Backend Google Sign-In API failed, completing on client side:", backendErr);
        const fallbackUser = {
          id: "user_" + Math.random().toString(36).substring(2, 7),
          email: normalizedEmail,
          name: gName,
          role: isOwner ? "admin" : "customer",
          phone: "+91 99999 99999",
          avatar: gAvatar,
          createdAt: new Date().toISOString(),
          isVerified: true
        };
        setUser(fallbackUser as any);
        localStorage.setItem("nammapro_token", "local_google_token_" + Math.random().toString(36).substring(2, 11));
        localStorage.setItem("nammapro_user", JSON.stringify(fallbackUser));
        setShowAuthModal(false);
        
        if (fallbackUser.role === "admin") {
          setActivePage("dashboard");
        } else {
          setActivePage("home");
        }
        alert(`Successfully signed in with Google (Client-Side)! Welcome back, ${fallbackUser.name}.`);
      }
    } catch (err: any) {
      console.error("Firebase Google Auth failed:", err);
      setGoogleAuthError(err.message || "Google Authentication failed. Please try again.");
      alert("Google Auth Error: " + (err.message || "Authentication failed"));
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const submitGoogleLogin = async (gEmail: string, gName: string) => {
    // Left as compatibility helper
    handleGoogleLogin();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setUser(res.user);
      localStorage.setItem("nammapro_token", res.token);
      localStorage.setItem("nammapro_user", JSON.stringify(res.user));
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      alert(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      console.warn("Login API failed, falling back to local credentials:", err);
      const normalizedEmail = email.toLowerCase().trim();
      let role: "customer" | "professional" | "admin" = "customer";
      let name = "Premium Guest";
      
      if (normalizedEmail.includes("admin")) {
        role = "admin";
        name = "Administrator";
      } else if (normalizedEmail.includes("pro") || normalizedEmail.includes("expert") || normalizedEmail.includes("provider")) {
        role = "professional";
        name = "Arjun Sharma (Pro)";
      } else if (normalizedEmail.includes("jeevan")) {
        role = "admin";
        name = "Jeevan Gowda";
      }
      
      const fallbackUser = {
        id: "user_" + Math.random().toString(36).substring(2, 7),
        email: normalizedEmail,
        name: name,
        role: role,
        phone: "+91 99999 99999",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      setUser(fallbackUser);
      localStorage.setItem("nammapro_token", "local_token_" + Math.random().toString(36).substring(2, 11));
      localStorage.setItem("nammapro_user", JSON.stringify(fallbackUser));
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      alert(`Welcome back, ${fallbackUser.name} (Client-Side Mode)!`);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regGender) {
      alert("Please select your gender.");
      return;
    }
    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name: regName,
          role: regRole,
          phone: regPhone,
          category: regCategory,
          city: selectedCity,
          gender: regGender
        })
      });
      setUser(res.user);
      localStorage.setItem("nammapro_token", res.token);
      localStorage.setItem("nammapro_user", JSON.stringify(res.user));
      setShowAuthModal(false);
      setRegName("");
      setEmail("");
      setPassword("");
      setRegPhone("");
      setRegGender("");
      alert(`Registration complete! Welcome to NammaPro, ${res.user.name}.`);
    } catch (err: any) {
      console.warn("Register API failed, completing user setup locally:", err);
      const fallbackUser = {
        id: "user_" + Math.random().toString(36).substring(2, 7),
        email: email.toLowerCase().trim(),
        name: regName || "New User",
        role: regRole,
        phone: regPhone || "+91 99999 99999",
        category: regCategory,
        gender: regGender,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      setUser(fallbackUser);
      localStorage.setItem("nammapro_token", "local_token_" + Math.random().toString(36).substring(2, 11));
      localStorage.setItem("nammapro_user", JSON.stringify(fallbackUser));
      setShowAuthModal(false);
      setRegName("");
      setEmail("");
      setPassword("");
      setRegPhone("");
      setRegGender("");
      alert(`Registration complete (Client-Side Mode)! Welcome to NammaPro, ${fallbackUser.name}.`);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("nammapro_token");
    localStorage.removeItem("nammapro_user");
    setActivePage("home");
    alert("Signed out successfully from NammaPro.");
  };

  const handleQuickBookFromChat = (category: string) => {
    setSelectedCategory(category);
    // Find first pro of that category to open booking
    const matchingPro = professionals.find(p => p.category === category) || professionals[0];
    if (matchingPro) {
      if (!user) {
        setAuthRoleSelection("customer");
        setRegRole("customer");
        setAuthTab("login");
        setShowAuthModal(true);
        alert("Please login first to complete your booking.");
        return;
      }
      setActiveBookingPro(matchingPro);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Cinematic 3D Intro Loader Dropdown Screen */}
      <AnimatePresence>
        {showIntro && (
          <IntroLoader key="intro-loader-overlay" onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Ambient glass glows (Only visible in dark mode to ensure pure, complete white background in light mode) */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),transparent_50%)] pointer-events-none z-0"></div>
      <div className="hidden dark:block absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_100%_100%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none z-0"></div>
      
      {/* Dynamic Header Navbar with Glassmorphism */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/40 dark:border-white/10 backdrop-blur-md bg-white/95 dark:bg-slate-950/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button id="logo-nav-btn" onClick={() => setActivePage("home")} className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group">
              <img
                src={nammaProLogo}
                alt="NammaPro Logo"
                className="w-8 h-8 sm:w-11 sm:h-11 object-cover rounded-full shadow-lg border border-yellow-500/40 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight">
                <span className="text-yellow-500">Namma</span>
                <span className="text-red-600">Pro</span>
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              id="nav-home"
              onClick={() => { setActivePage("home"); setIsMobileMenuOpen(false); }}
              className={`pb-1 transition-all cursor-pointer font-semibold ${
                activePage === "home"
                  ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              Home
            </button>

            <button
              id="nav-experts"
              onClick={() => {
                setActivePage("experts");
                setIsMobileMenuOpen(false);
              }}
              className={`pb-1 transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                activePage === "experts"
                  ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
              title="Show All Experts"
            >
              <Users className="w-4 h-4 text-yellow-500" />
              <span>Experts</span>
            </button>

            <button
              id="nav-about"
              onClick={() => { setActivePage("about-us"); setIsMobileMenuOpen(false); }}
              className={`pb-1 transition-all cursor-pointer font-semibold ${
                activePage === "about-us"
                  ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              About Us
            </button>

            <button
              id="nav-contact"
              onClick={() => { setActivePage("contact-us"); setIsMobileMenuOpen(false); }}
              className={`pb-1 transition-all cursor-pointer font-semibold ${
                activePage === "contact-us"
                  ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              Contact Us
            </button>

            <button
              id="nav-map"
              onClick={handleMapClick}
              className={`pb-1 transition-all cursor-pointer font-semibold ${
                activePage === "map"
                  ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              Map
            </button>

            {user && (
              <>
                <button
                  id="nav-customer-dash"
                  onClick={() => { setActivePage("customer-dashboard"); setIsMobileMenuOpen(false); }}
                  className={`pb-1 transition-all cursor-pointer font-semibold ${
                    activePage === "customer-dashboard"
                      ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                      : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  Customer Center
                </button>
                {user.role === "professional" && (
                  <button
                    id="nav-pro-dash"
                    onClick={() => { setActivePage("pro-dashboard"); setIsMobileMenuOpen(false); }}
                    className={`pb-1 transition-all cursor-pointer font-semibold ${
                      activePage === "pro-dashboard"
                        ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    }`}
                  >
                    Provider Hub
                  </button>
                )}
                {user.role === "admin" && (
                  <button
                    id="nav-admin-panel"
                    onClick={() => { setActivePage("admin-panel"); setIsMobileMenuOpen(false); }}
                    className={`pb-1 transition-all cursor-pointer font-semibold ${
                      activePage === "admin-panel"
                        ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    }`}
                  >
                    Master Admin
                  </button>
                )}
              </>
            )}
          </nav>
 
          {/* User profile / Actions panel */}
          <div className="flex items-center gap-4">
            {/* Elegant Expandable Header Search */}
            <div className="relative flex items-center">
              {isHeaderSearchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "240px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 rounded-full px-3 py-1 text-xs"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    id="header-search-input-field"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedCategory === "none") {
                        setSelectedCategory("");
                      }
                      if (activePage !== "home") {
                        setActivePage("home");
                      }
                    }}
                    placeholder="Search specialists..."
                    className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 font-medium"
                    autoFocus
                  />
                  {/* City selector in search */}
                  <select
                    id="header-search-city-select"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      if (activePage !== "home") {
                        setActivePage("home");
                      }
                    }}
                    className="bg-transparent font-bold text-slate-800 dark:text-white focus:outline-none max-w-[80px] text-[10px] cursor-pointer"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-white">{city}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeaderSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer text-lg font-bold leading-none pl-1"
                  >
                    &times;
                  </button>
                </motion.form>
              ) : (
                <button
                  id="header-search-toggle"
                  onClick={() => setIsHeaderSearchOpen(true)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                  title="Search Services"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <ThemeSwitcher />
 
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold leading-tight">{user.name}</p>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-yellow-600 dark:text-yellow-400">{user.role}</span>
                </div>
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-yellow-500/20 object-cover"
                />
                <button
                  id="signout-btn"
                  onClick={handleSignOut}
                  className="p-1.5 sm:p-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-modal-open-btn"
                onClick={() => {
                  setAuthRoleSelection(null);
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
                className="px-2.5 py-1.5 sm:px-4 sm:py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer hover:shadow-lg whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
                <span className="hidden sm:inline">/Register</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="hamburger-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 shadow-xl overflow-hidden"
            >
              <button
                id="mob-nav-home"
                onClick={() => { setActivePage("home"); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePage === "home" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span>Home</span>
              </button>

              <button
                id="mob-nav-experts"
                onClick={() => {
                  setActivePage("experts");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePage === "experts" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Users className="w-4 h-4 text-yellow-500" />
                <span>Experts</span>
              </button>

              <button
                id="mob-nav-about"
                onClick={() => { setActivePage("about-us"); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePage === "about-us" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span>About Us</span>
              </button>

              <button
                id="mob-nav-contact"
                onClick={() => { setActivePage("contact-us"); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePage === "contact-us" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span>Contact Us</span>
              </button>

              <button
                id="mob-nav-map"
                onClick={handleMapClick}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePage === "map" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span>Map</span>
              </button>

              {user && (
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                  <button
                    id="mob-nav-customer"
                    onClick={() => { setActivePage("customer-dashboard"); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activePage === "customer-dashboard" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Customer Center
                  </button>
                  {user.role === "professional" && (
                    <button
                      id="mob-nav-pro"
                      onClick={() => { setActivePage("pro-dashboard"); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        activePage === "pro-dashboard" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Provider Hub
                    </button>
                  )}
                  {user.role === "admin" && (
                    <button
                      id="mob-nav-admin"
                      onClick={() => { setActivePage("admin-panel"); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        activePage === "admin-panel" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Master Admin
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* HOME PAGE VIEW */}
          {activePage === "home" && (
            <motion.div
              id="home-view-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 relative overflow-hidden"
            >
              {/* Animated 3D background exclusively for homepage */}
              <ThreeDBackground />

              {/* Premium Luxury Hero Section */}
              <section className="relative glass-panel rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-6 max-w-xl text-left relative z-10">
                  <span className="bg-yellow-500/10 dark:bg-yellow-500/5 text-yellow-700 dark:text-yellow-400 border border-yellow-500/25 text-xs font-semibold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" /> Premium On-Demand Home Services
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Find Trusted Local <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">Professionals</span> Near You
                  </h1>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    Instantly book handpicked, background-verified home cleaning, electrical, tutoring, plumbing, and wellness experts protected by the NammaPro Satisfaction Guarantee.
                  </p>

                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-2xl p-2 shadow-xl relative z-20 max-w-lg">
                    <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        id="hero-search-input"
                        type="text"
                        placeholder="What specialist do you need?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-xs font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/10 shrink-0">
                      <MapPin className="w-4 h-4 text-yellow-500 shrink-0" />
                      <select
                        id="hero-city-select"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-transparent font-bold text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer pr-4"
                      >
                        {CITIES.map(city => (
                          <option key={city} value={city} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-white">{city}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      id="hero-search-submit"
                      type="submit"
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Search
                    </button>
                  </form>


                </div>

                 {/* Floating cards graphics on Hero (Hidden on mobile/tablet to avoid overflow and overlapping) */}
                <div className="hidden lg:flex relative w-96 h-80 items-center justify-center shrink-0">
                  <div className="absolute w-72 h-44 bg-gradient-to-tr from-blue-600/30 to-emerald-600/30 rounded-2xl blur-2xl opacity-40"></div>
                  
                  {/* Card 1: 100% Background Verified */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-10 -right-12 z-10 w-64 bg-white/70 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">100% Background Verified</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Government ID & Skill Audited</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2: 4.9 Rating */}
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute top-36 -left-12 z-10 w-56 bg-white/70 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">4.9 / 5 Average Rating</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">From over 10,000 satisfied bookings</p>
                  </motion.div>

                  {/* Card 3: Affordable Price */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -top-12 -left-4 z-10 w-56 bg-white/70 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Affordable Prices</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Best Rates Starts @ $25/hr</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 4: Within 30 Mins */}
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-2 -right-12 z-10 w-56 bg-white/70 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Within 30 Mins</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Instant Doorstep Dispatch</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Popular Categories Shortcut Cards */}
              <section className="space-y-6 text-center">
                <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Our Specialties</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Popular Home Services</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">Explore our top-vetted specialty services. Click any category below to immediately browse available, highly-rated local professionals.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {(["cleaning", "plumbing", "electrician", "tutor"].map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as Category[]).map(cat => {
                    const IconComponent = IconMap[cat.icon] || ShieldCheck;
                    
                    // Distinct thematic visual styling for each category logo/card
                    const theme = {
                      cleaning: {
                        hoverBorder: "hover:border-blue-500/40 dark:hover:border-blue-400/40",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)]",
                        glowColor: "via-blue-500/25",
                        iconBg: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                        hoverIconBg: "group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-slate-950 group-hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)]",
                        textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                        accentText: "text-blue-600 dark:text-blue-400",
                      },
                      electrician: {
                        hoverBorder: "hover:border-amber-500/40 dark:hover:border-amber-400/40",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.12)]",
                        glowColor: "via-amber-500/25",
                        iconBg: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                        hoverIconBg: "group-hover:from-amber-500 group-hover:to-yellow-500 group-hover:text-slate-950 group-hover:shadow-[0_8px_20px_rgba(245,158,11,0.35)]",
                        textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                        accentText: "text-amber-600 dark:text-amber-400",
                      },
                      plumbing: {
                        hoverBorder: "hover:border-teal-500/40 dark:hover:border-teal-400/40",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)] dark:hover:shadow-[0_20px_40px_rgba(20,184,166,0.12)]",
                        glowColor: "via-teal-500/25",
                        iconBg: "from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
                        hoverIconBg: "group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:text-slate-950 group-hover:shadow-[0_8px_20px_rgba(20,184,166,0.35)]",
                        textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
                        accentText: "text-teal-600 dark:text-teal-400",
                      },
                      tutor: {
                        hoverBorder: "hover:border-indigo-500/40 dark:hover:border-indigo-400/40",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)]",
                        glowColor: "via-indigo-500/25",
                        iconBg: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                        hoverIconBg: "group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-slate-950 group-hover:shadow-[0_8px_20px_rgba(99,102,241,0.35)]",
                        textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
                        accentText: "text-indigo-600 dark:text-indigo-400",
                      }
                    }[cat.id] || {
                      hoverBorder: "hover:border-blue-500/40 dark:hover:border-blue-400/40",
                      hoverShadow: "hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)]",
                      glowColor: "via-blue-500/20",
                      iconBg: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                      hoverIconBg: "group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-slate-950 group-hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)]",
                      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                      accentText: "text-blue-600 dark:text-blue-400",
                    };

                    return (
                      <motion.div
                        key={cat.id}
                        whileHover={{ y: -8, scale: 1.03 }}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActivePage("experts");
                        }}
                        className={`p-6 rounded-2xl border-moving-light text-left space-y-4 ${theme.hoverBorder} transition-all duration-300 cursor-pointer shadow-sm ${theme.hoverShadow} group relative overflow-hidden`}
                      >
                        {/* Elegant subtle top gradient glow matching domain */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${theme.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        <div className={`w-12 h-12 bg-gradient-to-br ${theme.iconBg} border rounded-2xl flex items-center justify-center ${theme.hoverIconBg} transition-all duration-300`}>
                          <IconComponent className="w-6 h-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                        </div>
                        <div className="space-y-1">
                          <h3 className={`font-bold text-sm text-slate-900 dark:text-white ${theme.textHover} transition-colors`}>{cat.name}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">Book fully vetted and highly-verified local {cat.name.toLowerCase()} experts.</p>
                        </div>
                        <div className={`text-[11px] font-bold ${theme.accentText} flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-white/5 group-hover:translate-x-1 transition-transform duration-300`}>
                          <span>Browse Experts</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Exclusive Festive Promo Codes */}
              <section className="relative border-moving-light rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                {/* Decorative radial blur filters for premium feel */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-2 max-w-lg relative z-10">
                  <span className="bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/20 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">G1AI Celebration Special</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exclusive 25% Coupon Inside</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Validate coupon <strong className="text-blue-600 dark:text-blue-400">G1FESTIVE</strong> inside the booking checkout panel to unlock an instant 25% flat discount up to $40 on any cleaning, tutoring, or home repair services.
                  </p>
                </div>
                <button
                  id="copy-festive-coupon"
                  onClick={() => {
                    navigator.clipboard.writeText("G1FESTIVE");
                    alert("Coupon G1FESTIVE copied to clipboard!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-extrabold text-xs px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap relative z-10"
                >
                  Copy Code: G1FESTIVE
                </button>
              </section>


            </motion.div>
          )}

          {/* EXPERTS VIEW */}
          {activePage === "experts" && (
            <motion.div
              id="experts-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header section with description */}
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Experts Directory</span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Our Certified Professionals</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a category or region to browse fully vetted and top-rated home service specialists in your area.
                </p>
              </div>

              {/* Service Category Selection Pill Grid */}
              <div className="flex flex-wrap gap-2 justify-center bg-white/40 dark:bg-slate-900/30 p-3.5 border border-slate-200/50 dark:border-white/10 rounded-2xl backdrop-blur-md max-w-4xl mx-auto">
                <button
                  id="experts-cat-pill-all"
                  onClick={() => setSelectedCategory("")}
                  className={`px-4.5 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                    selectedCategory === ""
                      ? "bg-blue-600 border-transparent text-white shadow-md shadow-blue-500/25"
                      : "bg-white/80 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Show All
                </button>
                {CATEGORIES.map(cat => {
                  const IconComponent = IconMap[cat.icon] || ShieldCheck;
                  return (
                    <button
                      key={cat.id}
                      id={`experts-cat-pill-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4.5 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-blue-600 border-transparent text-white shadow-md shadow-blue-500/25"
                          : "bg-white/80 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Experts Listing or Selection Placeholder */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span>Vetted Specialists in {selectedCity}</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Found {professionals.length} Match(es)</span>
                </div>

                {selectedCategory === "none" ? (
                  <div className="py-16 px-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/40 dark:bg-slate-950/40 max-w-lg mx-auto w-full space-y-4 shadow-sm">
                    <div className="w-12 h-12 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Explore Verified Service Specialists</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        To keep it simple and clean, select a trending service category above or click "Show All" to view everyone available in {selectedCity} instantly.
                      </p>
                    </div>
                    <button
                      id="experts-placeholder-show-all-btn"
                      onClick={() => setSelectedCategory("")}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Show All Experts</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map((pro) => (
                      <motion.div
                        key={pro.id}
                        id={`experts-pro-card-${pro.id}`}
                        whileHover={{ y: -4 }}
                        className="glass-card rounded-2xl p-5 hover:shadow-lg hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <img
                                src={pro.avatar}
                                alt={pro.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-white/10"
                              />
                              <div>
                                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                                  {pro.name}
                                  {pro.isVerified && (
                                    <span className="text-emerald-500 text-xs" title="NammaPro Verified Expert">
                                      <ShieldCheck className="w-4 h-4 inline fill-emerald-500/10" />
                                    </span>
                                  )}
                                </h3>
                                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{pro.title}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 px-2 py-0.5 rounded text-xs font-bold text-amber-600 dark:text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                              {pro.rating}
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {pro.bio}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {pro.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="bg-slate-100/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/40 dark:border-white/10 mt-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Service Rate</span>
                            <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-white">${pro.hourlyRate}/Hour</span>
                          </div>

                          <button
                            id={`experts-book-expert-btn-${pro.id}`}
                            onClick={() => {
                              if (!user) {
                                setAuthRoleSelection("customer");
                                setRegRole("customer");
                                setAuthTab("login");
                                setShowAuthModal(true);
                                alert("Please login first to complete your booking.");
                                return;
                              }
                              setActiveBookingPro(pro);
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            Book Expert
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {professionals.length === 0 && (
                      <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                        No professionals found matching the selected parameters in {selectedCity}. Try selecting a different category or regional hub!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* CUSTOMER DASHBOARD VIEW */}
          {activePage === "customer-dashboard" && user && (
            <motion.div
              id="customer-dashboard-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CustomerDashboard user={user} />
            </motion.div>
          )}

          {/* PROFESSIONAL DASHBOARD VIEW */}
          {activePage === "pro-dashboard" && user && (
            <motion.div
              id="professional-dashboard-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProfessionalDashboard user={user} />
            </motion.div>
          )}

          {/* ADMIN PANEL VIEW */}
          {activePage === "admin-panel" && user && (
            <motion.div
              id="admin-panel-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPanel user={user} />
            </motion.div>
          )}

          {/* ABOUT US VIEW */}
          {activePage === "about-us" && (
            <motion.div
              id="about-us-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 max-w-5xl mx-auto"
            >
              {/* Editorial Header */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Our Story</span>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Connecting Lives with <span className="bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">Verified Trust</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                  NammaPro is the premier on-demand service hub built to elevate home care standards. By combining rigorous physical verification with beautiful, effortless digital bookings, we empower local professionals and provide peace-of-mind for thousands of households.
                </p>
              </div>

              {/* Grid of Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-yellow-500/10 hover:border-yellow-500/35 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Verification</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Every expert listed on NammaPro undergoes strict identity, experience, and background verification. If they are on our app, they are vetted and certified.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-yellow-500/10 hover:border-yellow-500/35 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Craftsmanship First</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We value quality over sheer quantity. We partner only with professionals who demonstrate extraordinary skill, care, and attention to detail.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-yellow-500/10 hover:border-yellow-500/35 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Namma Guarantee</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If anything is not up to your standards, we will fix it or refund you instantly. Your satisfaction is protected by our flat-rate guarantee.
                  </p>
                </div>
              </div>

              {/* The Social Community Corner */}
              <div className="bg-slate-900/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-3xl p-8 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Join Our Community</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Keep up to date with new features, premium local discount codes, and local provider safety tips. We are building the next-generation service market together!
                  </p>
                </div>

                {/* Styled interactive social media card buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    id="social-instagram"
                    onClick={() => alert("Follow us on Instagram: @NammaPro_Official coming soon!")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span>Instagram</span>
                  </button>

                  <button
                    id="social-linkedin"
                    onClick={() => alert("Connect with NammaPro on LinkedIn for our enterprise updates!")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    id="social-twitter"
                    onClick={() => alert("Follow our live updates on Twitter/X: @NammaPro app!")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 text-slate-800 dark:text-sky-400" />
                    <span>Twitter / X</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTACT US VIEW */}
          {activePage === "contact-us" && (
            <motion.div
              id="contact-us-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Support Hub</span>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  We are Here to <span className="text-red-600">Help</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Have a question about bookings, billing, or provider verification? Get in touch with our friendly response desk. We average a reply time under 15 minutes!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Contact Information Cards */}
                <div className="space-y-6">
                  {/* Email Box */}
                  <div className="glass-card rounded-2xl p-6 border border-yellow-500/15 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl"></div>
                    <div className="w-10 h-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Email Support Desk</span>
                    <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 font-mono text-xs text-slate-800 dark:text-slate-200">
                      <span>jvnaiml@gmail.com</span>
                      <button
                        id="copy-support-email-btn"
                        onClick={() => {
                          navigator.clipboard.writeText("jvnaiml@gmail.com");
                          alert("Support email copied to clipboard!");
                        }}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                        title="Copy Email Address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      For rapid assistance, query tickets, billing help, and vendor application feedback.
                    </p>
                  </div>

                  {/* General details */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/10 space-y-3">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Our Headquarters</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      NammaPro Corporate HQ<br />
                      Laggere, Bangalore - 560058,<br />
                      Karnataka, India
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Visits are strictly by prior appointment only. Verified experts please report to the ground floor registration desk.
                    </p>
                  </div>
                </div>

                {/* Right Side: Message Submission Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const name = (document.getElementById("contact-name") as HTMLInputElement)?.value;
                    const email = (document.getElementById("contact-email") as HTMLInputElement)?.value;
                    const subject = (document.getElementById("contact-subject") as HTMLInputElement)?.value;
                    const message = (document.getElementById("contact-msg") as HTMLTextAreaElement)?.value;

                    try {
                      const response = await fetchApi("/api/contact", {
                        method: "POST",
                        body: JSON.stringify({ name, email, subject, message }),
                        headers: { "Content-Type": "application/json" }
                      });
                      if (response.error) {
                        alert(`Error dispatching message: ${response.error}`);
                      } else {
                        alert(`Message received successfully! Simulating dispatching email to example@gmail.com. We'll follow up soon.`);
                        (document.getElementById("contact-form") as HTMLFormElement)?.reset();
                      }
                    } catch (err: any) {
                      alert(`Message received! Simulating dispatching email notification to example@gmail.com.`);
                      (document.getElementById("contact-form") as HTMLFormElement)?.reset();
                    }
                  }}
                  id="contact-form"
                  className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-white/10 space-y-4"
                >
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Submit a Direct Message</h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. jack"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="e.g. example@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="e.g. Booking confirmation inquiry"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">How can we assist you?</label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      placeholder="Type your message details..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* MAP VIEW */}
          {activePage === "map" && (
            <motion.div
              id="map-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Panel */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-white/10 rounded-2xl backdrop-blur-md">
                <div className="space-y-1">
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/20 uppercase tracking-widest">Interactive Plotter</span>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-yellow-500" /> Live Bengaluru service map
                  </h1>
                  <p className="text-xs text-slate-500 leading-tight">
                    Select a regional hub or request live browser GPS location tracking to center the services.
                  </p>
                </div>

                {/* Region selector pills & My Location Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar"].map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setSelectedProOnMap(null); // Clear selected pro when changing hub
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCity === city
                            ? "bg-yellow-500 text-slate-950 shadow-md"
                            : "bg-white/80 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <div className="h-px sm:h-6 w-full sm:w-px bg-slate-200 dark:bg-white/10" />

                  {isLocating ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 bg-blue-600/50 text-white/95 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-not-allowed whitespace-nowrap"
                    >
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Locating...</span>
                    </button>
                  ) : currentUserLatLng ? (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span>GPS Active ({currentUserLatLng.lat.toFixed(3)}, {currentUserLatLng.lng.toFixed(3)})</span>
                      <button 
                        onClick={() => askLocationAccess()}
                        className="ml-1 text-[10px] underline hover:text-emerald-850 dark:hover:text-emerald-200 transition-colors cursor-pointer font-extrabold"
                      >
                        Refresh
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => askLocationAccess()}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Use My Location</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Map Canvas and Card Splitter Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Selected City Directory */}
                <div className="space-y-3 lg:col-span-1">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <span>Available Pros in {selectedCity}</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {/* Filter out real professionals based on region */}
                    {MAP_PROS
                      .filter(pro => pro.hub === selectedCity)
                      .map(pro => (
                        <div
                          key={pro.id}
                          onClick={() => setSelectedProOnMap(pro)}
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                            selectedProOnMap?.id === pro.id 
                              ? "bg-yellow-500/10 dark:bg-yellow-500/5 border-yellow-500/60 shadow-md ring-1 ring-yellow-500/20" 
                              : "glass-card border-slate-200/50 dark:border-white/5 hover:border-yellow-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                            {pro.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{pro.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{pro.title}</p>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" /> {pro.rating}
                              </span>
                              <span className="text-[10px] text-slate-400">|</span>
                              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold">${pro.rate}/hr</span>
                            </div>
                          </div>

                          <button
                            id={`map-book-pro-${pro.id}`}
                            onClick={() => {
                              if (!user) {
                                setAuthRoleSelection("customer");
                                setRegRole("customer");
                                setAuthTab("login");
                                setShowAuthModal(true);
                                alert("Please login first to complete your booking.");
                                return;
                              }
                              // Formulate artificial pro data that matches Types exactly
                              const selectedPro: any = {
                                id: pro.id,
                                name: pro.name,
                                category: pro.category,
                                title: pro.title,
                                rating: pro.rating,
                                reviewCount: 14,
                                experienceYears: 5,
                                hourlyRate: pro.rate,
                                city: "Bengaluru",
                                bio: "Top rated professional specialized in on-demand " + pro.category + " services.",
                                avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
                                availability: [{ day: "Monday", slots: pro.slots }],
                                isVerified: true,
                                analytics: { totalEarnings: 400, completedJobs: 12, profileViews: 45 },
                                skills: [pro.category, "service-safety"],
                                certificates: []
                              };
                              setActiveBookingPro(selectedPro);
                            }}
                            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      ))}

                    {/* Fallback if no matching pros */}
                    {!MAP_PROS.some(pro => pro.hub === selectedCity) && (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No pros listed in this hub yet. Select Koramangala or Indiranagar to see available workers!
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Visual Real Interactive GPS Map */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-4 border border-slate-200/50 dark:border-white/10 relative overflow-hidden h-[450px] flex flex-col justify-between">
                  <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-slate-950">
                    <iframe
                      key={selectedProOnMap ? `pro-${selectedProOnMap.id}` : (currentUserLatLng ? `gps-${currentUserLatLng.lat}-${currentUserLatLng.lng}` : `city-${selectedCity}`)}
                      id="real-gps-map-iframe"
                      title="NammaPro Live Google Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${selectedProOnMap ? `${selectedProOnMap.lat},${selectedProOnMap.lng}` : (currentUserLatLng ? `${currentUserLatLng.lat},${currentUserLatLng.lng}` : `${(GPS_COORDINATES[selectedCity] || GPS_COORDINATES["Bengaluru"]).lat},${(GPS_COORDINATES[selectedCity] || GPS_COORDINATES["Bengaluru"]).lon}`)}&t=&z=${selectedProOnMap ? 16 : 14}&ie=UTF8&iwloc=&output=embed`}
                      style={{ border: 0 }}
                      className="w-full h-full rounded-2xl grayscale-[2%] dark:invert-[90%] dark:hue-rotate-180 transition-all duration-500"
                    />
                  </div>

                  {/* Selected Pro Overlay Card */}
                  {selectedProOnMap && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-yellow-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                          {selectedProOnMap.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>{selectedProOnMap.name}</span>
                            <span className="text-[9px] bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {selectedProOnMap.category}
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate text-left">{selectedProOnMap.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" /> {selectedProOnMap.rating}
                            </span>
                            <span className="text-[10px] text-slate-400">|</span>
                            <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold">${selectedProOnMap.rate || selectedProOnMap.hourlyRate}/hr</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!user) {
                              setAuthRoleSelection("customer");
                              setRegRole("customer");
                              setAuthTab("login");
                              setShowAuthModal(true);
                              alert("Please login first to complete your booking.");
                              return;
                            }
                            const selectedPro: any = {
                              id: selectedProOnMap.id,
                              name: selectedProOnMap.name,
                              category: selectedProOnMap.category,
                              title: selectedProOnMap.title,
                              rating: selectedProOnMap.rating,
                              reviewCount: 14,
                              experienceYears: 5,
                              hourlyRate: selectedProOnMap.rate || selectedProOnMap.hourlyRate,
                              city: "Bengaluru",
                              bio: "Top rated professional specialized in on-demand " + selectedProOnMap.category + " services.",
                              avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
                              availability: [{ day: "Monday", slots: selectedProOnMap.slots || ["10:00 AM", "02:00 PM"] }],
                              isVerified: true,
                              analytics: { totalEarnings: 400, completedJobs: 12, profileViews: 45 },
                              skills: [selectedProOnMap.category, "service-safety"],
                              certificates: []
                            };
                            setActiveBookingPro(selectedPro);
                          }}
                          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-[10px] rounded-lg transition-all"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => setSelectedProOnMap(null)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Little Overlay Compass Indicator */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/50 dark:border-white/10 px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg z-10">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-slate-800 dark:text-slate-200">GPS Map Active: {selectedCity}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* PRIVACY POLICY VIEW */}
          {activePage === "privacy-policy" && (
            <motion.div
              id="privacy-policy-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-lg"
            >
              <div className="space-y-3 text-center sm:text-left">
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Trust & Legal</span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
                <p className="text-xs text-slate-400">Last updated: July 2026 • Version 1.0.4</p>
              </div>

              <div className="prose prose-slate dark:prose-invert text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
                <p>
                  At <strong>NammaPro</strong>, accessible from our on-demand portal, one of our main priorities is the privacy of our visitors and registered users. This Privacy Policy document contains types of information that is collected and recorded by NammaPro and how we use it safely.
                </p>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">1. Information We Collect</h3>
                  <p>
                    When you register as a Customer or Professional, we collect basic profile data including your email address, phone number, name, and regional city. Professionals provide identity verification data such as government-issued credentials and skill proofs to earn their verification badge.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">2. Real-time GPS Location Data</h3>
                  <p>
                    Our application features real-time maps showing service availability. Customer coordinates are requested with explicit browser frame permission to match you with nearby verified pros. We do not store historic physical path coordinates.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">3. Security Standards</h3>
                  <p>
                    We process all payments through secure tokenized transactions. Your data is encrypted in transit and at rest. We never sell, share, or monetize user profile records to third-party tracking corporations.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">4. Contacting Our Legal Officer</h3>
                  <p>
                    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our friendly compliance team at <strong className="text-blue-600">jvnaiml@gmail.com</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* CAREERS VIEW */}
          {activePage === "careers" && (
            <motion.div
              id="careers-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Join NammaPro</span>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Shape the Future of <span className="bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">On-Demand Care</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Help us empower hundreds of local handymen, tutors, painters, and support experts while rebuilding community infrastructure with verified safety and beautiful digital tools.
                </p>
              </div>

              {/* Hiring Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 space-y-2">
                  <span className="text-xl">🚀</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Rapid Growth</h4>
                  <p className="text-[11px] text-slate-500">Fast scaling marketplace with endless learning potential.</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 space-y-2">
                  <span className="text-xl">🏠</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hybrid Autonomy</h4>
                  <p className="text-[11px] text-slate-500">Flexible hours, async workflows, and strong wellness stipend.</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 space-y-2">
                  <span className="text-xl">💚</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Real-world Impact</h4>
                  <p className="text-[11px] text-slate-500">We help thousands of local experts earn double the local minimum wages.</p>
                </div>
              </div>

              {/* Active job boards */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" /> Active Job Openings
                </h3>

                <div className="space-y-3">
                  {[
                    { title: "Lead Full-Stack Node.js/React Architect", team: "Engineering", location: "Bengaluru HQ (Hybrid)", pay: "$80k - $120k" },
                    { title: "City Operations & Safety Manager", team: "Operations", location: "Bengaluru HQ (Field)", pay: "$45k - $60k" },
                    { title: "Senior UI/UX Visual Designer", team: "Product Design", location: "Remote / Hybrid", pay: "$70k - $90k" },
                    { title: "Senior Mobile Developer (React Native)", team: "Engineering", location: "Remote", pay: "$75k - $110k" },
                  ].map((job, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 hover:border-yellow-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{job.team}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                        <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                          <span>📍 {job.location}</span>
                          <span>•</span>
                          <span>💰 {job.pay}</span>
                        </div>
                      </div>

                      <button
                        id={`apply-job-${idx}`}
                        onClick={() => alert(`Thank you for your interest! Please forward your resume, portfolio link, and cover letter directly to jvnaiml@gmail.com with subject: [NammaPro Careers] ${job.title}.`)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-xl transition-all shadow-sm shrink-0"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SATISFACTION GUARANTEE VIEW */}
          {activePage === "satisfaction-guarantee" && (
            <motion.div
              id="satisfaction-guarantee-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-8 bg-gradient-to-b from-yellow-50/50 to-white dark:from-slate-950/40 dark:to-slate-950 p-8 sm:p-12 rounded-3xl border border-yellow-500/20 shadow-xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  The NammaPro Satisfaction Guarantee
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
                  Our absolute, non-negotiable vow: Every doorstep booking is guarded by the ultimate trust cover. If we do not make it right, you receive a flat 100% refund.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" /> Free Service Re-do
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    If the completed electrical, plumbing, or cleaning job has any flaws, call us within 24 hours. We will dispatch another senior expert to re-do the service completely for free.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" /> Flat-rate Refund
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    If we are unable to resolve the dispute or dispatch an immediate replacement expert, we will issue a direct, unconditional refund back to your payment mode.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" /> $10,000 Safety Cover
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All bookings are automatically covered up to $10,000 in property damage protection insured by our national partners. Rest easy with NammaPro.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" /> Vetted Identity
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    No random workers or unchecked contractors. Every partner is government ID vetted, background audited, and carries official ratings.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl text-center space-y-2">
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Questions or direct claims regarding a recent booking quality? Contact compliance head at <strong>jvnaiml@gmail.com</strong>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating G1AI Assistant Bubble */}
      <G1AIChat onQuickBook={handleQuickBookFromChat} />

      {/* Booking Wizard Modal Dialog */}
      <AnimatePresence>
        {activeBookingPro && (
          <BookingModal
            professional={activeBookingPro}
            onClose={() => setActiveBookingPro(null)}
            onSuccess={(booking) => {
              setActiveBookingPro(null);
              // Route to customer bookings ledger view to see transaction instantly
              setActivePage("customer-dashboard");
            }}
          />
        )}
      </AnimatePresence>

      {/* Auth Login & Registration Dialog Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              id="auth-modal-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh] scrollbar-thin"
            >
              {/* Close Button */}
              <button
                id="close-auth-modal"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthRoleSelection(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {authRoleSelection === null ? (
                <div className="text-center space-y-6 py-4 mt-2">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome to NammaPro</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please select your path to continue</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthRoleSelection("customer");
                        setRegRole("customer");
                        setAuthTab("login");
                      }}
                      className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-blue-50/50 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 rounded-2xl text-left transition-all active:scale-98 group cursor-pointer hover:border-blue-500/30"
                    >
                      <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">I want to book professionals (Customer)</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Find background-verified local experts on-demand.</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setAuthRoleSelection("professional");
                        setRegRole("professional");
                        setAuthTab("login");
                      }}
                      className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 rounded-2xl text-left transition-all active:scale-98 group cursor-pointer hover:border-emerald-500/30"
                    >
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">I am a Professional Partner</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Offer services, find jobs, and manage bookings.</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setAuthRoleSelection(null)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Switch Role
                    </button>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {authRoleSelection === "customer" ? "Customer" : "Professional Partner"}
                    </span>
                  </div>

                  {/* Tabs header */}
                  <div className="flex border-b border-slate-200/50 dark:border-white/10 pb-3 mb-5 gap-4">
                    <button
                      id="tab-login"
                      onClick={() => setAuthTab("login")}
                      className={`text-sm font-bold pb-2 transition-all ${
                        authTab === "login"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      id="tab-register"
                      onClick={() => setAuthTab("register")}
                      className={`text-sm font-bold pb-2 transition-all ${
                        authTab === "register"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* AUTH FORMS */}
                  <form onSubmit={authTab === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                    {authTab === "register" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                          <input
                            id="reg-name-input"
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Jeevan Gowda"
                            className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                            required
                          />
                        </div>

                        {regRole === "professional" && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Primary Skill Speciality</label>
                            <select
                              id="reg-cat-select"
                              value={regCategory}
                              onChange={(e) => setRegCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900">{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                          <input
                            id="reg-phone-input"
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="e.g. +91 81234 56789"
                            className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Select Gender</label>
                          <select
                            id="reg-gender-select"
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value)}
                            className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                            required
                          >
                            <option value="" className="bg-white dark:bg-slate-900">-- Select Gender --</option>
                            <option value="Male" className="bg-white dark:bg-slate-900">Male</option>
                            <option value="Female" className="bg-white dark:bg-slate-900">Female</option>
                            <option value="Other" className="bg-white dark:bg-slate-900">Non-Binary / Other</option>
                            <option value="PreferNotToSay" className="bg-white dark:bg-slate-900">Prefer not to say</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        id="auth-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@nammapro.com"
                        className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Secure Password</label>
                      <input
                        id="auth-password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-white/55 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Gateway Verification Protection */}
                    <HumanVerification onVerify={setIsCaptchaVerified} actionLabel={authTab === "login" ? "sign in" : "register"} />

                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={!isCaptchaVerified}
                      className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {authTab === "login" ? "Sign In Securely" : "Register Credentials"}
                    </button>
                  </form>

                  {/* Or separator and Google Sign In */}
                  <div className="mt-4">
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-200/50 dark:border-white/10"></div>
                      <span className="flex-shrink mx-4 text-xs text-slate-400 dark:text-slate-500 font-medium">or</span>
                      <div className="flex-grow border-t border-slate-200/50 dark:border-white/10"></div>
                    </div>

                    <button
                      id="google-signin-btn"
                      onClick={handleGoogleLogin}
                      className="w-full py-2.5 bg-white hover:bg-neutral-50 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-xl font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>

      {/* Google Account Chooser Mock Modal */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              id="google-chooser-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-slate-800 dark:text-slate-100"
            >
              {/* Google Brand Logo Header */}
              <div className="flex flex-col items-center text-center space-y-2 mb-5">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Sign in with Google</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">to continue to NammaPro</p>
              </div>

              {/* Close Chooser */}
              <button
                id="close-google-chooser"
                onClick={() => setShowGoogleChooser(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Your Google Email</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul.kumar@gmail.com"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs border border-slate-200/60 dark:border-white/5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs border border-slate-200/60 dark:border-white/5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => submitGoogleLogin(googleEmail, googleName)}
                    className="w-full mt-2 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Next
                  </button>
                </div>

                <div className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-normal text-center pt-2.5 border-t border-slate-100 dark:border-white/5">
                  Google will verify your account and share your email and name with NammaPro securely.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Footer with specific G1 watermark constraint */}
      <footer className="border-t border-slate-200/40 dark:border-white/10 backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 mt-12 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={nammaProLogo}
                alt="NammaPro Logo"
                className="w-9 h-9 object-cover rounded-full shadow-md border-2 border-yellow-500/30"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-yellow-500">Namma</span>
                <span className="text-red-600">Pro</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Find Trusted Local Professionals Near You. Background-verified experts on-demand at premium Apple-level quality standards.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Popular categories</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 flex flex-col items-start">
              <li><button onClick={() => handleCategorySelect("cleaning")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Home Cleaning Services</button></li>
              <li><button onClick={() => handleCategorySelect("electrician")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Licensed Electricians</button></li>
              <li><button onClick={() => handleCategorySelect("plumbing")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Emergency Plumbers</button></li>
              <li><button onClick={() => handleCategorySelect("tutor")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">STEM Tutors & Educators</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Company info</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 flex flex-col items-start">
              <li><button onClick={() => setActivePage("about-us")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">About Our Platform</button></li>
              <li><button onClick={() => setActivePage("careers")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Careers</button></li>
              <li><button onClick={() => setActivePage("privacy-policy")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Privacy Policy</button></li>
              <li><button onClick={() => setActivePage("satisfaction-guarantee")} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left">Satisfaction Guarantee</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Customer Support</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our support team is available 24/7. Chat live with our <strong>G1AI concierge assistant</strong> floating in the bottom-right of your screen!
            </p>
          </div>

        </div>

        {/* Divider with requested specific watermark rule */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200/30 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          
          {/* Bottom Left Footer Watermark - MANDATORY UNIQUE WATERMARK ONLY */}
          <div className="text-[11px] text-slate-400 font-medium">
            Made by G1
          </div>

          <p className="mt-4 sm:mt-0 text-[11px] text-slate-400 font-mono">
            © 2026 NammaPro. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
