import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { layout } from '../theme/layout';
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const { t, colors } = useSettings();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto navigate after 3 seconds (Restoring original behavior)
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={{ uri: 'https://sarawak.gov.my/assets/images/bg_main.jpg' }}
                style={styles.background}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradient}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>SARAWAK</Text>
                            <Text style={styles.subtitle}>DIGITAL ACCESS</Text>
                            <View style={[styles.divider, { backgroundColor: colors.primary }]} />
                            <Text style={styles.description}>{t('welcomeSubtitle')}</Text>
                        </View>
                    </Animated.View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: layout.spacing.xl,
    },
    content: {
        marginBottom: layout.spacing.xxl,
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 2,
        includeFontPadding: false,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '300',
        color: '#E04F5F', // Default primary, or use dynamic if needed, but this is on dark bg
        letterSpacing: 4,
        marginTop: -5,
        marginBottom: layout.spacing.l,
    },
    divider: {
        width: 60,
        height: 4,
        // backgroundColor set dynamically
        marginBottom: layout.spacing.l,
        borderRadius: 2,
    },
    description: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        lineHeight: 24,
        maxWidth: width * 0.8,
    },
});
