// ============================
// 다국어 번역 데이터
// ============================

const translations = {
    ko: {
        // 헤더
        'header.title': '강한 매니저',
        'header.subtitle': 'AI 기반 교육 관리 시스템',
        'header.theme.light': '라이트 모드',
        'header.theme.dark': '다크 모드',
        'header.theme.instructor': '교관 모드',
        'header.language': '한국어',

        // 시스템 상태
        'system.standby': '시스템 대기중',
        'system.monitoring': '감독 진행중',

        // 제어 패널
        'control.title': '제어 패널',
        'control.conferenceUrl': '감독할 회의 URL',
        'control.start': '감독 시작',
        'control.stop': '감독 종료',
        'control.pause': '일시 정지',
        'control.emergency': '긴급 공지',

        // 통계
        'stats.total': '총 수강생',
        'stats.present': '출석',
        'stats.absent': '결석',
        'stats.warning': '경고',

        // AI 에이전트
        'agent.title': 'AI 에이전트 상태',
        'agent.admin': '운영 Agent',
        'agent.tutor': '학습 Agent',
        'agent.monitor': '감시 Agent',
        'agent.attendance': '출결 Agent',
        'agent.status.active': '활성',
        'agent.status.standby': '대기중',
        'agent.status.inactive': '비활성',
        'agent.desc.admin': '교육 Q&A, 공지사항, 일정 관리',
        'agent.desc.tutor': '수업 질의응답, 내용 요약',
        'agent.desc.monitor': '카메라 화면 감시, 경고 발송',
        'agent.desc.attendance': '출결 체크 및 정정 요청 관리',

        // 수강생 목록
        'student.title': '수강생 실시간 현황',
        'student.export': '출결현황 다운로드',
        'student.number': '번호',
        'student.name': '이름',
        'student.phone': '연락처',
        'student.isIn': '회의 참석',
        'student.isIn.true': '참여',
        'student.isIn.false': '미참여',
        'student.status': '상태',
        'student.camera': '카메라',
        'student.lastSeen': '마지막 확인',
        'student.warnings': '경고',
        'student.actions': '작업',
        'student.status.online': '출석',
        'student.status.away': '자리비움',
        'student.status.offline': '오프라인',
        'student.camera.on': '켜짐',
        'student.camera.off': '꺼짐',
        'student.warnings.count': '회',
        'student.warnings.none': '없음',
        'student.action.call': '전화 걸기',
        'student.action.message': '메시지 보내기',
        'student.action.alert': '알림 보내기',

        // 마지막 확인 시간
        'time.justnow': '방금 전',
        'time.minutesago': '분 전',
        'time.hoursago': '시간 전',
        'time.daysago': '일 전',

        // 활동 로그
        'log.type.info': '정보',
        'log.type.success': '성공',
        'log.type.warning': '경고',
        'log.type.error': '오류',

        // 월별 출석부
        'attendance.days': '일',
        'attendance.weekday.sun': '일',
        'attendance.weekday.mon': '월',
        'attendance.weekday.tue': '화',
        'attendance.weekday.wed': '수',
        'attendance.weekday.thu': '목',
        'attendance.weekday.fri': '금',
        'attendance.weekday.sat': '토',
        'attendance.status.present': '출석',
        'attendance.status.absent': '결석',
        'attendance.status.outing': '외출',
        'attendance.status.early': '조퇴',
        'attendance.status.late': '지각',
        'attendance.status.weekend': '-',
        'attendance.year': '년',
        'attendance.month': '월',
        'attendance.month': '월',

        // 로그 카테고리 (짧은 이름)
        'log.category.monitor': '감독',

        // 활동 로그 메시지
        'log.system.init': '강한 매니저 시스템이 초기화되었습니다.',
        'log.system.themeChanged': '테마가 {theme}(으)로 변경되었습니다.',
        'log.system.languageChanged': '언어가 {language}(으)로 변경되었습니다.',
        'log.monitoring.started': '감독이 시작되었습니다.',
        'log.monitoring.stopped': '감독이 종료되었습니다.',
        'log.monitoring.paused': '감독이 일시 정지되었습니다.',
        'log.emergency.sent': '전체 수강생에게 긴급 공지가 발송되었습니다.',
        'log.attendance.downloaded': '출결 현황을 엑셀 파일로 다운로드합니다.',
        'log.attendance.monthlyViewed': '{year}년 {month}월 출석부를 조회했습니다.',
        'log.attendance.monthlyDownloaded': '{month} 출석부를 다운로드했습니다.',
        'log.teams.loaded': 'Teams에서 예약된 수업 일정을 불러왔습니다.',
        'log.teams.refreshed': 'Teams 수업 일정을 새로고침했습니다.',
        'log.teams.scheduled': '\'{title}({time})\' 모임이 성공적으로 예약되었습니다.',
        'log.student.alert': '{name} 수강생에게 알림을 발송했습니다.',
        'log.student.call': '{name} 수강생({phone})에게 전화를 발신했습니다.',
        'log.student.message': '{name} 수강생({phone})에게 메시지를 발송했습니다.',
        'log.agent.adminResponse': '운영 Agent가 질문에 응답했습니다.',
        'log.agent.tutorSummary': '학습 Agent가 수업 내용을 요약했습니다.',
        'log.agent.attendanceUpdate': '출결 Agent가 출석 데이터를 업데이트했습니다.',
        'log.monitor.cameraOff': '{name} 수강생의 카메라가 꺼졌습니다.',
        'log.monitor.cameraOn': '{name} 수강생의 카메라가 켜졌습니다.',
        'log.monitor.away': '{name} 수강생이 자리를 비웠습니다. (경고 발송)',
        'log.monitor.returned': '{name} 수강생이 복귀했습니다.',

        // 활동 로그
        'log.title': '활동 로그',

        // Teams 미팅
        'meeting.title': '예약된 수업 일정',
        'meeting.refresh': '새로고침',
        'meeting.info': 'Teams에서 Power Automate로 예약된 수업 일정이 Microsoft Teams SDK를 통해 자동으로 불러와집니다.',
        'meeting.none': '예약된 수업이 없습니다.',
        'meeting.none.detail': 'Teams에서 Power Automate로 수업을 예약하면 자동으로 표시됩니다.',

        // 월별 출석부
        'attendance.title': '월별 출석부',
        'attendance.export': '월별 출석부 다운로드',
        'attendance.avgRate': '평균 출석률',
        'attendance.avgTime': '평균 출석시간률',
        'attendance.totalDays': '총 수업일수',
        'attendance.student': '수강생',
        'attendance.present': '출석',
        'attendance.absent': '결석',
        'attendance.outing': '외출',
        'attendance.early': '조퇴',
        'attendance.late': '지각',
        'attendance.rate': '출석률',
        'attendance.timeRate': '시간률',

        // 푸터
        'footer.copyright': '강한 매니저. AI 기반 교육 관리 시스템',
        'footer.version': 'Version 1.1.0'
    },

    en: {
        // Header
        'header.title': 'Strong Manager',
        'header.subtitle': 'AI-based Education Management System',
        'header.theme.light': 'Light Mode',
        'header.theme.dark': 'Dark Mode',
        'header.theme.instructor': 'Instructor Mode',
        'header.language': 'English',

        // System Status
        'system.standby': 'System Standby',
        'system.monitoring': 'Monitoring Active',

        // Control Panel
        'control.title': 'Control Panel',
        'control.conferenceUrl': 'Conference URL to Monitor',
        'control.start': 'Start Monitoring',
        'control.stop': 'Stop Monitoring',
        'control.pause': 'Pause',
        'control.emergency': 'Emergency Alert',

        // Statistics
        'stats.total': 'Total Students',
        'stats.present': 'Present',
        'stats.absent': 'Absent',
        'stats.warning': 'Warnings',

        // AI Agents
        'agent.title': 'AI Agent Status',
        'agent.admin': 'Admin Agent',
        'agent.tutor': 'Tutor Agent',
        'agent.monitor': 'Monitor Agent',
        'agent.attendance': 'Attendance Agent',
        'agent.status.active': 'Active',
        'agent.status.standby': 'Standby',
        'agent.status.inactive': 'Inactive',
        'agent.desc.admin': 'Education Q&A, Announcements, Schedule',
        'agent.desc.tutor': 'Class Q&A, Content Summary',
        'agent.desc.monitor': 'Camera Monitoring, Alert Sending',
        'agent.desc.attendance': 'Attendance Check & Correction',

        // Student List
        'student.title': 'Real-time Student Status',
        'student.export': 'Download Attendance',
        'student.number': 'No.',
        'student.name': 'Name',
        'student.phone': 'Phone',
        'student.status': 'Status',
        'student.camera': 'Camera',
        'student.lastSeen': 'Last Seen',
        'student.warnings': 'Warnings',
        'student.actions': 'Actions',
        'student.status.online': 'Online',
        'student.status.away': 'Away',
        'student.status.offline': 'Offline',
        'student.camera.on': 'On',
        'student.camera.off': 'Off',
        'student.warnings.count': ' time(s)',
        'student.warnings.none': 'None',
        'student.action.call': 'Call',
        'student.action.message': 'Message',
        'student.action.alert': 'Alert',

        // Last Seen Time
        'time.justnow': 'Just now',
        'time.minutesago': ' min ago',
        'time.hoursago': ' hours ago',
        'time.daysago': ' days ago',

        // Activity Log
        'log.type.info': 'Info',
        'log.type.success': 'Success',
        'log.type.warning': 'Warning',
        'log.type.error': 'Error',

        // Monthly Attendance
        'attendance.days': ' days',
        'attendance.weekday.sun': 'Sun',
        'attendance.weekday.mon': 'Mon',
        'attendance.weekday.tue': 'Tue',
        'attendance.weekday.wed': 'Wed',
        'attendance.weekday.thu': 'Thu',
        'attendance.weekday.fri': 'Fri',
        'attendance.weekday.sat': 'Sat',
        'attendance.status.present': 'Pres',
        'attendance.status.absent': 'Abs',
        'attendance.status.outing': 'Out',
        'attendance.status.early': 'Early',
        'attendance.status.late': 'Late',
        'attendance.status.weekend': '-',
        'attendance.year': ' ',
        'attendance.month': ' ',
        'attendance.month': ' ',

        // Log Category (Short)
        'log.category.monitor': 'Monitor',

        // Activity Log Messages
        'log.system.init': 'Strong Manager system has been initialized.',
        'log.system.themeChanged': 'Theme changed to {theme}.',
        'log.system.languageChanged': 'Language changed to {language}.',
        'log.monitoring.started': 'Monitoring has started.',
        'log.monitoring.stopped': 'Monitoring has stopped.',
        'log.monitoring.paused': 'Monitoring has been paused.',
        'log.emergency.sent': 'Emergency notification sent to all students.',
        'log.attendance.downloaded': 'Downloading attendance status to Excel file.',
        'log.attendance.monthlyViewed': 'Viewed {month} {year} attendance sheet.',
        'log.attendance.monthlyDownloaded': 'Downloaded {month} attendance sheet.',
        'log.teams.loaded': 'Loaded scheduled classes from Teams.',
        'log.teams.refreshed': 'Refreshed Teams class schedule.',
        'log.teams.scheduled': '\'{title}({time})\' meeting has been successfully scheduled.',
        'log.student.alert': 'Alert sent to {name}.',
        'log.student.call': 'Called {name} ({phone}).',
        'log.student.message': 'Message sent to {name} ({phone}).',
        'log.agent.adminResponse': 'Admin Agent responded to a question.',
        'log.agent.tutorSummary': 'Tutor Agent summarized class content.',
        'log.agent.attendanceUpdate': 'Attendance Agent updated attendance data.',
        'log.monitor.cameraOff': '{name}\'s camera turned off.',
        'log.monitor.cameraOn': '{name}\'s camera turned on.',
        'log.monitor.away': '{name} is away. (Warning sent)',
        'log.monitor.returned': '{name} has returned.',

        // Activity Log
        'log.title': 'Activity Log',

        // Teams Meeting
        'meeting.title': 'Scheduled Classes',
        'meeting.refresh': 'Refresh',
        'meeting.info': 'Class schedules from Teams Power Automate are automatically synced via Microsoft Teams SDK.',
        'meeting.none': 'No scheduled classes.',
        'meeting.none.detail': 'Schedule classes in Teams with Power Automate to display them here.',

        // Monthly Attendance
        'attendance.title': 'Monthly Attendance',
        'attendance.export': 'Download Monthly Attendance',
        'attendance.avgRate': 'Avg Attendance Rate',
        'attendance.avgTime': 'Avg Time Rate',
        'attendance.totalDays': 'Total Class Days',
        'attendance.student': 'Student',
        'attendance.present': 'Present',
        'attendance.absent': 'Absent',
        'attendance.outing': 'Outing',
        'attendance.early': 'Early Leave',
        'attendance.late': 'Late',
        'attendance.rate': 'Rate',
        'attendance.timeRate': 'Time Rate',

        // Footer
        'footer.copyright': 'Strong Manager. AI-based Education Management System',
        'footer.version': 'Version 1.1.0'
    },

    ja: {
        // ヘッダー
        'header.title': 'ストロングマネージャー',
        'header.subtitle': 'AI基盤教育管理システム',
        'header.theme.light': 'ライトモード',
        'header.theme.dark': 'ダークモード',
        'header.theme.instructor': 'インストラクターモード',
        'header.language': '日本語',

        // システム状態
        'system.standby': 'システム待機中',
        'system.monitoring': '監視実行中',

        // コントロールパネル
        'control.title': 'コントロールパネル',
        'control.conferenceUrl': '監視する会議URL',
        'control.start': '監視開始',
        'control.stop': '監視終了',
        'control.pause': '一時停止',
        'control.emergency': '緊急通知',

        // 統計
        'stats.total': '総受講生',
        'stats.present': '出席',
        'stats.absent': '欠席',
        'stats.warning': '警告',

        // AIエージェント
        'agent.title': 'AIエージェント状態',
        'agent.admin': '運営エージェント',
        'agent.tutor': '学習エージェント',
        'agent.monitor': '監視エージェント',
        'agent.attendance': '出席エージェント',
        'agent.status.active': 'アクティブ',
        'agent.status.standby': '待機中',
        'agent.status.inactive': '非アクティブ',
        'agent.desc.admin': '教育Q&A、お知らせ、スケジュール管理',
        'agent.desc.tutor': '授業Q&A、内容要約',
        'agent.desc.monitor': 'カメラ監視、警告送信',
        'agent.desc.attendance': '出席確認および修正リクエスト管理',

        // 受講生リスト
        'student.title': '受講生リアルタイム状況',
        'student.export': '出席状況ダウンロード',
        'student.number': '番号',
        'student.name': '名前',
        'student.phone': '連絡先',
        'student.status': '状態',
        'student.camera': 'カメラ',
        'student.lastSeen': '最終確認',
        'student.warnings': '警告',
        'student.actions': '作業',
        'student.status.online': '出席',
        'student.status.away': '離席中',
        'student.status.offline': 'オフライン',
        'student.camera.on': 'オン',
        'student.camera.off': 'オフ',
        'student.warnings.count': '回',
        'student.warnings.none': 'なし',
        'student.action.call': '電話をかける',
        'student.action.message': 'メッセージを送る',
        'student.action.alert': '通知を送る',

        // 最終確認時間
        'time.justnow': 'たった今',
        'time.minutesago': '分前',
        'time.hoursago': '時間前',
        'time.daysago': '日前',

        // アクティビティログ
        'log.type.info': '情報',
        'log.type.success': '成功',
        'log.type.warning': '警告',
        'log.type.error': 'エラー',

        // 月別出席簿
        'attendance.days': '日',
        'attendance.weekday.sun': '日',
        'attendance.weekday.mon': '月',
        'attendance.weekday.tue': '火',
        'attendance.weekday.wed': '水',
        'attendance.weekday.thu': '木',
        'attendance.weekday.fri': '金',
        'attendance.weekday.sat': '土',
        'attendance.status.present': '出席',
        'attendance.status.absent': '欠席',
        'attendance.status.outing': '外出',
        'attendance.status.early': '早退',
        'attendance.status.late': '遅刻',
        'attendance.status.weekend': '-',
        'attendance.year': '年',
        'attendance.month': '月',

        // アクティビティログメッセージ
        'log.system.init': 'ストロングマネージャーシステムが初期化されました。',
        'log.system.themeChanged': 'テーマが{theme}に変更されました。',
        'log.system.languageChanged': '言語が{language}に変更されました。',
        'log.monitoring.started': '監視が開始されました。',
        'log.monitoring.stopped': '監視が終了されました。',
        'log.monitoring.paused': '監視が一時停止されました。',
        'log.emergency.sent': '全受講生に緊急通知が送信されました。',
        'log.attendance.downloaded': '出席状況をExcelファイルにダウンロードします。',
        'log.attendance.monthlyViewed': '{year}年{month}月の出席簿を閲覧しました。',
        'log.attendance.monthlyDownloaded': '{month}月の出席簿をダウンロードしました。',
        'log.teams.loaded': 'Teamsから予約された授業スケジュールを読み込みました。',
        'log.teams.refreshed': 'Teams授業スケジュールを更新しました。',
        'log.teams.scheduled': '\'{title}({time})\' ミーティングが正常に予約されました。',
        'log.student.alert': '{name}受講生に通知を送信しました。',
        'log.student.call': '{name}受講生({phone})に電話をかけました。',
        'log.student.message': '{name}受講生({phone})にメッセージを送信しました。',
        'log.agent.adminResponse': '運営エージェントが質問に応答しました。',
        'log.agent.tutorSummary': '学習エージェントが授業内容を要約しました。',
        'log.agent.attendanceUpdate': '出席エージェントが出席データを更新しました。',
        'log.monitor.cameraOff': '{name}受講生のカメラがオフになりました。',
        'log.monitor.cameraOn': '{name}受講生のカメラがオンになりました。',
        'log.monitor.away': '{name}受講生が離席しました。(警告送信)',
        'log.monitor.returned': '{name}受講生が戻りました。',

        // アクティビティログ
        'log.title': 'アクティビティログ',

        // Teamsミーティング
        'meeting.title': '予約された授業スケジュール',
        'meeting.refresh': '更新',
        'meeting.info': 'Teams Power Automateで予約された授業スケジュールがMicrosoft Teams SDKを通じて自動的に読み込まれます。',
        'meeting.none': '予約された授業はありません。',
        'meeting.none.detail': 'TeamsでPower Automateを使用して授業を予約すると自動的に表示されます。',

        // 月別出席簿
        'attendance.title': '月別出席簿',
        'attendance.export': '月別出席簿ダウンロード',
        'attendance.avgRate': '平均出席率',
        'attendance.avgTime': '平均出席時間率',
        'attendance.totalDays': '総授業日数',
        'attendance.student': '受講生',
        'attendance.present': '出席',
        'attendance.absent': '欠席',
        'attendance.outing': '外出',
        'attendance.early': '早退',
        'attendance.late': '遅刻',
        'attendance.rate': '出席率',
        'attendance.timeRate': '時間率',

        // フッター
        'footer.copyright': 'ストロングマネージャー。AI基盤教育管理システム',
        'footer.version': 'バージョン 1.1.0'
    },

    zh: {
        // 页眉
        'header.title': '强大管理器',
        'header.subtitle': '基于AI的教育管理系统',
        'header.theme.light': '浅色模式',
        'header.theme.dark': '深色模式',
        'header.theme.instructor': '教官模式',
        'header.language': '中文',

        // 系统状态
        'system.standby': '系统待机中',
        'system.monitoring': '监督进行中',

        // 控制面板
        'control.title': '控制面板',
        'control.conferenceUrl': '要监控的会议URL',
        'control.start': '开始监督',
        'control.stop': '停止监督',
        'control.pause': '暂停',
        'control.emergency': '紧急通知',

        // 统计
        'stats.total': '总学生数',
        'stats.present': '出席',
        'stats.absent': '缺席',
        'stats.warning': '警告',

        // AI代理
        'agent.title': 'AI代理状态',
        'agent.admin': '运营代理',
        'agent.tutor': '学习代理',
        'agent.monitor': '监控代理',
        'agent.attendance': '考勤代理',
        'agent.status.active': '活动',
        'agent.status.standby': '待机中',
        'agent.status.inactive': '非活动',
        'agent.desc.admin': '教育问答、公告、日程管理',
        'agent.desc.tutor': '课堂问答、内容总结',
        'agent.desc.monitor': '摄像头监控、警告发送',
        'agent.desc.attendance': '考勤检查及更正请求管理',

        // 学生列表
        'student.title': '学生实时状态',
        'student.export': '下载考勤状态',
        'student.number': '编号',
        'student.name': '姓名',
        'student.phone': '联系方式',
        'student.status': '状态',
        'student.camera': '摄像头',
        'student.lastSeen': '最后确认',
        'student.warnings': '警告',
        'student.actions': '操作',
        'student.status.online': '在线',
        'student.status.away': '离开',
        'student.status.offline': '离线',
        'student.camera.on': '开启',
        'student.camera.off': '关闭',
        'student.warnings.count': '次',
        'student.warnings.none': '无',
        'student.action.call': '拨打电话',
        'student.action.message': '发送消息',
        'student.action.alert': '发送通知',

        // 最后确认时间
        'time.justnow': '刚刚',
        'time.minutesago': '分钟前',
        'time.hoursago': '小时前',
        'time.daysago': '天前',

        // 活动日志
        'log.type.info': '信息',
        'log.type.success': '成功',
        'log.type.warning': '警告',
        'log.type.error': '错误',

        // 月度考勤表
        'attendance.days': '天',
        'attendance.weekday.sun': '日',
        'attendance.weekday.mon': '一',
        'attendance.weekday.tue': '二',
        'attendance.weekday.wed': '三',
        'attendance.weekday.thu': '四',
        'attendance.weekday.fri': '五',
        'attendance.weekday.sat': '六',
        'attendance.status.present': '出席',
        'attendance.status.absent': '缺席',
        'attendance.status.outing': '外出',
        'attendance.status.early': '早退',
        'attendance.status.late': '迟到',
        'attendance.status.weekend': '-',
        'attendance.year': '年',
        'attendance.month': '月',

        // 活动日志消息
        'log.system.init': '强大管理器系统已初始化。',
        'log.system.themeChanged': '主题已更改为{theme}。',
        'log.system.languageChanged': '语言已更改为{language}。',
        'log.monitoring.started': '监督已开始。',
        'log.monitoring.stopped': '监督已停止。',
        'log.monitoring.paused': '监督已暂停。',
        'log.emergency.sent': '紧急通知已发送给所有学生。',
        'log.attendance.downloaded': '正在下载考勤状态到Excel文件。',
        'log.attendance.monthlyViewed': '已查看{year}年{month}月考勤表。',
        'log.attendance.monthlyDownloaded': '已下载{month}月考勤表。',
        'log.teams.loaded': '已从Teams加载预约的课程日程。',
        'log.teams.refreshed': '已刷新Teams课程日程。',
        'log.teams.scheduled': '\'{title}({time})\' 会议已成功预约。',
        'log.student.alert': '已向{name}发送通知。',
        'log.student.call': '已致电{name} ({phone})。',
        'log.student.message': '已向{name} ({phone})发送消息。',
        'log.agent.adminResponse': '运营Agent已回答问题。',
        'log.agent.tutorSummary': '学习Agent已总结课程内容。',
        'log.agent.attendanceUpdate': '出勤Agent已更新出勤数据。',
        'log.monitor.cameraOff': '{name}的摄像头已关闭。',
        'log.monitor.cameraOn': '{name}的摄像头已打开。',
        'log.monitor.away': '{name}已离开座位。(已发送警告)',
        'log.monitor.returned': '{name}已返回。',

        // 活动日志
        'log.title': '活动日志',

        // Teams会议
        'meeting.title': '预约的课程日程',
        'meeting.refresh': '刷新',
        'meeting.info': '通过Microsoft Teams SDK自动加载Teams Power Automate预约的课程日程。',
        'meeting.none': '没有预约的课程。',
        'meeting.none.detail': '在Teams中使用Power Automate预约课程后将自动显示。',

        // 月度考勤表
        'attendance.title': '月度考勤表',
        'attendance.export': '下载月度考勤表',
        'attendance.avgRate': '平均出勤率',
        'attendance.avgTime': '平均出勤时间率',
        'attendance.totalDays': '总上课天数',
        'attendance.student': '学生',
        'attendance.present': '出席',
        'attendance.absent': '缺席',
        'attendance.outing': '外出',
        'attendance.early': '早退',
        'attendance.late': '迟到',
        'attendance.rate': '出勤率',
        'attendance.timeRate': '时间率',

        // 页脚
        'footer.copyright': '强大管理器。基于AI的教育管理系统',
        'footer.version': '版本 1.1.0'
    },

    ar: {
        // الرأس
        'header.title': 'مدير قوي',
        'header.subtitle': 'نظام إدارة التعليم القائم على الذكاء الاصطناعي',
        'header.theme.light': 'الوضع الفاتح',
        'header.theme.dark': 'الوضع الداكن',
        'header.theme.instructor': 'وضع المدرب',
        'header.language': 'العربية',

        // حالة النظام
        'system.standby': 'النظام في وضع الاستعداد',
        'system.monitoring': 'المراقبة نشطة',

        // لوحة التحكم
        'control.title': 'لوحة التحكم',
        'control.conferenceUrl': 'URL الاجتماع للمراقبة',
        'control.start': 'بدء المراقبة',
        'control.stop': 'إيقاف المراقبة',
        'control.pause': 'إيقاف مؤقت',
        'control.emergency': 'تنبيه طارئ',

        // الإحصائيات
        'stats.total': 'إجمالي الطلاب',
        'stats.present': 'حاضر',
        'stats.absent': 'غائب',
        'stats.warning': 'تحذيرات',

        // وكلاء الذكاء الاصطناعي
        'agent.title': 'حالة وكيل الذكاء الاصطناعي',
        'agent.admin': 'وكيل الإدارة',
        'agent.tutor': 'وكيل التعلم',
        'agent.monitor': 'وكيل المراقبة',
        'agent.attendance': 'وكيل الحضور',
        'agent.status.active': 'نشط',
        'agent.status.standby': 'في الانتظار',
        'agent.status.inactive': 'غير نشط',
        'agent.desc.admin': 'أسئلة وأجوبة التعليم، الإعلانات، إدارة الجدول',
        'agent.desc.tutor': 'أسئلة وأجوبة الفصل، ملخص المحتوى',
        'agent.desc.monitor': 'مراقبة الكاميرا، إرسال التنبيهات',
        'agent.desc.attendance': 'فحص الحضور وإدارة طلبات التصحيح',

        // قائمة الطلاب
        'student.title': 'حالة الطالب في الوقت الفعلي',
        'student.export': 'تنزيل الحضور',
        'student.number': 'رقم',
        'student.name': 'الاسم',
        'student.phone': 'الهاتف',
        'student.status': 'الحالة',
        'student.camera': 'الكاميرا',
        'student.lastSeen': 'آخر ظهور',
        'student.warnings': 'التحذيرات',
        'student.actions': 'الإجراءات',
        'student.status.online': 'متصل',
        'student.status.away': 'بعيد',
        'student.status.offline': 'غير متصل',
        'student.camera.on': 'تشغيل',
        'student.camera.off': 'إيقاف',
        'student.warnings.count': ' مرة',
        'student.warnings.none': 'لا يوجد',
        'student.action.call': 'اتصال',
        'student.action.message': 'رسالة',
        'student.action.alert': 'تنبيه',

        // وقت آخر ظهور
        'time.justnow': 'الآن',
        'time.minutesago': ' دقيقة مضت',
        'time.hoursago': ' ساعة مضت',
        'time.daysago': ' يوم مضى',

        // سجل النشاط
        'log.type.info': 'معلومات',
        'log.type.success': 'نجاح',
        'log.type.warning': 'تحذير',
        'log.type.error': 'خطأ',

        // الحضور الشهري
        'attendance.days': ' أيام',
        'attendance.weekday.sun': 'الأحد',
        'attendance.weekday.mon': 'الاثنين',
        'attendance.weekday.tue': 'الثلاثاء',
        'attendance.weekday.wed': 'الأربعاء',
        'attendance.weekday.thu': 'الخميس',
        'attendance.weekday.fri': 'الجمعة',
        'attendance.weekday.sat': 'السبت',
        'attendance.status.present': 'حاضر',
        'attendance.status.absent': 'غائب',
        'attendance.status.outing': 'خارج',
        'attendance.status.early': 'مبكر',
        'attendance.status.late': 'متأخر',
        'attendance.status.weekend': '-',
        'attendance.year': ' ',
        'attendance.month': ' ',

        // رسائل سجل النشاط
        'log.system.init': 'تم تهيئة نظام المدير القوي.',
        'log.system.themeChanged': 'تم تغيير السمة إلى {theme}.',
        'log.system.languageChanged': 'تم تغيير اللغة إلى {language}.',
        'log.monitoring.started': 'بدأت المراقبة.',
        'log.monitoring.stopped': 'توقفت المراقبة.',
        'log.monitoring.paused': 'تم إيقاف المراقبة مؤقتًا.',
        'log.emergency.sent': 'تم إرسال إشعار طارئ لجميع الطلاب.',
        'log.attendance.downloaded': 'تنزيل حالة الحضور إلى ملف Excel.',
        'log.attendance.monthlyViewed': 'تم عرض ورقة الحضور {month} {year}.',
        'log.attendance.monthlyDownloaded': 'تم تنزيل ورقة الحضور {month}.',
        'log.teams.loaded': 'تم تحميل الفصول المجدولة من Teams.',
        'log.teams.refreshed': 'تم تحديث جدول فصول Teams.',
        'log.teams.scheduled': 'تم جدولة الاجتماع \'{title}({time})\' بنجاح.',
        'log.student.alert': 'تم إرسال تنبيه إلى {name}.',
        'log.student.call': 'تم الاتصال بـ {name} ({phone}).',
        'log.student.message': 'تم إرسال رسالة إلى {name} ({phone}).',
        'log.agent.adminResponse': 'استجاب وكيل الإدارة للسؤال.',
        'log.agent.tutorSummary': 'لخص وكيل التعلم محتوى الفصل.',
        'log.agent.attendanceUpdate': 'قام وكيل الحضور بتحديث بيانات الحضور.',
        'log.monitor.cameraOff': 'تم إيقاف كاميرا {name}.',
        'log.monitor.cameraOn': 'تم تشغيل كاميرا {name}.',
        'log.monitor.away': '{name} غائب. (تم إرسال تحذير)',
        'log.monitor.returned': '{name} قد عاد.',

        // سجل النشاط
        'log.title': 'سجل النشاط',

        // اجتماع Teams
        'meeting.title': 'الفصول المجدولة',
        'meeting.refresh': 'تحديث',
        'meeting.info': 'يتم مزامنة جداول الفصول من Teams Power Automate تلقائيًا عبر Microsoft Teams SDK.',
        'meeting.none': 'لا توجد فصول مجدولة.',
        'meeting.none.detail': 'قم بجدولة الفصول في Teams باستخدام Power Automate لعرضها هنا.',

        // الحضور الشهري
        'attendance.title': 'الحضور الشهري',
        'attendance.export': 'تنزيل الحضور الشهري',
        'attendance.avgRate': 'متوسط معدل الحضور',
        'attendance.avgTime': 'متوسط معدل الوقت',
        'attendance.totalDays': 'إجمالي أيام الفصل',
        'attendance.student': 'الطالب',
        'attendance.present': 'حاضر',
        'attendance.absent': 'غائب',
        'attendance.outing': 'خارج',
        'attendance.early': 'مغادرة مبكرة',
        'attendance.late': 'متأخر',
        'attendance.rate': 'المعدل',
        'attendance.timeRate': 'معدل الوقت',

        // التذييل
        'footer.copyright': 'مدير قوي. نظام إدارة التعليم القائم على الذكاء الاصطناعي',
        'footer.version': 'الإصدار 1.1.0'
    }
};

// 현재 언어
let currentLanguage = 'ko';

// 언어 이름 매핑
const languageNames = {
    'ko': '한국어',
    'en': 'English',
    'ja': '日本語',
    'zh': '中文',
    'ar': 'العربية'
};

// 번역 함수
function translate(key, lang = currentLanguage, params = {}) {
    let text = translations[lang]?.[key] || translations['ko'][key] || key;

    // 변수 치환 (예: {name}, {phone} 등)
    Object.keys(params).forEach(paramKey => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });

    return text;
}

// 페이지 전체 번역 적용
function applyTranslations(lang) {
    currentLanguage = lang;

    // data-i18n 속성을 가진 모든 요소 번역
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translate(key, lang);
    });

    // 언어 라벨 업데이트
    const currentLangElem = document.getElementById('currentLanguage');
    if (currentLangElem) {
        currentLangElem.textContent = languageNames[lang];
    }

    // LocalStorage에 저장
    localStorage.setItem('language', lang);

    // 동적 콘텐츠 다시 렌더링 (모듈화로 인해 전역 함수가 아닐 수 있음 - 이벤트 디스패치로 변경 권장)
    // Legacy 호환성을 위해 유지하되, 안전하게 체크
    if (typeof renderStudentTable === 'function') renderStudentTable();
    if (typeof renderScheduledMeetings === 'function') renderScheduledMeetings();
    if (typeof renderMonthlyAttendance === 'function') renderMonthlyAttendance();
    if (typeof updateMonthlyStats === 'function') updateMonthlyStats();
    if (typeof populateMonthSelector === 'function') populateMonthSelector();
    if (typeof renderActivityLog === 'function') renderActivityLog();
    if (typeof updateAgentDescriptions === 'function') updateAgentDescriptions();

    // 모듈화된 환경을 위한 이벤트 발생
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// 전역 객체에 노출 (모듈에서 접근 가능하도록)
window.translate = translate;
window.applyTranslations = applyTranslations;
