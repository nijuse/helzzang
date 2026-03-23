import { Button, makeStyles, Skeleton } from '@rneui/themed';
import {
  View,
  ScrollView,
  Image,
  Text,
  Pressable,
  FlatList,
} from 'react-native';
import { useEffect, useState } from 'react';
import GetLocation from 'react-native-get-location';
import useGymList from '../hooks/useGymList';
import type { GymSearchListRow } from '../types/gymSearch';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { isInsideKorea } from '../utils';
import { useStore } from '../store';

const useStyles = makeStyles(theme => ({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  },
  contents: {
    flex: 1,
    padding: 24,
  },
  contentsContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexGrow: 1,
    width: 'auto',
  },
  buttonTitle: {
    fontSize: 12,
  },
  gymListContainer: {
    width: '100%',
  },
  gymItem: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  gymItemImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.greyOutline,
  },
  gymItemInfo: { flexDirection: 'column', gap: 4 },
  gymItemInfo_name: { fontSize: 16, fontWeight: 'bold' },
  gymItemInfo_distance: { fontSize: 12, color: theme.colors.grey0 },
  skeletonItem: {
    width: '100%',
    gap: 10,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e8e8e8',
  },
  skeletonInfo: { flexDirection: 'column', gap: 4 },
  skeletonName: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    backgroundColor: theme.colors.grey5,
  },
  skeletonDistance: {
    height: 12,
    width: '90%',
    borderRadius: 4,
    backgroundColor: theme.colors.grey5,
  },
  skeletonHighlight: {
    backgroundColor: theme.colors.grey0,
  },
  aiComparisonButton: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 100,
    padding: 0,
  },
  aiComparisonButtonTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    width: '100%',
  },
}));

const HomeScreen = () => {
  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { location, setLocation, getDefaultLocation } = useStore();
  const [gymList, setGymList] = useState<GymSearchListRow[]>([]);
  /**
   * 헬스장 목록 조회 (TanStack Query 캐싱)
   * queryKey에 lat/lng 포함 → 같은 위치면 캐시 사용
   */
  const { data, isLoading } = useGymList(location);

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
        data.map(gym => ({
          ...gym,
          profile_image: gym.profile_image || gym.gym_cover_images[0]?.url,
        })),
      );
    } else {
      setGymList([]);
    }
  }, [data]);

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
            title="커뮤니티"
            type="outline"
            titleStyle={styles.buttonTitle}
            containerStyle={styles.button}
            onPress={() => navigation.push('Community')}
          />
        </View>
        <View style={{ marginBottom: 20, width: '100%' }}>
          <Button
            title="내 주변 AI 추천 헬스장"
            type="solid"
            color={styles.aiComparisonButton.backgroundColor}
            titleStyle={styles.aiComparisonButtonTitle}
            containerStyle={styles.aiComparisonButton}
            onPress={() => navigation.push('AIComparison')}
          />
        </View>
        <View style={styles.gymListContainer}>
          {isLoading ? (
            [1, 2, 3].map(i => (
              <View key={`skeleton-${i}`} style={styles.skeletonItem}>
                <Skeleton
                  style={styles.skeletonImage}
                  skeletonStyle={styles.skeletonHighlight}
                />
                <View style={styles.skeletonInfo}>
                  <Skeleton
                    style={styles.skeletonName}
                    skeletonStyle={styles.skeletonHighlight}
                  />
                  <Skeleton
                    style={styles.skeletonDistance}
                    skeletonStyle={styles.skeletonHighlight}
                  />
                </View>
              </View>
            ))
          ) : (
            <FlatList
              data={gymList}
              keyExtractor={item => String(item.id)}
              renderItem={({ item: gym }: { item: GymSearchListRow }) => (
                <Pressable
                  style={styles.gymItem}
                  onPress={() =>
                    navigation.push('GymDetail', { id: String(gym.id) })
                  }
                >
                  <Image
                    source={{
                      uri: gym.profile_image,
                    }}
                    style={styles.gymItemImage}
                  />
                  <View style={styles.gymItemInfo}>
                    <Text style={styles.gymItemInfo_name}>{gym.name}</Text>
                    <Text style={styles.gymItemInfo_distance}>
                      {gym.walk_distance} | {gym.address}
                    </Text>
                  </View>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
