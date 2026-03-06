import { useRoute, RouteProp } from '@react-navigation/native';
import {
  ScrollView,
  View,
  Image,
  Text,
  Dimensions,
  Pressable,
  Linking,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import type { RootStackParamList } from '../navigation/RootNavigator';
import useGymDetail from '../hooks/useGymDetail';
import { makeStyles } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type CarouselImageItem = { url: string; id: number; order: number };

export default function GymDetailScreen() {
  const styles = useStyles();
  const route = useRoute<RouteProp<RootStackParamList, 'GymDetail'>>();
  const { id } = route.params;
  const { data: gym, error } = useGymDetail(id);
  const progress = useSharedValue<number>(0);

  const handleOpenMap = (lat: string, lng: string, name: string) => {
    const APP_BUNDLE_ID = 'com.helzzang';
    Linking.openURL(
      `nmap://place?lat=${lat}&lng=${lng}&name=${name}&appname=${APP_BUNDLE_ID}`,
    );
  };

  if (error || !gym) {
    return (
      <View style={styles.centered}>
        <Text>헬스장 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const images = gym.gym_cover_images?.length
    ? gym.gym_cover_images
    : [{ url: gym.profile_image ?? gym.gym_cover_images?.[0]?.url }];

  return (
    <ScrollView>
      <View>
        <Carousel
          width={WINDOW_WIDTH}
          height={258}
          autoPlayInterval={2000}
          data={images}
          loop={true}
          pagingEnabled={true}
          snapEnabled={true}
          style={{
            width: WINDOW_WIDTH,
            height: 258,
          }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          onProgressChange={(
            _offsetProgress: number,
            absoluteProgress: number,
          ) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }: { item: CarouselImageItem }) => (
            <View style={styles.slide}>
              <Image source={{ uri: item.url }} style={styles.gymImage} />
            </View>
          )}
        />
      </View>
      <View style={styles.gymInfo}>
        <View style={{ flexDirection: 'column', gap: 8 }}>
          <Text style={styles.gymInfo_name}>{gym.name}</Text>
          {gym.for_women && (
            <Text style={styles.gymInfo_forWomen}>여성 전용</Text>
          )}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>{gym.short_addr}</Text>
            <Text style={{ fontSize: 14 }}>({gym.walk_distance})</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={styles.gymInfo_address}>{gym.address}</Text>
            <Pressable
              style={styles.gymInfo_mapButton}
              onPress={() => handleOpenMap(gym.lat, gym.lng, gym.name)}
            >
              <Text>지도보기</Text>
            </Pressable>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            운영시간
          </Text>
          <Text style={styles.gymInfo_time}>
            {`평일 ${gym.gym_operating_time.weekday_start_time} - ${gym.gym_operating_time.weekday_end_time}`}
          </Text>
          <Text style={styles.gymInfo_time}>
            {`토요일 ${gym.gym_operating_time.sat_start_time} - ${gym.gym_operating_time.sat_end_time}`}
          </Text>
          <Text style={styles.gymInfo_time}>
            {`일요일 ${
              gym.gym_operating_time.sun_start_time?.length > 0
                ? `${gym.gym_operating_time.sun_start_time} - ${gym.gym_operating_time.sun_end_time}`
                : ' 휴무'
            }`}
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {
              <View
                style={{
                  flexDirection: 'column',
                  gap: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="car" size={40} color={styles.icon.color} />
                <Text style={styles.gymInfo_address}>
                  {gym.gym_information.parkable ? '주차 가능' : '주차 불가능'}
                  {gym.gym_information.free_parking_time && ' (무료)'}
                </Text>
              </View>
            }
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            회원권 가격
          </Text>
          {gym?.gym_price_info?.gym_price_tables?.[0]?.gym_prices?.length >
          0 ? (
            <View style={{ flexDirection: 'column', gap: 8 }}>
              {gym.gym_price_info.gym_price_tables?.[0]?.gym_prices
                ?.sort((a: any, b: any) => a.times - b.times)
                .map((price: any) => (
                  <View
                    key={price.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{price.times}개월</Text>
                    <Text style={{ fontSize: 16 }}>
                      {price.price.toLocaleString()}원
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={{ fontSize: 16 }}>가격 정보 없음</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles(theme => ({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: WINDOW_WIDTH,
  },
  gymImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#eee',
  },
  gymInfo: {
    paddingHorizontal: 24,
    gap: 24,
  },
  gymInfo_name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gymInfo_mapButton: {
    backgroundColor: theme.colors.greyOutline,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  gymInfo_forWomen: {
    backgroundColor: '#FF6B9A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  gymInfo_address: {
    fontSize: 14,
    color: theme.colors.grey1,
  },
  gymInfo_time: {
    fontSize: 16,
    marginVertical: 8,
    color: theme.colors.grey1,
  },
  icon: {
    width: 24,
    height: 24,
    color: theme.colors.secondary,
  },
}));
