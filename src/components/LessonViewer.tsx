import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface LessonContent {
  order: number;
  type: string;
  text: string;
  mediaUrl: string;
}

interface LessonViewerProps {
  lessonId: string;
  scriptUrl: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function LessonViewer({ lessonId, scriptUrl, onComplete, onBack }: LessonViewerProps) {
  const [content, setContent] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${scriptUrl}?endpoint=lesson&lessonId=${lessonId}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setContent(data.content || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson content.');
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, scriptUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-xl text-pink-400">Loading lesson...</p>
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Training
          </button>
        </div>
      </header>

      {/* Lesson Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {content.map((block, index) => (
            <div key={index}>
              {block.type === 'heading' && (
                <h1 className="text-4xl font-bold mb-6">{block.text}</h1>
              )}
              
              {block.type === 'text' && (
                <p className="text-lg text-gray-300 leading-relaxed">{block.text}</p>
              )}
              
              {block.type === 'image' && block.mediaUrl && (
                <img
                  src={block.mediaUrl}
                  alt="Lesson content"
                  className="rounded-lg border border-gray-800 w-full"
                />
              )}
              
              {block.type === 'video' && block.mediaUrl && (
                <div className="aspect-video">
                  <iframe
                    src={block.mediaUrl}
                    className="w-full h-full rounded-lg border border-gray-800"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ))}

          {/* Complete Button */}
          <div className="pt-8 border-t border-gray-800">
            <button
              onClick={onComplete}
              className="w-full px-6 py-4 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Complete
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
