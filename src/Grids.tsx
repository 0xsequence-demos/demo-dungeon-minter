import { useState, useEffect } from "react";
import "./Grids.css";

const GRID_SIZE = 40; // Number of rows and columns in the grid

interface SquareProps {
  x: number;
  y: number;
}

const Square = (props: SquareProps) => {
  const { x, y } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setVisible(true); // Set square to be visible to trigger fade-in effect
    }, 50); // A small delay before showing the square to ensure smooth fade-in effect

    const hideTimeout = setTimeout(() => {
      setVisible(false); // Set square to be invisible to trigger fade-out effect
    }, 3000); // Hide the square after 3 seconds

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <div
      className={`square ${visible ? "visible" : "hidden"}`}
      style={{ top: `${y}px`, left: `${x}px` }}
    />
  );
};

const Grids = () => {
  const [squares, setSquares] = useState<SquareProps[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 8) + 1; // Generate between 1 to 3 squares
      const newSquares = Array.from({ length: count }, () => {
        // Generate random position within the grid
        const gridCellSize = window.innerWidth / GRID_SIZE;
        const x = Math.floor(Math.random() * GRID_SIZE) * gridCellSize;
        const y = Math.floor(Math.random() * GRID_SIZE) * gridCellSize;
        return { x, y };
      });
      setSquares((prevSquares) => [...prevSquares, ...newSquares]);
    }, 1000); // Generate new squares every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-app">
      {squares.map((square: SquareProps, index) => (
        <Square key={index} x={square.x} y={square.y} />
      ))}
    </div>
  );
};

export default Grids;
