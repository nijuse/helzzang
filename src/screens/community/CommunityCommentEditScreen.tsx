import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { makeStyles, Button } from '@rneui/themed';
import { useEffect, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useCommunityComment } from '../../hooks/useCommunityComments';
import useUpdateComment from '../../hooks/useUpdateComment';
import { useQueryClient } from '@tanstack/react-query';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 116,
  },
  buttonWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
    height: 98,
    backgroundColor: theme.colors.white,
    padding: 24,
    // iOS shadow
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android elevation
    elevation: 8,
  },
  button: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  textAreaWrapper: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 100,
    borderWidth: 1,
    borderColor: theme.colors.greyOutline,
    borderRadius: 10,
  },
  textArea: {
    flex: 1,
    minHeight: 0,
    textAlignVertical: 'top',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 0,
    lineHeight: 24,
  },
}));

const CommunityCommentEditScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CommunityWrite'>>();
  const { data: comment } = useCommunityComment(route.params?.id ?? '');
  const styles = useStyles();
  const navigation = useNavigation();
  const { mutate: updateComment, isPending } = useUpdateComment();
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const handleUpdateComment = () => {
    if (!text.trim()) {
      Alert.alert('댓글 내용을 입력해주세요.');
      return;
    }
    if (text.trim().length > 0 && comment?.id) {
      updateComment(
        {
          id: comment.id,
          comment: text.trim(),
        },
        {
          onSuccess: () => {
            queryClient.refetchQueries({
              queryKey: ['communityComments', comment.postId],
            });
            Alert.alert('수정 완료', '댓글이 수정되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          },
          onError: (err: Error) => {
            console.log('updateComment error ::', err);
            Alert.alert('수정 실패', '다시 시도해 주세요.');
          },
        },
      );
    }
  };

  useEffect(() => {
    if (comment) {
      setText(comment.comment);
    }
  }, [comment]);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
    >
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.textAreaWrapper}>
            <TextInput
              multiline
              placeholder="내용을 입력하세요"
              placeholderTextColor="#999"
              style={styles.textArea}
              scrollEnabled
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
            />
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title={isPending ? '수정 중...' : '수정'}
            type="solid"
            size="lg"
            titleStyle={styles.button}
            onPress={handleUpdateComment}
            disabled={isPending}
            loading={isPending}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityCommentEditScreen;
