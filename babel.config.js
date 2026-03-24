const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: path.resolve(__dirname, '.env'),
        safe: false,
        allowUndefined: true,
        // 노출할 변수 명시 (없으면 번들에 안 들어갈 수 있음)
        allowList: [
          'TVLY_API_KEY',
          'GEMINI_API_KEY',
          'GROQ_API_KEY',
          'KAKAO_REST_API_KEY',
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
        ],
      },
    ],
    [
      'module-resolver',
      {
        root: [path.resolve(__dirname)],
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    // Reanimated 4 worklet 변환용 - 반드시 plugins 배열의 마지막에 위치
    'react-native-worklets/plugin',
  ],
};
