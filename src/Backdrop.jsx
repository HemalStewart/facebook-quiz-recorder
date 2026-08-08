import React from 'react'

// Deterministic pseudo-random so particles keep their positions across renders.
function seeded(count, seed) {
  const out = []
  let value = seed
  for (let i = 0; i < count; i += 1) {
    value = (value * 9301 + 49297) % 233280
    const a = value / 233280
    value = (value * 9301 + 49297) % 233280
    const b = value / 233280
    value = (value * 9301 + 49297) % 233280
    const c = value / 233280
    out.push({ a, b, c })
  }
  return out
}

export default function Backdrop({ kind }) {
  const dots = React.useMemo(() => seeded(26, 7), [])
  const bubbles = React.useMemo(() => seeded(14, 31), [])

  if (kind === 'sunset') {
    return (
      <div className="bd bd-sunset">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <div className="bd-rays" />
        <div className="bd-grain" />
      </div>
    )
  }

  if (kind === 'cyber') {
    return (
      <div className="bd bd-cyber">
        <div className="bd-floor" />
        <div className="bd-horizon" />
        <span className="blob b1" />
        <span className="blob b2" />
        <div className="bd-scan" />
      </div>
    )
  }

  if (kind === 'bubble') {
    return (
      <div className="bd bd-bubble">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        {bubbles.map((item, index) => (
          <span
            key={index}
            className="bubble"
            style={{
              left: `${item.a * 100}%`,
              width: `${28 + item.b * 74}px`,
              height: `${28 + item.b * 74}px`,
              animationDuration: `${13 + item.c * 12}s`,
              animationDelay: `${-item.a * 20}s`,
            }}
          />
        ))}
      </div>
    )
  }

  if (kind === 'luxe') {
    return (
      <div className="bd bd-luxe">
        <div className="bd-sheen" />
        <span className="blob b1" />
        <span className="blob b2" />
        {dots.map((item, index) => (
          <span
            key={index}
            className="spark"
            style={{
              left: `${item.a * 100}%`,
              top: `${item.b * 100}%`,
              animationDuration: `${2.6 + item.c * 3.4}s`,
              animationDelay: `${-item.c * 5}s`,
            }}
          />
        ))}
      </div>
    )
  }

  if (kind === 'aurora') {
    return (
      <div className="bd bd-aurora">
        <span className="ribbon r1" />
        <span className="ribbon r2" />
        <span className="ribbon r3" />
        {dots.slice(0, 18).map((item, index) => (
          <span
            key={index}
            className="spark"
            style={{
              left: `${item.a * 100}%`,
              top: `${item.b * 100}%`,
              animationDuration: `${3 + item.c * 4}s`,
              animationDelay: `${-item.c * 6}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bd bd-neon">
      <div className="bd-grid" />
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <div className="bd-scan" />
      {dots.slice(0, 20).map((item, index) => (
        <span
          key={index}
          className="spark"
          style={{
            left: `${item.a * 100}%`,
            top: `${item.b * 100}%`,
            animationDuration: `${2.4 + item.c * 3}s`,
            animationDelay: `${-item.c * 5}s`,
          }}
        />
      ))}
    </div>
  )
}
