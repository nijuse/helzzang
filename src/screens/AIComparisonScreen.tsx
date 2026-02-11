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

      const prompt = `
        너는 헬스장 추천 전문가야. 아래 데이터를 바탕으로 가성비 좋은 곳 하나를 추천해줘.
        
        1. 목록: ${JSON.stringify(gymList.slice(0, 10))}
        2. 실시간 정보: ${JSON.stringify(searchData)}
      `;

      // Groq API 호출 (TAVILY와 동일한 axios 방식 사용)
      if (!GROQ_API_KEY || GROQ_API_KEY === 'undefined') {
        setResult(
          'Groq API 키가 없습니다. .env에 GROQ_API_KEY를 설정한 뒤 앱을 다시 빌드해주세요.',
        );
        return;
      }

      const { data: resultData } = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
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
      console.error('Groq 호출 에러 상세:', {
        message: e?.message,
        name: e?.name,
        code: e?.code,
        response: e?.response,
        status: e?.status || e?.response?.status,
      });

      const status = e?.status || e?.response?.status;
      const body = e?.response?.data;
      const isNetworkError =
        e?.message === 'Network request failed' ||
        e?.message === 'Network Error' ||
        e?.code === 'ERR_NETWORK' ||
        e?.code === 'NETWORK_ERROR' ||
        e?.message?.includes('Network');

      console.error('Groq 호출 에러:', body ?? e?.response?.data ?? e);
      setResult(
        isNetworkError
          ? '네트워크 연결을 확인해주세요. (와이파이/케이블, VPN 해제 후 재시도)'
          : '분석 중 오류가 발생했습니다. API 키와 할당량을 확인해주세요.',
      );
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
