import { Image, View, Text, Pressable } from 'react-native';
import { makeStyles } from '@rneui/themed';
import { FILTERS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  itemWrap: {
    paddingVertical: 20,
    alignItems: 'flex-start',
    flexDirection: 'row',
    width: '100%',
    height: 170,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyOutline,
  },
  image: {
    width: 130,
    height: 130,
    flexShrink: 0,
    marginRight: 20,
    borderRadius: 8,
  },
  gymInfo: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gymDistance: {
    fontSize: 12,
    color: theme.colors.grey0,
    marginTop: 4,
  },
  gymPriceWrap: {
    marginTop: 'auto',
    alignItems: 'flex-start',
    gap: 4,
  },
  gymPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gymPriceLabel: { width: 40, fontSize: 12, color: theme.colors.grey0 },
  membershipPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  membershipPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  membershipNoPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.grey0,
  },
}));

const GymList = ({
  data,
  filter,
}: {
  data: any;
  filter: keyof typeof FILTERS;
}) => {
  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  if (!data) return null;
  return (
    <View style={styles.container}>
      {data?.map((gym: any) => (
        <Pressable
          key={gym.id}
          style={styles.itemWrap}
          onPress={() => {
            navigation.navigate('GymDetail', { id: gym.id });
          }}
        >
          <Image source={{ uri: gym.profile_image }} style={styles.image} />
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>{gym.name}</Text>
            <Text
              style={[
                styles.gymDistance,
                filter === 'membership' && { marginBottom: 4 },
              ]}
            >
              {gym.walk_distance}
            </Text>
            <View style={styles.gymPriceWrap}>
              {filter !== 'membership' &&
                gym?.gym_price_info?.day_price >= 0 && (
                  <>
                    <Text style={styles.gymPriceLabel}>일일권</Text>
                    <Text style={styles.gymPrice}>
                      {gym.gym_price_info.day_price.toLocaleString()}원
                    </Text>
                  </>
                )}
              {filter === 'membership' &&
                gym?.gym_price_info?.sortedGymPrices?.map((price: any) => (
                  <View
                    key={price.times + price.price.toString()}
                    style={styles.membershipPriceWrap}
                  >
                    <Text style={styles.gymPriceLabel}>{price.times}개월</Text>
                    <Text style={styles.membershipPrice}>
                      {price.price.toLocaleString()}원
                    </Text>
                  </View>
                ))}
              {filter === 'membership' &&
                !gym?.gym_price_info?.sortedGymPrices?.length && (
                  <Text style={styles.membershipNoPrice}>가격 정보 없음</Text>
                )}
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default GymList;
