-- 샘플 오디오 URL로 세션 업데이트
UPDATE evaluation_sessions 
SET audio_url = '/sample-audio.mp3'
WHERE title = '2024년 1월 기내방송 평가';

-- 또는 새로운 세션 생성
INSERT INTO evaluation_sessions (id, title, audio_url, created_by) VALUES 
('session-1', '기내방송 평가 테스트', '/sample-audio.mp3', (SELECT id FROM evaluators WHERE is_admin = TRUE LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  audio_url = EXCLUDED.audio_url;
