"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Constants ────────────────────────────────────────────────────────────────
const COMMISSIONER = "Egan";
const PARTICIPANT_NAMES = ["Egan", "Sam P", "Sam J", "Briley", "Hunter"];

function randomizeOrder(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSnakeOrder(participants: string[]) {
  const picks: { participant: string; round: number; pickNum: number }[] = [];
  for (let r = 0; r < 5; r++) {
    const order = r % 2 === 0 ? [...participants] : [...participants].reverse();
    order.forEach((p, i) =>
      picks.push({ participant: p, round: r, pickNum: r * participants.length + i + 1 })
    );
  }
  return picks;
}

// ─── Player Pool ──────────────────────────────────────────────────────────────
const PLAYER_POOL = [
  // ── Elite tier ──────────────────────────────────────────────────────────────
  { id: 1,  espnName: "Scottie Scheffler",         name: "Scottie Scheffler",         country: "USA", birthYear: 1996, lefty: false, categories: ["anyone","american"] },
  { id: 2,  espnName: "Rory McIlroy",              name: "Rory McIlroy",              country: "NIR", birthYear: 1989, lefty: false, categories: ["anyone","foreigner"] },
  { id: 3,  espnName: "Xander Schauffele",         name: "Xander Schauffele",         country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 4,  espnName: "Collin Morikawa",           name: "Collin Morikawa",           country: "USA", birthYear: 1997, lefty: false, categories: ["anyone","american"] },
  { id: 5,  espnName: "Viktor Hovland",            name: "Viktor Hovland",            country: "NOR", birthYear: 1997, lefty: false, categories: ["anyone","foreigner"] },
  { id: 6,  espnName: "Bryson DeChambeau",         name: "Bryson DeChambeau",         country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 7,  espnName: "Brooks Koepka",             name: "Brooks Koepka",             country: "USA", birthYear: 1990, lefty: false, categories: ["anyone","american"] },
  { id: 8,  espnName: "Jon Rahm",                  name: "Jon Rahm",                  country: "ESP", birthYear: 1994, lefty: false, categories: ["anyone","foreigner"] },
  { id: 9,  espnName: "Patrick Cantlay",           name: "Patrick Cantlay",           country: "USA", birthYear: 1992, lefty: false, categories: ["anyone","american"] },
  { id: 10, espnName: "Tommy Fleetwood",           name: "Tommy Fleetwood",           country: "ENG", birthYear: 1991, lefty: false, categories: ["anyone","foreigner"] },
  // ── Contenders ──────────────────────────────────────────────────────────────
  { id: 11, espnName: "Shane Lowry",               name: "Shane Lowry",               country: "IRL", birthYear: 1987, lefty: false, categories: ["anyone","foreigner"] },
  { id: 12, espnName: "Tyrrell Hatton",            name: "Tyrrell Hatton",            country: "ENG", birthYear: 1991, lefty: false, categories: ["anyone","foreigner"] },
  { id: 13, espnName: "Russell Henley",            name: "Russell Henley",            country: "USA", birthYear: 1989, lefty: false, categories: ["anyone","american"] },
  { id: 14, espnName: "Hideki Matsuyama",          name: "Hideki Matsuyama",          country: "JPN", birthYear: 1992, lefty: false, categories: ["anyone","foreigner"] },
  { id: 15, espnName: "Sungjae Im",                name: "Sungjae Im",                country: "KOR", birthYear: 1998, lefty: false, categories: ["anyone","foreigner"] },
  { id: 16, espnName: "Min Woo Lee",               name: "Min Woo Lee",               country: "AUS", birthYear: 1998, lefty: false, categories: ["anyone","foreigner"] },
  { id: 17, espnName: "Jordan Spieth",             name: "Jordan Spieth",             country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 18, espnName: "Justin Thomas",             name: "Justin Thomas",             country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 19, espnName: "Ludvig Aberg",              name: "Ludvig Åberg",              country: "SWE", birthYear: 2000, lefty: false, categories: ["anyone","foreigner"] },
  { id: 20, espnName: "Sepp Straka",               name: "Sepp Straka",               country: "AUT", birthYear: 1993, lefty: false, categories: ["anyone","foreigner"] },
  { id: 21, espnName: "Dustin Johnson",            name: "Dustin Johnson",            country: "USA", birthYear: 1984, lefty: false, categories: ["anyone","american"] },
  { id: 22, espnName: "Cameron Smith",             name: "Cameron Smith",             country: "AUS", birthYear: 1993, lefty: false, categories: ["anyone","foreigner"] },
  { id: 23, espnName: "Nick Taylor",               name: "Nick Taylor",               country: "CAN", birthYear: 1988, lefty: false, categories: ["anyone","foreigner"] },
  { id: 24, espnName: "Corey Conners",             name: "Corey Conners",             country: "CAN", birthYear: 1991, lefty: false, categories: ["anyone","foreigner"] },
  { id: 25, espnName: "Adam Scott",                name: "Adam Scott",                country: "AUS", birthYear: 1980, lefty: false, categories: ["anyone","foreigner"] },
  { id: 26, espnName: "Jason Day",                 name: "Jason Day",                 country: "AUS", birthYear: 1988, lefty: false, categories: ["anyone","foreigner"] },
  { id: 27, espnName: "Keegan Bradley",            name: "Keegan Bradley",            country: "USA", birthYear: 1986, lefty: false, categories: ["anyone","american"] },
  { id: 28, espnName: "Harris English",            name: "Harris English",            country: "USA", birthYear: 1989, lefty: false, categories: ["anyone","american"] },
  { id: 29, espnName: "Matt Fitzpatrick",          name: "Matt Fitzpatrick",          country: "ENG", birthYear: 1994, lefty: false, categories: ["anyone","foreigner"] },
  { id: 30, espnName: "Nicolai Hojgaard",          name: "Nicolai Højgaard",          country: "DEN", birthYear: 2001, lefty: false, categories: ["anyone","foreigner"] },
  { id: 31, espnName: "Rasmus Hojgaard",           name: "Rasmus Højgaard",           country: "DEN", birthYear: 2001, lefty: false, categories: ["anyone","foreigner"] },
  { id: 32, espnName: "Danny Willett",             name: "Danny Willett",             country: "ENG", birthYear: 1987, lefty: false, categories: ["anyone","foreigner"] },
  { id: 33, espnName: "Sergio Garcia",             name: "Sergio Garcia",             country: "ESP", birthYear: 1980, lefty: false, categories: ["anyone","foreigner"] },
  { id: 34, espnName: "Wyndham Clark",             name: "Wyndham Clark",             country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 35, espnName: "Patrick Reed",              name: "Patrick Reed",              country: "USA", birthYear: 1990, lefty: false, categories: ["anyone","american"] },
  { id: 36, espnName: "Davis Riley",               name: "Davis Riley",               country: "USA", birthYear: 1997, lefty: false, categories: ["anyone","american"] },
  { id: 37, espnName: "Max Homa",                  name: "Max Homa",                  country: "USA", birthYear: 1990, lefty: false, categories: ["anyone","american"] },
  { id: 38, espnName: "Cameron Young",             name: "Cameron Young",             country: "USA", birthYear: 1997, lefty: false, categories: ["anyone","american"] },
  { id: 39, espnName: "Sam Burns",                 name: "Sam Burns",                 country: "USA", birthYear: 1996, lefty: false, categories: ["anyone","american"] },
  { id: 40, espnName: "J.J. Spaun",               name: "J.J. Spaun",               country: "USA", birthYear: 1990, lefty: false, categories: ["anyone","american"] },
  { id: 41, espnName: "Jake Knapp",                name: "Jake Knapp",                country: "USA", birthYear: 1995, lefty: false, categories: ["anyone","american"] },
  { id: 42, espnName: "Ryan Fox",                  name: "Ryan Fox",                  country: "NZL", birthYear: 1989, lefty: false, categories: ["anyone","foreigner"] },
  { id: 43, espnName: "Ryan Gerard",               name: "Ryan Gerard",               country: "USA", birthYear: 2000, lefty: false, categories: ["anyone","american"] },
  { id: 44, espnName: "Chris Gotterup",            name: "Chris Gotterup",            country: "USA", birthYear: 2000, lefty: false, categories: ["anyone","american"] },
  { id: 45, espnName: "Max Greyserman",            name: "Max Greyserman",            country: "USA", birthYear: 1999, lefty: false, categories: ["anyone","american"] },
  { id: 46, espnName: "Ben Griffin",               name: "Ben Griffin",               country: "USA", birthYear: 1997, lefty: false, categories: ["anyone","american"] },
  { id: 47, espnName: "Alex Noren",                name: "Alex Noren",                country: "SWE", birthYear: 1982, lefty: false, categories: ["anyone","foreigner"] },
  { id: 48, espnName: "Justin Rose",               name: "Justin Rose",               country: "ENG", birthYear: 1980, lefty: false, categories: ["anyone","foreigner"] },
  { id: 49, espnName: "Haotong Li",                name: "Haotong Li",                country: "CHN", birthYear: 1995, lefty: false, categories: ["anyone","foreigner"] },
  { id: 50, espnName: "Charl Schwartzel",          name: "Charl Schwartzel",          country: "RSA", birthYear: 1984, lefty: false, categories: ["anyone","foreigner"] },
  { id: 51, espnName: "Casey Jarvis",              name: "Casey Jarvis",              country: "RSA", birthYear: 2003, lefty: false, categories: ["anyone","foreigner"] },
  { id: 52, espnName: "Aldrich Potgieter",         name: "Aldrich Potgieter",         country: "RSA", birthYear: 2005, lefty: false, categories: ["anyone","foreigner"] },
  { id: 53, espnName: "Carlos Ortiz",              name: "Carlos Ortiz",              country: "MEX", birthYear: 1991, lefty: false, categories: ["anyone","foreigner"] },
  { id: 54, espnName: "Kristoffer Reitan",         name: "Kristoffer Reitan",         country: "NOR", birthYear: 2003, lefty: false, categories: ["anyone","foreigner"] },
  { id: 55, espnName: "Marco Penge",               name: "Marco Penge",               country: "ENG", birthYear: 2001, lefty: false, categories: ["anyone","foreigner"] },
  { id: 56, espnName: "Aaron Rai",                 name: "Aaron Rai",                 country: "ENG", birthYear: 1994, lefty: false, categories: ["anyone","foreigner"] },
  { id: 57, espnName: "Sami Valimaki",             name: "Sami Välimäki",             country: "FIN", birthYear: 1999, lefty: false, categories: ["anyone","foreigner"] },
  { id: 58, espnName: "Nicolas Echavarria",        name: "Nicolas Echavarría",        country: "COL", birthYear: 1993, lefty: false, categories: ["anyone","foreigner"] },
  { id: 59, espnName: "Tom McKibbin",              name: "Tom McKibbin",              country: "NIR", birthYear: 2002, lefty: false, categories: ["anyone","foreigner"] },
  { id: 60, espnName: "Si Woo Kim",               name: "Si Woo Kim",               country: "KOR", birthYear: 1995, lefty: false, categories: ["anyone","foreigner"] },
  { id: 61, espnName: "Harry Hall",                name: "Harry Hall",                country: "ENG", birthYear: 1996, lefty: false, categories: ["anyone","foreigner"] },
  { id: 62, espnName: "Naoyuki Kataoka",           name: "Naoyuki Kataoka",           country: "JPN", birthYear: 1982, lefty: false, categories: ["anyone","foreigner"] },
  { id: 63, espnName: "Daniel Berger",             name: "Daniel Berger",             country: "USA", birthYear: 1997, lefty: false, categories: ["anyone","american"] },
  { id: 64, espnName: "Andrew Novak",              name: "Andrew Novak",              country: "USA", birthYear: 1996, lefty: false, categories: ["anyone","american"] },
  { id: 65, espnName: "Sam Stevens",               name: "Sam Stevens",               country: "USA", birthYear: 2001, lefty: false, categories: ["anyone","american"] },
  { id: 66, espnName: "Jacob Bridgeman",           name: "Jacob Bridgeman",           country: "USA", birthYear: 2002, lefty: false, categories: ["anyone","american"] },
  { id: 67, espnName: "Kurt Kitayama",             name: "Kurt Kitayama",             country: "USA", birthYear: 1992, lefty: false, categories: ["anyone","american"] },
  { id: 68, espnName: "Gary Woodland",             name: "Gary Woodland",             country: "USA", birthYear: 1984, lefty: false, categories: ["anyone","american"] },
  { id: 69, espnName: "Maverick McNealy",          name: "Maverick McNealy",          country: "USA", birthYear: 1995, lefty: false, categories: ["anyone","american"] },
  { id: 70, espnName: "Michael Kim",               name: "Michael Kim",               country: "USA", birthYear: 1993, lefty: false, categories: ["anyone","american"] },
  { id: 71, espnName: "Johnny Keefer",             name: "Johnny Keefer",             country: "USA", birthYear: 1999, lefty: false, categories: ["anyone","american"] },
  { id: 72, espnName: "Michael Brennan",           name: "Michael Brennan",           country: "USA", birthYear: 2003, lefty: false, categories: ["anyone","american"] },
  // ── Left-handers ────────────────────────────────────────────────────────────
  { id: 73, espnName: "Brian Harman",              name: "Brian Harman",              country: "USA", birthYear: 1987, lefty: true,  categories: ["anyone","american","lefty"] },
  { id: 74, espnName: "Bubba Watson",              name: "Bubba Watson",              country: "USA", birthYear: 1978, lefty: true,  categories: ["anyone","american","lefty"] },
  { id: 75, espnName: "Matt McCarty",              name: "Matt McCarty",              country: "USA", birthYear: 1997, lefty: true,  categories: ["anyone","american","lefty"] },
  { id: 76, espnName: "Robert MacIntyre",          name: "Robert MacIntyre",          country: "SCO", birthYear: 1996, lefty: true,  categories: ["anyone","foreigner","lefty"] },
  { id: 77, espnName: "Akshay Bhatia",             name: "Akshay Bhatia",             country: "USA", birthYear: 2002, lefty: true,  categories: ["anyone","american","lefty"] },
  // ── Seniors (50+) ────────────────────────────────────────────────────────────
  { id: 78, espnName: "Zach Johnson",              name: "Zach Johnson",              country: "USA", birthYear: 1976, lefty: false, categories: ["anyone","american","senior"] },
  { id: 79, espnName: "Fred Couples",              name: "Fred Couples",              country: "USA", birthYear: 1959, lefty: false, categories: ["anyone","american","senior"] },
  { id: 80, espnName: "Jose Maria Olazabal",       name: "Jose Maria Olazabal",       country: "ESP", birthYear: 1966, lefty: false, categories: ["anyone","foreigner","senior"] },
  { id: 81, espnName: "Vijay Singh",               name: "Vijay Singh",               country: "FIJ", birthYear: 1963, lefty: false, categories: ["anyone","foreigner","senior"] },
  { id: 82, espnName: "Padraig Harrington",        name: "Padraig Harrington",        country: "IRL", birthYear: 1971, lefty: false, categories: ["anyone","foreigner","senior"] },
  { id: 83, espnName: "Darren Clarke",             name: "Darren Clarke",             country: "NIR", birthYear: 1968, lefty: false, categories: ["anyone","foreigner","senior"] },
  { id: 84, espnName: "Angel Cabrera",             name: "Angel Cabrera",             country: "ARG", birthYear: 1969, lefty: false, categories: ["anyone","foreigner","senior"] },
  { id: 85, espnName: "Mike Weir",                 name: "Mike Weir",                 country: "CAN", birthYear: 1970, lefty: true,  categories: ["anyone","foreigner","senior","lefty"] },
  // ── Amateurs ────────────────────────────────────────────────────────────────
  { id: 86, espnName: "Jackson Herrington",        name: "Jackson Herrington",        country: "USA", birthYear: 2005, lefty: true,  categories: ["anyone","american","lefty"] },
  { id: 87, espnName: "Ethan Fang",                name: "Ethan Fang",                country: "USA", birthYear: 2005, lefty: false, categories: ["anyone","american"] },
  { id: 88, espnName: "Brandon Holtz",             name: "Brandon Holtz",             country: "USA", birthYear: 2004, lefty: false, categories: ["anyone","american"] },
  { id: 89, espnName: "Mason Howell",              name: "Mason Howell",              country: "USA", birthYear: 2004, lefty: false, categories: ["anyone","american"] },
  { id: 90, espnName: "Fifa Laopakdee",            name: "Fifa Laopakdee",            country: "USA", birthYear: 2005, lefty: false, categories: ["anyone","american"] },
  { id: 91, espnName: "Mateo Pulcini",             name: "Mateo Pulcini",             country: "ARG", birthYear: 2005, lefty: false, categories: ["anyone","foreigner"] },
  { id: 92, espnName: "Rasmus Neergaard-Petersen", name: "Rasmus Neergaard-Petersen", country: "DEN", birthYear: 2004, lefty: false, categories: ["anyone","foreigner"] },
];

const CATEGORIES = [
  { id: "anyone",    label: "Anyone",    emoji: "🏌️", color: "#C9A84C" },
  { id: "american",  label: "American",  emoji: "🇺🇸", color: "#4A6FA5" },
  { id: "foreigner", label: "Foreigner", emoji: "🌍", color: "#2E7D32" },
  { id: "lefty",     label: "Lefty",     emoji: "🤚", color: "#7B1FA2" },
  { id: "senior",    label: "Senior",    emoji: "🎖️",  color: "#BF360C" },
];

type Player = typeof PLAYER_POOL[0];
type Category = typeof CATEGORIES[0];
type PickLog = {
  id: string;
  participant: string;
  player_id: number;
  player_name: string;
  category: string;
  pick_num: number | string;
  round_num: number | string;
  is_override: boolean;
  created_at: string;
};
type DraftState = {
  current_pick_index: number;
  draft_order: { participant: string; round: number; pickNum: number }[];
  is_started: boolean;
  is_complete: boolean;
};
type LBEntry = { position: number; score: number; thru: number; status: string };

const catInfo = (id: string): Category | undefined => CATEGORIES.find(c => c.id === id);

function normName(s: string) {
  return (s || "").toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/ñ/g, "n")
    .replace(/ø/g, "o").replace(/[^a-z0-9 .]/g, "").trim();
}

async function fetchESPNLeaderboard(pool: typeof PLAYER_POOL) {
  const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pgat";
  const PROXY = `https://api.allorigins.win/get?url=${encodeURIComponent(ESPN_URL)}`;
  try {
    const res = await fetch(PROXY);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
    const events = data.events || [];
    const mastersEvent = events.find((e: any) =>
      (e.name || "").toLowerCase().includes("masters") ||
      (e.shortName || "").toLowerCase().includes("masters")
    ) || events[0];
    if (!mastersEvent) throw new Error("Masters not found");
    const competitors = mastersEvent.competitions?.[0]?.competitors || [];
    const nameMap: Record<string, LBEntry> = {};
    competitors.forEach((comp: any) => {
      const displayName = comp.athlete?.displayName || "";
      const pos = parseInt(comp.status?.position?.id || "99", 10) || 99;
      const thru = comp.status?.thru ?? 0;
      const status = comp.status?.type?.description || "";
      const toParStat = (comp.statistics || []).find((s: any) => s.name === "toPar");
      const toPar = parseInt(toParStat?.value ?? "0", 10);
      nameMap[normName(displayName)] = { position: pos, score: toPar, thru, status };
    });
    const lb: Record<number, LBEntry> = {};
    pool.forEach(p => {
      const entry = nameMap[normName(p.espnName)];
      if (entry) lb[p.id] = entry;
    });
    return { lb, eventName: mastersEvent.name, error: null };
  } catch (err: any) {
    return { lb: {} as Record<number, LBEntry>, eventName: "", error: err.message };
  }
}

function scoreDisplay(score: number) {
  if (score < 0) return { text: score.toString(), color: "#81c784" };
  if (score === 0) return { text: "E", color: "#ddd" };
  return { text: `+${score}`, color: "#e57373" };
}

function calcScore(picks: PickLog[], lb: Record<number, LBEntry>) {
  let total = 0;
  picks.forEach(pick => {
    const e = lb[pick.player_id];
    total += e ? e.position : 80;
  });
  return total;
}

// ─── Roster helper: build per-participant category→pick map ──────────────────
function buildRosters(picks: PickLog[]) {
  const rosters: Record<string, Record<string, PickLog>> = {};
  PARTICIPANT_NAMES.forEach(p => { rosters[p] = {}; });
  picks.forEach(pick => {
    if (!rosters[pick.participant]) rosters[pick.participant] = {};
    rosters[pick.participant][pick.category] = pick;
  });
  return rosters;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MastersDraft() {
  // Auth
  const [username, setUsername] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [pinInput, setPinInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Draft state from Supabase
  const [draftState, setDraftState] = useState<DraftState>({
    current_pick_index: 0,
    draft_order: [],
    is_started: false,
    is_complete: false,
  });
  const [picks, setPicks] = useState<PickLog[]>([]);
  const [joinedParticipants, setJoinedParticipants] = useState<string[]>([]);

  // UI
  const [screen, setScreen] = useState<"lobby" | "draft" | "scoreboard" | "rosters" | "log">("lobby");
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");
  const [catModal, setCatModal] = useState(false);
  const [pendingPick, setPendingPick] = useState<{ player: Player; eligibleCats: string[] } | null>(null);
  const [notif, setNotif] = useState<{ msg: string; type: string } | null>(null);

  // Commissioner override
  const [commMode, setCommMode] = useState(false);
  const [commPinInput, setCommPinInput] = useState("");
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState({ participant: "", category: "" });
  const [overrideSearch, setOverrideSearch] = useState("");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<Record<number, LBEntry>>({});
  const [lbError, setLbError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lbLoading, setLbLoading] = useState(false);

  //const notifRef = useRef<NodeJS.Timeout>();
const notifRef = useRef<NodeJS.Timeout | null>(null);

const showNotif = (msg: string, type = "ok") => {
  // Only clear if the ref is not null
  if (notifRef.current) clearTimeout(notifRef.current);
  
  setNotif({ msg, type });
  notifRef.current = setTimeout(() => setNotif(null), 3500);
};

  const isComm = username === COMMISSIONER;
  const rosters = buildRosters(picks);
  const pickedIds = new Set(picks.map(p => p.player_id));
  const currentPick = draftState.draft_order[draftState.current_pick_index];
  const isMyTurn = currentPick?.participant === username;

  // ── Supabase: load initial state ──────────────────────────────────────────
  useEffect(() => {
    if (!username) return;

    // Load draft state
    supabase.from("draft_state").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setDraftState(data as DraftState);
    });

    // Load picks
    supabase.from("picks").select("*").order("created_at").then(({ data }) => {
      if (data) setPicks(data as PickLog[]);
    });

    // Load joined participants
    supabase.from("participants").select("username").then(({ data }) => {
      if (data) setJoinedParticipants(data.map((r: any) => r.username));
    });

    // Real-time: draft_state
    const draftSub = supabase
      .channel("draft_state")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "draft_state" }, payload => {
        setDraftState(payload.new as DraftState);
      })
      .subscribe();

    // Real-time: picks
    const picksSub = supabase
      .channel("picks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "picks" }, payload => {
        setPicks(prev => [...prev, payload.new as PickLog]);
      })
      .subscribe();

    // Real-time: participants
    const partSub = supabase
      .channel("participants")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "participants" }, payload => {
        setJoinedParticipants(prev => [...prev, (payload.new as any).username]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(draftSub);
      supabase.removeChannel(picksSub);
      supabase.removeChannel(partSub);
    };
  }, [username]);

  // ── Auto-switch to draft screen when draft starts ─────────────────────────
  useEffect(() => {
    if (draftState.is_started && screen === "lobby") setScreen("draft");
  }, [draftState.is_started]);

  // ── Leaderboard refresh ───────────────────────────────────────────────────
  const refreshLB = useCallback(async () => {
    setLbLoading(true);
    const { lb, error } = await fetchESPNLeaderboard(PLAYER_POOL);
    if (Object.keys(lb).length > 0) {
      setLeaderboard(lb);
      setLastUpdated(new Date());
      setLbError(null);
    } else {
      setLbError(error);
    }
    setLbLoading(false);
  }, []);

  useEffect(() => {
    if (username) {
      refreshLB();
      const iv = setInterval(refreshLB, 3_600_000);
      return () => clearInterval(iv);
    }
  }, [username, refreshLB]);

  // ── Auth: register ────────────────────────────────────────────────────────
  const handleRegister = async () => {
    setAuthError("");
    const trimmed = usernameInput.trim();
    if (!trimmed) return;

    // Validate invite PIN
    const { data: settings } = await supabase.from("settings").select("invite_pin").eq("id", 1).single();
    if (!settings || pinInput !== settings.invite_pin) {
      setAuthError("Wrong invite PIN. Ask Egan for the code.");
      return;
    }

    // Validate username is in allowed list
    const normalized = PARTICIPANT_NAMES.find(p => p.toLowerCase() === trimmed.toLowerCase());
    if (!normalized) {
      setAuthError(`"${trimmed}" isn't on the list. Names: ${PARTICIPANT_NAMES.join(", ")}`);
      return;
    }

    // Check if already taken
    const { data: existing } = await supabase.from("participants").select("username").eq("username", normalized).single();
    if (existing) {
      setAuthError(`${normalized} is already taken. That you?`);
      return;
    }

    // Register
    const { error } = await supabase.from("participants").insert({ username: normalized, pin_hash: pinInput });
    if (error) { setAuthError(error.message); return; }

    setUsername(normalized);
    localStorage.setItem("masters_draft_user", normalized);
  };

  // ── Auth: returning user ──────────────────────────────────────────────────
  const handleLogin = async () => {
    setAuthError("");
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    const normalized = PARTICIPANT_NAMES.find(p => p.toLowerCase() === trimmed.toLowerCase());
    if (!normalized) { setAuthError("Name not recognized."); return; }
    const { data } = await supabase.from("participants").select("username,pin_hash").eq("username", normalized).single();
    if (!data) { setAuthError("No account found. Register first."); return; }
    if (data.pin_hash !== pinInput) { setAuthError("Wrong PIN."); return; }
    setUsername(normalized);
    localStorage.setItem("masters_draft_user", normalized);
  };

  // Auto-login from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("masters_draft_user");
    if (saved) setUsername(saved);
  }, []);

  // ── Commissioner: start draft ─────────────────────────────────────────────
  const startDraft = async () => {
    const order = randomizeOrder(PARTICIPANT_NAMES);
    const draftOrder = buildSnakeOrder(order);
    await supabase.from("draft_state").update({
      draft_order: draftOrder,
      current_pick_index: 0,
      is_started: true,
      is_complete: false,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    showNotif("🎉 Draft started! Snake order randomized.");
  };

  // ── Commissioner: unlock ──────────────────────────────────────────────────
  const unlockComm = async () => {
    const { data } = await supabase.from("settings").select("comm_pin").eq("id", 1).single();
    if (data?.comm_pin === commPinInput) {
      setCommMode(true);
      setCommPinInput("");
      showNotif("🔓 Commissioner mode active");
    } else {
      showNotif("❌ Wrong commissioner PIN", "err");
    }
  };

  // ── Pick flow ─────────────────────────────────────────────────────────────
  const availableCats = (player: Player) => {
    if (!username) return [];
    const myRoster = rosters[isComm && overrideModal ? overrideTarget.participant : username] || {};
    return player.categories.filter(cat => !myRoster[cat]);
  };

  const selectPlayer = (player: Player) => {
    if (!isMyTurn && !commMode) return;
    const participant = commMode && overrideModal ? overrideTarget.participant : (username as string);
    const roster = rosters[participant] || {};
    const cats = player.categories.filter(cat => !roster[cat]);
    if (!cats.length) { showNotif("All slots for this player are filled on that roster", "warn"); return; }
    if (cats.length === 1) commitPick(player, cats[0], participant);
    else {
      setPendingPick({ player, eligibleCats: cats });
      setCatModal(true);
    }
  };

  const commitPick = async (player: Player, category: string, participant: string) => {
    const pickIndex = draftState.current_pick_index;
    const pickEntry = draftState.draft_order[pickIndex];

    const pick: Omit<PickLog, "id" | "created_at"> = {
      participant,
      player_id: player.id,
      player_name: player.name,
      category,
      pick_num: overrideModal ? "OVR" : (pickEntry?.pickNum ?? 0),
      round_num: overrideModal ? "—" : (pickEntry?.round ?? 0) + 1,
      is_override: overrideModal,
    };

    const { error } = await supabase.from("picks").insert(pick);
    if (error) { showNotif(`Error: ${error.message}`, "err"); return; }

    // If not an override, advance pick index
    if (!overrideModal) {
      const nextIndex = pickIndex + 1;
      const isComplete = nextIndex >= draftState.draft_order.length;
      await supabase.from("draft_state").update({
        current_pick_index: nextIndex,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      }).eq("id", 1);
    }

    setCatModal(false);
    setOverrideModal(false);
    setPendingPick(null);
    const c = catInfo(category);
    showNotif(`✅ ${participant} → ${player.name} (${c?.emoji} ${c?.label})`);
  };

  // ── Commissioner: undo last pick ─────────────────────────────────────────
  const undoLastPick = async () => {
    const normalPicks = picks.filter(p => !p.is_override);
    if (!normalPicks.length) return;
    const last = normalPicks[normalPicks.length - 1];
    await supabase.from("picks").delete().eq("id", last.id);
    const prevIndex = Math.max(0, draftState.current_pick_index - 1);
    await supabase.from("draft_state").update({
      current_pick_index: prevIndex,
      is_complete: false,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setPicks(prev => prev.filter(p => p.id !== last.id));
    showNotif(`↩️ Undid: ${last.player_name} from ${last.participant}`);
  };

  // ── Override pick (commissioner replaces a slot) ──────────────────────────
  const openOverride = (participant: string, category: string) => {
    if (!commMode) return;
    // Remove existing pick for that slot first
    const existing = rosters[participant]?.[category];
    if (existing) {
      supabase.from("picks").delete().eq("id", existing.id).then(() => {
        setPicks(prev => prev.filter(p => p.id !== existing.id));
      });
    }
    setOverrideTarget({ participant, category });
    setOverrideSearch("");
    setOverrideModal(true);
  };

  // ── Filtered player list ──────────────────────────────────────────────────
  const filtered = PLAYER_POOL.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "all" && !p.categories.includes(filterCat)) return false;
    return true;
  });
  const available = filtered.filter(p => !pickedIds.has(p.id));
  const drafted = filtered.filter(p => pickedIds.has(p.id));

  // ── Scoreboard ────────────────────────────────────────────────────────────
  const scores = PARTICIPANT_NAMES.map(p => ({
    participant: p,
    total: calcScore(picks.filter(pk => pk.participant === p), leaderboard),
    filled: picks.filter(pk => pk.participant === p).length,
  })).sort((a, b) => a.total - b.total);

  // ── Notification colors ───────────────────────────────────────────────────
  const notifColors = {
    ok:   { bg: "#081208", border: "#2E7D32", color: "#a5d6a7" },
    warn: { bg: "#1a1100", border: "#e65100", color: "#ffcc80" },
    err:  { bg: "#1a0808", border: "#c62828", color: "#ef9a9a" },
  }[notif?.type || "ok"] || { bg: "#081208", border: "#2E7D32", color: "#a5d6a7" };

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!username) {
    return (
      <div style={S.root}>
        <div style={S.centered}>
          <div style={S.card}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⛳</div>
              <div style={S.cardTitle}>Masters Draft 2026</div>
              <div style={S.cardSub}>Augusta National</div>
            </div>

            <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden" }}>
              {(["login","register"] as const).map(tab => (
                <button key={tab} style={{ flex: 1, padding: "10px", background: authScreen === tab ? "#C9A84C" : "transparent",
                  color: authScreen === tab ? "#000" : "#555", border: "none", cursor: "pointer",
                  fontFamily: "Georgia,serif", fontSize: 13, fontWeight: authScreen === tab ? 700 : 400 }}
                  onClick={() => { setAuthScreen(tab); setAuthError(""); }}>
                  {tab === "login" ? "Returning" : "First Time"}
                </button>
              ))}
            </div>

            <div style={S.secLabel}>YOUR NAME</div>
            <input style={{ ...S.input, marginBottom: 12 }} placeholder={`e.g. ${PARTICIPANT_NAMES[0]}`}
              value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />

            <div style={S.secLabel}>INVITE PIN</div>
            <input style={{ ...S.input, marginBottom: 20 }} type="password" placeholder="Enter PIN from Egan"
              value={pinInput} onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (authScreen === "register" ? handleRegister() : handleLogin())} />

            {authError && <div style={{ color: "#e57373", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{authError}</div>}

            <button style={{ ...S.goldBtn, width: "100%" }}
              onClick={authScreen === "register" ? handleRegister : handleLogin}>
              {authScreen === "register" ? "Join Draft" : "Sign In"}
            </button>

            <div style={{ marginTop: 16, fontSize: 11, color: "#333", textAlign: "center" }}>
              {PARTICIPANT_NAMES.join(" · ")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      {/* Notification */}
      {notif && (
        <div style={{ ...S.notif, background: notifColors.bg, borderColor: notifColors.border, color: notifColors.color }}>
          {notif.msg}
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.hLeft}>
          <span style={{ fontSize: 24 }}>⛳</span>
          <div>
            <div style={S.hTitle}>MASTERS DRAFT</div>
            <div style={S.hSub}>Augusta · 2026</div>
          </div>
        </div>
        <div style={S.hCenter}>
          {lastUpdated && <span style={S.updateTime}>ESPN · {lastUpdated.toLocaleTimeString()}</span>}
          {lbError && <span style={{ color: "#e57373", fontSize: 10 }}>⚠️ No live scores</span>}
        </div>
        <div style={S.hNav}>
          {(["draft","scoreboard","rosters","log"] as const).map(s => (
            <button key={s} style={screen === s ? S.navOn : S.navOff} onClick={() => setScreen(s)}>
              {{ draft: "Draft", scoreboard: "Scores", rosters: "Rosters", log: "Log" }[s]}
            </button>
          ))}
          <div style={{ color: "#444", fontSize: 11, marginLeft: 8, alignSelf: "center" }}>
            {username}
            <button style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 10, marginLeft: 4 }}
              onClick={() => { setUsername(null); localStorage.removeItem("masters_draft_user"); }}>
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* ══ LOBBY ════════════════════════════════════════════════════════════ */}
      {screen === "lobby" && (
        <div style={S.centered}>
          <div style={S.card}>
            <div style={S.cardTitle}>👋 Welcome, {username}</div>
            <div style={S.cardSub}>Waiting for the commissioner to start the draft</div>

            <div style={S.secLabel}>PARTICIPANTS ({joinedParticipants.length}/{PARTICIPANT_NAMES.length} joined)</div>
            {PARTICIPANT_NAMES.map(p => (
              <div key={p} style={{ ...S.pRow, marginBottom: 6 }}>
                <div style={{ flex: 1, fontSize: 14 }}>{p}</div>
                {joinedParticipants.includes(p)
                  ? <span style={{ color: "#81c784", fontSize: 12 }}>✓ Joined</span>
                  : <span style={{ color: "#333", fontSize: 12 }}>Waiting…</span>}
              </div>
            ))}

            {isComm && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
                  Commissioner controls — draft order will be randomized on start.
                </div>
                <button style={{ ...S.goldBtn, width: "100%" }} onClick={startDraft}>
                  🎲 Randomize Order &amp; Start Draft
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ DRAFT ════════════════════════════════════════════════════════════ */}
      {screen === "draft" && (
        <div style={S.draftLayout}>
          <div style={S.draftMain}>

            {/* Status banner */}
            {draftState.is_complete ? (
              <div style={S.completeBanner}>🎉 Draft Complete! <button style={S.goldBtn} onClick={() => setScreen("scoreboard")}>View Scores →</button></div>
            ) : isMyTurn ? (
              <div style={{ ...S.clockBox, borderColor: "#C9A84C66" }}>
                <div style={S.clockLabel}>YOUR PICK</div>
                <div style={S.clockName}>Make your selection below</div>
                <div style={S.clockSub}>Pick {currentPick?.pickNum} of {draftState.draft_order.length} · Round {(currentPick?.round ?? 0) + 1}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {CATEGORIES.map(c => {
                    const filled = !!rosters[username!]?.[c.id];
                    return (
                      <div key={c.id} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20,
                        border: `1px solid ${filled ? "#222" : c.color}`, color: filled ? "#333" : c.color,
                        background: filled ? "#0d0d0d" : c.color + "18",
                        textDecoration: filled ? "line-through" : "none" }}>
                        {c.emoji} {c.label} {filled ? "✓" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={S.clockBox}>
                <div style={S.clockLabel}>ON THE CLOCK</div>
                <div style={S.clockName}>{currentPick?.participant}</div>
                <div style={S.clockSub}>Pick {currentPick?.pickNum} of {draftState.draft_order.length} · Round {(currentPick?.round ?? 0) + 1}</div>
              </div>
            )}

            {/* Commissioner bar */}
            {isComm && (
              <div style={S.commBar}>
                {commMode ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ color: "#ffcc80", fontSize: 12 }}>⚙️ Commissioner Active — click roster slot to override</span>
                    <button style={S.dangerBtn} onClick={undoLastPick}>↩ Undo Last Pick</button>
                    <button style={{ ...S.ghostBtn, marginLeft: "auto" }} onClick={() => setCommMode(false)}>🔒 Lock</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#444", fontSize: 12 }}>⚙️ Commissioner</span>
                    <input style={{ ...S.input, width: 100, padding: "5px 10px", fontSize: 12 }}
                      type="password" placeholder="Comm PIN" value={commPinInput}
                      onChange={e => setCommPinInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && unlockComm()} />
                    <button style={S.ghostBtn} onClick={unlockComm}>Unlock</button>
                  </div>
                )}
              </div>
            )}

            {/* Filters */}
            <div style={{ marginBottom: 10 }}>
              <input style={S.searchInput} placeholder="🔍 Search players..." value={search}
                onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button style={filterCat === "all" ? S.filterOn : S.filterOff} onClick={() => setFilterCat("all")}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.id}
                    style={filterCat === c.id ? { ...S.filterOn, background: c.color, borderColor: c.color } : S.filterOff}
                    onClick={() => setFilterCat(c.id)}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Player list */}
            <div style={S.playerList}>
              {available.map(player => {
                const myRoster = rosters[username!] || {};
                const cats = player.categories.filter(cat => !myRoster[cat]);
                const canPick = (isMyTurn || commMode) && cats.length > 0;
                const lbe = leaderboard[player.id];
                const sd = lbe ? scoreDisplay(lbe.score) : null;
                return (
                  <div key={player.id}
                    style={{ ...S.playerRow, opacity: canPick ? 1 : 0.35, cursor: canPick ? "pointer" : "default" }}
                    onClick={() => canPick && selectPlayer(player)}>
                    <div style={{ flex: 1 }}>
                      <div style={S.playerName}>{player.name}</div>
                      <div style={S.playerMeta}>{player.country}{player.categories.map(c => <span key={c} style={{ marginLeft: 5 }}>{catInfo(c)?.emoji}</span>)}</div>
                    </div>
                    <div style={S.playerRight}>
                      {lbe ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: "#777" }}>T{lbe.position}</div>
                          <div style={{ fontSize: 12, color: sd?.color }}>{sd?.text}</div>
                          <div style={{ fontSize: 10, color: "#444" }}>{lbe.status === "F" ? "F" : lbe.thru ? `Thru ${lbe.thru}` : "—"}</div>
                        </div>
                      ) : <div style={{ fontSize: 11, color: "#333" }}>—</div>}
                      {canPick && <div style={S.pickChip}>PICK</div>}
                    </div>
                  </div>
                );
              })}
              {drafted.length > 0 && (
                <>
                  <div style={S.divider}>── Drafted ──</div>
                  {drafted.map(player => {
                    const lbe = leaderboard[player.id];
                    const sd = lbe ? scoreDisplay(lbe.score) : null;
                    return (
                      <div key={player.id} style={{ ...S.playerRow, opacity: 0.3, cursor: "default" }}>
                        <div style={{ flex: 1 }}>
                          <div style={S.playerName}>{player.name}</div>
                          <div style={S.playerMeta}>{player.country}</div>
                        </div>
                        {lbe && <div style={{ textAlign: "right", fontSize: 12 }}>
                          <div style={{ color: "#666" }}>T{lbe.position}</div>
                          <div style={{ color: sd?.color }}>{sd?.text}</div>
                        </div>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={S.sidebar}>
            <div style={S.sidebarTitle}>📋 ROSTERS</div>
            {draftState.draft_order.length > 0 && (
              <div style={{ marginBottom: 12, fontSize: 10, color: "#333" }}>
                {draftState.draft_order.map((p, i) => (
                  <div key={i} style={{ padding: "2px 0", color: i === draftState.current_pick_index && !draftState.is_complete ? "#C9A84C" : "#333" }}>
                    {i + 1}. {p.participant} {i === draftState.current_pick_index && !draftState.is_complete ? "◀" : ""}
                  </div>
                ))}
              </div>
            )}
            {PARTICIPANT_NAMES.map(p => {
              const isOnClock = currentPick?.participant === p && !draftState.is_complete;
              return (
                <div key={p} style={{ ...S.rCard, borderColor: isOnClock ? "#C9A84C44" : "#111" }}>
                  <div style={{ ...S.rName, color: p === username ? "#C9A84C" : isOnClock ? "#fff" : "#777" }}>
                    {isOnClock && "▶ "}{p}{p === username ? " (you)" : ""}
                  </div>
                  {CATEGORIES.map(c => {
                    const pick = rosters[p]?.[c.id];
                    return (
                      <div key={c.id} style={{ ...S.rSlot, cursor: commMode ? "pointer" : "default" }}
                        onClick={() => openOverride(p, c.id)}
                        title={commMode ? `Override ${p}'s ${c.label}` : ""}>
                        <span style={{ color: c.color, fontSize: 10, fontWeight: 700, minWidth: 65 }}>{c.emoji} {c.label}</span>
                        <span style={{ fontSize: 10, color: pick ? "#ccc" : "#252525", fontStyle: pick ? "normal" : "italic" }}>
                          {pick ? pick.player_name : "—"}
                        </span>
                        {commMode && <span style={{ color: "#2a2a2a", fontSize: 9 }}>✎</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ SCOREBOARD ═══════════════════════════════════════════════════════ */}
      {screen === "scoreboard" && (
        <div style={S.page}>
          <div style={S.pageHdr}>
            <div style={S.pageTitle}>🏆 Scoreboard</div>
            <button style={S.ghostBtn} onClick={refreshLB} disabled={lbLoading}>
              {lbLoading ? "⏳" : "↻ ESPN"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {scores.map((s, i) => (
              <div key={s.participant} style={{ ...S.sbRow, background: i === 0 ? "#C9A84C0e" : "#0f0f0f", borderColor: i === 0 ? "#C9A84C44" : "#1a1a1a" }}>
                <div style={{ fontSize: 22, width: 36 }}>{["🥇","🥈","🥉"][i] || `#${i+1}`}</div>
                <div style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>{s.participant}{s.participant === username ? <span style={{ color: "#555", fontSize: 12 }}> (you)</span> : ""}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#C9A84C" }}>{s.total}</div>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>{s.filled}/5 · SUM POS.</div>
                </div>
              </div>
            ))}
          </div>
          {PARTICIPANT_NAMES.map(p => (
            <div key={p} style={S.sbCard}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{p}</div>
                <div style={{ color: "#C9A84C", fontWeight: 700 }}>{calcScore(picks.filter(pk => pk.participant === p), leaderboard)} pts</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
                {CATEGORIES.map(c => {
                  const pick = rosters[p]?.[c.id];
                  const lbe = pick ? leaderboard[pick.player_id] : null;
                  const sd = lbe ? scoreDisplay(lbe.score) : null;
                  return (
                    <div key={c.id} style={{ ...S.sbSlot, borderTopColor: c.color }}>
                      <div style={{ color: c.color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{c.emoji} {c.label.toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                        {pick?.player_name || <span style={{ color: "#2a2a2a", fontStyle: "italic" }}>Empty</span>}
                      </div>
                      {lbe ? (
                        <div>
                          <span style={{ color: "#666", fontSize: 11 }}>T{lbe.position} </span>
                          <span style={{ color: sd?.color, fontSize: 11 }}>{sd?.text}</span>
                        </div>
                      ) : pick ? <div style={{ color: "#333", fontSize: 10 }}>Awaiting score</div> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ ROSTERS ══════════════════════════════════════════════════════════ */}
      {screen === "rosters" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 20, maxWidth: 1100, margin: "0 auto" }}>
          {PARTICIPANT_NAMES.map(p => (
            <div key={p} style={{ flex: "1 1 260px", background: "#0f0f0f", borderRadius: 12, padding: 18, border: `1px solid ${p === username ? "#C9A84C33" : "#1a1a1a"}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: p === username ? "#C9A84C" : "#ddd", marginBottom: 14 }}>
                {p}{p === username ? " (you)" : ""}
              </div>
              {CATEGORIES.map(c => {
                const pick = rosters[p]?.[c.id];
                const lbe = pick ? leaderboard[pick.player_id] : null;
                const sd = lbe ? scoreDisplay(lbe.score) : null;
                return (
                  <div key={c.id} style={{ borderLeft: `3px solid ${c.color}`, padding: "8px 12px", marginBottom: 6, background: "#0a0a0a", borderRadius: "0 6px 6px 0" }}>
                    <div style={{ color: c.color, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{c.emoji} {c.label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, margin: "3px 0" }}>
                      {pick?.player_name || <span style={{ color: "#222", fontStyle: "italic" }}>Not picked</span>}
                    </div>
                    {lbe && <div style={{ fontSize: 11 }}><span style={{ color: "#555" }}>T{lbe.position} </span><span style={{ color: sd?.color }}>{sd?.text}</span></div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ══ PICK LOG ════════════════════════════════════════════════════════ */}
      {screen === "log" && (
        <div style={S.page}>
          <div style={S.pageHdr}>
            <div style={S.pageTitle}>📜 Pick Log</div>
            <div style={{ color: "#444", fontSize: 13 }}>{picks.length} picks</div>
          </div>
          {[...picks].reverse().map((log, i) => {
            const c = catInfo(log.category);
            return (
              <div key={i} style={{ ...S.logRow, borderColor: log.is_override ? "#e6510033" : "#1a1a1a", background: log.is_override ? "#1a0d00" : "#0f0f0f", marginBottom: 4 }}>
                <div style={{ minWidth: 60 }}>
                  <div style={{ fontSize: 10, color: log.is_override ? "#e65100" : "#444", letterSpacing: 1, textTransform: "uppercase" }}>
                    {log.is_override ? "OVR" : `#${log.pick_num}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#333" }}>Rnd {log.round_num}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{log.player_name}</div>
                </div>
                <div style={{ minWidth: 75 }}>
                  <div style={{ color: c?.color, fontSize: 12 }}>{c?.emoji} {c?.label}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{log.participant}</div>
                  <div style={{ fontSize: 10, color: "#444" }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ CATEGORY MODAL ══════════════════════════════════════════════════ */}
      {catModal && pendingPick && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>Assign Slot</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{pendingPick.player.name}</div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>Qualifies for multiple open slots:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {pendingPick.eligibleCats.map(catId => {
                const c = catInfo(catId)!;
                return (
                  <button key={catId} style={{ border: `1px solid ${c.color}`, color: c.color, background: "transparent",
                    padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontFamily: "Georgia,serif" }}
                    onClick={() => commitPick(pendingPick.player, catId, username!)}>
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>
            <button style={S.ghostBtn} onClick={() => { setCatModal(false); setPendingPick(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ══ OVERRIDE MODAL ══════════════════════════════════════════════════ */}
      {overrideModal && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: 460, textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#e65100", textTransform: "uppercase", marginBottom: 8 }}>⚙️ Override</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
              {overrideTarget.participant} — {catInfo(overrideTarget.category)?.emoji} {catInfo(overrideTarget.category)?.label}
            </div>
            <div style={{ fontSize: 12, color: "#444", marginBottom: 14 }}>Select any eligible player</div>
            <input style={{ ...S.searchInput, marginBottom: 10 }} placeholder="Search..."
              value={overrideSearch} onChange={e => setOverrideSearch(e.target.value)} />
            <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {PLAYER_POOL.filter(p =>
                p.categories.includes(overrideTarget.category) &&
                (!overrideSearch || p.name.toLowerCase().includes(overrideSearch.toLowerCase()))
              ).map(player => (
                <div key={player.id}
                  style={{ ...S.playerRow, cursor: "pointer" }}
                  onClick={() => commitPick(player, overrideTarget.category, overrideTarget.participant)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{player.name}</div>
                    <div style={{ fontSize: 11, color: pickedIds.has(player.id) ? "#c62828" : "#444" }}>
                      {player.country}{pickedIds.has(player.id) ? " · already drafted" : ""}
                    </div>
                  </div>
                  <div style={S.pickChip}>SET</div>
                </div>
              ))}
            </div>
            <button style={{ ...S.ghostBtn, marginTop: 14 }} onClick={() => setOverrideModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#080808", color: "#ddd", fontFamily: "'Georgia', serif" },
  centered: { display: "flex", justifyContent: "center", padding: "48px 16px" },
  card: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, padding: 32, maxWidth: 440, width: "100%" },
  cardTitle: { fontSize: 22, fontWeight: 700, color: "#C9A84C", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#444", marginBottom: 24 },
  secLabel: { fontSize: 10, letterSpacing: 3, color: "#383838", textTransform: "uppercase" as const, marginBottom: 8 },
  pRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#090909", borderRadius: 8, border: "1px solid #151515" },
  input: { width: "100%", boxSizing: "border-box" as const, background: "#090909", border: "1px solid #1a1a1a", borderRadius: 8, color: "#ddd", padding: "10px 14px", fontSize: 14, fontFamily: "Georgia,serif", outline: "none" },
  goldBtn: { background: "#C9A84C", border: "none", color: "#000", padding: "11px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontFamily: "Georgia,serif", fontSize: 14 },
  ghostBtn: { background: "transparent", border: "1px solid #2a2a2a", color: "#666", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13 },
  dangerBtn: { background: "#c6282810", border: "1px solid #c62828", color: "#ef9a9a", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12 },

  notif: { position: "fixed" as const, top: 14, right: 14, zIndex: 9999, border: "1px solid", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontFamily: "monospace", boxShadow: "0 8px 32px rgba(0,0,0,0.7)", maxWidth: 380 },

  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: "1px solid #C9A84C22", background: "#080808", position: "sticky" as const, top: 0, zIndex: 100, gap: 10 },
  hLeft: { display: "flex", alignItems: "center", gap: 10, minWidth: 160 },
  hTitle: { fontSize: 15, fontWeight: 700, letterSpacing: 4, color: "#C9A84C" },
  hSub: { fontSize: 9, color: "#444", letterSpacing: 2, textTransform: "uppercase" as const },
  hCenter: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  updateTime: { fontSize: 10, color: "#383838" },
  hNav: { display: "flex", gap: 4, alignItems: "center" },
  navOn: { background: "#C9A84C18", border: "1px solid #C9A84C55", color: "#C9A84C", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" },
  navOff: { background: "transparent", border: "1px solid #181818", color: "#444", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" },

  draftLayout: { display: "flex", height: "calc(100vh - 53px)", overflow: "hidden" },
  draftMain: { flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden", padding: "12px 12px 0" },
  sidebar: { width: 250, borderLeft: "1px solid #0e0e0e", overflow: "auto", padding: 10, background: "#050505" },
  sidebarTitle: { fontSize: 9, letterSpacing: 3, color: "#C9A84C44", textTransform: "uppercase" as const, marginBottom: 10 },

  clockBox: { background: "#0c0c0c", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 16px", marginBottom: 8 },
  clockLabel: { fontSize: 9, letterSpacing: 3, color: "#C9A84C", textTransform: "uppercase" as const },
  clockName: { fontSize: 20, fontWeight: 700, color: "#fff" },
  clockSub: { fontSize: 11, color: "#444" },
  completeBanner: { background: "#081408", border: "1px solid #2E7D3244", borderRadius: 10, padding: "16px 20px", textAlign: "center" as const, fontSize: 16, color: "#81c784", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 },

  commBar: { borderBottom: "1px solid #0f0f0f", paddingBottom: 8, marginBottom: 8 },
  searchInput: { width: "100%", boxSizing: "border-box" as const, background: "#090909", border: "1px solid #141414", borderRadius: 8, color: "#ddd", padding: "8px 12px", fontSize: 13, fontFamily: "Georgia,serif", outline: "none", marginBottom: 8 },
  filterOn: { background: "#C9A84C", border: "1px solid #C9A84C", color: "#000", padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif", fontWeight: 700 },
  filterOff: { background: "#090909", border: "1px solid #141414", color: "#444", padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" },

  playerList: { flex: 1, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 3, paddingBottom: 16 },
  playerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "#0d0d0d", borderRadius: 7, border: "1px solid #141414" },
  playerName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
  playerMeta: { fontSize: 10, color: "#444" },
  playerRight: { display: "flex", alignItems: "center", gap: 8 },
  pickChip: { background: "#C9A84C", color: "#000", padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1 },
  divider: { textAlign: "center" as const, color: "#1e1e1e", fontSize: 10, padding: "8px 0", letterSpacing: 2 },

  rCard: { marginBottom: 8, background: "#0a0a0a", borderRadius: 7, padding: 8, border: "1px solid" },
  rName: { fontWeight: 700, fontSize: 12, marginBottom: 6 },
  rSlot: { display: "flex", alignItems: "center", gap: 5, padding: "3px 0", borderBottom: "1px solid #0e0e0e" },

  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  pageHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#C9A84C" },
  sbRow: { display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, border: "1px solid" },
  sbCard: { background: "#0d0d0d", border: "1px solid #151515", borderRadius: 12, padding: 18, marginBottom: 14 },
  sbSlot: { background: "#090909", borderRadius: 7, padding: 10, border: "1px solid #141414", borderTop: "3px solid" },
  logRow: { display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 7, border: "1px solid" },

  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#111", border: "1px solid #222", borderRadius: 14, padding: 26, maxWidth: 380, width: "92%", textAlign: "center" as const },
};
