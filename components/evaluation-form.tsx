"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScoreInput } from "./score-input"
import { koreanCriteria, englishCriteria } from "@/lib/evaluation-criteria"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea" // Textarea 임포트
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react" // 체크 아이콘 임포트

interface EvaluationFormProps {
  sessionId: string
  evaluatorId: string
}

// 언어별 카드 배경색 정의
const languageColors = {
  korean: "bg-blue-50 border-blue-200",
  english: "bg-red-50 border-red-200",
}

// 카테고리별 색상 팔레트 (한국어)
const koreanCategoryColors = ["bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500"]
// 카테고리별 색상 팔레트 (영어)
const englishCategoryColors = ["bg-red-100", "bg-red-200", "bg-red-300", "bg-red-400", "bg-red-500"]

export function EvaluationForm({ sessionId, evaluatorId }: EvaluationFormProps) {
  const [koreanScores, setKoreanScores] = useState<Record<string, Record<string, number>>>({})
  const [englishScores, setEnglishScores] = useState<Record<string, Record<string, number>>>({})
  const [koreanComment, setKoreanComment] = useState("") // 한국어 코멘트 상태
  const [englishComment, setEnglishComment] = useState("") // 영어 코멘트 상태
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [koreanSubmitted, setKoreanSubmitted] = useState(false)
  const [englishSubmitted, setEnglishSubmitted] = useState(false)

  const updateKoreanScore = (category: string, item: string, score: number) => {
    setKoreanScores((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: score,
      },
    }))
  }

  const updateEnglishScore = (category: string, item: string, score: number) => {
    setEnglishScores((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: score,
      },
    }))
  }

  const calculateCategoryTotal = (
    categoryName: string,
    scores: Record<string, Record<string, number>>,
    criteria: typeof koreanCriteria | typeof englishCriteria,
  ) => {
    let categoryTotal = 0
    const items = criteria[categoryName]?.items || {}
    for (const item in items) {
      categoryTotal += scores[categoryName]?.[item] || 0
    }
    return categoryTotal
  }

  const calculateOverallTotal = (
    scores: Record<string, Record<string, number>>,
    criteria: typeof koreanCriteria | typeof englishCriteria,
  ) => {
    let overallTotal = 0
    for (const category in criteria) {
      overallTotal += calculateCategoryTotal(category, scores, criteria)
    }
    return overallTotal
  }

  const submitEvaluation = async (language: "korean" | "english") => {
    setIsSubmitting(true)
    try {
      const scores = language === "korean" ? koreanScores : englishScores
      const criteria = language === "korean" ? koreanCriteria : englishCriteria
      const comment = language === "korean" ? koreanComment : englishComment
      const totalScore = calculateOverallTotal(scores, criteria)

      const { error } = await supabase.from("evaluations").upsert({
        session_id: sessionId,
        evaluator_id: evaluatorId,
        language,
        scores,
        total_score: totalScore,
        comments: comment, // 코멘트 추가
      })

      if (error) throw error

      toast({
        title: "✅ 평가 제출 완료!",
        description: `${language === "korean" ? "한국어" : "영어"} 평가가 성공적으로 제출되었습니다.`,
        duration: 3000, // 3초 동안 표시
      })
      if (language === "korean") {
        setKoreanSubmitted(true)
      } else {
        setEnglishSubmitted(true)
      }
      // 제출 후 페이지에 남아있도록 별도의 리다이렉션 없음
    } catch (error) {
      toast({
        title: "❌ 제출 실패",
        description: "평가 제출 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 5000, // 5초 동안 표시
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCriteriaForm = (
    criteria: typeof koreanCriteria | typeof englishCriteria,
    scores: Record<string, Record<string, number>>,
    updateScore: (category: string, item: string, score: number) => void,
    language: "korean" | "english",
    categoryColors: string[],
    comment: string,
    setComment: (comment: string) => void,
  ) => (
    <div className="space-y-6">
      {Object.entries(criteria).map(([category, { items, maxScore }], index) => (
        <Card key={category} className={`border-2 ${categoryColors[index % categoryColors.length]}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{category}</CardTitle>
            <Badge variant="secondary">
              {calculateCategoryTotal(category, scores, criteria).toFixed(1)} / {maxScore}점
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {Object.entries(items).map(([item, itemMaxScore]) => (
              <ScoreInput
                key={item}
                label={item}
                maxScore={itemMaxScore}
                value={scores[category]?.[item] || 0}
                onChange={(score) => updateScore(category, item, score)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* 코멘트 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">코멘트</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor={`${language}-comment`} className="sr-only">
            {language === "korean" ? "한국어 코멘트" : "영어 코멘트"}
          </Label>
          <Textarea
            id={`${language}-comment`}
            placeholder="추가적인 코멘트를 남겨주세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div
        className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg border-2 ${languageColors[language]}`}
      >
        <div className="text-lg font-semibold mb-2 sm:mb-0">
          총점: {calculateOverallTotal(scores, criteria).toFixed(1)} / 100점
        </div>
        <Button
          onClick={() => submitEvaluation(language)}
          disabled={isSubmitting || (language === "korean" ? koreanSubmitted : englishSubmitted)}
          size="lg"
          className={
            (language === "korean" ? koreanSubmitted : englishSubmitted)
              ? "bg-green-500 hover:bg-green-600 text-white"
              : ""
          }
        >
          {isSubmitting ? (
            "제출 중..."
          ) : (language === "korean" ? koreanSubmitted : englishSubmitted) ? (
            <>
              <Check className="w-4 h-4 mr-2" /> 평가 완료
            </>
          ) : (
            "평가 제출"
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <Tabs defaultValue="korean" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="korean">한국어 평가</TabsTrigger>
        <TabsTrigger value="english">영어 평가</TabsTrigger>
      </TabsList>

      <TabsContent value="korean" className={`space-y-6 p-2 rounded-lg border-2 ${languageColors.korean}`}>
        {renderCriteriaForm(
          koreanCriteria,
          koreanScores,
          updateKoreanScore,
          "korean",
          koreanCategoryColors,
          koreanComment,
          setKoreanComment,
        )}
      </TabsContent>

      <TabsContent value="english" className={`space-y-6 p-2 rounded-lg border-2 ${languageColors.english}`}>
        {renderCriteriaForm(
          englishCriteria,
          englishScores,
          updateEnglishScore,
          "english",
          englishCategoryColors,
          englishComment,
          setEnglishComment,
        )}
      </TabsContent>
    </Tabs>
  )
}
