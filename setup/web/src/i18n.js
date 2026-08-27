// Korean first, English alongside. The starter is aimed at Korean users — that
// is the gap it exists to fill — but nothing about a NAS agent is Korean, so
// the second language costs little and doubles who can use it.

export const STRINGS = {
  ko: {
    appName: 'Hermes Starter',
    demoBanner: '데모 화면입니다. 아무것도 저장되지 않고, 실제 에이전트도 돌지 않습니다.',
    demoCta: '직접 설치하기',
    title: 'Hermes 시작하기',
    subtitle: '네 단계만 거치면 바로 쓸 수 있습니다.',
    langLabel: 'English',

    loginTitle: '로그인',
    loginBody: 'API 키와 봇 토큰을 다루는 화면이라 로그인이 필요합니다.',
    loginUser: '아이디',
    loginPassword: '비밀번호',
    loginSubmit: '로그인',
    loginBusy: '확인 중',
    loginFailed: '아이디 또는 비밀번호가 맞지 않습니다',
    loginHintTail: '.env 에 적어둔 값입니다.',
    calloutNote: '참고',
    calloutWarn: '주의',
    logout: '로그아웃',


    tabChat: '대화',
    tabSetup: '설정',

    chatPlaceholder: '무엇이든 물어보세요',
    chatSend: '보내기',
    chatSending: '생각 중',
    chatReset: '새 대화',
    chatResetDone: '대화를 새로 시작했습니다',
    chatEmpty: '아직 대화가 없습니다.',
    chatEmptyHint: '아래에 메시지를 입력해 보세요.',
    chatNotReady: '아직 대화할 준비가 안 됐습니다.',
    chatNotReadyHint: '설정 탭에서 API 키와 모델을 먼저 지정해 주세요.',
    chatGoSetup: '설정으로 가기',
    chatYou: '나',
    chatAgent: 'Hermes',



    stepKey: 'API 키',
    stepModel: '모델',
    stepTelegram: '텔레그램',
    stepMcp: '도구',
    stepDone: '완료',

    keyHowTitle: 'OpenRouter 키 받기',
    keyHow: [
      ['1', '<b>openrouter.ai</b> 에 가입합니다. 구글 계정으로 바로 됩니다.'],
      ['2', '오른쪽 위 프로필 → <b>Keys</b> 로 들어갑니다.'],
      ['3', '<b>Create Key</b> 를 누르고 이름은 아무거나 적습니다.'],
      ['4', '<code>sk-or-v1-</code> 로 시작하는 값을 복사해 아래에 붙여넣습니다.'],
      ['5', '이 값은 <b>한 번만 보입니다.</b> 창을 닫기 전에 복사하세요.'],
    ],
    keyWhat: 'OpenRouter 는 여러 회사의 AI 모델을 한 곳에서 쓰게 해주는 중개 서비스입니다. 모델마다 따로 가입할 필요가 없고, 무료로 열려 있는 모델도 같이 제공합니다.',
    keySafety: '키는 이 서버 안 <code>data/.env</code> 에만 저장됩니다. 다른 곳으로 나가지 않습니다.',

    modelHowTitle: '고르는 순서',
    modelHow: [
      ['1', '목록에서 하나를 골라 <b>기본</b> 을 누릅니다. 맨 위에 있는 것을 권합니다.'],
      ['2', '다른 것 한두 개에 <b>대체</b> 를 눌러 둡니다.'],
      ['3', '아래 <b>이 모델로 설정</b> 을 누릅니다.'],
    ],
    modelWhatPrimary: '<b>기본</b> 은 평소에 쓸 모델입니다.',
    modelWhatFallback: '<b>대체</b> 는 기본이 막혔을 때 대신 쓸 모델입니다. 무료 모델은 하루 한도가 있어서 자주 막히는데, 대체가 없으면 그 순간 에이전트가 멈춥니다.',
    modelWhatContext: '<b>컨텍스트</b> 는 한 번에 기억할 수 있는 분량입니다. 클수록 긴 대화와 큰 파일을 다룹니다.',
    modelWhatTools: '<b>도구 사용</b> 이 없는 모델은 파일을 읽거나 웹을 보지 못하고 대화만 합니다.',

    mcpHowTitle: '고르는 법',
    mcpHow: [
      ['1', '잘 모르겠으면 <b>권장 3종 설치</b> 만 누르면 됩니다.'],
      ['2', '필요한 것이 생기면 그때 하나씩 켭니다.'],
      ['3', '안 쓰는 것은 <b>제거</b> 로 꺼 두세요.'],
    ],
    mcpWhat: '도구는 에이전트가 할 수 있는 일을 늘려 줍니다. 파일을 읽거나, 웹을 보거나, 검색을 하는 식입니다. 여기 있는 것은 모두 추가 가입이나 결제 없이 바로 동작합니다.',

    doneHowTitle: '마무리',
    doneHow: [
      ['1', '<b>적용하고 재시작</b> 을 누릅니다. 설정이 이때 반영됩니다.'],
      ['2', '<b>테스트 해보기</b> 로 실제 답이 오는지 확인합니다.'],
      ['3', '잘 되면 <b>대화</b> 탭에서 바로 쓰면 됩니다.'],
    ],
    doneWhyRestart: '설정은 파일에 저장되지만, 이미 돌고 있는 에이전트는 예전 설정을 들고 있습니다. 재시작해야 새 값을 다시 읽습니다.',


    keyTitle: 'OpenRouter 키 등록',
    keyBody: '무료 모델을 쓰려면 이 키 하나만 있으면 됩니다.',
    keyLink: 'openrouter.ai/keys 에서 발급받기',
    keyPlaceholder: 'sk-or-v1-...',
    keySave: '확인 후 저장',
    keySaved: '저장했습니다',
    keyChecking: '확인 중',
    keyFacts: [
      ['무료 한도', '하루 <em>50회</em>. 실패한 요청도 포함됩니다'],
      ['초기화', '한국시간 <em>매일 09:00</em>'],
      ['한도 늘리기', '<em>$10</em> 한 번 충전하면 하루 1,000회로 영구 상향'],
      ['카드 등록', '필요 없습니다'],
    ],

    modelTitle: '무료 모델 선택',
    modelBody: '지금 실제로 무료인 모델만 불러옵니다.',
    modelFacts: [
      ['왜 매번 조회', '무료 제공이 <em>이름은 그대로인 채</em> 끊기는 일이 잦습니다'],
      ['정렬 기준', '도구 사용 가능 여부 → 컨텍스트 크기'],
      ['도구 사용', '못 하는 모델은 대화만 가능합니다'],
      ['대체 모델', '두어 개 골라두면 한도 초과에도 멈추지 않습니다'],
    ],
    modelRefresh: '새로고침',
    modelLoading: '불러오는 중',
    modelNone: '지금은 무료로 열린 모델이 없습니다. 잠시 후 다시 시도해 주세요.',
    modelPrimary: '기본',
    modelFallback: '대체',
    modelTools: '도구 사용',
    modelNoTools: '대화만',
    modelContext: '컨텍스트',
    modelSave: '이 모델로 설정',
    modelSaved: '설정했습니다',
    modelHint: '',
    modelFallbackHint: '',






    tgTitle: '텔레그램 연결',
    tgBody: '휴대폰에서 바로 쓰려면 연결하세요. 건너뛰어도 됩니다.',

    tgHowTitle: '봇 만들기',
    tgHow: [
      ['1', '텔레그램에서 <b>@BotFather</b> 와 대화를 엽니다.'],
      ['2', '<code>/newbot</code> 을 보냅니다.'],
      ['3', '봇 이름을 정합니다. 목록에 보일 이름이라 아무거나 괜찮습니다.'],
      ['4', '사용자명을 정합니다. <b>반드시 bot 으로 끝나야</b> 합니다 — 예: <code>my_nas_bot</code>'],
      ['5', '<code>123456:ABC-DEF...</code> 형태의 토큰을 받아 아래에 붙여넣습니다.'],
    ],
    tgOpenBotFather: 'BotFather 열기',

    tgPlaceholder: '123456:ABC-DEF...',
    tgSave: '토큰 확인',
    tgConnected: '연결했습니다',

    tgStep2Title: '봇에게 말 걸기',
    tgStep2: '봇을 열고 <b>시작</b>(<code>/start</code>) 을 누른 뒤, 아무 메시지나 한 번 보내 주세요.',
    tgOpenBot: '내 봇 열기',
    tgWhyStart: '텔레그램은 먼저 말을 건 사람에게만 봇이 답할 수 있게 합니다. 그래서 /start 가 필요합니다.',
    tgFetch: '내 아이디 찾기',
    tgFetching: '조회 중',
    tgNone: '아직 받은 메시지가 없습니다. 봇에게 메시지를 보낸 뒤 다시 눌러 주세요.',
    tgAllow: '선택한 사람만 허용',
    tgAllowed: '허용했습니다',
    tgWarn: '허용 목록이 비어 있으면 봇 주소를 아는 누구나 내 파일과 사용량을 쓸 수 있습니다.',

    tgTestTitle: '연결 확인',
    tgTest: '테스트 메시지 보내기',
    tgTesting: '보내는 중',
    tgTestOk: '보냈습니다. 텔레그램을 확인해 보세요.',
    tgTestBody: '휴대폰에 실제로 도착해야 연동이 끝난 것입니다.',
    tgSkip: '건너뛰기',

    mcpTitle: '도구 추가',
    mcpBody: '추가 가입이나 키 없이 바로 쓰는 것들만 모았습니다.',
    mcpRecommend: '권장 3종 설치',
    mcpRecommended: '권장',
    mcpCount: '켜진 도구',
    mcpTooMany: '너무 많이 켜면 오히려 나빠집니다',
    mcpTooManyBody:
      '도구는 매 대화마다 목록 전체가 모델에게 설명됩니다. 많을수록 컨텍스트를 먹고, 모델이 엉뚱한 것을 고릅니다. 무료 모델은 특히 프롬프트가 길어지면 도구 호출부터 무너집니다. 실제로 쓸 것만 켜세요 — 셋이면 충분합니다.',
    mcpFacts: [
      ['왜 이것뿐인가', '기본 목록 <em>65개</em>는 대부분 브라우저 로그인이 필요해 컨테이너에서 못 씁니다'],
      ['목록에 없는 것', '<em>파일</em> — 나스에 두는 가장 큰 이유인데 빠져 있습니다'],
      ['추가 설치', '없습니다'],
    ],
    mcpInstall: '추가',
    mcpRemove: '제거',
    mcpInstalled: '추가됨',
    mcpOther: '직접 추가한 것',

    doneTitle: '준비 완료',
    doneBody: '재시작하면 지금 설정이 적용됩니다.',
    doneRestart: '적용하고 재시작',
    doneRestarting: '재시작 중',
    doneRestarted: '적용했습니다',
    doneTest: '테스트 해보기',
    doneTesting: '물어보는 중',
    doneTestBody: '실제로 답이 오는지 여기서 한 번 확인해 보세요.',
    doneTestPrompt: '안녕! 한 문장으로 자기소개 해줘.',
    doneTestFail: '답을 받지 못했습니다',
    doneGo: 'Hermes 대시보드 열기',
    doneGoBody: '설정은 끝났습니다. 대화와 나머지 기능은 Hermes 대시보드에서 이용하세요.',

    summaryKey: 'API 키',
    summaryModel: '모델',
    summaryTelegram: '텔레그램',
    summaryTools: '도구',
    notSet: '설정 안 됨',
    none: '없음',
    back: '이전',
    next: '다음',
    error: '오류',
  },

  en: {
    appName: 'Hermes Starter',
    demoBanner: 'This is a demo. Nothing is saved, and no agent is running behind it.',
    demoCta: 'Install it yourself',
    title: 'Get Hermes talking',
    subtitle: 'Four steps to a working agent. No credit card.',
    langLabel: '한국어',

    loginTitle: 'Sign in',
    loginBody: 'This screen writes your API key and your bot token, so it is locked.',
    loginUser: 'Username',
    loginPassword: 'Password',
    loginSubmit: 'Sign in',
    loginBusy: 'Checking…',
    loginFailed: 'Wrong username or password',
    loginHintTail: 'from your .env file.',
    calloutNote: 'Note',
    calloutWarn: 'Careful',
    logout: 'Sign out',


    tabChat: 'Chat',
    tabSetup: 'Setup',

    chatPlaceholder: 'Ask anything',
    chatSend: 'Send',
    chatSending: 'Thinking',
    chatReset: 'New chat',
    chatResetDone: 'Started a new conversation',
    chatEmpty: 'Nothing here yet.',
    chatEmptyHint: 'Type a message below.',
    chatNotReady: 'Not ready to chat yet.',
    chatNotReadyHint: 'Set an API key and a model in the Setup tab first.',
    chatGoSetup: 'Go to setup',
    chatYou: 'You',
    chatAgent: 'Hermes',



    stepKey: 'API key',
    stepModel: 'Model',
    stepTelegram: 'Telegram',
    stepMcp: 'Tools',
    stepDone: 'Done',

    keyHowTitle: 'Get an OpenRouter key',
    keyHow: [
      ['1', 'Sign up at <b>openrouter.ai</b>. Google sign-in works.'],
      ['2', 'Top-right profile → <b>Keys</b>.'],
      ['3', 'Press <b>Create Key</b> and name it anything.'],
      ['4', 'Copy the value starting <code>sk-or-v1-</code> and paste it below.'],
      ['5', 'It is shown <b>only once.</b> Copy it before closing the dialog.'],
    ],
    keyWhat: 'OpenRouter is a broker: one account that reaches models from many companies, including the ones currently offered for free. You do not sign up with each provider separately.',
    keySafety: 'The key is stored only in <code>data/.env</code> on this server. It goes nowhere else.',

    modelHowTitle: 'How to choose',
    modelHow: [
      ['1', 'Pick one and press <b>Primary</b>. The top of the list is a safe choice.'],
      ['2', 'Press <b>Fallback</b> on one or two others.'],
      ['3', 'Press <b>Use this model</b> below.'],
    ],
    modelWhatPrimary: '<b>Primary</b> is the model used normally.',
    modelWhatFallback: '<b>Fallback</b> is what gets used when the primary is refused. Free models hit a daily limit often, and without a fallback the agent simply stops at that moment.',
    modelWhatContext: '<b>Context</b> is how much it can hold at once. Bigger means longer conversations and larger files.',
    modelWhatTools: 'A model without <b>tool calling</b> cannot read files or fetch pages. It can only talk.',

    mcpHowTitle: 'How to choose',
    mcpHow: [
      ['1', 'If unsure, just press <b>Install the recommended three</b>.'],
      ['2', 'Add others one at a time, when you find you need them.'],
      ['3', 'Use <b>Remove</b> on anything you do not use.'],
    ],
    mcpWhat: 'Tools widen what the agent can do — read a file, open a page, run a search. Everything here works with no extra signup and no payment.',

    doneHowTitle: 'Finishing up',
    doneHow: [
      ['1', 'Press <b>Apply and restart</b>. This is when the settings take effect.'],
      ['2', 'Press <b>Run a test</b> to confirm an answer comes back.'],
      ['3', 'If it works, use the <b>Chat</b> tab.'],
    ],
    doneWhyRestart: 'Settings are written to disk, but the running agent is still holding the old ones. A restart is what makes it read them again.',


    keyTitle: 'Add your OpenRouter key',
    keyBody: 'The only key you need to run on free models. No card required.',
    keyLink: 'Get one at openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    keySave: 'Verify and save',
    keySaved: 'Saved',
    keyChecking: 'Checking the key…',
    keyFacts: [
      ['Free allowance', '<em>50</em> requests a day. Failed 429s count'],
      ['Resets', 'midnight <em>UTC</em>'],
      ['Raising it', '$10 <em>once</em> → 1,000/day, permanently. Not a balance requirement'],
      ['Card', 'not required'],
    ],

    modelTitle: 'Pick a free model',
    modelBody: 'What is actually free right now.',
    modelFacts: [
      ['Why live', 'Free endpoints get withdrawn <em>while the name stays</em>. A pinned id quietly stops working'],
      ['Sorted by', 'tool calling, then context'],
      ['Tool calling', 'Without it you have a chatbot. Tools are most of what Hermes does'],
      ['Fallbacks', 'Pick two and a <em>429</em> stops ending the conversation'],
    ],
    modelRefresh: 'Refresh list',
    modelLoading: 'Loading free models…',
    modelNone: 'Nothing is free right now. Try again shortly.',
    modelPrimary: 'Primary',
    modelFallback: 'Fallback',
    modelTools: 'calls tools',
    modelNoTools: 'no tool calling',
    modelContext: 'context',
    modelSave: 'Use this model',
    modelSaved: 'Set',
    modelHint: '',
    modelFallbackHint: '',






    tgTitle: 'Connect Telegram',
    tgBody: 'To use it from your phone. You can skip this.',

    tgHowTitle: 'Create a bot',
    tgHow: [
      ['1', 'Open a chat with <b>@BotFather</b> in Telegram.'],
      ['2', 'Send <code>/newbot</code>.'],
      ['3', 'Give it a name. This is just the display name.'],
      ['4', 'Give it a username. It <b>must end in bot</b> — e.g. <code>my_nas_bot</code>'],
      ['5', 'Paste the token it gives you (<code>123456:ABC-DEF...</code>) below.'],
    ],
    tgOpenBotFather: 'Open BotFather',

    tgPlaceholder: '123456:ABC-DEF...',
    tgSave: 'Verify token',
    tgConnected: 'Connected',

    tgStep2Title: 'Say hello to it',
    tgStep2: 'Open your bot, press <b>Start</b> (<code>/start</code>), then send it any message.',
    tgOpenBot: 'Open my bot',
    tgWhyStart: 'Telegram only lets a bot reply to people who spoke to it first. That is what /start is for.',
    tgFetch: 'Find my id',
    tgFetching: 'Asking Telegram',
    tgNone: 'No messages yet. Send one to the bot, then press again.',
    tgAllow: 'Allow only these',
    tgAllowed: 'Allowed',
    tgWarn: 'An empty allow-list means anyone who finds your bot is using your files and your quota.',

    tgTestTitle: 'Check it works',
    tgTest: 'Send a test message',
    tgTesting: 'Sending',
    tgTestOk: 'Sent. Check Telegram.',
    tgTestBody: 'It is only connected once a message actually lands on your phone.',
    tgSkip: 'Skip',

    mcpTitle: 'Add tools',
    mcpBody: 'Everything here works without another signup or key.',
    mcpRecommend: 'Install the recommended three',
    mcpRecommended: 'Recommended',
    mcpCount: 'Enabled',
    mcpTooMany: 'More is worse here',
    mcpTooManyBody:
      'Every enabled tool is described to the model on every turn. The list is a standing tax on the context window and on the model\'s attention, and tool calling is the first thing to degrade on a free model under a long prompt. Turn on what you will actually use — three is plenty.',
    mcpFacts: [
      ['Why only these', "The <em>65</em>-entry catalog is mostly OAuth, which cannot complete in a container"],
      ['Not in the catalog', '<em>Filesystem</em> — the reason to put an agent on a NAS'],
      ['Extra images', 'None. npx and uvx are already in the image'],
    ],
    mcpInstall: 'Install',
    mcpRemove: 'Remove',
    mcpInstalled: 'Installed',
    mcpOther: 'Added elsewhere',

    doneTitle: 'Ready',
    doneBody: 'Restart the gateway to apply what you just set.',
    doneRestart: 'Apply and restart',
    doneRestarting: 'Restarting…',
    doneRestarted: 'Applied',
    doneTest: 'Run a test',
    doneTesting: 'Asking',
    doneTestBody: 'Check that an answer actually comes back.',
    doneTestPrompt: 'Hi! Introduce yourself in one sentence.',
    doneTestFail: 'No answer came back',
    doneGo: 'Open the Hermes dashboard',
    doneGoBody:
      'This screen is done. From here you chat, enable skills and read sessions in Hermes itself.',

    summaryKey: 'API key',
    summaryModel: 'Model',
    summaryTelegram: 'Telegram',
    summaryTools: 'Tools',
    notSet: 'not set',
    none: 'none',
    back: 'Back',
    next: 'Next',
    error: 'Something went wrong',
  },
}
