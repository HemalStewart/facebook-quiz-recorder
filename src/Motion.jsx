import React from 'react'

// Canvas motion layers, ported from the motion modes in the invitation.lk clone:
// gold particle drift, petal fall, starfield, plus bokeh and light streaks.
// Real particle physics rather than blurred gradients, drawn at native reel size.

const W = 1080
const H = 1920

const rnd = (min, max) => min + Math.random() * (max - min)

function toRgb(hex) {
  const clean = String(hex || '#ffffff').trim().replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const int = parseInt(full.slice(0, 6), 16)
  return Number.isNaN(int) ? [255, 255, 255] : [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

const rgba = (hex, alpha) => {
  const [r, g, b] = toRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

// Pre-rendered soft dot. Far cheaper than a radial gradient or shadowBlur per particle.
function dotSprite(hex, size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, rgba(hex, 1))
  grad.addColorStop(0.28, rgba(hex, 0.55))
  grad.addColorStop(0.6, rgba(hex, 0.14))
  grad.addColorStop(1, rgba(hex, 0))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return canvas
}

/* ------------------------------------------------------------- systems */

function goldSystem(colors) {
  const sprites = [dotSprite(colors[0]), dotSprite(colors[1]), dotSprite('#fff6d8')]
  const items = Array.from({ length: 90 }, () => {
    const depth = rnd(0.25, 1)
    return {
      x: rnd(-60, W + 60),
      y: rnd(-60, H + 60),
      depth,
      size: rnd(6, 26) * depth,
      vy: -rnd(0.15, 0.75) * depth,
      sway: rnd(0.25, 0.9) * depth,
      phase: rnd(0, Math.PI * 2),
      speed: rnd(0.006, 0.018),
      alpha: rnd(0.25, 0.95) * depth,
      sprite: sprites[Math.floor(rnd(0, sprites.length))],
    }
  })
  return {
    update(dt) {
      for (const item of items) {
        item.phase += item.speed * dt
        item.y += item.vy * dt
        item.x += Math.sin(item.phase) * item.sway * dt
        if (item.y < -80) { item.y = H + 60; item.x = rnd(-60, W + 60) }
      }
    },
    draw(ctx) {
      ctx.globalCompositeOperation = 'lighter'
      for (const item of items) {
        const twinkle = 0.65 + Math.sin(item.phase * 2.4) * 0.35
        const size = item.size * 4
        ctx.globalAlpha = item.alpha * twinkle
        ctx.drawImage(item.sprite, item.x - size / 2, item.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}

function petalSystem(colors) {
  const palette = [colors[0], colors[1], '#ffffff']
  const items = Array.from({ length: 34 }, () => ({
    x: rnd(-40, W + 40),
    y: rnd(-H, H),
    size: rnd(16, 40),
    vy: rnd(0.9, 2.4),
    sway: rnd(0.7, 2),
    phase: rnd(0, Math.PI * 2),
    speed: rnd(0.012, 0.03),
    spin: rnd(-0.02, 0.02),
    rot: rnd(0, Math.PI * 2),
    alpha: rnd(0.3, 0.8),
    color: palette[Math.floor(rnd(0, palette.length))],
  }))
  return {
    update(dt) {
      for (const item of items) {
        item.phase += item.speed * dt
        item.rot += item.spin * dt
        item.y += item.vy * dt
        item.x += Math.sin(item.phase) * item.sway * dt
        if (item.y > H + 60) { item.y = -60; item.x = rnd(-40, W + 40) }
      }
    },
    draw(ctx) {
      for (const item of items) {
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(item.rot)
        // Squash across the spin so the petal reads as a thin 3D object.
        ctx.scale(1, 0.55 + Math.abs(Math.sin(item.phase)) * 0.45)
        ctx.globalAlpha = item.alpha
        ctx.fillStyle = item.color
        ctx.beginPath()
        ctx.moveTo(0, -item.size)
        ctx.bezierCurveTo(item.size * 0.9, -item.size * 0.5, item.size * 0.7, item.size * 0.6, 0, item.size)
        ctx.bezierCurveTo(-item.size * 0.7, item.size * 0.6, -item.size * 0.9, -item.size * 0.5, 0, -item.size)
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    },
  }
}

function starSystem(colors) {
  const sprite = dotSprite('#ffffff', 64)
  const tint = dotSprite(colors[0], 64)
  const stars = Array.from({ length: 150 }, () => {
    const depth = rnd(0.2, 1)
    return {
      x: rnd(0, W),
      y: rnd(0, H),
      size: rnd(2, 7) * depth,
      depth,
      phase: rnd(0, Math.PI * 2),
      speed: rnd(0.01, 0.05),
      drift: rnd(0.02, 0.16) * depth,
      sprite: Math.random() > 0.72 ? tint : sprite,
    }
  })
  let shooter = null
  let cooldown = rnd(140, 320)
  return {
    update(dt) {
      for (const star of stars) {
        star.phase += star.speed * dt
        star.y += star.drift * dt
        if (star.y > H + 10) star.y = -10
      }
      if (shooter) {
        shooter.x += shooter.vx * dt
        shooter.y += shooter.vy * dt
        shooter.life -= dt
        if (shooter.life <= 0) shooter = null
      } else {
        cooldown -= dt
        if (cooldown <= 0) {
          cooldown = rnd(200, 460)
          shooter = { x: rnd(0, W), y: rnd(0, H * 0.55), vx: rnd(9, 15), vy: rnd(5, 9), life: rnd(28, 46) }
        }
      }
    },
    draw(ctx) {
      ctx.globalCompositeOperation = 'lighter'
      for (const star of stars) {
        const twinkle = 0.35 + Math.abs(Math.sin(star.phase)) * 0.65
        const size = star.size * 5
        ctx.globalAlpha = twinkle * star.depth
        ctx.drawImage(star.sprite, star.x - size / 2, star.y - size / 2, size, size)
      }
      if (shooter) {
        ctx.globalAlpha = Math.min(1, shooter.life / 22) * 0.9
        const grad = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x - shooter.vx * 16, shooter.y - shooter.vy * 16)
        grad.addColorStop(0, rgba('#ffffff', 1))
        grad.addColorStop(1, rgba(colors[0], 0))
        ctx.strokeStyle = grad
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(shooter.x, shooter.y)
        ctx.lineTo(shooter.x - shooter.vx * 16, shooter.y - shooter.vy * 16)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}

function bokehSystem(colors) {
  const sprites = [dotSprite(colors[0], 256), dotSprite(colors[1], 256), dotSprite('#ffffff', 256)]
  const items = Array.from({ length: 26 }, () => ({
    x: rnd(-100, W + 100),
    y: rnd(-100, H + 100),
    size: rnd(70, 260),
    vx: rnd(-0.18, 0.18),
    vy: rnd(-0.35, -0.06),
    phase: rnd(0, Math.PI * 2),
    speed: rnd(0.004, 0.012),
    alpha: rnd(0.06, 0.26),
    sprite: sprites[Math.floor(rnd(0, sprites.length))],
  }))
  return {
    update(dt) {
      for (const item of items) {
        item.phase += item.speed * dt
        item.x += item.vx * dt
        item.y += item.vy * dt
        if (item.y < -220) { item.y = H + 180; item.x = rnd(-100, W + 100) }
      }
    },
    draw(ctx) {
      ctx.globalCompositeOperation = 'lighter'
      for (const item of items) {
        const pulse = 0.75 + Math.sin(item.phase) * 0.25
        ctx.globalAlpha = item.alpha * pulse
        ctx.drawImage(item.sprite, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}

function streakSystem(colors) {
  const items = Array.from({ length: 48 }, () => {
    const depth = rnd(0.3, 1)
    return {
      x: rnd(0, W),
      y: rnd(-H, H),
      len: rnd(60, 320) * depth,
      speed: rnd(6, 22) * depth,
      width: rnd(1.5, 4) * depth,
      alpha: rnd(0.12, 0.6) * depth,
      color: Math.random() > 0.5 ? colors[0] : colors[1],
    }
  })
  return {
    update(dt) {
      for (const item of items) {
        item.y += item.speed * dt
        if (item.y - item.len > H) { item.y = rnd(-400, -60); item.x = rnd(0, W) }
      }
    },
    draw(ctx) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const item of items) {
        const grad = ctx.createLinearGradient(item.x, item.y - item.len, item.x, item.y)
        grad.addColorStop(0, rgba(item.color, 0))
        grad.addColorStop(1, rgba(item.color, item.alpha))
        ctx.strokeStyle = grad
        ctx.lineWidth = item.width
        ctx.beginPath()
        ctx.moveTo(item.x, item.y - item.len)
        ctx.lineTo(item.x, item.y)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}

const SYSTEMS = { gold: goldSystem, petals: petalSystem, stars: starSystem, bokeh: bokehSystem, streaks: streakSystem }

export default function Motion({ kind, colors }) {
  const canvasRef = React.useRef(null)
  const key = colors.join('|')

  React.useEffect(() => {
    const canvas = canvasRef.current
    const build = SYSTEMS[kind]
    if (!canvas || !build) return undefined
    const ctx = canvas.getContext('2d')
    const system = build(colors)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()

    const render = () => {
      ctx.clearRect(0, 0, W, H)
      system.draw(ctx)
    }
    const frame = (now) => {
      const dt = Math.min(3, (now - last) / 16.67)
      last = now
      system.update(dt)
      render()
      raf = requestAnimationFrame(frame)
    }

    // Seed a frame immediately so the texture is present even before rAF runs.
    system.update(0)
    render()
    if (!reduced) raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, key])

  if (!SYSTEMS[kind]) return null
  return <canvas className="bd-canvas" ref={canvasRef} width={W} height={H} aria-hidden="true" />
}
