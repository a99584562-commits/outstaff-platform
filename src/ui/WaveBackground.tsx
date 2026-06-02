import { useEffect, useRef } from 'react'

/**
 * Анимированный фон «дата-волна» из точек.
 * Оптимизирован: точки батчатся по уровням прозрачности (одна заливка на слой
 * вместо тысяч вызовов arc), свечение искр — через заранее отрисованный спрайт
 * (без дорогого shadowBlur). ~30fps, пауза вкладки, уважает reduced-motion.
 */
export default function WaveBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let mobile = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // спрайт свечения для искр (рисуется один раз)
    const glow = document.createElement('canvas')
    glow.width = glow.height = 32
    const gctx = glow.getContext('2d')!
    const grd = gctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grd.addColorStop(0, 'rgba(225, 238, 255, 1)')
    grd.addColorStop(0.35, 'rgba(180, 210, 255, 0.6)')
    grd.addColorStop(1, 'rgba(160, 200, 255, 0)')
    gctx.fillStyle = grd
    gctx.fillRect(0, 0, 32, 32)

    let sparks: { x: number; y: number; r: number; ph: number; sp: number }[] = []
    function seedSparks() {
      const n = mobile ? 34 : 70
      sparks = Array.from({ length: n }, () => ({
        x: Math.random(),
        y: 0.28 + Math.random() * 0.68,
        r: 4 + Math.random() * 7,
        ph: Math.random() * 6.28,
        sp: 0.6 + Math.random() * 1.6,
      }))
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
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

    // 6 слоёв прозрачности — батчим точки по уровню гребня
    const LEVELS = 6
    const MAXA = 0.5
    const bucketsX: number[][] = Array.from({ length: LEVELS }, () => [])
    const bucketsY: number[][] = Array.from({ length: LEVELS }, () => [])
    const bucketsS: number[][] = Array.from({ length: LEVELS }, () => [])

    function render(t: number) {
      ctx!.clearRect(0, 0, w, h)
      const COLS = mobile ? 52 : 96
      const ROWS = mobile ? 28 : 44
      const cx = w * 0.5
      const horizon = h * 0.26

      for (let l = 0; l < LEVELS; l++) {
        bucketsX[l].length = 0
        bucketsY[l].length = 0
        bucketsS[l].length = 0
      }

      for (let i = 0; i < ROWS; i++) {
        const p = Math.pow(i / (ROWS - 1), 1.7)
        const rowY = horizon + p * (h - horizon)
        const size = 0.6 + p * 2.4
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
          const crest = wave * 0.5 + 0.5
          const a = baseA * (0.32 + 0.68 * (crest < 0 ? 0 : crest > 1 ? 1 : crest))
          let lvl = ((a / MAXA) * LEVELS) | 0
          if (lvl < 0) lvl = 0
          else if (lvl >= LEVELS) lvl = LEVELS - 1
          bucketsX[lvl].push(x)
          bucketsY[lvl].push(y)
          bucketsS[lvl].push(size)
        }
      }

      // одна заливка на слой
      for (let l = 0; l < LEVELS; l++) {
        const xs = bucketsX[l]
        if (!xs.length) continue
        const ys = bucketsY[l]
        const ss = bucketsS[l]
        ctx!.fillStyle = `rgba(96, 150, 214, ${(((l + 0.5) / LEVELS) * MAXA).toFixed(3)})`
        ctx!.beginPath()
        for (let k = 0; k < xs.length; k++) {
          const s = ss[k]
          ctx!.rect(xs[k] - s, ys[k] - s, s * 2, s * 2)
        }
        ctx!.fill()
      }

      // искры — спрайтом, с мерцанием через globalAlpha
      for (const s of sparks) {
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph)
        ctx!.globalAlpha = 0.18 + tw * 0.72
        const r = s.r * (0.6 + tw * 0.7)
        ctx!.drawImage(glow, s.x * w - r, s.y * h - r, r * 2, r * 2)
      }
      ctx!.globalAlpha = 1
    }

    let last = 0
    function frame(ts: number) {
      raf = requestAnimationFrame(frame)
      if (ts - last < 40) return // ~25 fps — плавно и легко
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
