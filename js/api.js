// API Configuration
export const API_CONFIG = {
    BASE_URL: '/api', // Azure Static Web App defaults to /api for managed functions
    MOCK_MODE: false   // Set to false when backend is ready
};

// Mock Data (matches the approved JSON structure)
const MOCK_DATA = {
    students: [
        {
            id: 1,
            num: '8ai001',
            name: '엄태홍',
            phone: '010-1234-5678',
            status: 'online',
            camera: true,
            face_detected: true,
            last_seen: new Date().toISOString(),
            warnings: 0
        },
        {
            id: 2,
            num: '8ai002',
            name: '권순우',
            phone: '010-2345-6789',
            status: 'online',
            camera: true,
            face_detected: true,
            last_seen: new Date().toISOString(),
            warnings: 0
        },
        {
            id: 3,
            num: '8ai003',
            name: 'Sammy',
            phone: '010-8901-2345',
            status: 'away',
            camera: false,
            face_detected: false,
            last_seen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            warnings: 1
        }
    ],
    meetings: [
        {
            id: 101,
            title: 'Python 기초 강의',
            start_time: '2025-12-30T09:00:00Z',
            end_time: '2025-12-30T12:00:00Z',
            status: 'active'
        },
        {
            id: 102,
            title: 'AI 알고리즘 실습',
            start_time: '2025-12-30T13:00:00Z',
            end_time: '2025-12-30T17:00:00Z',
            status: 'scheduled'
        }
    ]
};

// API Service
export const apiService = {
    // Merge incoming partial data with existing full data
    mergeStudentData(currentStudents, incomingData) {
        if (!currentStudents || currentStudents.length === 0) return this._processStudentData(incomingData);

        return incomingData.map(incoming => {
            // Find existing record by ID (preferred) or Name
            const existing = currentStudents.find(c =>
                (incoming.id && c.id === incoming.id) ||
                (c.name === incoming.name)
            );

            if (existing) {
                // Merge: Existing data + Incoming updates
                // Incoming takes precedence for shared keys
                // Also re-process specific fields like last_seen if needed
                const merged = { ...existing, ...incoming };

                // Re-process last_seen for UI display if it's in the incoming data
                if (incoming.last_seen) {
                    const lastSeenDate = new Date(incoming.last_seen);
                    const now = new Date();
                    const diffMinutes = Math.floor((now - lastSeenDate) / 60000);

                    merged.lastSeenKey = diffMinutes < 1 ? 'justnow' :
                        diffMinutes < 60 ? 'minutesago' :
                            diffMinutes < 1440 ? 'hoursago' : 'daysago';
                    merged.lastSeenValue = diffMinutes < 1 ? '' :
                        diffMinutes < 60 ? diffMinutes :
                            diffMinutes < 1440 ? Math.floor(diffMinutes / 60) : Math.floor(diffMinutes / 1440);
                }
                return merged;
            }

            // New student found in incoming data
            return this._processStudentData([incoming])[0];
        });
    },

    // Process student data for UI
    _processStudentData(students) {
        return students.map(student => {
            const now = new Date();
            const lastSeen = new Date(student.last_seen);
            const diffMs = now - lastSeen;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let lastSeenKey = 'justnow';
            let lastSeenValue = 0;

            if (diffDays > 0) {
                lastSeenKey = 'days';
                lastSeenValue = diffDays;
            } else if (diffHours > 0) {
                lastSeenKey = 'hours';
                lastSeenValue = diffHours;
            } else if (diffMins > 0) {
                lastSeenKey = 'minutes';
                lastSeenValue = diffMins;
            }

            return {
                ...student,
                lastSeenKey,
                lastSeenValue
            };
        });
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
