// common-w.js — common helper functions (no UI change)

(function(){
  window.safeJsonParse = function(s){ try { return JSON.parse(s); } catch(e){ return null; } }
  window.saveToLS = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ console.error("LS save failed", e); return false; } }
  window.loadFromLS = function(k){ return window.safeJsonParse(localStorage.getItem(k)) || null; }

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
    try { document.documentElement.setAttribute('data-theme', name); localStorage.setItem('rd_theme', name); } catch(e){}
  };
  window.getSavedTheme = function(){ try { return localStorage.getItem('rd_theme') || 'dark'; } catch(e){ return 'dark'; } };
})();
