// 전역 상태 관리 저장소
window.Store = {};

// 상태 객체
window.Store.state = {
    students: [],
    scheduledMeetings: [],
    activityLogs: [],
    isMonitoring: false,
    currentTheme: 'light',
    currentAgentType: '',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    monthlyAttendanceData: {},

    // Agent 설정 기본값 및 현재 설정
    agentSettings: {
        admin: {
            enabled: true,
            responseSpeed: 'medium',
            language: 'ko',
            apiEndpoint: 'https://api.example.com/admin',
            autoResponse: true,
            notificationFrequency: 10,
            maxQueueSize: 50
        },
        tutor: {
            enabled: true,
            responseSpeed: 'fast',
            language: 'ko',
            apiEndpoint: 'https://api.example.com/tutor',
            ragEnabled: true,
            summaryInterval: 30,
            contextWindow: 10
        },
        monitor: {
            enabled: true,
            detectionSensitivity: 'high',
            alertThreshold: 3,
            apiEndpoint: 'https://api.example.com/monitor',
            faceRecognition: true,
            autoWarning: true,
            checkInterval: 5
        },
        attendance: {
            enabled: true,
            autoApproval: false,
            apiEndpoint: 'https://api.example.com/attendance',
            notifyOnChange: true,
            syncInterval: 15,
            lateThreshold: 10
        }
    }
};

// 상태 변경 리스너
const listeners = [];

window.Store.subscribe = function (listener) {
    listeners.push(listener);
};

window.Store.notifyListeners = function (event, data) {
    listeners.forEach(listener => listener(event, data));
};

// 상태 업데이트 메서드
window.Store.setStudents = function (students) {
    window.Store.state.students = students;
    window.Store.notifyListeners('studentsUpdated', students);
};

window.Store.setScheduledMeetings = function (meetings) {
    window.Store.state.scheduledMeetings = meetings;
    window.Store.notifyListeners('meetingsUpdated', meetings);
};

window.Store.setMonitoringState = function (isMonitoring) {
    window.Store.state.isMonitoring = isMonitoring;
    window.Store.notifyListeners('monitoringStateChanged', isMonitoring);
};

window.Store.addActivityLog = function (log) {
    window.Store.state.activityLogs.unshift(log); // 최신 로그가 앞으로
    if (window.Store.state.activityLogs.length > 50) {
        window.Store.state.activityLogs.pop();
    }
    window.Store.notifyListeners('logAdded', log);
};

window.Store.setMonthlyAttendanceData = function (data) {
    window.Store.state.monthlyAttendanceData = data;
    window.Store.notifyListeners('attendanceDataUpdated', data);
};

window.Store.updateAgentSetting = function (agentType, key, value) {
    if (window.Store.state.agentSettings[agentType]) {
        window.Store.state.agentSettings[agentType][key] = value;
        window.Store.notifyListeners('agentSettingsUpdated', { agentType, key, value });
    }
};

