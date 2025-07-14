import { EvaluationSession } from "@/components/evaluation-session"

export default function EvaluationPage({ params }: { params: { sessionId: string } }) {
  // 평가자 ID는 EvaluationSession 컴포넌트 내부에서 이름 입력 후 관리됩니다.
  return <EvaluationSession sessionId={params.sessionId} />
}
