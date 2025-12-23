import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question } from '../store/types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.question}</Text>
      {/* Options would be rendered here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default QuestionCard;
