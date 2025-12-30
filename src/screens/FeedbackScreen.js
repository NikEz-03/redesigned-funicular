import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { layout } from '../theme/layout';
import { ArrowLeft, Send, Star } from 'lucide-react-native';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function FeedbackScreen({ navigation }) {
    const { t, colors } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Feedback');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    const categories = ['Feedback', 'Bug Report', 'Feature Request', 'Other'];

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert(t('error'), 'Please enter a message.');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert(t('error'), 'Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const data = {
                name: name || 'Anonymous',
                email: email || 'Not provided',
                category,
                message,
                timestamp: new Date().toISOString(),
                platform: 'Android'
            };

            if (category === 'Feedback') {
                data.rating = rating;
            }

            await addDoc(collection(db, "feedback"), data);

            Alert.alert(
                t('success'),
                'Thank you for your feedback!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert(t('error'), 'Could not send feedback. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft color={colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>USER FEEDBACK</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {category === 'Feedback' && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.label}>Rate your experience</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Star
                                        size={32}
                                        color={star <= rating ? "#FFD700" : colors.border}
                                        fill={star <= rating ? "#FFD700" : "transparent"}
                                        style={{ marginRight: 8 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Name (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={colors.text.secondary}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Email (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="contact@email.com"
                    placeholderTextColor={colors.text.secondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Message</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell us what you think..."
                    placeholderTextColor={colors.text.secondary}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                        <>
                            <Send color={colors.text.inverse} size={20} />
                            <Text style={styles.submitButtonText}>SUBMIT FEEDBACK</Text>
                        </>
                    )}
                </TouchableOpacity>
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
        paddingVertical: layout.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        letterSpacing: 1,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        padding: layout.spacing.l,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: layout.spacing.s,
        marginTop: layout.spacing.m,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.borderRadius.m,
        padding: layout.spacing.m,
        color: colors.text.primary,
        fontSize: 16,
    },
    textArea: {
        height: 120,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: layout.spacing.s,
    },
    categoryChip: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.borderRadius.l,
        paddingHorizontal: layout.spacing.m,
        paddingVertical: layout.spacing.s,
        marginRight: layout.spacing.s,
        marginBottom: layout.spacing.s,
        backgroundColor: colors.surface,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        color: colors.text.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: colors.text.inverse,
        fontWeight: '700',
    },
    submitButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.m,
        borderRadius: layout.borderRadius.m,
        marginTop: layout.spacing.xl,
        ...layout.shadows.medium,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.text.inverse,
        fontWeight: 'bold',
        marginLeft: layout.spacing.s,
        fontSize: 16,
        letterSpacing: 1,
    },
    ratingContainer: {
        marginBottom: layout.spacing.m,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
