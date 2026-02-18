import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Pressable,
} from 'react-native';
import { TVLY_API_KEY, GROQ_API_KEY } from '@env';
import useGymList from '../hooks/useGymList';
import { useStore } from '../store';
import axios from 'axios';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** AI 추천 결과 구조화 타입 */
type AIRecommendationResult = {
  gymName: string;
  reason: string;
  gymInfo: string;
  priceList: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
};

/**
 * 참고: Groq API(api.groq.com)는 OpenAI 호환 형식을 사용합니다.
 * response_format: { type: 'json_object' }로 구조화된 JSON 응답을 받습니다.
 */

const AIComparisonScreen = () => {
  const location = useStore(state => state.location);
  const { data: gymList } = useGymList(location);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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
      console.log('TAVILY >> ', searchData);
      // prompt 길이 제한 (OpenAI API는 토큰 제한이 있음)
      const searchDataText = searchData
        ? searchData
            .map((r: any) => `${r.content} - ${r.url}`)
            .join('\n')
            .substring(0, 2000)
        : '';

      const prompt = `너는 헬스장 추천 전문가야. 아래 데이터를 바탕으로 가성비 좋은 곳 하나만 추천해줘.
반드시 아래 JSON 형식으로만 응답해줘. 다른 텍스트나 설명 없이 JSON만 출력해줘.

{
  "gymName": "추천 헬스장 이름",
  "reason": "추천 이유 (가성비, 시설, 위치 등)",
  "gymInfo": "헬스장 정보 (시설, 주차 여부, 운영시간 등)",
  "priceList": "가격 정보 (일일권, 회원권 등)",
  "naverMapUrl": "네이버 지도 URL (https://map.naver.com 또는 https://naver.me 형식)",
  "kakaoMapUrl": "카카오 지도 URL (https://map.kakao.com 또는 https://kakaomap.com 형식)"
}

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
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );
      console.log('Groq AI >> ', resultData);
      const text = resultData?.choices?.[0]?.message?.content ?? '';
      setErrorMessage('');

      if (text) {
        try {
          const parsed = JSON.parse(text) as Partial<AIRecommendationResult>;
          const structured: AIRecommendationResult = {
            gymName: parsed.gymName ?? '',
            reason: parsed.reason ?? '',
            gymInfo: parsed.gymInfo ?? '',
            priceList: parsed.priceList ?? '',
            naverMapUrl: parsed.naverMapUrl,
            kakaoMapUrl: parsed.kakaoMapUrl,
          };
          setResult(structured);
        } catch (parseErr) {
          console.warn('JSON 파싱 실패, 원본 텍스트로 폴백:', parseErr);
          setResult({
            gymName: '',
            reason: text,
            gymInfo: '',
            priceList: '',
          });
        }
      } else {
        setResult(null);
        setErrorMessage('분석 결과를 생성하지 못했습니다.');
      }
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      const errorData = e?.response?.data;
      const openaiError = errorData?.error;

      console.error('Groq API 호출 에러 상세:', {
        message: e?.message,
        name: e?.name,
        code: e?.code,
        status: status,
        groqError: openaiError,
        fullError: errorData,
      });

      const isNetworkError =
        e?.message === 'Network request failed' ||
        e?.message === 'Network Error' ||
        e?.code === 'ERR_NETWORK' ||
        e?.code === 'NETWORK_ERROR' ||
        e?.message?.includes('Network');

      let errMsg = '';
      if (isNetworkError) {
        errMsg =
          'Groq API 연결 실패. iOS 시뮬레이터에서 먼저 테스트해보고, 실기기라면 다른 Wi‑Fi·핫스팟으로 시도해보세요. (VPN 해제)';
      } else if (status === 400) {
        errMsg =
          openaiError?.message ||
          errorData?.message ||
          '요청 형식이 올바르지 않습니다. API 키와 요청 내용을 확인해주세요.';
        console.error(
          'Groq 400 에러 상세:',
          JSON.stringify(openaiError || errorData),
        );
      } else if (status === 401) {
        errMsg =
          'API 키가 유효하지 않습니다. .env 파일의 GROQ_API_KEY를 확인해주세요.';
      } else if (status === 429) {
        errMsg = 'API 호출 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errMsg =
          openaiError?.message ||
          `분석 중 오류가 발생했습니다. (상태 코드: ${status || '알 수 없음'})`;
      }

      console.error('Groq 호출 에러:', errorData ?? e?.response?.data ?? e);
      setResult(null);
      setErrorMessage(errMsg);
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
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : result ? (
            <View style={styles.structuredResult}>
              {result.gymName ? (
                <>
                  <Text style={styles.label}>추천 헬스장</Text>
                  <Text style={styles.resultText}>{result.gymName}</Text>
                </>
              ) : null}
              {result.reason ? (
                <>
                  <Text style={styles.label}>추천 이유</Text>
                  <Text style={styles.resultText}>{result.reason}</Text>
                </>
              ) : null}
              {result.gymInfo ? (
                <>
                  <Text style={styles.label}>헬스장 정보</Text>
                  <Text style={styles.resultText}>{result.gymInfo}</Text>
                </>
              ) : null}
              {result.priceList ? (
                <>
                  <Text style={styles.label}>가격 정보</Text>
                  <Text style={styles.resultText}>{result.priceList}</Text>
                </>
              ) : null}
              {(result.naverMapUrl || result.kakaoMapUrl) && (
                <View style={styles.mapLinksRow}>
                  {result.naverMapUrl ? (
                    <Pressable
                      onPress={() => {
                        try {
                          Linking.openURL(result.naverMapUrl!);
                        } catch (e) {
                          console.warn('지도 링크 열기 실패:', e);
                        }
                      }}
                      style={styles.mapLinkWrap}
                    >
                      <Text style={styles.mapLinkText}>
                        네이버 지도에서 보기
                      </Text>
                    </Pressable>
                  ) : null}
                  {result.kakaoMapUrl ? (
                    <Pressable
                      onPress={() => {
                        try {
                          Linking.openURL(result.kakaoMapUrl!);
                        } catch (e) {
                          console.warn('지도 링크 열기 실패:', e);
                        }
                      }}
                      style={styles.mapLinkWrap}
                    >
                      <Text style={styles.mapLinkText}>
                        카카오 지도에서 보기
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.resultText}>데이터를 불러오는 중입니다...</Text>
          )}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  errorText: { fontSize: 16, color: '#c00' },
  structuredResult: { gap: 0 },
  mapLinksRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
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
