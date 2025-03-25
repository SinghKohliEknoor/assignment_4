import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the type for the navigation stack parameters
type AuthStackParamList = {
    SignIn: undefined;
    SignUp: undefined;
    Landing: undefined;
};

// Define the navigation prop type for the SignUpScreen
type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<SignUpScreenNavigationProp>();

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const lowerCaseEmail = email.toLowerCase(); // Convert email to lowercase for consistency

        // **STEP 1: Check if the email already exists**
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('email')
            .eq('email', lowerCaseEmail)
            .single();

        if (existingUser) {
            Alert.alert('User Already Exists', 'Please sign in instead.');
            return;
        }

        // **STEP 2: Proceed with sign-up**
        const { data, error } = await supabase.auth.signUp({
            email: lowerCaseEmail,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
            return;
        }

        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
        navigation.navigate('SignIn'); // Redirect to Sign In
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())} // Ensure input is always lowercase
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
    signInText: { marginTop: 10, color: 'blue', textAlign: 'center' },
});