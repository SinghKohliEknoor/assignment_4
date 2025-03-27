import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
    SignIn: { email: string; password: string; firstname: string; lastname: string } | undefined;
    SignUp: undefined;
    Landing: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<SignUpScreenNavigationProp>();

    const handleSignUp = async () => {
        if (!firstname || !lastname || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const lowerCaseEmail = email.toLowerCase(); 

        // **Sign up using Supabase Auth but don't insert into 'users' table yet**
        const { data, error } = await supabase.auth.signUp({
            email: lowerCaseEmail,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
            return;
        }

        Alert.alert('Success', 'Account created! Please sign in.');
        
        // Navigate to SignIn and pass user details
        navigation.navigate('SignIn', { 
            email: lowerCaseEmail, 
            password, 
            firstname, 
            lastname 
        });
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="First Name"
                value={firstname}
                onChangeText={setFirstname}
                style={styles.input}
            />
            <TextInput
                placeholder="Last Name"
                value={lastname}
                onChangeText={setLastname}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
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
