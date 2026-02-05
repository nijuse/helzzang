/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Button, Icon, Text, ThemeProvider } from '@rneui/themed';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text h3 style={styles.title}>
        helzzang
      </Text>
      <Text style={styles.subtitle}>
        React Native Elements가 연결되었습니다.
      </Text>
      <Button title="시작하기" />
      <View style={styles.iconRow}>
        <Icon name="rocket" type="font-awesome" />
        <Text style={styles.iconText}>아이콘 폰트 로드 완료</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  iconRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconText: {
    fontSize: 14,
  },
});

export default App;
