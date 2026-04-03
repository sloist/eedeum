-- v16: 한줄 나만보기 (비공개) 기능
ALTER TABLE underlines ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
