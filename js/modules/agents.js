(function () {
    window.Agents = {};

    // Agent 설정 기본값
    const defaultAgentSettings = {
        admin: { enabled: true, responseSpeed: 'medium', language: 'ko', apiEndpoint: 'https://api.example.com/admin', autoResponse: true, notificationFrequency: 10, maxQueueSize: 50 },
        tutor: { enabled: true, responseSpeed: 'fast', language: 'ko', apiEndpoint: 'https://api.example.com/tutor', ragEnabled: true, summaryInterval: 30, contextWindow: 10 },
        monitor: { enabled: true, detectionSensitivity: 'high', alertThreshold: 3, apiEndpoint: 'https://api.example.com/monitor', faceRecognition: true, autoWarning: true, checkInterval: 5 },
        attendance: { enabled: true, autoApproval: false, apiEndpoint: 'https://api.example.com/attendance', notifyOnChange: true, syncInterval: 15, lateThreshold: 10 }
    };

    let agentSettings = {};
    let currentAgentType = '';

    window.Agents.init = function () {
        // Default statuses
        window.Agents.updateAgentStatus('admin', 'active');
        window.Agents.updateAgentStatus('tutor', 'active');
        window.Agents.updateAgentStatus('monitor', 'inactive');
        window.Agents.updateAgentStatus('attendance', 'active');

        loadAgentSettings();
    };

    window.Agents.openAgentSettings = function (agentType) {
        currentAgentType = agentType;
        const modal = document.getElementById('agentSettingsModal');
        const modalAgentName = document.getElementById('modalAgentName');
        const modalBody = document.getElementById('modalBody');

        const agentNames = { 'admin': '운영 Agent', 'tutor': '학습 Agent', 'monitor': '감시 Agent', 'attendance': '출결 Agent' };
        if (modalAgentName) modalAgentName.textContent = agentNames[agentType];
        if (modalBody) modalBody.innerHTML = generateSettingsForm(agentType);
        if (modal) modal.classList.add('show');

        if (window.Logging) window.Logging.addActivityLog('정보', `[설정] ${agentNames[agentType]} 설정 창이 열렸습니다.`, 'info');
    };

    window.Agents.saveAgentSettings = function () {
        const type = currentAgentType;
        const settings = agentSettings[type];

        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
        const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : null; };

        // Updating settings from DOM
        const enabled = getChk('enabled'); if (enabled !== null) settings.enabled = enabled;
        const api = getVal('apiEndpoint'); if (api) settings.apiEndpoint = api;
        const lang = getVal('language'); if (lang) settings.language = lang;

        // Simplified specific settings extraction (assuming IDs match keys)
        if (type === 'admin') {
            const keys = ['responseSpeed', 'notificationFrequency', 'maxQueueSize'];
            keys.forEach(k => { const v = getVal(k); if (v) settings[k] = v; });
            const auto = getChk('autoResponse'); if (auto !== null) settings.autoResponse = auto;
        } else if (type === 'tutor') {
            const keys = ['responseSpeed', 'summaryInterval', 'contextWindow'];
            keys.forEach(k => { const v = getVal(k); if (v) settings[k] = v; });
            const rag = getChk('ragEnabled'); if (rag !== null) settings.ragEnabled = rag;
        } else if (type === 'monitor') {
            const keys = ['detectionSensitivity', 'alertThreshold', 'checkInterval'];
            keys.forEach(k => { const v = getVal(k); if (v) settings[k] = v; });
            const face = getChk('faceRecognition'); if (face !== null) settings.faceRecognition = face;
            const auto = getChk('autoWarning'); if (auto !== null) settings.autoWarning = auto;
        }

        saveAllAgentSettings();

        const modal = document.getElementById('agentSettingsModal');
        if (modal) modal.classList.remove('show');

        const agentNames = { 'admin': '운영 Agent', 'tutor': '학습 Agent', 'monitor': '감시 Agent', 'attendance': '출결 Agent' };

        if (window.Logging) window.Logging.addActivityLog('성공', `[설정] ${agentNames[type]} 설정이 저장되었습니다.`, 'success');

        window.Agents.updateAgentStatus(type, settings.enabled ? 'active' : 'standby');
        alert(`✅ ${agentNames[type]} 설정이 저장되었습니다.`);
    };

    window.Agents.updateAgentStatus = function (agentType, status) {
        const card = document.querySelector(`.agent-card[data-agent="${agentType}"]`);
        if (!card) return;

        const statusEl = card.querySelector('.agent-status');
        const icon = statusEl.querySelector('i');
        const text = statusEl.querySelector('span');

        statusEl.className = `agent-status ${status}`;

        if (text) {
            const key = `agent.status.${status}`;
            text.setAttribute('data-i18n', key);
            text.textContent = window.translate ? window.translate(key) : status;
        }
    };

    function loadAgentSettings() {
        const savedSettings = localStorage.getItem('agentSettings');
        if (savedSettings) {
            agentSettings = JSON.parse(savedSettings);
        } else {
            agentSettings = JSON.parse(JSON.stringify(defaultAgentSettings));
            saveAllAgentSettings();
        }
        if (window.Store) window.Store.state.agentSettings = agentSettings;
    }

    function saveAllAgentSettings() {
        localStorage.setItem('agentSettings', JSON.stringify(agentSettings));
        if (window.Store) window.Store.state.agentSettings = agentSettings;
    }

    function generateSettingsForm(agentType) {
        const settings = agentSettings[agentType];

        // Brief helper to avoid massive string concat
        const prop = (label, id, type = 'text', val = '') => `<div class="form-group"><label>${label}</label><input type="${type}" id="${id}" value="${val}"></div>`;
        const chk = (label, id, checked) => `<div class="form-group"><div class="toggle-switch"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}><label for="${id}">${label}</label></div></div>`;

        // Re-using the full HTML structure from previous file view for fidelity
        let formHTML = '<div class="settings-form">';

        // Common
        formHTML += `<div class="form-group"><div class="toggle-switch"><input type="checkbox" id="enabled" ${settings.enabled ? 'checked' : ''}><label for="enabled"><i class="fas fa-power-off"></i> Agent 활성화</label></div><span class="form-help">이 Agent를 사용하려면 활성화하세요.</span></div>`;
        formHTML += `<div class="form-group"><label><i class="fas fa-link"></i> API 엔드포인트</label><input type="url" id="apiEndpoint" value="${settings.apiEndpoint}" placeholder="https://api.example.com"><span class="form-help">Agent가 연결할 API 주소를 입력하세요.</span></div>`;
        formHTML += `<div class="form-group"><label><i class="fas fa-language"></i> 언어 설정</label><select id="language"><option value="ko" ${settings.language === 'ko' ? 'selected' : ''}>한국어</option><option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option></select></div>`;

        if (agentType === 'admin') {
            formHTML += `<div class="form-group"><label>응답 속도</label><select id="responseSpeed"><option value="fast">빠름</option><option value="medium" selected>보통</option></select></div>`;
            formHTML += chk('자동 응답', 'autoResponse', settings.autoResponse);
            formHTML += prop('알림 빈도', 'notificationFrequency', 'number', settings.notificationFrequency);
            formHTML += prop('최대 대기열', 'maxQueueSize', 'number', settings.maxQueueSize);
        } else if (agentType === 'tutor') {
            formHTML += `<div class="form-group"><label>응답 속도</label><select id="responseSpeed"><option value="fast" selected>빠름</option></select></div>`;
            formHTML += chk('RAG 모델 활성화', 'ragEnabled', settings.ragEnabled);
            formHTML += prop('요약 주기', 'summaryInterval', 'number', settings.summaryInterval);
            formHTML += prop('컨텍스트 윈도우', 'contextWindow', 'number', settings.contextWindow);
        } else if (agentType === 'monitor') {
            formHTML += `<div class="form-group"><label>감지 민감도</label><select id="detectionSensitivity"><option value="high" selected>높음</option></select></div>`;
            formHTML += chk('얼굴 인식', 'faceRecognition', settings.faceRecognition);
            formHTML += chk('자동 경고', 'autoWarning', settings.autoWarning);
            formHTML += prop('경고 임계값', 'alertThreshold', 'number', settings.alertThreshold);
            formHTML += prop('체크 주기', 'checkInterval', 'number', settings.checkInterval);
        } else if (agentType === 'attendance') {
            formHTML += '<p style="padding:10px; color:#666;">출결 관련 추가 설정이 없습니다.</p>';
        }

        formHTML += '</div>';
        return formHTML;
    }
})();
