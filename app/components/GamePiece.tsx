import React from 'react';
import styles from '../styles/TestristeGame.module.css';

interface GamePieceProps {
  letter: string;
  color: string;
}

const GamePiece: React.FC<GamePieceProps> = ({ letter, color }) => {
  return (
    <div className={`${styles['game-piece']} ${styles[color]}`}>
      {letter}
    </div>
  );
};

export default GamePiece; 