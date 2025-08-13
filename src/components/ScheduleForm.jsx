<<<<<<< HEAD
=======
// src/components/ScheduleForm.jsx
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
import React, { useState, useEffect } from "react";

export default function ScheduleForm({
  lessons = [],
  teachers = [],
  rooms = [],
  date,
  onAdd,
  groups = [],
<<<<<<< HEAD
=======
  teacherOnline = {},           // 👈 новый реестр
  onToggleTeacherOnline = () => {}, // 👈 переключатель статуса
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
}) {
  const [group, setGroup] = useState(groups[0] || "");
  useEffect(() => {
    if (!groups.length) return;
    setGroup((prev) => (prev && groups.includes(prev) ? prev : groups[0]));
  }, [groups]);

  const [pairNum, setPairNum] = useState(1);
  const [lesson, setLesson] = useState("");
  const [teacher, setTeacher] = useState("");
<<<<<<< HEAD
  const [teachersList, setTeachersList] = useState([]); // массив имён
  const [room, setRoom] = useState("");
  const [onlinePair, setOnlinePair] = useState(false); // онлайн для пары — только отображение
  const [onlineTeachers, setOnlineTeachers] = useState(new Set()); // онлайн-преподаватели ТОЛЬКО в этой ячейке
=======
  const [teachersList, setTeachersList] = useState([]);
  const [room, setRoom] = useState("");
  const [online, setOnline] = useState(false); // ⬅️ только для отображения пары
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08

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
<<<<<<< HEAD

  function removeTeacher(t) {
    setTeachersList((prev) => prev.filter((x) => x !== t));
    setOnlineTeachers((prev) => {
      const next = new Set(prev);
      next.delete(t);
      return next;
    });
  }

  function toggleOnlineTeacher(t) {
    setOnlineTeachers((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
=======
  function removeTeacher(t) {
    setTeachersList((prev) => prev.filter((x) => x !== t));
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!lesson || teachersList.length === 0 || !room || !group || !pairNum) return;
<<<<<<< HEAD

=======
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
    onAdd({
      date,
      group,
      pairNum,
      time: PAIRS.find((p) => p.num === +pairNum).time,
      lesson,
<<<<<<< HEAD
      teacher: teachersList,                         // имена преподов
      room,
      online: onlinePair,                            // визуальная пометка пары
      onlineTeachers: Array.from(onlineTeachers),    // ← онлайн-преподаватели ТОЛЬКО в этой ячейке
    });

    // Автосброс «онлайн» после добавления:
    setOnlinePair(false);
    setOnlineTeachers(new Set());
    // Остальное оставляем как есть, чтобы быстрее добавлять следующие пары
=======
      teacher: teachersList,
      room,
      online, // ⬅️ только визуальный флаг для этой пары
    });
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
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

<<<<<<< HEAD
      {/* Онлайн для пары — чисто визуально */}
=======
      {/* «Онлайн» ПАРЫ — только для отображения в таблице */}
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>Онлайн (для отображения пары)</span>
        <input
          type="checkbox"
<<<<<<< HEAD
          checked={onlinePair}
          onChange={(e) => setOnlinePair(e.target.checked)}
=======
          checked={online}
          onChange={(e) => setOnline(e.target.checked)}
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
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

<<<<<<< HEAD
      {/* Список выбранных преподавателей + перчиповый онлайн */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {teachersList.map((t) => {
          const isOnline = onlineTeachers.has(t);
=======
      {/* Список выбранных преподавателей + флажок «онлайн» для каждого */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {teachersList.map((t) => {
          const isOnlineTeacher = !!teacherOnline[t];
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
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
<<<<<<< HEAD
              <span style={{ fontWeight: isOnline ? 700 : 400 }}>{t}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={() => toggleOnlineTeacher(t)}
                />
                онлайн (преп.)
=======
              <span style={{ fontWeight: isOnlineTeacher ? 700 : 400 }}>{t}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isOnlineTeacher}
                  onChange={() => onToggleTeacherOnline(t)}
                />
                онлайн (преподаватель)
>>>>>>> 4e9f3931e1e2dbf7908e6a582b52dadfe3e43f08
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
