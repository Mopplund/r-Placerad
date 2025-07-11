import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api/canva";

export default function Canvas() {
  const [field, setField] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [hoveredPixel, setHoveredPixel] = useState(null);

  useEffect(() => {
    async function fetchCanvas() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch canvas");
        const data = await res.json();
        setField(data.field);
      } catch (error) {
        console.error("Failed to load canvas:", error);
      }
    }
    fetchCanvas();
  }, []);

  const handleClick = async (rowIndex, colIndex) => {
    const newField = field.map((row, r) =>
      row.map((color, c) =>
        r === rowIndex && c === colIndex ? selectedColor : color
      )
    );
    setField(newField);

    try {
      const res = await fetch(`${API_URL}/pixel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: colIndex,
          y: rowIndex,
          color: selectedColor,
        }),
      });
      if (!res.ok) throw new Error("Failed to update pixel");
    } catch (error) {
      console.error("Failed to update pixel:", error);
    }
  };

  if (!field.length) return <div>Laddar...</div>;

  const fieldHeight = field.length;
  const fieldWidth = field[0].length;

  const maxContainerWidth = window.innerWidth * 0.7; // 70% for canvas
  const maxContainerHeight = window.innerHeight * 0.9;

  let containerWidth = maxContainerWidth;
  let containerHeight = (containerWidth * fieldHeight) / fieldWidth;

  if (containerHeight > maxContainerHeight) {
    containerHeight = maxContainerHeight;
    containerWidth = (containerHeight * fieldWidth) / fieldHeight;
  }

  function blendColors(c0, c1, ratio) {
    const hexToRgb = (hex) =>
      hex
        .replace(/^#/, "")
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

    const rgb0 = hexToRgb(c0);
    const rgb1 = hexToRgb(c1);

    const r = Math.round(rgb0[0] * (1 - ratio) + rgb1[0] * ratio);
    const g = Math.round(rgb0[1] * (1 - ratio) + rgb1[1] * ratio);
    const b = Math.round(rgb0[2] * (1 - ratio) + rgb1[2] * ratio);

    return rgbToHex(r, g, b);
  }

  const paletteColors = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];

  return (
    <div className="main-wrapper">
      <div
        className="canvas-container"
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
      >
        <div
          className="canvas-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${fieldWidth}, 1fr)`,
            gridTemplateRows: `repeat(${fieldHeight}, 1fr)`,
            gap: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "#ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {field.map((row, rowIndex) =>
            row.map((color, colIndex) => {
              const isHovered =
                hoveredPixel &&
                hoveredPixel.row === rowIndex &&
                hoveredPixel.col === colIndex;

              const displayColor = isHovered
                ? blendColors(color, selectedColor, 0.3)
                : color;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="pixel"
                  onClick={() => handleClick(rowIndex, colIndex)}
                  onMouseEnter={() =>
                    setHoveredPixel({ row: rowIndex, col: colIndex })
                  }
                  onMouseLeave={() => setHoveredPixel(null)}
                  style={{ backgroundColor: displayColor }}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="palette">
        {paletteColors.map((color) => (
          <button
            key={color}
            style={{
              backgroundColor: color,
              border:
                selectedColor === color ? "3px solid #666" : "1px solid #aaa",
              boxShadow:
                selectedColor === color ? "0 0 8px rgba(0,0,0,0.4)" : "none",
            }}
            onClick={() => setSelectedColor(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
