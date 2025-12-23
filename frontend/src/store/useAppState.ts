import { useState, useEffect } from 'react';
import { getData, storeData } from './storage';

// This is a placeholder for a more robust state management solution
export const useAppState = () => {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadState = async () => {
      const savedAnswers = await getData('quizAnswers');
      if (savedAnswers) {
        setQuizAnswers(savedAnswers);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    storeData('quizAnswers', quizAnswers);
  }, [quizAnswers]);

  return {
    quizAnswers,
    setQuizAnswers,
  };
};
