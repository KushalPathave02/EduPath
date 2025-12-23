import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { quizAPI } from '../api/apiService';
import { AuthContext } from '../context/AuthContext';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface DetailedResults {
  quiz: QuizData;
  userAnswers: number[];
}

interface QuizData {
  quizId: string;
  subject: string;
  level: string;
  questions: Question[];
}

const QuizScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<DetailedResults | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('React Native');
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { userToken } = useContext(AuthContext);

  const subjects = [
    'React Native',
    'JavaScript',
    'Node.js',
    'MongoDB',
    'Computer Science',
    'Web Development',
    'Mobile Development'
  ];

  useEffect(() => {
    if (quizStarted) {
      startNewQuiz();
    }
  }, [quizStarted]);

  const startNewQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.startQuiz({
        subject: selectedSubject,
        level: selectedLevel,
        count: 6,
      });
      
      if (response.data.ok) {
        setQuiz(response.data.quiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      Alert.alert('Error', 'Failed to generate quiz. Please try again later.');
      // Fallback to sample quiz
      setQuiz({
        quizId: 'fallback-1',
        subject: selectedSubject,
        level: selectedLevel,
        questions: [
          {
            id: 'q1',
            question: "What is React Native primarily used for?",
            options: [
              "Web development",
              "Mobile app development", 
              "Desktop applications",
              "Game development"
            ],
            correctIndex: 1,
            explanation: "React Native is a framework for building mobile applications."
          },
          {
            id: 'q2',
            question: "Which programming language is primarily used in React Native?",
            options: [
              "Java",
              "Swift",
              "JavaScript",
              "Python"
            ],
            correctIndex: 2,
            explanation: "React Native uses JavaScript as its primary programming language."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswers({...selectedAnswers, [currentQuestionIndex]: optionIndex});
  };

  const nextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      if (quiz) {
        const answers = quiz.questions.map((_, index) => selectedAnswers[index] ?? -1);
        
        if (!userToken) {
          Alert.alert('Error', 'You must be logged in to submit a quiz.');
          return;
        }
        const response = await quizAPI.submitQuiz({
          quiz,
          answers,
        });
        
        if (response.data.ok) {
          setQuizResults(response.data.detailedResults);
          setQuizCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Your answers were not saved.');
    }
  };

  const restartQuiz = () => {
    setQuizCompleted(false);
    setQuizStarted(false);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setLoading(false);
    setQuizResults(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e4de2" />
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz setup screen
  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>🧠 AI-Powered Quiz</Text>
          <Text style={styles.subtitle}>Get fresh questions generated just for you!</Text>
          
          <View style={styles.setupContainer}>
            <Text style={styles.sectionTitle}>Choose Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectButton,
                    selectedSubject === subject && styles.selectedSubjectButton
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text style={[
                    styles.subjectButtonText,
                    selectedSubject === subject && styles.selectedSubjectButtonText
                  ]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Difficulty Level:</Text>
            <View style={styles.levelContainer}>
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    selectedLevel === level && styles.selectedLevelButton
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    selectedLevel === level && styles.selectedLevelButtonText
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                if (!userToken) {
                  Alert.alert('Login Required', 'You need to be logged in to start a quiz.');
                  return;
                }
                setQuizStarted(true);
              }}
            >
              <Text style={styles.startButtonText}>🚀 Generate Quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizCompleted && quizResults) {
    const { quiz, userAnswers } = quizResults;
    const score = userAnswers.reduce((acc, answer, index) => 
      answer === quiz.questions[index].correctIndex ? acc + 1 : acc, 0);
    const percent = Math.round((score / quiz.questions.length) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.resultsHeader}>
            <Text style={styles.completedTitle}>Quiz Results</Text>
            <Text style={styles.scoreText}>You scored: {score}/{quiz.questions.length} ({percent}%)</Text>
          </View>

          {quiz.questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <View key={q.id} style={styles.resultCard}>
                <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
                {q.options.map((option, optIndex) => {
                  const isUserAnswer = userAnswer === optIndex;
                  const isCorrectAnswer = q.correctIndex === optIndex;
                  return (
                    <View
                      key={optIndex}
                      style={[
                        styles.resultOption,
                        isCorrectAnswer && styles.correctAnswer,
                        isUserAnswer && !isCorrect && styles.incorrectAnswer,
                      ]}
                    >
                      <Text style={styles.resultOptionText}>{option}</Text>
                    </View>
                  );
                })}
                {!isCorrect && q.explanation && (
                  <Text style={styles.explanationText}>Explanation: {q.explanation}</Text>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Text style={styles.restartButtonText}>Take Another Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No quiz available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🧠 {quiz.subject} Quiz</Text>
        <Text style={styles.subtitle}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }]} />
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.options.map((option: string, index: number) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
              ]}
              onPress={() => handleAnswer(index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedAnswers[currentQuestionIndex] === undefined && styles.disabledButton
          ]}
          onPress={nextQuestion}
          disabled={selectedAnswers[currentQuestionIndex] === undefined}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 24,
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
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 30,
  },
  progress: {
    height: '100%',
    backgroundColor: '#5e4de2',
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#5e4de2',
    backgroundColor: '#f0f0ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#5e4de2',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#5e4de2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5e4de2',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 30,
  },
  completedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  setupContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  subjectScroll: {
    marginBottom: 20,
  },
  subjectButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  selectedSubjectButton: {
    backgroundColor: '#5e4de2',
    borderColor: '#5e4de2',
  },
  subjectButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSubjectButtonText: {
    color: '#ffffff',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  levelButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#5e4de2',
    borderColor: '#5e4de2',
  },
  levelButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLevelButtonText: {
    color: '#ffffff',
  },
  startButton: {
    backgroundColor: '#5e4de2',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restartButton: {
    backgroundColor: '#5e4de2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  resultOption: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  incorrectAnswer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  resultOptionText: {
    fontSize: 16,
  },
  explanationText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default QuizScreen;
