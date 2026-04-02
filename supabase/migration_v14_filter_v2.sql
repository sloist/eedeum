-- ─── 이듬 콘텐츠 필터 v2 ───
-- 원칙: 좁고 확실하게. 오탐 < 미탐.
-- 명백한 것만 숨기고, 애매한 건 통과시킨다.

-- 1) 사유 컬럼 추가
ALTER TABLE public.underlines ADD COLUMN IF NOT EXISTS filter_reason text;
ALTER TABLE public.echoes ADD COLUMN IF NOT EXISTS filter_reason text;

-- 2) 필터 함수 (v2)
CREATE OR REPLACE FUNCTION check_content_filter()
RETURNS trigger AS $$
DECLARE
  combined_text text;
  is_suspicious boolean := false;
  reason text := null;
BEGIN
  IF TG_TABLE_NAME = 'underlines' THEN
    combined_text := COALESCE(NEW.quote, '') || ' ' || COALESCE(NEW.feeling, '');
  ELSIF TG_TABLE_NAME = 'echoes' THEN
    combined_text := COALESCE(NEW.text, '');
  ELSE
    RETURN NEW;
  END IF;

  combined_text := lower(trim(combined_text));

  -- ① 욕설: 명백한 형태 + 변형 (공백/특수문자 삽입 대응)
  -- 씹 단독 제외. 씹새/씹년/씹창 등 명확 조합만.
  IF combined_text ~* '(시\s*[1!l|i]*\s*발|씨\s*[1!l|i]*\s*[발팔]|ㅅ\s*[1!]*\s*ㅂ|ㅆ\s*[1!]*\s*ㅂ|병\s*[.\-]*\s*[신싄]|ㅂ\s*[.\-]*\s*ㅅ|지\s*랄|ㅈ\s*ㄹ|좆|존\s*나|졸\s*라|ㅈ\s*ㄴ)' THEN
    is_suspicious := true;
    reason := 'profanity';
  ELSIF combined_text ~* '(개새끼|개새기|개색기|개섹|미친놈|미친년|또라이|썅|쌍년|쌍놈|걸레년|걸레놈)' THEN
    is_suspicious := true;
    reason := 'profanity';
  ELSIF combined_text ~* '(씹새|씹년|씹창|씹덕|씹할|염병|엿먹|꺼져|닥[쳐치]|뒤[져저질])' THEN
    is_suspicious := true;
    reason := 'profanity';
  ELSIF combined_text ~* '(fuck|shit|bitch|asshole|dick\s*head|mother\s*fuck)' THEN
    is_suspicious := true;
    reason := 'profanity';

  -- ② URL / 외부 링크
  ELSIF combined_text ~* '(https?://|www\.|bit\.ly|t\.co|tinyurl|open\.kakao\.com|forms\.gle)' THEN
    is_suspicious := true;
    reason := 'ad_link';

  -- ③ 전화번호 (010-xxxx-xxxx 등)
  ELSIF combined_text ~ '\d{2,4}[-. ]?\d{3,4}[-. ]?\d{4}' THEN
    is_suspicious := true;
    reason := 'phone_number';

  -- ④ 메신저 유도 (단독 언급이 아니라 유도 문맥 조합)
  ELSIF combined_text ~* '(카톡|카카오톡|오픈채팅|텔레그램|telegram|디엠|dm)'
        AND combined_text ~* '(문의|상담|연락|추가|가능|주세요|환영|안내|보내)' THEN
    is_suspicious := true;
    reason := 'contact_inducement';

  -- ⑤ 전형적 광고/사기 문구
  ELSIF combined_text ~* '(무료\s*상담|수익\s*보장|고수익|부업\s*추천|재택\s*부업|투자\s*리딩|주식\s*리딩|코인\s*리딩|원금\s*보장|당일\s*정산|즉시\s*수익|수수료\s*없)' THEN
    is_suspicious := true;
    reason := 'ad_phrase';

  -- ⑥ 시험/문제집 (조합형 — 단독 패턴은 너무 공격적)
  ELSIF combined_text ~ '[①②③④⑤⑴⑵⑶⑷⑸]' AND combined_text ~* '(정답|보기|고르|답을|맞는)' THEN
    is_suspicious := true;
    reason := 'exam_pattern';
  ELSIF combined_text ~* '(다음\s*(중|보기에서).*고르|정답\s*(은|는|이)\s*\d|보기에서\s*(고르|골라|찾아|선택)|옳은\s*것(만|을)|틀린\s*것(만|을))' THEN
    is_suspicious := true;
    reason := 'exam_pattern';
  END IF;

  IF is_suspicious THEN
    NEW.hidden := true;
    IF TG_TABLE_NAME = 'underlines' THEN
      NEW.filter_reason := reason;
    ELSIF TG_TABLE_NAME = 'echoes' THEN
      NEW.filter_reason := reason;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) 트리거: INSERT + UPDATE 모두
DROP TRIGGER IF EXISTS trg_underline_content_filter ON underlines;
CREATE TRIGGER trg_underline_content_filter
  BEFORE INSERT OR UPDATE ON underlines
  FOR EACH ROW
  EXECUTE FUNCTION check_content_filter();

DROP TRIGGER IF EXISTS trg_echo_content_filter ON echoes;
CREATE TRIGGER trg_echo_content_filter
  BEFORE INSERT OR UPDATE ON echoes
  FOR EACH ROW
  EXECUTE FUNCTION check_content_filter();
