(function () {
    window.Students = {};



    window.Students.init = function () {
        window.Students.render();
        window.Students.setupEventListeners();
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

            // Status Badge Logic
            let statusBadgeClass = 'status-offline';
            let statusText = '미참여';

            if (student.status === 'online') {
                statusBadgeClass = 'status-online';
                statusText = '참여중';
            } else if (student.status === 'away') {
                statusBadgeClass = 'status-warning';
                statusText = '자리비움';
            }

            // Face Detection & Camera Logic
            let faceStatusStyle = '';
            let faceIcon = '';
            let cameraText = 'OFF';

            if (student.camera) {
                cameraText = 'ON';
                if (student.face_detected !== false) { // Default to true if undefined
                    faceStatusStyle = 'color: #10B981; font-size: 1.2rem;'; // Green
                    faceIcon = '<i class="fas fa-smile"></i>';
                } else {
                    faceStatusStyle = 'color: #EF4444; font-size: 1.2rem;'; // Red
                    faceIcon = '<i class="fas fa-frown"></i>';
                }
            } else {
                faceStatusStyle = 'color: #9CA3AF; font-size: 1.2rem;'; // Gray
                faceIcon = '<i class="fas fa-video-slash"></i>';
            }

            // Warnings - start at 0 if undefined
            const warnings = student.warnings !== undefined ? student.warnings : 0;
            const warningsHtml = `<span class="warning-badge ${warnings > 0 ? 'warning-active' : ''}">${warnings}</span>`;

            // isIn text
            const isInText = student.isIn ?
                `<span class="presence-badge in"><i class="fas fa-check"></i> 참여</span>` :
                `<span class="presence-badge out"><i class="fas fa-times"></i> 미참여</span>`;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><div class="student-name">${student.name}</div></td>
                <td>${student.phone || '-'}</td>
                <td>${isInText}</td>
                <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
                <td>
                     <span style="${faceStatusStyle}" title="${student.camera ? (student.face_detected !== false ? '얼굴 인식됨' : '얼굴 미인식') : '카메라 꺼짐'}">
                        ${faceIcon}
                    </span>
                </td>
                <td>${student.lastSeenText || student.lastSeenKey || '-'}</td>
                <td>${warningsHtml}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-call" title="전화" data-id="${student.id}" data-type="call"><i class="fas fa-phone"></i></button>
                        <button class="action-btn btn-message" title="메시지" data-id="${student.id}" data-type="message"><i class="fas fa-comment"></i></button>
                        <button class="action-btn btn-alert" title="경고" data-id="${student.id}" data-type="alert"><i class="fas fa-exclamation-triangle"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attach event listeners to action buttons
        const actionBtns = tbody.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                const id = parseInt(btnEl.dataset.id);
                const type = btnEl.dataset.type;
                handleLegacyAction(type, id);
            });
        });
    };

    function handleLegacyAction(type, id) {
        const student = (window.Store.state.students || []).find(s => s.id === id);
        if (!student) return;

        if (type === 'call') {
            const confirmed = confirm(`📞 ${student.name} 수강생에게 전화를 거시겠습니까?\n\n연락처: ${student.phone}`);
            if (confirmed) {
                alert(`📞 ${student.name} 수강생(${student.phone})에게 전화 연결 중...`);
                incrementWarning(student.id);
                if (window.Logging && window.Logging.addLog) {
                    window.Logging.addLog('전화', `${student.name} 수강생에게 전화 연결 시도`, 'info');
                }
            }
        } else if (type === 'message') {
            const msg = prompt(`💬 ${student.name} 수강생에게 보낼 메시지를 입력하세요:`, '출석 상태를 확인해 주시기 바랍니다.');
            if (msg && msg.trim() !== '') {
                alert(`💬 ${student.name} 수강생(${student.phone})에게 메시지가 발송되었습니다.\n\n내용: ${msg}`);
                incrementWarning(student.id);
                if (window.Logging && window.Logging.addLog) {
                    window.Logging.addLog('메시지', `${student.name}에게 메시지 발송: ${msg}`, 'info');
                }
            }
        } else if (type === 'alert') {
            alert(`📢 ${student.name} 수강생에게 알림이 발송되었습니다.`);
            incrementWarning(student.id);
            if (window.Logging && window.Logging.addLog) {
                window.Logging.addLog('알림', `${student.name}에게 경고 알림 발송`, 'warning');
            }
        }
    }

    function incrementWarning(studentId) {
        const students = window.Store.state.students || [];
        const idx = students.findIndex(s => s.id === studentId);
        if (idx !== -1) {
            // Ensure numeric
            const current = typeof students[idx].warnings === 'number' ? students[idx].warnings : 0;
            students[idx].warnings = current + 1;
            window.Store.setStudents([...students]); // Trigger Global State Update & Re-render
        }
    }

    window.Students.updateStatistics = function () {
        const students = window.Store.state.students || [];
        const total = students.length;
        const present = students.filter(s => s.status === 'online').length;

        // Calculate others based on logic or status
        // 'warning' stat usually counts students with warnings > 0
        const warningsCount = students.filter(s => (s.warnings || 0) > 0).length;

        // 'absent' could be those not online and not away? Or just 'offline'?
        // Legacy logic: total - present
        // But what about 'away'?
        // Let's assume 'absent' = offline.
        // If status is 'online' (present), 'away' (warning?), 'offline' (absent)
        const absent = students.filter(s => s.status === 'offline').length;

        const totalEl = document.getElementById('totalStudents');
        if (totalEl) totalEl.textContent = total;

        const presentEl = document.getElementById('presentStudents');
        if (presentEl) presentEl.textContent = present;

        const absentEl = document.getElementById('absentStudents');
        if (absentEl) absentEl.textContent = absent;

        const warningEl = document.getElementById('warningStudents');
        if (warningEl) warningEl.textContent = warningsCount;
    };

    window.Students.exportToExcel = function () {
        const t = window.translate || ((k) => k);
        if (window.Logging && window.Logging.addLog) {
            window.Logging.addLog('시스템', t('log.attendance.downloaded') || '출결 현황이 다운로드되었습니다.', 'success');
        }

        // 현재 날짜와 시간
        const now = new Date();
        const dateString = now.toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '');
        const timeString = now.toLocaleTimeString('ko-KR', { hour12: false }).replace(/:/g, '-');

        const students = window.Store.state.students || [];

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
                '마지막 확인': student.lastSeenKey || student.lastSeenText || '-',
                '경고 횟수': student.warnings || 0,
                '비고': (student.warnings || 0) > 0 ? '경고 대상' : '정상'
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
            { '번호': '경고 대상', '이름': students.filter(s => (s.warnings || 0) > 0).length + '명' },
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
    };

    window.Students.setupEventListeners = function () {
        const exportBtn = document.getElementById('exportExcel');
        if (exportBtn) exportBtn.addEventListener('click', window.Students.exportToExcel);
    };

    // Legacy support for global calls if any HTML onclicks remain
    window.Students.makePhoneCall = (id) => handleLegacyAction('call', parseInt(id));
    window.Students.sendMessage = (id) => handleLegacyAction('message', parseInt(id));
    window.Students.sendAlert = (id) => handleLegacyAction('alert', parseInt(id));

})();
