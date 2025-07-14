"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EvaluationData {
  id: string
  evaluator_name: string
  language: "korean" | "english"
  scores: Record<string, Record<string, number>>
  total_score: number
  comments: string | null // 코멘트 필드 추가
  submitted_at: string
}

// 언어별 카드 배경색 정의 (AdminDashboard에서도 사용)
const languageColors = {
  korean: "bg-blue-50 border-blue-200",
  english: "bg-red-50 border-red-200",
}

export function AdminDashboard({ sessionId }: { sessionId: string }) {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvaluations()

    // 실시간 업데이트 구독
    const subscription = supabase
      .channel("evaluations")
      .on("postgres_changes", { event: "*", schema: "public", table: "evaluations" }, () => fetchEvaluations())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionId])

  const fetchEvaluations = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluators!inner(name)
        `)
        .eq("session_id", sessionId)

      if (error) throw error

      const formattedData = data.map((item) => ({
        id: item.id,
        evaluator_name: item.evaluators.name,
        language: item.language,
        scores: item.scores,
        total_score: item.total_score,
        comments: item.comments, // 코멘트 데이터 포함
        submitted_at: item.submitted_at,
      }))

      setEvaluations(formattedData)
    } catch (error) {
      console.error("Error fetching evaluations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLanguageStats = (language: "korean" | "english") => {
    const langEvaluations = evaluations.filter((e) => e.language === language)

    if (langEvaluations.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 }
    }

    const scores = langEvaluations.map((e) => e.total_score)
    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
    }
  }

  const getCategoryStats = (language: "korean" | "english") => {
    const langEvaluations = evaluations.filter((e) => e.language === language)

    if (langEvaluations.length === 0) return []

    const categories = new Set<string>()
    langEvaluations.forEach((e) => {
      Object.keys(e.scores).forEach((cat) => categories.add(cat))
    })

    return Array.from(categories).map((category) => {
      const categoryScores = langEvaluations.map((e) => {
        const categoryScore = Object.values(e.scores[category] || {}).reduce((a, b) => a + b, 0)
        return categoryScore
      })

      return {
        category,
        average: categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length,
        min: Math.min(...categoryScores),
        max: Math.max(...categoryScores),
      }
    })
  }

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>
  }

  const koreanStats = getLanguageStats("korean")
  const englishStats = getLanguageStats("english")
  const koreanCategoryStats = getCategoryStats("korean")
  const englishCategoryStats = getCategoryStats("english")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">한국어 평가 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{koreanStats.count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">영어 평가 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{englishStats.count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">한국어 평균</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{koreanStats.average.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              최저: {koreanStats.min} / 최고: {koreanStats.max}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">영어 평균</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{englishStats.average.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              최저: {englishStats.min} / 최고: {englishStats.max}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="korean-chart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="korean-chart">한국어 차트</TabsTrigger>
          <TabsTrigger value="english-chart">영어 차트</TabsTrigger>
          <TabsTrigger value="korean-detail">한국어 상세</TabsTrigger>
          <TabsTrigger value="english-detail">영어 상세</TabsTrigger>
        </TabsList>

        <TabsContent value="korean-chart">
          <Card>
            <CardHeader>
              <CardTitle>한국어 평가 항목별 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={koreanCategoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8884d8" name="평균" />
                  <Bar dataKey="min" fill="#82ca9d" name="최저" />
                  <Bar dataKey="max" fill="#ffc658" name="최고" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="english-chart">
          <Card>
            <CardHeader>
              <CardTitle>영어 평가 항목별 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={englishCategoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8884d8" name="평균" />
                  <Bar dataKey="min" fill="#82ca9d" name="최저" />
                  <Bar dataKey="max" fill="#ffc658" name="최고" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="korean-detail">
          <div className="space-y-4">
            {evaluations
              .filter((e) => e.language === "korean")
              .map((evaluation) => (
                <Card key={evaluation.id} className={`border-2 ${languageColors.korean}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{evaluation.evaluator_name}</CardTitle>
                      <Badge variant="secondary">{evaluation.total_score.toFixed(1)}점</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(evaluation.scores).map(([category, items]) => (
                        <div key={category} className="p-3 bg-muted rounded">
                          <div className="font-medium mb-2">{category}</div>
                          <div className="text-sm space-y-1">
                            {Object.entries(items).map(([item, score]) => (
                              <div key={item} className="flex justify-between">
                                <span>{item}:</span>
                                <span>{score}점</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {evaluation.comments && (
                      <div className="mt-4 p-3 bg-blue-100 rounded text-sm">
                        <div className="font-medium mb-1">코멘트:</div>
                        <p className="whitespace-pre-wrap">{evaluation.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="english-detail">
          <div className="space-y-4">
            {evaluations
              .filter((e) => e.language === "english")
              .map((evaluation) => (
                <Card key={evaluation.id} className={`border-2 ${languageColors.english}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{evaluation.evaluator_name}</CardTitle>
                      <Badge variant="secondary">{evaluation.total_score.toFixed(1)}점</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(evaluation.scores).map(([category, items]) => (
                        <div key={category} className="p-3 bg-muted rounded">
                          <div className="font-medium mb-2">{category}</div>
                          <div className="text-sm space-y-1">
                            {Object.entries(items).map(([item, score]) => (
                              <div key={item} className="flex justify-between">
                                <span>{item}:</span>
                                <span>{score}점</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {evaluation.comments && (
                      <div className="mt-4 p-3 bg-red-100 rounded text-sm">
                        <div className="font-medium mb-1">코멘트:</div>
                        <p className="whitespace-pre-wrap">{evaluation.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
