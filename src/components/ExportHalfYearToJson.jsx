// src/components/ExportHalfYearToJson.jsx
import React from "react";

function getDatesInRange(start, end) {
  const dates = [];
  const curr = new Date(start);
  const last = new Date(end);
  while (curr <= last) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

export default function ExportHalfYearToJson({ schedule, groups }) {
  function handleExport() {
    const periods = {
      "1_семестр": getDatesInRange("2025-09-01", "2025-12-31"),
      "2_семестр": getDatesInRange("2025-01-01", "2025-07-01"),
    };

    const result = {};
    for (const [sem, dates] of Object.entries(periods)) {
      result[sem] = {};
      dates.forEach((dateKey) => {
        const rowsObj = schedule[dateKey] || {};
        result[sem][dateKey] = groups.reduce((acc, g) => {
          acc[g] = rowsObj[g] || {};
          return acc;
        }, {});
      });
    }

    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule_half_year.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      className="export-btn"
      style={{ marginTop: 12 }}
      onClick={handleExport}
    >
      Экспорт полугодия в JSON
    </button>
  );
}
