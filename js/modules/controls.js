import { state, setMonitoringState } from '../store.js';
import { addActivityLog } from './logging.js';

// ============================
// 감독 제어 (Control Panel)
// ============================

export function init() {
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
    document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);
    document.getElementById('pauseMonitoring').addEventListener('click', pauseMonitoring);
    document.getElementById('emergencyAlert').addEventListener('click', sendEmergencyAlert);
}

// 모니터링 시작
function startMonitoring() {
    if (state.isMonitoring) return;

    // 회의 URL 확인
    const conferenceUrlInput = document.getElementById('conferenceUrl');
    const conferenceUrl = conferenceUrlInput ? conferenceUrlInput.value : '';

    if (conferenceUrl && conferenceUrl.trim() !== '') {
        console.log(`[Monitoring] Target URL: ${conferenceUrl}`);
        // 추후 curl 명령어 전송 로직 추가
    } else {
        console.warn('[Monitoring] No conference URL provided.');
    }

    setMonitoringState(true);
    updateControlButtons();
    updateSystemStatus('monitoring');

    addActivityLog('시스템', window.translate('log.system.start'), 'success');

    // 메인 로직에서 polling 시작을 트리거할 수 있도록 이벤트 호출 혹은 콜백 필요
    // 여기서는 CustomEvent를 dispatch하여 main.js가 감지하게 함
    window.dispatchEvent(new CustomEvent('monitoringStarted'));
}

// 모니터링 종료
function stopMonitoring() {
    if (!state.isMonitoring) return;

    setMonitoringState(false);
    updateControlButtons();
    updateSystemStatus('standby');

    addActivityLog('시스템', window.translate('log.system.stop'), 'warning');

    window.dispatchEvent(new CustomEvent('monitoringStopped'));
}

// 일시 정지
function pauseMonitoring() {
    if (!state.isMonitoring) return;

    setMonitoringState(false);
    updateControlButtons();
    updateSystemStatus('standby'); // 'paused' 상태가 따로 있다면 추가 필요

    addActivityLog('시스템', window.translate('log.system.pause'), 'warning');

    window.dispatchEvent(new CustomEvent('monitoringPaused')); // 일시정지 이벤트 분리
}

// 긴급 공지
function sendEmergencyAlert() {
    const message = prompt(window.translate('prompt.emergency'));
    if (message) {
        addActivityLog('경고', `${window.translate('log.emergency')}: ${message}`, 'error');
        alert(`${window.translate('alert.sent')}: ${message}`);
    }
}

// 제어 버튼 상태 업데이트
function updateControlButtons() {
    const startBtn = document.getElementById('startMonitoring');
    const stopBtn = document.getElementById('stopMonitoring');
    const pauseBtn = document.getElementById('pauseMonitoring');

    if (state.isMonitoring) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        startBtn.classList.add('disabled');
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        startBtn.classList.remove('disabled');
    }
}

// 시스템 상태 표시 업데이트
function updateSystemStatus(status) {
    const statusText = document.getElementById('systemStatusText');
    const statusIcon = document.getElementById('systemStatusIcon');
    const statusBadges = document.querySelectorAll('.status-badge');

    statusBadges.forEach(badge => {
        badge.className = 'status-badge'; // reset
        if (status === 'monitoring') {
            badge.classList.add('monitoring');
        } else {
            badge.classList.add('standby');
        }
    });

    if (status === 'monitoring') {
        statusText.setAttribute('data-i18n', 'system.monitoring');
        statusText.textContent = window.translate('system.monitoring');
        statusIcon.className = 'fas fa-video';
    } else {
        statusText.setAttribute('data-i18n', 'system.standby');
        statusText.textContent = window.translate('system.standby');
        statusIcon.className = 'fas fa-video-slash';
    }
}
