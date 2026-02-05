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
import { useEffect, useState } from 'react';
import GetLocation, {
  Location,
  // LocationErrorCode,
  isLocationError,
} from 'react-native-get-location';
import { KAKAO_REST_API_KEY } from '@env';

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
  const defaultLocation = {longitude: 127.0306456, latitude: 37.4993136, altitude: 0, accuracy: 0, speed: 0, time: 0};
  const [location, setLocation] = useState<Location | null>(defaultLocation);
  const [searchText, setSearchText] = useState('');
  const handleSearch = (text: string) => {
    setSearchText(text);
  };
  const handleSearchPress = async () => {
    console.log(searchText, location, KAKAO_REST_API_KEY );
      if (location) {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchText}&x=${location.longitude}&y=${location.latitude}&radius=1000&sort=distance`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    )
        const data = await response.json()
        console.log(data)
    if (data.documents.length > 0) {
      const results = data.documents.map((doc: { y: number; x: number; place_name: string }) => ({
        latitude: doc.y,
        longitude: doc.x,
        place_name: doc.place_name,
      }))
      console.log(results)
    } else {
      console.log('검색 결과가 없습니다.')
    }
  }
  };
  

  const requestLocation = () => {
    setLocation(null);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      rationale: {
        title: 'Location permission',
        message: 'The app needs the permission to request your location.',
        buttonPositive: 'Ok',
      },
    })
      .then(newLocation => {
        setLocation(newLocation);
      })
      .catch(ex => {
        if (isLocationError(ex)) {
          const {code, message} = ex;
          console.warn(code, message);
        } else {
          console.warn(ex);
        }
        setLocation(defaultLocation);
      });
  };

  useEffect(() => {
    requestLocation();
  }, []);

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
          value={searchText}
          onChangeText={handleSearch}
          rightIcon={<Icon type="material" iconProps={{ name: "search" }} />}
          containerStyle={styles.inputContainer}
          onSubmitEditing={handleSearchPress}
        />
        <View style={styles.buttonContainer}>
          <Button title="일일권" type="outline"  />
          <Button title="회원권" type="outline"  />
          <Button title="GROUP" type="outline"  />
        </View>
        <View >

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
