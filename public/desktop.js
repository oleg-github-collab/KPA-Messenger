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

    // Advanced features state
    this.polls = new Map(); // Store active polls
    this.currentPoll = null;
    this.emotions = new Map(); // Store emotion data
    this.currentEmotion = null;
    this.sociometryTests = new Map(); // Store sociometry data
    this.currentSociometryTest = null;
    this.currentTestQuestions = [];
    this.currentQuestionIndex = 0;
    this.testResponses = [];

    // Feature toggle states
    this.emotionPanelActive = false;
    this.climateDisplayActive = false;

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
    this.fullscreenBtn = document.getElementById('fullscreenBtn');

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

    // Feature toggle buttons
    this.featureToggles = document.getElementById('featureToggles');
    this.togglePolls = document.getElementById('togglePolls');
    this.toggleEmotions = document.getElementById('toggleEmotions');
    this.toggleSociometry = document.getElementById('toggleSociometry');
    this.toggleChat = document.getElementById('toggleChat');

    // Polls system elements
    this.pollCreationModal = document.getElementById('pollCreationModal');
    this.pollForm = document.getElementById('pollForm');
    this.pollQuestion = document.getElementById('pollQuestion');
    this.pollDescription = document.getElementById('pollDescription');
    this.pollType = document.getElementById('pollType');
    this.pollDuration = document.getElementById('pollDuration');
    this.pollOptionsContainer = document.getElementById('pollOptionsContainer');
    this.addOptionBtn = document.getElementById('addOptionBtn');
    this.createPollBtn = document.getElementById('createPollBtn');
    this.cancelPollBtn = document.getElementById('cancelPollBtn');

    // Active poll elements
    this.activePoll = document.getElementById('activePoll');
    this.pollHeader = document.getElementById('pollHeader');
    this.pollQuestionText = document.getElementById('pollQuestionText');
    this.pollDescriptionText = document.getElementById('pollDescriptionText');
    this.pollOptions = document.getElementById('pollOptions');
    this.pollTimer = document.getElementById('pollTimer');
    this.pollStats = document.getElementById('pollStats');
    this.pollActions = document.getElementById('pollActions');
    this.voteBtn = document.getElementById('voteBtn');
    this.viewResultsBtn = document.getElementById('viewResultsBtn');

    // Emotional feedback elements
    this.emotionPanel = document.getElementById('emotionPanel');
    this.emotionSelector = document.getElementById('emotionSelector');
    this.emotionSubmit = document.getElementById('emotionSubmit');
    this.climateDisplay = document.getElementById('climateDisplay');
    this.climateScore = document.getElementById('climateScore');
    this.climateEmotions = document.getElementById('climateEmotions');
    this.climateStats = document.getElementById('climateStats');

    // Sociometry elements
    this.sociometryModal = document.getElementById('sociometryModal');
    this.sociometryTemplates = document.getElementById('sociometryTemplates');
    this.startTestBtn = document.getElementById('startTestBtn');
    this.cancelSociometryBtn = document.getElementById('cancelSociometryBtn');

    // Active sociometry test elements
    this.activeSociometry = document.getElementById('activeSociometry');
    this.testQuestion = document.getElementById('testQuestion');
    this.responseScale = document.getElementById('responseScale');
    this.testProgress = document.getElementById('testProgress');
    this.testProgressBar = document.getElementById('testProgressBar');
    this.nextQuestionBtn = document.getElementById('nextQuestionBtn');

    // Results panel elements
    this.resultsPanel = document.getElementById('resultsPanel');
    this.resultsContent = document.getElementById('resultsContent');
    this.resultsSummary = document.getElementById('resultsSummary');
    this.resultsChart = document.getElementById('resultsChart');
    this.closeResultsBtn = document.getElementById('closeResultsBtn');
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
    this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));

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

    // Document visibility change (for PiP)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Auto-resize chat input
    this.desktopChatInput.addEventListener('input', this.autoResizeInput.bind(this));
    this.assistantInput.addEventListener('input', this.autoResizeInput.bind(this));

    // Feature toggle buttons
    if (this.togglePolls) this.togglePolls.addEventListener('click', this.showPollCreationModal.bind(this));
    if (this.toggleEmotions) this.toggleEmotions.addEventListener('click', this.toggleEmotionPanel.bind(this));
    if (this.toggleSociometry) this.toggleSociometry.addEventListener('click', this.showSociometryModal.bind(this));
    if (this.toggleChat) this.toggleChat.addEventListener('click', this.openChat.bind(this));

    // Polls functionality
    if (this.pollForm) this.pollForm.addEventListener('submit', this.createPoll.bind(this));
    if (this.addOptionBtn) this.addOptionBtn.addEventListener('click', this.addPollOption.bind(this));
    if (this.createPollBtn) this.createPollBtn.addEventListener('click', this.createPoll.bind(this));
    if (this.cancelPollBtn) this.cancelPollBtn.addEventListener('click', this.hidePollCreationModal.bind(this));
    if (this.voteBtn) this.voteBtn.addEventListener('click', this.submitVote.bind(this));
    if (this.viewResultsBtn) this.viewResultsBtn.addEventListener('click', this.showPollResults.bind(this));

    // Emotions functionality
    if (this.emotionSubmit) this.emotionSubmit.addEventListener('click', this.submitEmotion.bind(this));

    // Sociometry functionality
    if (this.startTestBtn) this.startTestBtn.addEventListener('click', this.startSociometryTest.bind(this));
    if (this.cancelSociometryBtn) this.cancelSociometryBtn.addEventListener('click', this.hideSociometryModal.bind(this));
    if (this.nextQuestionBtn) this.nextQuestionBtn.addEventListener('click', this.nextQuestion.bind(this));

    // Results functionality
    if (this.closeResultsBtn) this.closeResultsBtn.addEventListener('click', this.hideResults.bind(this));

    // Emotion selector events
    if (this.emotionSelector) {
      this.emotionSelector.addEventListener('click', this.handleEmotionSelection.bind(this));
    }

    // Sociometry template selection
    if (this.sociometryTemplates) {
      this.sociometryTemplates.addEventListener('click', this.handleTemplateSelection.bind(this));
    }

    // Response scale events
    if (this.responseScale) {
      this.responseScale.addEventListener('click', this.handleScaleResponse.bind(this));
    }
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

    // Advanced features events
    this.socket.on('poll-created', this.handlePollCreated.bind(this));
    this.socket.on('poll-vote', this.handlePollVote.bind(this));
    this.socket.on('poll-ended', this.handlePollEnded.bind(this));
    this.socket.on('emotion-submitted', this.handleEmotionSubmitted.bind(this));
    this.socket.on('climate-updated', this.handleClimateUpdated.bind(this));
    this.socket.on('sociometry-started', this.handleSociometryStarted.bind(this));
    this.socket.on('sociometry-response', this.handleSociometryResponse.bind(this));
    this.socket.on('sociometry-completed', this.handleSociometryCompleted.bind(this));
    this.socket.on('test-results', this.handleTestResults.bind(this));
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

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        // Enter fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }

        this.fullscreenBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2"/>
          </svg>
        `;
        this.fullscreenBtn.title = 'Exit fullscreen';
        this.showNotification('Entered fullscreen mode', 'success');
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        this.fullscreenBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2"/>
          </svg>
        `;
        this.fullscreenBtn.title = 'Toggle fullscreen';
        this.showNotification('Exited fullscreen mode', 'success');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      this.showNotification('Fullscreen not supported', 'error');
    }
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

  async handleVisibilityChange() {
    if (document.hidden) {
      // Browser tab/window is not visible, try to enter PiP mode
      await this.enterPictureInPicture();
    } else {
      // Browser tab/window is visible again, exit PiP mode
      await this.exitPictureInPicture();
    }
  }

  async enterPictureInPicture() {
    try {
      // Only enter PiP if we have video playing and PiP is supported
      const activeVideo = this.remoteVideo.srcObject ? this.remoteVideo : this.localVideo;

      if (activeVideo && activeVideo.srcObject && 'pictureInPictureEnabled' in document) {
        if (document.pictureInPictureElement) {
          return; // Already in PiP mode
        }

        await activeVideo.requestPictureInPicture();
        console.log('Entered Picture-in-Picture mode');
        this.showNotification('Minimized to picture-in-picture', 'info');
      }
    } catch (error) {
      console.log('Picture-in-Picture not available or failed:', error.message);
    }
  }

  async exitPictureInPicture() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        console.log('Exited Picture-in-Picture mode');
      }
    } catch (error) {
      console.error('Error exiting Picture-in-Picture:', error);
    }
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

  // ==================== ADVANCED FEATURES IMPLEMENTATION ====================

  // ==================== POLLS SYSTEM ====================
  showPollCreationModal() {
    if (this.pollCreationModal) {
      this.pollCreationModal.classList.remove('hidden');
      if (this.pollQuestion) this.pollQuestion.focus();
      this.initializePollOptions();
    }
  }

  hidePollCreationModal() {
    if (this.pollCreationModal) {
      this.pollCreationModal.classList.add('hidden');
      this.resetPollForm();
    }
  }

  initializePollOptions() {
    if (this.pollOptionsContainer) {
      this.pollOptionsContainer.innerHTML = `
        <div class="poll-option-input">
          <input type="text" placeholder="Option 1" required>
          <button type="button" class="remove-option" onclick="this.parentElement.remove()" style="display: none;">×</button>
        </div>
        <div class="poll-option-input">
          <input type="text" placeholder="Option 2" required>
          <button type="button" class="remove-option" onclick="this.parentElement.remove()" style="display: none;">×</button>
        </div>
      `;
    }
  }

  addPollOption() {
    if (this.pollOptionsContainer) {
      const optionCount = this.pollOptionsContainer.children.length;
      if (optionCount >= 6) {
        this.showNotification('Maximum 6 options allowed', 'warning');
        return;
      }

      const optionDiv = document.createElement('div');
      optionDiv.className = 'poll-option-input';
      optionDiv.innerHTML = `
        <input type="text" placeholder="Option ${optionCount + 1}" required>
        <button type="button" class="remove-option" onclick="this.parentElement.remove()">×</button>
      `;

      this.pollOptionsContainer.appendChild(optionDiv);
      optionDiv.querySelector('input').focus();
    }
  }

  createPoll(event) {
    if (event) event.preventDefault();

    const question = this.pollQuestion?.value.trim();
    const description = this.pollDescription?.value.trim();
    const type = this.pollType?.value || 'multiple-choice';
    const duration = parseInt(this.pollDuration?.value) || 60;

    if (!question) {
      this.showNotification('Poll question is required', 'error');
      return;
    }

    const optionInputs = this.pollOptionsContainer?.querySelectorAll('.poll-option-input input');
    const options = [];

    if (optionInputs) {
      optionInputs.forEach((input, index) => {
        const value = input.value.trim();
        if (value) {
          options.push({
            id: index,
            text: value,
            votes: 0,
            voters: []
          });
        }
      });
    }

    if (options.length < 2) {
      this.showNotification('At least 2 options are required', 'error');
      return;
    }

    const pollData = {
      roomToken: this.roomToken,
      question,
      description,
      type,
      duration: duration * 1000, // Convert to milliseconds
      options,
      creator: this.displayName,
      createdAt: Date.now(),
      endsAt: Date.now() + (duration * 1000)
    };

    this.socket.emit('create-poll', pollData);
    this.hidePollCreationModal();
  }

  resetPollForm() {
    if (this.pollQuestion) this.pollQuestion.value = '';
    if (this.pollDescription) this.pollDescription.value = '';
    if (this.pollType) this.pollType.value = 'multiple-choice';
    if (this.pollDuration) this.pollDuration.value = '60';
    this.initializePollOptions();
  }

  handlePollCreated(pollData) {
    this.currentPoll = pollData;
    this.polls.set(pollData.id, pollData);
    this.displayActivePoll(pollData);
    this.showNotification(`New poll: ${pollData.question}`, 'info');
  }

  displayActivePoll(pollData) {
    if (!this.activePoll) return;

    if (this.pollQuestionText) this.pollQuestionText.textContent = pollData.question;
    if (this.pollDescriptionText) {
      this.pollDescriptionText.textContent = pollData.description;
      this.pollDescriptionText.style.display = pollData.description ? 'block' : 'none';
    }

    if (this.pollOptions) {
      this.pollOptions.innerHTML = pollData.options.map(option => `
        <div class="poll-option" data-option-id="${option.id}">
          <div class="poll-option-content">
            <span class="poll-option-text">${option.text}</span>
            <span class="poll-option-votes">${option.votes} votes</span>
          </div>
          <div class="poll-option-bar" style="width: ${this.calculateVotePercentage(option, pollData)}%"></div>
        </div>
      `).join('');

      // Add click handlers
      this.pollOptions.querySelectorAll('.poll-option').forEach(option => {
        option.addEventListener('click', () => {
          this.selectPollOption(option.dataset.optionId);
        });
      });
    }

    this.activePoll.classList.remove('hidden');
    this.startPollTimer(pollData);
  }

  selectPollOption(optionId) {
    // Clear previous selections
    this.pollOptions.querySelectorAll('.poll-option').forEach(option => {
      option.classList.remove('selected');
    });

    // Select new option
    const selectedOption = this.pollOptions.querySelector(`[data-option-id="${optionId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      this.selectedPollOption = optionId;

      if (this.voteBtn) {
        this.voteBtn.disabled = false;
      }
    }
  }

  submitVote() {
    if (!this.selectedPollOption || !this.currentPoll) return;

    this.socket.emit('poll-vote', {
      roomToken: this.roomToken,
      pollId: this.currentPoll.id,
      optionId: this.selectedPollOption,
      voter: this.displayName
    });

    if (this.voteBtn) this.voteBtn.disabled = true;
  }

  handlePollVote(data) {
    if (this.currentPoll && this.currentPoll.id === data.pollId) {
      const option = this.currentPoll.options.find(opt => opt.id == data.optionId);
      if (option) {
        option.votes++;
        if (!option.voters.includes(data.voter)) {
          option.voters.push(data.voter);
        }
        this.updatePollDisplay();
      }
    }
  }

  updatePollDisplay() {
    if (!this.currentPoll || !this.pollOptions) return;

    this.pollOptions.querySelectorAll('.poll-option').forEach((optionElement, index) => {
      const option = this.currentPoll.options[index];
      if (option) {
        const votesSpan = optionElement.querySelector('.poll-option-votes');
        const bar = optionElement.querySelector('.poll-option-bar');

        if (votesSpan) votesSpan.textContent = `${option.votes} votes`;
        if (bar) bar.style.width = `${this.calculateVotePercentage(option, this.currentPoll)}%`;
      }
    });

    this.updatePollStats();
  }

  calculateVotePercentage(option, pollData) {
    const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
    return totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
  }

  updatePollStats() {
    if (!this.pollStats || !this.currentPoll) return;

    const totalVotes = this.currentPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const participantCount = this.participants.size;

    this.pollStats.innerHTML = `
      <span>Total votes: ${totalVotes}</span>
      <span>Participants: ${participantCount}</span>
    `;
  }

  startPollTimer(pollData) {
    if (!this.pollTimer) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, pollData.endsAt - now);

      if (timeLeft <= 0) {
        this.pollTimer.textContent = 'Poll ended';
        return;
      }

      const seconds = Math.ceil(timeLeft / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      this.pollTimer.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')} remaining`;
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    setTimeout(() => {
      clearInterval(timerInterval);
      this.handlePollEnded({ pollId: pollData.id });
    }, pollData.duration);
  }

  handlePollEnded(data) {
    if (this.currentPoll && this.currentPoll.id === data.pollId) {
      this.showNotification('Poll has ended', 'info');
      if (this.voteBtn) this.voteBtn.disabled = true;

      setTimeout(() => {
        this.hidePoll();
      }, 3000);
    }
  }

  showPollResults() {
    if (!this.currentPoll) return;

    this.displayResults({
      type: 'poll',
      title: 'Poll Results',
      data: this.currentPoll
    });
  }

  hidePoll() {
    if (this.activePoll) {
      this.activePoll.classList.add('hidden');
    }
    this.currentPoll = null;
    this.selectedPollOption = null;
  }

  // ==================== EMOTIONAL FEEDBACK SYSTEM ====================
  toggleEmotionPanel() {
    if (!this.emotionPanel) return;

    this.emotionPanelActive = !this.emotionPanelActive;

    if (this.emotionPanelActive) {
      this.emotionPanel.classList.add('active');
      this.initializeEmotionSelector();
    } else {
      this.emotionPanel.classList.remove('active');
    }
  }

  initializeEmotionSelector() {
    if (!this.emotionSelector) return;

    const emotions = [
      { emoji: '😊', name: 'Happy', value: 'happy' },
      { emoji: '😢', name: 'Sad', value: 'sad' },
      { emoji: '😡', name: 'Angry', value: 'angry' },
      { emoji: '😴', name: 'Tired', value: 'tired' },
      { emoji: '🤔', name: 'Confused', value: 'confused' },
      { emoji: '😎', name: 'Cool', value: 'cool' },
      { emoji: '🥳', name: 'Excited', value: 'excited' },
      { emoji: '😰', name: 'Anxious', value: 'anxious' },
      { emoji: '🤗', name: 'Grateful', value: 'grateful' }
    ];

    this.emotionSelector.innerHTML = emotions.map(emotion => `
      <button class="emotion-btn" data-emotion="${emotion.value}">
        <span class="emotion-emoji">${emotion.emoji}</span>
        <span class="emotion-label">${emotion.name}</span>
      </button>
    `).join('');
  }

  handleEmotionSelection(event) {
    const emotionBtn = event.target.closest('.emotion-btn');
    if (!emotionBtn) return;

    // Clear previous selection
    this.emotionSelector.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Select new emotion
    emotionBtn.classList.add('selected');
    this.currentEmotion = emotionBtn.dataset.emotion;

    if (this.emotionSubmit) {
      this.emotionSubmit.disabled = false;
    }
  }

  submitEmotion() {
    if (!this.currentEmotion) return;

    this.socket.emit('emotion-feedback', {
      roomToken: this.roomToken,
      emotion: this.currentEmotion,
      participant: this.displayName,
      timestamp: Date.now()
    });

    this.showNotification('Emotion submitted!', 'success');

    // Reset selection
    this.emotionSelector.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    this.currentEmotion = null;
    if (this.emotionSubmit) this.emotionSubmit.disabled = true;

    // Auto-hide panel after submission
    setTimeout(() => {
      this.toggleEmotionPanel();
    }, 2000);
  }

  handleEmotionSubmitted(data) {
    this.emotions.set(data.participant, data);
    this.showNotification(`${data.participant} shared their emotion`, 'info');
  }

  handleClimateUpdated(climateData) {
    this.displayEmotionalClimate(climateData);
  }

  displayEmotionalClimate(climateData) {
    if (!this.climateDisplay) return;

    // Show climate display
    this.climateDisplay.classList.add('active');
    this.climateDisplayActive = true;

    // Update score
    if (this.climateScore) {
      this.climateScore.textContent = `${climateData.score}%`;
      this.climateScore.className = `climate-score ${climateData.sentiment}`;
    }

    // Update emotions display
    if (this.climateEmotions) {
      this.climateEmotions.innerHTML = climateData.topEmotions
        .slice(0, 5)
        .map(emotion => `<span>${emotion.emoji}</span>`)
        .join('');
    }

    // Update stats
    if (this.climateStats) {
      this.climateStats.innerHTML = `
        <div>Responses: ${climateData.totalResponses}</div>
        <div>Updated: ${new Date(climateData.lastUpdated).toLocaleTimeString()}</div>
      `;
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (this.climateDisplayActive) {
        this.climateDisplay.classList.remove('active');
        this.climateDisplayActive = false;
      }
    }, 10000);
  }

  // ==================== SOCIOMETRY SYSTEM ====================
  showSociometryModal() {
    if (this.sociometryModal) {
      this.sociometryModal.classList.remove('hidden');
      this.initializeSociometryTemplates();
    }
  }

  hideSociometryModal() {
    if (this.sociometryModal) {
      this.sociometryModal.classList.add('hidden');
      this.selectedTemplate = null;
    }
  }

  initializeSociometryTemplates() {
    if (!this.sociometryTemplates) return;

    const templates = [
      {
        id: 'pulse-check',
        icon: '💓',
        title: 'Pulse Check',
        desc: 'Quick team energy assessment'
      },
      {
        id: 'focus-scan',
        icon: '🎯',
        title: 'Focus Scan',
        desc: 'Measure attention and engagement'
      },
      {
        id: 'team-resonance',
        icon: '🤝',
        title: 'Team Resonance',
        desc: 'Evaluate team harmony and connection'
      }
    ];

    this.sociometryTemplates.innerHTML = templates.map(template => `
      <div class="template-card" data-template-id="${template.id}">
        <span class="template-icon">${template.icon}</span>
        <div class="template-title">${template.title}</div>
        <div class="template-desc">${template.desc}</div>
      </div>
    `).join('');
  }

  handleTemplateSelection(event) {
    const templateCard = event.target.closest('.template-card');
    if (!templateCard) return;

    // Clear previous selection
    this.sociometryTemplates.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Select new template
    templateCard.classList.add('selected');
    this.selectedTemplate = templateCard.dataset.templateId;

    if (this.startTestBtn) {
      this.startTestBtn.disabled = false;
    }
  }

  startSociometryTest() {
    if (!this.selectedTemplate) return;

    const testData = {
      roomToken: this.roomToken,
      template: this.selectedTemplate,
      creator: this.displayName,
      participants: Array.from(this.participants.keys()),
      startTime: Date.now()
    };

    this.socket.emit('start-sociometry', testData);
    this.hideSociometryModal();
  }

  handleSociometryStarted(testData) {
    this.currentSociometryTest = testData;
    this.currentTestQuestions = this.getQuestionsForTemplate(testData.template);
    this.currentQuestionIndex = 0;
    this.testResponses = [];

    this.displayActiveSociometryTest();
    this.showNotification(`Sociometry test started: ${this.getTemplateTitle(testData.template)}`, 'info');
  }

  getQuestionsForTemplate(template) {
    const questions = {
      'pulse-check': [
        { text: 'How energized do you feel right now?', scale: [1, 2, 3, 4, 5] },
        { text: 'How motivated are you for this meeting?', scale: [1, 2, 3, 4, 5] },
        { text: 'How comfortable do you feel sharing ideas?', scale: [1, 2, 3, 4, 5] }
      ],
      'focus-scan': [
        { text: 'How focused are you on the current topic?', scale: [1, 2, 3, 4, 5] },
        { text: 'How well can you follow the discussion?', scale: [1, 2, 3, 4, 5] },
        { text: 'How engaged do you feel?', scale: [1, 2, 3, 4, 5] }
      ],
      'team-resonance': [
        { text: 'How connected do you feel with the team?', scale: [1, 2, 3, 4, 5] },
        { text: 'How valued do you feel in this group?', scale: [1, 2, 3, 4, 5] },
        { text: 'How aligned are we on our goals?', scale: [1, 2, 3, 4, 5] }
      ]
    };

    return questions[template] || questions['pulse-check'];
  }

  getTemplateTitle(template) {
    const titles = {
      'pulse-check': 'Pulse Check',
      'focus-scan': 'Focus Scan',
      'team-resonance': 'Team Resonance'
    };
    return titles[template] || 'Sociometry Test';
  }

  displayActiveSociometryTest() {
    if (!this.activeSociometry || !this.currentTestQuestions.length) return;

    this.activeSociometry.classList.remove('hidden');
    this.displayCurrentQuestion();
  }

  displayCurrentQuestion() {
    const question = this.currentTestQuestions[this.currentQuestionIndex];
    if (!question) return;

    if (this.testQuestion) {
      this.testQuestion.textContent = question.text;
    }

    if (this.responseScale) {
      this.responseScale.innerHTML = question.scale.map(value => `
        <div class="scale-option" data-value="${value}">
          ${value}
        </div>
      `).join('');
    }

    // Update progress
    const progress = ((this.currentQuestionIndex + 1) / this.currentTestQuestions.length) * 100;
    if (this.testProgressBar) {
      this.testProgressBar.style.width = `${progress}%`;
    }

    this.selectedResponse = null;
    if (this.nextQuestionBtn) {
      this.nextQuestionBtn.disabled = true;
      this.nextQuestionBtn.textContent = this.currentQuestionIndex === this.currentTestQuestions.length - 1 ? 'Complete Test' : 'Next Question';
    }
  }

  handleScaleResponse(event) {
    const scaleOption = event.target.closest('.scale-option');
    if (!scaleOption) return;

    // Clear previous selection
    this.responseScale.querySelectorAll('.scale-option').forEach(option => {
      option.classList.remove('selected');
    });

    // Select new response
    scaleOption.classList.add('selected');
    this.selectedResponse = parseInt(scaleOption.dataset.value);

    if (this.nextQuestionBtn) {
      this.nextQuestionBtn.disabled = false;
    }
  }

  nextQuestion() {
    if (this.selectedResponse === null) return;

    // Store response
    this.testResponses.push({
      questionIndex: this.currentQuestionIndex,
      question: this.currentTestQuestions[this.currentQuestionIndex].text,
      response: this.selectedResponse,
      timestamp: Date.now()
    });

    // Submit response to server
    this.socket.emit('sociometry-response', {
      roomToken: this.roomToken,
      testId: this.currentSociometryTest.id,
      participant: this.displayName,
      questionIndex: this.currentQuestionIndex,
      response: this.selectedResponse
    });

    // Move to next question or complete test
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.currentTestQuestions.length) {
      this.displayCurrentQuestion();
    } else {
      this.completeTest();
    }
  }

  completeTest() {
    this.socket.emit('complete-sociometry', {
      roomToken: this.roomToken,
      testId: this.currentSociometryTest.id,
      participant: this.displayName,
      responses: this.testResponses,
      completedAt: Date.now()
    });

    this.hideActiveSociometryTest();
    this.showNotification('Test completed! Waiting for results...', 'success');
  }

  hideActiveSociometryTest() {
    if (this.activeSociometry) {
      this.activeSociometry.classList.add('hidden');
    }
  }

  handleSociometryResponse(data) {
    // Handle other participants' responses if needed
    console.log('Sociometry response received:', data);
  }

  handleSociometryCompleted(data) {
    this.showNotification(`${data.participant} completed the test`, 'info');
  }

  handleTestResults(resultsData) {
    this.displayResults({
      type: 'sociometry',
      title: `${this.getTemplateTitle(resultsData.template)} Results`,
      data: resultsData
    });
  }

  // ==================== RESULTS DISPLAY SYSTEM ====================
  displayResults(resultsConfig) {
    if (!this.resultsPanel) return;

    this.resultsPanel.classList.remove('hidden');

    // Update title
    const titleElement = this.resultsContent.querySelector('.results-header h2');
    if (titleElement) {
      titleElement.textContent = resultsConfig.title;
    }

    // Generate summary cards
    if (this.resultsSummary) {
      this.resultsSummary.innerHTML = this.generateResultsSummary(resultsConfig);
    }

    // Generate chart
    if (this.resultsChart) {
      this.resultsChart.innerHTML = this.generateResultsChart(resultsConfig);
    }
  }

  generateResultsSummary(config) {
    if (config.type === 'poll') {
      const totalVotes = config.data.options.reduce((sum, opt) => sum + opt.votes, 0);
      const topOption = config.data.options.reduce((max, opt) => opt.votes > max.votes ? opt : max, config.data.options[0]);

      return `
        <div class="result-card">
          <div class="result-value">${totalVotes}</div>
          <div class="result-label">Total Votes</div>
        </div>
        <div class="result-card">
          <div class="result-value">${config.data.options.length}</div>
          <div class="result-label">Options</div>
        </div>
        <div class="result-card">
          <div class="result-value">${Math.round((topOption.votes / totalVotes) * 100) || 0}%</div>
          <div class="result-label">Top Choice</div>
        </div>
      `;
    } else if (config.type === 'sociometry') {
      return `
        <div class="result-card">
          <div class="result-value">${config.data.participantCount}</div>
          <div class="result-label">Participants</div>
        </div>
        <div class="result-card">
          <div class="result-value">${config.data.averageScore.toFixed(1)}</div>
          <div class="result-label">Average Score</div>
        </div>
        <div class="result-card">
          <div class="result-value">${config.data.completionRate}%</div>
          <div class="result-label">Completion Rate</div>
        </div>
      `;
    }
    return '';
  }

  generateResultsChart(config) {
    if (config.type === 'poll') {
      const maxVotes = Math.max(...config.data.options.map(opt => opt.votes));

      return `
        <div class="chart-title">Vote Distribution</div>
        <div class="chart-bars">
          ${config.data.options.map(option => `
            <div class="chart-bar-item">
              <div class="chart-bar-label">${option.text}</div>
              <div class="chart-bar-container">
                <div class="chart-bar-fill" style="width: ${maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0}%"></div>
                <span class="chart-bar-value">${option.votes}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (config.type === 'sociometry') {
      return `
        <div class="chart-title">Response Patterns</div>
        <div class="chart-content">
          ${config.data.questionResults.map((result, index) => `
            <div class="question-result">
              <div class="question-title">Q${index + 1}: ${result.question}</div>
              <div class="response-stats">
                <div class="stat">Average: ${result.average.toFixed(1)}</div>
                <div class="stat">Responses: ${result.responseCount}</div>
              </div>
              <div class="response-distribution">
                ${[1,2,3,4,5].map(score => `
                  <div class="response-bar">
                    <span>${score}</span>
                    <div class="bar" style="width: ${(result.distribution[score] || 0)}%"></div>
                    <span>${result.distribution[score] || 0}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    return '<div class="chart-title">No data available</div>';
  }

  hideResults() {
    if (this.resultsPanel) {
      this.resultsPanel.classList.add('hidden');
    }
  }

  // ==================== ENHANCED RECONNECTION HANDLING ====================
  updateConnectionStatus(status) {
    this.connectionStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    this.connectionText.textContent = status.charAt(0).toUpperCase() + status.slice(1);

    // Remove previous status classes and add new one
    this.connectionIndicator.className = 'connection-indicator';
    this.connectionIndicator.classList.add(status);

    const statusMessages = {
      connected: 'Connected',
      connecting: 'Connecting...',
      reconnecting: 'Reconnecting...',
      disconnected: 'Disconnected',
      error: 'Connection Error'
    };

    this.connectionText.textContent = statusMessages[status] || status;

    // **FIX**: Ensure reconnection indicator properly clears after reconnection
    if (status === 'connected' && this.connectionIndicator.classList.contains('reconnecting')) {
      this.connectionIndicator.classList.remove('reconnecting');

      // Brief delay to ensure UI update
      setTimeout(() => {
        this.connectionIndicator.classList.add('connected');
      }, 100);
    }
  }
}

// Initialize the desktop video call when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DesktopVideoCall();
});