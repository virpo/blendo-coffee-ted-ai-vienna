import { createContext, useContext, useReducer, useEffect } from 'react';

// Quiz state machine states
const QUIZ_STATES = {
  IDLE: 'idle',
  QUESTION_1: 'question_1',
  QUESTION_2: 'question_2',
  QUESTION_3: 'question_3',
  QUESTION_4: 'question_4',
  QUESTION_5: 'question_5',
  QUESTION_6: 'question_6',
  RESULT: 'result'
};

// Quiz questions data
const QUIZ_QUESTIONS = {
  1: {
    id: 1,
    text: "Your coffee soul craves...",
    type: "radio",
    options: [
      { value: 'bright-fruity', label: '☀️ Bright & fruity', description: 'Ethiopian vibes, floral notes, pour-over perfection' },
      { value: 'rich-chocolatey', label: '🍫 Rich & chocolatey', description: 'Dark roasts, South American, espresso-forward' },
      { value: 'smooth-nutty', label: '🌰 Smooth & nutty', description: 'Balanced Brazilian, caramel sweetness, approachable' }
    ]
  },
  2: {
    id: 2,
    text: "Preferred roast color?",
    type: "radio",
    options: [
      { value: 'light', label: 'Light' },
      { value: 'medium', label: 'Medium' },
      { value: 'dark', label: 'Dark' }
    ],
    visual: true // Has bean strip visual
  },
  3: {
    id: 3,
    text: "Flavors you love in food?",
    type: "multi-select",
    options: [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'caramel', label: 'Caramel' },
      { value: 'citrus', label: 'Citrus' },
      { value: 'berry', label: 'Berry' },
      { value: 'nutty', label: 'Nutty' },
      { value: 'floral', label: 'Floral' },
      { value: 'spicy', label: 'Spicy' }
    ],
    maxSelection: 3
  },
  4: {
    id: 4,
    text: "Bitterness tolerance?",
    type: "slider",
    min: 1,
    max: 5,
    labels: ['Mild', 'Low', 'Medium', 'Strong', 'Intense']
  },
  5: {
    id: 5,
    text: "Brew method at home?",
    type: "radio",
    options: [
      { value: 'drip', label: 'Drip' },
      { value: 'espresso', label: 'Espresso' },
      { value: 'pour-over', label: 'Pour-Over' },
      { value: 'french-press', label: 'French Press' },
      { value: 'pod', label: 'Pod' },
      { value: 'not-sure', label: 'Not sure' }
    ]
  },
  6: {
    id: 6,
    text: "Caffeine sensitivity?",
    type: "radio",
    options: [
      { value: 'full', label: 'Full' },
      { value: 'half-caf', label: 'Half-caf' },
      { value: 'low-decaf', label: 'Low/Decaf' }
    ]
  }
};

// Initial state
const initialState = {
  currentState: QUIZ_STATES.IDLE,
  currentQuestion: 1,
  answers: {},
  progress: 0,
  result: null,
  startTime: null,
  completionTime: null
};

// Reducer
function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        currentState: QUIZ_STATES.QUESTION_1,
        currentQuestion: 1,
        startTime: Date.now(),
        answers: action.firstAnswer ? { 1: action.firstAnswer } : {},
        progress: action.firstAnswer ? (1 / 6) * 100 : (0 / 6) * 100
      };

    case 'ANSWER_QUESTION':
      const newAnswers = { ...state.answers, [action.questionId]: action.answer };
      const progress = (Object.keys(newAnswers).length / 6) * 100;

      return {
        ...state,
        answers: newAnswers,
        progress
      };

    case 'NEXT_QUESTION':
      const nextQuestion = state.currentQuestion + 1;
      if (nextQuestion > 6) {
        return {
          ...state,
          currentState: QUIZ_STATES.RESULT,
          completionTime: Date.now(),
          progress: 100
        };
      }

      // Calculate progress based on current question position + answered questions
      const answeredCount = Object.keys(state.answers).length;
      const questionProgress = ((nextQuestion - 1) / 6) * 100; // Base progress for reaching this question
      const answerBonus = answeredCount > 0 ? (answeredCount / 6) * 5 : 0; // Small bonus for answers
      const newProgress = Math.min(questionProgress + answerBonus, 100);

      return {
        ...state,
        currentQuestion: nextQuestion,
        currentState: `question_${nextQuestion}`,
        progress: newProgress
      };

    case 'PREVIOUS_QUESTION':
      const prevQuestion = Math.max(1, state.currentQuestion - 1);
      const prevAnsweredCount = Object.keys(state.answers).length;
      const prevQuestionProgress = ((prevQuestion - 1) / 6) * 100;
      const prevAnswerBonus = prevAnsweredCount > 0 ? (prevAnsweredCount / 6) * 5 : 0;
      const prevProgress = Math.min(prevQuestionProgress + prevAnswerBonus, 100);

      return {
        ...state,
        currentQuestion: prevQuestion,
        currentState: prevQuestion === 1 ? QUIZ_STATES.QUESTION_1 : `question_${prevQuestion}`,
        progress: prevProgress
      };

    case 'GENERATE_RESULT':
      return {
        ...state,
        result: action.result,
        completionTime: Date.now()
      };

    case 'RESET_QUIZ':
      return {
        ...initialState
      };

    case 'SKIP_QUESTION':
      const skipAnswers = { ...state.answers, [action.questionId]: 'skipped' };
      const skipProgress = (Object.keys(skipAnswers).length / 6) * 100;
      const skipNextQuestion = state.currentQuestion + 1;

      if (skipNextQuestion > 6) {
        return {
          ...state,
          answers: skipAnswers,
          progress: skipProgress,
          currentState: QUIZ_STATES.RESULT,
          completionTime: Date.now()
        };
      }

      return {
        ...state,
        answers: skipAnswers,
        progress: skipProgress,
        currentQuestion: skipNextQuestion,
        currentState: `question_${skipNextQuestion}`
      };

    default:
      return state;
  }
}

// Context
const QuizContext = createContext();

// Provider component
export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Analytics helper
  const logEvent = (eventName, data = {}) => {
    console.log(eventName, {
      ...data,
      timestamp: Date.now(),
      currentQuestion: state.currentQuestion,
      progress: state.progress
    });
  };

  // Actions
  const actions = {
    startQuiz: (firstAnswer = null) => {
      logEvent('quiz_start', { first_answer: firstAnswer });
      dispatch({ type: 'START_QUIZ', firstAnswer });
    },

    answerQuestion: (questionId, answer) => {
      logEvent(`q_answered_${questionId}`, { answer });
      dispatch({ type: 'ANSWER_QUESTION', questionId, answer });
    },

    nextQuestion: () => {
      const nextQ = state.currentQuestion + 1;
      if (nextQ > 6) {
        logEvent('quiz_complete');
        // Generate result before moving to result state
        const result = generateBlendResult(state.answers);
        logEvent('blend_generated', { blend_name: result.name, tasting_notes: result.notes });
        dispatch({ type: 'GENERATE_RESULT', result });
      }
      dispatch({ type: 'NEXT_QUESTION' });
    },

    previousQuestion: () => {
      dispatch({ type: 'PREVIOUS_QUESTION' });
    },

    skipQuestion: (questionId) => {
      logEvent(`q_skipped_${questionId}`);
      dispatch({ type: 'SKIP_QUESTION', questionId });
    },

    resetQuiz: () => {
      logEvent('quiz_reset');
      dispatch({ type: 'RESET_QUIZ' });
    },

    selectPlan: (plan) => {
      logEvent('plan_selected', { plan });
    }
  };

  const value = {
    ...state,
    actions,
    questions: QUIZ_QUESTIONS,
    currentQuestionData: QUIZ_QUESTIONS[state.currentQuestion],
    isComplete: state.currentState === QUIZ_STATES.RESULT,
    totalQuestions: Object.keys(QUIZ_QUESTIONS).length,
    canGoBack: state.currentQuestion > 1,
    canGoForward: state.answers[state.currentQuestion] !== undefined,
    timeElapsed: state.startTime ? Date.now() - state.startTime : 0
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

// Hook to use context
export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

// Blend result generation logic
function generateBlendResult(answers) {
  const blendNames = [
    'Nocturne 03', 'Aurora Blend', 'Meridian', 'Solstice', 'Compass Rose',
    'Twilight', 'Zenith', 'Harmony', 'Cascade', 'Ember', 'Mosaic', 'Prism'
  ];

  const origins = [
    'Ethiopian Yirgacheffe', 'Colombian Huila', 'Guatemalan Antigua',
    'Brazilian Santos', 'Costa Rican Tarrazú', 'Jamaican Blue Mountain',
    'Hawaiian Kona', 'Kenyan AA', 'Peruvian Organic', 'Panamanian Geisha'
  ];

  // Generate blend based on answers
  const flavorProfile = answers[1] || 'smooth-nutty';
  const roastPreference = answers[2] || 'medium';
  const flavors = answers[3] || ['chocolate'];
  const bitterness = answers[4] || 3;
  const brewMethod = answers[5] || 'drip';
  const caffeine = answers[6] || 'full';

  // Select blend name (pseudo-random based on answers)
  const nameIndex = (flavorProfile.length + roastPreference.length + bitterness) % blendNames.length;
  const name = blendNames[nameIndex];

  // Generate tasting notes based on flavor preferences
  const selectedFlavors = Array.isArray(flavors) ? flavors : [flavors];
  const flavorMap = {
    'chocolate': 'Dark chocolate',
    'caramel': 'Caramel sweetness',
    'citrus': 'Bright citrus',
    'berry': 'Berry notes',
    'nutty': 'Toasted hazelnut',
    'floral': 'Floral hints',
    'spicy': 'Warm spice'
  };

  const notes = selectedFlavors
    .slice(0, 3)
    .map(flavor => flavorMap[flavor] || 'Complex notes')
    .join(' • ');

  // Generate origins mix
  const primaryOrigin = origins[Math.floor(Math.random() * origins.length)];
  const secondaryOrigin = origins[Math.floor(Math.random() * origins.length)];
  const originBreakdown = `${primaryOrigin} 60% • ${secondaryOrigin} 40%`;

  // Grind suggestion based on brew method
  const grindMap = {
    'espresso': 'Fine',
    'pour-over': 'Medium-fine',
    'drip': 'Medium',
    'french-press': 'Coarse',
    'pod': 'Pre-ground',
    'not-sure': 'Medium'
  };
  const grindSuggestion = grindMap[brewMethod] || 'Medium';

  // Roast level based on preferences
  const roastMap = {
    'light': 'Light Roast',
    'medium': 'Medium Roast',
    'dark': 'Dark Roast'
  };
  const roastLevel = roastMap[roastPreference] || 'Medium Roast';

  // Add finishing note based on roast and flavors
  const finishes = ['Smooth finish', 'Caramel finish', 'Clean finish', 'Bold finish'];
  const finish = finishes[Math.floor(Math.random() * finishes.length)];

  // Generate description based on flavor profile
  const profileDescriptions = {
    'bright-fruity': 'bright, fruit-forward coffee with vibrant acidity',
    'rich-chocolatey': 'rich, chocolatey coffee with bold, deep flavors',
    'smooth-nutty': 'smooth, well-balanced coffee with nutty sweetness'
  };

  const profileDesc = profileDescriptions[flavorProfile] || 'perfectly balanced coffee';

  return {
    name,
    notes: `${notes} • ${finish}`,
    origins: originBreakdown,
    roastLevel,
    grindSuggestion,
    caffeineLevel: caffeine === 'full' ? 'Full Caffeine' :
                  caffeine === 'half-caf' ? 'Half Caffeine' : 'Low/Decaf',
    description: `A carefully crafted blend that delivers ${profileDesc} with ${roastPreference} roast character. This blend celebrates your unique taste preferences while maintaining perfect balance in every cup.`
  };
}

export { QUIZ_STATES };