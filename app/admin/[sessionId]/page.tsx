import { AdminDashboard } from "@/components/admin-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage({ params }: { params: { sessionId: string } }) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">평가 결과 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">실시간으로 업데이트되는 평가 결과를 확인하고 분석할 수 있습니다.</p>
        </CardContent>
      </Card>

      <AdminDashboard sessionId={params.sessionId} />
    </div>
  )
}
