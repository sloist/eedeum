/**
 * 이듬 에디터 시드 콘텐츠
 *
 * 사용법:
 * 1. Supabase에 "이듬 에디터" 유저를 먼저 만들기 (가입 또는 수동 삽입)
 * 2. 아래 EDITOR_USER_ID를 해당 유저 ID로 교체
 * 3. SUPABASE_URL, SUPABASE_SERVICE_KEY 환경변수 설정
 * 4. node supabase/seed_editorial.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const EDITOR_USER_ID = "9b080172-cbfb-4181-bfcc-eb5c5b3931d9";

const SEED_DATA = [
  {
    bookTitle: "데미안",
    bookAuthor: "헤르만 헤세",
    quote: "새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.",
    feeling: "무언가를 시작하기 전, 지금 있는 곳을 깨야 한다는 것.",
    page: 107,
  },
  {
    bookTitle: "아몬드",
    bookAuthor: "손원평",
    quote: "괴물은 태어나는 게 아니라 만들어지는 거야.",
    page: 156,
  },
  {
    bookTitle: "나미야 잡화점의 기적",
    bookAuthor: "히가시노 게이고",
    quote: "때로는 아무것도 하지 않는 것이 무언가를 하는 것보다 용기가 필요하다.",
    page: 89,
  },
  {
    bookTitle: "어린 왕자",
    bookAuthor: "앙투안 드 생텍쥐페리",
    quote: "사막이 아름다운 것은 어딘가에 샘을 숨기고 있기 때문이야.",
    feeling: "보이지 않는 것을 믿는 연습.",
    page: 76,
  },
  {
    bookTitle: "1984",
    bookAuthor: "조지 오웰",
    quote: "자유란 2 더하기 2가 4라고 말할 수 있는 자유다.",
    page: 84,
  },
  {
    bookTitle: "미움받을 용기",
    bookAuthor: "기시미 이치로",
    quote: "다른 사람의 기대를 만족시키기 위해 사는 것은 자기 자신에게 거짓말을 하는 것이다.",
    feeling: "사실 이미 알고 있었는데, 용기가 없었을 뿐.",
    page: 142,
  },
  {
    bookTitle: "모모",
    bookAuthor: "미하엘 엔데",
    quote: "시간을 절약하느라 잃어버린 것은 다름 아닌 시간이었다.",
    page: 67,
  },
  {
    bookTitle: "해변의 카프카",
    bookAuthor: "무라카미 하루키",
    quote: "폭풍이 끝나면 네가 어떻게 그것을 헤치고 살아남았는지 기억도 나지 않을 거야. 정말 그것이 끝나긴 한 건지조차 확신할 수 없을 거야. 하지만 한 가지 분명한 건, 그 폭풍에서 빠져나왔을 때 너는 폭풍 속으로 들어갔을 때의 너와 같은 사람이 아니라는 거야.",
    feeling: "지나고 나서야 알게 되는 것들이 있다.",
    page: 5,
  },
  {
    bookTitle: "참을 수 없는 존재의 가벼움",
    bookAuthor: "밀란 쿤데라",
    quote: "한 번은 아무것도 아니다. 한 번밖에 살 수 없다는 것은 아예 산 적이 없는 것이나 마찬가지다.",
    page: 8,
  },
  {
    bookTitle: "나는 나로 살기로 했다",
    bookAuthor: "김수현",
    quote: "남들의 기준에 맞추느라 정작 자신이 원하는 것을 놓치고 있진 않은가.",
    page: 23,
  },
  {
    bookTitle: "죽고 싶지만 떡볶이는 먹고 싶어",
    bookAuthor: "백세희",
    quote: "감정에는 옳고 그름이 없다. 느끼는 대로 느끼면 된다.",
    feeling: "이 한 줄이 위로가 됐다.",
    page: 45,
  },
  {
    bookTitle: "멋진 신세계",
    bookAuthor: "올더스 헉슬리",
    quote: "불행해질 권리를 요구합니다.",
    page: 237,
  },
  {
    bookTitle: "사피엔스",
    bookAuthor: "유발 하라리",
    quote: "역사의 몇 안 되는 철칙 가운데 하나는, 사치품은 필수품이 되고 새로운 의무를 낳는 경향이 있다는 것이다.",
    page: 101,
  },
  {
    bookTitle: "연금술사",
    bookAuthor: "파울로 코엘료",
    quote: "네가 무언가를 간절히 원할 때 온 우주는 네 소원이 이루어지도록 도와준다.",
    page: 22,
  },
  {
    bookTitle: "위대한 개츠비",
    bookAuthor: "F. 스콧 피츠제럴드",
    quote: "그래서 우리는 계속 나아간다. 끊임없이 과거로 떠밀려가는 배처럼, 물살을 거슬러.",
    page: 180,
  },
];

async function seed() {
  console.log("Starting editorial seed...");

  for (const item of SEED_DATA) {
    // Find or create book
    let { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("title", item.bookTitle)
      .eq("author", item.bookAuthor)
      .maybeSingle();

    if (!book) {
      const { data: newBook } = await supabase
        .from("books")
        .insert({ title: item.bookTitle, author: item.bookAuthor })
        .select("id")
        .single();
      book = newBook;
    }

    if (!book) {
      console.error(`Failed to create book: ${item.bookTitle}`);
      continue;
    }

    // Check if this quote already exists
    const { data: existing } = await supabase
      .from("underlines")
      .select("id")
      .eq("user_id", EDITOR_USER_ID)
      .eq("book_id", book.id)
      .eq("quote", item.quote)
      .maybeSingle();

    if (existing) {
      console.log(`  Skip (exists): ${item.bookTitle} - ${item.quote.slice(0, 30)}...`);
      continue;
    }

    const { error } = await supabase
      .from("underlines")
      .insert({
        user_id: EDITOR_USER_ID,
        book_id: book.id,
        quote: item.quote,
        page: item.page ?? 0,
        feeling: item.feeling ?? null,
      });

    if (error) {
      console.error(`  Error: ${item.bookTitle}`, error.message);
    } else {
      console.log(`  Added: ${item.bookTitle} - ${item.quote.slice(0, 30)}...`);
    }
  }

  console.log("Done!");
}

seed();
