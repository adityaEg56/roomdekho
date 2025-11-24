// common-w.js — common helper functions (no modules, attach to window)
(function(){
  window.safeJsonParse = function(s){ try { return JSON.parse(s); } catch(e){ return null; } }
  window.saveToLS = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true;}catch(e){console.error("LS save failed",e); return false;} }
  window.loadFromLS = function(k){ try { return window.safeJsonParse(localStorage.getItem(k)) || null; } catch(e){ return null; } }
  window.escapeHtml = function(text){
    if(text === null || text === undefined) return "";
    return String(text)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  };
  window.uid = function(){ return Date.now().toString() + Math.floor(Math.random()*1000); };
  window.setTheme = function(name){
    try{
      document.documentElement.setAttribute('data-theme', name);
      localStorage.setItem('rd_theme', name);
    }catch(e){}
  };
  window.getSavedTheme = function(){
    try{ return localStorage.getItem('rd_theme') || 'dark'; }catch(e){ return 'dark'; }
  };

  // small helpers for rooms/leads to keep names same as old code if used
  window.loadRooms = function(){ return window.loadFromLS ? (window.loadFromLS('rooms') || []) : (JSON.parse(localStorage.getItem('rooms')||'[]')); };
  window.saveRooms = function(rooms){ return window.saveToLS ? window.saveToLS('rooms', rooms) : (localStorage.setItem('rooms', JSON.stringify(rooms)), true); };

  window.loadLeads = function(){ return window.loadFromLS ? (window.loadFromLS('leads') || []) : (JSON.parse(localStorage.getItem('leads')||'[]')); };
  window.saveLeads = function(leads){ return window.saveToLS ? window.saveToLS('leads', leads) : (localStorage.setItem('leads', JSON.stringify(leads)), true); };
})();
