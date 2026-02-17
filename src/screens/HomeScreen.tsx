import { Button } from '@rneui/themed';
import { StyleSheet, View, ScrollView, Image, Text } from 'react-native';
import { useEffect, useState } from 'react';
import GetLocation from 'react-native-get-location';
import useGymList from '../hooks/useGymList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { isInsideKorea } from '../utils/location';
import { useStore } from '../store';

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { location, setLocation, getDefaultLocation } = useStore();
  const [gymList, setGymList] = useState<any[]>([]);
  /**
   * 헬스장 목록 조회 (TanStack Query 캐싱)
   * queryKey에 lat/lng 포함 → 같은 위치면 캐시 사용
   */
  const { data } = useGymList(location);
  /**
   * 위치 권한 요청 (location을 null로 바꾸지 않음 → 쿼리 비활성화 방지, 데이터 갱신 반영)
   */
  const requestLocation = () => {
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
        if (isInsideKorea(newLocation.latitude, newLocation.longitude)) {
          setLocation(newLocation);
        } else {
          setLocation(getDefaultLocation());
        }
      })
      .catch(() => setLocation(getDefaultLocation()));
  };

  /**
   * 현 위치 세팅
   */
  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (data) {
      setGymList(
        data.map((gym: any) => ({
          ...gym,
          profile_image: gym.profile_image || gym.gym_cover_images?.[0]?.url,
        })),
      );
    }
  }, [data]);
  console.log('data', data);

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
            title="AI 추천 헬스장"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('AIComparison')}
          />
        </View>
        <View style={{ width: '100%', gap: 20 }}>
          {gymList &&
            gymList.length > 0 &&
            gymList.map((gym: any) => (
              <View key={gym.id} style={{ width: '100%', gap: 10 }}>
                <Image
                  source={{
                    uri: gym?.profile_image,
                  }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                  }}
                />
                <View style={{ flexDirection: 'column', gap: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {gym.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {gym.walk_distance} | {gym.address}
                  </Text>
                </View>
              </View>
            ))}
        </View>
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
  },
  header: {
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
