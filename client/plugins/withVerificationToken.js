const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to copy the Google Play verification token into the Android assets
 * during the build process. This is necessary because the /android folder is ignored in Git
 * and regenerated from scratch by EAS Build in the cloud.
 */
const withVerificationToken = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const tokenSourcePath = path.join(projectRoot, 'assets', 'adi-registration.properties');
      
      // The path to the generated Android assets folder in the build environment
      const assetsPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');
      const tokenDestPath = path.join(assetsPath, 'adi-registration.properties');

      if (fs.existsSync(tokenSourcePath)) {
        console.log(`[withVerificationToken] Copying token to ${tokenDestPath}`);
        
        // Ensure the directory exists
        if (!fs.existsSync(assetsPath)) {
          fs.mkdirSync(assetsPath, { recursive: true });
        }
        
        fs.copyFileSync(tokenSourcePath, tokenDestPath);
      } else {
        console.warn(`[withVerificationToken] Token source file not found at ${tokenSourcePath}`);
      }
      
      return config;
    },
  ]);
};

module.exports = withVerificationToken;
