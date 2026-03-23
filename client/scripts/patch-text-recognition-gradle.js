const fs = require('fs');
const path = require('path');

const gradleFilePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-text-recognition',
  'android',
  'build.gradle',
);

function patchGradleFile() {
  if (!fs.existsSync(gradleFilePath)) {
    console.warn(
      '[patch-text-recognition-gradle] react-native-text-recognition is not installed yet, skipping patch.',
    );
    return;
  }

  const original = fs.readFileSync(gradleFilePath, 'utf8');

  const patched = original
    .replace(
      "compileSdkVersion safeExtGet('TextRecognition_compileSdkVersion', 29)",
      "compileSdkVersion safeExtGet('TextRecognition_compileSdkVersion', 36)",
    )
    .replace(
      "buildToolsVersion safeExtGet('TextRecognition_buildToolsVersion', '29.0.2')",
      "buildToolsVersion safeExtGet('TextRecognition_buildToolsVersion', '36.0.0')",
    )
    .replace(
      "minSdkVersion safeExtGet('TextRecognition_minSdkVersion', 16)",
      "minSdkVersion safeExtGet('TextRecognition_minSdkVersion', 24)",
    )
    .replace(
      "targetSdkVersion safeExtGet('TextRecognition_targetSdkVersion', 29)",
      "targetSdkVersion safeExtGet('TextRecognition_targetSdkVersion', 36)",
    );

  if (patched === original) {
    console.log(
      '[patch-text-recognition-gradle] Gradle file already patched or expected lines not found.',
    );
    return;
  }

  fs.writeFileSync(gradleFilePath, patched);
  console.log('[patch-text-recognition-gradle] Patched react-native-text-recognition Android SDK values.');
}

patchGradleFile();
