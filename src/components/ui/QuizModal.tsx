import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS } from '../../constants';
import { getNextQuizQuestion, Question, saveQuizResult } from '../../utils/spacedRepetition';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const QuizModal: React.FC = () => {
  const { t } = useTranslation();
  const quizActive = useGameStore((s) => s.quizActive);
  const setQuizActive = useGameStore((s) => s.setQuizActive);
  const reviveGame = useGameStore((s) => s.reviveGame);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);

  // Load question when modal opens
  useEffect(() => {
    if (quizActive) {
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeExpired(false);
      setTimeLeft(30);
      progress.value = 1;

      const startTimer = (q: Question) => {
        setQuestion(q);
        // Start progress bar animation
        progress.value = withTiming(0, {
          duration: 30000,
          easing: Easing.linear,
        });

        // Start text-based countdown
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleTimeOut();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };

      const cached = useGameStore.getState().cachedQuizQuestion;
      if (cached) {
        startTimer(cached);
      } else {
        getNextQuizQuestion()
          .then((q) => {
            useGameStore.getState().registerUsedQuestion(q.question);
            startTimer(q);
          })
          .catch((err) => {
            console.error('Failed to load quiz question:', err);
            setQuizActive(false);
          });
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizActive]);

  const handleTimeOut = () => {
    setTimeExpired(true);
    setShowExplanation(true);
    if (question) {
      void saveQuizResult(question.id, false);
    }
  };

  const handleNextQuestion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeExpired(false);
    setTimeLeft(30);
    progress.value = 1;

    getNextQuizQuestion()
      .then((q) => {
        useGameStore.getState().registerUsedQuestion(q.question);
        setQuestion(q);
        progress.value = withTiming(0, {
          duration: 30000,
          easing: Easing.linear,
        });

        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleTimeOut();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch(() => {
        setQuizActive(false);
      });
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || timeExpired) return; // Prevent double select

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Stop progress bar animation at current position
    progress.value = progress.value;

    setSelectedAnswer(index);
    const isCorrect = index === question?.correctAnswer;

    if (isCorrect) {
      if (question) {
        void saveQuizResult(question.id, true);
      }
      // Wait 1.2s for celebration effect then revive
      setTimeout(() => {
        reviveGame();
      }, 1200);
    } else {
      if (question) {
        void saveQuizResult(question.id, false);
      }
      setShowExplanation(true);
      // Do NOT auto-close modal on incorrect answer so user can read explanation as long as needed!
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!quizActive || !question) return null;

  return (
    <Modal visible={quizActive} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header & Title */}
          <Text style={styles.headerTitle}>{t('quiz.title')}</Text>
          <Text style={styles.subtitle}>{t('quiz.subtitle')}</Text>

          {/* Timer Progress Bar */}
          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                animatedProgressStyle,
                timeLeft <= 3 ? { backgroundColor: '#EF4444' } : null,
              ]}
            />
            <Text style={styles.timerText}>
              {timeExpired ? t('quiz.time_expired') : `${timeLeft}s`}
            </Text>
          </View>

          {/* Question Text */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Option Buttons */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, idx) => {
              const isCorrectAnswer = idx === question.correctAnswer;
              const isSelected = idx === selectedAnswer;

              const buttonStyle: StyleProp<ViewStyle>[] = [styles.optionButton];
              const textStyle: StyleProp<TextStyle>[] = [styles.optionText];

              if (selectedAnswer !== null || timeExpired) {
                if (isCorrectAnswer) {
                  // Highlight correct answer in green
                  buttonStyle.push(styles.optionCorrect);
                  textStyle.push(styles.optionTextCorrect);
                } else if (isSelected) {
                  // Highlight selected wrong answer in red
                  buttonStyle.push(styles.optionIncorrect);
                  textStyle.push(styles.optionTextIncorrect);
                } else {
                  // Fade out other options
                  buttonStyle.push(styles.optionDisabled);
                }
              }

              return (
                <Pressable
                  key={idx}
                  style={buttonStyle}
                  onPress={() => handleAnswerSelect(idx)}
                  disabled={selectedAnswer !== null || timeExpired}
                >
                  <Text style={textStyle}>
                    {String.fromCharCode(65 + idx)}. {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Explanation Modal Body & Action Buttons */}
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {selectedAnswer === question.correctAnswer
                  ? t('quiz.correct')
                  : timeExpired
                  ? t('quiz.timeout')
                  : t('quiz.incorrect')}
              </Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>

              {/* Action buttons so user can read/study or retry another question */}
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, styles.nextBtn]}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.nextBtnText}>{t('quiz.next_question')}</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, styles.closeBtn]}
                  onPress={() => setQuizActive(false)}
                >
                  <Text style={styles.closeBtnText}>{t('common.back')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 30, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: Math.min(SCREEN_WIDTH * 0.9, 390),
    backgroundColor: 'rgba(15, 23, 68, 0.98)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: UI_COLORS.TEXT_SCORE,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerContainer: {
    width: '100%',
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#10B981', // Emerald green
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    zIndex: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  questionContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 18,
  },
  questionText: {
    fontSize: 16,
    color: '#F1F5F9',
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 10,
  },
  optionButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 15,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
  },
  optionTextCorrect: {
    color: '#34D399',
    fontWeight: '800',
  },
  optionIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
  },
  optionTextIncorrect: {
    color: '#F87171',
    fontWeight: '800',
  },
  optionDisabled: {
    opacity: 0.45,
  },
  explanationContainer: {
    marginTop: 18,
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: UI_COLORS.TEXT_SCORE,
    marginBottom: 4,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
  },
});
