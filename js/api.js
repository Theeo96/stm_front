import { getStudentInfo } from './data/student_info.js';

// API Configuration
export const API_CONFIG = {
    BASE_URL: '/api', // Azure Static Web App defaults to /api for managed functions
    MOCK_MODE: false   // Set to false when backend is ready
};

// ... (Mock Data omitted, looks handled by original file or I can keep it if I use multi-replace correctly. The tool asks for TargetContent) ...

// API Service
export const apiService = {
    // Merge incoming partial data with existing full data
    mergeStudentData(currentStudents, incomingData) {
        if (!incomingData) return currentStudents; // Safety check

        // If no current data, just process all as new
        if (!currentStudents || currentStudents.length === 0) {
            return incomingData.map(student => this._processNewStudent(student));
        }

        // Map existing students for easier lookup? Or just map incoming.
        // We need to return a NEW array of students.
        // We iterate INCOMING data to update/add.
        // BUT what if a student disconnects and is not in incoming?
        // The user didn't specify handling "disappeared" from JSON.
        // Usually we keep them list but maybe mark offline?
        // For now, let's assume we update based on JSON list.
        // If the JSON contains ALL active students, then we should probably map the JSON.

        return incomingData.map(incoming => {
            const existing = currentStudents.find(c =>
                (incoming.id && c.id === incoming.id) || (c.name === incoming.name)
            );

            if (existing) {
                // 1. Merge Static Info (always ensure it's up to date)
                const staticInfo = getStudentInfo(incoming.name);
                const merged = { ...existing, ...incoming, ...staticInfo };

                // 2. Conditional Last Seen Update
                // Update last_seen ONLY if face detected is TRUE
                if (incoming.face_detected) {
                    merged.last_seen = new Date().toISOString();
                }
                // If false, keep existing.last_seen (which is already in `merged` via `...existing`)

                // 3. Status Derivation (Time-based & participation)
                merged.status = this._deriveStatus(merged);

                // 4. Last Seen Text formatting
                merged.lastSeenText = this._formatLastSeen(merged.last_seen, merged.face_detected);

                // 5. Preserve Warnings (Local State)
                merged.warnings = existing.warnings !== undefined ? existing.warnings : 0;

                return merged;
            } else {
                // New Student
                return this._processNewStudent(incoming);
            }
        });
    },

    async clearStudents() {
        if (API_CONFIG.MOCK_MODE) {
            console.log('Mock Data Cleared');
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
        // 1. Static Info
        const staticInfo = getStudentInfo(student.name);
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
                const processed = this._processStudentData(MOCK_DATA.students);
                setTimeout(() => resolve(processed), 500);
            });
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/students`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return this._processStudentData(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            return [];
        }
    },

    // Fetch Meeting Schedule
    async fetchMeetings() {
        if (API_CONFIG.MOCK_MODE) {
            console.log('[API] Check Meeting Schedule (Mock)');
            return new Promise(resolve => {
                setTimeout(() => resolve(MOCK_DATA.meetings), 500);
            });
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/meetings`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
            return [];
        }
    }
};
