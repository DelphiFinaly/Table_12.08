// src/components/ExportWeekToWord.jsx
import React from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  PageOrientation,
  VerticalAlign,
} from "docx";

const PAIRS_WEEK = [
  { num: 1, time: "09.00 – 10.35" },
  { num: 2, time: "10.45 – 12.20" },
  { num: 3, time: "12.30 – 14.05" },
  { num: 4, time: "15.00 – 16.35" },
  { num: 5, time: "16.45 – 18.20" },
  { num: 6, time: "18.30 – 20.05" },
];
const WEEK_DAYS = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d;
}

// Номер недели от начала семестра
function getWeekIndex(monday) {
  const year = monday.getFullYear();
  const start = monday.getMonth() >= 8
    ? new Date(year, 8, 1)   // 1 сентября
    : new Date(year, 0, 1);  // 1 января
  const startMon = getMonday(start);
  const diff = monday.getTime() - startMon.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function formatDateRu(d) {
  return new Date(d).toLocaleDateString("ru-RU");
}

export default function ExportWeekToWord({
  schedule,
  selectedDate,
  groups,
  selectedCourse,
}) {
  function handleExport() {
    const monday = getMonday(selectedDate);
    const weekIndex = getWeekIndex(monday);
    const dateStr = monday.toISOString().slice(0, 10).replace(/-/g, ".");
    const filename = `${selectedCourse}_week_${weekIndex}_${dateStr}.docx`;

    // Генерируем массив дат недели (Пн–Сб)
    const weekDates = Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      return dt;
    });

    const sections = weekDates.map((date, idx) => {
      const dayKey = date.toISOString().slice(0, 10);
      const rowsObj = schedule[dayKey] || {};

      // Шапка документа (как у вас было)
      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ text: "ФИЛИАЛ МОСКОВСКОГО", alignment: AlignmentType.LEFT }),
                  new Paragraph({ text: "ГОСУДАРСТВЕННОГО УНИВЕРСИТЕТА", alignment: AlignmentType.LEFT }),
                  new Paragraph({ text: "имени М.В.ЛОМОНОСОВА", alignment: AlignmentType.LEFT }),
                  new Paragraph({ text: "в городе САРОВЕ", alignment: AlignmentType.LEFT }),
                  new Paragraph({ text: "(Филиал МГУ в г. Сарове)", alignment: AlignmentType.LEFT }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: "«УТВЕРЖДАЮ»", alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: "Директор Филиала МГУ Саров", alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: "Член-корр. РАН", alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: "Воеводин В.В.", alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: "«      » ________________ 2025 г.", alignment: AlignmentType.RIGHT }),
                ],
              }),
            ],
          }),
        ],
      });

      // Заголовок таблицы по группам
      const headerRow = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "№", bold: true })],
            })],
          }),
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Время", bold: true })],
            })],
          }),
          ...groups.map(group =>
            new TableCell({
              shading: { fill: "DEEAF6" },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: group, bold: true })],
              })],
            })
          ),
        ],
      });

      // Строки пар
      const pairRows = PAIRS_WEEK.map(pair =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(pair.num) })],
              })],
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: pair.time })],
              })],
            }),
            ...groups.map(group => {
              const entry = rowsObj[group]?.[pair.num];
              const lines = entry
                ? [entry.lesson, ...(Array.isArray(entry.teacher) ? entry.teacher : [entry.teacher]), entry.room, entry.online ? "(онлайн)" : ""]
                    .filter(Boolean)
                : [""];
              return new TableCell({
                verticalAlign: VerticalAlign.TOP,
                children: lines.map(text => new Paragraph({ text, alignment: AlignmentType.LEFT })),
              });
            }),
          ],
        })
      );

      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...pairRows],
      });

      return {
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
        children: [
          headerTable,
          new Paragraph({ text: "", spacing: { after: 300 } }),
          new Paragraph({
            children: [new TextRun({ text: `Дата: ${formatDateRu(date)} (${WEEK_DAYS[idx]})`, bold: true })],
            spacing: { after: 300 },
          }),
          table,
          new Paragraph({ text: "", spacing: { after: 300 } }),
        ],
      };
    });

    const doc = new Document({ sections });
    Packer.toBlob(doc).then(blob => saveAs(blob, filename));
  }

  return (
    <button type="button" className="export-btn" onClick={handleExport}>
      Экспорт недели в Word (.docx)
    </button>
  );
}
