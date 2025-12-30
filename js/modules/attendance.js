import { state, setMonthlyAttendanceData } from '../store.js';

// ============================
// 월별 출석부 관리
// ============================

export function init() {
    populateMonthSelector();
    render();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('monthSelector').addEventListener('change', function () {
        const [year, month] = this.value.split('-').map(Number);
        updateDate(year, month - 1);
    });
}

function updateDate(year, month) {
    state.currentYear = year;
    state.currentMonth = month;

    // 데이터 갱신 (시뮬레이션 로직 포함)
    const newData = generateMonthlyAttendanceData(year, month);
    setMonthlyAttendanceData(newData);

    render();
}

function changeMonth(delta) {
    let newMonth = state.currentMonth + delta;
    let newYear = state.currentYear;

    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    updateDate(newYear, newMonth);

    // 셀렉터 값 동기화
    const selector = document.getElementById('monthSelector');
    if (selector) {
        selector.value = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
    }
}

function populateMonthSelector() {
    const selector = document.getElementById('monthSelector');
    if (!selector) return;

    const today = new Date();
    // 전후 6개월
    for (let i = -6; i <= 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const value = `${year}-${String(month).padStart(2, '0')}`;

        const option = document.createElement('option');
        option.value = value;
        option.textContent = `${year}년 ${month}월`;

        if (i === 0) option.selected = true;

        selector.appendChild(option);
    }
}

export function render() {
    // 헤더 업데이트
    const header = document.getElementById('attendanceMonthHeader');
    if (header) {
        header.textContent = `${state.currentYear}년 ${state.currentMonth + 1}월 출석 현황`;
    }

    // 테이블 렌더링
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

    // 테이블 헤더 (날짜) 업데이트
    updateTableHeader(daysInMonth);

    const data = state.monthlyAttendanceData || {};

    Object.keys(data).forEach(studentId => {
        const studentData = data[studentId];
        const tr = document.createElement('tr');

        // 이름
        let rowHtml = `<td style="position: sticky; left: 0; background: var(--bg-card); z-index: 1;">${studentData.name}</td>`;

        // 일별 데이터
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = studentData.days[day];
            let cellContent = '';
            let cellClass = '';

            if (dayData) {
                switch (dayData.status) {
                    case 'present': cellContent = '○'; cellClass = 'att-present'; break;
                    case 'absent': cellContent = 'X'; cellClass = 'att-absent'; break;
                    case 'late': cellContent = '▲'; cellClass = 'att-late'; break;
                    case 'early': cellContent = '▼'; cellClass = 'att-early'; break;
                    case 'outing': cellContent = '◎'; cellClass = 'att-outing'; break;
                    case 'weekend': cellContent = ''; cellClass = 'att-weekend'; break;
                }
            }

            rowHtml += `<td class="${cellClass}">${cellContent}</td>`;
        }

        // 통계
        const summary = studentData.summary;
        rowHtml += `
            <td class="att-summary">${summary.present}</td>
            <td class="att-summary">${summary.late}</td>
            <td class="att-summary">${summary.early}</td>
            <td class="att-summary">${summary.outing}</td>
            <td class="att-summary">${summary.absent}</td>
            <td class="att-summary" style="font-weight:bold">${summary.attendanceRate}%</td>
        `;

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    updateMonthlyStats();
}

function updateTableHeader(daysInMonth) {
    const headerRow = document.querySelector('.attendance-table thead tr');
    if (!headerRow) return;

    // 기존 헤더 초기화 (이름, [날짜들], 출, 지, 조, 외, 결, 률)
    // 날짜 컬럼만 동적으로 생성해야 함. 하지만 간단하게 전체 재작성

    let html = `<th style="position: sticky; left: 0; background: var(--bg-secondary); z-index: 2;">이름</th>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(state.currentYear, state.currentMonth, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const color = dayOfWeek === 0 ? 'color: var(--danger-color);' : (dayOfWeek === 6 ? 'color: var(--primary-color);' : '');

        html += `<th style="min-width: 30px; ${color}">${day}</th>`;
    }

    html += `
        <th>출석</th>
        <th>지각</th>
        <th>조퇴</th>
        <th>외출</th>
        <th>결석</th>
        <th>출석률</th>
    `;

    headerRow.innerHTML = html;
}

function updateMonthlyStats() {
    const data = state.monthlyAttendanceData;
    if (!data) return;

    // 간단한 통계 계산
    let totalRate = 0;
    let count = 0;

    Object.values(data).forEach(s => {
        totalRate += s.summary.attendanceRate;
        count++;
    });

    const avgRate = count > 0 ? Math.round(totalRate / count) : 0;

    const avgEl = document.getElementById('averageAttendanceRate');
    if (avgEl) avgEl.textContent = `${avgRate}%`;
}


// ============================
// 월별 출석 데이터 생성 (Helper)
// ============================
export function generateMonthlyAttendanceData(year, month) {
    // state.students 데이터를 기반으로 생성해야 함.
    // 만약 students가 로드되기 전이라면 빈 객체 반환
    if (!state.students || state.students.length === 0) return {};

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthlyData = {};

    state.students.forEach(student => {
        monthlyData[student.id] = {
            name: student.name,
            days: {},
            summary: {
                present: 0,
                absent: 0,
                outing: 0,
                early: 0,
                late: 0,
                totalDays: 0,
                attendanceRate: 0,
                timeRate: 0
            }
        };

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                monthlyData[student.id].days[day] = { status: 'weekend', hours: 0 };
                continue;
            }

            monthlyData[student.id].summary.totalDays++;

            const rand = Math.random();
            let status, hours;

            if (rand < 0.85) { status = 'present'; hours = 8; monthlyData[student.id].summary.present++; }
            else if (rand < 0.90) { status = 'late'; hours = 7; monthlyData[student.id].summary.late++; }
            else if (rand < 0.93) { status = 'early'; hours = 6; monthlyData[student.id].summary.early++; }
            else if (rand < 0.96) { status = 'outing'; hours = 4; monthlyData[student.id].summary.outing++; }
            else { status = 'absent'; hours = 0; monthlyData[student.id].summary.absent++; }

            monthlyData[student.id].days[day] = { status, hours };
        }

        const summary = monthlyData[student.id].summary;
        const totalDays = summary.totalDays;

        if (totalDays > 0) {
            const attendedDays = summary.present + summary.late + summary.early + summary.outing;
            summary.attendanceRate = Math.round((attendedDays / totalDays) * 100);
        }
    });

    return monthlyData;
}
