import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from '../data/toeicQuestions.json';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_HISTORY_KEY = '@block-blast:quiz-history-v1';

interface QuizHistoryRecord {
  correctCount: number;
  incorrectCount: number;
  lastAttemptTime: number;
}

export type QuizHistory = Record<string, QuizHistoryRecord>;

/**
 * Load quiz attempts history from AsyncStorage
 */
export async function getQuizHistory(): Promise<QuizHistory> {
  try {
    const data = await AsyncStorage.getItem(QUIZ_HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.warn('Failed to load quiz history:', e);
    return {};
  }
}

/**
 * Record a correct or incorrect answer for a question
 */
export async function saveQuizResult(questionId: string, isCorrect: boolean): Promise<void> {
  try {
    const history = await getQuizHistory();
    const record = history[questionId] || { correctCount: 0, incorrectCount: 0, lastAttemptTime: 0 };

    if (isCorrect) {
      record.correctCount += 1;
    } else {
      record.incorrectCount += 1;
    }
    record.lastAttemptTime = Date.now();
    history[questionId] = record;

    await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save quiz result:', e);
  }
}

/**
 * Pick a question using weighted random selection based on Spaced Repetition weights:
 * - Base weight = 1.0
 * - Each incorrect answer increases weight (factor of 2)
 * - Each correct answer decreases weight (factor of 0.5, minimum weight 0.1)
 */
export async function getNextQuizQuestion(): Promise<Question> {
  const history = await getQuizHistory();
  const questions: Question[] = questionsData;

  if (questions.length === 0) {
    throw new Error('No questions available');
  }

  // Calculate weights
  const weights = questions.map((q) => {
    const record = history[q.id];
    if (!record) return 1.0;

    // Weight formula
    const incorrectMultiplier = Math.pow(2, record.incorrectCount);
    const correctMultiplier = Math.pow(0.5, record.correctCount);
    const weight = 1.0 * incorrectMultiplier * correctMultiplier;

    // Clamp weight between 0.1 and 10.0 to prevent starvation or complete dominance
    return Math.max(0.1, Math.min(10.0, weight));
  });

  // Weighted random pick
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = Math.random() * totalWeight;

  for (let i = 0; i < questions.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return questions[i];
    }
  }

  return questions[0];
}
