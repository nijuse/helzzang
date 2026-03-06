import { useRoute, RouteProp } from '@react-navigation/native';
import {
  ScrollView,
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import type { RootStackParamList } from '../navigation/RootNavigator';
import useGymDetail from '../hooks/useGymDetail';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type CarouselImageItem = { url: string; id: number; order: number };

export default function GymDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'GymDetail'>>();
  const { id } = route.params;
  const { data: gym, error } = useGymDetail(id);
  const progress = useSharedValue<number>(0);

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
      <View>
        <Text>{gym.name}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
