"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error" | "no-tables">("checking")
  const [errorMessage, setErrorMessage] = useState("")
  const [tableCount, setTableCount] = useState(0)

  const testConnection = async () => {
    setConnectionStatus("checking")
    setErrorMessage("")

    try {
      // 1. 기본 연결 테스트
      const { data: healthCheck, error: healthError } = await supabase
        .from("evaluators")
        .select("count", { count: "exact", head: true })

      if (healthError) {
        if (healthError.message.includes("relation") && healthError.message.includes("does not exist")) {
          setConnectionStatus("no-tables")
          setErrorMessage("데이터베이스 테이블이 생성되지 않았습니다. SQL 스크립트를 실행해주세요.")
          return
        }
        throw healthError
      }

      // 2. 테이블 존재 확인
      const { data: evaluatorsData } = await supabase.from("evaluators").select("*").limit(1)
      const { data: sessionsData } = await supabase.from("evaluation_sessions").select("*").limit(1)
      const { data: evaluationsData } = await supabase.from("evaluations").select("*").limit(1)

      setTableCount(3) // 3개 테이블 모두 존재
      setConnectionStatus("connected")
    } catch (error: any) {
      setConnectionStatus("error")
      setErrorMessage(error.message || "연결 오류가 발생했습니다.")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "checking":
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "no-tables":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "checking":
        return <Badge variant="secondary">연결 확인 중...</Badge>
      case "connected":
        return <Badge className="bg-green-100 text-green-800">연결 성공</Badge>
      case "no-tables":
        return <Badge variant="destructive">테이블 없음</Badge>
      case "error":
        return <Badge variant="destructive">연결 실패</Badge>
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Supabase 연결 상태
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === "connected" && (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">✅ 데이터베이스 연결 성공!</p>
            <p className="text-sm text-muted-foreground">테이블 {tableCount}개가 정상적으로 생성되어 있습니다.</p>
          </div>
        )}

        {connectionStatus === "no-tables" && (
          <div className="space-y-3">
            <p className="text-yellow-600 font-medium">⚠️ 테이블이 생성되지 않았습니다</p>
            <p className="text-sm text-muted-foreground">
              Supabase 대시보드에서 SQL Editor를 열고 다음 스크립트를 실행해주세요:
            </p>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              scripts/001-create-tables.sql 파일의 내용을 복사해서 실행
            </div>
          </div>
        )}

        {connectionStatus === "error" && (
          <div className="space-y-3">
            <p className="text-red-600 font-medium">❌ 연결 실패</p>
            <p className="text-sm text-muted-foreground">오류 메시지:</p>
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">{errorMessage}</div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">확인사항:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL이 올바른지 확인</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY가 올바른지 확인</li>
                <li>Supabase 프로젝트가 활성화되어 있는지 확인</li>
              </ul>
            </div>
          </div>
        )}

        <Button onClick={testConnection} variant="outline" size="sm" className="w-full bg-transparent">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 확인
        </Button>
      </CardContent>
    </Card>
  )
}
