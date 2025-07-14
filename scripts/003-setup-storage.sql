-- Supabase Storage 버킷 생성 (Supabase 대시보드에서 실행)
-- 1. Storage > Buckets > Create Bucket
-- 2. Name: "audio-files"
-- 3. Public: true (모든 사용자가 접근 가능)

-- RLS 정책 설정 (보안)
-- 업로드: 관리자만 가능
CREATE POLICY "Admin can upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND
  auth.uid() IN (SELECT id FROM evaluators WHERE is_admin = true)
);

-- 다운로드: 모든 사용자 가능
CREATE POLICY "Anyone can download audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-files');

-- 삭제: 관리자만 가능
CREATE POLICY "Admin can delete audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-files' AND
  auth.uid() IN (SELECT id FROM evaluators WHERE is_admin = true)
);
