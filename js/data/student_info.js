window.STUDENT_INFO = [
    { num: '8ai007', name: '권순우', phone: '010-1111-1111' },
    { num: '8ai018', name: '문소라', phone: '010-2222-2222' },
    { num: '8ai028', name: '엄태홍', phone: '010-3333-3333' },
    { num: '8ai031', name: '이동현', phone: '010-4444-4444' },
    { num: '8ai037', name: '이재균', phone: '010-5555-5555' },
    { num: '8ai046', name: '정찬희', phone: '010-6666-6666' }
];

window.UNKNOWN_STUDENT = {
    num: '8ai000',
    phone: '010-0000-0000'
};

window.getStudentInfo = function (name) {
    return window.STUDENT_INFO.find(s => s.name === name) || { ...window.UNKNOWN_STUDENT, name };
};
