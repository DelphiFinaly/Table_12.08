// src/components/ImportWeekFromJson.jsx
import React from "react";

export default function ImportWeekFromJson({ setSchedule, groups = [] }) {
  function isDateKey(key) {
    return /^\d{4}-\d{2}-\d{2}$/.test(key);
  }

  function stripBOM(text = "") {
    return text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  // Нормализуем любые поддерживаемые структуры к плоскому виду:
  // { "YYYY-MM-DD": { "<GROUP>": { "<pairNum>": entry } } }
  function normalizeData(data) {
    const flat = {};
    if (!data || typeof data !== "object") return flat;

    const rootKeys = Object.keys(data);
    const looksWeekly = rootKeys.length > 0 && rootKeys.every(isDateKey);
    const looksCourses = rootKeys.some((k) => /^course_\d+$/i.test(k));

    const tryMergeDateMap = (dateMap) => {
      if (!dateMap || typeof dateMap !== "object") return;
      for (const [dateKey, groupsData] of Object.entries(dateMap)) {
        if (!isDateKey(dateKey)) continue;
        if (!flat[dateKey]) flat[dateKey] = {};
        if (groupsData && typeof groupsData === "object") {
          // поверхностный merge по группам; пары внутри перезапишем ниже при конечном merge
          flat[dateKey] = { ...flat[dateKey], ...groupsData };
        }
      }
    };

    if (looksWeekly) {
      tryMergeDateMap(data);
    } else if (looksCourses) {
      for (const course of Object.values(data)) {
        tryMergeDateMap(course);
      }
    } else {
      // считаем как семестровую структуру (произвольные секции с датами внутри)
      for (const section of Object.values(data)) {
        tryMergeDateMap(section);
      }
    }

    return flat;
  }

  // Фильтрация по текущим группам (если список непустой)
  function filterByGroups(flat, allowGroups = []) {
    if (!allowGroups || allowGroups.length === 0) return flat;
    const out = {};
    for (const [dateKey, groupMap] of Object.entries(flat)) {
      const picked = {};
      for (const g of allowGroups) {
        if (groupMap[g]) picked[g] = groupMap[g];
      }
      if (Object.keys(picked).length) out[dateKey] = picked;
    }
    return out;
  }

  // Глубокий merge плоской структуры в текущее расписание
  function mergeIntoSchedule(prev, flat) {
    const next = { ...prev };
    for (const [dateKey, groupsMap] of Object.entries(flat)) {
      if (!next[dateKey]) next[dateKey] = {};
      for (const [groupName, pairs] of Object.entries(groupsMap || {})) {
        if (!next[dateKey][groupName]) next[dateKey][groupName] = {};
        for (const [pairNum, entry] of Object.entries(pairs || {})) {
          next[dateKey][groupName][pairNum] = entry;
        }
      }
    }
    return next;
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => resolve(stripBOM(String(evt.target.result || "")));
      reader.onerror = () => reject(new Error("Ошибка чтения файла: " + file.name));
      reader.readAsText(file, "utf-8");
    });
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.multiple = true; // ← ключевой момент: разрешаем выбрать много файлов
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) {
        document.body.removeChild(input);
        return;
      }

      let combinedFlat = {};
      const errors = [];
      let parsedFiles = 0;

      for (const file of files) {
        try {
          const text = await readFileAsText(file);
          const data = JSON.parse(text);
          const flat = normalizeData(data);
          const filtered = filterByGroups(flat, groups);
          // merge в общий flat из всех файлов
          combinedFlat = mergeIntoSchedule(combinedFlat, filtered);
          parsedFiles += 1;
        } catch (err) {
          errors.push(`${file.name}: ${err?.message || "неизвестная ошибка"}`);
        }
      }

      // Вливаем всё разом в текущее расписание
      setSchedule((prev) => mergeIntoSchedule(prev, combinedFlat));

      // Небольшая сводка
      const days = Object.keys(combinedFlat).length;
      let pairs = 0;
      for (const gm of Object.values(combinedFlat)) {
        for (const pairsMap of Object.values(gm)) {
          pairs += Object.keys(pairsMap || {}).length;
        }
      }

      if (errors.length) {
        alert(
          `Импорт завершён частично.\n` +
          `Успешно: ${parsedFiles} файл(ов), добавлено дат: ${days}, пар: ${pairs}.\n\n` +
          `Ошибки:\n- ${errors.join("\n- ")}`
        );
      } else {
        alert(`Импорт успешно завершён: файлов ${parsedFiles}, дат ${days}, пар ${pairs}.`);
      }

      document.body.removeChild(input);
    });

    input.click();
  }

  return (
    <button
      type="button"
      className="export-btn"
      style={{ marginTop: 12 }}
      onClick={handleImport}
      title="Можно выбрать несколько JSON-файлов одновременно"
    >
      Импорт JSON (несколько файлов)
    </button>
  );
}
