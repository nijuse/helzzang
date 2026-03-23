import { View, Text, Pressable } from 'react-native';
import { makeStyles } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatRelativeTime } from '../utils';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

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
  contentInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}));

const CommunityItem = ({
  title,
  content,
  userName,
  createdAt,
  commentCount,
  id,
}: {
  title: string;
  content: string;
  userName: string;
  createdAt: string;
  commentCount: number;
  id: string;
}) => {
  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('CommunityDetail', { id: id });
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress}>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      <Text numberOfLines={4} ellipsizeMode="tail" style={styles.content}>
        {content}
      </Text>
      <Pressable style={styles.moreButton} onPress={handlePress}>
        <Text style={styles.moreButtonText}>더보기</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={styles.moreButtonText.color}
        />
      </Pressable>
      <View style={styles.contentInfo}>
        <View style={styles.contentInfoMeta}>
          <Text>{userName}</Text>
          <Text>|</Text>
          <Text style={styles.moreButtonText}>
            {formatRelativeTime(createdAt)}
          </Text>
        </View>
        <Text>댓글 {commentCount}</Text>
      </View>
    </View>
  );
};

export default CommunityItem;
