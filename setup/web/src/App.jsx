import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import { STRINGS } from './i18n.js'
import Chat from './Chat.jsx'
import { STEP_ICONS, KeyIcon, ModelIcon, TelegramIcon, ToolsIcon, DoneIcon, LockIcon, Mark, FlagKR, FlagUS, ChatIcon, GearIcon, RefreshIcon, ExternalIcon } from './Icons.jsx'

// Callout — for the one aside a step needs. Takes a label so the reader knows
// whether it is context or a warning before reading the sentence.
// Numbered instructions. A beginner needs the exact sequence, not a paragraph
// that happens to mention the steps.
function HowTo({ title, rows }) {
  if (!rows?.length) return null
  return (
    <>
      {title && <h3>{title}</h3>}
      <ol className="howto">
        {rows.map(([n, html]) => (
          <li key={n}>
            <span className="n">{n}</span>
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </li>
        ))}
      </ol>
    </>
  )
}

function Callout({ label, kind = '', children }) {
  return (
    <div className={`callout ${kind}`}>
      <span className="clabel">{label}</span>
      {children}
    </div>
  )
}

function LangButton({ lang, setLang, t }) {
  // Shows the language you would switch *to*, flag first — the same read as a
  // signpost rather than a status badge.
  const Flag = lang === 'ko' ? FlagUS : FlagKR
  return (
    <button className="lang" onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}>
      <Flag className="flag" />
      {t.langLabel}
    </button>
  )
}

function Login({ t, lang, setLang, onIn }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setFailed(false)
    try {
      await api('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      onIn()
    } catch {
      setFailed(true)
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app narrow">
      <header>
        <div className="wordmark">
          <Mark />
          <h1>{t.appName}</h1>
        </div>
        <LangButton lang={lang} setLang={setLang} t={t} />
      </header>

      <form className="card" onSubmit={submit}>
        <div className="chead"><LockIcon /><h2>{t.loginTitle}</h2></div>
        {failed && <div className="error">{t.loginFailed}</div>}

        <label className="field">
          <span>{t.loginUser}</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="field">
          <span>{t.loginPassword}</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>


        <button className="primary wide" type="submit" disabled={busy || !password}>
          {busy ? t.loginBusy : t.loginSubmit}
        </button>
        <Callout label={t.calloutNote}>
          <code>DASHBOARD_USER</code> · <code>DASHBOARD_PASSWORD</code>
          {' — '}{t.loginHintTail}
        </Callout>
      </form>
    </div>
  )
}


// Label/value rows instead of paragraphs. The value can carry <em> for the one
// number that matters, which is why it is set as HTML rather than text.
function Facts({ rows }) {
  if (!rows?.length) return null
  return (
    <ul className="facts">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span className="k">{k}</span>
          <span className="v" dangerouslySetInnerHTML={{ __html: v }} />
        </li>
      ))}
    </ul>
  )
}

const STEPS = ['key', 'model', 'telegram', 'mcp', 'done']

function fmtContext(n) {
  if (!n) return '—'
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

export default function App() {
  const [lang, setLang] = useState(() => (navigator.language || '').startsWith('ko') ? 'ko' : 'en')
  const t = STRINGS[lang]
  const [step, setStep] = useState('key')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  // null = still asking, false = show the login form, true = signed in.
  const [authed, setAuthed] = useState(null)
  // Chat is the default view. Setup is where you go when something is missing,
  // not the thing you land on every time.
  const [tab, setTab] = useState('chat')

  const refresh = useCallback(async () => {
    try {
      setStatus(await api('/status'))
      setAuthed(true)
    } catch (e) {
      if (e.unauthorized) setAuthed(false)
      else setError(e.message)
    }
  }, [])

  useEffect(() => {
    api('/session')
      .then((s) => setAuthed(s.authenticated))
      .catch(() => setAuthed(false))
  }, [])

  useEffect(() => { if (authed) refresh() }, [authed, refresh])

  async function signOut() {
    await api('/logout', { method: 'POST' }).catch(() => {})
    setAuthed(false)
    setStatus(null)
  }

  // Land people on the first thing they have not done rather than always at
  // step one — this screen gets reopened to change one setting far more often
  // than it gets run start to finish. Declared before the early returns below:
  // hooks must run in the same order on every render.
  useEffect(() => {
    if (!status) return
    if (!status.key_set) { setStep('key'); setTab('setup') }
    else if (!status.model) { setStep('model'); setTab('setup') }
  }, [status?.key_set, status?.model])

  if (authed === null) return <div className="app" />
  if (authed === false) {
    return (
      <Login t={t} lang={lang} setLang={setLang} onIn={() => setAuthed(true)} />
    )
  }

  return (
    <div className="app">
      <header>
        <div className="wordmark">
          <Mark />
          <h1>{t.appName}</h1>
        </div>
        <div className="hactions">
          <LangButton lang={lang} setLang={setLang} t={t} />
          <button className="lang" onClick={signOut}>{t.logout}</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>
          <ChatIcon /> {t.tabChat}
        </button>
        <button className={tab === 'setup' ? 'on' : ''} onClick={() => setTab('setup')}>
          <GearIcon /> {t.tabSetup}
        </button>
      </nav>

      {error && (
        <div className="error" onClick={() => setError('')}>
          <strong>{t.error}</strong> {error}
        </div>
      )}

      {tab === 'chat' ? (
        <Chat t={t} status={status} onGoSetup={() => setTab('setup')} setError={setError} />
      ) : (
      <>
      <nav className="steps">
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          return (
            <button
              key={s}
              className={`step ${step === s ? 'active' : ''} ${stepDone(s, status) ? 'done' : ''}`}
              onClick={() => setStep(s)}
            >
              <Icon />
              {t[`step${s[0].toUpperCase()}${s.slice(1)}`]}
            </button>
          )
        })}
      </nav>

      {error && (
        <div className="error" onClick={() => setError('')}>
          <strong>{t.error}</strong> {error}
        </div>
      )}

      <main>
        {step === 'key' && <KeyStep t={t} status={status} refresh={refresh} onDone={() => setStep('model')} setError={setError} />}
        {step === 'model' && <ModelStep t={t} status={status} refresh={refresh} onDone={() => setStep('telegram')} setError={setError} />}
        {step === 'telegram' && <TelegramStep t={t} status={status} refresh={refresh} onDone={() => setStep('mcp')} setError={setError} />}
        {step === 'mcp' && <McpStep t={t} onDone={() => setStep('done')} setError={setError} />}
        {step === 'done' && <DoneStep t={t} status={status} setError={setError} />}
      </main>
      </>
      )}
    </div>
  )
}

function stepDone(step, status) {
  if (!status) return false
  if (step === 'key') return status.key_set
  // The shipped config already names a model, so a model alone proves nothing.
  // It counts as done only once it is ours to use: a key, and OpenRouter as the
  // provider, which is what picking a model here sets.
  if (step === 'model') return Boolean(status.key_set && status.model && status.provider === 'openrouter')
  if (step === 'telegram') return status.telegram_token_set && status.telegram_allowed.length > 0
  return false
}

// --- step 1 ------------------------------------------------------------------

function KeyStep({ t, status, refresh, onDone, setError }) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await api('/key', { method: 'POST', body: JSON.stringify({ key }) })
      setKey('')
      await refresh()
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <div className="chead"><KeyIcon /><h2>{t.keyTitle}</h2></div>
      <p>{t.keyBody}</p>
      <Callout label={t.calloutNote}>
        <span dangerouslySetInnerHTML={{ __html: t.keyWhat }} />
      </Callout>

      <HowTo title={t.keyHowTitle} rows={t.keyHow} />
      <a className="button" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
        {t.keyLink} <ExternalIcon />
      </a>

      {status?.key_set && (
        <div className="ok">
          {t.keySaved} — <code>…{status.key_hint}</code>
        </div>
      )}

      <div className="row">
        <input
          type="password"
          value={key}
          placeholder={t.keyPlaceholder}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && key && save()}
        />
        <button className="primary" disabled={!key || busy} onClick={save}>
          {busy ? t.keyChecking : t.keySave}
        </button>
      </div>

      <Facts rows={t.keyFacts} />
      <Callout label={t.calloutNote}>
        <span dangerouslySetInnerHTML={{ __html: t.keySafety }} />
      </Callout>
    </section>
  )
}

// --- step 2 ------------------------------------------------------------------

function ModelStep({ t, status, refresh, onDone, setError }) {
  const [models, setModels] = useState(null)
  const [primary, setPrimary] = useState('')
  const [fallbacks, setFallbacks] = useState([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setModels(null)
    try {
      const data = await api('/models')
      setModels(data.models)
    } catch (e) {
      setError(e.message)
      setModels([])
    }
  }, [setError])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (status?.model) setPrimary(status.model) }, [status?.model])

  function toggleFallback(id) {
    setFallbacks((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }

  async function save() {
    setBusy(true)
    try {
      await api('/model', {
        method: 'POST',
        body: JSON.stringify({ model: primary, fallbacks: fallbacks.filter((f) => f !== primary) }),
      })
      await refresh()
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <div className="chead"><ModelIcon /><h2>{t.modelTitle}</h2></div>
      <p>{t.modelBody}</p>
      <HowTo title={t.modelHowTitle} rows={t.modelHow} />
      <ul className="glossary">
        {[t.modelWhatPrimary, t.modelWhatFallback, t.modelWhatContext, t.modelWhatTools].map(
          (html, i) => <li key={i} dangerouslySetInnerHTML={{ __html: html }} />,
        )}
      </ul>
      <Facts rows={t.modelFacts} />

      <div className="row between">
        <button onClick={load}><RefreshIcon /> {t.modelRefresh}</button>
        {models && <span className="muted">{models.length}</span>}
      </div>

      {models === null && <p className="muted">{t.modelLoading}</p>}
      {models?.length === 0 && <p className="muted">{t.modelNone}</p>}

      <ul className="models">
        {models?.map((m) => (
          <li key={m.id} className={primary === m.id ? 'sel' : ''}>
            <div className="mhead">
              <strong>{m.name}</strong>
              <span className={`tag ${m.supports_tools ? 'good' : 'warn'}`}>
                {m.supports_tools ? t.modelTools : t.modelNoTools}
              </span>
              <span className="tag">{t.modelContext} {fmtContext(m.context_length)}</span>
            </div>
            <code className="mid">{m.id}</code>
            <div className="mactions">
              <button
                className={primary === m.id ? 'primary' : ''}
                onClick={() => setPrimary(m.id)}
              >
                {t.modelPrimary}
              </button>
              <button
                className={fallbacks.includes(m.id) ? 'primary' : ''}
                disabled={primary === m.id}
                onClick={() => toggleFallback(m.id)}
              >
                {t.modelFallback}
              </button>
            </div>
          </li>
        ))}
      </ul>


      <button className="primary wide" disabled={!primary || busy} onClick={save}>
        {t.modelSave}
      </button>
    </section>
  )
}

// --- step 3 ------------------------------------------------------------------

function TelegramStep({ t, status, refresh, onDone, setError }) {
  const [token, setToken] = useState('')
  const [bot, setBot] = useState(null)
  const [chats, setChats] = useState(null)
  const [picked, setPicked] = useState([])
  const [busy, setBusy] = useState(false)
  const [tested, setTested] = useState(false)

  const username = bot?.username || status?.telegram_bot || ''
  const botLink = username ? `https://t.me/${username}` : ''

  async function saveToken() {
    setBusy(true)
    try {
      setBot(await api('/telegram/token', { method: 'POST', body: JSON.stringify({ token }) }))
      setToken('')
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function findChats() {
    setBusy(true)
    setChats(null)
    try {
      // The server stops the gateway for the length of this call and starts it
      // again afterwards — Telegram hands each update to one caller only.
      const data = await api('/telegram/chats')
      setChats(data.chats)
      setPicked(data.chats.map((c) => c.id))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function allow() {
    setBusy(true)
    try {
      await api('/telegram/allow', { method: 'POST', body: JSON.stringify({ ids: picked }) })
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    setBusy(true)
    setTested(false)
    try {
      await api('/telegram/test', { method: 'POST' })
      setTested(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const hasToken = status?.telegram_token_set
  const hasAllowed = (status?.telegram_allowed?.length || 0) > 0

  return (
    <section className="card">
      <div className="chead"><TelegramIcon /><h2>{t.tgTitle}</h2></div>
      <p>{t.tgBody}</p>

      {/* 1 — make the bot */}
      <HowTo title={t.tgHowTitle} rows={t.tgHow} />
      <a className="button" href="https://t.me/BotFather" target="_blank" rel="noreferrer">
        {t.tgOpenBotFather} <ExternalIcon />
      </a>

      <div className="row">
        <input
          type="password"
          value={token}
          placeholder={t.tgPlaceholder}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="primary" disabled={!token || busy} onClick={saveToken}>
          {t.tgSave}
        </button>
      </div>

      {hasToken && (
        <div className="ok">
          {t.tgConnected}{username ? ` — @${username}` : ''}
        </div>
      )}

      {/* 2 — say hello, so Telegram lets the bot reply */}
      {hasToken && (
        <>
          <hr />
          <h3>{t.tgStep2Title}</h3>
          <p dangerouslySetInnerHTML={{ __html: t.tgStep2 }} />
          {botLink && (
            <a className="button primary wide" href={botLink} target="_blank" rel="noreferrer">
              {t.tgOpenBot} <ExternalIcon />
            </a>
          )}
          <Callout label={t.calloutNote}>{t.tgWhyStart}</Callout>

          <button className="wide" disabled={busy} onClick={findChats}>
            {busy ? t.tgFetching : t.tgFetch}
          </button>

          {chats?.length === 0 && <p className="muted">{t.tgNone}</p>}
          {chats?.length > 0 && (
            <ul className="chats">
              {chats.map((c) => (
                <li key={c.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={picked.includes(c.id)}
                      onChange={() =>
                        setPicked((p) =>
                          p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id],
                        )
                      }
                    />
                    <code>{c.id}</code> {c.who} <span className="muted">({c.type})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <Callout label={t.calloutWarn} kind="warn">{t.tgWarn}</Callout>

          {hasAllowed && (
            <div className="ok">
              {t.tgAllowed} — <code>{status.telegram_allowed.join(', ')}</code>
            </div>
          )}

          <button
            className="primary wide"
            disabled={picked.length === 0 || busy}
            onClick={allow}
          >
            {t.tgAllow}
          </button>
        </>
      )}

      {/* 3 — prove it end to end */}
      {hasToken && hasAllowed && (
        <>
          <hr />
          <h3>{t.tgTestTitle}</h3>
          <p>{t.tgTestBody}</p>
          <button className="wide" disabled={busy} onClick={sendTest}>
            <TelegramIcon /> {busy ? t.tgTesting : t.tgTest}
          </button>
          {tested && <div className="ok">{t.tgTestOk}</div>}
        </>
      )}

      <button className="link" onClick={onDone}>{t.tgSkip} →</button>
    </section>
  )
}

// --- step 4 ------------------------------------------------------------------

function McpStep({ t, onDone, setError }) {
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    try {
      setData(await api('/mcp'))
    } catch (e) {
      setError(e.message)
    }
  }, [setError])

  useEffect(() => { load() }, [load])

  async function toggle(name, install) {
    setBusy(name)
    try {
      await api('/mcp', { method: 'POST', body: JSON.stringify({ name, install }) })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  async function installRecommended() {
    setBusy('*')
    try {
      await api('/mcp/recommended', { method: 'POST' })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const on = (data?.presets || []).filter((p) => p.installed).length
  const foreign = data?.others?.length || 0
  const total = on + foreign

  return (
    <section className="card">
      <div className="chead">
        <ToolsIcon />
        <h2>{t.mcpTitle}</h2>
        <span className={`state ${total > 4 ? 'warn' : total ? 'on' : ''}`}>
          {t.mcpCount} {total}
        </span>
      </div>

      <p>{t.mcpBody}</p>
      <Callout label={t.calloutNote}>
        <span dangerouslySetInnerHTML={{ __html: t.mcpWhat }} />
      </Callout>

      <HowTo title={t.mcpHowTitle} rows={t.mcpHow} />

      <Callout label={t.mcpTooMany} kind="warn">{t.mcpTooManyBody}</Callout>

      <button className="wide" disabled={busy === '*'} onClick={installRecommended}>
        <ToolsIcon /> {t.mcpRecommend}
      </button>

      <ul className="tools">
        {data?.presets.map((p) => (
          <li key={p.name} className={p.installed ? 'on' : ''}>
            <div>
              <strong>
                {t === STRINGS.ko ? p.label_ko : p.label_en}
                {p.recommended && <span className="pill">{t.mcpRecommended}</span>}
              </strong>
              <p>{t === STRINGS.ko ? p.desc_ko : p.desc_en}</p>
            </div>
            <button
              className={p.installed ? '' : 'primary'}
              disabled={busy === p.name || busy === '*'}
              onClick={() => toggle(p.name, !p.installed)}
            >
              {p.installed ? t.mcpRemove : t.mcpInstall}
            </button>
          </li>
        ))}
      </ul>

      {foreign > 0 && (
        <>
          <h3>{t.mcpOther}</h3>
          <ul className="tools muted">
            {data.others.map((o) => (
              <li key={o.name}><div><strong>{o.name}</strong></div></li>
            ))}
          </ul>
        </>
      )}

      <button className="primary wide" onClick={onDone}>{t.next}</button>
    </section>
  )
}

// --- step 5 ------------------------------------------------------------------

function DoneStep({ t, status, setError }) {
  const [state, setState] = useState('idle')
  // A one-shot round trip through the agent. Restarting proves the container
  // came back; only an actual answer proves the key, the model and the gateway
  // all line up.
  const [test, setTest] = useState(null)
  const [testing, setTesting] = useState(false)

  async function runTest() {
    setTesting(true)
    setTest(null)
    try {
      const res = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: t.doneTestPrompt, session_id: '' }),
      })
      setTest({ ok: true, text: res.reply || t.doneTestFail, model: res.model })
    } catch (e) {
      setTest({ ok: false, text: e.message })
    } finally {
      setTesting(false)
    }
  }

  async function restart() {
    setState('busy')
    try {
      await api('/gateway/restart', { method: 'POST' })
      setState('done')
    } catch (e) {
      setError(e.message)
      setState('idle')
    }
  }

  return (
    <section className="card">
      <div className="chead"><DoneIcon /><h2>{t.doneTitle}</h2></div>

      <dl className="summary">
        <dt>{t.summaryKey}</dt>
        <dd>{status?.key_set ? `…${status.key_hint}` : t.notSet}</dd>
        <dt>{t.summaryModel}</dt>
        <dd><code>{status?.model || t.notSet}</code></dd>
        <dt>{t.summaryTelegram}</dt>
        <dd>{status?.telegram_allowed?.length ? status.telegram_allowed.join(', ') : t.none}</dd>
      </dl>

      <HowTo title={t.doneHowTitle} rows={t.doneHow} />
      <Callout label={t.calloutNote}>{t.doneWhyRestart}</Callout>

      <p>{t.doneBody}</p>
      <button className="primary wide" disabled={state === 'busy'} onClick={restart}>
        {state === 'busy' ? t.doneRestarting : state === 'done' ? t.doneRestarted : t.doneRestart}
      </button>

      {state === 'done' && (
        <div className="handoff">
          <p>{t.doneTestBody}</p>
          <button disabled={testing} onClick={runTest}>
            <ChatIcon /> {testing ? t.doneTesting : t.doneTest}
          </button>

          {test && (
            <div className={`testout ${test.ok ? '' : 'bad'}`}>
              <span className="who">{test.ok ? t.chatAgent : '!'}</span>
              <div className="body">{test.text}</div>
            </div>
          )}

          <hr />
          <p>{t.doneGoBody}</p>
          <a className="primary wide button" href={status?.dashboard_url || '/'} target="_blank" rel="noreferrer">
            {t.doneGo} <ExternalIcon />
          </a>
        </div>
      )}
    </section>
  )
}
