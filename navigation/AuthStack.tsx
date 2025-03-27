import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '../components/SignInScreen';
import SignUpScreen from '../components/SignUpScreen';
import LandingScreen from '../components/LandingScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ 
                title: 'Sign in',
                headerLeft: () => null,
                
            }} 
        />
        <Stack.Screen 
                    name="SignUp" 
                    component={SignUpScreen} 
                    options={{ 
                        title: 'Sign Up',
                        headerLeft: () => null,
                        
                    }} 
                />
        <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ 
                title: 'Home',
                headerLeft: () => null,
            }} 
        />

    </Stack.Navigator>
    );
};

export default AuthStack;