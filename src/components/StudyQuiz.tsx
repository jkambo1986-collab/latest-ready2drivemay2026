import React, { useState } from 'react';
import { quizModules, Module, Question } from '../data/quizData';

export const StudyQuiz = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (selectedModule) {
      setCurrentQuestion((prev) => (prev + 1) % selectedModule.questions.length);
    }
  };

  if (!selectedModule) {
    return (
      <section id="study-quiz" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Study <span className="text-rose-600">Modules</span></h2>
            <p className="text-gray-500 mt-4">Select a module to start your practice quiz.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {quizModules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  setSelectedModule(module);
                  setCurrentQuestion(0);
                }}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all text-left"
              >
                <h3 className="text-2xl font-bold mb-4">{module.title}</h3>
                <p className="text-gray-600">{module.description}</p>
                <p className="mt-6 text-sm font-bold text-rose-600">{module.questions.length} Questions</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const question = selectedModule.questions[currentQuestion];

  return (
    <section id="study-quiz" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="mb-8 text-rose-600 font-bold hover:underline"
        >
          ← Back to Modules
        </button>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">{selectedModule.title}</h2>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">
            Question {currentQuestion + 1} of {selectedModule.questions.length}
          </h3>
          <p className="text-lg mb-8">{question.question}</p>
          
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedAnswer === index
                    ? index === question.correctAnswer
                      ? 'bg-emerald-100 border-emerald-500'
                      : 'bg-rose-100 border-rose-500'
                    : 'bg-gray-50 border-gray-200 hover:border-rose-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">
                {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect.'}
              </h4>
              <p className="text-blue-800">{question.explanation}</p>
              <button
                onClick={nextQuestion}
                className="mt-6 bg-rose-600 text-white px-6 py-2 rounded-full font-bold hover:bg-rose-700 transition-colors"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
