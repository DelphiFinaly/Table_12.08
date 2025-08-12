// ExportToJson.jsx
import React from "react";

export default function ExportToJson({ schedule, date, groups }) {
  function handleExport() {
    const dateKey = new Date(date).toISOString().slice(0, 10);
    // Фильтруем расписание по выбранным группам
    const rowsObj = schedule[dateKey] || {};
    const filtered = groups.reduce((acc, group) => {
      acc[group] = rowsObj[group] || {};
      return acc;
    }, {});
    const jsonData = { [dateKey]: filtered };
    const json = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule_${dateKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="export-btn" onClick={handleExport}>
      Экспорт JSON (день)
    </button>
  );
}