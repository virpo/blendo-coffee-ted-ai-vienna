import { useState, useRef, useEffect } from 'react';
import { announceToScreenReader, updatePageTitle } from '../../utils/accessibility';
import './Hero.scss';

const Hero = ({ onQuizStart }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    text: "Your coffee soul craves...",
    options: [
      { value: 'bright-fruity', label: '☀️ Bright & fruity', description: 'Ethiopian vibes, floral notes, pour-over perfection' },
      { value: 'rich-chocolatey', label: '🍫 Rich & chocolatey', description: 'Dark roasts, South American, espresso-forward' },
      { value: 'smooth-nutty', label: '🌰 Smooth & nutty', description: 'Balanced Brazilian, caramel sweetness, approachable' }
    ]
  });
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Debug log
    console.log('Prefers reduced motion:', mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Set page title
    updatePageTitle('Your Perfect Coffee Blend - Coffee Quiz', false);

    // Analytics stub
    console.log('hero_view');
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    console.log('Video loaded successfully');

    // Try to play video after loading
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
        // Still mark as loaded even if autoplay fails
      });
    }
  };

  const handleAnswerSelect = (value) => {
    setSelectedAnswer(value);
    // Analytics stub
    console.log('q_answered_1', { answer: value });

    // Announce selection to screen readers
    const selectedOption = currentQuestion.options.find(opt => opt.value === value);
    if (selectedOption) {
      announceToScreenReader(`Selected: ${selectedOption.label}`);
    }
  };

  const handleStartQuiz = () => {
    if (!selectedAnswer) {
      setSelectedAnswer(currentQuestion.options[0].value);
    }

    // Analytics stub
    console.log('quiz_start', { first_answer: selectedAnswer });

    // Announce quiz start
    announceToScreenReader('Starting coffee taste quiz');

    onQuizStart({
      questionId: 1,
      answer: selectedAnswer
    });
  };

  return (
    <section className="hero">
      <div className="hero__container">

        {/* Media Section */}
        <div className="hero__media">
          <div className="hero__media-content">
            {/* Coffee Machine Video - Always show for debugging */}
            <video
              ref={videoRef}
              className="hero__video"
              poster="/assets/hero_still.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              onLoadedData={handleVideoLoad}
              onCanPlay={() => {
                console.log('Video can play');
                if (videoRef.current) {
                  videoRef.current.play().catch((error) => {
                    console.log('Autoplay failed, which is normal:', error);
                  });
                }
              }}
              onError={(e) => console.error('Video error:', e)}
              onLoadStart={() => console.log('Video load started')}
              aria-hidden="true"
            >
              <source src="/assets/machine.mp4" type="video/mp4" />
            </video>

            {/* Fallback Image - only shown if reduced motion is preferred */}
            {prefersReducedMotion && (
              <img
                src="/assets/hero_still.jpg"
                alt=""
                className="hero__fallback hero__fallback--visible"
                aria-hidden="true"
              />
            )}

            {/* Parallax overlay for subtle depth */}
            <div className="hero__media-overlay" aria-hidden="true"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="hero__content">

          {/* Brand & Headlines */}
          <div className="hero__headlines">
            <div className="hero__brand">
              <h1 className="hero__brand-name font-display">Blendo</h1>
              <p className="hero__tagline">45 seconds to your perfect blend</p>
              <p className="hero__pricing">Starting at $19/month</p>
            </div>
          </div>

          {/* Quiz Kickoff */}
          <div className="hero__quiz-kickoff">
            <div className="hero__quiz-progress">
              <span className="hero__quiz-label">Question 1 of 6</span>
              <div className="hero__progress-bar">
                <div className="hero__progress-fill" style={{ width: '16.67%' }}></div>
              </div>
            </div>

            <fieldset className="hero__question">
              <legend className="hero__question-text">
                {currentQuestion.text}
              </legend>

              <div className="hero__options" role="radiogroup" aria-labelledby="question-1">
                {currentQuestion.options.map((option) => (
                  <label key={option.value} className="hero__option">
                    <input
                      type="radio"
                      name="coffee-preference"
                      value={option.value}
                      checked={selectedAnswer === option.value}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      className="hero__option-input"
                    />
                    <div className="hero__option-content">
                      <span className="hero__option-label">{option.label}</span>
                      <span className="hero__option-description">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              className="hero__cta btn btn-primary"
              onClick={handleStartQuiz}
              disabled={!selectedAnswer}
            >
              45 Seconds to Perfect Coffee →
            </button>
          </div>

          {/* Social Proof */}
          <div className="hero__social-proof">
            <div className="hero__rating">
              <div className="hero__stars" aria-label="4.8 out of 5 stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`hero__star ${star <= 4 ? 'hero__star--filled' : star === 5 ? 'hero__star--half' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="hero__rating-text">4.8 • Based on 2,847 reviews</span>
            </div>
            <div className="hero__blends-count">
              <strong>12,394</strong> personalized blends crafted
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;