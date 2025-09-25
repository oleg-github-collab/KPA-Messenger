// Desktop Video Calling Interface - Complete Implementation with AI Assistant

class DesktopVideoCall {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnections = new Map();
    this.participants = new Map();
    this.roomToken = null;
    this.displayName = null;
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
    this.isScreenSharing = false;
    this.callStartTime = null;
    this.timerInterval = null;
    this.currentView = 'speaker'; // 'speaker' or 'grid'
    this.userNameTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 50; // For 6+ hour sessions
    this.reconnectInterval = null;
    this.lastHeartbeat = Date.now();
    this.heartbeatInterval = null;
    this.chatMode = 'normal'; // 'normal' or 'assistant'
    this.assistantMessages = [];
    this.sidebarCollapsed = false;

    this.initializeElements();
    this.setupEventListeners();
    this.checkRoomToken();
    this.startHeartbeat();
  }

  initializeElements() {
    // Video elements
    this.localVideo = document.getElementById('localVideo');
    this.remoteVideo = document.getElementById('remoteVideo');
    this.localPlaceholder = document.getElementById('localPlaceholder');
    this.remotePlaceholder = document.getElementById('remotePlaceholder');

    // Views
    this.activeSpeakerView = document.getElementById('activeSpeakerView');
    this.gridView = document.getElementById('gridView');
    this.mainVideo = document.getElementById('mainVideo');

    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.userAvatar = document.getElementById('userAvatar');
    this.currentUserName = document.getElementById('currentUserName');
    this.connectionStatus = document.getElementById('connectionStatus');
    this.participantSearch = document.getElementById('participantSearch');
    this.participantsCount = document.getElementById('participantsCount');
    this.viewToggle = document.getElementById('viewToggle');
    this.participantList = document.getElementById('participantList');

    // Control elements
    this.videoToggleBtn = document.getElementById('videoToggleBtn');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');
    this.screenShareBtn = document.getElementById('screenShareBtn');
    this.leaveBtn = document.getElementById('leaveBtn');
    this.chatButton = document.getElementById('chatButton');
    this.moreOptionsBtn = document.getElementById('moreOptionsBtn');
    this.recordBtn = document.getElementById('recordBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.endCallBtn = document.getElementById('endCallBtn');
    this.expandIcon = document.getElementById('expandIcon');

    // UI elements
    this.callTimer = document.getElementById('callTimer');
    this.timerValue = document.getElementById('timerValue');
    this.userNameDisplay = document.getElementById('userNameDisplay');
    this.displayedUserName = document.getElementById('displayedUserName');
    this.speakerName = document.getElementById('speakerName');
    this.videoNotice = document.getElementById('videoNotice');
    this.connectionIndicator = document.getElementById('connectionIndicator');
    this.connectionText = document.getElementById('connectionText');
    this.nameModal = document.getElementById('nameModal');
    this.nameForm = document.getElementById('nameForm');
    this.displayNameInput = document.getElementById('displayNameInput');
    this.nameError = document.getElementById('nameError');

    // Chat elements
    this.chatBubble = document.getElementById('chatBubble');
    this.desktopChatOverlay = document.getElementById('desktopChatOverlay');
    this.desktopChatMessages = document.getElementById('desktopChatMessages');
    this.desktopChatInput = document.getElementById('desktopChatInput');
    this.desktopChatSend = document.getElementById('desktopChatSend');
    this.closeChatBtn = document.getElementById('closeChatBtn');
    this.lastChatMessage = document.getElementById('lastChatMessage');
    this.toggleAssistant = document.getElementById('toggleAssistant');

    // Assistant elements
    this.assistantPanel = document.getElementById('assistantPanel');
    this.assistantMessages = document.getElementById('assistantMessages');
    this.assistantInput = document.getElementById('assistantInput');
    this.assistantSend = document.getElementById('assistantSend');
    this.webSearchToggle = document.getElementById('webSearchToggle');

    // Bottom controls
    this.bottomControls = document.getElementById('bottomControls');
    this.smallVideo = document.getElementById('smallVideo');
  }

  setupEventListeners() {
    // Sidebar controls
    this.sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
    this.viewToggle.addEventListener('click', this.toggleView.bind(this));
    this.participantSearch.addEventListener('input', this.filterParticipants.bind(this));

    // Video controls
    this.videoToggleBtn.addEventListener('click', this.toggleVideo.bind(this));
    this.audioToggleBtn.addEventListener('click', this.toggleAudio.bind(this));
    this.screenShareBtn.addEventListener('click', this.toggleScreenShare.bind(this));
    this.leaveBtn.addEventListener('click', this.leaveCall.bind(this));
    this.endCallBtn.addEventListener('click', this.leaveCall.bind(this));
    this.expandIcon.addEventListener('click', this.toggleVideoSize.bind(this));

    // Other controls
    this.chatButton.addEventListener('click', this.openChat.bind(this));
    this.shareBtn.addEventListener('click', this.shareLink.bind(this));
    this.moreOptionsBtn.addEventListener('click', this.showMoreOptions.bind(this));
    this.recordBtn.addEventListener('click', this.toggleRecording.bind(this));
    this.settingsBtn.addEventListener('click', this.showSettings.bind(this));

    // Name form
    this.nameForm.addEventListener('submit', this.submitName.bind(this));

    // Chat functionality
    this.closeChatBtn.addEventListener('click', this.closeChat.bind(this));
    this.desktopChatSend.addEventListener('click', this.sendMessage.bind(this));
    this.desktopChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.chatBubble.addEventListener('click', this.openChat.bind(this));
    this.toggleAssistant.addEventListener('click', this.toggleAssistantMode.bind(this));

    // Assistant functionality
    this.assistantSend.addEventListener('click', this.sendAssistantMessage.bind(this));
    this.assistantInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendAssistantMessage();
      }
    });

    // User name display
    this.userNameDisplay.addEventListener('click', this.showUserName.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

    // Window events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Auto-resize chat input
    this.desktopChatInput.addEventListener('input', this.autoResizeInput.bind(this));
    this.assistantInput.addEventListener('input', this.autoResizeInput.bind(this));
  }

  checkRoomToken() {
    const urlParams = new URLSearchParams(window.location.search);
    this.roomToken = urlParams.get('room');

    if (!this.roomToken) {
      this.showNotification('Invalid meeting link', 'error');
      setTimeout(() => window.location.href = '/', 3000);
      return;
    }

    this.showNameModal();
  }

  showNameModal() {
    this.nameModal.classList.remove('hidden');
    this.displayNameInput.focus();
  }

  async submitName(event) {
    event.preventDefault();
    const name = this.displayNameInput.value.trim();

    if (!name) {
      this.showError('Name is required');
      return;
    }

    this.displayName = name;
    this.displayedUserName.textContent = name;
    this.currentUserName.textContent = name;
    this.userAvatar.textContent = name.charAt(0).toUpperCase();
    this.nameModal.classList.add('hidden');

    await this.initializeCall();
  }

  async initializeCall() {
    try {
      await this.initializeMedia();
      this.connectSocket();
      this.startCallTimer();
      this.showUserNameTemporarily();
      this.updateConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.showNotification('Failed to access camera/microphone', 'error');
      this.updateConnectionStatus('error');
    }
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      this.localVideo.srcObject = this.localStream;
      this.localPlaceholder.style.display = 'none';

      // Add self to participant list
      this.addParticipant({
        id: 'self',
        displayName: this.displayName,
        isLocal: true
      });

    } catch (error) {
      console.error('Error accessing media devices:', error);
      this.showNotification('Camera/microphone access denied', 'error');
      throw error;
    }
  }

  connectSocket() {
    this.socket = io({
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      this.updateConnectionStatus('connected');
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.updateConnectionStatus('disconnected');
      this.handleDisconnection();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
      this.updateConnectionStatus('reconnecting');
    });

    this.socket.on('reconnect', () => {
      console.log('Reconnected to server');
      this.updateConnectionStatus('connected');
      this.rejoinRoom();
    });

    this.socket.on('user-joined', this.handleUserJoined.bind(this));
    this.socket.on('user-left', this.handleUserLeft.bind(this));
    this.socket.on('offer', this.handleOffer.bind(this));
    this.socket.on('answer', this.handleAnswer.bind(this));
    this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
    this.socket.on('chat-message', this.handleChatMessage.bind(this));
    this.socket.on('assistant-response', this.handleAssistantResponse.bind(this));
    this.socket.on('room-full', () => this.showNotification('Meeting is full', 'error'));
    this.socket.on('room-not-found', () => this.showNotification('Meeting not found', 'error'));
    this.socket.on('heartbeat', () => this.lastHeartbeat = Date.now());
  }

  async createPeerConnection(participantId) {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          roomToken: this.roomToken,
          candidate: event.candidate,
          targetId: participantId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', participantId);
      const participant = this.participants.get(participantId);
      if (participant) {
        participant.stream = event.streams[0];
        this.updateParticipantVideo(participantId, event.streams[0]);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        this.handlePeerConnectionFailure(participantId);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  async handleUserJoined(data) {
    console.log('User joined:', data.displayName);

    this.addParticipant({
      id: data.socketId,
      displayName: data.displayName,
      isLocal: false
    });

    const peerConnection = await this.createPeerConnection(data.socketId);
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    await peerConnection.setLocalDescription(offer);

    this.socket.emit('offer', {
      roomToken: this.roomToken,
      offer: offer,
      targetId: data.socketId
    });
  }

  async handleOffer(data) {
    const peerConnection = await this.createPeerConnection(data.from);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.socket.emit('answer', {
      roomToken: this.roomToken,
      answer: answer,
      targetId: data.from
    });
  }

  async handleAnswer(data) {
    const peerConnection = this.peerConnections.get(data.from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  handleIceCandidate(data) {
    const peerConnection = this.peerConnections.get(data.from);
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  handleUserLeft(data) {
    console.log('User left:', data.displayName);

    const peerConnection = this.peerConnections.get(data.socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(data.socketId);
    }

    this.removeParticipant(data.socketId);
  }

  // Participant Management
  addParticipant(participant) {
    this.participants.set(participant.id, participant);
    this.updateParticipantList();
    this.updateParticipantsCount();
  }

  removeParticipant(participantId) {
    this.participants.delete(participantId);
    this.updateParticipantList();
    this.updateParticipantsCount();

    // Remove from grid view
    const gridTile = document.querySelector(`[data-peer="${participantId}"]`);
    if (gridTile) {
      gridTile.remove();
    }
  }

  updateParticipantList() {
    const participantItems = Array.from(this.participants.values()).map(participant => {
      const isActive = participant.id === this.getCurrentSpeaker();
      return `
        <div class="participant-item ${participant.isLocal ? 'self' : ''} ${isActive ? 'active' : ''}"
             data-participant-id="${participant.id}">
          <div class="participant-avatar">
            ${participant.displayName.charAt(0).toUpperCase()}
            <div class="online-indicator"></div>
          </div>
          <div class="participant-info">
            <div class="participant-name">${participant.displayName}</div>
            <div class="participant-status">${participant.isLocal ? 'Host' : 'Guest'}</div>
          </div>
          <div class="participant-controls">
            <button class="control-btn" title="Toggle camera">📹</button>
            <button class="control-btn" title="Toggle microphone">🎤</button>
          </div>
        </div>
      `;
    }).join('');

    this.participantList.innerHTML = participantItems;

    // Add click handlers
    this.participantList.querySelectorAll('.participant-item').forEach(item => {
      item.addEventListener('click', () => {
        const participantId = item.dataset.participantId;
        this.setActiveSpeaker(participantId);
      });
    });
  }

  updateParticipantsCount() {
    const count = this.participants.size;
    this.participantsCount.textContent = `Participants (${count})`;
  }

  setActiveSpeaker(participantId) {
    // Update participant list
    this.participantList.querySelectorAll('.participant-item').forEach(item => {
      item.classList.remove('active');
    });

    const activeItem = this.participantList.querySelector(`[data-participant-id="${participantId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    // Update main video
    const participant = this.participants.get(participantId);
    if (participant) {
      this.speakerName.textContent = participant.displayName;

      if (participant.stream && participantId !== 'self') {
        this.remoteVideo.srcObject = participant.stream;
        this.remotePlaceholder.style.display = 'none';
      } else {
        this.remoteVideo.srcObject = null;
        this.remotePlaceholder.style.display = 'flex';
      }
    }
  }

  getCurrentSpeaker() {
    const activeItem = this.participantList.querySelector('.participant-item.active');
    return activeItem ? activeItem.dataset.participantId : 'self';
  }

  updateParticipantVideo(participantId, stream) {
    // Update grid view
    let gridTile = this.gridView.querySelector(`[data-peer="${participantId}"]`);

    if (!gridTile) {
      const participant = this.participants.get(participantId);
      gridTile = document.createElement('div');
      gridTile.className = 'grid-tile';
      gridTile.dataset.peer = participantId;
      gridTile.innerHTML = `
        <video autoplay playsinline></video>
        <div class="grid-avatar">${participant.displayName.charAt(0).toUpperCase()}</div>
        <div class="grid-name">${participant.displayName}</div>
        <div class="grid-online"></div>
        <div class="grid-controls">
          <button class="grid-control-btn">🎤</button>
          <button class="grid-control-btn">📹</button>
        </div>
      `;
      this.gridView.appendChild(gridTile);
    }

    const video = gridTile.querySelector('video');
    if (video) {
      video.srcObject = stream;
    }

    // Update main video if this is the active speaker
    if (participantId === this.getCurrentSpeaker()) {
      this.remoteVideo.srcObject = stream;
      this.remotePlaceholder.style.display = 'none';
    }
  }

  // View Management
  toggleView() {
    if (this.currentView === 'speaker') {
      this.switchToGridView();
    } else {
      this.switchToSpeakerView();
    }
  }

  switchToSpeakerView() {
    this.currentView = 'speaker';
    this.activeSpeakerView.style.display = 'flex';
    this.gridView.classList.remove('active');
    this.viewToggle.innerHTML = '⊞';
    this.viewToggle.title = 'Switch to grid view';
  }

  switchToGridView() {
    this.currentView = 'grid';
    this.activeSpeakerView.style.display = 'none';
    this.gridView.classList.add('active');
    this.viewToggle.innerHTML = '⊡';
    this.viewToggle.title = 'Switch to speaker view';
  }

  // Control Functions
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
        this.videoToggleBtn.classList.toggle('disabled', !this.isVideoEnabled);

        if (!this.isVideoEnabled) {
          this.localPlaceholder.style.display = 'flex';
        } else {
          this.localPlaceholder.style.display = 'none';
        }
      }
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
        this.audioToggleBtn.classList.toggle('disabled', !this.isAudioEnabled);
      }
    }
  }

  async toggleScreenShare() {
    try {
      if (!this.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        });

        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          this.peerConnections.forEach(async (peerConnection) => {
            const sender = peerConnection.getSenders().find(s =>
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
          });

          // Update local video
          this.localVideo.srcObject = screenStream;
          this.isScreenSharing = true;
          this.screenShareBtn.classList.add('active');

          videoTrack.onended = () => {
            this.stopScreenShare();
          };
        }
      } else {
        this.stopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      this.showNotification('Failed to share screen', 'error');
    }
  }

  async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Restore camera in all peer connections
        this.peerConnections.forEach(async (peerConnection) => {
          const sender = peerConnection.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });

        // Restore local video
        this.localVideo.srcObject = this.localStream;
        this.isScreenSharing = false;
        this.screenShareBtn.classList.remove('active');
      }
    }
  }

  toggleVideoSize() {
    const isExpanded = this.smallVideo.classList.contains('expanded');
    this.smallVideo.classList.toggle('expanded', !isExpanded);
    this.expandIcon.textContent = isExpanded ? '↗' : '↙';
  }

  leaveCall() {
    if (confirm('Are you sure you want to leave the call?')) {
      this.cleanupCall();
      window.location.href = '/';
    }
  }

  cleanupCall() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    this.peerConnections.forEach(peerConnection => {
      peerConnection.close();
    });

    // Disconnect socket
    if (this.socket) {
      this.socket.emit('leave-room', { roomToken: this.roomToken });
      this.socket.disconnect();
    }

    // Clear intervals
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }

  // Chat Functions
  openChat() {
    this.desktopChatOverlay.classList.add('active');
    this.desktopChatInput.focus();
    this.chatBubble.classList.add('hidden');
  }

  closeChat() {
    this.desktopChatOverlay.classList.remove('active');
    this.assistantPanel.classList.remove('active');
  }

  toggleAssistantMode() {
    this.chatMode = this.chatMode === 'normal' ? 'assistant' : 'normal';

    if (this.chatMode === 'assistant') {
      this.assistantPanel.classList.add('active');
      this.toggleAssistant.classList.add('active');
      this.assistantInput.focus();
    } else {
      this.assistantPanel.classList.remove('active');
      this.toggleAssistant.classList.remove('active');
      this.desktopChatInput.focus();
    }
  }

  sendMessage() {
    const message = this.desktopChatInput.value.trim();
    if (!message || !this.socket) return;

    this.socket.emit('chat-message', {
      roomToken: this.roomToken,
      message: message,
      from: this.displayName,
      timestamp: Date.now()
    });

    this.addChatMessage({
      message: message,
      from: this.displayName,
      timestamp: Date.now(),
      isOwn: true
    });

    this.desktopChatInput.value = '';
    this.autoResizeInput({ target: this.desktopChatInput });
  }

  sendAssistantMessage() {
    const message = this.assistantInput.value.trim();
    if (!message || !this.socket) return;

    const useWebSearch = this.webSearchToggle.checked;

    this.socket.emit('assistant-query', {
      roomToken: this.roomToken,
      query: message,
      from: this.displayName,
      webSearch: useWebSearch,
      timestamp: Date.now()
    });

    this.addAssistantMessage({
      message: message,
      from: this.displayName,
      timestamp: Date.now(),
      isQuery: true
    });

    // Show loading state
    this.addAssistantMessage({
      message: 'Valera is thinking...',
      from: 'Assistant',
      timestamp: Date.now(),
      isLoading: true
    });

    this.assistantInput.value = '';
    this.autoResizeInput({ target: this.assistantInput });
  }

  handleChatMessage(data) {
    this.addChatMessage(data);

    // Show chat bubble with last message
    this.lastChatMessage.textContent = `${data.from}: ${data.message}`;
    this.chatBubble.classList.remove('hidden');

    // Auto-hide chat bubble after 5 seconds
    setTimeout(() => {
      this.chatBubble.classList.add('hidden');
    }, 5000);
  }

  handleAssistantResponse(data) {
    // Remove loading message
    const loadingMessages = this.assistantMessages.querySelectorAll('.assistant-message.loading');
    loadingMessages.forEach(msg => msg.remove());

    this.addAssistantMessage({
      message: data.response,
      from: 'Valera AI',
      timestamp: data.timestamp,
      isResponse: true,
      sources: data.sources
    });
  }

  addChatMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${data.isOwn ? 'own' : 'other'}`;

    const time = new Date(data.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageElement.innerHTML = `
      <div class="message-content">
        <div class="message-author">${data.from}</div>
        <div class="message-text">${data.message}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    this.desktopChatMessages.appendChild(messageElement);
    this.desktopChatMessages.scrollTop = this.desktopChatMessages.scrollHeight;
  }

  addAssistantMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.className = `assistant-message ${data.isQuery ? 'query' : 'response'} ${data.isLoading ? 'loading' : ''}`;

    const time = new Date(data.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    let sourcesHtml = '';
    if (data.sources && data.sources.length > 0) {
      sourcesHtml = `
        <div class="message-sources">
          <small>Sources: ${data.sources.map(source => `<a href="${source.url}" target="_blank">${source.title}</a>`).join(', ')}</small>
        </div>
      `;
    }

    messageElement.innerHTML = `
      <div class="message-content">
        <div class="message-author">${data.from}</div>
        <div class="message-text">${data.message}</div>
        ${sourcesHtml}
        <div class="message-time">${time}</div>
      </div>
    `;

    this.assistantMessages.appendChild(messageElement);
    this.assistantMessages.scrollTop = this.assistantMessages.scrollHeight;
  }

  // Utility Functions
  autoResizeInput(event) {
    const input = event.target;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }

  filterParticipants() {
    const searchTerm = this.participantSearch.value.toLowerCase();
    const participantItems = this.participantList.querySelectorAll('.participant-item');

    participantItems.forEach(item => {
      const name = item.querySelector('.participant-name').textContent.toLowerCase();
      item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
  }

  async shareLink() {
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Video Call',
          text: 'Join our video meeting',
          url: currentUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        this.showNotification('Link copied to clipboard', 'success');
      } catch (error) {
        this.showNotification('Failed to copy link', 'error');
      }
    }
  }

  showMoreOptions() {
    // Implement more options menu
    this.showNotification('More options coming soon', 'info');
  }

  toggleRecording() {
    // Implement recording functionality
    this.showNotification('Recording feature coming soon', 'info');
  }

  showSettings() {
    // Implement settings panel
    this.showNotification('Settings panel coming soon', 'info');
  }

  // Timer Functions
  startCallTimer() {
    this.callStartTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.callStartTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      let timeString;
      if (hours > 0) {
        timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      this.timerValue.textContent = timeString;
    }, 1000);
  }

  // User Name Display
  showUserNameTemporarily() {
    this.userNameDisplay.style.opacity = '1';
    this.userNameDisplay.style.pointerEvents = 'auto';

    if (this.userNameTimeout) {
      clearTimeout(this.userNameTimeout);
    }

    this.userNameTimeout = setTimeout(() => {
      this.userNameDisplay.style.opacity = '0';
      this.userNameDisplay.style.pointerEvents = 'none';
    }, 5000);
  }

  showUserName() {
    this.showUserNameTemporarily();
  }

  // Connection Management
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });
      }

      // Check if heartbeat response is overdue
      const now = Date.now();
      if (now - this.lastHeartbeat > 60000) { // 1 minute timeout
        console.warn('Heartbeat timeout, connection may be unstable');
        this.updateConnectionStatus('reconnecting');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  handleDisconnection() {
    this.updateConnectionStatus('disconnected');

    // Start aggressive reconnection for long sessions
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

          if (this.socket && !this.socket.connected) {
            this.socket.connect();
          }
        } else {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
          this.showNotification('Connection lost. Please refresh the page.', 'error');
        }
      }, 5000);
    }
  }

  rejoinRoom() {
    if (this.socket && this.roomToken && this.displayName) {
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });
    }
  }

  handlePeerConnectionFailure(participantId) {
    console.log('Peer connection failed for:', participantId);

    // Try to recreate the connection
    setTimeout(async () => {
      const oldConnection = this.peerConnections.get(participantId);
      if (oldConnection) {
        oldConnection.close();
      }

      await this.createPeerConnection(participantId);

      // Restart negotiation
      if (this.socket) {
        this.socket.emit('restart-negotiation', {
          roomToken: this.roomToken,
          targetId: participantId
        });
      }
    }, 2000);
  }

  updateConnectionStatus(status) {
    this.connectionStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    this.connectionText.textContent = status.charAt(0).toUpperCase() + status.slice(1);

    this.connectionIndicator.className = `connection-indicator ${status}`;

    const statusMessages = {
      connected: 'Connected',
      connecting: 'Connecting...',
      reconnecting: 'Reconnecting...',
      disconnected: 'Disconnected',
      error: 'Connection Error'
    };

    this.connectionText.textContent = statusMessages[status] || status;
  }

  // Event Handlers
  handleKeyboardShortcuts(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return; // Don't handle shortcuts when typing
    }

    switch (event.code) {
      case 'KeyV':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleVideo();
        }
        break;
      case 'KeyM':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleAudio();
        }
        break;
      case 'KeyS':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleScreenShare();
        }
        break;
      case 'KeyC':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.openChat();
        }
        break;
      case 'KeyG':
        event.preventDefault();
        this.toggleView();
        break;
      case 'Escape':
        this.closeChat();
        break;
    }
  }

  handleBeforeUnload() {
    this.cleanupCall();
  }

  handleOnline() {
    console.log('Back online');
    this.updateConnectionStatus('connected');
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  handleOffline() {
    console.log('Gone offline');
    this.updateConnectionStatus('disconnected');
  }

  showError(message) {
    this.nameError.textContent = message;
    this.nameError.classList.remove('hidden');
  }

  showNotification(message, type = 'info') {
    this.videoNotice.textContent = message;
    this.videoNotice.className = `notification-banner ${type}`;
    this.videoNotice.classList.remove('hidden');

    setTimeout(() => {
      this.videoNotice.classList.add('hidden');
    }, 4000);
  }
}

// Initialize the desktop video call when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DesktopVideoCall();
});