import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  number: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface QuizViewerProps {
  quizId: string;
  scriptUrl: string;
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

export default function QuizViewer({ quizId, scriptUrl, onComplete, onBack }: QuizViewerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${scriptUrl}?endpoint=quiz&quizId=${quizId}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz.');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, scriptUrl]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    const percentage = (correct / questions.length) * 100;
    setScore(percentage);
    setShowResults(true);
  };

  const handleFinish = () => {
    const passed = score >= 70;
    onComplete(passed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📝</div>
          <p className="text-xl text-pink-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => answers[q.id]);

  // Results View
  if (showResults) {
    const passed = score >= 70;
    
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className={`text-8xl mb-6 ${passed ? 'animate-bounce' : ''}`}>
            {passed ? '🎉' : '📚'}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${passed ? 'text-pink-400' : 'text-yellow-400'}`}>
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-2xl mb-8">
            Your score: <span className="font-bold">{Math.round(score)}%</span>
          </p>
          <p className="text-gray-400 mb-8">
            {passed
              ? 'You passed! Great job on completing this quiz.'
              : 'You need 70% to pass. Review the materials and try again!'}
          </p>
          
          {/* Show correct answers */}
          <div className="text-left space-y-4 mb-8">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                      <p className="text-sm text-gray-400">
                        Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {userAnswer ? `${userAnswer}: ${q.options[userAnswer as keyof typeof q.options]}` : 'No answer'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-400">
                          Correct answer: {q.correctAnswer}: {q.options[q.correctAnswer as keyof typeof q.options]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 justify-center">
            {!passed && (
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                }}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold transition-all"
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all"
            >
              {passed ? 'Continue' : 'Back to Training'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gray-900/50">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
            
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswer(currentQuestion.id, key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === key
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <span className="font-bold mr-3">{key}.</span>
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-8 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
