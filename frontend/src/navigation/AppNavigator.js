import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterOrganizationScreen from '../screens/RegisterOrganizationScreen';
import RegisterEmployeeScreen from '../screens/RegisterEmployeeScreen';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import EmployeeAttendanceScreen from '../screens/EmployeeAttendanceScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="RegisterOrganization" component={RegisterOrganizationScreen} />
                <Stack.Screen name="RegisterEmployee" component={RegisterEmployeeScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Attendance" component={AttendanceScreen} />
                <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                <Stack.Screen 
                    name="EmployeeAttendance" 
                    component={EmployeeAttendanceScreen}
                    options={{ headerShown: true }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;