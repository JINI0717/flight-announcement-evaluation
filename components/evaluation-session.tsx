"use client"

import { useState, useEffect } from "react"
import { AudioPlayer } from "./audio-player"
import { EvaluationForm } from "./evaluation-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

interface EvaluationSessionProps {
  sessionId: string
  evaluatorId: string
}

interface SessionData {
  id: string
  title: string
  audio_url: string | null
}

export function EvaluationSession({ sessionId, evaluatorId }: EvaluationSessionProps) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{session.title}</CardTitle>
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

      <EvaluationForm sessionId={sessionId} evaluatorId={evaluatorId} />
    </div>
  )
}
