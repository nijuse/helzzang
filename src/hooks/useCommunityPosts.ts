import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * 커뮤니티 게시글 목록 조회 (TanStack Query 캐싱)
 */
export default function useCommunityPosts() {
  return useQuery({
    queryKey: ['communityPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('커뮤니티 게시글 조회 에러:', error);
        throw error;
      }

      console.log('커뮤니티 게시글 데이터:', data);
      return data || [];
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
  return useQuery({
    queryKey: ['communityPost', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community') // 테이블명을 실제 테이블명으로 변경하세요
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!postId,
  });
}
