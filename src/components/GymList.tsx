import { Image, View, Text, StyleSheet } from 'react-native';
import { FILTERS } from '../constants';

const GymList = ({
  data,
  filter,
}: {
  data: any;
  filter: keyof typeof FILTERS;
}) => {
  if (!data) return null;
  return (
    <View style={styles.container}>
      {data?.map((gym: any) => (
        <View key={gym.id} style={styles.itemWrap}>
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
                    <Text style={{ width: 40, fontSize: 12, color: '#666' }}>
                      일일권
                    </Text>
                    <Text style={styles.gymPrice}>
                      {gym.gym_price_info.day_price.toLocaleString()}원
                    </Text>
                  </>
                )}
              {filter === 'membership' &&
                gym?.gym_price_info?.gym_price_tables?.[0]?.gym_prices?.length >
                  0 &&
                gym?.gym_price_info?.gym_price_tables?.[0]?.gym_prices
                  ?.sort((a: any, b: any) => a.times - b.times)
                  ?.map((price: any) => (
                    <View
                      key={price.times}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                      }}
                    >
                      <Text style={{ width: 40, fontSize: 12, color: '#666' }}>
                        {price.times}개월
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {price.price.toLocaleString()}원
                      </Text>
                    </View>
                  ))}
              {filter === 'membership' &&
                !gym?.gym_price_info?.gym_price_tables?.[0]?.gym_prices
                  ?.length && (
                  <Text
                    style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}
                  >
                    가격 정보 없음
                  </Text>
                )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default GymList;

const styles = StyleSheet.create({
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
    borderBottomColor: '#E0E0E0',
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
    color: '#666',
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
  gymPriceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
});
