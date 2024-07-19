import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_FILL_PERCENTAGE = 80;

const tetrominos = [
  [[1]],  // Single block
  [[1, 1, 1, 1]],  // I
  [[1, 1], [1, 1]],  // O
  [[1, 1, 1], [0, 1, 0]],  // T
  [[1, 1, 1], [1, 0, 0]],  // L
  [[1, 1, 1], [0, 0, 1]],  // J
  [[1, 1, 0], [0, 1, 1]],  // S
  [[0, 1, 1], [1, 1, 0]]   // Z
];

const retroColors = [
  'bg-yellow-400', 'bg-green-500', 'bg-red-500', 
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
];

const ReverseTetris = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [availableShapes, setAvailableShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (availableShapes.length > 0) {
      checkGameOver(board);
    }
  }, [availableShapes, board]);

  const initializeGame = () => {
    const newBoard = Array(BOARD_HEIGHT).fill().map(() => 
      Array(BOARD_WIDTH).fill().map(() => ({
        filled: Math.random() < INITIAL_FILL_PERCENTAGE / 100,
        color: retroColors[Math.floor(Math.random() * retroColors.length)]
      }))
    );
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setSelectedShape(null);
    setHoverPosition(null);
    generateNewShapes();
  };

  const generateNewShapes = () => {
    const newShapes = Array(3).fill().map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      shape: tetrominos[Math.floor(Math.random() * tetrominos.length)],
      color: retroColors[Math.floor(Math.random() * retroColors.length)]
    }));
    setAvailableShapes(newShapes);
  };

  const canRemoveShape = (shape, row, col) => {
    if (!shape) return false;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          if (row + i >= BOARD_HEIGHT || col + j >= BOARD_WIDTH || !board[row + i][col + j].filled) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const removeShape = (shape, row, col) => {
    const newBoard = board.map(boardRow => boardRow.map(cell => ({...cell})));
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          newBoard[row + i][col + j].filled = false;
        }
      }
    }
    setBoard(newBoard);
    setScore(prevScore => prevScore + shape.flat().filter(cell => cell === 1).length);

    const newShapes = availableShapes.filter(s => s.shape !== shape);
    setAvailableShapes(newShapes);

    if (newShapes.length === 0) {
      generateNewShapes();
    }

    setSelectedShape(null);
    setHoverPosition(null);

    return newBoard;
  };

  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
  };

  const handleCellHover = (row, col) => {
    setHoverPosition({ row, col });
  };

  const handleCellClick = (row, col) => {
    if (selectedShape && canRemoveShape(selectedShape, row, col)) {
      const newBoard = removeShape(selectedShape, row, col);
      const updatedBoard = repopulateBoard(newBoard);
      setBoard(updatedBoard);
    }
  };

  const repopulateBoard = (board) => {
    const newBoard = board.map(row => row.map(cell => ({...cell})));
    let repopulated = false;

    // Check if any row is completely empty
    for (let i = 0; i < BOARD_HEIGHT; i++) {
      if (newBoard[i].every(cell => !cell.filled)) {
        newBoard[i] = Array(BOARD_WIDTH).fill().map(() => ({
          filled: Math.random() < INITIAL_FILL_PERCENTAGE / 100,
          color: retroColors[Math.floor(Math.random() * retroColors.length)]
        }));
        repopulated = true;
      }
    }

    // Check if any column is completely empty
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (newBoard.every(row => !row[j].filled)) {
        for (let i = 0; i < BOARD_HEIGHT; i++) {
          newBoard[i][j] = {
            filled: Math.random() < INITIAL_FILL_PERCENTAGE / 100,
            color: retroColors[Math.floor(Math.random() * retroColors.length)]
          };
        }
        repopulated = true;
      }
    }

    return newBoard;
  };

  const checkGameOver = (board) => {
    const canPlaceAnyShape = availableShapes.some(shapeObj => 
      board.some((row, rowIndex) => 
        row.some((_, colIndex) => canRemoveShape(shapeObj.shape, rowIndex, colIndex))
      )
    );

    if (!canPlaceAnyShape) {
      console.log("Game Over detected!");
      setGameOver(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-mono">
      <h1 className="text-4xl font-bold mb-4 text-neon-green">Reverse Tetris</h1>
      <div className="flex gap-4">
        <div className="bg-gray-800 p-4 rounded shadow-lg border-2 border-neon-blue">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-6 h-6 border border-gray-700 ${
                    cell.filled ? cell.color : 'bg-gray-900'
                  } ${
                    selectedShape && 
                    hoverPosition && 
                    hoverPosition.row === rowIndex && 
                    hoverPosition.col === colIndex &&
                    canRemoveShape(selectedShape, rowIndex, colIndex)
                      ? 'opacity-50'
                      : ''
                  }`}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                ></div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded shadow-lg border-2 border-neon-pink">
            <h2 className="text-xl font-semibold mb-2 text-neon-pink">Score: {score}</h2>
            <button
              className="bg-neon-green text-black px-4 py-2 rounded hover:bg-neon-green-bright transition-colors duration-300"
              onClick={initializeGame}
            >
              New Game
            </button>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow-lg border-2 border-neon-yellow">
            <h2 className="text-xl font-semibold mb-2 text-neon-yellow">Available Shapes:</h2>
            {availableShapes.map((shapeObj) => (
              <div
                key={shapeObj.id}
                className={`mb-2 cursor-pointer ${selectedShape === shapeObj.shape ? 'border-2 border-neon-green' : ''}`}
                onClick={() => handleShapeSelect(shapeObj.shape)}
              >
                {shapeObj.shape.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((cell, cellIndex) => (
                      <div
                        key={cellIndex}
                        className={`w-4 h-4 ${cell ? shapeObj.color : 'bg-gray-900'}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {gameOver && (
        <Alert className="mt-4 w-64 bg-gray-800 border-2 border-neon-red">
          <AlertTitle className="text-neon-red">Game Over!</AlertTitle>
          <AlertDescription className="text-white">
            No more moves available. Final score: {score}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReverseTetris;
