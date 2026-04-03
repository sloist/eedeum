const SUPABASE_URL = "https://scmcmdcglkwssntaipgv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbWNtZGNnbGt3c3NudGFpcGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5MzUwMiwiZXhwIjoyMDkwMjY5NTAyfQ.DevysP2b7jwucrcegt0BUM-4E1WiPKjsuxDuSLQmF18";

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function post(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST", headers, body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) { console.error(`❌ ${table}:`, json); return null; }
  return json;
}

// 1. Users
const users = await post("users", [
  { name: "문수", avatar_emoji: "🌿", handle: "@munsu.reads", bio: "맑음을 추구하는 사람" },
  { name: "윤서", avatar_emoji: "🌿", handle: "@yoonseo.reads", bio: "밤에 읽는 사람" },
  { name: "재현", avatar_emoji: "📖", handle: "@jh.pages", bio: "문장 수집가" },
  { name: "하은", avatar_emoji: "🍂", handle: "@haeun.ink", bio: "여행과 책 사이" },
  { name: "민준", avatar_emoji: "🌙", handle: "@minjun.lit", bio: "밤하늘 아래 독서" },
  { name: "소율", avatar_emoji: "☕", handle: "@soyul.bookmark", bio: "커피와 함께 한 줄" },
  { name: "도현", avatar_emoji: "🎧", handle: "@dohyun.reads", bio: "음악처럼 읽는다" },
]);
if (!users) process.exit(1);
console.log(`✅ ${users.length} users created`);

const uid = {};
users.forEach(u => { uid[u.handle] = u.id; });

// 2. Books
const books = await post("books", [
  { title: "아몬드", author: "손원평", cover_color: "#8B7355", topics: ["위로","성장"] },
  { title: "데미안", author: "헤르만 헤세", cover_color: "#6B5B4A", topics: ["성장","철학"] },
  { title: "불편한 편의점", author: "김호연", cover_color: "#6B5A7B", topics: ["위로","관계"] },
  { title: "소년이 온다", author: "한강", cover_color: "#4A5A6B", topics: ["사랑","위로"] },
  { title: "여행의 이유", author: "김영하", cover_color: "#5A6B55", topics: ["여행","철학"] },
  { title: "나는 나로 살기로 했다", author: "김수현", cover_color: "#8B7B55", topics: ["성장","심리"] },
  { title: "달러구트 꿈 백화점", author: "이미예", cover_color: "#5A6B6B", topics: ["위로","예술"] },
  { title: "작별하지 않는다", author: "한강", cover_color: "#7B5A5A", topics: ["사랑","위로"] },
  { title: "피프티 피플", author: "정세랑", cover_color: "#6B6B5A", topics: ["관계","사랑"] },
  { title: "미드나잇 라이브러리", author: "매트 헤이그", cover_color: "#5A5A7B", topics: ["철학","위로"] },
  { title: "채식주의자", author: "한강", cover_color: "#4A6B5A", topics: ["예술","심리"] },
  { title: "해변의 카프카", author: "무라카미 하루키", cover_color: "#7B6B4A", topics: ["여행","철학"] },
  { title: "코스모스", author: "칼 세이건", cover_color: "#4A5A7B", topics: ["철학","성장"] },
  { title: "어린 왕자", author: "생텍쥐페리", cover_color: "#7B5A7B", topics: ["사랑","철학"] },
  { title: "82년생 김지영", author: "조남주", cover_color: "#6B5A5A", topics: ["관계","심리"] },
  { title: "언어의 온도", author: "이기주", cover_color: "#5A7B6B", topics: ["위로","관계"] },
]);
if (!books) process.exit(1);
console.log(`✅ ${books.length} books created`);

const bid = {};
books.forEach(b => { bid[b.title] = b.id; });

// 3. Underlines
const underlines = await post("underlines", [
  { user_id: uid["@yoonseo.reads"], book_id: bid["아몬드"], quote: "감정을 모른다는 건, 세상이 조용하다는 뜻이었다.", page: 84, feeling: "말이 없어도 이해받는 순간이 있다는 걸 알게 됐다" },
  { user_id: uid["@jh.pages"], book_id: bid["데미안"], quote: "새는 알에서 나오려고 투쟁한다.", page: 56, feeling: "스무 살에 읽었으면 몰랐을 문장" },
  { user_id: uid["@haeun.ink"], book_id: bid["여행의 이유"], quote: "여행은 나를 낯선 나에게 데려다준다.", page: 34, feeling: "지금 떠나고 싶어진 건 이 문장 때문" },
  { user_id: uid["@minjun.lit"], book_id: bid["불편한 편의점"], quote: "사람은 누구나 자기만의 사정이 있다.", page: 145, feeling: "편의점 알바하던 시절이 생각났다" },
  { user_id: uid["@soyul.bookmark"], book_id: bid["나는 나로 살기로 했다"], quote: "비교는 기쁨을 훔치는 도둑이다.", page: 23, feeling: "매일 아침 읽는 문장이 됐다" },
  { user_id: uid["@dohyun.reads"], book_id: bid["소년이 온다"], quote: "죽은 뒤에도 부끄럽지 않을 하루를 살고 싶었다.", page: 67, feeling: "한참을 덮어두고 있었다" },
  { user_id: uid["@yoonseo.reads"], book_id: bid["어린 왕자"], quote: "가장 중요한 것은 눈에 보이지 않아.", page: 42, feeling: "어릴 때는 그냥 동화인 줄 알았다" },
  { user_id: uid["@soyul.bookmark"], book_id: bid["언어의 온도"], quote: "말에도 온도가 있다. 같은 말이라도 따뜻할 수 있고 차가울 수 있다.", page: 88, feeling: "오늘 누군가에게 따뜻한 말을 건네고 싶어졌다" },
  // 같은 책 다른 밑줄들
  { user_id: uid["@haeun.ink"], book_id: bid["아몬드"], quote: "곤이는 웃지 않았다. 울지도 않았다.", page: 12, feeling: null },
  { user_id: uid["@minjun.lit"], book_id: bid["아몬드"], quote: "나는 괴물이 아니라 아몬드였다.", page: 203, feeling: null },
  { user_id: uid["@dohyun.reads"], book_id: bid["아몬드"], quote: "사람들은 감정이 없는 게 아니라 감정을 모르는 거였다.", page: 91, feeling: null },
  { user_id: uid["@soyul.bookmark"], book_id: bid["데미안"], quote: "나는 다만 내 안에서 저절로 솟아나오려는 것을 살아보려 했을 뿐이다.", page: 7, feeling: null },
  { user_id: uid["@haeun.ink"], book_id: bid["데미안"], quote: "운명이란 것은 존재한다. 하지만 그것은 우리 안에 있다.", page: 112, feeling: null },
  { user_id: uid["@yoonseo.reads"], book_id: bid["여행의 이유"], quote: "우리는 여행할 때 비로소 자신에게 질문을 던진다.", page: 78, feeling: null },
]);
if (!underlines) process.exit(1);
console.log(`✅ ${underlines.length} underlines created`);

// 4. Echoes (공감)
const ulid = {};
underlines.forEach(u => {
  const key = u.quote.replace(/\s+/g, '').slice(0,8);
  ulid[key] = u.id;
});
// Debug: show keys
console.log("   underline keys:", Object.keys(ulid));

const findUl = (prefix) => {
  const clean = prefix.replace(/\s+/g, '').slice(0,8);
  return ulid[clean] || null;
};

const echoData = [
  { quote: "감정을 모른다는", user: "@jh.pages", text: "이 문장 앞에서 한참 멈췄어요" },
  { quote: "감정을 모른다는", user: "@soyul.bookmark", text: "조용한 세상이 꼭 나쁜 건 아니더라고요" },
  { quote: "새는 알에서 나오", user: "@yoonseo.reads", text: "서른이 되어서야 이 문장이 보이더라고요" },
  { quote: "여행은 나를 낯선", user: "@minjun.lit", text: "낯선 내가 더 솔직하더라고요" },
  { quote: "여행은 나를 낯선", user: "@jh.pages", text: "공항에서 이 책 읽었는데, 타이밍이 완벽했어요" },
  { quote: "여행은 나를 낯선", user: "@dohyun.reads", text: "여행 안 가도 이 문장이 데려다줘요" },
  { quote: "사람은 누구나 자", user: "@haeun.ink", text: "이 한 줄이 소설 전체를 품고 있는 것 같아요" },
  { quote: "비교는 기쁨을 훔", user: "@yoonseo.reads", text: "냉장고에 붙여놨어요" },
  { quote: "비교는 기쁨을 훔", user: "@minjun.lit", text: "도둑이라는 표현이 정확하다" },
  { quote: "죽은 뒤에도 부끄", user: "@soyul.bookmark", text: "이 문장은 소리 내어 읽었어요" },
  { quote: "죽은 뒤에도 부끄", user: "@jh.pages", text: "부끄럽지 않은 하루라는 말이 무겁습니다" },
  { quote: "가장 중요한 것은", user: "@soyul.bookmark", text: "매년 다시 읽게 되는 문장" },
  { quote: "말에도 온도가 있", user: "@haeun.ink", text: "이 책 읽고 문자 보내는 습관이 바뀌었어요" },
];

// Map echoes to underline IDs by matching quote prefix
const echoRows = echoData.map(e => {
  const ul = underlines.find(u => u.quote.startsWith(e.quote));
  if (!ul) { console.log(`⚠ No underline match for: ${e.quote}`); return null; }
  return { underline_id: ul.id, user_id: uid[e.user], text: e.text };
}).filter(Boolean);

const echoes = await post("echoes", echoRows);
if (!echoes) process.exit(1);
console.log(`✅ ${echoes.length} echoes created`);

// 5. Some follows
const follows = await post("follows", [
  { follower_id: uid["@munsu.reads"], following_id: uid["@yoonseo.reads"] },
  { follower_id: uid["@munsu.reads"], following_id: uid["@jh.pages"] },
  { follower_id: uid["@munsu.reads"], following_id: uid["@soyul.bookmark"] },
  { follower_id: uid["@yoonseo.reads"], following_id: uid["@munsu.reads"] },
  { follower_id: uid["@jh.pages"], following_id: uid["@yoonseo.reads"] },
  { follower_id: uid["@haeun.ink"], following_id: uid["@munsu.reads"] },
]);
if (!follows) process.exit(1);
console.log(`✅ ${follows.length} follows created`);

console.log("\n🎉 Seed complete!");
