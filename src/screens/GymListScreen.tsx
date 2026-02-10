import { Text, View } from 'react-native';

const GymListScreen = ({
  filter,
}: {
  filter: 'dayPass' | 'membership' | 'female';
}) => {
  return (
    <View>
      <Text>GymListScreen</Text>
      <Text>{filter}</Text>
    </View>
  );
};

export default GymListScreen;
