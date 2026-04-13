const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const gradleFilePath = path.join(
  rootDir,
  'node_modules',
  'react-native-text-recognition',
  'android',
  'build.gradle',
);

const javaFilePath = path.join(
  rootDir,
  'node_modules',
  'react-native-text-recognition',
  'android',
  'src',
  'main',
  'java',
  'com',
  'reactnativetextrecognition',
  'TextRecognitionModule.java',
);

function patchGradleFile() {
  if (!fs.existsSync(gradleFilePath)) {
    console.warn('[patch-text-recognition] build.gradle not found, skipping.');
    return;
  }

  let content = fs.readFileSync(gradleFilePath, 'utf8');
  let original = content;

  // Patch SDK versions
  content = content.replace(/compileSdkVersion safeExtGet\('TextRecognition_compileSdkVersion', 29\)/g, "compileSdkVersion safeExtGet('TextRecognition_compileSdkVersion', 36)");
  content = content.replace(/buildToolsVersion safeExtGet\('TextRecognition_buildToolsVersion', '29\.0\.2'\)/g, "buildToolsVersion safeExtGet('TextRecognition_buildToolsVersion', '36.0.0')");
  content = content.replace(/minSdkVersion safeExtGet\('TextRecognition_minSdkVersion', 16\)/g, "minSdkVersion safeExtGet('TextRecognition_minSdkVersion', 24)");
  content = content.replace(/targetSdkVersion safeExtGet\('TextRecognition_targetSdkVersion', 29\)/g, "targetSdkVersion safeExtGet('TextRecognition_targetSdkVersion', 36)");

  // Patch dependencies to fix runtime "Detector" class missing error
  // We replace the existing mlkit line with both text-recognition and vision-common
  const mlKitDependency = "implementation 'com.google.android.gms:play-services-mlkit-text-recognition:19.0.0'";
  const visionCommonDependency = "implementation 'com.google.mlkit:vision-common:17.3.0'";

  content = content.replace(
    /implementation ['"]com\.google\.android\.gms:play-services-mlkit-text-recognition:.*['"]/g,
    `${mlKitDependency}\n    ${visionCommonDependency}`
  );
  content = content.replace(
    /implementation ['"]com\.google\.mlkit:text-recognition:.*['"]/g,
    `${mlKitDependency}\n    ${visionCommonDependency}`
  );

  if (content !== original) {
    fs.writeFileSync(gradleFilePath, content);
    console.log('[patch-text-recognition] Patched build.gradle successfully.');
  } else {
    console.log('[patch-text-recognition] build.gradle already patched or strings not found.');
  }
}

function patchJavaFile() {
  if (!fs.existsSync(javaFilePath)) {
    console.warn('[patch-text-recognition] TextRecognitionModule.java not found, skipping.');
    return;
  }

  let content = fs.readFileSync(javaFilePath, 'utf8');
  let original = content;

  // Fix the import for new ML Kit version
  content = content.replace(
    /import com\.google\.mlkit\.vision\.text\.TextRecognizerOptions;/g,
    'import com.google.mlkit.vision.text.latin.TextRecognizerOptions;'
  );

  if (content !== original) {
    fs.writeFileSync(javaFilePath, content);
    console.log('[patch-text-recognition] Patched TextRecognitionModule.java successfully.');
  } else {
    console.log('[patch-text-recognition] TextRecognitionModule.java already patched or strings not found.');
  }
}

console.log('[patch-text-recognition] Starting patches...');
patchGradleFile();
patchJavaFile();
console.log('[patch-text-recognition] All patches complete.');
