const socket = io();

const translations = {
  en: {
    appTitle: 'Kaminskyi AI Messenger',
    waitingSubtitle: 'Preparing meeting…',
    hostSubtitle: (host) => `Host: ${host}`,
    linkReady: (token, capacity) => `Meeting link ready: ${token} · Capacity ${capacity}`,
    docTitle: (host) => `Kaminskyi AI Messenger — Meeting with ${host}`,
    copyLink: 'Copy invite link',
    openParticipants: 'Participants',
    participantsDrawerTitle: 'Participants & controls',
    profileShortcut: 'Profile',
    profileHeading: 'Your sociometric profile',
    profileHostHeading: 'Session intelligence',
    profileNoData: 'No profile data yet. Emotions and tests will appear here.',
    profileEmotionTitle: 'Emotion frequency',
    profileTestsTitle: 'Sociometric participation',
    hostToolsHeading: 'Host toolkit',
    hostTab: 'Host tools',
    profileTab: 'Profile',
    chatTab: 'Chat',
    switchCamera: 'Switch camera',
    emotionPanel: 'Emotions',
    emojiPalette: 'Emoji',
    tests: 'Tests',
    testsUnavailable: 'No active tests.',
    testsStartPulse3: 'Start 3 min pulse check',
    testsStartPulse5: 'Start 5 min focus scan',
    testsStartResonance: 'Start 5 min resonance',
    testsCancel: 'Cancel active test',
    testActiveBadge: 'Active sociometric test',
    testTimeLeft: (time) => `Time left: ${time}`,
    testSubmit: 'Submit responses',
    testSubmitted: 'Responses recorded. Thank you! ',
    testEnded: 'Test completed. Results arriving to host.',
    testOverlayTitle: 'Sociometric test',
    emotionPaletteHeading: 'How are you feeling?',
    emojiPaletteHeading: 'Choose an emoji',
    emotionOverlayTitle: 'Emotional climate',
    emotionOverlaySubtitle: 'Live summary of participant emotions.',
    emotionDataEmpty: 'No emotional signals yet.',
    participantsEmpty: 'No participants have joined yet.',
    muteParticipant: 'Mute',
    unmuteParticipant: 'Unmute',
    removeParticipant: 'Remove',
    messageTargetLabel: 'Send to',
    audienceEveryone: 'Everyone',
    anonymousToggle: 'Anonymous',
    messageDirectTo: (target) => `Direct ➜ ${target}`,
    messageDirectFrom: (sender) => `Direct from ${sender}`,
    messageAnonymous: 'Anonymous message',
    presenceLive: 'Live',
    presenceOffline: 'Offline',
    mutedBadge: 'Muted',
    mutedByHost: 'Host muted your microphone.',
    unmutedByHost: 'Host allowed your microphone.',
    removedByHost: 'Host removed you from the session.',
    layoutCozy: 'Compact',
    layoutCompact: 'Expand',
    enterFullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    pip: 'Mini view',
    pipActive: 'Close mini view',
    pipUnsupported: 'Mini view is not supported on this device.',
    pipEntering: 'Mini view enabled.',
    pipExiting: 'Mini view closed.',
    mute: 'Mute',
    unmute: 'Unmute',
    stopVideo: 'Stop video',
    startVideo: 'Start video',
    endMeeting: 'End meeting',
    leave: 'Leave',
    connectingBadge: 'Connecting…',
    hostBadge: 'Host',
    guestBadge: 'Guest',
    remotePlaceholder: 'Waiting for participant…',
    localPlaceholder: 'Local preview',
    chatHeading: 'Chat',
    chatStatusIdle: 'Chat ready. Messages stay inside this meeting.',
    chatStatusWaiting: 'Waiting to join…',
    chatInputPlaceholder: 'Type a message',
    assistantInputPlaceholder: 'Ask Valera anything…',
    send: 'Send',
    assistantToggleOn: 'Send to Valera',
    assistantToggleOff: 'Chat with Valera',
    assistantSearchLabel: 'Use live web search',
    assistantStarting: 'Valera is thinking…',
    assistantError: 'Assistant failed to reply.',
    assistantComplete: 'Assistant response delivered.',
    nameModalTitle: 'Enter your name',
    nameModalText: 'This one-time link needs a display name everyone will see.',
    nameSubmit: 'Join meeting',
    nameRequired: 'Name is required.',
    invalidLink: 'Invalid meeting link.',
    meetingUnavailable: 'Meeting unavailable.',
    linkCopied: 'Link copied to clipboard.',
    linkCopyError: 'Unable to copy automatically. Copy it manually.',
    clipboardUnavailable: 'Clipboard access unavailable. Copy the link from the address bar.',
    unableToJoin: 'Unable to join meeting.',
    unableToEnd: 'Unable to end meeting.',
    chatJoinRequired: 'Join the meeting before sending messages.',
    chatSendFailed: 'Failed to send message.',
    meetingEnded: 'Meeting ended. You can close this tab.',
    joined: 'You joined the meeting.',
    participantJoined: (name) => `${name} joined the meeting.`,
    participantLeft: (name) => `${name} left the meeting.`,
    remoteLeft: 'Remote participant left the call.',
    reconnection: 'Connection lost. Waiting for reconnection…',
    enableMedia: 'Enable camera and microphone to start the call.',
    mediaPermissionDenied: 'Camera or microphone permission denied.',
    capacityHint: (count) => `Up to ${count} people can join this call.`,
    localLabel: 'You',
    assistantName: 'Valera',
  },
  uk: {
    appTitle: 'Камінський AI Месенджер',
    waitingSubtitle: 'Підготовка зустрічі…',
    hostSubtitle: (host) => `Хост: ${host}`,
    linkReady: (token, capacity) => `Посилання: ${token} · Місткість ${capacity}`,
    docTitle: (host) => `Камінський AI Месенджер — зустріч з ${host}`,
    copyLink: 'Скопіювати посилання',
    openParticipants: 'Учасники',
    participantsDrawerTitle: 'Учасники та керування',
    profileShortcut: 'Профіль',
    profileHeading: 'Ваш соціометричний профіль',
    profileHostHeading: 'Аналітика сесії',
    profileNoData: 'Поки немає даних. Емоції та тести з’являться тут.',
    profileEmotionTitle: 'Частота емоцій',
    profileTestsTitle: 'Участь у соціометрії',
    hostToolsHeading: 'Інструменти хоста',
    hostTab: 'Інструменти',
    profileTab: 'Профіль',
    chatTab: 'Чат',
    switchCamera: 'Перемкнути камеру',
    emotionPanel: 'Емоції',
    emojiPalette: 'Емодзі',
    tests: 'Тести',
    testsUnavailable: 'Немає активних тестів.',
    testsStartPulse3: 'Запустити 3-хвилинний пульс',
    testsStartPulse5: 'Запустити 5-хвилинний фокус',
    testsStartResonance: 'Запустити 5-хвилинний резонанс',
    testsCancel: 'Скасувати активний тест',
    testActiveBadge: 'Активний соціометричний тест',
    testTimeLeft: (time) => `Залишилось часу: ${time}`,
    testSubmit: 'Надіслати відповіді',
    testSubmitted: 'Відповіді збережено. Дякуємо!',
    testEnded: 'Тест завершено. Результати отримає хост.',
    testOverlayTitle: 'Соціометричний тест',
    emotionPaletteHeading: 'Які зараз відчуття?',
    emojiPaletteHeading: 'Виберіть емодзі',
    emotionOverlayTitle: 'Емоційний клімат',
    emotionOverlaySubtitle: 'Жива статистика емоцій учасників.',
    emotionDataEmpty: 'Поки немає сигналів емоцій.',
    participantsEmpty: 'Ще ніхто не приєднався.',
    muteParticipant: 'Заглушити',
    unmuteParticipant: 'Увімкнути звук',
    removeParticipant: 'Видалити',
    messageTargetLabel: 'Кому надіслати',
    audienceEveryone: 'Усі',
    anonymousToggle: 'Анонімно',
    messageDirectTo: (target) => `Особисте ➜ ${target}`,
    messageDirectFrom: (sender) => `Особисте від ${sender}`,
    messageAnonymous: 'Анонімне повідомлення',
    presenceLive: 'У мережі',
    presenceOffline: 'Офлайн',
    mutedBadge: 'Заглушено',
    mutedByHost: 'Хост вимкнув вам мікрофон.',
    unmutedByHost: 'Хост дозволив ваш мікрофон.',
    removedByHost: 'Хост видалив вас із сесії.',
    layoutCozy: 'Компактно',
    layoutCompact: 'Розгорнути',
    enterFullscreen: 'На весь екран',
    exitFullscreen: 'Вийти з повноекранного',
    pip: 'Міні-вікно',
    pipActive: 'Закрити міні-вікно',
    pipUnsupported: 'Міні-вікно недоступне на цьому пристрої.',
    pipEntering: 'Міні-вікно увімкнено.',
    pipExiting: 'Міні-вікно закрито.',
    mute: 'Вимкнути звук',
    unmute: 'Увімкнути звук',
    stopVideo: 'Вимкнути відео',
    startVideo: 'Увімкнути відео',
    endMeeting: 'Завершити зустріч',
    leave: 'Вийти',
    connectingBadge: 'Підключення…',
    hostBadge: 'Хост',
    guestBadge: 'Гість',
    remotePlaceholder: 'Очікуємо учасника…',
    localPlaceholder: 'Ваш попередній перегляд',
    chatHeading: 'Чат',
    chatStatusIdle: 'Чат готовий. Повідомлення залишаються в межах зустрічі.',
    chatStatusWaiting: 'Очікуємо приєднання…',
    chatInputPlaceholder: 'Введіть повідомлення',
    assistantInputPlaceholder: 'Поставте питання Валері…',
    send: 'Надіслати',
    assistantToggleOn: 'Надіслати Валері',
    assistantToggleOff: 'Питати Валеру',
    assistantSearchLabel: 'Використовувати веб-пошук',
    assistantStarting: 'Валера думає…',
    assistantError: 'Асистент не зміг відповісти.',
    assistantComplete: 'Валера надіслав відповідь.',
    nameModalTitle: 'Введіть ім’я',
    nameModalText: 'Це одноразове посилання потребує імені, яке буде видно іншим.',
    nameSubmit: 'Приєднатися',
    nameRequired: 'Потрібно вказати ім’я.',
    invalidLink: 'Невірне посилання на зустріч.',
    meetingUnavailable: 'Зустріч недоступна.',
    linkCopied: 'Посилання скопійовано.',
    linkCopyError: 'Не вдалося скопіювати автоматично. Скопіюйте вручну.',
    clipboardUnavailable: 'Буфер обміну недоступний. Скопіюйте з адресного рядка.',
    unableToJoin: 'Не вдалося приєднатися до зустрічі.',
    unableToEnd: 'Не вдалося завершити зустріч.',
    chatJoinRequired: 'Спершу приєднайтесь до зустрічі.',
    chatSendFailed: 'Не вдалося надіслати повідомлення.',
    meetingEnded: 'Зустріч завершено. Можете закрити вкладку.',
    joined: 'Ви приєдналися до зустрічі.',
    participantJoined: (name) => `${name} приєднався(-лася).`,
    participantLeft: (name) => `${name} покинув(-ла) зустріч.`,
    remoteLeft: 'Віддалений учасник покинув дзвінок.',
    reconnection: 'Зв’язок втрачено. Очікуємо повторне підключення…',
    enableMedia: 'Увімкніть камеру та мікрофон, щоб розпочати дзвінок.',
    mediaPermissionDenied: 'Доступ до камери чи мікрофона заборонено.',
    capacityHint: (count) => `До дзвінка можуть приєднатись ${count} людей.`,
    localLabel: 'Ви',
    assistantName: 'Валера',
  },
};

const state = {
  meetingToken: new URLSearchParams(window.location.search).get('room'),
  authToken: sessionStorage.getItem('authToken') || null,
  displayName: '',
  isHost: false,
  roster: [],
  peers: new Map(),
  peerOrder: ['self'],
  peerColors: new Map(),
  localStream: null,
  primaryPeerId: null,
  assistantName: translations.en.assistantName,
  assistantMode: false,
  assistantWithSearch: true,
  assistantRequests: new Map(),
  viewMode: 'cozy',
  isFullscreen: false,
  maxParticipants: 10,
  meetingHost: null,
  hasJoined: false,
  selfId: null,
  emotionSelections: new Map(),
  emotionStats: null,
  emotionPaletteOpen: false,
  emojiPaletteOpen: false,
  messageTarget: 'all',
  anonymousMode: false,
  videoPage: 0,
  videosPerPage: 8,
  videoLayout: 'auto',
  cameraFacing: 'user',
  canFlipCamera: false,
  isScreenSharing: false,
  screenStream: null,
  activeTest: null,
  testEndsAt: null,
  testTimerId: null,
  testsHistory: [],
  reconnecting: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  profileData: null,
  hostSummary: null,
  controlsVisible: true,
  controlsTimeout: null,
  extendedEmojis: ['😊', '😢', '😡', '😍', '🤔', '👍', '👎', '❤️', '💯', '🔥', '🎉', '🚀', '💡', '⭐', '🌟', '🎯', '💪', '🙏', '👏', '🤝', '🎊', '🌈', '☀️', '⚡', '💎', '🏆', '🎁', '🎈', '🦾', '🧠'],
};

const ui = {
  languageChoice: document.getElementById('chatLanguageChoice'),
  nameModal: document.getElementById('nameModal'),
  nameForm: document.getElementById('nameForm'),
  nameInput: document.getElementById('displayNameInput'),
  nameError: document.getElementById('nameError'),
  nameModalTitle: document.getElementById('nameModalTitle'),
  nameModalText: document.getElementById('nameModalText'),
  nameSubmit: document.getElementById('nameSubmit'),
  chatTitle: document.getElementById('chatTitle'),
  meetingSubtitle: document.getElementById('meetingSubtitle'),
  copyLinkBtn: document.getElementById('copyLinkBtn'),
  layoutToggleBtn: document.getElementById('layoutToggleBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  pipBtn: document.getElementById('pipBtn'),
  muteBtn: document.getElementById('muteBtn'),
  videoBtn: document.getElementById('videoBtn'),
  cameraFlipBtn: document.getElementById('cameraFlipBtn'),
  screenShareBtn: document.getElementById('screenShareBtn'),
  emotionPanelBtn: document.getElementById('emotionPanelBtn'),
  emojiPaletteBtn: document.getElementById('emojiPaletteBtn'),
  emojiBtnInline: document.getElementById('emojiBtnInline'),
  testsBtn: document.getElementById('testsBtn'),
  endMeetingBtn: document.getElementById('endMeetingBtn'),
  leaveBtn: document.getElementById('leaveBtn'),
  openParticipantsBtn: document.getElementById('openParticipantsBtn'),
  profileDrawerBtn: document.getElementById('profileDrawerBtn'),
  roleBadge: document.getElementById('roleBadge'),
  participants: document.getElementById('participants'),
  videoGrid: document.getElementById('videoGrid'),
  localContainer: document.getElementById('localContainer'),
  localVideo: document.getElementById('localVideo'),
  localPlaceholder: document.getElementById('localPlaceholder'),
  localLabel: document.getElementById('localLabel'),
  videoPagination: document.getElementById('videoPagination'),
  videoPrevPage: document.getElementById('videoPrevPage'),
  videoNextPage: document.getElementById('videoNextPage'),
  videoPageIndicator: document.getElementById('videoPageIndicator'),
  videoNotice: document.getElementById('videoNotice'),
  collabTabs: document.getElementById('collabTabs'),
  chatTab: document.getElementById('chatTab'),
  profileTab: document.getElementById('profileTab'),
  hostTab: document.getElementById('hostTab'),
  chatPane: document.getElementById('chatPane'),
  profilePane: document.getElementById('profilePane'),
  hostPane: document.getElementById('hostPane'),
  chatHeading: document.getElementById('chatHeading'),
  chatStatus: document.getElementById('chatStatus'),
  messageTarget: document.getElementById('messageTarget'),
  messageTargetLabel: document.getElementById('messageTargetLabel'),
  anonymousToggle: document.getElementById('anonymousToggle'),
  anonymousToggleText: document.getElementById('anonymousToggleText'),
  assistantToolbar: document.getElementById('assistantToolbar'),
  assistantToggleBtn: document.getElementById('assistantToggleBtn'),
  assistantSearchToggle: document.getElementById('assistantSearchToggle'),
  assistantSearchLabel: document.getElementById('assistantSearchLabel'),
  messages: document.getElementById('messages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  sendBtn: document.getElementById('sendBtn'),
  chatNotice: document.getElementById('chatNotice'),
  participantsDrawer: document.getElementById('participantsDrawer'),
  participantsDrawerClose: document.getElementById('participantsDrawerClose'),
  participantList: document.getElementById('participantList'),
  emotionPalette: document.getElementById('emotionPalette'),
  emotionPaletteHeading: document.getElementById('emotionPaletteHeading'),
  emotionPaletteClose: document.getElementById('emotionPaletteClose'),
  emotionGrid: document.getElementById('emotionGrid'),
  emojiPalette: document.getElementById('emojiPalette'),
  emojiPaletteHeading: document.getElementById('emojiPaletteHeading'),
  emojiPaletteClose: document.getElementById('emojiPaletteClose'),
  emojiGrid: document.getElementById('emojiGrid'),
  emotionOverlay: document.getElementById('emotionOverlay'),
  emotionOverlayTitle: document.getElementById('emotionOverlayTitle'),
  emotionOverlaySubtitle: document.getElementById('emotionOverlaySubtitle'),
  emotionOverlayClose: document.getElementById('emotionOverlayClose'),
  emotionChart: document.getElementById('emotionChart'),
  emotionTimeline: document.getElementById('emotionTimeline'),
  testOverlay: document.getElementById('testOverlay'),
  testOverlayTitle: document.getElementById('testOverlayTitle'),
  testOverlayClose: document.getElementById('testOverlayClose'),
  testOverlayTimer: document.getElementById('testOverlayTimer'),
  testOverlayContent: document.getElementById('testOverlayContent'),
  profileHeading: document.getElementById('profileHeading'),
  profileContent: document.getElementById('profileContent'),
  hostToolsHeading: document.getElementById('hostToolsHeading'),
  hostToolsContent: document.getElementById('hostToolsContent'),
};

const EMOTION_CATALOG = [
  { key: 'joy', color: '#facc15', labels: { en: 'Joyful', uk: 'Радісно' } },
  { key: 'interest', color: '#2dd4bf', labels: { en: 'Curious', uk: 'Зацікавлено' } },
  { key: 'inspired', color: '#a855f7', labels: { en: 'Inspired', uk: 'Натхненно' } },
  { key: 'calm', color: '#0ea5e9', labels: { en: 'Calm', uk: 'Спокійно' } },
  { key: 'surprised', color: '#38bdf8', labels: { en: 'Surprised', uk: 'Дивуюсь' } },
  { key: 'love', color: '#f472b6', labels: { en: 'Connected', uk: 'Відчуваю звʼязок' } },
  { key: 'proud', color: '#fb7185', labels: { en: 'Proud', uk: 'Пишаюсь' } },
  { key: 'confident', color: '#22d3ee', labels: { en: 'Confident', uk: 'Впевнено' } },
  { key: 'anxious', color: '#f97316', labels: { en: 'Anxious', uk: 'Тривожно' } },
  { key: 'tense', color: '#f43f5e', labels: { en: 'Tense', uk: 'Напружено' } },
  { key: 'confused', color: '#94a3b8', labels: { en: 'Confused', uk: 'Розгублено' } },
  { key: 'sad', color: '#6366f1', labels: { en: 'Sad', uk: 'Сумно' } },
  { key: 'uncomfortable', color: '#fbbf24', labels: { en: 'Uncomfortable', uk: 'Некомфортно' } },
  { key: 'tired', color: '#a3a3a3', labels: { en: 'Tired', uk: 'Втомлено' } },
  { key: 'irritated', color: '#ea580c', labels: { en: 'Irritated', uk: 'Роздратовано' } },
];

const EMOJI_SET = [
  '😀', '😃', '😄', '😁', '😆', '😍', '🥰', '🤗', '😎', '🤩',
  '😊', '🥹', '🤔', '😌', '🙃', '😇', '😴', '🥳', '🤠', '🤓',
  '😢', '😭', '😤', '😡', '😨', '😱', '😳', '😶‍🌫️', '🤯', '🤒',
  '🤝', '👍', '👎', '👏', '🙏', '💡', '🔥', '💙', '💚', '💛',
  '💜', '🧠', '⚡️', '🌈', '🎯', '🧭'
];

const SCALE_OPTIONS = [
  { value: 1, labels: { en: 'Very low', uk: 'Дуже низько' } },
  { value: 2, labels: { en: 'Low', uk: 'Низько' } },
  { value: 3, labels: { en: 'Balanced', uk: 'Середньо' } },
  { value: 4, labels: { en: 'High', uk: 'Високо' } },
  { value: 5, labels: { en: 'Very high', uk: 'Дуже високо' } },
];

const SOCIOMETRIC_TEMPLATES = {
  'pulse-3': {
    durationSeconds: 180,
    title: { en: '3 minute pulse', uk: '3 хв пульс' },
    description: {
      en: 'Quick emotional check-in to stabilise the group.',
      uk: 'Швидка емоційна перевірка для стабілізації групи.',
    },
    questions: [
      { id: 'energy', type: 'scale', labels: { en: 'Energy right now', uk: 'Рівень енергії зараз' } },
      { id: 'focus', type: 'scale', labels: { en: 'Focus & clarity', uk: 'Фокус і ясність' } },
      { id: 'support', type: 'scale', labels: { en: 'Feeling supported', uk: 'Відчуття підтримки' } },
    ],
  },
  'pulse-5': {
    durationSeconds: 300,
    title: { en: '5 minute focus scan', uk: '5 хв фокус-скан' },
    description: {
      en: 'Explore team focus, tension and collaboration needs.',
      uk: 'Дослідити фокус, напругу та потреби співпраці.',
    },
    questions: [
      { id: 'clarity', type: 'scale', labels: { en: 'Clarity of goals', uk: 'Ясність цілей' } },
      { id: 'tension', type: 'scale', labels: { en: 'Current tension', uk: 'Поточна напруга' } },
      { id: 'collab', type: 'scale', labels: { en: 'Need for collaboration', uk: 'Потреба в співпраці' } },
      { id: 'alignment', type: 'scale', labels: { en: 'Sense of alignment', uk: 'Відчуття узгодженості' } },
    ],
  },
  'resonance-5': {
    durationSeconds: 300,
    title: { en: '5 minute resonance', uk: '5 хв резонанс' },
    description: {
      en: 'Capture deeper emotional synchrony of the group.',
      uk: 'Зафіксувати глибший емоційний резонанс групи.',
    },
    questions: [
      { id: 'trust', type: 'scale', labels: { en: 'Trust in the space', uk: 'Довіра до простору' } },
      { id: 'openness', type: 'scale', labels: { en: 'Openness to share', uk: 'Готовність ділитися' } },
      { id: 'insight', type: 'scale', labels: { en: 'Insight level', uk: 'Рівень усвідомлень' } },
      { id: 'empathy', type: 'scale', labels: { en: 'Empathy for others', uk: 'Емпатія до інших' } },
      { id: 'stability', type: 'scale', labels: { en: 'Inner stability', uk: 'Внутрішня стабільність' } },
    ],
  },
};

let currentLang = localStorage.getItem('kaminskyi-lang') || 'en';
if (!translations[currentLang]) currentLang = 'en';
ui.languageChoice.value = currentLang;

function t(key, ...args) {
  const value = translations[currentLang][key];
  return typeof value === 'function' ? value(...args) : value;
}

function emotionLabel(key) {
  const entry = EMOTION_CATALOG.find((item) => item.key === key);
  if (!entry) return key;
  return entry.labels[currentLang] || entry.labels.en;
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('kaminskyi-lang', lang);
  document.documentElement.lang = lang;
  refreshStaticText();
  renderParticipants();
  updateAllMessageHeaders();
}

ui.languageChoice.addEventListener('change', (event) => setLanguage(event.target.value));

function refreshStaticText() {
  ui.chatTitle.textContent = t('appTitle');
  if (state.meetingHost) {
    ui.meetingSubtitle.textContent = t('hostSubtitle', state.meetingHost);
  } else {
    ui.meetingSubtitle.textContent = t('waitingSubtitle');
  }
  ui.copyLinkBtn.textContent = t('copyLink');
  ui.layoutToggleBtn.textContent = state.viewMode === 'cozy' ? t('layoutCozy') : t('layoutCompact');
  ui.fullscreenBtn.textContent = state.isFullscreen ? t('exitFullscreen') : t('enterFullscreen');
  ui.pipBtn.textContent = t('pip');
  ui.muteBtn.textContent = getAudioEnabled() ? t('mute') : t('unmute');
  ui.videoBtn.textContent = getVideoEnabled() ? t('stopVideo') : t('startVideo');
  ui.cameraFlipBtn.textContent = t('switchCamera');
  ui.emotionPanelBtn.textContent = t('emotionPanel');
  ui.emojiPaletteBtn.textContent = t('emojiPalette');
  ui.emojiPaletteBtn.title = t('emojiPalette');
  ui.emojiBtnInline.title = t('emojiPalette');
  ui.testsBtn.textContent = t('tests');
  ui.openParticipantsBtn.textContent = t('openParticipants');
  ui.profileDrawerBtn.textContent = t('profileShortcut');
  ui.endMeetingBtn.textContent = t('endMeeting');
  ui.leaveBtn.textContent = t('leave');
  ui.chatHeading.textContent = t('chatHeading');
  ui.chatStatus.textContent = state.hasJoined ? t('chatStatusIdle') : t('chatStatusWaiting');
  ui.chatInput.placeholder = state.assistantMode ? t('assistantInputPlaceholder') : t('chatInputPlaceholder');
  ui.sendBtn.textContent = state.assistantMode ? t('assistantToggleOn') : t('send');
  ui.assistantToggleBtn.textContent = state.assistantMode ? t('assistantToggleOn') : t('assistantToggleOff');
  ui.assistantSearchLabel.textContent = t('assistantSearchLabel');
  ui.localPlaceholder.textContent = t('localPlaceholder');
  ui.localLabel.textContent = `${t('localLabel')} • ${state.displayName || ''}`.trim();
  ui.chatTab.textContent = t('chatTab');
  ui.profileTab.textContent = t('profileTab');
  ui.hostTab.textContent = t('hostTab');
  ui.messageTargetLabel.textContent = t('messageTargetLabel');
  ui.anonymousToggleText.textContent = t('anonymousToggle');
  ui.profileHeading.textContent = t('profileHeading');
  ui.hostToolsHeading.textContent = t('hostToolsHeading');
  ui.emotionPaletteHeading.textContent = t('emotionPaletteHeading');
  ui.emojiPaletteHeading.textContent = t('emojiPaletteHeading');
  ui.emotionOverlayTitle.textContent = t('emotionOverlayTitle');
  ui.emotionOverlaySubtitle.textContent = t('emotionOverlaySubtitle');
  ui.testOverlayTitle.textContent = t('testOverlayTitle');
  updateAssistantToggle();
  updateDocumentTitle();
  ui.nameModalTitle.textContent = t('nameModalTitle');
  ui.nameModalText.textContent = t('nameModalText');
  ui.nameSubmit.textContent = t('nameSubmit');
}

function updateDocumentTitle() {
  if (state.meetingHost) {
    document.title = t('docTitle', state.meetingHost);
  } else {
    document.title = t('appTitle');
  }
}

function notifyChat(message, isError = false) {
  ui.chatNotice.textContent = message;
  ui.chatNotice.classList.toggle('hidden', !message);
  ui.chatNotice.classList.toggle('error', isError);
}

function notifyVideo(message, isError = false) {
  ui.videoNotice.textContent = message;
  ui.videoNotice.classList.toggle('hidden', !message);
  ui.videoNotice.classList.toggle('error', isError);
}

function hashColor(name) {
  if (state.peerColors.has(name)) return state.peerColors.get(name);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 70%, 62%)`;
  state.peerColors.set(name, color);
  return color;
}

function renderParticipants() {
  ui.participants.innerHTML = '';
  const roster = [...state.roster];
  const seen = new Set();
  const items = [];

  roster.forEach((entry) => {
    if (!entry?.name || seen.has(entry.name)) return;
    seen.add(entry.name);
    items.push({ name: entry.name, present: Boolean(entry.present) });
  });

  if (state.displayName && !seen.has(state.displayName)) {
    items.push({ name: state.displayName, present: true });
  }

  if (!items.length) {
    const placeholder = document.createElement('span');
    placeholder.className = 'participant-tag';
    placeholder.textContent = t('participantsEmpty');
    ui.participants.appendChild(placeholder);
  } else {
    items
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .forEach(({ name, present }) => {
        const tag = document.createElement('span');
        tag.className = 'participant-tag';
        if (present) tag.classList.add('present');
        const color = hashColor(name);
        tag.style.background = `${color}1f`;
        tag.style.borderColor = `${color}55`;
        tag.textContent = name;
        ui.participants.appendChild(tag);
      });
  }

  if (state.maxParticipants) {
    const hint = document.createElement('span');
    hint.className = 'participant-tag';
    hint.textContent = t('capacityHint', state.maxParticipants);
    hint.style.background = 'rgba(148, 163, 184, 0.15)';
    hint.style.borderColor = 'rgba(148, 163, 184, 0.25)';
    ui.participants.appendChild(hint);
  }

  updateMessageTargets();
}

function updateMessageTargets() {
  if (!ui.messageTarget) return;
  const previous = state.messageTarget || 'all';
  ui.messageTarget.innerHTML = '';
  const addOption = (value, label) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    ui.messageTarget.appendChild(option);
  };

  addOption('all', t('audienceEveryone'));

  const names = [...new Set(state.roster.map((entry) => entry.name).filter(Boolean))]
    .filter((name) => name !== state.displayName)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  names.forEach((name) => addOption(name, name));

  if (names.includes(previous)) {
    ui.messageTarget.value = previous;
    state.messageTarget = previous;
  } else {
    ui.messageTarget.value = 'all';
    state.messageTarget = 'all';
  }
}

function setActiveTab(target) {
  const panes = [ui.chatPane, ui.profilePane, ui.hostPane];
  const tabs = [ui.chatTab, ui.profileTab, ui.hostTab];
  panes.forEach((pane) => pane && pane.classList.remove('active'));
  tabs.forEach((tab) => tab && tab.classList.remove('active'));

  if (target === 'profile') {
    ui.profilePane?.classList.add('active');
    ui.profileTab?.classList.add('active');
  } else if (target === 'host') {
    ui.hostPane?.classList.add('active');
    ui.hostTab?.classList.add('active');
  } else {
    ui.chatPane?.classList.add('active');
    ui.chatTab?.classList.add('active');
  }
}

function updateParticipantDrawer() {
  if (!ui.participantList) return;
  ui.participantList.innerHTML = '';
  if (!state.isHost) return;
  const roster = [...state.roster].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  if (!roster.length) {
    const info = document.createElement('div');
    info.className = 'participant-row';
    info.textContent = t('participantsEmpty');
    ui.participantList.appendChild(info);
    return;
  }

  roster.forEach((entry) => {
    if (!entry.name) return;
    const row = document.createElement('div');
    row.className = 'participant-row';
    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('strong');
    title.textContent = entry.name;
    const meta = document.createElement('span');
    meta.className = 'muted';
    const presenceLabel = entry.present ? t('presenceLive') : t('presenceOffline');
    meta.textContent = entry.muted ? `${presenceLabel} • ${t('mutedBadge')}` : presenceLabel;
    info.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'actions';
    if (entry.name !== state.displayName) {
      const muteBtn = document.createElement('button');
      muteBtn.className = 'ghost icon';
      muteBtn.dataset.action = entry.muted ? 'unmute' : 'mute';
      muteBtn.dataset.target = entry.name;
      muteBtn.textContent = entry.muted ? t('unmuteParticipant') : t('muteParticipant');
      actions.appendChild(muteBtn);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'ghost icon';
      removeBtn.dataset.action = 'remove';
      removeBtn.dataset.target = entry.name;
      removeBtn.textContent = t('removeParticipant');
      actions.appendChild(removeBtn);
    }

    row.append(info, actions);
    ui.participantList.appendChild(row);
  });
}

function openParticipantsDrawer() {
  if (!state.isHost) return;
  updateParticipantDrawer();
  ui.participantsDrawer.classList.remove('hidden');
}

function closeParticipantsDrawer() {
  ui.participantsDrawer.classList.add('hidden');
}

function buildEmotionPalette() {
  if (!ui.emotionGrid) return;
  ui.emotionGrid.innerHTML = '';
  EMOTION_CATALOG.forEach((emotion) => {
    const button = document.createElement('button');
    button.className = 'emotion-chip';
    button.dataset.emotion = emotion.key;
    button.style.borderColor = `${emotion.color}55`;
    button.style.background = `${emotion.color}22`;
    button.textContent = emotionLabel(emotion.key);
    if (state.emotionSelections.get(state.displayName) === emotion.key) {
      button.classList.add('active');
    }
    ui.emotionGrid.appendChild(button);
  });
}

function buildEmojiPalette() {
  if (!ui.emojiGrid) return;
  ui.emojiGrid.innerHTML = '';
  EMOJI_SET.forEach((emoji) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = emoji;
    button.addEventListener('click', () => {
      insertEmoji(emoji);
      closeEmojiPalette();
    });
    ui.emojiGrid.appendChild(button);
  });
}

function toggleEmotionPalette(forceOpen) {
  if (!ui.emotionPalette) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !state.emotionPaletteOpen;
  if (shouldOpen) {
    buildEmotionPalette();
    ui.emotionPalette.classList.remove('hidden');
  } else {
    ui.emotionPalette.classList.add('hidden');
  }
  state.emotionPaletteOpen = shouldOpen;
}

function toggleEmojiPalette(forceOpen) {
  if (!ui.emojiPalette) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !state.emojiPaletteOpen;
  if (shouldOpen) {
    if (!ui.emojiGrid.childElementCount) {
      buildEmojiPalette();
    }
    ui.emojiPalette.classList.remove('hidden');
  } else {
    ui.emojiPalette.classList.add('hidden');
  }
  state.emojiPaletteOpen = shouldOpen;
}

function closeEmotionPalette() {
  toggleEmotionPalette(false);
}

function closeEmojiPalette() {
  toggleEmojiPalette(false);
}

function insertEmoji(emoji) {
  const input = ui.chatInput;
  if (!input) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const text = input.value;
  input.value = `${text.slice(0, start)}${emoji}${text.slice(end)}`;
  const caret = start + emoji.length;
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(caret, caret);
  });
}

function openEmotionOverlay() {
  if (!state.isHost) {
    toggleEmotionPalette(true);
    return;
  }
  socket.emit('request-emotion-stats');
  ui.emotionOverlay.classList.remove('hidden');
  updateEmotionOverlay();
}

function closeEmotionOverlay() {
  ui.emotionOverlay.classList.add('hidden');
}

function updateEmotionOverlay() {
  if (!ui.emotionChart) return;
  const stats = state.emotionStats;
  ui.emotionChart.innerHTML = '';
  ui.emotionTimeline.innerHTML = '';

  if (!stats || !stats.totals || !Object.keys(stats.totals).length) {
    const empty = document.createElement('div');
    empty.className = 'emotion-card';
    empty.textContent = t('emotionDataEmpty');
    ui.emotionChart.appendChild(empty);
    return;
  }

  EMOTION_CATALOG.forEach((emotion) => {
    const count = Number(stats.totals[emotion.key] || 0);
    const perParticipant = stats.perParticipant?.filter((item) => item.emotion === emotion.key) || [];
    const card = document.createElement('div');
    card.className = 'emotion-card';
    const title = document.createElement('strong');
    title.textContent = `${emotionLabel(emotion.key)} • ${count}`;
    const bar = document.createElement('div');
    bar.className = 'emotion-bar';
    const fill = document.createElement('span');
    fill.style.width = `${Math.min(100, count * 20)}%`;
    fill.style.background = emotion.color;
    bar.appendChild(fill);
    card.append(title, bar);
    if (perParticipant.length) {
      const list = document.createElement('div');
      list.className = 'emotion-mini-list';
      perParticipant.forEach((item) => {
        const pill = document.createElement('span');
        pill.className = 'participant-tag present';
        pill.textContent = item.participant;
        list.appendChild(pill);
      });
      card.appendChild(list);
    }
    ui.emotionChart.appendChild(card);
  });

  if (Array.isArray(stats.timeline) && stats.timeline.length) {
    stats.timeline.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'timeline-entry';
      const label = document.createElement('span');
      label.textContent = `${entry.participant} → ${emotionLabel(entry.emotion)}`;
      const time = document.createElement('span');
      time.textContent = formatTime(entry.created_at);
      row.append(label, time);
      ui.emotionTimeline.appendChild(row);
    });
  }
}

function updateHostTools() {
  if (!ui.hostToolsContent) return;
  if (!state.isHost) {
    ui.hostTab.classList.add('hidden');
    ui.testsBtn.classList.add('hidden');
    return;
  }
  ui.hostTab.classList.remove('hidden');
  ui.testsBtn.classList.remove('hidden');
  const container = ui.hostToolsContent;
  container.innerHTML = '';

  const actions = document.createElement('div');
  actions.className = 'host-tool-card';

  ['pulse-3', 'pulse-5', 'resonance-5'].forEach((templateId) => {
    const button = document.createElement('button');
    button.className = 'primary';
    button.dataset.template = templateId;
    if (templateId === 'pulse-3') button.textContent = t('testsStartPulse3');
    if (templateId === 'pulse-5') button.textContent = t('testsStartPulse5');
    if (templateId === 'resonance-5') button.textContent = t('testsStartResonance');
    actions.appendChild(button);
  });

  container.appendChild(actions);

  if (state.activeTest) {
    const activeCard = document.createElement('div');
    activeCard.className = 'host-tool-card';
    const template = SOCIOMETRIC_TEMPLATES[state.activeTest.template];
    const title = document.createElement('strong');
    title.textContent = `${t('testActiveBadge')} • ${template?.title?.[currentLang] || state.activeTest.template}`;
    const timer = document.createElement('div');
    timer.className = 'muted';
    timer.textContent = t('testTimeLeft', formatCountdown(state.testEndsAt));
    const cancel = document.createElement('button');
    cancel.className = 'ghost icon';
    cancel.dataset.action = 'cancel-test';
    cancel.textContent = t('testsCancel');
    activeCard.append(title, timer, cancel);
    container.appendChild(activeCard);
  }

  if (state.hostSummary) {
    const summaryCard = document.createElement('div');
    summaryCard.className = 'host-tool-card';
    const title = document.createElement('strong');
    title.textContent = t('testOverlayTitle');
    summaryCard.appendChild(title);
    Object.entries(state.hostSummary.perQuestion || {}).forEach(([questionId, answers]) => {
      const question = document.createElement('div');
      question.className = 'muted';
      const template = state.hostSummary.template
        ? SOCIOMETRIC_TEMPLATES[state.hostSummary.template]
        : null;
      const match = template?.questions?.find((q) => q.id === questionId);
      question.textContent = match ? match.labels[currentLang] : questionId;
      summaryCard.appendChild(question);
      Object.entries(answers).forEach(([option, count]) => {
        const line = document.createElement('div');
        line.textContent = `${option}: ${count}`;
        summaryCard.appendChild(line);
      });
    });
    container.appendChild(summaryCard);
  }
}

function openTestOverlayInstance(test) {
  if (!ui.testOverlayContent) return;
  const template = SOCIOMETRIC_TEMPLATES[test.template];
  if (!template) {
    notifyVideo(t('testsUnavailable'), true);
    return;
  }
  state.activeTest = test;
  state.testEndsAt = new Date(test.endsAt || test.startedAt).getTime();
  ui.testOverlayContent.innerHTML = '';
  ui.testOverlayTitle.textContent = template.title?.[currentLang] || t('testOverlayTitle');
  ui.testOverlayTimer.textContent = t('testTimeLeft', formatCountdown(state.testEndsAt));

  const form = document.createElement('form');
  form.id = 'testForm';
  template.questions.forEach((question) => {
    const block = document.createElement('div');
    block.className = 'host-tool-card';
    const label = document.createElement('label');
    label.textContent = question.labels[currentLang] || question.id;
    block.appendChild(label);
    const options = SCALE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.labels[currentLang] || opt.value,
    }));
    const group = document.createElement('div');
    group.className = 'radio-group';
    options.forEach((option) => {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'radio';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = question.id;
      input.value = option.value;
      optionLabel.appendChild(input);
      optionLabel.append(option.label);
      group.appendChild(optionLabel);
    });
    block.appendChild(group);
    form.appendChild(block);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary';
  submit.textContent = t('testSubmit');
  form.appendChild(submit);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const answers = {};
    template.questions.forEach((question) => {
      const value = data.get(question.id);
      if (value) {
        answers[question.id] = value;
      }
    });
    socket.emit('submit-sociometric-test', { testId: test.id, answers });
  });

  ui.testOverlayContent.appendChild(form);
  ui.testOverlay.classList.remove('hidden');
  if (state.testTimerId) {
    clearInterval(state.testTimerId);
  }
  state.testTimerId = setInterval(() => {
    ui.testOverlayTimer.textContent = t('testTimeLeft', formatCountdown(state.testEndsAt));
  }, 1000);
}

function closeTestOverlay() {
  ui.testOverlay.classList.add('hidden');
  if (state.testTimerId) {
    clearInterval(state.testTimerId);
    state.testTimerId = null;
  }
  ui.testOverlayContent.innerHTML = '';
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(endsAt) {
  const end = typeof endsAt === 'string' ? new Date(endsAt).getTime() : Number(endsAt);
  if (!Number.isFinite(end)) return '--:--';
  const diff = Math.max(0, end - Date.now());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateAllMessageHeaders() {
  const messages = ui.messages.querySelectorAll('.message');
  messages.forEach((message) => {
    const sender = message.dataset.sender;
    const ts = message.dataset.timestamp;
    const header = message.querySelector('.message-header');
    if (header) {
      header.innerHTML = `<strong>${sender}</strong><span>${formatTime(ts)}</span>`;
    }
  });
}

function createMessageElement({ sender, actualSender, text, ts, requestId, target, anonymous, kind }, { streaming = false } = {}) {
  const message = document.createElement('div');
  const isSelf = sender === state.displayName;
  const isAssistant = sender === state.assistantName;
  message.className = 'message fade';
  if (isSelf) message.classList.add('self');
  if (isAssistant) message.classList.add('assistant');
  if (kind === 'direct' && target) message.classList.add('direct');
  if (anonymous) message.classList.add('anonymous');
  if (streaming) message.classList.add('streaming');
  message.dataset.sender = sender;
  message.dataset.timestamp = ts;
  if (requestId) message.dataset.requestId = requestId;
  if (target) message.dataset.target = target;
  const color = hashColor(sender);
  message.style.setProperty('--message-accent', color);

  const header = document.createElement('div');
  header.className = 'message-header';
  header.innerHTML = `<strong>${sender}</strong><span>${formatTime(ts)}</span>`;

  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;

  if (kind === 'direct' && target) {
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    if (sender === state.displayName) {
      meta.textContent = t('messageDirectTo', target === state.displayName ? t('localLabel') : target);
    } else if (target === state.displayName) {
      meta.textContent = t('messageDirectFrom', sender);
    } else {
      const label = actualSender && actualSender !== sender ? actualSender : sender;
      meta.textContent = `${t('messageDirectFrom', label)} ➜ ${target}`;
    }
    message.appendChild(meta);
  }

  if (anonymous) {
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = t('messageAnonymous');
    message.appendChild(meta);
  }

  message.appendChild(header);
  message.appendChild(body);
  ui.messages.appendChild(message);
  ui.messages.scrollTop = ui.messages.scrollHeight;
  return message;
}

function appendMessage(message, options) {
  return createMessageElement(message, options);
}

function sanitizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

async function ensureLocalStream() {
  if (state.localStream) return state.localStream;
  try {
    state.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    ui.localVideo.srcObject = state.localStream;
    ui.localContainer.classList.remove('idle');
    ui.muteBtn.textContent = t('mute');
    ui.videoBtn.textContent = t('stopVideo');
    await detectCameraFlipSupport();
    return state.localStream;
  } catch (error) {
    notifyVideo(t('mediaPermissionDenied'), true);
    throw error;
  }
}

async function detectCameraFlipSupport() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    state.canFlipCamera = false;
    ui.cameraFlipBtn.classList.add('hidden');
    return;
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoInputs = devices.filter((device) => device.kind === 'videoinput');
  state.canFlipCamera = videoInputs.length > 1;
  ui.cameraFlipBtn.classList.toggle('hidden', !state.canFlipCamera);
}

async function switchCamera() {
  if (!state.localStream) {
    await ensureLocalStream().catch(() => {});
  }
  if (!state.localStream || !navigator.mediaDevices?.getUserMedia) return;
  if (!state.canFlipCamera) {
    notifyVideo(t('mediaPermissionDenied'), true);
    return;
  }
  const nextFacing = state.cameraFacing === 'user' ? 'environment' : 'user';
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: nextFacing } },
      audio: false,
    });
    const [newTrack] = tempStream.getVideoTracks();
    if (!newTrack) {
      notifyVideo(t('mediaPermissionDenied'), true);
      return;
    }
    const [currentTrack] = state.localStream.getVideoTracks();
    if (currentTrack) {
      state.localStream.removeTrack(currentTrack);
      currentTrack.stop();
    }
    state.localStream.addTrack(newTrack);
    ui.localVideo.srcObject = state.localStream;
    state.cameraFacing = nextFacing;

    if (state.meetingToken && socket.connected) {
      socket.emit('camera-flip', { facingMode: nextFacing });
    }

    state.peers.forEach(({ pc }) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
    refreshStaticText();
  } catch (error) {
    console.error('switchCamera error', error);
    notifyVideo(t('mediaPermissionDenied'), true);
  }
}

async function toggleScreenShare() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    notifyVideo('Screen sharing not supported', true);
    return;
  }

  try {
    if (state.isScreenSharing) {
      if (state.screenStream) {
        state.screenStream.getTracks().forEach(track => track.stop());
        state.screenStream = null;
      }

      await ensureLocalStream();

      state.peers.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender && state.localStream) {
          const [videoTrack] = state.localStream.getVideoTracks();
          if (videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
      });

      ui.localVideo.srcObject = state.localStream;
      state.isScreenSharing = false;
      ui.screenShareBtn.textContent = 'Stop share';
    } else {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      state.screenStream = screenStream;
      const [screenTrack] = screenStream.getVideoTracks();

      state.peers.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      ui.localVideo.srcObject = screenStream;
      state.isScreenSharing = true;
      ui.screenShareBtn.textContent = 'Screen';

      screenTrack.addEventListener('ended', () => {
        toggleScreenShare();
      });
    }
  } catch (error) {
    notifyVideo('Failed to start screen sharing', true);
  }
}

function setupControlsAutoHide() {
  const videoStage = document.querySelector('.video-stage');
  const controls = document.getElementById('floatingControls');

  function showControls() {
    if (state.controlsTimeout) {
      clearTimeout(state.controlsTimeout);
    }
    controls.classList.remove('collapsed');
    state.controlsVisible = true;

    state.controlsTimeout = setTimeout(() => {
      if (!controls.matches(':hover')) {
        controls.classList.add('collapsed');
        state.controlsVisible = false;
      }
    }, 3000);
  }

  videoStage.addEventListener('mousemove', showControls);
  videoStage.addEventListener('click', showControls);
  controls.addEventListener('mouseenter', showControls);

  controls.addEventListener('mouseleave', () => {
    if (state.controlsTimeout) {
      clearTimeout(state.controlsTimeout);
    }
    state.controlsTimeout = setTimeout(() => {
      controls.classList.add('collapsed');
      state.controlsVisible = false;
    }, 1000);
  });

  showControls();
}

function getAudioEnabled() {
  return !!(state.localStream && state.localStream.getAudioTracks().some((track) => track.enabled));
}

function getVideoEnabled() {
  return !!(state.localStream && state.localStream.getVideoTracks().some((track) => track.enabled));
}

function toggleAudio(forceValue, { forced = false, silent = false } = {}) {
  if (!state.localStream) return;
  const enable = typeof forceValue === 'boolean' ? forceValue : !getAudioEnabled();
  state.localStream.getAudioTracks().forEach((track) => {
    track.enabled = enable;
  });
  ui.muteBtn.textContent = enable ? t('mute') : t('unmute');
  ui.muteBtn.classList.toggle('forced', forced && !enable);
  if (forced && !silent) {
    notifyVideo(enable ? t('unmute') : t('mute'));
  }
}

function toggleVideo(forceValue, { silent = false } = {}) {
  if (!state.localStream) return;
  const enable = typeof forceValue === 'boolean' ? forceValue : !getVideoEnabled();
  state.localStream.getVideoTracks().forEach((track) => {
    track.enabled = enable;
  });
  ui.videoBtn.textContent = enable ? t('stopVideo') : t('startVideo');
}

function createRemoteTile(peerId, name) {
  let tile = ui.videoGrid.querySelector(`[data-peer="${peerId}"]`);
  if (!tile) {
    tile = document.createElement('div');
    tile.className = 'video-wrapper remote idle';
    tile.dataset.peer = peerId;
    tile.innerHTML = `
      <video autoplay playsinline></video>
      <div class="video-placeholder">${t('remotePlaceholder')}</div>
      <div class="video-label"></div>
    `;
    tile.addEventListener('click', () => setPrimaryPeer(peerId));
    ui.videoGrid.appendChild(tile);
    ui.videoGrid.appendChild(ui.localContainer);
    ensurePeerOrder(peerId);
  }
  const label = tile.querySelector('.video-label');
  label.textContent = name || 'Guest';
  return tile;
}

function removeRemoteTile(peerId) {
  const tile = ui.videoGrid.querySelector(`[data-peer="${peerId}"]`);
  if (tile) tile.remove();
  if (state.primaryPeerId === peerId) {
    state.primaryPeerId = null;
  }
  dropPeerFromOrder(peerId);
  refreshVideoPagination();
}

function ensurePeerOrder(peerId) {
  if (peerId === 'self') return;
  if (!state.peerOrder.includes(peerId)) {
    state.peerOrder.push(peerId);
  }
  refreshVideoPagination();
}

function dropPeerFromOrder(peerId) {
  state.peerOrder = state.peerOrder.filter((id) => id !== peerId);
}

function refreshVideoPagination() {
  if (!ui.videoPagination) return;
  const order = state.peerOrder.length ? state.peerOrder : ['self'];
  if (!order.includes('self')) order.unshift('self');
  const total = order.length;

  updateVideoLayout(total);

  const perPage = state.videosPerPage;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (state.videoPage >= totalPages) {
    state.videoPage = totalPages - 1;
  }

  ui.videoPrevPage.disabled = state.videoPage <= 0;
  ui.videoNextPage.disabled = state.videoPage >= totalPages - 1;

  ui.videoPagination.classList.toggle('hidden', totalPages <= 1);
  ui.videoPageIndicator.textContent = `${state.videoPage + 1} / ${totalPages}`;

  order.forEach((peerId, index) => {
    const tile = peerId === 'self'
      ? ui.localContainer
      : ui.videoGrid.querySelector(`[data-peer="${peerId}"]`);
    if (!tile) return;
    const pageIndex = Math.floor(index / perPage);
    tile.classList.toggle('hidden', pageIndex !== state.videoPage);
  });
}

function updateVideoLayout(participantCount) {
  const grid = ui.videoGrid;
  grid.className = grid.className.replace(/layout-\w+/g, '');

  let layout;
  if (participantCount <= 1) {
    layout = 'layout-1x1';
    state.videosPerPage = 1;
  } else if (participantCount <= 2) {
    layout = 'layout-1x2';
    state.videosPerPage = 2;
  } else if (participantCount <= 4) {
    layout = 'layout-2x2';
    state.videosPerPage = 4;
  } else if (participantCount <= 6) {
    layout = 'layout-2x3';
    state.videosPerPage = 6;
  } else if (participantCount <= 8) {
    layout = 'layout-2x4';
    state.videosPerPage = 8;
  } else if (participantCount <= 9) {
    layout = 'layout-3x3';
    state.videosPerPage = 9;
  } else {
    layout = 'layout-2x4';
    state.videosPerPage = 8;
  }

  grid.classList.add(layout);
  state.videoLayout = layout;
}

async function createPeerConnection(peerId, name, initiator) {
  await ensureLocalStream().catch(() => {});
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const tile = createRemoteTile(peerId, name);
  const videoEl = tile.querySelector('video');
  state.peers.set(peerId, { pc, videoEl, name, stream: null });

  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => pc.addTrack(track, state.localStream));
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-candidate', { targetId: peerId, candidate: event.candidate });
    }
  };

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      const entry = state.peers.get(peerId);
      entry.stream = stream;
      entry.videoEl.srcObject = stream;
      tile.classList.remove('idle');
      if (!state.primaryPeerId) {
        setPrimaryPeer(peerId, false);
      }
    }
  };

  pc.onconnectionstatechange = () => {
    if (['failed', 'disconnected'].includes(pc.connectionState)) {
      notifyVideo(t('reconnection'), true);
    }
  };

  if (initiator) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', {
        targetId: peerId,
        offer: pc.localDescription,
        name: state.displayName,
      });
    } catch (error) {
      console.error('create offer failed', error);
    }
  }

  return pc;
}

function setPrimaryPeer(peerId, announce = true) {
  if (!state.peers.has(peerId)) return;
  state.primaryPeerId = peerId;
  const tiles = ui.videoGrid.querySelectorAll('.video-wrapper.remote');
  tiles.forEach((tile) => tile.classList.toggle('active', tile.dataset.peer === peerId));
  if (announce) {
    const entry = state.peers.get(peerId);
    notifyVideo(`${entry.name || 'Guest'} • focus`);
  }
}

function getPrimaryVideoElement() {
  if (state.primaryPeerId && state.peers.has(state.primaryPeerId)) {
    return state.peers.get(state.primaryPeerId).videoEl;
  }
  const first = [...state.peers.values()].find((peer) => peer.stream);
  return first ? first.videoEl : null;
}

function cleanupPeer(peerId) {
  const entry = state.peers.get(peerId);
  if (!entry) return;
  entry.pc.close();
  if (entry.videoEl) entry.videoEl.srcObject = null;
  state.peers.delete(peerId);
  removeRemoteTile(peerId);
}

function toggleLayout() {
  state.viewMode = state.viewMode === 'cozy' ? 'compact' : 'cozy';
  document.body.classList.toggle('compact-layout', state.viewMode === 'compact');
  ui.layoutToggleBtn.textContent = state.viewMode === 'cozy' ? t('layoutCozy') : t('layoutCompact');
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      state.isFullscreen = true;
    } else {
      await document.exitFullscreen();
      state.isFullscreen = false;
    }
  } catch (error) {
    console.error('fullscreen error', error);
  }
  ui.fullscreenBtn.textContent = state.isFullscreen ? t('exitFullscreen') : t('enterFullscreen');
}

async function togglePictureInPicture() {
  const video = getPrimaryVideoElement();
  if (!video || !video.srcObject) {
    notifyVideo(t('remotePlaceholder'), true);
    return;
  }
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      ui.pipBtn.textContent = t('pip');
      notifyVideo(t('pipExiting'));
      return;
    }
    if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
      ui.pipBtn.textContent = t('pipActive');
      notifyVideo(t('pipEntering'));
      return;
    }
    if (video.webkitSupportsPresentationMode) {
      const mode = video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
      video.webkitSetPresentationMode(mode);
      ui.pipBtn.textContent = mode === 'picture-in-picture' ? t('pipActive') : t('pip');
      notifyVideo(mode === 'picture-in-picture' ? t('pipEntering') : t('pipExiting'));
      return;
    }
    notifyVideo(t('pipUnsupported'), true);
  } catch (error) {
    notifyVideo(t('pipUnsupported'), true);
  }
}

function updateAssistantToggle() {
  ui.assistantToggleBtn.classList.toggle('active', state.assistantMode);
  ui.assistantToggleBtn.textContent = state.assistantMode ? t('assistantToggleOn') : t('assistantToggleOff');
  ui.chatInput.placeholder = state.assistantMode ? t('assistantInputPlaceholder') : t('chatInputPlaceholder');
  ui.sendBtn.textContent = state.assistantMode ? t('assistantToggleOn') : t('send');
}

function copyMeetingLink() {
  const link = `${window.location.origin}/chat.html?room=${encodeURIComponent(state.meetingToken)}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(link)
      .then(() => notifyChat(t('linkCopied')))
      .catch(() => notifyChat(t('linkCopyError'), true));
  } else {
    notifyChat(t('clipboardUnavailable'), true);
  }
}

function startAssistantRequest(data) {
  state.assistantName = data.name || state.assistantName;
  const timestamp = new Date().toISOString();
  const message = appendMessage(
    { sender: state.assistantName, text: t('assistantStarting'), ts: timestamp, requestId: data.requestId },
    { streaming: true },
  );
  state.assistantRequests.set(data.requestId, {
    element: message,
    buffer: '',
    done: false,
  });
}

function updateAssistantChunk(data) {
  const entry = state.assistantRequests.get(data.requestId);
  if (!entry) return;
  entry.buffer += data.delta;
  const body = entry.element.querySelector('.message-body');
  body.textContent = entry.buffer;
}

function finalizeAssistantRequest(data) {
  const entry = state.assistantRequests.get(data.requestId);
  if (!entry) return;
  entry.done = true;
  entry.buffer = data.text;
  entry.element.classList.remove('streaming');
  entry.element.dataset.timestamp = data.ts;
  const header = entry.element.querySelector('.message-header');
  header.innerHTML = `<strong>${state.assistantName}</strong><span>${formatTime(data.ts)}</span>`;
  const body = entry.element.querySelector('.message-body');
  body.textContent = data.text;
  notifyChat(t('assistantComplete'));
}

function failAssistantRequest(data) {
  const entry = state.assistantRequests.get(data.requestId);
  if (!entry) {
    notifyChat(data.message || t('assistantError'), true);
    return;
  }
  entry.done = true;
  entry.element.classList.remove('streaming');
  entry.element.classList.add('error');
  const body = entry.element.querySelector('.message-body');
  body.textContent = data.message || t('assistantError');
  notifyChat(data.message || t('assistantError'), true);
}

function maybeSkipAssistantMessage(message) {
  if (message.sender !== state.assistantName) return false;
  if (!message.requestId) return false;
  const entry = state.assistantRequests.get(message.requestId);
  if (!entry) return false;
  if (entry.done) {
    state.assistantRequests.delete(message.requestId);
    return true;
  }
  return false;
}

async function prefetchMeeting() {
  try {
    const response = await fetch(`/api/meetings/${encodeURIComponent(state.meetingToken)}`);
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.message || t('meetingUnavailable'));
    }
    state.meetingHost = data.meeting.host;
    state.maxParticipants = data.meeting.maxParticipants || 10;
    ui.meetingSubtitle.textContent = t('hostSubtitle', state.meetingHost);
    updateDocumentTitle();
  } catch (error) {
    notifyChat(error.message || t('meetingUnavailable'), true);
    throw error;
  }
}

async function loadHistory() {
  try {
    const response = await fetch(`/api/messages/${encodeURIComponent(state.meetingToken)}`);
    const data = await response.json();
    if (!response.ok || !data.ok) return;
    data.messages.forEach((message) => {
      appendMessage(message);
    });
  } catch (error) {
    console.warn('history error', error);
  }
}

function showNameModal() {
  ui.nameModal.classList.remove('hidden');
  ui.nameInput.focus();
}

function hideNameModal() {
  ui.nameModal.classList.add('hidden');
  ui.nameError.classList.add('hidden');
  ui.nameForm.reset();
}

function joinMeeting(displayName) {
  socket.emit('join-room', {
    meetingToken: state.meetingToken,
    displayName,
    authToken: state.authToken,
  });
}

function leaveMeeting() {
  socket.emit('leave-meeting');
  cleanupMedia();
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }
  window.location.href = '/';
}

function cleanupMedia() {
  state.peers.forEach((_, peerId) => cleanupPeer(peerId));
  state.peers.clear();
  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => track.stop());
    state.localStream = null;
  }
  ui.localVideo.srcObject = null;
  ui.localContainer.classList.add('idle');
  state.primaryPeerId = null;
  state.hasJoined = false;
  state.roster = [];
  state.peerOrder = ['self'];
  state.emotionSelections.clear();
  state.emotionStats = null;
  state.activeTest = null;
  state.testEndsAt = null;
  if (state.testTimerId) {
    clearInterval(state.testTimerId);
    state.testTimerId = null;
  }
  refreshVideoPagination();
  updateEmotionOverlay();
  updateHostTools();
}

function setupEventListeners() {
  ui.nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = sanitizeText(ui.nameInput.value);
    if (!name) {
      ui.nameError.textContent = t('nameRequired');
      ui.nameError.classList.remove('hidden');
      return;
    }
    joinMeeting(name);
  });

  ui.copyLinkBtn.addEventListener('click', copyMeetingLink);
  ui.layoutToggleBtn.addEventListener('click', toggleLayout);
  ui.fullscreenBtn.addEventListener('click', toggleFullscreen);
  ui.pipBtn.addEventListener('click', togglePictureInPicture);
  ui.muteBtn.addEventListener('click', toggleAudio);
  ui.videoBtn.addEventListener('click', toggleVideo);
  ui.cameraFlipBtn.addEventListener('click', switchCamera);
  ui.screenShareBtn.addEventListener('click', toggleScreenShare);
  ui.leaveBtn.addEventListener('click', leaveMeeting);
  ui.endMeetingBtn.addEventListener('click', () => {
    if (!state.isHost || !state.authToken) return;
    fetch(`/api/meetings/${encodeURIComponent(state.meetingToken)}/end`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.authToken}`,
      },
    }).catch(() => notifyChat(t('unableToEnd'), true));
  });

  ui.assistantToggleBtn.addEventListener('click', () => {
    state.assistantMode = !state.assistantMode;
    updateAssistantToggle();
  });

  ui.assistantSearchToggle.addEventListener('change', (event) => {
    state.assistantWithSearch = event.target.checked;
  });

  ui.chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = sanitizeText(ui.chatInput.value);
    if (!text) return;
    ui.chatInput.value = '';
    if (state.assistantMode && state.isHost) {
      socket.emit('assistant-query', {
        prompt: text,
        withSearch: state.assistantWithSearch,
      });
    } else {
      socket.emit('chat-message', { text });
    }
  });

  window.addEventListener('beforeunload', () => {
    socket.emit('leave-meeting');
    cleanupMedia();
  });

  document.addEventListener('fullscreenchange', () => {
    state.isFullscreen = Boolean(document.fullscreenElement);
    ui.fullscreenBtn.textContent = state.isFullscreen ? t('exitFullscreen') : t('enterFullscreen');
  });
}

function setupSocketHandlers() {
  socket.on('connect', () => {
    state.selfId = socket.id;
  });

  socket.on('join-error', ({ message }) => {
    notifyChat(message || t('unableToJoin'), true);
  });

  socket.on('meeting-joined', async ({ meeting, roster, peers, isHost, self, muted, emotions, activeTests, cameraSettings, videoLayout, reconnectInfo }) => {
    state.isHost = isHost;
    state.displayName = self;
    state.maxParticipants = meeting.maxParticipants || state.maxParticipants;
    state.meetingHost = meeting.host;
    state.roster = Array.isArray(roster) ? roster : [];
    if (!state.roster.some((entry) => entry?.name === self)) {
      state.roster.push({ name: self, present: true, muted: Boolean(muted) });
    }
    state.peerOrder = ['self'];
    state.hasJoined = true;
    state.emotionSelections = new Map(
      Object.entries(emotions || {}).map(([participant, emotion]) => [participant, emotion]),
    );
    state.testsHistory = Array.isArray(activeTests) ? activeTests : [];

    if (cameraSettings) {
      state.cameraFacing = cameraSettings.facing_mode || 'user';
    }

    if (videoLayout) {
      state.videoLayout = videoLayout.layout_type || 'auto';
      state.videoPage = videoLayout.current_page || 0;
      state.videosPerPage = videoLayout.participants_per_page || 8;
    }

    if (reconnectInfo && reconnectInfo.connection_count > 1) {
      notifyChat(`Reconnected (attempt ${reconnectInfo.connection_count})`);
      state.reconnectAttempts = 0;
    }

    renderParticipants();
    refreshStaticText();
    hideNameModal();
    notifyChat(t('joined'));
    ui.chatStatus.textContent = t('chatStatusIdle');
    ui.roleBadge.textContent = isHost ? t('hostBadge') : t('guestBadge');
    if (isHost) {
      ui.assistantToolbar.classList.remove('hidden');
      ui.endMeetingBtn.classList.remove('hidden');
    } else {
      ui.assistantToolbar.classList.add('hidden');
      ui.endMeetingBtn.classList.add('hidden');
      state.assistantMode = false;
      updateAssistantToggle();
    }

    await ensureLocalStream().catch(() => {});
    await loadHistory();

    if (Array.isArray(peers)) {
      for (const peer of peers) {
        if (!peer.socketId) continue;
        await createPeerConnection(peer.socketId, peer.name || 'Guest', true);
      }
    }

    if (muted) {
      toggleAudio(false, { forced: true });
    }

    refreshVideoPagination();
    updateEmotionOverlay();
    updateHostTools();
  });

  socket.on('participant-joined', ({ name, socketId, muted }) => {
    if (!name) return;
    const existing = state.roster.find((entry) => entry.name === name);
    if (existing) {
      existing.present = true;
      existing.muted = Boolean(muted);
    } else {
      state.roster.push({ name, present: true, muted: Boolean(muted) });
    }
    renderParticipants();
    updateParticipantDrawer();
    notifyChat(t('participantJoined', name));
  });

  socket.on('participant-left', ({ name, socketId }) => {
    const entry = state.roster.find((item) => item.name === name);
    if (entry) {
      entry.present = false;
    }
    renderParticipants();
    updateParticipantDrawer();
    notifyChat(t('participantLeft', name));
    cleanupPeer(socketId);
  });

  socket.on('participant-removed', ({ name }) => {
    state.roster = state.roster.filter((entry) => entry.name !== name);
    renderParticipants();
    updateParticipantDrawer();
    notifyChat(t('participantLeft', name));
  });

  socket.on('roster-update', (roster) => {
    if (Array.isArray(roster)) {
      state.roster = roster;
      renderParticipants();
      updateParticipantDrawer();
    }
  });

  socket.on('message', (message) => {
    if (maybeSkipAssistantMessage(message)) return;
    appendMessage(message);
  });

  socket.on('chat-error', ({ message }) => {
    notifyChat(message || t('chatSendFailed'), true);
  });

  socket.on('moderation', ({ type, reason }) => {
    if (type === 'force-mute') {
      toggleAudio(false, { forced: true, silent: true });
      notifyVideo(t('mutedByHost'), true);
    } else if (type === 'force-unmute') {
      toggleAudio(true, { forced: false, silent: true });
      notifyVideo(t('unmutedByHost'));
    } else if (type === 'force-leave') {
      notifyVideo(t('removedByHost'), true);
      cleanupMedia();
      socket.disconnect();
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    }
  });

  socket.on('moderation-state', ({ target, action }) => {
    const entry = state.roster.find((item) => item.name === target);
    if (entry) {
      entry.muted = action === 'mute';
    }
    renderParticipants();
    updateParticipantDrawer();
  });

  socket.on('moderation-error', ({ message }) => {
    notifyVideo(message || 'Moderation failed', true);
  });

  socket.on('meeting-ended', () => {
    notifyChat(t('meetingEnded'));
    cleanupMedia();
    ui.chatInput.disabled = true;
    ui.sendBtn.disabled = true;
  });
}

function setupAssistantHandlers() {
  socket.on('assistant-start', (data) => {
    startAssistantRequest(data);
  });

  socket.on('assistant-chunk', (data) => {
    updateAssistantChunk(data);
  });

  socket.on('assistant-complete', (data) => {
    finalizeAssistantRequest(data);
  });

  socket.on('assistant-error', (data) => {
    failAssistantRequest(data);
  });
}

function setupWebRTCHandlers() {
  socket.on('webrtc-offer', async ({ from, name, offer }) => {
    try {
      let peer = state.peers.get(from);
      if (!peer) {
        await createPeerConnection(from, name, false);
        peer = state.peers.get(from);
      }
      await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', {
        targetId: from,
        answer: peer.pc.localDescription,
      });
    } catch (error) {
      console.error('offer error', error);
    }
  });

  socket.on('webrtc-answer', async ({ from, answer }) => {
    const peer = state.peers.get(from);
    if (!peer) return;
    try {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('answer error', error);
    }
  });

  socket.on('webrtc-candidate', async ({ from, candidate }) => {
    const peer = state.peers.get(from);
    if (!peer) return;
    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('candidate error', error);
    }
  });
}

async function bootstrap() {
  if (!state.meetingToken) {
    notifyChat(t('invalidLink'), true);
    return;
  }
  document.documentElement.lang = currentLang;
  refreshStaticText();
  setupEventListeners();
  setupSocketHandlers();
  setupAssistantHandlers();
  setupWebRTCHandlers();
  setupControlsAutoHide();
  detectCameraFlipSupport();

  try {
    await prefetchMeeting();
    if (state.authToken && sessionStorage.getItem('username')) {
      joinMeeting(sessionStorage.getItem('username'));
    } else {
      showNameModal();
    }
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
