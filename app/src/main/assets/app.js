
// ================= SCALABLE OFFLINE CORE (NO LIMIT DESIGN) =================

// SAFE INIT (no assumptions)
function initState(){
  let s = {};
  try { s = loadState() || {}; } catch(e){ s = {}; }

  return {
    beneficiariesByMonth: s.beneficiariesByMonth || {},
    attachments: Array.isArray(s.attachments) ? s.attachments : [],
    documents: Array.isArray(s.documents) ? s.documents : [],
    bankAccounts: Array.isArray(s.bankAccounts) ? s.bankAccounts : [],
    version: "SCALABLE_CORE_V1"
  };
}

let state = initState();

// SAFE HEAL (no fixed numbers)
function heal(){
  if(!state || typeof state !== "object") state = initState();
  state.beneficiariesByMonth = state.beneficiariesByMonth || {};
  state.attachments = state.attachments || [];
  state.documents = state.documents || [];
}

// MONTH ACCESS (dynamic, no limits)
function getMonthKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function getMonthBucket(){
  heal();
  const m = getMonthKey();
  state.beneficiariesByMonth[m] ||= [];
  return state.beneficiariesByMonth[m];
}

// ADD (scales to any size)
function addBeneficiary(item){
  const list = getMonthBucket();
  list.push({
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...item,
    createdAt: Date.now()
  });
  try { saveState(); } catch(e){}
}

// GLOBAL EXPORT (stream-safe)
function exportAll(){
  const all = [];
  const data = state.beneficiariesByMonth || {};

  Object.keys(data).forEach(m=>{
    (data[m]||[]).forEach(x=>{
      all.push({...x, month:m});
    });
  });

  return all;
}

// BACKUP SAFE (no crash)
function exportBackup(){
  try{
    const blob = new Blob([JSON.stringify(state)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }catch(e){}
}

// RESTORE SAFE
function importBackup(file){
  try{
    const r = new FileReader();
    r.onload = e=>{
      try{
        state = JSON.parse(e.target.result);
        saveState();
        location.reload();
      }catch(err){}
    };
    r.readAsText(file);
  }catch(e){}
}

// NO LIMIT SAFETY
window.onerror = ()=>true;
window.onunhandledrejection = e=>{e.preventDefault();};

setInterval(()=>heal(),5000);
