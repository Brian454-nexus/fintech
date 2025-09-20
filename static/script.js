// SecureBank - Face-to-Phone Banking App
// Registration Wizard & Banking Interface

class SecureBankApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userProfile = {
            fullName: '',
            phoneNumber: '',
            emailAddress: '',
            dateOfBirth: '',
            faceTemplate: null,
            voiceTemplate: null,
            pin: null,
            isRegistered: false
        };
        this.camera = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isProcessing = false;
        this.currentUser = 'demo_user';
        this.fraudAlerts = [];
        this.isOfflineMode = true;
        this.continuousMonitoring = null;
        this.securitySnapshots = [];
        
        this.init();
    }

    async init() {
        try {
            // Check if user is already registered
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                this.userProfile = JSON.parse(savedProfile);
                if (this.userProfile.isRegistered) {
                    this.showBankingApp();
                    return;
                }
            }

            // Show loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.showAuthScreen();
            }, 2000);

            // Initialize event listeners
            this.setupEventListeners();
            
            // Initialize camera (don't await to prevent blocking)
            this.initCamera().catch(error => {
                console.log('Camera initialization failed:', error);
            });
        } catch (error) {
            console.error('App initialization failed:', error);
            // Fallback: show auth screen after 3 seconds
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.showAuthScreen();
            }, 3000);
        }
    }

    setupEventListeners() {
        // Personal details form validation
        const personalForm = document.querySelector('.personal-form');
        if (personalForm) {
            const inputs = personalForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.validatePersonalDetails();
                });
                input.addEventListener('change', () => {
                    this.validatePersonalDetails();
                });
                input.addEventListener('blur', () => {
                    this.validatePersonalDetails();
                });
            });
        }
        
        // Also validate on page load
        setTimeout(() => {
            this.validatePersonalDetails();
        }, 1000);

        // PIN input listener
        const pinInput = document.getElementById('pinInput');
        if (pinInput) {
            pinInput.addEventListener('input', (e) => {
                this.updatePinDots(e.target.value);
                this.checkStepCompletion();
            });
        }

        // PIN verification input listener
        const pinVerificationInput = document.getElementById('pinVerificationInput');
        if (pinVerificationInput) {
            pinVerificationInput.addEventListener('input', (e) => {
                this.updatePinDots(e.target.value, 'verification');
            });
        }
    }

    showAuthScreen() {
        try {
            // Hide other screens
            const regWizard = document.getElementById('registrationWizard');
            const bankingApp = document.getElementById('bankingApp');
            
            if (regWizard) regWizard.style.display = 'none';
            if (bankingApp) bankingApp.style.display = 'none';
            
            // Show auth screen
            const authScreen = document.getElementById('authScreen');
            if (authScreen) {
                authScreen.style.display = 'block';
            } else {
                console.error('Auth screen element not found');
                // Fallback: show registration wizard
                this.showRegistrationWizard();
            }
        } catch (error) {
            console.error('Error showing auth screen:', error);
            // Fallback: show registration wizard
            this.showRegistrationWizard();
        }
    }

    showSignUp() {
        document.getElementById('authScreen').style.display = 'none';
        this.showRegistrationWizard();
    }

    showSignIn() {
        // For demo purposes, just show the banking app
        // In a real app, this would verify credentials
        this.showBankingApp();
    }

    validatePersonalDetails() {
        const fullName = document.getElementById('fullName');
        const phoneNumber = document.getElementById('phoneNumber');
        const emailAddress = document.getElementById('emailAddress');
        const dateOfBirth = document.getElementById('dateOfBirth');
        
        if (!fullName || !phoneNumber || !emailAddress || !dateOfBirth) {
            console.log('Form elements not found');
            return;
        }
        
        const isValid = fullName.value.trim().length > 0 && 
                      phoneNumber.value.trim().length >= 10 && 
                      emailAddress.value.trim().includes('@') && 
                      dateOfBirth.value.trim().length > 0;
        
        console.log('Form validation:', {
            fullName: fullName.value,
            phoneNumber: phoneNumber.value,
            emailAddress: emailAddress.value,
            dateOfBirth: dateOfBirth.value,
            isValid: isValid
        });
        
        const nextBtn = document.getElementById('nextBtn1');
        if (nextBtn) {
            nextBtn.disabled = !isValid;
            console.log('Next button disabled:', nextBtn.disabled);
        }
        
        if (isValid) {
            this.userProfile.fullName = fullName.value.trim();
            this.userProfile.phoneNumber = phoneNumber.value.trim();
            this.userProfile.emailAddress = emailAddress.value.trim();
            this.userProfile.dateOfBirth = dateOfBirth.value.trim();
        }
    }

    showRegistrationWizard() {
        // Hide other screens
        const authScreen = document.getElementById('authScreen');
        const bankingApp = document.getElementById('bankingApp');
        
        if (authScreen) authScreen.style.display = 'none';
        if (bankingApp) bankingApp.style.display = 'none';
        
        // Show registration wizard
        const regWizard = document.getElementById('registrationWizard');
        if (regWizard) {
            regWizard.style.display = 'block';
        }
        
        this.updateProgress();
    }

    showBankingApp() {
        // Hide all other screens
        const authScreen = document.getElementById('authScreen');
        const regWizard = document.getElementById('registrationWizard');
        const bankingApp = document.getElementById('bankingApp');
        
        if (authScreen) authScreen.style.display = 'none';
        if (regWizard) regWizard.style.display = 'none';
        if (bankingApp) bankingApp.style.display = 'block';
        
        this.updateUserInfo();
        this.loadTransactionHistory();
        this.updateSecurityStats();
        this.startContinuousMonitoring();
    }

    updateUserInfo() {
        const userName = document.getElementById('userName');
        const accountBalance = document.getElementById('accountBalance');
        
        if (userName) {
            userName.textContent = this.userProfile.fullName || 'User';
        }
        
        if (accountBalance) {
            // Generate a random balance for demo
            const balance = Math.floor(Math.random() * 50000) + 10000;
            accountBalance.textContent = `KSh ${balance.toLocaleString()}`;
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        const steps = document.querySelectorAll('.wizard-step');
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
    }

    async initCamera() {
        try {
            this.camera = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            
            const video = document.getElementById('faceVideo');
            if (video) {
                video.srcObject = this.camera;
            }
            
            const verificationVideo = document.getElementById('verificationVideo');
            if (verificationVideo) {
                verificationVideo.srcObject = this.camera;
            }
            
            console.log('Camera initialized successfully');
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showToast('Camera access denied. Please enable camera permissions.', 'error');
        }
    }

    startCamera() {
        if (this.camera) {
            const video = document.getElementById('faceVideo');
            if (video) {
                video.srcObject = this.camera;
                document.getElementById('captureBtn').disabled = false;
                
                // Start liveness detection
                this.startLivenessDetection();
            }
        }
    }

    startLivenessDetection() {
        // Simulate liveness detection challenges
        const challenges = [
            "Please blink your eyes",
            "Please turn your head slightly left",
            "Please turn your head slightly right",
            "Please smile naturally",
            "Please look directly at the camera"
        ];
        
        let currentChallenge = 0;
        
        const showChallenge = () => {
            if (currentChallenge < challenges.length) {
                this.showToast(challenges[currentChallenge], 'info');
                currentChallenge++;
                
                // Show next challenge after 2 seconds
                setTimeout(showChallenge, 2000);
            }
        };
        
        // Start challenges after 1 second
        setTimeout(showChallenge, 1000);
    }

    async captureFace() {
        const video = document.getElementById('faceVideo');
        const canvas = document.getElementById('faceCanvas');
        
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Analyze for fraud before saving
            this.showToast('Analyzing face for security...', 'info');
            
            const fraudAnalysis = await this.analyzeFaceForFraud(imageData);
            
            if (fraudAnalysis.isFraud) {
                this.showToast(`Security check failed: ${fraudAnalysis.reason}`, 'error');
                this.showFraudAlert(`🚨 ${fraudAnalysis.reason}`, 'fraud');
                return;
            }
            
            // Save face template
            this.userProfile.faceTemplate = imageData;
            
            this.showToast('Face captured and verified successfully!', 'success');
            document.getElementById('nextBtn3').disabled = false;
            
            // Stop camera
            if (this.camera) {
                this.camera.getTracks().forEach(track => track.stop());
            }
        }
    }

    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.userProfile.voiceTemplate = reader.result;
                    this.showToast('Voice recorded successfully!', 'success');
                    document.getElementById('nextBtn3').disabled = false;
                };
                reader.readAsDataURL(audioBlob);
            };
            
            this.mediaRecorder.start();
            document.getElementById('stopVoiceBtn').disabled = false;
            
            // Animate voice visualizer
            this.animateVoiceVisualizer();

        } catch (error) {
            console.error('Microphone access failed:', error);
            this.showToast('Microphone access denied. Please enable microphone permissions.', 'error');
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            document.getElementById('stopVoiceBtn').disabled = true;
            this.stopVoiceVisualizer();
        }
    }

    animateVoiceVisualizer() {
        const waves = document.querySelectorAll('.voice-wave');
        waves.forEach(wave => {
            wave.style.animation = 'voiceWave 0.5s ease-in-out infinite';
        });
    }

    stopVoiceVisualizer() {
        const waves = document.querySelectorAll('.voice-wave');
        waves.forEach(wave => {
            wave.style.animation = 'none';
        });
    }

    addPinDigit(digit) {
        const pinInput = document.getElementById('pinInput');
        if (pinInput && pinInput.value.length < 4) {
            pinInput.value += digit;
            this.updatePinDots(pinInput.value);
            this.checkStepCompletion();
        }
    }

    clearPinDigit() {
        const pinInput = document.getElementById('pinInput');
        if (pinInput) {
            pinInput.value = pinInput.value.slice(0, -1);
            this.updatePinDots(pinInput.value);
            this.checkStepCompletion();
        }
    }

    updatePinDots(pinValue, type = 'setup') {
        const dots = document.querySelectorAll(`#${type === 'setup' ? 'pinInput' : 'pinVerificationInput'}`).length > 0 
            ? document.querySelectorAll('.pin-dot') 
            : document.querySelectorAll('.pin-verification .pin-dot');
        
        dots.forEach((dot, index) => {
            if (index < pinValue.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    checkStepCompletion() {
        const pinInput = document.getElementById('pinInput');
        if (pinInput && pinInput.value.length === 4) {
            this.userProfile.pin = pinInput.value;
            document.getElementById('completeBtn').disabled = false;
        }
    }

    completeRegistration() {
        this.userProfile.isRegistered = true;
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
        
        this.showToast('Registration completed successfully!', 'success');
        
        setTimeout(() => {
            this.showBankingApp();
        }, 1500);
    }

    // Banking App Functions
    loadTransactionHistory() {
        const transactionList = document.getElementById('transactionList');
        if (transactionList) {
            // Load from localStorage or show empty state
            const savedTransactions = localStorage.getItem('userTransactions');
            const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
            
            if (transactions.length === 0) {
                transactionList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h4>No transactions yet</h4>
                        <p>Your transaction history will appear here</p>
                    </div>
                `;
            } else {
                transactionList.innerHTML = transactions.map(tx => `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-type">${tx.type}</div>
                            <div class="transaction-details">${tx.details}</div>
                            <div class="transaction-time">${tx.time}</div>
                        </div>
                        <div class="transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}">
                            ${tx.amount > 0 ? '+' : ''}KSh ${Math.abs(tx.amount).toLocaleString()}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    startContinuousMonitoring() {
        // Start continuous biometric monitoring
        this.continuousMonitoring = setInterval(() => {
            this.performContinuousVerification();
        }, 15000); // Check every 15 seconds
        
        console.log('Continuous biometric monitoring started');
    }

    async performContinuousVerification() {
        // Simulate continuous verification with face capture
        const isVerified = Math.random() > 0.05; // 95% success rate
        
        if (!isVerified) {
            // Capture unauthorized person's face
            await this.captureSecuritySnapshot();
            
            this.showFraudAlert('🚨 Unauthorized access detected! Security snapshot captured.', 'fraud');
            this.logFraudEvent('Continuous verification failed - unauthorized person detected', 'security');
            
            // Lock account
            this.lockAccount();
        }
    }

    async captureSecuritySnapshot() {
        try {
            if (this.camera) {
                const video = document.getElementById('verificationVideo');
                if (video) {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0);
                    
                    const imageData = canvas.toDataURL('image/jpeg', 0.8);
                    
                    const securitySnapshot = {
                        id: Date.now(),
                        timestamp: new Date().toISOString(),
                        image: imageData,
                        reason: 'Unauthorized access attempt',
                        userAgent: navigator.userAgent,
                        location: window.location.href
                    };
                    
                    this.securitySnapshots.push(securitySnapshot);
                    localStorage.setItem('securitySnapshots', JSON.stringify(this.securitySnapshots));
                    
                    console.log('🔒 SECURITY SNAPSHOT CAPTURED:', securitySnapshot);
                }
            }
        } catch (error) {
            console.error('Failed to capture security snapshot:', error);
        }
    }

    lockAccount() {
        // Lock the account and show security message
        this.showToast('Account locked for security. Please contact support.', 'error');
        
        // Disable all transaction buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        // Show security message
        const transactionSection = document.querySelector('.transaction-section');
        if (transactionSection) {
            transactionSection.innerHTML = `
                <div class="security-lock-message">
                    <i class="fas fa-lock"></i>
                    <h3>Account Locked</h3>
                    <p>Your account has been locked for security reasons. Please contact support.</p>
                    <button class="btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Restart App
                    </button>
                </div>
            `;
        }
    }

    // Transaction Functions
    showSendMoney() {
        this.showTransactionModal('Send Money', 'send');
    }

    showBuyAirtime() {
        this.showTransactionModal('Buy Airtime', 'airtime');
    }

    showPayBill() {
        this.showTransactionModal('Pay Bill', 'bill');
    }

    showWithdraw() {
        this.showTransactionModal('Withdraw Cash', 'withdraw');
    }

    showTransactionModal(title, type) {
        const modal = document.getElementById('transactionModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (modal && modalTitle) {
            modalTitle.textContent = title;
            modal.classList.add('show');
            
            // Clear form
            document.getElementById('amount').value = '';
            document.getElementById('phoneNumber').value = '';
            document.getElementById('reason').value = '';
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.remove('show'));
    }

    async processTransaction() {
        const amount = document.getElementById('amount').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const reason = document.getElementById('reason').value;
        
        if (!amount || !phoneNumber) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Close transaction modal
        this.closeModal();
        
        // Show biometric verification
        this.showBiometricVerification();
    }

    showBiometricVerification() {
        const modal = document.getElementById('biometricModal');
        if (modal) {
            modal.classList.add('show');
            
            // Start camera for verification
            if (this.camera) {
                const video = document.getElementById('verificationVideo');
                if (video) {
                    video.srcObject = this.camera;
                }
            }
        }
    }

    async verifyFace() {
        this.isProcessing = true;
        this.showToast('Verifying your face...', 'info');
        
        try {
            // Capture current face for analysis
            const currentFace = await this.captureCurrentFace();
            
            // Simulate face verification with anti-spoofing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Advanced fraud detection
            const fraudAnalysis = await this.analyzeFaceForFraud(currentFace);
            
            if (fraudAnalysis.isFraud) {
                this.showFraudAlert(`🚨 ${fraudAnalysis.reason}`, 'fraud');
                this.logFraudEvent(fraudAnalysis.reason, 'face_spoofing');
                this.captureSecuritySnapshot();
                return;
            }
            
            // Regular verification
            const isVerified = Math.random() > 0.2; // 80% success rate
            
            if (isVerified) {
                this.showToast('Face verification successful!', 'success');
                this.completeTransaction();
            } else {
                this.showToast('Face verification failed. Please try again.', 'error');
                this.showFraudAlert('🚨 Face verification failed - possible fraud attempt', 'fraud');
            }
        } catch (error) {
            this.showToast('Verification failed. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async captureCurrentFace() {
        const video = document.getElementById('verificationVideo');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }

    async analyzeFaceForFraud(faceImage) {
        // Simulate advanced AI analysis for fraud detection
        const fraudChecks = {
            // Check for photo spoofing (static image)
            isStaticImage: this.detectStaticImage(faceImage),
            
            // Check for screen reflection (phone showing photo)
            hasScreenReflection: this.detectScreenReflection(faceImage),
            
            // Check for 3D depth (real face vs photo)
            hasDepth: this.detectDepth(faceImage),
            
            // Check for eye movement (liveness)
            hasEyeMovement: this.detectEyeMovement(faceImage),
            
            // Check for facial micro-expressions
            hasMicroExpressions: this.detectMicroExpressions(faceImage),
            
            // Check for lighting consistency
            hasConsistentLighting: this.detectLightingConsistency(faceImage),
            
            // Check for image quality (too perfect = photo)
            hasNaturalQuality: this.detectNaturalQuality(faceImage)
        };
        
        // Calculate fraud score
        const fraudScore = this.calculateFraudScore(fraudChecks);
        
        if (fraudScore > 0.7) {
            return {
                isFraud: true,
                reason: this.getFraudReason(fraudChecks, fraudScore),
                score: fraudScore,
                details: fraudChecks
            };
        }
        
        return { isFraud: false, score: fraudScore, details: fraudChecks };
    }

    detectStaticImage(faceImage) {
        // Simulate detection of static image (photo)
        // Real implementation would analyze pixel patterns, motion, etc.
        return Math.random() < 0.1; // 10% chance of detecting static image
    }

    detectScreenReflection(faceImage) {
        // Simulate detection of phone screen showing photo
        // Real implementation would look for screen reflections, pixel patterns
        return Math.random() < 0.05; // 5% chance of detecting screen reflection
    }

    detectDepth(faceImage) {
        // Simulate 3D depth detection
        // Real implementation would use stereo vision or depth sensors
        return Math.random() > 0.2; // 80% chance of detecting depth (real face)
    }

    detectEyeMovement(faceImage) {
        // Simulate eye movement detection (liveness)
        // Real implementation would track eye movements over time
        return Math.random() > 0.3; // 70% chance of detecting eye movement
    }

    detectMicroExpressions(faceImage) {
        // Simulate micro-expression detection
        // Real implementation would analyze facial muscle movements
        return Math.random() > 0.4; // 60% chance of detecting micro-expressions
    }

    detectLightingConsistency(faceImage) {
        // Simulate lighting consistency check
        // Real implementation would analyze light patterns and shadows
        return Math.random() > 0.2; // 80% chance of consistent lighting
    }

    detectNaturalQuality(faceImage) {
        // Simulate natural image quality detection
        // Real implementation would analyze compression artifacts, noise patterns
        return Math.random() > 0.1; // 90% chance of natural quality
    }

    calculateFraudScore(fraudChecks) {
        let score = 0;
        
        // Weight different fraud indicators
        if (fraudChecks.isStaticImage) score += 0.4;
        if (fraudChecks.hasScreenReflection) score += 0.3;
        if (!fraudChecks.hasDepth) score += 0.2;
        if (!fraudChecks.hasEyeMovement) score += 0.15;
        if (!fraudChecks.hasMicroExpressions) score += 0.1;
        if (!fraudChecks.hasConsistentLighting) score += 0.1;
        if (!fraudChecks.hasNaturalQuality) score += 0.05;
        
        return Math.min(score, 1.0); // Cap at 1.0
    }

    getFraudReason(fraudChecks, score) {
        if (fraudChecks.isStaticImage) {
            return "PHOTO SPOOFING DETECTED: Static image detected - please use live camera";
        }
        if (fraudChecks.hasScreenReflection) {
            return "SCREEN REFLECTION DETECTED: Phone screen detected - please use live camera";
        }
        if (!fraudChecks.hasDepth) {
            return "3D DEPTH MISSING: Flat image detected - please use live camera";
        }
        if (!fraudChecks.hasEyeMovement) {
            return "LIVENESS CHECK FAILED: No eye movement detected - please blink and move naturally";
        }
        if (!fraudChecks.hasMicroExpressions) {
            return "MICRO-EXPRESSIONS MISSING: Static facial expression detected - please make natural expressions";
        }
        if (!fraudChecks.hasConsistentLighting) {
            return "LIGHTING INCONSISTENCY: Unnatural lighting detected - please ensure good lighting";
        }
        if (!fraudChecks.hasNaturalQuality) {
            return "IMAGE QUALITY SUSPICIOUS: Unnatural image quality detected - please use live camera";
        }
        
        return `FRAUD DETECTED: Suspicious activity detected (Score: ${(score * 100).toFixed(1)}%)`;
    }

    async verifyVoice() {
        this.isProcessing = true;
        this.showToast('Verifying your voice...', 'info');
        
        try {
            // Simulate voice verification
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const isVerified = Math.random() > 0.2; // 80% success rate
            
            if (isVerified) {
                            this.showToast('Voice verification successful!', 'success');
                this.completeTransaction();
                        } else {
                this.showToast('Voice verification failed. Please try again.', 'error');
                this.showFraudAlert('🚨 Voice verification failed - possible fraud attempt', 'fraud');
            }
        } catch (error) {
            this.showToast('Verification failed. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async verifyPIN() {
        const pinInput = document.getElementById('pinVerificationInput');
        const enteredPin = pinInput.value;
        
        if (enteredPin.length !== 4) {
            this.showToast('Please enter a 4-digit PIN', 'error');
            return;
        }
        
        this.isProcessing = true;
        this.showToast('Verifying PIN...', 'info');
        
        try {
            // Simulate PIN verification
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const isVerified = enteredPin === this.userProfile.pin;
            
            if (isVerified) {
                this.showToast('PIN verification successful!', 'success');
                this.completeTransaction();
            } else {
                this.showToast('Invalid PIN. Please try again.', 'error');
                this.showFraudAlert('🚨 Invalid PIN entered - possible fraud attempt', 'fraud');
                pinInput.value = '';
                this.updatePinDots('', 'verification');
            }
        } catch (error) {
            this.showToast('Verification failed. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    completeTransaction() {
        this.closeModal();
        this.showToast('Transaction completed successfully!', 'success');
        
        // Reload transaction history
        this.loadTransactionHistory();
    }

    // Fraud Alert System
    showFraudAlert(message, type = 'fraud') {
        const banner = document.getElementById('fraudAlertBanner');
        const text = document.getElementById('fraudAlertText');
        
        if (banner && text) {
            text.textContent = message;
            banner.style.display = 'flex';
            
            // Log fraud event locally
            this.logFraudEvent(message, type);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideFraudAlert();
            }, 10000);
            
            // Play alert sound if available
            this.playAlertSound();
        }
    }

    hideFraudAlert() {
        const banner = document.getElementById('fraudAlertBanner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    logFraudEvent(message, type) {
        const fraudEvent = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: message,
            type: type,
            userAgent: navigator.userAgent,
            location: window.location.href
        };
        
        this.fraudAlerts.push(fraudEvent);
        
        // Store in localStorage for offline persistence
        localStorage.setItem('fraudAlerts', JSON.stringify(this.fraudAlerts));
        
        // Update security stats
        this.updateSecurityStats();
        
        console.log('🚨 FRAUD ALERT LOGGED:', fraudEvent);
    }

    updateSecurityStats() {
        const fraudAttempts = document.getElementById('fraudAttempts');
        const securitySnapshots = document.getElementById('securitySnapshots');
        
        if (fraudAttempts) {
            fraudAttempts.textContent = this.fraudAlerts.length;
        }
        
        if (securitySnapshots) {
            securitySnapshots.textContent = this.securitySnapshots.length;
        }
    }

    playAlertSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Global functions for HTML onclick handlers
function showSignUp() {
    if (app) app.showSignUp();
}

function showSignIn() {
    if (app) app.showSignIn();
}

function nextStep() {
    if (app) app.nextStep();
}

function prevStep() {
    if (app) app.prevStep();
}

function startCamera() {
    if (app) app.startCamera();
}

function captureFace() {
    if (app) app.captureFace();
}

function startVoiceRecording() {
    if (app) app.startVoiceRecording();
}

function stopVoiceRecording() {
    if (app) app.stopVoiceRecording();
}

function addPinDigit(digit) {
    if (app) app.addPinDigit(digit);
}

function clearPinDigit() {
    if (app) app.clearPinDigit();
}

function completeRegistration() {
    if (app) app.completeRegistration();
}

function showSendMoney() {
    if (app) app.showSendMoney();
}

function showBuyAirtime() {
    if (app) app.showBuyAirtime();
}

function showPayBill() {
    if (app) app.showPayBill();
}

function showWithdraw() {
    if (app) app.showWithdraw();
}

function closeModal() {
    if (app) app.closeModal();
}

function processTransaction() {
    if (app) app.processTransaction();
}

function verifyFace() {
    if (app) app.verifyFace();
}

function verifyVoice() {
    if (app) app.verifyVoice();
}

function verifyPIN() {
    if (app) app.verifyPIN();
}

function dismissFraudAlert() {
    if (app) app.hideFraudAlert();
}

function showAllTransactions() {
    if (app) app.showToast('View all transactions feature coming soon!', 'info');
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new SecureBankApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback: show auth screen after 1 second
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            const authScreen = document.getElementById('authScreen');
            if (authScreen) {
                authScreen.style.display = 'block';
            }
        }, 1000);
    }
});

// Additional fallback after 5 seconds
setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        console.log('Force showing auth screen after timeout');
        loadingScreen.classList.add('hidden');
        const authScreen = document.getElementById('authScreen');
        if (authScreen) {
            authScreen.style.display = 'block';
        } else {
            console.log('Auth screen not found, trying registration wizard');
            const regWizard = document.getElementById('registrationWizard');
            if (regWizard) {
                regWizard.style.display = 'block';
            }
        }
    }
}, 5000);

// Debug: Log when page loads
console.log('Page loaded, DOM ready');
console.log('Auth screen element:', document.getElementById('authScreen'));
console.log('Loading screen element:', document.getElementById('loadingScreen'));

// Simple test function
window.testApp = function() {
    console.log('Testing app...');
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    const authScreen = document.getElementById('authScreen');
    if (authScreen) {
        authScreen.style.display = 'block';
        console.log('Auth screen shown');
    } else {
        console.log('Auth screen not found');
    }
};

// Manual validation function
window.validateForm = function() {
    if (app) {
        app.validatePersonalDetails();
    } else {
        console.log('App not initialized yet');
    }
};

// Debug form values
window.checkForm = function() {
    const fullName = document.getElementById('fullName');
    const phoneNumber = document.getElementById('phoneNumber');
    const emailAddress = document.getElementById('emailAddress');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const nextBtn = document.getElementById('nextBtn1');
    
    console.log('Form values:', {
        fullName: fullName ? fullName.value : 'NOT FOUND',
        phoneNumber: phoneNumber ? phoneNumber.value : 'NOT FOUND',
        emailAddress: emailAddress ? emailAddress.value : 'NOT FOUND',
        dateOfBirth: dateOfBirth ? dateOfBirth.value : 'NOT FOUND',
        nextBtn: nextBtn ? nextBtn.disabled : 'NOT FOUND'
    });
};

// Test fraud detection
window.testFraudDetection = function() {
    if (app) {
        console.log('Testing fraud detection...');
        app.showFraudAlert('🚨 PHOTO SPOOFING DETECTED: Static image detected - please use live camera', 'fraud');
        app.logFraudEvent('Test fraud detection - photo spoofing', 'face_spoofing');
    } else {
        console.log('App not initialized yet');
    }
};

// Auto-test after 3 seconds
setTimeout(() => {
    console.log('Auto-testing app...');
    window.testApp();
}, 3000);

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
