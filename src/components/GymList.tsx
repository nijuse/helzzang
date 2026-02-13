import { Image, View, Text, StyleSheet } from 'react-native';

const GymList = ({ data }: { data: any }) => {
  if (!data) return null;
  return (
    <View style={styles.container}>
      {data?.map((gym: any) => (
        <View key={gym.id} style={styles.itemWrap}>
          <Image source={{ uri: gym.profile_image }} style={styles.image} />
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>{gym.name}</Text>
            <Text style={styles.gymDistance}>{gym.walk_distance}</Text>
            <View style={styles.gymPriceWrap}>
              {gym?.price?.dayPass && (
                <Text style={styles.gymPrice}>{gym.price.dayPass}원</Text>
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
