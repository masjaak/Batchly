import { useState, useCallback } from 'react'

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface VoiceInputProps {
  onResult: (value: number) => void
  disabled?: boolean
}

const SUPPORTS_VOICE = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

export default function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = useCallback(() => {
    if (listening || !SUPPORTS_VOICE) return

    setError(null)
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setError('Browser tidak mendukung')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'id-ID'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') {
        setError('Izin mikrofon ditolak')
      } else if (event.error === 'no-speech') {
        setError('Tidak terdeteksi. Coba lagi.')
      } else {
        setError('Gagal: ' + event.error)
      }
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase()
      // Parse Indonesian number words to digits
      const number = parseIndonesianNumber(transcript)
      if (number !== null && !isNaN(number)) {
        onResult(number)
        setError(null)
      } else {
        setError('Tidak terbaca: "' + transcript + '". Coba angka saja.')
      }
    }

    recognition.start()
  }, [listening, onResult])

  if (!SUPPORTS_VOICE) return null

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || listening}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${
          listening
            ? 'bg-danger text-white animate-pulse'
            : 'bg-surface-muted text-secondary hover:bg-border'
        }`}
        title={listening ? 'Mendengarkan...' : 'Input suara'}
      >
        {listening ? '◉' : '♪'}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}

function parseIndonesianNumber(text: string): number | null {
  const numberMap: Record<string, number> = {
    'nol': 0, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4,
    'lima': 5, 'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9,
    'sepuluh': 10, 'sebelas': 11,
    'seratus': 100, 'seribu': 1000,
  }
  const multipliers: Record<string, number> = {
    'belas': 10, 'puluh': 10, 'ratus': 100, 'ribu': 1000,
  }

  // Direct number match
  if (numberMap[text] !== undefined) return numberMap[text]

  // Try to parse as digits first
  const asNumber = parseFloat(text.replace(',', '.'))
  if (!isNaN(asNumber)) return asNumber

  // Clean up: remove filler words
  const clean = text.replace(/^(angka|nomor|jumlah|isi|tolong)\s+/i, '')

  // Try "dua belas" format (word + belas)
  const belasMatch = clean.match(/^(\w+)\s+(belas)$/)
  if (belasMatch) {
    const base = numberMap[belasMatch[1]]
    if (base !== undefined && base > 0) return base + 10
    return null
  }

  // Try "dua puluh" format
  const puluhMatch = clean.match(/^(\w+)\s+(puluh)$/)
  if (puluhMatch) {
    const base = numberMap[puluhMatch[1]]
    if (base !== undefined) return base * 10
    return null
  }

  // Try "dua puluh lima" format
  const compoundMatch = clean.match(/^(\w+)\s+(puluh|belas|ratus)\s+(\w+)$/)
  if (compoundMatch) {
    const base = numberMap[compoundMatch[1]]
    const multiplier = multipliers[compoundMatch[2]] || 1
    const remainder = numberMap[compoundMatch[3]]
    if (base !== undefined && remainder !== undefined) {
      return base * multiplier + remainder
    }
    return null
  }

  // "nol koma lima" = 0.5
  const komaMatch = clean.match(/^(\w+)\s+koma\s+(\w+)$/)
  if (komaMatch) {
    const whole = numberMap[komaMatch[1]] ?? parseFloat(komaMatch[1])
    const frac = numberMap[komaMatch[2]] ?? parseFloat(komaMatch[2])
    if (typeof whole === 'number' && typeof frac === 'number') {
      return whole + frac / 10
    }
  }

  return null
}
