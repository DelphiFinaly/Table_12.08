// ImportWeekFromJson.jsx
import React from "react";

export default function ImportWeekFromJson({ setSchedule, groups = [] }) {
  function isDateKey(key) {
    return /^\d{4}-\d{2}-\d{2}$/.test(key);
  }

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
        document.body.removeChild(input);
        return;
      }

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
    });

    input.click();
  }

  return (
    <button
      type="button"
      className="export-btn"
      style={{ marginTop: 12 }}
      onClick={handleImport}
    >
      Импорт JSON (неделя)
    </button>
  );
}
