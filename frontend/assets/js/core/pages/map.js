const socket = io("http://localhost:5000");
initPage(async () => {
socket.on("newIncident", (i) => {
  L.circleMarker(
    [i.location.coordinates[1], i.location.coordinates[0]],
    { color: "red" }
  )
  .addTo(window.mapInstance)
  .bindPopup(i.title);
});

  document.getElementById("app").innerHTML =
    `<div id="map" style="height:85vh;"></div>`;

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const map = L.map('map').setView([lat, lng], 13);

    window.mapInstance = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(map);

    // 🔥 LOAD INCIDENTS
    const data = await fetchNearby(lat, lng);

    data.forEach(i => {
      const color =
        i.severity === "high" ? "red" :
        i.severity === "medium" ? "orange" : "green";

      L.circleMarker(
        [i.location.coordinates[1], i.location.coordinates[0]],
        { color }
      )
      .addTo(map)
      .bindPopup(`
        <b>${i.title}</b><br>
        ${i.description || ""}
      `);
    });

  });
});

// Fix map resize bug
window.addEventListener("resize", () => {
  if (window.mapInstance) {
    window.mapInstance.invalidateSize();
  }
});