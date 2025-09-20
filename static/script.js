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
            document.getElementById('loadingScreen').classList.add('hidden');
            this.showAuthScreen();
        }, 2000);

        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize camera
        await this.initCamera();
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
            });
        }

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
        document.getElementById('authScreen').style.display = 'block';
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
        const fullName = document.getElementById('fullName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const emailAddress = document.getElementById('emailAddress').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        
        const isValid = fullName.length > 0 && 
                      phoneNumber.length >= 10 && 
                      emailAddress.includes('@') && 
                      dateOfBirth.length > 0;
        
        const nextBtn = document.getElementById('nextBtn1');
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        
        if (isValid) {
            this.userProfile.fullName = fullName;
            this.userProfile.phoneNumber = phoneNumber;
            this.userProfile.emailAddress = emailAddress;
            this.userProfile.dateOfBirth = dateOfBirth;
        }
    }

    showRegistrationWizard() {
        document.getElementById('registrationWizard').style.display = 'block';
        this.updateProgress();
    }

    showBankingApp() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('registrationWizard').style.display = 'none';
        document.getElementById('bankingApp').style.display = 'block';
        this.updateUserInfo();
        this.loadTransactionHistory();
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
            }
        }
    }

    captureFace() {
        const video = document.getElementById('faceVideo');
        const canvas = document.getElementById('faceCanvas');
        
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            this.userProfile.faceTemplate = imageData;
            
            this.showToast('Face captured successfully!', 'success');
            document.getElementById('nextBtn2').disabled = false;
            
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
            // Simulate face verification
            await new Promise(resolve => setTimeout(resolve, 2000));
            
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
        
        console.log('🚨 FRAUD ALERT LOGGED:', fraudEvent);
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
    app = new SecureBankApp();
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
