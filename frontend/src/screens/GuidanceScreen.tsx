import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';
import { guidanceAPI, studyPlanAPI } from '../api/apiService';
import { AuthContext } from '../context/AuthContext';

// --- INTERFACES ---
interface Resource {
  name: string;
  url: string;
  type: 'documentation' | 'course' | 'roadmap' | 'article';
}

interface IStudySession {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
}

interface IStudyPlan {
  _id: string;
  userId: string;
  domain: string;
  studySchedule: IStudySession[];
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'datascience';
  steps: string[];
  resources: Resource[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
}

// --- MOCK DATA ---
const mockRoadmaps: Roadmap[] = [
  {
    _id: '1',
    title: 'Frontend Developer',
    description: 'Build beautiful and responsive user interfaces.',
    category: 'frontend',
    steps: ['HTML & CSS', 'JavaScript (ES6+)', 'React.js', 'State Management (Redux/Context)', 'TypeScript', 'Build Tools (Webpack/Vite)'],
    resources: [
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'documentation' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com/', type: 'course' },
      { name: 'Frontend Masters', url: 'https://frontendmasters.com/', type: 'course' },
    ],
    difficulty: 'beginner',
    estimatedDuration: '6-8 months',
  },
  {
    _id: '2',
    title: 'Backend Developer',
    description: 'Power applications with robust server-side logic.',
    category: 'backend',
    steps: ['Choose a Language (Node.js/Python/Go)', 'Database Fundamentals (SQL/NoSQL)', 'API Design (REST/GraphQL)', 'Authentication & Security', 'Docker & Containers'],
    resources: [
      { name: 'Node.js Docs', url: 'https://nodejs.org/en/docs/', type: 'documentation' },
      { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'course' },
      { name: 'The Twelve-Factor App', url: 'https://12factor.net/', type: 'article' },
    ],
    difficulty: 'intermediate',
    estimatedDuration: '8-10 months',
  },
  {
    _id: '3',
    title: 'Full-Stack Developer',
    description: 'Master both the frontend and backend.',
    category: 'fullstack',
    steps: ['Complete Frontend Path', 'Complete Backend Path', 'CI/CD Pipelines', 'Cloud Deployment (AWS/Azure/GCP)', 'System Design Basics'],
    resources: [
      { name: 'Full Stack Open', url: 'https://fullstackopen.com/en/', type: 'course' },
      { name: 'roadmap.sh', url: 'https://roadmap.sh/full-stack', type: 'roadmap' },
    ],
    difficulty: 'advanced',
    estimatedDuration: '12-18 months',
  },
  {
    _id: '4',
    title: 'Data Scientist',
    description: 'Extract insights and build models from data.',
    category: 'datascience',
    steps: ['Python for Data Science (Pandas, NumPy)', 'Data Visualization (Matplotlib, Seaborn)', 'Machine Learning Fundamentals', 'SQL for Data Analysis', 'Big Data Technologies (Spark)'],
    resources: [
      { name: 'Kaggle Courses', url: 'https://www.kaggle.com/learn', type: 'course' },
      { name: 'DataCamp', url: 'https://www.datacamp.com/', type: 'course' },
      { name: 'Towards Data Science', url: 'https://towardsdatascience.com/', type: 'article' },
    ],
    difficulty: 'intermediate',
    estimatedDuration: '9-12 months',
  },
];

const motivationalQuotes = [
  "The secret of getting ahead is getting started. - Mark Twain",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Your limitation—it's only your imagination. - Unknown",
  "Push yourself, because no one else is going to do it for you. - Unknown",
  "Great things never come from comfort zones. - Unknown",
];

const careerTips = [
  { title: "Build in Public", description: "Share your learning journey on social media. It builds accountability and a personal brand." },
  { title: "Network Actively", description: "Attend meetups and connect with developers on LinkedIn. Opportunities come from people." },
  { title: "Contribute to Open Source", description: "It's a great way to get real-world experience and collaborate with senior developers." },
  { title: "Never Stop Learning", description: "The tech landscape changes fast. Dedicate time each week to learn something new." },
];

// --- COMPONENT ---
const GuidanceScreen = () => {
  const [selectedPath, setSelectedPath] = useState<Roadmap['category']>('frontend');
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [studyPlan, setStudyPlan] = useState<IStudyPlan | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempSchedule, setTempSchedule] = useState<IStudySession[]>([]);
  const [quote, setQuote] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchRoadmaps();
    if (user?._id) {
      fetchUserProgress();
      fetchStudyPlan(user._id, selectedPath);
    }
    // Set a random quote on initial load
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [user, selectedPath]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await guidanceAPI.getRoadmaps();
      setRoadmaps(response.data.length > 0 ? response.data : mockRoadmaps);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      Alert.alert('Error', 'Failed to load guidance. Using sample data.');
      setRoadmaps(mockRoadmaps); // Fallback to mock data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (user?._id) {
        const response = await guidanceAPI.getUserProgress(user._id);
        setUserProgress(response.data);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handlePathSelection = async (category: Roadmap['category']) => {
    setSelectedPath(category);
    if (user?._id) {
      try {
        await guidanceAPI.selectPath(user._id, category);
        fetchUserProgress();
        fetchStudyPlan(user._id, category); // Refetch study plan for new path
      } catch (error) {
        console.error('Error selecting path:', error);
      }
    }
  };

  const handleStepComplete = async (stepIndex: number) => {
    if (user?._id) {
      try {
        await guidanceAPI.completeStep(user._id, stepIndex);
        fetchUserProgress();
        Alert.alert('Great!', 'Step marked as completed!');
      } catch (error) {
        console.error('Error completing step:', error);
      }
    }
  };

  const fetchStudyPlan = async (userId: string, domain: Roadmap['category']) => {
    try {
      const response = await studyPlanAPI.getStudyPlan({ userId, domain });
      setStudyPlan(response.data);
    } catch (err) {
      const error = err as any;
      // It's okay if a plan doesn't exist yet, so we can ignore 404 errors.
      if (error.response?.status !== 404) {
        console.error('Error fetching study plan:', error);
      }
      setStudyPlan(null); // Ensure plan is null if not found
    }
  };

  const openLink = (url: string) => Linking.openURL(url);

  const handleOpenModal = () => {
    setTempSchedule(studyPlan?.studySchedule || []);
    setModalVisible(true);
  };

  const handleSaveSchedule = async () => {
    if (!user?._id) return;

    try {
      if (studyPlan) {
        await studyPlanAPI.updateStudySchedule(studyPlan._id, tempSchedule);
      } else {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 6); // Default target

        await studyPlanAPI.createOrUpdateStudyPlan({
          userId: user._id,
          domain: selectedPath,
          studySchedule: tempSchedule,
          targetCompletionDate: targetDate,
        });
      }
      fetchStudyPlan(user._id, selectedPath);
      setModalVisible(false);
      Alert.alert('Success', 'Your schedule has been saved!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Could not save your schedule.');
    }
  };

  const toggleDay = (day: IStudySession['day']) => {
    const existing = tempSchedule.find(s => s.day === day);
    if (existing) {
      setTempSchedule(tempSchedule.filter(s => s.day !== day));
    } else {
      setTempSchedule([...tempSchedule, { day, startTime: '09:00', endTime: '10:00' }]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e4de2" />
          <Text style={styles.loadingText}>Loading Your Personalized Guidance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedRoadmap = roadmaps.find(r => r.category === selectedPath) || roadmaps[0];
  const categories = [...new Set(roadmaps.map(r => r.category))];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Weekly Schedule</Text>
            <ScrollView>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <TouchableOpacity key={day} onPress={() => toggleDay(day as IStudySession['day'])} style={styles.daySelector}>
                  <Text>{day}</Text>
                  <View style={[styles.checkbox, tempSchedule.some(s => s.day === day) && styles.checkboxSelected]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Learning Path</Text>
        <Text style={styles.subtitle}>Choose your journey and start learning today.</Text>

        {/* Path Selection */}
        <View style={styles.pathContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.pathButton, selectedPath === category && styles.selectedPathButton]}
              onPress={() => handlePathSelection(category)}
            >
              <Text style={[styles.pathButtonText, selectedPath === category && styles.selectedPathButtonText]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Study Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Study Schedule</Text>
          {studyPlan && studyPlan.studySchedule.length > 0 ? (
            studyPlan.studySchedule.map((session, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>{session.day}</Text>
                <Text style={styles.scheduleTime}>{`${session.startTime} - ${session.endTime}`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.tipDescription}>No study schedule set yet. Tap the button to create one!</Text>
          )}
          <TouchableOpacity style={styles.editButton} onPress={handleOpenModal}>
            <Text style={styles.editButtonText}>{studyPlan ? 'Edit Schedule' : 'Set Schedule'}</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Roadmap Details */}
        {selectedRoadmap && (
          <View style={styles.card}>
            <Text style={styles.roadmapTitle}>{selectedRoadmap.title}</Text>
            <Text style={styles.roadmapDescription}>{selectedRoadmap.description}</Text>
            <Text style={styles.durationText}>Est. Duration: {selectedRoadmap.estimatedDuration}</Text>

            <Text style={styles.sectionTitle}>Learning Steps</Text>
            {selectedRoadmap.steps.map((step, index) => {
              const isCompleted = userProgress?.completedSteps?.includes(index);
              return (
                <TouchableOpacity key={index} style={[styles.stepContainer, isCompleted && styles.completedStep]} onPress={() => handleStepComplete(index)}>
                  <View style={[styles.stepNumber, isCompleted && styles.completedStepNumber]}>
                    <Text style={styles.stepNumberText}>{isCompleted ? '✓' : index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, isCompleted && styles.completedStepText]}>{step}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.sectionTitle}>Recommended Resources</Text>
            {selectedRoadmap.resources.map((resource, index) => (
              <TouchableOpacity key={index} style={styles.resourceButton} onPress={() => openLink(resource.url)}>
                <Text style={styles.resourceText}>{resource.name} ({resource.type})</Text>
                <Text style={styles.linkIcon}>🔗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Career Tips */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🚀 Career Tips</Text>
          {careerTips.map((tip, index) => (
            <View key={index} style={styles.tipContainer}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </View>

        {/* Motivational Quote */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💡 Daily Motivation</Text>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, padding: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1c1e21', textAlign: 'center', marginBottom: 5, marginTop: 30 },
  subtitle: { fontSize: 16, color: '#606770', textAlign: 'center', marginBottom: 20 },
  pathContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 15, gap: 10 },
  pathButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  selectedPathButton: { backgroundColor: '#5e4de2', borderColor: '#5e4de2' },
  pathButtonText: { color: '#333', fontWeight: '600' },
  selectedPathButtonText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  roadmapTitle: { fontSize: 22, fontWeight: 'bold', color: '#5e4de2', marginBottom: 5 },
  roadmapDescription: { fontSize: 15, color: '#606770', marginBottom: 10 },
  durationText: { fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  completedStep: { opacity: 0.7 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  completedStepNumber: { backgroundColor: '#4caf50' },
  stepNumberText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  stepText: { fontSize: 15, color: '#333', flex: 1 },
  completedStepText: { textDecorationLine: 'line-through', color: '#888' },
  resourceButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, marginTop: 5 },
  resourceText: { fontSize: 14, color: '#5e4de2', fontWeight: '500' },
  linkIcon: { fontSize: 16 },
  scheduleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  scheduleDay: { fontSize: 15, fontWeight: '500', color: '#333' },
  scheduleTime: { fontSize: 15, color: '#606770' },
  editButton: { backgroundColor: '#5e4de2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tipContainer: { marginBottom: 10 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  tipDescription: { fontSize: 14, color: '#606770' },
  quoteText: { fontSize: 16, fontStyle: 'italic', color: '#606770', textAlign: 'center' },
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  daySelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#ddd', borderRadius: 4 },
  checkboxSelected: { backgroundColor: '#5e4de2', borderColor: '#5e4de2' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { padding: 12, borderRadius: 8, backgroundColor: '#f0f2f5' },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
  saveButton: { padding: 12, borderRadius: 8, backgroundColor: '#5e4de2' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default GuidanceScreen;
