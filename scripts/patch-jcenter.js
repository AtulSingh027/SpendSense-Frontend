const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'react-native-get-sms-android', 'android', 'build.gradle');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('jcenter()')) {
    console.log('Patching react-native-get-sms-android/android/build.gradle: replacing jcenter() with mavenCentral()');
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Patch applied successfully!');
  } else {
    console.log('react-native-get-sms-android/android/build.gradle already patched or does not contain jcenter()');
  }
} else {
  console.warn('Target file react-native-get-sms-android/android/build.gradle not found.');
}
