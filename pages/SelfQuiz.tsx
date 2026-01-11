import React, { useState, useRef } from 'react';
import { Button, Card, Spinner, TextArea, Input, Select } from '../components/UI';
import { GeminiService } from '../services/geminiService';
import { Upload, RefreshCw, Brain, FileText, FileType, Image as ImageIcon, Play, CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw, Trophy, Target, SkipForward, AlertCircle } from 'lucide-react';

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  isSkipped: boolean;
}

const SelfQuiz: React.FC = () => {
  // Input state
  const [inputMode, setInputMode] = useState<'file' | 'text'>('text');
  const [file, setFile] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const [textInput, setTextInput] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  
  // Quiz state
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = base64String.split(';')[0].split(':')[1];
        setFile({
            data: base64Data,
            mimeType: mimeType,
            name: selectedFile.name
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerateMCQs = async () => {
    if (inputMode === 'file' && !file) return;
    if (inputMode === 'text' && !textInput.trim()) return;
    
    setLoading(true);
    try {
      const mcqs = await GeminiService.generateMCQs(
        inputMode === 'file' ? { data: file!.data, mimeType: file!.mimeType } : null,
        inputMode === 'text' ? textInput : '',
        parseInt(numQuestions)
      );
      setQuestions(mcqs);
      setResults([]);
      setQuizCompleted(false);
    } catch (error) {
      alert("Failed to generate MCQs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startTestMode = () => {
    setIsTestMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return; // Already answered
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setResults(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      isSkipped: false
    }]);
    
    setShowExplanation(true);
  };

  const handleSkipQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    setResults(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: null,
      isCorrect: false,
      isSkipped: true
    }]);
    
    // Move to next question immediately
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setIsTestMode(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    setQuizCompleted(false);
  };

  const resetAll = () => {
    resetQuiz();
    setQuestions([]);
    setFile(null);
    setTextInput('');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileType size={32} className="text-red-500" />;
    if (mimeType.includes('image')) return <ImageIcon size={32} className="text-blue-500" />;
    return <FileText size={32} className="text-slate-500" />;
  };

  // Calculate statistics
  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectCount = results.filter(r => !r.isCorrect && !r.isSkipped).length;
  const skippedCount = results.filter(r => r.isSkipped).length;
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Quiz Completed Summary Screen
  if (quizCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl">
            <Trophy size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Quiz Completed!</h1>
          <p className="text-slate-500 font-medium">Here's how you performed</p>
        </div>

        {/* Score Summary */}
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="text-4xl font-black text-indigo-600">{percentage}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Score</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <div className="text-4xl font-black text-emerald-600">{correctCount}</div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-1">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <div className="text-4xl font-black text-red-600">{incorrectCount}</div>
              <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mt-1">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <div className="text-4xl font-black text-amber-600">{skippedCount}</div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-1">Skipped</div>
            </div>
          </div>

          {/* Detailed Review */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={20} className="text-indigo-600" />
              Detailed Review
            </h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {questions.map((q, idx) => {
                const result = results.find(r => r.questionId === q.id);
                const isCorrect = result?.isCorrect;
                const isSkipped = result?.isSkipped;
                
                return (
                  <div key={q.id} className={`p-5 rounded-xl border-2 ${
                    isSkipped 
                      ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' 
                      : isCorrect 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' 
                        : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSkipped 
                          ? 'bg-amber-100 dark:bg-amber-900/30' 
                          : isCorrect 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {isSkipped ? (
                          <AlertCircle size={16} className="text-amber-600" />
                        ) : isCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                          Q{idx + 1}. {q.question}
                        </p>
                        
                        {/* Show user's answer if not skipped */}
                        {!isSkipped && result?.selectedAnswer !== null && (
                          <p className={`text-sm mb-1 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                            <span className="font-medium">Your Answer:</span> {q.options[result.selectedAnswer]}
                          </p>
                        )}
                        
                        {/* Show correct answer for incorrect/skipped */}
                        {(!isCorrect || isSkipped) && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">
                            <span className="font-medium">Correct Answer:</span> {q.options[q.correctAnswer]}
                          </p>
                        )}
                        
                        {/* Explanation */}
                        {(!isCorrect || isSkipped) && (
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={startTestMode} className="gap-2">
            <RotateCcw size={18} /> Retry Quiz
          </Button>
          <Button onClick={resetAll} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
            <Brain size={18} /> Generate New Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Test Mode Active
  if (isTestMode && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-emerald-600">{correctCount} ✓</span>
              <span className="text-red-600">{incorrectCount} ✗</span>
              <span className="text-amber-600">{skippedCount} ⊘</span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === currentQuestion.correctAnswer;
                const showResult = showExplanation;
                
                let optionStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500';
                
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionStyle} ${!showExplanation && 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        showResult && isCorrectOption 
                          ? 'bg-emerald-500 text-white' 
                          : showResult && isSelected && !isCorrectOption 
                            ? 'bg-red-500 text-white'
                            : isSelected 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`font-medium ${
                        showResult && isCorrectOption 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : showResult && isSelected && !isCorrectOption 
                            ? 'text-red-700 dark:text-red-400' 
                            : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {option}
                      </span>
                      {showResult && isCorrectOption && (
                        <CheckCircle2 size={20} className="ml-auto text-emerald-500" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle size={20} className="ml-auto text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answer) */}
            {showExplanation && (
              <div className={`p-4 rounded-xl ${
                results[results.length - 1]?.isCorrect 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  {results[results.length - 1]?.isCorrect ? (
                    <CheckCircle2 className="text-emerald-600 mt-0.5 flex-shrink-0" size={20} />
                  ) : (
                    <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                  )}
                  <div>
                    <p className={`font-bold text-sm mb-1 ${
                      results[results.length - 1]?.isCorrect 
                        ? 'text-emerald-800 dark:text-emerald-300' 
                        : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      {results[results.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {!showExplanation ? (
                <>
                  <Button 
                    variant="ghost"
                    onClick={handleSkipQuestion}
                    className="gap-2"
                  >
                    <SkipForward size={18} /> Skip
                  </Button>
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex-1 gap-2"
                  >
                    Submit Answer <CheckCircle2 size={18} />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>Next Question <ChevronRight size={18} /></>
                  ) : (
                    <>View Results <Trophy size={18} /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <button 
          onClick={resetQuiz}
          className="mx-auto flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
        >
          <XCircle size={16} /> Exit Quiz
        </button>
      </div>
    );
  }

  // MCQs Generated - Preview Mode
  if (questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {questions.length} MCQs Generated!
          </h1>
          <p className="text-slate-500 font-medium">Ready to test your knowledge?</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RefreshCw size={18} /> Generate New
          </Button>
          <Button onClick={startTestMode} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
            <Play size={18} /> Start Test Mode
          </Button>
        </div>
      </div>
    );
  }

  // Initial Input Screen
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 mx-auto animate-float">
          <Brain size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Self Quiz</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">Generate exam-relevant MCQs and test your understanding instantly.</p>
      </div>

      <Card className="p-6 md:p-8">
        {/* Input Mode Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              inputMode === 'text' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Enter Text
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              inputMode === 'file' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Text Input */}
        {inputMode === 'text' && (
          <div className="space-y-4">
            <TextArea
              label="Enter Content or Topic"
              placeholder="Paste your study material, notes, or enter a topic like 'Photosynthesis', 'World War 2', 'Python programming basics'..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
            />
          </div>
        )}

        {/* File Upload */}
        {inputMode === 'file' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50"
          >
            {file ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                  {getFileIcon(file.mimeType)}
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{file.name}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Change
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-purple-500 shadow-lg group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-white">Upload Document</p>
                  <p className="text-sm text-slate-400">PDF, DOC, or Images</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
          </div>
        )}

        {/* Number of Questions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Number of MCQs"
            options={['5', '10', '15', '20', '25', '30']}
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full mt-6 py-4 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/20 rounded-2xl" 
          onClick={handleGenerateMCQs} 
          disabled={(inputMode === 'file' && !file) || (inputMode === 'text' && !textInput.trim()) || loading} 
          isLoading={loading}
        >
          <Brain size={20} className="mr-2" /> Generate MCQs
        </Button>
      </Card>

      {loading && (
        <Card className="p-8 flex flex-col items-center justify-center space-y-4">
          <Spinner />
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white animate-pulse">Generating MCQs...</p>
            <p className="text-sm text-slate-500">Creating exam-relevant questions</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SelfQuiz;
