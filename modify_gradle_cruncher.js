const fs = require('fs');
const path = require('path');

const gradlePath = path.join('android', 'app', 'build.gradle');
let content = fs.readFileSync(gradlePath, 'utf8');

if (!content.includes('cruncherEnabled = false')) {
    // Look for android { ... } block
    const androidBlockRegex = /android\s*{/;
    if (androidBlockRegex.test(content)) {
        content = content.replace(androidBlockRegex, 'android {\n    aaptOptions { cruncherEnabled = false }');
        fs.writeFileSync(gradlePath, content);
        console.log('Added cruncherEnabled = false to build.gradle');
    } else {
        console.error('Could not find android block in build.gradle');
    }
} else {
    console.log('cruncherEnabled = false already present');
}
