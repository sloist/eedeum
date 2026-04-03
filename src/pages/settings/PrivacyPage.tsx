export function PrivacyPage() {
  const sectionStyle = { marginBottom: 28 };
  const titleStyle = { fontSize: 14, fontWeight: 700 as const, color: "var(--t1)", marginBottom: 8, letterSpacing: -0.2 };
  const bodyStyle = { fontSize: 13, color: "var(--t2)", lineHeight: 1.85, letterSpacing: -0.2 };

  return (
    <div className="content-fade-in settings-sub-page">
      <div className="settings-faq-item" style={{ padding: 0, border: "none", background: "none" }}>
        <div className="settings-faq-q" style={{ padding: "0 20px", marginBottom: 16 }}>개인정보처리방침</div>
      </div>

      <div style={{
        padding: "24px 20px",
        background: "var(--bgC)",
        borderRadius: 12,
        border: "1px solid var(--bdL)",
      }}>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.85, letterSpacing: -0.2, marginBottom: 24 }}>
          <p>IROUN(이로운, 이하 "회사")은 이듬(eedeum) 서비스(이하 "서비스") 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침은 이용자의 개인정보가 어떤 목적과 방식으로 수집·이용·보관·파기되는지 안내합니다.</p>
        </div>

        {/* 제1조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제1조 (수집하는 개인정보의 항목)</div>
          <div style={bodyStyle}>
            <p>회사는 서비스 제공을 위하여 다음의 개인정보를 수집합니다.</p>
            <p style={{ marginTop: 10, fontWeight: 600, color: "var(--t1)" }}>1. 회원가입 시 수집 항목</p>
            <p style={{ paddingLeft: 12 }}>- 이메일 주소</p>
            <p style={{ paddingLeft: 12 }}>- 닉네임(표시명)</p>
            <p style={{ paddingLeft: 12 }}>- 프로필 이미지 (선택)</p>
            <p style={{ paddingLeft: 12 }}>- 소개글 (선택)</p>
            <p style={{ marginTop: 10, fontWeight: 600, color: "var(--t1)" }}>2. 서비스 이용 과정에서 자동 수집되는 항목</p>
            <p style={{ paddingLeft: 12 }}>- 접속 IP 주소, 접속 일시</p>
            <p style={{ paddingLeft: 12 }}>- 기기 정보 (운영체제, 브라우저 종류 및 버전)</p>
            <p style={{ paddingLeft: 12 }}>- 서비스 이용 기록 (페이지 방문 기록, 기능 사용 내역)</p>
            <p style={{ paddingLeft: 12 }}>- 쿠키(Cookie) 정보</p>
          </div>
        </div>

        {/* 제2조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제2조 (개인정보의 수집 및 이용 목적)</div>
          <div style={bodyStyle}>
            <p>회사는 수집한 개인정보를 다음의 목적으로 이용합니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 회원 식별 및 가입 의사 확인, 본인 인증</p>
            <p style={{ paddingLeft: 12 }}>2. 서비스 제공, 콘텐츠 제공, 맞춤형 서비스 제공</p>
            <p style={{ paddingLeft: 12 }}>3. 서비스 개선 및 신규 기능 개발을 위한 통계 분석</p>
            <p style={{ paddingLeft: 12 }}>4. 불법·부정 이용 방지 및 서비스 안정성 확보</p>
            <p style={{ paddingLeft: 12 }}>5. 공지사항 전달, 민원 처리, 고객 문의 응대</p>
            <p style={{ paddingLeft: 12 }}>6. 이용약관 위반 행위에 대한 제재 및 분쟁 조정</p>
          </div>
        </div>

        {/* 제3조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제3조 (개인정보의 보유 및 이용 기간)</div>
          <div style={bodyStyle}>
            <p>① 회사는 이용자의 개인정보를 회원 탈퇴 시까지 보유·이용합니다. 회원 탈퇴 요청 시 지체 없이 파기합니다.</p>
            <p style={{ marginTop: 6 }}>② 다만, 다음의 경우에는 해당 기간 동안 보관합니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 관련 법령에 의한 보존 의무가 있는 경우</p>
            <p style={{ paddingLeft: 20 }}>- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</p>
            <p style={{ paddingLeft: 20 }}>- 접속에 관한 기록: 3개월 (통신비밀보호법)</p>
            <p style={{ paddingLeft: 12 }}>2. 부정 이용 방지를 위한 기록: 탈퇴 후 30일</p>
          </div>
        </div>

        {/* 제4조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제4조 (개인정보의 파기 절차 및 방법)</div>
          <div style={bodyStyle}>
            <p>① 회사는 개인정보의 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.</p>
            <p style={{ marginTop: 6 }}>② 전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제하며, 인쇄물 등은 분쇄 또는 소각하여 파기합니다.</p>
          </div>
        </div>

        {/* 제5조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제5조 (개인정보의 제3자 제공 및 위탁)</div>
          <div style={bodyStyle}>
            <p>① 회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 의하여 요구되는 경우는 예외로 합니다.</p>
            <p style={{ marginTop: 6 }}>② 회사는 서비스 제공을 위하여 다음의 외부 서비스를 이용하며, 이에 따라 개인정보 처리가 위탁될 수 있습니다.</p>
            <p style={{ marginTop: 10, paddingLeft: 12, fontWeight: 600, color: "var(--t1)" }}>수탁업체 및 위탁 내용</p>
            <p style={{ paddingLeft: 12 }}>- Supabase Inc.: 데이터베이스 호스팅, 회원 인증 시스템 운영</p>
            <p style={{ paddingLeft: 12 }}>- Vercel Inc.: 웹 애플리케이션 호스팅 및 배포</p>
            <p style={{ marginTop: 6 }}>③ 위 수탁업체들은 서비스 제공 목적 이외의 용도로 개인정보를 이용하지 않으며, 회사는 수탁업체가 관련 법령을 준수하도록 관리·감독합니다.</p>
          </div>
        </div>

        {/* 제6조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제6조 (개인정보의 안전성 확보 조치)</div>
          <div style={bodyStyle}>
            <p>회사는 이용자의 개인정보를 안전하게 보호하기 위하여 다음과 같은 조치를 취합니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 개인정보의 암호화: 비밀번호 등 중요 정보는 암호화하여 저장·관리합니다.</p>
            <p style={{ paddingLeft: 12 }}>2. 접근 통제: 개인정보에 대한 접근 권한을 최소한으로 제한합니다.</p>
            <p style={{ paddingLeft: 12 }}>3. 보안 프로그램 설치 및 주기적 갱신: 해킹 등에 대비한 보안 시스템을 운영합니다.</p>
            <p style={{ paddingLeft: 12 }}>4. SSL/TLS 통신 암호화: 데이터 전송 시 암호화된 통신을 사용합니다.</p>
          </div>
        </div>

        {/* 제7조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제7조 (이용자의 권리 및 행사 방법)</div>
          <div style={bodyStyle}>
            <p>① 이용자는 언제든지 자신의 개인정보에 대하여 다음의 권리를 행사할 수 있습니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 개인정보 열람 요구</p>
            <p style={{ paddingLeft: 12 }}>2. 개인정보 정정·삭제 요구</p>
            <p style={{ paddingLeft: 12 }}>3. 개인정보 처리 정지 요구</p>
            <p style={{ paddingLeft: 12 }}>4. 회원 탈퇴(계정 삭제) 요구</p>
            <p style={{ marginTop: 6 }}>② 위 권리 행사는 서비스 내 설정 페이지를 통해 직접 처리하거나, 이메일(hello@eedeum.com)을 통해 요청하실 수 있으며, 회사는 지체 없이 조치합니다.</p>
            <p style={{ marginTop: 6 }}>③ 이용자가 개인정보의 삭제를 요구한 경우 회사는 해당 개인정보를 복구·이용할 수 없도록 조치합니다.</p>
          </div>
        </div>

        {/* 제8조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제8조 (쿠키의 사용)</div>
          <div style={bodyStyle}>
            <p>① 회사는 이용자에게 맞춤형 서비스를 제공하고 서비스 이용 환경을 개선하기 위해 쿠키(Cookie)를 사용합니다.</p>
            <p style={{ marginTop: 6 }}>② 쿠키는 서비스를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일로, 이용자의 기기에 저장됩니다.</p>
            <p style={{ marginTop: 6 }}>③ 이용자는 브라우저 설정을 통해 쿠키의 허용 또는 거부를 선택할 수 있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스의 이용에 제한이 있을 수 있습니다.</p>
          </div>
        </div>

        {/* 제9조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제9조 (개인정보 보호책임자)</div>
          <div style={bodyStyle}>
            <p>회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <p style={{ marginTop: 10, paddingLeft: 12 }}>소속: IROUN (이로운)</p>
            <p style={{ paddingLeft: 12 }}>이메일: hello@eedeum.com</p>
            <p style={{ marginTop: 6 }}>이용자는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만, 피해 구제 등을 위 연락처를 통해 신고하실 수 있습니다. 회사는 이용자의 문의에 대해 지체 없이 답변 및 처리합니다.</p>
          </div>
        </div>

        {/* 제10조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제10조 (개인정보처리방침의 변경)</div>
          <div style={bodyStyle}>
            <p>① 본 개인정보처리방침은 관련 법령 및 회사 정책의 변경에 따라 수정될 수 있습니다.</p>
            <p style={{ marginTop: 6 }}>② 개인정보처리방침이 변경되는 경우 변경 사항을 서비스 내 공지사항을 통해 고지하며, 변경된 방침은 고지한 날로부터 7일 후 시행됩니다.</p>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--bdL)" }}>
          본 개인정보처리방침은 2026년 4월 1일부터 시행합니다.
        </div>
      </div>
    </div>
  );
}
