export function TermsPage() {
  const sectionStyle = { marginBottom: 28 };
  const titleStyle = { fontSize: 14, fontWeight: 700 as const, color: "var(--t1)", marginBottom: 8, letterSpacing: -0.2 };
  const bodyStyle = { fontSize: 13, color: "var(--t2)", lineHeight: 1.85, letterSpacing: -0.2 };

  return (
    <div className="content-fade-in settings-sub-page">
      <div className="settings-sub-title">이용약관</div>

      <div style={{
        padding: "24px 20px",
        background: "var(--bgC)",
        borderRadius: 12,
        border: "1px solid var(--bdL)",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 4, letterSpacing: -0.3 }}>
          이듬 서비스 이용약관
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 24, letterSpacing: -0.2 }}>
          시행일: 2026년 4월 1일
        </div>

        {/* 제1조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제1조 (목적)</div>
          <div style={bodyStyle}>
            <p>본 약관은 IROUN(이로운, 이하 "회사")이 제공하는 이듬(eedeum) 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </div>
        </div>

        {/* 제2조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제2조 (정의)</div>
          <div style={bodyStyle}>
            <p>① "서비스"란 회사가 제공하는 책 문구 공유 및 독서 기록 소셜 플랫폼으로서, 이용자가 책에서 발견한 문장을 기록·공유하고 다른 이용자와 소통할 수 있는 일체의 서비스를 의미합니다.</p>
            <p style={{ marginTop: 6 }}>② "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
            <p style={{ marginTop: 6 }}>③ "회원"이란 회사에 개인정보를 제공하고 회원등록을 한 이용자로서, 서비스의 정보를 지속적으로 제공받으며 이용할 수 있는 자를 의미합니다.</p>
            <p style={{ marginTop: 6 }}>④ "콘텐츠"란 이용자가 서비스 내에서 작성·게시한 문구, 메모, 서평, 이미지 등 일체의 정보를 의미합니다.</p>
          </div>
        </div>

        {/* 제3조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제3조 (약관의 효력 및 변경)</div>
          <div style={bodyStyle}>
            <p>① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
            <p style={{ marginTop: 6 }}>② 회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경된 경우 변경 내용과 적용일자를 명시하여 서비스 내에서 적용일자 7일 전부터 공지합니다. 다만, 이용자에게 불리한 변경의 경우에는 적용일자 30일 전부터 공지합니다.</p>
            <p style={{ marginTop: 6 }}>③ 이용자가 변경된 약관의 적용일자 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.</p>
          </div>
        </div>

        {/* 제4조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제4조 (서비스의 제공)</div>
          <div style={bodyStyle}>
            <p>① 회사는 다음과 같은 서비스를 제공합니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 책 문구(한줄) 기록 및 공유 서비스</p>
            <p style={{ paddingLeft: 12 }}>2. 독서 기록 및 서재 관리 서비스</p>
            <p style={{ paddingLeft: 12 }}>3. 이용자 간 소통 및 소셜 기능</p>
            <p style={{ paddingLeft: 12 }}>4. 책 검색 및 추천 서비스</p>
            <p style={{ paddingLeft: 12 }}>5. 기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스</p>
            <p style={{ marginTop: 6 }}>② 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 다만, 시스템 점검, 증설 및 교체, 통신 장애 등의 사유가 발생한 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.</p>
          </div>
        </div>

        {/* 제5조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제5조 (회원가입 및 계정)</div>
          <div style={bodyStyle}>
            <p>① 이용자는 회사가 정한 절차에 따라 회원가입을 신청하며, 회사가 이를 승인함으로써 회원가입이 완료됩니다.</p>
            <p style={{ marginTop: 6 }}>② 회원은 가입 시 정확하고 최신의 정보를 제공하여야 하며, 변경사항이 있는 경우 지체 없이 이를 수정하여야 합니다.</p>
            <p style={{ marginTop: 6 }}>③ 회원은 자신의 계정 정보를 직접 관리할 책임이 있으며, 이를 제3자에게 양도하거나 대여할 수 없습니다.</p>
            <p style={{ marginTop: 6 }}>④ 회원은 언제든지 서비스 내 설정을 통해 탈퇴를 요청할 수 있으며, 회사는 관련 법령에 따라 즉시 처리합니다.</p>
          </div>
        </div>

        {/* 제6조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제6조 (콘텐츠의 권리 및 관리)</div>
          <div style={bodyStyle}>
            <p>① 이용자가 서비스 내에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</p>
            <p style={{ marginTop: 6 }}>② 이용자는 서비스 이용을 위하여 자신이 게시한 콘텐츠에 대해 회사에 다음의 비독점적 권리를 부여합니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 서비스 내에서의 콘텐츠 노출, 배포, 홍보를 위한 이용권</p>
            <p style={{ paddingLeft: 12 }}>2. 서비스 개선 및 운영을 위한 복제, 수정, 편집, 전시의 권리</p>
            <p style={{ marginTop: 6 }}>③ 회사는 이용자가 게시한 콘텐츠가 타인의 저작권 등 지식재산권을 침해한다고 판단되는 경우 해당 콘텐츠를 삭제하거나 게시를 중단할 수 있습니다.</p>
            <p style={{ marginTop: 6 }}>④ 이용자가 서비스에서 인용하는 책 문구의 저작권은 원저작자에게 있으며, 이용자는 공정이용(fair use)의 범위 내에서 이를 이용하여야 합니다.</p>
          </div>
        </div>

        {/* 제7조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제7조 (금지행위)</div>
          <div style={bodyStyle}>
            <p>이용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 타인의 개인정보를 도용하거나 허위 정보를 등록하는 행위</p>
            <p style={{ paddingLeft: 12 }}>2. 회사 또는 제3자의 저작권 등 지식재산권을 침해하는 행위</p>
            <p style={{ paddingLeft: 12 }}>3. 음란, 폭력, 혐오, 차별적 내용의 콘텐츠를 게시하는 행위</p>
            <p style={{ paddingLeft: 12 }}>4. 영리 목적의 광고, 스팸, 홍보 콘텐츠를 무단 게시하는 행위</p>
            <p style={{ paddingLeft: 12 }}>5. 서비스의 안정적 운영을 방해하거나 시스템에 부하를 주는 행위</p>
            <p style={{ paddingLeft: 12 }}>6. 자동화된 수단을 이용하여 데이터를 수집(크롤링, 스크래핑 등)하는 행위</p>
            <p style={{ paddingLeft: 12 }}>7. 다른 이용자를 괴롭히거나 위협하는 행위</p>
            <p style={{ paddingLeft: 12 }}>8. 기타 관련 법령에 위반되거나 사회 통념에 반하는 행위</p>
          </div>
        </div>

        {/* 제8조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제8조 (서비스 이용 제한 및 계정 정지)</div>
          <div style={bodyStyle}>
            <p>① 회사는 이용자가 제7조의 금지행위를 한 경우 사전 경고, 콘텐츠 삭제, 일시 정지, 영구 정지 등의 조치를 취할 수 있습니다.</p>
            <p style={{ marginTop: 6 }}>② 회사는 전항의 조치를 취하기 전에 이용자에게 사유를 통지하고 소명의 기회를 부여합니다. 다만, 긴급한 조치가 필요한 경우 선조치 후통지할 수 있습니다.</p>
          </div>
        </div>

        {/* 제9조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제9조 (서비스의 변경 및 종료)</div>
          <div style={bodyStyle}>
            <p>① 회사는 운영상 또는 기술상의 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며, 변경 내용을 사전에 공지합니다.</p>
            <p style={{ marginTop: 6 }}>② 회사는 다음 각 호의 사유가 있는 경우 서비스의 전부 또는 일부를 종료할 수 있습니다.</p>
            <p style={{ marginTop: 6, paddingLeft: 12 }}>1. 사업의 폐지 또는 전환</p>
            <p style={{ paddingLeft: 12 }}>2. 기술적 사유로 서비스 제공이 불가능한 경우</p>
            <p style={{ paddingLeft: 12 }}>3. 기타 회사가 서비스를 유지할 수 없는 중대한 사유가 발생한 경우</p>
            <p style={{ marginTop: 6 }}>③ 서비스를 종료하는 경우 회사는 종료일 30일 전까지 이를 공지하며, 이용자가 콘텐츠를 백업할 수 있도록 합리적인 기간을 제공합니다.</p>
          </div>
        </div>

        {/* 제10조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제10조 (책임의 제한)</div>
          <div style={bodyStyle}>
            <p>① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.</p>
            <p style={{ marginTop: 6 }}>② 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
            <p style={{ marginTop: 6 }}>③ 회사는 이용자가 서비스를 통해 게시 또는 전송한 콘텐츠의 정확성, 신뢰성, 적법성에 대하여 책임을 지지 않습니다.</p>
            <p style={{ marginTop: 6 }}>④ 회사는 무료로 제공하는 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</p>
            <p style={{ marginTop: 6 }}>⑤ 회사의 책임은 관련 법령이 허용하는 최대 범위 내에서 제한됩니다.</p>
          </div>
        </div>

        {/* 제11조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제11조 (손해배상)</div>
          <div style={bodyStyle}>
            <p>① 회사 또는 이용자가 본 약관의 규정을 위반하여 상대방에게 손해를 입힌 경우 그 손해를 배상할 책임이 있습니다.</p>
            <p style={{ marginTop: 6 }}>② 다만, 고의 또는 중과실이 없는 경우에는 책임이 제한될 수 있습니다.</p>
          </div>
        </div>

        {/* 제12조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제12조 (분쟁 해결)</div>
          <div style={bodyStyle}>
            <p>① 본 약관과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우 양 당사자는 원만한 해결을 위해 성실히 협의합니다.</p>
            <p style={{ marginTop: 6 }}>② 전항의 협의에도 불구하고 분쟁이 해결되지 않는 경우 대한민국 법률을 준거법으로 하며, 민사소송법에 따른 관할 법원에 소송을 제기할 수 있습니다.</p>
          </div>
        </div>

        {/* 제13조 */}
        <div style={sectionStyle}>
          <div style={titleStyle}>제13조 (기타)</div>
          <div style={bodyStyle}>
            <p>① 본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 관련 법령 및 상관례에 따릅니다.</p>
            <p style={{ marginTop: 6 }}>② 서비스 이용에 관한 문의사항은 아래 연락처를 통해 접수하실 수 있습니다.</p>
            <p style={{ marginTop: 10, paddingLeft: 12 }}>운영: IROUN (이로운)</p>
            <p style={{ paddingLeft: 12 }}>이메일: hello@eedeum.com</p>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--bdL)" }}>
          본 약관은 2026년 4월 1일부터 시행합니다.
        </div>
      </div>
    </div>
  );
}
