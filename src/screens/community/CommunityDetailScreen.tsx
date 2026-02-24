import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Input, makeStyles } from '@rneui/themed';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useCommunityPost } from '../../hooks/useCommunityPosts';
import { formatRelativeTime } from '../../lib/utils';
import { RootStackParamList } from '../../navigation/RootNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useCommunityComments from '../../hooks/useCommunityComments';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
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
  editButton: {
    position: 'absolute',
    right: 24,
    bottom: 126,
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
  editButtonPressed: {
    opacity: 0.85,
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
    // iOS shadow
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android elevation
    elevation: 8,
  },
  commentInputIcon: {
    color: theme.colors.primary,
  },
}));

const CommunityDetailScreen = () => {
  const styles = useStyles();
  const route = useRoute<RouteProp<RootStackParamList, 'CommunityDetail'>>();
  const { id } = route.params;
  const { data: post, isLoading, isError, error } = useCommunityPost(id);
  const { data: comments } = useCommunityComments(id);

  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const handleAddComment = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId =
        session?.user?.id ?? 'e6530a3d-99fa-4951-bbfc-e98e4c2d055c';
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { error: insertError } = await supabase
        .from('community_comments')
        .insert({
          comment: comment.trim(),
          userId: userId,
          postId: id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error('댓글 등록 에러:', insertError);
        throw insertError;
      }

      // 댓글 입력 필드 초기화
      setComment('');

      // 게시글 데이터와 목록 데이터 무효화하여 refetch
      queryClient.invalidateQueries({ queryKey: ['communityPost', id] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } catch (err) {
      Alert.alert(
        '댓글 추가 실패',
        (err as Error).message || '다시 시도해 주세요.',
      );
    }
  };
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

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.userName}>{post.userName ?? '익명'}</Text>
            <Text style={styles.createdAt}>
              {post.createdAt ?? ''
                ? formatRelativeTime(post.createdAt ?? '')
                : '-'}
            </Text>
          </View>
          <Text style={styles.body}>{post.content}</Text>
          <View style={styles.meta}>
            <Text style={styles.commentCount}>
              댓글 {post.commentCount ?? 0}
            </Text>
          </View>
        </View>
        <View>
          {comments?.map(comment => (
            <View
              key={comment.id}
              style={{
                gap: 8,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: styles.meta.borderColor,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text>{comment.userName}</Text>
                <Text style={{ color: styles.commentCount.color }}>
                  {formatRelativeTime(comment.createdAt)}
                </Text>
              </View>
              <Text>{comment.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.commentInputWrapper}>
        <Input
          placeholder="댓글을 입력하세요"
          containerStyle={{
            flex: 1,
            paddingHorizontal: 0,
          }}
          inputContainerStyle={{
            borderRadius: 100,
            height: 44,
            paddingHorizontal: 16,
          }}
          inputStyle={{
            paddingVertical: 0,
          }}
          value={comment}
          onChangeText={setComment}
        />
        {comment?.trim()?.length > 0 && (
          <Pressable onPress={handleAddComment} style={{ marginBottom: 26 }}>
            <Ionicons
              name="send"
              size={32}
              color={styles.commentInputIcon.color}
            />
          </Pressable>
        )}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.editButtonPressed,
        ]}
        onPress={handleEditPress}
      >
        <Ionicons name="pencil" size={20} color={'#fff'} />
        <Text style={styles.editButtonText}>수정</Text>
      </Pressable>
    </View>
  );
};

export default CommunityDetailScreen;
