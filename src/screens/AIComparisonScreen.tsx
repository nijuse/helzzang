import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Pressable,
  Image,
} from 'react-native';
import { TVLY_API_KEY, GROQ_API_KEY } from '@env';
import useGymList from '../hooks/useGymList';
import { useStore } from '../store';
import axios from 'axios';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** 마크다운 이미지 패턴: ![alt](url) */
const IMAGE_MD_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

/** 네이버 지도 / 카카오 지도 URL 패턴 */
const MAP_LINK_REGEX =
  /(https?:\/\/(?:map\.naver\.com|naver\.me)[^\s)\]}\]]*|https?:\/\/(?:map\.kakao\.com|kakaomap\.com)[^\s)\]}\]]*)/gi;

type ResultSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string }
  | { type: 'image'; alt: string; url: string };

/** 결과 텍스트를 일반 텍스트 / 지도 링크 / 마크다운 이미지 구간으로 분리 */
function parseResultWithImagesAndLinks(text: string): ResultSegment[] {
  try {
    const str = typeof text === 'string' ? text : String(text ?? '');
    if (!str.trim()) return [{ type: 'text', value: str || '' }];

    const segments: ResultSegment[] = [];
    let lastEnd = 0;

    // 1) 마크다운 이미지와 지도 링크 위치 수집 (정규식 복원을 위해 MAP_LINK_REGEX 복제)
    interface MatchInfo {
      index: number;
      end: number;
      segment: ResultSegment;
    }
    const matches: MatchInfo[] = [];

    let m: RegExpExecArray | null;
    IMAGE_MD_REGEX.lastIndex = 0;
    while ((m = IMAGE_MD_REGEX.exec(str)) !== null) {
      matches.push({
        index: m.index,
        end: m.index + m[0].length,
        segment: { type: 'image', alt: m[1] ?? '', url: m[2] ?? '' },
      });
    }
    MAP_LINK_REGEX.lastIndex = 0;
    while ((m = MAP_LINK_REGEX.exec(str)) !== null) {
      matches.push({
        index: m.index,
        end: m.index + m[0].length,
        segment: { type: 'link', value: m[1] ?? m[0] },
      });
    }

    matches.sort((a, b) => a.index - b.index);

    for (const { index, end, segment } of matches) {
      if (index > lastEnd) {
        segments.push({ type: 'text', value: str.slice(lastEnd, index) });
      }
      segments.push(segment);
      lastEnd = end;
    }
    if (lastEnd < str.length) {
      segments.push({ type: 'text', value: str.slice(lastEnd) });
    }

    return segments.length > 0 ? segments : [{ type: 'text', value: str }];
  } catch {
    return [{ type: 'text', value: typeof text === 'string' ? text : '' }];
  }
}

/**
 * 참고: Velog "localhost API 호출 오류" 글은
 * "앱 → 개발 PC의 백엔드(localhost:3000)" 호출 시의 이야기입니다.
 * 지금은 외부 API(api.groq.com) 호출이라 localhost 이슈와는 무관합니다.
 * TAVILY(api.tavily.com)는 되고 Groq만 안 되면, 기기/네트워크에서 api.groq.com만 차단되는 경우일 수 있습니다.
 */

const AIComparisonScreen = () => {
  const location = useStore(state => state.location);
  const { data: gymList } = useGymList(location);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const fetchGymWebInfo = async (gymNames: string[]) => {
    try {
      const query = `${gymNames.join(
        ', ',
      )} \n위 헬스장들의 각 헬스장 별 일일권 금액, 회원권 금액, 주차 여부, 시설 후기를 찾아줘`;
      const { data } = await axios.post(
        TAVILY_SEARCH_URL,
        {
          query,
          search_depth: 'advanced',
          max_results: 100,
          country: 'south korea',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TVLY_API_KEY}`,
          },
          timeout: 60000,
        },
      );
      // console.log(data.results);
      return data?.results ?? null;
    } catch (error: any) {
      const msg = error?.response?.data ?? error?.message;
      console.error('Tavily 검색 에러:', msg);
      return null;
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!gymList || gymList.length === 0) return;
    setLoading(true);

    try {
      const gymNames = gymList.slice(0, 10).map((g: any) => g.name);
      const searchData = await fetchGymWebInfo(gymNames);

      // prompt 길이 제한 (Groq API는 토큰 제한이 있음)
      const searchDataText = searchData
        ? searchData
            .map((r: any) => `${r.content} - ${r.url}`)
            .join('\n')
            .substring(0, 2000)
        : '';

      const prompt = `너는 헬스장 추천 전문가야. 아래 데이터를 바탕으로 가성비 좋은 곳 하나만 추천해줘.
      해당 헬스장 추천 이유와 정보를 서술한 뒤, 마지막에 네이버 지도 URL과 카카오 지도 URL을 넣어줘.

      [서술 규칙]
      추천 헬스장 : [헬스장 이름]

      추천 이유 : [추천 이유]

      헬스장 정보 : [추천 정보]

      가격 정보 : [가격 정보]

      [지도 링크 출력 규칙 - 반드시 지켜줘]
      - "네이버 지도 링크:", "카카오 지도 링크:", "네이버 지도에서 보기" 등 라벨·접두어·설명 없이 URL만 출력해줘.
      - 네이버 지도 URL 한 줄, 그 다음 줄에 줄바꿈해서 카카오 지도 URL 한 줄만 써줘. (예: https://map.naver.com/... \n https://map.kakao.com/...)
      - URL 앞뒤에 콜론(:)이나 한글 설명을 붙이지 말고, 순수 URL만 써줘.


      1. 헬스장 목록:
      ${gymList
        .slice(0, 10)
        .map((g: any) => `- ${g.name} (위치: ${g.address || '정보 없음'})`)
        .join('\n')}

      2. 실시간 정보:
      ${searchDataText || '추가 정보 없음'}`;

      const { data: resultData } = await axios.post(
        GROQ_API_URL,
        {
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      const text = resultData?.choices?.[0]?.message?.content ?? '';
      console.log(text);
      if (text) setResult(text);
      else setResult('분석 결과를 생성하지 못했습니다.');
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      const errorData = e?.response?.data;
      const groqError = errorData?.error;

      console.error('Groq 호출 에러 상세:', {
        message: e?.message,
        name: e?.name,
        code: e?.code,
        status: status,
        groqError: groqError,
        fullError: errorData,
      });

      const isNetworkError =
        e?.message === 'Network request failed' ||
        e?.message === 'Network Error' ||
        e?.code === 'ERR_NETWORK' ||
        e?.code === 'NETWORK_ERROR' ||
        e?.message?.includes('Network');

      let errorMessage = '';
      if (isNetworkError) {
        errorMessage =
          'Groq API 연결 실패. iOS 시뮬레이터에서 먼저 테스트해보고, 실기기라면 다른 Wi‑Fi·핫스팟으로 시도해보세요. (VPN 해제)';
      } else if (status === 400) {
        // Groq API의 실제 에러 메시지 표시
        errorMessage =
          groqError?.message ||
          errorData?.message ||
          '요청 형식이 올바르지 않습니다. API 키와 요청 내용을 확인해주세요.';
        console.error(
          'Groq 400 에러 상세:',
          JSON.stringify(groqError || errorData),
        );
      } else if (status === 401) {
        errorMessage =
          'API 키가 유효하지 않습니다. .env 파일의 GROQ_API_KEY를 확인해주세요.';
      } else if (status === 429) {
        errorMessage =
          'API 호출 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errorMessage =
          groqError?.message ||
          `분석 중 오류가 발생했습니다. (상태 코드: ${status || '알 수 없음'})`;
      }

      console.error('Groq 호출 에러:', errorData ?? e?.response?.data ?? e);
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gymList]);

  useEffect(() => {
    if (gymList) {
      handleAnalyze();
    }
  }, [gymList, handleAnalyze]);

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>AI 헬스장 비교 분석</Text> */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            실시간 정보를 수집하고 분석 중입니다...
          </Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.resultTextWrap}>
            {parseResultWithImagesAndLinks(
              result || '데이터를 불러오는 중입니다...',
            ).map((segment, index) => {
              if (segment.type === 'image') {
                return (
                  <View key={`img-${index}`} style={styles.imageWrap}>
                    <Image
                      source={{ uri: segment.url }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                    {segment.alt ? (
                      <Text style={styles.imageCaption}>{segment.alt}</Text>
                    ) : null}
                  </View>
                );
              }
              if (segment.type === 'link') {
                return (
                  <Pressable
                    key={`link-${index}`}
                    onPress={() => {
                      try {
                        Linking.openURL(segment.value);
                      } catch (e) {
                        console.warn('지도 링크 열기 실패:', e);
                      }
                    }}
                    style={styles.mapLinkWrap}
                  >
                    <Text style={styles.mapLinkText}>
                      {segment.value.startsWith('https://map.naver.com') ||
                      segment.value.startsWith('http://map.naver.com')
                        ? ' 네이버 지도에서 보기 '
                        : segment.value.startsWith('https://naver.me') ||
                          segment.value.startsWith('http://naver.me')
                        ? ' 네이버 지도에서 보기 '
                        : ' 카카오 지도에서 보기 '}
                    </Text>
                  </Pressable>
                );
              }
              return (
                <Text key={`text-${index}`} style={styles.resultText}>
                  {segment.value}
                </Text>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: { marginTop: 50, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  resultContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  resultTextWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  resultText: { fontSize: 16, lineHeight: 24, color: '#333' },
  imageWrap: { marginVertical: 12, width: '100%' },
  resultImage: { width: '100%', height: 220, borderRadius: 8 },
  imageCaption: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  mapLinkWrap: {
    marginVertical: 2,
    display: 'flex',
    flex: 1,
  },
  mapLinkText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#0066ff',
    textDecorationLine: 'underline',
  },
});

export default AIComparisonScreen;
