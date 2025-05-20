"use client"
import React, { useEffect } from 'react';
import GamePiece from './GamePiece';
import useTestristeGame, { MAX_ANSWER_BAR_LENGTH, MAX_TRASH_BAR_LENGTH, REMOVE_LETTER_COST } from '../hooks/useTestristeGame';
import styles from '../styles/TestristeGame.module.css';

const TestristeGame: React.FC = () => {
    const { gameState, insertPiece, removeLetter, toggleActiveBar, resetGame } = useTestristeGame();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (gameState.isGameOver) return;

            // Prevent default behavior for game control keys
            if (['Space', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(event.code)) {
                event.preventDefault();
            }

            const isAnswerBar = gameState.activeBar === 'answer';

            switch (event.code) {
                case 'Space':
                    toggleActiveBar();
                    break;
                case 'ArrowLeft':
                    insertPiece(isAnswerBar, true);
                    break;
                case 'ArrowRight':
                    insertPiece(isAnswerBar, false);
                    break;
                case 'Backspace':
                    if (isAnswerBar) removeLetter(true);
                    break;
                case 'Delete':
                    if (isAnswerBar) removeLetter(false);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [gameState.isGameOver, gameState.activeBar, insertPiece, removeLetter, toggleActiveBar]);

    return (
        <div className={styles['game-container']}>
            <div className={styles['game-header']}>
                <h1>TetristeEdu Game</h1>
                <div className={styles.score}>Score: {gameState.score}</div>
            </div>

            <div className={styles['question-section']}>
                <h2>{gameState.currentQuestion}</h2>
            </div>

            <div className={`${styles['game-section']} ${styles['answer-section']} ${gameState.activeBar === 'answer' ? styles['active-bar'] : ''}`}>
                <h3>Answer Bar ({gameState.answerBar.length}/{MAX_ANSWER_BAR_LENGTH})</h3>
                <div className={styles['game-bar']}>
                    {gameState.answerBar.map((piece) => (
                        <GamePiece key={piece.id} letter={piece.letter} color={piece.color} />
                    ))}
                </div>
            </div>

            <div className={`${styles['game-section']} ${styles['trash-section']} ${gameState.activeBar === 'trash' ? styles['active-bar'] : ''}`}>
                <h3>Trash Bar ({gameState.trashBar.length}/{MAX_TRASH_BAR_LENGTH})</h3>
                <div className={styles['game-bar']}>
                    {gameState.trashBar.map((piece) => (
                        <GamePiece key={piece.id} letter={piece.letter} color={piece.color} />
                    ))}
                </div>
            </div>

            <div className={styles['next-piece-section']}>
                <h3>Next Piece</h3>
                {gameState.nextPiece && (
                    <GamePiece letter={gameState.nextPiece.letter} color={gameState.nextPiece.color} />
                )}
            </div>

            {gameState.isGameOver && (
                <div className={styles['game-over']}>
                    <h2>Game Over!</h2>
                    <p>Final Score: {gameState.score}</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles['control-group']}>
                    <h4>How to Play:</h4>
                    <p><strong>Space:</strong> Toggle between placing the next piece in the <strong>Answer Bar</strong> or the <strong>Trash Bar</strong>. The active bar is highlighted.</p>
                    <p><strong>← (Left Arrow):</strong> Insert the <strong>Next Piece</strong> at the beginning (left side) of the currently <strong>Active Bar</strong>.</p>
                    <p><strong>→ (Right Arrow):</strong> Insert the <strong>Next Piece</strong> at the end (right side) of the currently <strong>Active Bar</strong>.</p>
                    <p><strong>Backspace (Answer Bar):</strong> Remove the leftmost letter from the <strong>Answer Bar</strong>. Costs {REMOVE_LETTER_COST} points.</p>
                    <p><strong>Delete (Answer Bar):</strong> Remove the rightmost letter from the <strong>Answer Bar</strong>. Costs {REMOVE_LETTER_COST} points.</p>
                    <p><strong>Goal:</strong> Fill the Answer Bar with letters to spell out the answer to the question. Correct answers clear the Answer Bar and award points.</p>
                    <p><strong>Trash Bar:</strong> Use the Trash Bar for letters you don't need for the answer. Get points by matching 3 or more consecutive pieces of the same color.</p>
                    <p><strong>Game Over:</strong> The game ends if either the Answer Bar ({MAX_ANSWER_BAR_LENGTH} letters) or the Trash Bar ({MAX_TRASH_BAR_LENGTH} letters) reaches its maximum capacity.</p>
                </div>
            </div>
        </div>
    );
};

export default TestristeGame; 