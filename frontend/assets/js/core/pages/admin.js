initPage(async ()=>{
  const data = await fetchIncidents();

  document.getElementById("app").innerHTML = `
    <h2>Admin Panel</h2>
    ${data.map(i=>`
      <div class="card">
        ${i.title}
        <button onclick="deleteItem('${i._id}')">Delete</button>
      </div>
    `).join("")}
  `;
});

function deleteItem(id){
  alert("Delete logic here: "+id);
}