import { View, TextInput } from 'react-native';
import { Input, makeStyles, Button } from '@rneui/themed';

const useStyles = makeStyles(theme => ({
  wrapper: {
    flex: 1,
  },
  buttonWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: theme.colors.white,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.greyOutline,
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
  return (
    <View style={styles.wrapper}>
      <Input
        placeholder="제목을 입력하세요"
        inputContainerStyle={styles.titleInputContainer}
      />
      <View style={styles.textAreaWrapper}>
        <TextInput
          multiline
          placeholder="내용을 입력하세요"
          placeholderTextColor="#999"
          style={styles.textArea}
          scrollEnabled
          textAlignVertical="top"
        />
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          title="글쓰기"
          type="solid"
          size="lg"
          titleStyle={styles.button}
          onPress={() => {}}
        />
      </View>
    </View>
  );
};

export default CommunityWriteScreen;
