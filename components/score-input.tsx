"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ScoreInputProps {
  label: string
  maxScore: number
  value: number
  onChange: (value: number) => void
}

export function ScoreInput({ label, maxScore, value, onChange }: ScoreInputProps) {
  const step = 0.5
  const min = 0

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} ({value.toFixed(1)} / {maxScore}점)
      </Label>
      <Slider
        min={min}
        max={maxScore}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="w-full"
      />
    </div>
  )
}
