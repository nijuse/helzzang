import { ScrollView, View, Text, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';
import { makeStyles } from '@rneui/themed';
import CommunityItem from '../../components/CommunityItem';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
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
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
}));

const CommunityScreen = () => {
  const styles = useStyles();
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
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <CommunityItem />
        <CommunityItem />
        <CommunityItem />
        <CommunityItem />
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleWritePress}
      >
        <Ionicons name="pencil" size={20} color={'#fff'} />
        <Text style={styles.fabText}>글쓰기</Text>
      </Pressable>
    </View>
  );
};

export default CommunityScreen;
