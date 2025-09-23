const socket = io();

const translations = {
  en: {
    appTitle: 'Kaminskyi AI Messenger',
    waitingSubtitle: 'Preparing meeting…',
    hostSubtitle: (host) => `Host: ${host}`,
    linkReady: (token, capacity) => `Meeting link ready: ${token} · Capacity ${capacity}`,
    docTitle: (host) => `Kaminskyi AI Messenger — Meeting with ${host}`,
    copyLink: 'Copy invite link',
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
  participantNames: new Set(),
  peers: new Map(),
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
  endMeetingBtn: document.getElementById('endMeetingBtn'),
  leaveBtn: document.getElementById('leaveBtn'),
  roleBadge: document.getElementById('roleBadge'),
  participants: document.getElementById('participants'),
  videoGrid: document.getElementById('videoGrid'),
  localContainer: document.getElementById('localContainer'),
  localVideo: document.getElementById('localVideo'),
  localPlaceholder: document.getElementById('localPlaceholder'),
  localLabel: document.getElementById('localLabel'),
  videoNotice: document.getElementById('videoNotice'),
  chatHeading: document.getElementById('chatHeading'),
  chatStatus: document.getElementById('chatStatus'),
  assistantToolbar: document.getElementById('assistantToolbar'),
  assistantToggleBtn: document.getElementById('assistantToggleBtn'),
  assistantSearchToggle: document.getElementById('assistantSearchToggle'),
  assistantSearchLabel: document.getElementById('assistantSearchLabel'),
  messages: document.getElementById('messages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  sendBtn: document.getElementById('sendBtn'),
  chatNotice: document.getElementById('chatNotice'),
};

let currentLang = localStorage.getItem('kaminskyi-lang') || 'en';
if (!translations[currentLang]) currentLang = 'en';
ui.languageChoice.value = currentLang;

function t(key, ...args) {
  const value = translations[currentLang][key];
  return typeof value === 'function' ? value(...args) : value;
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
  const names = Array.from(state.participantNames)
    .concat(state.displayName ? [state.displayName] : [])
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  names.forEach((name) => {
    const tag = document.createElement('span');
    tag.className = 'participant-tag';
    const color = hashColor(name);
    tag.style.background = `${color}22`;
    tag.style.borderColor = `${color}66`;
    tag.textContent = name;
    ui.participants.appendChild(tag);
  });
  if (state.maxParticipants) {
    const hint = document.createElement('span');
    hint.className = 'participant-tag';
    hint.textContent = t('capacityHint', state.maxParticipants);
    hint.style.background = 'rgba(148, 163, 184, 0.15)';
    hint.style.borderColor = 'rgba(148, 163, 184, 0.25)';
    ui.participants.appendChild(hint);
  }
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

function createMessageElement({ sender, text, ts, requestId }, { streaming = false } = {}) {
  const message = document.createElement('div');
  const isSelf = sender === state.displayName;
  const isAssistant = sender === state.assistantName;
  message.className = 'message fade';
  if (isSelf) message.classList.add('self');
  if (isAssistant) message.classList.add('assistant');
  if (streaming) message.classList.add('streaming');
  message.dataset.sender = sender;
  message.dataset.timestamp = ts;
  if (requestId) message.dataset.requestId = requestId;
  const color = hashColor(sender);
  message.style.setProperty('--message-accent', color);

  const header = document.createElement('div');
  header.className = 'message-header';
  header.innerHTML = `<strong>${sender}</strong><span>${formatTime(ts)}</span>`;

  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;

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
    return state.localStream;
  } catch (error) {
    notifyVideo(t('mediaPermissionDenied'), true);
    throw error;
  }
}

function getAudioEnabled() {
  return !!(state.localStream && state.localStream.getAudioTracks().some((track) => track.enabled));
}

function getVideoEnabled() {
  return !!(state.localStream && state.localStream.getVideoTracks().some((track) => track.enabled));
}

function toggleAudio() {
  if (!state.localStream) return;
  const enable = !getAudioEnabled();
  state.localStream.getAudioTracks().forEach((track) => {
    track.enabled = enable;
  });
  ui.muteBtn.textContent = enable ? t('mute') : t('unmute');
}

function toggleVideo() {
  if (!state.localStream) return;
  const enable = !getVideoEnabled();
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
    state.participantNames = new Set(data.participants || []);
    ui.meetingSubtitle.textContent = t('hostSubtitle', state.meetingHost);
    renderParticipants();
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

  socket.on('meeting-joined', async ({ meeting, participants, peers, isHost, self }) => {
    state.isHost = isHost;
    state.displayName = self;
    state.maxParticipants = meeting.maxParticipants || state.maxParticipants;
    state.meetingHost = meeting.host;
    state.participantNames = new Set(participants || []);
    state.participantNames.add(self);
    state.hasJoined = true;
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
        state.participantNames.add(peer.name || 'Guest');
        await createPeerConnection(peer.socketId, peer.name || 'Guest', true);
      }
    }
  });

  socket.on('participant-joined', ({ name, socketId }) => {
    state.participantNames.add(name);
    renderParticipants();
    notifyChat(t('participantJoined', name));
  });

  socket.on('participant-left', ({ name, socketId }) => {
    state.participantNames.delete(name);
    renderParticipants();
    notifyChat(t('participantLeft', name));
    cleanupPeer(socketId);
  });

  socket.on('message', (message) => {
    if (maybeSkipAssistantMessage(message)) return;
    appendMessage(message);
  });

  socket.on('chat-error', ({ message }) => {
    notifyChat(message || t('chatSendFailed'), true);
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
