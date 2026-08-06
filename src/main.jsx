import React from 'react'
import ReactDOM from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import './styles.css'

const STORAGE_KEY = 'calm-quiz-studio-v1'
const SETTINGS_KEY = 'calm-quiz-studio-settings-v1'
const DEFAULT_SETTINGS = { questionSeconds: 10 }

const starterQuestions = [
  { id: 1, question: 'Which planet is known as the Red Planet?', answers: ['Venus', 'Mars', 'Jupiter', 'Mercury'], correct: 1 },
  { id: 2, question: 'What is the largest ocean on Earth?', answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
  { id: 3, question: 'How many sides does a hexagon have?', answers: ['Five', 'Six', 'Seven', 'Eight'], correct: 1 },
  { id: 4, question: 'Which animal is the fastest on land?', answers: ['Lion', 'Horse', 'Cheetah', 'Leopard'], correct: 2 },
  { id: 5, question: 'What is the capital city of Japan?', answers: ['Seoul', 'Tokyo', 'Kyoto', 'Beijing'], correct: 1 },
]

function readQuestions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) && saved.length === 5 ? saved : starterQuestions
  } catch {
    return starterQuestions
  }
}

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    return saved && [5, 10, 15, 20, 30].includes(saved.questionSeconds) ? saved : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function Icon({ name }) {
  const paths = {
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    play: <polygon points="6 3 20 12 6 21 6 3" />,
    check: <path d="m5 12 4 4L19 6" />,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
    external: <><path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function AnimatedCheck() {
  return (
    <motion.svg className="animated-check" viewBox="0 0 24 24" fill="none" aria-hidden="true" initial="hidden" animate="visible">
      <motion.path d="M5 12.5 9.2 16.5 19 6.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden:{ pathLength:0, opacity:0 }, visible:{ pathLength:1, opacity:1 } }} transition={{ pathLength:{ duration:.48, ease:'easeOut' }, opacity:{ duration:.1 } }} />
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
    : <Player questions={questions} settings={settings} goTo={goTo} />
}

function Admin({ questions, setQuestions, settings, setSettings, goTo }) {
  const [saved, setSaved] = React.useState(false)
  const updateQuestion = (questionIndex, patch) => {
    setSaved(false)
    setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, ...patch } : item))
  }
  const updateAnswer = (questionIndex, answerIndex, value) => {
    const answers = [...questions[questionIndex].answers]
    answers[answerIndex] = value
    updateQuestion(questionIndex, { answers })
  }
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }
  const openRecorder = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    window.open(`${window.location.pathname}?view=player`, '_blank')
  }
  const complete = questions.filter((item) => item.question.trim() && item.answers.every((answer) => answer.trim())).length

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="overline">Calm Quiz Studio</span>
          <h1>Build your five-question quiz</h1>
          <p>Edit each question, add four answers, then select the correct one. Changes stay on this device.</p>
        </div>
        <div className="header-actions">
          <button className="button button-secondary" onClick={openRecorder}><Icon name="external" /> Open recorder</button>
          <button className="button button-primary" onClick={save}><Icon name="check" /> {saved ? 'Saved' : 'Save quiz'}</button>
        </div>
      </header>

      <main className="admin-main">
        <aside className="status-card">
          <div className="status-ring" style={{ '--progress': `${complete * 20}%` }}><span>{complete}</span><small>/ 5</small></div>
          <div><strong>Questions ready</strong><p>{settings.questionSeconds} seconds per question, followed by a short answer reveal.</p></div>
          <button className="text-button" onClick={() => goTo('player')}><Icon name="play" /> Preview quiz</button>
        </aside>

        <section className="editor-list">
          <motion.section className="settings-card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
            <div className="settings-copy">
              <span className="settings-icon">⏱</span>
              <div><h2>Quiz timing</h2><p>Choose how long viewers get to answer each question.</p></div>
            </div>
            <div className="time-options" role="group" aria-label="Time per question">
              {[5, 10, 15, 20, 30].map((value) => <button type="button" key={value} className={settings.questionSeconds === value ? 'selected' : ''} onClick={() => { setSaved(false); setSettings({ ...settings, questionSeconds:value }) }}>{value}<small>sec</small></button>)}
            </div>
          </motion.section>
          {questions.map((item, questionIndex) => (
            <motion.article className="question-card" key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: questionIndex * .06 }}>
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
            <button className="button button-primary" onClick={save}><Icon name="check" /> Save all questions</button>
            <button className="button button-secondary" onClick={() => goTo('player')}><Icon name="play" /> Preview recording</button>
          </div>
        </section>
      </main>
    </div>
  )
}

function Player({ questions, settings, goTo }) {
  const questionSeconds = settings.questionSeconds
  const [started, setStarted] = React.useState(false)
  const [finished, setFinished] = React.useState(false)
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const [seconds, setSeconds] = React.useState(questionSeconds)
  const [revealed, setRevealed] = React.useState(false)

  const restart = React.useCallback(() => {
    setQuestionIndex(0)
    setSeconds(questionSeconds)
    setRevealed(false)
    setFinished(false)
    setStarted(true)
  }, [questionSeconds])

  React.useEffect(() => {
    if (!started || finished) return
    if (revealed) {
      const nextTimer = window.setTimeout(() => {
        if (questionIndex === questions.length - 1) {
          setFinished(true)
        } else {
          setQuestionIndex((index) => index + 1)
          setSeconds(questionSeconds)
          setRevealed(false)
        }
      }, 2800)
      return () => window.clearTimeout(nextTimer)
    }
    const timer = window.setTimeout(() => {
      if (seconds === 1) setRevealed(true)
      else setSeconds((value) => value - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [started, finished, revealed, seconds, questionIndex, questions.length, questionSeconds])

  const current = questions[questionIndex]
  const urgent = !revealed && seconds <= 2
  return (
    <div className="player-page">
      <div className="recorder-toolbar">
        <button className="toolbar-button" onClick={() => goTo('admin')}><Icon name="edit" /> Admin</button>
        <span>9:16 recording preview</span>
        <button className="toolbar-button" onClick={restart}><Icon name="reset" /> Restart</button>
      </div>

      <main className="quiz-frame">
        <div className="orb orb-one" /><div className="orb orb-two" />
        <header className="quiz-header">
          <span className="quiz-brand"><i /> QUIET MIND</span>
          <span>QUIZ {String(questionIndex + 1).padStart(2, '0')}</span>
        </header>
        <div className="quiz-progress" aria-label={`Question ${questionIndex + 1} of 5`}>
          {questions.map((_, index) => <motion.span key={index} className={index < questionIndex || (index === questionIndex && revealed) ? 'done' : index === questionIndex ? 'active' : ''} animate={{ scaleX: index === questionIndex ? 1 : .96 }} />)}
        </div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.section className="start-screen" key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .96 }}>
              <span className="eyebrow">Five quick questions</span>
              <h2>Ready to test your knowledge?</h2>
              <p>You have {questionSeconds} seconds to choose each answer.</p>
              <button onClick={restart}>Start quiz <Icon name="play" /></button>
            </motion.section>
          ) : finished ? (
            <motion.section className="finish-screen" key="finish" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div className="finish-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: .15 }}><Icon name="check" /></motion.div>
              <span className="eyebrow">Quiz complete</span>
              <h2>How many did you get right?</h2>
              <p>Comment your score out of 5, then follow for the next challenge.</p>
              <motion.div className="score-prompt" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}>My score: <strong>__/5</strong></motion.div>
            </motion.section>
          ) : (
            <motion.section className="question-screen" key={questionIndex} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }}>
              <div className="question-meta"><span>Question {questionIndex + 1} of 5</span><span>{revealed ? 'Answer revealed' : questionIndex === 0 ? 'Can you get 5/5?' : 'Keep your streak'}</span></div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .38 }}>{current.question}</motion.h2>
              <div className="player-answers">
                {current.answers.map((answer, index) => {
                  const correct = revealed && index === current.correct
                  return (
                    <motion.div className={`player-answer ${correct ? 'correct' : ''} ${revealed && !correct ? 'dimmed' : ''}`} key={index} initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: revealed && !correct ? .38 : 1, y: 0, scale: correct ? 1.025 : 1 }} transition={correct ? { type: 'spring', stiffness: 340, damping: 19 } : { delay: index * .065, duration: .32, ease: 'easeOut' }}>
                      <span>{String.fromCharCode(65 + index)}</span><strong>{answer}</strong>{correct && <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type:'spring', stiffness:420, damping:20 }}><AnimatedCheck /></motion.i>}
                    </motion.div>
                  )
                })}
              </div>
              <motion.div className={`countdown ${revealed ? 'revealed' : ''} ${urgent ? 'urgent' : ''}`} animate={urgent ? { scale: [1, 1.07, 1] } : { scale: 1 }} transition={urgent ? { duration: .75, repeat: Infinity } : { duration: .2 }}>
                <svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="33"/><motion.circle className="countdown-line" cx="38" cy="38" r="33" initial={{ pathLength: 1 }} animate={{ pathLength: revealed ? 1 : seconds / questionSeconds }} transition={{ duration: .45, ease: 'easeOut' }} /></svg>
                <AnimatePresence mode="wait"><motion.span key={revealed ? 'answer' : seconds} initial={{ opacity: 0, scale: .65 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.15 }} transition={{ duration:.16 }}>{revealed ? <AnimatedCheck /> : seconds}</motion.span></AnimatePresence>
              </motion.div>
              <motion.p className={`countdown-copy ${revealed ? 'is-correct' : ''}`} animate={{ opacity:1, y:0 }}>{revealed ? 'Correct answer' : urgent ? 'Lock in your answer' : 'Take a breath and choose'}</motion.p>
              <AnimatePresence>{revealed && <motion.div className="next-cue" initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}><span>Next question</span><i><motion.b initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:2.65, ease:'linear' }} /></i></motion.div>}</AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
        <footer className="quiz-footer"><span>Think • Choose • Learn</span><span>Stay for all 5</span></footer>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
