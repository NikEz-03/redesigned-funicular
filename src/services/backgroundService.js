import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNews } from './newsService';
import { saveArticle, getDailyDownloadCount, incrementDailyDownloadCount } from '../utils/storage';

const BACKGROUND_FETCH_TASK = 'background-news-fetch';
const SETTINGS_KEY = '@app_settings';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        // 1. Load Settings
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!jsonValue) return BackgroundFetch.BackgroundFetchResult.NoData;
        const settings = JSON.parse(jsonValue);

        // Check if Auto Download is enabled
        if (!settings.autoDownload) {
            console.log('[Background] Auto-download disabled by user.');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // 2. Check Network
        const networkState = await Network.getNetworkStateAsync();

        // Robust check for NetworkType (matches newsService.js logic)
        let NetworkType = Network.NetworkType;
        if (!NetworkType && Network.default) {
            NetworkType = Network.default.NetworkType;
        }

        const isWifi = NetworkType ? networkState.type === NetworkType.WIFI : networkState.type === 'WIFI';

        if (settings.autoDownloadWifiOnly && !isWifi) {
            console.log('[Background] Wifi Only enabled, but not on Wifi. Skipping.');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // 3. User Limits (Daily Limit for Free Users)
        const isPremium = settings.isPremium;
        const dailyLimit = 10;

        // 4. Fetch News
        const sources = settings.autoDownloadSources || ['borneo'];
        let newDataReceived = false;

        console.log(`[Background] Starting fetch for sources: ${sources.join(', ')}`);

        for (const source of sources) {
            // Check limit per source
            let sourceCount = 0;
            if (!isPremium) {
                sourceCount = await getDailyDownloadCount(source);
                if (sourceCount >= dailyLimit) {
                    console.log(`[Background] Daily limit reached for ${source}. Skipping.`);
                    continue;
                }
            }

            // Fetch from source
            const { data } = await fetchNews(false, source);

            if (data && data.length > 0) {
                for (const article of data) {
                    // Re-check limit inside loop 
                    if (!isPremium) {
                        if (sourceCount >= dailyLimit) break;
                    }

                    const saved = await saveArticle(article);
                    if (saved) {
                        newDataReceived = true;
                        await incrementDailyDownloadCount(source);
                        sourceCount++; // Local increment to avoid frequent async calls
                    }
                }
            }
        }

        console.log(`[Background] Fetch complete. New data: ${newDataReceived}`);

        if (newDataReceived) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "New Articles Downloaded",
                    body: "Fresh news is available for offline reading.",
                },
                trigger: null, // Show immediately
            });
        }

        return newDataReceived ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;

    } catch (error) {
        console.error("[Background] Fetch failed:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Register the task
export const registerBackgroundFetch = async () => {
    try {
        const isArgs = {
            minimumInterval: 60 * 15, // 15 minutes (minimum allowed by Android/iOS is usually ~15m)
            stopOnTerminate: false,   // Android only
            startOnBoot: true,        // Android only
        };
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, isArgs);
        console.log("[Background] Task registered successfully");
    } catch (err) {
        console.log("[Background] Task failed to register", err);
    }
};

// Unregister the task
export const unregisterBackgroundFetch = async () => {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        console.log("[Background] Task unregistered");
    } catch (err) {
        console.log("[Background] Task failed to unregister", err);
    }
};
