import { useState } from "react";

const STEPS = [
  {
    title: "멈춘 문장을 기록하세요",
    desc: "책을 읽다 밑줄 친 문장, 오래 남는 한 줄을 여기에 남겨두세요.",
    icon: "✏️",
  },
  {
    title: "다른 사람의 문장을 만나세요",
    desc: "같은 책, 같은 문장에 머문 사람들을 발견할 수 있어요.",
    icon: "✦",
  },
  {
    title: "문장을 엮어 하나의 흐름으로",
    desc: "기록이 쌓이면 노트로 나만의 흐름을 만들 수 있어요",
    icon: "📖",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("eedeum_onboarded", "1");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("eedeum_onboarded", "1");
    onComplete();
  };

  const s = STEPS[step];

  return (
    <div className="ob-backdrop">
      <div className="ob-card">
        <div className="ob-icon">{s.icon}</div>
        <div className="ob-title">{s.title}</div>
        <div className="ob-desc">{s.desc}</div>

        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`ob-dot ${i === step ? "on" : ""}`} />
          ))}
        </div>

        <button className="ob-next" onClick={handleNext}>
          {step < STEPS.length - 1 ? "다음" : "시작하기"}
        </button>
        {step < STEPS.length - 1 && (
          <button className="ob-skip" onClick={handleSkip}>건너뛰기</button>
        )}
      </div>
    </div>
  );
}
