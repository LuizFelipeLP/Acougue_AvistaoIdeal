// login.js
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const senha = document.getElementById("senha").value;

  if (senha === "1234") {
    // Guarda a informação de login no navegador
    sessionStorage.setItem("logado", "true");
    alert("Login realizado com sucesso!");
    window.location.href = "admin.html";
  } else {
    alert("Senha incorreta!");
  }
});
