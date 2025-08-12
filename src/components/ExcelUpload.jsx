import React from "react";
import * as XLSX from "xlsx";

export default function ExcelUpload({ setExcelData }) {
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, {type: "array"});
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {header: 1});
      // Первый столбец — преподаватель, второй — предмет, третий — аудитория
      const teachers = Array.from(new Set(json.slice(1).map(row => row[0]).filter(Boolean)));
      const lessons = Array.from(new Set(json.slice(1).map(row => row[1]).filter(Boolean)));
      const rooms = Array.from(new Set(json.slice(1).map(row => row[2]).filter(Boolean)));
      setExcelData({ lessons, teachers, rooms });
    };
    reader.readAsArrayBuffer(file);
  }
  return (
    <div>
      <label style={{fontWeight:"bold"}}>Загрузить Excel:</label>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
    </div>
  );
}
