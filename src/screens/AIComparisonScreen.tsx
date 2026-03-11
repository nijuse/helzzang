import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { Button } from '@rneui/themed';
import { TVLY_API_KEY, GROQ_API_KEY } from '@env';
import useGymList from '../hooks/useGymList';
import { buildNaverMapUrl, buildKakaoMapUrl } from '../lib/utils';
import { useStore } from '../store';
import { colors } from '../../themed';
import axios from 'axios';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

/** 연속 API 호출 시 React Native 네트워크 스택 이슈 방지용 짧은 대기 */
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/** AI 추천 결과 구조화 타입 */
type AIRecommendationResult = {
  gymName: string;
  reason: string;
  gymInfo: string;
  gymAddress: string;
  gymPhone: string;
  gymHours: string;
  gymRating: string;
  priceList: string;
  naverMapUrl?: string | null;
  kakaoMapUrl?: string | null;
};

/** AI가 객체로 반환한 필드를 화면용 문자열로 변환 (React 자식으로 객체 렌더 방지) */
function toDisplayString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => (v != null && v !== '' ? `${k}: ${v}` : k))
      .join('\n');
  }
  return String(value);
}

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

  const dataLabel = {
    gymName: '추천 헬스장 이름',
    reason: '추천 이유',
    gymInfo: '헬스장 정보',
    gymAddress: '헬스장 주소',
    gymPhone: '헬스장 전화번호',
    gymHours: '헬스장 운영시간',
    gymRating: '헬스장 평점',
    priceList: '가격 정보 (일일권, 회원권 등)',
  };

  const fetchGymWebInfo = async (gymNames: string[]) => {
    try {
      const query = `${gymNames.join(
        ', ',
      )} \n위 헬스장들의 각 헬스장 별 일일권 금액, 회원권 금액, 주차 여부, 운영시간, 시설 후기를 찾아줘`;
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
      // console.log('searchData', searchData);

      // 연속 호출 시 RN 네트워크 에러 방지: 첫 요청 연결이 완전히 정리된 뒤 Groq 호출
      await delay(400);

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
        "gymInfo": "헬스장 정보 (시설, 주차 여부 등)",
        "gymAddress": "헬스장 주소",
        "gymPhone": "헬스장 전화번호",
        "gymHours": "헬스장 운영시간",
        "gymRating": "헬스장 평점",
        "priceList": "가격 정보 (일일권, 회원권 등)"
      }
      ※ 지도 링크는 넣지 마세요. 앱에서 자동으로 생성합니다.

      1. 헬스장 목록:
      ${gymList
        .slice(0, 10)
        .map((g: any) => `- ${g.name} (위치: ${g.address || '정보 없음'})`)
        .join('\n')}

      2. 실시간 정보:
      ${searchDataText || '추가 정보 없음'}`;

      // 연속 호출 시 연결 재사용 이슈 방지: Groq 전용 인스턴스 사용
      const groqClient = axios.create({
        baseURL: 'https://api.groq.com/openai/v1',
        timeout: 60000,
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const groqPayload = {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      };

      const maxRetries = 3;
      let lastError: any;
      let resultData: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await groqClient.post('/chat/completions', groqPayload);
          resultData = res.data;
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.response?.status;
          const is429 = status === 429;
          const retryAfterHeader = err?.response?.headers?.['retry-after'];
          const isNetworkErr =
            err?.code === 'ERR_NETWORK' ||
            err?.message === 'Network Error' ||
            err?.message === 'Network request failed';

          const shouldRetry = attempt < maxRetries && (isNetworkErr || is429);

          if (shouldRetry) {
            let waitMs = 1000 * attempt;
            if (is429 && retryAfterHeader) {
              const seconds = parseInt(retryAfterHeader, 10);
              if (!Number.isNaN(seconds)) waitMs = seconds * 1000;
            } else if (is429) {
              waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
            }
            await delay(waitMs);
            continue;
          }
          throw err;
        }
      }

      if (lastError) throw lastError;
      // console.log('Groq AI >> ', resultData);
      const text = resultData?.choices?.[0]?.message?.content ?? '';
      setErrorMessage('');

      if (text) {
        try {
          const parsed = JSON.parse(text) as Partial<AIRecommendationResult>;
          const recommendedName = (parsed.gymName ?? '').trim();
          const address = (parsed.gymAddress ?? '').trim();

          const matchedGym = gymList?.find(
            (g: any) =>
              recommendedName &&
              (String(g.name).trim() === recommendedName ||
                String(g.name).includes(recommendedName) ||
                recommendedName.includes(String(g.name).trim())),
          );
          const coords = matchedGym
            ? {
                lat: matchedGym?.lat,
                lng: matchedGym?.lng,
              }
            : null;

          const structured: AIRecommendationResult = {
            gymName: parsed.gymName ?? '',
            reason: parsed.reason ?? '',
            gymInfo: toDisplayString(parsed.gymInfo ?? ''),
            gymAddress: address,
            gymPhone: parsed.gymPhone ?? '',
            gymHours: parsed.gymHours ?? '',
            gymRating: parsed.gymRating ?? '',
            priceList: toDisplayString(parsed.priceList ?? ''),
            naverMapUrl: buildNaverMapUrl({
              lat: coords?.lat,
              lng: coords?.lng,
              name: recommendedName || '헬스장',
            }),
            kakaoMapUrl: buildKakaoMapUrl({
              lat: coords?.lat,
              lng: coords?.lng,
              name: recommendedName || '헬스장',
            }),
          };
          setResult(structured);
        } catch (parseErr) {
          console.warn('JSON 파싱 실패, 원본 텍스트로 폴백:', parseErr);
          setResult({
            gymName: '',
            reason: text,
            gymAddress: '',
            gymPhone: '',
            gymHours: '',
            gymRating: '',
            gymInfo: '',
            priceList: '',
            naverMapUrl: '',
            kakaoMapUrl: '',
          });
        }
      } else {
        setResult(null);
        setErrorMessage('분석 결과를 생성하지 못했습니다.');
      }
    } catch (e: any) {
      console.error('Groq 호출 에러:', e);
      setResult(null);
      const status = e?.response?.status;
      const is429 = status === 429;
      const message = is429
        ? '요청이 많아 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.'
        : e?.message ?? '분석 결과를 생성하지 못했습니다.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [gymList]);

  useEffect(() => {
    if (gymList) {
      handleAnalyze();
    }
  }, [gymList]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        loading ? styles.loadingContentContainer : undefined
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>최적의 헬스장을 찾고 있습니다</Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : result ? (
            <View style={styles.structuredResult}>
              <Text style={styles.title}>AI 추천 결과</Text>
              {Object.entries(result)
                .filter(
                  ([key]) =>
                    key !== 'naverMapUrl' &&
                    key !== 'kakaoMapUrl' &&
                    result?.[key as keyof AIRecommendationResult] !== '',
                )
                .map(([key, value]) => (
                  <View key={key}>
                    <Text style={styles.label}>
                      {dataLabel[key as keyof typeof dataLabel]}
                    </Text>
                    <Text style={styles.resultText}>{value}</Text>
                  </View>
                ))}
              {(result.naverMapUrl || result.kakaoMapUrl) && (
                <View style={styles.mapLinksRow}>
                  {result?.naverMapUrl && (
                    <Button
                      title="네이버 지도에서 보기"
                      type="solid"
                      buttonStyle={{ backgroundColor: '#03C75A' }}
                      titleStyle={styles.mapLinkText}
                      containerStyle={styles.mapLinkWrap}
                      onPress={async () =>
                        result?.naverMapUrl &&
                        (await Linking.openURL(result?.naverMapUrl))
                      }
                    />
                  )}
                  {result?.kakaoMapUrl && (
                    <Button
                      title="카카오 지도에서 보기"
                      type="solid"
                      buttonStyle={{ backgroundColor: '#FFCD05' }}
                      titleStyle={styles.mapLinkText}
                      containerStyle={styles.mapLinkWrap}
                      onPress={async () =>
                        result?.kakaoMapUrl &&
                        (await Linking.openURL(result?.kakaoMapUrl))
                      }
                    />
                  )}
                </View>
              )}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 20, color: '#666' },
  resultContainer: {
    padding: 15,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  errorText: { fontSize: 16, color: '#c00' },
  structuredResult: { gap: 0 },
  mapLinksRow: { flexDirection: 'column', gap: 12, marginTop: 16 },
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
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AIComparisonScreen;
