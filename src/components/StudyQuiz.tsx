import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, X, ChevronRight, BookOpen, Trophy, RotateCcw, Award } from 'lucide-react';
import { quizModules, Module } from '../data/quizData';

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const StudyQuiz = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startModule = (module: Module) => {
    setSelectedModule(module);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
  };

  const resetQuiz = () => {
    setSelectedModule(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
  };

  const handleAnswer = (index: number) => {
    if (showExplanation || !selectedModule) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === selectedModule.questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!selectedModule) return;
    if (currentQuestion + 1 >= selectedModule.questions.length) {
      setIsComplete(true);
      return;
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestion((prev) => prev + 1);
  };

  // ---- Module selection screen ----
  if (!selectedModule) {
    const moduleIcons = [BookOpen, Award, Trophy];
    return (
      <section id="study-quiz" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Study <span className="text-rose-600">Modules</span></h2>
            <p className="text-gray-500 mt-4">Select a module to start your free practice quiz.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {quizModules.map((module, i) => {
              const Icon = moduleIcons[i % moduleIcons.length];
              return (
                <motion.button
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => startModule(module)}
                  className="group bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-rose-600/5 hover:border-rose-200 transition-all duration-300 text-left flex flex-col"
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-rose-600 transition-colors duration-300">{module.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{module.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-rose-600">{module.questions.length} Questions</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-black group-hover:gap-2 transition-all">
                      Start
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const total = selectedModule.questions.length;
  const question = selectedModule.questions[currentQuestion];
  const progress = isComplete ? 100 : (currentQuestion / total) * 100;

  // ---- Results screen ----
  if (isComplete) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;
    return (
      <section id="study-quiz" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-10 md:p-12 rounded-[40px] shadow-xl border border-gray-100 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
                passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              )}
            >
              <Trophy className="w-12 h-12" />
            </motion.div>
            <h3 className="text-3xl font-black uppercase mb-2">{passed ? 'Well Done!' : 'Keep Practicing!'}</h3>
            <p className="text-gray-500 mb-8">{selectedModule.title}</p>

            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className={cn('text-6xl font-black', passed ? 'text-emerald-600' : 'text-rose-600')}>{pct}%</span>
            </div>
            <p className="text-gray-600 font-medium mb-10">You scored {score} out of {total}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startModule(selectedModule)}
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/25 active:scale-[0.98] transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-black px-6 py-3 rounded-2xl font-bold hover:bg-black hover:text-white active:scale-[0.98] transition-all duration-300"
              >
                All Modules
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // ---- Quiz screen ----
  return (
    <section id="study-quiz" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={resetQuiz}
            className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-rose-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Modules
          </button>
          <span className="text-sm font-bold text-gray-400">
            Score: <span className="text-rose-600">{score}</span>/{total}
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">{selectedModule.title}</h2>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-600 rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xl font-bold mb-8 leading-snug">{question.question}</p>

              <div className="space-y-4">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correctAnswer;
                  const isSelected = selectedAnswer === index;
                  const showState = showExplanation && (isCorrect || isSelected);
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showExplanation}
                      whileTap={!showExplanation ? { scale: 0.98 } : undefined}
                      className={cn(
                        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3',
                        showState
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : 'bg-rose-50 border-rose-500 text-rose-900'
                          : showExplanation
                            ? 'bg-gray-50 border-gray-100 text-gray-400'
                            : 'bg-gray-50 border-transparent hover:border-rose-400 hover:bg-white cursor-pointer'
                      )}
                    >
                      <span className="font-medium">{option}</span>
                      {showState && (
                        <span
                          className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white',
                            isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                          )}
                        >
                          {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <h4 className="font-black uppercase tracking-widest text-xs mb-2 text-blue-900">
                        {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Not quite'}
                      </h4>
                      <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
                      <button
                        onClick={nextQuestion}
                        className="mt-6 inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-full font-bold hover:bg-black hover:shadow-lg active:scale-[0.98] transition-all duration-300 group"
                      >
                        {currentQuestion + 1 >= total ? 'See Results' : 'Next Question'}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
