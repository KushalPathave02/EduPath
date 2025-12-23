import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { AuthContext } from '../context/AuthContext';
import api from '../api/apiService';

const MockInterviewScreen = ({ navigation }: any) => {
  const { userToken } = useContext(AuthContext);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewType, setInterviewType] = useState<'hr' | 'technical' | 'coding'>('technical');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentCodingChallenge, setCurrentCodingChallenge] = useState<any>(null);
  const [userCode, setUserCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [stdin, setStdin] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleApiCall = async (history: any[], isFinished = false, type = interviewType) => {
    setIsLoading(true);
    try {
      const res = await api.post('/interviews/mock-interview/chat', { history, isFinished, interviewType: type }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (isFinished) {
        console.log('--- Frontend Final Report Response ---', JSON.stringify(res.data, null, 2));
        setFinalReport(res.data.finalFeedback);
        setInterviewStarted(false);
      } else {
        const feedback = res.data.feedback;
        const nextQuestion = res.data.nextQuestion;
        if (res.data.type === 'coding') {
          setCurrentCodingChallenge(res.data);
          setUserCode(''); // Reset code for new question
          setStdin(res.data.testCases?.[0]?.input || ''); // Pre-fill stdin with the first test case
          setRunResult(null);
        } else {
          const feedback = res.data.feedback;
          const nextQuestion = res.data.nextQuestion;
          const aiContent = `${feedback}\n\n${nextQuestion}`;
          const newAiMessage = {
            role: 'ai' as const,
            content: aiContent,
          };
          setConversation(prev => [...prev, newAiMessage]);
          Speech.speak(aiContent, { language: 'en-US' });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to communicate with the AI. Please check your connection or try again later.');
      console.error('API call error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    setConversation([]);
    setFinalReport(null);
    setInterviewStarted(true);
    await handleApiCall([], false, interviewType);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped, URI:', uri);
    // TODO: Send this URI to the backend for Speech-to-Text processing
    
    // For now, let's use a placeholder text
    const placeholderAnswer = 'This is a placeholder for the transcribed audio.';
    const newUserMessage = { role: 'user' as const, content: placeholderAnswer };
    const newConversation = [...conversation, newUserMessage];
    setConversation(newConversation);
    
    await handleApiCall(newConversation);
    setRecording(null);
  };

  const handleSendAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const newUserMessage = { role: 'user' as const, content: currentAnswer };
    const newConversation = [...conversation, newUserMessage];
    setConversation(newConversation);
    setCurrentAnswer('');

    await handleApiCall(newConversation);
  };

  const endInterview = async () => {
    await handleApiCall(conversation, true);
  };

  const handleRunCode = async () => {
    if (!userCode.trim()) {
      Alert.alert('Empty Code', 'Please write some code before running.');
      return;
    }
    setIsLoading(true);
    setRunResult(null);
    try {
      const res = await api.post('/code/run', {
        code: userCode,
        language: selectedLanguage,
        input: stdin,
      });
      setRunResult(res.data);
    } catch (error) {
      console.error('Run code error:', error);
      Alert.alert('Error', 'Failed to run code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConversation = () => (
    <ScrollView 
      style={styles.conversationScroll}
      ref={scrollViewRef}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    >
      {conversation.map((msg, index) => (
        <View key={index} style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
          <Text style={styles.chatText}>{msg.content}</Text>
        </View>
      ))}
      {isLoading && <ActivityIndicator size="large" color="#5e4de2" style={{ marginVertical: 20 }} />}
    </ScrollView>
  );

  const renderConversationView = () => (
    <>
      {renderConversation()}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording ? styles.recordButtonRecording : {}]} 
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isRecording ? 'Stop' : 'Record Answer'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderCodingView = () => (
    <ScrollView style={styles.codingContainer}>
      {isLoading && !runResult && <ActivityIndicator size="large" color="#5e4de2" />}
      {currentCodingChallenge && (
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>Challenge:</Text>
          <Text style={styles.challengeText}>{currentCodingChallenge.question}</Text>
        </View>
      )}

      <View style={styles.editorContainer}>
        <Text style={styles.editorLabel}>Language: {selectedLanguage}</Text>
        <TextInput
          style={styles.codeInput}
          multiline
          value={userCode}
          onChangeText={setUserCode}
          placeholder="// Your code here"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.ioContainer}>
        <Text style={styles.editorLabel}>Input (stdin):</Text>
        <TextInput
          style={styles.ioInput}
          multiline
          value={stdin}
          onChangeText={setStdin}
          placeholder="Enter test input here"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRunCode} disabled={isLoading}>
        <Text style={styles.buttonText}>Run Code</Text>
      </TouchableOpacity>

      {runResult && (
        <View style={styles.outputContainer}>
          <Text style={styles.outputTitle}>Output:</Text>
          <Text style={styles.outputStatus}>Status: {runResult.status?.description || 'Done'}</Text>
          <ScrollView style={styles.outputScroll}>
            <Text style={styles.outputText}>{
              runResult.stdout || runResult.stderr || runResult.compile_output || 'No output.'
            }</Text>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );

  const renderFinalReport = () => (
    <ScrollView style={styles.reportContainer}>
      <Text style={styles.reportTitle}>Final Feedback Report</Text>
      <View style={styles.reportSection}>
        <Text style={styles.reportSubtitle}>Strengths</Text>
        <Text style={styles.reportContent}>{finalReport.strengths}</Text>
      </View>
      <View style={styles.reportSection}>
        <Text style={styles.reportSubtitle}>Weaknesses</Text>
        <Text style={styles.reportContent}>{finalReport.weaknesses}</Text>
      </View>
      <View style={styles.reportSection}>
        <Text style={styles.reportSubtitle}>Areas for Improvement</Text>
        <Text style={styles.reportContent}>{finalReport.areasForImprovement}</Text>
      </View>
      <View style={styles.reportSection}>
        <Text style={styles.reportSubtitle}>Overall Score</Text>
        <Text style={styles.reportContent}>{finalReport.overallScore} / 10</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setFinalReport(null)}>
        <Text style={styles.buttonText}>Start New Interview</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>AI Mock Interview</Text>
        {!interviewStarted && !finalReport && (
          <>
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionTitle}>Select Interview Type:</Text>
              <View style={styles.selectionButtons}>
                {(['hr', 'technical', 'coding'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectionButton,
                      interviewType === type && styles.selectedButton,
                    ]}
                    onPress={() => setInterviewType(type)}
                  >
                    <Text
                      style={[
                        styles.selectionButtonText,
                        interviewType === type && styles.selectedButtonText,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={startInterview}>
              <Text style={styles.buttonText}>Start Interview</Text>
            </TouchableOpacity>
          </>
        )}

        {finalReport ? renderFinalReport() : interviewStarted && (
          <View style={{ flex: 1 }}>
            {interviewType === 'coding' ? renderCodingView() : renderConversationView()}
            <TouchableOpacity style={[styles.button, styles.endButton]} onPress={endInterview} disabled={isLoading}>
              <Text style={styles.buttonText}>End Interview</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1, padding: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 15 },
  button: { backgroundColor: '#5e4de2', padding: 15, borderRadius: 30, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  conversationScroll: { flex: 1, marginVertical: 10 },
  chatBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginVertical: 5 },
  userBubble: { backgroundColor: '#d1d1f7', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#e1e1e1', alignSelf: 'flex-start' },
  chatText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ddd', padding: 10 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, minHeight: 40 },
  recordButton: { flex: 1, backgroundColor: '#5e4de2', padding: 15, borderRadius: 30, alignItems: 'center' },
  recordButtonRecording: { backgroundColor: '#c70000' },
  endButton: { backgroundColor: '#d9534f' },
  reportContainer: { flex: 1, padding: 10 },
  reportTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  reportSection: { marginBottom: 15 },
  reportSubtitle: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  reportContent: { fontSize: 16, color: '#666', marginTop: 5 },
  selectionContainer: { marginVertical: 20, paddingHorizontal: 10 },
  selectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },
  selectionButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  selectionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#e1e1e1' },
  selectedButton: { backgroundColor: '#5e4de2' },
  selectionButtonText: { color: '#333', fontWeight: '600' },
  selectedButtonText: { color: '#fff' },
  codingContainer: { flex: 1 },
  challengeContainer: { padding: 10, backgroundColor: '#eef', borderRadius: 8, marginVertical: 10 },
  challengeTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  challengeText: { fontSize: 15 },
  editorContainer: { marginVertical: 5 },
  editorLabel: { fontWeight: '600', fontSize: 14, marginBottom: 5, color: '#333' },
  codeInput: { 
    backgroundColor: '#fff', 
    fontFamily: 'monospace', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    minHeight: 200, 
    textAlignVertical: 'top' 
  },
  ioContainer: { marginVertical: 10 },
  ioInput: { 
    backgroundColor: '#fff', 
    fontFamily: 'monospace', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
  outputContainer: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  outputTitle: { fontWeight: 'bold', fontSize: 16 },
  outputStatus: { fontStyle: 'italic', color: '#555', marginVertical: 5 },
  outputScroll: { maxHeight: 150, backgroundColor: '#333', borderRadius: 5, padding: 10, marginTop: 5 },
  outputText: { color: '#fff', fontFamily: 'monospace' },
});

export default MockInterviewScreen;
