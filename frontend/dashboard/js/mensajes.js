class MensajesManager {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.messages = {};
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initEventListeners();
        this.loadConversations();
        this.loadUserData();
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = '../login.html';
            return;
        }

        this.user = JSON.parse(user);
        this.displayUserInfo(this.user);
    }

    displayUserInfo(user) {
        const userInfoElements = document.querySelectorAll('.user-name, .user-role');
        userInfoElements.forEach(element => {
            if (element.classList.contains('user-name')) {
                element.textContent = `${user.nombre} ${user.apellidos}`;
            }
        });
    }

    initEventListeners() {
        // Botón nuevo mensaje
        document.getElementById('nuevoMensajeBtn').addEventListener('click', () => this.showNewMessageModal());
        
        // Formulario de nuevo mensaje
        document.getElementById('sendNewMessageBtn').addEventListener('click', () => this.sendNewMessage());
        
        // Selector de destinatario
        document.getElementById('messageTo').addEventListener('change', (e) => this.handleRecipientChange(e.target.value));
        
        // Búsqueda de conversaciones
        document.getElementById('searchConversations').addEventListener('input', (e) => this.searchConversations(e.target.value));
        
        // Formulario de mensaje en chat
        document.getElementById('messageForm').addEventListener('submit', (e) => this.sendMessage(e));
        
        // Input de mensaje
        document.getElementById('messageInput').addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Botón adjuntar archivo
        document.getElementById('attachBtn').addEventListener('click', () => this.showAttachModal());
        
        // Contactos rápidos
        document.querySelectorAll('.contacto-item').forEach(contact => {
            contact.addEventListener('click', () => this.startConversation(contact.dataset.contact));
        });
        
        // Botones de chat
        document.getElementById('chatInfoBtn').addEventListener('click', () => this.toggleChatInfo());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());
        
        // Modal de adjuntar archivo
        document.getElementById('confirmAttachBtn').addEventListener('click', () => this.confirmAttach());
        
        // Drag and drop para archivos
        this.initFileDrop();
    }

    async loadUserData() {
        // Cargar datos adicionales del usuario si es necesario
        this.user.departamento = 'Apartamento 302';
    }

    async loadConversations() {
        try {
            this.conversations = await this.fetchConversations();
            this.renderConversations();
            this.updateUnreadBadge();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    async fetchConversations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'admin-general',
                        name: 'Administración General',
                        type: 'admin',
                        lastMessage: 'Hemos programado mantenimiento para el próximo viernes',
                        timestamp: new Date(2024, 10, 20, 14, 30),
                        unread: 2,
                        avatar: 'admin'
                    },
                    {
                        id: 'mantenimiento',
                        name: 'Departamento de Mantenimiento',
                        type: 'maintenance',
                        lastMessage: 'Su solicitud de reparación ha sido aprobada',
                        timestamp: new Date(2024, 10, 19, 11, 15),
                        unread: 0,
                        avatar: 'maintenance'
                    },
                    {
                        id: 'seguridad',
                        name: 'Seguridad',
                        type: 'security',
                        lastMessage: 'Recordatorio: Puertas se cierran a las 10 PM',
                        timestamp: new Date(2024, 10, 18, 9, 45),
                        unread: 1,
                        avatar: 'security'
                    },
                    {
                        id: 'vecino-301',
                        name: 'María González - Apt 301',
                        type: 'resident',
                        lastMessage: '¿Nos vemos en la reunión de mañana?',
                        timestamp: new Date(2024, 10, 17, 16, 20),
                        unread: 0,
                        avatar: 'resident'
                    }
                ]);
            }, 1000);
        });
    }

    renderConversations() {
        const conversationList = document.getElementById('conversationList');
        if (!conversationList) return;

        conversationList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            conversationList.appendChild(conversationElement);
        });
    }

    createConversationElement(conversation) {
        const div = document.createElement('div');
        div.className = `conversation-item ${conversation.unread > 0 ? 'unread' : ''}`;
        div.dataset.conversationId = conversation.id;
        
        div.addEventListener('click', () => this.selectConversation(conversation));

        const timeAgo = this.getTimeAgo(conversation.timestamp);
        const avatarClass = `conversation-avatar ${conversation.avatar}`;
        const avatarIcon = this.getAvatarIcon(conversation.type);

        div.innerHTML = `
            <div class="${avatarClass}">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="conversation-info">
                <h6>${conversation.name}</h6>
                <p class="conversation-preview">${conversation.lastMessage}</p>
            </div>
            <div class="conversation-meta">
                <div class="conversation-time">${timeAgo}</div>
                ${conversation.unread > 0 ? 
                    `<div class="conversation-badge">${conversation.unread}</div>` : 
                    ''
                }
            </div>
        `;

        return div;
    }

    getAvatarIcon(type) {
        const icons = {
            'admin': 'fas fa-user-tie',
            'security': 'fas fa-shield-alt',
            'maintenance': 'fas fa-tools',
            'resident': 'fas fa-user'
        };
        return icons[type] || 'fas fa-user';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return timestamp.toLocaleDateString('es-ES');
    }

    async selectConversation(conversation) {
        // Remover active de todas las conversaciones
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });

        // Agregar active a la conversación seleccionada
        const conversationElement = document.querySelector(`[data-conversation-id="${conversation.id}"]`);
        if (conversationElement) {
            conversationElement.classList.add('active');
        }

        this.currentConversation = conversation;
        await this.loadMessages(conversation.id);
        this.updateChatHeader(conversation);
        this.enableChat();
        
        // Marcar como leído
        await this.markAsRead(conversation.id);
    }

    async loadMessages(conversationId) {
        try {
            const messages = await this.fetchMessages(conversationId);
            this.messages[conversationId] = messages;
            this.renderMessages(messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async fetchMessages(conversationId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const messages = {
                    'admin-general': [
                        {
                            id: 1,
                            sender: 'admin',
                            text: 'Buenos días, le informamos que hemos programado mantenimiento en las áreas comunes para el próximo viernes de 9:00 a 13:00.',
                            timestamp: new Date(2024, 10, 20, 14, 30),
                            attachments: []
                        },
                        {
                            id: 2,
                            sender: 'user',
                            text: 'Gracias por la información. ¿Habrá acceso a la piscina durante ese horario?',
                            timestamp: new Date(2024, 10, 20, 14, 35),
                            attachments: []
                        },
                        {
                            id: 3,
                            sender: 'admin',
                            text: 'La piscina permanecerá cerrada durante el mantenimiento por seguridad. Disculpe las molestias.',
                            timestamp: new Date(2024, 10, 20, 14, 40),
                            attachments: []
                        }
                    ],
                    'mantenimiento': [
                        {
                            id: 1,
                            sender: 'user',
                            text: 'Buen día, tengo un problema con el aire acondicionado en el dormitorio principal.',
                            timestamp: new Date(2024, 10, 19, 10, 0),
                            attachments: []
                        },
                        {
                            id: 2,
                            sender: 'maintenance',
                            text: 'Hemos recibido su solicitud. Un técnico visitará su departamento mañana entre 9:00 y 12:00.',
                            timestamp: new Date(2024, 10, 19, 11, 15),
                            attachments: []
                        }
                    ]
                };
                
                resolve(messages[conversationId] || []);
            }, 500);
        });
    }

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        chatMessages.innerHTML = '';

        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h4>No hay mensajes aún</h4>
                    <p class="text-muted">Sé el primero en enviar un mensaje en esta conversación</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });

        // Scroll al final
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        const isSent = message.sender === 'user';
        div.className = `message ${isSent ? 'sent' : 'received'}`;

        const avatarIcon = this.getAvatarIcon(message.sender);
        const time = message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        div.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p class="message-text">${message.text}</p>
                ${message.attachments && message.attachments.length > 0 ? 
                    this.createAttachmentsHTML(message.attachments) : 
                    ''
                }
                <div class="message-time">${time}</div>
            </div>
        `;

        return div;
    }

    createAttachmentsHTML(attachments) {
        return `
            <div class="message-attachment">
                ${attachments.map(attachment => `
                    <a href="#" class="attachment-item">
                        <i class="fas fa-file ${this.getFileIcon(attachment.type)}"></i>
                        <span>${attachment.name}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    getFileIcon(fileType) {
        const icons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'jpg': 'fa-file-image',
            'png': 'fa-file-image',
            'zip': 'fa-file-archive'
        };
        
        const extension = fileType.split('/').pop();
        return icons[extension] || 'fa-file';
    }

    updateChatHeader(conversation) {
        document.getElementById('partnerName').textContent = conversation.name;
        document.getElementById('partnerStatus').textContent = 'En línea';
        
        const partnerAvatar = document.getElementById('partnerAvatar');
        partnerAvatar.className = `partner-avatar ${conversation.avatar}`;
        partnerAvatar.innerHTML = `<i class="${this.getAvatarIcon(conversation.type)}"></i>`;
    }

    enableChat() {
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatInfoBtn = document.getElementById('chatInfoBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');

        messageForm.classList.remove('d-none');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        chatInfoBtn.disabled = false;
        clearChatBtn.disabled = false;

        messageInput.focus();
    }

    async sendMessage(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();
        
        if (!text || !this.currentConversation) return;

        // Crear mensaje temporal
        const tempMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
            attachments: [],
            status: 'sending'
        };

        // Agregar a la interfaz
        this.addMessageToChat(tempMessage);
        messageInput.value = '';
        
        // Simular envío
        setTimeout(() => {
            this.updateMessageStatus(tempMessage.id, 'sent');
            
            // Simular respuesta automática para algunas conversaciones
            if (this.currentConversation.type !== 'resident') {
                setTimeout(() => {
                    this.receiveAutoReply(text);
                }, 2000);
            }
        }, 1000);
    }

    addMessageToChat(message) {
        const chatMessages = document.getElementById('chatMessages');
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = this.createMessageElement(message);
        chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    updateMessageStatus(messageId, status) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                statusElement.className = `message-status status-${status}`;
                statusElement.innerHTML = `<i class="fas fa-${this.getStatusIcon(status)}"></i>`;
            }
        }
    }

    getStatusIcon(status) {
        const icons = {
            'sending': 'clock',
            'sent': 'check',
            'delivered': 'check-double',
            'read': 'check-double text-primary'
        };
        return icons[status] || 'question';
    }

    receiveAutoReply(userMessage) {
        if (!this.currentConversation) return;

        const replies = {
            'admin': [
                'Hemos recibido su mensaje. Le responderemos a la brevedad.',
                'Gracias por contactarnos. ¿En qué más podemos ayudarle?',
                'Su consulta ha sido registrada en nuestro sistema.'
            ],
            'maintenance': [
                'Hemos anotado su solicitud. Nos pondremos en contacto para coordinar una visita.',
                'Nuestro equipo de mantenimiento revisará su reporte.',
                '¿Podría proporcionar más detalles sobre el problema?'
            ],
            'security': [
                'Mensaje recibido por el departamento de seguridad.',
                '¿Requiere asistencia inmediata?',
                'Hemos tomado nota de su comunicación.'
            ]
        };

        const possibleReplies = replies[this.currentConversation.type] || ['Mensaje recibido.'];
        const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];

        const autoMessage = {
            id: 'auto-' + Date.now(),
            sender: this.currentConversation.type,
            text: randomReply,
            timestamp: new Date(),
            attachments: []
        };

        this.addMessageToChat(autoMessage);
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('messageForm').dispatchEvent(new Event('submit'));
        }
    }

    showNewMessageModal() {
        const modal = new bootstrap.Modal(document.getElementById('nuevoMensajeModal'));
        modal.show();
    }

    handleRecipientChange(recipient) {
        const vecinoSelector = document.getElementById('vecinoSelector');
        if (recipient === 'vecino') {
            vecinoSelector.style.display = 'block';
        } else {
            vecinoSelector.style.display = 'none';
        }
    }

    async sendNewMessage() {
        const form = document.getElementById('nuevoMensajeForm');
        const sendBtn = document.getElementById('sendNewMessageBtn');
        
        if (!this.validateNewMessageForm()) {
            return;
        }

        const messageData = this.getNewMessageData();
        this.setLoading(sendBtn, true);

        try {
            await this.sendMessageToAPI(messageData);
            this.showNotification('Mensaje enviado exitosamente', 'success');
            this.closeNewMessageModal();
            // Aquí podrías agregar la nueva conversación a la lista
        } catch (error) {
            this.showNotification('Error al enviar el mensaje', 'error');
        } finally {
            this.setLoading(sendBtn, false);
        }
    }

    validateNewMessageForm() {
        const to = document.getElementById('messageTo').value;
        const subject = document.getElementById('messageSubject').value;
        const content = document.getElementById('messageContent').value;

        if (!to) {
            this.showNotification('Por favor selecciona un destinatario', 'error');
            return false;
        }

        if (!subject.trim()) {
            this.showNotification('Por favor ingresa un asunto', 'error');
            return false;
        }

        if (!content.trim()) {
            this.showNotification('Por favor escribe el mensaje', 'error');
            return false;
        }

        return true;
    }

    getNewMessageData() {
        return {
            to: document.getElementById('messageTo').value,
            subject: document.getElementById('messageSubject').value,
            content: document.getElementById('messageContent').value,
            priority: document.getElementById('messagePriority').value,
            sendCopy: document.getElementById('messageCopy').checked,
            timestamp: new Date()
        };
    }

    async sendMessageToAPI(messageData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Mensaje enviado:', messageData);
                resolve({ success: true, id: Date.now() });
            }, 1500);
        });
    }

    closeNewMessageModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoMensajeModal'));
        modal.hide();
        document.getElementById('nuevoMensajeForm').reset();
    }

    startConversation(contactType) {
        // Buscar si ya existe una conversación con este contacto
        const existingConversation = this.conversations.find(conv => conv.type === contactType);
        
        if (existingConversation) {
            this.selectConversation(existingConversation);
        } else {
            // Crear nueva conversación
            const newConversation = {
                id: contactType,
                name: this.getContactName(contactType),
                type: contactType,
                lastMessage: '',
                timestamp: new Date(),
                unread: 0,
                avatar: contactType
            };
            
            this.conversations.unshift(newConversation);
            this.renderConversations();
            this.selectConversation(newConversation);
        }
    }

    getContactName(contactType) {
        const names = {
            'administracion': 'Administración General',
            'seguridad': 'Seguridad',
            'mantenimiento': 'Mantenimiento'
        };
        return names[contactType] || contactType;
    }

    showAttachModal() {
        const modal = new bootstrap.Modal(document.getElementById('attachModal'));
        modal.show();
    }

    initFileDrop() {
        const uploadArea = document.querySelector('.file-upload-area');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        
        Array.from(files).forEach(file => {
            const fileItem = this.createFileItem(file);
            fileList.appendChild(fileItem);
        });
    }

    createFileItem(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        div.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="file-remove" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        return div;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    confirmAttach() {
        // Aquí implementarías la lógica para adjuntar archivos al mensaje
        this.showNotification('Funcionalidad de adjuntar archivos en desarrollo', 'info');
        const modal = bootstrap.Modal.getInstance(document.getElementById('attachModal'));
        modal.hide();
    }

    toggleChatInfo() {
        const chatInfoCard = document.getElementById('chatInfoCard');
        chatInfoCard.classList.toggle('d-none');
        
        if (!chatInfoCard.classList.contains('d-none')) {
            this.loadChatInfo();
        }
    }

    loadChatInfo() {
        if (!this.currentConversation) return;

        const chatInfoContent = document.getElementById('chatInfoContent');
        
        chatInfoContent.innerHTML = `
            <div class="chat-info-item">
                <strong>Conversación con:</strong>
                <span class="value">${this.currentConversation.name}</span>
            </div>
            <div class="chat-info-item">
                <strong>Tipo:</strong>
                <span class="value">${this.getConversationTypeText(this.currentConversation.type)}</span>
            </div>
            <div class="chat-info-item">
                <strong>Iniciada:</strong>
                <span class="value">${this.currentConversation.timestamp.toLocaleDateString('es-ES')}</span>
            </div>
            <div class="chat-info-item">
                <strong>Mensajes:</strong>
                <span class="value">${this.messages[this.currentConversation.id]?.length || 0}</span>
            </div>
            <div class="chat-info-item">
                <strong>Estado:</strong>
                <span class="value">Activa</span>
            </div>
        `;
    }

    getConversationTypeText(type) {
        const types = {
            'admin': 'Administración',
            'security': 'Seguridad',
            'maintenance': 'Mantenimiento',
            'resident': 'Residente'
        };
        return types[type] || type;
    }

    clearChat() {
        if (!this.currentConversation || !confirm('¿Estás seguro de que quieres limpiar esta conversación?')) {
            return;
        }

        this.messages[this.currentConversation.id] = [];
        this.renderMessages([]);
        this.showNotification('Conversación limpiada', 'success');
    }

    async markAsRead(conversationId) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (conversation && conversation.unread > 0) {
            conversation.unread = 0;
            this.renderConversations();
            this.updateUnreadBadge();
        }
    }

    updateUnreadBadge() {
        const totalUnread = this.conversations.reduce((sum, conv) => sum + conv.unread, 0);
        const unreadBadge = document.getElementById('unreadBadge');
        
        if (unreadBadge) {
            unreadBadge.textContent = totalUnread;
            unreadBadge.style.display = totalUnread > 0 ? 'flex' : 'none';
        }
    }

    searchConversations(query) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        const searchTerm = query.toLowerCase();

        conversationItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        }
    }

    showNotification(message, type = 'success') {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
        `;
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar el manager de mensajes
const mensajesManager = new MensajesManager();