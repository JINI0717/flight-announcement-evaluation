"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileAudio, Trash2 } from "lucide-react"

interface AudioFile {
  name: string
  url: string
  size: number
  created_at: string
}

interface Session {
  id: string
  title: string
  audio_url: string | null
  is_active: boolean
  created_at: string
}

export function AdminSessionManager() {
  const [title, setTitle] = useState("")
  const [selectedAudioUrl, setSelectedAudioUrl] = useState("")
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminEvaluatorId, setAdminEvaluatorId] = useState<string | null>(null) // 관리자 ID 상태 추가
  const { toast } = useToast()

  useEffect(() => {
    fetchAdminEvaluatorId() // 관리자 ID 가져오기
    fetchAudioFiles()
    fetchSessions()
  }, [])

  const fetchAdminEvaluatorId = async () => {
    try {
      const { data, error } = await supabase.from("evaluators").select("id").eq("is_admin", true).limit(1).single()

      if (error) throw error
      setAdminEvaluatorId(data.id)
    } catch (error: any) {
      console.error("Error fetching admin evaluator ID:", error)
      toast({
        title: "관리자 ID 로드 실패",
        description: "세션 생성을 위해 관리자 ID를 가져올 수 없습니다. evaluators 테이블을 확인해주세요.",
        variant: "destructive",
      })
    }
  }

  const fetchAudioFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from("audio-files").list()

      if (error) throw error

      const filesWithUrls = data.map((file) => ({
        name: file.name,
        url: supabase.storage.from("audio-files").getPublicUrl(file.name).data.publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at || "",
      }))

      setAudioFiles(filesWithUrls)
    } catch (error: any) {
      console.error("Error fetching audio files:", error)
    }
  }

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluation_sessions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error: any) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "파일 형식 오류",
        description: "오디오 파일만 업로드 가능합니다.",
        variant: "destructive",
      })
      return
    }

    // 파일 크기 검증 (50MB 제한)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "파일 크기 오류",
        description: "파일 크기는 50MB 이하여야 합니다.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("audio-files").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      toast({
        title: "업로드 완료",
        description: `${file.name} 파일이 성공적으로 업로드되었습니다.`,
      })

      // 파일 목록 새로고침
      await fetchAudioFiles()

      // 파일 입력 초기화
      event.target.value = ""
    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm("정말로 이 파일을 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.storage.from("audio-files").remove([fileName])

      if (error) throw error

      toast({
        title: "삭제 완료",
        description: "파일이 삭제되었습니다.",
      })

      await fetchAudioFiles()
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCreateSession = async () => {
    if (!title || !selectedAudioUrl) {
      toast({
        title: "입력 오류",
        description: "세션 제목과 오디오 파일을 모두 선택해주세요.",
        variant: "destructive",
      })
      return
    }
    if (!adminEvaluatorId) {
      toast({
        title: "오류",
        description: "관리자 ID를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("evaluation_sessions").insert({
        title,
        audio_url: selectedAudioUrl,
        created_by: adminEvaluatorId, // 실제 관리자 ID 사용
      })

      if (error) throw error

      toast({
        title: "세션 생성 완료",
        description: "새로운 평가 세션이 생성되었습니다.",
      })

      setTitle("")
      setSelectedAudioUrl("")
      await fetchSessions()
    } catch (error: any) {
      toast({
        title: "세션 생성 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleSessionStatus = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("evaluation_sessions")
        .update({ is_active: !currentStatus })
        .eq("id", sessionId)

      if (error) throw error

      toast({
        title: "상태 변경 완료",
        description: `세션이 ${!currentStatus ? "활성화" : "비활성화"}되었습니다.`,
      })

      await fetchSessions()
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      {/* 파일 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            오디오 파일 업로드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="audio-upload">오디오 파일 선택</Label>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">지원 형식: MP3, WAV, M4A 등 (최대 50MB)</p>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                업로드 중...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 업로드된 파일 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            업로드된 파일 ({audioFiles.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {audioFiles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">업로드된 파일이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {audioFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <audio controls className="h-8">
                      <source src={file.url} />
                    </audio>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 새 세션 생성 */}
      <Card>
        <CardHeader>
          <CardTitle>새 평가 세션 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-title">세션 제목</Label>
            <Input
              id="session-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024년 2월 기내방송 평가"
            />
          </div>

          <div>
            <Label htmlFor="audio-select">오디오 파일 선택</Label>
            <Select value={selectedAudioUrl} onValueChange={setSelectedAudioUrl}>
              <SelectTrigger>
                <SelectValue placeholder="업로드된 파일 중 선택" />
              </SelectTrigger>
              <SelectContent>
                {audioFiles.map((file) => (
                  <SelectItem key={file.url} value={file.url}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateSession}
            className="w-full"
            disabled={!title || !selectedAudioUrl || !adminEvaluatorId}
          >
            세션 생성
          </Button>
        </CardContent>
      </Card>

      {/* 기존 세션 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>평가 세션 목록 ({sessions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">생성된 세션이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{session.title}</h3>
                      <Badge variant={session.is_active ? "default" : "secondary"}>
                        {session.is_active ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      생성일: {new Date(session.created_at).toLocaleDateString()}
                    </p>
                    {session.audio_url && (
                      <audio controls className="mt-2 h-8">
                        <source src={session.audio_url} />
                      </audio>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSessionStatus(session.id, session.is_active)}
                    >
                      {session.is_active ? "비활성화" : "활성화"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/evaluation/${session.id}`} target="_blank" rel="noopener noreferrer">
                        평가 페이지
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/${session.id}`} target="_blank" rel="noopener noreferrer">
                        결과 보기
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
