(function () {
    window.Attendance = {};

    window.Attendance.init = function () {
        populateMonthSelector();
        const now = new Date();
        // Use global Store state for initialization if needed, but here we set initial state
        if (window.Store && window.Store.state) {
            window.Store.state.currentYear = now.getFullYear();
            window.Store.state.currentMonth = now.getMonth();
        }
        updateDate(now.getFullYear(), now.getMonth());
        setupEventListeners();
    };

    window.Attendance.exportToExcel = function () {
        exportToExcel();
    };

    function setupEventListeners() {
        const monthSelector = document.getElementById('attendanceMonth');

        if (monthSelector) {
            monthSelector.addEventListener('change', function () {
                const [year, month] = this.value.split('-').map(Number);
                updateDate(year, month - 1);
            });
        }

        const exportBtn = document.getElementById('exportMonthlyAttendance');
        if (exportBtn) exportBtn.addEventListener('click', exportToExcel);
    }

    function updateDate(year, month) {
        if (!window.Store || !window.Store.state) return;

        window.Store.state.currentYear = year;
        window.Store.state.currentMonth = month;

        // 데이터 갱신 (시뮬레이션 로직 포함)
        const newData = generateMonthlyAttendanceData(year, month);
        window.Store.setMonthlyAttendanceData(newData);

        window.Attendance.render();
    }

    function populateMonthSelector() {
        const selector = document.getElementById('attendanceMonth');
        if (!selector) return;

        selector.innerHTML = ''; // Clear existing
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

    window.Attendance.render = function () {
        const table = document.getElementById('monthlyAttendanceTable');
        if (!table) return;

        const state = window.Store.state;
        const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

        // 헤더 생성 (Name | Stats... | Dates...)
        let html = '<thead style="background: var(--bg-secondary); position: sticky; top: 0; z-index: 10;"><tr>';
        html += `<th class="student-name" style="position: sticky; left: 0; background: var(--bg-secondary); z-index: 20;">${window.translate ? window.translate('attendance.student') : '수강생'}</th>`;

        // 통계 컬럼 (왼쪽으로 이동 - Legacy Style)
        const statsHeaders = [
            'attendance.totalDays', 'attendance.present', 'attendance.absent',
            'attendance.outing', 'attendance.early', 'attendance.late',
            'attendance.rate', 'attendance.timeRate'
        ];
        statsHeaders.forEach(key => {
            html += `<th class="summary-col">${window.translate ? window.translate(key) : key}</th>`;
        });

        // 날짜 헤더
        const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(state.currentYear, state.currentMonth, day);
            const dayOfWeekIdx = date.getDay();
            const dayOfWeek = window.translate ? window.translate(`attendance.weekday.${weekdayKeys[dayOfWeekIdx]}`) : ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIdx];
            const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
            html += `<th class="${isWeekend ? 'weekend' : ''}">${day}<br><small>${dayOfWeek}</small></th>`;
        }
        html += '</tr></thead><tbody>';

        const data = state.monthlyAttendanceData || {};

        // 데이터 행 생성
        Object.keys(data).forEach((studentId, index) => {
            const studentData = data[studentId];
            html += '<tr>';

            // 이름 (Sticky Left)
            html += `<td class="student-name" style="position: sticky; left: 0; background: var(--bg-card); z-index: 5;">${studentData.name}</td>`;

            // 통계 (Legacy Order)
            const summary = studentData.summary;
            html += `<td class="summary-cell">${summary.totalDays}</td>`;
            html += `<td class="summary-cell">${summary.present}</td>`;
            html += `<td class="summary-cell">${summary.absent}</td>`;
            html += `<td class="summary-cell">${summary.outing}</td>`;
            html += `<td class="summary-cell">${summary.early}</td>`;
            html += `<td class="summary-cell">${summary.late}</td>`;
            html += `<td class="summary-cell highlight">${summary.attendanceRate}%</td>`;
            html += `<td class="summary-cell highlight">${summary.timeRate}%</td>`;

            // 날짜별 상태
            for (let day = 1; day <= daysInMonth; day++) {
                const dayData = studentData.days[day];
                let cellContent = '';

                if (dayData) {
                    const status = dayData.status;
                    const label = window.translate ? window.translate(`attendance.status.${status}`) : status;
                    cellContent = `<span class="attendance-status ${status}">${label}</span>`;
                }
                html += `<td>${cellContent}</td>`;
            }

            html += '</tr>';
        });

        html += '</tbody>';
        table.innerHTML = html;

        updateMonthlyStats();
    };

    function updateMonthlyStats() {
        const data = window.Store.state.monthlyAttendanceData;
        if (!data) return;

        let totalAttendanceRate = 0;
        let totalTimeRate = 0;
        let totalDays = 0;
        let studentCount = 0;

        Object.values(data).forEach(s => {
            totalAttendanceRate += s.summary.attendanceRate;
            totalTimeRate += s.summary.timeRate;
            if (s.summary.totalDays > totalDays) {
                totalDays = s.summary.totalDays;
            }
            studentCount++;
        });

        const avgAttendanceRate = studentCount > 0 ? Math.round(totalAttendanceRate / studentCount) : 0;
        const avgTimeRate = studentCount > 0 ? Math.round(totalTimeRate / studentCount) : 0;

        const avgAttEl = document.getElementById('avgAttendanceRate');
        if (avgAttEl) avgAttEl.textContent = `${avgAttendanceRate}%`;

        const avgTimeEl = document.getElementById('avgTimeRate');
        if (avgTimeEl) avgTimeEl.textContent = `${avgTimeRate}%`;

        const totalDaysEl = document.getElementById('totalClassDays');
        if (totalDaysEl) totalDaysEl.textContent = `${totalDays}일`;
    }

    function exportToExcel() {
        if (window.Logging) window.Logging.addActivityLog('success', window.translate ? window.translate('log.attendance.downloaded') : '월별 출석부가 다운로드되었습니다.', 'success');

        const now = new Date();
        const dateString = now.toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '');

        const table = document.getElementById('monthlyAttendanceTable');
        if (!table) {
            alert("데이터가 없습니다.");
            return;
        }

        const wb = XLSX.utils.table_to_sheet(table);
        const new_wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(new_wb, wb, "Monthly Attendance");

        const state = window.Store.state;
        const filename = `월별출석부_${state.currentYear}년${state.currentMonth + 1}월_${dateString}.xlsx`;
        XLSX.writeFile(new_wb, filename);

        alert(`✅ 월별 출석부가 엑셀 파일로 다운로드되었습니다.\n\n파일명: ${filename}`);
    }

    function generateMonthlyAttendanceData(year, month) {
        if (!window.STUDENT_INFO) return {};

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthlyData = {};

        window.STUDENT_INFO.forEach(student => {
            monthlyData[student.num] = {
                name: student.name,
                days: {},
                summary: {
                    present: 0, absent: 0, outing: 0, early: 0, late: 0,
                    totalDays: 0, attendanceRate: 0, timeRate: 0,
                    totalHours: 0, totalExpectedHours: 0
                }
            };

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    monthlyData[student.num].days[day] = { status: 'weekend', hours: 0 };
                    continue;
                }

                monthlyData[student.num].summary.totalDays++;

                const rand = Math.random();
                let status, hours;

                if (rand < 0.85) { status = 'present'; hours = 8; monthlyData[student.num].summary.present++; }
                else if (rand < 0.90) { status = 'late'; hours = 7; monthlyData[student.num].summary.late++; }
                else if (rand < 0.93) { status = 'early'; hours = 6; monthlyData[student.num].summary.early++; }
                else if (rand < 0.96) { status = 'outing'; hours = 4; monthlyData[student.num].summary.outing++; }
                else { status = 'absent'; hours = 0; monthlyData[student.num].summary.absent++; }

                monthlyData[student.num].days[day] = { status, hours };

                monthlyData[student.num].summary.totalHours += hours;
                monthlyData[student.num].summary.totalExpectedHours += 8;
            }

            const summary = monthlyData[student.num].summary;
            const totalDays = summary.totalDays;

            if (totalDays > 0) {
                const attendedDays = summary.present + summary.late + summary.early + summary.outing;
                summary.attendanceRate = Math.round((attendedDays / totalDays) * 100);

                if (summary.totalExpectedHours > 0) {
                    summary.timeRate = Math.round((summary.totalHours / summary.totalExpectedHours) * 100);
                }
            }
        });

        return monthlyData;
    }

})();
