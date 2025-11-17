import React, { useState, useEffect } from 'react';
import { CheckCircle, Lock, PlayCircle, Award } from 'lucide-react';
import PixelParkLanding from './PixelParkLanding';
import LessonViewer from './LessonViewer';
import QuizViewer from './QuizViewer';

interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  modules: Module[];
}

interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  quiz: Quiz | null;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  contentType: string;
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  required: boolean;
}

interface TeamMember {
  name: string;
  role: string;
  emoji: string;
}

export default function MoeFlavorTrainingPortal() {
  const [showPortal, setShowPortal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'training' | 'team'>('home');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track what's completed
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  
  // Current viewing state
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<string | null>(null);

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzz_zl42rXJXpwoEE-M5RyRw5lQoIDfWahRV1zbuSv8xL-ZdGyqxV4EGc0lG4nRcr9z/exec';

  // Fetch training structure
  useEffect(() => {
    if (!showPortal) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch structure
        const structureResponse = await fetch(`${SCRIPT_URL}?endpoint=structure`);
        const structureData = await structureResponse.json();
        
        if (structureData.error) {
          throw new Error(structureData.error);
        }
        
        setPhases(structureData.phases || []);
        
        // Fetch team
        const teamResponse = await fetch(`${SCRIPT_URL}?endpoint=team`);
        const teamData = await teamResponse.json();
        setTeam(teamData || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load training data. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchData();
  }, [showPortal]);

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setCurrentLesson(null);
  };

  const handleQuizComplete = (quizId: string, passed: boolean) => {
    if (passed) {
      setCompletedQuizzes(prev => new Set([...prev, quizId]));
    }
    setCurrentQuiz(null);
  };

  const isLessonUnlocked = (lesson: Lesson, module: Module): boolean => {
    const lessonIndex = module.lessons.findIndex(l => l.id === lesson.id);
    if (lessonIndex === 0) return true; // First lesson always unlocked
    
    // Previous lesson must be completed
    const previousLesson = module.lessons[lessonIndex - 1];
    return completedLessons.has(previousLesson.id);
  };

  const isQuizUnlocked = (module: Module): boolean => {
    // All lessons in the module must be completed
    return module.lessons.every(lesson => completedLessons.has(lesson.id));
  };

  const isModuleComplete = (module: Module): boolean => {
    const allLessonsComplete = module.lessons.every(l => completedLessons.has(l.id));
    const quizComplete = !module.quiz || completedQuizzes.has(module.quiz.id);
    return allLessonsComplete && quizComplete;
  };

  const getTotalProgress = (): number => {
    let totalItems = 0;
    let completedItems = 0;
    
    phases.forEach(phase => {
      phase.modules.forEach(module => {
        totalItems += module.lessons.length;
        if (module.quiz) totalItems += 1;
        
        module.lessons.forEach(lesson => {
          if (completedLessons.has(lesson.id)) completedItems++;
        });
        
        if (module.quiz && completedQuizzes.has(module.quiz.id)) {
          completedItems++;
        }
      });
    });
    
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  // Landing Page
  if (!showPortal) {
    return <PixelParkLanding onEnterPortal={() => setShowPortal(true)} />;
  }

  // Show Lesson Viewer
  if (currentLesson) {
    return (
      <LessonViewer
        lessonId={currentLesson}
        scriptUrl={SCRIPT_URL}
        onComplete={() => handleLessonComplete(currentLesson)}
        onBack={() => setCurrentLesson(null)}
      />
    );
  }

  // Show Quiz Viewer
  if (currentQuiz) {
    return (
      <QuizViewer
        quizId={currentQuiz}
        scriptUrl={SCRIPT_URL}
        onComplete={(passed) => handleQuizComplete(currentQuiz, passed)}
        onBack={() => setCurrentQuiz(null)}
      />
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <p className="text-xl text-pink-400">Loading training portal...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const progress = getTotalProgress();

  // Main Portal Interface
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                ✨
              </div>
              <h1 className="text-xl font-bold">MoeFlavor Training</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">Progress:</span>
                <span className="ml-2 text-pink-400 font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative border-b border-gray-800 bg-black/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {(['home', 'training', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'text-pink-400 border-b-2 border-pink-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Welcome Card */}
            <div className="border border-gray-800 rounded-lg p-8 bg-gradient-to-br from-gray-900 to-black">
              <h2 className="text-3xl font-bold mb-3">Welcome to MOEFLAVOR! 🌸</h2>
              <p className="text-gray-400 text-lg mb-6">
                Complete your training journey to become a full member of the MOEFLAVOR family.
                Progress through phases sequentially to unlock new content.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('training')}
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all"
                >
                  Start Training →
                </button>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
              <h3 className="text-xl font-bold mb-4">Your Progress</h3>
              <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-pink-500 to-fuchsia-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-pink-400">{completedLessons.size}</div>
                  <div className="text-sm text-gray-400">Lessons Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">{completedQuizzes.size}</div>
                  <div className="text-sm text-gray-400">Quizzes Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">{Math.round(progress)}%</div>
                  <div className="text-sm text-gray-400">Overall Progress</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRAINING TAB */}
        {activeTab === 'training' && (
          <div className="space-y-12">
            {phases.map((phase) => (
              <div key={phase.id} className="space-y-6">
                {/* Phase Header */}
                <div className="border border-pink-500/30 rounded-lg p-6 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {phase.number}
                    </div>
                    <h2 className="text-2xl font-bold">{phase.title}</h2>
                  </div>
                  <p className="text-gray-400">{phase.description}</p>
                </div>

                {/* Modules */}
                <div className="space-y-6 pl-6">
                  {phase.modules.map((module) => {
                    const moduleComplete = isModuleComplete(module);
                    
                    return (
                      <div key={module.id} className="space-y-4">
                        {/* Module Header */}
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{module.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{module.title}</h3>
                            <p className="text-sm text-gray-400">{module.description}</p>
                          </div>
                          {moduleComplete && (
                            <Award className="w-6 h-6 text-pink-500" />
                          )}
                        </div>

                        {/* Lessons */}
                        <div className="pl-12 space-y-3">
                          {module.lessons.map((lesson) => {
                            const isCompleted = completedLessons.has(lesson.id);
                            const isUnlocked = isLessonUnlocked(lesson, module);
                            
                            return (
                              <div
                                key={lesson.id}
                                className={`border rounded-lg p-4 transition-all ${
                                  isCompleted
                                    ? 'border-pink-500 bg-pink-500/5'
                                    : isUnlocked
                                    ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600 cursor-pointer'
                                    : 'border-gray-800 bg-gray-900/30 opacity-50'
                                }`}
                                onClick={() => isUnlocked && !isCompleted && setCurrentLesson(lesson.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {isCompleted ? (
                                      <CheckCircle className="w-5 h-5 text-pink-500" />
                                    ) : isUnlocked ? (
                                      <PlayCircle className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <Lock className="w-5 h-5 text-gray-600" />
                                    )}
                                    <div>
                                      <div className="font-semibold">{lesson.title}</div>
                                      <div className="text-xs text-gray-400">{lesson.duration}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Quiz */}
                          {module.quiz && (
                            <div
                              className={`border rounded-lg p-4 transition-all ${
                                completedQuizzes.has(module.quiz.id)
                                  ? 'border-pink-500 bg-pink-500/5'
                                  : isQuizUnlocked(module)
                                  ? 'border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500 cursor-pointer'
                                  : 'border-gray-800 bg-gray-900/30 opacity-50'
                              }`}
                              onClick={() => 
                                isQuizUnlocked(module) && 
                                !completedQuizzes.has(module.quiz!.id) && 
                                setCurrentQuiz(module.quiz!.id)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {completedQuizzes.has(module.quiz.id) ? (
                                    <CheckCircle className="w-5 h-5 text-pink-500" />
                                  ) : isQuizUnlocked(module) ? (
                                    <Award className="w-5 h-5 text-yellow-500" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-gray-600" />
                                  )}
                                  <div>
                                    <div className="font-semibold flex items-center gap-2">
                                      📝 {module.quiz.title}
                                      {module.quiz.required && (
                                        <span className="text-xs text-red-400">(Required)</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Passing score: {module.quiz.passingScore}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Meet the Team</h2>
              <p className="text-gray-400">Your MOEFLAVOR family</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {team.map((member, idx) => (
                <div
                  key={idx}
                  className="border border-gray-800 rounded-lg p-6 bg-gray-900/50 hover:border-pink-500/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-3xl">
                      {member.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-pink-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
