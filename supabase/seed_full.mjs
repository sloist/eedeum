import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── New Users ───
const USERS = [
  { email: "soyeon@eedeum.com", name: "소연", handle: "soyeon.page", bio: "천천히 읽고 오래 남기는 사람", avatar: "🌙" },
  { email: "minjae@eedeum.com", name: "민재", handle: "minjae.ink", bio: "밑줄 긋는 버릇이 있습니다", avatar: "📝" },
  { email: "yuna@eedeum.com", name: "유나", handle: "yuna.reads", bio: "문장 하나에 하루가 바뀌기도", avatar: "🍂" },
  { email: "doha@eedeum.com", name: "도하", handle: "doha.note", bio: "읽는 것과 쓰는 것 사이", avatar: "☕" },
  { email: "haeun@eedeum.com", name: "하은", handle: "haeun.line", bio: "조용한 문장을 좋아합니다", avatar: "🌿" },
];

// ─── Records: 100+ quotes with feelings ───
const RECORDS = [
  { book: "아몬드", author: "손원평", quote: "괴물이 되지 않으려면 끊임없이 스스로에게 물어야 한다.", feeling: "이 문장이 계속 맴돈다" },
  { book: "아몬드", author: "손원평", quote: "눈물이 나지 않는다고 슬프지 않은 건 아니다.", feeling: null },
  { book: "아몬드", author: "손원평", quote: "세상에는 말로 설명할 수 없는 감정이 너무 많다.", feeling: "그래서 기록하는 건지도" },
  { book: "데미안", author: "헤르만 헤세", quote: "나는 내 안에서 솟아나오려는 것을 살아보려 했을 뿐이다.", feeling: "살아보려 했을 뿐이라는 말이 좋다" },
  { book: "데미안", author: "헤르만 헤세", quote: "한 사람 한 사람의 삶은 자기 자신에게로 이르는 길이다.", feeling: null },
  { book: "데미안", author: "헤르만 헤세", quote: "깨어나는 자는 두려움 없이 자기 운명에 다가간다.", feeling: "두려움 없이가 아니라 두려움을 안고" },
  { book: "불편한 편의점", author: "김호연", quote: "때로는 가만히 곁에 있는 것만으로 충분할 때가 있다.", feeling: "곁에 있다는 것의 무게" },
  { book: "불편한 편의점", author: "김호연", quote: "모든 사람에게는 보이지 않는 이유가 있다.", feeling: null },
  { book: "불편한 편의점", author: "김호연", quote: "편의점 불빛처럼 언제나 켜져 있는 따뜻함이 있다.", feeling: "그런 사람이 되고 싶다" },
  { book: "82년생 김지영", author: "조남주", quote: "당연한 것은 아무것도 없었다.", feeling: "당연함을 의심하기 시작하면" },
  { book: "82년생 김지영", author: "조남주", quote: "그녀는 괜찮지 않았다. 한 번도 괜찮은 적이 없었다.", feeling: null },
  { book: "82년생 김지영", author: "조남주", quote: "누군가의 일상이 누군가에게는 투쟁이었다.", feeling: "이 한 줄이 모든 걸 말해준다" },
  { book: "여행의 이유", author: "김영하", quote: "여행자는 불완전한 관찰자이고, 그래서 자유롭다.", feeling: null },
  { book: "여행의 이유", author: "김영하", quote: "우리는 결국 어딘가로 가기 위해서가 아니라 돌아오기 위해 떠난다.", feeling: "돌아온 뒤에야 떠난 이유를 알게 된다" },
  { book: "여행의 이유", author: "김영하", quote: "낯선 곳에서 나는 비로소 나 자신을 만난다.", feeling: null },
  { book: "코스모스", author: "칼 세이건", quote: "우주는 우리 안에 있다. 우리는 별의 물질로 만들어졌다.", feeling: "작아지는 느낌이 오히려 편하다" },
  { book: "코스모스", author: "칼 세이건", quote: "광대한 우주에서 우리는 티끌에 불과하지만, 생각하는 티끌이다.", feeling: null },
  { book: "코스모스", author: "칼 세이건", quote: "과학은 겸손의 학문이다.", feeling: "겸손이라는 단어가 이렇게 쓰일 줄" },
  { book: "나는 나로 살기로 했다", author: "김수현", quote: "타인의 기준을 벗어나는 순간 비로소 내 삶이 시작된다.", feeling: null },
  { book: "나는 나로 살기로 했다", author: "김수현", quote: "완벽하지 않아도 괜찮다는 걸 받아들이는 데 오래 걸렸다.", feeling: "아직도 받아들이는 중" },
  { book: "나는 나로 살기로 했다", author: "김수현", quote: "비교는 기쁨을 훔치는 도둑이다.", feeling: null },
  { book: "연금술사", author: "파울로 코엘료", quote: "사람이 무언가를 원할 때 온 우주가 그 소원을 이루도록 돕는다.", feeling: "결국 움직여야 한다는 뜻이기도" },
  { book: "연금술사", author: "파울로 코엘료", quote: "자신의 운명을 깨닫지 못하는 것이야말로 유일한 실패다.", feeling: null },
  { book: "연금술사", author: "파울로 코엘료", quote: "가장 어두운 시간은 새벽이 오기 직전이다.", feeling: "오래된 문장인데 여전히 위로가 된다" },
  { book: "위대한 개츠비", author: "F. 스콧 피츠제럴드", quote: "우리는 쉬지 않고 과거로 떠밀려가는 보트와 같다.", feeling: null },
  { book: "위대한 개츠비", author: "F. 스콧 피츠제럴드", quote: "희망은 초록빛 불빛처럼 언제나 저 건너편에 있었다.", feeling: "닿을 수 없는 것에 대한 아름다움" },
  { book: "어린 왕자", author: "앙투안 드 생텍쥐페리", quote: "가장 중요한 것은 눈에 보이지 않아.", feeling: "어른이 되어서야 이해되는 문장" },
  { book: "어린 왕자", author: "앙투안 드 생텍쥐페리", quote: "네가 장미를 위해 들인 시간이 장미를 소중하게 만든 거야.", feeling: null },
  { book: "어린 왕자", author: "앙투안 드 생텍쥐페리", quote: "길들인다는 건 관계를 맺는다는 뜻이야.", feeling: "관계의 무게를 다시 생각하게 된다" },
  { book: "1984", author: "조지 오웰", quote: "과거를 지배하는 자가 미래를 지배한다.", feeling: null },
  { book: "1984", author: "조지 오웰", quote: "모든 동물은 평등하다. 그러나 어떤 동물은 더 평등하다.", feeling: "이 문장 앞에서 할 말이 없다" },
  { book: "미움받을 용기", author: "기시미 이치로", quote: "인생의 의미는 당신 스스로 자신에게 부여하는 것이다.", feeling: null },
  { book: "미움받을 용기", author: "기시미 이치로", quote: "남의 과제에 함부로 끼어들지 말고, 자신의 과제에 집중하라.", feeling: "과제의 분리. 쉽지 않지만." },
  { book: "미움받을 용기", author: "기시미 이치로", quote: "행복해지려면 용기가 필요하다.", feeling: null },
  { book: "모모", author: "미하엘 엔데", quote: "사람들이 시간을 절약할수록 삶은 더 메말라갔다.", feeling: "요즘 매일 느끼는 것" },
  { book: "모모", author: "미하엘 엔데", quote: "모모는 남의 이야기를 잘 들어주는 것만으로 세상을 바꿨다.", feeling: null },
  { book: "해변의 카프카", author: "무라카미 하루키", quote: "폭풍이 지나면 너는 이전의 너와 같은 사람이 아닐 것이다.", feeling: "지나고 나서야 달라졌다는 걸 안다" },
  { book: "해변의 카프카", author: "무라카미 하루키", quote: "세상에서 가장 단단한 사람은 가장 유연한 사람이다.", feeling: null },
  { book: "해변의 카프카", author: "무라카미 하루키", quote: "때때로 운명은 근처 가게에 들르듯 찾아온다.", feeling: "이 비유가 좋다" },
  { book: "참을 수 없는 존재의 가벼움", author: "밀란 쿤데라", quote: "한 번뿐인 삶은 아무것도 확인할 수 없는 삶이다.", feeling: null },
  { book: "참을 수 없는 존재의 가벼움", author: "밀란 쿤데라", quote: "무거움은 진정 끔찍한 것이고, 가벼움은 아름다운 것인가?", feeling: "가벼움과 무거움 사이에서" },
  { book: "죽고 싶지만 떡볶이는 먹고 싶어", author: "백세희", quote: "괜찮지 않아도 괜찮다.", feeling: "짧은데 큰 위로" },
  { book: "죽고 싶지만 떡볶이는 먹고 싶어", author: "백세희", quote: "나의 감정은 틀린 것이 아니다. 다만 조금 다를 뿐이다.", feeling: null },
  { book: "멋진 신세계", author: "올더스 헉슬리", quote: "사람들은 편안함이라는 감옥에 자발적으로 들어간다.", feeling: "지금 이 시대에 더 와닿는" },
  { book: "멋진 신세계", author: "올더스 헉슬리", quote: "행복만을 추구하면 진실을 잃는다.", feeling: null },
  { book: "사피엔스", author: "유발 하라리", quote: "호모 사피엔스의 성공 비결은 허구를 믿는 능력이었다.", feeling: null },
  { book: "사피엔스", author: "유발 하라리", quote: "농업 혁명은 역사상 최대의 사기였다.", feeling: "이 관점이 신선했다" },
  { book: "사피엔스", author: "유발 하라리", quote: "우리는 행복해지려고 발전한 것이 아니다.", feeling: null },
  { book: "보이지 않는 도시들", author: "이탈로 칼비노", quote: "지옥은 먼 곳에 있지 않다. 매일의 삶 속에 있다.", feeling: null },
  { book: "보이지 않는 도시들", author: "이탈로 칼비노", quote: "기억의 도시는 실제의 도시보다 아름답다.", feeling: "기억이 편집하는 것들" },
  { book: "나미야 잡화점의 기적", author: "히가시노 게이고", quote: "상담이란 결국 자신 안에 답이 있다는 걸 확인하는 과정이다.", feeling: null },
  { book: "나미야 잡화점의 기적", author: "히가시노 게이고", quote: "누군가에게 보낸 정성은 반드시 어딘가에서 돌아온다.", feeling: "믿고 싶은 말" },
  { book: "채식주의자", author: "한강", quote: "나는 더 이상 꿈을 꾸지 않았다. 나 자체가 꿈이 되었다.", feeling: null },
  { book: "채식주의자", author: "한강", quote: "보통의 삶이라는 것은 존재하지 않는다.", feeling: "한강의 문장은 언제나 날카롭다" },
  { book: "채식주의자", author: "한강", quote: "조용히 무너지는 것을 아무도 알아채지 못했다.", feeling: null },
  { book: "언어의 온도", author: "이기주", quote: "말에는 온도가 있다. 같은 말이라도 따뜻할 수 있고 차가울 수 있다.", feeling: "말의 온도를 의식하기 시작했다" },
  { book: "언어의 온도", author: "이기주", quote: "침묵도 하나의 언어다.", feeling: null },
  { book: "언어의 온도", author: "이기주", quote: "좋은 대화는 서로의 침묵을 견딜 수 있을 때 시작된다.", feeling: null },
  { book: "달러구트 꿈 백화점", author: "이미예", quote: "잠드는 순간 가장 솔직해진다.", feeling: "꿈에서는 거짓말을 못 하니까" },
  { book: "달러구트 꿈 백화점", author: "이미예", quote: "사람들은 저마다 다른 꿈을 꾸고, 그래서 아름답다.", feeling: null },
  { book: "소년이 온다", author: "한강", quote: "기억하는 것이 의무라고 생각했다.", feeling: "무거운 책이었다" },
  { book: "소년이 온다", author: "한강", quote: "눈을 감으면 그날의 소리가 들린다.", feeling: null },
  { book: "피프티 피플", author: "정세랑", quote: "사람은 한 문장으로 설명할 수 없다.", feeling: null },
  { book: "피프티 피플", author: "정세랑", quote: "모든 사람에게는 보이지 않는 서사가 있다.", feeling: "스쳐 지나가는 사람들을 다시 보게 된다" },
  { book: "미드나잇 라이브러리", author: "매트 헤이그", quote: "후회하지 않는 삶은 없지만, 살아 있는 삶은 있다.", feeling: null },
  { book: "미드나잇 라이브러리", author: "매트 헤이그", quote: "가능성은 무한하지만, 당신은 하나의 삶만 살면 된다.", feeling: "이 문장에서 한참 멈췄다" },
  { book: "미드나잇 라이브러리", author: "매트 헤이그", quote: "완벽한 삶은 없다. 다만 충분한 삶은 있다.", feeling: null },
  { book: "작별하지 않는다", author: "한강", quote: "기억은 때로 눈처럼 쌓인다.", feeling: "한강의 비유는 항상 조용하다" },
  { book: "작별하지 않는다", author: "한강", quote: "떠난 사람을 기억하는 것이 남은 사람의 일이다.", feeling: null },
];

// ─── Weaves ───
const WEAVES = [
  { title: "조용히 무너지는 것들", desc: "한강의 문장에서 발견한 균열들", color: "#5A6B55", bookFilter: ["채식주의자", "소년이 온다", "작별하지 않는다"] },
  { title: "여행자의 문장 수첩", desc: "떠나야만 보이는 것들", color: "#4A5A6B", bookFilter: ["여행의 이유", "코스모스", "보이지 않는 도시들"] },
  { title: "괜찮지 않아도 괜찮다", desc: "위로가 된 문장들을 모았습니다", color: "#7B5A6B", bookFilter: ["죽고 싶지만 떡볶이는 먹고 싶어", "미움받을 용기", "나는 나로 살기로 했다"] },
  { title: "시간이 지나도 남는 것", desc: null, color: "#6B5B4A", bookFilter: ["어린 왕자", "모모", "데미안"] },
  { title: "읽는 것과 사는 것 사이", desc: "문장이 삶에 스며든 순간들", color: "#5A6B6B", bookFilter: ["불편한 편의점", "82년생 김지영", "언어의 온도"] },
];

const ECHO_TEXTS = [
  "나도 여기서 멈췄어요",
  "이 문장이 계속 생각나요",
  "오늘 딱 필요한 문장이었습니다",
  "같은 곳에서 멈춘 사람이 있다니",
  "밑줄 또 긋고 갑니다",
  "조용히 담아둡니다",
  "이 책 덕분에 하루가 바뀌었어요",
  "몇 번을 읽어도 새로운 문장",
];

async function seed() {
  console.log("=== Creating users ===");
  const userIds = [];
  for (const u of USERS) {
    const { data: auth, error } = await supabase.auth.admin.createUser({
      email: u.email, password: "seed-2026!", email_confirm: true,
    });
    if (error) { console.log(`  Skip ${u.name}: ${error.message}`); continue; }
    await supabase.from("users").insert({
      id: auth.user.id, name: u.name, handle: u.handle, bio: u.bio, avatar_emoji: u.avatar,
    });
    userIds.push(auth.user.id);
    console.log(`  Created: ${u.name} (${auth.user.id})`);
  }

  // Also include existing users
  const { data: existingUsers } = await supabase.from("users").select("id").not("id", "eq", "9b080172-cbfb-4181-bfcc-eb5c5b3931d9"); // exclude editor
  const allUserIds = [...new Set([...userIds, ...(existingUsers ?? []).map(u => u.id)])];
  console.log(`  Total users for seeding: ${allUserIds.length}`);

  console.log("\n=== Getting/creating books ===");
  const bookMap = {};
  const { data: existingBooks } = await supabase.from("books").select("id, title");
  for (const b of existingBooks ?? []) bookMap[b.title] = b.id;

  const uniqueBooks = [...new Set(RECORDS.map(r => JSON.stringify({ title: r.book, author: r.author })))].map(s => JSON.parse(s));
  for (const b of uniqueBooks) {
    if (!bookMap[b.title]) {
      const { data } = await supabase.from("books").insert({ title: b.title, author: b.author }).select("id").single();
      if (data) { bookMap[b.title] = data.id; console.log(`  Created: ${b.title}`); }
    }
  }

  console.log("\n=== Creating records ===");
  const underlineIds = [];
  let recordCount = 0;
  for (const r of RECORDS) {
    const bookId = bookMap[r.book];
    if (!bookId) continue;
    const userId = allUserIds[Math.floor(Math.random() * allUserIds.length)];
    const page = Math.floor(Math.random() * 300) + 1;

    const { data, error } = await supabase.from("underlines").insert({
      user_id: userId, book_id: bookId, quote: r.quote, page, feeling: r.feeling,
    }).select("id").single();

    if (error) { console.log(`  Error: ${r.quote.slice(0, 30)}... ${error.message}`); continue; }
    underlineIds.push({ id: data.id, userId, bookTitle: r.book });
    recordCount++;
  }
  console.log(`  Created: ${recordCount} records`);

  console.log("\n=== Adding likes ===");
  let likeCount = 0;
  for (const ul of underlineIds) {
    const numLikes = Math.floor(Math.random() * 6); // 0-5
    const likers = [...allUserIds].sort(() => Math.random() - 0.5).slice(0, numLikes);
    for (const likerId of likers) {
      if (likerId === ul.userId) continue;
      await supabase.from("likes").insert({ user_id: likerId, underline_id: ul.id });
      likeCount++;
    }
  }
  console.log(`  Created: ${likeCount} likes`);

  console.log("\n=== Adding echoes (comments) ===");
  let echoCount = 0;
  for (const ul of underlineIds) {
    const numEchoes = Math.floor(Math.random() * 4); // 0-3
    const commenters = [...allUserIds].sort(() => Math.random() - 0.5).slice(0, numEchoes);
    for (const commenterId of commenters) {
      if (commenterId === ul.userId) continue;
      const text = ECHO_TEXTS[Math.floor(Math.random() * ECHO_TEXTS.length)];
      await supabase.from("echoes").insert({
        underline_id: ul.id, user_id: commenterId, text, is_same_line: Math.random() > 0.7,
      });
      echoCount++;
    }
  }
  console.log(`  Created: ${echoCount} echoes`);

  console.log("\n=== Adding saves ===");
  let saveCount = 0;
  for (const ul of underlineIds) {
    const numSaves = Math.floor(Math.random() * 3);
    const savers = [...allUserIds].sort(() => Math.random() - 0.5).slice(0, numSaves);
    for (const saverId of savers) {
      await supabase.from("saves").insert({ user_id: saverId, underline_id: ul.id });
      saveCount++;
    }
  }
  console.log(`  Created: ${saveCount} saves`);

  console.log("\n=== Creating weaves ===");
  for (const w of WEAVES) {
    const ownerId = allUserIds[Math.floor(Math.random() * allUserIds.length)];
    const { data: weave } = await supabase.from("weaves").insert({
      user_id: ownerId, title: w.title, description: w.desc, cover_color: w.color, is_public: true,
    }).select("id").single();

    if (!weave) continue;

    // Find underlines from matching books
    const matchingUls = underlineIds.filter(ul => w.bookFilter.includes(ul.bookTitle));
    const picked = matchingUls.sort(() => Math.random() - 0.5).slice(0, Math.min(6, matchingUls.length));

    for (let i = 0; i < picked.length; i++) {
      await supabase.from("weave_blocks").insert({
        weave_id: weave.id, block_type: "underline", position: i * 2, underline_id: picked[i].id,
      });
      // Add a note block between some
      if (i > 0 && i % 2 === 0) {
        const notes = ["읽으면서 멈춘 곳들", "이 문장들 사이에 무언가 흐른다", "시간이 지나도 남는 것들"];
        await supabase.from("weave_blocks").insert({
          weave_id: weave.id, block_type: "note", position: i * 2 - 1, content: notes[Math.floor(Math.random() * notes.length)],
        });
      }
    }
    console.log(`  Created weave: ${w.title} (${picked.length} blocks)`);
  }

  // Add follows between users
  console.log("\n=== Adding follows ===");
  let followCount = 0;
  for (const a of allUserIds) {
    const numFollows = Math.floor(Math.random() * 4) + 1;
    const targets = allUserIds.filter(b => b !== a).sort(() => Math.random() - 0.5).slice(0, numFollows);
    for (const b of targets) {
      await supabase.from("follows").insert({ follower_id: a, following_id: b });
      followCount++;
    }
  }
  console.log(`  Created: ${followCount} follows`);

  console.log("\n=== Done! ===");
}

seed();
