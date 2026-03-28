import { useState } from "react";
import { Icons } from "./Icons";

interface CaptureSheetProps {
  onClose: () => void;
  toast: (msg: string) => void;
}

export function CaptureSheet({ onClose, toast }: CaptureSheetProps) {
  const [step, setStep] = useState<"init" | "captured">("init");
  const [feeling, setFeeling] = useState("");

  const handleSubmit = () => {
    onClose();
    toast("밑줄이 서재에 남았습니다");
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sht" onClick={e => e.stopPropagation()}>
        <div className="shndl" /><div className="shtl">밑줄 긋기</div>
        {step === "init" ? (
          <>
            <div className="dz" onClick={() => setStep("captured")}>
              <div className="dzi"><Icons.Camera /></div>
              <div className="dzt">책 페이지를 찍어주세요</div>
              <div className="dzs">AI가 문장을 자동으로 인식합니다</div>
            </div>
            <div className="dvor">또는</div>
            <input className="sinp" placeholder="문장을 직접 입력하거나, 책을 검색하세요" />
          </>
        ) : (
          <>
            <div className="capblk">
              <div className="capq">"우리가 빛의 속도로 갈 수 없다면, 빛의 속도로 걸을 수는 있을까."</div>
              <div className="capinfo">📖 피프티 피플 · 정세랑 · p.127에서 발견</div>
            </div>
            <textarea
              className="ftarea"
              placeholder="이 문장에서 무엇이 남았나요? (선택)"
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
              rows={2}
            />
            <button className="subbtn" onClick={handleSubmit}>밑줄 남기기</button>
          </>
        )}
      </div>
    </div>
  );
}
