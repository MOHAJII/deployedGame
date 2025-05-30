import { useState, useCallback, useEffect } from 'react';

// Constants
export const COLORS = ['red', 'green', 'blue'];
export const MAX_ANSWER_BAR_LENGTH = 15;
export const MAX_TRASH_BAR_LENGTH = 10;
export const REMOVE_LETTER_COST = 50;

// Question bank
const QUESTIONS = [
    { question: "Capital of Morocco?", answer: "rabat" },
    { question: "Largest city in Morocco?", answer: "casablanca" },
    { question: "Famous blue city of Morocco?", answer: "chefchaouen" },
    { question: "Desert in southern Morocco?", answer: "sahara" },
    { question: "Highest mountain in Morocco?", answer: "toubkal" },
    { question: "Traditional Moroccan dress?", answer: "caftan" },
    { question: "Famous Moroccan tea?", answer: "mint" },
    { question: "Traditional Moroccan bread?", answer: "khobz" },
    { question: "Famous Moroccan leather city?", answer: "fez" },
    { question: "Morocco's national language?", answer: "arabic" },
    { question: "Famous Moroccan soup?", answer: "harira" },
    { question: "Traditional Moroccan house?", answer: "riad" },
    { question: "Famous Marrakech square?", answer: "jemaa" },
    { question: "Morocco's currency?", answer: "dirham" },
    { question: "Famous Moroccan couscous day?", answer: "friday" }
];

interface GamePiece {
    id: number;
    letter: string;
    color: string;
}

interface GameState {
    answerBar: GamePiece[];
    trashBar: GamePiece[];
    score: number;
    isGameOver: boolean;
    currentQuestion: string | null;
    currentAnswer: string | null;
    nextPiece: GamePiece | null;
    activeBar: 'answer' | 'trash';
}

const getRandomQuestion = () => {
    const questionIndex = Math.floor(Math.random() * QUESTIONS.length);
    return {
        question: QUESTIONS[questionIndex].question,
        answer: QUESTIONS[questionIndex].answer.toLowerCase()
    };
};

const useTestristeGame = () => {
    const generateRandomPiece = useCallback((currentAnswer: string | null = null): GamePiece => {
        const useAnswerLetter = Math.random() < 0.6 && currentAnswer;
        let letter;
        
        if (useAnswerLetter) {
            const pos = Math.floor(Math.random() * currentAnswer!.length);
            letter = currentAnswer![pos];
        } else {
            letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
        
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        return { id: Date.now() + Math.random(), letter: letter.toLowerCase(), color: randomColor };
    }, []);

    // Initialize state. Random values like currentQuestion and nextPiece are null initially
    // and will be set on the client-side in a useEffect hook.
    const [gameState, setGameState] = useState<GameState>({
        answerBar: [],
        trashBar: [],
        score: 0,
        isGameOver: false,
        currentQuestion: null, // Initialize as null
        currentAnswer: null,   // Initialize as null
        nextPiece: null,       // Initialize as null
        activeBar: 'answer'
    });

    // Effect to initialize the first question and piece on the client side
    useEffect(() => {
        const initialQuestion = getRandomQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: initialQuestion.question,
            currentAnswer: initialQuestion.answer,
            nextPiece: generateRandomPiece(initialQuestion.answer)
        }));
    }, [generateRandomPiece]); // Add generateRandomPiece as a dependency since it's used inside the effect

    const setNewQuestion = useCallback(() => {
        const { question, answer } = getRandomQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: question,
            currentAnswer: answer
        }));
    }, []);

    const checkAnswer = useCallback(() => {
        const currentWord = gameState.answerBar.map(piece => piece.letter).join('');
        if (currentWord === gameState.currentAnswer) {
            setGameState(prev => ({
                ...prev,
                score: prev.score + 100,
                answerBar: []
            }));
            setNewQuestion();
            return true;
        }
        return false;
    }, [gameState.answerBar, gameState.currentAnswer, setNewQuestion]);

    const checkAndRemoveColorMatches = useCallback(() => {
        const { trashBar } = gameState;
        const matches = [];
        
        for (let i = 0; i < trashBar.length - 2; i++) {
            const colorMatches = [i];
            for (let j = i + 1; j < trashBar.length; j++) {
                if (trashBar[j].color === trashBar[i].color) {
                    colorMatches.push(j);
                } else {
                    break;
                }
            }
            if (colorMatches.length >= 3) {
                matches.push(colorMatches);
            }
        }

        if (matches.length > 0) {
            const indicesToRemove = [...new Set(matches.flat())].sort((a, b) => b - a);
            const newTrashBar = [...trashBar];
            
            for (const index of indicesToRemove) {
                newTrashBar.splice(index, 1);
            }
            
            setGameState(prev => ({
                ...prev,
                trashBar: newTrashBar,
                score: prev.score + indicesToRemove.length * 10
            }));
        }
    }, [gameState]);

    const insertPiece = useCallback((isAnswer: boolean, isLeft: boolean) => {
        if (gameState.isGameOver || !gameState.nextPiece) return false;

        const bar = isAnswer ? gameState.answerBar : gameState.trashBar;
        const maxLength = isAnswer ? MAX_ANSWER_BAR_LENGTH : MAX_TRASH_BAR_LENGTH;

        if (bar.length >= maxLength) {
            setGameState(prev => ({ ...prev, isGameOver: true }));
            return false;
        }

        const newBar = isLeft 
            ? [gameState.nextPiece, ...bar]
            : [...bar, gameState.nextPiece];

        setGameState(prev => ({
            ...prev,
            [isAnswer ? 'answerBar' : 'trashBar']: newBar,
            nextPiece: generateRandomPiece(prev.currentAnswer)
        }));

        if (isAnswer) {
            checkAnswer();
        } else {
            checkAndRemoveColorMatches();
        }

        return true;
    }, [gameState, generateRandomPiece, checkAnswer, checkAndRemoveColorMatches]);

    const removeLetter = useCallback((isLeft: boolean) => {
        if (gameState.score < REMOVE_LETTER_COST || gameState.answerBar.length === 0) {
            return false;
        }

        const newAnswerBar = [...gameState.answerBar];
        if (isLeft) {
            newAnswerBar.shift();
        } else {
            newAnswerBar.pop();
        }

        setGameState(prev => ({
            ...prev,
            answerBar: newAnswerBar,
            score: prev.score - REMOVE_LETTER_COST
        }));
        return true;
    }, [gameState]);

    const toggleActiveBar = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            activeBar: prev.activeBar === 'answer' ? 'trash' : 'answer'
        }));
    }, []);

    const resetGame = useCallback(() => {
        const { question, answer } = getRandomQuestion();
        setGameState({
            answerBar: [],
            trashBar: [],
            score: 0,
            isGameOver: false,
            currentQuestion: question,
            currentAnswer: answer,
            nextPiece: generateRandomPiece(answer),
            activeBar: 'answer'
        });
    }, [generateRandomPiece]);

    return {
        gameState,
        insertPiece,
        removeLetter,
        toggleActiveBar,
        resetGame
    };
};

export default useTestristeGame; 