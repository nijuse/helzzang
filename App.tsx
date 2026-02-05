/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Header, Input, ThemeProvider, Icon, Button } from '@rneui/themed';  
import { StatusBar, StyleSheet, useColorScheme, View, Pressable } from 'react-native';
import {
  SafeAreaProvider, 
} from 'react-native-safe-area-context';
import { theme } from './themed'
import { useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <View style={[styles.container]} >
      <Header
        style={styles.header}
        containerStyle={styles.headerContainer}
        // leftComponent={<Image source={require('./assets/images/logo.png')} style={styles.headerLogo} />}
        rightComponent={
          <Pressable onPress={() => {}}>
            <Icon type="material" iconProps={{ name: "menu" }} />
          </Pressable>
        }
      />
      <View style={styles.contents}>
        <Input 
          placeholder="검색어를 입력하세요" 
          rightIcon={<Icon type="material" iconProps={{ name: "search" }} />}
          containerStyle={styles.inputContainer}
        />
        <View style={styles.buttonContainer}>
          <Button title="SIMPLE" type="outline"  />
          <Button title="BUTTON" type="outline"  />
          <Button title="GROUP" type="outline"  />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
      boxSizing: 'border-box',
  },
  header: {
    padding: 24,
    height: 60,
  },
  headerContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLogo: {
    width:140,
    height: 40,
  },
  contents: {
    flex: 1,
    padding: 24,
    width: '100%',
    height: '100%',
    justifyContent:  'flex-start',
    alignItems: 'flex-start',
  },
  inputContainer: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },
  iconText: {
    fontSize: 14,
  },

});

export default App;
