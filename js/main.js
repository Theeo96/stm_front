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
}

// Data Fetch & Update Cycle
async function fetchAndUpdateData() {
    try {
        // Students
        const newStudentData = await apiService.fetchStudents();
        if (newStudentData) {
            // Current State (from store)
            const currentStudents = store.students;

            // Merge logic: Preserve existing props (phone, etc.) while updating status
            const mergedStudents = apiService.mergeStudentData(currentStudents, newStudentData);

            setStudents(mergedStudents);
            Students.render();
            Students.updateStatistics();

            // Attendance Data Sync
            const monthlyData = Attendance.generateMonthlyAttendanceData(store.currentYear, store.currentMonth);
            setMonthlyAttendanceData(monthlyData);
            // Optimization: Only re-render attendance if strictly needed (currently always does)
            // Attendance.render(); 
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

    // 주기적 실행 (1초) - 실시간 반응형
    if (monitoringInterval) clearInterval(monitoringInterval);
    monitoringInterval = setInterval(fetchAndUpdateData, 1000);
}

function stopLiveMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    // Clear Data UI on Stop
    setStudents([]);
    Students.render();
    Students.updateStatistics();
}
