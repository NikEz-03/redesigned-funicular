const https = require('https');

const urls = [
    'https://suarasarawak.my/feed/',
    'https://dayakdaily.com/feed'
];

urls.forEach(url => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`\n--- START ${url} ---`);
            console.log(data.substring(0, 3000)); // First 3000 chars
            console.log(`--- END ${url} ---\n`);
        });
    }).on('error', (e) => {
        console.error(e);
    });
});
