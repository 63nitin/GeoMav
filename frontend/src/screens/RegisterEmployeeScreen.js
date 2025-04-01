import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import apiService from '../services/api';

const RegisterEmployeeScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if biometric authentication is supported and enrolled
    const checkBiometricSupport = async () => {
        const isSupported = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!isSupported) {
            Alert.alert('Biometric Not Supported', 'Biometric authentication is not supported on this device.');
            return false;
        }

        if (!isEnrolled) {
            Alert.alert('No Biometric Data', 'No biometric credentials (e.g., fingerprint) are enrolled.');
            return false;
        }

        return true;
    };

    // Enable biometric authentication for the user
    const enableBiometricAuthentication = async () => {
        const isBiometricSupported = await checkBiometricSupport();
        if (!isBiometricSupported) {
            setBiometricEnabled(false);
            return;
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable biometric login',
            });

            if (result.success) {
                setBiometricEnabled(true);
                Alert.alert('Success', 'Biometric authentication enabled successfully!');
            } else {
                setBiometricEnabled(false);
                Alert.alert('Failed', 'Biometric authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Biometric Error:', error);
            Alert.alert('Error', 'Failed to enable biometric authentication.');
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Register the employee
            const response = await apiService.registerEmployee(
                name,
                email,
                password,
                biometricEnabled
            );
            
            console.log('Employee registration response:', response);
            Alert.alert('Success', 'Employee registered successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Error', error.message || 'Failed to register employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Register Employee</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Employee Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Employee Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
            />

            <TouchableOpacity 
                style={[styles.button, biometricEnabled && styles.buttonEnabled]}
                onPress={enableBiometricAuthentication}
            >
                <Text style={styles.buttonText}>
                    {biometricEnabled ? 'Biometric Enabled ✓' : 'Enable Biometric Authentication'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Register Employee</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.linkText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
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
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    primaryButton: {
        backgroundColor: '#007bff',
    },
    buttonEnabled: {
        backgroundColor: '#28a745',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#007bff',
        fontSize: 16,
    },
});

export default RegisterEmployeeScreen; 