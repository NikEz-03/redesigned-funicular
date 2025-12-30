const fs = require('fs');
const path = 'android/app/build.gradle';

try {
    let content = fs.readFileSync(path, 'utf8');
    if (content.includes('signingConfigs {')) {
        content = content.replace('signingConfigs {', 'aaptOptions { cruncherEnabled = false }\n    signingConfigs {');
        fs.writeFileSync(path, content, 'utf8');
        console.log('Successfully modified build.gradle');
    } else {
        console.error('Could not find signingConfigs block');
    }
} catch (err) {
    console.error('Error modifying file:', err);
}
