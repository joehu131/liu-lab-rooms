// ─────────────────────────────────────────────────────────────────────────────
// LiU Lab Rooms Widget (Scriptable iOS)
// - Real-time computer lab availability on Linköping University Campus Valla
// - Dense 3-Column layout displaying all 42 rooms with W/L OS prefix
// - Colors: Green (>4h free or all day), Yellow (≤240m free), Red (Booked)
// - Labels: W|Room (Windows), L|Room (Linux), W|Room|40m (Ending soon)
// - Prioritization: >= 10 pcs (A-Z) -> < 10 pcs (A-Z) -> Booked (A-Z)
// - Local cache persistence (FileManager)
// - Tap widget to open Vercel Web App
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = "https://liu-lab-rooms.vercel.app";
const API_URL = "https://liu-lab-rooms.vercel.app/api/rooms";

// 42 Verified Permanent TimeEdit IDs (Rolling dynamic 2-day query)
const ALL_TIMEEDIT_IDS = [
  "264005.195", "861750.195", "861749.195", "264145.195", "861752.195", "264414.195",
  "264591.195", "264540.195", "264541.195", "264542.195", "264543.195", "264544.195",
  "264546.195", "264547.195", "264548.195", "264549.195", "264550.195", "264551.195",
  "264553.195", "264155.195", "264524.195", "861751.195", "264001.195", "264060.195",
  "660754.195", "264151.195", "857519.195", "358516.195", "660753.195", "660756.195",
  "660755.195", "990783.195", "290210.195", "264413.195", "264430.195", "264431.195",
  "264432.195", "264433.195", "264434.195", "547136.195", "267189.195", "990784.195"
];

const TIMEEDIT_URL = `https://cloud.timeedit.net/liu/web/schema/ri.json?sid=3&p=0.d,2.d&objects=${ALL_TIMEEDIT_IDS.join(",")}`;
const CACHE_FILE = "liu_labs_cache_v3.json";

function log(msg, ...args) {
  console.log(`[LiU Labs] ${msg}`, ...args);
}

function logError(msg, ...args) {
  console.error(`[LiU Labs] ERROR: ${msg}`, ...args);
}

// Complete 42 Lab Rooms Catalog (Exact computer specs from LiU)
const LAB_CATALOG = [
  // 22 Linux Rooms (B-huset)
  { id: "264005", name: "Asgård", os: "linux", computers: 16, building: "B-huset", floor: "03" },
  { id: "861750", name: "Bakdörren", os: "linux", computers: 12, building: "B-huset", floor: "02" },
  { id: "861749", name: "Brandväggen", os: "linux", computers: 12, building: "B-huset", floor: "02" },
  { id: "264145", name: "Egypten", os: "linux", computers: 16, building: "B-huset", floor: "03" },
  { id: "861752", name: "Multicore", os: "linux", computers: 12, building: "B-huset", floor: "02" },
  { id: "264414", name: "Olympen", os: "linux", computers: 16, building: "B-huset", floor: "03" },
  { id: "264591", name: "Resistorn", os: "linux", computers: 18, building: "B-huset", floor: "02" },
  { id: "264540", name: "SU00", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264541", name: "SU01", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264542", name: "SU02", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264543", name: "SU03", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264544", name: "SU04", os: "linux", computers: 16, building: "B-huset", floor: "02" },
  { id: "264546", name: "SU10", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264547", name: "SU11", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264548", name: "SU12", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264549", name: "SU13", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264550", name: "SU14", os: "linux", computers: 10, building: "B-huset", floor: "02" },
  { id: "264551", name: "SU15/16", os: "linux", computers: 24, building: "B-huset", floor: "02" },
  { id: "264553", name: "SU17/18", os: "linux", computers: 24, building: "B-huset", floor: "02" },
  { id: "264155", name: "SU24", os: "linux", computers: 16, building: "B-huset", floor: "02" },
  { id: "264524", name: "SU25", os: "linux", computers: 16, building: "B-huset", floor: "02" },
  { id: "861751", name: "Vippan", os: "linux", computers: 18, building: "B-huset", floor: "02" },

  // 20 Windows Rooms
  { id: "264001", name: "Alfheim", os: "windows", computers: 43, building: "A-huset", floor: "03" },
  { id: "264060", name: "Bifrost", os: "windows", computers: 39, building: "A-huset", floor: "03" },
  { id: "660754", name: "Elivågor", os: "windows", computers: 28, building: "A-huset", floor: "02" },
  { id: "264151", name: "F302", os: "windows", computers: 6, building: "Fysikhuset", floor: "03" },
  { id: "857519", name: "Fahlstedt", os: "windows", computers: 18, building: "Key", floor: "02" },
  { id: "358516", name: "Franklin", os: "windows", computers: 13, building: "B-huset", floor: "02" },
  { id: "660753", name: "Gimle", os: "windows", computers: 30, building: "A-huset", floor: "02" },
  { id: "660756", name: "Glase", os: "windows", computers: 38, building: "A-huset", floor: "02" },
  { id: "660755", name: "Glitner", os: "windows", computers: 24, building: "A-huset", floor: "02" },
  { id: "990783", name: "Jotunheim", os: "windows", computers: 34, building: "A-huset", floor: "03" },
  { id: "290210", name: "Medielab", os: "windows", computers: 24, building: "Key", floor: "03" },
  { id: "264413", name: "Nobelsalen", os: "windows", computers: 20, building: "A-huset", floor: "03" },
  { id: "264430", name: "PC1", os: "windows", computers: 8, building: "E-huset", floor: "02" },
  { id: "264431", name: "PC2", os: "windows", computers: 8, building: "E-huset", floor: "02" },
  { id: "264432", name: "PC3", os: "windows", computers: 8, building: "E-huset", floor: "02" },
  { id: "264433", name: "PC4", os: "windows", computers: 8, building: "E-huset", floor: "02" },
  { id: "264434", name: "PC5", os: "windows", computers: 8, building: "E-huset", floor: "02" },
  { id: "547136", name: "SH4162", os: "windows", computers: 16, building: "Studenthuset", floor: "04" },
  { id: "267189", name: "Valhall", os: "windows", computers: 44, building: "A-huset", floor: "03" },
  { id: "990784", name: "Vanheim", os: "windows", computers: 19, building: "A-huset", floor: "03" }
];

// =============================================================================
// CACHE HELPERS
// =============================================================================
function getCacheManager() {
  try {
    if (typeof FileManager === "undefined") return null;
    const fm = FileManager.local();
    const cacheDir = fm.documentsDirectory();
    const cachePath = fm.joinPath(cacheDir, CACHE_FILE);
    return { fm, cachePath };
  } catch (e) {
    logError("FileManager error:", e);
    return null;
  }
}

function loadFromCache() {
  const cache = getCacheManager();
  if (cache && cache.fm.fileExists(cache.cachePath)) {
    try {
      const raw = cache.fm.readString(cache.cachePath);
      const data = JSON.parse(raw);
      log("Loaded schedule from local cache");
      return data;
    } catch (e) {
      logError("Failed to parse cache:", e);
    }
  }
  return null;
}

function saveToCache(data) {
  const cache = getCacheManager();
  if (cache && data) {
    try {
      cache.fm.writeString(cache.cachePath, JSON.stringify(data));
      log("Saved schedule to local cache");
    } catch (e) {
      logError("Failed to write cache:", e);
    }
  }
}

// =============================================================================
// NETWORK FETCHING
// =============================================================================
async function fetchSchedule() {
  log("Fetching schedule data...");

  // 1. Direct TimeEdit JSON
  try {
    let req = new Request(TIMEEDIT_URL);
    req.method = "GET";
    req.timeoutInterval = 7;
    req.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "Accept": "application/json, text/plain, */*"
    };
    const json = await req.loadJSON();
    if (json && json.reservations) {
      log(`Fetched ${json.reservations.length} reservations from TimeEdit`);
      saveToCache(json);
      return json;
    }
  } catch (err) {
    logError("TimeEdit direct fetch failed:", err.message || err);
  }

  // 2. Edge API
  try {
    let req = new Request(API_URL);
    req.method = "GET";
    req.timeoutInterval = 6;
    req.headers = { "Accept": "application/json" };
    const json = await req.loadJSON();
    if (json && json.reservations) {
      log("Fetched reservations from Edge API");
      saveToCache(json);
      return json;
    }
  } catch (err) {
    logError("Edge API fetch failed:", err.message || err);
  }

  // 3. Cached fallback
  const cached = loadFromCache();
  if (cached) {
    log("Using cached schedule data");
    return cached;
  }

  return { reservations: [] };
}

// =============================================================================
// AVAILABILITY & STATUS ENGINE
// =============================================================================
function parseStockholmDateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const isSummer = m > 3 && m < 10;
  const tzOffsetHours = isSummer ? 2 : 1;
  return Date.UTC(y, m - 1, d, hh - tzOffsetHours, mm, 0);
}

function formatRemaining(mins) {
  if (mins < 60) return `${mins}m`;
  const hours = mins / 60;
  const formatted = hours.toFixed(1).replace(/\.0$/, "");
  return `${formatted}h`;
}

function evaluateRoomAvailability(room, reservations, nowMs) {
  const roomReservations = (reservations || []).filter((r) => {
    if (!r.columns || !Array.isArray(r.columns)) return false;
    return r.columns.some((col) => {
      if (typeof col !== "string") return false;
      return col.split(/[,;\n]+/).some((part) => {
        const trimmed = part.trim().toLowerCase();
        return trimmed === room.name.toLowerCase() || trimmed === room.id.toLowerCase();
      });
    });
  });

  const parsedBookings = [];
  for (const r of roomReservations) {
    if (!r.startdate || !r.starttime || !r.enddate || !r.endtime) continue;
    const startMs = parseStockholmDateTime(r.startdate, r.starttime);
    const endMs = parseStockholmDateTime(r.enddate, r.endtime);
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) continue;
    parsedBookings.push({ start: startMs, end: endMs });
  }

  parsedBookings.sort((a, b) => a.start - b.start);

  // Ongoing booking right now (including multi-day events) -> BUSY (Red)
  const ongoing = parsedBookings.find((b) => nowMs >= b.start && nowMs < b.end);
  if (ongoing) {
    return { room, status: "BUSY", isFree: false, freeMinutesRemaining: 0 };
  }

  // Find next upcoming booking today
  const nextBooking = parsedBookings.find((b) => b.start > nowMs);
  if (nextBooking) {
    const diffMins = Math.floor((nextBooking.start - nowMs) / 60000);
    // If next booking starts within 240 mins (<= 4h) -> ENDING_SOON (Yellow)
    if (diffMins <= 240) {
      return { room, status: "ENDING_SOON", isFree: true, freeMinutesRemaining: diffMins };
    }
    // Available now with > 4h remaining -> FREE (Green)
    return { room, status: "FREE", isFree: true, freeMinutesRemaining: diffMins };
  }

  // Free all day -> FREE (Green)
  return { room, status: "FREE", isFree: true, freeMinutesRemaining: 9999 };
}

function getSortedRooms(scheduleData, nowMs = Date.now()) {
  const reservations = scheduleData?.reservations || [];
  const evaluated = LAB_CATALOG.map((room) => evaluateRoomAvailability(room, reservations, nowMs));

  // Sort Priority:
  // Tier 1: >= 10 pcs and Available (FREE / ENDING_SOON) -> A-Z
  // Tier 2: < 10 pcs and Available (FREE / ENDING_SOON) -> A-Z
  // Tier 3: >= 10 pcs and Booked (BUSY) -> A-Z
  // Tier 4: < 10 pcs and Booked (BUSY) -> A-Z
  evaluated.sort((a, b) => {
    const score = (item) => {
      const hasMany = item.room.computers >= 10;
      const isAvailable = item.isFree;
      if (isAvailable && hasMany) return 1;
      if (isAvailable && !hasMany) return 2;
      if (!isAvailable && hasMany) return 3;
      return 4;
    };

    const sA = score(a);
    const sB = score(b);
    if (sA !== sB) return sA - sB;

    return a.room.name.localeCompare(b.room.name, "sv");
  });

  return evaluated;
}

// =============================================================================
// WIDGET BUILDER (3-COLUMN DENSE LAYOUT)
// =============================================================================
async function createWidget() {
  const scheduleData = await fetchSchedule();
  const sortedRooms = getSortedRooms(scheduleData, Date.now());

  const w = new ListWidget();
  w.backgroundColor = new Color("#080e18");
  w.setPadding(3, 5, 3, 5);
  w.url = APP_URL;

  // Header Title
  const title = w.addText("LiU Salar");
  title.font = Font.boldSystemFont(9);
  title.textColor = new Color("#e2e8f0");

  w.addSpacer(2);

  // Show all 42 rooms in 3 columns (14 per column)
  const displayRooms = sortedRooms.slice(0, 42);

  // Split into 3 columns (14 rooms per column)
  const chunkSize = Math.ceil(displayRooms.length / 3);
  const col1Rooms = displayRooms.slice(0, chunkSize);
  const col2Rooms = displayRooms.slice(chunkSize, chunkSize * 2);
  const col3Rooms = displayRooms.slice(chunkSize * 2);

  const grid = w.addStack();
  grid.layoutHorizontally();
  grid.spacing = 3;

  const renderColumn = (colStack, rooms) => {
    colStack.layoutVertically();
    colStack.spacing = 0.2;

    for (const item of rooms) {
      // OS prefix: W for Windows, L for Linux
      const osPrefix = item.room.os === "windows" ? "W" : "L";
      const baseLabel = `${osPrefix}|${item.room.name}`;

      // If yellow, format as W|Room|40m or L|Room|1.4h
      const labelText =
        item.status === "ENDING_SOON"
          ? `${baseLabel}|${formatRemaining(item.freeMinutesRemaining)}`
          : baseLabel;

      const txt = colStack.addText(labelText);
      txt.font = Font.boldSystemFont(6);

      // Color mapping:
      // Green = Free (> 4h or all day)
      // Yellow = Ending soon (≤ 240m)
      // Red = Booked / busy
      if (item.status === "FREE") {
        txt.textColor = new Color("#34d399"); // Green
      } else if (item.status === "ENDING_SOON") {
        txt.textColor = new Color("#fbbf24"); // Yellow
      } else {
        txt.textColor = new Color("#ff5252"); // Red
      }
    }
  };

  const col1 = grid.addStack();
  renderColumn(col1, col1Rooms);

  const col2 = grid.addStack();
  renderColumn(col2, col2Rooms);

  const col3 = grid.addStack();
  renderColumn(col3, col3Rooms);

  return w;
}

// =============================================================================
// RUN / PREVIEW
// =============================================================================
if (typeof config !== "undefined") {
  let widget = await createWidget();

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    widget.presentSmall();
  }

  widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  Script.complete();
} else if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LAB_CATALOG,
    evaluateRoomAvailability,
    getSortedRooms,
    parseStockholmDateTime,
    formatRemaining
  };
}
