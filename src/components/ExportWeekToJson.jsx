// src/components/ExportWeekToJson.jsx
import React from "react";

// Найти понедельник для выбранной даты
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d;
}

// Номер недели от начала семестра: от 1 сентября или 1 января
function getWeekIndex(monday) {
  const year = monday.getFullYear();
  const start =
    monday.getMonth() >= 8 ? new Date(year, 8, 1) : new Date(year, 0, 1);
  const startMon = getMonday(start);
  const diffMs = monday.getTime() - startMon.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// Получить список префиксов групп из пропа `groups` (например, ["ВМ","СКТ",...])
// Если не удаётся извлечь — используем дефолт.
function getPrefixesFromGroups(groups = []) {
  const set = new Set();
  groups.forEach((g) => {
    const parts = String(g).split("-");
    if (parts.length >= 2) set.add(parts[0]);
  });
  if (set.size === 0) return ["ВМ", "СКТ", "ТФ", "ЯФФ", "ЛНОФ"];
  return Array.from(set);
}

export default function ExportWeekToJson({
  schedule,
  selectedDate,
  groups,
  selectedCourse, // игнорируем, оставлен для совместимости пропсов
}) {
  function handleExport() {
    const monday = getMonday(selectedDate);
    const weekIndex = getWeekIndex(monday);
    const dateStr = monday.toISOString().slice(0, 10).replace(/-/g, ".");
    const filename = `1-2_week_${weekIndex}_${dateStr}.json`;

    // Префиксы групп берём из текущего пропа groups (или дефолт)
    const prefixes = getPrefixesFromGroups(groups);

    // Формируем списки групп по обоим курсам
    const groupsCourse1 = prefixes.map((p) => `${p}-125`);
    const groupsCourse2 = prefixes.map((p) => `${p}-224`);

    // Дни недели (Пн–Сб)
    const weekDates = Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      return dt.toISOString().slice(0, 10);
    });

    // Утилита упаковки данных по списку групп
    const buildWeekDataFor = (courseGroups) =>
      weekDates.reduce((acc, dateKey) => {
        const rowsObj = schedule[dateKey] || {};
        acc[dateKey] = courseGroups.reduce((gAcc, g) => {
          gAcc[g] = rowsObj[g] || {};
          return gAcc;
        }, {});
        return acc;
      }, {});

    const payload = {
      course_1: buildWeekDataFor(groupsCourse1),
      course_2: buildWeekDataFor(groupsCourse2),
    };

    // Сохраняем файл
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      className="export-btn"
      style={{ marginTop: 12 }}
      onClick={handleExport}
    >
      Экспорт недели в JSON (2 курса)
    </button>
  );
}
