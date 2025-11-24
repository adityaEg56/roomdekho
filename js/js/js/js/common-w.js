// common-w.js — common helper functions (small, safe, no UI change)

export function loadRooms() {
  try { return JSON.parse(localStorage.getItem("rooms")) || []; }
  catch(e){ return []; }
}

export function saveRooms(rooms) {
  try { localStorage.setItem("rooms", JSON.stringify(rooms)); }
  catch(e){ alert("Storage full! Try fewer photos."); }
}

export function loadLeads() {
  try { return JSON.parse(localStorage.getItem("leads")) || []; }
  catch(e){ return []; }
}

export function saveLeads(leads) {
  try { localStorage.setItem("leads", JSON.stringify(leads)); }
  catch(e){ alert("Unable to save lead."); }
}

// HTML safe output
export function escapeHtml(text){
  if(!text && text !== 0) return "";
  return String(text)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
