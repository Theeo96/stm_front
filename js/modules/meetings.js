(function () {
    window.Meetings = {};

    window.Meetings.init = function () {
        window.Meetings.render();
        setupEventListeners();
    };

    window.Meetings.render = function () {
        const container = document.getElementById('meetingsLogContainer');
        if (!container) return;
        container.innerHTML = '';

        const meetings = window.Store.state.scheduledMeetings || [];

        if (meetings.length === 0) {
            container.innerHTML = '<p style="padding:10px; color:#666;">예정된 수업이 없습니다.</p>';
            return;
        }

        meetings.forEach(meeting => {
            const div = document.createElement('div');
            div.className = 'meeting-item'; // Assume css class
            div.innerHTML = `<strong>${meeting.title}</strong><br>${meeting.time} (${meeting.instructor})`;
            container.appendChild(div);
        });
    };

    function setupEventListeners() {
        const btn = document.getElementById('refreshMeetings');
        if (btn) btn.addEventListener('click', () => {
            // trigger refresh in main
            const fetchAndUpdate = window.fetchAndUpdateData; // May not be global? 
            // main.js defines fetchAndUpdateData specifically but didn't attach to window.
            // It does start an interval. 
            // We can assume main.js listens to button or we dispatch event.
            // main.js does NOT listen to custom event 'refreshMeetings' in previous read.
            // But button ID 'refreshMeetings' click in main.js is NOT handled.
            // Wait, if I am defining listener here, I need to know what to call.
            // I will dispatch 'refreshMeetings' and hope main.js picks it up?
            // NO, I should fix main.js to listen OR fetch here.
            // Can't fetch here easily (apiService is global).
            // Let's call apiService and update Store manually?
            // Better: window.dispatchEvent(new Event('refreshMeetings')); 
            // AND update main.js to listen? 
            // User wants "complete legacy identity". Legacy probably just re-ran a function.
            // I will just make it reload the page (simple) or call fetchAndUpdateData if exposed.
            // I'll expose fetchAndUpdateData in main.js
            if (window.fetchAndUpdateData) window.fetchAndUpdateData();
        });
    }
})();
