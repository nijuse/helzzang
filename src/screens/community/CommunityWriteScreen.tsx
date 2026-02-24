import { View, TextInput, Alert } from 'react-native';
import { Input, makeStyles, Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import useCreateCommunityPost from '../../hooks/useCreateCommunityPost';
import { useState } from 'react';

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
  titleInputContainer: {
    width: '100%',
    minHeight: 56,
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
  },
}));

const CommunityWriteScreen = () => {
  const styles = useStyles();
  const navigation = useNavigation();
  const { mutate: createCommunityPost, isPending } = useCreateCommunityPost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreateCommunityPost = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('제목과 내용을 입력해주세요.');
      return;
    }
    createCommunityPost(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          Alert.alert('등록 완료', '게시글이 등록되었습니다.', [
            { text: '확인', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (err: Error) => {
          Alert.alert('등록 실패', err.message || '다시 시도해 주세요.');
        },
      },
    );
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Input
          placeholder="제목을 입력하세요"
          inputContainerStyle={styles.titleInputContainer}
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.textAreaWrapper}>
          <TextInput
            multiline
            placeholder="내용을 입력하세요"
            placeholderTextColor="#999"
            style={styles.textArea}
            scrollEnabled
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          title={isPending ? '등록 중...' : '글쓰기'}
          type="solid"
          size="lg"
          titleStyle={styles.button}
          onPress={handleCreateCommunityPost}
          disabled={isPending}
          loading={isPending}
        />
      </View>
    </View>
  );
};

export default CommunityWriteScreen;
