-- 평가자 테이블
CREATE TABLE evaluators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 평가 세션 테이블
CREATE TABLE evaluation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  audio_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES evaluators(id)
);

-- 평가 결과 테이블
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES evaluation_sessions(id),
  evaluator_id UUID REFERENCES evaluators(id),
  language VARCHAR(10) NOT NULL CHECK (language IN ('korean', 'english')),
  scores JSONB NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, evaluator_id, language)
);

-- 샘플 데이터 삽입
INSERT INTO evaluators (name, email, is_admin) VALUES 
('관리자', 'admin@example.com', TRUE),
('평가자1', 'evaluator1@example.com', FALSE),
('평가자2', 'evaluator2@example.com', FALSE);

INSERT INTO evaluation_sessions (title, audio_url, created_by) VALUES 
('2024년 1월 기내방송 평가', '/sample-audio.mp3', (SELECT id FROM evaluators WHERE is_admin = TRUE LIMIT 1));
