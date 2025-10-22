import { Feather, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ItemEntity {
    id: number;
    done: boolean;
    value: string;
}

export default function HomeScreen() {
    const db = useSQLiteContext();
    const [text, setText] = useState('');
    const [tasks, setTasks] = useState<ItemEntity[]>([]);
    const [doneTasks, setDoneTasks] = useState<ItemEntity[]>([]);
    const [loading, setLoading] = useState(false); // 👈 Add loading state for refresh

    const refetchItems =  useCallback(async () => {
        setLoading(true);
        try {
            await db.withExclusiveTransactionAsync(async () => {
                const pending = await db.getAllAsync<ItemEntity>(
                    'SELECT * FROM items WHERE done = ?',
                    false
                );
                const done = await db.getAllAsync<ItemEntity>(
                    'SELECT * FROM items WHERE done = ?',
                    true
                );
                setTasks(pending);
                setDoneTasks(done);
            });
        } finally {
            setLoading(false);
        }
    }, [db]);

    useEffect(() => {
        refetchItems();
    }, [])

    // useFocusEffect(useCallback(() => {
    //     refetchItems();
    // }, [refetchItems]));

    const renderTask = ({ item }: { item: ItemEntity }) => (
        <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
                <Ionicons
                    name={item.done ? 'checkbox' : 'square-outline'}
                    size={22}
                    color="#4CAF50"
                />
                <Text
                    style={[
                        styles.taskText,
                        item.done && { textDecorationLine: 'line-through', color: '#888' },
                    ]}
                >
                    {item.value}
                </Text>
            </View>
            <Feather name="edit-2" size={18} color="#999" />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.greeting}>Hi Twinkle</Text>
                    <Text style={styles.subGreeting}>Have a great day ahead</Text>
                </View>

                {/* 👇 Refresh button */}
                {/* <TouchableOpacity onPress={refetchItems} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#03A9F4" />
                    ) : (
                        <Ionicons name="refresh" size={24} color="#03A9F4" />
                    )}
                </TouchableOpacity> */}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    placeholder="Search"
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={text}
                    onChangeText={setText}
                />
            </View>

            {/* Pending Tasks */}
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTask}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No pending tasks 🎉</Text>
                }
            />

            {/* Completed Tasks */}
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            <FlatList
                data={doneTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTask}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No completed tasks yet</Text>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Floating Add Button */}
            <Link href='/addtodolist' asChild>
                <TouchableOpacity style={styles.fab}>
                    <Ionicons name="add" size={36} color="white" />
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 60 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    greeting: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subGreeting: { color: '#888' },

    // Search bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        marginLeft: 8,
        color: '#333',
    },

    // Task cards
    taskCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 2,
    },
    taskLeft: { flexDirection: 'row', alignItems: 'center' },
    taskText: { marginLeft: 10, fontSize: 16, color: '#333' },

    // Floating Action Button
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#03A9F4',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
    },

    // Sections
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        marginTop: 15,
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        marginBottom: 20,
    },
});
