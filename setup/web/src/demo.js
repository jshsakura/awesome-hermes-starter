// Demo mode — the real UI, wired to canned answers instead of a server.
//
// This exists so the GitHub Pages site is the actual screen rather than a
// screenshot of it: you click through the same five steps, in the same layout,
// with the same copy. Nothing is stored and nothing leaves the browser.
//
// The model list is a real snapshot of OpenRouter's free tier, taken on
// 2026-08-27. It will drift, which is the point the model step makes anyway.

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const MODELS = [
  {
    id: 'thinkingmachines/inkling-small:free',
    name: 'Thinking Machines: Inkling Small (free)',
    context_length: 1048576,
    supports_tools: true,
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Thinking Machines: Inkling (free)',
    context_length: 1048576,
    supports_tools: true,
  },
  {
    id: 'minimax/minimax-m3:free',
    name: 'MiniMax: MiniMax M3 (free)',
    context_length: 1048576,
    supports_tools: true,
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA: Nemotron 3.5 Lightning (free)',
    context_length: 1000000,
    supports_tools: true,
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen: Qwen3 235B A22B (free)',
    context_length: 262144,
    supports_tools: true,
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'MoonshotAI: Kimi K2 (free)',
    context_length: 131072,
    supports_tools: true,
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Google: Gemma 3 27B (free)',
    context_length: 96000,
    supports_tools: false,
  },
]

const PRESETS = [
  {
    name: 'filesystem',
    recommended: true,
    label_ko: '파일',
    label_en: 'Files',
    desc_ko: './files 안의 파일을 읽고 쓴다. 나스 공유를 붙이는 자리.',
    desc_en: 'Read and write files under ./files — where you mount a NAS share.',
  },
  {
    name: 'fetch',
    recommended: true,
    label_ko: '웹 읽기',
    label_en: 'Fetch',
    desc_ko: 'URL 을 열어 본문을 읽는다. 무료 모델은 검색 능력이 없어 체감이 크다.',
    desc_en: 'Open a URL and read the page. Free models have no browsing of their own.',
  },
  {
    name: 'search',
    recommended: true,
    label_ko: '웹 검색',
    label_en: 'Web search',
    desc_ko: 'DuckDuckGo 검색. 계정도 키도 필요 없다.',
    desc_en: 'DuckDuckGo search. No account, no key.',
  },
  {
    name: 'docs',
    recommended: false,
    label_ko: '라이브러리 문서',
    label_en: 'Library docs',
    desc_ko: 'Context7 — 라이브러리 최신 문서를 버전까지 맞춰 가져온다.',
    desc_en: 'Context7 — version-accurate docs for libraries.',
  },
  {
    name: 'time',
    recommended: false,
    label_ko: '시간·시간대',
    label_en: 'Time',
    desc_ko: '현재 시각과 시간대 변환. 예약·알림을 쓸 거면 넣는다.',
    desc_en: 'Current time and timezone conversion. Needed for schedules.',
  },
]

// Everything the demo pretends to have configured. Mutated by the same calls
// the real app makes, so the steps tick over exactly as they would.
const state = {
  authed: false,
  key_set: false,
  key_hint: '',
  model: '',
  provider: '',
  fallbacks: [],
  telegram_token_set: false,
  telegram_allowed: [],
  telegram_bot: '',
  installed: new Set(),
}

const CHAT = {
  ko: [
    '안녕하세요. 나스에서 도는 헤르메스입니다. 파일 정리, 웹 검색, 예약 작업 같은 걸 시키시면 됩니다.',
    '데모 화면이라 실제로는 아무것도 실행하지 않습니다. 직접 설치하시면 이 자리에서 진짜로 답합니다.',
    '설정은 다 끝났습니다. 이제 헤르메스 본판 대시보드로 넘어가셔도 됩니다.',
  ],
  en: [
    "Hello — I'm Hermes, running on your NAS. Ask me to sort files, search the web, or run something on a schedule.",
    'This is a demo, so nothing actually runs. Install it and this is where the real answers appear.',
    'Setup is done. You can move on to the Hermes dashboard whenever you like.',
  ],
}
let chatTurn = 0

function lang() {
  return (navigator.language || '').startsWith('ko') ? 'ko' : 'en'
}

export async function demoApi(path, options = {}) {
  const body = options.body ? JSON.parse(options.body) : {}
  await wait(320) // enough that the busy states are visible, not enough to annoy

  switch (true) {
    case path === '/session':
      return { authenticated: state.authed }

    case path === '/login':
      // Any password works here. Saying so is friendlier than a rejection on a
      // page that has nothing to protect.
      state.authed = true
      return { ok: true, username: body.username || 'admin' }

    case path === '/logout':
      state.authed = false
      return { ok: true }

    case path === '/status':
      return {
        key_set: state.key_set,
        key_hint: state.key_hint,
        model: state.model,
        provider: state.provider,
        fallbacks: state.fallbacks,
        telegram_token_set: state.telegram_token_set,
        telegram_allowed: state.telegram_allowed,
        telegram_bot: state.telegram_bot,
        data_dir: '/opt/data',
        dashboard_url: 'https://github.com/jshsakura/awesome-hermes-starter',
      }

    case path === '/key':
      state.key_set = true
      state.key_hint = (body.key || 'demo').slice(-4)
      state.provider = 'openrouter'
      return { ok: true, is_free_tier: true }

    case path === '/models':
      return { models: MODELS, count: MODELS.length }

    case path === '/model':
      state.model = body.model
      state.fallbacks = body.fallbacks || []
      state.provider = 'openrouter'
      return { ok: true }

    case path === '/telegram/token':
      state.telegram_token_set = true
      state.telegram_bot = 'my_nas_bot'
      return { ok: true, username: 'my_nas_bot', link: 'https://t.me/my_nas_bot' }

    case path === '/telegram/chats':
      return { chats: [{ id: '915733248', who: 'you', type: 'private' }] }

    case path === '/telegram/allow':
      state.telegram_allowed = body.ids || []
      return { ok: true }

    case path === '/telegram/test':
      return { ok: true, sent: state.telegram_allowed }

    case path === '/mcp':
      return {
        presets: PRESETS.map((p) => ({ ...p, installed: state.installed.has(p.name) })),
        others: [],
      }

    case path === '/mcp/recommended':
      PRESETS.filter((p) => p.recommended).forEach((p) => state.installed.add(p.name))
      return { ok: true }

    case path === '/mcp' || path.startsWith('/mcp'):
      if (body.install) state.installed.add(body.name)
      else state.installed.delete(body.name)
      return { ok: true }

    case path === '/chat/health':
      return { ready: state.key_set && Boolean(state.model) }

    case path === '/chat': {
      const lines = CHAT[lang()]
      const reply = lines[Math.min(chatTurn++, lines.length - 1)]
      await wait(700)
      return { reply, session_id: 'demo', model: state.model }
    }

    case path.startsWith('/gateway'):
      return { ok: true, reachable: true, running: true }

    default:
      return { ok: true }
  }
}
