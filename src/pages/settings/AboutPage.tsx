export function AboutPage() {
  return (
    <div className="content-fade-in settings-sub-page">
      <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
        <div style={{ fontFamily: "var(--sf)", fontSize: 32, fontWeight: 600, color: "var(--t1)", letterSpacing: -0.5, marginBottom: 8 }}>
          이듬
        </div>
        <div style={{ fontFamily: "var(--sf)", fontSize: 13, color: "var(--t3)", letterSpacing: -0.2, marginBottom: 32 }}>
          당신이 멈춘 문장
        </div>

        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 2, letterSpacing: -0.2 }}>
          <div>Version 1.0.0</div>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--t3)" }}>
            문의: hello@eedeum.com
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--t3)" }}>
            &copy; 2026 EEDEUM , From <a href="https://iroun.kr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ac)", textDecoration: "none" }}>IROUN</a>
          </div>
        </div>
      </div>
    </div>
  );
}
