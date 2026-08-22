// // app.js - Mobile App Logic

// class VenomMobileApp {
//     constructor() {
//         this.ws = null;
//         this.isConnected = false;
//         this.isRecording = false;
//         this.taskCount = 0;
        
//         this.initElements();
//         this.initWebSocket();
//         this.initEventListeners();
//         this.initVisualizer();
//     }
    
//     // ==================== INITIALIZATION ====================
    
//     initElements() {
//         this.micButton = document.getElementById('micButton');
//         this.sendButton = document.getElementById('sendButton');
//         this.commandInput = document.getElementById('commandInput');
//         this.chatContainer = document.getElementById('chatContainer');
//         this.statusIndicator = document.getElementById('statusIndicator');
//         this.pulseRing = document.getElementById('pulseRing');
//         this.loadingOverlay = document.getElementById('loadingOverlay');
//         this.visualizerCanvas = document.getElementById('visualizer');
//         this.taskCountEl = document.getElementById('taskCount');
//     }
    
//     initWebSocket() {
//         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//         const wsUrl = `${protocol}//${window.location.host}/ws`;
        
//         this.ws = new WebSocket(wsUrl);
        
//         this.ws.onopen = () => {
//             this.isConnected = true;
//             this.updateStatus('Connected', 'connected');
//             console.log('✅ Connected to VENOM AI');
//         };
        
//         this.ws.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             this.handleWebSocketMessage(data);
//         };
        
//         this.ws.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             this.updateStatus('Error', 'error');
//         };
        
//         this.ws.onclose = () => {
//             this.isConnected = false;
//             this.updateStatus('Disconnected', 'disconnected');
//             console.log('❌ Disconnected from VENOM AI');
            
//             // Reconnect after 3 seconds
//             setTimeout(() => this.initWebSocket(), 3000);
//         };
//     }
    
//     initEventListeners() {
//         // Mic button
//         this.micButton.addEventListener('click', () => this.toggleRecording());
        
//         // Send button
//         this.sendButton.addEventListener('click', () => this.sendCommand());
        
//         // Input enter key
//         this.commandInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') {
//                 this.sendCommand();
//             }
//         });
        
//         // Quick action buttons
//         document.querySelectorAll('.quick-btn').forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const command = btn.dataset.command;
//                 this.sendCommandText(command);
//             });
//         });
//     }
    
//     initVisualizer() {
//         this.canvasCtx = this.visualizerCanvas.getContext('2d');
//         this.resizeCanvas();
//         window.addEventListener('resize', () => this.resizeCanvas());
        
//         this.animateVisualizer();
//     }
    
//     resizeCanvas() {
//         this.visualizerCanvas.width = this.visualizerCanvas.offsetWidth;
//         this.visualizerCanvas.height = this.visualizerCanvas.offsetHeight;
//     }
    
//     // ==================== WEBSOCKET HANDLERS ====================
    
//     handleWebSocketMessage(data) {
//         switch(data.type) {
//             case 'connected':
//                 this.addSystemMessage(data.message);
//                 break;
            
//             case 'status':
//                 if (data.status === 'processing') {
//                     this.showLoading();
//                 }
//                 break;
            
//             case 'response':
//                 this.hideLoading();
//                 this.addVenomMessage(data.response);
//                 this.taskCount++;
//                 this.updateTaskCount();
//                 break;
            
//             case 'error':
//                 this.hideLoading();
//                 this.addErrorMessage(data.message);
//                 break;
//         }
//     }
    
//     // ==================== COMMANDS ====================
    
//     sendCommand() {
//         const text = this.commandInput.value.trim();
//         if (!text) return;
        
//         this.sendCommandText(text);
//         this.commandInput.value = '';
//     }
    
//     sendCommandText(text) {
//         if (!this.isConnected) {
//             alert('Not connected to server!');
//             return;
//         }
        
//         // Add user message
//         this.addUserMessage(text);
        
//         // Send via WebSocket
//         this.ws.send(JSON.stringify({
//             type: 'command',
//             command: text
//         }));
//     }
    
//     // ==================== VOICE RECORDING ====================
    
//     async toggleRecording() {
//         if (!this.isRecording) {
//             await this.startRecording();
//         } else {
//             this.stopRecording();
//         }
//     }
    
//     async startRecording() {
//         try {
//             // Request microphone permission
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
//             this.isRecording = true;
//             this.micButton.classList.add('recording');
//             this.pulseRing.classList.add('active');
            
//             // Web Speech API
//             if ('webkitSpeechRecognition' in window) {
//                 const recognition = new webkitSpeechRecognition();
//                 recognition.continuous = false;
//                 recognition.interimResults = false;
//                 recognition.lang = 'en-US';
                
//                 recognition.onresult = (event) => {
//                     const transcript = event.results[0][0].transcript;
//                     this.sendCommandText(transcript);
//                     this.stopRecording();
//                 };
                
//                 recognition.onerror = (event) => {
//                     console.error('Speech recognition error:', event.error);
//                     this.stopRecording();
//                 };
                
//                 recognition.start();
//                 this.recognition = recognition;
//             } else {
//                 alert('Speech recognition not supported in this browser');
//                 this.stopRecording();
//             }
            
//         } catch (error) {
//             console.error('Microphone error:', error);
//             alert('Could not access microphone');
//             this.stopRecording();
//         }
//     }
    
//     stopRecording() {
//         this.isRecording = false;
//         this.micButton.classList.remove('recording');
//         this.pulseRing.classList.remove('active');
        
//         if (this.recognition) {
//             this.recognition.stop();
//         }
//     }
    
//     // ==================== UI UPDATES ====================
    
//     addUserMessage(text) {
//         const messageEl = document.createElement('div');
//         messageEl.className = 'message message-user';
//         messageEl.innerHTML = `
//             <div class="message-label">🧑 You</div>
//             <div class="message-text">${this.escapeHtml(text)}</div>
//         `;
        
//         // Remove welcome if exists
//         const welcome = this.chatContainer.querySelector('.welcome-message');
//         if (welcome) welcome.remove();
        
//         this.chatContainer.appendChild(messageEl);
//         this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
//     }
    
//     addVenomMessage(text) {
//         const messageEl = document.createElement('div');
//         messageEl.className = 'message message-venom';
//         messageEl.innerHTML = `
//             <div class="message-label">⚡ VENOM</div>
//             <div class="message-text">${this.escapeHtml(text)}</div>
//         `;
        
//         this.chatContainer.appendChild(messageEl);
//         this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
//     }
    
//     addSystemMessage(text) {
//         const messageEl = document.createElement('div');
//         messageEl.className = 'message';
//         messageEl.style.color = '#94a3b8';
//         messageEl.style.fontSize = '0.85rem';
//         messageEl.style.textAlign = 'center';
//         messageEl.textContent = `⚙️ ${text}`;
        
//         this.chatContainer.appendChild(messageEl);
//         this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
//     }
    
//     addErrorMessage(text) {
//         const messageEl = document.createElement('div');
//         messageEl.className = 'message';
//         messageEl.style.background = 'rgba(255, 68, 68, 0.1)';
//         messageEl.style.borderLeft = '3px solid #ff4444';
//         messageEl.style.padding = '12px';
//         messageEl.style.borderRadius = '12px';
//         messageEl.innerHTML = `
//             <div style="color: #ff4444; font-weight: 700; font-size: 0.75rem; margin-bottom: 6px;">❌ ERROR</div>
//             <div style="color: #fff; font-size: 0.9rem;"
// app.js - FIXED MOBILE APP LOGIC

class VenomMobileApp {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.isRecording = false;
        this.taskCount = 0;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.initElements();
        this.initWebSocket();
        this.initEventListeners();
        this.initVisualizer();
    }
    
    // ==================== INITIALIZATION ====================
    
    initElements() {
        this.micButton = document.getElementById('micButton');
        this.sendButton = document.getElementById('sendButton');
        this.commandInput = document.getElementById('commandInput');
        this.chatContainer = document.getElementById('chatContainer');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.pulseRing = document.getElementById('pulseRing');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.visualizerCanvas = document.getElementById('visualizer');
        this.taskCountEl = document.getElementById('taskCount');
    }
    
    initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log('🔌 Connecting to:', wsUrl);
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateStatus('Connected', 'connected');
                console.log('✅ Connected to VENOM AI');
                this.addSystemMessage('Connected to desktop');
            };
            
            this.ws.onmessage = (event) => {
                console.log('📨 Message received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (e) {
                    console.error('Parse error:', e);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateStatus('Error', 'error');
            };
            
            this.ws.onclose = () => {
                this.isConnected = false;
                this.updateStatus('Disconnected', 'disconnected');
                console.log('❌ Disconnected from VENOM AI');
                
                // Reconnect logic
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => this.initWebSocket(), 3000);
                } else {
                    this.addErrorMessage('Connection lost. Please refresh the page.');
                }
            };
        } catch (error) {
            console.error('❌ WebSocket creation failed:', error);
            this.updateStatus('Error', 'error');
        }
    }
    
    initEventListeners() {
        // Mic button
        if (this.micButton) {
            this.micButton.addEventListener('click', () => this.toggleRecording());
        }
        
        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendCommand());
        }
        
        // Input enter key
        if (this.commandInput) {
            this.commandInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendCommand();
                }
            });
        }
        
        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                console.log('🎯 Quick action:', command);
                this.sendCommandText(command);
            });
        });
    }
    
    initVisualizer() {
        if (!this.visualizerCanvas) return;
        
        this.canvasCtx = this.visualizerCanvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.animateVisualizer();
    }
    
    resizeCanvas() {
        if (!this.visualizerCanvas) return;
        this.visualizerCanvas.width = this.visualizerCanvas.offsetWidth;
        this.visualizerCanvas.height = this.visualizerCanvas.offsetHeight;
    }
    
    // ==================== WEBSOCKET HANDLERS ====================
    
    handleWebSocketMessage(data) {
        console.log('📥 Handling message:', data.type);
        
        switch(data.type) {
            case 'connected':
                this.addSystemMessage(data.message);
                break;
            
            case 'status':
                if (data.status === 'processing') {
                    this.showLoading();
                }
                break;
            
            case 'response':
                this.hideLoading();
                this.addVenomMessage(data.response);
                this.taskCount++;
                this.updateTaskCount();
                break;
            
            case 'error':
                this.hideLoading();
                this.addErrorMessage(data.message);
                break;
        }
    }
    
    // ==================== COMMANDS ====================
    
    sendCommand() {
        const text = this.commandInput.value.trim();
        if (!text) {
            console.log('⚠️ Empty command');
            return;
        }
        
        console.log('📤 Sending command:', text);
        this.sendCommandText(text);
        this.commandInput.value = '';
    }
    
    sendCommandText(text) {
        if (!this.isConnected) {
            alert('❌ Not connected to desktop! Please check connection.');
            console.error('Not connected');
            return;
        }
        
        console.log('🚀 Sending to server:', text);
        
        // Add user message
        this.addUserMessage(text);
        
        // Send via WebSocket
        try {
            const message = JSON.stringify({
                type: 'command',
                command: text
            });
            
            console.log('📡 WebSocket send:', message);
            this.ws.send(message);
            
            // Show loading
            this.showLoading();
            
        } catch (error) {
            console.error('❌ Send failed:', error);
            this.addErrorMessage('Failed to send command: ' + error.message);
        }
    }
    
    // ==================== VOICE RECORDING ====================
    
    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            console.log('🎤 Starting recording...');
            
            // Check if browser supports speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                alert('❌ Speech recognition not supported in this browser. Please use Chrome or Edge.');
                return;
            }
            
            this.isRecording = true;
            this.micButton.classList.add('recording');
            this.pulseRing.classList.add('active');
            
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => {
                console.log('🎤 Recording started');
                this.addSystemMessage('Listening...');
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('📝 Transcribed:', transcript);
                this.sendCommandText(transcript);
                this.stopRecording();
            };
            
            recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                alert('Voice recognition error: ' + event.error);
                this.stopRecording();
            };
            
            recognition.onend = () => {
                console.log('🎤 Recording ended');
                this.stopRecording();
            };
            
            recognition.start();
            this.recognition = recognition;
            
        } catch (error) {
            console.error('❌ Microphone error:', error);
            alert('Could not access microphone: ' + error.message);
            this.stopRecording();
        }
    }
    
    stopRecording() {
        console.log('🛑 Stopping recording');
        this.isRecording = false;
        this.micButton.classList.remove('recording');
        this.pulseRing.classList.remove('active');
        
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
    }
    
    // ==================== UI UPDATES ====================
    
    addUserMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message message-user';
        messageEl.innerHTML = `
            <div class="message-label">🧑 You</div>
            <div class="message-text">${this.escapeHtml(text)}</div>
        `;
        
        // Remove welcome if exists
        const welcome = this.chatContainer.querySelector('.welcome-message');
        if (welcome) welcome.remove();
        
        this.chatContainer.appendChild(messageEl);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        console.log('✅ User message added');
    }
    
    addVenomMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message message-venom';
        messageEl.innerHTML = `
            <div class="message-label">⚡ VENOM</div>
            <div class="message-text">${this.escapeHtml(text)}</div>
        `;
        
        this.chatContainer.appendChild(messageEl);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        console.log('✅ Venom message added');
    }
    
    addSystemMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.style.color = '#94a3b8';
        messageEl.style.fontSize = '0.85rem';
        messageEl.style.textAlign = 'center';
        messageEl.textContent = `⚙️ ${text}`;
        
        this.chatContainer.appendChild(messageEl);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    addErrorMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.style.background = 'rgba(255, 68, 68, 0.1)';
        messageEl.style.borderLeft = '3px solid #ff4444';
        messageEl.style.padding = '12px';
        messageEl.style.borderRadius = '12px';
        messageEl.innerHTML = `
            <div style="color: #ff4444; font-weight: 700; font-size: 0.75rem; margin-bottom: 6px;">❌ ERROR</div>
            <div style="color: #fff; font-size: 0.9rem;">${this.escapeHtml(text)}</div>
        `;
        
        this.chatContainer.appendChild(messageEl);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    updateStatus(text, state) {
        if (!this.statusIndicator) return;
        
        const statusText = this.statusIndicator.querySelector('.status-text');
        const statusDot = this.statusIndicator.querySelector('.status-dot');
        
        if (statusText) statusText.textContent = text;
        
        const colors = {
            connected: '#00ff88',
            disconnected: '#ff4444',
            error: '#fb923c'
        };
        
        if (statusDot && colors[state]) {
            statusDot.style.background = colors[state];
            if (statusText) statusText.style.color = colors[state];
        }
    }
    
    updateTaskCount() {
        if (this.taskCountEl) {
            this.taskCountEl.textContent = this.taskCount;
        }
    }
    
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
    }
    
    // ==================== VISUALIZER ====================
    
    animateVisualizer() {
        const draw = () => {
            if (!this.canvasCtx || !this.visualizerCanvas) return;
            
            const width = this.visualizerCanvas.width;
            const height = this.visualizerCanvas.height;
            
            this.canvasCtx.clearRect(0, 0, width, height);
            
            const barCount = 50;
            const barWidth = width / barCount;
            
            for (let i = 0; i < barCount; i++) {
                const barHeight = this.isRecording 
                    ? Math.random() * height * 0.6 + 20
                    : Math.random() * height * 0.2 + 10;
                
                const x = i * barWidth;
                const y = height / 2 - barHeight / 2;
                
                const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#00d4ff');
                gradient.addColorStop(1, '#a855f7');
                
                this.canvasCtx.fillStyle = gradient;
                this.canvasCtx.fillRect(x, y, barWidth - 2, barHeight);
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    // ==================== UTILITIES ====================
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing VENOM Mobile App...');
    window.venomApp = new VenomMobileApp();
    console.log('✅ App initialized');
});