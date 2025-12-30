import { state } from '../store.js';
import { addActivityLog } from './logging.js';

// ============================
// 수강생 관리 (Render & Actions)
// ============================

export function init() {
    // 초기에는 특별히 할 것 없음
}

export function render() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // store의 students 데이터 사용
    if (!state.students || state.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">No Data</td></tr>';
        return;
    }

    state.students.forEach(student => {
        const tr = document.createElement('tr');

        // 상태 뱃지
        let statusBadge = '';
        const statusKey = `student.status.${student.status}`; // Corrected key mapping
        const statusText = window.translate(statusKey) === statusKey ? student.status : window.translate(statusKey); // Fallback to raw if logic fails

        if (student.status === 'online') {
            statusBadge = `<span class="status-badge-table online"><i class="fas fa-circle"></i> ${statusText}</span>`;
        } else if (student.status === 'away') {
            statusBadge = `<span class="status-badge-table away"><i class="fas fa-clock"></i> ${statusText}</span>`;
        } else {
            statusBadge = `<span class="status-badge-table offline"><i class="fas fa-times-circle"></i> ${statusText}</span>`;
        }

        // 카메라 상태
        let cameraStatus = '';
        if (student.camera) {
            cameraStatus = `<span class="camera-status on" title="${window.translate('student.camera.on')}"><i class="fas fa-video"></i> ON</span>`;
        } else {
            cameraStatus = `<span class="camera-status off" title="${window.translate('student.camera.off')}"><i class="fas fa-video-slash"></i> OFF</span>`;
        }

        // 얼굴 인식
        if (student.face_detected) {
            cameraStatus += ` <span class="camera-status on" title="${window.translate('face.detected')}"><i class="fas fa-smile"></i></span>`;
        } else {
            cameraStatus += ` <span class="camera-status off" title="${window.translate('face.notDetected')}"><i class="fas fa-meh-blank"></i></span>`;
        }

        // 마지막 감지 (API에서 처리된 텍스트 사용)
        const lastSeenText = student.lastSeenText || '확인 불가';

        // 번호 처리 (JSON에 num이 있으면 사용, 없으면 id 사용)
        const studentNum = student.num || student.id;

        tr.innerHTML = `
            <td>${studentNum}</td>
            <td>${student.name}</td>
            <td>${student.phone || '-'}</td>
            <td>${statusBadge}</td>
            <td>${cameraStatus}</td>
            <td>${lastSeenText}</td>
            <td><span class="warning-count">${student.warnings}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn message-btn" onclick="window.moduleActions.sendMessage(${student.id})" title="${window.translate('student.action.message')}">
                        <i class="fas fa-comment-alt"></i>
                    </button>
                    <button class="action-btn phone-btn" onclick="window.moduleActions.makePhoneCall(${student.id})" title="${window.translate('student.action.call')}">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="action-btn alert-btn-table" onclick="window.moduleActions.sendAlert(${student.id})" title="${window.translate('student.action.alert')}">
                        <i class="fas fa-exclamation-circle"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================
// 개별 수강생 알림 액션
// ============================

// 주의 전송
export function sendAlert(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
        addActivityLog('관리자', `${student.name} ${window.translate('log.manual.warn')}`, 'warning');
        alert(`${student.name}님에게 주의를 전송했습니다.`);
    }
}

// 전화 걸기
export function makePhoneCall(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
        addActivityLog('관리자', `${student.name} ${window.translate('log.manual.call')}`, 'info');
        alert(`${student.name}님에게 전화를 겁니다: ${student.phone}`);
    }
}

// 메시지 전송
export function sendMessage(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
        const msg = prompt(`${student.name}님에게 보낼 메시지:`);
        if (msg) {
            addActivityLog('관리자', `${student.name}에게 메시지 전송: ${msg}`, 'info');
        }
    }
}

// 통계 업데이트
export function updateStatistics() {
    if (!state.students) return;

    const total = state.students.length;
    const present = state.students.filter(s => s.status === 'online').length;
    const absent = state.students.filter(s => s.status === 'offline').length;
    const warnings = state.students.reduce((acc, s) => acc + s.warnings, 0);

    const totalEl = document.getElementById('totalStudents');
    const presentEl = document.getElementById('presentStudents');
    const absentEl = document.getElementById('absentStudents');
    const warningEl = document.getElementById('warningStudents');

    if (totalEl) totalEl.textContent = total;
    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (warningEl) warningEl.textContent = warnings;
}
