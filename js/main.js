// Imports removed. Using Global Namespaces.

// Global access for HTML event handlers
window.makePhoneCall = window.Students ? window.Students.makePhoneCall : null;
window.sendMessage = window.Students ? window.Students.sendMessage : null;
window.sendAlert = window.Students ? window.Students.sendAlert : null;

// Expose Agent settings
window.openAgentSettings = window.Agents ? window.Agents.openAgentSettings : null;
window.saveAgentSettings = window.Agents ? window.Agents.saveAgentSettings : null;
window.closeAgentSettings = function () {
    const modal = document.getElementById('agentSettingsModal');
    if (modal) modal.classList.remove('show');
};

let monitoringInterval = null;

// ============================
// Main Orchestrator
// ============================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Global Main: DOMContentLoaded started');

    // Ensure translate is available from i18n
    const t = window.translate || ((k) => k);

    // 1. Initialize Modules (Order matters)
    try {
        if (window.Logging && window.Logging.init) { window.Logging.init(); console.log('Logging initialized'); }
        if (window.UI && window.UI.init) { window.UI.init(); console.log('UI initialized'); }
        // Controls depends on Store
        if (window.Controls && window.Controls.init) { window.Controls.init(); console.log('Controls initialized'); }
        // Students depends on Store
        if (window.Students && window.Students.init) { window.Students.init(); console.log('Students initialized'); }
        // Agents depends on Store
        if (window.Agents && window.Agents.init) { window.Agents.init(); console.log('Agents initialized'); }
        // Meetings depends on Store
        if (window.Meetings && window.Meetings.init) { window.Meetings.init(); console.log('Meetings initialized'); }
        // Attendance depends on Store
        if (window.Attendance && window.Attendance.init) { window.Attendance.init(); console.log('Attendance initialized'); }
        // ApiService
        if (window.apiService && window.apiService.init) { await window.apiService.init(); console.log('ApiService initialized'); }

    } catch (err) {
        console.error('Module initialization error:', err);
    }

    // 2. Initial Logs (Sequence: System Init -> Teams Loaded)
    const logContainer = document.getElementById('activityLog');
    if (logContainer) logContainer.innerHTML = '';

    if (window.Logging && window.Logging.addActivityLog) {
        // Legacy sequence from user request:
        // 1. [Teams] Teams에서 예약된 수업 일정을 불러왔습니다.
        // 2. [시스템] 강한 매니저 시스템이 초기화되었습니다.
        window.Logging.addActivityLog(t('log.type.info') || '정보', `[Teams] ${t('log.teams.loaded') || 'Teams에서 예약된 수업 일정을 불러왔습니다.'}`, 'info');
        window.Logging.addActivityLog(t('log.type.info') || '정보', `[시스템] ${t('log.system.init') || '강한 매니저 시스템이 초기화되었습니다.'}`, 'info');
    }

    // 3. Initial Data Load
    await fetchAndUpdateData();

    // 4. Start Update Loop
    startDataUpdateLoop();
});

async function fetchAndUpdateData() {
    try {
        if (!window.apiService) {
            console.error('ApiService not found');
            return;
        }

        // Students
        const newStudentData = await window.apiService.fetchStudents();

        // Check if data is valid (array)
        if (Array.isArray(newStudentData)) {
            // Current State (from store)
            const currentStudents = window.Store.state.students;

            // Merge logic
            const mergedStudents = window.apiService.mergeStudentData(currentStudents, newStudentData);

            window.Store.setStudents(mergedStudents);

            if (window.Students) {
                window.Students.render();
                window.Students.updateStatistics();
            }
        }

        // Meetings
        const meetingsData = await window.apiService.fetchMeetings();
        if (Array.isArray(meetingsData)) {
            window.Store.setScheduledMeetings(meetingsData);
            if (window.Meetings) window.Meetings.render();
        }

    } catch (error) {
        console.error('Data update failed:', error);
        if (window.Logging) {
            window.Logging.addActivityLog('시스템', '데이터 갱신 중 오류가 발생했습니다.', 'error');
        }
    }
}

function startDataUpdateLoop() {
    // 5초마다 데이터 갱신 (기본)
    setInterval(fetchAndUpdateData, 5000);
}

// Live Monitoring Logic (Global helpers for Controls.js to call if needed, or simply Controls.js calls fetchAndUpdateData directly? 
// Controls.js calls window.Controls.*. 
// If Controls needs to start monitoring, it sets state. 
// We should listen to state changes or just expose these functions if called by controls logic.
// Actually Controls.js dispatches events 'monitoringStarted'. We should listen to them here to separate concerns.

window.addEventListener('monitoringStarted', () => {
    startLiveMonitoring();
});

window.addEventListener('monitoringStopped', () => {
    stopLiveMonitoring();
});

window.addEventListener('monitoringPaused', () => {
    pauseLiveMonitoring();
});


function startLiveMonitoring() {
    // 즉시 실행
    fetchAndUpdateData();

    // 감시 Agent 활성화 UI
    if (window.Agents) window.Agents.updateAgentStatus('monitor', 'active');

    // 주기적 실행 (1초) - 실시간 반응형
    if (monitoringInterval) clearInterval(monitoringInterval);
    monitoringInterval = setInterval(fetchAndUpdateData, 1000);
}

function pauseLiveMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    // 감시 Agent 대기 (데이터 유지)
    if (window.Agents) window.Agents.updateAgentStatus('monitor', 'standby');
}

async function stopLiveMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    // 감시 Agent 비활성화 (데이터 삭제)
    if (window.Agents) window.Agents.updateAgentStatus('monitor', 'inactive');

    // Clear Data UI on Stop (Instant feedback)
    window.Store.setStudents([]);
    if (window.Students) {
        window.Students.render();
        window.Students.updateStatistics();
    }

    // Backend Clear
    const success = await window.apiService.clearStudents();
    if (success) {
        console.log('Backend data cleared successfully');
    } else {
        console.error('Failed to clear backend data');
    }
}
