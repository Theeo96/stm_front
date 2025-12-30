(function () {
    window.Controls = {};

    window.Controls.init = function () {
        setupEventListeners();
        updateControlButtons();
    };

    function setupEventListeners() {
        const startBtn = document.getElementById('startMonitoring');
        const stopBtn = document.getElementById('stopMonitoring');
        const pauseBtn = document.getElementById('pauseMonitoring');
        const alertBtn = document.getElementById('emergencyAlert');

        if (startBtn) { startBtn.removeEventListener('click', window.Controls.startMonitoring); startBtn.addEventListener('click', window.Controls.startMonitoring); }
        if (stopBtn) { stopBtn.removeEventListener('click', window.Controls.stopMonitoring); stopBtn.addEventListener('click', window.Controls.stopMonitoring); }
        if (pauseBtn) { pauseBtn.removeEventListener('click', window.Controls.pauseMonitoring); pauseBtn.addEventListener('click', window.Controls.pauseMonitoring); }
        if (alertBtn) { alertBtn.removeEventListener('click', sendEmergencyAlert); alertBtn.addEventListener('click', sendEmergencyAlert); }
    }

    window.Controls.startMonitoring = function () {
        if (window.Store.state.isMonitoring) return;
        if (window.Store) window.Store.setMonitoringState(true);
        updateControlButtons();
        updateSystemStatus('monitoring');

        if (window.Agents) window.Agents.updateAgentStatus('monitor', 'active');

        if (window.Logging) {
            const t = window.translate || ((k) => k);
            window.Logging.addActivityLog(t('log.type.success') || '성공', `[${t('log.category.monitor') || '감독'}] ${t('log.monitoring.started') || '모니터링 시작'}`, 'success');
        }

        window.dispatchEvent(new CustomEvent('monitoringStarted'));
    };

    window.Controls.stopMonitoring = function () {
        if (window.Store) {
            window.Store.state.isMonitoring = false;
            window.Store.setStudents([]); // 데이터 비우기
        }
        updateControlButtons();
        updateSystemStatus('standby');
        if (window.Agents) window.Agents.updateAgentStatus('monitor', 'inactive');

        if (window.Logging) {
            const t = window.translate || ((k) => k);
            window.Logging.addActivityLog(t('log.type.warning') || '경고', `[${t('log.category.monitor') || '감독'}] ${t('log.monitoring.stopped') || '모니터링 중지'}`, 'warning');
        }

        window.dispatchEvent(new CustomEvent('monitoringStopped'));
    };

    window.Controls.pauseMonitoring = function () {
        if (window.Store) window.Store.state.isMonitoring = false;
        updateControlButtons();
        updateSystemStatus('standby');
        if (window.Agents) window.Agents.updateAgentStatus('monitor', 'standby');

        if (window.Logging) {
            const t = window.translate || ((k) => k);
            window.Logging.addActivityLog(t('log.type.warning') || '경고', `[${t('log.category.monitor') || '감독'}] ${t('log.monitoring.paused') || '모니터링 일시정지'}`, 'warning');
        }

        window.dispatchEvent(new CustomEvent('monitoringPaused'));
    };

    function sendEmergencyAlert() {
        if (window.Logging) {
            const t = window.translate || ((k) => k);
            window.Logging.addActivityLog(t('log.type.error') || '오류', `[긴급] ${t('log.emergency.sent') || '긴급 공지 발송'}`, 'error');
        }
        alert('🚨 긴급 공지가 모든 수강생에게 발송되었습니다.');
    }

    function updateControlButtons() {
        const isMonitoring = window.Store.state.isMonitoring;
        const startBtn = document.getElementById('startMonitoring');
        const stopBtn = document.getElementById('stopMonitoring');
        const pauseBtn = document.getElementById('pauseMonitoring');

        if (startBtn) startBtn.disabled = isMonitoring;
        if (stopBtn) stopBtn.disabled = !isMonitoring;
        if (pauseBtn) pauseBtn.disabled = !isMonitoring;
    }

    function updateSystemStatus(status) {
        const statusBadge = document.getElementById('systemStatusBadge');
        const statusIcon = document.getElementById('systemStatusIcon');
        const statusText = document.getElementById('systemStatusText');

        if (!statusBadge || !statusIcon || !statusText) return;

        statusBadge.className = 'status-badge';
        if (status === 'monitoring') {
            statusBadge.classList.add('monitoring');
            statusIcon.style.color = '#10B981';
            statusText.textContent = window.translate ? window.translate('system.monitoring') : 'System Monitoring';
        } else {
            statusIcon.style.color = '#fff';
            statusText.textContent = window.translate ? window.translate('system.standby') : 'System Standby';
        }
    }
})();
