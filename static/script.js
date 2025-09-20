// Face-to-Phone Fraud Detection System
// Advanced JavaScript for Hackathon Demo

class FaceToPhoneApp {
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
        
        this.init();
    }

    async init() {
        // Hide loading screen after initialization
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 2000);

        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize camera
        await this.initCamera();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        console.log('🚀 Face-to-Phone App Initialized');
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
            
            const response = await fetch('/api/enroll-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    image_data: imageData
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.isEnrolled.face = true;
                this.updateEnrollmentStatus();
                this.showBiometricResult('faceResult', 'success', result.message);
                this.showToast('Face enrolled successfully!', 'success');
            } else {
                this.showBiometricResult('faceResult', 'error', result.message);
                this.showToast('Face enrollment failed', 'error');
            }

        } catch (error) {
            console.error('Face enrollment error:', error);
            this.showBiometricResult('faceResult', 'error', 'Face enrollment failed');
            this.showToast('Face enrollment failed', 'error');
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
            
            const response = await fetch('/api/verify-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    image_data: imageData
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                if (result.verified) {
                    this.showBiometricResult('faceResult', 'success', result.message);
                    this.showToast('Face verification successful!', 'success');
                } else {
                    this.showBiometricResult('faceResult', 'error', result.message);
                    this.showToast('Face verification failed - Possible fraud attempt!', 'error');
                }
            } else {
                this.showBiometricResult('faceResult', 'error', result.message);
                this.showToast('Face verification failed', 'error');
            }

        } catch (error) {
            console.error('Face verification error:', error);
            this.showBiometricResult('faceResult', 'error', 'Face verification failed');
            this.showToast('Face verification failed', 'error');
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
                    
                    const response = await fetch('/api/enroll-voice', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: 'demo_user',
                            audio_data: base64Audio
                        })
                    });

                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        this.isEnrolled.voice = true;
                        this.updateEnrollmentStatus();
                        this.showBiometricResult('voiceResult', 'success', result.message);
                        this.showToast('Voice enrolled successfully!', 'success');
                    } else {
                        this.showBiometricResult('voiceResult', 'error', result.message);
                        this.showToast('Voice enrollment failed', 'error');
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
            this.showBiometricResult('voiceResult', 'error', 'Voice enrollment failed');
            this.showToast('Voice enrollment failed', 'error');
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
                    
                    const response = await fetch('/api/verify-voice', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: 'demo_user',
                            audio_data: base64Audio
                        })
                    });

                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        if (result.verified) {
                            this.showBiometricResult('voiceResult', 'success', result.message);
                            this.showToast('Voice verification successful!', 'success');
                        } else {
                            this.showBiometricResult('voiceResult', 'error', result.message);
                            this.showToast('Voice verification failed - Possible fraud attempt!', 'error');
                        }
                    } else {
                        this.showBiometricResult('voiceResult', 'error', result.message);
                        this.showToast('Voice verification failed', 'error');
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
            this.showBiometricResult('voiceResult', 'error', 'Voice verification failed');
            this.showToast('Voice verification failed', 'error');
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
    app = new FaceToPhoneApp();
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
