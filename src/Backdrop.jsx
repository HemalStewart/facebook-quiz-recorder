import React from 'react'
import Motion from './Motion.jsx'

// Deterministic pseudo-random so decorative elements keep their positions across renders.
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

function Layers({ kind }) {
  const dots = React.useMemo(() => seeded(20, 7), [])

  // Video templates: a flat scrim only. No decorative shapes competing with the footage.
  if (kind === 'photo') return <div className="bd-scrim" />

  if (kind === 'sunset') {
    return (
      <>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <div className="bd-rays" />
      </>
    )
  }

  if (kind === 'cyber') {
    return (
      <>
        <div className="bd-floor" />
        <div className="bd-horizon" />
        <span className="blob b1" />
        <span className="blob b2" />
        <div className="bd-scan" />
      </>
    )
  }

  if (kind === 'bubble') {
    return (
      <>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </>
    )
  }

  if (kind === 'luxe') {
    return (
      <>
        <div className="bd-sheen" />
        <span className="blob b1" />
        <span className="blob b2" />
      </>
    )
  }

  if (kind === 'aurora') {
    return (
      <>
        <span className="ribbon r1" />
        <span className="ribbon r2" />
        <span className="ribbon r3" />
      </>
    )
  }

  return (
    <>
      <div className="bd-grid" />
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <div className="bd-scan" />
      {dots.map((item, index) => (
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
    </>
  )
}

// Optional real video texture. Drop an mp4 at public/bg/<templateId>.mp4 and it
// plays behind the frame; if the file isn't there the load fails and we drop it.
function VideoLayer({ src }) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [src])
  if (failed) return null
  // The poster paints instantly so the frame is never empty while the video buffers.
  return <video className="bd-video" src={src} poster={src.replace(/\.mp4$/, '.jpg')} autoPlay muted loop playsInline onError={() => setFailed(true)} />
}

// `motion` and `colors` are only passed by the recorder — the admin thumbnails
// render the CSS layers alone so six full-size canvases never spin up at once.
export default function Backdrop({ kind, motion, colors, video }) {
  return (
    <div className={`bd bd-${kind}`}>
      <Layers kind={kind} />
      {video ? <VideoLayer src={video} /> : null}
      {motion && colors ? <Motion kind={motion} colors={colors} /> : null}
      <div className="bd-grain" />
    </div>
  )
}
