"use client"

import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group" // ToggleGroup 임포트

interface ScoreInputProps {
  label: string
  maxScore: number
  value: number
  onChange: (value: number) => void
}

export function ScoreInput({ label, maxScore, value, onChange }: ScoreInputProps) {
  const step = 0.5
  const options: number[] = []
  for (let i = 0; i <= maxScore * (1 / step); i++) {
    options.push(i * step)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} ({value.toFixed(1)} / {maxScore}점)
      </Label>
      <ToggleGroup
        type="single"
        value={value.toString()}
        onValueChange={(newValue) => {
          if (newValue !== undefined) {
            onChange(Number.parseFloat(newValue))
          }
        }}
        className="flex flex-wrap gap-1 justify-start" // 버튼들이 유연하게 배치되도록 flex-wrap 추가
      >
        {options.map((score) => (
          <ToggleGroupItem
            key={score}
            value={score.toString()}
            aria-label={`${score}점`}
            className="h-8 px-3 text-xs sm:text-sm" // 버튼 크기 조정
          >
            {score.toFixed(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
