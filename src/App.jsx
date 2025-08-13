// src/App.jsx
import React, { useState, useMemo } from "react";

import ExcelUpload from "./components/ExcelUpload";
import ScheduleForm from "./components/ScheduleForm";
import ScheduleTable from "./components/ScheduleTable";
import SliderDays from "./components/SliderDays";

import ExportToWord from "./components/ExportToWord";
import ExportWeekToWord from "./components/ExportWeekToWord";
import ExportToJson from "./components/ExportToJson";
import ExportWeekToJson from "./components/ExportWeekToJson";
import ImportWeekFromJson from "./components/ImportWeekFromJson";

import WorkloadAll from "./components/WorkloadAll";

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() === 0 ? 7 : date.getDay();
  if (day !== 1) date.setDate(date.getDate() - (day - 1));
  return date;
}
function ymd(date) {
  return new Date(date).toISOString().slice(0, 10);
}

const GROUP_PREFIXES = ["ВМ", "СКТ", "ТФ", "ЯФФ", "ЛНОФ"];

export default function App() {
  const [excelData, setExcelData] = useState({ lessons: [], teachers: [], rooms: [] });
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [showWorkload, setShowWorkload] = useState(true);

  // 👇 новый реестр: «онлайн» на уровне преподавателя
  const [teacherOnline, setTeacherOnline] = useState({}); // { "Иванов И.И.": true, ... }
  const toggleTeacherOnline = (name) =>
    setTeacherOnline((prev) => ({ ...prev, [name]: !prev?.[name] }));

  const GROUPS = useMemo(() => {
    const suffix = selectedCourse === 1 ? "125" : "224";
    return GROUP_PREFIXES.map((p) => `${p}-${suffix}`);
  }, [selectedCourse]);

  const monday = getMonday(selectedDate);
  const weekDates = useMemo(() => {
    const m = getMonday(selectedDate);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(m);
      d.setDate(m.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  function handleSliderChange(idx) {
    setActiveDayIdx(idx);
    setSelectedDate(weekDates[idx]);
  }

<<<<<<< HEAD
  function handleAddToSchedule({ date, group, pairNum, lesson, teacher, room, online, onlineTeachers }) {
=======
  function handleAddToSchedule({ date, group, pairNum, lesson, teacher, room, online }) {
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
    const dateKey = ymd(date);
    setSchedule((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [group]: {
          ...(prev[dateKey]?.[group] || {}),
<<<<<<< HEAD
          [pairNum]: { lesson, teacher, room, online, onlineTeachers }, // ← сохранили пер-ячейковый онлайн
=======
          [pairNum]: { lesson, teacher, room, online }, // online — только для отображения
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
        },
      },
    }));
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Левая панель */}
      <aside className="left-panel" style={{ padding: 16, width: 340 }}>
        <h2 style={{ marginTop: 0 }}>Table MSU</h2>

        <ExcelUpload setExcelData={setExcelData} />

        <label style={{ marginTop: 18, fontWeight: "bold", display: "block" }}>
          Календарь даты:
          <input
            type="date"
            value={ymd(selectedDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              setSelectedDate(newDate);
              const mon = getMonday(newDate);
              const idx = Math.max(0, Math.min(5, Math.floor((newDate - mon) / 86400000)));
              setActiveDayIdx(idx);
            }}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label style={{ marginTop: 18, fontWeight: "bold", display: "block" }}>
          Курс:
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            <option value={1}>1 курс</option>
            <option value={2}>2 курс</option>
          </select>
        </label>

        <div style={{ marginTop: 12 }}>
          <ScheduleForm
            lessons={excelData.lessons}
            teachers={excelData.teachers}
            rooms={excelData.rooms}
            date={selectedDate}
            onAdd={handleAddToSchedule}
            groups={GROUPS}
            teacherOnline={teacherOnline}
            onToggleTeacherOnline={toggleTeacherOnline}
          />
        </div>

        {/* Экспорт — день */}
        <div style={{ marginTop: 12 }}>
          <ExportToWord groups={GROUPS} schedule={schedule} date={selectedDate} />
          <div style={{ height: 8 }} />
          <ExportToJson groups={GROUPS} schedule={schedule} date={selectedDate} />
        </div>

        {/* Экспорт — неделя */}
        <div style={{ marginTop: 12 }}>
          <ExportWeekToWord
            groups={GROUPS}
            schedule={schedule}
            selectedDate={selectedDate}
            selectedCourse={selectedCourse}
          />
          <div style={{ height: 8 }} />
          <ExportWeekToJson
            groups={GROUPS}
            schedule={schedule}
            selectedDate={selectedDate}
            selectedCourse={selectedCourse}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <ImportWeekFromJson setSchedule={setSchedule} groups={GROUPS} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <input
            type="checkbox"
            checked={showWorkload}
            onChange={(e) => setShowWorkload(e.target.checked)}
          />
          <span>Показать педнагрузку</span>
        </label>
      </aside>

      {/* Правая часть */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "#fff" }}>
        <SliderDays weekDates={weekDates} activeIdx={activeDayIdx} setActiveIdx={handleSliderChange} />

        <div id="print-area" style={{ marginTop: 12 }}>
          <ScheduleTable
            date={weekDates[activeDayIdx]}
            schedule={schedule[ymd(weekDates[activeDayIdx])] || {}}
            groups={GROUPS}
            teacherOnline={teacherOnline} // 👈 жирным имена онлайн-преподавателей
          />
        </div>

        {showWorkload && (
          <div style={{ marginTop: 24 }}>
            <WorkloadAll schedule={schedule} teacherOnline={teacherOnline} />
          </div>
        )}
      </main>
    </div>
  );
}
