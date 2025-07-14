import { EvaluationSession } from "@/components/evaluation-session"

// 실제 구현에서는 사용자 인증을 통해 evaluatorId를 가져와야 합니다
const MOCK_EVALUATOR_ID = "evaluator-1"

export default function EvaluationPage({ params }: { params: { sessionId: string } }) {
  return <EvaluationSession sessionId={params.sessionId} evaluatorId={MOCK_EVALUATOR_ID} />
}
