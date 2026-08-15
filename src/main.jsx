import React from 'react'
import ReactDOM from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import Backdrop from './Backdrop.jsx'
import { TEMPLATES, FAMILIES, DEFAULT_TEMPLATE, getTemplate } from './templates.js'
import { sound } from './sound.js'
import './styles.css'

const STORAGE_KEY = 'calm-quiz-studio-v1'
const SETTINGS_KEY = 'calm-quiz-studio-settings-v1'
const TIME_CHOICES = [5]
const SINHALA_VOICES = [
  { id: 'si-LK-ThiliniNeural', label: 'Thilini', note: 'Female neural' },
  { id: 'si-LK-SameeraNeural', label: 'Sameera', note: 'Male neural' },
]
const REVEAL_MS = 2600
const TEXT_SCALES = [
  { id: 'sm', label: 'S', value: 0.88 },
  { id: 'md', label: 'M', value: 1 },
  { id: 'lg', label: 'L', value: 1.14 },
]
const DEFAULT_SETTINGS = { questionSeconds: 5, templateId: DEFAULT_TEMPLATE, sound: true, readQuestion: true, voice: SINHALA_VOICES[0].id, brand: 'QUIZ TIME', textScale: 'md' }

// Auto-fit: longer copy steps down a size so every question fills the same block
// without ever overflowing the 1080x1920 frame.
// Floors are set so text stays legible when a 1080-wide reel is watched on a
// phone at roughly a third of that width — nothing drops below ~62px/40px.
function fitQuestion(text, scale) {
  const length = (text || '').trim().length
  const base = length > 95 ? 62 : length > 78 ? 68 : length > 60 ? 76 : length > 42 ? 84 : length > 26 ? 92 : 100
  return Math.round(base * scale)
}

function fitAnswers(answers, scale) {
  const longest = answers.reduce((max, item) => Math.max(max, (item || '').trim().length), 0)
  const base = longest > 38 ? 40 : longest > 30 ? 44 : longest > 22 ? 48 : longest > 14 ? 52 : 56
  return Math.round(base * scale)
}

// The reel canvas. Everything inside the stage is authored at these exact pixels,
// then scaled to fit the window, so a screen recording is a true 1080x1920 crop.
const STAGE_W = 1080
const STAGE_H = 1920

const sinhalaSampleQuestions = [
  { id: 1, question: 'ශ්‍රී ලංකාවේ අගනුවර ලෙස සැලකෙන නගරය කුමක්ද?', answers: ['ශ්‍රී ජයවර්ධනපුර කෝට්ටේ', 'කොළඹ', 'මහනුවර', 'ගාල්ල'], correct: 0 },
  { id: 2, question: 'සිගිරිය ඉදිකළ රජු කවුද?', answers: ['කාශ්‍යප රජු', 'දුටුගැමුණු රජු', 'පරාක්‍රමබාහු රජු', 'වළගම්බා රජු'], correct: 0 },
  { id: 3, question: 'ශ්‍රී ලංකාවේ ජාතික මල කුමක්ද?', answers: ['නිල් මානෙල්', 'අරලිය', 'නා මල', 'රෝස මල'], correct: 0 },
  { id: 4, question: 'ලෝකයේ විශාලතම සාගරය කුමක්ද?', answers: ['පැසිෆික් සාගරය', 'අත්ලාන්තික් සාගරය', 'ඉන්දියානු සාගරය', 'ආක්ටික් සාගරය'], correct: 0 },
  { id: 5, question: 'ශ්‍රී ලංකාවේ උසම කන්ද කුමක්ද?', answers: ['පිදුරුතලාගල', 'ශ්‍රී පාදය', 'නකල්ස් කඳුවැටිය', 'කිරිගල්පොත්ත'], correct: 0 },
]

const HYPE = ['Only 1% get this', 'Keep the streak alive', 'This one is tricky', 'Almost there', 'Final question!']

function readQuestions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) && saved.length === 5 ? saved : sinhalaSampleQuestions
  } catch {
    return sinhalaSampleQuestions
  }
}

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
    const hasNarrationSetting = typeof saved.readQuestion === 'boolean'
    return {
      // A previous version defaulted to 10s. When upgrading that saved shape,
      // use the new read-then-5s flow once; later user choices are preserved.
      questionSeconds: hasNarrationSetting && TIME_CHOICES.includes(saved.questionSeconds) ? saved.questionSeconds : DEFAULT_SETTINGS.questionSeconds,
      templateId: TEMPLATES.some((item) => item.id === saved.templateId) ? saved.templateId : DEFAULT_SETTINGS.templateId,
      sound: typeof saved.sound === 'boolean' ? saved.sound : true,
      readQuestion: true,
      voice: SINHALA_VOICES.some((item) => item.id === saved.voice) ? saved.voice : DEFAULT_SETTINGS.voice,
      brand: typeof saved.brand === 'string' ? saved.brand.slice(0, 18) : DEFAULT_SETTINGS.brand,
      textScale: TEXT_SCALES.some((item) => item.id === saved.textScale) ? saved.textScale : DEFAULT_SETTINGS.textScale,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function Icon({ name }) {
  const paths = {
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" />,
    check: <path d="m5 12 4 4L19 6" />,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
    external: <><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    sound: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>,
    mute: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="m17 9 5 6" /><path d="m22 9-5 6" /></>,
    voice: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /><path d="M8 22h8" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function AnimatedCheck() {
  return (
    <motion.svg className="animated-check" viewBox="0 0 24 24" fill="none" aria-hidden="true" initial="hidden" animate="visible">
      <motion.path d="M5 12.5 9.2 16.5 19 6.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }} transition={{ pathLength: { duration: .45, ease: 'easeOut' }, opacity: { duration: .1 } }} />
    </motion.svg>
  )
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const [view, setView] = React.useState(params.get('view') === 'player' ? 'player' : 'admin')
  const [questions, setQuestions] = React.useState(readQuestions)
  const [settings, setSettings] = React.useState(readSettings)

  const goTo = (next) => {
    const url = next === 'player' ? '?view=player' : window.location.pathname
    window.history.pushState({}, '', url)
    setView(next)
  }

  React.useEffect(() => {
    const onPop = () => setView(new URLSearchParams(window.location.search).get('view') === 'player' ? 'player' : 'admin')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return view === 'admin'
    ? <Admin questions={questions} setQuestions={setQuestions} settings={settings} setSettings={setSettings} goTo={goTo} />
    : <Player questions={questions} settings={settings} setSettings={setSettings} goTo={goTo} />
}

/* ---------------------------------------------------------------- admin */

function TemplateCard({ template, selected, onSelect }) {
  return (
    <button type="button" className={`template-card ${selected ? 'selected' : ''}`} onClick={onSelect} style={template.vars}>
      <span className="template-preview">
        {/* A poster still, not the video: five 1080x1920 decoders at once stalls the page. */}
        {template.video ? <img className="preview-shot" src={`${import.meta.env.BASE_URL}bg/${template.video.replace(/\.mp4$/, '.jpg')}`} alt="" loading="lazy" /> : null}
        <Backdrop kind={template.backdrop} />
        <span className="mini">
          <span className="mini-bar" />
          <span className="mini-title" />
          <span className="mini-answer" />
          <span className="mini-answer wide" />
          <span className="mini-answer hit" />
          <span className="mini-ring" />
        </span>
      </span>
      <span className="template-meta">
        <strong>{template.name}</strong>
        <small>{template.tag}</small>
        <em>{template.blurb}</em>
      </span>
      {selected && <span className="template-tick"><Icon name="check" /></span>}
    </button>
  )
}

function Admin({ questions, setQuestions, settings, setSettings, goTo }) {
  const [saved, setSaved] = React.useState(false)
  const patchSettings = (patch) => { setSaved(false); setSettings((current) => ({ ...current, ...patch })) }
  const updateQuestion = (questionIndex, patch) => {
    setSaved(false)
    setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, ...patch } : item))
  }
  const updateAnswer = (questionIndex, answerIndex, value) => {
    const answers = [...questions[questionIndex].answers]
    answers[answerIndex] = value
    updateQuestion(questionIndex, { answers })
  }
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }
  const save = () => {
    persist()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }
  const openRecorder = () => {
    persist()
    // Opening a new tab is convenient for recording, but popup blockers can
    // silently return null here. Fall back to the same tab so the button never
    // appears to do nothing.
    const recorderUrl = new URL(window.location.href)
    recorderUrl.search = '?view=player'
    recorderUrl.hash = ''
    const recorderWindow = window.open(recorderUrl.href, '_blank', 'noopener,noreferrer')
    if (!recorderWindow) window.location.assign(recorderUrl.href)
  }
  const complete = questions.filter((item) => item.question.trim() && item.answers.every((answer) => answer.trim())).length
  const runtime = Math.round(4 + questions.length * (settings.questionSeconds + REVEAL_MS / 1000) + 6)

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="overline">Reel Quiz Studio</span>
          <h1>Build a quiz reel people watch to the end</h1>
          <p>Pick a template, set the timer, write five questions. The recorder renders a true 1080&times;1920 frame with animated backgrounds and sound.</p>
        </div>
        <div className="header-actions">
          <button className="button button-secondary" onClick={openRecorder}><Icon name="external" /> Open recorder</button>
          <button className="button button-primary" onClick={save}><Icon name="check" /> {saved ? 'Saved' : 'Save quiz'}</button>
        </div>
      </header>

      <main className="admin-main">
        <aside className="status-card">
          <div className="status-ring" style={{ '--progress': `${complete * 20}%` }}><span>{complete}</span><small>/ 5</small></div>
          <div>
            <strong>Questions ready</strong>
            <p>{settings.questionSeconds}s per question plus a {(REVEAL_MS / 1000).toFixed(1)}s reveal. Full run is about {runtime}s.</p>
          </div>
          <button className="text-button" onClick={() => goTo('player')}><Icon name="play" /> Preview recorder</button>
        </aside>

        <section className="editor-list">
          <motion.section className="panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-head">
              <span className="panel-icon">🎨</span>
              <div><h2>Template</h2><p>Motion templates draw their own background. Heritage templates play real Sri Lankan footage behind a scrim.</p></div>
            </div>
            {FAMILIES.map((family) => {
              const items = TEMPLATES.filter((template) => (template.family || 'motion') === family.id)
              if (!items.length) return null
              return (
                <div className="template-group" key={family.id}>
                  <div className="template-group-label">{family.label} <em>{family.note}</em></div>
                  <div className="template-grid">
                    {items.map((template) => (
                      <TemplateCard key={template.id} template={template} selected={settings.templateId === template.id} onSelect={() => patchSettings({ templateId: template.id })} />
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.section>

          <motion.section className="panel row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .04 }}>
            <div className="panel-head">
              <span className="panel-icon">⏱</span>
              <div><h2>Timing, text &amp; sound</h2><p>The Sinhala question is read first, then viewers get 5 seconds to answer. Text auto-fits &mdash; S/M/L nudges it. Free Sinhala audio needs an internet connection.</p></div>
            </div>
            <div className="control-stack">
              <div className="time-options" role="group" aria-label="Time per question">
                {TIME_CHOICES.map((value) => (
                  <button type="button" key={value} className={settings.questionSeconds === value ? 'selected' : ''} onClick={() => patchSettings({ questionSeconds: value })}>{value}<small>sec</small></button>
                ))}
              </div>
              <div className="inline-controls">
                <div className="time-options compact" role="group" aria-label="Text size">
                  {TEXT_SCALES.map((item) => (
                    <button type="button" key={item.id} className={settings.textScale === item.id ? 'selected' : ''} onClick={() => patchSettings({ textScale: item.id })} title={`Text size ${item.label}`}>{item.label}</button>
                  ))}
                </div>
                <label className="voice-select">
                  <span>Sinhala voice</span>
                  <select value={settings.voice} onChange={(event) => patchSettings({ voice: event.target.value })}>
                    {SINHALA_VOICES.map((voice) => <option key={voice.id} value={voice.id}>{voice.label} — {voice.note}</option>)}
                  </select>
                </label>
                <label className="switch">
                  <input type="checkbox" checked={settings.sound} onChange={(event) => patchSettings({ sound: event.target.checked })} />
                  <span className="switch-track"><i /></span>
                  <span>Countdown ticks &amp; beat drop</span>
                </label>
              </div>
            </div>
          </motion.section>

          {questions.map((item, questionIndex) => (
            <motion.article className="question-card" key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + questionIndex * .05 }}>
              <div className="question-heading">
                <span className="number">{String(questionIndex + 1).padStart(2, '0')}</span>
                <div><h2>Question {questionIndex + 1}</h2><p>Select the circle beside the correct answer.</p></div>
              </div>
              <label className="field question-field">
                <span>Question</span>
                <textarea rows="2" maxLength="110" value={item.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} />
              </label>
              <div className="answer-grid">
                {item.answers.map((answer, answerIndex) => (
                  <label className={`answer-field ${item.correct === answerIndex ? 'is-correct' : ''}`} key={answerIndex}>
                    <input type="radio" name={`correct-${item.id}`} checked={item.correct === answerIndex} onChange={() => updateQuestion(questionIndex, { correct: answerIndex })} />
                    <span className="answer-letter">{String.fromCharCode(65 + answerIndex)}</span>
                    <input aria-label={`Answer ${answerIndex + 1}`} maxLength="55" value={answer} onChange={(event) => updateAnswer(questionIndex, answerIndex, event.target.value)} />
                    {item.correct === answerIndex && <span className="correct-label">Correct</span>}
                  </label>
                ))}
              </div>
            </motion.article>
          ))}

          <div className="bottom-actions">
            <button className="button button-secondary" onClick={() => { setQuestions(sinhalaSampleQuestions.map((item) => ({ ...item, answers: [...item.answers] }))); setSaved(false) }}>Load Sinhala samples</button>
            <button className="button button-primary" onClick={save}><Icon name="check" /> Save all questions</button>
            <button className="button button-secondary" onClick={() => goTo('player')}><Icon name="play" /> Preview recording</button>
          </div>
        </section>
      </main>
    </div>
  )
}

/* --------------------------------------------------------------- player */

// Scales the fixed 1080x1920 stage down to whatever space the window has.
function useStageScale(chromeHeight) {
  const [scale, setScale] = React.useState(0.25)
  React.useEffect(() => {
    const measure = () => {
      const availableW = window.innerWidth - 32
      const availableH = window.innerHeight - chromeHeight
      setScale(Math.min(availableW / STAGE_W, availableH / STAGE_H))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [chromeHeight])
  return scale
}

function Confetti({ colors }) {
  const pieces = React.useMemo(() => Array.from({ length: 18 }, (_, index) => ({
    x: (index % 2 ? 1 : -1) * (40 + ((index * 53) % 260)),
    y: -120 - ((index * 37) % 170),
    rotate: ((index * 97) % 360) - 180,
    delay: (index % 6) * 0.035,
    color: colors[index % colors.length],
    round: index % 3 === 0,
  })), [colors])
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece, index) => (
        <motion.span
          key={index}
          style={{ background: piece.color, borderRadius: piece.round ? '50%' : '3px' }}
          initial={{ opacity: 0, x: 0, y: 0, scale: .4, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: piece.x, y: [0, piece.y, piece.y + 190], scale: 1, rotate: piece.rotate }}
          transition={{ duration: 1.25, delay: piece.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function getSinhalaVoice() {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find((voice) => /^si([-_]LK)?$/i.test(voice.lang))
    || voices.find((voice) => /sinhala|sri\s*lanka/i.test(`${voice.name} ${voice.lang}`))
    || null
}

function speakWithBrowserVoice(text, onDone) {
  if (!('speechSynthesis' in window)) {
    onDone()
    return () => {}
  }

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = getSinhalaVoice()
  utterance.lang = 'si-LK'
  if (voice) utterance.voice = voice
  utterance.rate = 0.86
  utterance.pitch = 1
  utterance.onend = onDone
  utterance.onerror = onDone
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return () => {
    utterance.onend = null
    utterance.onerror = null
    window.speechSynthesis.cancel()
  }
}

// The local Vite endpoint uses Microsoft's free Edge Read Aloud Sinhala voice
// server-side, avoiding browser CORS and installed-voice problems.
function playSinhala(text, onDone, sharedAudio = null, voice = 'si-LK-ThiliniNeural') {
  if (!text || typeof Audio === 'undefined') return speakWithBrowserVoice(text, onDone)

  const audio = sharedAudio || new Audio()
  audio.src = `/api/sinhala-tts?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`
  audio.preload = 'auto'
  audio.playsInline = true
  audio.volume = 1
  let cancelled = false
  let fallbackStop = null
  let fallbackTimer = null

  const stopAudio = () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer)
    audio.onended = null
    audio.onerror = null
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }

  const useFallback = () => {
    if (cancelled) return
    stopAudio()
    fallbackStop = speakWithBrowserVoice(text, onDone)
  }

  audio.onended = () => {
    if (cancelled) return
    stopAudio()
    onDone()
  }
  audio.onerror = useFallback
  audio.load()
  const playRequest = audio.play()
  playRequest?.catch(useFallback)
  // Do not leave the quiz waiting forever if a network request stalls.
  fallbackTimer = window.setTimeout(useFallback, 7000)

  return () => {
    cancelled = true
    stopAudio()
    fallbackStop?.()
  }
}

function Player({ questions, settings, setSettings, goTo }) {
  const questionSeconds = settings.questionSeconds
  const template = getTemplate(settings.templateId)
  const [started, setStarted] = React.useState(false)
  const [finished, setFinished] = React.useState(false)
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const [seconds, setSeconds] = React.useState(questionSeconds)
  const [revealed, setRevealed] = React.useState(false)
  const [phase, setPhase] = React.useState('idle')
  const [runId, setRunId] = React.useState(0)
  const onlineAudioRef = React.useRef(null)
  const narrationStopRef = React.useRef(null)
  const narrationStartedInGestureRef = React.useRef(false)
  const scale = useStageScale(96)

  React.useEffect(() => {
    return () => {
      narrationStopRef.current?.()
      onlineAudioRef.current?.pause()
      onlineAudioRef.current?.removeAttribute('src')
      onlineAudioRef.current = null
    }
  }, [])

  React.useEffect(() => { sound.setMuted(!settings.sound) }, [settings.sound])

  const toggleSound = () => {
    const next = !settings.sound
    setSettings((current) => {
      const updated = { ...current, sound: next }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
    if (next) sound.unlock()
  }

  const restart = React.useCallback(() => {
    narrationStopRef.current?.()
    narrationStopRef.current = null
    sound.start()
    if (settings.readQuestion) {
      // Start the first audio from the Start button gesture. Reusing this
      // element lets later questions continue on browsers with autoplay rules.
      narrationStartedInGestureRef.current = true
      narrationStopRef.current = playSinhala(questions[0]?.question || '', () => {
        setSeconds(questionSeconds)
        setPhase('countdown')
      }, onlineAudioRef.current, settings.voice)
    }
    setQuestionIndex(0)
    setSeconds(questionSeconds)
    setRevealed(false)
    setFinished(false)
    setStarted(true)
    setPhase(settings.readQuestion ? 'reading' : 'countdown')
    setRunId((value) => value + 1)
  }, [questionSeconds, settings.readQuestion, settings.voice, questions])

  // Read each Sinhala question first. The timer does not begin until the free
  // browser voice finishes speaking, which keeps the five seconds usable.
  React.useEffect(() => {
    if (!started || finished || revealed) return undefined
    if (!settings.readQuestion) {
      setPhase('countdown')
      return undefined
    }
    if (narrationStartedInGestureRef.current) {
      narrationStartedInGestureRef.current = false
      return undefined
    }
    setPhase('reading')
    const stopNarration = playSinhala(questions[questionIndex]?.question || '', () => {
      setSeconds(questionSeconds)
      setPhase('countdown')
    }, onlineAudioRef.current, settings.voice)
    narrationStopRef.current = stopNarration
    return () => {
      stopNarration()
      if (narrationStopRef.current === stopNarration) narrationStopRef.current = null
    }
  }, [started, finished, revealed, questionIndex, settings.readQuestion, settings.voice, questionSeconds, questions, runId])

  // Countdown: one tick per second, then the beat drop and the answer chime.
  React.useEffect(() => {
    if (!started || finished || revealed || phase !== 'countdown') return undefined
    const timer = window.setTimeout(() => {
      if (seconds <= 1) {
        setRevealed(true)
        sound.timeUp()
        window.setTimeout(() => sound.correct(), 260)
      } else {
        setSeconds((value) => value - 1)
        sound.tick(seconds - 1 <= 3)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [started, finished, revealed, phase, seconds])

  // Reveal hold, then advance.
  React.useEffect(() => {
    if (!started || finished || !revealed) return undefined
    const timer = window.setTimeout(() => {
      if (questionIndex === questions.length - 1) {
        setFinished(true)
        sound.finish()
      } else {
        setQuestionIndex((index) => index + 1)
        setSeconds(questionSeconds)
        setRevealed(false)
        setPhase(settings.readQuestion ? 'reading' : 'countdown')
        sound.whoosh()
      }
    }, REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [started, finished, revealed, questionIndex, questions.length, questionSeconds, settings.readQuestion])

  const current = questions[questionIndex]
  const reading = started && !finished && !revealed && phase === 'reading'
  const urgent = !revealed && !reading && started && !finished && seconds <= 3
  const accentColors = [template.vars['--t-accent'], template.vars['--t-accent2'], template.vars['--t-correct'], '#ffffff']
  const textScale = (TEXT_SCALES.find((item) => item.id === settings.textScale) || TEXT_SCALES[1]).value
  const questionSize = fitQuestion(current?.question, textScale)
  const answerSize = fitAnswers(current?.answers || [], textScale)

  return (
    <div className="player-page">
      <audio ref={onlineAudioRef} className="narration-audio" preload="auto" playsInline aria-hidden="true" />
      <div className="recorder-toolbar" style={{ width: STAGE_W * scale }}>
        <button className="toolbar-button" onClick={() => goTo('admin')}><Icon name="edit" /> Admin</button>
        <span className="toolbar-size">1080 &times; 1920 &middot; {Math.round(scale * 100)}%</span>
        <div className="toolbar-right">
          <button className="toolbar-button" onClick={toggleSound} aria-pressed={settings.sound}><Icon name={settings.sound ? 'sound' : 'mute'} /> {settings.sound ? 'Sound on' : 'Muted'}</button>
          <button className="toolbar-button" onClick={restart}><Icon name="reset" /> Restart</button>
        </div>
      </div>

      <div className="stage-holder" style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
        {/* Scale lives on a plain wrapper so framer-motion can own the stage transform. */}
        <div className="stage-scale" style={{ transform: `scale(${scale})` }}>
        <motion.main
          className={`stage ${urgent ? 'is-urgent' : ''} ${template.backdrop === 'photo' ? 'is-photo' : ''}`}
          style={template.vars}
          animate={revealed ? { x: [0, -7, 6, -3, 0] } : { x: 0 }}
          transition={{ duration: .32 }}
        >
          <Backdrop kind={template.backdrop} motion={template.motion} colors={accentColors} video={`${import.meta.env.BASE_URL}bg/${template.video || `${template.id}.mp4`}`} />
          <div className="stage-vignette" />
          <div className="urgent-pulse" />

          <AnimatePresence mode="wait">
            {!started ? (
              <motion.section className="screen start-screen" key="start" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: .35 }}>
                <motion.span className="pill" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>5 questions &middot; {questionSeconds}s each</motion.span>
                <h2>Only <em>1%</em> score 5&nbsp;/&nbsp;5</h2>
                <p>Beat the timer on every question. Drop your score in the comments.</p>
                <button onClick={restart}>Start quiz <Icon name="play" /></button>
                <span className="start-hint">Tap sound on for the countdown beat</span>
              </motion.section>
            ) : finished ? (
              <motion.section className="screen finish-screen" key="finish" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
                <motion.div className="finish-check" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: .1 }}><Icon name="check" /></motion.div>
                <Confetti colors={accentColors} />
                <span className="pill">Quiz complete</span>
                <h2>What did you score?</h2>
                <p>Comment your number out of 5 &mdash; then follow for part 2.</p>
                <motion.div className="score-prompt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}>
                  My score: <strong>__ / 5</strong>
                </motion.div>
                <motion.div className="cta-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }}>
                  <span>👇 Comment</span><span>❤️ Like</span><span>➕ Follow</span>
                </motion.div>
              </motion.section>
            ) : (
              <motion.section className="screen question-screen" key={questionIndex} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: .4, ease: [0.22, 1, 0.36, 1] }}>
                <div className="question-tag">
                  <span className="pill small">Question {questionIndex + 1}</span>
                  <motion.span className="hype" key={reading ? 'reading' : revealed ? 'r' : 'q'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{reading ? 'Listening...' : revealed ? 'Answer revealed' : HYPE[questionIndex % HYPE.length]}</motion.span>
                </div>

                <motion.h2 className="question-text" style={{ fontSize: questionSize }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .06 }}>{current.question}</motion.h2>

                <div className="stage-answers">
                  {current.answers.map((answer, index) => {
                    const correct = revealed && index === current.correct
                    const dimmed = revealed && !correct
                    return (
                      <motion.div
                        className={`stage-answer ${correct ? 'correct' : ''} ${dimmed ? 'dimmed' : ''}`}
                        key={index}
                        initial={{ opacity: 0, y: 26, scale: .96 }}
                        animate={{ opacity: dimmed ? .32 : 1, y: 0, scale: correct ? 1.04 : 1 }}
                        transition={correct ? { type: 'spring', stiffness: 320, damping: 16 } : { delay: .1 + index * .08, duration: .38, ease: 'easeOut' }}
                      >
                        <span className="letter">{String.fromCharCode(65 + index)}</span>
                        <strong style={{ fontSize: answerSize }}>{answer}</strong>
                        {correct && (
                          <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                            <AnimatedCheck />
                          </motion.i>
                        )}
                        {correct && <Confetti colors={accentColors} />}
                      </motion.div>
                    )
                  })}
                </div>

                <motion.div
                  className={`countdown ${revealed ? 'revealed' : ''} ${urgent ? 'urgent' : ''}`}
                  animate={urgent ? { scale: [1, 1.09, 1] } : { scale: 1 }}
                  transition={urgent ? { duration: .7, repeat: Infinity } : { duration: .25 }}
                >
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" />
                    <motion.circle className="countdown-line" cx="60" cy="60" r="52" initial={{ pathLength: 1 }} animate={{ pathLength: revealed ? 1 : seconds / questionSeconds }} transition={{ duration: .5, ease: 'linear' }} />
                  </svg>
                  <AnimatePresence mode="wait">
                    <motion.span key={reading ? 'reading' : revealed ? 'answer' : seconds} initial={{ opacity: 0, scale: .55 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }} transition={{ duration: .18 }}>
                      {reading ? <Icon name="voice" /> : revealed ? <AnimatedCheck /> : seconds}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                <p className={`countdown-copy ${revealed ? 'is-correct' : ''} ${urgent ? 'is-urgent' : ''}`}>
                  {revealed ? 'Correct answer' : reading ? 'Listen to the question' : urgent ? 'Lock it in!' : 'Choose your answer'}
                </p>

                {/* Fixed-height slot so the timer never shifts when the cue appears. */}
                <div className="cue-slot">
                  <AnimatePresence>
                    {revealed && (
                      <motion.div className="next-cue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <span>{questionIndex === questions.length - 1 ? 'Final score' : 'Next question'}</span>
                        <i><motion.b initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: REVEAL_MS / 1000, ease: 'linear' }} /></i>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </motion.main>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
