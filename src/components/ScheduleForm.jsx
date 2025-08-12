// src/components/ScheduleForm.jsx
import React, { useState, useEffect } from "react";

export default function ScheduleForm({
  lessons = [],
  teachers = [],
  rooms = [],
  date,
  onAdd,
  groups = [],
  teacherOnline = {},           // 👈 новый реестр
  onToggleTeacherOnline = () => {}, // 👈 переключатель статуса
}) {
  const [group, setGroup] = useState(groups[0] || "");
  useEffect(() => {
    if (!groups.length) return;
    setGroup((prev) => (prev && groups.includes(prev) ? prev : groups[0]));
  }, [groups]);

  const [pairNum, setPairNum] = useState(1);
  const [lesson, setLesson] = useState("");
  const [teacher, setTeacher] = useState("");
  const [teachersList, setTeachersList] = useState([]);
  const [room, setRoom] = useState("");
  const [online, setOnline] = useState(false); // ⬅️ только для отображения пары

  const PAIRS = [
    { num: 1, time: "09.00 – 10.35" },
    { num: 2, time: "10.45 – 12.20" },
    { num: 3, time: "12.30 – 14.05" },
    { num: 4, time: "15.00 – 16.35" },
    { num: 5, time: "16.45 – 18.20" },
    { num: 6, time: "18.30 – 20.05" },
  ];

  function addTeacher() {
    if (teacher && !teachersList.includes(teacher)) {
      setTeachersList((prev) => [...prev, teacher]);
      setTeacher("");
    }
  }
  function removeTeacher(t) {
    setTeachersList((prev) => prev.filter((x) => x !== t));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!lesson || teachersList.length === 0 || !room || !group || !pairNum) return;
    onAdd({
      date,
      group,
      pairNum,
      time: PAIRS.find((p) => p.num === +pairNum).time,
      lesson,
      teacher: teachersList,
      room,
      online, // ⬅️ только визуальный флаг для этой пары
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <label>
        Группа:
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <label>
        Пара:
        <select value={pairNum} onChange={(e) => setPairNum(Number(e.target.value))}>
          {PAIRS.map((p) => (
            <option key={p.num} value={p.num}>
              {p.num} ({p.time})
            </option>
          ))}
        </select>
      </label>

      <label>
        Предмет:
        <select value={lesson} onChange={(e) => setLesson(e.target.value)}>
          <option value="">— выбрать —</option>
          {lessons.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      {/* «Онлайн» ПАРЫ — только для отображения в таблице */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>Онлайн (для отображения пары)</span>
        <input
          type="checkbox"
          checked={online}
          onChange={(e) => setOnline(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
      </label>

      {/* Преподаватели */}
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>Преподаватель:</span>
        <select value={teacher} onChange={(e) => setTeacher(e.target.value)} style={{ flex: 1 }}>
          <option value="">— выбрать —</option>
          {teachers.filter((t) => !teachersList.includes(t)).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="button" onClick={addTeacher} style={{ marginLeft: 2 }}>+</button>
      </label>

      {/* Список выбранных преподавателей + флажок «онлайн» для каждого */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {teachersList.map((t) => {
          const isOnlineTeacher = !!teacherOnline[t];
          return (
            <div key={t}
              style={{
                background: "#eef2fa",
                borderRadius: 8,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontWeight: isOnlineTeacher ? 700 : 400 }}>{t}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isOnlineTeacher}
                  onChange={() => onToggleTeacherOnline(t)}
                />
                онлайн (преподаватель)
              </label>
              <button type="button" onClick={() => removeTeacher(t)} title="Удалить">×</button>
            </div>
          );
        })}
      </div>

      <label>
        Аудитория:
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">— выбрать —</option>
          {rooms.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <button type="submit" className="add-btn">Добавить в расписание</button>
    </form>
  );
}
