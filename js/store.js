// 전역 상태 관리 저장소

// 상태 객체
export const state = {
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

export function subscribe(listener) {
    listeners.push(listener);
}

export function notifyListeners(event, data) {
    listeners.forEach(listener => listener(event, data));
}

// 상태 업데이트 메서드 (예시)
export function setStudents(students) {
    state.students = students;
    notifyListeners('studentsUpdated', students);
}

export function setScheduledMeetings(meetings) {
    state.scheduledMeetings = meetings;
    notifyListeners('meetingsUpdated', meetings);
}

export function setMonitoringState(isMonitoring) {
    state.isMonitoring = isMonitoring;
    notifyListeners('monitoringStateChanged', isMonitoring);
}

export function addActivityLog(log) {
    state.activityLogs.unshift(log); // 최신 로그가 앞으로
    if (state.activityLogs.length > 50) {
        state.activityLogs.pop();
    }
    notifyListeners('logAdded', log);
}

export function setMonthlyAttendanceData(data) {
    state.monthlyAttendanceData = data;
    notifyListeners('attendanceDataUpdated', data);
}

export function updateAgentSetting(agentType, key, value) {
    if (state.agentSettings[agentType]) {
        state.agentSettings[agentType][key] = value;
        notifyListeners('agentSettingsUpdated', { agentType, key, value });
    }
}
