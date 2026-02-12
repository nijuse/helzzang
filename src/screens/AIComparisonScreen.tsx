import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { TVLY_API_KEY, GROQ_API_KEY } from '@env';
import useGymList from '../hooks/useGymList';
import { useStore } from '../store';
import axios from 'axios';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
      console.log(data.results);
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

      const prompt = `너는 헬스장 추천 전문가야. 아래 데이터를 바탕으로 가성비 좋은 곳 하나를 추천해줘.

      1. 헬스장 목록:
      ${gymList
        .slice(0, 10)
        .map((g: any) => `- ${g.name} (위치: ${g.address || '정보 없음'})`)
        .join('\n')}

      2. 실시간 정보:
      ${searchDataText || '추가 정보 없음'}`;

      console.log('Groq API 호출 시작, prompt 길이:', prompt.length);
      console.log('API 키 확인:', GROQ_API_KEY.substring(0, 10) + '...');
      console.log('Groq URL:', GROQ_API_URL);

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
          <Text style={styles.resultText}>
            {result || '데이터를 불러오는 중입니다...'}
          </Text>
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
  resultText: { fontSize: 16, lineHeight: 24, color: '#333' },
});

export default AIComparisonScreen;
