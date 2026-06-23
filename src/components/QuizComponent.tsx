import React, { useState } from "react";
import { motion } from "motion/react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "Which composer is known for his 'Moonlight Sonata'?",
    options: ["Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Johann Sebastian Bach", "Frédéric Chopin"],
    answer: "Ludwig van Beethoven",
    explanation: "Ludwig van Beethoven composed the Piano Sonata No. 14, popularly known as the 'Moonlight Sonata'."
  },
  {
    question: "Which of these is NOT a Baroque era composer?",
    options: ["Johann Sebastian Bach", "George Frideric Handel", "Antonio Vivaldi", "Franz Schubert"],
    answer: "Franz Schubert",
    explanation: "Franz Schubert was a Romantic era composer, while Bach, Handel, and Vivaldi were prominent Baroque composers."
  },
  {
    question: "Which opera was composed by Georges Bizet?",
    options: ["The Marriage of Figaro", "Carmen", "La Traviata", "Aida"],
    answer: "Carmen",
    explanation: "Georges Bizet's 'Carmen' is one of the most popular and frequently performed operas in the classical canon."
  },
  {
    question: "What instrument is virtuosically featured in 'The Four Seasons' by Vivaldi?",
    options: ["Piano", "Cello", "Violin", "Flute"],
    answer: "Violin",
    explanation: "Antonio Vivaldi's 'The Four Seasons' is a set of four violin concertos, each representing a season."
  }
];

const QuizComponent: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === quizQuestions[currentQuestionIndex].answer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizComplete(false);
    setScore(0);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (quizComplete) {
    return (
      <div className="text-center">
        <h4 className="text-xl font-display text-white mb-4">Quiz Complete!</h4>
        <p className="text-lg text-gray-300 mb-6">Your score: {score} out of {quizQuestions.length}</p>
        <button
          onClick={handleRestartQuiz}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-md text-gray-300 font-semibold">Q{currentQuestionIndex + 1}: {currentQuestion.question}</p>
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-3 rounded-lg text-left transition-colors
              ${selectedAnswer === option
                ? option === currentQuestion.answer
                  ? "bg-emerald-700 text-white"
                  : "bg-red-700 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"}
              ${selectedAnswer !== null && option !== selectedAnswer && "opacity-60"}
              ${selectedAnswer !== null && option === currentQuestion.answer && "border-2 border-emerald-400"}
            `}
            disabled={selectedAnswer !== null}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 mt-2"
        >
          <strong className="text-white">Explanation:</strong> {currentQuestion.explanation}
        </motion.div>
      )}

      {selectedAnswer && (
        <button
          onClick={handleNextQuestion}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
};

export default QuizComponent;