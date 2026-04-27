initPage(async () => {
  const app = document.getElementById("app");

  navigator.geolocation.getCurrentPosition(async pos => {
    const data = await fetchNearby(pos.coords.latitude, pos.coords.longitude);

    app.innerHTML = `
      <h2>Nearby Alerts</h2>
      ${data.map(i => `
        <div class="card" style="border-left:5px solid ${
          i.severity === "high" ? "red" :
          i.severity === "medium" ? "orange" : "green"
        }">
          <h3>${i.title}</h3>
          <p>${i.description}</p>
          <small>${i.severity}</small>
        </div>
      `).join("")}
    `;
  });
});