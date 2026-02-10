import { Image, Button, Text } from '@rneui/themed';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import GetLocation, { Location } from 'react-native-get-location';
import { useGymList } from '../hooks/useGymList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const defaultLocation = {
  longitude: 127.0306456,
  latitude: 37.4993136,
  altitude: 0,
  accuracy: 0,
  speed: 0,
  time: 0,
};

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [location, setLocation] = useState<Location | null>(defaultLocation);

  /**
   * 헬스장 목록 조회 (TanStack Query 캐싱)
   * queryKey에 lat/lng 포함 → 같은 위치면 캐시 사용
   */
  const { data: gymList = [] } = useGymList(location);

  /**
   * 위치 권한 요청
   */
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
        setLocation(newLocation ?? defaultLocation);
      })
      .catch(() => setLocation(defaultLocation));
  };

  /**
   * 현 위치 세팅
   */
  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.contents}
        contentContainerStyle={styles.contentsContainer}
      >
        <View style={styles.buttonContainer}>
          <Button
            title="일일권"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('GymList', { filter: 'dayPass' })}
          />
          <Button
            title="회원권"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('GymList', { filter: 'membership' })}
          />
          <Button
            title="여성전용"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('GymList', { filter: 'female' })}
          />
          <Button
            title="헬스장 비교"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('AIComparison')}
          />
        </View>
        {gymList.length > 0 && (
          <View style={{ width: '100%' }}>
            {gymList.map((gym: any) => (
              <View
                key={gym.id}
                style={{
                  paddingVertical: 20,
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  width: '100%',
                  height: 170,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E0E0E0',
                }}
              >
                <Image
                  source={{ uri: gym.profile_image }}
                  style={{
                    width: 130,
                    height: 130,
                    flexShrink: 0,
                    marginRight: 20,
                    borderRadius: 8,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    height: '100%',
                    flexDirection: 'column',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginTop: 4,
                    }}
                  >
                    {gym.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {gym.walk_distance}
                  </Text>
                  <View style={{ marginTop: 'auto', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                      {[10000, 18000, 25000, 20000, 30000][
                        Math.floor(Math.random() * 5)
                      ].toLocaleString()}
                      원
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    height: 60,
  },
  headerLogo: {
    width: 140,
    height: 40,
  },
  contents: {
    flex: 1,
  },
  contentsContainer: {
    padding: 24,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  inputContainer: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    // flex: 1,
    flexGrow: 1,
    width: 'auto',
  },
  buttonTitle: {
    fontSize: 12,
  },
  iconText: {
    fontSize: 14,
  },
});

export default HomeScreen;
