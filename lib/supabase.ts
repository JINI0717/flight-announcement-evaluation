import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://PLACEHOLDER.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "PLACEHOLDER_ANON_KEY"

// Warn during development/preview if env vars are missing.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Environment variables are missing. " +
      "Using placeholder credentials—data operations will be NO-OP in preview. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect.",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      evaluators: {
        Row: {
          id: string
          name: string
          email: string
          is_admin: boolean
          created_at: string
        }
      }
      evaluation_sessions: {
        Row: {
          id: string
          title: string
          audio_url: string | null
          is_active: boolean
          created_at: string
          created_by: string
        }
      }
      evaluations: {
        Row: {
          id: string
          session_id: string
          evaluator_id: string
          language: "korean" | "english"
          scores: any
          total_score: number
          comments: string | null // comments 필드 추가
          submitted_at: string
        }
      }
    }
  }
}
