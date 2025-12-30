import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout } from '../theme/layout';
import { Feather } from '@expo/vector-icons';


export default function SettingsScreen({ navigation }) {
    const {
        language, wifiOnly, theme, isPremium, autoDownload, autoDownloadWifiOnly,
        updateLanguage, updateWifiOnly, updateTheme, togglePremium, updateAutoDownload, updateAutoDownloadWifiOnly,
        autoDownloadSources, updateAutoDownloadSources,
        t, colors
    } = useSettings();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const SettingItem = ({ icon, label, value, onPress, type = 'arrow' }) => (
        <TouchableOpacity style={styles.item} onPress={onPress} disabled={type === 'switch'}>
            <View style={styles.itemLeft}>
                {icon}
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onPress}
                        trackColor={{ false: '#767577', true: colors.primaryLight }}
                        thumbColor={value ? colors.primary : '#f4f3f4'}
                    />
                ) : type === 'value' ? (
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{value}</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.secondary} />
                    </View>
                ) : (
                    <Feather name="chevron-right" size={20} color={colors.text.secondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Feather name="chevron-left" color={colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionHeader}>{t('general')}</Text>

                <SettingItem
                    icon={<Feather name="globe" size={20} color={colors.text.primary} />}
                    label={t('language')}
                    value={language === 'EN' ? 'English' : language === 'MY' ? 'Bahasa Melayu' : '中文 (简体)'}
                    type="value"
                    onPress={() => {
                        const nextLang = language === 'EN' ? 'MY' : language === 'MY' ? 'CN' : 'EN';
                        updateLanguage(nextLang);
                    }}
                />

                <SettingItem
                    icon={<Feather name="moon" size={20} color={colors.text.primary} />}
                    label="Dark Mode"
                    value={theme === 'dark'}
                    type="switch"
                    onPress={(val) => updateTheme(val ? 'dark' : 'light')}
                />

                <SettingItem
                    icon={<Feather name="wifi" size={20} color={colors.text.primary} />}
                    label={t('syncWifiOnly')}
                    value={wifiOnly}
                    type="switch"
                    onPress={(val) => updateWifiOnly(val)}
                />

                <Text style={styles.sectionHeader}>{t('premium')}</Text>

                <SettingItem
                    icon={<Feather name="zap" size={20} color={colors.text.primary} />}
                    label="Auto Download Current News"
                    value={autoDownload}
                    type="switch"
                    onPress={updateAutoDownload}
                />

                {!isPremium && (
                    <View style={styles.noticeBox}>
                        <Feather name="info" size={16} color={colors.status.warning} />
                        <Text style={styles.noticeText}>
                            Free User Limit: 10 articles per day. Upgrade to Premium for unlimted downloads.
                        </Text>
                    </View>
                )}

                {autoDownload && (
                    <>
                        <SettingItem
                            icon={<Feather name="wifi" size={20} color={colors.text.primary} />}
                            label="Auto Download Wi-Fi Only"
                            value={autoDownloadWifiOnly}
                            type="switch"
                            onPress={updateAutoDownloadWifiOnly}
                        />

                        <Text style={styles.sectionHeader}>Select Sources to Download</Text>
                        {['borneo', 'suara', 'dayak'].map((source) => (
                            <TouchableOpacity
                                key={source}
                                style={styles.checkboxItem}
                                onPress={() => {
                                    const newSources = autoDownloadSources.includes(source)
                                        ? autoDownloadSources.filter(s => s !== source)
                                        : [...autoDownloadSources, source];
                                    updateAutoDownloadSources(newSources);
                                }}
                            >
                                <View style={[
                                    styles.checkbox,
                                    (Array.isArray(autoDownloadSources) ? autoDownloadSources : []).includes(source) && { backgroundColor: colors.primary, borderColor: colors.primary }
                                ]}>
                                    {(Array.isArray(autoDownloadSources) ? autoDownloadSources : []).includes(source) && <Feather name="check" size={14} color={colors.text.inverse} />}
                                </View>
                                <Text style={styles.itemLabel}>
                                    {source === 'borneo' ? 'The Borneo Post' : source === 'suara' ? 'Suara Sarawak' : 'Dayak Daily'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <SettingItem
                    icon={<Feather name="zap" size={20} color={isPremium ? colors.status.success : colors.text.primary} />}
                    label="Test Premium Mode"
                    value={isPremium}
                    type="switch"
                    onPress={togglePremium}
                />

                <Text style={styles.sectionHeader}>{t('support')}</Text>

                <SettingItem
                    icon={<Feather name="message-square" size={20} color={colors.text.primary} />}
                    label="Send Feedback"
                    onPress={() => navigation.navigate('Feedback')}
                />

                <Text style={styles.sectionHeader}>{t('about')}</Text>

                <SettingItem
                    icon={<Feather name="info" size={20} color={colors.text.primary} />}
                    label={t('version')}
                    value="1.0.0"
                    type="value"
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('developedBy')}</Text>
                </View>
            </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 1,
    },
    content: {
        padding: layout.spacing.m,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.text.secondary,
        marginTop: layout.spacing.l,
        marginBottom: layout.spacing.s,
        marginLeft: layout.spacing.s,
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: layout.spacing.m,
        borderRadius: layout.borderRadius.m,
        marginBottom: layout.spacing.s,
        ...layout.shadows.medium,
        shadowColor: colors.cardShadow,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        color: colors.text.primary,
        marginLeft: layout.spacing.m,
        fontWeight: '500',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        color: colors.text.secondary,
        marginRight: layout.spacing.s,
    },
    footer: {
        marginTop: layout.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: layout.spacing.m,
        borderRadius: layout.borderRadius.m,
        marginBottom: layout.spacing.s,
        borderWidth: 1,
        borderColor: colors.status.warning,
    },
    noticeText: {
        fontSize: 12,
        color: colors.text.primary,
        marginLeft: layout.spacing.s,
        flex: 1,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: layout.spacing.s,
        paddingHorizontal: layout.spacing.m,
        backgroundColor: colors.surface,
        marginBottom: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.text.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: layout.spacing.m,
    },
});
