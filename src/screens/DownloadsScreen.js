import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { layout } from '../theme/layout';
import { Feather } from '@expo/vector-icons';
import { getSavedArticles, clearAllArticles, deleteArticles } from '../utils/storage';
import { NewsCard } from '../components/NewsCard';

export default function DownloadsScreen({ navigation }) {
    const { colors } = useSettings();
    const [savedNews, setSavedNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentSource, setCurrentSource] = useState('all'); // 'all', 'borneo', 'utusan', 'dayak'

    const styles = useMemo(() => createStyles(colors), [colors]);

    const loadArticles = async () => {
        const articles = await getSavedArticles();
        setSavedNews(articles);
    };

    // Filter logic
    useEffect(() => {
        if (currentSource === 'all') {
            setFilteredNews(savedNews);
        } else {
            const sourceName =
                currentSource === 'borneo' ? 'The Borneo Post' :
                    currentSource === 'suara' ? 'Suara Sarawak' :
                        'Dayak Daily';
            const filtered = Array.isArray(savedNews) ? savedNews.filter(a => a.source === sourceName) : [];
            setFilteredNews(filtered);
        }
    }, [savedNews, currentSource]);

    useFocusEffect(
        useCallback(() => {
            loadArticles();
            return () => {
                setIsSelectionMode(false);
                setSelectedItems([]);
            };
        }, [])
    );

    // ... (Handlers: handleLongPress, handlePress, toggleSelection, handleTrashPress, handleCancelSelection - kept same)

    // Helper to keep code concise in replacement
    const handleLongPress = (article) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedItems([article.id]);
        }
    };

    const handlePress = (article) => {
        if (isSelectionMode) {
            toggleSelection(article.id);
        } else {
            navigation.navigate('NewsDetails', { article });
        }
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleTrashPress = () => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
        } else {
            if (selectedItems.length === 0) {
                if (savedNews.length > 0) {
                    Alert.alert('Select Items', 'Please select items to delete.');
                }
                return;
            }

            Alert.alert(
                'Delete Articles',
                `Are you sure you want to delete ${selectedItems.length} article(s)?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            await deleteArticles(selectedItems);
                            await loadArticles();
                            setIsSelectionMode(false);
                            setSelectedItems([]);
                        }
                    }
                ]
            );
        }
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedItems([]);
    };

    const SourceTab = ({ id, label }) => (
        <TouchableOpacity
            style={[styles.tab, currentSource === id && styles.activeTab]}
            onPress={() => setCurrentSource(id)}
        >
            <Text style={[styles.tabText, currentSource === id && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                {isSelectionMode ? (
                    <TouchableOpacity onPress={handleCancelSelection} style={styles.iconButton}>
                        <Feather name="chevron-left" color={colors.text.primary} size={24} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Feather name="chevron-left" color={colors.text.primary} size={24} />
                    </TouchableOpacity>
                )}

                <View>
                    <Text style={styles.headerTitle}>OFFLINE</Text>
                    <Text style={styles.headerSubtitle}>
                        {isSelectionMode ? `${selectedItems.length} SELECTED` : 'DOWNLOADS'}
                    </Text>
                </View>

                <TouchableOpacity onPress={handleTrashPress} style={styles.iconButton}>
                    <Feather
                        name="trash-2"
                        color={isSelectionMode && selectedItems.length > 0 ? colors.status.error : colors.text.primary}
                        size={24}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                    <SourceTab id="all" label="All Sources" />
                    <SourceTab id="borneo" label="The Borneo Post" />
                    <SourceTab id="suara" label="Suara Sarawak" />
                    <SourceTab id="dayak" label="Dayak Daily" />
                </ScrollView>
            </View>

            {filteredNews.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No saved articles.</Text>
                    <Text style={styles.emptySubtext}>
                        {savedNews.length > 0 ? "No articles for this source." : "Articles you save will appear here for offline reading."}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NewsCard
                            article={item}
                            onPress={() => handlePress(item)}
                            onLongPress={() => handleLongPress(item)}
                            selectable={isSelectionMode}
                            selected={selectedItems.includes(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.m,
        paddingVertical: layout.spacing.l,
        marginBottom: layout.spacing.s,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        letterSpacing: 1,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 1,
        textAlign: 'center',
    },
    iconButton: {
        padding: 8,
    },
    listContent: {
        padding: layout.spacing.m,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: layout.spacing.s,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    tabContainer: {
        marginBottom: layout.spacing.s,
    },
    tabContent: {
        paddingHorizontal: layout.spacing.m,
        paddingVertical: layout.spacing.s,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
        marginRight: layout.spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    activeTabText: {
        color: colors.text.inverse,
    },
});
