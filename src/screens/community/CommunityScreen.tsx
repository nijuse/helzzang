import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabase';
import { makeStyles } from '@rneui/themed';
import CommunityItem from '../../components/CommunityItem';
import useCommunityPosts, {
  type CommunityPost,
} from '../../hooks/useCommunityPosts';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 36,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.grey1,
    textAlign: 'center',
  },
  loading: {
    color: theme.colors.primary,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const CommunityScreen = () => {
  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isPending } = useCommunityPosts();

  const handleWritePress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // console.log('session ::', session);
    if (!session) {
      navigation.navigate('SignIn');
      return;
    }
    // 로그인된 경우: 글쓰기 화면으로 이동 등 처리
    navigation.navigate('CommunityWrite');
  };

  if (isPending) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={styles.loading.color} />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper]}>
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={[
          data && data.length > 0 ? styles.container : styles.emptyContainer,
          data && data.length >= 4 && { paddingBottom: 100 },
        ]}
      >
        {data && data.length > 0 ? (
          data.map((post: CommunityPost) => (
            <CommunityItem
              key={post.id}
              title={post.title}
              content={post.content}
              userName={post.userName ?? ''}
              createdAt={post.updatedAt ?? ''}
              commentCount={post.commentCount ?? 0}
              id={post.id}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>게시글이 없습니다.</Text>
        )}
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
