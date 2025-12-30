const https = require('https');

const urls = [
    'https://suarasarawak.my/wp-json/wp/v2/posts?_embed&per_page=1',
    'https://dayakdaily.com/wp-json/wp/v2/posts?_embed&per_page=1'
];

urls.forEach(url => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(data);
                    const item = json[0];
                    console.log(`\nSUCCESS ${url}`);
                    console.log(`Title: ${item.title.rendered}`);
                    console.log(`Has Content: ${!!item.content.rendered}`);
                    if (item._embedded && item._embedded['wp:featuredmedia']) {
                        console.log(`Featured Image: ${item._embedded['wp:featuredmedia'][0].source_url}`);
                    } else {
                        console.log('Featured Image: MISSING in _embedded');
                    }
                } catch (e) {
                    console.error(`ERROR parsing JSON for ${url}:`, e);
                }
            } else {
                console.error(`FAILED ${url}: Status ${res.statusCode}`);
            }
        });
    }).on('error', e => console.error(e));
});
