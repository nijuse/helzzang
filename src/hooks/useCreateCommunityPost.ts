import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
// import { Alert } from 'react-native';

export type CreateCommunityPostInput = {
  title: string;
  content: string;
  userId: string;
};

/**
 * community 테이블에 게시글 추가 훅
 * - 로그인 세션의 userId를 자동으로 넣습니다.
 * - 성공 시 목록 쿼리(communityPosts)를 무효화해 새 글을 반영합니다.
 */
export default function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      userId,
    }: CreateCommunityPostInput) => {
      const { data, error } = await supabase
        .from('community')
        .insert({
          title: title.trim(),
          content: content.trim(),
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('커뮤니티 게시글 등록 에러:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });
}
