import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { quizAPI } from '../api/apiService';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressData {
  overallScore: number;
  performanceOverTime: { date: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  quizHistory: {
    subject: string;
    score: number;
    totalQuestions: number;
    date: string;
  }[];
}

const ProgressScreen = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizAPI.getProgressData();
      const data = response.data;
      // Sanitize data to prevent crashes from undefined properties
      const sanitizedData: ProgressData = {
        overallScore: data.overallScore || 0,
        performanceOverTime: data.performanceOverTime || [],
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        quizHistory: data.quizHistory || [],
      };
      setProgressData(sanitizedData);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProgressData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e4de2" />
          <Text style={styles.loadingText}>Calculating your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !progressData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || 'No progress data available.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = {
    labels: progressData.performanceOverTime.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        data: progressData.performanceOverTime.map(d => (Number.isFinite(d.score) ? d.score : 0)),
      },
    ],
  };

  const getGrowthMessage = () => {
    const performance = progressData.performanceOverTime;
    if (performance.length < 2) {
      return 'Not enough data to track growth.';
    }
    const latestScore = performance[performance.length - 1].score;
    const previousScore = performance[performance.length - 2].score;
    if (latestScore > previousScore) {
      return 'You are on an upward trend. Keep it up!';
    }
    if (latestScore < previousScore) {
      return 'A small dip, but you can bounce back!';
    }
    return 'Consistency is key. You are maintaining your performance.';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Progress Dashboard</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{progressData.overallScore}%</Text>
            <Text style={styles.metricLabel}>Overall Score</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>0%</Text>
            <Text style={styles.metricLabel}>Study Plan</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance Over Time</Text>
          {progressData.performanceOverTime && progressData.performanceOverTime.length > 1 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: '#5e4de2',
                backgroundGradientFrom: '#5e4de2',
                backgroundGradientTo: '#8a7ff2',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.noDataText}>Complete more quizzes to see your performance trend.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Strengths & Weaknesses</Text>
          <Text style={styles.subSectionTitle}>Strengths (Avg. Score &gt; 75%)</Text>
          <View style={styles.tagContainer}>
            {progressData.strengths.map(s => (
              <View key={s} style={[styles.tag, styles.strengthTag]}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
            {progressData.strengths.length === 0 && <Text style={styles.noDataText}>No strengths identified yet.</Text>}
          </View>
          <Text style={styles.subSectionTitle}>Areas to Improve (Avg. Score &lt; 75%)</Text>
          <View style={styles.tagContainer}>
            {progressData.weaknesses.map(w => (
              <View key={w} style={[styles.tag, styles.weaknessTag]}>
                <Text style={styles.tagText}>{w}</Text>
              </View>
            ))}
            {progressData.weaknesses.length === 0 && <Text style={styles.noDataText}>No specific weaknesses found. Keep it up!</Text>}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Growth Tracker</Text>
          <Text style={styles.growthMessage}>{getGrowthMessage()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quiz History</Text>
          {progressData.quizHistory.length > 0 ? (
            progressData.quizHistory.map((result, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historySubject}>{result.subject}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(result.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyScore}>
                  {result.score}/{result.totalQuestions}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No quiz history found.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  errorText: { color: 'red' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333', marginTop: 30 },
  metricsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  metricItem: { alignItems: 'center', padding: 10, backgroundColor: 'white', borderRadius: 10, flex: 1, marginHorizontal: 5 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#5e4de2' },
  metricLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subSectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5, color: '#444' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15, marginRight: 10, marginBottom: 10 },
  strengthTag: { backgroundColor: '#2ed573' },
  weaknessTag: { backgroundColor: '#ff4757' },
  tagText: { color: '#fff', fontWeight: '500' },
  growthMessage: { fontSize: 16, fontStyle: 'italic', color: '#555' },
  noDataText: { color: '#666', fontStyle: 'italic' },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historySubject: { fontSize: 16, fontWeight: '500', color: '#333' },
  historyDate: { fontSize: 12, color: '#888' },
  historyScore: { fontSize: 16, fontWeight: 'bold', color: '#5e4de2' },
});

export default ProgressScreen;
