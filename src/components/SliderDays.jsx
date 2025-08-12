import React from "react";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function SliderDays({ weekDates, activeIdx, setActiveIdx }) {
  return (
    <div className="slider-days" style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
      {weekDates.map((d, idx) => (
        <div
          key={idx}
          className={`day${idx === activeIdx ? " active" : ""}`}
          style={{
            cursor: "pointer",
            padding: "6px 18px",
            borderRadius: "12px",
            background: idx === activeIdx ? "#204290" : "#eef1f6",
            color: idx === activeIdx ? "#fff" : "#222",
            fontWeight: 500,
            border: "1px solid #20429022"
          }}
          onClick={() => setActiveIdx(idx)}
        >
          {weekDays[idx]}
          <div style={{ fontSize: 12 }}>{d.toLocaleDateString("ru-RU")}</div>
        </div>
      ))}
    </div>
  );
}
