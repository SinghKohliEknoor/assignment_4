import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

type AuthStackParamList = {
    SignIn: undefined;
    SignUp: undefined;
    Landing: undefined;
};

type LandingScreenNavigationProp = NavigationProp<AuthStackParamList, 'Landing'>;


export default function LandingScreen() {
    const [user, setUser] = useState<{ email: string; firstname: string; lastname: string; uuid:string; } | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<LandingScreenNavigationProp>();
    const [isEditing, setIsEditing] = useState(false); // Track editing mode

    useEffect(() => {
        const fetchUserDetails = async () => {
            const { data: authUser, error: authError } = await supabase.auth.getUser();
            if (authError) {
                Alert.alert('Error', authError.message);
                return;
            }

            const { data: userDetails, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', authUser.user.email)
                .single();

            if (userError) {
                Alert.alert('Error', userError.message);
            } else {
                setUser(userDetails);
                setFirstName(userDetails.firstname);
                setLastName(userDetails.lastname);
            }
            setLoading(false);
        };

        fetchUserDetails();
    }, []);

    const handleUpdate = async () => {
        if (!user) return;

        const { error } = await supabase
            .from('users')
            .update({ firstname: firstName, lastname: lastName })
            .eq('email', user.email);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Profile updated successfully!');
            setIsEditing(false); // Exit editing mode after successful update
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigation.navigate('SignIn');
        Alert.alert('Success', 'Logged out successfully!');
    };
    const handleDeleteAccount = async () => {
        if (!user) return;

        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? you can still sign in but your details will be lost',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Delete user from 'users' table
                        const { error: deleteUserError } = await supabase
                            .from('users')
                            .delete()
                            .eq('email', user.email);

                        if (deleteUserError) {
                            Alert.alert('Error', deleteUserError.message);
                            return;
                        }else{
                            navigation.navigate('SignIn');
                            alert("User Deleted Successfully")
                        }

                    },
                },
            ]
        );
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.email}!</Text>

            {isEditing ? (
                <>
                    <TextInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        style={styles.input}
                    />
                    <Button title="Save Changes" onPress={handleUpdate} />
                    <Button title="Cancel" onPress={() => setIsEditing(false)} color="gray" />
                </>
            ) : (
                <>
                    <Text style={styles.text}>First Name: {firstName}</Text>
                    <Text style={styles.text}>Last Name: {lastName}</Text>
                    <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
                </>
            )}

            <Button title="Logout" onPress={handleLogout} color="red" />
            <Button title="Delete Account" onPress={handleDeleteAccount} color="black" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    text: { fontSize: 16, marginBottom: 10 },
    input: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
});
