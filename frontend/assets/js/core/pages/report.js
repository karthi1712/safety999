function submit() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("desc").value;
  const severity = document.getElementById("severity").value;

  if (!title) {
    alert("Title required");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    await createIncident({
      title,
      description,
      severity,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });

    alert("✅ Incident Reported!");

    window.location.href = "map.html";
  });
}