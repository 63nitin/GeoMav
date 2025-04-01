import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import apiService from '../services/api';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const AttendanceHistoryScreen = ({ navigation }) => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getAttendanceHistory();
            console.log('Received attendance history:', response);
            setAttendanceHistory(response || []);
            
            // Set the first location as selected by default
            if (response && response.length > 0) {
                setSelectedLocation({
                    latitude: response[0].location.coordinates[1],
                    longitude: response[0].location.coordinates[0],
                });
            }
        } catch (error) {
            console.error('Attendance History Error:', error);
            if (error.message.includes('401') || error.message.includes('Please authenticate')) {
                await AsyncStorage.multiRemove(['token', 'user', 'userRole']);
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please login again.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } else {
                setError(error.message || 'Failed to fetch attendance history');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderAttendanceItem = ({ item }) => {
        const location = {
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
        };

        return (
            <TouchableOpacity 
                style={styles.attendanceCard}
                onPress={() => setSelectedLocation(location)}
            >
                <View style={styles.attendanceHeader}>
                    <Text style={styles.dateText}>
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                    <Text style={styles.timeText}>
                        {new Date(item.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={{
                            ...location,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker coordinate={location} />
                    </MapView>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Loading Attendance History...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#dc3545" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchAttendanceHistory}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (attendanceHistory.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="history" size={48} color="#6c757d" />
                <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {selectedLocation && (
                <View style={styles.mainMapContainer}>
                    <MapView
                        style={styles.mainMap}
                        region={{
                            ...selectedLocation,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker coordinate={selectedLocation} />
                    </MapView>
                </View>
            )}
            <FlatList
                data={attendanceHistory}
                renderItem={renderAttendanceItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    mainMapContainer: {
        height: 200,
        width: '100%',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    mainMap: {
        flex: 1,
    },
    listContainer: {
        padding: CARD_MARGIN,
    },
    attendanceCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
        width: CARD_WIDTH,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    attendanceHeader: {
        marginBottom: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
    },
    mapContainer: {
        height: 150,
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#dc3545',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6c757d',
    },
});

export default AttendanceHistoryScreen;
