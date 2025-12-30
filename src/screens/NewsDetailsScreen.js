import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from '../theme/layout';
import { Feather, Ionicons } from '@expo/vector-icons';
import { saveArticle, getSavedArticles } from '../utils/storage';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useSettings } from '../context/SettingsContext';
import { analyzeCredibility } from '../services/aiService';
import ImageViewing from "react-native-image-viewing";

export default function NewsDetailsScreen({ route, navigation }) {
    const { article } = route.params;
    const { t, colors, language, isPremium } = useSettings();
    const [saved, setSaved] = useState(false);
    const [savedArticle, setSavedArticle] = useState(null);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    // AI State
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImageVisible, setIsImageVisible] = useState(false);

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        checkSavedStatus();
    }, [article]);



    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeCredibility(article.content, language);
            setAnalysisResult(result);
        } catch (e) {
            Alert.alert(t('error'), 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const checkSavedStatus = async () => {
        const savedArticles = await getSavedArticles();
        // Fix: Use loose equality (==) to handle potential string/number mismatches
        const found = savedArticles.find(a => a.id == article.id);
        if (found) {
            setSaved(true);
            setSavedArticle(found);

        } else {
            setSaved(false);
            setSavedArticle(null);
        }
    };

    const handleSave = async () => {
        if (saved) return;

        // 1. Save to internal cache (Offline Mode)
        const success = await saveArticle(article);

        if (success) {
            setSaved(true);

            // 2. Ask for permission and save to device gallery (User Requirement)
            try {
                if (!permissionResponse || permissionResponse.status !== 'granted') {
                    const { status } = await requestPermission();
                    if (status !== 'granted') {
                        Alert.alert(
                            t('permissionTitle'),
                            t('permissionMessage'),
                            [
                                { text: t('cancel'), style: 'cancel' },
                                {
                                    text: t('openSettings'),
                                    onPress: () => {
                                        if (Platform.OS === 'ios') {
                                            Linking.openURL('app-settings:');
                                        }
                                    }
                                }
                            ]
                        );
                        return;
                    }
                }

                // Download image to temp file
                const fileUri = FileSystem.documentDirectory + 'news_image.jpg';
                const { uri } = await FileSystem.downloadAsync(article.imageUrl, fileUri);

                // Save to Media Library
                const asset = await MediaLibrary.createAssetAsync(uri);
                await MediaLibrary.createAlbumAsync('Sarawak Digital Access', asset, false);

                Alert.alert(t('saveSuccess'), t('saveSuccess'));

            } catch (error) {
                console.error('Error saving to device:', error);
                // Even if device save fails, internal cache succeeded, so we don't show error to confuse user
                // unless we want to be strict. Let's show success for offline save at least.
                Alert.alert(t('saveSuccess'), t('saveSuccess'));
            }
        } else {
            Alert.alert(t('saveError'), t('saveError'));
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Feather name="arrow-left" color={colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('latestNews').toUpperCase()}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="share-2" color={colors.text.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.metaContainer}>
                    {article.verified && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>VERIFIED</Text>
                        </View>
                    )}
                    <Text style={styles.date}>{new Date(article.date).toLocaleDateString()}</Text>
                    {savedArticle?.downloadedAt && (
                        <Text style={styles.downloadDate}> | Downloaded: {new Date(savedArticle.downloadedAt).toLocaleString()}</Text>
                    )}
                </View>

                <Text style={styles.headline}>
                    {article.headline}
                </Text>

                <TouchableOpacity onPress={() => setIsImageVisible(true)}>
                    <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>

                <ImageViewing
                    images={[{ uri: article.imageUrl }]}
                    imageIndex={0}
                    visible={isImageVisible}
                    onRequestClose={() => setIsImageVisible(false)}
                />

                <Text style={styles.body}>
                    {article.content}
                </Text>

                {/* Premium Credibility Analysis */}
                {isPremium && (
                    <View style={styles.premiumBox}>
                        <View style={styles.premiumHeader}>
                            <Ionicons name="sparkles" size={20} color={colors.primary} />
                            <Text style={styles.premiumTitle}>AI Truth Detector (Premium)</Text>
                        </View>

                        {analysisResult ? (
                            <View style={[styles.analysisResult, { borderColor: analysisResult.color }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Feather name="shield" size={20} color={analysisResult.color} />
                                    <Text style={[styles.analysisStatus, { color: analysisResult.color }]}>
                                        {analysisResult.status} ({analysisResult.score}/100)
                                    </Text>
                                </View>
                                <Text style={styles.analysisReason}>{analysisResult.reason}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.analyzeButton}
                                onPress={handleAnalysis}
                                disabled={isAnalyzing}
                            >
                                <Text style={styles.analyzeButtonText}>
                                    {isAnalyzing ? "Analyzing..." : "Analyze Credibility"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: layout.spacing.m + (Platform.OS === 'ios' ? 20 : 0) }]}>
                <TouchableOpacity
                    style={[styles.saveButton, saved && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saved}
                >
                    {saved ? (
                        <>
                            <Feather name="check" color={colors.text.inverse} size={20} />
                            <Text style={styles.saveButtonText}>{t('savedOffline')}</Text>
                        </>
                    ) : (
                        <>
                            <Feather name="bookmark" color={colors.text.inverse} size={20} />
                            <Text style={styles.saveButtonText}>{t('saveOffline')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
        paddingVertical: layout.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 1,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        padding: layout.spacing.l,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.m,
    },
    badge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: layout.spacing.s,
        paddingVertical: 4,
        borderRadius: layout.borderRadius.s,
        marginRight: layout.spacing.m,
    },
    badgeText: {
        color: colors.primaryDark,
        fontSize: 10,
        fontWeight: '700',
    },
    date: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    downloadDate: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    translationNotice: {
        fontSize: 12,
        color: colors.status.info,
        fontStyle: 'italic',
        marginTop: 4,
        marginBottom: layout.spacing.s,
    },
    headline: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: layout.spacing.l,
        lineHeight: 32,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: layout.borderRadius.m,
        marginBottom: layout.spacing.l,
        backgroundColor: colors.border,
    },
    body: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.primary,
        marginBottom: layout.spacing.m,
    },
    footer: {
        padding: layout.spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    saveButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.m,
        borderRadius: layout.borderRadius.m,
        ...layout.shadows.medium,
        shadowColor: colors.cardShadow,
    },
    saveButtonDisabled: {
        backgroundColor: colors.text.secondary,
    },
    saveButtonText: {
        color: colors.text.inverse,
        fontWeight: '700',
        marginLeft: layout.spacing.s,
        letterSpacing: 1,
    },
    translatingText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.text.secondary,
        marginBottom: layout.spacing.m,
    },
    premiumBox: {
        marginTop: layout.spacing.l,
        padding: layout.spacing.m,
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.m,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        ...layout.shadows.small,
        marginBottom: layout.spacing.xl,
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.m,
    },
    premiumTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        marginLeft: layout.spacing.s,
    },
    analyzeButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: layout.spacing.m,
        borderRadius: layout.borderRadius.s,
        alignItems: 'center',
    },
    analyzeButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    analysisResult: {
        borderLeftWidth: 4,
        paddingLeft: layout.spacing.m,
        paddingVertical: layout.spacing.s,
        backgroundColor: colors.background,
    },
    analysisStatus: {
        fontSize: 16,
        fontWeight: '800',
        marginLeft: layout.spacing.s,
    },
    analysisReason: {
        fontSize: 14,
        color: colors.text.primary,
        lineHeight: 20,
    },
});
