import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

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

  const handleGoogleLogin = async () => {
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (err) setError(translateError(err.message));
  };

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
              <button className="auth-google-btn" type="button" onClick={handleGoogleLogin}>
                <GoogleIcon />
                구글로 계속하기
              </button>
              <div className="auth-divider"><span>또는</span></div>
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
              <button className="auth-google-btn" type="button" onClick={handleGoogleLogin}>
                <GoogleIcon />
                구글로 계속하기
              </button>
              <div className="auth-divider"><span>또는</span></div>
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
