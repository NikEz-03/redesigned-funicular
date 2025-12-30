import * as Network from 'expo-network';
import { XMLParser } from 'fast-xml-parser';
import { saveFeedCache, getFeedCache } from '../utils/storage';

const SOURCES = {
    borneo: {
        id: 'borneo',
        name: 'The Borneo Post',
        // Support multiple URLs for XML fallback
        urls: [
            'https://www.theborneopost.com/news/sarawak/feed/',
            'https://www.theborneopost.com/feed/'
        ],
        format: 'xml',
        verifyCert: true
    },
    suara: {
        id: 'suara',
        name: 'Suara Sarawak',
        url: 'https://suarasarawak.my/wp-json/wp/v2/posts?_embed&per_page=20',
        format: 'json',
        verifyCert: false
    },
    dayak: {
        id: 'dayak',
        name: 'Dayak Daily',
        url: 'https://dayakdaily.com/wp-json/wp/v2/posts?_embed&per_page=20',
        format: 'json',
        verifyCert: false
    }
};

export const fetchNews = async (wifiOnly = false, sourceKey = 'borneo') => {
    try {
        // Fallback to default if sourceKey is invalid
        const source = SOURCES[sourceKey] || SOURCES.borneo;

        // Network logic
        const networkState = await Network.getNetworkStateAsync();
        const isConnected = networkState.isConnected && networkState.isInternetReachable;

        // Robust check for NetworkType
        let NetworkType = Network.NetworkType;
        if (!NetworkType && Network.default) {
            NetworkType = Network.default.NetworkType;
        }
        const isWifi = NetworkType ? networkState.type === NetworkType.WIFI : networkState.type === 'WIFI';
        const shouldFetch = isConnected && (!wifiOnly || isWifi);

        if (!shouldFetch) {
            const cached = await getFeedCache(sourceKey);
            return { data: cached, source: 'cache' };
        }

        let responseData = null;
        let responseType = 'text';

        // ---------------------------------------------------------
        // JSON FETCHING (WordPress API)
        // ---------------------------------------------------------
        if (source.format === 'json') {
            console.log(`[NewsService] Fetching ${source.name} (JSON) from: ${source.url}`);
            try {
                const response = await fetch(source.url);
                if (response.ok) {
                    const json = await response.json();

                    const newsItems = json.map(item => {
                        let imageUrl = null;
                        // 1. Try WP Featured Media (Standard)
                        if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
                            imageUrl = item._embedded['wp:featuredmedia'][0].source_url;
                        }

                        // 2. Fallback Defaults
                        if (!imageUrl) {
                            if (sourceKey === 'suara') imageUrl = 'https://suarasarawak.my/wp-content/uploads/2021/04/Logo-Suara-Sarawak-baru.png';
                            if (sourceKey === 'dayak') imageUrl = 'https://dayakdaily.com/wp-content/uploads/2019/08/dayakdaily-logo-web.png';
                        }

                        // Clean Excerpt
                        const description = item.excerpt && item.excerpt.rendered ?
                            item.excerpt.rendered.replace(/<[^>]+>/g, '').replace('[&hellip;]', '...').trim()
                            : '';

                        return {
                            id: item.id.toString(),
                            headline: item.title.rendered,
                            description: description,
                            content: item.content.rendered, // HTML content
                            date: item.date, // ISO Date string
                            source: source.name,
                            imageUrl: imageUrl,
                            url: item.link,
                            verified: false
                        };
                    });

                    await saveFeedCache(newsItems, sourceKey);
                    return { data: newsItems, source: 'online' };

                } else {
                    console.log(`[NewsService] Failed to fetch JSON for ${sourceKey}: ${response.status}`);
                }
            } catch (e) {
                console.error(`[NewsService] Error fetching JSON for ${sourceKey}: ${e.message}`);
            }
        }

        // ---------------------------------------------------------
        // XML FETCHING (RSS)
        // ---------------------------------------------------------
        else {
            const feedUrls = source.urls ? source.urls : [source.url];
            for (const RSS_URL of feedUrls) {
                console.log(`[NewsService] Fetching ${source.name || sourceKey} (XML) from: ${RSS_URL}`);
                try {
                    const response = await fetch(RSS_URL);
                    const xml = await response.text();

                    const parser = new XMLParser({
                        ignoreAttributes: false,
                        attributeNamePrefix: "@_"
                    });
                    const result = parser.parse(xml);
                    const channel = result.rss?.channel || result.feed;
                    const items = channel?.item || channel?.entry || [];

                    if (items.length === 0) continue;

                    const newsItems = items.map((item, index) => {
                        // Content extraction
                        let content = item['content:encoded'] || item.description || '';
                        if (typeof content === 'object') content = '';

                        // Default Image Fallbacks based on source
                        let imageUrl = 'https://www.theborneopost.com/wp-content/uploads/2014/09/theborneopost.jpg';

                        // Image Extraction Strategy
                        if (item['media:content'] && item['media:content']['@_url']) {
                            imageUrl = item['media:content']['@_url'];
                        } else if (item['enclosure'] && item['enclosure']['@_url'] && item['enclosure']['@_type']?.startsWith('image')) {
                            imageUrl = item['enclosure']['@_url'];
                        }

                        // Regex fallback
                        const isPlaceholder = imageUrl.includes('theborneopost.jpg') ||
                            imageUrl.toLowerCase().includes('logo') ||
                            imageUrl.includes('default');

                        if (isPlaceholder) {
                            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (imgMatch) imageUrl = imgMatch[1];
                            if (imageUrl.includes('-150x150') || imageUrl.includes('-300x')) {
                                imageUrl = imageUrl.replace(/-150x150|-300x\d+/, '');
                            }
                        }

                        const stripHtml = (html) => {
                            if (!html) return '';
                            return html
                                .replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<p[^>]*>/gi, '\n\n')
                                .replace(/<\/p>/gi, '')
                                .replace(/<[^>]+>/g, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&#8217;/g, "'")
                                .replace(/&#8220;/g, '"')
                                .replace(/&#8221;/g, '"')
                                .replace(/\n\s*\n/g, '\n\n')
                                .trim();
                        };

                        return {
                            id: (typeof item.guid === 'object' ? item.guid['#text'] : item.guid) || `${sourceKey}-${index}`,
                            headline: item.title,
                            date: item.pubDate || item.updated,
                            source: source.name,
                            content: stripHtml(content),
                            imageUrl: imageUrl,
                            url: item.link,
                            verified: false
                        };
                    });

                    await saveFeedCache(newsItems, sourceKey);
                    return { data: newsItems, source: 'online' };

                } catch (error) {
                    console.error(`Error fetching ${sourceKey} from ${RSS_URL}:`, error);
                }
            }
        }

        // If all failed, use cache
        console.log(`[NewsService] All feeds failed for ${sourceKey}, using cache.`);
        const cached = await getFeedCache(sourceKey);
        return { data: cached, source: 'cache' };

    } catch (error) {
        console.error('Error in news service:', error);
        return { data: [], source: 'error' };
    }
};
