const socket = io();

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
};

const ui = {
  nameModal: document.getElementById('nameModal'),
  nameForm: document.getElementById('nameForm'),
  nameInput: document.getElementById('displayNameInput'),
  nameError: document.getElementById('nameError'),
  meetingSubtitle: document.getElementById('meetingSubtitle'),
  copyLinkBtn: document.getElementById('copyLinkBtn'),
  muteBtn: document.getElementById('muteBtn'),
  videoBtn: document.getElementById('videoBtn'),
  endMeetingBtn: document.getElementById('endMeetingBtn'),
  leaveBtn: document.getElementById('leaveBtn'),
  roleBadge: document.getElementById('roleBadge'),
  participants: document.getElementById('participants'),
  localVideo: document.getElementById('localVideo'),
  remoteVideo: document.getElementById('remoteVideo'),
  videoNotice: document.getElementById('videoNotice'),
  messages: document.getElementById('messages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatNotice: document.getElementById('chatNotice'),
};

const TEXT = {
  invalidLink: 'Invalid meeting link. / Невірне посилання на зустріч.',
  meetingUnavailable: 'Meeting unavailable. / Зустріч недоступна.',
  offlineBadge: 'Offline / Офлайн',
  hostLabel: (host) => `Host / Хост: ${host}`,
  docTitle: (host) => `Kaminskyi AI Messenger — Meeting with ${host} / Зустріч з ${host}`,
  linkReady: (token) => `Meeting link ready: ${token} / Посилання на зустріч: ${token}`,
  readyHint: 'Ready. Share the link when you are in the meeting. / Готово. Поділіться посиланням, коли будете в зустрічі.',
  joined: 'You joined the meeting. / Ви приєдналися до зустрічі.',
  participantJoined: (name) => `${name} joined the meeting. / ${name} приєднався(-лася) до зустрічі.`,
  participantLeft: (name) => `${name} left the meeting. / ${name} покинув(-ла) зустріч.`,
  remoteConnected: 'Remote participant connected. / Віддалений учасник під’єднався.',
  remoteLeft: 'Remote participant left the call. / Віддалений учасник покинув дзвінок.',
  reconnection: 'Connection lost. Waiting for reconnection… / Зв’язок втрачено. Очікуємо повторне підключення…',
  enableMedia: 'Enable camera and microphone to start the call. / Увімкніть камеру та мікрофон, щоб розпочати дзвінок.',
  mediaPermissionDenied: 'Camera or microphone permission denied. / Доступ до камери чи мікрофона заборонений.',
  linkCopied: 'Link copied to clipboard. / Посилання скопійовано до буфера обміну.',
  linkCopyError: 'Unable to copy automatically. Copy it manually. / Не вдалося скопіювати автоматично. Скопіюйте вручну.',
  clipboardUnavailable: 'Clipboard access unavailable. Copy the link from the address bar. / Доступ до буфера обміну недоступний. Скопіюйте посилання з адресного рядка.',
  meetingEnded: 'Meeting ended. You can close this tab. / Зустріч завершено. Можете закрити вкладку.',
  unableToEnd: 'Unable to end meeting. / Не вдалося завершити зустріч.',
  unableToJoin: 'Unable to join meeting. / Не вдалося приєднатися до зустрічі.',
  nameRequired: 'Name is required. / Потрібно вказати ім’я.',
  waiting: 'Waiting to join… / Очікуємо приєднання…',
  mute: 'Mute / Вимкнути звук',
  unmute: 'Unmute / Увімкнути звук',
  stopVideo: 'Stop video / Вимкнути відео',
  startVideo: 'Start video / Увімкнути відео',
  hostBadge: 'Host / Хост',
  guestBadge: 'Guest / Гість'
};


function requireToken() {
  if (!state.meetingToken) {
    showFatal(TEXT.invalidLink);
    throw new Error('Meeting token missing');
  }
}

function showFatal(message) {
  ui.chatNotice.textContent = message;
  ui.chatNotice.classList.remove('hidden');
  ui.chatNotice.classList.add('error');
  toggleForm(false);
  toggleControls(false);
  ui.roleBadge.textContent = TEXT.offlineBadge;
  if (!ui.nameModal.classList.contains('hidden')) {
    ui.nameModal.classList.add('hidden');
  }
}

function toggleForm(enabled) {
  ui.chatInput.disabled = !enabled;
  ui.chatForm.querySelector('button').disabled = !enabled;
}

function toggleControls(enabled) {
  ui.copyLinkBtn.disabled = !enabled;
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
      throw new Error(data.message || TEXT.meetingUnavailable);
    }

    const meeting = data.meeting;
    ui.meetingSubtitle.textContent = TEXT.hostLabel(meeting.host);
    document.title = TEXT.docTitle(meeting.host);

    state.participants = new Set(data.participants);
    renderParticipants();
  } catch (error) {
    showFatal(error.message);
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

function renderParticipants() {
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
  try {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return '';
  }
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
      notifyVideo(TEXT.remoteConnected);
    }
  };

  state.pc.onconnectionstatechange = () => {
    if (['disconnected', 'failed'].includes(state.pc.connectionState)) {
      state.callActive = false;
      notifyVideo(TEXT.reconnection, true);
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
    ui.muteBtn.textContent = TEXT.mute;
    ui.videoBtn.textContent = TEXT.stopVideo;
    return state.localStream;
  } catch (error) {
    notifyVideo(TEXT.mediaPermissionDenied, true);
    throw error;
  }
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
  const hasEnabled = state.localStream.getAudioTracks().some((track) => track.enabled);
  state.localStream.getAudioTracks().forEach((track) => {
    track.enabled = !hasEnabled;
  });
  ui.muteBtn.textContent = hasEnabled ? TEXT.unmute : TEXT.mute;
}

function toggleVideo() {
  if (!state.localStream) return;
  const hasEnabled = state.localStream.getVideoTracks().some((track) => track.enabled);
  state.localStream.getVideoTracks().forEach((track) => {
    track.enabled = !hasEnabled;
  });
  ui.videoBtn.textContent = hasEnabled ? TEXT.startVideo : TEXT.stopVideo;
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
      const data = await response.json().catch(() => ({ message: TEXT.unableToEnd }));
      throw new Error(data.message || TEXT.unableToEnd);
    }
    handleMeetingEnded();
  } catch (error) {
    notifyChat(error.message, true);
  }
}

function handleMeetingEnded() {
  notifyChat(TEXT.meetingEnded, false);
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
}

function leaveMeeting() {
  if (state.leaving) return;
  state.leaving = true;
  socket.emit('leave-meeting');
  cleanupMedia();
  window.location.href = '/';
}

function updateBadge() {
  if (state.isHost) {
    ui.roleBadge.textContent = TEXT.hostBadge;
  } else {
    ui.roleBadge.textContent = TEXT.guestBadge;
  }
}

async function joinMeeting(name) {
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
      .then(() => notifyChat(TEXT.linkCopied))
      .catch(() => notifyChat(TEXT.linkCopyError, true));
  } else {
    notifyChat(TEXT.clipboardUnavailable, true);
  }
}

socket.on('join-error', ({ message }) => {
  state.joining = false;
  ui.nameError.textContent = message;
  ui.nameError.classList.remove('hidden');
  showFatal(message || TEXT.unableToJoin);
});

socket.on('meeting-joined', async ({ meeting, participants, isHost, self }) => {
  state.joining = false;
  state.isHost = isHost;
  state.displayName = self;
  state.participants = new Set(participants);
  renderParticipants();
  updateBadge();
  hideNameModal();
  ui.endMeetingBtn.classList.toggle('hidden', !isHost);
  ui.meetingSubtitle.textContent = TEXT.linkReady(meeting.token);
  toggleForm(true);
  toggleControls(true);
  notifyChat(TEXT.joined);

  await ensureLocalStream().catch(() => {});
  await loadHistory();

  if (!state.localStream) {
    notifyVideo(TEXT.enableMedia, true);
  } else if (state.isHost) {
    maybeStartCall();
  }
});

socket.on('participant-joined', ({ name }) => {
  if (!name || name === state.displayName) return;
  state.participants.add(name);
  renderParticipants();
  notifyChat(TEXT.participantJoined(name));
  if (state.isHost) {
    maybeStartCall();
  }
});

socket.on('participant-left', ({ name }) => {
  if (!name || name === state.displayName) return;
  state.participants.delete(name);
  renderParticipants();
  notifyChat(TEXT.participantLeft(name));
  state.callActive = false;
  notifyVideo(TEXT.remoteLeft, true);
  if (state.remoteStream) {
    state.remoteStream.getTracks().forEach((track) => track.stop());
    state.remoteStream = null;
    ui.remoteVideo.srcObject = null;
  }
});

socket.on('message', (message) => {
  appendMessage(message, message.sender === state.displayName);
});

socket.on('chat-error', ({ message }) => {
  notifyChat(message, true);
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
    ui.nameError.textContent = TEXT.nameRequired;
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
ui.muteBtn.addEventListener('click', toggleAudio);
ui.videoBtn.addEventListener('click', toggleVideo);
ui.endMeetingBtn.addEventListener('click', endMeeting);
ui.leaveBtn.addEventListener('click', leaveMeeting);

window.addEventListener('beforeunload', () => {
  socket.emit('leave-meeting');
  cleanupMedia();
});

(async function bootstrap() {
  try {
    requireToken();
    await prefetchMeeting();
    notifyChat(TEXT.readyHint);

    if (state.authToken) {
      joinMeeting(sessionStorage.getItem('username'));
    } else {
      showNameModal();
    }
  } catch (error) {
    console.error(error);
  }
})();
