import { state, updateAgentSetting } from '../store.js';
import { addActivityLog } from './logging.js';

// ============================
// AI 에이전트 상태 및 설정
// ============================

export function init() {
    loadAgentSettings();
    updateAgentDescriptions();
    // 주기적 상태 업데이트 시뮬레이션 등이 필요하면 여기서 시작
}

// Agent 초기 설정 로드 (localStorage)
function loadAgentSettings() {
    const saved = localStorage.getItem('agentSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                state.agentSettings[key] = { ...state.agentSettings[key], ...parsed[key] };
            });
        } catch (e) {
            console.error('Failed to load agent settings', e);
        }
    }
}

// Agent 상태 표시 업데이트
export function updateAgentStatus(agentName, status) {
    const card = document.querySelector(`.agent-card[data-agent="${agentName}"]`);
    if (!card) return;

    const statusEl = card.querySelector('.agent-status');

    // Map status to i18n key
    const keyMap = {
        'active': 'agent.status.active',
        'standby': 'agent.status.standby',
        'inactive': 'agent.status.inactive'
    };
    const key = keyMap[status] || 'agent.status.inactive';

    // Fallback text
    const defaultText = {
        'active': '활성',
        'standby': '대기중',
        'inactive': '비활성'
    };
    const text = window.translate ? window.translate(key) : (defaultText[status] || status);

    statusEl.innerHTML = `<i class="fas fa-circle"></i> <span data-i18n="${key}">${text}</span>`;

    // Class update - inactive might share 'standby' styling or have its own
    // Removing old classes first? No, className assignment overwrites.
    statusEl.className = `agent-status ${status}`;
}

function updateAgentDescriptions() {
    // 필요한 경우 에이전트별 설명 업데이트 로직
    // 현재는 HTML에 하드코딩 되어 있음
}

// 설정 모달 (기존 로직 이식)
export function openAgentSettings(agentType) {
    state.currentAgentType = agentType;
    const modal = document.getElementById('settingsModal');
    const title = document.getElementById('modalTitle');

    // 모달 내용 생성
    const config = state.agentSettings[agentType];
    let contentHtml = '';

    // 공통 설정 (활성화 여부)
    contentHtml += `
        <div class="form-group">
            <label class="form-label">
                <span>활성화</span>
                <label class="switch">
                    <input type="checkbox" id="agentEnabled" ${config.enabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </label>
        </div>
    `;

    // 에이전트별 특화 설정
    if (agentType === 'admin') {
        contentHtml += `
            <div class="form-group">
                <label class="form-label">응답 속도</label>
                <select id="responseSpeed" class="manage-input" style="width:100%">
                    <option value="slow" ${config.responseSpeed === 'slow' ? 'selected' : ''}>정확도 우선 (느림)</option>
                    <option value="medium" ${config.responseSpeed === 'medium' ? 'selected' : ''}>균형 (보통)</option>
                    <option value="fast" ${config.responseSpeed === 'fast' ? 'selected' : ''}>속도 우선 (빠름)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">자동 응답</label>
                <label class="switch">
                    <input type="checkbox" id="autoResponse" ${config.autoResponse ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        `;
    } else if (agentType === 'monitor') {
        contentHtml += `
            <div class="form-group">
                <label class="form-label">감지 민감도</label>
                <input type="range" id="sensitivity" min="1" max="100" value="${config.detectionSensitivity === 'high' ? 80 : 50}" style="width:100%">
            </div>
            <div class="form-group">
                <label class="form-label">자동 경고 발송</label>
                <label class="switch">
                    <input type="checkbox" id="autoWarning" ${config.autoWarning ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        `;
    }
    // ... 기타 에이전트 설정 ...

    document.getElementById('modalContent').innerHTML = contentHtml;

    // 제목
    let agentName = '';
    switch (agentType) {
        case 'admin': agentName = '운영 Agent'; break;
        case 'tutor': agentName = '학습 Agent'; break;
        case 'monitor': agentName = '감독 Agent'; break;
        case 'attendance': agentName = '출결 Agent'; break;
    }
    title.innerText = `${agentName} 설정`;

    modal.classList.add('show');
}

export function saveAgentSettings() {
    const type = state.currentAgentType;
    const enabled = document.getElementById('agentEnabled').checked;

    updateAgentSetting(type, 'enabled', enabled);

    if (type === 'admin') {
        updateAgentSetting(type, 'responseSpeed', document.getElementById('responseSpeed').value);
        updateAgentSetting(type, 'autoResponse', document.getElementById('autoResponse').checked);
    } else if (type === 'monitor') {
        updateAgentSetting(type, 'autoWarning', document.getElementById('autoWarning').checked);
        // 민감도 등 추가 처리...
    }

    localStorage.setItem('agentSettings', JSON.stringify(state.agentSettings));

    document.getElementById('settingsModal').classList.remove('show');
    addActivityLog('설정', `${type} Agent 설정이 변경되었습니다.`, 'info');

    updateAgentStatus(type, enabled ? 'active' : 'standby');
}
