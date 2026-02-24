import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { makeStyles } from '@rneui/themed';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useCommunityPost } from '../../hooks/useCommunityPosts';
import { formatRelativeTime } from '../../lib/utils';
import { RootStackParamList } from '../../navigation/RootNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.grey1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  titleWrapper: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.black,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.grey1,
    marginBottom: 24,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.greyOutline,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    color: theme.colors.grey0,
  },
  createdAt: {
    fontSize: 14,
    color: theme.colors.grey0,
    width: '100%',
    textAlign: 'right',
  },
  commentCount: {
    fontSize: 14,
    color: theme.colors.grey0,
  },
  fab: {
    position: 'absolute',
    right: 0,
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

const CommunityDetailScreen = () => {
  const styles = useStyles();
  const route = useRoute<RouteProp<RootStackParamList, 'CommunityDetail'>>();
  const { id } = route.params;
  const { data: post, isLoading, isError, error } = useCommunityPost(id);

  const handleEditPress = async () => {
    await supabase.auth.getSession();
    // if (!session) {
    //   navigation.navigate('SignIn');
    //   return;
    // }
    // 로그인된 경우: 글쓰기 화면으로 이동 등 처리
    // navigation.navigate('CommunityWrite', { id: id });
  };

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={styles.title.color} />
        </View>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.error}>
          <Text style={styles.errorText}>
            {error?.message || '게시글을 불러올 수 없습니다.'}
          </Text>
        </View>
      </View>
    );
  }

  const userName = post.userId?.slice(0, 20) ?? '익명';
  const commentCount = post.commentCount ?? 0;
  const createdAt = post.createdAt ?? '';

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.wrapper}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.createdAt}>
            {createdAt ? formatRelativeTime(createdAt) : '-'}
          </Text>
        </View>
        <Text style={styles.body}>{post.content}</Text>
        <View style={styles.meta}>
          <Text style={styles.commentCount}>댓글 {commentCount}</Text>
        </View>
      </ScrollView>
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleEditPress}
      >
        <Ionicons name="pencil" size={20} color={'#fff'} />
        <Text style={styles.fabText}>수정</Text>
      </Pressable>
    </View>
  );
};

export default CommunityDetailScreen;
