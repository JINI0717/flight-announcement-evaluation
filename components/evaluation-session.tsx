"use client"

import { useState, useEffect } from "react"
import { AudioPlayer } from "./audio-player"
import { EvaluationForm } from "./evaluation-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid" // UUID 생성 라이브러리

interface EvaluationSessionProps {
  sessionId: string
}

interface SessionData {
  id: string
  title: string
  audio_url: string | null
}

export function EvaluationSession({ sessionId }: EvaluationSessionProps) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [evaluatorName, setEvaluatorName] = useState("")
  const [currentEvaluatorId, setCurrentEvaluatorId] = useState<string | null>(null)
  const [isNameSubmitting, setIsNameSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluation_sessions")
        .select("id, title, audio_url")
        .eq("id", sessionId)
        .single()

      if (error) throw error
      setSession(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNameSubmit = async () => {
    if (!evaluatorName.trim()) {
      toast({
        title: "이름 입력 오류",
        description: "평가자 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsNameSubmitting(true)
    try {
      // 1. 기존 평가자 이름으로 조회
      const { data: existingEvaluator, error: fetchError } = await supabase
        .from("evaluators")
        .select("id")
        .eq("name", evaluatorName.trim())
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116은 데이터 없음 오류
        throw fetchError
      }

      let evaluatorIdToUse: string
      if (existingEvaluator) {
        // 2. 기존 평가자가 있다면 해당 ID 사용
        evaluatorIdToUse = existingEvaluator.id
      } else {
        // 3. 기존 평가자가 없다면 새로 생성
        const uniqueEmail = `guest-${uuidv4()}@example.com` // 고유한 이메일 생성
        const { data: newEvaluator, error: insertError } = await supabase
          .from("evaluators")
          .insert({ name: evaluatorName.trim(), email: uniqueEmail, is_admin: false })
          .select("id")
          .single()

        if (insertError) throw insertError
        evaluatorIdToUse = newEvaluator.id
      }

      setCurrentEvaluatorId(evaluatorIdToUse)
      toast({
        title: "평가 시작",
        description: `${evaluatorName}님, 평가를 시작합니다.`,
      })
    } catch (error: any) {
      toast({
        title: "평가자 설정 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsNameSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">세션을 불러올 수 없습니다: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentEvaluatorId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">평가자 이름 입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">평가를 시작하기 전에 이름을 입력해주세요.</p>
            <div>
              <Label htmlFor="evaluator-name">이름</Label>
              <Input
                id="evaluator-name"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="예: 홍길동"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleNameSubmit()
                  }
                }}
              />
            </div>
            <Button onClick={handleNameSubmit} disabled={isNameSubmitting} className="w-full">
              {isNameSubmitting ? "확인 중..." : "평가 시작"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{session.title}</CardTitle>
          <p className="text-muted-foreground">평가자: {evaluatorName}</p>
        </CardHeader>
        <CardContent>
          {session.audio_url ? (
            <AudioPlayer src={session.audio_url} />
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
              오디오 파일이 설정되지 않았습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <EvaluationForm sessionId={sessionId} evaluatorId={currentEvaluatorId} />
    </div>
  )
}
