const SUPABASE_URL = "https://scmcmdcglkwssntaipgv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbWNtZGNnbGt3c3NudGFpcGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5MzUwMiwiZXhwIjoyMDkwMjY5NTAyfQ.DevysP2b7jwucrcegt0BUM-4E1WiPKjsuxDuSLQmF18";

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function get(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  if (!res.ok) { console.error(`GET ${table} failed:`, await res.text()); return []; }
  return res.json();
}

async function post(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST", headers, body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) { console.error(`POST ${table} failed:`, json); return null; }
  return json;
}

async function patch(table, query, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) { console.error(`PATCH ${table} failed:`, json); return null; }
  return json;
}

// ─── Fetch existing data ───────────────────────────

const users = await get("users", "select=id,handle");
const books = await get("books", "select=id,title");
const underlines = await get("underlines", "select=id,user_id,book_id,quote");
const echoes = await get("echoes", "select=id,underline_id,user_id,text");

console.log(`Fetched: ${users.length} users, ${books.length} books, ${underlines.length} underlines, ${echoes.length} echoes`);

if (!users.length || !books.length || !underlines.length) {
  console.error("Missing base data. Run migration_v2.sql first, and make sure v1 seed data exists.");
  process.exit(1);
}

const uid = {};
users.forEach(u => { uid[u.handle] = u.id; });

const bid = {};
books.forEach(b => { bid[b.title] = b.id; });

// ─── 1. user_books (보유 중인 책) ──────────────────

const userBooksData = [
  // 윤서: 아몬드(reading), 어린 왕자(finished), 여행의 이유(owned)
  { user_id: uid["@yoonseo.reads"], book_id: bid["아몬드"], status: "reading" },
  { user_id: uid["@yoonseo.reads"], book_id: bid["어린 왕자"], status: "finished" },
  { user_id: uid["@yoonseo.reads"], book_id: bid["여행의 이유"], status: "owned" },

  // 재현: 데미안(finished), 코스모스(reading)
  { user_id: uid["@jh.pages"], book_id: bid["데미안"], status: "finished" },
  { user_id: uid["@jh.pages"], book_id: bid["코스모스"], status: "reading" },

  // 하은: 여행의 이유(finished), 아몬드(reading), 데미안(owned), 해변의 카프카(reading)
  { user_id: uid["@haeun.ink"], book_id: bid["여행의 이유"], status: "finished" },
  { user_id: uid["@haeun.ink"], book_id: bid["아몬드"], status: "reading" },
  { user_id: uid["@haeun.ink"], book_id: bid["데미안"], status: "owned" },
  { user_id: uid["@haeun.ink"], book_id: bid["해변의 카프카"], status: "reading" },

  // 민준: 불편한 편의점(finished), 아몬드(finished), 미드나잇 라이브러리(reading)
  { user_id: uid["@minjun.lit"], book_id: bid["불편한 편의점"], status: "finished" },
  { user_id: uid["@minjun.lit"], book_id: bid["아몬드"], status: "finished" },
  { user_id: uid["@minjun.lit"], book_id: bid["미드나잇 라이브러리"], status: "reading" },

  // 소율: 나는 나로 살기로 했다(finished), 데미안(finished), 언어의 온도(reading), 달러구트 꿈 백화점(owned)
  { user_id: uid["@soyul.bookmark"], book_id: bid["나는 나로 살기로 했다"], status: "finished" },
  { user_id: uid["@soyul.bookmark"], book_id: bid["데미안"], status: "finished" },
  { user_id: uid["@soyul.bookmark"], book_id: bid["언어의 온도"], status: "reading" },
  { user_id: uid["@soyul.bookmark"], book_id: bid["달러구트 꿈 백화점"], status: "owned" },

  // 도현: 소년이 온다(finished), 아몬드(reading), 채식주의자(owned)
  { user_id: uid["@dohyun.reads"], book_id: bid["소년이 온다"], status: "finished" },
  { user_id: uid["@dohyun.reads"], book_id: bid["아몬드"], status: "reading" },
  { user_id: uid["@dohyun.reads"], book_id: bid["채식주의자"], status: "owned" },

  // 문수: 어린 왕자(finished), 82년생 김지영(reading), 피프티 피플(owned)
  { user_id: uid["@munsu.reads"], book_id: bid["어린 왕자"], status: "finished" },
  { user_id: uid["@munsu.reads"], book_id: bid["82년생 김지영"], status: "reading" },
  { user_id: uid["@munsu.reads"], book_id: bid["피프티 피플"], status: "owned" },
];

const userBooks = await post("user_books", userBooksData);
if (userBooks) {
  console.log(`user_books: ${userBooks.length} entries created`);
} else {
  console.error("Failed to create user_books");
}

// ─── 2. daily_quote (오늘의 한 줄) ─────────────────

// Pick a memorable underline for today's quote
const todayQuoteUnderline = underlines.find(u =>
  u.quote.includes("가장 중요한 것은 눈에 보이지 않아")
) || underlines[0];

const dailyQuote = await post("daily_quotes", [{
  underline_id: todayQuoteUnderline.id,
  display_date: new Date().toISOString().split("T")[0],
}]);

if (dailyQuote) {
  console.log(`daily_quotes: today's quote set -> "${todayQuoteUnderline.quote.slice(0, 30)}..."`);
} else {
  console.error("Failed to create daily_quote");
}

// ─── 3. Mark some echoes as is_same_line ───────────

// "나도 여기에 밑줄" - echoes where the user also underlined the same passage
// Find echoes where the echo author also has an underline on the same book
const sameLineEchoIds = [];

for (const echo of echoes) {
  // Find which underline this echo is on
  const parentUnderline = underlines.find(u => u.id === echo.underline_id);
  if (!parentUnderline) continue;

  // Check if the echo author also has an underline on the same book
  const authorAlsoUnderlined = underlines.some(u =>
    u.user_id === echo.user_id && u.book_id === parentUnderline.book_id
  );

  if (authorAlsoUnderlined) {
    sameLineEchoIds.push(echo.id);
  }
}

if (sameLineEchoIds.length > 0) {
  // Patch each one (batch update by ID list)
  const idFilter = sameLineEchoIds.map(id => `"${id}"`).join(",");
  const updated = await patch("echoes", `id=in.(${idFilter})`, { is_same_line: true });
  if (updated) {
    console.log(`echoes: ${updated.length} marked as is_same_line=true`);
  } else {
    console.error("Failed to update echoes is_same_line");
  }
} else {
  console.log("echoes: no matching is_same_line candidates found");
}

console.log("\nSeed v2 complete!");
