"use client"
import React, { useEffect } from 'react';
import GamePiece from './GamePiece';
import useTestristeGame from '../hooks/useTestristeGame';
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
                <h1>Tetriste Educatif</h1>
                <div className={styles.score}>Score: {gameState.score}</div>
            </div>

            <div className={styles['question-section']}>
                <h2>{gameState.currentQuestion}</h2>
            </div>

            <div className={`${styles['game-section']} ${styles['answer-section']} ${gameState.activeBar === 'answer' ? styles['active-bar'] : ''}`}>
                <h3>Answer Bar</h3>
                <div className={styles['game-bar']}>
                    {gameState.answerBar.map((piece, index) => (
                        <GamePiece key={`answer-${index}`} letter={piece.letter} color={piece.color} />
                    ))}
                </div>
            </div>

            <div className={`${styles['game-section']} ${styles['trash-section']} ${gameState.activeBar === 'trash' ? styles['active-bar'] : ''}`}>
                <h3>Trash Bar</h3>
                <div className={styles['game-bar']}>
                    {gameState.trashBar.map((piece, index) => (
                        <GamePiece key={`trash-${index}`} letter={piece.letter} color={piece.color} />
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
                    <h4>Controls:</h4>
                    <p>Space - Toggle between Answer/Trash bars</p>
                    <p>← → - Insert piece left/right</p>
                    <p>Backspace/Delete - Remove letter from answer bar</p>
                </div>
            </div>
        </div>
    );
};

export default TestristeGame; 