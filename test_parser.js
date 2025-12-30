const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xmlData = fs.readFileSync('suara_feed.xml', 'utf8');

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});
const result = parser.parse(xmlData);
const item = result.rss.channel.item[2]; // Pick the 3rd item which had an image in line 195

console.log('Keys:', Object.keys(item));
console.log('Content Encoded:', item['content:encoded'] ? 'Found' : 'Missing');
if (item['content:encoded']) {
    console.log('Snippet:', item['content:encoded'].substring(0, 500));
}
