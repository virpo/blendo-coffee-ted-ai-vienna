import { useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import './Result.scss';

const Result = () => {
  const { result, actions, timeElapsed } = useQuiz();

  useEffect(() => {
    // Analytics stub
    console.log('result_view', {
      blend_name: result?.name,
      time_elapsed: Math.round(timeElapsed / 1000)
    });
  }, [result, timeElapsed]);

  const handleStartPlan = () => {
    // Analytics stub
    console.log('plan_selected', { blend_name: result.name });
    actions.selectPlan('monthly');
  };

  const handleRetakeQuiz = () => {
    actions.resetQuiz();
  };

  const formatTime = (ms) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  if (!result) {
    return (
      <div className="result result--loading">
        <div className="result__container">
          <div className="result__loading-content">
            <div className="result__loading-animation">
              <div className="result__coffee-beans">
                <div className="result__bean result__bean--1"></div>
                <div className="result__bean result__bean--2"></div>
                <div className="result__bean result__bean--3"></div>
              </div>
            </div>
            <h2 className="result__loading-title">Crafting your perfect blend...</h2>
            <p className="result__loading-text">
              Analyzing your taste preferences and selecting the finest beans
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result">
      <div className="result__container">

        {/* Success Animation */}
        <div className="result__success-badge">
          <svg className="result__check-icon" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="result__check-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="result__check-mark" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        {/* Header */}
        <div className="result__header">
          <div className="result__completion-info">
            <span className="result__completion-time">
              Completed in {formatTime(timeElapsed)}
            </span>
          </div>

          <h1 className="result__title font-display">
            Meet your perfect blend
          </h1>

          <p className="result__subtitle">
            Based on your unique taste profile, we've crafted a blend that matches your flavor DNA perfectly.
          </p>
        </div>

        {/* Blend Card */}
        <div className="result__blend-card">

          {/* Blend Name & Visual */}
          <div className="result__blend-header">
            <div className="result__blend-visual">
              {/* Coffee bag mockup */}
              <div className="result__coffee-bag">
                <div className="result__bag-label">
                  <h2 className="result__blend-name font-display">
                    {result.name}
                  </h2>
                  <p className="result__blend-roast">{result.roastLevel}</p>
                </div>
              </div>
            </div>

            <div className="result__blend-info">
              <h3 className="result__blend-section-title">Tasting Notes</h3>
              <p className="result__tasting-notes">{result.notes}</p>

              <div className="result__characteristics">
                <div className="result__characteristic">
                  <strong>Origins:</strong> {result.origins}
                </div>
                <div className="result__characteristic">
                  <strong>Grind:</strong> {result.grindSuggestion}
                </div>
                <div className="result__characteristic">
                  <strong>Caffeine:</strong> {result.caffeineLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="result__description">
            <p>{result.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="result__actions">
            <button
              className="result__cta btn btn-primary"
              onClick={handleStartPlan}
            >
              Start My Plan
            </button>

            <button
              className="result__retake btn btn-secondary"
              onClick={handleRetakeQuiz}
            >
              Retake Quiz
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="result__plan-preview">
          <h3 className="result__plan-title">Your Coffee Journey</h3>

          <div className="result__plan-features">
            <div className="result__feature">
              <div className="result__feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="result__feature-content">
                <h4 className="result__feature-title">Fresh Weekly Delivery</h4>
                <p className="result__feature-description">
                  Roasted to order and delivered fresh to your door
                </p>
              </div>
            </div>

            <div className="result__feature">
              <div className="result__feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.67 2 3 2.67 3 3.5v16C3 20.33 3.67 21 4.5 21h15c.83 0 1.5-.67 1.5-1.5v-16C21 2.67 20.33 2 19.5 2z"/>
                </svg>
              </div>
              <div className="result__feature-content">
                <h4 className="result__feature-title">Flexible Scheduling</h4>
                <p className="result__feature-description">
                  Pause, skip, or cancel anytime with no commitment
                </p>
              </div>
            </div>

            <div className="result__feature">
              <div className="result__feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="result__feature-content">
                <h4 className="result__feature-title">Perfect Every Time</h4>
                <p className="result__feature-description">
                  Free adjustments on your second bag to dial in perfection
                </p>
              </div>
            </div>
          </div>

          <div className="result__plan-guarantee">
            <p className="result__guarantee-text">
              <strong>Our Promise:</strong> If you don't love your blend, we'll adjust it free on your next delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="result__footer">
        <div className="result__footer-container">
          <h3 className="result__footer-title">Ready to start your coffee journey?</h3>
          <p className="result__footer-text">
            Join thousands of coffee lovers who've discovered their perfect cup
          </p>
          <button className="result__footer-cta btn btn-accent" onClick={handleStartPlan}>
            Start My Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;