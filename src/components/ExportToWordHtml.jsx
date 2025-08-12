import React from "react";

export default function ExportToWordHtml({ elementId = "print-area" }) {
  function handleExport() {
    const header = `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4 landscape; }  /* <-- Вот эта строка включает альбомный режим */
          body { font-family: Times New Roman, serif; }
          .schedule-table, .schedule-table td, .schedule-table th {
            border: 1px solid #000;
            border-collapse: collapse;
          }
          .schedule-table th, .schedule-table td {
            padding: 7px;
          }
          .bg-blue { background: #deeaf6; }
        </style>
      </head>
      <body>
    `;
    const footer = `</body></html>`;

    const printArea = document.getElementById(elementId);
    if (!printArea) {
      alert("Элемент с расписанием не найден!");
      return;
    }

    const html = printArea.innerHTML;
    const sourceHTML = header + html + footer;

    const blob = new Blob([sourceHTML], {
      type: "application/msword;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Расписание.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button className="export-btn" onClick={handleExport}>
      Экспорт в Word (HTML)
    </button>
  );
}
