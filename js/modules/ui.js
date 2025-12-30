import { state } from '../store.js';

// ============================
// UI (테마, 언어) 관리
// ============================

export function init() {
    initializeLanguage();
    initializeTheme();
    setupEventListeners();
}

function setupEventListeners() {
    // 테마 전환 버튼
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 언어 전환 버튼
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguageDropdown);
    }

    // 언어 옵션 클릭
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');
            selectLanguage(lang);
        });
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.language-selector-container')) {
            const dropdown = document.getElementById('languageDropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });
}

// 언어 초기화
function initializeLanguage() {
    const savedLang = localStorage.getItem('language') || 'ko';
    selectLanguage(savedLang);
}

// 언어 드롭다운 토글
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
}

// 언어 선택 처리
function selectLanguage(lang) {
    if (window.applyTranslations) {
        window.applyTranslations(lang); // i18n.js 전역 함수 사용
    }

    localStorage.setItem('language', lang);
    updateActiveLanguage(lang);

    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

// 선택된 언어 UI 업데이트
function updateActiveLanguage(lang) {
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        }
    });

    const langText = document.getElementById('currentLang');
    if (langText) {
        const langNames = { 'ko': '한국어', 'en': 'English', 'ja': '日本語', 'zh': '中文', 'ar': 'العربية' };
        langText.textContent = langNames[lang] || 'Language';
    }
}

// 테마 초기화
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

// 테마 적용
function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('dark-mode', 'instructor-mode');

    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else if (theme === 'instructor') {
        body.classList.add('instructor-mode');
    }

    localStorage.setItem('theme', theme);
    state.currentTheme = theme;
    updateThemeLabel();
}

// 테마 토글
function toggleTheme() {
    let newTheme = 'light';
    if (state.currentTheme === 'light') newTheme = 'dark';
    else if (state.currentTheme === 'dark') newTheme = 'instructor';

    applyTheme(newTheme);
}

// 테마 라벨 업데이트
function updateThemeLabel() {
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.setAttribute('data-i18n', `header.theme.${state.currentTheme}`);
        // 다국어 적용 재호출 필요할 수 있음
        if (window.applyTranslations) {
            const currentLang = localStorage.getItem('language') || 'ko';
            window.applyTranslations(currentLang);
        }
    }
}
