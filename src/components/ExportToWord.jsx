// ExportToWord.jsx
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
  VerticalAlign
} from "docx";

const PAIRS = [
  { num: 1, time: "09.00 – 10.35" },
  { num: 2, time: "10.45 – 12.20" },
  { num: 3, time: "12.30 – 14.05" },
  { num: 4, time: "15.00 – 16.35" },
  { num: 5, time: "16.45 – 18.20" },
  { num: 6, time: "18.30 – 20.05" },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString("ru-RU");
}

export default function ExportToWord({ schedule, date, groups }) {
  function handleExport() {
    const dayKey = new Date(date).toISOString().slice(0, 10);
    const rowsObj = schedule[dayKey] || {};

    // Шапка документа
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

    // Заголовок таблицы групп
    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "№", bold: true })] }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Время", bold: true })] }),
          ],
        }),
        ...groups.map(group =>
          new TableCell({
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: group, bold: true })] }),
            ],
            shading: { fill: "DEEAF6" },
          })
        ),
      ],
    });

    // Строки пар
    const pairRows = PAIRS.map(pair =>
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(pair.num) })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: pair.time })],
              }),
            ],
          }),
          ...groups.map(group => {
            const entry = rowsObj[group]?.[pair.num];
            const lines = entry
              ? [
                  entry.lesson,
                  ...(Array.isArray(entry.teacher) ? entry.teacher : [entry.teacher]),
                  entry.room,
                  entry.online ? "(онлайн)" : "",
                ].filter(Boolean)
              : [""];
            return new TableCell({
              verticalAlign: VerticalAlign.CENTER,
              children: lines.map(text =>
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text })],
                })
              ),
            });
          }),
        ],
      })
    );

    const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...pairRows] });

    const doc = new Document({
      sections: [
        {
          properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
          children: [
            headerTable,
            new Paragraph({ text: "", spacing: { after: 300 } }),
            new Paragraph({ children: [new TextRun({ text: `Дата: ${formatDate(date)}`, bold: true })], spacing: { after: 300 } }),
            table,
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => saveAs(blob, `Расписание_${formatDate(date)}.docx`));
  }

  return (
    <button type="button" className="export-btn" onClick={handleExport}>
      Экспорт в Word (.docx)
    </button>
  );
}
