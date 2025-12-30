const https = require('https');

const url = 'https://suarasarawak.my/feed/';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
        if (data.includes('</item>')) { // Stop after first item
            res.destroy();
            console.log(data.substring(data.indexOf('<item>'), data.indexOf('</item>') + 7));
        }
    });
    res.on('end', () => {
        // If it ended without destroying
    });
}).on('error', (e) => {
    console.error(e);
});
