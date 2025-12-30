import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';
import { themes } from '../theme/colors';
import { registerBackgroundFetch, unregisterBackgroundFetch } from '../services/backgroundService';
import * as Notifications from 'expo-notifications';

const SettingsContext = createContext();

const SETTINGS_KEY = '@app_settings';

export const SettingsProvider = ({ children }) => {
    const [language, setLanguage] = useState('EN');
    const [wifiOnly, setWifiOnly] = useState(true);
    const [theme, setTheme] = useState('light'); // 'light' or 'dark'
    const [isPremium, setIsPremium] = useState(false);
    const [autoDownload, setAutoDownload] = useState(false);
    const [autoDownloadWifiOnly, setAutoDownloadWifiOnly] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [autoDownloadSources, setAutoDownloadSources] = useState(['borneo']); // Default to Borneo

    useEffect(() => {
        loadSettings();
    }, []);

    // Manage Background Fetch Registration
    useEffect(() => {
        const manageBackgroundFetch = async () => {
            if (autoDownload) {
                await registerBackgroundFetch();
            } else {
                await unregisterBackgroundFetch();
            }
        };
        manageBackgroundFetch();
    }, [autoDownload]);

    const loadSettings = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
            if (jsonValue != null) {
                const settings = JSON.parse(jsonValue);
                if (settings.language) setLanguage(settings.language);
                if (settings.wifiOnly !== undefined) setWifiOnly(settings.wifiOnly);
                if (settings.theme) setTheme(settings.theme);
                if (settings.isPremium !== undefined) setIsPremium(settings.isPremium);
                if (settings.autoDownload !== undefined) setAutoDownload(settings.autoDownload);
                if (settings.autoDownloadWifiOnly !== undefined) setAutoDownloadWifiOnly(settings.autoDownloadWifiOnly);
                if (settings.autoDownloadSources && Array.isArray(settings.autoDownloadSources)) {
                    setAutoDownloadSources(settings.autoDownloadSources);
                } else {
                    // Fallback if data is corrupted or missing
                    setAutoDownloadSources(['borneo']);
                }
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            const currentSettings = {
                language,
                wifiOnly,
                theme,
                isPremium,
                autoDownload,
                autoDownloadWifiOnly,
                autoDownloadSources,
                ...newSettings
            };
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
        } catch (e) {
            console.error('Failed to save settings', e);
        }
    };

    const updateLanguage = (lang) => {
        setLanguage(lang);
        saveSettings({ language: lang });
    };

    const updateWifiOnly = (enabled) => {
        setWifiOnly(enabled);
        saveSettings({ wifiOnly: enabled });
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        saveSettings({ theme: newTheme });
    };

    const updateAutoDownload = async (enabled) => {
        if (enabled) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert(
                    "Notifications Required",
                    "To be notified when news is auto-downloaded, please enable notifications in Settings.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() }
                    ]
                );
            }
        }
        setAutoDownload(enabled);
        saveSettings({ autoDownload: enabled });
    };

    const updateAutoDownloadWifiOnly = (enabled) => {
        setAutoDownloadWifiOnly(enabled);
        saveSettings({ autoDownloadWifiOnly: enabled });
    };

    const updateAutoDownloadSources = (sources) => {
        setAutoDownloadSources(sources);
        saveSettings({ autoDownloadSources: sources });
    };

    const togglePremium = () => {
        setIsPremium(prev => {
            const newValue = !prev;
            saveSettings({ isPremium: newValue });
            return newValue;
        });
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const colors = themes[theme];

    return (
        <SettingsContext.Provider value={{
            language,
            wifiOnly,
            theme,
            colors,
            updateLanguage,
            updateWifiOnly,
            updateTheme,
            isPremium,
            togglePremium,
            autoDownload,
            updateAutoDownload,
            autoDownloadWifiOnly,
            updateAutoDownloadWifiOnly,
            autoDownloadSources,
            updateAutoDownloadSources,
            t,
            isLoading
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
