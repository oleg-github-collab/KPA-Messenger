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
    // Request high quality video and audio
    state.localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Set up local video
    ui.localVideo.srcObject = state.localStream;
    ui.localContainer.classList.remove('idle');

    // Hide placeholder once video loads
    const placeholder = ui.localContainer.querySelector('.video-placeholder');
    if (placeholder) {
      ui.localVideo.addEventListener('loadedmetadata', () => {
        placeholder.style.display = 'none';
        console.log('Local video loaded, hiding placeholder');
      });

      // Also hide on first frame
      ui.localVideo.addEventListener('loadeddata', () => {
        placeholder.style.display = 'none';
      });
    }

    // Update button states
    updateControlButtonStates();
    await detectCameraFlipSupport();

    console.log('Local stream established successfully');
    return state.localStream;
  } catch (error) {
    console.error('Failed to get local stream:', error);
    notifyVideo(t('mediaPermissionDenied'), true);
    throw error;
  }
}

// Helper function to update control button states
function updateControlButtonStates() {
  if (!state.localStream) return;

  const audioEnabled = getAudioEnabled();
  const videoEnabled = getVideoEnabled();

  // Update audio button
  ui.muteBtn.classList.toggle('muted', !audioEnabled);
  ui.muteBtn.classList.toggle('active', audioEnabled);
  ui.muteBtn.title = audioEnabled ? t('mute') : t('unmute');

  // Update video button
  ui.videoBtn.classList.toggle('off', !videoEnabled);
  ui.videoBtn.classList.toggle('active', videoEnabled);
  ui.videoBtn.title = videoEnabled ? t('stopVideo') : t('startVideo');
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

// Enhanced screen sharing with better error handling and state management
async function toggleScreenShare() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    notifyVideo('Screen sharing not supported', true);
    return;
  }

  try {
    // Show loading state
    ui.screenShareBtn.classList.add('loading');
    ui.screenShareBtn.disabled = true;

    if (state.isScreenSharing) {
      // Stop screen sharing
      if (state.screenStream) {
        state.screenStream.getTracks().forEach(track => track.stop());
        state.screenStream = null;
      }

      // Return to camera
      await ensureLocalStream();

      // Replace screen track with camera track for all peers
      const promises = [];
      state.peers.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender && state.localStream) {
          const [videoTrack] = state.localStream.getVideoTracks();
          if (videoTrack) {
            promises.push(sender.replaceTrack(videoTrack));
          }
        }
      });

      await Promise.all(promises);

      // Update local video
      ui.localVideo.srcObject = state.localStream;
      state.isScreenSharing = false;

      // Update UI
      ui.screenShareBtn.classList.remove('active');
      ui.screenShareBtn.title = t('screenShare');

      const localTile = document.querySelector('[data-peer="self"]');
      if (localTile) {
        localTile.classList.remove('screen-sharing');
      }

      notifyVideo('Screen sharing stopped', false);

    } else {
      // Start screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      state.screenStream = screenStream;
      const [screenTrack] = screenStream.getVideoTracks();
      const [audioTrack] = screenStream.getAudioTracks();

      // Replace video track for all peers
      const promises = [];
      state.peers.forEach(({ pc }) => {
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          promises.push(videoSender.replaceTrack(screenTrack));
        }

        // Add audio track if available and not already added
        if (audioTrack) {
          const audioSender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            promises.push(audioSender.replaceTrack(audioTrack));
          } else {
            pc.addTrack(audioTrack, screenStream);
          }
        }
      });

      await Promise.all(promises);

      // Update local video
      ui.localVideo.srcObject = screenStream;
      state.isScreenSharing = true;

      // Update UI
      ui.screenShareBtn.classList.add('active');
      ui.screenShareBtn.title = 'Stop sharing screen';

      const localTile = document.querySelector('[data-peer="self"]');
      if (localTile) {
        localTile.classList.add('screen-sharing');
      }

      // Handle screen share ending
      screenTrack.addEventListener('ended', () => {
        console.log('Screen share track ended');
        toggleScreenShare();
      });

      // Notify via data channels
      state.peers.forEach((peer) => {
        if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
          peer.dataChannel.send(JSON.stringify({
            type: 'screenShareStatus',
            enabled: true,
            timestamp: Date.now()
          }));
        }
      });

      notifyVideo('Screen sharing started', false);
    }

  } catch (error) {
    console.error('Screen sharing error:', error);

    if (error.name === 'NotAllowedError') {
      notifyVideo('Screen sharing permission denied', true);
    } else if (error.name === 'NotSupportedError') {
      notifyVideo('Screen sharing not supported', true);
    } else {
      notifyVideo('Failed to start screen sharing', true);
    }
  } finally {
    // Remove loading state
    ui.screenShareBtn.classList.remove('loading');
    ui.screenShareBtn.disabled = false;
  }
}

// Enhanced fullscreen toggle
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      state.isFullscreen = true;
      ui.fullscreenBtn.classList.add('active');
      ui.fullscreenBtn.title = t('exitFullscreen');
      notifyVideo(t('enterFullscreen'), false);
    } else {
      await document.exitFullscreen();
      state.isFullscreen = false;
      ui.fullscreenBtn.classList.remove('active');
      ui.fullscreenBtn.title = t('enterFullscreen');
      notifyVideo(t('exitFullscreen'), false);
    }
  } catch (error) {
    console.error('Fullscreen error:', error);
    notifyVideo('Fullscreen not supported', true);
  }
}

// Enhanced Picture-in-Picture toggle
async function togglePictureInPicture() {
  try {
    const videoEl = getPrimaryVideoElement() || ui.localVideo;

    if (!videoEl || !document.pictureInPictureEnabled) {
      notifyVideo(t('pipUnsupported'), true);
      return;
    }

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      state.isPictureInPicture = false;
      ui.pipBtn.classList.remove('active');
      ui.pipBtn.title = t('pip');
      notifyVideo(t('pipExiting'), false);
    } else {
      await videoEl.requestPictureInPicture();
      state.isPictureInPicture = true;
      ui.pipBtn.classList.add('active');
      ui.pipBtn.title = t('pipActive');
      notifyVideo(t('pipEntering'), false);
    }
  } catch (error) {
    console.error('PiP error:', error);
    notifyVideo(t('pipUnsupported'), true);
  }
}

// Enhanced meeting leave with confirmation
async function leaveMeeting() {
  if (state.isHost) {
    const confirmEnd = confirm('As the host, leaving will end the meeting for all participants. Continue?');
    if (!confirmEnd) return;
  }

  try {
    // Show leaving state
    ui.leaveBtn.classList.add('loading');
    ui.leaveBtn.disabled = true;

    // Stop all tracks
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(track => track.stop());
    }

    // Clean up all peer connections
    state.peers.forEach((_, peerId) => {
      cleanupPeer(peerId);
    });

    // Disconnect from socket
    socket.disconnect();

    // Show leaving message
    notifyVideo('Leaving meeting...', false);

    // Redirect after delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

  } catch (error) {
    console.error('Error leaving meeting:', error);
    // Force redirect on error
    window.location.href = '/';
  }
}

// Enhanced layout toggle with animation
function toggleLayout() {
  const layouts = ['layout-auto', 'layout-1x1', 'layout-1x2', 'layout-2x2', 'layout-2x3'];
  const currentLayoutIndex = layouts.findIndex(layout => ui.videoGrid.classList.contains(layout));
  const nextLayoutIndex = (currentLayoutIndex + 1) % layouts.length;

  // Remove all layout classes
  layouts.forEach(layout => ui.videoGrid.classList.remove(layout));

  // Add new layout class
  ui.videoGrid.classList.add(layouts[nextLayoutIndex]);

  // Update button state
  ui.layoutToggleBtn.title = `Layout: ${layouts[nextLayoutIndex].replace('layout-', '')}`;

  // Store current layout
  state.videoLayout = layouts[nextLayoutIndex];

  notifyVideo(`Layout: ${layouts[nextLayoutIndex].replace('layout-', '').toUpperCase()}`, false);
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

// Enhanced audio toggle with proper state management and UI feedback
function toggleAudio(forceValue, { forced = false, silent = false } = {}) {
  try {
    if (!state.localStream) {
      console.warn('No local stream available for audio toggle');
      handleButtonError('muteBtn', 'No audio stream available');
      return;
    }

    const currentlyEnabled = getAudioEnabled();
    const enable = typeof forceValue === 'boolean' ? forceValue : !currentlyEnabled;

    // Update audio tracks with error handling
    const audioTracks = state.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      handleButtonError('muteBtn', 'No audio tracks found');
      return;
    }

    audioTracks.forEach((track) => {
      track.enabled = enable;
    });
  } catch (error) {
    handleButtonError('muteBtn', error);
    return;
  }

  // Update button state and styling
  ui.muteBtn.classList.toggle('muted', !enable);
  ui.muteBtn.classList.toggle('active', enable);
  ui.muteBtn.classList.toggle('forced', forced && !enable);
  ui.muteBtn.title = enable ? t('mute') : t('unmute');

  // Update local video tile
  const localTile = document.querySelector('[data-peer="self"]');
  if (localTile) {
    localTile.classList.toggle('audio-muted', !enable);
  }

  // Store audio state
  state.audioEnabled = enable;

  // Notify other participants via data channels
  state.peers.forEach((peer) => {
    if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify({
        type: 'audioStatus',
        enabled: enable,
        timestamp: Date.now()
      }));
    }
  });

  // Show notification if needed
  if (forced && !silent) {
    notifyVideo(enable ? t('unmutedByHost') : t('mutedByHost'));
  } else if (!silent) {
    notifyVideo(enable ? t('unmute') : t('mute'), false);
  }

  console.log(`Audio ${enable ? 'enabled' : 'disabled'}`);
}

// Enhanced video toggle with proper state management and UI feedback
function toggleVideo(forceValue, { silent = false } = {}) {
  try {
    if (!state.localStream) {
      console.warn('No local stream available for video toggle');
      handleButtonError('videoBtn', 'No video stream available');
      return;
    }

    const currentlyEnabled = getVideoEnabled();
    const enable = typeof forceValue === 'boolean' ? forceValue : !currentlyEnabled;

    // Update video tracks with error handling
    const videoTracks = state.localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      handleButtonError('videoBtn', 'No video tracks found');
      return;
    }

    videoTracks.forEach((track) => {
      track.enabled = enable;
    });
  } catch (error) {
    handleButtonError('videoBtn', error);
    return;
  }

  // Update button state and styling
  ui.videoBtn.classList.toggle('off', !enable);
  ui.videoBtn.classList.toggle('active', enable);
  ui.videoBtn.title = enable ? t('stopVideo') : t('startVideo');

  // Update local video tile
  const localTile = document.querySelector('[data-peer="self"]');
  if (localTile) {
    localTile.classList.toggle('video-disabled', !enable);
    const placeholder = localTile.querySelector('.video-placeholder');
    if (placeholder) {
      placeholder.style.display = enable ? 'none' : 'grid';
      placeholder.textContent = enable ? '' : t('localPlaceholder');
    }
  }

  // Store video state
  state.videoEnabled = enable;

  // Notify other participants via data channels
  state.peers.forEach((peer) => {
    if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify({
        type: 'videoStatus',
        enabled: enable,
        timestamp: Date.now()
      }));
    }
  });

  // Show notification if needed
  if (!silent) {
    notifyVideo(enable ? t('startVideo') : t('stopVideo'), false);
  }

  console.log(`Video ${enable ? 'enabled' : 'disabled'}`);
}

// Enhanced camera switching with error handling
async function switchCamera() {
  if (!state.localStream || !state.supportsCameraFlip) {
    console.warn('Camera flip not supported or no stream available');
    return;
  }

  try {
    // Show loading state
    ui.cameraFlipBtn.classList.add('loading');
    ui.cameraFlipBtn.disabled = true;

    const videoTrack = state.localStream.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error('No video track found');
    }

    // Stop current video track
    videoTrack.stop();

    // Switch camera facing mode
    state.currentFacingMode = state.currentFacingMode === 'user' ? 'environment' : 'user';

    // Get new stream with switched camera
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: state.currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false // Don't get audio track again
    });

    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace video track in local stream
    state.localStream.removeTrack(videoTrack);
    state.localStream.addTrack(newVideoTrack);

    // Update local video element
    ui.localVideo.srcObject = state.localStream;

    // Replace video track in all peer connections
    for (const [peerId, peer] of state.peers) {
      const sender = peer.pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
        console.log(`Replaced video track for peer: ${peerId}`);
      }
    }

    notifyVideo(`Switched to ${state.currentFacingMode === 'user' ? 'front' : 'back'} camera`, false);

  } catch (error) {
    console.error('Error switching camera:', error);
    notifyVideo('Failed to switch camera', true);
  } finally {
    // Remove loading state
    ui.cameraFlipBtn.classList.remove('loading');
    ui.cameraFlipBtn.disabled = false;
  }
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

function changePage(direction) {
  const order = state.peerOrder.length ? state.peerOrder : ['self'];
  if (!order.includes('self')) order.unshift('self');
  const total = order.length;
  const totalPages = Math.max(1, Math.ceil(total / state.videosPerPage));

  const newPage = state.videoPage + direction;
  if (newPage >= 0 && newPage < totalPages) {
    state.videoPage = newPage;
    refreshVideoPagination();
  }
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

// Enhanced WebRTC Configuration with STUN and TURN servers
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// Connection state tracking
const connectionStats = {
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  connectionStartTime: null,
  sessionDuration: 0,
  lastHeartbeat: Date.now(),
};

// Enhanced peer connection with auto-reconnect
async function createPeerConnection(peerId, name, initiator, isReconnect = false) {
  await ensureLocalStream().catch(() => {});

  const pc = new RTCPeerConnection(rtcConfig);
  const tile = createRemoteTile(peerId, name);
  const videoEl = tile.querySelector('video');

  const peerData = {
    pc,
    videoEl,
    name,
    stream: null,
    connectionState: 'new',
    reconnectCount: 0,
    lastReconnect: Date.now(),
    dataChannel: null,
    stats: {
      bytesReceived: 0,
      bytesSent: 0,
      packetsLost: 0,
      audioLevel: 0,
    }
  };

  state.peers.set(peerId, peerData);

  // Add local tracks with enhanced error handling
  if (state.localStream) {
    const tracks = state.localStream.getTracks();
    for (const track of tracks) {
      try {
        pc.addTrack(track, state.localStream);
      } catch (error) {
        console.error(`Error adding ${track.kind} track:`, error);
      }
    }
  }

  // Create data channel for heartbeat and connection monitoring
  if (initiator) {
    try {
      peerData.dataChannel = pc.createDataChannel('status', {
        ordered: true,
        maxRetransmits: 3,
      });
      setupDataChannel(peerData.dataChannel, peerId);
    } catch (error) {
      console.error('Error creating data channel:', error);
    }
  }

  // Enhanced ICE candidate handling
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-candidate', {
        targetId: peerId,
        candidate: event.candidate,
        timestamp: Date.now()
      });
    } else {
      // ICE gathering complete
      peerData.iceGatheringComplete = true;
    }
  };

  // Enhanced track handling
  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      const entry = state.peers.get(peerId);
      if (entry) {
        entry.stream = stream;
        entry.videoEl.srcObject = stream;
        entry.connectionState = 'connected';
        tile.classList.remove('idle');
        tile.classList.add('connected');

        // Monitor stream health
        monitorStreamHealth(stream, peerId);

        if (!state.primaryPeerId) {
          setPrimaryPeer(peerId, false);
        }

        // Start connection quality monitoring
        startConnectionMonitoring(peerId);
      }
    }
  };

  // Data channel handler
  pc.ondatachannel = (event) => {
    setupDataChannel(event.channel, peerId);
  };

  // Ultra-stable connection state management with instant reconnection
  pc.onconnectionstatechange = async () => {
    const entry = state.peers.get(peerId);
    if (!entry) return;

    entry.connectionState = pc.connectionState;
    updatePeerUI(peerId, pc.connectionState);

    switch (pc.connectionState) {
      case 'connecting':
        tile.classList.add('connecting');
        // Show subtle connecting indicator
        showConnectionStatus(`Connecting to ${peerId}...`);
        break;
      case 'connected':
        tile.classList.remove('connecting', 'reconnecting', 'failed');
        tile.classList.add('connected');
        entry.reconnectCount = 0;
        connectionStats.reconnectAttempts = 0;
        hideConnectionStatus();
        // Preemptively test connection health
        if (entry.healthCheckInterval) clearInterval(entry.healthCheckInterval);
        entry.healthCheckInterval = setInterval(() => testConnectionHealth(peerId), 10000);
        break;
      case 'disconnected':
        tile.classList.add('reconnecting');
        showConnectionStatus(`Reconnecting to ${peerId}...`, 'warning');
        // Start immediate reconnection attempt
        setTimeout(() => handlePeerDisconnection(peerId, false), 500);
        break;
      case 'failed':
        tile.classList.add('failed');
        showConnectionStatus(`Connection to ${peerId} failed`, 'error');
        // Attempt recovery after short delay
        setTimeout(() => handlePeerDisconnection(peerId, true), 1000);
        break;
    }
  };

  // ICE connection state handling
  pc.oniceconnectionstatechange = () => {
    const entry = state.peers.get(peerId);
    if (!entry) return;

    console.log(`ICE connection state for ${peerId}: ${pc.iceConnectionState}`);

    if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
      handlePeerDisconnection(peerId, pc.iceConnectionState === 'failed');
    }
  };

  // Create offer/answer with enhanced error handling
  if (initiator) {
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: isReconnect
      });
      await pc.setLocalDescription(offer);

      socket.emit('webrtc-offer', {
        targetId: peerId,
        offer: pc.localDescription,
        name: state.displayName,
        isReconnect,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Create offer failed:', error);
      notifyVideo('Connection setup failed', true);
    }
  }

  return pc;
}

// Data channel setup for heartbeat and status
function setupDataChannel(dataChannel, peerId) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  entry.dataChannel = dataChannel;

  dataChannel.onopen = () => {
    console.log(`Data channel opened for ${peerId}`);
    startHeartbeat(peerId);
  };

  dataChannel.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleDataChannelMessage(peerId, data);
    } catch (error) {
      console.error('Error parsing data channel message:', error);
    }
  };

  dataChannel.onerror = (error) => {
    console.error(`Data channel error for ${peerId}:`, error);
  };

  dataChannel.onclose = () => {
    console.log(`Data channel closed for ${peerId}`);
    stopHeartbeat(peerId);
  };
}

// Heartbeat mechanism for connection health
function startHeartbeat(peerId) {
  const entry = state.peers.get(peerId);
  if (!entry || !entry.dataChannel) return;

  entry.heartbeatInterval = setInterval(() => {
    if (entry.dataChannel && entry.dataChannel.readyState === 'open') {
      entry.dataChannel.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now(),
        sessionDuration: Date.now() - (connectionStats.connectionStartTime || Date.now())
      }));
    }
  }, 5000); // Send heartbeat every 5 seconds
}

function stopHeartbeat(peerId) {
  const entry = state.peers.get(peerId);
  if (entry && entry.heartbeatInterval) {
    clearInterval(entry.heartbeatInterval);
    entry.heartbeatInterval = null;
  }
}

// Handle data channel messages
function handleDataChannelMessage(peerId, data) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  switch (data.type) {
    case 'heartbeat':
      entry.lastHeartbeat = Date.now();
      connectionStats.lastHeartbeat = Date.now();
      break;
    case 'connectionQuality':
      updateConnectionQualityUI(peerId, data.quality);
      break;
    case 'audioLevel':
      updateAudioLevelUI(peerId, data.level);
      break;
  }
}

// Enhanced peer disconnection handling with auto-reconnect
async function handlePeerDisconnection(peerId, isFailed = false) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  // Don't attempt reconnect if we're already trying or if max attempts reached
  if (entry.reconnectCount >= connectionStats.maxReconnectAttempts) {
    console.log(`Max reconnection attempts reached for ${peerId}`);
    notifyVideo(`Connection to ${entry.name || 'peer'} lost`, true);
    return;
  }

  entry.reconnectCount++;
  const delay = connectionStats.reconnectDelay * Math.pow(2, entry.reconnectCount - 1); // Exponential backoff

  console.log(`Attempting to reconnect to ${peerId} (attempt ${entry.reconnectCount})`);
  notifyVideo(`Reconnecting to ${entry.name || 'peer'}... (${entry.reconnectCount}/${connectionStats.maxReconnectAttempts})`, false);

  // Wait before reconnect attempt
  setTimeout(async () => {
    try {
      // Close existing connection
      entry.pc.close();

      // Create new peer connection
      await createPeerConnection(peerId, entry.name, true, true);

    } catch (error) {
      console.error(`Reconnection attempt ${entry.reconnectCount} failed:`, error);

      // Try again if we haven't reached max attempts
      if (entry.reconnectCount < connectionStats.maxReconnectAttempts) {
        handlePeerDisconnection(peerId, isFailed);
      } else {
        notifyVideo(`Unable to reconnect to ${entry.name || 'peer'}`, true);
      }
    }
  }, delay);
}

// Monitor stream health
function monitorStreamHealth(stream, peerId) {
  const tracks = stream.getTracks();

  tracks.forEach(track => {
    track.addEventListener('ended', () => {
      console.log(`${track.kind} track ended for ${peerId}`);
      handleTrackEnded(peerId, track.kind);
    });

    track.addEventListener('mute', () => {
      console.log(`${track.kind} track muted for ${peerId}`);
      updateTrackStatusUI(peerId, track.kind, 'muted');
    });

    track.addEventListener('unmute', () => {
      console.log(`${track.kind} track unmuted for ${peerId}`);
      updateTrackStatusUI(peerId, track.kind, 'unmuted');
    });
  });
}

// Connection quality monitoring
function startConnectionMonitoring(peerId) {
  const entry = state.peers.get(peerId);
  if (!entry || entry.statsInterval) return;

  entry.statsInterval = setInterval(async () => {
    try {
      const stats = await entry.pc.getStats();
      analyzeConnectionStats(peerId, stats);
    } catch (error) {
      console.error(`Error getting stats for ${peerId}:`, error);
    }
  }, 10000); // Check every 10 seconds
}

function stopConnectionMonitoring(peerId) {
  const entry = state.peers.get(peerId);
  if (entry && entry.statsInterval) {
    clearInterval(entry.statsInterval);
    entry.statsInterval = null;
  }
}

// Analyze WebRTC stats for connection quality
function analyzeConnectionStats(peerId, stats) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  let packetsLost = 0;
  let packetsReceived = 0;
  let bytesReceived = 0;
  let audioLevel = 0;

  stats.forEach(report => {
    if (report.type === 'inbound-rtp') {
      packetsLost += report.packetsLost || 0;
      packetsReceived += report.packetsReceived || 0;
      bytesReceived += report.bytesReceived || 0;
    }

    if (report.type === 'media-source' && report.kind === 'audio') {
      audioLevel = report.audioLevel || 0;
    }
  });

  // Calculate connection quality
  const lossRate = packetsReceived > 0 ? packetsLost / (packetsLost + packetsReceived) : 0;
  let quality = 'excellent';

  if (lossRate > 0.05) {
    quality = 'poor';
  } else if (lossRate > 0.02) {
    quality = 'good';
  }

  // Update peer stats
  entry.stats = { bytesReceived, packetsLost, audioLevel };

  // Send quality info via data channel
  if (entry.dataChannel && entry.dataChannel.readyState === 'open') {
    entry.dataChannel.send(JSON.stringify({
      type: 'connectionQuality',
      quality,
      lossRate,
      timestamp: Date.now()
    }));
  }

  updateConnectionQualityUI(peerId, quality);
}

// UI Updates
function updatePeerUI(peerId, connectionState) {
  const tile = document.querySelector(`[data-peer="${peerId}"]`);
  if (!tile) return;

  // Remove all connection state classes
  tile.classList.remove('connecting', 'connected', 'reconnecting', 'failed');

  // Add current state class
  if (connectionState) {
    tile.classList.add(connectionState);
  }
}

function updateConnectionQualityUI(peerId, quality) {
  const tile = document.querySelector(`[data-peer="${peerId}"]`);
  if (!tile) return;

  // Remove previous quality classes
  tile.classList.remove('connection-excellent', 'connection-good', 'connection-poor');

  // Add current quality class
  tile.classList.add(`connection-${quality}`);

  // Update quality indicator if it exists
  let indicator = tile.querySelector('.connection-quality');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = `connection-quality connection-${quality}`;
    tile.appendChild(indicator);
  } else {
    indicator.className = `connection-quality connection-${quality}`;
  }
}

function updateTrackStatusUI(peerId, trackKind, status) {
  const tile = document.querySelector(`[data-peer="${peerId}"]`);
  if (!tile) return;

  tile.classList.toggle(`${trackKind}-${status}`, status === 'muted');
}

function updateAudioLevelUI(peerId, level) {
  const tile = document.querySelector(`[data-peer="${peerId}"]`);
  if (!tile) return;

  // Add speaking indicator based on audio level
  tile.classList.toggle('speaking', level > 0.01);
}

function handleTrackEnded(peerId, trackKind) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  console.log(`${trackKind} track ended for ${peerId}`);
  notifyVideo(`${entry.name || 'Peer'} ${trackKind} disconnected`, false);

  // Attempt to renegotiate if needed
  if (entry.pc.connectionState === 'connected') {
    // The peer may have just disabled their camera/microphone
    updateTrackStatusUI(peerId, trackKind, 'disabled');
  }
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

// Enhanced peer cleanup with proper resource management
function cleanupPeer(peerId) {
  const entry = state.peers.get(peerId);
  if (!entry) return;

  // Stop heartbeat
  stopHeartbeat(peerId);

  // Stop connection monitoring
  stopConnectionMonitoring(peerId);

  // Close data channel
  if (entry.dataChannel) {
    entry.dataChannel.close();
  }

  // Close peer connection
  if (entry.pc) {
    entry.pc.close();
  }

  // Clean up video element
  if (entry.videoEl) {
    entry.videoEl.srcObject = null;
  }

  // Remove from peers map
  state.peers.delete(peerId);

  // Remove UI tile
  removeRemoteTile(peerId);

  console.log(`Cleaned up peer: ${peerId}`);
}

// Session duration tracking and management
function initializeSessionTracking() {
  connectionStats.connectionStartTime = Date.now();

  // Update session duration every minute
  setInterval(() => {
    connectionStats.sessionDuration = Date.now() - connectionStats.connectionStartTime;
    updateSessionUI();

    // Check session limits (6 hours max)
    const maxSessionDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    if (connectionStats.sessionDuration > maxSessionDuration) {
      handleSessionTimeout();
    }
  }, 60000); // Update every minute
}

function updateSessionUI() {
  const duration = connectionStats.sessionDuration;
  const hours = Math.floor(duration / (60 * 60 * 1000));
  const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));

  const sessionDisplay = document.querySelector('.session-duration');
  if (sessionDisplay) {
    sessionDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Show warning at 5.5 hours
  if (duration > 5.5 * 60 * 60 * 1000 && !state.sessionWarningShown) {
    state.sessionWarningShown = true;
    notifyVideo('Session will end in 30 minutes due to 6-hour limit', true);
  }
}

function handleSessionTimeout() {
  notifyVideo('Session ended due to 6-hour time limit', true);

  // Gracefully close all connections
  state.peers.forEach((_, peerId) => {
    cleanupPeer(peerId);
  });

  // Redirect to home or show reconnect option
  setTimeout(() => {
    if (confirm(t('sessionExpired') + ' Would you like to start a new session?')) {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  }, 3000);
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

// Enhanced WebRTC handlers with better error handling and reconnect support
function setupWebRTCHandlers() {
  socket.on('webrtc-offer', async ({ from, name, offer, isReconnect, timestamp }) => {
    try {
      console.log(`Received offer from ${from} (reconnect: ${isReconnect})`);

      let peer = state.peers.get(from);
      if (!peer || isReconnect) {
        // Clean up existing peer if this is a reconnect
        if (peer && isReconnect) {
          cleanupPeer(from);
        }
        await createPeerConnection(from, name, false, isReconnect);
        peer = state.peers.get(from);
      }

      if (!peer || !peer.pc) {
        throw new Error('Failed to create peer connection');
      }

      await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peer.pc.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        targetId: from,
        answer: peer.pc.localDescription,
        isReconnect,
        timestamp: Date.now()
      });

      console.log(`Sent answer to ${from}`);

    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
      notifyVideo(`Connection error with ${name || 'peer'}`, true);
    }
  });

  socket.on('webrtc-answer', async ({ from, answer, isReconnect, timestamp }) => {
    const peer = state.peers.get(from);
    if (!peer || !peer.pc) {
      console.error(`No peer connection found for ${from}`);
      return;
    }

    try {
      console.log(`Received answer from ${from} (reconnect: ${isReconnect})`);
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`Set remote description for ${from}`);

    } catch (error) {
      console.error('Error handling WebRTC answer:', error);

      // Try to recover from this error
      if (peer.reconnectCount < connectionStats.maxReconnectAttempts) {
        console.log(`Attempting to recover connection with ${from}`);
        setTimeout(() => {
          handlePeerDisconnection(from, true);
        }, 1000);
      }
    }
  });

  socket.on('webrtc-candidate', async ({ from, candidate, timestamp }) => {
    const peer = state.peers.get(from);
    if (!peer || !peer.pc) {
      console.error(`No peer connection found for candidate from ${from}`);
      return;
    }

    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`Added ICE candidate from ${from}`);

    } catch (error) {
      // Don't log all ICE candidate errors as they're common during negotiation
      if (error.name !== 'InvalidStateError' && error.name !== 'InvalidAccessError') {
        console.error('Error adding ICE candidate:', error);
      }
    }
  });

  // Enhanced socket connection monitoring
  socket.on('connect', () => {
    console.log('Socket connected');
    connectionStats.lastHeartbeat = Date.now();
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    notifyVideo('Connection to server lost, attempting to reconnect...', true);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
    notifyVideo('Reconnected to server', false);

    // Refresh the meeting state after reconnection
    setTimeout(() => {
      if (state.displayName && state.meetingToken) {
        joinMeeting(state.displayName);
      }
    }, 1000);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection failed:', error);
    notifyVideo('Failed to reconnect to server', true);
  });
}

async function bootstrap() {
  if (!state.meetingToken) {
    notifyChat(t('invalidLink'), true);
    return;
  }

  // Initialize session tracking
  initializeSessionTracking();

  // Setup UI and event handlers
  document.documentElement.lang = currentLang;
  refreshStaticText();
  setupEventListeners();
  setupSocketHandlers();
  setupAssistantHandlers();
  setupWebRTCHandlers();
  setupControlsAutoHide();
  detectCameraFlipSupport();

  // Add session duration display to UI
  addSessionDurationDisplay();

  try {
    await prefetchMeeting();
    if (state.authToken && sessionStorage.getItem('username')) {
      joinMeeting(sessionStorage.getItem('username'));
    } else {
      showNameModal();
    }
  } catch (error) {
    console.error('Bootstrap error:', error);
    notifyChat(error.message || 'Failed to initialize meeting', true);
  }
}

// Add session duration display to the UI
function addSessionDurationDisplay() {
  const header = document.querySelector('.chat-header .header-info');
  if (header && !header.querySelector('.session-duration')) {
    const durationDisplay = document.createElement('div');
    durationDisplay.className = 'session-duration';
    durationDisplay.style.cssText = `
      font-size: 11px;
      color: var(--text-tertiary);
      font-weight: 500;
      margin-top: 2px;
    `;
    durationDisplay.textContent = '00:00';
    header.appendChild(durationDisplay);
  }
}

// ===== ENHANCED FUNCTIONALITY =====

// Call Timer
let callStartTime = null;
let timerInterval = null;

function startCallTimer() {
  callStartTime = Date.now();
  const timerEl = document.getElementById('callTimer');
  if (timerEl) {
    timerEl.classList.remove('hidden');

    timerInterval = setInterval(() => {
      const elapsed = Date.now() - callStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
}

function stopCallTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const timerEl = document.getElementById('callTimer');
  if (timerEl) {
    timerEl.classList.add('hidden');
  }
  callStartTime = null;
}

// Video Drag & Drop
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

function initDragAndDrop() {
  const localVideo = document.querySelector('.video-wrapper.self');
  if (localVideo) {
    localVideo.addEventListener('mousedown', startDrag);
    localVideo.addEventListener('touchstart', startDrag, { passive: false });
  }

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  const wrapper = e.currentTarget;
  if (!wrapper.classList.contains('self')) return;

  isDragging = true;
  wrapper.style.cursor = 'grabbing';

  const rect = wrapper.getBoundingClientRect();
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  dragOffset.x = clientX - rect.left;
  dragOffset.y = clientY - rect.top;

  e.preventDefault();
}

function drag(e) {
  if (!isDragging) return;

  const wrapper = document.querySelector('.video-wrapper.self');
  const videoStage = document.getElementById('videoStage');
  if (!wrapper || !videoStage) return;

  const stageRect = videoStage.getBoundingClientRect();
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  let newX = clientX - stageRect.left - dragOffset.x;
  let newY = clientY - stageRect.top - dragOffset.y;

  // Constrain within video stage
  const wrapperWidth = 120;
  const wrapperHeight = 160;
  newX = Math.max(16, Math.min(newX, stageRect.width - wrapperWidth - 16));
  newY = Math.max(80, Math.min(newY, stageRect.height - wrapperHeight - 16));

  wrapper.style.left = newX + 'px';
  wrapper.style.top = newY + 'px';
  wrapper.style.right = 'auto';

  e.preventDefault();
}

function endDrag() {
  if (!isDragging) return;

  isDragging = false;
  const wrapper = document.querySelector('.video-wrapper.self');
  if (wrapper) {
    wrapper.style.cursor = 'move';
  }
}

// Enhanced Modal System
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Enhanced Emotion System
function showEmotionPalette() {
  openModal('emotionPalette');
  populateEmotionGrid();
}

function showEmojiPalette() {
  openModal('emojiPalette');
  populateEmojiGrid();
}

function populateEmotionGrid() {
  const grid = document.getElementById('emotionGrid');
  if (!grid) return;

  grid.innerHTML = '';

  EMOTION_CATALOG.forEach(emotion => {
    const button = document.createElement('button');
    button.className = 'emotion-chip';
    button.style.borderColor = emotion.color;
    button.textContent = emotion.labels[state.language] || emotion.labels.en;
    button.addEventListener('click', () => {
      selectEmotion(emotion.key);
      closeModal('emotionPalette');
    });
    grid.appendChild(button);
  });
}

function populateEmojiGrid() {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;

  grid.innerHTML = '';

  EMOJI_SET.forEach(emoji => {
    const button = document.createElement('button');
    button.className = 'emoji-btn';
    button.textContent = emoji;
    button.addEventListener('click', () => {
      sendEmoji(emoji);
      closeModal('emojiPalette');
    });
    grid.appendChild(button);
  });
}

function selectEmotion(emotionKey) {
  socket.emit('emotion-signal', { emotion: emotionKey });
  showNotification('Emotion sent!', 'success');
}

function sendEmoji(emoji) {
  const messageText = emoji;
  socket.emit('chat-message', { text: messageText, isEmoji: true });
}

// Enhanced Test System with AI Generation
function openTestOverlay() {
  openModal('testOverlay');
  populateTestContent();
}

function populateTestContent() {
  const content = document.getElementById('testOverlayContent');
  if (!content) return;

  content.innerHTML = `
    <div class="test-generation">
      <h3>AI Test Generator</h3>
      <textarea id="testPrompt" placeholder="Describe what kind of sociometric test you want to generate..." rows="3"></textarea>
      <button id="generateTestBtn" class="primary">Generate Test</button>
    </div>
    <div class="test-list" id="testList">
      <h4>Available Tests</h4>
      <div class="test-item" data-test="pulse">
        <h5>Pulse Check</h5>
        <p>Quick 3-minute mood and energy assessment</p>
        <button class="start-test" data-duration="180">Start</button>
      </div>
      <div class="test-item" data-test="focus">
        <h5>Focus Scan</h5>
        <p>5-minute attention and engagement evaluation</p>
        <button class="start-test" data-duration="300">Start</button>
      </div>
      <div class="test-item" data-test="resonance">
        <h5>Group Resonance</h5>
        <p>5-minute team harmony analysis</p>
        <button class="start-test" data-duration="300">Start</button>
      </div>
    </div>
  `;

  // Add event listeners
  const generateBtn = document.getElementById('generateTestBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateAITest);
  }

  document.querySelectorAll('.start-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const duration = parseInt(e.target.dataset.duration);
      const testType = e.target.closest('.test-item').dataset.test;
      startSociometricTest(testType, duration);
    });
  });
}

async function generateAITest() {
  const prompt = document.getElementById('testPrompt').value;
  if (!prompt.trim()) return;

  showNotification('Generating test...', 'info');

  // Simulate AI generation (would connect to actual AI service)
  setTimeout(() => {
    const generatedTest = {
      id: Date.now(),
      title: `AI Generated: ${prompt.substring(0, 30)}...`,
      description: `Custom test based on: "${prompt}"`,
      questions: generateTestQuestions(prompt),
      duration: 240
    };

    addGeneratedTest(generatedTest);
    showNotification('Test generated successfully!', 'success');
  }, 2000);
}

function generateTestQuestions(prompt) {
  // Simplified test generation - would use actual AI
  const baseQuestions = [
    { text: `How relevant is this topic: "${prompt}"?`, type: 'scale', scale: 5 },
    { text: 'How engaged do you feel right now?', type: 'scale', scale: 5 },
    { text: 'Any additional thoughts?', type: 'text' }
  ];

  return baseQuestions;
}

function addGeneratedTest(test) {
  const testList = document.getElementById('testList');
  if (!testList) return;

  const testItem = document.createElement('div');
  testItem.className = 'test-item generated';
  testItem.innerHTML = `
    <h5>${test.title}</h5>
    <p>${test.description}</p>
    <button class="start-test" data-test-id="${test.id}">Start (${Math.floor(test.duration / 60)}min)</button>
  `;

  testList.appendChild(testItem);

  testItem.querySelector('.start-test').addEventListener('click', () => {
    startCustomTest(test);
  });
}

function startSociometricTest(testType, duration) {
  socket.emit('start-sociometric-test', { testType, duration });
  closeModal('testOverlay');
  showNotification('Test started!', 'success');
}

function startCustomTest(test) {
  socket.emit('start-custom-test', test);
  closeModal('testOverlay');
  showNotification('Custom test started!', 'success');
}

function showNotification(message, type = 'info') {
  // Simple notification system
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Enhanced Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Side controls
  const sideVideoToggle = document.getElementById('sideVideoToggle');
  const sideAudioToggle = document.getElementById('sideAudioToggle');

  if (sideVideoToggle) sideVideoToggle.addEventListener('click', () => toggleVideo());
  if (sideAudioToggle) sideAudioToggle.addEventListener('click', () => toggleAudio());

  // Modal close buttons
  const emotionPaletteClose = document.getElementById('emotionPaletteClose');
  const emojiPaletteClose = document.getElementById('emojiPaletteClose');
  const testOverlayClose = document.getElementById('testOverlayClose');
  const participantsDrawerClose = document.getElementById('participantsDrawerClose');
  const emotionOverlayClose = document.getElementById('emotionOverlayClose');

  if (emotionPaletteClose) emotionPaletteClose.addEventListener('click', () => closeModal('emotionPalette'));
  if (emojiPaletteClose) emojiPaletteClose.addEventListener('click', () => closeModal('emojiPalette'));
  if (testOverlayClose) testOverlayClose.addEventListener('click', () => closeModal('testOverlay'));
  if (participantsDrawerClose) participantsDrawerClose.addEventListener('click', () => closeModal('participantsDrawer'));
  if (emotionOverlayClose) emotionOverlayClose.addEventListener('click', () => closeModal('emotionOverlay'));

  // Enhanced button functionality
  const emotionPanelBtn = document.getElementById('emotionPanelBtn');
  const emojiPaletteBtn = document.getElementById('emojiPaletteBtn');
  const testsBtn = document.getElementById('testsBtn');
  const openParticipantsBtn = document.getElementById('openParticipantsBtn');
  const profileDrawerBtn = document.getElementById('profileDrawerBtn');

  if (emotionPanelBtn) emotionPanelBtn.addEventListener('click', showEmotionPalette);
  if (emojiPaletteBtn) emojiPaletteBtn.addEventListener('click', showEmojiPalette);
  if (testsBtn) testsBtn.addEventListener('click', openTestOverlay);
  if (openParticipantsBtn) openParticipantsBtn.addEventListener('click', () => openModal('participantsDrawer'));
  if (profileDrawerBtn) profileDrawerBtn.addEventListener('click', () => openModal('participantsDrawer'));

  // Panel tab switching
  const panelTabs = document.querySelectorAll('.panel-tab');
  panelTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetPaneId = e.target.dataset.target;
      if (targetPaneId) {
        // Remove active class from all tabs and panes
        panelTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked tab and corresponding pane
        e.target.classList.add('active');
        const targetPane = document.getElementById(targetPaneId);
        if (targetPane) targetPane.classList.add('active');
      }
    });
  });

  // Inline emoji button
  const emojiBtnInline = document.getElementById('emojiBtnInline');
  if (emojiBtnInline) emojiBtnInline.addEventListener('click', showEmojiPalette);

  // Video pagination buttons
  const videoPrevPage = document.getElementById('videoPrevPage');
  const videoNextPage = document.getElementById('videoNextPage');
  if (videoPrevPage) videoPrevPage.addEventListener('click', () => changePage(-1));
  if (videoNextPage) videoNextPage.addEventListener('click', () => changePage(1));

  // Initialize drag and drop
  setTimeout(initDragAndDrop, 1000);

  // Enhanced chat input functionality
  initEnhancedChatInput();

  // Initialize mobile features
  initMobileFeatures();

  // Start timer when joining meeting
  setTimeout(() => {
    if (state.inMeeting) {
      startCallTimer();
    }
  }, 2000);
});

// ===== ULTRA-STABLE CONNECTION FUNCTIONS =====

// Test connection health
function testConnectionHealth(peerId) {
  const entry = state.peers.get(peerId);
  if (!entry || !entry.pc) return;

  const pc = entry.pc;
  if (pc.connectionState === 'connected') {
    // Test if data channel is still working
    if (entry.dataChannel && entry.dataChannel.readyState === 'open') {
      try {
        entry.dataChannel.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } catch (err) {
        console.warn(`Health check failed for ${peerId}:`, err);
        handlePeerDisconnection(peerId, false);
      }
    }
  }
}

// Show connection status with better UX
let statusTimeout;
function showConnectionStatus(message, type = 'info') {
  const statusEl = document.getElementById('videoNotice') || document.getElementById('chatNotice');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `banner ${type}`;
  statusEl.classList.remove('hidden');

  clearTimeout(statusTimeout);
  if (type === 'info') {
    statusTimeout = setTimeout(hideConnectionStatus, 3000);
  }
}

function hideConnectionStatus() {
  const statusEl = document.getElementById('videoNotice') || document.getElementById('chatNotice');
  if (statusEl) {
    statusEl.classList.add('hidden');
  }
}

// Enhanced error handling for all buttons
function handleButtonError(buttonId, error) {
  console.error(`Button ${buttonId} error:`, error);
  showConnectionStatus(`Action failed. Please try again.`, 'error');

  // Add error state to button
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.add('error-state');
    setTimeout(() => button.classList.remove('error-state'), 2000);
  }
}

// Enhanced chat input with auto-resize and emoji integration
function initEnhancedChatInput() {
  const chatInput = document.getElementById('chatInput');
  const emojiBtnInline = document.getElementById('emojiBtnInline');
  const sendBtn = document.getElementById('sendBtn');

  if (!chatInput) return;

  // Auto-resize textarea
  function autoResize() {
    chatInput.style.height = 'auto';
    const maxHeight = 120;
    const newHeight = Math.min(chatInput.scrollHeight, maxHeight);
    chatInput.style.height = newHeight + 'px';

    // Update parent container
    const inputGroup = chatInput.closest('.chat-input-group');
    if (inputGroup) {
      inputGroup.style.alignItems = newHeight > 44 ? 'flex-end' : 'center';
    }
  }

  // Enhanced emoji insertion
  function insertEmoji(emoji) {
    const start = chatInput.selectionStart;
    const end = chatInput.selectionEnd;
    const text = chatInput.value;

    chatInput.value = text.substring(0, start) + emoji + text.substring(end);
    chatInput.setSelectionRange(start + emoji.length, start + emoji.length);
    chatInput.focus();
    autoResize();
  }

  // Event listeners
  chatInput.addEventListener('input', autoResize);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.value.trim()) {
        sendBtn.click();
      }
    }
  });

  // Enhanced emoji button with quick emoji picker
  if (emojiBtnInline) {
    let emojiQuickPicker = null;

    emojiBtnInline.addEventListener('click', (e) => {
      e.preventDefault();

      // Create quick emoji picker
      if (!emojiQuickPicker) {
        emojiQuickPicker = createQuickEmojiPicker();
      }

      // Position and show
      const rect = emojiBtnInline.getBoundingClientRect();
      emojiQuickPicker.style.left = rect.left + 'px';
      emojiQuickPicker.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
      emojiQuickPicker.classList.toggle('hidden');
    });
  }

  // Create quick emoji picker
  function createQuickEmojiPicker() {
    const picker = document.createElement('div');
    picker.className = 'quick-emoji-picker hidden';
    picker.innerHTML = `
      <div class="emoji-row">
        ${['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'].map(emoji =>
          `<button class="quick-emoji" data-emoji="${emoji}">${emoji}</button>`
        ).join('')}
      </div>
      <div class="emoji-row">
        ${['🎉', '🔥', '💯', '✨', '🤔', '👌', '🙌', '💪'].map(emoji =>
          `<button class="quick-emoji" data-emoji="${emoji}">${emoji}</button>`
        ).join('')}
      </div>
      <button class="emoji-more" id="emojiMoreBtn">More emojis...</button>
    `;

    // Add event listeners
    picker.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-emoji')) {
        insertEmoji(e.target.dataset.emoji);
        picker.classList.add('hidden');
      } else if (e.target.id === 'emojiMoreBtn') {
        showEmojiPalette();
        picker.classList.add('hidden');
      }
    });

    document.body.appendChild(picker);

    // Hide on outside click
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target) && !emojiBtnInline.contains(e.target)) {
        picker.classList.add('hidden');
      }
    });

    return picker;
  }

  // Initial resize
  autoResize();
}

// Initialize mobile-specific features
function initMobileFeatures() {
  // Mobile chat toggle
  const mobileChatToggle = document.getElementById('mobileChatToggle');
  const mobileChatOverlay = document.getElementById('mobileChatOverlay');
  const mobileChatInput = document.getElementById('mobileChatInput');
  const mobileChatSend = document.getElementById('mobileChatSend');
  const mobileChatMessages = document.getElementById('mobileChatMessages');

  if (mobileChatToggle && mobileChatOverlay) {
    mobileChatToggle.addEventListener('click', () => {
      mobileChatOverlay.classList.toggle('visible');
      if (mobileChatOverlay.classList.contains('visible')) {
        mobileChatInput.focus();
      }
    });
  }

  // Mobile chat send
  if (mobileChatSend && mobileChatInput) {
    const sendMessage = () => {
      const message = mobileChatInput.value.trim();
      if (message) {
        // Add message to UI
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mobile-chat-message own';
        messageDiv.textContent = message;
        mobileChatMessages.appendChild(messageDiv);

        // Send via socket
        socket.emit('chat-message', {
          text: message,
          isAnonymous: false,
          timestamp: Date.now()
        });

        mobileChatInput.value = '';
        mobileChatMessages.scrollTop = mobileChatMessages.scrollHeight;
      }
    };

    mobileChatSend.addEventListener('click', sendMessage);
    mobileChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // 3-dot menu overlay
  const testsBtn = document.getElementById('testsBtn');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  if (testsBtn && mobileMenuOverlay) {
    testsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenuOverlay.classList.add('visible');
    });

    // Close menu on background click
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('visible');
      }
    });
  }

  // Menu option handlers
  const mobileEmotionsBtn = document.getElementById('mobileEmotionsBtn');
  const mobileEmojiBtn = document.getElementById('mobileEmojiBtn');
  const mobilePollsBtn = document.getElementById('mobilePollsBtn');
  const mobileParticipantsBtn = document.getElementById('mobileParticipantsBtn');

  if (mobileEmotionsBtn) {
    mobileEmotionsBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('visible');
      showEmotionPalette();
    });
  }

  if (mobileEmojiBtn) {
    mobileEmojiBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('visible');
      showEmojiPalette();
    });
  }

  if (mobilePollsBtn) {
    mobilePollsBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('visible');
      openTestOverlay();
    });
  }

  if (mobileParticipantsBtn) {
    mobileParticipantsBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('visible');
      openModal('participantsDrawer');
    });
  }

  // Handle incoming chat messages
  socket.on('chat-message', (data) => {
    if (mobileChatMessages) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mobile-chat-message';
      messageDiv.textContent = `${data.sender}: ${data.text}`;
      mobileChatMessages.appendChild(messageDiv);
      mobileChatMessages.scrollTop = mobileChatMessages.scrollHeight;
    }
  });
}

bootstrap();
