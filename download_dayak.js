const https = require('https');
const fs = require('fs');

const url = 'https://dayakdaily.com/feed/';
const file = fs.createWriteStream('dayak_feed.xml');

https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download completed');
    });
});
