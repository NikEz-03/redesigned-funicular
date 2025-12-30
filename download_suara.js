const https = require('https');
const fs = require('fs');

const url = 'https://suarasarawak.my/feed/';
const file = fs.createWriteStream('suara_feed.xml');

https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download completed');
    });
});
