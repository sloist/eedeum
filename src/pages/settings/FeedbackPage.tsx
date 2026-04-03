import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { Toast } from "../../components/Toast";
import { supabase } from "../../lib/supabase";

export function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [done, setDone] = useState(false);

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 2500); };

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user?.id || null,
      target_type: "feedback",
      target_id: "site",
      reason: text.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast("전송에 실패했습니다. 다시 시도해주세요.");
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="content-fade-in settings-sub-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t1)", marginBottom: 12 }}>소중한 의견 감사합니다</div>
          <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6, marginBottom: 24 }}>전달된 내용을 확인 후 개선하겠습니다.</div>
          <button className="shelf-login-btn" onClick={() => navigate("/settings")}>돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-fade-in settings-sub-page">
      <div style={{ padding: "8px 0 20px" }}>
        <textarea
          className="ftarea"
          placeholder="불편한 점이나 개선 의견을 자유롭게 적어주세요"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.7 }}
        />
        <button
          className="subbtn"
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          style={{ opacity: text.trim() ? 1 : 0.4 }}
        >
          {submitting ? "전송 중..." : "보내기"}
        </button>
      </div>
      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
