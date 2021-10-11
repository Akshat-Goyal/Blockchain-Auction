import React from "react";

const Chip = ({ text, onClick }) => {
  return (
    <div
      style={{
        color: "rgb(23, 125, 220)",
        border: "thin solid rgb(23, 125, 220)",
        padding: "1.5em",
        borderRadius: "2px",
        textAlign: "center",
        cursor: "pointer",
        height: "100%",
        background: "rgba(79, 130, 179, 0.12)",
        userSelect: "none",
      }}
      onClick={onClick && (() => onClick())}
    >
      {text}
    </div>
  );
};

export default Chip;
