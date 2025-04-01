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
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('employee'); // Default role

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting login with role:', selectedRole);
            const response = await apiService.login(email, password, selectedRole);
            console.log('Login response:', response);

            // Store user data
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            await AsyncStorage.setItem('userRole', response.user.role);

            // Navigate based on role
            if (response.user.role === 'admin') {
                navigation.replace('AdminDashboard');
            } else {
                navigation.replace('Home');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Error', error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Login</Text>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        selectedRole === 'employee' && styles.selectedRole
                    ]}
                    onPress={() => setSelectedRole('employee')}
                >
                    <Text style={[
                        styles.roleText,
                        selectedRole === 'employee' && styles.selectedRoleText
                    ]}>Employee</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        selectedRole === 'admin' && styles.selectedRole
                    ]}
                    onPress={() => setSelectedRole('admin')}
                >
                    <Text style={[
                        styles.roleText,
                        selectedRole === 'admin' && styles.selectedRoleText
                    ]}>Admin</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Email"
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
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
                <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('RegisterOrganization')}
                >
                    <Text style={styles.linkText}>Register as Organization</Text>
                </TouchableOpacity>
            </View>
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
        textAlign: 'center',
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    roleButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007bff',
    },
    selectedRole: {
        backgroundColor: '#007bff',
    },
    roleText: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedRoleText: {
        color: '#fff',
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
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkButton: {
        marginVertical: 5,
    },
    linkText: {
        color: '#007bff',
        fontSize: 16,
    },
});

export default LoginScreen;
