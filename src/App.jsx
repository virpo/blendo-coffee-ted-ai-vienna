import { QuizProvider, useQuiz, QUIZ_STATES } from './context/QuizContext';
import Hero from './components/Hero/Hero';
import Quiz from './components/Quiz/Quiz';
import Result from './components/Result/Result';

// Main App Content Component
function AppContent() {
  const { currentState, actions } = useQuiz();

  const handleQuizStart = (data) => {
    actions.startQuiz(data.answer);
  };

  // Render different views based on quiz state
  const renderCurrentView = () => {
    switch (currentState) {
      case QUIZ_STATES.IDLE:
        return <Hero onQuizStart={handleQuizStart} />;

      case QUIZ_STATES.RESULT:
        return <Result />;

      default:
        // Any question state (question_1, question_2, etc.)
        return <Quiz />;
    }
  };

  return (
    <div className="app">
      {renderCurrentView()}
    </div>
  );
}

// Root App Component with Context Provider
function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  );
}

export default App;