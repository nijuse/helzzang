import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type UpdateCommentInput = {
  id: string;
  comment: string;
};

export default function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCommentInput) => {
      const { id, comment } = input;
      const { error } = await supabase
        .from('community_comments')
        .update({ comment })
        .eq('id', id);

      if (error) {
        console.error('댓글 수정 에러:', error);
        throw error;
      }
      return { id, comment };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['communityComment', variables.id],
      });
    },
  });
}
