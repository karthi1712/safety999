initPage(async () => {
  const data = await fetchIncidents();

  document.getElementById("app").innerHTML =
    data.map(i => `
      <div class="card">
        <h3>${i.title}</h3>
        <p>${i.description}</p>
      </div>
    `).join("");
});