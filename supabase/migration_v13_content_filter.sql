-- ─── 이듬 1차 콘텐츠 필터 (DB trigger) ───
-- 명백한 욕설, 광고, 문제집 패턴만 잡는 거름망
-- insert 시에만 실행, 정규식 매칭으로 성능 부담 없음

CREATE OR REPLACE FUNCTION check_content_filter()
RETURNS trigger AS $$
DECLARE
  combined_text text;
  is_suspicious boolean := false;
BEGIN
  -- underlines: quote + feeling 합침
  IF TG_TABLE_NAME = 'underlines' THEN
    combined_text := COALESCE(NEW.quote, '') || ' ' || COALESCE(NEW.feeling, '');
  -- echoes: text만
  ELSIF TG_TABLE_NAME = 'echoes' THEN
    combined_text := COALESCE(NEW.text, '');
  ELSE
    RETURN NEW;
  END IF;

  combined_text := lower(combined_text);

  -- 1) 욕설 (한국어 기본 + 변형)
  IF combined_text ~* '시[발팔]|씨[발팔]|씹|좆|지랄|개새끼|병[신싄]|ㅅㅂ|ㅆㅂ|ㅂㅅ|ㅈㄹ|존나|졸라' THEN
    is_suspicious := true;
  -- 2) 광고 (URL, 전화번호, 메신저)
  ELSIF combined_text ~ 'https?://|bit\.ly|t\.co|tinyurl' THEN
    is_suspicious := true;
  ELSIF combined_text ~ '\d{2,4}[-. ]?\d{3,4}[-. ]?\d{4}' THEN
    is_suspicious := true;
  ELSIF combined_text ~* '카톡|텔레그램|telegram|무료\s*상담|수익.*보장' THEN
    is_suspicious := true;
  -- 3) 문제집/시험
  ELSIF combined_text ~* '다음\s*(중|보기|문장|글)|정답[은는이가]|보기에서\s*(골|찾|선택)|밑줄\s*친\s*부분' THEN
    is_suspicious := true;
  ELSIF combined_text ~ '[①②③④⑤⑴⑵⑶⑷⑸]' THEN
    is_suspicious := true;
  END IF;

  IF is_suspicious THEN
    NEW.hidden := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- underlines에 trigger 연결
DROP TRIGGER IF EXISTS trg_underline_content_filter ON underlines;
CREATE TRIGGER trg_underline_content_filter
  BEFORE INSERT ON underlines
  FOR EACH ROW
  EXECUTE FUNCTION check_content_filter();

-- echoes에 trigger 연결
DROP TRIGGER IF EXISTS trg_echo_content_filter ON echoes;
CREATE TRIGGER trg_echo_content_filter
  BEFORE INSERT ON echoes
  FOR EACH ROW
  EXECUTE FUNCTION check_content_filter();
