import { useState } from "react";
import {
  X, Plus, Grid3x3, Users, Check, Pencil, Trash2,
  ChevronDown, ChevronUp, Sparkles, ArrowLeft, Flag,
  Image, Video, Camera, Play, Star,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = "reflect" | "write" | "preview" | "board" | "community";
type PromptKey = "proud" | "win" | "handled" | "kind" | "grateful" | "like" | "mattered" | "own";
type NoteColor = "yellow" | "peach" | "mint" | "lavender" | "sky";
type CommCategory = "tips" | "notjustme" | "reminders";
type MediaType = "none" | "photo" | "video";

interface MyChannel { id: string; name: string; emoji: string; }

interface Note {
  id: string;
  prompt: string;
  promptKey: PromptKey;
  text: string;
  color: NoteColor;
  icon: string;
  date: string;
  channelId?: string;
}

interface CommPost {
  id: string;
  text: string;
  color: NoteColor;
  category: CommCategory;
  media?: MediaType;
  timestamp: string;
  avatarId: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROMPTS: { key: PromptKey; label: string; emoji: string }[] = [
  { key: "proud",    label: "Something I'm proud of",        emoji: "⭐" },
  { key: "win",      label: "A small win",                   emoji: "🎉" },
  { key: "handled",  label: "Something I handled well",      emoji: "💪" },
  { key: "kind",     label: "Something kind I did",          emoji: "💛" },
  { key: "grateful", label: "Something I'm grateful for",    emoji: "🌱" },
  { key: "like",     label: "Something I like about myself", emoji: "🌸" },
  { key: "mattered", label: "Something that mattered today", emoji: "✨" },
  { key: "own",      label: "Write my own",                  emoji: "✏️" },
];

const ICONS = ["⭐", "🌱", "🌸", "✨", "🎉", "💛", "💪", "🌙"];

const NOTE_COLORS: { id: NoteColor; bg: string; border: string; shadow: string }[] = [
  { id: "yellow",   bg: "#FFF8C5", border: "#F0D857", shadow: "rgba(240,216,87,0.35)" },
  { id: "peach",    bg: "#FFE8D6", border: "#F5C4A0", shadow: "rgba(245,196,160,0.35)" },
  { id: "mint",     bg: "#D8F5E8", border: "#9EE0C0", shadow: "rgba(158,224,192,0.35)" },
  { id: "lavender", bg: "#EDE0FF", border: "#C4A8F0", shadow: "rgba(196,168,240,0.35)" },
  { id: "sky",      bg: "#D4EEFF", border: "#9DD4F5", shadow: "rgba(157,212,245,0.35)" },
];

const colorMap: Record<NoteColor, { bg: string; border: string; shadow: string }> = Object.fromEntries(
  NOTE_COLORS.map(c => [c.id, { bg: c.bg, border: c.border, shadow: c.shadow }])
) as Record<NoteColor, { bg: string; border: string; shadow: string }>;

const STARTERS = [
  "I'm proud that I…",
  "It took effort to…",
  "I handled ___ by…",
  "Something others may not notice is…",
];

const STATIC_BOARD_FILTERS = [
  { id: "all",      label: "All" },
  { id: "proud",    label: "Proud of" },
  { id: "win",      label: "Small wins" },
  { id: "grateful", label: "Gratitude" },
  { id: "like",     label: "Strengths" },
  { id: "kind",     label: "Kindness" },
];

const CHANNEL_EMOJIS = ["✨", "🌱", "💪", "🌸", "🎯", "💭", "🏆", "📝", "🧠", "🌙", "💛", "🎉"];

const MY_AVATAR_ID = 0; // user's own monster (the pink one with horns)

const COMM_FILTERS = [
  { id: "all",       label: "All" },
  { id: "tips",      label: "Things to Try" },
  { id: "notjustme", label: "Not Just Me" },
  { id: "reminders", label: "Little Reminders" },
];

const COMM_CATEGORIES: { id: CommCategory; label: string; emoji: string; desc: string; color: string }[] = [
  { id: "tips",      label: "Things to Try",   emoji: "💡", desc: "Share what's helped you",      color: "#9EE0C0" },
  { id: "notjustme", label: "Not Just Me",      emoji: "🫂", desc: "Real moments with comparison", color: "#F5C4A0" },
  { id: "reminders", label: "Little Reminders", emoji: "🌙", desc: "Something worth remembering",  color: "#C4A8F0" },
];

const CATEGORY_BADGE: Record<CommCategory, { label: string; bg: string; color: string }> = {
  tips:      { label: "Things to Try",   bg: "#D8F5E8", color: "#3D7A58" },
  notjustme: { label: "Not Just Me",     bg: "#FFE8D6", color: "#C4613A" },
  reminders: { label: "Little Reminder", bg: "#EDE0FF", color: "#7A52B8" },
};

// Monster avatar background colors (one per monster variant)
const AVATAR_BG = [
  "#F5E0EC", // 0 pink
  "#C5EAEA", // 1 teal
  "#FFE0C5", // 2 orange
  "#D0EDD8", // 3 green
  "#C8E5F5", // 4 blue
  "#FFF0C0", // 5 yellow
  "#E8D8F5", // 6 lavender
  "#FFD8D0", // 7 coral
];

const SEED_POSTS: CommPost[] = [
  { id: "t1", text: "Muting people for a little bit actually helped way more than I thought.",                                           color: "mint",     category: "tips",                  timestamp: "30m ago",   avatarId: 1 },
  { id: "n1", text: "Seeing everyone post when they're hanging out without me gets to me even when I know it probably isn't that deep.", color: "yellow",   category: "notjustme", media: "photo", timestamp: "1h ago", avatarId: 0 },
  { id: "r1", text: "Someone else doing well doesn't mean you're doing badly.",                                                          color: "sky",      category: "reminders",             timestamp: "2h ago",    avatarId: 4 },
  { id: "t2", text: "If I notice I'm comparing a lot, I get off the app and do something else for like 10 minutes.",                    color: "yellow",   category: "tips",                  timestamp: "3h ago",    avatarId: 3 },
  { id: "n2", text: "Sometimes I'll post something and then keep checking who liked it which honestly makes me feel worse.",             color: "lavender", category: "notjustme",             timestamp: "4h ago",    avatarId: 5 },
  { id: "r2", text: "You're seeing one post, not their whole life.",                                                                     color: "peach",    category: "reminders",             timestamp: "5h ago",    avatarId: 1 },
  { id: "t3", text: "Sometimes I remind myself I'm literally only seeing what they chose to post.",                                      color: "lavender", category: "tips",                  timestamp: "6h ago",    avatarId: 6 },
  { id: "n3", text: "I compare myself to people I don't even know 😭",                                                                  color: "peach",    category: "notjustme", media: "video", timestamp: "Yesterday", avatarId: 7 },
  { id: "r3", text: "You do not have to keep looking at something that makes you feel bad.",                                             color: "mint",     category: "reminders",             timestamp: "Yesterday", avatarId: 3 },
  { id: "t4", text: "Talking to one of my friends usually gets me out of my head.",                                                      color: "peach",    category: "tips",                  timestamp: "Yesterday", avatarId: 4 },
  { id: "n4", text: "College/school posts stress me out way more than I want them to.",                                                  color: "sky",      category: "notjustme",             timestamp: "Yesterday", avatarId: 2 },
  { id: "r4", text: "It's okay to log off.",                                                                                             color: "lavender", category: "reminders",             timestamp: "Yesterday", avatarId: 0 },
];

const SEED_NOTES: Note[] = [
  { id: "s1", prompt: "Something I'm proud of",        promptKey: "proud",    text: "I finished a project I had been putting off for weeks.",    color: "yellow",   icon: "⭐", date: "Today" },
  { id: "s2", prompt: "A small win",                   promptKey: "win",      text: "I went for a walk even when I really didn't feel like it.", color: "mint",     icon: "🎉", date: "Yesterday" },
  { id: "s3", prompt: "Something kind I did",          promptKey: "kind",     text: "I helped my friend study for their exam.",                  color: "peach",    icon: "💛", date: "2 days ago" },
  { id: "s4", prompt: "Something I'm grateful for",    promptKey: "grateful", text: "My dog being so excited every time I come home.",           color: "lavender", icon: "🌱", date: "3 days ago" },
  { id: "s5", prompt: "Something I like about myself", promptKey: "like",     text: "I'm a good listener and people trust me with things.",      color: "sky",      icon: "🌸", date: "Last week" },
];

// Round-robin interleave posts by category so "All" never groups by channel
function interleaveByCategory(posts: CommPost[]): CommPost[] {
  const buckets: Record<string, CommPost[]> = { tips: [], notjustme: [], reminders: [] };
  posts.forEach(p => (buckets[p.category] ??= []).push(p));
  const order: CommCategory[] = ["tips", "notjustme", "reminders"];
  const result: CommPost[] = [];
  let i = 0;
  while (result.length < posts.length) {
    const bucket = buckets[order[i % 3]];
    if (bucket && bucket.length > 0) result.push(bucket.shift()!);
    i++;
  }
  return result;
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const FRAUNCES = { fontFamily: "'Fraunces', Georgia, serif" };
const NUNITO   = { fontFamily: "'Nunito', system-ui, sans-serif" };

// ─── Monster avatars — 8 hand-drawn doodle SVG variants ──────────────────────

function MonsterAvatar({ id, size = 28 }: { id: number; size?: number }) {
  const bg = AVATAR_BG[id % AVATAR_BG.length];

  const faces = [
    // 0: Mauve/pink — two horns, big circular eyes, wide toothy grin (reference monster)
    <svg key={0} viewBox="0 0 36 36" width={size} height={size}>
      <polygon points="11,13 9,4 16,12" fill="#C4668A" stroke="#9A4A6A" strokeWidth="1.2" strokeLinejoin="round"/>
      <polygon points="25,13 27,4 20,12" fill="#C4668A" stroke="#9A4A6A" strokeWidth="1.2" strokeLinejoin="round"/>
      <ellipse cx="18" cy="22" rx="13.5" ry="12.5" fill="#C4668A" stroke="#9A4A6A" strokeWidth="1.5"/>
      <ellipse cx="12.5" cy="19.5" rx="3.5" ry="4" fill="white" stroke="#9A4A6A" strokeWidth="0.9"/>
      <circle cx="12" cy="20" r="1.9" fill="#6B3355"/>
      <circle cx="11.3" cy="19.2" r="0.8" fill="white"/>
      <ellipse cx="23.5" cy="19.5" rx="3.5" ry="4" fill="white" stroke="#9A4A6A" strokeWidth="0.9"/>
      <circle cx="24" cy="20" r="1.9" fill="#6B3355"/>
      <circle cx="23.3" cy="19.2" r="0.8" fill="white"/>
      <path d="M10.5 25 Q18 33 25.5 25" fill="#7A3555" stroke="#9A4A6A" strokeWidth="1"/>
      <rect x="13.5" y="25" width="4" height="2.8" rx="0.7" fill="white"/>
      <rect x="18.5" y="25" width="4" height="2.8" rx="0.7" fill="white"/>
    </svg>,

    // 1: Teal — antenna with ball, sparkle dot eyes, gentle smile
    <svg key={1} viewBox="0 0 36 36" width={size} height={size}>
      <line x1="18" y1="9" x2="18" y2="15" stroke="#2A8A8A" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="18" cy="7.5" r="3" fill="#2A8A8A" stroke="#1A6A6A" strokeWidth="1"/>
      <circle cx="18" cy="23" r="13" fill="#5BB8B8" stroke="#2A8A8A" strokeWidth="1.5"/>
      <circle cx="13.5" cy="21" r="3" fill="white" stroke="#2A8A8A" strokeWidth="0.8"/>
      <circle cx="13" cy="21.5" r="1.6" fill="#1A6060"/>
      <circle cx="12.3" cy="20.7" r="0.65" fill="white"/>
      <circle cx="22.5" cy="21" r="3" fill="white" stroke="#2A8A8A" strokeWidth="0.8"/>
      <circle cx="23" cy="21.5" r="1.6" fill="#1A6060"/>
      <circle cx="22.3" cy="20.7" r="0.65" fill="white"/>
      <path d="M13 26.5 Q18 30.5 23 26.5" stroke="#2A8A8A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    </svg>,

    // 2: Orange — triangular ears, wide round eyes, surprised O mouth
    <svg key={2} viewBox="0 0 36 36" width={size} height={size}>
      <polygon points="7,18 3,7 14,16" fill="#E8813A" stroke="#C4612A" strokeWidth="1.2" strokeLinejoin="round"/>
      <polygon points="29,18 33,7 22,16" fill="#E8813A" stroke="#C4612A" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="18" cy="22" r="13" fill="#E8813A" stroke="#C4612A" strokeWidth="1.5"/>
      <circle cx="13" cy="20" r="3.8" fill="white" stroke="#C4612A" strokeWidth="0.8"/>
      <circle cx="13" cy="20.5" r="2" fill="#8B3A10"/>
      <circle cx="12.2" cy="19.6" r="0.8" fill="white"/>
      <circle cx="23" cy="20" r="3.8" fill="white" stroke="#C4612A" strokeWidth="0.8"/>
      <circle cx="23" cy="20.5" r="2" fill="#8B3A10"/>
      <circle cx="22.2" cy="19.6" r="0.8" fill="white"/>
      <ellipse cx="18" cy="27" rx="3.5" ry="3.2" fill="#8B3A10" stroke="#C4612A" strokeWidth="0.8"/>
    </svg>,

    // 3: Sage green — three spiky points, squinting happy eyes, buck tooth
    <svg key={3} viewBox="0 0 36 36" width={size} height={size}>
      <polygon points="11,14 9,5 15,13" fill="#7BAE8A" stroke="#4A8A58" strokeWidth="1.2" strokeLinejoin="round"/>
      <polygon points="18,12 17,3 22,11" fill="#7BAE8A" stroke="#4A8A58" strokeWidth="1.2" strokeLinejoin="round"/>
      <polygon points="25,14 27,5 21,13" fill="#7BAE8A" stroke="#4A8A58" strokeWidth="1.2" strokeLinejoin="round"/>
      <ellipse cx="18" cy="23" rx="13" ry="12" fill="#7BAE8A" stroke="#4A8A58" strokeWidth="1.5"/>
      <path d="M10.5 20 Q13.5 17 16.5 20" stroke="#4A8A58" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
      <path d="M19.5 20 Q22.5 17 25.5 20" stroke="#4A8A58" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
      <path d="M12 25 Q18 30.5 24 25" fill="#3A6A48" stroke="#4A8A58" strokeWidth="0.8"/>
      <rect x="15.5" y="25" width="5" height="3.5" rx="1" fill="white" stroke="#4A8A58" strokeWidth="0.5"/>
    </svg>,

    // 4: Sky blue — round bear ears, rosy cheeks, shy wavy smile
    <svg key={4} viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="7.5" cy="14" r="5.5" fill="#6AABCD" stroke="#3A7EA0" strokeWidth="1.2"/>
      <circle cx="7.5" cy="14" r="2.8" fill="#4A8AAD"/>
      <circle cx="28.5" cy="14" r="5.5" fill="#6AABCD" stroke="#3A7EA0" strokeWidth="1.2"/>
      <circle cx="28.5" cy="14" r="2.8" fill="#4A8AAD"/>
      <circle cx="18" cy="23" r="13" fill="#6AABCD" stroke="#3A7EA0" strokeWidth="1.5"/>
      <circle cx="13.5" cy="21" r="2.8" fill="white" stroke="#3A7EA0" strokeWidth="0.8"/>
      <circle cx="13.5" cy="21.5" r="1.4" fill="#2A5A7A"/>
      <circle cx="12.9" cy="20.8" r="0.6" fill="white"/>
      <circle cx="22.5" cy="21" r="2.8" fill="white" stroke="#3A7EA0" strokeWidth="0.8"/>
      <circle cx="22.5" cy="21.5" r="1.4" fill="#2A5A7A"/>
      <circle cx="21.9" cy="20.8" r="0.6" fill="white"/>
      <ellipse cx="11" cy="25" rx="3" ry="2" fill="#FF9AAA" opacity="0.45"/>
      <ellipse cx="25" cy="25" rx="3" ry="2" fill="#FF9AAA" opacity="0.45"/>
      <path d="M13 27 Q18 31 23 27" stroke="#3A7EA0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,

    // 5: Yellow-gold — three round bumps on top, sleepy half-closed eyes, tiny content smile
    <svg key={5} viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="12" cy="14" r="5" fill="#D4A030" stroke="#A07820" strokeWidth="1.2"/>
      <circle cx="18" cy="11.5" r="5.5" fill="#D4A030" stroke="#A07820" strokeWidth="1.2"/>
      <circle cx="24" cy="14" r="5" fill="#D4A030" stroke="#A07820" strokeWidth="1.2"/>
      <ellipse cx="18" cy="24" rx="13" ry="11.5" fill="#D4A030" stroke="#A07820" strokeWidth="1.5"/>
      <ellipse cx="13.5" cy="22" rx="3.2" ry="2.3" fill="white" stroke="#A07820" strokeWidth="0.8"/>
      <ellipse cx="13.5" cy="23.1" rx="3.2" ry="1.4" fill="#7A5010"/>
      <ellipse cx="22.5" cy="22" rx="3.2" ry="2.3" fill="white" stroke="#A07820" strokeWidth="0.8"/>
      <ellipse cx="22.5" cy="23.1" rx="3.2" ry="1.4" fill="#7A5010"/>
      <path d="M14 27.5 Q18 31 22 27.5" stroke="#A07820" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,

    // 6: Lavender — single center horn, mismatched eyes (big + small), little smirk
    <svg key={6} viewBox="0 0 36 36" width={size} height={size}>
      <polygon points="18,7 14,16 22,16" fill="#9B7FBF" stroke="#7A5AAA" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="18" cy="23" r="13" fill="#9B7FBF" stroke="#7A5AAA" strokeWidth="1.5"/>
      <ellipse cx="13.5" cy="21" rx="4.8" ry="5.5" fill="white" stroke="#7A5AAA" strokeWidth="1"/>
      <circle cx="13.5" cy="21.5" r="3" fill="#4A2A7A"/>
      <circle cx="12.2" cy="20.2" r="1.1" fill="white"/>
      <circle cx="23.5" cy="21" r="2.2" fill="white" stroke="#7A5AAA" strokeWidth="0.8"/>
      <circle cx="23.5" cy="21.5" r="1.2" fill="#4A2A7A"/>
      <path d="M13 27.5 Q19 31 24.5 27" stroke="#7A5AAA" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,

    // 7: Coral red — floppy droopy ears, big excited eyes, huge toothy grin
    <svg key={7} viewBox="0 0 36 36" width={size} height={size}>
      <ellipse cx="6" cy="24" rx="4.5" ry="6.5" fill="#E87070" stroke="#C04040" strokeWidth="1.2" transform="rotate(-12 6 24)"/>
      <ellipse cx="30" cy="24" rx="4.5" ry="6.5" fill="#E87070" stroke="#C04040" strokeWidth="1.2" transform="rotate(12 30 24)"/>
      <circle cx="18" cy="21" r="13" fill="#E87070" stroke="#C04040" strokeWidth="1.5"/>
      <circle cx="13" cy="18.5" r="3.5" fill="white" stroke="#C04040" strokeWidth="0.8"/>
      <circle cx="13.5" cy="19" r="1.8" fill="#8B1A1A"/>
      <circle cx="12.7" cy="18.2" r="0.75" fill="white"/>
      <circle cx="23" cy="18.5" r="3.5" fill="white" stroke="#C04040" strokeWidth="0.8"/>
      <circle cx="23.5" cy="19" r="1.8" fill="#8B1A1A"/>
      <circle cx="22.7" cy="18.2" r="0.75" fill="white"/>
      <path d="M11 24.5 Q18 32 25 24.5" fill="#8B1A1A" stroke="#C04040" strokeWidth="1"/>
      <rect x="13.5" y="24.5" width="3.5" height="2.5" rx="0.5" fill="white"/>
      <rect x="18" y="24.5" width="3.5" height="2.5" rx="0.5" fill="white"/>
    </svg>,
  ];

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {faces[id % faces.length]}
    </div>
  );
}

// ─── PostIt — personal note card ─────────────────────────────────────────────

function PostIt({ note, rotation = 0, myAvatarId = MY_AVATAR_ID, onEdit, onDelete }: {
  note: Note; rotation?: number; myAvatarId?: number; onEdit?: () => void; onDelete?: () => void;
}) {
  const { bg, border, shadow } = colorMap[note.color];
  return (
    <div style={{ backgroundColor: bg, borderColor: border, boxShadow: `2px 4px 12px ${shadow}, 0 1px 3px rgba(0,0,0,0.08)`, transform: `rotate(${rotation}deg)`, fontFamily: "'Nunito', system-ui, sans-serif" }}
      className="relative border rounded-lg p-3 transition-transform hover:scale-[1.02]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <MonsterAvatar id={myAvatarId} size={22}/>
        <span className="text-[10px] font-semibold opacity-60 leading-tight flex-1">{note.prompt}</span>
        <span className="text-base leading-none shrink-0">{note.icon}</span>
      </div>
      <p className="text-xs leading-relaxed text-[#3D2B1A] font-medium">{note.text}</p>
      <p className="text-[10px] text-[#9E8E7E] mt-2">{note.date}</p>
      {(onEdit || onDelete) && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {onEdit && <button onClick={onEdit} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/70 text-[#7A6355] hover:bg-white transition-colors"><Pencil size={10}/></button>}
          {onDelete && <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/70 text-[#C4613A] hover:bg-white transition-colors"><Trash2 size={10}/></button>}
        </div>
      )}
    </div>
  );
}

// ─── SavedPostCard — saved community post shown in My Board ──────────────────

function SavedPostCard({ post, onUnsave }: { post: CommPost; onUnsave: () => void }) {
  const { bg, border, shadow } = colorMap[post.color];
  const badge = CATEGORY_BADGE[post.category];
  return (
    <div className="col-span-2 rounded-2xl p-3.5 relative"
      style={{ background: bg, border: `2px solid ${border}`, boxShadow: `2px 4px 12px ${shadow}, 0 1px 3px rgba(0,0,0,0.06)` }}>
      <div className="flex items-center gap-2 mb-2">
        <MonsterAvatar id={post.avatarId} size={24}/>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
        <span className="text-[10px] text-[#B8A898] ml-auto" style={NUNITO}>{post.timestamp}</span>
      </div>
      <p className="text-[12px] font-semibold leading-relaxed text-[#3D2B1A] pr-6" style={NUNITO}>{post.text}</p>
      <button onClick={onUnsave} className="absolute bottom-3 right-3" title="Remove from saved">
        <Star size={14} fill="#E8833A" color="#E8833A"/>
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]                 = useState<Screen>("community");
  const [selectedPrompt, setSelectedPrompt] = useState<typeof PROMPTS[0] | null>(null);
  const [ownPromptText, setOwnPromptText]   = useState("");
  const [noteText, setNoteText]             = useState("");
  const [selectedColor, setSelectedColor]   = useState<NoteColor>("yellow");
  const [selectedIcon, setSelectedIcon]     = useState("⭐");
  const [shareOption, setShareOption]       = useState<"private" | "community">("private");
  const [myNotes, setMyNotes]               = useState<Note[]>(SEED_NOTES);
  const [boardFilter, setBoardFilter]       = useState("all");
  const [showStarters, setShowStarters]     = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommPost[]>(SEED_POSTS);
  const [commFilter, setCommFilter]         = useState("all");
  const [reported, setReported]             = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds]     = useState<string[]>([]);
  const [myChannels, setMyChannels]         = useState<MyChannel[]>([]);

  const isFlow = screen === "reflect" || screen === "write" || screen === "preview";
  const stepNum = { reflect: 1, write: 2, preview: 3 }[screen as "reflect" | "write" | "preview"] ?? 0;

  const startBoardFlow = () => {
    setSelectedPrompt(null); setOwnPromptText(""); setNoteText("");
    setSelectedColor("yellow"); setSelectedIcon("⭐"); setShareOption("private");
    setShowStarters(false); setEditingId(null);
    setScreen("reflect");
  };

  const getPromptLabel = () => {
    if (!selectedPrompt) return "";
    if (selectedPrompt.key === "own") return ownPromptText.trim() || "My reflection";
    return selectedPrompt.label;
  };

  const handleAddToBoard = () => {
    if (!selectedPrompt || !noteText.trim()) return;
    const isCustomChannel = myChannels.some(c => c.id === boardFilter);
    const newNote: Note = {
      id: editingId ?? Date.now().toString(),
      prompt: getPromptLabel(),
      promptKey: selectedPrompt.key,
      text: noteText.trim(),
      color: selectedColor,
      icon: selectedIcon,
      date: "Just now",
      channelId: isCustomChannel ? boardFilter : undefined,
    };
    setMyNotes(prev => editingId ? prev.map(n => n.id === editingId ? newNote : n) : [newNote, ...prev]);
    setEditingId(null);
    setScreen("board");
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setSelectedPrompt(PROMPTS.find(p => p.key === note.promptKey) ?? PROMPTS[0]);
    setNoteText(note.text); setSelectedColor(note.color); setSelectedIcon(note.icon);
    setOwnPromptText(note.promptKey === "own" ? note.prompt : "");
    setScreen("write");
  };

  const toggleSave = (postId: string) => {
    setSavedPostIds(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const filteredBoard = myNotes.filter(n => {
    if (boardFilter === "all")      return !n.channelId; // "All" shows uncategorised notes only
    if (boardFilter === "proud")    return !n.channelId && n.promptKey === "proud";
    if (boardFilter === "win")      return !n.channelId && n.promptKey === "win";
    if (boardFilter === "grateful") return !n.channelId && n.promptKey === "grateful";
    if (boardFilter === "like")     return !n.channelId && (n.promptKey === "like" || n.promptKey === "mattered");
    if (boardFilter === "kind")     return !n.channelId && n.promptKey === "kind";
    return n.channelId === boardFilter; // custom channel
  });

  const savedPosts = communityPosts.filter(p => savedPostIds.includes(p.id));

  const nonReported = communityPosts.filter(p => !reported.includes(p.id));
  const filteredComm = commFilter === "all"
    ? interleaveByCategory(nonReported)
    : nonReported.filter(p => p.category === commFilter);

  const handleAddCommPost = (post: Omit<CommPost, "id" | "timestamp">) => {
    setCommunityPosts(prev => [{ ...post, id: Date.now().toString(), timestamp: "Just now" }, ...prev]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #F5EFE6 0%, #EDE8FF 50%, #D8F5F0 100%)" }}>
      <div className="w-[390px] flex flex-col overflow-hidden"
        style={{ height: "844px", background: "#FDFAF6", borderRadius: "44px", boxShadow: "0 32px 80px rgba(61,43,26,0.18), 0 4px 16px rgba(61,43,26,0.08)", border: "1px solid rgba(61,43,26,0.08)", ...NUNITO }}>

        {/* Status bar */}
        <div className="px-7 pt-4 pb-1 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[#3D2B1A]">9:41</span>
          <div className="w-24 h-6 bg-[#3D2B1A] rounded-full" style={{ transform: "translateX(12px)" }}/>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-px items-end h-3">
              {[3,5,7,9].map((h,i) => <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: i < 3 ? "#3D2B1A" : "#D4C4B4" }}/>)}
            </div>
            <div className="w-5 h-3 rounded-[3px] border border-[#3D2B1A] relative flex items-center pl-0.5">
              <div className="w-3 h-2 bg-[#3D2B1A] rounded-[1.5px]"/>
              <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-[5px] bg-[#3D2B1A] rounded-r-sm"/>
            </div>
          </div>
        </div>

        {/* Flow progress bar */}
        {isFlow && (
          <div className="px-5 pt-2 pb-1 shrink-0">
            <div className="flex gap-1.5">
              {[1,2,3].map(s => (
                <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-500"
                  style={{ background: s < stepNum ? "#E8833A" : s === stepNum ? "#F5C4A0" : "#E8DDD0" }}/>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-0.5">
              {["Reflect","Write","Preview"].map((l, i) => (
                <span key={l} className="text-[10px] font-semibold"
                  style={{ color: i + 1 <= stepNum ? "#E8833A" : "#B8A898" }}>{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* Screens */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {screen === "community" && (
            <CommunityScreen
              posts={filteredComm} filter={commFilter} setFilter={setCommFilter}
              savedPostIds={savedPostIds} onReport={id => setReported(p => [...p, id])}
              onToggleSave={toggleSave} onAddPost={handleAddCommPost}
            />
          )}
          {screen === "board" && (
            <MyBoardScreen
              notes={filteredBoard} savedPosts={savedPosts}
              filter={boardFilter} setFilter={setBoardFilter}
              myChannels={myChannels} onAddChannel={ch => setMyChannels(p => [...p, ch])}
              onAdd={startBoardFlow} onEdit={handleEditNote}
              onDeleteRequest={setDeleteTarget} deleteTarget={deleteTarget}
              onDeleteConfirm={id => { setMyNotes(p => p.filter(n => n.id !== id)); setDeleteTarget(null); }}
              onDeleteCancel={() => setDeleteTarget(null)}
              onUnsave={id => setSavedPostIds(p => p.filter(s => s !== id))}
            />
          )}
          {screen === "reflect" && (
            <ReflectScreen
              selected={selectedPrompt} ownText={ownPromptText} setOwnText={setOwnPromptText}
              onSelect={setSelectedPrompt} onContinue={() => setScreen("write")} onExit={() => setScreen("board")}
            />
          )}
          {screen === "write" && (
            <WriteScreen
              promptLabel={getPromptLabel()} noteText={noteText} setNoteText={setNoteText}
              color={selectedColor} setColor={setSelectedColor} icon={selectedIcon} setIcon={setSelectedIcon}
              showStarters={showStarters} setShowStarters={setShowStarters}
              onBack={() => setScreen("reflect")} onContinue={() => setScreen("preview")} onExit={() => setScreen("board")}
            />
          )}
          {screen === "preview" && (
            <PreviewScreen
              promptLabel={getPromptLabel()} noteText={noteText} color={selectedColor} icon={selectedIcon}
              shareOption={shareOption} setShareOption={setShareOption}
              onBack={() => setScreen("write")} onAdd={handleAddToBoard}
              onNotNow={() => setScreen("board")} onEdit={() => setScreen("write")}
            />
          )}
        </div>

        {/* Bottom nav */}
        {!isFlow && (
          <div className="shrink-0 px-6 pt-3 pb-7"
            style={{ borderTop: "1px solid rgba(61,43,26,0.08)", background: "rgba(253,250,246,0.96)" }}>
            <div className="flex justify-around">
              {([
                { id: "community", icon: Users,   label: "Community" },
                { id: "board",     icon: Grid3x3, label: "My Board"  },
              ] as const).map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setScreen(id)}
                  className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-colors"
                  style={{ color: screen === id ? "#E8833A" : "#9E8E7E" }}>
                  <Icon size={22} strokeWidth={screen === id ? 2.5 : 1.8}/>
                  <span className="text-[11px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Community Screen ─────────────────────────────────────────────────────────

function CommunityScreen({ posts, filter, setFilter, savedPostIds, onReport, onToggleSave, onAddPost }: {
  posts: CommPost[]; filter: string; setFilter: (v: string) => void;
  savedPostIds: string[]; onReport: (id: string) => void;
  onToggleSave: (id: string) => void;
  onAddPost: (post: Omit<CommPost, "id" | "timestamp">) => void;
}) {
  const [showSheet, setShowSheet]       = useState(false);
  const [sheetStep, setSheetStep]       = useState<1|2|3>(1);
  const [newCategory, setNewCategory]   = useState<CommCategory | null>(null);
  const [newText, setNewText]           = useState("");
  const [newMedia, setNewMedia]         = useState<MediaType>("none");
  const [submitted, setSubmitted]       = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [boardName, setBoardName]       = useState("");
  const [boardDesc, setBoardDesc]       = useState("");
  const [boardCreated, setBoardCreated] = useState(false);

  const openSheet = () => {
    setSheetStep(1); setNewCategory(null); setNewText(""); setNewMedia("none");
    setSubmitted(false); setShowSheet(true);
  };
  const closeSheet = () => { setShowSheet(false); setSubmitted(false); };

  const openNewBoard = () => { setBoardName(""); setBoardDesc(""); setBoardCreated(false); setShowNewBoard(true); };

  const handleConfirmPost = () => {
    if (!newCategory || !newText.trim()) return;
    const colors: NoteColor[] = ["yellow","peach","mint","lavender","sky"];
    const avatarIds = [0,1,2,3,4,5,6,7];
    onAddPost({
      text: newText.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      category: newCategory,
      media: newMedia !== "none" ? newMedia : undefined,
      avatarId: avatarIds[Math.floor(Math.random() * avatarIds.length)],
    });
    setSubmitted(true);
  };

  const renderPost = (post: CommPost, i: number) => {
    const hasMedia = post.media === "photo" || post.media === "video";
    const { bg, border, shadow } = colorMap[post.color];
    const badge = CATEGORY_BADGE[post.category];
    const rots = [-0.7, 0.9, -0.4, 0.6, -1.1, 0.3];
    const rot = rots[i % rots.length];
    const isSaved = savedPostIds.includes(post.id);

    const topRow = (
      <div className="flex items-center gap-2 mb-2.5">
        <MonsterAvatar id={post.avatarId} size={28}/>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
        <span className="text-[10px] text-[#B8A898] ml-auto shrink-0" style={NUNITO}>{post.timestamp}</span>
        <button onClick={() => setReportTarget(post.id)} className="text-[#C8BEB4] hover:text-[#9E8E7E] shrink-0"><Flag size={11}/></button>
      </div>
    );

    const starBtn = (
      <button onClick={() => onToggleSave(post.id)}
        className="absolute bottom-3 right-3 transition-transform hover:scale-125"
        title={isSaved ? "Remove from saved" : "Save this post"}>
        <Star size={15} color={isSaved ? "#E8833A" : "#C8BEB4"} fill={isSaved ? "#E8833A" : "none"}/>
      </button>
    );

    if (hasMedia) {
      return (
        <div key={post.id} style={{ transform: `rotate(${rot * 0.4}deg)` }}>
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: bg, border: `2px solid ${border}`, boxShadow: `2px 6px 16px ${shadow}, 0 1px 4px rgba(0,0,0,0.06)` }}>
            <div className="relative w-full flex flex-col items-center justify-center gap-2"
              style={{ height: 120, background: `linear-gradient(135deg, ${border}88, ${border}44)` }}>
              {post.media === "photo"
                ? <><div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center"><Camera size={20} style={{ color: border }}/></div><span className="text-[11px] font-bold text-white/80" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Photo</span></>
                : <><div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center"><Play size={22} style={{ color: border, fill: border }}/></div><span className="text-[11px] font-bold text-white/80" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Video</span></>
              }
            </div>
            <div className="p-3.5 pb-10">
              {topRow}
              <p className="text-[13px] font-semibold leading-relaxed text-[#3D2B1A]" style={NUNITO}>{post.text}</p>
            </div>
            {starBtn}
          </div>
        </div>
      );
    }

    return (
      <div key={post.id} style={{ transform: `rotate(${rot}deg)` }}>
        <div className="relative rounded-2xl p-3.5 pb-10"
          style={{ background: bg, border: `2px solid ${border}`, boxShadow: `2px 4px 12px ${shadow}, 0 1px 4px rgba(0,0,0,0.06)` }}>
          {topRow}
          <p className="text-[13px] font-semibold leading-relaxed text-[#3D2B1A]" style={NUNITO}>{post.text}</p>
          {starBtn}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-28 relative">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <h1 className="text-[24px] font-bold text-[#3D2B1A] leading-tight mb-1" style={FRAUNCES}>Community Board</h1>
        <p className="text-[12px] text-[#7A6355] leading-relaxed" style={NUNITO}>
          See what other people are sharing about comparison, what gets to them, what's helped, and the things they wish more people talked about.
        </p>
      </div>

      {/* Filter tabs + new board button */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {COMM_FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
            style={{ background: filter === f.id ? "#7BAE8A" : "#F0E8DC", color: filter === f.id ? "#ffffff" : "#7A6355", fontFamily: "'Nunito', sans-serif" }}>
            {f.label}
          </button>
        ))}
        <button onClick={openNewBoard}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "#F0E8DC" }} title="Create a new board">
          <Plus size={16} color="#7A6355"/>
        </button>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-16 px-5">
          <span className="text-4xl mb-3 block">🌱</span>
          <p className="text-[14px] font-semibold text-[#B8A898]" style={NUNITO}>Nothing here yet. Check back soon.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {posts.map((post, i) => renderPost(post, i))}
        </div>
      )}

      {/* FAB */}
      <button onClick={openSheet}
        className="fixed flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
        style={{ bottom: 100, right: "calc(50% - 195px + 16px)", background: "#7BAE8A", boxShadow: "0 6px 24px rgba(123,174,138,0.5)", fontFamily: "'Nunito', sans-serif" }}>
        <Plus size={18}/> Add a Post
      </button>

      {/* Report modal */}
      {reportTarget && (
        <div className="fixed inset-0 flex items-end justify-center z-50 pb-4 px-5" style={{ background: "rgba(61,43,26,0.35)" }}>
          <div className="w-full max-w-[360px] rounded-3xl p-5" style={{ background: "#FDFAF6", fontFamily: "'Nunito', sans-serif" }}>
            <p className="text-[15px] font-bold text-[#3D2B1A] mb-1" style={FRAUNCES}>Report this post?</p>
            <p className="text-[13px] text-[#7A6355] mb-4">It'll be reviewed by a moderator. Thanks for helping keep this space safe.</p>
            <div className="flex gap-2">
              <button onClick={() => setReportTarget(null)} className="flex-1 py-3 rounded-2xl font-bold text-[13px]" style={{ background: "#F0E8DC", color: "#7A6355" }}>Cancel</button>
              <button onClick={() => { onReport(reportTarget); setReportTarget(null); }} className="flex-1 py-3 rounded-2xl font-bold text-[13px] text-white" style={{ background: "#D4183D" }}>Report</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post sheet ──────────────────────────────────────────────────────── */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(61,43,26,0.4)" }}>
          <div className="w-[390px] rounded-t-3xl flex flex-col overflow-hidden" style={{ background: "#FDFAF6", maxHeight: "82vh" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "#D4C4B4" }}/>
            </div>

            {submitted ? (
              /* Submitted success */
              <div className="flex flex-col items-center px-6 py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-[18px] font-bold text-[#3D2B1A] mb-2 text-center" style={FRAUNCES}>Post submitted!</p>
                <p className="text-[13px] text-[#7A6355] text-center mb-6 leading-relaxed" style={NUNITO}>Your post will be reviewed before it shows up. Usually takes less than a day.</p>
                <button onClick={closeSheet} className="w-full py-4 rounded-2xl font-bold text-base text-white"
                  style={{ background: "#7BAE8A", boxShadow: "0 4px 16px rgba(123,174,138,0.4)", fontFamily: "'Nunito', sans-serif" }}>Done</button>
              </div>

            ) : sheetStep === 1 ? (
              /* Step 1: Choose category */
              <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="px-5 pt-2 pb-4 flex items-center justify-between shrink-0">
                  <p className="text-[17px] font-bold text-[#3D2B1A]" style={FRAUNCES}>Share something</p>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><X size={15}/></button>
                </div>
                <p className="text-[13px] text-[#7A6355] px-5 mb-4" style={NUNITO}>What kind of thing do you want to share?</p>
                <div className="px-5 pb-6 flex flex-col gap-3">
                  {COMM_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setNewCategory(cat.id); setSheetStep(2); }}
                      className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                      style={{ background: "#ffffff", border: "2px solid #E8DDD0" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cat.color + "44" }}>{cat.emoji}</div>
                      <div>
                        <p className="text-[14px] font-bold text-[#3D2B1A]" style={NUNITO}>{cat.label}</p>
                        <p className="text-[12px] text-[#9E8E7E]" style={NUNITO}>{cat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            ) : sheetStep === 2 ? (
              /* Step 2: Write + media */
              <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
                  <button onClick={() => setSheetStep(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><ArrowLeft size={15}/></button>
                  {newCategory && (
                    <span className="text-[12px] font-bold px-3 py-1 rounded-full"
                      style={{ background: CATEGORY_BADGE[newCategory].bg, color: CATEGORY_BADGE[newCategory].color }}>
                      {COMM_CATEGORIES.find(c => c.id === newCategory)?.label}
                    </span>
                  )}
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><X size={15}/></button>
                </div>
                <div className="px-5 pb-6">
                  <p className="text-[13px] font-bold text-[#3D2B1A] mb-2" style={FRAUNCES}>What do you want to say?</p>
                  <textarea value={newText} onChange={e => setNewText(e.target.value)} maxLength={300}
                    placeholder={newCategory === "tips" ? "Something that's helped you…" : newCategory === "notjustme" ? "Something you've experienced with comparison…" : "Something worth remembering…"}
                    className="w-full resize-none outline-none text-[14px] leading-relaxed text-[#3D2B1A] placeholder:text-[#B8A898] p-4 rounded-2xl mb-1"
                    style={{ minHeight: 110, background: "#F5EFE6", border: "1.5px solid #E8DDD0", fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}
                    onFocus={e => (e.target.style.borderColor = "#7BAE8A")}
                    onBlur={e => (e.target.style.borderColor = "#E8DDD0")}
                  />
                  <p className="text-[10px] text-[#B8A898] text-right mb-3" style={NUNITO}>{newText.length}/300</p>
                  <p className="text-[12px] font-bold text-[#9E8E7E] mb-2" style={NUNITO}>Add something (optional)</p>
                  <div className="flex gap-2 mb-4">
                    {(["photo","video"] as const).map(m => (
                      <button key={m} onClick={() => setNewMedia(prev => prev === m ? "none" : m)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all"
                        style={{ background: newMedia === m ? "#D8F5E8" : "#F0E8DC", border: `2px solid ${newMedia === m ? "#9EE0C0" : "#E8DDD0"}`, color: newMedia === m ? "#3D7A58" : "#7A6355", fontFamily: "'Nunito', sans-serif" }}>
                        {m === "photo" ? <><Image size={16}/>Photo</> : <><Video size={16}/>Video</>}
                      </button>
                    ))}
                  </div>
                  {newMedia !== "none" && (
                    <div className="relative rounded-2xl mb-4 flex items-center justify-center"
                      style={{ height: 90, background: "#EDE0FF", border: "2px dashed #C4A8F0" }}>
                      <div className="flex flex-col items-center gap-1.5 text-[#9E8E7E]">
                        {newMedia === "photo"
                          ? <><Camera size={22}/><span className="text-[11px] font-semibold" style={NUNITO}>Tap to add a photo</span></>
                          : <><Video size={22}/><span className="text-[11px] font-semibold" style={NUNITO}>Tap to add a video</span></>
                        }
                      </div>
                    </div>
                  )}
                  <button onClick={() => { if (newText.trim()) setSheetStep(3); }}
                    disabled={!newText.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
                    style={{ background: newText.trim() ? "#7BAE8A" : "#D4C4B4", boxShadow: newText.trim() ? "0 4px 16px rgba(123,174,138,0.4)" : "none", cursor: newText.trim() ? "pointer" : "not-allowed", fontFamily: "'Nunito', sans-serif" }}>
                    Next →
                  </button>
                </div>
              </div>

            ) : (
              /* Step 3: Safeguard confirmation */
              <div className="flex flex-col px-5 py-4">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setSheetStep(2)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><ArrowLeft size={15}/></button>
                  <span className="text-[13px] font-bold text-[#9E8E7E]" style={NUNITO}>Before you post</span>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><X size={15}/></button>
                </div>
                <div className="text-4xl text-center mb-4">👀</div>
                <p className="text-[17px] font-bold text-[#3D2B1A] text-center mb-3 leading-snug" style={FRAUNCES}>Other people in the app can see this</p>
                <div className="rounded-2xl px-4 py-4 mb-4" style={{ background: "#FFF8F0", border: "1.5px solid #F5D8B8" }}>
                  <p className="text-[13px] text-[#7A6355] leading-relaxed text-center" style={NUNITO}>
                    Make sure you're comfortable sharing it, and keep it helpful and respectful. You're adding to a space where people come when things feel hard — what you say matters. 💛
                  </p>
                </div>
                {newCategory && (
                  <div className="rounded-xl px-4 py-3 mb-5" style={{ background: colorMap["mint"].bg, border: `1.5px solid ${colorMap["mint"].border}` }}>
                    <p className="text-[11px] font-bold text-[#4A8A58] mb-1" style={NUNITO}>{CATEGORY_BADGE[newCategory].label}</p>
                    <p className="text-[12px] font-semibold text-[#3D2B1A] leading-relaxed" style={NUNITO}>"{newText}"</p>
                  </div>
                )}
                <button onClick={handleConfirmPost}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white mb-2.5"
                  style={{ background: "#7BAE8A", boxShadow: "0 4px 16px rgba(123,174,138,0.4)", fontFamily: "'Nunito', sans-serif" }}>
                  Looks good — post it
                </button>
                <button onClick={() => setSheetStep(2)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm"
                  style={{ background: "#F0E8DC", color: "#7A6355", fontFamily: "'Nunito', sans-serif" }}>
                  Go back and edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── New Board sheet ─────────────────────────────────────────────────── */}
      {showNewBoard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(61,43,26,0.4)" }}>
          <div className="w-[390px] rounded-t-3xl flex flex-col overflow-hidden" style={{ background: "#FDFAF6", maxHeight: "82vh" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "#D4C4B4" }}/>
            </div>
            {boardCreated ? (
              <div className="flex flex-col items-center px-6 py-8">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-[18px] font-bold text-[#3D2B1A] mb-2 text-center" style={FRAUNCES}>Board created!</p>
                <p className="text-[13px] text-[#7A6355] text-center mb-6 leading-relaxed" style={NUNITO}>We'll take a look before others can find it. Shouldn't take long.</p>
                <button onClick={() => setShowNewBoard(false)} className="w-full py-4 rounded-2xl font-bold text-base text-white"
                  style={{ background: "#E8833A", boxShadow: "0 4px 16px rgba(232,131,58,0.35)", fontFamily: "'Nunito', sans-serif" }}>Done</button>
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
                  <p className="text-[17px] font-bold text-[#3D2B1A]" style={FRAUNCES}>Create a board</p>
                  <button onClick={() => setShowNewBoard(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><X size={15}/></button>
                </div>
                <div className="px-5 pb-6">
                  <p className="text-[13px] text-[#7A6355] mb-4 leading-relaxed" style={NUNITO}>Start a space where people can share around a topic that matters to them.</p>
                  <p className="text-[13px] font-bold text-[#3D2B1A] mb-1.5" style={FRAUNCES}>What do you want to call it?</p>
                  <input type="text" value={boardName} onChange={e => setBoardName(e.target.value)}
                    placeholder="Give your board a name…"
                    className="w-full px-4 py-3 rounded-xl text-[14px] text-[#3D2B1A] placeholder:text-[#B8A898] outline-none mb-4"
                    style={{ background: "#F5EFE6", border: "1.5px solid #E8DDD0", fontFamily: "'Nunito', sans-serif" }}
                    onFocus={e => (e.target.style.borderColor = "#E8833A")}
                    onBlur={e => (e.target.style.borderColor = "#E8DDD0")}
                  />
                  <p className="text-[13px] font-bold text-[#3D2B1A] mb-1.5" style={FRAUNCES}>Write a short description</p>
                  <textarea value={boardDesc} onChange={e => setBoardDesc(e.target.value)} maxLength={200}
                    placeholder="What's this board about? What can people share here?"
                    className="w-full resize-none outline-none text-[14px] leading-relaxed text-[#3D2B1A] placeholder:text-[#B8A898] p-4 rounded-2xl mb-1"
                    style={{ minHeight: 90, background: "#F5EFE6", border: "1.5px solid #E8DDD0", fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}
                    onFocus={e => (e.target.style.borderColor = "#E8833A")}
                    onBlur={e => (e.target.style.borderColor = "#E8DDD0")}
                  />
                  <p className="text-[10px] text-[#B8A898] text-right mb-4" style={NUNITO}>{boardDesc.length}/200</p>
                  <div className="flex flex-col gap-2 mb-5">
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#D8F5E8", border: "1.5px solid #9EE0C0" }}>
                      <span className="text-base mt-px">🌱</span>
                      <p className="text-[12px] font-semibold text-[#3D7A58] leading-relaxed" style={NUNITO}>Boards should be related to well-being or social comparison — things people genuinely find helpful to talk about.</p>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#FFF8F0", border: "1.5px solid #F5D8B8" }}>
                      <span className="text-base mt-px">💛</span>
                      <p className="text-[12px] font-semibold text-[#C4613A] leading-relaxed" style={NUNITO}>Keep it positive, helpful, and respectful. This is a space for people who are already going through something hard.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (boardName.trim() && boardDesc.trim()) setBoardCreated(true); }}
                    disabled={!boardName.trim() || !boardDesc.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
                    style={{
                      background: boardName.trim() && boardDesc.trim() ? "#E8833A" : "#D4C4B4",
                      boxShadow: boardName.trim() && boardDesc.trim() ? "0 4px 16px rgba(232,131,58,0.35)" : "none",
                      cursor: boardName.trim() && boardDesc.trim() ? "pointer" : "not-allowed",
                      fontFamily: "'Nunito', sans-serif",
                    }}>
                    Create board
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── My Board Screen ──────────────────────────────────────────────────────────

function MyBoardScreen({ notes, savedPosts, filter, setFilter, myChannels, onAddChannel, onAdd, onEdit, onDeleteRequest, deleteTarget, onDeleteConfirm, onDeleteCancel, onUnsave }: {
  notes: Note[]; savedPosts: CommPost[]; filter: string; setFilter: (v: string) => void;
  myChannels: MyChannel[]; onAddChannel: (ch: MyChannel) => void;
  onAdd: () => void; onEdit: (n: Note) => void;
  onDeleteRequest: (id: string) => void; deleteTarget: string | null;
  onDeleteConfirm: (id: string) => void; onDeleteCancel: () => void;
  onUnsave: (id: string) => void;
}) {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName]             = useState("");
  const [channelEmoji, setChannelEmoji]           = useState(CHANNEL_EMOJIS[0]);
  const [channelCreated, setChannelCreated]       = useState(false);

  const openCreate = () => { setChannelName(""); setChannelEmoji(CHANNEL_EMOJIS[0]); setChannelCreated(false); setShowCreateChannel(true); };
  const closeCreate = () => setShowCreateChannel(false);

  const handleCreate = () => {
    if (!channelName.trim()) return;
    const newCh: MyChannel = { id: Date.now().toString(), name: channelName.trim(), emoji: channelEmoji };
    onAddChannel(newCh);
    setChannelCreated(true);
  };

  const allFilters = [
    ...STATIC_BOARD_FILTERS,
    ...myChannels.map(c => ({ id: c.id, label: `${c.emoji} ${c.name}` })),
    { id: "saved", label: "⭐ Saved" },
  ];

  const isSavedTab = filter === "saved";
  const isCustomChannel = myChannels.some(c => c.id === filter);
  const activeChannel = myChannels.find(c => c.id === filter);

  return (
    <div className="pb-24">
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[24px] font-bold text-[#3D2B1A] leading-tight mb-1" style={FRAUNCES}>My Board</h1>
        <p className="text-[12px] text-[#9E8E7E] leading-relaxed" style={NUNITO}>Your stuff, all in one place. Wins, reflections, saved thoughts, and things you've shared will show up here.</p>
      </div>

      {/* Filter tabs + + button */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto items-center" style={{ scrollbarWidth: "none" }}>
        {allFilters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
            style={{ background: filter === f.id ? "#E8833A" : "#F0E8DC", color: filter === f.id ? "#ffffff" : "#7A6355", fontFamily: "'Nunito', sans-serif" }}>
            {f.label}
          </button>
        ))}
        <button onClick={openCreate}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "#F0E8DC" }} title="Create a new board">
          <Plus size={16} color="#7A6355"/>
        </button>
      </div>

      <div className="px-4">
        {isSavedTab ? (
          savedPosts.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">⭐</span>
              <p className="text-[14px] font-semibold text-[#B8A898]" style={NUNITO}>Tap the star on any community post to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedPosts.map(post => (
                <SavedPostCard key={post.id} post={post} onUnsave={() => onUnsave(post.id)}/>
              ))}
            </div>
          )
        ) : notes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <span className="text-4xl mb-3 block">{isCustomChannel ? activeChannel?.emoji : "✨"}</span>
            <p className="text-[14px] font-semibold text-[#B8A898]" style={NUNITO}>
              {isCustomChannel
                ? `Nothing in ${activeChannel?.name} yet. Add a note and it'll show up here.`
                : "Nothing here yet — add your first note!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {notes.map((note, i) => (
              <PostIt key={note.id} note={note} rotation={[-1.2, 0.8, -0.5, 1.5, -0.9, 0.6][i % 6]}
                myAvatarId={MY_AVATAR_ID}
                onEdit={() => onEdit(note)} onDelete={() => onDeleteRequest(note.id)}/>
            ))}
          </div>
        )}
      </div>

      {!isSavedTab && (
        <button onClick={onAdd}
          className="fixed flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
          style={{ bottom: 100, right: "calc(50% - 195px + 16px)", background: "#E8833A", boxShadow: "0 6px 24px rgba(232,131,58,0.45)", fontFamily: "'Nunito', sans-serif" }}>
          <Plus size={18}/> Add a note
        </button>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-end justify-center z-50 pb-4 px-5" style={{ background: "rgba(61,43,26,0.35)" }}>
          <div className="w-full max-w-[360px] rounded-3xl p-5" style={{ background: "#FDFAF6", fontFamily: "'Nunito', sans-serif" }}>
            <p className="text-[15px] font-bold text-[#3D2B1A] mb-1" style={FRAUNCES}>Remove this note?</p>
            <p className="text-[13px] text-[#7A6355] mb-4">This can't be undone.</p>
            <div className="flex gap-2">
              <button onClick={onDeleteCancel} className="flex-1 py-3 rounded-2xl font-bold text-[13px]" style={{ background: "#F0E8DC", color: "#7A6355" }}>Keep it</button>
              <button onClick={() => onDeleteConfirm(deleteTarget)} className="flex-1 py-3 rounded-2xl font-bold text-[13px] text-white" style={{ background: "#D4183D" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create channel sheet ─────────────────────────────────────────────── */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(61,43,26,0.4)" }}>
          <div className="w-[390px] rounded-t-3xl flex flex-col overflow-hidden" style={{ background: "#FDFAF6", maxHeight: "75vh" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "#D4C4B4" }}/>
            </div>

            {channelCreated ? (
              <div className="flex flex-col items-center px-6 py-8">
                <div className="text-5xl mb-3">{channelEmoji}</div>
                <p className="text-[18px] font-bold text-[#3D2B1A] mb-2 text-center" style={FRAUNCES}>Board created!</p>
                <p className="text-[13px] text-[#7A6355] text-center mb-6 leading-relaxed" style={NUNITO}>
                  <span className="font-bold">{channelEmoji} {channelName}</span> is ready. Tap it in the tabs, then add notes to fill it up.
                </p>
                <button onClick={closeCreate} className="w-full py-4 rounded-2xl font-bold text-base text-white"
                  style={{ background: "#E8833A", boxShadow: "0 4px 16px rgba(232,131,58,0.35)", fontFamily: "'Nunito', sans-serif" }}>
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
                  <p className="text-[17px] font-bold text-[#3D2B1A]" style={FRAUNCES}>Create a board</p>
                  <button onClick={closeCreate} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E]"><X size={15}/></button>
                </div>
                <div className="px-5 pb-6">
                  <p className="text-[13px] text-[#7A6355] mb-5 leading-relaxed" style={NUNITO}>Create a personal board to organise your notes however makes sense to you.</p>

                  {/* Emoji picker */}
                  <p className="text-[13px] font-bold text-[#3D2B1A] mb-2" style={FRAUNCES}>Pick an icon</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {CHANNEL_EMOJIS.map(e => (
                      <button key={e} onClick={() => setChannelEmoji(e)}
                        className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                        style={{ background: channelEmoji === e ? "#FFF0E3" : "#F0E8DC", border: `2px solid ${channelEmoji === e ? "#E8833A" : "transparent"}`, transform: channelEmoji === e ? "scale(1.15)" : "scale(1)" }}>
                        {e}
                      </button>
                    ))}
                  </div>

                  {/* Name input */}
                  <p className="text-[13px] font-bold text-[#3D2B1A] mb-1.5" style={FRAUNCES}>Name your board</p>
                  <div className="flex items-center gap-2 mb-6 px-3 py-2.5 rounded-xl"
                    style={{ background: "#F5EFE6", border: "1.5px solid #E8DDD0" }}>
                    <span className="text-xl shrink-0">{channelEmoji}</span>
                    <input type="text" value={channelName} onChange={e => setChannelName(e.target.value)}
                      placeholder="e.g. Things I'm proud of, Good days…"
                      maxLength={40}
                      className="flex-1 bg-transparent text-[14px] text-[#3D2B1A] placeholder:text-[#B8A898] outline-none"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    />
                  </div>

                  <button onClick={handleCreate} disabled={!channelName.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
                    style={{
                      background: channelName.trim() ? "#E8833A" : "#D4C4B4",
                      boxShadow: channelName.trim() ? "0 4px 16px rgba(232,131,58,0.35)" : "none",
                      cursor: channelName.trim() ? "pointer" : "not-allowed",
                      fontFamily: "'Nunito', sans-serif",
                    }}>
                    Create board
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reflect Screen ───────────────────────────────────────────────────────────

function ReflectScreen({ selected, ownText, setOwnText, onSelect, onContinue, onExit }: {
  selected: typeof PROMPTS[0] | null; ownText: string; setOwnText: (v: string) => void;
  onSelect: (p: typeof PROMPTS[0]) => void; onContinue: () => void; onExit: () => void;
}) {
  const canContinue = selected && (selected.key !== "own" || ownText.trim());
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between pt-2 pb-4">
        <h1 className="text-[17px] font-bold text-[#3D2B1A]" style={FRAUNCES}>My Accomplishments</h1>
        <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E] hover:bg-[#E8DDD0] transition-colors"><X size={15}/></button>
      </div>
      <div className="rounded-2xl p-4 mb-4" style={{ background: "#FFF8F0", border: "1px solid #F5D8B8" }}>
        <p className="text-[13px] text-[#6B4E35] leading-relaxed" style={NUNITO}>
          "You said that seeing your friends hanging out without you made you feel <span className="font-bold text-[#C4613A]">left out.</span>"
        </p>
      </div>
      <p className="text-[13px] text-[#7A6355] leading-relaxed mb-5" style={NUNITO}>Comparisons can make one part of life feel like the only thing that matters. This activity can help you notice other things about yourself and your life that matter too.</p>
      <p className="text-base font-bold text-[#3D2B1A] mb-3" style={FRAUNCES}>What would you like to reflect on?</p>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {PROMPTS.map(p => {
          const active = selected?.key === p.key;
          return (
            <button key={p.key} onClick={() => onSelect(p)} className="relative p-3.5 rounded-2xl text-left transition-all duration-150"
              style={{ background: active ? "#FFF0E3" : "#ffffff", border: `2px solid ${active ? "#E8833A" : "#E8DDD0"}`, boxShadow: active ? "0 2px 8px rgba(232,131,58,0.18)" : "none" }}>
              <span className="text-xl mb-1.5 block">{p.emoji}</span>
              <span className="text-[12px] font-bold text-[#3D2B1A] leading-snug block">{p.label}</span>
              {active && <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#E8833A" }}><Check size={10} className="text-white"/></div>}
            </button>
          );
        })}
      </div>
      {selected?.key === "own" && (
        <div className="mb-4">
          <input type="text" value={ownText} onChange={e => setOwnText(e.target.value)}
            placeholder="What would you like to reflect on?"
            className="w-full px-4 py-3 rounded-xl text-sm text-[#3D2B1A] placeholder:text-[#B8A898] outline-none"
            style={{ background: "#F5EFE6", border: "1.5px solid #E8DDD0", fontFamily: "'Nunito', sans-serif" }}
            onFocus={e => (e.target.style.borderColor = "#E8833A")} onBlur={e => (e.target.style.borderColor = "#E8DDD0")}
          />
        </div>
      )}
      <button onClick={onContinue} disabled={!canContinue} className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
        style={{ background: canContinue ? "#E8833A" : "#D4C4B4", boxShadow: canContinue ? "0 4px 16px rgba(232,131,58,0.35)" : "none", cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "'Nunito', sans-serif" }}>
        Continue →
      </button>
    </div>
  );
}

// ─── Write Screen ─────────────────────────────────────────────────────────────

function WriteScreen({ promptLabel, noteText, setNoteText, color, setColor, icon, setIcon, showStarters, setShowStarters, onBack, onContinue, onExit }: {
  promptLabel: string; noteText: string; setNoteText: (v: string) => void;
  color: NoteColor; setColor: (c: NoteColor) => void; icon: string; setIcon: (i: string) => void;
  showStarters: boolean; setShowStarters: (v: boolean) => void;
  onBack: () => void; onContinue: () => void; onExit: () => void;
}) {
  const { bg, border } = colorMap[color];
  const canContinue = noteText.trim().length > 0;
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between pt-2 pb-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E] hover:bg-[#E8DDD0] transition-colors"><ArrowLeft size={15}/></button>
        <span className="text-[13px] font-bold text-[#9E8E7E]" style={NUNITO}>Write</span>
        <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E] hover:bg-[#E8DDD0] transition-colors"><X size={15}/></button>
      </div>
      <div className="rounded-2xl px-4 py-3 mb-5" style={{ background: "#FFF0E3", border: "1.5px solid #F5C4A0" }}>
        <p className="text-[12px] font-semibold text-[#B87340] mb-0.5" style={NUNITO}>Your prompt</p>
        <p className="text-[14px] font-bold text-[#3D2B1A]" style={FRAUNCES}>"{promptLabel}"</p>
      </div>
      <p className="text-[13px] font-bold text-[#3D2B1A] mb-2" style={FRAUNCES}>What would you like to add?</p>
      <div className="relative rounded-2xl p-4 mb-4 transition-all"
        style={{ background: bg, border: `2px solid ${border}`, boxShadow: `0 4px 16px rgba(0,0,0,0.06), 2px 4px 12px ${colorMap[color].shadow}`, minHeight: 160 }}>
        <span className="absolute top-3 right-3 text-2xl select-none">{icon}</span>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="It can be something big or small…" maxLength={280}
          className="w-full resize-none outline-none bg-transparent text-[14px] leading-relaxed text-[#3D2B1A] placeholder:text-[#B8A898] pr-8"
          style={{ minHeight: 120, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}/>
        <p className="text-[10px] text-[#B8A898] text-right mt-1" style={NUNITO}>{noteText.length}/280</p>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-2">
          {NOTE_COLORS.map(c => (
            <button key={c.id} onClick={() => setColor(c.id)} className="w-7 h-7 rounded-full transition-transform"
              style={{ background: c.bg, border: `2px solid ${color === c.id ? "#E8833A" : c.border}`, transform: color === c.id ? "scale(1.2)" : "scale(1)" }} aria-label={c.id}/>
          ))}
        </div>
        <div className="flex gap-1.5 ml-2">
          {ICONS.map(i => (
            <button key={i} onClick={() => setIcon(i)} className="text-base rounded-lg w-8 h-8 flex items-center justify-center transition-all"
              style={{ background: icon === i ? "#FFF0E3" : "transparent", border: `1.5px solid ${icon === i ? "#E8833A" : "transparent"}` }}>{i}</button>
          ))}
        </div>
      </div>
      <button onClick={() => setShowStarters(!showStarters)}
        className="flex items-center gap-1.5 text-[13px] font-bold text-[#E8833A] mb-3 transition-opacity hover:opacity-80" style={NUNITO}>
        <Sparkles size={14}/> Need help? {showStarters ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
      </button>
      {showStarters && (
        <div className="rounded-2xl p-3 mb-4 grid grid-cols-1 gap-2" style={{ background: "#FFF8F0", border: "1px solid #F5D8B8" }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => { setNoteText(t => t ? t + " " + s : s); setShowStarters(false); }}
              className="text-left text-[12px] font-semibold text-[#C4613A] px-3 py-2 rounded-xl bg-white/60 hover:bg-white transition-colors" style={NUNITO}>{s}</button>
          ))}
        </div>
      )}
      <button onClick={onContinue} disabled={!canContinue} className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
        style={{ background: canContinue ? "#E8833A" : "#D4C4B4", boxShadow: canContinue ? "0 4px 16px rgba(232,131,58,0.35)" : "none", cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "'Nunito', sans-serif" }}>
        Preview →
      </button>
    </div>
  );
}

// ─── Preview Screen ───────────────────────────────────────────────────────────

function PreviewScreen({ promptLabel, noteText, color, icon, shareOption, setShareOption, onBack, onAdd, onNotNow, onEdit }: {
  promptLabel: string; noteText: string; color: NoteColor; icon: string;
  shareOption: "private" | "community"; setShareOption: (v: "private" | "community") => void;
  onBack: () => void; onAdd: () => void; onNotNow: () => void; onEdit: () => void;
}) {
  const { bg, border, shadow } = colorMap[color];
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between pt-2 pb-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0E8DC] text-[#9E8E7E] hover:bg-[#E8DDD0] transition-colors"><ArrowLeft size={15}/></button>
        <span className="text-[13px] font-bold text-[#9E8E7E]" style={NUNITO}>Preview</span>
        <div className="w-8"/>
      </div>
      <div className="rounded-3xl p-6 mb-5 mx-2"
        style={{ background: bg, border: `2px solid ${border}`, boxShadow: `0 8px 32px ${shadow}, 0 2px 8px rgba(0,0,0,0.06)`, minHeight: 180 }}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-bold text-[#9E8E7E] uppercase tracking-wide">{promptLabel}</span>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className="text-[15px] font-bold leading-relaxed text-[#3D2B1A]" style={FRAUNCES}>{noteText}</p>
        <p className="text-[11px] text-[#B8A898] mt-4" style={NUNITO}>Just now</p>
      </div>
      <p className="text-base font-bold text-[#3D2B1A] mb-3" style={FRAUNCES}>Where would you like to add this?</p>
      {(["private","community"] as const).map(opt => (
        <button key={opt} onClick={() => setShareOption(opt)}
          className="w-full flex items-start gap-3 p-4 rounded-2xl mb-2.5 text-left transition-all"
          style={{ background: shareOption === opt ? "#FFF0E3" : "#F5EFE6", border: `2px solid ${shareOption === opt ? "#E8833A" : "#E8DDD0"}` }}>
          <div className="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
            style={{ borderColor: shareOption === opt ? "#E8833A" : "#B8A898" }}>
            {shareOption === opt && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#E8833A" }}/>}
          </div>
          <p className="text-[13px] font-bold text-[#3D2B1A]" style={NUNITO}>
            {opt === "private" ? "My private board" : "My private board and the anonymous community wall"}
          </p>
        </button>
      ))}
      <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "#F0E8DC" }}>
        <p className="text-[12px] text-[#7A6355] leading-relaxed" style={NUNITO}>
          Your name and profile will never appear on the community wall.
          {shareOption === "community" && <span className="block mt-1 font-semibold text-[#C4613A]">Your note will be reviewed before other people can see it.</span>}
        </p>
      </div>
      <button onClick={onAdd} className="w-full py-4 rounded-2xl font-bold text-base text-white mb-2.5"
        style={{ background: "#E8833A", boxShadow: "0 4px 16px rgba(232,131,58,0.35)", fontFamily: "'Nunito', sans-serif" }}>Add to board</button>
      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 py-3.5 rounded-2xl font-bold text-sm" style={{ background: "#F0E8DC", color: "#7A6355", fontFamily: "'Nunito', sans-serif" }}>Edit</button>
        <button onClick={onNotNow} className="flex-1 py-3.5 rounded-2xl font-bold text-sm" style={{ background: "#F0E8DC", color: "#7A6355", fontFamily: "'Nunito', sans-serif" }}>Not now</button>
      </div>
    </div>
  );
}
