import { View, Text, Pressable } from 'react-native';
import { makeStyles } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    maxHeight: 88,
    overflow: 'hidden',
    color: theme.colors.grey1,
  },
  moreButton: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    display: 'flex',
    justifyContent: 'flex-end',
    color: theme.colors.grey0,
  },
  moreButtonText: {
    color: theme.colors.grey0,
  },
  contentInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: theme.colors.greyOutline,
    paddingVertical: 10,
  },
}));
const CommunityItem = () => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>하루의 시작은 언제나 잔잔한 공기와</Text>
      <Text numberOfLines={4} ellipsizeMode="tail" style={styles.content}>
        하루의 시작은 언제나 잔잔한 공기와 함께 찾아온다. 창문 사이로 스며드는
        빛은 방 안을 부드럽게 감싸고, 조용히 흘러가는 시간은 생각을 정리하기에
        충분한 여유를 남긴다. 책상 위에 놓인 작은 화분은 초록빛을 더하며 공간에
        생기를 더하고, 멀리서 들려오는 발걸음 소리는 일상의 리듬을 만든다.
        특별할 것 없는 순간들이 모여 하루를 이루고, 그 하루가 다시 쌓여 또 다른
        계절을 완성한다. 바람은 계절에 따라 다른 향기를 머금는다. 봄에는 은은한
        꽃내음이 골목을 채우고, 여름에는 뜨거운 공기 속에서 나무 그늘이
        소중해진다. 가을에는 바스락거리는 낙엽 소리가 귓가를 스치고, 겨울에는
        차가운 공기 속에서 따뜻한 숨결이 또렷해진다. 시간은 멈추지 않고
        흐르지만, 그 흐름 속에서도 사람들은 각자의 속도로 삶을 이어간다.
      </Text>
      <Pressable style={styles.moreButton} onPress={() => {}}>
        <Text style={styles.moreButtonText}>더보기</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={styles.moreButtonText.color}
        />
      </Pressable>
      <View style={styles.contentInfo}>
        <Text>
          dkdkdk | <Text style={styles.moreButtonText}>13분 전</Text>
        </Text>
        <Text>댓글 0</Text>
      </View>
    </View>
  );
};

export default CommunityItem;
