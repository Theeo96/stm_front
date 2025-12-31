// API Configuration
const API_CONFIG = {
    BASE_URL: '/api', // Azure Static Web App defaults to /api for managed functions
    MOCK_MODE: false   // Set to false when backend is ready
};

// API Service
window.apiService = {
    // Merge incoming partial data with existing full data
    mergeStudentData(currentStudents, incomingData) {
        if (!incomingData) return currentStudents; // Safety check

        // If no current data, just process all as new
        if (!currentStudents || currentStudents.length === 0) {
            return incomingData.map(student => this._processNewStudent(student));
        }

        // Merge logic: Update existing, Add new
        // We assume incomingData is the source of truth for "active in meeting" if we were syncing purely,
        // but here we merge.
        return incomingData.map(incoming => {
            const existing = currentStudents.find(c => c.id === incoming.id || c.name === incoming.name);
            if (existing) {
                // Determine last_seen: only update if face is detected now
                const newLastSeen = incoming.face_detected ? new Date().toISOString() : existing.last_seen;

                // Derive status based on the (potentially old) last_seen
                const derivedStatus = this._deriveStatus({ ...incoming, last_seen: newLastSeen });

                // Update existing
                return {
                    ...existing,
                    ...incoming,
                    last_seen: newLastSeen,
                    // Preserve warnings from local state if incoming is likely reset/default, 
                    // or take max if we assume sync. specific request: actions increment it locally.
                    warnings: (existing.warnings !== undefined) ? existing.warnings : (incoming.warnings || 0),
                    // Re-calculate derived fields
                    status: derivedStatus,
                    lastSeenText: this._formatLastSeen(newLastSeen, incoming.face_detected)
                };
            }
            return this._processNewStudent(incoming);
        });
    },

    async clearStudents() {
        if (API_CONFIG.MOCK_MODE) {
            console.log('[API] Clear Students (Mock)');
            return true;
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/students`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Failed to clear students:', error);
            return false;
        }
    },

    // ----------------------------
    // API Helper Methods
    // ----------------------------

    _processNewStudent(student) {
        // 1. Static Info (Global Access)
        const staticInfo = window.getStudentInfo ? window.getStudentInfo(student.name) : {};
        const merged = { ...student, ...staticInfo };

        // 2. Init Last Seen
        // If face detected now, use now. Else if not present, use now (first entry default)
        if (merged.face_detected) {
            merged.last_seen = new Date().toISOString();
        } else if (!merged.last_seen) {
            merged.last_seen = new Date().toISOString();
        }

        // 3. Status Derivation
        merged.status = this._deriveStatus(merged);

        // 4. Text Format
        merged.lastSeenText = this._formatLastSeen(merged.last_seen, merged.face_detected);

        // 5. Init Warnings
        if (merged.warnings === undefined) {
            merged.warnings = 0;
        }

        return merged;
    },

    _deriveStatus(student) {
        // Condition: 'isIn' must be true to be considered online/away. 
        // If isIn is false, user might want 'offline' regardless of last_seen? 
        // The prompt said: "If > 4min absent", etc. Assuming this applies to those who are technically 'in the meeting' but not seen.
        if (student.isIn === false) return 'offline';

        const lastSeenDate = new Date(student.last_seen);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

        if (diffSeconds < 120) { // < 2 min
            return 'online'; // Present (출석)
        } else if (diffSeconds < 240) { // 2m ~ 4m
            return 'away'; // Away (자리비움)
        } else { // >= 4m
            return 'offline'; // Absent (결석)
        }
    },

    _formatLastSeen(lastSeenIso, faceDetected) {
        // If currently detected, show "Now" ?? 
        // User said: "Show relative time... even if face detected?"
        // User asked: "this relative time 'X min Y sec ago' ... triggers renewal every 1s"
        // And "Now - Last Seen".
        // If face is detected, last_seen is NOW. So diff is 0s.

        const lastSeenDate = new Date(lastSeenIso);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

        // Guard against negative if parsed time is slightly ahead of local clock
        if (diffSeconds < 0) return '지금';

        if (faceDetected) {
            // User wants relative time even if currently detected? 
            // "Last seen time" is NOW if detected. So diff is 0.
            // User: "1초 이상 차이날때부터 차이값을 나타내주고" (Show diff from 1s+)
            return '지금';
        }

        const mins = Math.floor(diffSeconds / 60);
        const secs = diffSeconds % 60;

        if (mins > 0) {
            return `${mins}분 ${secs}초 전`;
        } else {
            return `${secs}초 전`;
        }
    },

    // Legacy wrapper if needed, or used by fetchStudents for initial load
    _processStudentData(students) {
        return students.map(s => this._processNewStudent(s));
    },

    // Fetch Student Data
    async fetchStudents() {
        if (API_CONFIG.MOCK_MODE) {
            console.log('[API] Check Student Status (Mock)');
            return new Promise(resolve => {
                const MOCK_DATA_STUDENTS = []; // Define mock if needed or use empty
                const processed = this._processStudentData(MOCK_DATA_STUDENTS);
                setTimeout(() => resolve(processed), 500);
            });
        }

        try {
            // In a real file:// scenario without a backend, this fetch will fail.
            // But for the user's legacy restoration request, we usually expect some behavior.
            // If they want DUMMY data to appear on load (as per legacy reference),
            // and fetch fails, we should return dummy data or handle it.
            // The user said: "ensure the monthly attendance section correctly loads and displays dummy data."
            // But for Activity Log/Student Table, they rely on 'fetchAndUpdateData'.
            // If fetch fails, we catch error.

            // To make it work 'locally' instantly like legacy/index_test.html, 
            // legacy often had inline data. 
            // I'll return empty array if fetch fails, which is standard.
            // BUT wait, legacy/main.js might have had 'MOCK_DATA'. 
            // If user wants exact identity to legacy/index_test.html, I should check if that had hardcoded data.
            // Proceeding with standard fetch pattern for now.
            // Add cache busting specific timestamp to ensure we get fresh data (including empty array)
            const response = await fetch(`${API_CONFIG.BASE_URL}/students?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return this._processStudentData(data);
        } catch (error) {
            console.warn('Failed to fetch students (Backend not reachable?):', error);
            return []; // Return empty so it doesn't crash main.js
        }
    },

    // Fetch Meeting Schedule
    async fetchMeetings() {
        if (API_CONFIG.MOCK_MODE) {
            const DUMMY_MEETINGS = [
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
                }
            ];
            return new Promise(resolve => setTimeout(() => resolve(DUMMY_MEETINGS), 500));
        }

        try {
            // User requested POST, but confirmed GET in plan. Using GET.
            const response = await fetch(`${API_CONFIG.BASE_URL}/meetings?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const rawData = await response.json();

            // Map data from Server format to UI format
            // Server: { id, name, startDate (ISOish), endDate (ISOish), isReserved }
            // UI: { id, title, startTime, endTime, date, status }

            return rawData.map(item => {
                // Parse Dates
                // Input Ex: "2025-12-31 T14:00:00" or generic ISO
                // We'll trust the Date constructor or string split if simple
                // Handle potentially user-provided space " T"
                const startStr = (item.startDate || '').replace(' T', 'T').replace(' ', 'T');
                const endStr = (item.endDate || '').replace(' T', 'T').replace(' ', 'T');

                const startObj = new Date(startStr);
                const endObj = new Date(endStr);

                // Helper to format HH:mm
                const formatTime = (dateObj) => {
                    if (isNaN(dateObj.getTime())) return '00:00';
                    const h = String(dateObj.getHours()).padStart(2, '0');
                    const m = String(dateObj.getMinutes()).padStart(2, '0');
                    return `${h}:${m}`;
                };

                // Helper to format YYYY-MM-DD
                const formatDate = (dateObj) => {
                    if (isNaN(dateObj.getTime())) return 'YYYY-MM-DD';
                    const y = dateObj.getFullYear();
                    const mon = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    return `${y}-${mon}-${d}`;
                };

                return {
                    id: item.id,
                    title: item.name,
                    startTime: formatTime(startObj),
                    endTime: formatTime(endObj),
                    date: formatDate(startObj),
                    status: item.isReserved ? 'scheduled' : 'cancelled' // default to scheduled if reserved
                };
            });

        } catch (error) {
            console.warn('Failed to fetch meetings, fallback to empty:', error);
            return []; // Return empty on error to avoid breaking UI
        }
    },

    // Init function if needed for consistency
    async init() {
        console.log('ApiService initialized');
    }
};
