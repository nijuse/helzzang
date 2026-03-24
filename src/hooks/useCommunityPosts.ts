import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/** 커뮤니티 게시글 (DB community 테이블 기준) */
export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  commentCount?: number;
  /** users 테이블의 userName (auth.users와 동기화된 값) */
  userName?: string;
};

/**
 * 커뮤니티 게시글 목록 조회 (TanStack Query 캐싱)
 * community_comments 테이블에서 postId = community.id 인 행의 개수를 commentCount 로 합산하여 조합
 */
export default function useCommunityPosts() {
  return useQuery<CommunityPost[]>({
    queryKey: ['communityPosts'],
    queryFn: async () => {
      // 1) 게시글 목록 조회
      const { data: postsData, error: postsError } = await supabase
        .from('community')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (postsError) {
        console.error('커뮤니티 게시글 조회 에러:', postsError);
        throw postsError;
      }

      const posts = (postsData || []) as CommunityPost[];
      if (posts.length === 0) {
        return [] as CommunityPost[];
      }

      // 2) 해당 게시글들에 대한 댓글 개수 조회 (postId = community.id 일치 개수)
      const postIds = posts.map(p => p.id as string);
      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select('postId')
        .in('postId', postIds);

      if (commentsError) {
        console.error('댓글 개수 조회 에러:', commentsError);
        throw commentsError;
      }

      // 3) postId별 댓글 개수 합산
      const countByPostId: Record<string, number> = {};
      for (const row of commentsData || []) {
        const pid = (row as { postId: string }).postId;
        countByPostId[pid] = (countByPostId[pid] ?? 0) + 1;
      }

      // 4) userId 목록으로 users 테이블에서 userName 조회
      const userIds = Array.from(
        new Set(posts.map(p => p.userId).filter(Boolean)),
      );
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, userName')
        .in('id', userIds);
      if (usersError) {
        console.error('게시글 작성자(userName) 조회 에러:', usersError);
        throw usersError;
      }

      const userNameById: Record<string, string> = {};
      for (const row of usersData || []) {
        const { id, userName } = row as { id: string; userName: string | null };
        if (id) {
          userNameById[id] = userName ?? '익명';
        }
      }
      // 5) 각 게시글에 commentCount, userName 할당
      const result: CommunityPost[] = posts.map(row => ({
        ...row,
        commentCount: countByPostId[(row.id as string) ?? ''] ?? 0,
        userName: userNameById[row.userId] ?? '익명',
      }));

      return result;
    },
    // staleTime: 1000 * 60 * 5, // 5분간 캐시 유효
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 특정 게시글 조회
 */
export function useCommunityPost(postId: string) {
  return useQuery<CommunityPost | null>({
    queryKey: ['communityPost', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('커뮤니티 단일 게시글 조회 에러:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      const post = data as CommunityPost;

      // 게시글 작성자의 userName 조회
      let userName = '익명';
      if (post.userId) {
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('userName')
          .eq('id', post.userId)
          .single();

        if (userError) {
          console.error('게시글 작성자(userName) 조회 에러:', userError);
        } else if (userRow) {
          userName =
            (userRow as { userName: string | null }).userName ?? '익명';
        }
      }

      // 해당 게시글의 댓글 개수 조회 (community_comments.postId = postId 인 행 개수)
      let commentCount = 0;
      const { count, error: commentsError } = await supabase
        .from('community_comments')
        .select('id', { count: 'exact', head: true })
        .eq('postId', postId);

      if (commentsError) {
        console.error('단일 게시글 댓글 개수 조회 에러:', commentsError);
      } else if (typeof count === 'number') {
        commentCount = count;
      }

      return {
        ...post,
        userName,
        commentCount,
      } as CommunityPost;
    },
    enabled: !!postId,
  });
}
