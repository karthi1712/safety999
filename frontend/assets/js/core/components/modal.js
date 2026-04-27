function openModal(title, message, callback) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalText").innerText = message;

  window.modalCallback = callback;

  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function confirmModal() {
  if (window.modalCallback) {
    window.modalCallback();
  }
  closeModal();
}