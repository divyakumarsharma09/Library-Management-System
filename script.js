const KEY = "libracore_library_v1";

const seed = {
  books: [
    {id:"B001", title:"The Alchemist", author:"Paulo Coelho", isbn:"9780062315007", category:"Fiction", copies:4, available:3},
    {id:"B002", title:"Clean Code", author:"Robert C. Martin", isbn:"9780132350884", category:"Technology", copies:3, available:2},
    {id:"B003", title:"Atomic Habits", author:"James Clear", isbn:"9780735211292", category:"Self Help", copies:5, available:4},
    {id:"B004", title:"Database System Concepts", author:"Silberschatz", isbn:"9780078022159", category:"Technology", copies:2, available:1},
    {id:"B005", title:"Wings of Fire", author:"A. P. J. Abdul Kalam", isbn:"9788173711466", category:"Biography", copies:4, available:4},
    {id:"B006", title:"The Great Gatsby", author:"F. Scott Fitzgerald", isbn:"9780743273565", category:"Fiction", copies:3, available:3},
    {id:"B007", title:"Introduction to Algorithms", author:"Cormen et al.", isbn:"9780262046305", category:"Technology", copies:2, available:2},
    {id:"B008", title:"Rich Dad Poor Dad", author:"Robert Kiyosaki", isbn:"9781612680194", category:"Finance", copies:3, available:3}
  ],
  members: [
    {id:"M001", name:"Aarav Sharma", type:"Student", email:"aarav@campus.edu", status:"Active"},
    {id:"M002", name:"Priya Singh", type:"Student", email:"priya@campus.edu", status:"Active"},
    {id:"M003", name:"Rohan Verma", type:"Faculty", email:"rohan@campus.edu", status:"Active"},
    {id:"M004", name:"Ananya Gupta", type:"Student", email:"ananya@campus.edu", status:"Active"}
  ],
  transactions: [
    {id:"T001", bookId:"B002", memberId:"M001", issueDate:"2026-08-10", dueDate:"2026-08-24", returnDate:null, status:"issued"},
    {id:"T002", bookId:"B003", memberId:"M002", issueDate:"2026-08-08", dueDate:"2026-08-22", returnDate:null, status:"issued"},
    {id:"T003", bookId:"B004", memberId:"M003", issueDate:"2026-08-01", dueDate:"2026-08-10", returnDate:null, status:"overdue"},
    {id:"T004", bookId:"B001", memberId:"M004", issueDate:"2026-07-25", dueDate:"2026-08-08", returnDate:"2026-08-07", status:"returned"},
    {id:"T005", bookId:"B005", memberId:"M001", issueDate:"2026-07-18", dueDate:"2026-08-01", returnDate:"2026-07-30", status:"returned"}
  ]
};

let data = loadData();
let transactionFilter = "all";

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(seed); }
  catch { return structuredClone(seed); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(data)); renderAll(); }
function today(){ return new Date().toISOString().slice(0,10); }
function fmt(d){ if(!d) return "—"; return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
function esc(s){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function book(id){ return data.books.find(x=>x.id===id); }
function member(id){ return data.members.find(x=>x.id===id); }
function showToast(msg){ const t=document.getElementById("toast"); t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600); }

document.getElementById("currentDate").textContent = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});

document.querySelectorAll(".nav-item[data-section]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.section)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.go)));
document.getElementById("mobileMenu").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("quickIssue").onclick=()=>openIssueModal();
document.getElementById("issueBookBtn").onclick=()=>openIssueModal();
document.getElementById("addBookBtn").onclick=()=>openBookModal();
document.getElementById("addMemberBtn").onclick=()=>openMemberModal();
document.getElementById("resetData").onclick=()=>{if(confirm("Reset all data to the original demo data?")){data=structuredClone(seed);save();showToast("Demo data restored.");}};
document.getElementById("printReport").onclick=()=>window.print();
document.getElementById("bookSearch").oninput=renderBooks;
document.getElementById("memberSearch").oninput=renderMembers;
document.getElementById("categoryFilter").onchange=renderBooks;
document.querySelectorAll(".filter-tab").forEach(x=>x.onclick=()=>{document.querySelectorAll(".filter-tab").forEach(y=>y.classList.remove("active"));x.classList.add("active");transactionFilter=x.dataset.status;renderTransactions();});

function navigate(section){
  document.querySelectorAll(".page-section").forEach(x=>x.classList.remove("active"));
  document.getElementById(section).classList.add("active");
  document.querySelectorAll(".nav-item[data-section]").forEach(x=>x.classList.toggle("active",x.dataset.section===section));
  const titles={dashboard:"Dashboard",books:"Books",members:"Members",transactions:"Transactions",reports:"Reports"};
  document.getElementById("pageTitle").textContent=titles[section];
  document.getElementById("sidebar").classList.remove("open");
  if(section==="reports") renderReports();
}

function renderAll(){ renderStats();renderBooks();renderMembers();renderTransactions();renderDashboard();renderReports();populateCategories(); }
function renderStats(){
  const total=data.books.reduce((a,b)=>a+b.copies,0);
  const available=data.books.reduce((a,b)=>a+b.available,0);
  const issued=total-available;
  const overdue=data.transactions.filter(t=>t.status==="overdue" || (t.status==="issued" && t.dueDate<today())).length;
  document.getElementById("statBooks").textContent=total;document.getElementById("statAvailable").textContent=available;document.getElementById("statIssued").textContent=issued;document.getElementById("statOverdue").textContent=overdue;
}
function statusBadge(status){
  const label={issued:"Issued",returned:"Returned",overdue:"Overdue",active:"Active",inactive:"Inactive"}[status]||status;
  const cls=status==="overdue"?"red":status==="issued"?"blue":status==="returned"?"gray":status==="active"?"green":"orange";
  return `<span class="badge ${cls}">${label}</span>`;
}
function renderDashboard(){
  const rows=[...data.transactions].sort((a,b)=>b.issueDate.localeCompare(a.issueDate)).slice(0,5);
  document.getElementById("recentTransactions").innerHTML=rows.map(t=>`<tr><td><span class="book-name">${esc(book(t.bookId)?.title||"Deleted book")}</span></td><td>${esc(member(t.memberId)?.name||"Unknown")}</td><td>${t.status==="returned"?"Return":"Issue"}</td><td>${fmt(t.returnDate||t.issueDate)}</td><td>${statusBadge(t.status)}</td></tr>`).join("")||emptyRow(5);
  renderChart("categoryChart");
}
function renderChart(id){
  const counts={};data.books.forEach(b=>counts[b.category]=(counts[b.category]||0)+b.copies);
  const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);const max=Math.max(...entries.map(x=>x[1]),1);
  document.getElementById(id).innerHTML=entries.map(([name,n])=>`<div class="bar-row"><span>${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div><strong>${n}</strong></div>`).join("")||"<div class='empty'>No data</div>";
}
function emptyRow(cols){return `<tr><td colspan="${cols}" class="empty">No records found.</td></tr>`}
function populateCategories(){
  const select=document.getElementById("categoryFilter"), current=select.value;
  const cats=[...new Set(data.books.map(b=>b.category))].sort();
  select.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");select.value=current;
}
function renderBooks(){
  const q=document.getElementById("bookSearch").value.toLowerCase(), cat=document.getElementById("categoryFilter").value;
  const list=data.books.filter(b=>(!q||[b.title,b.author,b.isbn].join(" ").toLowerCase().includes(q))&&(!cat||b.category===cat));
  document.getElementById("booksTable").innerHTML=list.map(b=>`<tr><td><span class="book-name">${esc(b.title)}</span><span class="sub">${esc(b.id)}</span></td><td>${esc(b.author)}</td><td>${esc(b.isbn)}</td><td><span class="badge gray">${esc(b.category)}</span></td><td>${b.copies}</td><td>${b.available}</td><td><button class="action-btn" onclick="editBook('${b.id}')">Edit</button><button class="action-btn danger" onclick="deleteBook('${b.id}')">Delete</button></td></tr>`).join("")||emptyRow(7);
}
function renderMembers(){
  const q=document.getElementById("memberSearch").value.toLowerCase();
  const list=data.members.filter(m=>[m.name,m.id,m.email,m.type].join(" ").toLowerCase().includes(q));
  document.getElementById("membersTable").innerHTML=list.map(m=>{
    const count=data.transactions.filter(t=>t.memberId===m.id&&t.status!=="returned").length;
    return `<tr><td><span class="book-name">${esc(m.name)}</span></td><td>${m.id}</td><td>${m.type}</td><td>${esc(m.email)}</td><td>${count}</td><td>${statusBadge(m.status.toLowerCase())}</td><td><button class="action-btn" onclick="editMember('${m.id}')">Edit</button><button class="action-btn danger" onclick="deleteMember('${m.id}')">Delete</button></td></tr>`;
  }).join("")||emptyRow(7);
}
function renderTransactions(){
  const list=[...data.transactions].sort((a,b)=>b.issueDate.localeCompare(a.issueDate)).filter(t=>transactionFilter==="all"||t.status===transactionFilter);
  document.getElementById("transactionsTable").innerHTML=list.map(t=>{
    const action=t.status!=="returned"?`<button class="action-btn" onclick="returnBook('${t.id}')">Return</button>`:"—";
    return `<tr><td><span class="book-name">${esc(book(t.bookId)?.title||"Deleted book")}</span></td><td>${esc(member(t.memberId)?.name||"Unknown")}</td><td>${fmt(t.issueDate)}</td><td>${fmt(t.dueDate)}</td><td>${fmt(t.returnDate)}</td><td>${statusBadge(t.status)}</td><td>${action}</td></tr>`;
  }).join("")||emptyRow(7);
}
function renderReports(){
  const total=data.books.reduce((a,b)=>a+b.copies,0), active=data.members.filter(m=>m.status==="Active").length, issued=data.transactions.filter(t=>t.status==="issued"||t.status==="overdue").length, overdue=data.transactions.filter(t=>t.status==="overdue"||t.status==="issued"&&t.dueDate<today()).length;
  document.getElementById("reportBooks").textContent=total;document.getElementById("reportMembers").textContent=active;document.getElementById("reportIssued").textContent=issued;document.getElementById("reportOverdue").textContent=overdue;renderChart("reportCategoryChart");
}

function openModal(title,body,onSubmit){
  const back=document.getElementById("modalBackdrop"), modal=document.getElementById("modal");
  modal.innerHTML=`<div class="modal-head"><h3>${title}</h3><button class="close" id="closeModal">×</button></div><form id="modalForm"><div class="modal-body">${body}</div><div class="modal-footer"><button type="button" class="secondary-btn" id="cancelModal">Cancel</button><button class="primary-btn" type="submit">Save</button></div></form>`;
  back.classList.add("show");document.getElementById("closeModal").onclick=closeModal;document.getElementById("cancelModal").onclick=closeModal;document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();onSubmit(new FormData(e.target));};
}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("show")}
document.getElementById("modalBackdrop").onclick=e=>{if(e.target.id==="modalBackdrop")closeModal()};

function openBookModal(existing=null){
  const b=existing||{};
  openModal(existing?"Edit Book":"Add New Book",`<div class="form-grid">
  <div class="field full"><label>Book Title *</label><input name="title" required value="${esc(b.title||"")}"></div>
  <div class="field"><label>Author *</label><input name="author" required value="${esc(b.author||"")}"></div>
  <div class="field"><label>ISBN *</label><input name="isbn" required value="${esc(b.isbn||"")}"></div>
  <div class="field"><label>Category *</label><input name="category" required value="${esc(b.category||"")}"></div>
  <div class="field"><label>Total Copies *</label><input name="copies" type="number" min="1" required value="${b.copies||1}"></div></div>`,fd=>{
    const copies=Number(fd.get("copies"));const oldCopies=b.copies||0;const available=existing?Math.max(0,copies-(oldCopies-(b.available||0))):copies;
    if(existing){Object.assign(b,{title:fd.get("title"),author:fd.get("author"),isbn:fd.get("isbn"),category:fd.get("category"),copies,available:Math.min(copies,available)});showToast("Book updated.");}
    else data.books.push({id:"B"+String(Date.now()).slice(-5),title:fd.get("title"),author:fd.get("author"),isbn:fd.get("isbn"),category:fd.get("category"),copies,available});
    closeModal();save();
  });
}
function editBook(id){openBookModal(book(id))}
function deleteBook(id){if(data.transactions.some(t=>t.bookId===id&&t.status!=="returned"))return showToast("Cannot delete a book currently issued.");if(confirm("Delete this book from the catalogue?")){data.books=data.books.filter(b=>b.id!==id);save();showToast("Book deleted.");}}

function openMemberModal(existing=null){
  const m=existing||{};
  openModal(existing?"Edit Member":"Add New Member",`<div class="form-grid">
  <div class="field full"><label>Full Name *</label><input name="name" required value="${esc(m.name||"")}"></div>
  <div class="field"><label>Member Type</label><select name="type"><option ${m.type==="Student"?"selected":""}>Student</option><option ${m.type==="Faculty"?"selected":""}>Faculty</option></select></div>
  <div class="field"><label>Email *</label><input name="email" type="email" required value="${esc(m.email||"")}"></div>
  <div class="field"><label>Status</label><select name="status"><option ${m.status==="Active"?"selected":""}>Active</option><option ${m.status==="Inactive"?"selected":""}>Inactive</option></select></div></div>`,fd=>{
    if(existing) Object.assign(m,{name:fd.get("name"),type:fd.get("type"),email:fd.get("email"),status:fd.get("status")});
    else data.members.push({id:"M"+String(Date.now()).slice(-5),name:fd.get("name"),type:fd.get("type"),email:fd.get("email"),status:fd.get("status")});
    closeModal();save();showToast(existing?"Member updated.":"Member added.");
  });
}
function editMember(id){openMemberModal(member(id))}
function deleteMember(id){if(data.transactions.some(t=>t.memberId===id&&t.status!=="returned"))return showToast("Return all issued books before deleting.");if(confirm("Delete this member?")){data.members=data.members.filter(m=>m.id!==id);save();showToast("Member deleted.");}}

function openIssueModal(){
  const availableBooks=data.books.filter(b=>b.available>0), activeMembers=data.members.filter(m=>m.status==="Active");
  if(!availableBooks.length)return showToast("No books are currently available.");
  if(!activeMembers.length)return showToast("No active members available.");
  openModal("Issue a Book",`<div class="form-grid">
    <div class="field full"><label>Select Book *</label><select name="bookId" required>${availableBooks.map(b=>`<option value="${b.id}">${esc(b.title)} — ${b.available} available</option>`).join("")}</select></div>
    <div class="field full"><label>Select Member *</label><select name="memberId" required>${activeMembers.map(m=>`<option value="${m.id}">${esc(m.name)} (${m.id})</option>`).join("")}</select></div>
    <div class="field"><label>Issue Date</label><input name="issueDate" type="date" value="${today()}" required></div>
    <div class="field"><label>Due Date</label><input name="dueDate" type="date" value="${addDays(today(),14)}" required></div>
  </div>`,fd=>{
    const b=book(fd.get("bookId"));const m=member(fd.get("memberId"));
    if(!b||!m||b.available<1)return showToast("Invalid issue request.");
    b.available--;data.transactions.push({id:"T"+String(Date.now()).slice(-5),bookId:b.id,memberId:m.id,issueDate:fd.get("issueDate"),dueDate:fd.get("dueDate"),returnDate:null,status:fd.get("dueDate")<today()?"overdue":"issued"});
    closeModal();save();showToast(`"${b.title}" issued to ${m.name}.`);
  });
}
function addDays(date,n){const d=new Date(date+"T00:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function returnBook(id){
  const t=data.transactions.find(x=>x.id===id);if(!t||t.status==="returned")return;
  const b=book(t.bookId);if(b)b.available=Math.min(b.copies,b.available+1);
  t.status="returned";t.returnDate=today();save();showToast("Book returned successfully.");
}

renderAll();
