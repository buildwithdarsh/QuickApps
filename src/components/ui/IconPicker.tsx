"use client";

import { useState, useMemo } from "react";
import {
  Home, Search, ShoppingCart, User, Heart, Star, Settings, Bell,
  Menu, Plus, Check, Mail, Phone, MapPin,
  Calendar, Clock, Camera, Image, Video, Music, Mic,
  Wifi, Download, Upload, Share2, Link2, Globe,
  Lock, Unlock, Eye, Shield, Key, Fingerprint,
  CreditCard, DollarSign, Wallet, Gift, Tag, Percent, Receipt,
  Truck, Package, Box, ShoppingBag, Store,
  MessageSquare, MessageCircle, Send, Inbox,
  FileText, File, Folder, Clipboard, BookOpen, Bookmark,
  BarChart3, PieChart, TrendingUp, Activity,
  Zap, Flame, Sun, Moon, Cloud,
  Map, Navigation, Compass, Flag, Target,
  Users, UserPlus, UserCheck, Contact,
  Smartphone, Laptop, Tv,
  Play, Headphones,
  Palette,
  Coffee, Pizza, Apple, Cake, Wine,
  Car, Plane, Train, Bike,
  Building, Hospital, School, Library,
  Award, Trophy, Crown,
  AlertCircle, Info, HelpCircle,
  ThumbsUp, Smile,
  Layers, Grid, List,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  Trash2, Edit, Copy, Save,
  LogIn, LogOut, ExternalLink, QrCode,
  Lightbulb, Power,
  type LucideIcon,
} from "lucide-react";

// ── Icon registry ───────────────────────────────────

const ICONS: { name: string; icon: LucideIcon; tags: string[] }[] = [
  // Navigation & Common
  { name: "home", icon: Home, tags: ["house", "main", "dashboard"] },
  { name: "search", icon: Search, tags: ["find", "lookup"] },
  { name: "menu", icon: Menu, tags: ["hamburger", "nav"] },
  { name: "settings", icon: Settings, tags: ["gear", "config", "preferences"] },
  { name: "bell", icon: Bell, tags: ["notification", "alert", "ring"] },
  { name: "user", icon: User, tags: ["profile", "account", "person"] },
  { name: "users", icon: Users, tags: ["people", "group", "team"] },
  { name: "user-plus", icon: UserPlus, tags: ["add", "invite"] },
  { name: "user-check", icon: UserCheck, tags: ["verified", "approved"] },
  { name: "contact", icon: Contact, tags: ["address", "person"] },

  // Shopping & Commerce
  { name: "cart", icon: ShoppingCart, tags: ["shopping", "basket", "buy"] },
  { name: "shopping-bag", icon: ShoppingBag, tags: ["bag", "purchase"] },
  { name: "store", icon: Store, tags: ["shop", "market"] },
  { name: "tag", icon: Tag, tags: ["label", "price"] },
  { name: "percent", icon: Percent, tags: ["discount", "sale", "offer"] },
  { name: "gift", icon: Gift, tags: ["present", "reward", "bonus"] },
  { name: "receipt", icon: Receipt, tags: ["bill", "invoice"] },
  { name: "package", icon: Package, tags: ["box", "order", "delivery"] },
  { name: "truck", icon: Truck, tags: ["delivery", "shipping"] },
  { name: "box", icon: Box, tags: ["package", "parcel"] },

  // Money & Payment
  { name: "credit-card", icon: CreditCard, tags: ["payment", "card", "pay"] },
  { name: "wallet", icon: Wallet, tags: ["money", "balance", "funds"] },
  { name: "dollar", icon: DollarSign, tags: ["money", "price", "currency", "rupee"] },

  // Communication
  { name: "message", icon: MessageSquare, tags: ["chat", "comment", "text"] },
  { name: "chat", icon: MessageCircle, tags: ["bubble", "conversation"] },
  { name: "send", icon: Send, tags: ["submit", "paper plane"] },
  { name: "mail", icon: Mail, tags: ["email", "envelope", "inbox"] },
  { name: "inbox", icon: Inbox, tags: ["messages", "received"] },
  { name: "phone", icon: Phone, tags: ["call", "dial", "contact"] },

  // Content & Media
  { name: "image", icon: Image, tags: ["photo", "picture", "gallery"] },
  { name: "camera", icon: Camera, tags: ["photo", "snap", "capture"] },
  { name: "video", icon: Video, tags: ["movie", "film", "record"] },
  { name: "music", icon: Music, tags: ["song", "audio", "tune"] },
  { name: "mic", icon: Mic, tags: ["microphone", "voice", "record"] },
  { name: "play", icon: Play, tags: ["start", "video", "media"] },
  { name: "headphones", icon: Headphones, tags: ["audio", "listen"] },

  // Location & Travel
  { name: "map-pin", icon: MapPin, tags: ["location", "place", "address"] },
  { name: "map", icon: Map, tags: ["directions", "navigate"] },
  { name: "navigation", icon: Navigation, tags: ["gps", "direction", "arrow"] },
  { name: "compass", icon: Compass, tags: ["direction", "explore"] },
  { name: "globe", icon: Globe, tags: ["world", "web", "earth", "international"] },
  { name: "car", icon: Car, tags: ["drive", "vehicle", "ride"] },
  { name: "plane", icon: Plane, tags: ["flight", "travel", "airport"] },
  { name: "train", icon: Train, tags: ["rail", "metro", "subway"] },
  { name: "bike", icon: Bike, tags: ["cycle", "bicycle"] },

  // Actions
  { name: "heart", icon: Heart, tags: ["love", "like", "favorite", "wishlist"] },
  { name: "star", icon: Star, tags: ["favorite", "rating", "review"] },
  { name: "bookmark", icon: Bookmark, tags: ["save", "later", "pin"] },
  { name: "share", icon: Share2, tags: ["send", "social"] },
  { name: "download", icon: Download, tags: ["save", "get"] },
  { name: "upload", icon: Upload, tags: ["send", "attach"] },
  { name: "link", icon: Link2, tags: ["url", "chain", "connect"] },
  { name: "plus", icon: Plus, tags: ["add", "new", "create"] },
  { name: "check", icon: Check, tags: ["done", "complete", "tick"] },
  { name: "thumbs-up", icon: ThumbsUp, tags: ["like", "approve"] },
  { name: "smile", icon: Smile, tags: ["happy", "emoji", "face"] },

  // Files & Documents
  { name: "file", icon: File, tags: ["document", "page"] },
  { name: "file-text", icon: FileText, tags: ["document", "article", "note"] },
  { name: "folder", icon: Folder, tags: ["directory", "organize"] },
  { name: "clipboard", icon: Clipboard, tags: ["paste", "copy", "notes"] },
  { name: "book", icon: BookOpen, tags: ["read", "library", "docs"] },
  { name: "qr-code", icon: QrCode, tags: ["scan", "barcode"] },

  // Time & Calendar
  { name: "calendar", icon: Calendar, tags: ["date", "schedule", "event"] },
  { name: "clock", icon: Clock, tags: ["time", "schedule", "history"] },

  // Security
  { name: "lock", icon: Lock, tags: ["secure", "private", "password"] },
  { name: "unlock", icon: Unlock, tags: ["open", "access"] },
  { name: "shield", icon: Shield, tags: ["security", "protect", "safe"] },
  { name: "key", icon: Key, tags: ["access", "password", "login"] },
  { name: "fingerprint", icon: Fingerprint, tags: ["biometric", "auth", "touch id"] },
  { name: "eye", icon: Eye, tags: ["view", "show", "visible"] },

  // Analytics & Data
  { name: "bar-chart", icon: BarChart3, tags: ["analytics", "stats", "graph"] },
  { name: "pie-chart", icon: PieChart, tags: ["data", "stats", "report"] },
  { name: "trending-up", icon: TrendingUp, tags: ["growth", "increase", "profit"] },
  { name: "activity", icon: Activity, tags: ["pulse", "health", "monitor"] },

  // Weather & Nature
  { name: "sun", icon: Sun, tags: ["light", "day", "bright"] },
  { name: "moon", icon: Moon, tags: ["night", "dark", "sleep"] },
  { name: "cloud", icon: Cloud, tags: ["weather", "storage"] },
  { name: "zap", icon: Zap, tags: ["lightning", "fast", "power", "energy"] },
  { name: "flame", icon: Flame, tags: ["fire", "hot", "trending"] },

  // Food & Lifestyle
  { name: "coffee", icon: Coffee, tags: ["cafe", "drink", "break"] },
  { name: "pizza", icon: Pizza, tags: ["food", "restaurant"] },
  { name: "apple", icon: Apple, tags: ["fruit", "health", "food"] },
  { name: "cake", icon: Cake, tags: ["birthday", "celebration"] },
  { name: "wine", icon: Wine, tags: ["drink", "bar", "cheers"] },

  // Places
  { name: "building", icon: Building, tags: ["office", "company", "business"] },
  { name: "hospital", icon: Hospital, tags: ["health", "medical", "doctor"] },
  { name: "school", icon: School, tags: ["education", "college", "learn"] },
  { name: "library", icon: Library, tags: ["books", "study", "knowledge"] },

  // Achievements
  { name: "award", icon: Award, tags: ["badge", "achievement", "winner"] },
  { name: "trophy", icon: Trophy, tags: ["win", "champion", "prize"] },
  { name: "crown", icon: Crown, tags: ["premium", "vip", "king"] },
  { name: "flag", icon: Flag, tags: ["milestone", "goal", "mark"] },
  { name: "target", icon: Target, tags: ["goal", "aim", "objective"] },

  // Devices
  { name: "smartphone", icon: Smartphone, tags: ["mobile", "phone", "device"] },
  { name: "laptop", icon: Laptop, tags: ["computer", "desktop"] },
  { name: "tv", icon: Tv, tags: ["screen", "display", "monitor"] },

  // Info & Status
  { name: "info", icon: Info, tags: ["about", "details", "help"] },
  { name: "help", icon: HelpCircle, tags: ["question", "faq", "support"] },
  { name: "alert", icon: AlertCircle, tags: ["warning", "error", "important"] },
  { name: "lightbulb", icon: Lightbulb, tags: ["idea", "tip", "suggestion"] },

  // Layout
  { name: "grid", icon: Grid, tags: ["gallery", "tiles", "view"] },
  { name: "list", icon: List, tags: ["view", "rows", "items"] },
  { name: "layers", icon: Layers, tags: ["stack", "pages", "overlap"] },
  { name: "more", icon: MoreHorizontal, tags: ["dots", "options", "ellipsis"] },

  // Misc
  { name: "refresh", icon: RefreshCw, tags: ["reload", "sync", "update"] },
  { name: "edit", icon: Edit, tags: ["modify", "change", "pencil"] },
  { name: "trash", icon: Trash2, tags: ["delete", "remove", "bin"] },
  { name: "copy", icon: Copy, tags: ["duplicate", "clone"] },
  { name: "save", icon: Save, tags: ["floppy", "store"] },
  { name: "external-link", icon: ExternalLink, tags: ["open", "new tab", "redirect"] },
  { name: "login", icon: LogIn, tags: ["sign in", "enter"] },
  { name: "logout", icon: LogOut, tags: ["sign out", "exit"] },
  { name: "palette", icon: Palette, tags: ["color", "theme", "design"] },
  { name: "power", icon: Power, tags: ["on", "off", "toggle"] },
  { name: "wifi", icon: Wifi, tags: ["internet", "connection", "signal"] },
];

// ── Component ───────────────────────────────────────

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return ICONS;
    const q = search.toLowerCase();
    return ICONS.filter((i) =>
      i.name.includes(q) || i.tags.some((t) => t.includes(q)),
    );
  }, [search]);

  const selectedIcon = ICONS.find((i) => i.name === value);
  const SelectedLucideIcon = selectedIcon?.icon;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm w-full qa-input transition-colors"
        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
      >
        {SelectedLucideIcon ? (
          <SelectedLucideIcon size={18} className="text-brand-500 shrink-0" />
        ) : (
          <div className="w-[18px] h-[18px] rounded border border-dashed shrink-0" style={{ borderColor: "var(--border-default)" }} />
        )}
        <span className="flex-1 text-left">{value || "Choose an icon..."}</span>
        <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Picker panel */}
          <div className="absolute left-0 top-full mt-2 w-full max-w-md z-50 rounded-xl shadow-xl overflow-hidden"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>

            {/* Search */}
            <div className="p-3 border-b" style={{ borderColor: "var(--border-default)" }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons... (home, cart, star, phone...)"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none qa-input"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                  autoFocus
                />
              </div>
              <p className="text-[10px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                {filtered.length} icons {search ? "found" : "available"}
              </p>
            </div>

            {/* Icon grid */}
            <div className="p-3 max-h-64 overflow-y-auto grid grid-cols-8 gap-1">
              {filtered.map((item) => {
                const IconComp = item.icon;
                const isSelected = item.name === value;
                return (
                  <button
                    key={item.name}
                    onClick={() => { onChange(item.name); setOpen(false); setSearch(""); }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isSelected ? "bg-brand-500 text-white" : "hover:bg-[var(--bg-secondary)]"}`}
                    title={item.name}
                  >
                    <IconComp size={20} className={isSelected ? "" : ""} style={!isSelected ? { color: "var(--text-primary)" } : undefined} />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-8 py-6 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                  No icons match &quot;{search}&quot;
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export for use in AddonConfigForm
export function getIconComponent(name: string): LucideIcon | null {
  return ICONS.find((i) => i.name === name)?.icon ?? null;
}
