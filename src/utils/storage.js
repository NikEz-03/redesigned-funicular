import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_articles';
const FEED_CACHE_KEY = '@feed_cache';
const DAILY_LIMIT_KEY = '@daily_download_limit';

export const saveArticle = async (article) => {
    try {
        const savedArticles = await getSavedArticles();
        const exists = savedArticles.find((a) => a.id === article.id);

        if (!exists) {
            const articleWithMeta = {
                ...article,
                downloadedAt: new Date().toISOString()
            };
            const newArticles = [articleWithMeta, ...savedArticles];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
            return true;
        }
        return false; // Already saved
    } catch (e) {
        console.error('Error saving article:', e);
        return false;
    }
};

export const getSavedArticles = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading articles:', e);
        return [];
    }
};

export const removeArticle = async (id) => {
    try {
        const savedArticles = await getSavedArticles();
        const newArticles = savedArticles.filter((a) => a.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
        return true;
    } catch (e) {
        console.error('Error removing article:', e);
        return false;
    }
};

export const deleteArticles = async (ids) => {
    try {
        const savedArticles = await getSavedArticles();
        const newArticles = savedArticles.filter((a) => !ids.includes(a.id));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
        return true;
    } catch (e) {
        console.error('Error deleting articles:', e);
        return false;
    }
};

export const clearAllArticles = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('Error clearing articles:', e);
        return false;
    }
};

export const saveFeedCache = async (articles) => {
    try {
        await AsyncStorage.setItem(FEED_CACHE_KEY, JSON.stringify(articles));
        return true;
    } catch (e) {
        console.error('Error saving feed cache:', e);
        return false;
    }
};

export const getFeedCache = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(FEED_CACHE_KEY);
        if (jsonValue != null) {
            const parsed = JSON.parse(jsonValue);
            // Sanitize cached data in case it contains bad IDs from previous runs
            return parsed.map(item => ({
                ...item,
                id: (typeof item.id === 'object' ? item.id['#text'] : item.id) || item.id
            }));
        }
        return [];
    } catch (e) {
        console.error('Error reading feed cache:', e);
        return [];
    }
};

// Returns count for specific source, or 0 if none found for today
export const getDailyDownloadCount = async (source = 'total') => {
    try {
        const jsonValue = await AsyncStorage.getItem(DAILY_LIMIT_KEY);
        const today = new Date().toISOString().split('T')[0];

        if (jsonValue != null) {
            const data = JSON.parse(jsonValue);
            // Check if date matches today
            if (data.date === today) {
                // If asking for specific source
                if (data.counts && typeof data.counts === 'object') {
                    return data.counts[source] || 0;
                }
                // Legacy/Total fallback (though we should migrate away)
                if (source === 'total') return data.count || 0;
                return 0;
            }
        }
        return 0;
    } catch (e) {
        console.error('Error getting daily count:', e);
        return 0;
    }
};

export const incrementDailyDownloadCount = async (source = 'bornyeo') => { // Default to prevent error, but caller should specify
    try {
        const today = new Date().toISOString().split('T')[0];
        const jsonValue = await AsyncStorage.getItem(DAILY_LIMIT_KEY);

        let newData = {
            date: today,
            counts: {}
        };

        if (jsonValue != null) {
            const data = JSON.parse(jsonValue);
            if (data.date === today) {
                newData = data;
                if (!newData.counts) newData.counts = {}; // Initialize if migrating from legacy
            }
        }

        // Increment specific source
        const currentSourceCount = newData.counts[source] || 0;
        newData.counts[source] = currentSourceCount + 1;

        // Keep track of total too just in case? Optional, but let's just stick to source limits.

        await AsyncStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(newData));
        return newData.counts[source];
    } catch (e) {
        console.error('Error incrementing daily count:', e);
        return 0;
    }
};
