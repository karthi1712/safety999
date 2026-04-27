initPage((device) => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-container">

      <h2 id="formTitle">Login</h2>

      <input id="email" placeholder="Email"><br>
      <input id="password" type="password" placeholder="Password"><br>

      <button onclick="login()">Login</button>

      <p id="toggleText">
        Don't have an account?
        <span onclick="toggle()">Signup</span>
      </p>

    </div>
  `;
});

let isLogin = true;

function toggle() {
  isLogin = !isLogin;

  document.getElementById("formTitle").innerText =
    isLogin ? "Login" : "Signup";

  document.getElementById("toggleText").innerHTML =
    isLogin
      ? `Don't have an account? <span onclick="toggle()">Signup</span>`
      : `Already have an account? <span onclick="toggle()">Login</span>`;

  document.querySelector("button").innerText =
    isLogin ? "Login" : "Signup";
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  if (isLogin) {
    handleLogin(email, password);
  } else {
    handleSignup(email, password);
  }
}