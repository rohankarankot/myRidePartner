module.exports = function (api) {
  api.cache(true);
  const nativeWindBabel = require('nativewind/babel');
  const nativeWindConfig = nativeWindBabel();

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
          },
        },
      ],
      ...nativeWindConfig.plugins,
    ],
  };
};
