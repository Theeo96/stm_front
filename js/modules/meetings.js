(function () {
    window.Meetings = {};

    window.Meetings.init = function () {
        window.Meetings.render();
        setupEventListeners();
    };

    window.Meetings.render = function () {
        const container = document.getElementById('meetingsLogContainer');
        if (!container) return;

        const meetings = window.Store.state.scheduledMeetings || [];
        const t = window.translate || ((k) => k);
        const currentLanguage = localStorage.getItem('language') || 'ko';

        if (meetings.length === 0) {
            container.innerHTML = `
                <div class="no-meetings-log">
                    <i class="fas fa-calendar-times"></i>
                    <p>${t('meeting.none') || '예정된 수업 없음'}</p>
                    <small>${t('meeting.none.detail') || '현재 예약된 수업 일정이 없습니다.'}</small>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        meetings.forEach(meeting => {
            const logEntry = document.createElement('div');
            logEntry.className = 'meeting-log-entry';

            const dateObj = new Date(meeting.date);
            let logMessage = '';

            if (currentLanguage === 'ko') {
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();
                const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
                const weekday = weekdays[dateObj.getDay()];
                logMessage = `${year}년 ${month}월 ${day}일 ${weekday} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" 수업 모임 예약되었습니다.`;
            } else if (currentLanguage === 'ja') {
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();
                const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
                const weekday = weekdays[dateObj.getDay()];
                logMessage = `${year}年${month}月${day}日 ${weekday} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" 授業ミーティングが予約されました。`;
            } else if (currentLanguage === 'zh') {
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                const weekday = weekdays[dateObj.getDay()];
                logMessage = `${year}年${month}月${day}日 ${weekday} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" 课程会议已预约。`;
            } else if (currentLanguage === 'ar') {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateString = dateObj.toLocaleDateString('ar-SA', options);
                logMessage = `${dateString} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" تم حجز اجتماع الفصل.`;
            } else { // English
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateString = dateObj.toLocaleDateString('en-US', options);
                logMessage = `${dateString} ${meeting.startTime} ~ ${meeting.endTime}, "${meeting.title}" class meeting has been scheduled.`;
            }

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

            if (logClass) logEntry.classList.add(logClass);

            logEntry.innerHTML = `
                <div class="meeting-log-icon">
                    <i class="fas fa-video"></i>
                </div>
                <div class="meeting-log-text">${logMessage}</div>
            `;

            container.appendChild(logEntry);
        });
    };

    function setupEventListeners() {
        const btn = document.getElementById('refreshMeetings');
        if (btn) btn.addEventListener('click', () => {
            if (window.fetchAndUpdateData) window.fetchAndUpdateData();
        });
    }
})();
