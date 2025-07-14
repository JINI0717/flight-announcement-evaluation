import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestConnection } from "@/components/test-connection"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">기내방송 평가 시스템</h1>
        <p className="text-xl text-muted-foreground">전문적인 기내방송 품질 평가를 위한 통합 시스템</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <TestConnection />

        <Card>
          <CardHeader>
            <CardTitle>관리자 페이지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">오디오 파일 업로드 및 세션 관리</p>
            <Button asChild className="w-full">
              <Link href="/admin">관리자 대시보드</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>평가 시작</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">생성된 세션에서 평가를 시작합니다</p>
            <p className="text-sm text-muted-foreground">관리자가 세션을 생성한 후 링크를 공유받으세요</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시스템 특징</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">파일 업로드 시스템</h3>
              <p className="text-sm text-muted-foreground">관리자가 직접 오디오 파일 업로드</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">세션 관리</h3>
              <p className="text-sm text-muted-foreground">평가 세션 생성 및 활성화/비활성화</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">실시간 동시 평가</h3>
              <p className="text-sm text-muted-foreground">최대 20명이 동시에 접속하여 평가 가능</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">세밀한 채점 시스템</h3>
              <p className="text-sm text-muted-foreground">0.5점 단위로 정확한 평가 가능</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">실시간 데이터 분석</h3>
              <p className="text-sm text-muted-foreground">평균, 최고점, 최저점 등 즉시 분석</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">시각화 차트</h3>
              <p className="text-sm text-muted-foreground">항목별 성과를 한눈에 파악</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
