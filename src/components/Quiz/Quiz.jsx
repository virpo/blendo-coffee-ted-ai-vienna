import { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import './Quiz.scss';

const Quiz = () => {
  const {
    currentQuestionData,
    currentQuestion,
    totalQuestions,
    progress,
    answers,
    actions,
    canGoBack,
    canGoForward
  } = useQuiz();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [multiSelectAnswers, setMultiSelectAnswers] = useState([]);
  const [sliderValue, setSliderValue] = useState(3);

  // Update local state when question changes
  useEffect(() => {
    const existingAnswer = answers[currentQuestion];
    if (existingAnswer && existingAnswer !== 'skipped') {
      if (currentQuestionData.type === 'multi-select') {
        setMultiSelectAnswers(Array.isArray(existingAnswer) ? existingAnswer : [existingAnswer]);
        setCurrentAnswer('');
      } else if (currentQuestionData.type === 'slider') {
        setSliderValue(existingAnswer);
        setCurrentAnswer(existingAnswer);
      } else {
        setCurrentAnswer(existingAnswer);
        setMultiSelectAnswers([]);
      }
    } else {
      setCurrentAnswer('');
      setMultiSelectAnswers([]);
      setSliderValue(3);
    }
  }, [currentQuestion, currentQuestionData, answers]);

  const handleAnswerChange = (value) => {
    if (currentQuestionData.type === 'multi-select') {
      const newAnswers = multiSelectAnswers.includes(value)
        ? multiSelectAnswers.filter(a => a !== value)
        : [...multiSelectAnswers, value].slice(0, currentQuestionData.maxSelection || 3);

      setMultiSelectAnswers(newAnswers);
      actions.answerQuestion(currentQuestion, newAnswers);
    } else if (currentQuestionData.type === 'slider') {
      setSliderValue(value);
      setCurrentAnswer(value);
      actions.answerQuestion(currentQuestion, value);
    } else {
      setCurrentAnswer(value);
      actions.answerQuestion(currentQuestion, value);
    }
  };

  const handleNext = () => {
    actions.nextQuestion();
  };

  const handlePrevious = () => {
    actions.previousQuestion();
  };

  const handleSkip = () => {
    actions.skipQuestion(currentQuestion);
  };

  const getProgressWidth = () => `${progress}%`;

  const isAnswered = () => {
    if (currentQuestionData.type === 'multi-select') {
      return multiSelectAnswers.length > 0;
    }
    return currentAnswer !== '' && currentAnswer !== undefined;
  };

  if (!currentQuestionData) {
    return null;
  }

  return (
    <div className="quiz">
      <div className="quiz__container">

        {/* Progress Header */}
        <div className="quiz__header">
          <div className="quiz__progress">
            <div className="quiz__progress-info">
              <span className="quiz__progress-label">
                Question {currentQuestion} of {totalQuestions}
              </span>
              <span className="quiz__progress-percentage">{Math.round(progress)}%</span>
            </div>
            <div className="quiz__progress-bar">
              <div
                className="quiz__progress-fill"
                style={{ width: getProgressWidth() }}
              ></div>
            </div>
          </div>

          {canGoBack && (
            <button
              className="quiz__back-button btn btn-secondary"
              onClick={handlePrevious}
              aria-label="Go to previous question"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Question Content */}
        <div className="quiz__content">
          <div className="quiz__question-wrapper">

            {/* Question */}
            <fieldset className="quiz__question">
              <legend className="quiz__question-text">
                {currentQuestionData.text}
              </legend>

              {/* Visual Elements for Roast Question */}
              {currentQuestionData.visual && currentQuestion === 2 && (
                <div className="quiz__roast-visual" aria-hidden="true">
                  <div className="quiz__bean-strip">
                    <div className="quiz__bean quiz__bean--light"></div>
                    <div className="quiz__bean quiz__bean--medium"></div>
                    <div className="quiz__bean quiz__bean--dark"></div>
                  </div>
                </div>
              )}

              {/* Radio Buttons */}
              {currentQuestionData.type === 'radio' && (
                <div className="quiz__options" role="radiogroup">
                  {currentQuestionData.options.map((option) => (
                    <label key={option.value} className="quiz__option">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option.value}
                        checked={currentAnswer === option.value}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="quiz__option-input"
                      />
                      <span className="quiz__option-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Multi-Select Chips */}
              {currentQuestionData.type === 'multi-select' && (
                <div className="quiz__multi-select">
                  <p className="quiz__multi-select-help">
                    Select up to {currentQuestionData.maxSelection} flavors you enjoy
                  </p>
                  <div className="quiz__flavor-chips">
                    {currentQuestionData.options.map((option) => {
                      const isSelected = multiSelectAnswers.includes(option.value);
                      const isDisabled = !isSelected &&
                        multiSelectAnswers.length >= (currentQuestionData.maxSelection || 3);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`quiz__chip ${isSelected ? 'quiz__chip--selected' : ''} ${isDisabled ? 'quiz__chip--disabled' : ''}`}
                          onClick={() => handleAnswerChange(option.value)}
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                        >
                          <svg className="quiz__chip-icon" viewBox="0 0 100 100" aria-hidden="true">
                            <use href={`/assets/flavor_icons.svg#${option.value}`}></use>
                          </svg>
                          <span className="quiz__chip-label">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {multiSelectAnswers.length > 0 && (
                    <p className="quiz__selection-count">
                      {multiSelectAnswers.length} of {currentQuestionData.maxSelection} selected
                    </p>
                  )}
                </div>
              )}

              {/* Slider */}
              {currentQuestionData.type === 'slider' && (
                <div className="quiz__slider-wrapper">
                  <div className="quiz__slider-labels">
                    <span className="quiz__slider-label quiz__slider-label--start">
                      {currentQuestionData.labels[0]}
                    </span>
                    <span className="quiz__slider-label quiz__slider-label--end">
                      {currentQuestionData.labels[currentQuestionData.labels.length - 1]}
                    </span>
                  </div>

                  <div className="quiz__slider-container">
                    <input
                      type="range"
                      min={currentQuestionData.min}
                      max={currentQuestionData.max}
                      value={sliderValue}
                      onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
                      className="quiz__slider"
                      aria-label="Bitterness tolerance level"
                    />
                    <div className="quiz__slider-value">
                      <span className="quiz__slider-current-label">
                        {currentQuestionData.labels[sliderValue - 1]}
                      </span>
                    </div>
                  </div>

                  <div className="quiz__slider-ticks" aria-hidden="true">
                    {currentQuestionData.labels.map((label, index) => (
                      <div
                        key={index}
                        className={`quiz__tick ${sliderValue === index + 1 ? 'quiz__tick--active' : ''}`}
                        style={{ left: `${(index / (currentQuestionData.labels.length - 1)) * 100}%` }}
                      >
                        <div className="quiz__tick-mark"></div>
                        <span className="quiz__tick-label">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>

            {/* Action Buttons */}
            <div className="quiz__actions">

              {/* Skip Button */}
              <button
                type="button"
                className="quiz__skip-button"
                onClick={handleSkip}
              >
                I'm not sure
              </button>

              {/* Next Button */}
              <button
                type="button"
                className="quiz__next-button btn btn-primary"
                onClick={handleNext}
                disabled={!isAnswered()}
              >
                {currentQuestion === totalQuestions ? 'See My Blend' : 'Next'}
                {currentQuestion < totalQuestions && ' →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;