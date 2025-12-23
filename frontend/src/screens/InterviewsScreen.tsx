import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';

const InterviewsScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState('hr');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mockInterviewStarted, setMockInterviewStarted] = useState(false);

  const hrQuestions = [
    {
      id: 1,
      question: "Tell me about yourself.",
      answer: "This is your elevator pitch. Keep it concise (2-3 minutes), focus on your professional background, key achievements, and why you're interested in this role. Structure: Present situation → Past experiences → Future goals.",
      tips: "Practice this beforehand, tailor it to the job, avoid personal details."
    },
    {
      id: 2,
      question: "Why do you want to work here?",
      answer: "Research the company thoroughly. Mention specific things you admire about the company culture, products, mission, or recent achievements. Connect it to your career goals.",
      tips: "Show genuine interest, avoid generic answers like 'good company'."
    },
    {
      id: 3,
      question: "What are your strengths and weaknesses?",
      answer: "For strengths: Pick 2-3 relevant to the job with examples. For weaknesses: Choose a real weakness you're actively working to improve, show self-awareness.",
      tips: "Don't say 'I'm a perfectionist' as a weakness. Be authentic."
    },
    {
      id: 4,
      question: "Where do you see yourself in 5 years?",
      answer: "Show ambition but be realistic. Align your goals with potential growth in the company. Mention skills you want to develop and impact you want to make.",
      tips: "Don't say you want their job or want to start your own company."
    }
  ];

  const technicalQuestions = [
    {
      id: 1,
      question: "Explain the difference between var, let, and const in JavaScript.",
      answer: "var: Function-scoped, can be redeclared, hoisted. let: Block-scoped, can be reassigned, not hoisted. const: Block-scoped, cannot be reassigned, not hoisted. Use const by default, let when you need to reassign.",
      tips: "Give examples of when to use each. Mention temporal dead zone for let/const."
    },
    {
      id: 2,
      question: "What is the difference between == and === in JavaScript?",
      answer: "== performs type coercion before comparison. === performs strict comparison without type coercion. Always prefer === for predictable results.",
      tips: "Give examples: '5' == 5 (true) vs '5' === 5 (false)."
    },
    {
      id: 3,
      question: "Explain React hooks and their benefits.",
      answer: "Hooks let you use state and lifecycle features in functional components. Benefits: Simpler code, better reusability, easier testing. Common hooks: useState, useEffect, useContext.",
      tips: "Mention rules of hooks and give practical examples."
    },
    {
      id: 4,
      question: "What is the difference between SQL and NoSQL databases?",
      answer: "SQL: Structured, ACID properties, fixed schema, good for complex queries. NoSQL: Flexible schema, horizontally scalable, good for large datasets. Choose based on use case.",
      tips: "Give examples: MySQL vs MongoDB. Mention when to use each."
    }
  ];

  const codingChallenges = [
    {
      id: 1,
      title: "Two Sum Problem",
      difficulty: "Easy",
      description: "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
      approach: "Use hash map to store complements. Time: O(n), Space: O(n)"
    },
    {
      id: 2,
      title: "Reverse a String",
      difficulty: "Easy",
      description: "Write a function to reverse a string without using built-in reverse methods.",
      approach: "Use two pointers or convert to array and swap elements."
    },
    {
      id: 3,
      title: "Find Maximum Subarray",
      difficulty: "Medium",
      description: "Find the contiguous subarray with the largest sum (Kadane's Algorithm).",
      approach: "Dynamic programming: track current max and global max."
    },
    {
      id: 4,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      description: "Implement inorder, preorder, and postorder traversal of a binary tree.",
      approach: "Use recursion or iterative approach with stack."
    }
  ];

  const resumeTips = [
    "Keep it to 1-2 pages maximum",
    "Use action verbs (Built, Developed, Implemented)",
    "Quantify achievements with numbers",
    "Tailor for each job application",
    "Include relevant keywords from job description",
    "Proofread for grammar and spelling errors",
    "Use consistent formatting and fonts",
    "Include links to GitHub and portfolio"
  ];

  const getCurrentQuestions = () => {
    switch (selectedTab) {
      case 'hr': return hrQuestions;
      case 'technical': return technicalQuestions;
      default: return hrQuestions;
    }
  };

  const openQuestionModal = (question: any) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  const startMockInterview = () => {
    navigation.navigate('MockInterview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Interview Preparation</Text>
        <Text style={styles.subtitle}>Master your interviews with practice and preparation</Text>

        {/* Mock Interview Section */}
        <View style={styles.mockInterviewContainer}>
          <Text style={styles.sectionTitle}>🎯 Mock Interview</Text>
          <Text style={styles.mockDescription}>Practice with AI-powered mock interviews</Text>
          <TouchableOpacity style={styles.mockButton} onPress={startMockInterview}>
            <Text style={styles.mockButtonText}>Start Mock Interview</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'hr' && styles.activeTab]}
            onPress={() => setSelectedTab('hr')}
          >
            <Text style={[styles.tabText, selectedTab === 'hr' && styles.activeTabText]}>HR Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'technical' && styles.activeTab]}
            onPress={() => setSelectedTab('technical')}
          >
            <Text style={[styles.tabText, selectedTab === 'technical' && styles.activeTabText]}>Technical</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'coding' && styles.activeTab]}
            onPress={() => setSelectedTab('coding')}
          >
            <Text style={[styles.tabText, selectedTab === 'coding' && styles.activeTabText]}>Coding</Text>
          </TouchableOpacity>
        </View>

        {/* Questions Section */}
        {selectedTab !== 'coding' && (
          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'hr' ? '💼 HR Questions' : '⚡ Technical Questions'}
            </Text>
            {getCurrentQuestions().map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.questionCard}
                onPress={() => openQuestionModal(item)}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.expandText}>Tap to see answer →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Coding Challenges */}
        {selectedTab === 'coding' && (
          <View style={styles.codingContainer}>
            <Text style={styles.sectionTitle}>💻 Coding Challenges</Text>
            {codingChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={[
                    styles.difficultyBadge,
                    challenge.difficulty === 'Easy' && styles.easyBadge,
                    challenge.difficulty === 'Medium' && styles.mediumBadge,
                    challenge.difficulty === 'Hard' && styles.hardBadge
                  ]}>
                    <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <Text style={styles.challengeApproach}>💡 Approach: {challenge.approach}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Resume Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>📄 Resume & Portfolio Tips</Text>
          {resumeTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Question Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalQuestion}>{selectedQuestion?.question}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>💡 Sample Answer:</Text>
              <Text style={styles.modalAnswer}>{selectedQuestion?.answer}</Text>
              <Text style={styles.modalSectionTitle}>🎯 Tips:</Text>
              <Text style={styles.modalTips}>{selectedQuestion?.tips}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#5e4de2',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  mockInterviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  mockDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  mockButton: {
    backgroundColor: '#5e4de2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5e4de2',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  expandText: {
    fontSize: 12,
    color: '#5e4de2',
    fontStyle: 'italic',
  },
  codingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  challengeCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: '#2ed573',
  },
  mediumBadge: {
    backgroundColor: '#ffa502',
  },
  hardBadge: {
    backgroundColor: '#ff4757',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  challengeApproach: {
    fontSize: 12,
    color: '#5e4de2',
    fontStyle: 'italic',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#5e4de2',
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5e4de2',
    marginTop: 15,
    marginBottom: 10,
  },
  modalAnswer: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  modalTips: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#5e4de2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InterviewsScreen;
