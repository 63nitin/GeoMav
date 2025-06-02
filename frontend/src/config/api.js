// API Configuration
export const API_URL = 'http://192.168.1.17:3000/api'; // Your computer's IP address

// API Endpoints
export const ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_ORGANIZATION: '/auth/register-organization',
    REGISTER_EMPLOYEE: '/admin/register-employee',
    
    // Attendance endpoints
    MARK_ATTENDANCE: '/attendance/mark',
    ATTENDANCE_HISTORY: '/attendance/attendance-history',
    
    // Organization endpoints
    ORGANIZATION_DETAILS: '/organization',
    
    // Admin endpoints
    ORGANIZATION_EMPLOYEES: '/admin/employees',
    EMPLOYEE_ATTENDANCE: '/admin/employee-attendance',
    
    // User endpoints
    USER_DETAILS: '/user/details'
};

// Example:
// export const API_URL = 'http://192.168.1.5:3000/api'; 