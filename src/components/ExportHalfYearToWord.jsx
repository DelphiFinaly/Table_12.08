// src/components/ExportHalfYearToWord.jsx
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

// Шаблон пар
const PAIRS = [
  { num: 1, time: "09.00 – 10.35" },
  { num: 2, time: "10.45 – 12.20" },
  { num: 3, time: "12.30 – 14.05" },
  { num: 4, time: "15.00 – 16.35" },
  { num: 5, time: "16.45 – 18.20" },
  { num: 6, time: "18.30 – 20.05" },
];

// Возвращает массив дат от start до end (включительно)
function getDatesInRange(start, end) {
  const dates = [];
  const curr = new Date(start);
  const last = new Date(end);
  while (curr <= last) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("ru-RU");
}

export default function ExportHalfYearToWord({ schedule, groups }) {
  function handleExport() {
    // Два периода
    const periods = [
      { label: "1 сентября – 31 декабря", start: "2025-09-01", end: "2025-12-31" },
      { label: "1 января – 1 июля",      start: "2025-01-01", end: "2025-07-01" },
    ];

    // Собираем секции для документа
    const sections = periods.flatMap(({ label, start, end }) => {
      const dates = getDatesInRange(start, end);
      return dates.map((date) => {
        const key = date.toISOString().slice(0, 10);
        const rowsObj = schedule[key] || {};

        // Заголовок таблицы с группами
        const headerRow = new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("№")] }),
            new TableCell({ children: [new Paragraph("Время")] }),
            ...groups.map((g) =>
              new TableCell({
                shading: { fill: "DEEAF6" },
                children: [new Paragraph({ text: g, alignment: AlignmentType.CENTER })],
              })
            ),
          ],
        });

        // Строки по парам
        const pairRows = PAIRS.map((pair) => {
          const entryRow = [
            new TableCell({ children: [new Paragraph(String(pair.num))] }),
            new TableCell({ children: [new Paragraph(pair.time)] }),
          ];
          groups.forEach((g) => {
            const e = rowsObj[g]?.[pair.num];
            const texts = e
              ? [
                  e.lesson,
                  ...(Array.isArray(e.teacher) ? e.teacher : [e.teacher]),
                  e.room,
                  e.online ? "(онлайн)" : "",
                ].filter(Boolean)
              : [""];
            entryRow.push(
              new TableCell({
                verticalAlign: VerticalAlign.TOP,
                children: texts.map((t) => new Paragraph(t)),
              })
            );
          });
          return new TableRow({ children: entryRow });
        });

        return {
          properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
          children: [
            new Paragraph({ text: `Период: ${label}`,  spacing: { after: 200 } }),
            new Paragraph({ text: `Дата: ${formatDate(date)}`, spacing: { after: 200 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [headerRow, ...pairRows],
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
          ],
        };
      });
    });

    const doc = new Document({ sections });
    Packer.toBlob(doc).then((blob) =>
      saveAs(blob, "Расписание_полугодие.docx")
    );
  }

  return (
    <button type="button" className="export-btn" onClick={handleExport}>
      Экспорт полугодия в Word
    </button>
  );
}
