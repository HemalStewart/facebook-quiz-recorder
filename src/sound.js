// Synthesised sound effects — no audio files needed, so nothing to load or license.
// The AudioContext is created lazily on the first user gesture (the Start button).

let ctx = null
let master = null
let muted = false

function ensure() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, to, dur = 0.18, type = 'sine', gain = 0.18, delay = 0 }) {
  const audio = ensure()
  if (!audio || muted) return
  const start = audio.currentTime + delay
  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(amp)
  amp.connect(master)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

function noise({ dur = 0.3, gain = 0.14, from = 900, to = 200, delay = 0, q = 1 }) {
  const audio = ensure()
  if (!audio || muted) return
  const start = audio.currentTime + delay
  const frames = Math.floor(audio.sampleRate * dur)
  const buffer = audio.createBuffer(1, frames, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1
  const src = audio.createBufferSource()
  src.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = q
  filter.frequency.setValueAtTime(from, start)
  filter.frequency.exponentialRampToValueAtTime(to, start + dur)
  const amp = audio.createGain()
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.03)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filter)
  filter.connect(amp)
  amp.connect(master)
  src.start(start)
  src.stop(start + dur + 0.05)
}

export const sound = {
  setMuted(value) {
    muted = value
    if (!value) ensure()
  },
  isMuted() {
    return muted
  },
  unlock() {
    ensure()
  },
  // One blip per second of the countdown. Tightens up in the final seconds.
  tick(urgent) {
    tone({ freq: urgent ? 1180 : 760, dur: urgent ? 0.09 : 0.07, type: 'square', gain: urgent ? 0.13 : 0.07 })
    if (urgent) tone({ freq: 240, to: 150, dur: 0.1, type: 'sine', gain: 0.16 })
  },
  // The beat that lands the moment the clock runs out.
  timeUp() {
    tone({ freq: 180, to: 44, dur: 0.5, type: 'sine', gain: 0.4 })
    tone({ freq: 90, to: 38, dur: 0.42, type: 'triangle', gain: 0.28 })
    noise({ dur: 0.22, gain: 0.16, from: 2600, to: 500, q: 0.7 })
  },
  correct() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, index) => tone({ freq, dur: 0.3, type: 'triangle', gain: 0.16, delay: index * 0.075 }))
    tone({ freq: 1318.5, dur: 0.5, type: 'sine', gain: 0.1, delay: 0.3 })
  },
  whoosh() {
    noise({ dur: 0.34, gain: 0.1, from: 320, to: 2800, q: 1.4 })
  },
  start() {
    ensure()
    const notes = [392, 523.25, 659.25, 880]
    notes.forEach((freq, index) => tone({ freq, dur: 0.26, type: 'triangle', gain: 0.15, delay: index * 0.09 }))
  },
  finish() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((freq, index) => tone({ freq, dur: 0.55, type: 'triangle', gain: 0.15, delay: index * 0.1 }))
    tone({ freq: 130, to: 65, dur: 0.7, type: 'sine', gain: 0.32 })
    noise({ dur: 0.9, gain: 0.09, from: 4000, to: 600, q: 0.5, delay: 0.05 })
  },
}
