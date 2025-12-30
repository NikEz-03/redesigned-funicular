import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, StatusBar, BackHandler, ToastAndroid, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { layout } from '../theme/layout';
import { fetchNews } from '../services/newsService';
import { saveArticle, getDailyDownloadCount, incrementDailyDownloadCount } from '../utils/storage';
import * as Network from 'expo-network';
import { Feather } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { NewsCard } from '../components/NewsCard';

export default function HomeScreen({ navigation }) {
    const { t, wifiOnly, colors, theme, isPremium, autoDownload, autoDownloadWifiOnly, autoDownloadSources } = useSettings();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [source, setSource] = useState('online');
    const [isMobileData, setIsMobileData] = useState(false);

    // Multi-source state
    const [currentSource, setCurrentSource] = useState('borneo');

    const styles = useMemo(() => createStyles(colors), [colors]);

    // Double back to exit logic
    const lastBackPress = useRef(0);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                const now = Date.now();
                if (lastBackPress.current && now - lastBackPress.current < 2000) {
                    BackHandler.exitApp();
                    return true;
                }

                lastBackPress.current = now;
                ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const loadNews = useCallback(async () => {
        try {
            // Fetch news for the CURRENTLY selected source tab
            const result = await fetchNews(wifiOnly, currentSource);
            setNews(result.data);
            setSource(result.source);

            if (result.source === 'online' && !wifiOnly) {
                setIsMobileData(true);
            } else {
                setIsMobileData(false);
            }

            // Auto-download logic (runs regardless of tab, but iterates through PREFERRED sources)
            if (result.source === 'online' && autoDownload) {
                handleAutoDownload(); // No args needed, it uses autoDownloadSources
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [wifiOnly, autoDownload, autoDownloadWifiOnly, isPremium, currentSource, autoDownloadSources]);

    const handleAutoDownload = async () => {
        const networkState = await Network.getNetworkStateAsync();
        const isWifi = networkState.type === Network.NetworkType.WIFI;

        if (autoDownloadWifiOnly && !isWifi) {
            console.log("Auto-download skipped: Not on Wifi");
            return;
        }

        let downloadCount = 0;
        const MAX_FREE_DAILY = 10;

        const sourcesToDownload = Array.isArray(autoDownloadSources) && autoDownloadSources.length > 0
            ? autoDownloadSources
            : ['borneo'];

        // Iterate through all selected sources for auto-download
        for (const src of sourcesToDownload) {
            // Check limit for THIS source
            let sourceDailyCount = await getDailyDownloadCount(src);

            if (!isPremium && sourceDailyCount >= MAX_FREE_DAILY) {
                console.log(`Auto-download skipped for ${src}: Daily limit reached before fetch`);
                continue; // Skip this source, try next
            }

            // Fetch news for this source
            const result = await fetchNews(wifiOnly, src);
            const articles = result.data;

            for (const article of articles) {
                // Constraint: Free User Limit checks per source
                if (!isPremium) {
                    if (sourceDailyCount >= MAX_FREE_DAILY) {
                        console.log(`Auto-download limit reached for ${src}`);
                        break;
                    }
                }

                const success = await saveArticle(article);
                if (success) {
                    downloadCount++;
                    if (!isPremium) {
                        // Increment specific source count
                        sourceDailyCount = await incrementDailyDownloadCount(src);
                    }
                }
            }
        }

        if (downloadCount > 0) {
            ToastAndroid.show(`Auto-downloaded ${downloadCount} new articles`, ToastAndroid.SHORT);
        }
    };



    useEffect(() => {
        setLoading(true); // Reset loading when source updates
        loadNews();
    }, [loadNews, currentSource]); // Add currentSource dependency

    const onRefresh = () => {
        setRefreshing(true);
        loadNews();
    };

    const renderNewsItem = ({ item }) => (
        <NewsCard
            article={item}
            onPress={() => navigation.navigate('NewsDetails', { article: item })}
        />
    );

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
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>SARAWAK</Text>
                    <Text style={styles.headerSubtitle}>DIGITAL ACCESS</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('Downloads')} style={styles.iconButton}>
                        <Feather name="download" color={colors.text.primary} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
                        <Feather name="settings" color={colors.text.primary} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                    <SourceTab id="borneo" label="The Borneo Post" />
                    <SourceTab id="suara" label="Suara Sarawak" />
                    <SourceTab id="dayak" label="Dayak Daily" />
                </ScrollView>
            </View>

            {source === 'cache' && (
                <View style={styles.offlineBanner}>
                    <Feather name="wifi-off" size={16} color={colors.text.inverse} />
                    <Text style={styles.offlineText}>{t('offlineMessage')}</Text>
                </View>
            )}

            {/* Mobile Data Warning (Only if Online and NOT WifiOnly - implies potential data usage) */}
            {source === 'online' && !wifiOnly && (
                <View style={[styles.offlineBanner, { backgroundColor: colors.status.info }]}>
                    <Feather name="download" size={16} color={colors.text.inverse} />
                    <Text style={styles.offlineText}>Using Mobile Data</Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    data={news}
                    renderItem={renderNewsItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                    }
                    ListHeaderComponent={
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('latestNews')}</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>{t('noNews')}</Text>
                            </View>
                        )
                    }
                    showsVerticalScrollIndicator={false}
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primary,
        letterSpacing: 2,
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: layout.spacing.m,
        padding: 4,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.status.warning,
        padding: layout.spacing.s,
        marginHorizontal: layout.spacing.m,
        borderRadius: layout.borderRadius.m,
        marginBottom: layout.spacing.s,
    },
    offlineText: {
        color: colors.text.inverse,
        marginLeft: layout.spacing.s,
        fontSize: 12,
        fontWeight: '600',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: layout.spacing.m,
        paddingBottom: layout.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.m,
        marginTop: layout.spacing.s,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    viewAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: layout.spacing.xl,
    },
    emptyText: {
        color: colors.text.secondary,
        fontSize: 16,
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
