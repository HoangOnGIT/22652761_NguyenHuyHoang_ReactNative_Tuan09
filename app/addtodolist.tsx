import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddJobScreen() {
    const db = useSQLiteContext();
    const router = useRouter();
    const [text, setText] = useState('');

    const handleAdd = () => {
        if (text.trim().length === 0) return;
        // TODO: save job to SQLite here
        addItemAsync(db,text);
        router.replace("/todolist"); // navigate back to Home after adding
    };

    async function addItemAsync(db: SQLiteDatabase, text: string): Promise<void> {
        if (text !== '') {
            await db.runAsync(
                'INSERT INTO items (done, value) VALUES (?, ?);',
                false,
                text
            );
            console.log('Input text value: ' + text);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
                    style={styles.avatar}
                />
                <View>
                    <Text style={styles.greeting}>Hi Twinkle</Text>
                    <Text style={styles.subGreeting}>Have a great day ahead</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.title}>ADD YOUR JOB</Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
                <Feather name="file-text" size={20} color="#4CAF50" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="input your job"
                    placeholderTextColor="#999"
                    value={text}
                    onChangeText={setText}
                />
            </View>

            {/* Finish Button */}
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>FINISH →</Text>
            </TouchableOpacity>

            {/* Decorative Image */}
            <Image
                source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/2131/2131632.png',
                }}
                style={styles.noteImage}
                resizeMode="contain"
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 25, paddingTop: 60 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    greeting: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subGreeting: { color: '#888' },
    backButton: { position: 'absolute', right: 0 },

    // Title
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 25,
        height: 50,
    },
    icon: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: '#333' },

    // Button
    button: {
        backgroundColor: '#03A9F4',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Image
    noteImage: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 30,
    },
});
