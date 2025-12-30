import { state as store, setStudents, setScheduledMeetings, setMonthlyAttendanceData, setMonitoringState } from './store.js';
import { apiService } from './api.js';
import * as UI from './modules/ui.js';
import * as Logging from './modules/logging.js';
import * as Controls from './modules/controls.js';
import * as Students from './modules/students.js';
import * as Agents from './modules/agents.js';
import * as Meetings from './modules/meetings.js';
import * as Attendance from './modules/attendance.js';

// Global access for HTML event handlers (temporary bridge)
window.moduleActions = {
    sendMessage: Students.sendMessage,
    makePhoneCall: Students.makePhoneCall,
    sendAlert: Students.sendAlert,
    openAgentSettings: Agents.openAgentSettings,
    saveAgentSettings: Agents.saveAgentSettings
};

// ============================
// Main Orchestrator
// ============================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Modules
    Logging.init();
    UI.init();
    Controls.init();
    Students.init();
    Agents.init();
    Meetings.init();
    Attendance.init();

    // 2. Initial Data Load
    Logging.addActivityLog('시스템', window.translate('log.system.init'), 'info');
    await fetchAndUpdateData();

    // 3. Setup Global Event Listeners (Inter-module communication)
    setupGlobalEvents();
});

let monitoringInterval;

function setupGlobalEvents() {
    // 모니터링 시작 이벤트 (Controls -> Main)
    window.addEventListener('monitoringStarted', () => {
        startLiveMonitoring();
    });

    // 모니터링 종료 이벤트 (Controls -> Main)
    window.addEventListener('monitoringStopped', () => {
        stopLiveMonitoring();
    });

    // 모니터링 일시정지 이벤트 (Controls -> Main)
    window.addEventListener('monitoringPaused', () => {
        pauseLiveMonitoring();
    });

    // 언어 변경 이벤트 (i18n -> Main)
    window.addEventListener('languageChanged', (e) => {
        const lang = e.detail.language;
        const langNames = { 'ko': '한국어', 'en': 'English', 'ja': '日本語', 'zh': '中文', 'ar': 'العربية' };
        const langName = langNames[lang] || lang;
        Logging.addActivityLog('시스템', window.translate('log.system.languageChanged', lang, { language: langName }), 'info');
    });
}

// Data Fetch & Update Cycle
async function fetchAndUpdateData() {
    try {
        // Students
        const newStudentData = await apiService.fetchStudents();

        // Reliability Fix: If null (error), skip update to preserve existing data
        if (newStudentData) {
            // Current State (from store)
            const currentStudents = store.students;

            // Merge logic: Preserve existing props (phone, etc.) while updating status
            const mergedStudents = apiService.mergeStudentData(currentStudents, newStudentData);

            setStudents(mergedStudents);
            Students.render();
            Students.updateStatistics();


        }

        // Meetings
        const meetingsData = await apiService.fetchMeetings();
        if (meetingsData) {
            setScheduledMeetings(meetingsData);
            Meetings.render();
        }

    } catch (error) {
        console.error('Data update failed:', error);
        Logging.addActivityLog('시스템', '데이터 갱신 중 오류가 발생했습니다.', 'error');
    }
}

// Live Monitoring Logic
function startLiveMonitoring() {
    // 즉시 실행
    fetchAndUpdateData();

    // 감시 Agent 활성화 UI
    Agents.updateAgentStatus('monitor', 'active');

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
    Agents.updateAgentStatus('monitor', 'standby');
}

async function stopLiveMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    // 감시 Agent 비활성화 (데이터 삭제)
    Agents.updateAgentStatus('monitor', 'inactive');

    // Clear Data UI on Stop (Instant feedback)
    setStudents([]);
    Students.render();
    Students.updateStatistics();

    // Backend Clear (Ensure server cache is wiped)
    const success = await apiService.clearStudents();
    if (success) {
        console.log('Backend data cleared successfully');
    } else {
        console.error('Failed to clear backend data');
    }
}
