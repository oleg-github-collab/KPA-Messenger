const socket = io();

const translations = {
  en: {
    appTitle: 'Kaminskyi AI Messenger',
    waitingSubtitle: 'Preparing meeting…',
    hostSubtitle: (host) => `Host: ${host}`,
    linkReady: (token) => `Meeting link ready: ${token}`,
    docTitle: (host) => `Kaminskyi AI Messenger — Meeting with ${host}`,
    copyLink: 'Copy invite link',
    pip: 'Mini view',
    pipActive: 'Exit mini view',
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
    localPlaceholder: 'Your preview (mirrored)',
    chatHeading: 'Chat',
    chatStatusIdle: 'Chat ready. Messages stay inside this meeting.',
    chatStatusWaiting: 'Waiting to join…',
    chatInputPlaceholder: 'Type a message',
    send: 'Send',
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
    remoteConnected: 'Remote participant connected.',
    remoteLeft: 'Remote participant left the call.',
    reconnection: 'Connection lost. Waiting for reconnection…',
    enableMedia: 'Enable camera and microphone to start the call.',
    mediaPermissionDenied: 'Camera or microphone permission denied.',
  },
  uk: {
    appTitle: 'Камінський AI Месенджер',
    waitingSubtitle: 'Підготовка зустрічі…',
    hostSubtitle: (host) => `Хост: ${host}`,
    linkReady: (token) => `Посилання на зустріч: ${token}`,
    docTitle: (host) => `Камінський AI Месенджер — зустріч з ${host}`,
    copyLink: 'Скопіювати запрошення',
    pip: 'Міні-вікно',
    pipActive: 'Закрити міні-вікно',
    pipUnsupported: 'Міні-вікно не підтримується на цьому пристрої.',
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
    localPlaceholder: 'Ваш попередній перегляд (дзеркально)',
    chatHeading: 'Чат',
    chatStatusIdle: 'Чат готовий. Повідомлення залишаються в межах цієї зустрічі.',
    chatStatusWaiting: 'Очікуємо приєднання…',
    chatInputPlaceholder: 'Введіть повідомлення',
    send: 'Надіслати',
    nameModalTitle: 'Введіть ім’я',
    nameModalText: 'Це одноразове посилання потребує відображуваного імені для всіх учасників.',
    nameSubmit: 'Приєднатися',
    nameRequired: 'Потрібно вказати ім’я.',
    invalidLink: 'Невірне посилання на зустріч.',
    meetingUnavailable: 'Зустріч недоступна.',
    linkCopied: 'Посилання скопійовано.',
    linkCopyError: 'Не вдалося скопіювати автоматично. Скопіюйте вручну.',
    clipboardUnavailable: 'Доступ до буфера обміну недоступний. Скопіюйте з адресного рядка.',
    unableToJoin: 'Не вдалося приєднатися до зустрічі.',
    unableToEnd: 'Не вдалося завершити зустріч.',
    chatJoinRequired: 'Спочатку приєднайтесь до зустрічі.',
    chatSendFailed: 'Не вдалося надіслати повідомлення.',
    meetingEnded: 'Зустріч завершено. Можете закрити вкладку.',
    joined: 'Ви приєдналися до зустрічі.',
    participantJoined: (name) => `${name} приєднався(-лася) до зустрічі.`,
    participantLeft: (name) => `${name} покинув(-ла) зустріч.`,
    remoteConnected: 'Віддалений учасник під’єднався.',
    remoteLeft: 'Віддалений учасник покинув дзвінок.',
    reconnection: 'Зв’язок втрачено. Очікуємо повторне підключення…',
    enableMedia: 'Увімкніть камеру та мікрофон, щоб розпочати дзвінок.',
    mediaPermissionDenied: 'Доступ до камери чи мікрофона заборонено.',
  },
};

const state = {
  meetingToken: new URLSearchParams(window.location.search).get('room'),
  authToken: sessionStorage.getItem('authToken') || null,
  displayName: '',
  isHost: false,
  participants: new Set(),
  localStream: null,
  remoteStream: null,
  pc: null,
  mediaAdded: false,
  callActive: false,
  joining: false,
  leaving: false,
  pipActive: false,
  meetingHost: null,
  meetingSubtitle: { key: 'waitingSubtitle', args: [] },
  chatStatus: { key: 'chatStatusWaiting', args: [] },
  hasJoined: false,
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
  pipBtn: document.getElementById('pipBtn'),
  muteBtn: document.getElementById('muteBtn'),
  videoBtn: document.getElementById('videoBtn'),
  endMeetingBtn: document.getElementById('endMeetingBtn'),
  leaveBtn: document.getElementById('leaveBtn'),
  roleBadge: document.getElementById('roleBadge'),
  participants: document.getElementById('participants'),
  remoteVideo: document.getElementById('remoteVideo'),
  localVideo: document.getElementById('localVideo'),
  remotePlaceholder: document.getElementById('remotePlaceholder'),
  localPlaceholder: document.getElementById('localPlaceholder'),
  remoteWrapper: document.querySelector('.video-wrapper.remote'),
  localWrapper: document.querySelector('.video-wrapper.local'),
  videoNotice: document.getElementById('videoNotice'),
  messages: document.getElementById('messages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatNotice: document.getElementById('chatNotice'),
  chatHeading: document.getElementById('chatHeading'),
  chatStatus: document.getElementById('chatStatus'),
  sendBtn: document.getElementById('sendBtn'),
};

let currentLang = localStorage.getItem('kaminskyi-lang') || 'en';
if (!translations[currentLang]) currentLang = 'en';
ui.languageChoice.value = currentLang;

ui.remoteWrapper.classList.add('idle');
ui.localWrapper.classList.add('idle');

function t(key, ...args) {
  const value = translations[currentLang][key];
  return typeof value === 'function' ? value(...args) : value;
}

function setMeetingSubtitle(key, ...args) {
  state.meetingSubtitle = { key, args };
  ui.meetingSubtitle.textContent = t(key, ...args);
  updateDocumentTitle();
}

function setChatStatus(key, ...args) {
  state.chatStatus = { key, args };
  ui.chatStatus.textContent = t(key, ...args);
}

function updateDocumentTitle() {
  if (state.meetingHost) {
    document.title = t('docTitle', state.meetingHost);
  } else {
    document.title = t('appTitle');
  }
}

function refreshParticipants() {
  ui.participants.innerHTML = '';
  [...state.participants]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .forEach((name) => {
      const tag = document.createElement('span');
      tag.className = 'participant-tag';
      tag.textContent = name;
      ui.participants.appendChild(tag);
    });
}

function updateBadge() {
  refreshActionButtons();
}

function refreshActionButtons() {
  ui.chatTitle.textContent = t('appTitle');
  ui.copyLinkBtn.textContent = t('copyLink');
  ui.pipBtn.textContent = state.pipActive ? t('pipActive') : t('pip');
  ui.muteBtn.textContent = getAudioEnabled() ? t('mute') : t('unmute');
  ui.videoBtn.textContent = getVideoEnabled() ? t('stopVideo') : t('startVideo');
  ui.endMeetingBtn.textContent = t('endMeeting');
  ui.leaveBtn.textContent = t('leave');
  const badgeText = state.hasJoined
    ? (state.isHost ? t('hostBadge') : t('guestBadge'))
    : t('connectingBadge');
  ui.roleBadge.textContent = badgeText;
  ui.chatHeading.textContent = t('chatHeading');
  ui.chatInput.placeholder = t('chatInputPlaceholder');
  ui.sendBtn.textContent = t('send');
  ui.nameModalTitle.textContent = t('nameModalTitle');
  ui.nameModalText.textContent = t('nameModalText');
  ui.nameSubmit.textContent = t('nameSubmit');
  ui.remotePlaceholder.textContent = t('remotePlaceholder');
  ui.localPlaceholder.textContent = t('localPlaceholder');
  ui.chatStatus.textContent = t(state.chatStatus.key, ...state.chatStatus.args);
  ui.meetingSubtitle.textContent = t(state.meetingSubtitle.key, ...state.meetingSubtitle.args);
  updateDocumentTitle();
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('kaminskyi-lang', lang);
  document.documentElement.lang = lang;
  refreshActionButtons();
}

ui.languageChoice.addEventListener('change', (event) => {
  setLanguage(event.target.value);
});

function showFatal(message) {
  ui.chatNotice.textContent = message;
  ui.chatNotice.classList.remove('hidden');
  ui.chatNotice.classList.add('error');
  toggleForm(false);
  toggleControls(false);
  ui.roleBadge.textContent = t('connectingBadge');
  if (!ui.nameModal.classList.contains('hidden')) {
    ui.nameModal.classList.add('hidden');
  }
}

function toggleForm(enabled) {
  ui.chatInput.disabled = !enabled;
  ui.sendBtn.disabled = !enabled;
}

function toggleControls(enabled) {
  ui.copyLinkBtn.disabled = !enabled;
  ui.pipBtn.disabled = !enabled;
  ui.muteBtn.disabled = !enabled;
  ui.videoBtn.disabled = !enabled;
  if (state.isHost) {
    ui.endMeetingBtn.disabled = !enabled;
  } else {
    ui.endMeetingBtn.disabled = true;
  }
  ui.leaveBtn.disabled = false;
}

async function prefetchMeeting() {
  try {
    const response = await fetch(`/api/meetings/${encodeURIComponent(state.meetingToken)}`);
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.message || t('meetingUnavailable'));
    }

    const meeting = data.meeting;
    state.meetingHost = meeting.host;
    setMeetingSubtitle('hostSubtitle', meeting.host);
    state.participants = new Set(data.participants);
    refreshParticipants();
  } catch (error) {
    showFatal(error.message || t('meetingUnavailable'));
    throw error;
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

function appendMessage(message, isSelf = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `message fade${isSelf ? ' self' : ''}`;

  const header = document.createElement('div');
  header.className = 'message-header';
  header.innerHTML = `<strong>${message.sender}</strong><span>${formatTime(message.ts)}</span>`;

  const body = document.createElement('div');
  body.textContent = message.text;

  wrapper.appendChild(header);
  wrapper.appendChild(body);
  ui.messages.appendChild(wrapper);
  ui.messages.scrollTop = ui.messages.scrollHeight;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadHistory() {
  try {
    const response = await fetch(`/api/messages/${encodeURIComponent(state.meetingToken)}`);
    const data = await response.json();
    if (!response.ok || !data.ok) return;
    data.messages.forEach((msg) => appendMessage(msg, msg.sender === state.displayName));
  } catch (error) {
    console.warn('Unable to load history', error);
  }
}

async function ensurePeerConnection() {
  if (state.pc) return state.pc;

  state.pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  state.pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-candidate', event.candidate);
    }
  };

  state.pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      state.remoteStream = stream;
      ui.remoteVideo.srcObject = stream;
      ui.remoteWrapper.classList.remove('idle');
      notifyVideo(t('remoteConnected'));
    }
  };

  state.pc.onconnectionstatechange = () => {
    if (['disconnected', 'failed'].includes(state.pc.connectionState)) {
      state.callActive = false;
      notifyVideo(t('reconnection'), true);
    }
  };

  await ensureLocalStream();
  if (!state.mediaAdded && state.localStream) {
    state.localStream.getTracks().forEach((track) => state.pc.addTrack(track, state.localStream));
    state.mediaAdded = true;
  }

  return state.pc;
}

async function ensureLocalStream() {
  if (state.localStream) return state.localStream;
  try {
    state.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    ui.localVideo.srcObject = state.localStream;
    ui.localWrapper.classList.remove('idle');
    refreshActionButtons();
    return state.localStream;
  } catch (error) {
    ui.localWrapper.classList.add('idle');
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

async function startOffer() {
  try {
    const pc = await ensurePeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', offer);
    state.callActive = true;
  } catch (error) {
    console.error('Failed to create offer', error);
  }
}

async function handleRemoteOffer(offer) {
  try {
    const pc = await ensurePeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc-answer', answer);
    state.callActive = true;
  } catch (error) {
    console.error('Failed to handle remote offer', error);
  }
}

async function handleRemoteAnswer(answer) {
  if (!state.pc) return;
  try {
    await state.pc.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Failed to handle remote answer', error);
  }
}

async function handleRemoteCandidate(candidate) {
  if (!state.pc) return;
  try {
    await state.pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Failed to add ICE candidate', error);
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

function toggleAudio() {
  if (!state.localStream) return;
  const enable = !getAudioEnabled();
  state.localStream.getAudioTracks().forEach((track) => {
    track.enabled = enable;
  });
  refreshActionButtons();
}

function toggleVideo() {
  if (!state.localStream) return;
  const enable = !getVideoEnabled();
  state.localStream.getVideoTracks().forEach((track) => {
    track.enabled = enable;
  });
  refreshActionButtons();
}

async function endMeeting() {
  if (!state.isHost || !state.authToken) return;
  try {
    const response = await fetch(`/api/meetings/${encodeURIComponent(state.meetingToken)}/end`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.authToken}`,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: t('unableToEnd') }));
      throw new Error(data.message || t('unableToEnd'));
    }
    handleMeetingEnded();
  } catch (error) {
    notifyChat(error.message, true);
  }
}

function handleMeetingEnded() {
  notifyChat(t('meetingEnded'));
  setMeetingSubtitle('meetingEnded');
  toggleForm(false);
  toggleControls(false);
  cleanupMedia();
}

function cleanupMedia() {
  if (state.pc) {
    try {
      state.pc.close();
    } catch (error) {
      console.warn(error);
    }
    state.pc = null;
  }
  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => track.stop());
    state.localStream = null;
    ui.localVideo.srcObject = null;
  }
  if (state.remoteStream) {
    state.remoteStream.getTracks().forEach((track) => track.stop());
    state.remoteStream = null;
    ui.remoteVideo.srcObject = null;
  }
  state.mediaAdded = false;
  state.callActive = false;
  state.hasJoined = false;
  ui.remoteWrapper.classList.add('idle');
  ui.localWrapper.classList.add('idle');
  state.pipActive = false;
  refreshActionButtons();
}

function leaveMeeting() {
  if (state.leaving) return;
  state.leaving = true;
  socket.emit('leave-meeting');
  cleanupMedia();
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }
  window.location.href = '/';
}

async function togglePictureInPicture() {
  const video = ui.remoteVideo;
  if (!video.srcObject) {
    notifyVideo(t('remotePlaceholder'), true);
    return;
  }

  if (state.pipActive) {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    } else if (video.webkitSupportsPresentationMode && video.webkitPresentationMode === 'picture-in-picture') {
      video.webkitSetPresentationMode('inline');
    }
    return;
  }

  try {
    if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    } else if (video.webkitSupportsPresentationMode) {
      video.webkitSetPresentationMode('picture-in-picture');
      state.pipActive = true;
      refreshActionButtons();
      notifyVideo(t('pipEntering'));
    } else {
      notifyVideo(t('pipUnsupported'), true);
    }
  } catch (error) {
    notifyVideo(t('pipUnsupported'), true);
  }
}

function joinMeeting(name) {
  if (state.joining) return;
  state.joining = true;
  socket.emit('join-room', {
    meetingToken: state.meetingToken,
    displayName: name,
    authToken: state.authToken,
  });
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

function maybeStartCall() {
  if (!state.isHost) return;
  const others = [...state.participants].filter((name) => name !== state.displayName);
  if (others.length === 0) return;
  if (state.callActive) return;
  startOffer();
}

ui.nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = ui.nameInput.value.trim();
  if (!name) {
    ui.nameError.textContent = t('nameRequired');
    ui.nameError.classList.remove('hidden');
    return;
  }
  joinMeeting(name);
});

ui.chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.meetingToken) return;
  const text = ui.chatInput.value.trim();
  if (!text) return;
  socket.emit('chat-message', { text });
  ui.chatInput.value = '';
});

ui.copyLinkBtn.addEventListener('click', copyMeetingLink);
ui.pipBtn.addEventListener('click', togglePictureInPicture);
ui.muteBtn.addEventListener('click', toggleAudio);
ui.videoBtn.addEventListener('click', toggleVideo);
ui.endMeetingBtn.addEventListener('click', endMeeting);
ui.leaveBtn.addEventListener('click', leaveMeeting);

ui.remoteVideo.addEventListener('enterpictureinpicture', () => {
  state.pipActive = true;
  refreshActionButtons();
  notifyVideo(t('pipEntering'));
});

ui.remoteVideo.addEventListener('leavepictureinpicture', () => {
  state.pipActive = false;
  refreshActionButtons();
  notifyVideo(t('pipExiting'));
});

ui.remoteVideo.addEventListener('webkitpresentationmodechanged', (event) => {
  const isPiP = event.target.webkitPresentationMode === 'picture-in-picture';
  state.pipActive = isPiP;
  refreshActionButtons();
  notifyVideo(isPiP ? t('pipEntering') : t('pipExiting'));
});

window.addEventListener('beforeunload', () => {
  socket.emit('leave-meeting');
  cleanupMedia();
});

socket.on('join-error', ({ message }) => {
  state.joining = false;
  ui.nameError.textContent = message || t('unableToJoin');
  ui.nameError.classList.remove('hidden');
  showFatal(message || t('unableToJoin'));
});

socket.on('meeting-joined', async ({ meeting, participants, isHost, self }) => {
  state.joining = false;
  state.isHost = isHost;
  state.displayName = self;
  state.hasJoined = true;
  state.participants = new Set(participants);
  refreshParticipants();
  updateBadge();
  hideNameModal();
  ui.endMeetingBtn.classList.toggle('hidden', !isHost);
  setMeetingSubtitle('linkReady', meeting.token);
  toggleForm(true);
  toggleControls(true);
  refreshActionButtons();
  notifyChat(t('joined'));
  setChatStatus('chatStatusIdle');

  await ensureLocalStream().catch(() => {});
  await loadHistory();

  if (!state.localStream) {
    notifyVideo(t('enableMedia'), true);
  } else if (state.isHost) {
    maybeStartCall();
  }
});

socket.on('participant-joined', ({ name }) => {
  if (!name || name === state.displayName) return;
  state.participants.add(name);
  refreshParticipants();
  notifyChat(t('participantJoined', name));
  if (state.isHost) {
    maybeStartCall();
  }
});

socket.on('participant-left', ({ name }) => {
  if (!name || name === state.displayName) return;
  state.participants.delete(name);
  refreshParticipants();
  notifyChat(t('participantLeft', name));
  state.callActive = false;
  notifyVideo(t('remoteLeft'), true);
  if (state.remoteStream) {
    state.remoteStream.getTracks().forEach((track) => track.stop());
    state.remoteStream = null;
    ui.remoteVideo.srcObject = null;
  }
  ui.remoteWrapper.classList.add('idle');
});

socket.on('message', (message) => {
  appendMessage(message, message.sender === state.displayName);
});

socket.on('chat-error', ({ message }) => {
  notifyChat(message || t('chatSendFailed'), true);
});

socket.on('meeting-ended', () => {
  handleMeetingEnded();
});

socket.on('webrtc-offer', ({ offer }) => {
  handleRemoteOffer(offer);
});

socket.on('webrtc-answer', ({ answer }) => {
  handleRemoteAnswer(answer);
});

socket.on('webrtc-candidate', ({ candidate }) => {
  handleRemoteCandidate(candidate);
});

(async function bootstrap() {
  try {
    if (!state.meetingToken) {
      throw new Error(t('invalidLink'));
    }
    document.documentElement.lang = currentLang;
    refreshActionButtons();
    setChatStatus('chatStatusWaiting');
    await prefetchMeeting();
    notifyChat(t('chatStatusWaiting'));

    if (state.authToken) {
      joinMeeting(sessionStorage.getItem('username'));
    } else {
      showNameModal();
    }
  } catch (error) {
    console.error(error);
    showFatal(error.message || t('meetingUnavailable'));
  }
})();
