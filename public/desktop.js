// Desktop Video Calling Interface - Clean Implementation
console.log('🚀 Desktop.js loading...');

class DesktopVideoCall {
  constructor() {
    console.log('🏗️ Constructing DesktopVideoCall...');

    // Core state
    this.socket = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnections = new Map();
    this.participants = new Map();
    this.roomToken = null;
    this.displayName = null;
    this.isVideoEnabled = false;  // Start disabled until media is obtained
    this.isAudioEnabled = false;  // Start disabled until media is obtained
    this.isScreenSharing = false; // Screen sharing state
    this.originalStream = null;   // Store original stream during screen sharing
    this.callStartTime = null;
    this.timerInterval = null;
    this.chatMode = 'normal'; // 'normal' or 'assistant'

    // Initialize in sequence
    this.initializeElements();
    this.setupEventListeners();
    this.checkRoomToken();

    console.log('✅ DesktopVideoCall constructor complete');
  }

  initializeElements() {
    console.log('🔧 Initializing DOM elements...');

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

    // Essential control elements only
    this.videoToggleBtn = document.getElementById('videoToggleBtn');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');
    this.screenShareBtn = document.getElementById('screenShareBtn');
    this.leaveBtn = document.getElementById('leaveBtn');
    this.chatButton = document.getElementById('chatButton');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');

    console.log('📹 Video toggle button:', this.videoToggleBtn);
    console.log('🎤 Audio toggle button:', this.audioToggleBtn);
    console.log('📺 Fullscreen button:', this.fullscreenBtn);

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

    console.log('💬 Chat close button:', this.closeChatBtn);

    // Chat tabs and assistant
    this.chatTab = document.getElementById('chatTab');
    this.assistantTab = document.getElementById('assistantTab');
    this.chatPanel = document.getElementById('chatPanel');
    this.assistantPanel = document.getElementById('assistantPanel');
    this.assistantMessages = document.getElementById('assistantMessages');
    this.assistantInput = document.getElementById('assistantInput');
    this.assistantSend = document.getElementById('assistantSend');
    this.webSearchToggle = document.getElementById('webSearchToggle');

    console.log('✅ Elements initialized successfully');
  }

  setupEventListeners() {
    console.log('🎯 Setting up event listeners...');

    // Essential controls only
    if (this.videoToggleBtn) {
      console.log('📹 Adding video toggle event listener');
      this.videoToggleBtn.addEventListener('click', (e) => {
        console.log('📹 Video toggle clicked');
        this.toggleVideo();
      });
    }

    if (this.audioToggleBtn) {
      console.log('🎤 Adding audio toggle event listener');
      this.audioToggleBtn.addEventListener('click', (e) => {
        console.log('🎤 Audio toggle clicked');
        this.toggleAudio();
      });
    }

    if (this.fullscreenBtn) {
      console.log('📺 Adding fullscreen event listener');
      this.fullscreenBtn.addEventListener('click', (e) => {
        console.log('📺 Fullscreen button clicked');
        this.toggleFullscreen();
      });
    }

    if (this.screenShareBtn) {
      this.screenShareBtn.addEventListener('click', () => this.toggleScreenShare());
    }

    if (this.leaveBtn) {
      this.leaveBtn.addEventListener('click', () => this.leaveCall());
    }

    if (this.chatButton) {
      this.chatButton.addEventListener('click', () => this.openChat());
    }

    // Name form
    if (this.nameForm) {
      this.nameForm.addEventListener('submit', (e) => this.submitName(e));
    }

    // Chat functionality
    if (this.closeChatBtn) {
      console.log('💬 Adding chat close event listener');
      this.closeChatBtn.addEventListener('click', (e) => {
        console.log('💬 Chat close button clicked');
        this.closeChat();
      });
    }

    if (this.desktopChatSend) {
      this.desktopChatSend.addEventListener('click', () => this.sendMessage());
    }

    if (this.desktopChatInput) {
      this.desktopChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (this.chatBubble) {
      this.chatBubble.addEventListener('click', () => this.openChat());
    }

    // Chat tabs
    if (this.chatTab) {
      this.chatTab.addEventListener('click', () => this.switchToChatMode());
    }

    if (this.assistantTab) {
      this.assistantTab.addEventListener('click', () => this.switchToAssistantMode());
    }

    // Assistant functionality
    if (this.assistantSend) {
      this.assistantSend.addEventListener('click', () => this.sendAssistantMessage());
    }

    if (this.assistantInput) {
      this.assistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendAssistantMessage();
        }
      });
    }

    // Sidebar controls
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }

    if (this.viewToggle) {
      this.viewToggle.addEventListener('click', () => this.toggleView());
    }

    if (this.participantSearch) {
      this.participantSearch.addEventListener('input', () => this.filterParticipants());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Window events
    window.addEventListener('beforeunload', () => this.handleBeforeUnload());

    console.log('✅ Event listeners setup complete');
  }

  checkRoomToken() {
    console.log('🔍 Checking room token...');
    const urlParams = new URLSearchParams(window.location.search);
    this.roomToken = urlParams.get('room');

    if (!this.roomToken) {
      console.error('❌ No room token found');
      this.showNotification('Invalid meeting link', 'error');
      setTimeout(() => window.location.href = '/', 3000);
      return;
    }

    console.log('✅ Room token found:', this.roomToken);
    this.showNameModal();
  }

  showNameModal() {
    console.log('👤 Showing name modal...');
    if (this.nameModal) {
      this.nameModal.classList.remove('hidden');
      if (this.displayNameInput) {
        this.displayNameInput.focus();
      }
    }
  }

  async submitName(event) {
    console.log('📝 Submitting name...');
    event.preventDefault();
    const name = this.displayNameInput.value.trim();

    if (!name) {
      this.showError('Name is required');
      return;
    }

    this.displayName = name;

    // Update UI with name
    if (this.displayedUserName) this.displayedUserName.textContent = name;
    if (this.currentUserName) this.currentUserName.textContent = name;
    if (this.userAvatar) this.userAvatar.textContent = name.charAt(0).toUpperCase();

    if (this.nameModal) {
      this.nameModal.classList.add('hidden');
    }

    console.log('✅ Name submitted:', name);
    await this.initializeCall();
  }

  async initializeCall() {
    try {
      console.log('🚀 Starting call initialization...');

      // First try to get media
      await this.initializeMedia();

      // Then connect to server
      this.connectSocket();

      // Start timer
      this.startCallTimer();

      // Update status
      this.updateConnectionStatus('connected');

      console.log('✅ Call initialization complete');
    } catch (error) {
      console.error('❌ Call initialization failed:', error);
      this.showNotification('Failed to access camera/microphone', 'error');
      this.updateConnectionStatus('error');

      // Continue with chat-only mode
      this.createFallbackStream();
      this.connectSocket();
      this.startCallTimer();
    }
  }

  async initializeMedia() {
    try {
      console.log('🎬 Requesting media access...');

      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('📞 Calling getUserMedia with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();

      this.isVideoEnabled = videoTracks.length > 0;
      this.isAudioEnabled = audioTracks.length > 0;

      console.log('✅ Media obtained:', {
        video: this.isVideoEnabled,
        audio: this.isAudioEnabled,
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length
      });

      // Set up local video
      if (this.isVideoEnabled && this.localVideo) {
        this.localVideo.srcObject = this.localStream;
        this.localVideo.muted = true; // Prevent feedback
        if (this.localPlaceholder) {
          this.localPlaceholder.style.display = 'none';
        }
        console.log('📹 Local video connected');
      } else {
        if (this.localVideo) this.localVideo.srcObject = null;
        if (this.localPlaceholder) {
          this.localPlaceholder.style.display = 'flex';
        }
        console.log('📷 No video track, showing placeholder');
      }

      // Update UI immediately
      this.updateMediaControlsUI();

      // Add self to participant list
      this.addParticipant({
        id: 'self',
        displayName: this.displayName,
        isLocal: true
      });

      console.log('🎉 Media initialization complete');

    } catch (error) {
      console.error('💥 Media access error:', error);

      // Always create fallback and continue
      this.createFallbackStream();

      // Show specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showNotification('Camera/microphone access denied. Click controls to try again.', 'warning');
      } else if (error.name === 'NotFoundError') {
        this.showNotification('No camera/microphone found. Audio/video disabled.', 'warning');
      } else if (error.name === 'NotReadableError') {
        this.showNotification('Camera/microphone in use by another app.', 'warning');
      } else {
        this.showNotification('Media access failed. Continuing with chat only.', 'error');
      }

      // Add self to participant list anyway
      this.addParticipant({
        id: 'self',
        displayName: this.displayName,
        isLocal: true
      });

      console.log('🚀 Media initialization complete (fallback mode)');
      throw error; // Re-throw so initializeCall can handle it
    }
  }

  createFallbackStream() {
    console.log('🔄 Creating fallback stream (no media)...');
    this.localStream = new MediaStream();
    this.isVideoEnabled = false;
    this.isAudioEnabled = false;

    if (this.localVideo) this.localVideo.srcObject = null;
    if (this.localPlaceholder) this.localPlaceholder.style.display = 'flex';

    this.updateMediaControlsUI();
    console.log('✅ Fallback stream created');
  }

  updateMediaControlsUI() {
    console.log('🎨 Updating media controls UI...', {
      video: this.isVideoEnabled,
      audio: this.isAudioEnabled
    });

    // Update video button
    if (this.videoToggleBtn) {
      this.videoToggleBtn.classList.toggle('disabled', !this.isVideoEnabled);
      this.videoToggleBtn.classList.toggle('muted', !this.isVideoEnabled);
      this.videoToggleBtn.title = this.isVideoEnabled ? 'Turn off camera' : 'Turn on camera';

      // Visual feedback
      const svg = this.videoToggleBtn.querySelector('svg');
      if (svg) {
        svg.style.opacity = this.isVideoEnabled ? '1' : '0.6';
        svg.style.filter = this.isVideoEnabled ? 'none' : 'grayscale(1)';
      }
      console.log('📹 Video button updated:', this.isVideoEnabled);
    }

    // Update audio button
    if (this.audioToggleBtn) {
      this.audioToggleBtn.classList.toggle('disabled', !this.isAudioEnabled);
      this.audioToggleBtn.classList.toggle('muted', !this.isAudioEnabled);
      this.audioToggleBtn.title = this.isAudioEnabled ? 'Mute microphone' : 'Unmute microphone';

      // Visual feedback
      const svg = this.audioToggleBtn.querySelector('svg');
      if (svg) {
        svg.style.opacity = this.isAudioEnabled ? '1' : '0.6';
        svg.style.filter = this.isAudioEnabled ? 'none' : 'grayscale(1)';
      }
      console.log('🎤 Audio button updated:', this.isAudioEnabled);
    }

    // Update video display
    if (this.isVideoEnabled) {
      if (this.localPlaceholder) this.localPlaceholder.style.display = 'none';
      if (this.localVideo) this.localVideo.style.display = 'block';
    } else {
      if (this.localPlaceholder) this.localPlaceholder.style.display = 'flex';
      if (this.localVideo) this.localVideo.style.display = 'none';
    }

    console.log('✅ Media controls UI updated');
  }

  // Media Control Functions
  async toggleVideo() {
    console.log('🎬 Toggle video called, current state:', this.isVideoEnabled);

    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Toggle existing track
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
        console.log('📹 Video track toggled to:', this.isVideoEnabled);
      } else if (!this.isVideoEnabled) {
        // Try to get video access
        console.log('📹 No video track, requesting access...');
        await this.requestVideoAccess();
      }
    } else if (!this.isVideoEnabled) {
      // Try to initialize media
      console.log('📹 No stream, requesting video access...');
      await this.requestVideoAccess();
    }

    this.updateMediaControlsUI();
    this.showNotification(this.isVideoEnabled ? 'Camera turned on' : 'Camera turned off', 'info');
  }

  async requestVideoAccess() {
    try {
      console.log('📹 Requesting video access...');
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];

      if (this.localStream) {
        // Add to existing stream
        this.localStream.addTrack(videoTrack);
      } else {
        // Create new stream
        this.localStream = videoStream;
      }

      if (this.localVideo) {
        this.localVideo.srcObject = this.localStream;
      }

      this.isVideoEnabled = true;
      console.log('✅ Video access granted');

      // Update peer connections
      await this.updatePeerConnectionTracks();
    } catch (error) {
      console.error('❌ Failed to get video access:', error);
      this.showNotification('Camera access denied or unavailable', 'error');
    }
  }

  async toggleAudio() {
    console.log('🎤 Toggle audio called, current state:', this.isAudioEnabled);

    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        // Toggle existing track
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
        console.log('🎤 Audio track toggled to:', this.isAudioEnabled);
      } else if (!this.isAudioEnabled) {
        // Try to get audio access
        console.log('🎤 No audio track, requesting access...');
        await this.requestAudioAccess();
      }
    } else if (!this.isAudioEnabled) {
      // Try to initialize media
      console.log('🎤 No stream, requesting audio access...');
      await this.requestAudioAccess();
    }

    this.updateMediaControlsUI();
    this.showNotification(this.isAudioEnabled ? 'Microphone unmuted' : 'Microphone muted', 'info');
  }

  async requestAudioAccess() {
    try {
      console.log('🎤 Requesting audio access...');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = audioStream.getAudioTracks()[0];

      if (this.localStream) {
        // Add to existing stream
        this.localStream.addTrack(audioTrack);
      } else {
        // Create new stream
        this.localStream = audioStream;
      }

      this.isAudioEnabled = true;
      console.log('✅ Audio access granted');

      // Update peer connections
      await this.updatePeerConnectionTracks();
    } catch (error) {
      console.error('❌ Failed to get audio access:', error);
      this.showNotification('Microphone access denied or unavailable', 'error');
    }
  }

  async toggleFullscreen() {
    try {
      console.log('📺 Toggle fullscreen called');

      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        // Enter fullscreen
        console.log('📺 Entering fullscreen...');
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

        console.log('✅ Entered fullscreen mode');
        this.showNotification('Entered fullscreen mode', 'success');
      } else {
        // Exit fullscreen
        console.log('📺 Exiting fullscreen...');

        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        console.log('✅ Exited fullscreen mode');
        this.showNotification('Exited fullscreen mode', 'success');
      }
    } catch (error) {
      console.error('❌ Fullscreen error:', error);
      this.showNotification('Fullscreen not supported', 'error');
    }
  }

  async updatePeerConnectionTracks() {
    console.log('🖥️ Updating peer connection tracks...');
    const updatePromises = [];

    this.peerConnections.forEach((peerConnection, participantId) => {
      if (peerConnection.connectionState !== 'closed') {
        const updatePromise = (async () => {
          try {
            const senders = peerConnection.getSenders();
            const tracks = this.localStream.getTracks();

            for (const track of tracks) {
              const sender = senders.find(s => s.track && s.track.kind === track.kind);
              if (sender) {
                console.log(`🔄 Replacing ${track.kind} track for participant:`, participantId);
                await sender.replaceTrack(track);
              } else {
                console.log(`➕ Adding new ${track.kind} track for participant:`, participantId);
                peerConnection.addTrack(track, this.localStream);
              }
            }
          } catch (error) {
            console.error('Error updating desktop peer connection tracks for', participantId, ':', error);
          }
        })();

        updatePromises.push(updatePromise);
      }
    });

    await Promise.all(updatePromises);
    console.log('✅ All desktop peer connection tracks updated');
  }

  // Chat Functions
  openChat() {
    console.log('💬 Opening chat...');
    if (this.desktopChatOverlay) {
      this.desktopChatOverlay.style.display = 'block';
      this.desktopChatOverlay.classList.add('active');
    }
    if (this.desktopChatInput) {
      this.desktopChatInput.focus();
    }
    if (this.chatBubble) {
      this.chatBubble.classList.add('hidden');
      this.chatBubble.style.display = 'none';
    }
    console.log('✅ Chat opened');
  }

  closeChat() {
    console.log('💬 Closing chat...');
    if (this.desktopChatOverlay) {
      this.desktopChatOverlay.style.display = 'none';
      this.desktopChatOverlay.classList.remove('active');
      console.log('💬 Chat overlay hidden');
    }
    if (this.chatBubble) {
      this.chatBubble.classList.remove('hidden');
      this.chatBubble.style.display = 'flex';
      console.log('💬 Chat bubble shown');
    }
    console.log('✅ Chat closed successfully');
  }

  switchToChatMode() {
    this.chatMode = 'normal';
    if (this.chatTab) this.chatTab.classList.add('active');
    if (this.assistantTab) this.assistantTab.classList.remove('active');
    if (this.chatPanel) this.chatPanel.classList.add('active');
    if (this.assistantPanel) this.assistantPanel.classList.remove('active');
    if (this.desktopChatInput) this.desktopChatInput.focus();
  }

  switchToAssistantMode() {
    this.chatMode = 'assistant';
    if (this.chatTab) this.chatTab.classList.remove('active');
    if (this.assistantTab) this.assistantTab.classList.add('active');
    if (this.chatPanel) this.chatPanel.classList.remove('active');
    if (this.assistantPanel) this.assistantPanel.classList.add('active');
    if (this.assistantInput) this.assistantInput.focus();
  }

  sendMessage() {
    const message = this.desktopChatInput?.value.trim();
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

    if (this.desktopChatInput) this.desktopChatInput.value = '';
  }

  sendAssistantMessage() {
    const message = this.assistantInput?.value.trim();
    if (!message || !this.socket) return;

    const useWebSearch = this.webSearchToggle?.checked || false;

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

    // Show loading
    this.addAssistantMessage({
      message: 'Valera is thinking...',
      from: 'Assistant',
      timestamp: Date.now(),
      isLoading: true
    });

    if (this.assistantInput) this.assistantInput.value = '';
  }

  addChatMessage(data) {
    if (!this.desktopChatMessages) return;

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
    if (!this.assistantMessages) return;

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

  handleChatMessage(data) {
    this.addChatMessage(data);

    // Show chat bubble with last message
    if (this.lastChatMessage) {
      const lastChatMessage = document.getElementById('lastChatMessage');
      if (lastChatMessage) {
        lastChatMessage.textContent = `${data.from}: ${data.message}`;
      }
    }
    if (this.chatBubble) {
      this.chatBubble.classList.remove('hidden');
    }
  }

  handleAssistantResponse(data) {
    // Remove loading message
    const loadingMessages = this.assistantMessages?.querySelectorAll('.assistant-message.loading');
    loadingMessages?.forEach(msg => msg.remove());

    this.addAssistantMessage({
      message: data.response,
      from: 'Valera AI',
      timestamp: data.timestamp,
      isResponse: true,
      sources: data.sources
    });
  }

  // Socket Connection
  connectSocket() {
    console.log('🔌 Connecting to server...');

    this.socket = io({
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.updateConnectionStatus('connected');
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
      this.updateConnectionStatus('disconnected');
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Reconnected to server');
      this.updateConnectionStatus('connected');
    });

    this.socket.on('user-joined', (data) => this.handleUserJoined(data));
    this.socket.on('user-left', (data) => this.handleUserLeft(data));
    this.socket.on('offer', (data) => this.handleOffer(data));
    this.socket.on('answer', (data) => this.handleAnswer(data));
    this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
    this.socket.on('chat-message', (data) => this.handleChatMessage(data));
    this.socket.on('assistant-response', (data) => this.handleAssistantResponse(data));
  }

  // WebRTC Functions (simplified)
  async createPeerConnection(participantId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

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
        this.updateRemoteVideo(event.streams[0]);
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

  updateRemoteVideo(stream) {
    if (this.remoteVideo) {
      this.remoteVideo.srcObject = stream;
      if (this.remotePlaceholder) {
        this.remotePlaceholder.style.display = 'none';
      }
    }
  }

  async handleUserJoined(data) {
    console.log('👋 User joined:', data.displayName);
    this.addParticipant({
      id: data.socketId,
      displayName: data.displayName,
      isLocal: false
    });

    const peerConnection = await this.createPeerConnection(data.socketId);
    const offer = await peerConnection.createOffer();
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
    console.log('👋 User left:', data.displayName);
    const peerConnection = this.peerConnections.get(data.socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(data.socketId);
    }
    this.removeParticipant(data.socketId);
  }

  // Participant Management
  addParticipant(participant) {
    console.log('➕ Adding participant to desktop UI:', participant.displayName);
    this.participants.set(participant.id, participant);
    this.updateParticipantsCount();
    this.updateParticipantsList();
  }

  removeParticipant(participantId) {
    console.log('➖ Removing participant from desktop UI:', participantId);
    this.participants.delete(participantId);
    this.updateParticipantsCount();
    this.updateParticipantsList();
  }

  updateParticipantsCount() {
    const count = this.participants.size;
    if (this.participantsCount) {
      this.participantsCount.textContent = `Participants (${count})`;
    }
  }

  updateParticipantsList() {
    if (!this.participantList) return;

    console.log('🔄 Updating desktop participants list UI');

    // Clear all non-self participants
    const existingParticipants = this.participantList.querySelectorAll('.participant-item:not([data-peer="self"])');
    existingParticipants.forEach(item => item.remove());

    // Add all participants except self
    this.participants.forEach((participant, id) => {
      if (participant.isLocal) return; // Skip self

      const participantEl = document.createElement('div');
      participantEl.className = 'participant-item';
      participantEl.setAttribute('data-peer', id);

      participantEl.innerHTML = `
        <div class="participant-avatar">${participant.displayName.charAt(0).toUpperCase()}
          <div class="online-indicator"></div>
        </div>
        <div class="participant-info">
          <div class="participant-name">${participant.displayName}</div>
          <div class="participant-status">Connected</div>
        </div>
        <div class="participant-controls">
          <button class="control-btn" title="Participant audio">🎤</button>
          <button class="control-btn" title="Participant video">📹</button>
        </div>
      `;

      this.participantList.appendChild(participantEl);
    });

    console.log(`✅ Desktop participants list updated: ${this.participants.size} total participants`);
  }

  // Utility Functions
  startCallTimer() {
    this.callStartTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (!this.timerValue) return;

      const elapsed = Date.now() - this.callStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.timerValue.textContent = timeString;
    }, 1000);
  }

  updateConnectionStatus(status) {
    if (this.connectionStatus) {
      this.connectionStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
    if (this.connectionText) {
      this.connectionText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
    if (this.connectionIndicator) {
      this.connectionIndicator.className = `connection-indicator ${status}`;
    }
  }

  showError(message) {
    if (this.nameError) {
      this.nameError.textContent = message;
      this.nameError.classList.remove('hidden');
    }
  }

  showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    if (this.videoNotice) {
      this.videoNotice.textContent = message;
      this.videoNotice.className = `notification-banner ${type}`;
      this.videoNotice.classList.remove('hidden');

      setTimeout(() => {
        this.videoNotice.classList.add('hidden');
      }, 4000);
    }
  }

  // Stub functions for missing UI elements
  toggleSidebar() { console.log('Sidebar toggle not implemented yet'); }
  toggleView() { console.log('View toggle not implemented yet'); }
  filterParticipants() { console.log('Participant filter not implemented yet'); }
  async toggleScreenShare() {
    console.log('🖥️ Toggling screen share...');

    try {
      if (this.isScreenSharing) {
        // Stop screen sharing
        await this.stopScreenShare();
      } else {
        // Start screen sharing
        await this.startScreenShare();
      }
    } catch (error) {
      console.error('❌ Screen share error:', error);
      this.showNotification('Failed to toggle screen sharing', 'error');
    }
  }

  async startScreenShare() {
    try {
      console.log('🖥️ Starting screen share...');

      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Store original stream for later restoration
      this.originalStream = this.localStream;

      // Get audio tracks from original stream to maintain audio
      const audioTracks = this.originalStream ? this.originalStream.getAudioTracks() : [];

      // Create new stream combining screen video and original audio
      const videoTrack = screenStream.getVideoTracks()[0];
      this.localStream = new MediaStream([videoTrack, ...audioTracks]);

      // Update local video display
      if (this.localVideo) {
        this.localVideo.srcObject = this.localStream;
      }

      // Update peer connections
      await this.updatePeerConnectionTracks();

      // Handle screen share end (when user clicks "Stop sharing" in browser)
      videoTrack.onended = () => {
        console.log('🖥️ Screen share ended by user');
        this.stopScreenShare();
      };

      this.isScreenSharing = true;

      // Update UI
      if (this.screenShareBtn) {
        this.screenShareBtn.classList.add('active');
        this.screenShareBtn.title = 'Stop sharing screen';
      }

      this.showNotification('Started screen sharing', 'info');
      console.log('✅ Screen share started successfully');

    } catch (error) {
      console.error('❌ Failed to start screen share:', error);

      if (error.name === 'NotAllowedError') {
        this.showNotification('Screen sharing permission denied', 'error');
      } else if (error.name === 'NotFoundError') {
        this.showNotification('No screen available for sharing', 'error');
      } else {
        this.showNotification('Failed to start screen sharing', 'error');
      }
    }
  }

  async stopScreenShare() {
    try {
      console.log('🖥️ Stopping screen share...');

      // Stop current screen tracks
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.stop();
          this.localStream.removeTrack(track);
        });
      }

      // Restore original camera stream
      if (this.originalStream) {
        const videoTracks = this.originalStream.getVideoTracks();
        videoTracks.forEach(track => {
          this.localStream.addTrack(track);
        });

        // Update local video display
        if (this.localVideo) {
          this.localVideo.srcObject = this.localStream;
        }

        // Clear reference
        this.originalStream = null;
      } else {
        // No original stream, create new camera stream if video was enabled
        if (this.isVideoEnabled) {
          try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            const videoTrack = cameraStream.getVideoTracks()[0];
            this.localStream.addTrack(videoTrack);

            if (this.localVideo) {
              this.localVideo.srcObject = this.localStream;
            }
          } catch (cameraError) {
            console.warn('⚠️ Could not restart camera after screen share:', cameraError);
          }
        }
      }

      // Update peer connections
      await this.updatePeerConnectionTracks();

      this.isScreenSharing = false;

      // Update UI
      if (this.screenShareBtn) {
        this.screenShareBtn.classList.remove('active');
        this.screenShareBtn.title = 'Share screen';
      }

      this.showNotification('Stopped screen sharing', 'info');
      console.log('✅ Screen share stopped successfully');

    } catch (error) {
      console.error('❌ Failed to stop screen share:', error);
      this.showNotification('Failed to stop screen sharing', 'error');
    }
  }

  leaveCall() {
    if (confirm('Are you sure you want to leave the call?')) {
      this.cleanupCall();
      window.location.href = '/';
    }
  }

  cleanupCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.peerConnections.forEach(pc => pc.close());
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  handleKeyboardShortcuts(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
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
      case 'KeyC':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.openChat();
        }
        break;
      case 'Escape':
        this.closeChat();
        break;
    }
  }

  handleBeforeUnload() {
    this.cleanupCall();
  }
}

// Initialize when DOM is ready
console.log('⏳ Waiting for DOM to be ready...');
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM ready, initializing DesktopVideoCall...');
  window.desktopCall = new DesktopVideoCall();
});

console.log('📄 Desktop.js loaded successfully');