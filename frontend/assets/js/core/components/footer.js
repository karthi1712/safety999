// Footer Component Loader + Logic

function loadFooter() {
  const footerHTML = `
    <footer class="footer">
      <div class="footer-container">

        <div class="footer-left">
          <h3>Public Safety Platform</h3>
          <p>Report incidents. Stay safe.</p>
        </div>

        <div class="footer-links">
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="resources.html">Resources</a>
        </div>

        <div class="footer-social">
          <span onclick="openLink('https://twitter.com')">🐦</span>
          <span onclick="openLink('https://instagram.com')">📸</span>
          <span onclick="openLink('mailto:support@safety.com')">✉️</span>
        </div>

      </div>

      <div class="footer-bottom">
        © <span id="year"></span> Public Safety Platform
      </div>
    </footer>
  `;

  const footerContainer = document.getElementById("footer");

  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;

    // Set dynamic year
    document.getElementById("year").innerText =
      new Date().getFullYear();
  }
}

// External links
function openLink(url) {
  window.open(url, "_blank");
}