const fs = require('fs');
const path = require('path');

const gradlePath = path.join('android', 'app', 'build.gradle');
let content = fs.readFileSync(gradlePath, 'utf8');

// Regex to find the release block inside buildTypes
const releaseBlockRegex = /buildTypes\s*{[\s\S]*?release\s*{([\s\S]*?)}/;
const match = content.match(releaseBlockRegex);

if (match) {
    let releaseBlock = match[1];
    let newReleaseBlock = releaseBlock;

    // Replace minifyEnabled true with false
    if (newReleaseBlock.includes('minifyEnabled true')) {
        newReleaseBlock = newReleaseBlock.replace('minifyEnabled true', 'minifyEnabled false');
        console.log('Set minifyEnabled to false');
    }

    // Replace shrinkResources true with false
    if (newReleaseBlock.includes('shrinkResources true')) {
        newReleaseBlock = newReleaseBlock.replace('shrinkResources true', 'shrinkResources false');
        console.log('Set shrinkResources to false');
    }

    // If they weren't present, we might want to add them, but usually they are there in the default template.
    // Let's just replace the block.
    content = content.replace(releaseBlock, newReleaseBlock);
    fs.writeFileSync(gradlePath, content);
    console.log('Updated build.gradle to disable minification in release build.');
} else {
    console.error('Could not find release block in build.gradle');
}
