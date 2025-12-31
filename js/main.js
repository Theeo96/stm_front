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
let uiRefreshInterval = null;

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

        // Student Data - ONLY fetch/update when monitoring is active
        if (window.Store.state.isMonitoring) {
            const newStudentData = await window.apiService.fetchStudents();

            // User requested: 
            // 1. If empty [], CLEAR list (no data).
            // 2. If populated [{...}], MERGE with existing (partial update).

            // Explicitly check for empty array first
            if (Array.isArray(newStudentData) && newStudentData.length === 0) {
                // Case 1: Empty Array -> Clear All
                window.Store.setStudents([]);
            } else if (Array.isArray(newStudentData) && newStudentData.length > 0) {
                // Case 2: Populated Array -> Merge (Partial Update)
                // We use the apiService.mergeStudentData which already has the warning preservation logic.
                const currentStudents = window.Store.state.students || [];
                const mergedStudents = window.apiService.mergeStudentData(currentStudents, newStudentData);
                window.Store.setStudents(mergedStudents);
            }

            // Force render regardless of update type
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
window.fetchAndUpdateData = fetchAndUpdateData;

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

// Monitoring Control

function startLiveMonitoring() {
    // Helper for logging
    const addLog = (message, type = 'info') => {
        if (window.Logging && window.Logging.addActivityLog) {
            window.Logging.addActivityLog(window.translate('log.type.info') || '정보', message, type);
        } else {
            console.log(message);
        }
    };

    // Helper for UI updates
    const updateMonitoringUI = (isActive) => {
        if (window.Agents) {
            window.Agents.updateAgentStatus('monitor', isActive ? 'active' : 'inactive');
        }
        // Additional UI updates can go here
    };

    if (window.Store.state.isMonitoring) return;

    // Clear frontend data first
    window.Store.setStudents([]);

    window.Store.state.isMonitoring = true;
    updateMonitoringUI(true);

    // Fetch immediately on start
    fetchAndUpdateData();

    // 1. Data Fetch Loop (10 seconds) - Reduced traffic
    monitoringInterval = setInterval(() => {
        fetchAndUpdateData();
    }, 10000);

    // 2. UI Refresh Loop (1 second) - Real-time timers
    uiRefreshInterval = setInterval(() => {
        if (window.Store.state.isMonitoring) {
            const currentStudents = window.Store.state.students || [];
            if (currentStudents.length > 0) {
                const refreshed = window.apiService.refreshStudentStatuses(currentStudents);
                window.Store.setStudents(refreshed);
                // Note: setStudents triggers listener? 
                // Store.js has subscribe(listener). 
                // If setStudents calls listeners, and Students.render is a listener, then this is enough.
                // Let's assume we need to force render if not automatically wired. 
                // Code below suggests manual render call in fetchAndUpdateData.
            }
            // Always force render to update timestamps
            if (window.Students) {
                window.Students.render();
                // updateStatistics not strictly needed every second but okay
            }
        }
    }, 1000);

    addLog(window.translate('log.monitor.start') || '실시간 감독이 시작되었습니다.');
    addLog(window.translate('log.cam.connect') || '카메라 연결 성공: Main Camera', 'success');
}

function pauseLiveMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    if (uiRefreshInterval) {
        clearInterval(uiRefreshInterval);
        uiRefreshInterval = null;
    }

    // 감시 Agent 대기 (데이터 유지)
    if (window.Agents) window.Agents.updateAgentStatus('monitor', 'standby');
}

async function stopLiveMonitoring() {
    // Helper for logging
    const addLog = (message, type = 'info') => {
        if (window.Logging && window.Logging.addActivityLog) {
            window.Logging.addActivityLog(window.translate('log.type.info') || '정보', message, type);
        } else {
            console.log(message);
        }
    };

    // Helper for UI updates
    const updateMonitoringUI = (isActive) => {
        if (window.Agents) {
            window.Agents.updateAgentStatus('monitor', isActive ? 'active' : 'inactive');
        }
        // Additional UI updates can go here
    };

    if (!window.Store.state.isMonitoring) return;

    window.Store.state.isMonitoring = false;
    updateMonitoringUI(false);

    // Clear Intervals
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    if (uiRefreshInterval) {
        clearInterval(uiRefreshInterval);
        uiRefreshInterval = null;
    }

    // Clear Frontend Data
    window.Store.setStudents([]);
    if (window.Students) {
        window.Students.render();
        window.Students.updateStatistics();
    }

    // Clear Backend Cache (DELETE Request)
    if (window.apiService && window.apiService.clearStudents) {
        window.apiService.clearStudents().then(success => {
            if (success) console.log('Server cache cleared.');
        });
    }

    addLog(window.translate('log.monitor.stop') || '실시간 감독이 종료되었습니다.');
}

