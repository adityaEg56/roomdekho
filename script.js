/* RoomDekho - script.js (Base64 image support + Leads + Theme)
   Replace your existing script.js with this entire content.
*/

/////////////////////// THEME ///////////////////////
function setTheme(name){
  document.documentElement.classList.remove('theme-pink','theme-blue','theme-dark');
  document.body.classList.remove('theme-pink','theme-blue','theme-dark');

  if(name === 'blue'){
    document.documentElement.classList.add('theme-blue');
    document.body.classList.add('theme-blue');
  } 
  else if(name === 'dark'){
    document.documentElement.classList.add('theme-dark');
    document.body.classList.add('theme-dark');
  }
  else {
    document.documentElement.classList.add('theme-pink');
    document.body.classList.add('theme-pink');
  }

  try { localStorage.setItem('rd_theme', name); } catch(e){}
}

function applySavedTheme(){
  let saved = 'pink';
  try { saved = localStorage.getItem('rd_theme') || 'pink'; } catch(e){ saved = 'pink'; }
  setTheme(saved);
  const sel = document.getElementById('themeSelect');
  if(sel) sel.value = saved;
}

/////////////////////// HELPERS ///////////////////////
function loadRooms(){
  try { return JSON.parse(localStorage.getItem("rooms")) || []; }
  catch(e){ return []; }
}
function saveRooms(rooms){
  try { localStorage.setItem("rooms", JSON.stringify(rooms)); }
  catch(e){ alert("Unable to save listing (storage full). Try fewer photos)."); }
}

/////////////////////// DOM READY ///////////////////////
document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();

  const sel = document.getElementById("themeSelect");
  if(sel){
    sel.value = localStorage.getItem('rd_theme') || 'pink';
    sel.addEventListener('change', (e)=> setTheme(e.target.value));
  }

  // Hook form submit if on addroom page
  const form = document.getElementById("roomForm");
  if(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAddRoomSubmit(e);
    });
  }

  // If finder page -> render rooms
  if (document.getElementById("room-list")) {
    renderRooms();
  }

  // If owner dashboard has leadList, render it
  if (document.getElementById("leadList")) {
    showLeads();
  }

  // If room view page -> load that room
  if (document.getElementById("viewRoom")) {
    loadRoomView();
  }
});

/////////////////////// IMAGE BASE64 ///////////////////////
// Convert File -> base64 string (data URL)
function convertToBase64(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject('File read error');
    reader.readAsDataURL(file);
  });
}

/////////////////////// ADD ROOM (async photo processing) ///////////////////////
// === Replace existing handleAddRoomSubmit with this ===
async function handleAddRoomSubmit(e){
  // form fields
  const title = document.getElementById("title").value.trim();
  const price = document.getElementById("price").value.trim();
  const type = document.getElementById("type").value;
  const location = document.getElementById("location").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const ownerPhone = document.getElementById("ownerPhone").value.trim();

  const photoFiles = document.getElementById("photos").files;
  const MAX_PHOTOS = 5;

  // basic validation
  if(!title || !price || !location || !ownerPhone){
    alert("Please fill title, price, location and owner phone.");
    return;
  }

  // UI: disable submit while uploading (if button exists)
  const submitBtn = e.target.querySelector('button[type="submit"], .login-btn');
  if(submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = 0.6; }

  const photos = [];

  // If CLOUD_NAME/UPLOAD_PRESET are configured, prefer Cloudinary uploads.
  // NOTE: uploadToCloudinary in your file uses placeholders for CLOUD_NAME/UPLOAD_PRESET.
  // Make sure uploadToCloudinary has correct CLOUD_NAME and preset.
  const useCloudinaryClient = true; // set to false to force base64 fallback for testing

  // Upload files sequentially or in parallel. We'll do Promise.all with limit.
  const toUpload = [];
  for (let i = 0; i < photoFiles.length && toUpload.length < MAX_PHOTOS; i++){
    toUpload.push(photoFiles[i]);
  }

  // Helper: upload one file and return url (or fallback base64)
  async function uploadOne(file){
    try {
      if (useCloudinaryClient) {
        // uploadToCloudinary should return secure_url or throw
        const url = await uploadToCloudinary(file);
        if (url) return url;
      }
    } catch(err) {
      console.warn("Cloudinary upload failed, falling back to base64:", err);
    }
    // fallback convert to base64
    try {
      return await convertToBase64(file);
    } catch(err){
      console.warn("Base64 conversion failed:", err);
      return null;
    }
  }

  // Upload all (in parallel)
  const uploadPromises = toUpload.map(f => uploadOne(f));
  const results = await Promise.all(uploadPromises);

  // Keep only non-null results
  results.forEach(r => { if(r) photos.push(r); });

  // build room object
  const room = {
    title,
    price,
    type,
    location,
    desc,
    photos,       // cloud urls or base64 fallback
    ownerPhone,
    createdAt: new Date().toISOString()
  };

  // save
  const rooms = loadRooms();
  rooms.push(room);
  saveRooms(rooms);

  // reset UI
  if(submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = 1; }

  alert("Room added successfully!");
  e.target.reset();

  // refresh list if present
  if(document.getElementById("room-list")) renderRooms();
}

/////////////////////// RENDER / FILTER / SEARCH ///////////////////////
function renderRooms(){
  const rooms = loadRooms();
  const list = document.getElementById("room-list");
  if(!list) return;

  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const typeFilter = document.getElementById("filterType")?.value || "";

  list.innerHTML = "";

  rooms
    .filter(room => 
      (!typeFilter || room.type === typeFilter) &&
      (
        room.title.toLowerCase().includes(search) ||
        room.location.toLowerCase().includes(search) ||
        (room.desc || "").toLowerCase().includes(search)
      )
    )
    .forEach((room, idx) => {
      const box = document.createElement("div");
      box.className = "room-card";

      box.innerHTML = `
        <h2>${escapeHtml(room.title)}</h2>
        <p>Price: ₹${escapeHtml(room.price)}</p>
        <p>Category: ${escapeHtml(room.type)}</p>
        <p>Location: ${escapeHtml(room.location)}</p>
        <p>${escapeHtml(room.desc)}</p>

        ${(room.photos || []).map(p => `<img src="${p}" class="room-img">`).join("")}

        <a href="roomview.html?room=${idx}" class="btn">View Details</a>
      `;

      list.appendChild(box);
    });
}

// helper to prevent XSS in inserted HTML
function escapeHtml(text){
  if(!text && text !== 0) return "";
  return String(text)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function filterRooms(){ renderRooms(); }
function onSearchChange(){ renderRooms(); }

/////////////////////// GEO ///////////////////////
function getLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
    document.getElementById("location").value =
      `${pos.coords.latitude}, ${pos.coords.longitude}`;
  }, () => {
    alert("Please allow GPS access.");
  });
}

/////////////////////// ROOM VIEW ///////////////////////
function loadRoomView(){
  const params = new URLSearchParams(window.location.search);
  const index = params.get("room");
  const rooms = loadRooms();
  const room = rooms[index];
  if(!room) return;

  // render room
  const container = document.getElementById("viewRoom");
  container.innerHTML = `
    <h2>${escapeHtml(room.title)}</h2>
    <p>Price: ₹${escapeHtml(room.price)}</p>
    <p>Category: ${escapeHtml(room.type)}</p>
    <p>Location: ${escapeHtml(room.location)}</p>
    <p>${escapeHtml(room.desc)}</p>

    ${(room.photos || []).map(p => `<img src="${p}" class="room-img">`).join("")}

    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" style="background:#ff2b2b;" onclick="openLeadForm()">Contact Owner</button>
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.location)}"
         class="btn map-btn" target="_blank">Open in Google Maps</a>
    </div>
  `;
}

/////////////////////// LEAD SYSTEM ///////////////////////
function openLeadForm(){
  const popup = document.getElementById("leadPopup");
  if(popup) popup.style.display = "flex";
}
function closeLead(){
  const popup = document.getElementById("leadPopup");
  if(popup) popup.style.display = "none";
}
function submitLead(){
  const params = new URLSearchParams(window.location.search);
  const index = params.get("room");

  const name = document.getElementById("leadName").value.trim();
  const phone = document.getElementById("leadPhone").value.trim();
  const message = document.getElementById("leadMessage").value.trim();

  if(!name || !phone || !message){
    alert("Please fill all fields.");
    return;
  }

  const newLead = {
    roomIndex: index,
    customerName: name,
    customerPhone: phone,
    customerMessage: message,
    time: new Date().toLocaleString()
  };

  const leads = JSON.parse(localStorage.getItem("leads") || "[]");
  leads.unshift(newLead);
  try { localStorage.setItem("leads", JSON.stringify(leads)); }
  catch(e){ alert("Unable to save lead (storage full)."); return; }

  alert("Inquiry sent to owner!");
  closeLead();
}

/////////////////////// OWNER DASHBOARD LEADS ///////////////////////
function showLeads(){
  const leads = JSON.parse(localStorage.getItem("leads") || "[]");
  const rooms = loadRooms();
  const div = document.getElementById("leadList");
  if(!div) return;

  div.innerHTML = "";
  leads.forEach(lead => {
    const room = rooms[lead.roomIndex] || { title: 'Unknown' };
    const box = document.createElement("div");
    box.className = "room-card";
    box.innerHTML = `
      <p><b>Room:</b> ${escapeHtml(room.title)}</p>
      <p><b>Name:</b> ${escapeHtml(lead.customerName)}</p>
      <p><b>Phone:</b> ${escapeHtml(lead.customerPhone)}</p>
      <p><b>Message:</b> ${escapeHtml(lead.customerMessage)}</p>
      <p class="meta"><b>Time:</b> ${escapeHtml(lead.time)}</p>
    `;
    div.appendChild(box);
  });
}
async function uploadToCloudinary(file) {
    const CLOUD_NAME = "dvrkjcxkj";  
    const UPLOAD_PRESET = "roomdekho_unsigned"; // tumhara preset name

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "room_images");

    const res = await fetch(url, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    console.log("Cloudinary response:", data);

    return data.secure_url;  // yahi final image URL hota hai
}
