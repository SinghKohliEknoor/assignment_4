import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
    SignIn: { email?: string; password?: string; firstname?: string; lastname?: string } | undefined;
    SignUp: undefined;
    Landing: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;
type SignInScreenRouteProp = RouteProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ route }: { route: SignInScreenRouteProp }) {
    const navigation = useNavigation<SignInScreenNavigationProp>();
    const [email, setEmail] = useState(route.params?.email || '');
    const [password, setPassword] = useState(route.params?.password || '');
    const [firstname, setFirstname] = useState(route.params?.firstname || '');
    const [lastname, setLastname] = useState(route.params?.lastname || '');

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            Alert.alert('Error', error.message);
            return;
        }

        const user = data.user;
        if (!user) {
            Alert.alert('Error', 'Sign-in failed.');
            return;
        }

        // Check if user already exists in 'users' table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no data found
            Alert.alert('Error', fetchError.message);
            return;
        }

        // If user does NOT exist in 'users' table, insert details
        if (!existingUser) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        uuid: user.id, // Supabase Auth User ID
                        email: user.email,
                        firstname: firstname, 
                        lastname: lastname,
                        password: password, // Storing plain text password (not recommended)
                    },
                ]);

            if (insertError) {
                Alert.alert('Error', insertError.message);
                return;
            }
        }

        Alert.alert('Success', `Welcome, ${user.email}!`);
        setEmail('');
        setPassword('');
        navigation.navigate('Landing'); // Redirect after login
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Sign In" onPress={handleSignIn} />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
    signUpText: { marginTop: 10, color: 'blue', textAlign: 'center' },
});
