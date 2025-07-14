import { AdminSessionManager } from "@/components/admin-session-manager"
import { TestAudioGenerator } from "@/components/test-audio-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminHomePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">관리자 대시보드</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">오디오 파일을 업로드하고 평가 세션을 생성 및 관리할 수 있습니다.</p>
        </CardContent>
      </Card>

      <TestAudioGenerator />
      <AdminSessionManager />
    </div>
  )
}
