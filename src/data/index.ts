// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

export interface User {
  name: string;
  avatar: string;
  handle: string;
  bio: string;
  books: number;
  lines: number;
  followers: number;
  following: number;
}

export interface Book {
  title: string;
  author: string;
  lines?: number;
  readers?: number;
  color?: string;
  topics?: string[];
}

export interface OtherLine {
  userId: string;
  quote: string;
  page: number;
}

export interface Echo {
  userId: string;
  text: string;
}

export interface Post {
  id: number;
  userId: string;
  book: { title: string; author: string; page: number };
  quote: string;
  feeling: string;
  coverColor: string;
  timestamp: string;
  likes: number;
  topic: string;
  echoes: Echo[];
  otherLines: OtherLine[];
}

export interface MoumSavedItem {
  quote: string;
  book: string;
  author: string;
  savedAt: string;
}

export interface MoumEchoItem {
  from: string;
  text: string;
  myQuote: string;
  time: string;
  isNew: boolean;
}

export interface Topic {
  emoji: string;
  label: string;
  color: string;
}

export interface ShelfBook {
  title: string;
  lines: number;
  color: string;
}

export const USERS: Record<string, User> = {
  me: { name: "문수", avatar: "🌿", handle: "@munsu.reads", bio: "맑음을 추구하는 사람", books: 8, lines: 64, followers: 23, following: 18 },
  yoonseo: { name: "윤서", avatar: "🌿", handle: "@yoonseo.reads", bio: "밤에 읽는 사람", books: 14, lines: 112, followers: 89, following: 34 },
  jaehyun: { name: "재현", avatar: "📖", handle: "@jh.pages", bio: "문장 수집가", books: 22, lines: 187, followers: 156, following: 41 },
  haeun: { name: "하은", avatar: "🍂", handle: "@haeun.ink", bio: "여행과 책 사이", books: 11, lines: 73, followers: 67, following: 29 },
  minjun: { name: "민준", avatar: "🌙", handle: "@minjun.lit", bio: "밤하늘 아래 독서", books: 9, lines: 58, followers: 45, following: 22 },
  soyul: { name: "소율", avatar: "☕", handle: "@soyul.bookmark", bio: "커피와 함께 한 줄", books: 17, lines: 134, followers: 203, following: 55 },
  dohyun: { name: "도현", avatar: "🎧", handle: "@dohyun.reads", bio: "음악처럼 읽는다", books: 13, lines: 95, followers: 78, following: 31 },
};

export const TOPICS: Topic[] = [
  { emoji: "🌱", label: "성장", color: "#5A6B55" },
  { emoji: "💌", label: "사랑", color: "#7B5A6B" },
  { emoji: "🤲", label: "위로", color: "#6B5A4A" },
  { emoji: "🔮", label: "철학", color: "#5A5A7B" },
  { emoji: "✈️", label: "여행", color: "#4A6B7B" },
  { emoji: "🤝", label: "관계", color: "#7B6B5A" },
  { emoji: "🎨", label: "예술", color: "#6B4A5A" },
  { emoji: "🧠", label: "심리", color: "#5A6B6B" },
];

export const ALL_BOOKS: Book[] = [
  { title: "아몬드", author: "손원평", lines: 2841, readers: 1243, color: "#8B7355", topics: ["위로", "성장"] },
  { title: "데미안", author: "헤르만 헤세", lines: 5621, readers: 3102, color: "#6B5B4A", topics: ["성장", "철학"] },
  { title: "불편한 편의점", author: "김호연", lines: 1932, readers: 891, color: "#6B5A7B", topics: ["위로", "관계"] },
  { title: "소년이 온다", author: "한강", lines: 4215, readers: 2156, color: "#4A5A6B", topics: ["사랑", "위로"] },
  { title: "여행의 이유", author: "김영하", lines: 1587, readers: 734, color: "#5A6B55", topics: ["여행", "철학"] },
  { title: "나는 나로 살기로 했다", author: "김수현", lines: 3201, readers: 1876, color: "#8B7B55", topics: ["성장", "심리"] },
  { title: "달러구트 꿈 백화점", author: "이미예", lines: 1245, readers: 654, color: "#5A6B6B", topics: ["위로", "예술"] },
  { title: "작별하지 않는다", author: "한강", lines: 2876, readers: 1432, color: "#7B5A5A", topics: ["사랑", "위로"] },
  { title: "피프티 피플", author: "정세랑", lines: 1654, readers: 823, color: "#6B6B5A", topics: ["관계", "사랑"] },
  { title: "미드나잇 라이브러리", author: "매트 헤이그", lines: 2345, readers: 1567, color: "#5A5A7B", topics: ["철학", "위로"] },
  { title: "채식주의자", author: "한강", lines: 3456, readers: 2341, color: "#4A6B5A", topics: ["예술", "심리"] },
  { title: "해변의 카프카", author: "무라카미 하루키", lines: 2987, readers: 1789, color: "#7B6B4A", topics: ["여행", "철학"] },
  { title: "코스모스", author: "칼 세이건", lines: 1876, readers: 945, color: "#4A5A7B", topics: ["철학", "성장"] },
  { title: "어린 왕자", author: "생텍쥐페리", lines: 6543, readers: 4321, color: "#7B5A7B", topics: ["사랑", "철학"] },
  { title: "82년생 김지영", author: "조남주", lines: 2134, readers: 1654, color: "#6B5A5A", topics: ["관계", "심리"] },
  { title: "언어의 온도", author: "이기주", lines: 1876, readers: 987, color: "#5A7B6B", topics: ["위로", "관계"] },
];

export const POSTS: Post[] = [
  { id:1, userId:"yoonseo", book:{title:"아몬드",author:"손원평",page:84}, quote:"감정을 모른다는 건, 세상이 조용하다는 뜻이었다.", feeling:"말이 없어도 이해받는 순간이 있다는 걸 알게 됐다", coverColor:"#E8DDD3", timestamp:"2시간 전", likes:47, topic:"위로",
    echoes:[{userId:"jaehyun",text:"이 문장 앞에서 한참 멈췄어요"},{userId:"soyul",text:"조용한 세상이 꼭 나쁜 건 아니더라고요"}],
    otherLines:[{userId:"haeun",quote:"곤이는 웃지 않았다. 울지도 않았다.",page:12},{userId:"minjun",quote:"나는 괴물이 아니라 아몬드였다.",page:203},{userId:"dohyun",quote:"사람들은 감정이 없는 게 아니라 감정을 모르는 거였다.",page:91}]},
  { id:2, userId:"jaehyun", book:{title:"데미안",author:"헤르만 헤세",page:56}, quote:"새는 알에서 나오려고 투쟁한다.", feeling:"스무 살에 읽었으면 몰랐을 문장", coverColor:"#D4C5B2", timestamp:"5시간 전", likes:83, topic:"성장",
    echoes:[{userId:"yoonseo",text:"서른이 되어서야 이 문장이 보이더라고요"}],
    otherLines:[{userId:"soyul",quote:"나는 다만 내 안에서 저절로 솟아나오려는 것을 살아보려 했을 뿐이다.",page:7},{userId:"haeun",quote:"운명이란 것은 존재한다. 하지만 그것은 우리 안에 있다.",page:112}]},
  { id:3, userId:"haeun", book:{title:"여행의 이유",author:"김영하",page:34}, quote:"여행은 나를 낯선 나에게 데려다준다.", feeling:"지금 떠나고 싶어진 건 이 문장 때문", coverColor:"#C9D4C5", timestamp:"어제", likes:156, topic:"여행",
    echoes:[{userId:"minjun",text:"낯선 내가 더 솔직하더라고요"},{userId:"jaehyun",text:"공항에서 이 책 읽었는데, 타이밍이 완벽했어요"},{userId:"dohyun",text:"여행 안 가도 이 문장이 데려다줘요"}],
    otherLines:[{userId:"yoonseo",quote:"우리는 여행할 때 비로소 자신에게 질문을 던진다.",page:78}]},
  { id:4, userId:"minjun", book:{title:"불편한 편의점",author:"김호연",page:145}, quote:"사람은 누구나 자기만의 사정이 있다.", feeling:"편의점 알바하던 시절이 생각났다", coverColor:"#D5CCE0", timestamp:"어제", likes:92, topic:"위로",
    echoes:[{userId:"haeun",text:"이 한 줄이 소설 전체를 품고 있는 것 같아요"}],
    otherLines:[{userId:"dohyun",quote:"따뜻한 밥 한 끼가 사람을 바꾸기도 한다.",page:167},{userId:"yoonseo",quote:"세상에 쓸모없는 사람은 없다.",page:201}]},
  { id:5, userId:"soyul", book:{title:"나는 나로 살기로 했다",author:"김수현",page:23}, quote:"비교는 기쁨을 훔치는 도둑이다.", feeling:"매일 아침 읽는 문장이 됐다", coverColor:"#E0D5C5", timestamp:"2일 전", likes:211, topic:"성장",
    echoes:[{userId:"yoonseo",text:"냉장고에 붙여놨어요"},{userId:"minjun",text:"도둑이라는 표현이 정확하다"}], otherLines:[]},
  { id:6, userId:"dohyun", book:{title:"소년이 온다",author:"한강",page:67}, quote:"죽은 뒤에도 부끄럽지 않을 하루를 살고 싶었다.", feeling:"한참을 덮어두고 있었다", coverColor:"#C5CCD4", timestamp:"3일 전", likes:324, topic:"사랑",
    echoes:[{userId:"soyul",text:"이 문장은 소리 내어 읽었어요"},{userId:"jaehyun",text:"부끄럽지 않은 하루라는 말이 무겁습니다"}],
    otherLines:[{userId:"haeun",quote:"빛은 어둠이 있어야 보인다.",page:134}]},
  { id:7, userId:"yoonseo", book:{title:"어린 왕자",author:"생텍쥐페리",page:42}, quote:"가장 중요한 것은 눈에 보이지 않아.", feeling:"어릴 때는 그냥 동화인 줄 알았다", coverColor:"#E0D0E0", timestamp:"3일 전", likes:187, topic:"철학",
    echoes:[{userId:"soyul",text:"매년 다시 읽게 되는 문장"}], otherLines:[]},
  { id:8, userId:"soyul", book:{title:"언어의 온도",author:"이기주",page:88}, quote:"말에도 온도가 있다. 같은 말이라도 따뜻할 수 있고 차가울 수 있다.", feeling:"오늘 누군가에게 따뜻한 말을 건네고 싶어졌다", coverColor:"#D5E0D5", timestamp:"4일 전", likes:145, topic:"관계",
    echoes:[{userId:"haeun",text:"이 책 읽고 문자 보내는 습관이 바뀌었어요"}], otherLines:[]},
];

export const MOUM_SAVED: MoumSavedItem[] = [
  { quote: "감정을 모른다는 건, 세상이 조용하다는 뜻이었다.", book: "아몬드", author: "손원평", savedAt: "2시간 전" },
  { quote: "새는 알에서 나오려고 투쟁한다.", book: "데미안", author: "헤르만 헤세", savedAt: "어제" },
  { quote: "여행은 나를 낯선 나에게 데려다준다.", book: "여행의 이유", author: "김영하", savedAt: "3일 전" },
];

export const MOUM_ECHOES: MoumEchoItem[] = [
  { from: "재현", text: "이 문장 앞에서 한참 멈췄어요", myQuote: "감정을 모른다는 건...", time: "10분 전", isNew: true },
  { from: "소율", text: "냉장고에 붙여놨어요", myQuote: "비교는 기쁨을 훔치는...", time: "1시간 전", isNew: true },
  { from: "하은", text: "이 한 줄이 소설 전체를 품고 있는 것 같아요", myQuote: "사람은 누구나 자기만의...", time: "3시간 전", isNew: false },
  { from: "민준", text: "낯선 내가 더 솔직하더라고요", myQuote: "여행은 나를 낯선...", time: "어제", isNew: false },
  { from: "도현", text: "여행 안 가도 이 문장이 데려다줘요", myQuote: "여행은 나를 낯선...", time: "어제", isNew: false },
  { from: "윤서", text: "서른이 되어서야 이 문장이 보이더라고요", myQuote: "새는 알에서 나오려고...", time: "2일 전", isNew: false },
];

export const ECHO_CHIPS = ["나도 여기에 밑줄", "이 문장 앞에서 멈춤", "오래 남을 것 같은", "꺼내 읽게 되는"];

export const MY_SHELF: ShelfBook[] = [
  { title: "아몬드", lines: 7, color: "#8B7355" }, { title: "데미안", lines: 12, color: "#6B5B4A" },
  { title: "여행의 이유", lines: 3, color: "#5A6B55" }, { title: "나는 나로\n살기로 했다", lines: 9, color: "#8B7B55" },
  { title: "소년이 온다", lines: 15, color: "#4A5A6B" }, { title: "작별하지\n않는다", lines: 6, color: "#7B5A5A" },
  { title: "달러구트\n꿈 백화점", lines: 4, color: "#5A6B6B" }, { title: "불편한\n편의점", lines: 8, color: "#6B5A7B" },
];

// Helper functions
export const allLinesForBook = (title: string) => {
  const l: OtherLine[] = [];
  POSTS.forEach(p => {
    if (p.book.title === title) {
      l.push({ userId: p.userId, quote: p.quote, page: p.book.page });
      p.otherLines.forEach(ol => l.push({ userId: ol.userId, quote: ol.quote, page: ol.page }));
    }
  });
  return l.sort((a, b) => a.page - b.page);
};

export const userPosts = (uid: string) => POSTS.filter(p => p.userId === uid);
