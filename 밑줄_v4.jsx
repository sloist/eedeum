import { useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const USERS = {
  me: { name: "문수", avatar: "🌿", handle: "@munsu.reads", bio: "맑음을 추구하는 사람", books: 8, lines: 64, followers: 23, following: 18 },
  yoonseo: { name: "윤서", avatar: "🌿", handle: "@yoonseo.reads", bio: "밤에 읽는 사람", books: 14, lines: 112, followers: 89, following: 34 },
  jaehyun: { name: "재현", avatar: "📖", handle: "@jh.pages", bio: "문장 수집가", books: 22, lines: 187, followers: 156, following: 41 },
  haeun: { name: "하은", avatar: "🍂", handle: "@haeun.ink", bio: "여행과 책 사이", books: 11, lines: 73, followers: 67, following: 29 },
  minjun: { name: "민준", avatar: "🌙", handle: "@minjun.lit", bio: "밤하늘 아래 독서", books: 9, lines: 58, followers: 45, following: 22 },
  soyul: { name: "소율", avatar: "☕", handle: "@soyul.bookmark", bio: "커피와 함께 한 줄", books: 17, lines: 134, followers: 203, following: 55 },
  dohyun: { name: "도현", avatar: "🎧", handle: "@dohyun.reads", bio: "음악처럼 읽는다", books: 13, lines: 95, followers: 78, following: 31 },
};

const TOPICS = [
  { emoji: "🌱", label: "성장", color: "#5A6B55" },
  { emoji: "💌", label: "사랑", color: "#7B5A6B" },
  { emoji: "🤲", label: "위로", color: "#6B5A4A" },
  { emoji: "🔮", label: "철학", color: "#5A5A7B" },
  { emoji: "✈️", label: "여행", color: "#4A6B7B" },
  { emoji: "🤝", label: "관계", color: "#7B6B5A" },
  { emoji: "🎨", label: "예술", color: "#6B4A5A" },
  { emoji: "🧠", label: "심리", color: "#5A6B6B" },
];

const ALL_BOOKS = [
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

const POSTS = [
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

// 모음 (drawer) data — saved items + received echoes
const MOUM_SAVED = [
  { quote: "감정을 모른다는 건, 세상이 조용하다는 뜻이었다.", book: "아몬드", author: "손원평", savedAt: "2시간 전" },
  { quote: "새는 알에서 나오려고 투쟁한다.", book: "데미안", author: "헤르만 헤세", savedAt: "어제" },
  { quote: "여행은 나를 낯선 나에게 데려다준다.", book: "여행의 이유", author: "김영하", savedAt: "3일 전" },
];

const MOUM_ECHOES = [
  { from: "재현", text: "이 문장 앞에서 한참 멈췄어요", myQuote: "감정을 모른다는 건...", time: "10분 전", isNew: true },
  { from: "소율", text: "냉장고에 붙여놨어요", myQuote: "비교는 기쁨을 훔치는...", time: "1시간 전", isNew: true },
  { from: "하은", text: "이 한 줄이 소설 전체를 품고 있는 것 같아요", myQuote: "사람은 누구나 자기만의...", time: "3시간 전", isNew: false },
  { from: "민준", text: "낯선 내가 더 솔직하더라고요", myQuote: "여행은 나를 낯선...", time: "어제", isNew: false },
  { from: "도현", text: "여행 안 가도 이 문장이 데려다줘요", myQuote: "여행은 나를 낯선...", time: "어제", isNew: false },
  { from: "윤서", text: "서른이 되어서야 이 문장이 보이더라고요", myQuote: "새는 알에서 나오려고...", time: "2일 전", isNew: false },
];

const ECHO_CHIPS = ["나도 여기에 밑줄", "이 문장 앞에서 멈춤", "오래 남을 것 같은", "꺼내 읽게 되는"];

const MY_SHELF = [
  { title: "아몬드", lines: 7, color: "#8B7355" }, { title: "데미안", lines: 12, color: "#6B5B4A" },
  { title: "여행의 이유", lines: 3, color: "#5A6B55" }, { title: "나는 나로\n살기로 했다", lines: 9, color: "#8B7B55" },
  { title: "소년이 온다", lines: 15, color: "#4A5A6B" }, { title: "작별하지\n않는다", lines: 6, color: "#7B5A5A" },
  { title: "달러구트\n꿈 백화점", lines: 4, color: "#5A6B6B" }, { title: "불편한\n편의점", lines: 8, color: "#6B5A7B" },
];

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700&family=Pretendard:wght@300;400;500;600;700&display=swap');
:root{
  --bg:#F5F0E8;--bgW:#EDE7DC;--bgC:#FDFAF5;--bgD:#E8E1D5;
  --t1:#2A231D;--t2:#6B6058;--t3:#9E9488;--tq:#3D342C;
  --ac:#8B7355;--acS:#B8A68E;
  --bd:#E3DAD0;--bdL:#EDE7DC;
  --sf:'Noto Serif KR',Georgia,serif;--sn:'Pretendard',-apple-system,sans-serif;
  --shS:0 1px 3px rgba(42,35,29,.04);--shM:0 4px 12px rgba(42,35,29,.06);--shL:0 8px 24px rgba(42,35,29,.08);
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:#E8E1D5;font-family:var(--sn);color:var(--t1)}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
.app::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.75' numOctaves='4' type='fractalNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999}

.hd{padding:14px 20px 10px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;background:rgba(245,240,232,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
.logo{font-family:var(--sf);font-size:21px;font-weight:600;color:var(--t1);letter-spacing:-.5px;cursor:pointer;position:relative}
.logo-line{position:absolute;bottom:-1px;left:0;right:0;height:1.5px;background:var(--ac);opacity:.5}
.hdr{display:flex;gap:10px;align-items:center}
.hdb{width:34px;height:34px;border-radius:50%;background:var(--bgW);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s}
.hdb:hover{background:var(--bgD)}
.hdb svg{width:16px;height:16px;color:var(--t2)}

.stabs{display:flex;padding:0 20px;border-bottom:1px solid var(--bdL)}
.stab{padding:11px 0;margin-right:22px;font-size:13px;font-weight:400;color:var(--t3);cursor:pointer;border:none;border-bottom:1.5px solid transparent;background:none;font-family:var(--sn);letter-spacing:-.3px;transition:all .25s}
.stab.on{color:var(--t1);font-weight:600;border-bottom-color:var(--ac)}

.ct{padding-bottom:88px}

.sh{padding:20px 20px 10px;display:flex;align-items:baseline;justify-content:space-between}
.sl{font-family:var(--sf);font-size:15px;font-weight:500;color:var(--t1);letter-spacing:-.3px}
.sm{font-size:11.5px;color:var(--t3);cursor:pointer;background:none;border:none;font-family:var(--sn)}

.hscr{display:flex;gap:10px;padding:4px 20px 18px;overflow-x:auto;scrollbar-width:none}
.hscr::-webkit-scrollbar{display:none}

.tchip{flex-shrink:0;width:130px;padding:14px 14px 12px;background:var(--bgC);border-radius:12px;border:1px solid var(--bdL);cursor:pointer;transition:all .25s}
.tchip:hover{transform:translateY(-2px);box-shadow:var(--shM);border-color:var(--bd)}
.tbar{width:28px;height:3px;border-radius:1.5px;margin-bottom:10px}
.ttl{font-family:var(--sf);font-size:13px;font-weight:500;color:var(--t1);margin-bottom:2px;letter-spacing:-.3px;line-height:1.3}
.tau{font-size:11px;color:var(--t3);margin-bottom:8px}
.tst{font-size:10px;color:var(--ac);font-weight:500}

/* Post */
.post{padding:22px 20px 18px;border-bottom:1px solid var(--bdL);animation:rise .5s ease forwards;opacity:0}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ptop{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.pava{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;cursor:pointer;transition:transform .2s}
.pava:hover{transform:scale(1.1)}
.pmeta{flex:1}
.pname{font-size:13px;font-weight:600;color:var(--t1);letter-spacing:-.3px;cursor:pointer}
.pname:hover{text-decoration:underline;text-decoration-color:var(--acS);text-underline-offset:2px}
.pbref{font-size:11px;color:var(--t3);margin-top:1px;cursor:pointer}
.pbref:hover{color:var(--t2)}
.ptime{font-size:10.5px;color:var(--t3)}

.qwrap{border-radius:12px;padding:18px 20px;margin-bottom:12px;position:relative}
.qg{font-family:var(--sf);font-size:28px;line-height:1;opacity:.12;position:absolute;top:10px;left:14px;color:var(--t1)}
.qtxt{font-family:var(--sf);font-size:15px;line-height:1.8;color:var(--tq);font-weight:400;letter-spacing:-.15px;position:relative}
.qsrc{margin-top:10px;padding-top:8px;border-top:1px solid rgba(0,0,0,.05);display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t3);flex-wrap:wrap}
.qdot{width:2px;height:2px;background:var(--t3);border-radius:50%;flex-shrink:0}

.pfeel{font-size:13px;line-height:1.55;color:var(--t2);padding:0 2px;margin-bottom:14px;letter-spacing:-.2px}

.pacts{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.abtn{display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--t3);background:none;border:none;cursor:pointer;padding:5px 8px;border-radius:8px;transition:all .2s;font-family:var(--sn)}
.abtn:hover{background:var(--bgW);color:var(--t2)}
.abtn.on{color:var(--ac)}
.abtn svg{width:15px;height:15px}
.asp{flex:1}

.echos{margin-top:12px;padding-top:12px;border-top:1px solid var(--bdL);animation:rise .3s ease}
.eitem{display:flex;align-items:flex-start;gap:8px;padding:6px 0}
.edot{width:4px;height:4px;border-radius:50%;background:var(--acS);margin-top:7px;flex-shrink:0}
.etxt{font-size:12.5px;line-height:1.5;color:var(--t2);letter-spacing:-.2px}
.eusr{font-weight:600;color:var(--t1);margin-right:5px;font-size:12px;cursor:pointer}
.eusr:hover{text-decoration:underline;text-decoration-color:var(--acS);text-underline-offset:2px}
.echips{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.echip{padding:5px 10px;border-radius:16px;border:1px solid var(--bd);background:var(--bgC);font-size:11px;color:var(--t2);cursor:pointer;transition:all .2s;font-family:var(--sn);white-space:nowrap}
.echip:hover{background:var(--bgW);border-color:var(--acS);color:var(--ac)}
.einwrap{display:flex;align-items:center;gap:8px;margin-top:8px}
.einput{flex:1;padding:8px 12px;border:1px solid var(--bd);border-radius:20px;font-size:12px;font-family:var(--sn);background:var(--bgC);color:var(--t1);outline:none;transition:border-color .2s}
.einput::placeholder{color:var(--t3)}.einput:focus{border-color:var(--acS)}
.esend{width:30px;height:30px;border-radius:50%;background:var(--t1);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.esend svg{width:13px;height:13px;color:var(--bg)}

.olines{margin-top:10px}
.oltog{font-size:11.5px;color:var(--ac);cursor:pointer;background:none;border:none;font-family:var(--sn);padding:6px 0;font-weight:500;letter-spacing:-.2px;display:flex;align-items:center;gap:4px}
.oltog svg{width:12px;height:12px;transition:transform .25s}
.oltog.open svg{transform:rotate(180deg)}
.ollist{margin-top:8px;display:flex;flex-direction:column;gap:8px;animation:rise .3s ease}
.olcard{padding:12px 14px;background:var(--bgC);border-radius:10px;border:1px solid var(--bdL);cursor:pointer;transition:all .2s}
.olcard:hover{border-color:var(--bd);box-shadow:var(--shS)}
.olq{font-family:var(--sf);font-size:12.5px;line-height:1.6;color:var(--tq);margin-bottom:6px;letter-spacing:-.1px}
.olinfo{display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--t3)}

/* ─── Bottom nav ─── */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(245,240,232,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--bdL);display:flex;justify-content:space-around;align-items:center;padding:6px 0;padding-bottom:max(6px,env(safe-area-inset-bottom));z-index:200}
.nbtn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 14px;cursor:pointer;background:none;border:none;position:relative}
.nbtn svg{width:21px;height:21px;color:var(--t3);transition:color .2s}
.nbtn.on svg{color:var(--t1)}
.nbtn span{font-size:9.5px;color:var(--t3);font-family:var(--sn);letter-spacing:-.3px}
.nbtn.on span{color:var(--t1);font-weight:600}
.nbtn .ndot{position:absolute;top:4px;right:10px;width:5px;height:5px;background:var(--ac);border-radius:50%}
.nctr{margin-top:-20px}
.corb{width:50px;height:50px;border-radius:50%;background:var(--t1);border:3.5px solid var(--bg);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 2px 12px rgba(42,35,29,.12)}
.corb:hover{transform:scale(1.06);box-shadow:0 4px 20px rgba(42,35,29,.18)}
.corb svg{width:20px;height:20px;color:var(--bg)}

/* ─── Overlay ─── */
.ov{position:fixed;inset:0;background:rgba(42,35,29,.5);z-index:300;display:flex;align-items:flex-end;justify-content:center;animation:fi .25s ease}
@keyframes fi{from{opacity:0}to{opacity:1}}
.sht{width:100%;max-width:430px;background:var(--bgC);border-radius:20px 20px 0 0;padding:10px 20px 36px;animation:su .35s cubic-bezier(.16,1,.3,1);max-height:88vh;overflow-y:auto}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
.shndl{width:32px;height:3.5px;background:var(--bd);border-radius:2px;margin:0 auto 18px}
.shtl{font-family:var(--sf);font-size:17px;font-weight:500;text-align:center;margin-bottom:22px;letter-spacing:-.3px}

/* Capture */
.dz{border:1.5px dashed var(--bd);border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .25s;margin-bottom:18px;background:rgba(237,231,220,.25)}
.dz:hover{border-color:var(--acS);background:rgba(237,231,220,.5)}
.dzi{width:44px;height:44px;margin:0 auto 10px;background:var(--bgW);border-radius:50%;display:flex;align-items:center;justify-content:center}
.dzi svg{width:22px;height:22px;color:var(--ac)}
.dzt{font-size:14px;color:var(--t2);font-weight:500;margin-bottom:3px}
.dzs{font-size:11.5px;color:var(--t3)}
.dvor{text-align:center;font-size:10.5px;color:var(--t3);margin-bottom:18px;position:relative}
.dvor::before,.dvor::after{content:'';position:absolute;top:50%;width:calc(50% - 24px);height:1px;background:var(--bdL)}
.dvor::before{left:0}.dvor::after{right:0}
.sinp{width:100%;padding:13px 16px;border:1px solid var(--bd);border-radius:12px;font-size:13.5px;font-family:var(--sn);background:var(--bg);color:var(--t1);outline:none;transition:border-color .2s}
.sinp::placeholder{color:var(--t3)}.sinp:focus{border-color:var(--acS)}
.capblk{background:var(--bgW);border-radius:12px;padding:18px;margin-bottom:16px;animation:rise .3s ease}
.capq{font-family:var(--sf);font-size:14.5px;line-height:1.75;color:var(--tq);padding-left:14px;border-left:2px solid var(--acS);margin-bottom:10px}
.capinfo{font-size:11.5px;color:var(--t2)}
.ftarea{width:100%;padding:13px 16px;border:1px solid var(--bd);border-radius:12px;font-size:13.5px;font-family:var(--sn);background:var(--bgC);color:var(--t1);outline:none;resize:none;min-height:48px;transition:border-color .2s;margin-bottom:14px}
.ftarea::placeholder{color:var(--t3)}.ftarea:focus{border-color:var(--acS)}
.subbtn{width:100%;padding:14px;background:var(--t1);color:var(--bg);border:none;border-radius:12px;font-size:14px;font-weight:600;font-family:var(--sn);cursor:pointer;transition:all .2s;letter-spacing:-.2px}
.subbtn:hover{opacity:.92;transform:translateY(-1px)}

/* ─── Profile HORIZONTAL layout ─── */
.prof-h{display:flex;align-items:center;gap:16px;padding:22px 20px 6px}
.prof-pic{width:56px;height:56px;border-radius:50%;background:var(--bgW);border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.prof-right{flex:1;min-width:0}
.prof-nm{font-family:var(--sf);font-size:17px;font-weight:600;letter-spacing:-.3px;margin-bottom:1px}
.prof-hdl{font-size:11px;color:var(--t3);margin-bottom:2px}
.prof-bio{font-size:12px;color:var(--t2);margin-bottom:8px;letter-spacing:-.2px}
.prof-stats{display:flex;gap:16px}
.pst-item{display:flex;align-items:baseline;gap:4px}
.pst-num{font-family:var(--sf);font-size:14px;font-weight:600;color:var(--t1)}
.pst-lbl{font-size:10.5px;color:var(--t3)}
.flwbtn{margin-top:10px;margin-left:20px;margin-bottom:6px;padding:7px 22px;border-radius:20px;font-size:12px;font-weight:600;font-family:var(--sn);cursor:pointer;transition:all .2s;letter-spacing:-.2px}
.flwbtn.follow{background:var(--t1);color:var(--bg);border:none}
.flwbtn.following{background:transparent;color:var(--t2);border:1.5px solid var(--bd)}

/* Share card */
.shint{font-size:10.5px;color:var(--t3);text-align:center;padding:12px 20px 6px}
.scard{margin:0 20px 18px;padding:28px 24px 22px;background:linear-gradient(145deg,#2A231D 0%,#3D342C 60%,#4A3F35 100%);border-radius:16px;color:#F5F0E8;position:relative;overflow:hidden;cursor:pointer;transition:transform .2s}
.scard:hover{transform:scale(1.01)}
.scard::before{content:'';position:absolute;top:-40%;right:-25%;width:220px;height:220px;background:radial-gradient(circle,rgba(196,168,130,.2),transparent 65%);border-radius:50%}
.sqm{font-family:var(--sf);font-size:36px;opacity:.15;line-height:1;margin-bottom:4px;position:relative}
.sqt{font-family:var(--sf);font-size:15.5px;line-height:1.8;font-weight:300;letter-spacing:-.1px;margin-bottom:20px;position:relative}
.sbot{display:flex;align-items:flex-end;justify-content:space-between;position:relative}
.sbk{font-size:11px;opacity:.55;line-height:1.4}
.slogo{font-family:var(--sf);font-size:12px;opacity:.35;letter-spacing:-.3px;border-bottom:1px solid rgba(245,240,232,.2);padding-bottom:1px}

/* Monthly */
.mly{padding:0 20px 16px}
.mlbl{font-size:12.5px;font-weight:500;color:var(--t2);margin-bottom:10px;letter-spacing:-.2px}
.hmap{display:flex;gap:3px;flex-wrap:wrap}
.hcell{width:13px;height:13px;border-radius:2.5px;background:var(--bdL)}
.h1{background:rgba(139,115,85,.2)}.h2{background:rgba(139,115,85,.38)}.h3{background:rgba(139,115,85,.58)}.h4{background:var(--ac)}

/* Shelf grid */
.sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 20px 24px}
.sbook{aspect-ratio:2.8/4;border-radius:6px;display:flex;flex-direction:column;justify-content:flex-end;padding:8px;cursor:pointer;transition:all .25s;position:relative;overflow:hidden}
.sbook::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.45),rgba(0,0,0,.05) 55%);border-radius:6px}
.sbook:hover{transform:translateY(-3px) scale(1.02);box-shadow:var(--shL)}
.sbtl{font-family:var(--sf);font-size:10px;font-weight:500;color:#fff;position:relative;z-index:1;line-height:1.35;white-space:pre-line}
.sbln{font-size:9px;color:rgba(255,255,255,.65);position:relative;z-index:1;margin-top:2px}

/* Discover */
.dsinp{margin:14px 20px;padding:12px 14px;border:1px solid var(--bd);border-radius:12px;font-size:13.5px;font-family:var(--sn);background:var(--bgC);color:var(--t1);outline:none;width:calc(100% - 40px)}
.dsinp::placeholder{color:var(--t3)}
.tpscr{display:flex;gap:8px;padding:4px 20px 16px;overflow-x:auto;scrollbar-width:none}
.tpscr::-webkit-scrollbar{display:none}
.tpill{flex-shrink:0;padding:10px 16px;background:var(--bgC);border:1px solid var(--bdL);border-radius:20px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
.tpill:hover,.tpill.on{background:var(--bgW);border-color:var(--bd)}
.tpill.on{border-color:var(--ac);background:rgba(139,115,85,.08)}
.tpem{font-size:14px}.tplb{font-size:12px;color:var(--t2);font-family:var(--sn);white-space:nowrap}
.brow{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;transition:background .2s}
.brow:hover{background:rgba(253,250,245,.6)}
.bcov{width:40px;height:56px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.bcovl{font-family:var(--sf);font-size:8px;color:rgba(255,255,255,.8);text-align:center;padding:3px;line-height:1.2}
.binf{flex:1}
.bint{font-family:var(--sf);font-size:13.5px;font-weight:500;color:var(--t1);letter-spacing:-.2px;margin-bottom:2px}
.bina{font-size:11.5px;color:var(--t3)}
.bcnt{text-align:right}
.bcnn{font-family:var(--sf);font-size:15px;font-weight:600;color:var(--ac)}
.bcnl{font-size:9.5px;color:var(--t3)}

/* ─── 모음 (Drawer) ─── */
.moum-tabs{display:flex;padding:0 20px;border-bottom:1px solid var(--bdL)}
.moum-tab{padding:11px 0;margin-right:22px;font-size:13px;font-weight:400;color:var(--t3);cursor:pointer;border:none;border-bottom:1.5px solid transparent;background:none;font-family:var(--sn);letter-spacing:-.3px;transition:all .25s;position:relative}
.moum-tab.on{color:var(--t1);font-weight:600;border-bottom-color:var(--ac)}
.moum-tab .mdot{position:absolute;top:8px;right:-8px;width:5px;height:5px;background:var(--ac);border-radius:50%}

.moum-card{padding:16px 20px;border-bottom:1px solid var(--bdL);animation:rise .4s ease forwards;opacity:0}
.moum-quote{font-family:var(--sf);font-size:14px;line-height:1.7;color:var(--tq);margin-bottom:8px;padding-left:12px;border-left:2px solid var(--acS);letter-spacing:-.1px}
.moum-meta{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t3)}
.moum-time{margin-left:auto;font-size:10.5px}

.echo-card{padding:14px 20px;border-bottom:1px solid var(--bdL);animation:rise .4s ease forwards;opacity:0}
.echo-card.new{background:rgba(139,115,85,.04)}
.echo-from{font-size:12.5px;color:var(--t1);font-weight:600;margin-bottom:3px;letter-spacing:-.2px}
.echo-msg{font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:6px;letter-spacing:-.2px}
.echo-ref{font-size:11px;color:var(--t3);font-style:italic}
.echo-time{font-size:10px;color:var(--t3);margin-top:4px}
.echo-new-dot{display:inline-block;width:5px;height:5px;background:var(--ac);border-radius:50%;margin-left:5px;vertical-align:middle}

/* Search */
.srcov{position:fixed;inset:0;background:var(--bg);z-index:350;animation:fi .2s ease;max-width:430px;margin:0 auto}
.srcbar{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--bdL)}
.srcbar input{flex:1;padding:10px 14px;border:1px solid var(--bd);border-radius:10px;font-size:14px;font-family:var(--sn);background:var(--bgC);color:var(--t1);outline:none}
.srcbar input::placeholder{color:var(--t3)}
.srccan{font-size:13px;color:var(--ac);font-weight:500;cursor:pointer;background:none;border:none;font-family:var(--sn)}
.srcres{padding:8px 0;max-height:calc(100vh - 70px);overflow-y:auto}

/* Share modal */
.shrmod{text-align:center;padding:20px 0}
.shrico{display:flex;justify-content:center;gap:20px;margin-bottom:20px}
.shrbtn{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;background:none;border:none}
.shrbtn .ic{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px}
.shrbtn span{font-size:10.5px;color:var(--t2);font-family:var(--sn)}
.cpied{font-size:13px;color:var(--ac);font-weight:500;margin-top:8px;animation:rise .3s ease}

/* Back */
.backbtn{display:flex;align-items:center;gap:6px;padding:12px 20px;cursor:pointer;background:none;border:none;font-size:13px;color:var(--t2);font-family:var(--sn)}
.backbtn svg{width:18px;height:18px}

/* Compare */
.cmphd{text-align:center;margin-bottom:16px}
.cmptl{font-family:var(--sf);font-size:16px;font-weight:500;margin-bottom:4px;letter-spacing:-.3px}
.cmpsub{font-size:12px;color:var(--t3)}
.cmpitm{padding:16px;background:var(--bgC);border-radius:12px;border:1px solid var(--bdL);margin-bottom:10px}
.cmpq{font-family:var(--sf);font-size:14px;line-height:1.7;color:var(--tq);margin-bottom:8px;padding-left:12px;border-left:2px solid var(--acS)}
.cmpur{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--t3)}
.cmpun{font-weight:600;color:var(--t2);cursor:pointer}
.cmpun:hover{text-decoration:underline;text-decoration-color:var(--acS)}
.cmppg{margin-left:auto}

/* Now */
.livepost{padding:16px 20px;border-bottom:1px solid var(--bdL);animation:rise .4s ease forwards;opacity:0}
.livebadge{display:inline-block;padding:2px 8px;background:rgba(139,115,85,.1);color:var(--ac);font-size:10px;font-weight:600;border-radius:6px;margin-bottom:8px;letter-spacing:.3px}

.toast{position:fixed;top:56px;left:50%;transform:translateX(-50%);background:var(--t1);color:var(--bg);padding:11px 22px;border-radius:100px;font-size:13px;font-family:var(--sn);z-index:400;animation:tin .35s cubic-bezier(.16,1,.3,1),tout .25s ease 2.2s forwards;box-shadow:0 4px 20px rgba(0,0,0,.18);letter-spacing:-.2px;white-space:nowrap}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes tout{from{opacity:1}to{opacity:0;pointer-events:none}}
.uposts{border-top:1px solid var(--bdL)}
`;

// ─── ICONS ───
const I={
  Search:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7.5"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>,
  Home:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Compass:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" opacity=".12"/></svg>,
  Camera:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Chat:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  User:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart:(f)=><svg viewBox="0 0 24 24" fill={f?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Bmark:(f)=><svg viewBox="0 0 24 24" fill={f?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  Share:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  ChevD:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Back:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Send:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Drawer:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="12" x2="12" y2="21"/></svg>,
};

// ─── POST COMPONENT ───
function PostCard({post, idx, onUser, onBook, onShare, toast: t}) {
  const u = USERS[post.userId];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEch, setShowEch] = useState(false);
  const [showOL, setShowOL] = useState(false);
  const [echoTxt, setEchoTxt] = useState("");
  const [echoes, setEchoes] = useState(post.echoes);
  const addE = (txt) => { if(!txt.trim())return; setEchoes([...echoes,{userId:"me",text:txt}]); setEchoTxt(""); };

  return (
    <div className="post" style={{animationDelay:`${idx*.07}s`}}>
      <div className="ptop">
        <div className="pava" style={{background:post.coverColor}} onClick={()=>onUser(post.userId)}>{u.avatar}</div>
        <div className="pmeta">
          <span className="pname" onClick={()=>onUser(post.userId)}>{u.name}</span>
          <div className="pbref" onClick={()=>onBook(post.book)}>{post.book.title} · {post.book.author}</div>
        </div>
        <span className="ptime">{post.timestamp}</span>
      </div>
      <div className="qwrap" style={{background:post.coverColor+'30'}}>
        <span className="qg">"</span>
        <p className="qtxt">{post.quote}</p>
        <div className="qsrc"><span>{post.book.title}</span><span className="qdot"/><span>{post.book.author}</span><span className="qdot"/><span>p.{post.book.page}</span></div>
      </div>
      <p className="pfeel">{post.feeling}</p>
      <div className="pacts">
        <button className={`abtn ${liked?'on':''}`} onClick={()=>{setLiked(!liked);if(!liked)t("좋아요");}}>{I.Heart(liked)}<span>{liked?post.likes+1:post.likes}</span></button>
        <button className={`abtn ${showEch?'on':''}`} onClick={()=>setShowEch(!showEch)}>{I.Chat()}<span>{echoes.length}</span></button>
        <button className={`abtn ${saved?'on':''}`} onClick={()=>{setSaved(!saved);t(saved?"저장 취소":"서재에 저장");}}>{I.Bmark(saved)}</button>
        <span className="asp"/>
        <button className="abtn" onClick={()=>onShare(post)}>{I.Share()}</button>
      </div>
      {showEch && (
        <div className="echos">
          {echoes.map((e,i)=>{const eu=USERS[e.userId]||{name:"나"};return(
            <div key={i} className="eitem"><span className="edot"/><div className="etxt"><span className="eusr" onClick={()=>e.userId!=="me"&&onUser(e.userId)}>{eu.name}</span>{e.text}</div></div>
          );})}
          <div className="echips">{ECHO_CHIPS.map((r,i)=><button key={i} className="echip" onClick={()=>addE(r)}>{r}</button>)}</div>
          <div className="einwrap">
            <input className="einput" placeholder="이 문장에 대한 생각..." value={echoTxt} onChange={e=>setEchoTxt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addE(echoTxt)}/>
            <button className="esend" onClick={()=>addE(echoTxt)}><I.Send/></button>
          </div>
        </div>
      )}
      {post.otherLines.length>0 && (
        <div className="olines">
          <button className={`oltog ${showOL?'open':''}`} onClick={()=>setShowOL(!showOL)}>다른 사람의 밑줄 {post.otherLines.length}개 <I.ChevD/></button>
          {showOL && (
            <div className="ollist">
              {post.otherLines.map((ol,i)=>{const ou=USERS[ol.userId]||{name:ol.userId};return(
                <div key={i} className="olcard"><div className="olq">"{ol.quote}"</div><div className="olinfo"><span className="eusr" onClick={()=>onUser(ol.userId)}>{ou.name}</span><span className="qdot"/><span>p.{ol.page}</span></div></div>
              );})}
              <button className="oltog" onClick={()=>onBook(post.book)} style={{marginTop:4}}>{post.book.title}의 모든 밑줄 보기 →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FollowBtn(){const[f,setF]=useState(false);return<button className={`flwbtn ${f?'following':'follow'}`} onClick={()=>setF(!f)}>{f?'팔로잉':'팔로우'}</button>;}

function ProfileHeader({user, showFollow}){
  return(
    <>
      <div className="prof-h">
        <div className="prof-pic">{user.avatar}</div>
        <div className="prof-right">
          <div className="prof-nm">{user.name}</div>
          <div className="prof-hdl">{user.handle}</div>
          <div className="prof-bio">{user.bio}</div>
          <div className="prof-stats">
            <div className="pst-item"><span className="pst-num">{user.books}</span><span className="pst-lbl">책</span></div>
            <div className="pst-item"><span className="pst-num">{user.lines}</span><span className="pst-lbl">밑줄</span></div>
            <div className="pst-item"><span className="pst-num">{user.followers}</span><span className="pst-lbl">팔로워</span></div>
            <div className="pst-item"><span className="pst-num">{user.following}</span><span className="pst-lbl">팔로잉</span></div>
          </div>
        </div>
      </div>
      {showFollow && <FollowBtn/>}
    </>
  );
}

// ─── MAIN ───
export default function App(){
  const[tab,setTab]=useState("home");
  const[subTab,setSubTab]=useState("following");
  const[showCap,setShowCap]=useState(false);
  const[capStep,setCapStep]=useState("init");
  const[feeling,setFeeling]=useState("");
  const[toastMsg,setToastMsg]=useState("");
  const[showToast,setShowToast]=useState(false);
  const[showSearch,setShowSearch]=useState(false);
  const[showShare,setShowShare]=useState(false);
  const[sharePost,setSharePost]=useState(null);
  const[copied,setCopied]=useState(false);
  const[viewUser,setViewUser]=useState(null);
  const[viewBook,setViewBook]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const[topicFilter,setTopicFilter]=useState(null);
  const[moumTab,setMoumTab]=useState("saved");
  const[hasNewEcho,setHasNewEcho]=useState(true);
  const searchRef=useRef(null);

  const toast=useCallback((msg)=>{setToastMsg(msg);setShowToast(true);setTimeout(()=>setShowToast(false),2500);},[]);
  const openSearch=()=>{setShowSearch(true);setTimeout(()=>searchRef.current?.focus(),100);};
  const openShare=(post)=>{setSharePost(post);setShowShare(true);setCopied(false);};
  const openUser=(uid)=>{setViewUser(uid);setViewBook(null);};
  const openBook=(book)=>{setViewBook(book);setViewUser(null);};
  const goHome=()=>{setViewUser(null);setViewBook(null);};

  const handleSubmit=()=>{setShowCap(false);setCapStep("init");setFeeling("");toast("밑줄이 서재에 남았습니다");};
  const filteredBooks=topicFilter?ALL_BOOKS.filter(b=>b.topics.includes(topicFilter)):ALL_BOOKS;
  const filteredPosts=topicFilter?POSTS.filter(p=>p.topic===topicFilter):POSTS;
  const searchResults=searchQ.trim()?ALL_BOOKS.filter(b=>b.title.includes(searchQ)||b.author.includes(searchQ)):[];
  const searchPostResults=searchQ.trim()?POSTS.filter(p=>p.quote.includes(searchQ)||p.book.title.includes(searchQ)):[];
  const allLinesForBook=(title)=>{const l=[];POSTS.forEach(p=>{if(p.book.title===title){l.push({userId:p.userId,quote:p.quote,page:p.book.page});p.otherLines.forEach(ol=>l.push({userId:ol.userId,quote:ol.quote,page:ol.page}));}});return l.sort((a,b)=>a.page-b.page);};
  const userPosts=(uid)=>POSTS.filter(p=>p.userId===uid);
  const heatData=Array.from({length:28},()=>{const r=Math.random();return r>.72?4:r>.5?3:r>.3?2:r>.14?1:0;});
  const newEchoCount=MOUM_ECHOES.filter(e=>e.isNew).length;

  return(
    <>
      <style>{css}</style>
      <div className="app">
        <header className="hd">
          <div className="logo" onClick={goHome}>밑줄<span className="logo-line"/></div>
          <div className="hdr">
            <button className="hdb" onClick={openSearch}><I.Search/></button>
          </div>
        </header>

        <div className="ct">
          {/* ═══ USER PROFILE ═══ */}
          {viewUser&&!viewBook&&(()=>{const u=USERS[viewUser];const up=userPosts(viewUser);const isMe=viewUser==="me";return(
            <>
              <button className="backbtn" onClick={goHome}><I.Back/> 뒤로</button>
              <ProfileHeader user={u} showFollow={!isMe}/>
              <div className="sh"><span className="sl">{u.name}의 밑줄</span><span className="sm">{up.length}개</span></div>
              <div className="uposts">
                {up.length>0?up.map((p,i)=><PostCard key={p.id} post={p} idx={i} onUser={openUser} onBook={openBook} onShare={openShare} toast={toast}/>):
                <div style={{padding:40,textAlign:'center',color:'var(--t3)',fontSize:13}}>아직 밑줄이 없습니다</div>}
              </div>
            </>
          );})()}

          {/* ═══ BOOK COMPARE ═══ */}
          {viewBook&&!viewUser&&(()=>{const lines=allLinesForBook(viewBook.title);return(
            <>
              <button className="backbtn" onClick={goHome}><I.Back/> 뒤로</button>
              <div className="cmphd" style={{padding:'16px 20px'}}><div className="cmptl">{viewBook.title}</div><div className="cmpsub">{viewBook.author} · 사람마다 다른 밑줄</div></div>
              <div style={{padding:'0 20px 24px'}}>
                {lines.map((l,i)=>{const lu=USERS[l.userId]||{name:l.userId};return(
                  <div key={i} className="cmpitm"><div className="cmpq">"{l.quote}"</div><div className="cmpur"><span className="cmpun" onClick={()=>openUser(l.userId)}>{lu.name}</span><span className="cmppg">p.{l.page}</span></div></div>
                );})}
                {lines.length===0&&<div style={{padding:40,textAlign:'center',color:'var(--t3)',fontSize:13}}>아직 밑줄이 없습니다</div>}
              </div>
            </>
          );})()}

          {/* ═══ HOME ═══ */}
          {tab==="home"&&!viewUser&&!viewBook&&(
            <>
              <div className="stabs">
                {[["팔로잉","following"],["발견","discover_tab"],["지금","now"]].map(([l,k])=>(
                  <button key={k} className={`stab ${subTab===k?'on':''}`} onClick={()=>setSubTab(k)}>{l}</button>
                ))}
              </div>
              {subTab==="following"&&(
                <>
                  <div className="sh"><span className="sl">지금 많이 밑줄 긋는 책</span><button className="sm" onClick={()=>{setTab("discover");goHome();}}>더보기</button></div>
                  <div className="hscr">{ALL_BOOKS.slice(0,6).map((b,i)=>(
                    <div key={i} className="tchip" onClick={()=>openBook(b)}><div className="tbar" style={{background:b.color}}/><div className="ttl">{b.title}</div><div className="tau">{b.author}</div><div className="tst">{b.lines.toLocaleString()}개의 밑줄</div></div>
                  ))}</div>
                  {POSTS.map((p,i)=><PostCard key={p.id} post={p} idx={i} onUser={openUser} onBook={openBook} onShare={openShare} toast={toast}/>)}
                </>
              )}
              {subTab==="discover_tab"&&(
                <>
                  <div className="sh"><span className="sl">주제로 찾기</span></div>
                  <div className="tpscr">{TOPICS.map((t,i)=>(
                    <div key={i} className={`tpill ${topicFilter===t.label?'on':''}`} onClick={()=>setTopicFilter(topicFilter===t.label?null:t.label)}><span className="tpem">{t.emoji}</span><span className="tplb">{t.label}</span></div>
                  ))}</div>
                  {topicFilter&&<div className="sh"><span className="sl">'{topicFilter}' 관련 밑줄</span><span className="sm">{filteredPosts.length}개</span></div>}
                  {filteredPosts.map((p,i)=><PostCard key={p.id} post={p} idx={i} onUser={openUser} onBook={openBook} onShare={openShare} toast={toast}/>)}
                </>
              )}
              {subTab==="now"&&(
                <>
                  <div className="sh"><span className="sl">지금 이 순간</span></div>
                  {POSTS.slice(0,5).map((p,i)=>(
                    <div key={i} className="livepost" style={{animationDelay:`${i*.1}s`}}>
                      <div className="livebadge">방금</div>
                      <div className="ptop">
                        <div className="pava" style={{background:p.coverColor}} onClick={()=>openUser(p.userId)}>{USERS[p.userId].avatar}</div>
                        <div className="pmeta"><span className="pname" onClick={()=>openUser(p.userId)}>{USERS[p.userId].name}</span><div className="pbref">밑줄을 그었습니다</div></div>
                      </div>
                      <div className="qwrap" style={{background:p.coverColor+'30'}}>
                        <span className="qg">"</span><p className="qtxt">{p.quote}</p>
                        <div className="qsrc"><span>{p.book.title}</span><span className="qdot"/><span>{p.book.author}</span></div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ═══ DISCOVER ═══ */}
          {tab==="discover"&&!viewUser&&!viewBook&&(
            <>
              <input className="dsinp" placeholder="책 제목, 작가, 문장으로 검색" onFocus={openSearch}/>
              <div className="sh"><span className="sl">주제로 찾기</span></div>
              <div className="tpscr">{TOPICS.map((t,i)=>(
                <div key={i} className={`tpill ${topicFilter===t.label?'on':''}`} onClick={()=>setTopicFilter(topicFilter===t.label?null:t.label)}><span className="tpem">{t.emoji}</span><span className="tplb">{t.label}</span></div>
              ))}</div>
              <div className="sh"><span className="sl">{topicFilter?`'${topicFilter}' 관련 책`:'밑줄이 가장 많은 책'}</span><span className="sm">{filteredBooks.length}권</span></div>
              {filteredBooks.map((b,i)=>(
                <div key={i} className="brow" onClick={()=>openBook(b)}><div className="bcov" style={{background:b.color}}><span className="bcovl">{b.title}</span></div><div className="binf"><div className="bint">{b.title}</div><div className="bina">{b.author} · {b.readers.toLocaleString()}명</div></div><div className="bcnt"><div className="bcnn">{b.lines.toLocaleString()}</div><div className="bcnl">밑줄</div></div></div>
              ))}
            </>
          )}

          {/* ═══ 모음 (DRAWER) ═══ */}
          {tab==="moum"&&!viewUser&&!viewBook&&(
            <>
              <div className="moum-tabs">
                <button className={`moum-tab ${moumTab==='saved'?'on':''}`} onClick={()=>setMoumTab("saved")}>저장한 밑줄</button>
                <button className={`moum-tab ${moumTab==='echoes'?'on':''}`} onClick={()=>{setMoumTab("echoes");setHasNewEcho(false);}}>
                  받은 공감
                  {hasNewEcho&&<span className="mdot"/>}
                </button>
                <button className={`moum-tab ${moumTab==='liked'?'on':''}`} onClick={()=>setMoumTab("liked")}>좋아요한</button>
              </div>

              {moumTab==="saved"&&(
                <>
                  {MOUM_SAVED.map((s,i)=>(
                    <div key={i} className="moum-card" style={{animationDelay:`${i*.06}s`}}>
                      <div className="moum-quote">"{s.quote}"</div>
                      <div className="moum-meta"><span>{s.book}</span><span className="qdot"/><span>{s.author}</span><span className="moum-time">{s.savedAt}</span></div>
                    </div>
                  ))}
                  {MOUM_SAVED.length===0&&<div style={{padding:60,textAlign:'center',color:'var(--t3)',fontSize:13}}>아직 저장한 밑줄이 없습니다</div>}
                </>
              )}

              {moumTab==="echoes"&&(
                <>
                  {MOUM_ECHOES.map((e,i)=>(
                    <div key={i} className={`echo-card ${e.isNew?'new':''}`} style={{animationDelay:`${i*.06}s`}}>
                      <div className="echo-from">{e.from}{e.isNew&&<span className="echo-new-dot"/>}</div>
                      <div className="echo-msg">{e.text}</div>
                      <div className="echo-ref">내 밑줄: "{e.myQuote}"</div>
                      <div className="echo-time">{e.time}</div>
                    </div>
                  ))}
                </>
              )}

              {moumTab==="liked"&&(
                <>
                  {POSTS.slice(0,4).map((p,i)=>(
                    <div key={i} className="moum-card" style={{animationDelay:`${i*.06}s`}}>
                      <div className="moum-quote">"{p.quote}"</div>
                      <div className="moum-meta"><span>{USERS[p.userId].name}</span><span className="qdot"/><span>{p.book.title}</span><span className="moum-time">{p.timestamp}</span></div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ═══ SHELF ═══ */}
          {tab==="shelf"&&!viewUser&&!viewBook&&(
            <>
              <ProfileHeader user={USERS.me} showFollow={false}/>
              <div className="shint">최근 밑줄 · 인스타그램에 공유하기</div>
              <div className="scard" onClick={()=>openShare(POSTS[0])}>
                <div className="sqm">"</div>
                <div className="sqt">감정을 모른다는 건,<br/>세상이 조용하다는 뜻이었다.</div>
                <div className="sbot"><div className="sbk">아몬드<br/>손원평</div><div className="slogo">밑줄</div></div>
              </div>
              <div className="mly">
                <div className="mlbl">3월의 기록</div>
                <div className="hmap">{heatData.map((lv,i)=><div key={i} className={`hcell ${lv>0?`h${lv}`:''}`}/>)}</div>
              </div>
              <div className="sh"><span className="sl">내 서재</span><span className="sm">{MY_SHELF.length}권</span></div>
              <div className="sgrid">{MY_SHELF.map((b,i)=>(
                <div key={i} className="sbook" style={{background:b.color}} onClick={()=>openBook({title:b.title.replace('\n',''),author:''})}><span className="sbtl">{b.title}</span><span className="sbln">{b.lines}개</span></div>
              ))}</div>
            </>
          )}
        </div>

        {/* ═══ BOTTOM NAV ═══ */}
        <nav className="bnav">
          <button className={`nbtn ${tab==='home'?'on':''}`} onClick={()=>{setTab("home");goHome();}}><I.Home/><span>홈</span></button>
          <button className={`nbtn ${tab==='discover'?'on':''}`} onClick={()=>{setTab("discover");goHome();setTopicFilter(null);}}><I.Compass/><span>탐색</span></button>
          <div className="nctr"><div className="corb" onClick={()=>{setShowCap(true);setCapStep("init");}}><I.Camera/></div></div>
          <button className={`nbtn ${tab==='moum'?'on':''}`} onClick={()=>{setTab("moum");goHome();}}>
            <I.Drawer/>
            <span>모음</span>
            {hasNewEcho&&<span className="ndot"/>}
          </button>
          <button className={`nbtn ${tab==='shelf'?'on':''}`} onClick={()=>{setTab("shelf");goHome();}}><I.User/><span>서재</span></button>
        </nav>

        {/* ═══ CAPTURE ═══ */}
        {showCap&&(
          <div className="ov" onClick={()=>{setShowCap(false);setCapStep("init");}}>
            <div className="sht" onClick={e=>e.stopPropagation()}>
              <div className="shndl"/><div className="shtl">밑줄 긋기</div>
              {capStep==="init"?(
                <>
                  <div className="dz" onClick={()=>setCapStep("captured")}><div className="dzi"><I.Camera/></div><div className="dzt">책 페이지를 찍어주세요</div><div className="dzs">AI가 문장을 자동으로 인식합니다</div></div>
                  <div className="dvor">또는</div>
                  <input className="sinp" placeholder="문장을 직접 입력하거나, 책을 검색하세요"/>
                </>
              ):(
                <>
                  <div className="capblk"><div className="capq">"우리가 빛의 속도로 갈 수 없다면, 빛의 속도로 걸을 수는 있을까."</div><div className="capinfo">📖 피프티 피플 · 정세랑 · p.127에서 발견</div></div>
                  <textarea className="ftarea" placeholder="이 문장에서 무엇이 남았나요? (선택)" value={feeling} onChange={e=>setFeeling(e.target.value)} rows={2}/>
                  <button className="subbtn" onClick={handleSubmit}>밑줄 남기기</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ SEARCH ═══ */}
        {showSearch&&(
          <div className="srcov">
            <div className="srcbar">
              <input ref={searchRef} placeholder="책, 작가, 문장 검색" value={searchQ} onChange={e=>setSearchQ(e.target.value)} autoFocus/>
              <button className="srccan" onClick={()=>{setShowSearch(false);setSearchQ("");}}>취소</button>
            </div>
            <div className="srcres">
              {!searchQ.trim()&&(
                <div style={{padding:20}}>
                  <div className="sl" style={{marginBottom:12}}>인기 검색어</div>
                  {["한강","데미안","위로","아몬드","여행"].map((w,i)=>(
                    <div key={i} className="brow" onClick={()=>setSearchQ(w)} style={{padding:'10px 20px'}}><span style={{fontSize:13,color:'var(--t2)'}}>{i+1}. {w}</span></div>
                  ))}
                </div>
              )}
              {searchResults.length>0&&(
                <><div className="sh"><span className="sl">책</span></div>
                {searchResults.map((b,i)=>(
                  <div key={i} className="brow" onClick={()=>{openBook(b);setShowSearch(false);setSearchQ("");}}>
                    <div className="bcov" style={{background:b.color}}><span className="bcovl">{b.title}</span></div>
                    <div className="binf"><div className="bint">{b.title}</div><div className="bina">{b.author}</div></div>
                  </div>
                ))}</>
              )}
              {searchPostResults.length>0&&(
                <><div className="sh"><span className="sl">밑줄</span></div>
                {searchPostResults.slice(0,4).map((p,i)=>(
                  <div key={i} className="brow" onClick={()=>{setShowSearch(false);setSearchQ("");}}>
                    <div style={{flex:1}}><div style={{fontFamily:'var(--sf)',fontSize:13,color:'var(--tq)',marginBottom:4}}>"{p.quote}"</div><div className="bina">{p.book.title} · {p.book.author}</div></div>
                  </div>
                ))}</>
              )}
              {searchQ.trim()&&searchResults.length===0&&searchPostResults.length===0&&(
                <div style={{padding:60,textAlign:'center',color:'var(--t3)',fontSize:13}}>검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        )}

        {/* ═══ SHARE MODAL ═══ */}
        {showShare&&sharePost&&(
          <div className="ov" onClick={()=>setShowShare(false)}>
            <div className="sht" onClick={e=>e.stopPropagation()} style={{maxHeight:'60vh'}}>
              <div className="shndl"/><div className="shtl">공유하기</div>
              <div className="scard" style={{margin:'0 0 20px'}}>
                <div className="sqm">"</div><div className="sqt">{sharePost.quote}</div>
                <div className="sbot"><div className="sbk">{sharePost.book.title}<br/>{sharePost.book.author}</div><div className="slogo">밑줄</div></div>
              </div>
              <div className="shrmod">
                <div className="shrico">
                  <button className="shrbtn" onClick={()=>toast("인스타 스토리로 공유")}><div className="ic" style={{background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)'}}>📸</div><span>스토리</span></button>
                  <button className="shrbtn" onClick={()=>toast("인스타 피드로 공유")}><div className="ic" style={{background:'linear-gradient(45deg,#405DE6,#5851DB,#833AB4)'}}>📷</div><span>피드</span></button>
                  <button className="shrbtn" onClick={()=>toast("카카오톡으로 공유")}><div className="ic" style={{background:'#FEE500'}}>💬</div><span>카카오톡</span></button>
                  <button className="shrbtn" onClick={()=>{setCopied(true);toast("링크 복사됨");}}><div className="ic" style={{background:'var(--bgW)'}}>🔗</div><span>링크 복사</span></button>
                </div>
                {copied&&<div className="cpied">✓ 복사되었습니다</div>}
              </div>
            </div>
          </div>
        )}

        {showToast&&<div className="toast">✨ {toastMsg}</div>}
      </div>
    </>
  );
}
