// Mobile Video Calling Interface - Complete Implementation

class MobileVideoCall {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.roomToken = null;
    this.displayName = null;
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
    this.callStartTime = null;
    this.timerInterval = null;
    this.currentView = 'speaker'; // 'speaker' or 'grid'
    this.participants = new Map();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.userNameTimeout = null;

    this.initializeElements();
    this.setupEventListeners();
    this.checkRoomToken();
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

    // Controls
    this.videoToggleBtn = document.getElementById('videoToggleBtn');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');
    this.leaveBtn = document.getElementById('leaveBtn');
    this.chatButton = document.getElementById('chatButton');
    this.shareButton = document.getElementById('shareButton');
    this.backButton = document.getElementById('backButton');
    this.expandIcon = document.getElementById('expandIcon');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');

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

    // Chat elements
    this.chatBubble = document.getElementById('chatBubble');
    this.mobileChatOverlay = document.getElementById('mobileChatOverlay');
    this.mobileChatMessages = document.getElementById('mobileChatMessages');
    this.mobileChatInput = document.getElementById('mobileChatInput');
    this.mobileChatSend = document.getElementById('mobileChatSend');
    this.closeChatBtn = document.getElementById('closeChatBtn');
    this.lastChatMessage = document.getElementById('lastChatMessage');

    // Bottom controls
    this.bottomControls = document.getElementById('bottomControls');
  }

  setupEventListeners() {
    // Touch gestures for view switching
    this.mainVideo.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.mainVideo.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    this.mainVideo.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // Local video tap to flip camera
    this.localVideo.addEventListener('click', this.flipCamera.bind(this));
    this.localPlaceholder.addEventListener('click', this.flipCamera.bind(this));

    // Control buttons
    this.videoToggleBtn.addEventListener('click', this.toggleVideo.bind(this));
    this.audioToggleBtn.addEventListener('click', this.toggleAudio.bind(this));
    this.leaveBtn.addEventListener('click', this.leaveCall.bind(this));
    this.chatButton.addEventListener('click', this.openChat.bind(this));
    this.shareButton.addEventListener('click', this.shareLink.bind(this));
    this.backButton.addEventListener('click', this.goBack.bind(this));
    this.expandIcon.addEventListener('click', this.toggleVideoSize.bind(this));
    this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));

    // Name form
    this.nameForm.addEventListener('submit', this.submitName.bind(this));

    // Chat functionality
    this.closeChatBtn.addEventListener('click', this.closeChat.bind(this));
    this.mobileChatSend.addEventListener('click', this.sendMessage.bind(this));
    this.mobileChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    this.chatBubble.addEventListener('click', this.openChat.bind(this));

    // User name display
    this.userNameDisplay.addEventListener('click', this.showUserName.bind(this));

    // Screen tap to toggle controls
    this.mainVideo.addEventListener('click', this.toggleControlsVisibility.bind(this));

    // Document visibility change (for PiP)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
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

    if (!name) return;

    this.displayName = name;
    this.displayedUserName.textContent = name;
    this.nameModal.classList.add('hidden');

    await this.initializeCall();
  }

  async initializeCall() {
    try {
      await this.initializeMedia();
      this.connectSocket();
      this.startCallTimer();
      this.showUserNameTemporarily();
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.showNotification('Failed to access camera/microphone', 'error');
    }
  }

  async initializeMedia() {
    try {
      console.log('🎬 Starting mobile media initialization...');

      // Mobile-optimized constraints
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          frameRate: { ideal: 24, min: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 44100 }
        }
      };

      console.log('🎥 Mobile requesting user media...');
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check what we actually got
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();

      this.isVideoEnabled = videoTracks.length > 0;
      this.isAudioEnabled = audioTracks.length > 0;

      console.log('✅ Mobile media stream obtained:', {
        video: this.isVideoEnabled,
        audio: this.isAudioEnabled,
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length
      });

      // Set video source
      if (this.isVideoEnabled) {
        this.localVideo.srcObject = this.localStream;
        this.localVideo.muted = true; // Prevent audio feedback
        this.localVideo.playsInline = true; // Important for iOS
        this.localPlaceholder.style.display = 'none';
        console.log('📹 Mobile video stream connected');
      } else {
        this.localVideo.srcObject = null;
        this.localPlaceholder.style.display = 'flex';
        console.log('📷 Mobile no video track, showing placeholder');
      }

      // Update UI controls
      this.updateMediaControlsUI();

      console.log('🚀 Mobile media initialization complete');

    } catch (error) {
      console.error('💥 Mobile error accessing media devices:', error);

      // Handle permission denials gracefully
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showNotification('Camera/microphone access denied. You can still join with chat only.', 'warning');
        this.createFallbackStream();
      } else if (error.name === 'NotFoundError') {
        this.showNotification('No camera/microphone found. Joining with chat only.', 'warning');
        this.createFallbackStream();
      } else {
        this.showNotification('Media access failed. Joining with chat only.', 'error');
        this.createFallbackStream();
      }
    }
  }

  getMediaPreference(key) {
    // Try to get from URL params first (for deep linking)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      return urlParams.get(key) === 'true';
    }

    // Try to get from sessionStorage (from login page)
    const stored = sessionStorage.getItem(key);
    if (stored !== null) {
      return stored === 'true';
    }

    // Default to enabled
    return true;
  }

  createFallbackStream() {
    // Create empty stream for chat-only mode
    this.localStream = new MediaStream();
    this.isVideoEnabled = false;
    this.isAudioEnabled = false;
    this.localVideo.srcObject = null;
    this.localPlaceholder.style.display = 'flex';
    this.updateMediaControlsUI();
  }

  updateMediaControlsUI() {
    // Update video toggle button
    const videoBtn = document.getElementById('videoBtn');
    if (videoBtn) {
      videoBtn.classList.toggle('disabled', !this.isVideoEnabled);
      videoBtn.title = this.isVideoEnabled ? 'Turn off camera' : 'Turn on camera';
    }

    // Update audio toggle button
    const audioBtn = document.getElementById('audioBtn');
    if (audioBtn) {
      audioBtn.classList.toggle('disabled', !this.isAudioEnabled);
      audioBtn.title = this.isAudioEnabled ? 'Mute microphone' : 'Unmute microphone';
    }
  }

  connectSocket() {
    this.socket = io({
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts || 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });
    });

    this.socket.on('user-joined', (data) => {
      this.handleUserJoined(data);
    });

    this.socket.on('user-left', (data) => {
      this.handleUserLeft(data);
    });

    this.socket.on('offer', async (data) => {
      await this.handleOffer(data);
    });

    this.socket.on('answer', async (data) => {
      await this.handleAnswer(data);
    });

    this.socket.on('ice-candidate', (data) => {
      this.handleIceCandidate(data);
    });

    this.socket.on('chat-message', (data) => {
      this.handleChatMessage(data);
    });

    this.socket.on('room-full', () => {
      this.showNotification('Meeting is full', 'error');
    });

    this.socket.on('room-not-found', () => {
      this.showNotification('Meeting not found', 'error');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📱 Mobile disconnected:', reason);
      this.showNotification('Connection lost, reconnecting...', 'warning');
      this.handleDisconnection();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('📱 Mobile reconnection attempt:', attemptNumber);
      this.showNotification(`Reconnecting... (${attemptNumber})`, 'warning');
    });

    this.socket.on('reconnect', () => {
      console.log('📱 Mobile reconnected to server');
      this.showNotification('Connected', 'success');
      this.rejoinRoom();
    });
  }

  async createPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          roomToken: this.roomToken,
          candidate: event.candidate
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.remoteVideo.srcObject = this.remoteStream;
      this.remotePlaceholder.style.display = 'none';
      this.speakerName.textContent = 'Participant';
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  async handleUserJoined(data) {
    console.log('User joined:', data.displayName);
    await this.createPeerConnection();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket.emit('offer', {
      roomToken: this.roomToken,
      offer: offer,
      targetId: data.socketId
    });
  }

  async handleOffer(data) {
    await this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.socket.emit('answer', {
      roomToken: this.roomToken,
      answer: answer,
      targetId: data.from
    });
  }

  async handleAnswer(data) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  handleIceCandidate(data) {
    if (this.peerConnection) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  handleUserLeft(data) {
    console.log('User left:', data.displayName);
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteVideo.srcObject = null;
    this.remotePlaceholder.style.display = 'flex';
    this.speakerName.textContent = 'Waiting for participant...';
  }

  // Touch gesture handling for view switching
  handleTouchStart(event) {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  handleTouchMove(event) {
    // Prevent scrolling during swipe
    event.preventDefault();
  }

  handleTouchEnd(event) {
    if (!event.changedTouches.length) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    // Minimum swipe distance
    const minSwipeDistance = 50;

    // Horizontal swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right
        if (this.currentView === 'grid') {
          this.switchToSpeakerView();
        }
      } else {
        // Swipe left
        if (this.currentView === 'speaker') {
          this.switchToGridView();
        }
      }
    }
  }

  switchToSpeakerView() {
    this.currentView = 'speaker';
    this.activeSpeakerView.style.display = 'block';
    this.gridView.style.display = 'none';
    this.mainVideo.classList.remove('grid-mode');
  }

  switchToGridView() {
    this.currentView = 'grid';
    this.activeSpeakerView.style.display = 'none';
    this.gridView.style.display = 'grid';
    this.mainVideo.classList.add('grid-mode');
  }

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

  async flipCamera() {
    if (!this.isVideoEnabled || !this.localStream) return;

    try {
      // Get current facing mode
      const videoTrack = this.localStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const currentFacing = settings.facingMode || 'user';

      // Determine new facing mode
      const newFacing = currentFacing === 'user' ? 'environment' : 'user';

      // Get new stream with flipped camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacing,
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 }
        },
        audio: false // Keep existing audio
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in existing stream
      if (this.localStream) {
        const oldVideoTrack = this.localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          this.localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        this.localStream.addTrack(newVideoTrack);
      }

      // Update video element
      this.localVideo.srcObject = this.localStream;

      // Update all peer connections
      this.updatePeerConnections(newVideoTrack);

      // Show feedback
      this.showFlipFeedback(newFacing);

    } catch (error) {
      console.error('Failed to flip camera:', error);
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'flip-notification';
      notification.textContent = 'Camera flip not available';
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  }

  updatePeerConnections(newVideoTrack) {
    if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender =>
        sender.track && sender.track.kind === 'video'
      );

      if (videoSender) {
        videoSender.replaceTrack(newVideoTrack);
      }
    }
  }

  showFlipFeedback(facingMode) {
    const feedback = document.createElement('div');
    feedback.className = 'flip-feedback';
    feedback.textContent = facingMode === 'user' ? '📷 Front camera' : '📷 Back camera';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 16px;
      font-size: 12px;
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out forwards;
    `;

    // Add CSS animation
    if (!document.getElementById('flip-animation-style')) {
      const style = document.createElement('style');
      style.id = 'flip-animation-style';
      style.textContent = `
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
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

  leaveCall() {
    if (this.socket) {
      this.socket.emit('leave-room', { roomToken: this.roomToken });
      this.socket.disconnect();
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    window.location.href = '/';
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

  goBack() {
    if (confirm('Are you sure you want to leave the call?')) {
      this.leaveCall();
    }
  }

  toggleVideoSize() {
    // Toggle between small and expanded video
    const smallVideo = document.getElementById('smallVideo');
    smallVideo.classList.toggle('expanded');
    this.expandIcon.textContent = smallVideo.classList.contains('expanded') ? '↙' : '↗';
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

        // Hide mobile browser bars on fullscreen
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch (e) {
            console.log('Orientation lock not available');
          }
        }
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

        // Unlock orientation on exit
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      this.showNotification('Fullscreen not supported', 'error');
    }
  }

  // Chat functionality
  openChat() {
    this.mobileChatOverlay.classList.add('visible');
    setTimeout(() => {
      this.mobileChatInput.focus();
    }, 300);
    this.chatBubble.style.display = 'none';
  }

  closeChat() {
    this.mobileChatOverlay.classList.remove('visible');
    this.chatBubble.style.display = 'block';
  }

  sendMessage() {
    const message = this.mobileChatInput.value.trim();
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

    this.mobileChatInput.value = '';
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

    this.mobileChatMessages.appendChild(messageElement);
    this.mobileChatMessages.scrollTop = this.mobileChatMessages.scrollHeight;
  }

  // Timer functionality
  startCallTimer() {
    this.callStartTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.callStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      this.timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  // User name display functionality
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

  // Controls visibility toggle
  toggleControlsVisibility() {
    const isHidden = this.bottomControls.classList.contains('hidden-controls');

    if (isHidden) {
      this.bottomControls.classList.remove('hidden-controls');
      this.callTimer.classList.remove('hidden-controls');
    } else {
      this.bottomControls.classList.add('hidden-controls');
      this.callTimer.classList.add('hidden-controls');
    }

    // Auto-show controls after 5 seconds
    if (!isHidden) {
      setTimeout(() => {
        this.bottomControls.classList.remove('hidden-controls');
        this.callTimer.classList.remove('hidden-controls');
      }, 5000);
    }
  }

  // Notification system
  showNotification(message, type = 'info') {
    this.videoNotice.textContent = message;
    this.videoNotice.className = `notification-banner ${type}`;
    this.videoNotice.classList.remove('hidden');

    setTimeout(() => {
      this.videoNotice.classList.add('hidden');
    }, 4000);
  }

  async handleVisibilityChange() {
    if (document.hidden) {
      // Browser is not visible, try to enter PiP mode
      await this.enterPictureInPicture();
    } else {
      // Browser is visible again, exit PiP mode
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
        this.showNotification('Video minimized', 'info');
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

  handleDisconnection() {
    console.log('📱 Handling mobile disconnection');

    // Initialize reconnection properties if they don't exist
    if (!this.reconnectAttempts) this.reconnectAttempts = 0;
    if (!this.maxReconnectAttempts) this.maxReconnectAttempts = 50;

    // Start aggressive reconnection for mobile sessions
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`📱 Mobile reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

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

  async rejoinRoom() {
    if (this.socket && this.roomToken && this.displayName) {
      console.log('🔄 Mobile rejoining room after reconnection');

      // First rejoin the room
      this.socket.emit('join-room', {
        roomToken: this.roomToken,
        displayName: this.displayName
      });

      // Then attempt to restore media if it was lost
      await this.attemptMediaRecovery();

      // Reset reconnection counter on successful rejoin
      this.reconnectAttempts = 0;
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    }
  }

  async attemptMediaRecovery() {
    try {
      console.log('🔧 Attempting mobile media recovery...');

      // Check if local stream is still active
      if (!this.localStream || this.localStream.getTracks().some(track => track.readyState !== 'live')) {
        console.log('📹 Mobile local stream lost, attempting to restore...');

        // Try to get media again with current preferences
        await this.initializeMedia();

        // If successful and we have a peer connection, update it
        if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
          try {
            // Replace tracks in existing connection
            const videoTrack = this.localStream.getVideoTracks()[0];
            const audioTrack = this.localStream.getAudioTracks()[0];

            const senders = this.peerConnection.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            const audioSender = senders.find(s => s.track && s.track.kind === 'audio');

            if (videoSender && videoTrack) {
              await videoSender.replaceTrack(videoTrack);
              console.log('✅ Mobile video track replaced');
            }

            if (audioSender && audioTrack) {
              await audioSender.replaceTrack(audioTrack);
              console.log('✅ Mobile audio track replaced');
            }
          } catch (error) {
            console.error('❌ Failed to replace mobile tracks:', error);
            // If track replacement fails, recreate peer connection
            await this.createPeerConnection();
          }
        }

        this.showNotification('Media connection restored', 'success');
        console.log('🎉 Mobile media recovery completed successfully');
      } else {
        console.log('✅ Mobile media stream is healthy, no recovery needed');
      }
    } catch (error) {
      console.error('💥 Mobile media recovery failed:', error);
      this.showNotification('Unable to restore video/audio. Continuing with chat only.', 'warning');
    }
  }
}

// Initialize the mobile video call when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MobileVideoCall();
});