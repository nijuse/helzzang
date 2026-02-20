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

const CommunityItem = ({
  title,
  content,
  userName,
  createdAt,
  commentCount,
}: {
  title: string;
  content: string;
  userName: string;
  createdAt: string;
  commentCount: number;
}) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text numberOfLines={4} ellipsizeMode="tail" style={styles.content}>
        {content}
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
          {userName} | <Text style={styles.moreButtonText}>{createdAt} 전</Text>
        </Text>
        <Text>댓글 {commentCount}</Text>
      </View>
    </View>
  );
};

export default CommunityItem;
