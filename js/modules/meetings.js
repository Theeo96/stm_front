import { state } from '../store.js';
import { addActivityLog } from './logging.js';

// ============================
// Teams 미팅 일정 관리
// ============================

export function init() {
    render();
}

export function render() {
    const meetingTimeline = document.getElementById('meetingTimeline');
    if (!meetingTimeline) return;

    meetingTimeline.innerHTML = '';

    if (!state.scheduledMeetings || state.scheduledMeetings.length === 0) {
        meetingTimeline.innerHTML = '<div style="text-align:center; padding: 20px; color:#888;">예정된 일정이 없습니다.</div>';
        return;
    }

    state.scheduledMeetings.forEach(meeting => {
        // 시간 포맷팅
        const startTime = new Date(meeting.start_time);
        const endTime = new Date(meeting.end_time);

        const timeStr = `${startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;

        const item = document.createElement('div');
        item.className = 'timeline-item';

        // 상태별 스타일 바 (왼쪽)
        const statusColor = getStatusColor(meeting.status);

        item.innerHTML = `
            <div class="timeline-time">${timeStr}</div>
            <div class="timeline-content" style="border-left: 3px solid ${statusColor}">
                <h4>${meeting.title}</h4>
                <p>${window.translate ? window.translate('status.' + meeting.status) : meeting.status}</p>
            </div>
        `;

        meetingTimeline.appendChild(item);
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'active': return '#10b981'; // Green
        case 'scheduled': return '#3b82f6'; // Blue
        case 'completed': return '#6b7280'; // Gray
        case 'cancelled': return '#ef4444'; // Red
        default: return '#3b82f6';
    }
}
