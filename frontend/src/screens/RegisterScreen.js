import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { API_URL } from '../config/api';
import apiService from '../services/api';

const RegisterScreen = ({ navigation }) => {
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
            // Authenticate using biometrics (fingerprint or face recognition)
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
            // Register the user with biometric authentication flag
            const response = await apiService.registerEmployee(
                name,
                email,
                password,
                '65f9f8a8c4e6b3a2d1c0b9a8', // Default organization ID for testing
                biometricEnabled
            );

            console.log('Registration Response:', response);
            Alert.alert('Success', 'Registration successful! Please login.');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert(
                'Registration Failed',
                error.message || 'Failed to register. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
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
                <Text style={styles.buttonText}>
                    {loading ? 'Registering...' : 'Register'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});

export default RegisterScreen;