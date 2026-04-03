export function CommunityGuidePage() {
  return (
    <div className="settings-sub-page">

      <div className="guide-section">
        <h3 className="guide-heading">이듬은 이런 공간입니다</h3>
        <p className="guide-text">
          이듬은 책 속 문장을 기록하고, 조용히 나누는 공간입니다.
          좋은 문장이 흐르는 곳을 함께 지켜주세요.
        </p>
      </div>

      <div className="guide-section">
        <h3 className="guide-heading">이런 글은 자동으로 숨겨집니다</h3>
        <ul className="guide-list">
          <li>욕설, 비속어, 혐오 표현이 포함된 글</li>
          <li>광고, 홍보, 외부 링크가 포함된 글</li>
          <li>문제집, 시험 지문 등 책 원문이 아닌 문장</li>
          <li>의미를 알 수 없는 극히 짧은 글</li>
        </ul>
        <p className="guide-note">
          자동 숨김된 글은 운영팀이 확인 후 복구하거나 삭제합니다.
        </p>
      </div>

      <div className="guide-section">
        <h3 className="guide-heading">신고 기준</h3>
        <p className="guide-text">
          아래에 해당하는 글을 발견하면 더보기 → 신고하기를 눌러주세요.
        </p>
        <ul className="guide-list">
          <li><strong>욕설 · 비하</strong> — 특정 개인이나 집단을 모욕하는 표현</li>
          <li><strong>음란 · 선정</strong> — 성적인 내용이 포함된 문장</li>
          <li><strong>분란 · 정치</strong> — 정치적 선동이나 갈등을 유발하는 글</li>
        </ul>
      </div>

      <div className="guide-section">
        <h3 className="guide-heading">운영 원칙</h3>
        <ul className="guide-list">
          <li>자동 필터는 명백한 경우에만 작동합니다</li>
          <li>애매한 판단은 사람이 합니다</li>
          <li>실수로 숨겨진 글은 복구됩니다</li>
          <li>반복 위반 시 계정이 제한될 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
