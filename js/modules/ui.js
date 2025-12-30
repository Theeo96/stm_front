(function () {
    window.UI = {};
    window.isUiInitialized = false;

    window.UI.init = function () {
        initializeLanguage();
        initializeTheme();
        setupEventListeners();
        window.UI.setUiInitialized();
    };

    function setupEventListeners() {
        // 테마 전환 버튼
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.removeEventListener('click', toggleTheme); // Prevent duplicate
            themeToggle.addEventListener('click', toggleTheme);
        }

        // 언어 전환 버튼
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.removeEventListener('click', toggleLanguageDropdown);
            languageToggle.addEventListener('click', toggleLanguageDropdown);
        }

        // 언어 옵션 클릭
        document.querySelectorAll('.language-option').forEach(option => {
            // Need a named function to remove, but anonymous is hard. 
            // Just assume init runs once or clear via cloning (destructive).
            // Proceeding with simple add for now.
            option.addEventListener('click', function () {
                const lang = this.getAttribute('data-lang');
                window.selectLanguage(lang);
            });
        });

        // 드롭다운 외부 클릭
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.language-selector-container')) {
                const dropdown = document.getElementById('languageDropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }

    function initializeLanguage() {
        const savedLang = localStorage.getItem('language') || 'ko';
        window.selectLanguage(savedLang);
    }

    function toggleLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) dropdown.classList.toggle('show');
    }

    window.selectLanguage = function (lang) {
        if (window.applyTranslations) window.applyTranslations(lang);

        localStorage.setItem('language', lang);
        updateActiveLanguage(lang);

        if (window.isUiInitialized) {
            const langNames = { 'ko': '한국어', 'en': 'English', 'ja': '日本語', 'zh': '中文', 'ar': 'العربية' };
            const langName = langNames[lang] || lang;
            if (window.Logging) {
                const t = window.translate || ((k) => k);
                window.Logging.addActivityLog(t('log.type.info') || '정보', `[시스템] ${t('log.system.languageChanged', lang, { language: langName }) || 'Language changed'}`, 'info');
            }
        }

        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) dropdown.classList.remove('show');

        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    };

    function updateActiveLanguage(lang) {
        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            }
        });

        const currentLangSpan = document.getElementById('currentLanguage');
        const langNames = { 'ko': '한국어', 'en': 'English', 'ja': '日本語', 'zh': '中文', 'ar': 'العربية' };
        if (currentLangSpan) currentLangSpan.textContent = langNames[lang] || '한국어';
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (window.Store && window.Store.state) {
            window.Store.state.currentTheme = savedTheme;
        }
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        const body = document.body;
        body.classList.remove('dark-mode', 'instructor-mode');

        switch (theme) {
            case 'dark':
                body.classList.add('dark-mode');
                break;
            case 'instructor':
                body.classList.add('instructor-mode');
                break;
        }

        if (window.Store && window.Store.state) {
            window.Store.state.currentTheme = theme;
        }
        localStorage.setItem('theme', theme);
        window.UI.updateThemeLabel();

        if (window.isUiInitialized && window.Logging) {
            window.Logging.addActivityLog('정보', `[시스템] 테마가 ${theme}로 변경되었습니다.`, 'info');
        }
    }

    function toggleTheme() {
        const currentTheme = (window.Store && window.Store.state) ? window.Store.state.currentTheme : 'light';
        const themeOrder = ['light', 'dark', 'instructor'];
        const currentIndex = themeOrder.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];

        applyTheme(nextTheme);
    }

    window.UI.updateThemeLabel = function () {
        const themeLabel = document.getElementById('themeLabel');
        if (!themeLabel) return;

        const currentTheme = (window.Store && window.Store.state) ? window.Store.state.currentTheme : 'light';
        const key = `header.theme.${currentTheme}`;

        if (window.translate) {
            themeLabel.textContent = window.translate(key);
        }
    };

    window.UI.setUiInitialized = function () {
        window.isUiInitialized = true;
    };
})();
