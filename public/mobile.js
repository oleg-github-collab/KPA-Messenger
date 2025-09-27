// Mobile Video Calling Interface - Clean Implementation
console.log('📱 Mobile.js loading...');

class MobileVideoCall {
  constructor() {
    console.log('📱 Constructing MobileVideoCall...');

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
    this.callStartTime = null;
    this.timerInterval = null;
    this.currentView = 'speaker'; // 'speaker' or 'grid'
    this.userNameTimeout = null;

    // Touch handling
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.facingMode = 'user'; // For camera flip

    // Wake Lock for preventing sleep during video call
    this.wakeLock = null;

    // Initialize in sequence
    this.initializeElements();
    this.setupEventListeners();
    this.checkRoomToken();

    console.log('✅ MobileVideoCall constructor complete');
  }

  initializeElements() {
    console.log('📱 Initializing DOM elements...');

    // Video elements
    this.localVideo = document.getElementById('localVideo');
    this.remoteVideo = document.getElementById('remoteVideo');
    this.localPlaceholder = document.getElementById('localPlaceholder');
    this.remotePlaceholder = document.getElementById('remotePlaceholder');

    // Views
    this.activeSpeakerView = document.getElementById('activeSpeakerView');
    this.gridView = document.getElementById('gridView');
    this.mainVideo = document.getElementById('mainVideo');

    // Essential controls only
    this.videoToggleBtn = document.getElementById('videoToggleBtn');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');
    this.leaveBtn = document.getElementById('leaveBtn');
    this.chatButton = document.getElementById('chatButton');
    this.pipBtn = document.getElementById('pipBtn');
    this.backButton = document.getElementById('backButton');
    this.expandIcon = document.getElementById('expandIcon');

    console.log('📹 Video toggle button:', this.videoToggleBtn);
    console.log('🎤 Audio toggle button:', this.audioToggleBtn);

    // UI elements
    this.callTimer = document.getElementById('callTimer');
    this.timerValue = document.getElementById('timerValue');
    this.userNameDisplay = document.getElementById('userNameDisplay');
    this.displayedUserName = document.getElementById('displayedUserName');
    this.speakerName = document.getElementById('speakerName');
    this.videoNotice = document.getElementById('videoNotice');
    this.nameModal = document.getElementById('nameModal');
    this.nameForm = document.getElementById('nameForm');
    this.displayNameInput = document.getElementById('displayNameInput');
    this.nameError = document.getElementById('nameError');

    // Mobile media preferences
    this.enableVideoMobile = document.getElementById('enableVideoMobile');
    this.enableAudioMobile = document.getElementById('enableAudioMobile');

    // Chat elements - TikTok style
    this.floatingMessages = document.getElementById('floatingMessages');
    this.mobileChatOverlay = document.getElementById('mobileChatOverlay');
    this.mobileChatMessages = document.getElementById('mobileChatMessages');
    this.mobileChatInput = document.getElementById('mobileChatInput');
    this.mobileChatSend = document.getElementById('mobileChatSend');
    this.closeChatBtn = document.getElementById('closeChatBtn');

    // Reply functionality
    this.replyPreview = document.getElementById('replyPreview');
    this.replyToName = document.getElementById('replyToName');
    this.replyMessage = document.getElementById('replyMessage');
    this.replyCancel = document.getElementById('replyCancel');
    this.currentReply = null;

    console.log('✅ Mobile elements initialized successfully');
  }

  setupEventListeners() {
    console.log('📱 Setting up event listeners...');

    // Essential controls
    if (this.videoToggleBtn) {
      console.log('📹 Adding mobile video toggle event listener');
      this.videoToggleBtn.addEventListener('click', (e) => {
        console.log('📹 Mobile video toggle clicked');
        this.toggleVideo();
      });
    }

    if (this.audioToggleBtn) {
      console.log('🎤 Adding mobile audio toggle event listener');
      this.audioToggleBtn.addEventListener('click', (e) => {
        console.log('🎤 Mobile audio toggle clicked');
        this.toggleAudio();
      });
    }

    if (this.leaveBtn) {
      this.leaveBtn.addEventListener('click', () => this.leaveCall());
    }

    if (this.chatButton) {
      this.chatButton.addEventListener('click', () => this.openChatOverlay());
    }

    if (this.pipBtn) {
      this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
    }

    if (this.backButton) {
      this.backButton.addEventListener('click', () => this.leaveCall());
    }

    // Mobile-specific touch events
    if (this.localVideo) {
      this.localVideo.addEventListener('click', () => this.flipCamera());
    }

    if (this.expandIcon) {
      this.expandIcon.addEventListener('click', () => this.toggleVideoSize());
    }

    // Name form
    if (this.nameForm) {
      this.nameForm.addEventListener('submit', (e) => this.submitName(e));
    }

    // Chat functionality
    if (this.closeChatBtn) {
      console.log('💬 Adding mobile chat close event listener');
      this.closeChatBtn.addEventListener('click', (e) => {
        console.log('💬 Mobile chat close button clicked');
        this.closeChat();
      });
    }

    if (this.mobileChatSend) {
      this.mobileChatSend.addEventListener('click', () => this.sendMessage());
    }

    if (this.mobileChatInput) {
      this.mobileChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Reply functionality
    if (this.replyCancel) {
      this.replyCancel.addEventListener('click', () => this.cancelReply());
    }

    // Touch events for mobile gestures
    this.setupTouchEvents();

    // Window events
    window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    window.addEventListener('orientationchange', () => this.handleOrientationChange());

    // Picture-in-Picture events
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('pagehide', () => this.handlePageHide());
    window.addEventListener('pageshow', () => this.handlePageShow());

    console.log('✅ Mobile event listeners setup complete');
  }

  setupTouchEvents() {
    // Swipe gestures for mobile
    if (this.mainVideo) {
      this.mainVideo.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      });

      this.mainVideo.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;

        // Horizontal swipe (left/right)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            console.log('📱 Swipe right detected');
          } else {
            console.log('📱 Swipe left detected');
          }
        }
      });
    }
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
    console.log('👤 Showing mobile name modal...');
    if (this.nameModal) {
      this.nameModal.classList.remove('hidden');
      if (this.displayNameInput) {
        this.displayNameInput.focus();
      }
    }
  }

  async submitName(event) {
    console.log('📝 Submitting mobile name...');
    event.preventDefault();
    const name = this.displayNameInput.value.trim();

    if (!name) {
      this.showError('Name is required');
      return;
    }

    this.displayName = name;

    // Get media preferences from mobile checkboxes
    const videoEnabled = this.enableVideoMobile ? this.enableVideoMobile.checked : true;
    const audioEnabled = this.enableAudioMobile ? this.enableAudioMobile.checked : true;

    console.log('📱 Mobile media preferences:', { video: videoEnabled, audio: audioEnabled });

    // Update UI with name
    if (this.displayedUserName) this.displayedUserName.textContent = name;

    if (this.nameModal) {
      this.nameModal.classList.add('hidden');
    }

    console.log('✅ Name submitted:', name);
    await this.requestAllPermissions();
    await this.initializeCall(videoEnabled, audioEnabled);
  }

  async requestAllPermissions() {
    console.log('📱🔐 Requesting all necessary mobile permissions...');

    try {
      // Request microphone and camera permissions first
      console.log('📱🎤📹 Requesting mobile audio/video permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      // Test the stream briefly then stop it
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Mobile Audio/Video permissions granted');
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        console.log('📱🔔 Requesting mobile notification permission...');
        const permission = await Notification.requestPermission();
        console.log('📱📢 Mobile notification permission:', permission);
      }

      // Request wake lock permission for preventing sleep
      if ('wakeLock' in navigator) {
        try {
          console.log('📱⏰ Wake Lock API available');
        } catch (error) {
          console.log('📱⏰ Wake Lock API unavailable');
        }
      }

      console.log('✅ All mobile permission requests completed');

    } catch (error) {
      console.warn('⚠️ Some mobile permissions were denied:', error);
      this.showMobilePermissionWarning();
    }
  }

  showMobilePermissionWarning() {
    const warning = document.createElement('div');
    warning.className = 'mobile-permission-warning';
    warning.innerHTML = `
      <div class="mobile-warning-content">
        <h4>⚠️ Permissions Required</h4>
        <p>For the best mobile experience, please allow:</p>
        <ul>
          <li>🎤 Microphone - for voice calls</li>
          <li>📹 Camera - for video calls</li>
          <li>🔔 Notifications - for call alerts</li>
        </ul>
        <p>Tap browser settings to enable permissions.</p>
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

  async initializeCall(videoEnabled = true, audioEnabled = true) {
    try {
      console.log('📱 Starting mobile call initialization...', { video: videoEnabled, audio: audioEnabled });

      // Start media and socket in parallel for faster loading
      const mediaPromise = this.initializeMedia(videoEnabled, audioEnabled);
      this.connectSocket();

      // Wait for media to be ready
      await mediaPromise;

      // Start timer
      this.startCallTimer();

      // Show user name temporarily
      this.showUserNameTemporarily();

      console.log('✅ Mobile call initialization complete');
    } catch (error) {
      console.error('❌ Mobile call initialization failed:', error);
      this.showNotification('Failed to access camera/microphone', 'error');

      // Continue with chat-only mode
      this.createFallbackStream();
      this.connectSocket();
      this.startCallTimer();
      this.showUserNameTemporarily();
    }
  }

  async initializeMedia(videoEnabled = true, audioEnabled = true) {
    try {
      console.log('📱 Requesting mobile media access...', { video: videoEnabled, audio: audioEnabled });

      // Optimized mobile constraints for quality and performance
      const constraints = {
        video: videoEnabled ? {
          width: { ideal: 720, min: 360, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          facingMode: this.facingMode,
          frameRate: { ideal: 25, min: 15 }
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 },
          channelCount: { ideal: 1 }
        } : false
      };

      console.log('📞 Calling getUserMedia with enhanced mobile constraints:', constraints);

      // Try with enhanced constraints first, fallback if needed
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (enhancedError) {
        console.log('Enhanced mobile constraints failed, trying basic ones:', enhancedError);
        const basicConstraints = {
          video: videoEnabled ? { width: 640, height: 480, frameRate: 30, facingMode: this.facingMode } : false,
          audio: audioEnabled ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
        };
        this.localStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();

      this.isVideoEnabled = videoTracks.length > 0;
      this.isAudioEnabled = audioTracks.length > 0;

      console.log('✅ Mobile media obtained:', {
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
        console.log('📹 Mobile local video connected');
      } else {
        if (this.localVideo) this.localVideo.srcObject = null;
        if (this.localPlaceholder) {
          this.localPlaceholder.style.display = 'flex';
        }
        console.log('📷 No mobile video track, showing placeholder');
      }

      // Update UI immediately
      this.updateMediaControlsUI();

      // Add self to participant list
      this.addParticipant({
        id: 'self',
        displayName: this.displayName,
        isLocal: true
      });

      console.log('🎉 Mobile media initialization complete');

    } catch (error) {
      console.error('💥 Mobile media access error:', error);

      // Always create fallback and continue
      this.createFallbackStream();

      // Show specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showNotification('Camera/microphone access denied. Tap controls to try again.', 'warning');
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

      console.log('📱 Mobile media initialization complete (fallback mode)');
      throw error; // Re-throw so initializeCall can handle it
    }
  }

  createFallbackStream() {
    console.log('🔄 Creating mobile fallback stream (no media)...');
    this.localStream = new MediaStream();
    this.isVideoEnabled = false;
    this.isAudioEnabled = false;

    if (this.localVideo) this.localVideo.srcObject = null;
    if (this.localPlaceholder) this.localPlaceholder.style.display = 'flex';

    this.updateMediaControlsUI();
    console.log('✅ Mobile fallback stream created');
  }

  updateMediaControlsUI() {
    console.log('📱 Updating mobile media controls UI...', {
      video: this.isVideoEnabled,
      audio: this.isAudioEnabled
    });

    // Update video button
    if (this.videoToggleBtn) {
      this.videoToggleBtn.classList.toggle('disabled', !this.isVideoEnabled);
      this.videoToggleBtn.classList.toggle('muted', !this.isVideoEnabled);
      this.videoToggleBtn.title = this.isVideoEnabled ? 'Turn off camera' : 'Turn on camera';

      // Visual feedback for mobile
      const svg = this.videoToggleBtn.querySelector('svg');
      if (svg) {
        svg.style.opacity = this.isVideoEnabled ? '1' : '0.6';
        svg.style.filter = this.isVideoEnabled ? 'none' : 'grayscale(1)';
      }
      console.log('📹 Mobile video button updated:', this.isVideoEnabled);
    }

    // Update audio button
    if (this.audioToggleBtn) {
      this.audioToggleBtn.classList.toggle('disabled', !this.isAudioEnabled);
      this.audioToggleBtn.classList.toggle('muted', !this.isAudioEnabled);
      this.audioToggleBtn.title = this.isAudioEnabled ? 'Mute microphone' : 'Unmute microphone';

      // Visual feedback for mobile
      const svg = this.audioToggleBtn.querySelector('svg');
      if (svg) {
        svg.style.opacity = this.isAudioEnabled ? '1' : '0.6';
        svg.style.filter = this.isAudioEnabled ? 'none' : 'grayscale(1)';
      }
      console.log('🎤 Mobile audio button updated:', this.isAudioEnabled);
    }

    // Update video display
    if (this.isVideoEnabled) {
      if (this.localPlaceholder) this.localPlaceholder.style.display = 'none';
      if (this.localVideo) this.localVideo.style.display = 'block';
    } else {
      if (this.localPlaceholder) this.localPlaceholder.style.display = 'flex';
      if (this.localVideo) this.localVideo.style.display = 'none';
    }

    console.log('✅ Mobile media controls UI updated');
  }

  // Media Control Functions
  async toggleVideo() {
    console.log('📱 Mobile toggle video called, current state:', this.isVideoEnabled);

    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Toggle existing track
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
        console.log('📹 Mobile video track toggled to:', this.isVideoEnabled);
      } else if (!this.isVideoEnabled) {
        // Try to get video access
        console.log('📹 No video track, requesting mobile access...');
        await this.requestVideoAccess();
      }
    } else if (!this.isVideoEnabled) {
      // Try to initialize media
      console.log('📹 No stream, requesting mobile video access...');
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
      console.log('📹 Requesting mobile video access...');
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280, min: 480 },
          height: { ideal: 720, min: 320 }
        }
      });
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
      console.log('✅ Mobile video access granted');

      // Update peer connections
      await this.updatePeerConnectionTracks();
    } catch (error) {
      console.error('❌ Failed to get mobile video access:', error);
      this.showNotification('Camera access denied or unavailable', 'error');
    }
  }

  async toggleAudio() {
    console.log('📱 Mobile toggle audio called, current state:', this.isAudioEnabled);

    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        // Toggle existing track
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
        console.log('🎤 Mobile audio track toggled to:', this.isAudioEnabled);
      } else if (!this.isAudioEnabled) {
        // Try to get audio access
        console.log('🎤 No audio track, requesting mobile access...');
        await this.requestAudioAccess();
      }
    } else if (!this.isAudioEnabled) {
      // Try to initialize media
      console.log('🎤 No stream, requesting mobile audio access...');
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
      console.log('🎤 Requesting mobile audio access...');
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
      console.log('✅ Mobile audio access granted');

      // Update peer connections
      await this.updatePeerConnectionTracks();
    } catch (error) {
      console.error('❌ Failed to get mobile audio access:', error);
      this.showNotification('Microphone access denied or unavailable', 'error');
    }
  }

  async flipCamera() {
    console.log('📱 Flipping camera...');

    if (!this.isVideoEnabled) {
      this.showNotification('Turn on camera first', 'warning');
      return;
    }

    const newFacingMode = this.facingMode === 'user' ? 'environment' : 'user';
    console.log('📹 Attempting to switch from', this.facingMode, 'to', newFacingMode);

    let newStream = null;
    let oldVideoTrack = null;

    try {
      // Try exact facing mode first
      let videoConstraints = {
        facingMode: { exact: newFacingMode },
        width: { ideal: 1280, min: 480 },
        height: { ideal: 720, min: 320 }
      };

      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });
      } catch (exactError) {
        console.warn('⚠️ Exact facing mode failed, trying ideal:', exactError.message);

        // Fallback to ideal instead of exact
        videoConstraints.facingMode = { ideal: newFacingMode };
        newStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });
      }

      if (!newStream || newStream.getVideoTracks().length === 0) {
        throw new Error('No video tracks in new stream');
      }

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Store reference to old track for cleanup
      oldVideoTrack = this.localStream.getVideoTracks()[0];

      // Create new stream with audio from old stream + new video
      const audioTracks = this.localStream.getAudioTracks();
      const newLocalStream = new MediaStream([newVideoTrack, ...audioTracks]);

      // Stop and remove old video track
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        this.localStream.removeTrack(oldVideoTrack);
      }

      // Update stream reference
      this.localStream = newLocalStream;

      // Update local video element
      if (this.localVideo) {
        this.localVideo.srcObject = this.localStream;
      }

      // Update peer connections with new track
      await this.updatePeerConnectionTracks();

      // Update facing mode only after successful switch
      this.facingMode = newFacingMode;

      console.log('✅ Camera flipped successfully to', this.facingMode);
      this.showNotification(`Switched to ${this.facingMode === 'user' ? 'front' : 'back'} camera`, 'info');

    } catch (error) {
      console.error('❌ Failed to flip camera:', error);

      // Cleanup new stream if it was created
      if (newStream) {
        newStream.getTracks().forEach(track => track.stop());
      }

      // More specific error messages
      if (error.name === 'NotFoundError' || error.message.includes('device not found')) {
        this.showNotification(`${newFacingMode === 'user' ? 'Front' : 'Back'} camera not available`, 'error');
      } else if (error.name === 'NotAllowedError') {
        this.showNotification('Camera access denied', 'error');
      } else {
        this.showNotification('Failed to switch camera', 'error');
      }
    }
  }

  toggleVideoSize() {
    const isExpanded = this.smallVideo?.classList.contains('expanded');
    if (this.smallVideo) {
      this.smallVideo.classList.toggle('expanded', !isExpanded);
    }
    if (this.expandIcon) {
      this.expandIcon.textContent = isExpanded ? '↗' : '↙';
    }
  }

  async updatePeerConnectionTracks() {
    console.log('📱 Updating peer connection tracks...');
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
            console.error('Error updating mobile peer connection tracks for', participantId, ':', error);
          }
        })();

        updatePromises.push(updatePromise);
      }
    });

    await Promise.all(updatePromises);
    console.log('✅ All peer connection tracks updated');
  }

  // Enhanced Chat Functions - TikTok Style
  openChat() {
    console.log('💬 Opening mobile chat...');
    if (this.mobileChatOverlay) {
      this.mobileChatOverlay.style.display = 'flex';
      this.mobileChatOverlay.classList.add('active');
    }
    if (this.mobileChatInput) {
      setTimeout(() => this.mobileChatInput.focus(), 300);
    }
    console.log('✅ Mobile chat opened');
  }

  closeChat() {
    console.log('💬 Closing mobile chat...');
    if (this.mobileChatOverlay) {
      this.mobileChatOverlay.style.display = 'none';
      this.mobileChatOverlay.classList.remove('active');
      console.log('💬 Mobile chat overlay hidden');
    }
    // Cancel any active reply
    this.cancelReply();
    console.log('✅ Mobile chat closed successfully');
  }


  handleChatMessage(data) {
    console.log('📱 Received chat message:', data);
    this.displayChatMessage(data);
  }


  // Socket Connection
  connectSocket() {
    console.log('🔌 Connecting mobile to server...');

    this.socket = io({
      transports: ['websocket', 'polling'],
      timeout: 12000,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 4000,
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Mobile connected to server');
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Mobile disconnected:', reason);
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Mobile reconnected to server');
    });

    this.socket.on('user-joined', (data) => this.handleUserJoined(data));
    this.socket.on('user-left', (data) => this.handleUserLeft(data));
    this.socket.on('offer', (data) => this.handleOffer(data));
    this.socket.on('answer', (data) => this.handleAnswer(data));
    this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
    this.socket.on('chat-message', (data) => this.handleChatMessage(data));
    this.socket.on('media-state-changed', (data) => this.handleMediaStateChanged(data));
  }

  handleMediaStateChanged(data) {
    console.log('📱 Media state changed for participant:', data.participantId, data);

    // Update participant info if we have it
    const participant = Array.from(this.participants.values()).find(p => p.displayName === data.participantId);
    if (participant) {
      participant.isVideoEnabled = data.isVideoEnabled;
      participant.isAudioEnabled = data.isAudioEnabled;
      console.log('📱 Updated participant media state:', participant);
    }

    // Force refresh of connection if this is about video being enabled
    if (data.isVideoEnabled && participant) {
      console.log('📱 Video was enabled, refreshing connection...');
      setTimeout(() => {
        const peerConnection = this.peerConnections.get(participant.id);
        if (peerConnection) {
          console.log('📱 Restarting ICE for participant:', participant.id);
          peerConnection.restartIce();
        }
      }, 1000);
    }
  }

  // WebRTC Functions (simplified for mobile)
  async createPeerConnection(participantId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceGatheringTimeoutMs: 5000
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
      console.log('📱 Received remote stream from:', participantId, 'Event:', event);
      console.log('📱 Streams in event:', event.streams.length);
      console.log('📱 Tracks in event:', event.track);

      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0];
        console.log('📱 Stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.enabled}`));

        const participant = this.participants.get(participantId);
        if (participant) {
          participant.stream = stream;
          this.updateRemoteVideo(stream, participant.displayName);
          console.log('🎥 Remote video stream assigned to participant:', participant.displayName);
        } else {
          console.warn('⚠️ Received stream but participant not found:', participantId);
          // Try to update video anyway in case participant isn't properly tracked
          this.updateRemoteVideo(stream, `User ${participantId.substring(0, 8)}`);
        }
      } else {
        console.error('❌ No streams in ontrack event');
      }
    };

    // Enhanced connection monitoring for mobile
    peerConnection.onconnectionstatechange = () => {
      console.log(`📱 Connection state changed for ${participantId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        console.log('📱 Connection failed, attempting reconnection...');
        setTimeout(() => this.handleReconnection(participantId), 1000);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`📱 ICE connection state for ${participantId}:`, peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('📱 ICE connection failed, attempting restart...');
        peerConnection.restartIce();
      }
    };

    if (this.localStream) {
      console.log('📱 Adding local stream tracks to peer connection for:', participantId);
      console.log('📱 Local stream tracks:', this.localStream.getTracks().map(t => `${t.kind}:${t.enabled}:${t.readyState}`));
      this.localStream.getTracks().forEach(track => {
        console.log(`📱 Adding ${track.kind} track (enabled: ${track.enabled}, ready: ${track.readyState})`);
        peerConnection.addTrack(track, this.localStream);
      });
    } else {
      console.warn('📱 No local stream available when creating peer connection for:', participantId);
    }

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  async handleReconnection(participantId) {
    try {
      console.log(`📱 Attempting reconnection for ${participantId}...`);
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
      console.error('📱 Reconnection failed:', error);
      setTimeout(() => this.handleReconnection(participantId), 3000);
    }
  }

  updateRemoteVideo(stream, participantName = '') {
    console.log('📱 Updating remote video with stream:', stream?.id, 'participant:', participantName);
    if (this.remoteVideo && stream) {
      this.remoteVideo.srcObject = stream;
      this.remoteVideo.style.display = 'block';

      if (this.remotePlaceholder) {
        this.remotePlaceholder.style.display = 'none';
      }

      // Update speaker name
      if (this.speakerName && participantName) {
        this.speakerName.textContent = participantName;
      }

      console.log('✅ Mobile remote video updated successfully');
    } else {
      console.warn('⚠️ Cannot update remote video - missing video element or stream');
    }
  }

  async handleUserJoined(data) {
    console.log('👋 Mobile - User joined:', data.displayName);
    console.log('📱 Current local stream state:', this.localStream ? 'Available' : 'Not available');
    if (this.localStream) {
      console.log('📱 Local stream tracks when user joins:', this.localStream.getTracks().map(t => `${t.kind}:${t.enabled}:${t.readyState}`));
    }

    this.addParticipant({
      id: data.socketId,
      displayName: data.displayName,
      isLocal: false
    });

    const peerConnection = await this.createPeerConnection(data.socketId);
    console.log('📱 Creating offer for:', data.displayName);
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: false
    });
    console.log('📱 Offer SDP contains video:', offer.sdp.includes('m=video'));
    console.log('📱 Offer SDP contains audio:', offer.sdp.includes('m=audio'));
    await peerConnection.setLocalDescription(offer);

    console.log('📱 Sending offer to:', data.displayName);
    this.socket.emit('offer', {
      roomToken: this.roomToken,
      offer: offer,
      targetId: data.socketId
    });
  }

  async handleOffer(data) {
    console.log('📱 Received offer from:', data.from);
    console.log('📱 Received offer SDP contains video:', data.offer.sdp.includes('m=video'));
    console.log('📱 Received offer SDP contains audio:', data.offer.sdp.includes('m=audio'));

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
    console.log('👋 Mobile - User left:', data.displayName);
    const peerConnection = this.peerConnections.get(data.socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(data.socketId);
    }
    this.removeParticipant(data.socketId);
  }

  // Participant Management
  addParticipant(participant) {
    console.log('➕ Adding participant to mobile:', participant.displayName);
    this.participants.set(participant.id, participant);
    console.log('📱 Added participant:', participant.displayName);
    console.log('📱 Total participants on mobile:', this.participants.size);
  }

  removeParticipant(participantId) {
    const participant = this.participants.get(participantId);
    if (participant) {
      console.log('📱 Removed participant:', participant.displayName);
    }
    this.participants.delete(participantId);
    console.log('📱 Total participants on mobile:', this.participants.size);
  }

  // Utility Functions
  startCallTimer() {
    this.callStartTime = Date.now();

    // Request wake lock to keep screen on during call
    this.requestWakeLock();

    this.timerInterval = setInterval(() => {
      if (!this.timerValue) return;

      const elapsed = Date.now() - this.callStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.timerValue.textContent = timeString;

      // Re-request wake lock if it was lost
      if (!this.wakeLock) {
        this.requestWakeLock();
      }
    }, 1000);

    // Handle visibility change to re-request wake lock
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.callStartTime) {
        this.requestWakeLock();
      }
    });
  }

  showUserNameTemporarily() {
    if (this.userNameDisplay) {
      this.userNameDisplay.style.opacity = '1';
      this.userNameDisplay.style.pointerEvents = 'auto';

      if (this.userNameTimeout) {
        clearTimeout(this.userNameTimeout);
      }

      this.userNameTimeout = setTimeout(() => {
        if (this.userNameDisplay) {
          this.userNameDisplay.style.opacity = '0';
          this.userNameDisplay.style.pointerEvents = 'none';
        }
      }, 5000);
    }
  }

  showError(message) {
    if (this.nameError) {
      this.nameError.textContent = message;
      this.nameError.classList.remove('hidden');
    }
  }

  showNotification(message, type = 'info') {
    console.log(`📱 ${type.toUpperCase()}: ${message}`);
    if (this.videoNotice) {
      this.videoNotice.textContent = message;
      this.videoNotice.className = `notification-banner ${type}`;
      this.videoNotice.classList.remove('hidden');

      setTimeout(() => {
        this.videoNotice.classList.add('hidden');
      }, 4000);
    }
  }

  leaveCall() {
    if (confirm('Are you sure you want to leave the call?')) {
      this.endSession();
    }
  }

  async endSession() {
    try {
      // Call server to end meeting if this user is host
      const token = sessionStorage.getItem('authToken');
      if (token && this.roomToken) {
        try {
          await fetch(`/api/meetings/${this.roomToken}/end`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Error ending meeting on server:', error);
        }
      }

      this.cleanupCall();
      window.location.href = '/';
    } catch (error) {
      console.error('Error in endSession:', error);
      this.cleanupCall();
      window.location.href = '/';
    }
  }

  // TikTok-style Chat Functions
  openChatOverlay() {
    if (this.mobileChatOverlay) {
      this.mobileChatOverlay.classList.add('active');
      if (this.mobileChatInput) {
        setTimeout(() => this.mobileChatInput.focus(), 300);
      }
    }
  }

  closeChatOverlay() {
    if (this.mobileChatOverlay) {
      this.mobileChatOverlay.classList.remove('active');
      this.clearReply();
    }
  }

  sendMessage() {
    const messageText = this.mobileChatInput?.value.trim();
    if (!messageText || !this.socket || !this.roomToken) return;

    const messageData = {
      roomToken: this.roomToken,
      message: messageText,
      timestamp: Date.now(),
      participantId: this.socket.id,
      displayName: this.displayName || 'Anonymous',
      from: this.displayName || 'Anonymous',
      replyTo: this.currentReply
    };

    // Send message to server
    this.socket.emit('chat-message', messageData);

    // Display own message immediately
    this.displayChatMessage(messageData);

    this.mobileChatInput.value = '';
    this.clearReply();

    // Auto-close chat after sending on mobile
    setTimeout(() => this.closeChatOverlay(), 1000);
  }

  displayChatMessage(data) {
    // Add to floating messages (TikTok style)
    this.addFloatingMessage(data);

    // Add to chat overlay
    this.addChatMessage(data);
  }

  addFloatingMessage(data) {
    if (!this.floatingMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'floating-message';

    // Handle replies
    if (data.replyTo) {
      const replyEl = document.createElement('div');
      replyEl.className = 'floating-reply';
      replyEl.innerHTML = `<span class="reply-indicator">↪</span> ${data.replyTo.displayName}: ${data.replyTo.message.substring(0, 30)}...`;
      messageEl.appendChild(replyEl);
    }

    const contentEl = document.createElement('div');
    contentEl.className = 'floating-content';
    contentEl.innerHTML = `
      <div class="floating-author">${data.displayName}</div>
      <div class="floating-text">${data.message}</div>
    `;
    messageEl.appendChild(contentEl);

    // Add click handler for replies
    messageEl.addEventListener('click', () => {
      this.setReply(data);
      this.openChatOverlay();
    });

    // Insert at top and animate
    this.floatingMessages.insertBefore(messageEl, this.floatingMessages.firstChild);

    // Remove old messages (keep max 5)
    const messages = this.floatingMessages.querySelectorAll('.floating-message');
    if (messages.length > 5) {
      for (let i = 5; i < messages.length; i++) {
        messages[i].remove();
      }
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.style.animation = 'slideOutLeft 0.3s ease-in';
        setTimeout(() => messageEl.remove(), 300);
      }
    }, 10000);
  }

  addChatMessage(data) {
    if (!this.mobileChatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${data.participantId === this.socket?.id ? 'own' : ''}`;

    const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageEl.innerHTML = `
      <div class="message-header">
        <span class="message-author">${data.displayName}</span>
        <span class="message-time">${time}</span>
      </div>
      ${data.replyTo ? `
        <div class="message-reply">
          <span class="reply-indicator">↪</span>
          <span class="reply-to">${data.replyTo.displayName}:</span>
          <span class="reply-text">${data.replyTo.message}</span>
        </div>
      ` : ''}
      <div class="message-content">${data.message}</div>
    `;

    // Add click handler for replies
    messageEl.addEventListener('click', () => {
      if (data.participantId !== this.socket?.id) {
        this.setReply(data);
      }
    });

    // Remove welcome message if it exists
    const welcome = this.mobileChatMessages.querySelector('.chat-welcome');
    if (welcome) {
      welcome.remove();
    }

    this.mobileChatMessages.appendChild(messageEl);
    this.mobileChatMessages.scrollTop = this.mobileChatMessages.scrollHeight;
  }

  setReply(messageData) {
    if (!this.replyPreview || !messageData) return;

    this.currentReply = {
      participantId: messageData.participantId,
      displayName: messageData.displayName,
      message: messageData.message
    };

    this.replyToName.textContent = messageData.displayName;
    this.replyMessage.textContent = messageData.message.length > 50
      ? messageData.message.substring(0, 50) + '...'
      : messageData.message;

    this.replyPreview.style.display = 'block';

    if (this.mobileChatInput) {
      this.mobileChatInput.focus();
    }
  }

  clearReply() {
    if (this.replyPreview) {
      this.replyPreview.style.display = 'none';
      this.currentReply = null;
    }
  }

  cleanupCall() {
    // Release wake lock when call ends
    this.releaseWakeLock();

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
    if (this.userNameTimeout) {
      clearTimeout(this.userNameTimeout);
    }
  }

  handleBeforeUnload() {
    this.cleanupCall();
  }

  handleOrientationChange() {
    // Handle mobile orientation changes
    setTimeout(() => {
      console.log('📱 Orientation changed');
    }, 100);
  }

  async handleVisibilityChange() {
    console.log('📱 Visibility changed:', document.hidden ? 'hidden' : 'visible');

    if (document.hidden) {
      // Page is hidden - try to enter Picture-in-Picture mode
      await this.enterPictureInPicture();
    } else {
      // Page is visible - exit Picture-in-Picture mode
      await this.exitPictureInPicture();
    }
  }

  handlePageHide() {
    console.log('📱 Page hide event');
    // Ensure media keeps running
    this.preventMediaInterruption();
  }

  handlePageShow() {
    console.log('📱 Page show event');
    // Restore normal operation
    this.exitPictureInPicture();
  }

  async enterPictureInPicture() {
    // Try remote video first (more important to see other participants)
    const videoToUse = (this.remoteVideo && this.remoteVideo.srcObject) ? this.remoteVideo : this.localVideo;

    if (!videoToUse || !videoToUse.srcObject) {
      console.log('📱 No video stream available for PiP');
      return;
    }

    try {
      // Check if Picture-in-Picture is supported
      if (!('pictureInPictureEnabled' in document)) {
        console.log('📱 Picture-in-Picture not supported');
        return;
      }

      // Check if already in Picture-in-Picture
      if (document.pictureInPictureElement) {
        console.log('📱 Already in Picture-in-Picture mode');
        return;
      }

      console.log('📱 Entering Picture-in-Picture mode with', videoToUse === this.remoteVideo ? 'remote' : 'local', 'video...');
      await videoToUse.requestPictureInPicture();
      console.log('✅ Entered Picture-in-Picture mode');

      // Add PiP event listeners
      videoToUse.addEventListener('leavepictureinpicture', () => {
        console.log('📱 Left Picture-in-Picture mode');
      });

    } catch (error) {
      console.warn('⚠️ Failed to enter Picture-in-Picture:', error.message);
      // Fallback: try the other video if available
      if (videoToUse === this.remoteVideo && this.localVideo && this.localVideo.srcObject) {
        console.log('📱 Trying fallback to local video...');
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
        console.log('📱 Exiting Picture-in-Picture mode...');
        await document.exitPictureInPicture();
        console.log('✅ Exited Picture-in-Picture mode');
      }
    } catch (error) {
      console.warn('⚠️ Failed to exit Picture-in-Picture:', error.message);
    }
  }

  async togglePictureInPicture() {
    console.log('📱 Toggle Picture-in-Picture button clicked');

    if (document.pictureInPictureElement) {
      // Currently in PiP mode, exit it
      await this.exitPictureInPicture();
    } else {
      // Not in PiP mode, enter it
      await this.enterPictureInPicture();
    }
  }

  preventMediaInterruption() {
    console.log('📱 Preventing media interruption...');

    // Ensure audio and video tracks remain enabled
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`📱 Track ${track.kind} enabled:`, track.enabled);
        // Don't disable tracks when page is hidden
      });
    }

    // Keep peer connections active
    this.peerConnections.forEach((pc, participantId) => {
      console.log(`📱 Peer connection ${participantId} state:`, pc.connectionState);
      if (pc.connectionState === 'connected' || pc.connectionState === 'connecting') {
        // Connection is good, keep it alive
        console.log(`📱 Keeping peer connection ${participantId} alive`);
      }
    });
  }

  // Wake Lock API methods to prevent screen sleep during video calls
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('📱 Wake lock activated - screen will stay on during call');

        this.wakeLock.addEventListener('release', () => {
          console.log('📱 Wake lock released');
        });
      } else {
        console.log('📱 Wake Lock API not supported on this device');
      }
    } catch (err) {
      console.error('📱 Failed to request wake lock:', err);
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('📱 Wake lock released manually');
      } catch (err) {
        console.error('📱 Failed to release wake lock:', err);
      }
    }
  }
}

// Initialize when DOM is ready
console.log('⏳ Waiting for mobile DOM to be ready...');
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Mobile DOM ready, initializing MobileVideoCall...');
  window.mobileCall = new MobileVideoCall();
});

console.log('📱 Mobile.js loaded successfully');