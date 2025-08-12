import React from "react";
import mguLogo from "/mgu.png";

const PAIRS = [
  { num: 1, time: "09.00 – 10.35" },
  { num: 2, time: "10.45 – 12.20" },
  { num: 3, time: "12.30 – 14.05" },
  { num: 4, time: "15.00 – 16.35" },
  { num: 5, time: "16.45 – 18.20" },
  { num: 6, time: "18.30 – 20.05" },
];

const weekDayNames = [
  "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"
];

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU");
}

export default function ScheduleTable({ date, schedule, groups, teacherOnline = {} }) {
  const dayName = weekDayNames[new Date(date).getDay()];

  // Рендер фамилии преподавателя с учётом статуса "онлайн" (жирным)
  const renderTeacher = (name, i) => {
    if (!name) return null;
    const isOnlineTeacher = !!teacherOnline[name];
    return (
      <span key={i} style={{ fontWeight: isOnlineTeacher ? 700 : 400 }}>
        {name}
        <br />
      </span>
    );
  };

  return (
    <div>
      {/* Шапка документа */}
      <table width="1232" cellPadding="7" cellSpacing="0">
        <tbody>
          <tr>
            <td width="1055" height="160" valign="top" style={{ border: "none", padding: 0 }}>
              <table width="1058" cellPadding="7" cellSpacing="0">
                <tbody>
                  <tr valign="top">
                    <td width="820" height="153" style={{ border: "1px solid #000", padding: "0 0.08in" }}>
                      <img
                        src={mguLogo}
                        alt="Логотип МГУ"
                        width="100"
                        height="70"
                        style={{ display: "block", marginBottom: 10 }}
                      />
                      <div>ФИЛИАЛ МОСКОВСКОГО</div>
                      <div>ГОСУДАРСТВЕННОГО УНИВЕРСИТЕТА</div>
                      <div>имени М.В.ЛОМОНОСОВА</div>
                      <div>в городе САРОВЕ</div>
                      <div>(Филиал МГУ в г. Сарове)</div>
                    </td>
                    <td width="208" style={{ border: "1px solid #000", padding: "0 0.08in" }}>
                      <div>«УТВЕРЖДАЮ»</div>
                      <div>Директор Филиала МГУ Саров</div>
                      <div>Член-корр. РАН</div>
                      <div>Воеводин В.В.</div>
                      <div>«      » ________________ 2025 г.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <br /><br />
            </td>
            <td width="17" valign="top" style={{ border: "none", padding: 0 }} />
          </tr>
        </tbody>
      </table>

      <br /><br />

      {/* Дата */}
      <div style={{ marginBottom: 12, fontFamily: "Times New Roman, serif", fontSize: "1.2em" }}>
        {formatDate(date)}
      </div>

      <table
        className="schedule-table"
        dir="ltr"
        align="left"
        width="1066"
        hspace="12"
        cellPadding="7"
        cellSpacing="0"
      >
        <thead>
          <tr>
            <td></td>
            <td><b>День недели</b></td>
            <td colSpan={2} align="center"><b>Кафедра математики</b></td>
            <td colSpan={3} align="center"><b>Кафедра физики</b></td>
          </tr>
          <tr>
            <td className="bg-blue"></td>
            <td className="bg-blue">{dayName}</td>
            {groups.map((g) => (
              <td className="bg-blue" key={g}>{g}</td>
            ))}
          </tr>
        </thead>

        <tbody>
          {PAIRS.map((pair) => (
            <tr key={pair.num}>
              <td>{pair.num}</td>
              <td>{pair.time}</td>

              {groups.map((group) => {
                const cell = schedule?.[group]?.[pair.num];

                return (
                  <td key={group} style={{ verticalAlign: "top" }}>
                    {cell ? (
                      <>
                        {cell.lesson}<br />
                        {Array.isArray(cell.teacher)
                          ? cell.teacher.map((t, i) => renderTeacher(t, i))
                          : renderTeacher(cell.teacher, 0)
                        }
                        {cell.room}
                        {cell.online ? <><br />(онлайн)</> : null}
                      </>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
