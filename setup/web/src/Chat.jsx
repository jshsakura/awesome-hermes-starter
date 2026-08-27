import { useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import { SendIcon, NewIcon, ChatIcon } from './Icons.jsx'

// The whole point of the app, once setup is done: talk to the agent without
// meeting the dashboard first. Kept to two verbs — send, and start over —
// because everything else already exists one link away and doing it twice
// badly helps nobody.

export default function Chat({ t, status, onGoSetup, setError }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [ready, setReady] = useState(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    api('/chat/health')
      .then((h) => setReady(h.ready))
      .catch(() => setReady(false))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  const configured = status?.key_set && status?.model

  async function send() {
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    setMessages((m) => [...m, { role: 'user', text }])
    setBusy(true)
    try {
      const res = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })
      if (res.session_id && !sessionId) setSessionId(res.session_id)
      setMessages((m) => [...m, { role: 'agent', text: res.reply || '' }])
    } catch (e) {
      // Keep the failure in the thread rather than in a banner that scrolls
      // away — you need to see which message did not go through.
      setMessages((m) => [...m, { role: 'error', text: e.message }])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  function reset() {
    // A new session id is the reset. The old thread stays on the server, so
    // this drops the context without destroying anything.
    setSessionId('')
    setMessages([])
    setDraft('')
  }

  function onKeyDown(e) {
    // Enter sends, Shift+Enter breaks the line. On a phone the on-screen
    // keyboard's return key inserts a newline instead, which is why the send
    // button is always visible.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  if (!configured || ready === false) {
    return (
      <section className="card">
        <div className="chead"><ChatIcon /><h2>{t.tabChat}</h2></div>
        <p>{t.chatNotReady}</p>
        <p className="muted">{t.chatNotReadyHint}</p>
        <button className="primary wide" onClick={onGoSetup}>{t.chatGoSetup}</button>
      </section>
    )
  }

  return (
    <section className="chat">
      <div className="chatbar">
        <span className="chattitle">{t.tabChat}</span>
        <button onClick={reset} disabled={busy || messages.length === 0}>
          <NewIcon /> {t.chatReset}
        </button>
      </div>

      <div className="thread">
        {messages.length === 0 && (
          <div className="empty">
            <p>{t.chatEmpty}</p>
            <p className="muted">{t.chatEmptyHint}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <span className="who">
              {m.role === 'user' ? t.chatYou : m.role === 'error' ? '!' : t.chatAgent}
            </span>
            <div className="body">{m.text}</div>
          </div>
        ))}

        {busy && (
          <div className="msg agent">
            <span className="who">{t.chatAgent}</span>
            <div className="body pending">{t.chatSending}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          placeholder={t.chatPlaceholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="primary" disabled={busy || !draft.trim()} onClick={send}>
          <SendIcon /> <span className="btxt">{t.chatSend}</span>
        </button>
      </div>
    </section>
  )
}
