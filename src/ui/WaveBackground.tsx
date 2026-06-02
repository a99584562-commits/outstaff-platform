import { useEffect, useRef } from 'react'

/**
 * Анимированный фон «дата-волна» из точек (в духе big-data визуализаций).
 * Лёгкий светло-голубой, рисуется на canvas, сидит фиксированным слоем
 * позади всего контента. Уважает prefers-reduced-motion и паузу вкладки.
 */
export default function WaveBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let mobile = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // мерцающие частицы-искры над волной
    let sparks: { x: number; y: number; r: number; ph: number; sp: number }[] = []
    function seedSparks() {
      const n = mobile ? 48 : 110
      sparks = Array.from({ length: n }, () => ({
        x: Math.random(),
        y: 0.28 + Math.random() * 0.68,
        r: 1.1 + Math.random() * 2.6,
        ph: Math.random() * 6.28,
        sp: 0.6 + Math.random() * 1.6,
      }))
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas!.clientWidth
      h = canvas!.clientHeight
      mobile = w < 640
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedSparks()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function render(t: number) {
      ctx!.clearRect(0, 0, w, h)
      const COLS = mobile ? 58 : 108
      const ROWS = mobile ? 30 : 46
      const cx = w * 0.5
      const horizon = h * 0.26

      for (let i = 0; i < ROWS; i++) {
        const p = Math.pow(i / (ROWS - 1), 1.7) // перспектива: ближе к низу — плотнее/крупнее
        const rowY = horizon + p * (h - horizon)
        const size = 0.6 + p * 2.5
        const baseA = 0.07 + p * 0.42
        for (let j = 0; j < COLS; j++) {
          const jx = j / (COLS - 1) - 0.5
          const x = cx + jx * w * (0.32 + p * 1.3)
          if (x < -20 || x > w + 20) continue
          const wave =
            Math.sin(jx * 5 + i * 0.42 - t * 0.9) * 0.62 +
            Math.sin(jx * 2.6 - i * 0.26 + t * 0.7) * 0.42 +
            Math.sin(jx * 9 + i * 0.15 + t * 1.1) * 0.18
          const y = rowY - wave * (10 + p * 82)
          const crest = Math.min(1, Math.max(0, wave * 0.5 + 0.5)) // 0..1, гребень волны ярче
          const a = baseA * (0.32 + 0.68 * crest)
          ctx!.fillStyle = `rgba(${78 + crest * 48}, ${132 + crest * 56}, ${214 + crest * 36}, ${a})`
          ctx!.beginPath()
          ctx!.arc(x, y, size, 0, 6.2832)
          ctx!.fill()
        }
      }

      // искры со свечением
      ctx!.shadowColor = 'rgba(150, 195, 255, 0.9)'
      for (const s of sparks) {
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph)
        const a = 0.18 + tw * 0.72
        const x = s.x * w
        const y = s.y * h
        ctx!.shadowBlur = 6 + tw * 10
        ctx!.fillStyle = `rgba(${205 + tw * 45}, ${225 + tw * 25}, 255, ${a})`
        ctx!.beginPath()
        ctx!.arc(x, y, s.r * (0.7 + tw * 0.7), 0, 6.2832)
        ctx!.fill()
      }
      ctx!.shadowBlur = 0
    }

    let last = 0
    function frame(ts: number) {
      raf = requestAnimationFrame(frame)
      if (ts - last < 33) return // ~30 fps — плавно и щадяще для батареи
      last = ts
      render(ts * 0.001)
    }

    if (reduce) {
      render(0)
    } else {
      raf = requestAnimationFrame(frame)
    }

    function onVis() {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />
}
