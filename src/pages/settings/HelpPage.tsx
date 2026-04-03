
const FAQ_ITEMS = [
  {
    q: "이듬은 어떤 서비스인가요?",
    a: "책 속 문장을 기록하고, 다른 사람의 기록을 엿보는 독서 기록 서비스입니다.",
  },
  {
    q: "기록은 어떻게 남기나요?",
    a: "기록 탭에서 남기기 버튼을 누르고, 문장과 출처를 입력하면 됩니다.",
  },
  {
    q: "노트가 뭔가요?",
    a: "내가 모은 기록 조각들을 엮어서 하나의 흐름으로 만드는 기능입니다.",
  },
  {
    q: "다른 사람의 기록도 볼 수 있나요?",
    a: "네, 발견 탭에서 다른 사람이 멈춘 문장을 만날 수 있어요",
  },
];

export function HelpPage() {
  return (
    <div className="content-fade-in settings-sub-page">

      <div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="settings-faq-item">
            <div className="settings-faq-q">{item.q}</div>
            <div className="settings-faq-a">{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
