import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
// import { Alert } from 'react-native';

export type CreateCommunityPostInput = {
  title: string;
  content: string;
};

/**
 * community 테이블에 게시글 추가 훅
 * - 로그인 세션의 userId를 자동으로 넣습니다.
 * - 성공 시 목록 쿼리(communityPosts)를 무효화해 새 글을 반영합니다.
 */
export default function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommunityPostInput) => {
      const {
        data: { session },
        // error: sessionError,
      } = await supabase.auth.getSession();

      // if (sessionError) {
      //   console.error('세션 조회 에러:', sessionError);
      //   throw sessionError;
      // }

      const userId =
        session?.user?.id ?? 'e6530a3d-99fa-4951-bbfc-e98e4c2d055c';
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('community')
        .insert({
          title: input.title.trim(),
          content: input.content.trim(),
          userId: userId,
          // DB에 default가 없을 수 있어 명시 (timestamptz/timestamp 호환)
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
