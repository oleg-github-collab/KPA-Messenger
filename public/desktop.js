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
    this.pipBtn = document.getElementById('pipBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');

    console.log('📹 Video toggle button:', this.videoToggleBtn);
    console.log('🎤 Audio toggle button:', this.audioToggleBtn);
    console.log('🖼️ PiP button:', this.pipBtn);
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

    // Emoji picker elements
    this.emojiToggleBtn = document.getElementById('emojiToggleBtn');
    this.emojiPicker = document.getElementById('emojiPicker');

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

    if (this.pipBtn) {
      this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
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

    // Emoji picker functionality
    if (this.emojiToggleBtn) {
      this.emojiToggleBtn.addEventListener('click', () => this.toggleEmojiPicker());
    }

    // Setup emoji selection
    this.setupEmojiPicker();

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

    // Picture-in-Picture events
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('pagehide', () => this.handlePageHide());
    window.addEventListener('pageshow', () => this.handlePageShow());

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
    await this.requestAllPermissions();
    await this.initializeCall();
  }

  async requestAllPermissions() {
    console.log('🔐 Requesting all necessary permissions...');

    try {
      // Request microphone and camera permissions first
      console.log('🎤📹 Requesting audio/video permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Test the stream briefly then stop it
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Audio/Video permissions granted');
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        console.log('🔔 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('📢 Notification permission:', permission);
      }

      // Request clipboard permission (for sharing links)
      if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
        try {
          await navigator.clipboard.writeText('');
          console.log('📋 Clipboard permission available');
        } catch (error) {
          console.log('📋 Clipboard permission denied or unavailable');
        }
      }

      // Request fullscreen permission
      console.log('🖥️ Fullscreen API available:', !!document.documentElement.requestFullscreen);

      console.log('✅ All permission requests completed');

    } catch (error) {
      console.warn('⚠️ Some permissions were denied:', error);
      this.showPermissionWarning();
    }
  }

  showPermissionWarning() {
    const warning = document.createElement('div');
    warning.className = 'permission-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <h4>⚠️ Permissions Required</h4>
        <p>For the best experience, please allow access to:</p>
        <ul>
          <li>🎤 Microphone - for audio communication</li>
          <li>📹 Camera - for video communication</li>
          <li>🔔 Notifications - for alerts</li>
        </ul>
        <p>You can enable these in your browser settings.</p>
        <button onclick="this.parentElement.parentElement.remove()">Continue</button>
      </div>
    `;

    document.body.appendChild(warning);

    setTimeout(() => {
      if (document.body.contains(warning)) {
        warning.remove();
      }
    }, 8000);
  }

  async initializeCall() {
    try {
      console.log('🚀 Starting call initialization...');

      // Start media and socket in parallel for faster loading
      const mediaPromise = this.initializeMedia();
      this.connectSocket();

      // Wait for media to be ready
      await mediaPromise;

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

      // Balanced constraints for good quality and speed
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 20, max: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: { exact: true },
          noiseSuppression: { exact: true },
          autoGainControl: { exact: true },
          sampleRate: { ideal: 48000, min: 44100 },
          channelCount: { ideal: 2, min: 1 },
          latency: { ideal: 0.01, max: 0.1 }
        }
      };

      console.log('📞 Calling getUserMedia with enhanced constraints:', constraints);

      // Try with enhanced constraints first, fallback if needed
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (enhancedError) {
        console.log('Enhanced constraints failed, trying basic ones:', enhancedError);
        const basicConstraints = {
          video: { width: 640, height: 480, frameRate: 30 },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        };
        this.localStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

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

    // Notify other participants about media state change
    if (this.socket) {
      this.socket.emit('media-state-changed', {
        roomToken: this.roomToken,
        participantId: this.displayName,
        isVideoEnabled: this.isVideoEnabled,
        isAudioEnabled: this.isAudioEnabled
      });
    }
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

    // Notify other participants about media state change
    if (this.socket) {
      this.socket.emit('media-state-changed', {
        roomToken: this.roomToken,
        participantId: this.displayName,
        isVideoEnabled: this.isVideoEnabled,
        isAudioEnabled: this.isAudioEnabled
      });
    }
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

            let trackAdded = false;
            for (const track of tracks) {
              const sender = senders.find(s => s.track && s.track.kind === track.kind);
              if (sender) {
                console.log(`🔄 Replacing ${track.kind} track for participant:`, participantId);
                await sender.replaceTrack(track);
              } else {
                console.log(`➕ Adding new ${track.kind} track for participant:`, participantId);
                peerConnection.addTrack(track, this.localStream);
                trackAdded = true;
              }
            }

            // If we added a new track, create new offer to renegotiate
            if (trackAdded) {
              console.log(`🔄 Creating new offer for ${participantId} due to track addition`);
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);

              if (this.socket) {
                this.socket.emit('offer', {
                  roomToken: this.roomToken,
                  offer: offer,
                  targetId: participantId
                });
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
      timeout: 15000,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: false
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
    this.socket.on('media-state-changed', (data) => this.handleMediaStateChanged(data));
    this.socket.on('assistant-response', (data) => this.handleAssistantResponse(data));
  }

  handleMediaStateChanged(data) {
    console.log('🖥️ Media state changed for participant:', data.participantId, data);

    // Update participant info if we have it
    const participant = Array.from(this.participants.values()).find(p => p.displayName === data.participantId);
    if (participant) {
      participant.isVideoEnabled = data.isVideoEnabled;
      participant.isAudioEnabled = data.isAudioEnabled;
      console.log('🖥️ Updated participant media state:', participant);
    }

    // Force refresh of connection if this is about video being enabled
    if (data.isVideoEnabled && participant) {
      console.log('🖥️ Video was enabled, refreshing connection...');
      setTimeout(() => {
        const peerConnection = this.peerConnections.get(participant.id);
        if (peerConnection) {
          console.log('🖥️ Restarting ICE for participant:', participant.id);
          peerConnection.restartIce();
        }
      }, 1000);
    }
  }

  // WebRTC Functions (simplified)
  getOptimalWebRTCConfig() {
    const participantCount = this.participants.size;
    console.log('🖥️ Getting WebRTC config for participant count:', participantCount);

    // For 2 people (1-on-1), use optimized P2P with STUN only
    if (participantCount <= 2) {
      console.log('🖥️ Using optimized P2P configuration for 1-on-1 call');
      return {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 0, // Minimal for P2P
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all'
      };
    }

    // For group calls (3+), use full STUN configuration
    console.log('🖥️ Using full STUN configuration for group call');
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
  }

  async createPeerConnection(participantId) {
    const config = this.getOptimalWebRTCConfig();
    console.log('🖥️ Creating peer connection with config:', config);
    const peerConnection = new RTCPeerConnection(config);

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
      console.log('🖥️ Received remote stream from:', participantId, 'Event:', event);
      console.log('🖥️ Track kind:', event.track.kind, 'enabled:', event.track.enabled, 'readyState:', event.track.readyState);
      console.log('🖥️ Streams in event:', event.streams.length);

      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0];
        console.log('🖥️ Stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.enabled}:${t.readyState}`));

        const participant = this.participants.get(participantId);
        if (participant) {
          participant.stream = stream;
          this.updateRemoteVideo(stream);
          console.log('🖥️ Updated remote video for participant:', participant.displayName);
        } else {
          console.warn('🖥️ Received stream but participant not found:', participantId);
          this.updateRemoteVideo(stream);
        }
      } else {
        console.error('🖥️ No streams in ontrack event');
      }
    };

    // Enhanced connection monitoring
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state changed for ${participantId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        console.log('Connection failed, attempting reconnection...');
        setTimeout(() => this.handleReconnection(participantId), 1000);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${participantId}:`, peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart...');
        peerConnection.restartIce();
      }
    };

    if (this.localStream) {
      console.log('🖥️ Adding local tracks to peer connection for:', participantId);
      const tracks = this.localStream.getTracks();
      console.log('🖥️ Available tracks:', tracks.map(t => `${t.kind}:${t.enabled}:${t.readyState}`));

      tracks.forEach(track => {
        try {
          peerConnection.addTrack(track, this.localStream);
          console.log(`🖥️ Added ${track.kind} track to peer connection`);
        } catch (error) {
          console.error(`🖥️ Failed to add ${track.kind} track:`, error);
        }
      });
    } else {
      console.warn('🖥️ No local stream available when creating peer connection');
    }

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  async handleReconnection(participantId) {
    try {
      console.log(`Attempting reconnection for ${participantId}...`);
      const oldConnection = this.peerConnections.get(participantId);
      if (oldConnection) {
        oldConnection.close();
        this.peerConnections.delete(participantId);
      }

      // Create new connection
      const newConnection = await this.createPeerConnection(participantId);

      // Restart the call process
      if (this.socket) {
        this.socket.emit('request-reconnection', {
          roomToken: this.roomToken,
          targetId: participantId,
          displayName: this.displayName
        });
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      setTimeout(() => this.handleReconnection(participantId), 3000);
    }
  }

  updateRemoteVideo(stream) {
    console.log('🖥️ updateRemoteVideo called with stream:', stream?.id);
    console.log('🖥️ Stream tracks:', stream?.getTracks().map(t => `${t.kind}:${t.enabled}:${t.readyState}`));
    console.log('🖥️ Remote video element exists:', !!this.remoteVideo);

    if (this.remoteVideo && stream) {
      this.remoteVideo.srcObject = stream;

      // Force video to start playing
      this.remoteVideo.play().catch(e => {
        console.warn('🖥️ Could not auto-play remote video:', e);
      });

      if (this.remotePlaceholder) {
        this.remotePlaceholder.style.display = 'none';
      }

      console.log('🖥️ Remote video updated successfully');
    } else {
      console.warn('🖥️ Cannot update remote video - missing elements or stream');
    }
  }

  async handleUserJoined(data) {
    console.log('👋 Desktop - User joined:', data.displayName);
    console.log('🖥️ Connection type:', data.connectionType, 'P2P:', data.isP2P, 'Count:', data.participantCount);
    console.log('🖥️ Current local stream state:', this.localStream ? 'Available' : 'Not available');
    if (this.localStream) {
      console.log('🖥️ Local stream tracks when user joins:', this.localStream.getTracks().map(t => `${t.kind}:${t.enabled}:${t.readyState}`));
    }

    this.addParticipant({
      id: data.socketId,
      displayName: data.displayName,
      isLocal: false
    });

    const peerConnection = await this.createPeerConnection(data.socketId);
    console.log('🖥️ Creating offer for:', data.displayName);
    // Use optimized offer options for P2P
    const isP2P = data.isP2P || this.participants.size <= 2;
    const offerOptions = isP2P ? {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: false,
      voiceActivityDetection: false
    } : {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: false
    };
    console.log('🖥️ Creating offer with options:', offerOptions, 'P2P:', isP2P);
    const offer = await peerConnection.createOffer(offerOptions);
    console.log('🖥️ Offer SDP contains video:', offer.sdp.includes('m=video'));
    console.log('🖥️ Offer SDP contains audio:', offer.sdp.includes('m=audio'));
    await peerConnection.setLocalDescription(offer);

    console.log('🖥️ Sending offer to:', data.displayName);
    this.socket.emit('offer', {
      roomToken: this.roomToken,
      offer: offer,
      targetId: data.socketId
    });
  }

  async handleOffer(data) {
    console.log('🖥️ Received offer from:', data.from);
    console.log('🖥️ Received offer SDP contains video:', data.offer.sdp.includes('m=video'));
    console.log('🖥️ Received offer SDP contains audio:', data.offer.sdp.includes('m=audio'));

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

    // Apply large group optimizations for 8+ participants
    if (this.participantList) {
      if (count >= 8) {
        this.participantList.classList.add('large-group');
      } else {
        this.participantList.classList.remove('large-group');
      }
    }

    if (this.gridView) {
      if (count >= 8) {
        this.gridView.classList.add('large-group');
      } else {
        this.gridView.classList.remove('large-group');
      }
    }
  }

  updateParticipantsList() {
    if (!this.participantList) return;

    console.log('🔄 Updating desktop participants list UI');
    console.log('👥 Current participants:', Array.from(this.participants.values()).map(p => ({id: p.id, name: p.displayName, isLocal: p.isLocal})));

    // Clear all non-self participants
    const existingParticipants = this.participantList.querySelectorAll('.participant-item:not([data-peer="self"])');
    console.log('🗑️ Removing existing participants:', existingParticipants.length);
    existingParticipants.forEach(item => item.remove());

    // Add all participants except self
    let addedCount = 0;
    this.participants.forEach((participant, id) => {
      if (participant.isLocal) {
        console.log('⏭️ Skipping self participant:', participant.displayName);
        return; // Skip self
      }

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
          <button class="private-message-btn" title="Send private message" data-participant-id="${id}">💬</button>
        </div>
      `;

      this.participantList.appendChild(participantEl);
      addedCount++;

      // Add event listener for private message button
      const privateMessageBtn = participantEl.querySelector('.private-message-btn');
      if (privateMessageBtn) {
        privateMessageBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openPrivateMessage(id, participant.displayName);
        });
      }

      console.log('➕ Added participant to UI:', participant.displayName);
    });

    console.log(`✅ Desktop participants list updated: ${addedCount} remote participants added, ${this.participants.size} total participants`);
  }

  openPrivateMessage(participantId, participantName) {
    console.log(`💬 Opening private message for ${participantName}`);

    // Switch to chat mode and focus on private messaging
    if (this.desktopChatOverlay) {
      this.desktopChatOverlay.classList.remove('hidden');

      // Add private message indicator
      const chatHeader = this.desktopChatOverlay.querySelector('.desktop-chat-header');
      let privateIndicator = chatHeader.querySelector('.private-message-indicator');

      if (!privateIndicator) {
        privateIndicator = document.createElement('div');
        privateIndicator.className = 'private-message-indicator';
        chatHeader.appendChild(privateIndicator);
      }

      privateIndicator.innerHTML = `
        <span>💬 Private chat with ${participantName}</span>
        <button class="close-private-btn" onclick="this.parentElement.remove()">×</button>
      `;

      // Focus chat input
      if (this.desktopChatInput) {
        this.desktopChatInput.focus();
        this.desktopChatInput.placeholder = `Send private message to ${participantName}...`;
        this.desktopChatInput.dataset.privateTarget = participantId;
      }
    }
  }

  // Emoji Picker Functions
  setupEmojiPicker() {
    if (!this.emojiPicker) return;

    // Add event listeners to all emoji options
    const emojiOptions = this.emojiPicker.querySelectorAll('.emoji-option');
    emojiOptions.forEach(option => {
      option.addEventListener('click', () => {
        const emoji = option.dataset.emoji;
        this.insertEmoji(emoji);
        this.hideEmojiPicker();
      });
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.emojiPicker.contains(e.target) && !this.emojiToggleBtn.contains(e.target)) {
        this.hideEmojiPicker();
      }
    });
  }

  toggleEmojiPicker() {
    if (!this.emojiPicker) return;

    if (this.emojiPicker.classList.contains('hidden')) {
      this.showEmojiPicker();
    } else {
      this.hideEmojiPicker();
    }
  }

  showEmojiPicker() {
    if (this.emojiPicker) {
      this.emojiPicker.classList.remove('hidden');
    }
  }

  hideEmojiPicker() {
    if (this.emojiPicker) {
      this.emojiPicker.classList.add('hidden');
    }
  }

  insertEmoji(emoji) {
    if (!this.desktopChatInput) return;

    const cursorPosition = this.desktopChatInput.selectionStart;
    const textBefore = this.desktopChatInput.value.substring(0, cursorPosition);
    const textAfter = this.desktopChatInput.value.substring(this.desktopChatInput.selectionEnd);

    this.desktopChatInput.value = textBefore + emoji + textAfter;
    this.desktopChatInput.selectionStart = this.desktopChatInput.selectionEnd = cursorPosition + emoji.length;
    this.desktopChatInput.focus();
  }

  // Utility Functions
  startCallTimer() {
    this.callStartTime = Date.now();
    this.maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    this.warningShown = false;

    this.timerInterval = setInterval(() => {
      if (!this.timerValue) return;

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

      // Check for 8-hour limit
      const timeRemaining = this.maxSessionDuration - elapsed;
      const minutesRemaining = Math.floor(timeRemaining / 60000);

      if (minutesRemaining <= 10 && !this.warningShown) {
        this.showSessionWarning(minutesRemaining);
        this.warningShown = true;
      }

      if (elapsed >= this.maxSessionDuration) {
        this.handleSessionExpiration();
      }
    }, 1000);
  }

  showSessionWarning(minutesRemaining) {
    console.log(`⏰ Showing session warning: ${minutesRemaining} minutes remaining`);

    const modal = document.createElement('div');
    modal.className = 'session-warning-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="warning-header">
          <h3>⏰ Session Expiring Soon</h3>
        </div>
        <div class="warning-body">
          <p>This meeting will reach the 8-hour limit in ${minutesRemaining} minutes.</p>
          <p>As the host, you can migrate all participants to a new room.</p>
        </div>
        <div class="warning-actions">
          <button class="btn-primary migrate-btn" onclick="this.handleRoomMigration()">Migrate to New Room</button>
          <button class="btn-secondary dismiss-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Continue Session</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-migrate decision countdown
    setTimeout(() => {
      if (document.body.contains(modal)) {
        this.showFinalCountdown();
      }
    }, (minutesRemaining - 5) * 60000); // Show final countdown with 5 minutes left
  }

  showFinalCountdown() {
    console.log('🔔 Showing final countdown modal');

    const modal = document.createElement('div');
    modal.className = 'final-countdown-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="countdown-header">
          <h3>🚨 Final Warning</h3>
        </div>
        <div class="countdown-body">
          <p>You have 5 minutes to decide:</p>
          <div class="countdown-timer" id="finalCountdownTimer">5:00</div>
          <p>Choose to migrate participants or the session will end.</p>
        </div>
        <div class="countdown-actions">
          <button class="btn-primary migrate-btn" onclick="this.handleRoomMigration()">Migrate Now</button>
          <button class="btn-danger end-btn" onclick="this.endSession()">End Session</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Start 5-minute countdown
    let timeLeft = 5 * 60; // 5 minutes in seconds
    const countdownTimer = modal.querySelector('#finalCountdownTimer');

    const countdown = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (timeLeft <= 0) {
        clearInterval(countdown);
        this.endSession();
        modal.remove();
      }

      timeLeft--;
    }, 1000);
  }

  handleSessionExpiration() {
    console.log('⏰ Session has reached 8-hour limit');
    this.showFinalCountdown();
  }

  handleRoomMigration() {
    console.log('🔄 Initiating room migration...');

    if (this.socket) {
      this.socket.emit('request-room-migration', {
        roomToken: this.roomToken,
        hostName: this.displayName,
        participants: Array.from(this.participants.keys())
      });
    }

    // Show migration status
    const statusModal = document.createElement('div');
    statusModal.className = 'migration-status-modal';
    statusModal.innerHTML = `
      <div class="modal-content">
        <div class="migration-header">
          <h3>🔄 Migrating to New Room</h3>
        </div>
        <div class="migration-body">
          <div class="loading-spinner"></div>
          <p>Creating new room and transferring participants...</p>
        </div>
      </div>
    `;

    document.body.appendChild(statusModal);
  }

  endSession() {
    console.log('🔚 Ending session...');

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Notify all participants
    if (this.socket) {
      this.socket.emit('end-session', {
        roomToken: this.roomToken,
        reason: 'Session time limit reached'
      });
    }

    // Close all peer connections
    this.peerConnections.forEach(connection => {
      connection.close();
    });

    // Show session ended message
    const endModal = document.createElement('div');
    endModal.className = 'session-end-modal';
    endModal.innerHTML = `
      <div class="modal-content">
        <div class="end-header">
          <h3>📞 Session Ended</h3>
        </div>
        <div class="end-body">
          <p>The 8-hour session limit has been reached.</p>
          <p>Thank you for using KPA Messenger!</p>
        </div>
        <div class="end-actions">
          <button class="btn-primary" onclick="window.location.href='/'">Return to Home</button>
        </div>
      </div>
    `;

    document.body.appendChild(endModal);
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

  async handleVisibilityChange() {
    console.log('🖥️ Visibility changed:', document.hidden ? 'hidden' : 'visible');

    if (document.hidden) {
      // Page is hidden - try to enter Picture-in-Picture mode
      await this.enterPictureInPicture();
    } else {
      // Page is visible - exit Picture-in-Picture mode
      await this.exitPictureInPicture();
    }
  }

  handlePageHide() {
    console.log('🖥️ Page hide event');
    // Ensure media keeps running
    this.preventMediaInterruption();
  }

  handlePageShow() {
    console.log('🖥️ Page show event');
    // Restore normal operation
    this.exitPictureInPicture();
  }

  async enterPictureInPicture() {
    // Try remote video first (more important to see other participants)
    const videoToUse = (this.remoteVideo && this.remoteVideo.srcObject) ? this.remoteVideo : this.localVideo;

    if (!videoToUse || !videoToUse.srcObject) {
      console.log('🖥️ No video stream available for PiP');
      return;
    }

    try {
      // Check if Picture-in-Picture is supported
      if (!('pictureInPictureEnabled' in document)) {
        console.log('🖥️ Picture-in-Picture not supported');
        return;
      }

      // Check if already in Picture-in-Picture
      if (document.pictureInPictureElement) {
        console.log('🖥️ Already in Picture-in-Picture mode');
        return;
      }

      console.log('🖥️ Entering Picture-in-Picture mode with', videoToUse === this.remoteVideo ? 'remote' : 'local', 'video...');
      await videoToUse.requestPictureInPicture();
      console.log('✅ Entered Picture-in-Picture mode');

      // Add PiP event listeners
      videoToUse.addEventListener('leavepictureinpicture', () => {
        console.log('🖥️ Left Picture-in-Picture mode');
      });

    } catch (error) {
      console.warn('⚠️ Failed to enter Picture-in-Picture:', error.message);
      // Fallback: try the other video if available
      if (videoToUse === this.remoteVideo && this.localVideo && this.localVideo.srcObject) {
        console.log('🖥️ Trying fallback to local video...');
        try {
          await this.localVideo.requestPictureInPicture();
          console.log('✅ Entered Picture-in-Picture mode with local video');
        } catch (fallbackError) {
          console.warn('⚠️ Fallback also failed:', fallbackError.message);
        }
      }
    }
  }

  async exitPictureInPicture() {
    try {
      if (document.pictureInPictureElement) {
        console.log('🖥️ Exiting Picture-in-Picture mode...');
        await document.exitPictureInPicture();
        console.log('✅ Exited Picture-in-Picture mode');
      }
    } catch (error) {
      console.warn('⚠️ Failed to exit Picture-in-Picture:', error.message);
    }
  }

  async togglePictureInPicture() {
    console.log('🖼️ Toggle Picture-in-Picture button clicked');

    if (document.pictureInPictureElement) {
      // Currently in PiP mode, exit it
      await this.exitPictureInPicture();
    } else {
      // Not in PiP mode, enter it
      await this.enterPictureInPicture();
    }
  }

  preventMediaInterruption() {
    console.log('🖥️ Preventing media interruption...');

    // Ensure audio and video tracks remain enabled
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`🖥️ Track ${track.kind} enabled:`, track.enabled);
        // Don't disable tracks when page is hidden
      });
    }

    // Keep peer connections active
    this.peerConnections.forEach((pc, participantId) => {
      console.log(`🖥️ Peer connection ${participantId} state:`, pc.connectionState);
      if (pc.connectionState === 'connected' || pc.connectionState === 'connecting') {
        // Connection is good, keep it alive
        console.log(`🖥️ Keeping peer connection ${participantId} alive`);
      }
    });
  }
}

// Initialize when DOM is ready
console.log('⏳ Waiting for DOM to be ready...');
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM ready, initializing DesktopVideoCall...');
  window.desktopCall = new DesktopVideoCall();
});

console.log('📄 Desktop.js loaded successfully');