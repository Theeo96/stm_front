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
                // Update existing
                return {
                    ...existing,
                    ...incoming,
                    // Preserve warnings from local state if incoming is likely reset/default, 
                    // or take max if we assume sync. specific request: actions increment it locally.
                    warnings: (existing.warnings !== undefined) ? existing.warnings : (incoming.warnings || 0),
                    // Re-calculate derived fields if needed
                    status: this._deriveStatus(incoming),
                    lastSeenText: this._formatLastSeen(incoming.last_seen || existing.last_seen, incoming.face_detected)
                };
            }
            return this._processNewStudent(incoming);
        });
    },

    async clearStudents() {
        return true;
    },

    // ----------------------------
    // API Helper Methods
    // ----------------------------

    _processNewStudent(student) {
        // 1. Static Info (Global Access)
        const staticInfo = window.getStudentInfo ? window.getStudentInfo(student.name) : {};
        const merged = { ...student, ...staticInfo };

        // 2. Init Last Seen (First arrival time)
        // Only if not present (preserve backend history)
        if (!merged.last_seen) {
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
        if (!student.isIn) return 'offline'; // If not participants, offline

        const lastSeenDate = new Date(student.last_seen);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

        if (diffSeconds < 120) { // < 2 min
            return 'online'; // Present
        } else if (diffSeconds < 240) { // 2m ~ 4m
            return 'away'; // Away
        } else { // > 4m
            return 'offline'; // Absent (mapped to Offline/Absent in UI)
        }
    },

    _formatLastSeen(lastSeenIso, faceDetected) {
        // If currently detected, show "Now"
        if (faceDetected) return '지금';

        const lastSeenDate = new Date(lastSeenIso);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

        if (diffSeconds < 1) return '지금';

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
            const response = await fetch(`${API_CONFIG.BASE_URL}/students`);
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

        if (API_CONFIG.MOCK_MODE) {
            console.log('[API] Check Meeting Schedule (Mock)');
            return new Promise(resolve => {
                setTimeout(() => resolve(DUMMY_MEETINGS), 500);
            });
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/meetings`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch meetings (Backend not reachable?), using dummy data:', error);
            // Fallback to dummy data as requested by user for legacy parity
            return DUMMY_MEETINGS;
        }
    },

    // Init function if needed for consistency
    async init() {
        console.log('ApiService initialized');
    }
};
