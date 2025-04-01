import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const HomeScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);

    useEffect(() => {
        fetchUserInfo();
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.organizationName}>
                    {organizationInfo?.name || 'Organization'}
                </Text>
                <Text style={styles.employeeName}>
                    Welcome, {userInfo?.name || 'Employee'}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Attendance')}
                >
                    <MaterialIcons name="check-circle" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Mark Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('AttendanceHistory')}
                >
                    <MaterialIcons name="history" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>View Attendance History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Updated Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    employeeName: {
        fontSize: 18,
        color: '#666',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        marginBottom: 16,
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 12,
        fontWeight: '600',
    },
    icon: {
        marginRight: 8,
    },
});

export default HomeScreen;
