import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/** 커뮤니티 댓글 (DB community_comments 테이블 기준, users 조인으로 userName 포함) */
export type CommunityComment = {
  id: string;
  comment: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt?: string;
  /** users 테이블의 userName (auth.users와 동기화된 값) */
  userName?: string;
};

/**
 * 특정 게시글의 댓글 목록 조회
 * @param postId - 조회할 게시글의 ID
 */
export default function useCommunityComments(postId: string) {
  return useQuery<CommunityComment[]>({
    queryKey: ['communityComments', postId],
    queryFn: async () => {
      // community_comments.userId → users.id FK 조인으로 userName을 가져와 userName 필드에 매핑
      // (users는 auth.users와 동기화된 public 테이블로 가정)
      const { data, error } = await supabase
        .from('community_comments')
        .select('*, users("userName")')
        .eq('postId', postId)
        .order('createdAt', { ascending: true });

      if (error) {
        console.error('댓글 조회 에러:', error);
        throw error;
      }

      const rows = (data || []) as (CommunityComment & {
        users: { userName: string | null } | null;
      })[];
      return rows.map(({ users, ...row }) => ({
        ...row,
        userName: users?.userName ?? '익명',
      })) as CommunityComment[];
    },
    enabled: !!postId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 특정 댓글 조회
 * @param commentId - 조회할 댓글의 ID
 */
export function useCommunityComment(commentId: string) {
  return useQuery<CommunityComment | null>({
    queryKey: ['communityComment', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('id', commentId)
        .single();

      if (error) {
        console.error('댓글 조회 에러:', error);
        throw error;
      }

      return data as CommunityComment;
    },
    enabled: !!commentId,
  });
}
