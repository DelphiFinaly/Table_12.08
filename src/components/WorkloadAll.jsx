// src/components/WorkloadAll.jsx
import React, { useMemo } from "react";

// 1 пара = столько часов (можете поменять)
const HOURS_PER_PAIR = 2;

export default function WorkloadAll({ schedule }) {
  const { rows, grandPairs, grandHours } = useMemo(() => {
    // teacher -> { subjects: Map<subjectKey, {pairs, hours}>, totalPairs, totalHours }
    const byTeacher = new Map();

    for (const [, groupsMap] of Object.entries(schedule || {})) {
      for (const [, pairs] of Object.entries(groupsMap || {})) {
        for (const [, entry] of Object.entries(pairs || {})) {
          const subjName = (entry?.lesson || "").trim() || "(без предмета)";

          // преподаватели в ячейке
          const teachers = Array.isArray(entry?.teacher)
            ? entry.teacher
            : entry?.teacher
            ? [entry.teacher]
            : [];
          if (teachers.length === 0) continue;

          // онлайн преподаватели (только для этой ячейки)
          const onlineSet = new Set(entry?.onlineTeachers || []);

          // *** Новая логика часов ***
          // 1) делим часы пары поровну между всеми преподавателями
          const sharePerTeacher = HOURS_PER_PAIR / teachers.length;

          teachers.forEach((t) => {
            const teacher = String(t || "").trim();
            if (!teacher) return;

            // 2) после деления применяем онлайн-множитель 0.5 для этого преподавателя (если он онлайн в этой ячейке)
            const isOnlineTeacher = onlineSet.has(teacher);
            const subjectKey = isOnlineTeacher ? `${subjName} (онлайн)` : subjName;
            const hoursForThisTeacher = sharePerTeacher * (isOnlineTeacher ? 0.5 : 1);

            if (!byTeacher.has(teacher)) {
              byTeacher.set(teacher, {
                subjects: new Map(),
                totalPairs: 0,
                totalHours: 0,
              });
            }
            const agg = byTeacher.get(teacher);

            // пары считаем как 1 шт. на преподавателя за каждую ячейку
            const prev = agg.subjects.get(subjectKey) || { pairs: 0, hours: 0 };
            prev.pairs += 1;
            prev.hours += hoursForThisTeacher;
            agg.subjects.set(subjectKey, prev);

            agg.totalPairs += 1;
            agg.totalHours += hoursForThisTeacher;
          });
        }
      }
    }

    // плоские строки для таблицы
    const rows = [];
    const sortedTeachers = Array.from(byTeacher.keys()).sort((a, b) =>
      a.localeCompare(b, "ru")
    );
    sortedTeachers.forEach((teacher) => {
      const { subjects, totalPairs, totalHours } = byTeacher.get(teacher);
      const sortedSubjects = Array.from(subjects.entries()).sort((a, b) =>
        a[0].localeCompare(b[0], "ru")
      );
      sortedSubjects.forEach(([subject, data]) => {
        rows.push({
          teacher,
          subject,
          pairs: data.pairs,
          hours: data.hours,
          totalPairs,
          totalHours,
        });
      });
    });

    // общие итоги по всем преподавателям (считаем один раз на преподавателя)
    let grandPairs = 0;
    let grandHours = 0;
    byTeacher.forEach((v) => {
      grandPairs += v.totalPairs;
      grandHours += v.totalHours;
    });

    return { rows, grandPairs, grandHours };
  }, [schedule]);

  const th = { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14 };
  const td = { padding: "10px 8px", borderBottom: "1px solid #f0f1f3", verticalAlign: "top", fontSize: 14 };
  const tdNum = { ...td, textAlign: "center", whiteSpace: "nowrap" };
  const wrap = { padding: 12, background: "#f7f8fb", border: "1px solid #e5e7eb", borderRadius: 10 };
  const fmt = (n) => (Number.isInteger(n) ? n : n.toFixed(2));

  return (
    <div style={wrap}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Педагогическая нагрузка (за всё внесённое расписание)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
          <tr>
            <th style={th}>ФИО преподавателя</th>
            <th style={th}>Наименование предмета</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>Пар</th>
            <th style={{ ...th, textAlign: "center", width: 120 }}>Затраченное время</th>
            <th style={{ ...th, textAlign: "center", width: 140 }}>Сумма всех часов</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td style={td} colSpan={5}>Нет данных для подсчёта.</td></tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.teacher}</td>
                <td style={td}>{r.subject}</td>
                <td style={tdNum}>{fmt(r.pairs)}</td>
                <td style={tdNum}>{fmt(r.hours)}</td>
                <td style={tdNum}>{fmt(r.totalHours)}</td>
              </tr>
            ))
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr>
              <td style={{ ...td, fontWeight: 700 }} colSpan={2}>Итого по всем преподавателям</td>
              <td style={{ ...tdNum, fontWeight: 700 }}>{fmt(grandPairs)}</td>
              <td style={{ ...tdNum, fontWeight: 700 }}></td>
              <td style={{ ...tdNum, fontWeight: 700 }}>{fmt(grandHours)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
