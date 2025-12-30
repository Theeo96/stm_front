import { state } from '../store.js';

// ============================
// 활동 로그 관리
// ============================

export function init() {
    startActivityLogUpdate();
}

// 활동 로그 추가
export function addActivityLog(type, message, logType = 'info') {
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    const logEntry = {
        time,
        type,
        message,
        logType
    };

    // Store에 추가 (UI 업데이트는 리스너 패턴으로 처리 가능하지만, 
    // 여기서는 간단히 직접 렌더링 호출을 유지하거나 store 구독을 활용)
    // store.addActivityLog(logEntry);  <-- store에 메서드 있다면 사용

    // UI 직접 업데이트 (기존 로직 유지)
    const logContainer = document.getElementById('activityLog');
    if (!logContainer) return;

    const logElement = document.createElement('div');
    logElement.className = 'log-entry';
    logElement.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-type ${logType}">${getLogTypeLabel(type)}</span>
        <span class="log-message">${message}</span>
    `;

    logContainer.prepend(logElement);

    // 로그 50개 유지
    if (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function getLogTypeLabel(type) {
    switch (type) {
        case '시스템': return 'SYSTEM';
        case '경고': return 'WARNING';
        case '알림': return 'NOTICE';
        case '출석': return 'ATTENDANCE';
        default: return type;
    }
}

// 활동 로그 자동 업데이트 시뮬레이션
function startActivityLogUpdate() {
    // 필요 시 주기적 로그 생성 로직
}
