// loader.js — loads all JS files without changing UI
(function(){
  const scripts = [
    'js/common-w.js',
    'js/auth-w.js',
    'js/rooms-w.js',
    'js/addroom-w.js',
    'js/leads-w.js',
    'js/ui-w.js'
  ];
  scripts.forEach(src=>{
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  });
})();
