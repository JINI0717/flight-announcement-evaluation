"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScoreInputProps {
  label: string
  maxScore: number
  value: number
  onChange: (value: number) => void
}

export function ScoreInput({ label, maxScore, value, onChange }: ScoreInputProps) {
  const options = []
  for (let i = 0; i <= maxScore * 2; i++) {
    options.push(i / 2)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} (최대 {maxScore}점)
      </Label>
      <Select value={value.toString()} onValueChange={(v) => onChange(Number.parseFloat(v))}>
        <SelectTrigger>
          <SelectValue placeholder="점수 선택" />
        </SelectTrigger>
        <SelectContent>
          {options.map((score) => (
            <SelectItem key={score} value={score.toString()}>
              {score}점
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
