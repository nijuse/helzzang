import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type UpdateCommunityPostInput = {
  id: string;
  title: string;
  content: string;
  userId: string;
};

/**
 * community 테이블에 게시글 수정 훅
 * - 로그인 세션의 userId를 자동으로 넣습니다.
 * - 성공 시 목록 쿼리(communityPosts)를 무효화해 새 글을 반영합니다.
 */
export default function useUpdateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCommunityPostInput) => {
      const { id, title, content, userId } = input;
      const { error } = await supabase
        .from('community')
        .update({
          title: title.trim(),
          content: content.trim(),
          userId: userId,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', Number(id));
      // .select();

      if (error) {
        console.error('커뮤니티 게시글 수정 에러:', error);
        throw error;
      }
      return { id, title, content };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['communityPost', variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['communityPosts'],
      });
    },
  });
}
