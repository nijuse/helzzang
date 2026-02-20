import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';

const CommunityScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleWritePress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigation.navigate('SignIn');
    }
    // 로그인된 경우: 추후 글쓰기 화면으로 이동 등 처리
  };

  return (
    <View style={styles.container}>
      <Text>CommunityScreen</Text>
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleWritePress}
      >
        <Ionicons name="pencil" size={20} color={colors.white} />
        <Text style={styles.fabText}>글쓰기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CommunityScreen;
