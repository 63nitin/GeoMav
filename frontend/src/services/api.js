import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, ENDPOINTS } from '../config/api';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        console.log('Making request to:', config.url);
        
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        
        // If token exists, add it to the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.config.url);
        return response;
    },
    async (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data,
        });

        // If the error is due to an invalid or expired token
        if (error.response?.status === 401) {
            // Clear the token and user data
            await AsyncStorage.multiRemove(['token', 'user', 'userRole']);
            // You might want to redirect to login here
        }

        return Promise.reject(error);
    }
);

// Test connection
export const testConnection = async () => {
    try {
        const response = await api.get('/test');
        return response.data;
    } catch (error) {
        throw new Error('Cannot connect to server. Please check your network connection.');
    }
};

// Login
export const login = async (email, password, role) => {
    try {
        console.log('Logging in with role:', role);
        const response = await api.post('/auth/login', { email, password, role });
        console.log('Login response:', response.data);
        
        const { token, user } = response.data;
        
        // Store token and user data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userRole', user.role);
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        if (error.response?.status === 401) {
            throw new Error('Invalid email or password');
        }
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};

// Get user details with retry mechanism
export const getUserDetails = async (retryCount = 0) => {
    try {
        console.log('Fetching user details...');
        const response = await api.get('/user/details');
        return response.data;
    } catch (error) {
        console.error('Get user details error:', error);
        
        // If it's an authentication error and we haven't retried too many times
        if (error.response?.status === 401 && retryCount < 2) {
            // Get stored user data as fallback
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        }
        
        throw new Error('Failed to fetch user details');
    }
};

// Mark attendance with improved error handling
export const markAttendance = async (location) => {
    try {
        console.log('Marking attendance with location:', location);
        
        // Format location data according to backend requirements
        const locationData = {
            longitude: parseFloat(location.coords.longitude),
            latitude: parseFloat(location.coords.latitude)
        };

        const response = await api.post('/attendance/mark-attendance', {
            location: locationData
        });

        console.log('Attendance marked successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error marking attendance:', error);
        if (error.response?.status === 401) {
            throw new Error('Authentication error');
        }
        throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
};

// Get location name from coordinates
export const getLocationName = async (latitude, longitude) => {
    try {
        console.log('Getting location name for:', { latitude, longitude });
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        
        if (response.data.results && response.data.results.length > 0) {
            // Get the most relevant result (first one)
            const location = response.data.results[0];
            // Return a simplified address (usually the street name or nearby landmark)
            return location.formatted_address;
        }
        
        return 'Location not found';
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'Location not found';
    }
};

// Get attendance history with location names
export const getAttendanceHistory = async () => {
    try {
        console.log('Fetching attendance history');
        const response = await api.get('/attendance/attendance-history');
        console.log('Attendance history response:', response.data);
        
        if (!Array.isArray(response.data)) {
            console.warn('Invalid attendance history response:', response.data);
            return [];
        }

        // Add location names to each attendance record
        const attendanceWithLocations = await Promise.all(
            response.data.map(async (record) => {
                const locationName = await getLocationName(
                    record.location.coordinates[1],
                    record.location.coordinates[0]
                );
                return {
                    ...record,
                    locationName
                };
            })
        );
        
        return attendanceWithLocations;
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        if (error.response?.status === 401) {
            throw new Error('Authentication error');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch attendance history');
    }
};

// Register employee
export const registerEmployee = async (name, email, password, biometricEnabled) => {
    try {
        console.log('Registering employee with data:', { name, email, biometricEnabled });
        const response = await api.post('/admin/register-employee', {
            name,
            email,
            password,
            biometricEnabled: biometricEnabled || false
        });
        return response.data;
    } catch (error) {
        console.error('Register employee error:', error);
        throw new Error(error.response?.data?.error || 'Failed to register employee');
    }
};

// Get organization employees
export const getOrganizationEmployees = async () => {
    try {
        const response = await api.get('/admin/employees');
        return response.data;
    } catch (error) {
        console.error('Get organization employees error:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch employees');
    }
};

// Get employee attendance
export const getEmployeeAttendance = async (employeeId) => {
    try {
        const response = await api.get(`/admin/employee-attendance/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('Get employee attendance error:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch employee attendance');
    }
};

// Register organization
export const registerOrganization = async (organizationData) => {
    try {
        console.log('Registering organization with data:', organizationData);
        const response = await api.post('/organization/register', {
            name: organizationData.name,
            email: organizationData.email,
            password: organizationData.password,
            organizationName: organizationData.organizationName
        });

        // Store user data and token
        const { token, user } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userRole', user.role);

        return response.data;
    } catch (error) {
        console.error('Register organization error:', error);
        throw new Error(error.response?.data?.error || 'Failed to register organization');
    }
};

// Get organization details
export const getOrganizationDetails = async (organizationId) => {
    try {
        console.log('Fetching organization details for ID:', organizationId);
        const response = await api.get(`/organization/${organizationId}`);
        console.log('Organization details response:', response.data);
        
        // If no organization is found, return a default object
        if (!response.data) {
            console.log('No organization details found, returning default');
            return { name: 'Organization' };
        }
        
        return response.data;
    } catch (error) {
        console.error('Get organization details error:', error);
        // Return a default object instead of throwing an error
        return { name: 'Organization' };
    }
};

// Export the API instance and functions
export default {
    api,
    login,
    testConnection,
    registerEmployee,
    markAttendance,
    getAttendanceHistory,
    getUserDetails,
    getOrganizationEmployees,
    getEmployeeAttendance,
    registerOrganization,
    getOrganizationDetails
};