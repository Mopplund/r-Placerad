import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL + "/api/canva";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const paletteColors = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
  "#FF00FF",
  "#00FFFF",
  "#FFFFFF",
  "#000000",
];

const FIXED_PIXEL_SIZE = 5;
const FIELD_WIDTH = 200;
const FIELD_HEIGHT = 100;

export default function Canvas() {
  const canvasRef = useRef(null);
  const [field, setField] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const socketRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  const canvasDimensions = {
    width: FIELD_WIDTH * FIXED_PIXEL_SIZE,
    height: FIELD_HEIGHT * FIXED_PIXEL_SIZE,
    pixelSize: FIXED_PIXEL_SIZE,
  };

  const gap = 10;
  const totalGapHeight = gap * (paletteColors.length - 1);
  const maxButtonSize =
    (canvasDimensions.height - totalGapHeight) / paletteColors.length;
  const buttonSize = Math.floor(maxButtonSize);

  useEffect(() => {
    async function fetchCanvas() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch canvas");
        const data = await res.json();
        setField(data.field);
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }
    fetchCanvas();
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("pixel-updated", ({ x, y, color }) => {
      setField((prev) => {
        if (!prev.length) return prev;
        const newField = prev.map((row) => row.slice());
        newField[y][x] = color;
        return newField;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!field.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        ctx.fillStyle = field[y][x];
        ctx.fillRect(
          x * canvasDimensions.pixelSize,
          y * canvasDimensions.pixelSize,
          canvasDimensions.pixelSize,
          canvasDimensions.pixelSize
        );
      }
    }

    if (hoveredPixel) {
      const { x, y } = hoveredPixel;
      ctx.fillStyle = hexToRgba(selectedColor, 0.4);
      ctx.fillRect(
        x * canvasDimensions.pixelSize,
        y * canvasDimensions.pixelSize,
        canvasDimensions.pixelSize,
        canvasDimensions.pixelSize
      );
    }
  }, [field, hoveredPixel, selectedColor, canvasDimensions.pixelSize]);

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  async function handleClick(e) {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) return;
    lastClickTimeRef.current = now;

    if (!field.length) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / canvasDimensions.pixelSize);
    const y = Math.floor((e.clientY - rect.top) / canvasDimensions.pixelSize);

    if (
      x < 0 ||
      y < 0 ||
      y >= field.length ||
      x >= field[0].length ||
      field[y][x] === selectedColor
    )
      return;

    setField((prev) => {
      const newField = prev.map((row) => row.slice());
      newField[y][x] = selectedColor;
      return newField;
    });

    try {
      await fetch(`${API_URL}/pixel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, color: selectedColor }),
      });
      socketRef.current.emit("pixel-update", { x, y, color: selectedColor });
    } catch (error) {
      console.error("Update Error:", error);
    }
  }

  function handleMouseMove(e) {
    if (!field.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / canvasDimensions.pixelSize);
    const y = Math.floor((e.clientY - rect.top) / canvasDimensions.pixelSize);

    if (
      x < 0 ||
      y < 0 ||
      y >= field.length ||
      x >= field[0].length ||
      (hoveredPixel && hoveredPixel.x === x && hoveredPixel.y === y)
    )
      return;

    setHoveredPixel({ x, y });
  }

  function handleMouseLeave() {
    setHoveredPixel(null);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        padding: 10,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        style={{
          border: "1px solid #aaa",
          imageRendering: "pixelated",
          cursor: "pointer",
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          backgroundColor: "#ddd",
          borderRadius: "8px",
          flexShrink: 0,
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: gap,
          height: canvasDimensions.height,
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        {paletteColors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: buttonSize,
              height: buttonSize,
              backgroundColor: color,
              border:
                selectedColor === color ? "3px solid #333" : "1px solid #aaa",
              borderRadius: 6,
              boxShadow:
                selectedColor === color ? "0 0 8px rgba(0,0,0,0.5)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
