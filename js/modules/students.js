(function () {
    window.Students = {};

    window.Students.init = function () {
        const exportBtn = document.getElementById('exportExcel');
        if (exportBtn) exportBtn.addEventListener('click', window.Students.exportToExcel);
    };

    window.Students.render = function () {
        const tbody = document.getElementById('studentTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const students = window.Store.state.students || [];

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">No Data</td></tr>';
            return;
        }

        students.forEach((student, index) => {
            const row = document.createElement('tr');

            const statusClass = student.status === 'online' ? 'online' :
                student.status === 'away' ? 'away' : 'offline';

            const t = window.translate || ((k) => k);
            const statusKey = `student.status.${student.status}`;
            const statusText = t(statusKey) !== statusKey ? t(statusKey) : student.status;

            const statusIcon = student.status === 'online' ? 'fa-circle' :
                student.status === 'away' ? 'fa-clock' : 'fa-circle';

            const cameraClass = student.camera ? 'on' : 'off';
            const cameraIcon = student.camera ? 'fa-video' : 'fa-video-slash';
            const cameraText = t(`student.camera.${student.camera ? 'on' : 'off'}`) || (student.camera ? 'ON' : 'OFF');

            const warningsText = student.warnings > 0 ?
                `<strong style="color: var(--danger-color);">${student.warnings}${t('student.warnings.count') || '회'}</strong>` :
                t('student.warnings.none') || '-';

            const isInText = student.isIn ? `<span class="presence-badge in"><i class="fas fa-check"></i> ${t('student.isIn.true') || '참여'}</span>` :
                `<span class="presence-badge out"><i class="fas fa-times"></i> ${t('student.isIn.false') || '미참여'}</span>`;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${student.name}</strong></td>
                <td>${student.phone || '-'}</td>
                <td>${isInText}</td>
                <td><span class="status-badge-table ${statusClass}"><i class="fas ${statusIcon}"></i> ${statusText}</span></td>
                <td><span class="camera-status ${cameraClass}"><i class="fas ${cameraIcon}"></i> ${cameraText}</span></td>
                <td>${student.lastSeen || '-'}</td>
                <td>${warningsText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn phone-btn" onclick="window.Students.makePhoneCall('${student.id}')"><i class="fas fa-phone"></i></button>
                        <button class="action-btn message-btn" onclick="window.Students.sendMessage('${student.id}')"><i class="fas fa-comment"></i></button>
                        <button class="action-btn alert-btn-table" onclick="window.Students.sendAlert('${student.id}')"><i class="fas fa-bell"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    window.Students.updateStatistics = function () {
        const students = window.Store.state.students || [];
        const total = students.length;
        const present = students.filter(s => s.status === 'online').length;
        const absent = students.filter(s => s.status === 'offline').length;
        const warnings = students.reduce((acc, s) => acc + (s.warnings || 0), 0);

        const totalEl = document.getElementById('totalStudents');
        const presentEl = document.getElementById('presentStudents');
        const absentEl = document.getElementById('absentStudents');
        const warningEl = document.getElementById('warningStudents');

        if (totalEl) totalEl.textContent = total;
        if (presentEl) presentEl.textContent = present;
        if (absentEl) absentEl.textContent = absent;
        if (warningEl) warningEl.textContent = warnings;
    };

    window.Students.sendMessage = function (studentId) {
        const student = window.Store.state.students.find(s => s.id === studentId);
        if (student) {
            const msg = prompt(`${student.name}님에게 보낼 메시지:`);
            if (msg) {
                alert(`메시지 전송: ${msg}`);
                if (window.Logging) window.Logging.addActivityLog('관리자', `메시지 전송: ${student.name}`, 'info');
            }
        }
    };

    window.Students.makePhoneCall = function (studentId) {
        alert(`Calling ${studentId}...`);
    };

    window.Students.sendAlert = function (studentId) {
        const student = window.Store.state.students.find(s => s.id === studentId);
        if (student) {
            student.warnings = (student.warnings || 0) + 1;
            window.Students.render();
            window.Students.updateStatistics();
            alert(`Warning sent to ${student.name}`);
        }
    };

    window.Students.exportToExcel = function () {
        if (!window.XLSX) { alert('SheetJS Not Loaded'); return; }
        const students = window.Store.state.students || [];
        if (students.length === 0) { alert('No Data'); return; }

        const ws = XLSX.utils.json_to_sheet(students);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_Status.xlsx");
    };
})();
