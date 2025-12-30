import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { layout } from '../theme/layout';
import { BadgeCheck, AlertTriangle } from 'lucide-react-native';

export const NewsCard = ({ article, onPress, onLongPress, selectable, selected }) => {
    const { colors } = useSettings();
    const isWarning = article.isWarning;
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={[styles.card, selected && styles.cardSelected]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            {selectable && (
                <View style={styles.selectionContainer}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <View style={styles.checkboxInner} />}
                    </View>
                </View>
            )}
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    {article.verified ? (
                        <View style={styles.badgeContainer}>
                            <BadgeCheck size={14} color={colors.status.success} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    ) : isWarning ? (
                        <View style={[styles.badgeContainer, { backgroundColor: colors.theme === 'dark' ? '#3E2723' : '#FFF8E1' }]}>
                            <AlertTriangle size={14} color={colors.status.warning} />
                            <Text style={[styles.verifiedText, { color: colors.status.warning }]}>Potentially Fake</Text>
                        </View>
                    ) : null}
                    <Text style={styles.date}>
                        {new Date(article.date).toLocaleDateString()}
                    </Text>
                </View>

                <Text style={styles.headline} numberOfLines={2}>
                    {article.headline}
                </Text>

                <Text style={styles.source}>{article.source}</Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.l,
        marginBottom: layout.spacing.m,
        padding: layout.spacing.m,
        ...layout.shadows.small,
        shadowColor: colors.cardShadow,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        flexDirection: 'row',
    },
    cardSelected: {
        borderColor: colors.primary,
        borderWidth: 1,
        borderLeftWidth: 4,
    },
    selectionContainer: {
        justifyContent: 'center',
        paddingRight: layout.spacing.m,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.text.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: colors.text.inverse,
        borderRadius: 2,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.s,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.theme === 'dark' ? '#1B5E20' : '#E8F5E9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: layout.borderRadius.s,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.status.success,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    headline: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: layout.spacing.s,
        lineHeight: 22,
    },
    source: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
});
