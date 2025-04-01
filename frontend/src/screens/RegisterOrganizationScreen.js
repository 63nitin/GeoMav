import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import apiService from '../services/api';

const RegisterOrganizationScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !organizationName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const organizationData = {
                name,
                email,
                password,
                organizationName
            };
            console.log('Sending organization data:', organizationData);
            const response = await apiService.registerOrganization(organizationData);
            Alert.alert('Success', 'Organization registered successfully! Please login.');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Error', error.message || 'Failed to register organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register Organization</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Admin Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Admin Email"
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

            <TextInput
                style={styles.input}
                placeholder="Organization Name"
                value={organizationName}
                onChangeText={setOrganizationName}
                placeholderTextColor="#999"
            />

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Register Organization</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.linkText}>Already have an account? Login</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
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
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#007bff',
        fontSize: 16,
    },
});

export default RegisterOrganizationScreen; 