import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "signup" | "forgot";

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다";
  if (msg.includes("already registered")) return "이미 가입된 이메일입니다";
  if (msg.includes("at least 6")) return "비밀번호는 6자 이상이어야 합니다";
  if (msg.includes("rate limit")) return "잠시 후 다시 시도해 주세요";
  if (msg.includes("email")) return "올바른 이메일 주소를 입력해 주세요";
  return msg;
}

interface AuthPageProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export function AuthPage({ onSuccess, isModal }: AuthPageProps = {}) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError("");
    setSuccess("");
    setName("");
    setHandle("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(translateError(err.message));
    } else {
      if (onSuccess) onSuccess();
      else navigate("/shelf");
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !handle.trim()) {
      setError("이름과 핸들을 입력해 주세요.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setLoading(false);
      setError(translateError(err.message));
      return;
    }
    if (data.user) {
      const { error: dbErr } = await supabase.rpc("create_user_profile", {
        user_id: data.user.id,
        user_name: name.trim(),
        user_handle: handle.trim().replace(/^@/, ""),
        user_bio: "이듬에서 기록하는 사람",
      });
      if (dbErr) {
        setLoading(false);
        setError(translateError(dbErr.message));
        return;
      }
    }
    setLoading(false);
    setSuccess("가입 완료! 이메일을 확인해 주세요.");
    setMode("login");
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) {
      setError(translateError(err.message));
    } else {
      setSuccess("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
    }
  };

  return (
    <div className={isModal ? "auth-modal-inner" : "auth-page"}>
      <div className="auth-card">
        <div className="auth-logo">
          이듬
        </div>
        <div className="auth-tagline">당신이 멈춘 문장</div>

        <div className="auth-body" key={mode}>
          {mode === "login" && (
            <>
              <div className="auth-title">로그인</div>
              <form className="auth-form" onSubmit={handleLogin}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="auth-input"
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}
                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? "..." : "로그인"}
                </button>
              </form>
              <div className="auth-links">
                <button className="auth-link" onClick={() => switchMode("signup")}>
                  계정이 없으신가요? 가입하기
                </button>
                <button className="auth-link" onClick={() => switchMode("forgot")}>
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <div className="auth-title">가입하기</div>
              <form className="auth-form" onSubmit={handleSignup}>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="@핸들"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="auth-input"
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <div className="auth-error">{error}</div>}
                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? "..." : "가입하기"}
                </button>
              </form>
              <div className="auth-links">
                <button className="auth-link" onClick={() => switchMode("login")}>
                  이미 계정이 있으신가요? 로그인
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="auth-title">비밀번호 재설정</div>
              <form className="auth-form" onSubmit={handleForgot}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}
                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? "..." : "비밀번호 재설정 링크 보내기"}
                </button>
              </form>
              <div className="auth-links">
                <button className="auth-link" onClick={() => switchMode("login")}>
                  로그인으로 돌아가기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
