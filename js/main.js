// ============================
// 전역 상태 관리
// ============================

let isMonitoring = false;
let currentTheme = 'light'; // 'light', 'dark', 'instructor'
let currentAgentType = ''; // 현재 설정 중인 Agent 타입

// Agent 설정 기본값
const defaultAgentSettings = {
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
};

// Agent 설정값 저장소
let agentSettings = {};

// ============================
// 초기화
// ============================

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadAgentSettings();
    renderStudentTable();
    updateStatistics();
    initializeMonthlyAttendance();
    initializeMeetingScheduler();
    setupEventListeners();
    startActivityLogUpdate();
});

// ============================
// 테마 관리
// ============================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    const body = document.body;
    const themeLabel = document.getElementById('themeLabel');
    
    // 모든 테마 클래스 제거
    body.classList.remove('dark-mode', 'instructor-mode');
    
    // 새 테마 적용
    switch(theme) {
        case 'dark':
            body.classList.add('dark-mode');
            themeLabel.textContent = '다크 모드';
            break;
        case 'instructor':
            body.classList.add('instructor-mode');
            themeLabel.textContent = '교관 모드';
            break;
        default:
            themeLabel.textContent = '라이트 모드';
    }
    
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    // 테마 순환: light -> dark -> instructor -> light
    const themeOrder = ['light', 'dark', 'instructor'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    applyTheme(nextTheme);
    addActivityLog('시스템', `테마가 ${getThemeLabel(nextTheme)}(으)로 변경되었습니다.`, 'info');
}

function getThemeLabel(theme) {
    switch(theme) {
        case 'dark': return '다크 모드';
        case 'instructor': return '교관 모드';
        default: return '라이트 모드';
    }
}

// ============================
// 수강생 테이블 렌더링
// ============================

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        
        const statusClass = student.status === 'online' ? 'online' : 
                          student.status === 'away' ? 'away' : 'offline';
        const statusText = student.status === 'online' ? '출석' : 
                         student.status === 'away' ? '자리비움' : '오프라인';
        const statusIcon = student.status === 'online' ? 'fa-circle' : 
                          student.status === 'away' ? 'fa-clock' : 'fa-circle';
        
        const cameraClass = student.camera ? 'on' : 'off';
        const cameraIcon = student.camera ? 'fa-video' : 'fa-video-slash';
        const cameraText = student.camera ? '켜짐' : '꺼짐';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.phone}</td>
            <td>
                <span class="status-badge-table ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusText}
                </span>
            </td>
            <td>
                <span class="camera-status ${cameraClass}">
                    <i class="fas ${cameraIcon}"></i>
                    ${cameraText}
                </span>
            </td>
            <td>${student.lastSeen}</td>
            <td>${student.warnings > 0 ? `<strong style="color: var(--danger-color);">${student.warnings}회</strong>` : '없음'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn phone-btn" onclick="makePhoneCall(${student.id})" title="전화 걸기">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="action-btn message-btn" onclick="sendMessage(${student.id})" title="메시지 보내기">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="action-btn alert-btn-table" onclick="sendAlert(${student.id})" title="알림 보내기">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ============================
// 통계 업데이트
// ============================

function updateStatistics() {
    const totalStudents = students.length;
    const presentStudents = students.filter(s => s.status === 'online').length;
    const absentStudents = students.filter(s => s.status === 'offline').length;
    const warningStudents = students.filter(s => s.warnings > 0).length;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('presentStudents').textContent = presentStudents;
    document.getElementById('absentStudents').textContent = absentStudents;
    document.getElementById('warningStudents').textContent = warningStudents;
}

// ============================
// 감독 제어
// ============================

function startMonitoring() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    
    // 버튼 상태 변경
    document.getElementById('startMonitoring').disabled = true;
    document.getElementById('stopMonitoring').disabled = false;
    document.getElementById('pauseMonitoring').disabled = false;
    
    // 시스템 상태 변경
    const statusBadge = document.getElementById('systemStatus');
    statusBadge.innerHTML = '<i class="fas fa-circle"></i> 감독 진행중';
    statusBadge.style.background = 'rgba(16, 185, 129, 0.3)';
    
    // 감시 에이전트 활성화
    updateAgentStatus('감시 Agent', 'active');
    
    addActivityLog('감독', '감독이 시작되었습니다.', 'success');
    
    // 시뮬레이션: 실시간 모니터링 시작
    startRealtimeSimulation();
}

function stopMonitoring() {
    if (!isMonitoring) return;
    
    isMonitoring = false;
    
    // 버튼 상태 변경
    document.getElementById('startMonitoring').disabled = false;
    document.getElementById('stopMonitoring').disabled = true;
    document.getElementById('pauseMonitoring').disabled = true;
    
    // 시스템 상태 변경
    const statusBadge = document.getElementById('systemStatus');
    statusBadge.innerHTML = '<i class="fas fa-circle"></i> 시스템 대기중';
    statusBadge.style.background = 'rgba(255, 255, 255, 0.2)';
    
    // 감시 에이전트 대기
    updateAgentStatus('감시 Agent', 'standby');
    
    addActivityLog('감독', '감독이 종료되었습니다.', 'warning');
    
    // 실시간 모니터링 중지
    stopRealtimeSimulation();
}

function pauseMonitoring() {
    if (!isMonitoring) return;
    
    addActivityLog('감독', '감독이 일시 정지되었습니다.', 'warning');
    alert('감독이 일시 정지되었습니다.');
}

function sendEmergencyAlert() {
    addActivityLog('긴급', '전체 수강생에게 긴급 공지가 발송되었습니다.', 'error');
    alert('🚨 긴급 공지가 모든 수강생에게 발송되었습니다.');
}

// ============================
// AI 에이전트 상태 업데이트
// ============================

function updateAgentStatus(agentName, status) {
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach(card => {
        const agentHeader = card.querySelector('.agent-header h3');
        if (agentHeader && agentHeader.textContent === agentName) {
            const statusElement = card.querySelector('.agent-status');
            statusElement.classList.remove('active', 'standby');
            statusElement.classList.add(status);
            
            if (status === 'active') {
                statusElement.innerHTML = '<i class="fas fa-circle"></i> 활성';
            } else {
                statusElement.innerHTML = '<i class="fas fa-circle"></i> 대기중';
            }
        }
    });
}

// ============================
// 활동 로그
// ============================

function addActivityLog(type, message, logType = 'info') {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { hour12: false });
    
    const logEntry = {
        time: timeString,
        type: logType,
        message: `[${type}] ${message}`
    };
    
    activityLogs.unshift(logEntry);
    
    // 최대 50개의 로그만 유지
    if (activityLogs.length > 50) {
        activityLogs.pop();
    }
    
    renderActivityLog();
}

function renderActivityLog() {
    const logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = '';
    
    activityLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${log.time}</span>
            <span class="log-type ${log.type}">${getLogTypeLabel(log.type)}</span>
            <span class="log-message">${log.message}</span>
        `;
        logContainer.appendChild(logEntry);
    });
}

function getLogTypeLabel(type) {
    switch(type) {
        case 'success': return '성공';
        case 'error': return '오류';
        case 'warning': return '경고';
        default: return '정보';
    }
}

function startActivityLogUpdate() {
    setInterval(() => {
        // 실시간 시스템 활동 시뮬레이션
        if (Math.random() > 0.95) {
            const messages = [
                '운영 Agent가 질문에 응답했습니다.',
                '학습 Agent가 수업 내용을 요약했습니다.',
                '출결 Agent가 출석 데이터를 업데이트했습니다.'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            addActivityLog('AI Agent', randomMessage, 'info');
        }
    }, 10000); // 10초마다
}

// ============================
// 실시간 모니터링 시뮬레이션
// ============================

let simulationInterval;

function startRealtimeSimulation() {
    simulationInterval = setInterval(() => {
        // 랜덤하게 수강생 상태 변경 시뮬레이션
        if (Math.random() > 0.9) {
            const randomStudent = students[Math.floor(Math.random() * students.length)];
            
            // 카메라 상태 변경
            if (Math.random() > 0.5 && randomStudent.camera) {
                randomStudent.camera = false;
                addActivityLog('감시', `${randomStudent.name} 수강생의 카메라가 꺼졌습니다.`, 'warning');
            } else if (!randomStudent.camera && Math.random() > 0.7) {
                randomStudent.camera = true;
                addActivityLog('감시', `${randomStudent.name} 수강생의 카메라가 켜졌습니다.`, 'success');
            }
            
            // 상태 변경
            if (randomStudent.status === 'online' && Math.random() > 0.8) {
                randomStudent.status = 'away';
                randomStudent.warnings += 1;
                addActivityLog('감시', `${randomStudent.name} 수강생이 자리를 비웠습니다. (경고 발송)`, 'error');
            } else if (randomStudent.status === 'away' && Math.random() > 0.6) {
                randomStudent.status = 'online';
                addActivityLog('감시', `${randomStudent.name} 수강생이 복귀했습니다.`, 'success');
            }
            
            renderStudentTable();
            updateStatistics();
        }
    }, 5000); // 5초마다
}

function stopRealtimeSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
}

// ============================
// 개별 수강생 알림
// ============================

function sendAlert(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        addActivityLog('알림', `${student.name} 수강생에게 알림을 발송했습니다.`, 'info');
        alert(`📢 ${student.name} 수강생에게 알림이 발송되었습니다.`);
    }
}

function makePhoneCall(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        addActivityLog('전화', `${student.name} 수강생(${student.phone})에게 전화를 발신했습니다.`, 'info');
        
        // 실제 전화 걸기 시뮬레이션
        const confirmed = confirm(`📞 ${student.name} 수강생에게 전화를 거시겠습니까?\n\n연락처: ${student.phone}`);
        
        if (confirmed) {
            // 실제 환경에서는 tel: 프로토콜 사용
            alert(`📞 ${student.name} 수강생(${student.phone})에게 전화 연결 중...`);
            // window.location.href = `tel:${student.phone}`; // 모바일 환경에서 실제 전화 앱 실행
        }
    }
}

function sendMessage(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        addActivityLog('메시지', `${student.name} 수강생(${student.phone})에게 메시지를 발송했습니다.`, 'info');
        
        // 메시지 내용 입력받기
        const message = prompt(`💬 ${student.name} 수강생에게 보낼 메시지를 입력하세요:`, '출석 상태를 확인해 주시기 바랍니다.');
        
        if (message && message.trim() !== '') {
            alert(`💬 ${student.name} 수강생(${student.phone})에게 메시지가 발송되었습니다.\n\n내용: ${message}`);
            // 실제 환경에서는 SMS API 또는 Teams 메시지 API 사용
            // window.location.href = `sms:${student.phone}?body=${encodeURIComponent(message)}`; // 모바일 환경에서 SMS 앱 실행
        }
    }
}

// ============================
// 엑셀 다운로드 기능
// ============================

function exportToExcel() {
    addActivityLog('시스템', '출결 현황을 엑셀 파일로 다운로드합니다.', 'success');
    
    // 현재 날짜와 시간
    const now = new Date();
    const dateString = now.toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '');
    const timeString = now.toLocaleTimeString('ko-KR', { hour12: false }).replace(/:/g, '-');
    
    // 엑셀 데이터 생성
    const excelData = students.map((student, index) => {
        const statusText = student.status === 'online' ? '출석' : 
                          student.status === 'away' ? '자리비움' : '오프라인';
        const cameraText = student.camera ? 'ON' : 'OFF';
        
        return {
            '번호': index + 1,
            '이름': student.name,
            '연락처': student.phone,
            '출석 상태': statusText,
            '카메라': cameraText,
            '마지막 확인': student.lastSeen,
            '경고 횟수': student.warnings,
            '비고': student.warnings > 0 ? '경고 대상' : '정상'
        };
    });
    
    // 통계 정보 추가
    const statistics = [
        {},
        { '번호': '=== 출결 통계 ===' },
        { '번호': '총 수강생', '이름': students.length + '명' },
        { '번호': '출석', '이름': students.filter(s => s.status === 'online').length + '명' },
        { '번호': '결석', '이름': students.filter(s => s.status === 'offline').length + '명' },
        { '번호': '자리비움', '이름': students.filter(s => s.status === 'away').length + '명' },
        { '번호': '경고 대상', '이름': students.filter(s => s.warnings > 0).length + '명' },
        {},
        { '번호': '출력 일시', '이름': `${dateString} ${timeString}` },
        { '번호': '시스템', '이름': '강한 매니저 v1.0.0' }
    ];
    
    const fullData = [...excelData, ...statistics];
    
    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(fullData);
    
    // 컬럼 너비 설정
    const wscols = [
        { wch: 8 },   // 번호
        { wch: 12 },  // 이름
        { wch: 15 },  // 연락처
        { wch: 12 },  // 출석 상태
        { wch: 10 },  // 카메라
        { wch: 15 },  // 마지막 확인
        { wch: 12 },  // 경고 횟수
        { wch: 15 }   // 비고
    ];
    worksheet['!cols'] = wscols;
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '출결현황');
    
    // 파일 다운로드
    const filename = `출결현황_${dateString}_${timeString}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    alert(`✅ 출결 현황이 엑셀 파일로 다운로드되었습니다.\n\n파일명: ${filename}`);
}

// ============================
// Agent 설정 관리
// ============================

function loadAgentSettings() {
    // LocalStorage에서 Agent 설정 불러오기
    const savedSettings = localStorage.getItem('agentSettings');
    if (savedSettings) {
        agentSettings = JSON.parse(savedSettings);
    } else {
        // 기본 설정 사용
        agentSettings = JSON.parse(JSON.stringify(defaultAgentSettings));
        saveAllAgentSettings();
    }
}

function saveAllAgentSettings() {
    localStorage.setItem('agentSettings', JSON.stringify(agentSettings));
}

function openAgentSettings(agentType) {
    currentAgentType = agentType;
    const modal = document.getElementById('agentSettingsModal');
    const modalAgentName = document.getElementById('modalAgentName');
    const modalBody = document.getElementById('modalBody');
    
    // Agent 이름 설정
    const agentNames = {
        'admin': '운영 Agent',
        'tutor': '학습 Agent',
        'monitor': '감시 Agent',
        'attendance': '출결 Agent'
    };
    modalAgentName.textContent = agentNames[agentType];
    
    // 설정 폼 생성
    modalBody.innerHTML = generateSettingsForm(agentType);
    
    // 모달 표시
    modal.classList.add('show');
    
    addActivityLog('설정', `${agentNames[agentType]} 설정 창이 열렸습니다.`, 'info');
}

function closeAgentSettings() {
    const modal = document.getElementById('agentSettingsModal');
    modal.classList.remove('show');
}

function generateSettingsForm(agentType) {
    const settings = agentSettings[agentType];
    
    let formHTML = '<div class="settings-form">';
    
    // 공통 설정
    formHTML += `
        <div class="form-group">
            <div class="toggle-switch">
                <input type="checkbox" id="enabled" ${settings.enabled ? 'checked' : ''}>
                <label for="enabled">
                    <i class="fas fa-power-off"></i> Agent 활성화
                </label>
            </div>
            <span class="form-help">이 Agent를 사용하려면 활성화하세요.</span>
        </div>
        
        <div class="form-group">
            <label>
                <i class="fas fa-link"></i> API 엔드포인트
            </label>
            <input type="url" id="apiEndpoint" value="${settings.apiEndpoint}" placeholder="https://api.example.com">
            <span class="form-help">Agent가 연결할 API 주소를 입력하세요.</span>
        </div>
        
        <div class="form-group">
            <label>
                <i class="fas fa-language"></i> 언어 설정
            </label>
            <select id="language">
                <option value="ko" ${settings.language === 'ko' ? 'selected' : ''}>한국어</option>
                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                <option value="ja" ${settings.language === 'ja' ? 'selected' : ''}>日本語</option>
            </select>
        </div>
    `;
    
    // Agent별 특수 설정
    if (agentType === 'admin') {
        formHTML += `
            <div class="form-group">
                <label>
                    <i class="fas fa-tachometer-alt"></i> 응답 속도
                </label>
                <select id="responseSpeed">
                    <option value="fast" ${settings.responseSpeed === 'fast' ? 'selected' : ''}>빠름</option>
                    <option value="medium" ${settings.responseSpeed === 'medium' ? 'selected' : ''}>보통</option>
                    <option value="slow" ${settings.responseSpeed === 'slow' ? 'selected' : ''}>느림</option>
                </select>
            </div>
            
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="autoResponse" ${settings.autoResponse ? 'checked' : ''}>
                    <label for="autoResponse">
                        <i class="fas fa-robot"></i> 자동 응답
                    </label>
                </div>
                <span class="form-help">질문에 자동으로 응답합니다.</span>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <i class="fas fa-bell"></i> 알림 빈도 (분)
                    </label>
                    <input type="number" id="notificationFrequency" value="${settings.notificationFrequency}" min="1" max="60">
                </div>
                
                <div class="form-group">
                    <label>
                        <i class="fas fa-inbox"></i> 최대 대기열
                    </label>
                    <input type="number" id="maxQueueSize" value="${settings.maxQueueSize}" min="10" max="200">
                </div>
            </div>
        `;
    } else if (agentType === 'tutor') {
        formHTML += `
            <div class="form-group">
                <label>
                    <i class="fas fa-bolt"></i> 응답 속도
                </label>
                <select id="responseSpeed">
                    <option value="fast" ${settings.responseSpeed === 'fast' ? 'selected' : ''}>빠름</option>
                    <option value="medium" ${settings.responseSpeed === 'medium' ? 'selected' : ''}>보통</option>
                    <option value="slow" ${settings.responseSpeed === 'slow' ? 'selected' : ''}>느림</option>
                </select>
            </div>
            
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="ragEnabled" ${settings.ragEnabled ? 'checked' : ''}>
                    <label for="ragEnabled">
                        <i class="fas fa-database"></i> RAG 모델 활성화
                    </label>
                </div>
                <span class="form-help">강의 자료 기반 질의응답을 활성화합니다.</span>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <i class="fas fa-clock"></i> 요약 주기 (분)
                    </label>
                    <input type="number" id="summaryInterval" value="${settings.summaryInterval}" min="5" max="60">
                </div>
                
                <div class="form-group">
                    <label>
                        <i class="fas fa-window-maximize"></i> 컨텍스트 윈도우
                    </label>
                    <input type="number" id="contextWindow" value="${settings.contextWindow}" min="5" max="50">
                </div>
            </div>
        `;
    } else if (agentType === 'monitor') {
        formHTML += `
            <div class="form-group">
                <label>
                    <i class="fas fa-crosshairs"></i> 감지 민감도
                </label>
                <select id="detectionSensitivity">
                    <option value="low" ${settings.detectionSensitivity === 'low' ? 'selected' : ''}>낮음</option>
                    <option value="medium" ${settings.detectionSensitivity === 'medium' ? 'selected' : ''}>보통</option>
                    <option value="high" ${settings.detectionSensitivity === 'high' ? 'selected' : ''}>높음</option>
                </select>
                <span class="form-help">얼굴 인식 민감도를 조절합니다.</span>
            </div>
            
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="faceRecognition" ${settings.faceRecognition ? 'checked' : ''}>
                    <label for="faceRecognition">
                        <i class="fas fa-user-circle"></i> 얼굴 인식
                    </label>
                </div>
                <span class="form-help">YOLO 기반 얼굴 인식을 활성화합니다.</span>
            </div>
            
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="autoWarning" ${settings.autoWarning ? 'checked' : ''}>
                    <label for="autoWarning">
                        <i class="fas fa-exclamation-triangle"></i> 자동 경고
                    </label>
                </div>
                <span class="form-help">이상 감지 시 자동으로 경고를 발송합니다.</span>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <i class="fas fa-bell"></i> 경고 임계값
                    </label>
                    <input type="number" id="alertThreshold" value="${settings.alertThreshold}" min="1" max="10">
                </div>
                
                <div class="form-group">
                    <label>
                        <i class="fas fa-sync"></i> 체크 주기 (초)
                    </label>
                    <input type="number" id="checkInterval" value="${settings.checkInterval}" min="3" max="30">
                </div>
            </div>
        `;
    } else if (agentType === 'attendance') {
        formHTML += `
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="autoApproval" ${settings.autoApproval ? 'checked' : ''}>
                    <label for="autoApproval">
                        <i class="fas fa-check-circle"></i> 자동 승인
                    </label>
                </div>
                <span class="form-help">출결 정정 요청을 자동으로 승인합니다.</span>
            </div>
            
            <div class="form-group">
                <div class="toggle-switch">
                    <input type="checkbox" id="notifyOnChange" ${settings.notifyOnChange ? 'checked' : ''}>
                    <label for="notifyOnChange">
                        <i class="fas fa-envelope"></i> 변경 알림
                    </label>
                </div>
                <span class="form-help">출결 상태 변경 시 알림을 발송합니다.</span>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <i class="fas fa-sync-alt"></i> 동기화 주기 (분)
                    </label>
                    <input type="number" id="syncInterval" value="${settings.syncInterval}" min="5" max="60">
                </div>
                
                <div class="form-group">
                    <label>
                        <i class="fas fa-hourglass-half"></i> 지각 기준 (분)
                    </label>
                    <input type="number" id="lateThreshold" value="${settings.lateThreshold}" min="1" max="30">
                </div>
            </div>
        `;
    }
    
    formHTML += '</div>';
    
    return formHTML;
}

function saveAgentSettings() {
    const agentType = currentAgentType;
    const modal = document.getElementById('agentSettingsModal');
    
    // 공통 설정 가져오기
    agentSettings[agentType].enabled = document.getElementById('enabled').checked;
    agentSettings[agentType].apiEndpoint = document.getElementById('apiEndpoint').value;
    agentSettings[agentType].language = document.getElementById('language').value;
    
    // Agent별 특수 설정
    if (agentType === 'admin') {
        agentSettings[agentType].responseSpeed = document.getElementById('responseSpeed').value;
        agentSettings[agentType].autoResponse = document.getElementById('autoResponse').checked;
        agentSettings[agentType].notificationFrequency = parseInt(document.getElementById('notificationFrequency').value);
        agentSettings[agentType].maxQueueSize = parseInt(document.getElementById('maxQueueSize').value);
    } else if (agentType === 'tutor') {
        agentSettings[agentType].responseSpeed = document.getElementById('responseSpeed').value;
        agentSettings[agentType].ragEnabled = document.getElementById('ragEnabled').checked;
        agentSettings[agentType].summaryInterval = parseInt(document.getElementById('summaryInterval').value);
        agentSettings[agentType].contextWindow = parseInt(document.getElementById('contextWindow').value);
    } else if (agentType === 'monitor') {
        agentSettings[agentType].detectionSensitivity = document.getElementById('detectionSensitivity').value;
        agentSettings[agentType].faceRecognition = document.getElementById('faceRecognition').checked;
        agentSettings[agentType].autoWarning = document.getElementById('autoWarning').checked;
        agentSettings[agentType].alertThreshold = parseInt(document.getElementById('alertThreshold').value);
        agentSettings[agentType].checkInterval = parseInt(document.getElementById('checkInterval').value);
    } else if (agentType === 'attendance') {
        agentSettings[agentType].autoApproval = document.getElementById('autoApproval').checked;
        agentSettings[agentType].notifyOnChange = document.getElementById('notifyOnChange').checked;
        agentSettings[agentType].syncInterval = parseInt(document.getElementById('syncInterval').value);
        agentSettings[agentType].lateThreshold = parseInt(document.getElementById('lateThreshold').value);
    }
    
    // LocalStorage에 저장
    saveAllAgentSettings();
    
    // Agent 상태 업데이트
    const agentNames = {
        'admin': '운영 Agent',
        'tutor': '학습 Agent',
        'monitor': '감시 Agent',
        'attendance': '출결 Agent'
    };
    
    const agentCard = document.querySelector(`.agent-card[data-agent="${agentType}"]`);
    const statusElement = agentCard.querySelector('.agent-status');
    
    if (agentSettings[agentType].enabled) {
        statusElement.classList.remove('standby');
        statusElement.classList.add('active');
        statusElement.innerHTML = '<i class="fas fa-circle"></i> 활성';
    } else {
        statusElement.classList.remove('active');
        statusElement.classList.add('standby');
        statusElement.innerHTML = '<i class="fas fa-circle"></i> 비활성';
    }
    
    addActivityLog('설정', `${agentNames[agentType]} 설정이 저장되었습니다.`, 'success');
    
    // 모달 닫기
    modal.classList.remove('show');
    
    alert(`✅ ${agentNames[agentType]} 설정이 저장되었습니다.`);
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('agentSettingsModal');
    if (event.target === modal) {
        closeAgentSettings();
    }
}

// ============================
// 월별 출석부 관리
// ============================

function initializeMonthlyAttendance() {
    populateMonthSelector();
    renderMonthlyAttendance();
    updateMonthlyStats();
}

function populateMonthSelector() {
    const selector = document.getElementById('attendanceMonth');
    const currentDate = new Date();
    
    // 최근 6개월 옵션 생성
    for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const option = document.createElement('option');
        option.value = `${date.getFullYear()}-${date.getMonth()}`;
        option.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        if (i === 0) option.selected = true;
        selector.appendChild(option);
    }
}

function renderMonthlyAttendance() {
    const table = document.getElementById('monthlyAttendanceTable');
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let html = '<thead><tr>';
    html += '<th class="student-name">수강생</th>';
    
    // 통계 컬럼 (왼쪽으로 이동)
    html += '<th class="summary-col">총 수업일수</th>';
    html += '<th class="summary-col">출석</th>';
    html += '<th class="summary-col">결석</th>';
    html += '<th class="summary-col">외출</th>';
    html += '<th class="summary-col">조퇴</th>';
    html += '<th class="summary-col">지각</th>';
    html += '<th class="summary-col">출석률</th>';
    html += '<th class="summary-col">시간률</th>';
    
    // 날짜 헤더
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        html += `<th class="${isWeekend ? 'weekend' : ''}">${day}<br><small>${dayOfWeek}</small></th>`;
    }
    
    html += '</tr></thead><tbody>';
    
    // 수강생별 출석 데이터
    students.forEach(student => {
        const data = monthlyAttendanceData[student.id];
        html += '<tr>';
        html += `<td class="student-name">${student.name}</td>`;
        
        // 통계 (왼쪽으로 이동)
        const summary = data.summary;
        html += `<td class="summary-cell">${summary.totalDays}</td>`;
        html += `<td class="summary-cell">${summary.present}</td>`;
        html += `<td class="summary-cell">${summary.absent}</td>`;
        html += `<td class="summary-cell">${summary.outing}</td>`;
        html += `<td class="summary-cell">${summary.early}</td>`;
        html += `<td class="summary-cell">${summary.late}</td>`;
        html += `<td class="summary-cell highlight">${summary.attendanceRate}%</td>`;
        html += `<td class="summary-cell highlight">${summary.timeRate}%</td>`;
        
        // 날짜별 출석 상태
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = data.days[day];
            html += `<td><span class="attendance-status ${dayData.status}">${dayData.label}</span></td>`;
        }
        
        html += '</tr>';
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

function updateMonthlyStats() {
    let totalAttendanceRate = 0;
    let totalTimeRate = 0;
    let totalDays = 0;
    
    students.forEach(student => {
        const summary = monthlyAttendanceData[student.id].summary;
        totalAttendanceRate += summary.attendanceRate;
        totalTimeRate += summary.timeRate;
        totalDays = summary.totalDays;
    });
    
    const avgAttendanceRate = Math.round(totalAttendanceRate / students.length);
    const avgTimeRate = Math.round(totalTimeRate / students.length);
    
    document.getElementById('avgAttendanceRate').textContent = avgAttendanceRate + '%';
    document.getElementById('avgTimeRate').textContent = avgTimeRate + '%';
    document.getElementById('totalClassDays').textContent = totalDays + '일';
}

function changeAttendanceMonth() {
    const selector = document.getElementById('attendanceMonth');
    const [year, month] = selector.value.split('-').map(Number);
    
    currentYear = year;
    currentMonth = month;
    monthlyAttendanceData = generateMonthlyAttendanceData(currentYear, currentMonth);
    
    renderMonthlyAttendance();
    updateMonthlyStats();
    
    addActivityLog('출석부', `${year}년 ${month + 1}월 출석부를 조회했습니다.`, 'info');
}

function exportMonthlyAttendance() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthString = `${currentYear}년 ${currentMonth + 1}월`;
    
    // 엑셀 데이터 준비
    const excelData = [];
    
    // 헤더 행
    const headerRow = { '수강생': '수강생' };
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        headerRow[`${day}일(${dayOfWeek})`] = '';
    }
    headerRow['총 수업일수'] = '총 수업일수';
    headerRow['출석'] = '출석';
    headerRow['결석'] = '결석';
    headerRow['외출'] = '외출';
    headerRow['조퇴'] = '조퇴';
    headerRow['지각'] = '지각';
    headerRow['출석률'] = '출석률';
    headerRow['시간률'] = '시간률';
    excelData.push(headerRow);
    
    // 수강생별 데이터
    students.forEach(student => {
        const data = monthlyAttendanceData[student.id];
        const row = { '수강생': student.name };
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            const dayData = data.days[day];
            row[`${day}일(${dayOfWeek})`] = dayData.label;
        }
        
        const summary = data.summary;
        row['총 수업일수'] = summary.totalDays;
        row['출석'] = summary.present;
        row['결석'] = summary.absent;
        row['외출'] = summary.outing;
        row['조퇴'] = summary.early;
        row['지각'] = summary.late;
        row['출석률'] = summary.attendanceRate + '%';
        row['시간률'] = summary.timeRate + '%';
        
        excelData.push(row);
    });
    
    // 평균 통계 추가
    let totalAttendanceRate = 0;
    let totalTimeRate = 0;
    students.forEach(student => {
        const summary = monthlyAttendanceData[student.id].summary;
        totalAttendanceRate += summary.attendanceRate;
        totalTimeRate += summary.timeRate;
    });
    
    excelData.push({});
    excelData.push({
        '수강생': '=== 평균 통계 ===',
        '출석률': Math.round(totalAttendanceRate / students.length) + '%',
        '시간률': Math.round(totalTimeRate / students.length) + '%'
    });
    
    excelData.push({});
    excelData.push({
        '수강생': '출력 일시',
        '출석': new Date().toLocaleString('ko-KR')
    });
    excelData.push({
        '수강생': '시스템',
        '출석': '강한 매니저 v1.0.0'
    });
    
    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 컬럼 너비 설정
    const wscols = [{ wch: 12 }]; // 수강생 이름
    for (let i = 0; i < daysInMonth; i++) {
        wscols.push({ wch: 8 });
    }
    wscols.push({ wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 });
    worksheet['!cols'] = wscols;
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${currentMonth + 1}월 출석부`);
    
    // 파일 다운로드
    const filename = `월별출석부_${currentYear}년${currentMonth + 1}월_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    addActivityLog('출석부', `${monthString} 출석부를 다운로드했습니다.`, 'success');
    alert(`✅ ${monthString} 출석부가 다운로드되었습니다.\n\n파일명: ${filename}`);
}

// ============================
// 이벤트 리스너 설정
// ============================

function setupEventListeners() {
    // 테마 전환 버튼
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // 감독 제어 버튼
    document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
    document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);
    document.getElementById('pauseMonitoring').addEventListener('click', pauseMonitoring);
    document.getElementById('emergencyAlert').addEventListener('click', sendEmergencyAlert);
    
    // 엑셀 다운로드 버튼
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    
    // 월별 출석부 관련
    document.getElementById('attendanceMonth').addEventListener('change', changeAttendanceMonth);
    document.getElementById('exportMonthlyAttendance').addEventListener('click', exportMonthlyAttendance);
    
    // Teams 미팅 새로고침
    document.getElementById('refreshMeetings').addEventListener('click', refreshMeetings);
}

// ============================
// Teams 미팅 스케줄러
// ============================

function initializeMeetingScheduler() {
    renderScheduledMeetings();
    addActivityLog('Teams', 'Teams에서 예약된 수업 일정을 불러왔습니다.', 'info');
}

function refreshMeetings() {
    // 실제 환경에서는 Microsoft Teams SDK로 데이터를 다시 가져옴
    renderScheduledMeetings();
    addActivityLog('Teams', 'Teams 수업 일정을 새로고침했습니다.', 'info');
    
    // 시뮬레이션: 새로운 수업이 추가되었다고 가정
    const newMeetingAdded = Math.random() > 0.7; // 30% 확률로 새 수업 추가
    
    if (newMeetingAdded) {
        const sampleTitles = ['머신러닝 심화', 'AWS 클라우드 실습', '데이터 분석 프로젝트', 'React 웹 개발'];
        const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + Math.floor(Math.random() * 5) + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        
        const newMeeting = {
            id: scheduledMeetings.length > 0 ? Math.max(...scheduledMeetings.map(m => m.id)) + 1 : 1,
            title: randomTitle,
            startTime: '09:00',
            endTime: '12:00',
            date: dateString,
            status: 'scheduled'
        };
        
        scheduledMeetings.push(newMeeting);
        scheduledMeetings.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.startTime}`);
            const dateB = new Date(`${b.date} ${b.startTime}`);
            return dateA - dateB;
        });
        
        renderScheduledMeetings();
        addActivityLog('Teams', `'${randomTitle}(${newMeeting.startTime} ~ ${newMeeting.endTime})' 모임이 성공적으로 예약되었습니다.`, 'success');
    }
    
    alert('✅ Teams 수업 일정을 새로고침했습니다.');
}

function renderScheduledMeetings() {
    const container = document.getElementById('meetingsLogContainer');
    
    if (scheduledMeetings.length === 0) {
        container.innerHTML = `
            <div class="no-meetings-log">
                <i class="fas fa-calendar-times"></i>
                <p>예약된 수업이 없습니다.</p>
                <small>Teams에서 Power Automate로 수업을 예약하면 자동으로 표시됩니다.</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    scheduledMeetings.forEach((meeting) => {
        const logEntry = document.createElement('div');
        logEntry.className = 'meeting-log-entry';
        
        // 날짜 포맷팅
        const dateObj = new Date(meeting.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const weekday = weekdays[dateObj.getDay()];
        
        // 오늘/내일/지난 날짜 판단
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const meetingDate = new Date(meeting.date);
        meetingDate.setHours(0, 0, 0, 0);
        
        let logClass = '';
        const dayDiff = Math.floor((meetingDate - today) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 0) {
            logClass = 'today-log';
        } else if (dayDiff === 1) {
            logClass = 'tomorrow-log';
        } else if (dayDiff < 0) {
            logClass = 'past-log';
        }
        
        logEntry.className += ' ' + logClass;
        
        // 로그 메시지 생성
        const logMessage = `${year}년 ${month}월 ${day}일 ${weekday} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" 수업 모임 예약되었습니다.`;
        
        logEntry.innerHTML = `
            <div class="meeting-log-icon">
                <i class="fas fa-video"></i>
            </div>
            <div class="meeting-log-text">${logMessage}</div>
        `;
        
        container.appendChild(logEntry);
    });
}

function joinMeeting(meetingId) {
    const meeting = scheduledMeetings.find(m => m.id === meetingId);
    if (meeting) {
        addActivityLog('Teams', `'${meeting.title}' 수업에 참여합니다.`, 'info');
        alert(`🎥 Teams 미팅 참여\n\n수업명: ${meeting.title}\n시간: ${meeting.startTime} ~ ${meeting.endTime}\n\n※ 실제 환경에서는 Teams 앱이 실행됩니다.`);
        // 실제 환경에서는 Teams 미팅 링크로 이동
        // window.open(meeting.teamsLink, '_blank');
    }
}

// ============================
// 유틸리티 함수
// ============================

function formatTime(date) {
    return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
}
