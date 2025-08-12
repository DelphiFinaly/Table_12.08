import React from "react";

export default function CalendarModal({ open, onClose, onSelect }) {
  if (!open) return null;
  const today = new Date();
  return (
    <div style={{
      position:"fixed", left:0, top:0, right:0, bottom:0, background:"rgba(0,0,0,0.18)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000
    }}>
      <div style={{
        background:"#fff", padding:24, borderRadius:14, boxShadow:"0 6px 28px #0002"
      }}>
        <h3>Выберите дату</h3>
        <input
          type="date"
          defaultValue={today.toISOString().slice(0,10)}
          onChange={e=>onSelect(new Date(e.target.value))}
        />
        <button onClick={onClose} style={{marginLeft:16}}>Отмена</button>
      </div>
    </div>
  );
}
