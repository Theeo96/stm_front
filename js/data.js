// 수강생 데이터
const students = [
    {
        id: 1,
        name: '엄태홍',
        phone: '010-1234-5678',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 2,
        name: '권순우',
        phone: '010-2345-6789',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 3,
        name: '정찬희',
        phone: '010-3456-7890',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 4,
        name: '이재균',
        phone: '010-4567-8901',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 1
    },
    {
        id: 5,
        name: '문소라',
        phone: '010-5678-9012',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 6,
        name: '이동현',
        phone: '010-6789-0123',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 7,
        name: '권동훈',
        phone: '010-7890-1234',
        status: 'online',
        camera: true,
        lastSeenKey: 'justnow',
        warnings: 0
    },
    {
        id: 8,
        name: 'Sammy',
        phone: '010-8901-2345',
        status: 'away',
        camera: false,
        lastSeenKey: '5min',
        lastSeenValue: 5,
        warnings: 0
    }
];

// 활동 로그 데이터
const activityLogs = [];

// ============================
// 월별 출석 데이터 생성
// ============================

// 월별 출석 데이터 생성 함수
function generateMonthlyAttendanceData(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthlyData = {};
    
    // 각 수강생별 출석 데이터 생성
    students.forEach(student => {
        monthlyData[student.id] = {
            name: student.name,
            days: {},
            summary: {
                present: 0,      // 출석
                absent: 0,       // 결석
                outing: 0,       // 외출
                early: 0,        // 조퇴
                late: 0,         // 지각
                totalDays: 0,    // 총 수업일수
                attendanceRate: 0,  // 출석률
                timeRate: 0      // 출석시간률
            }
        };
        
        // 각 날짜별 출석 데이터 생성
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            // 주말 체크
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                monthlyData[student.id].days[day] = {
                    status: 'weekend',
                    hours: 0
                };
                continue;
            }
            
            // 수업일 카운트
            monthlyData[student.id].summary.totalDays++;
            
            // 랜덤 출석 데이터 생성 (시뮬레이션)
            const rand = Math.random();
            let status, hours;
            
            if (rand < 0.85) {
                // 85% 출석
                status = 'present';
                hours = 8; // 8시간
                monthlyData[student.id].summary.present++;
            } else if (rand < 0.90) {
                // 5% 지각
                status = 'late';
                hours = 7; // 7시간
                monthlyData[student.id].summary.late++;
            } else if (rand < 0.93) {
                // 3% 조퇴
                status = 'early';
                hours = 6; // 6시간
                monthlyData[student.id].summary.early++;
            } else if (rand < 0.96) {
                // 3% 외출
                status = 'outing';
                hours = 4; // 4시간
                monthlyData[student.id].summary.outing++;
            } else {
                // 4% 결석
                status = 'absent';
                hours = 0;
                monthlyData[student.id].summary.absent++;
            }
            
            monthlyData[student.id].days[day] = {
                status: status,
                hours: hours
            };
        }
        
        // 출석률 및 출석시간률 계산
        const summary = monthlyData[student.id].summary;
        const totalDays = summary.totalDays;
        
        if (totalDays > 0) {
            // 출석률: (출석 + 지각 + 조퇴 + 외출) / 총 수업일수
            const attendedDays = summary.present + summary.late + summary.early + summary.outing;
            summary.attendanceRate = Math.round((attendedDays / totalDays) * 100);
            
            // 출석시간률: 실제 출석 시간 / (총 수업일수 * 8시간)
            let totalHours = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                if (monthlyData[student.id].days[day]) {
                    totalHours += monthlyData[student.id].days[day].hours;
                }
            }
            summary.timeRate = Math.round((totalHours / (totalDays * 8)) * 100);
        }
    });
    
    return monthlyData;
}

// 현재 월 출석 데이터
const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let monthlyAttendanceData = generateMonthlyAttendanceData(currentYear, currentMonth);

// ============================
// Teams 미팅 예약 데이터
// ============================

// 예약된 수업 일정
let scheduledMeetings = [
    {
        id: 1,
        title: 'Python 기초 강의',
        startTime: '09:00',
        endTime: '12:00',
        date: '2025-01-02',
        status: 'scheduled'
    },
    {
        id: 2,
        title: 'AI 알고리즘 실습',
        startTime: '13:00',
        endTime: '17:00',
        date: '2025-01-02',
        status: 'scheduled'
    },
    {
        id: 3,
        title: 'Langchain 프로젝트',
        startTime: '09:00',
        endTime: '12:00',
        date: '2025-01-03',
        status: 'scheduled'
    }
];
