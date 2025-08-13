<<<<<<< HEAD
// src/components/ImportWeekFromJson.jsx
=======
// ImportWeekFromJson.jsx
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
import React from "react";

export default function ImportWeekFromJson({ setSchedule, groups = [] }) {
  function isDateKey(key) {
    return /^\d{4}-\d{2}-\d{2}$/.test(key);
  }

<<<<<<< HEAD
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
=======
  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) {
        alert("Файл не выбран.");
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
        document.body.removeChild(input);
        return;
      }

<<<<<<< HEAD
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
=======
      const reader = new FileReader();

      reader.onload = (evt) => {
        let text = evt.target.result;
        // Убираем BOM при необходимости
        if (text && text.charCodeAt(0) === 0xfeff) text = text.slice(1);

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("JSON parse error:", err);
          alert("Ошибка: неверный формат JSON-файла.");
          document.body.removeChild(input);
          return;
        }

        // Приводим к плоскому виду { dateKey: { groupName: { pairNum: entry } } }
        // Поддерживаем 3 формата:
        // 1) Недельный: { "YYYY-MM-DD": { ... } }
        // 2) Семестровый: { "1_семестр": { "YYYY-MM-DD": {...} }, "2_семестр": {...} }
        // 3) Два курса: { "course_1": { "YYYY-MM-DD": {...} }, "course_2": {...} }
        let flat = {};

        const rootKeys = Object.keys(data || {});
        const looksWeekly = rootKeys.length > 0 && rootKeys.every(isDateKey);
        const looksCourses = rootKeys.some((k) => /^course_\d+$/i.test(k));

        if (looksWeekly) {
          // Простой недельный
          flat = data;
        } else if (looksCourses) {
          // Объединённый файл за оба курса
          for (const section of Object.values(data)) {
            if (section && typeof section === "object") {
              for (const [dateKey, groupsData] of Object.entries(section)) {
                if (isDateKey(dateKey) && groupsData && typeof groupsData === "object") {
                  flat[dateKey] = { ...(flat[dateKey] || {}), ...groupsData };
                }
              }
            }
          }
        } else {
          // Семестровый
          for (const semData of Object.values(data)) {
            if (semData && typeof semData === "object") {
              for (const [dateKey, groupsData] of Object.entries(semData)) {
                if (isDateKey(dateKey) && groupsData && typeof groupsData === "object") {
                  flat[dateKey] = { ...(flat[dateKey] || {}), ...groupsData };
                }
              }
            }
          }
        }

        // Фильтрация по текущим группам (если переданы).
        // Если хотите всегда импортировать все группы из файла — уберите фильтрацию.
        const filtered = {};
        if (groups.length > 0) {
          for (const [dateKey, groupData] of Object.entries(flat)) {
            const onlySelected = {};
            for (const g of groups) {
              if (groupData[g]) onlySelected[g] = groupData[g];
            }
            if (Object.keys(onlySelected).length) filtered[dateKey] = onlySelected;
          }
        } else {
          Object.assign(filtered, flat);
        }

        // Глубокий merge в schedule: не затираем существующие пары.
        setSchedule((prev) => {
          const next = { ...prev };
          for (const [dateKey, groupsMap] of Object.entries(filtered)) {
            if (!next[dateKey]) next[dateKey] = {};
            for (const [groupName, pairs] of Object.entries(groupsMap)) {
              if (!next[dateKey][groupName]) next[dateKey][groupName] = {};
              for (const [pairNum, entry] of Object.entries(pairs)) {
                next[dateKey][groupName][pairNum] = entry; // перезаписываем только конкретную пару
              }
            }
          }
          return next;
        });

        alert("Импорт JSON успешно завершён.");
        document.body.removeChild(input);
      };

      reader.onerror = () => {
        alert("Ошибка при чтении файла.");
        document.body.removeChild(input);
      };

      reader.readAsText(file, "utf-8");
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
    });

    input.click();
  }

  return (
    <button
      type="button"
      className="export-btn"
      style={{ marginTop: 12 }}
      onClick={handleImport}
<<<<<<< HEAD
      title="Можно выбрать несколько JSON-файлов одновременно"
    >
      Импорт JSON (несколько файлов)
=======
    >
      Импорт JSON (неделя)
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
    </button>
  );
}
