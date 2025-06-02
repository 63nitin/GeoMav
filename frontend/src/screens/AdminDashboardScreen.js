import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const AdminDashboardScreen = ({ navigation }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);

    useEffect(() => {
        fetchUserInfo();
        fetchEmployees();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserInfo(user);
                console.log('User data:', user);
                
                if (user.organizationId) {
                    try {
                        const orgResponse = await apiService.getOrganizationDetails(user.organizationId);
                        console.log('Organization details:', orgResponse);
                        setOrganizationInfo(orgResponse);
                    } catch (orgError) {
                        console.error('Error fetching organization details:', orgError);
                        // Set a default organization name if fetch fails
                        setOrganizationInfo({ name: 'Organization' });
                    }
                } else {
                    console.log('No organization ID found in user data');
                    setOrganizationInfo({ name: 'Organization' });
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setOrganizationInfo({ name: 'Organization' });
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOrganizationEmployees();
            setEmployees(response.employees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            Alert.alert('Error', 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeAttendance = async (employeeId) => {
        try {
            setLoading(true);
            const response = await apiService.getEmployeeAttendance(employeeId);
            setEmployeeAttendance(response.attendance);
            setSelectedEmployee(employeeId);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            Alert.alert('Error', 'Failed to fetch attendance history');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEmployees();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            // Clear all stored data
            await AsyncStorage.multiRemove(['token', 'user', 'userRole']);
            // Navigate to login screen
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderEmployeeItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.employeeCard,
                selectedEmployee === item._id && styles.selectedCard
            ]}
            onPress={() => navigation.navigate('EmployeeAttendance', {
                employeeId: item._id,
                employeeName: item.name
            })}
        >
            <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{item.name}</Text>
                <Text style={styles.employeeEmail}>{item.email}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
    );

    const renderAttendanceItem = ({ item }) => (
        <View style={styles.attendanceCard}>
            <Text style={styles.attendanceDate}>
                {new Date(item.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.attendanceLocation}>
                Location: {item.location.coordinates[1].toFixed(6)}, {item.location.coordinates[0].toFixed(6)}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.organizationName}>
                        {organizationInfo?.name || 'Organization'}
                    </Text>
                    <Text style={styles.adminName}>
                        Admin: {userInfo?.name || 'Admin'}
                    </Text>
                </View>
                <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('RegisterEmployee')}
                >
                    <MaterialIcons name="person-add" size={24} color="#fff" />
                    <Text style={styles.registerButtonText}>Register Employee</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <FlatList
                    data={selectedEmployee ? employeeAttendance : filteredEmployees}
                    renderItem={selectedEmployee ? renderAttendanceItem : renderEmployeeItem}
                    keyExtractor={item => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {selectedEmployee ? 'No attendance records found' : 'No employees found'}
                        </Text>
                    }
                />
            )}

            {selectedEmployee && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        setSelectedEmployee(null);
                        setEmployeeAttendance([]);
                    }}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#007bff" />
                    <Text style={styles.backButtonText}>Back to Employees</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="#fff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTop: {
        marginBottom: 16,
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    adminName: {
        fontSize: 16,
        color: '#666',
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    registerButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    employeeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectedCard: {
        backgroundColor: '#e3f2fd',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    employeeEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    attendanceCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    attendanceDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    attendanceLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 32,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007bff',
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc3545',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default AdminDashboardScreen; 