const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 8601 UTC (예: 2026-02-20T08:58:41+00:00) → 한국 시간(KST) 기준 "N분 전" / "N시간 전" / "N일 전" / "N주 전" */
export const formatRelativeTime = (createdAt: string): string => {
  const utcDate = new Date(
    createdAt.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(createdAt)
      ? createdAt
      : `${createdAt}Z`,
  );
  const dateKst = new Date(utcDate.getTime() + KST_OFFSET_MS);
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const diffMs = nowKst.getTime() - dateKst.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${diffWeeks}주 전`;
};
