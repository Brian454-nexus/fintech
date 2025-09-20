// Advanced Face-to-Phone Fraud Detection System
// Enhanced JavaScript with AI Features and Competitive Edge

class AdvancedFaceToPhoneApp {
    constructor() {
        this.currentView = 'dashboard';
        this.isEnrolled = {
            face: false,
            voice: false,
            pin: false
        };
        this.camera = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isProcessing = false;
        this.currentUser = 'demo_user';
        this.showingTutorial = false;
        this.tutorialStep = 0;
        
        // Advanced AI Features
        this.aiInsights = {};
        this.behavioralPatterns = {};
        this.deviceFingerprint = null;
        this.realTimeAnalytics = {};
        
        // Competitive Features
        this.riskScore = 0;
        this.fraudPredictions = {};
        this.userTrustScore = 0.85;
        this.systemPerformance = {};
        
        this.init();
    }

    async init() {
        // Hide loading screen after initialization
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 2000);

        // Initialize advanced features
        await this.initializeAdvancedFeatures();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize camera
        await this.initCamera();
        
        // Check enrollment status
        await this.checkEnrollmentStatus();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Show welcome tutorial if first time
        setTimeout(() => {
            this.showWelcomeTutorial();
        }, 3000);
        
        console.log('🚀 Advanced Face-to-Phone App Initialized');
        console.log('🤖 AI Features: Enabled');
        console.log('🔒 Biometric Auth: Ready');
        console.log('📊 Analytics: Active');
    }

    async initializeAdvancedFeatures() {
        try {
            // Generate device fingerprint
            this.deviceFingerprint = await this.generateDeviceFingerprint();
            
            // Initialize behavioral tracking
            this.initializeBehavioralTracking();
            
            // Load AI insights
            await this.loadAIInsights();
            
            // Initialize real-time analytics
            this.initializeRealTimeAnalytics();
            
            console.log('🤖 Advanced AI features initialized');
        } catch (error) {
            console.error('Failed to initialize advanced features:', error);
        }
    }

    async generateDeviceFingerprint() {
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints
        };
        
        // Generate hash
        const fingerprintString = JSON.stringify(fingerprint);
        const hash = await this.hashString(fingerprintString);
        
        return {
            hash: hash,
            data: fingerprint,
            confidence: 0.95
        };
    }

    async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    initializeBehavioralTracking() {
        // Track user interactions for behavioral analysis
        this.behavioralPatterns = {
            clickPatterns: [],
            scrollPatterns: [],
            timingPatterns: [],
            navigationPatterns: []
        };
        
        // Track clicks
        document.addEventListener('click', (e) => {
            this.behavioralPatterns.clickPatterns.push({
                timestamp: Date.now(),
                target: e.target.tagName,
                x: e.clientX,
                y: e.clientY
            });
        });
        
        // Track scroll patterns
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.behavioralPatterns.scrollPatterns.push({
                    timestamp: Date.now(),
                    scrollY: window.scrollY,
                    scrollX: window.scrollX
                });
            }, 100);
        });
        
        // Track timing patterns
        this.behavioralPatterns.timingPatterns.push({
            timestamp: Date.now(),
            action: 'app_start',
            duration: 0
        });
    }

    async loadAIInsights() {
        try {
            const response = await fetch(`/api/get-ai-insights?user_id=${this.currentUser}`);
            this.aiInsights = await response.json();
            
            // Update UI with AI insights
            this.updateAIInsightsUI();
        } catch (error) {
            console.error('Failed to load AI insights:', error);
        }
    }

    initializeRealTimeAnalytics() {
        // Start real-time analytics updates
        setInterval(() => {
            this.updateRealTimeAnalytics();
        }, 5000);
    }

    updateRealTimeAnalytics() {
        // Simulate real-time analytics updates
        this.realTimeAnalytics = {
            activeUsers: Math.floor(Math.random() * 1000) + 500,
            fraudAttempts: Math.floor(Math.random() * 10),
            systemLoad: Math.random() * 100,
            responseTime: Math.random() * 200 + 50
        };
    }

    updateAIInsightsUI() {
        // Update dashboard with AI insights
        const insightsContainer = document.getElementById('aiInsights');
        if (insightsContainer) {
            insightsContainer.innerHTML = `
                <div class="ai-insight-card">
                    <h4>🤖 AI Insights</h4>
                    <div class="insight-item">
                        <span class="insight-label">Fraud Detection Rate:</span>
                        <span class="insight-value">${this.aiInsights.fraud_trends?.fraud_rate_today?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div class="insight-item">
                        <span class="insight-label">System Accuracy:</span>
                        <span class="insight-value">${this.aiInsights.system_performance?.detection_accuracy || '98.5'}%</span>
                    </div>
                    <div class="insight-item">
                        <span class="insight-label">User Trust Score:</span>
                        <span class="insight-value">${(this.userTrustScore * 100).toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Form submissions
        document.getElementById('transactionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processTransaction(e);
        });

        // Camera controls
        document.getElementById('enrollFaceBtn')?.addEventListener('click', () => {
            this.enrollFace();
        });

        document.getElementById('verifyFaceBtn')?.addEventListener('click', () => {
            this.verifyFace();
        });

        document.getElementById('enrollVoiceBtn')?.addEventListener('click', () => {
            this.enrollVoice();
        });

        document.getElementById('verifyVoiceBtn')?.addEventListener('click', () => {
            this.verifyVoice();
        });

        // Modal controls
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('transactionModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'transactionModal') {
                this.closeModal();
            }
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}View`).classList.add('active');

        this.currentView = viewName;

        // Load view-specific data
        switch(viewName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'biometric':
                this.loadBiometricData();
                break;
            case 'transactions':
                this.loadTransactionsData();
                break;
            case 'security':
                this.loadSecurityData();
                break;
        }
    }

    async initCamera() {
        try {
            this.camera = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            const video = document.getElementById('faceVideo');
            if (video) {
                video.srcObject = this.camera;
            }
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showToast('Camera access denied. Please enable camera permissions.', 'error');
        }
    }

    async checkEnrollmentStatus() {
        try {
            const response = await fetch(`/api/get-enrollment-status?user_id=${this.currentUser}`);
            const status = await response.json();
            
            this.isEnrolled.face = status.face_enrolled;
            this.isEnrolled.voice = status.voice_enrolled;
            this.isEnrolled.pin = status.pin_set;
            
            this.updateEnrollmentStatus();
            
        } catch (error) {
            console.error('Failed to check enrollment status:', error);
            // Set default values for demo
            this.isEnrolled.face = false;
            this.isEnrolled.voice = false;
            this.isEnrolled.pin = false;
            this.updateEnrollmentStatus();
        }
    }

    showWelcomeTutorial() {
        if (this.showingTutorial) return;
        
        this.showingTutorial = true;
        this.tutorialStep = 0;
        
        const tutorialSteps = [
            {
                title: "Welcome to Face-to-Phone! 🚀",
                message: "Your AI-powered fraud detection system. Let's get you set up!",
                action: "Next"
            },
            {
                title: "Step 1: Enroll Your Biometrics 🔐",
                message: "First, let's secure your account with face and voice recognition.",
                action: "Go to Biometric",
                target: "biometric"
            },
            {
                title: "Step 2: Test Fraud Detection 🛡️",
                message: "See how our AI detects suspicious transactions in real-time.",
                action: "Try It Now",
                target: "security"
            },
            {
                title: "Step 3: Process Transactions 💰",
                message: "Make secure transactions with biometric verification.",
                action: "Start Trading",
                target: "transactions"
            }
        ];
        
        this.showTutorialStep(tutorialSteps[0], () => {
            this.showTutorialStep(tutorialSteps[1], () => {
                this.showTutorialStep(tutorialSteps[2], () => {
                    this.showTutorialStep(tutorialSteps[3], () => {
                        this.showingTutorial = false;
                    });
                });
            });
        });
    }

    showTutorialStep(step, nextCallback) {
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        modal.innerHTML = `
            <div class="tutorial-content">
                <div class="tutorial-header">
                    <h3>${step.title}</h3>
                    <button class="tutorial-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="tutorial-body">
                    <p>${step.message}</p>
                </div>
                <div class="tutorial-footer">
                    <button class="btn primary" onclick="app.handleTutorialAction('${step.action}', '${step.target || ''}', ${nextCallback ? 'true' : 'false'})">
                        ${step.action}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-advance after 5 seconds if no action
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
                if (nextCallback) nextCallback();
            }
        }, 5000);
    }

    handleTutorialAction(action, target, hasNext) {
        // Remove tutorial modal
        const modal = document.querySelector('.tutorial-modal');
        if (modal) modal.remove();
        
        if (target) {
            this.switchView(target);
        }
        
        if (hasNext) {
            setTimeout(() => {
                this.showWelcomeTutorial();
            }, 1000);
        }
    }

    async loadDashboardData() {
        try {
            // Load fraud statistics
            const alertsResponse = await fetch('/api/get-alerts');
            const alertsData = await alertsResponse.json();
            
            const transactionsResponse = await fetch('/api/get-transactions');
            const transactionsData = await transactionsResponse.json();

            // Update fraud blocked count
            const fraudCount = alertsData.alerts.filter(alert => alert.status === 'active').length;
            document.getElementById('fraudBlocked').textContent = fraudCount;

            // Update biometric verifications (simulated)
            const biometricCount = Math.floor(Math.random() * 50) + 20;
            document.getElementById('biometricVerified').textContent = biometricCount;

            // Update transaction summary
            document.getElementById('totalTransactions').textContent = transactionsData.total_count;
            
            const fraudRate = transactionsData.total_count > 0 ? 
                ((fraudCount / transactionsData.total_count) * 100).toFixed(1) : 0;
            document.getElementById('fraudRate').textContent = `${fraudRate}%`;

            const avgAmount = transactionsData.transactions.length > 0 ?
                transactionsData.transactions.reduce((sum, t) => sum + t.amount, 0) / transactionsData.transactions.length : 0;
            document.getElementById('avgAmount').textContent = `$${avgAmount.toFixed(0)}`;

            // Update alerts list
            this.updateAlertsList(alertsData.alerts);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateAlertsList(alerts) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="alert-item">
                    <div class="alert-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">No Recent Alerts</div>
                        <div class="alert-message">All systems operating normally</div>
                        <div class="alert-time">Just now</div>
                    </div>
                </div>
            `;
            return;
        }

        alertsList.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item ${alert.risk_level}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.risk_level === 'high' ? 'exclamation-triangle' : 'info-circle'}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.reason}</div>
                    <div class="alert-message">Transaction ID: ${alert.transaction_id}</div>
                    <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    async loadBiometricData() {
        // Update enrollment status
        this.updateEnrollmentStatus();
    }

    updateEnrollmentStatus() {
        // Face status
        const faceStatus = document.getElementById('faceStatus');
        if (faceStatus) {
            const statusText = faceStatus.querySelector('.status-text');
            const statusIndicator = faceStatus.querySelector('.status-indicator');
            
            if (this.isEnrolled.face) {
                statusText.textContent = 'Enrolled';
                statusIndicator.classList.add('enrolled');
                document.getElementById('verifyFaceBtn').disabled = false;
            } else {
                statusText.textContent = 'Not Enrolled';
                statusIndicator.classList.remove('enrolled');
                document.getElementById('verifyFaceBtn').disabled = true;
            }
        }

        // Voice status
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            const statusText = voiceStatus.querySelector('.status-text');
            const statusIndicator = voiceStatus.querySelector('.status-indicator');
            
            if (this.isEnrolled.voice) {
                statusText.textContent = 'Enrolled';
                statusIndicator.classList.add('enrolled');
                document.getElementById('verifyVoiceBtn').disabled = false;
            } else {
                statusText.textContent = 'Not Enrolled';
                statusIndicator.classList.remove('enrolled');
                document.getElementById('verifyVoiceBtn').disabled = true;
            }
        }

        // PIN status
        const pinStatus = document.getElementById('pinStatus');
        if (pinStatus) {
            const statusText = pinStatus.querySelector('.status-text');
            const statusIndicator = pinStatus.querySelector('.status-indicator');
            
            if (this.isEnrolled.pin) {
                statusText.textContent = 'Set';
                statusIndicator.classList.add('enrolled');
            } else {
                statusText.textContent = 'Not Set';
                statusIndicator.classList.remove('enrolled');
            }
        }
    }

    async loadTransactionsData() {
        try {
            const response = await fetch('/api/get-transactions');
            const data = await response.json();
            this.updateTransactionsList(data.transactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    updateTransactionsList(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="transaction-item">
                    <div class="transaction-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="transaction-content">
                        <div class="transaction-title">No transactions yet</div>
                        <div class="transaction-message">Create your first transaction to see history</div>
                    </div>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = transactions.slice(0, 10).map(transaction => {
            const isFraud = transaction.fraud_analysis?.is_fraud || false;
            const riskLevel = transaction.fraud_analysis?.risk_level || 'low';
            
            return `
                <div class="transaction-item ${isFraud ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}">
                    <div class="transaction-icon">
                        <i class="fas fa-${isFraud ? 'exclamation-triangle' : 'check-circle'}"></i>
                    </div>
                    <div class="transaction-content">
                        <div class="transaction-title">$${transaction.amount} ${transaction.type}</div>
                        <div class="transaction-message">
                            ${isFraud ? 'Fraud Detected: ' + transaction.fraud_analysis.reason : 'Transaction processed successfully'}
                        </div>
                        <div class="alert-time">${this.formatTime(transaction.timestamp)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadSecurityData() {
        try {
            const alertsResponse = await fetch('/api/get-alerts');
            const alertsData = await alertsResponse.json();

            // Update security metrics
            const fraudDetected = alertsData.alerts.filter(alert => alert.status === 'active').length;
            document.getElementById('fraudDetected').textContent = fraudDetected;

            // Update security alerts
            this.updateSecurityAlerts(alertsData.alerts);

        } catch (error) {
            console.error('Failed to load security data:', error);
        }
    }

    updateSecurityAlerts(alerts) {
        const securityAlertsList = document.getElementById('securityAlertsList');
        if (!securityAlertsList) return;

        if (alerts.length === 0) {
            securityAlertsList.innerHTML = `
                <div class="alert-item success">
                    <div class="alert-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">All Systems Secure</div>
                        <div class="alert-message">No security threats detected</div>
                        <div class="alert-time">Real-time monitoring active</div>
                    </div>
                </div>
            `;
            return;
        }

        securityAlertsList.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item ${alert.risk_level}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.risk_level === 'high' ? 'exclamation-triangle' : 'shield-alt'}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.reason}</div>
                    <div class="alert-message">Risk Level: ${alert.risk_level.toUpperCase()}</div>
                    <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    async enrollFace() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const enrollBtn = document.getElementById('enrollFaceBtn');
        enrollBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enrolling...';
        enrollBtn.disabled = true;

        try {
            const canvas = document.getElementById('faceCanvas');
            const video = document.getElementById('faceVideo');
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg');
            
            // Include device fingerprint for enhanced security
            const requestData = {
                user_id: this.currentUser,
                image_data: imageData,
                device_fingerprint: this.deviceFingerprint,
                behavioral_data: this.behavioralPatterns
            };
            
            const response = await fetch('/api/enroll-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.isEnrolled.face = true;
                this.updateEnrollmentStatus();
                this.showBiometricResult('faceResult', 'success', result.message);
                this.showToast('🎉 Face enrolled successfully! AI analysis complete.', 'success');
                
                // Show device fingerprint info
                if (result.device_fingerprint) {
                    console.log('🔒 Device Fingerprint:', result.device_fingerprint.fingerprint);
                }
            } else {
                this.showBiometricResult('faceResult', 'error', result.message);
                this.showToast('❌ Face enrollment failed: ' + result.message, 'error');
            }

        } catch (error) {
            console.error('Face enrollment error:', error);
            this.showBiometricResult('faceResult', 'error', 'Face enrollment failed - Please try again');
            this.showToast('❌ Face enrollment failed - Check camera permissions', 'error');
        } finally {
            enrollBtn.innerHTML = '<i class="fas fa-user-plus"></i> Enroll Face';
            enrollBtn.disabled = false;
            this.isProcessing = false;
        }
    }

    async verifyFace() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const verifyBtn = document.getElementById('verifyFaceBtn');
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        verifyBtn.disabled = true;

        try {
            const canvas = document.getElementById('faceCanvas');
            const video = document.getElementById('faceVideo');
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg');
            
            // Include behavioral analysis data
            const requestData = {
                user_id: this.currentUser,
                image_data: imageData,
                device_fingerprint: this.deviceFingerprint,
                behavioral_data: this.behavioralPatterns
            };
            
            const response = await fetch('/api/verify-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                if (result.verified) {
                    this.showBiometricResult('faceResult', 'success', result.message);
                    this.showToast('✅ Face verification successful! Confidence: ' + result.confidence + '%', 'success');
                    
                    // Update trust score based on successful verification
                    this.userTrustScore = Math.min(0.95, this.userTrustScore + 0.02);
                } else {
                    this.showBiometricResult('faceResult', 'error', result.message);
                    this.showToast('🚨 Face verification failed - Possible fraud attempt!', 'error');
                    
                    // Decrease trust score for failed verification
                    this.userTrustScore = Math.max(0.1, this.userTrustScore - 0.05);
                }
                
                // Show behavioral analysis results
                if (result.behavioral_analysis) {
                    console.log('🧠 Behavioral Analysis:', result.behavioral_analysis);
                }
            } else {
                this.showBiometricResult('faceResult', 'error', result.message);
                this.showToast('❌ Face verification failed: ' + result.message, 'error');
            }

        } catch (error) {
            console.error('Face verification error:', error);
            this.showBiometricResult('faceResult', 'error', 'Face verification failed - Please try again');
            this.showToast('❌ Face verification failed - Check camera permissions', 'error');
        } finally {
            verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
            verifyBtn.disabled = false;
            this.isProcessing = false;
        }
    }

    async enrollVoice() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const enrollBtn = document.getElementById('enrollVoiceBtn');
        enrollBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
        enrollBtn.disabled = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                
                reader.onloadend = async () => {
                    const base64Audio = reader.result.split(',')[1];
                    
                    // Include device fingerprint for enhanced security
                    const requestData = {
                        user_id: this.currentUser,
                        audio_data: base64Audio,
                        device_fingerprint: this.deviceFingerprint,
                        behavioral_data: this.behavioralPatterns
                    };
                    
                    const response = await fetch('/api/enroll-voice', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    });

                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        this.isEnrolled.voice = true;
                        this.updateEnrollmentStatus();
                        this.showBiometricResult('voiceResult', 'success', result.message);
                        this.showToast('🎉 Voice enrolled successfully! AI analysis complete.', 'success');
                        
                        // Show device fingerprint info
                        if (result.device_fingerprint) {
                            console.log('🔒 Device Fingerprint:', result.device_fingerprint.fingerprint);
                        }
                    } else {
                        this.showBiometricResult('voiceResult', 'error', result.message);
                        this.showToast('❌ Voice enrollment failed: ' + result.message, 'error');
                    }
                };
                
                reader.readAsDataURL(audioBlob);
            };

            this.mediaRecorder.start();
            
            // Stop recording after 3 seconds
            setTimeout(() => {
                this.mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 3000);

        } catch (error) {
            console.error('Voice enrollment error:', error);
            this.showBiometricResult('voiceResult', 'error', 'Voice enrollment failed - Please try again');
            this.showToast('❌ Voice enrollment failed - Check microphone permissions', 'error');
            enrollBtn.innerHTML = '<i class="fas fa-microphone"></i> Enroll Voice';
            enrollBtn.disabled = false;
            this.isProcessing = false;
        }
    }

    async verifyVoice() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const verifyBtn = document.getElementById('verifyVoiceBtn');
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
        verifyBtn.disabled = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                
                reader.onloadend = async () => {
                    const base64Audio = reader.result.split(',')[1];
                    
                    // Include behavioral analysis data
                    const requestData = {
                        user_id: this.currentUser,
                        audio_data: base64Audio,
                        device_fingerprint: this.deviceFingerprint,
                        behavioral_data: this.behavioralPatterns
                    };
                    
                    const response = await fetch('/api/verify-voice', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    });

                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        if (result.verified) {
                            this.showBiometricResult('voiceResult', 'success', result.message);
                            this.showToast('✅ Voice verification successful! Confidence: ' + result.confidence + '%', 'success');
                            
                            // Update trust score based on successful verification
                            this.userTrustScore = Math.min(0.95, this.userTrustScore + 0.02);
                        } else {
                            this.showBiometricResult('voiceResult', 'error', result.message);
                            this.showToast('🚨 Voice verification failed - Possible fraud attempt!', 'error');
                            
                            // Decrease trust score for failed verification
                            this.userTrustScore = Math.max(0.1, this.userTrustScore - 0.05);
                        }
                        
                        // Show behavioral analysis results
                        if (result.behavioral_analysis) {
                            console.log('🧠 Behavioral Analysis:', result.behavioral_analysis);
                        }
                    } else {
                        this.showBiometricResult('voiceResult', 'error', result.message);
                        this.showToast('❌ Voice verification failed: ' + result.message, 'error');
                    }
                };
                
                reader.readAsDataURL(audioBlob);
            };

            this.mediaRecorder.start();
            
            // Stop recording after 3 seconds
            setTimeout(() => {
                this.mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 3000);

        } catch (error) {
            console.error('Voice verification error:', error);
            this.showBiometricResult('voiceResult', 'error', 'Voice verification failed - Please try again');
            this.showToast('❌ Voice verification failed - Check microphone permissions', 'error');
            verifyBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> Verify Voice';
            verifyBtn.disabled = false;
            this.isProcessing = false;
        }
    }

    async setupPIN() {
        const pinInput = document.getElementById('pinInput');
        const pin = pinInput.value;

        if (pin.length !== 4) {
            this.showToast('PIN must be 4 digits', 'error');
            return;
        }

        try {
            const response = await fetch('/api/setup-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    pin: pin
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.isEnrolled.pin = true;
                this.updateEnrollmentStatus();
                this.showToast('PIN set successfully!', 'success');
                pinInput.value = '';
            } else {
                this.showToast('Failed to set PIN', 'error');
            }

        } catch (error) {
            console.error('PIN setup error:', error);
            this.showToast('Failed to set PIN', 'error');
        }
    }

    async verifyPIN() {
        const pinInput = document.getElementById('pinInput');
        const pin = pinInput.value;

        if (pin.length !== 4) {
            this.showToast('Please enter a 4-digit PIN', 'error');
            return;
        }

        try {
            const response = await fetch('/api/verify-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    pin: pin
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                if (result.verified) {
                    this.showBiometricResult('pinResult', 'success', result.message);
                    this.showToast('PIN verification successful!', 'success');
                } else {
                    this.showBiometricResult('pinResult', 'error', result.message);
                    this.showToast('Invalid PIN - Possible fraud attempt!', 'error');
                }
            } else {
                this.showBiometricResult('pinResult', 'error', result.message);
                this.showToast('PIN verification failed', 'error');
            }

            pinInput.value = '';

        } catch (error) {
            console.error('PIN verification error:', error);
            this.showBiometricResult('pinResult', 'error', 'PIN verification failed');
            this.showToast('PIN verification failed', 'error');
        }
    }

    async processTransaction(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        this.isProcessing = true;

        const formData = new FormData(event.target);
        const transactionData = {
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            recipient: formData.get('recipient') || 'Unknown'
        };

        // Show processing modal
        this.showModal();

        try {
            // Step 1: Security Check
            await this.updateProcessingStep(1, 'active');
            await this.delay(1000);

            const response = await fetch('/api/process-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    amount: transactionData.amount,
                    type: transactionData.type
                })
            });

            const result = await response.json();

            // Step 2: Biometric Verification
            await this.updateProcessingStep(1, 'completed');
            await this.updateProcessingStep(2, 'active');
            await this.delay(1500);

            // Simulate biometric verification
            const biometricSuccess = Math.random() > 0.1; // 90% success rate for demo

            if (biometricSuccess) {
                await this.updateProcessingStep(2, 'completed');
                await this.updateProcessingStep(3, 'active');
                await this.delay(1000);

                // Step 3: Transaction Complete
                await this.updateProcessingStep(3, 'completed');

                if (result.fraud_analysis.is_fraud) {
                    this.showTransactionResult('error', `Transaction blocked: ${result.fraud_analysis.reason}`);
                    this.showToast('Transaction blocked due to fraud detection!', 'error');
                } else {
                    this.showTransactionResult('success', `Transaction processed successfully! Amount: $${transactionData.amount}`);
                    this.showToast('Transaction completed successfully!', 'success');
                }
            } else {
                this.showTransactionResult('error', 'Biometric verification failed - Transaction blocked');
                this.showToast('Biometric verification failed!', 'error');
            }

        } catch (error) {
            console.error('Transaction processing error:', error);
            this.showTransactionResult('error', 'Transaction processing failed');
            this.showToast('Transaction processing failed', 'error');
        } finally {
            this.isProcessing = false;
            
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                this.closeModal();
                this.loadTransactionsData();
                this.loadDashboardData();
            }, 3000);
        }
    }

    async simulateFraudScenario(scenario) {
        try {
            const response = await fetch('/api/simulate-fraud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenario: scenario
                })
            });

            const result = await response.json();
            
            if (result.fraud_analysis.is_fraud) {
                this.showToast(`🚨 Fraud Detected: ${result.fraud_analysis.reason}`, 'error');
            } else {
                this.showToast(`✅ Transaction Approved: ${result.description}`, 'success');
            }

            // Refresh data
            this.loadDashboardData();
            this.loadSecurityData();

        } catch (error) {
            console.error('Fraud simulation error:', error);
            this.showToast('Failed to simulate fraud scenario', 'error');
        }
    }

    async testBiometricFraud() {
        this.showToast('🧪 Testing biometric fraud detection...', 'info');
        
        // Simulate failed biometric verification
        setTimeout(() => {
            this.showToast('🚨 Biometric fraud detected! Unauthorized access attempt blocked.', 'error');
        }, 2000);
    }

    showModal() {
        document.getElementById('transactionModal').classList.add('active');
        
        // Reset processing steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        document.getElementById('transactionResult').style.display = 'none';
    }

    closeModal() {
        document.getElementById('transactionModal').classList.remove('active');
    }

    async updateProcessingStep(stepNumber, status) {
        const step = document.getElementById(`step${stepNumber}`);
        if (step) {
            step.classList.remove('active', 'completed');
            step.classList.add(status);
        }
    }

    showTransactionResult(type, message) {
        const resultDiv = document.getElementById('transactionResult');
        resultDiv.className = `transaction-result ${type}`;
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
    }

    showBiometricResult(elementId, type, message) {
        const resultDiv = document.getElementById(elementId);
        if (resultDiv) {
            resultDiv.className = `biometric-result ${type}`;
            resultDiv.textContent = message;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.currentView === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000);

        // Update security view every 15 seconds
        setInterval(() => {
            if (this.currentView === 'security') {
                this.loadSecurityData();
            }
        }, 15000);
        
        // Load unique AI features
        this.loadUniqueFeatures();
    }
    
    async loadUniqueFeatures() {
        try {
            // Load behavioral insights
            await this.loadBehavioralInsights();
            
            // Load fraud predictions
            await this.loadFraudPredictions();
            
            // Analyze device fingerprint
            await this.analyzeDeviceFingerprint();
            
        } catch (error) {
            console.error('Failed to load unique features:', error);
        }
    }
    
    async loadBehavioralInsights() {
        try {
            const response = await fetch(`/api/get-behavioral-insights?user_id=${this.currentUser}`);
            const data = await response.json();
            
            // Display insights in dashboard
            this.displayBehavioralInsights(data);
            
        } catch (error) {
            console.error('Failed to load behavioral insights:', error);
        }
    }
    
    displayBehavioralInsights(data) {
        // Create or update behavioral insights card
        let insightsCard = document.getElementById('behavioralInsightsCard');
        if (!insightsCard) {
            insightsCard = this.createBehavioralInsightsCard();
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if (dashboardGrid) {
                dashboardGrid.appendChild(insightsCard);
            }
        }
        
        const insightsList = insightsCard.querySelector('.insights-list');
        if (insightsList) {
            if (data.insights && data.insights.length > 0) {
                insightsList.innerHTML = data.insights.map(insight => `
                    <div class="insight-item">
                        <i class="fas fa-brain"></i>
                        <span>${insight}</span>
                    </div>
                `).join('');
            } else {
                insightsList.innerHTML = `
                    <div class="insight-item">
                        <i class="fas fa-info-circle"></i>
                        <span>No behavioral patterns detected yet</span>
                    </div>
                `;
            }
        }
    }
    
    createBehavioralInsightsCard() {
        const card = document.createElement('div');
        card.className = 'card behavioral-insights';
        card.id = 'behavioralInsightsCard';
        card.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-brain"></i> AI Behavioral Insights</h3>
                <div class="status-badge active">Live Analysis</div>
            </div>
            <div class="card-content">
                <div class="insights-list"></div>
                <div class="ai-confidence">
                    <div class="confidence-meter">
                        <div class="confidence-bar" style="width: 85%"></div>
                    </div>
                    <span class="confidence-text">AI Confidence: 85%</span>
                </div>
            </div>
        `;
        return card;
    }
    
    async loadFraudPredictions() {
        try {
            const response = await fetch('/api/get-fraud-predictions');
            const data = await response.json();
            
            // Display predictions in security view
            this.displayFraudPredictions(data);
            
        } catch (error) {
            console.error('Failed to load fraud predictions:', error);
        }
    }
    
    displayFraudPredictions(data) {
        let predictionsCard = document.getElementById('fraudPredictionsCard');
        if (!predictionsCard) {
            predictionsCard = this.createFraudPredictionsCard();
            const securityContainer = document.querySelector('.security-container');
            if (securityContainer) {
                securityContainer.appendChild(predictionsCard);
            }
        }
        
        const predictionsList = predictionsCard.querySelector('.predictions-list');
        if (predictionsList) {
            if (data.predictions && data.predictions.length > 0) {
                predictionsList.innerHTML = data.predictions.map(prediction => `
                    <div class="prediction-item ${prediction.probability > 0.7 ? 'high-risk' : 'medium-risk'}">
                        <div class="prediction-header">
                            <i class="fas fa-${prediction.probability > 0.7 ? 'exclamation-triangle' : 'info-circle'}"></i>
                            <span class="prediction-type">${prediction.type.replace('_', ' ').toUpperCase()}</span>
                            <span class="prediction-probability">${Math.round(prediction.probability * 100)}%</span>
                        </div>
                        <div class="prediction-description">${prediction.description}</div>
                    </div>
                `).join('');
            } else {
                predictionsList.innerHTML = `
                    <div class="prediction-item low-risk">
                        <div class="prediction-header">
                            <i class="fas fa-check-circle"></i>
                            <span class="prediction-type">NO THREATS</span>
                            <span class="prediction-probability">0%</span>
                        </div>
                        <div class="prediction-description">No fraud patterns detected</div>
                    </div>
                `;
            }
        }
    }
    
    createFraudPredictionsCard() {
        const card = document.createElement('div');
        card.className = 'card fraud-predictions';
        card.id = 'fraudPredictionsCard';
        card.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-crystal-ball"></i> AI Fraud Predictions</h3>
                <div class="status-badge active">Predictive Analysis</div>
            </div>
            <div class="card-content">
                <div class="predictions-list"></div>
                <div class="prediction-stats">
                    <div class="stat-item">
                        <span class="stat-value">${Math.floor(Math.random() * 50) + 20}</span>
                        <span class="stat-label">Patterns Analyzed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Math.floor(Math.random() * 10) + 90}%</span>
                        <span class="stat-label">Accuracy Rate</span>
                    </div>
                </div>
            </div>
        `;
        return card;
    }
    
    async analyzeDeviceFingerprint() {
        try {
            const deviceInfo = {
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                platform: navigator.platform
            };
            
            const response = await fetch('/api/analyze-device-fingerprint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    device_info: deviceInfo
                })
            });
            
            const data = await response.json();
            
            // Display device analysis
            this.displayDeviceAnalysis(data);
            
        } catch (error) {
            console.error('Failed to analyze device fingerprint:', error);
        }
    }
    
    displayDeviceAnalysis(data) {
        // Show device analysis in a toast or status indicator
        if (data.device_changed) {
            this.showToast(`🔍 ${data.message} - Risk Level: ${data.risk_level.toUpperCase()}`, 'warning');
        } else {
            this.showToast(`✅ ${data.message}`, 'success');
        }
    }
    
    // Enhanced fraud detection with real-time analysis
    async enhancedFraudDetection(transactionData) {
        try {
            // Add device fingerprinting
            const deviceInfo = {
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                platform: navigator.platform
            };
            
            // Enhanced transaction processing
            const response = await fetch('/api/process-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    amount: transactionData.amount,
                    type: transactionData.type,
                    recipient: transactionData.recipient,
                    device_info: deviceInfo
                })
            });
            
            const result = await response.json();
            
            // Display enhanced analysis results
            this.displayEnhancedAnalysis(result);
            
            return result;
            
        } catch (error) {
            console.error('Enhanced fraud detection failed:', error);
            return null;
        }
    }
    
    displayEnhancedAnalysis(result) {
        if (result.fraud_analysis) {
            const analysis = result.fraud_analysis;
            
            // Show behavioral analysis
            if (analysis.behavioral_analysis) {
                const behavioral = analysis.behavioral_analysis;
                this.showToast(`🧠 Behavioral Analysis: ${behavioral.risk_level.toUpperCase()} risk`, 
                    behavioral.is_anomalous ? 'warning' : 'success');
            }
            
            // Show graph analysis
            if (analysis.graph_analysis) {
                const graph = analysis.graph_analysis;
                if (graph.anomalies && graph.anomalies.length > 0) {
                    this.showToast(`🕸️ Graph Analysis: ${graph.anomalies.join(', ')}`, 'warning');
                }
            }
            
            // Show AI confidence
            if (analysis.ai_confidence) {
                this.showToast(`🤖 AI Confidence: ${analysis.ai_confidence.toFixed(1)}%`, 'info');
            }
        }
    }
}

// Global functions for HTML onclick handlers
function startTransaction() {
    app.switchView('transactions');
}

function enrollBiometric() {
    app.switchView('biometric');
}

function simulateFraud() {
    app.switchView('security');
}

function refreshAlerts() {
    app.loadDashboardData();
}

function refreshTransactions() {
    app.loadTransactionsData();
}

function refreshSecurityAlerts() {
    app.loadSecurityData();
}

function enrollFace() {
    app.enrollFace();
}

function verifyFace() {
    app.verifyFace();
}

function enrollVoice() {
    app.enrollVoice();
}

function verifyVoice() {
    app.verifyVoice();
}

function setupPIN() {
    app.setupPIN();
}

function verifyPIN() {
    app.verifyPIN();
}

function processTransaction(event) {
    app.processTransaction(event);
}

function simulateFraudScenario(scenario) {
    app.simulateFraudScenario(scenario);
}

function testBiometricFraud() {
    app.testBiometricFraud();
}

function closeModal() {
    app.closeModal();
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AdvancedFaceToPhoneApp();
});

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
