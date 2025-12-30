(function () {
    window.Logging = {};

    window.Logging.init = function () {
        // Init logic if needed
    };

    // 활동 로그 렌더링 (다국어 지원)
    window.Logging.render = function () {
        const logContainer = document.getElementById('activityLog');
        if (!logContainer) return;

        // Store에서 로그 목록 가져오기
        const logs = window.Store && window.Store.state ? window.Store.state.activityLogs : [];
        if (!logs) return;

        // 컨테이너 비우기
        logContainer.innerHTML = '';

        // 로그 다시 그리기
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';

            // 로그 타입 번역 (ex: 'log.type.info' -> '정보')
            // log.type이 'info', 'success' 등인 경우 번역됨
            const typeKey = `log.type.${log.logType}`;
            // window.translate 함수가 있으면 사용, 없으면 기본값
            const localizedType = window.translate ? window.translate(typeKey) : (log.logType || 'Info');

            // 만약 번역이 안되어서 키가 그대로 나오면, 그냥 logType을 대문자로 표시
            const displayType = localizedType === typeKey ? log.logType : localizedType;

            logElement.innerHTML = `
                <span class="log-time">${log.time}</span>
                <span class="log-type ${log.logType}">${displayType}</span>
                <span class="log-message">${log.message}</span>
            `;

            logContainer.appendChild(logElement);
        });
    };

    window.Logging.addActivityLog = function (type, message, logType = 'info') {
        const now = new Date();
        const time = `${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초`;
        const logEntry = {
            time,
            type, // 출처 (예: '시스템', 'Teams') - 메시지에 포함됨
            message, // 전체 메시지 문자열
            logType // 'info', 'success', 'warning', 'error'
        };

        // Store 업데이트
        if (window.Store && window.Store.addActivityLog) {
            window.Store.addActivityLog(logEntry);
        }

        // UI 업데이트 - 전체 다시 그리기 (언어 변경 대응을 위해)
        // 성능 이슈가 있을 경우 prepend 방식과 render 방식을 분리할 수 있으나, 
        // 로그 50개 제한이므로 전체 다시 그리기도 무방합니다.
        // 일관성을 위해 render 호출로 통일합니다.
        window.Logging.render();
    };

    window.Logging.getLogTypeLabel = function (type) {
        const typeKey = `log.type.${type}`;
        return window.translate ? window.translate(typeKey) : type;
    };

    // 언어 변경 이벤트 감지
    window.addEventListener('languageChanged', function () {
        if (window.Logging && window.Logging.render) {
            window.Logging.render();
        }
    });
})();
