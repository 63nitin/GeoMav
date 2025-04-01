import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const AttendanceScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [lastAttendance, setLastAttendance] = useState(null);

    useEffect(() => {
        checkBiometricSupport();
        getLastAttendance();
    }, []);

    const checkBiometricSupport = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            console.log('Biometric Support:', { hasHardware, isEnrolled });
            
            if (!hasHardware) {
                Alert.alert('Error', 'This device does not support biometric authentication');
                return false;
            }
            
            if (!isEnrolled) {
                Alert.alert('Error', 'No biometric data is enrolled on this device');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking biometric support:', error);
            return false;
        }
    };

    const getLastAttendance = async () => {
        try {
            const response = await apiService.getAttendanceHistory();
            console.log('Attendance history response:', response);
            if (response && response.length > 0) {
                setLastAttendance(response[0]);
            }
        } catch (error) {
            console.error('Error fetching last attendance:', error);
            if (error.message.includes('Authentication error')) {
                // Clear stored data and redirect to login
                await AsyncStorage.multiRemove(['token', 'user', 'userRole']);
                navigation.replace('Login');
            }
        }
    };

    const getLocation = async () => {
        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return null;
            }

            // Get current location with high accuracy
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10
            });

            console.log('Location obtained:', location);
            setLocation(location);
            return location;
        } catch (error) {
            console.error('Location error:', error);
            setErrorMsg('Failed to get location. Please try again.');
            return null;
        }
    };

    const authenticateWithBiometric = async () => {
        try {
            const hasBiometricSupport = await checkBiometricSupport();
            if (!hasBiometricSupport) {
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to mark attendance',
                fallbackLabel: 'Use password',
                disableDeviceFallback: false,
                cancelLabel: 'Cancel',
            });

            console.log('Biometric authentication result:', result);
            return result.success;
        } catch (error) {
            console.error('Error during biometric authentication:', error);
            return false;
        }
    };

    const handleMarkAttendance = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            // Get current location
            const location = await getLocation();
            if (!location) {
                setErrorMsg('Failed to get location. Please try again.');
                return;
            }

            // Check if biometric is required
            const userDetails = await apiService.getUserDetails();
            console.log('User details:', userDetails);
            
            if (userDetails.biometricEnabled) {
                console.log('Biometric authentication required');
                const authenticated = await authenticateWithBiometric();
                if (!authenticated) {
                    setErrorMsg('Biometric authentication failed');
                    return;
                }
                console.log('Biometric authentication successful');
            }

            // Mark attendance
            const response = await apiService.markAttendance(location);
            console.log('Attendance marked successfully:', response);
            
            // Refresh attendance history
            await getLastAttendance();
            
            Alert.alert('Success', 'Attendance marked successfully!');
        } catch (error) {
            console.error('Error marking attendance:', error);
            if (error.message.includes('401')) {
                // Handle authentication error
                Alert.alert('Error', 'Your session has expired. Please login again.');
                // Clear stored data and navigate to login
                await AsyncStorage.multiRemove(['token', 'userDetails']);
                navigation.replace('Login');
            } else {
                setErrorMsg(error.message || 'Failed to mark attendance. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Mark Attendance</Text>

            {errorMsg && (
                <Text style={styles.errorText}>{errorMsg}</Text>
            )}

            {lastAttendance && (
                <View style={styles.lastAttendanceContainer}>
                    <Text style={styles.lastAttendanceTitle}>Last Attendance</Text>
                    <Text style={styles.lastAttendanceText}>
                        Date: {new Date(lastAttendance.timestamp).toLocaleDateString()}
                    </Text>
                    <Text style={styles.lastAttendanceText}>
                        Time: {new Date(lastAttendance.timestamp).toLocaleTimeString()}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleMarkAttendance}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Mark Attendance</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('AttendanceHistory')}
            >
                <Text style={styles.historyButtonText}>View Attendance History</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    historyButton: {
        marginTop: 15,
        padding: 15,
        alignItems: 'center',
    },
    historyButtonText: {
        color: '#007bff',
        fontSize: 16,
    },
    lastAttendanceContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    lastAttendanceTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    lastAttendanceText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
});

export default AttendanceScreen;