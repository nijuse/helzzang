import React from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { Button } from '@rneui/themed';
import useGymList from '../hooks/useGymList';
import { useStore } from '../store';
import { colors } from '../../themed';
import {
  AIRecommendationResult,
  useAIRecommendation,
} from '../hooks/useAIRecommendation';

/**
 * 참고: Groq API(api.groq.com)는 OpenAI 호환 형식을 사용합니다.
 * response_format: { type: 'json_object' }로 구조화된 JSON 응답을 받습니다.
 */

const AIComparisonScreen = () => {
  const location = useStore(state => state.location);
  const { data: gymList } = useGymList(location);
  const { loading, result, errorMessage } = useAIRecommendation({ gymList });

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
