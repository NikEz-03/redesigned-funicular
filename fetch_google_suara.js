const https = require('https');
const { XMLParser } = require('fast-xml-parser');

const url = 'https://news.google.com/rss/search?q=site:suarasarawak.my&hl=ms-MY&gl=MY&ceid=MY:ms';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
        const result = parser.parse(data);
        const channel = result.rss.channel;
        const items = Array.isArray(channel.item) ? channel.item : [channel.item];

        console.log(`Found ${items.length} items.`);

        // Check first 3 items
        for (let i = 0; i < Math.min(3, items.length); i++) {
            const item = items[i];
            console.log(`\nItem ${i + 1}: ${item.title}`);
            if (item.description) console.log('Description start:', item.description.substring(0, 150));
        }
    });
}).on('error', (e) => {
    console.error(e);
});
