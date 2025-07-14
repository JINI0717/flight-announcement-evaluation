"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TestAudioGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTestAudio = () => {
    setIsGenerating(true)

    // Web Audio API를 사용해서 테스트용 오디오 생성
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const duration = 10 // 10초
    const sampleRate = audioContext.sampleRate
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // 간단한 톤 생성 (440Hz)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3
    }

    // WAV 파일로 변환
    const wavBuffer = audioBufferToWav(buffer)
    const blob = new Blob([wavBuffer], { type: "audio/wav" })

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "test-audio.wav"
    a.click()

    setIsGenerating(false)
  }

  // AudioBuffer를 WAV 형식으로 변환하는 함수
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const length = buffer.length
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate

    // WAV 헤더 작성
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, "RIFF")
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, "WAVE")
    writeString(12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, "data")
    view.setUint32(40, length * 2, true)

    // 오디오 데이터 작성
    const channelData = buffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7fff, true)
      offset += 2
    }

    return arrayBuffer
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>테스트용 오디오 생성</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">테스트용 오디오 파일이 없다면 간단한 톤 파일을 생성할 수 있습니다.</p>
        <Button onClick={generateTestAudio} disabled={isGenerating}>
          {isGenerating ? "생성 중..." : "테스트 오디오 생성 (10초)"}
        </Button>
      </CardContent>
    </Card>
  )
}
