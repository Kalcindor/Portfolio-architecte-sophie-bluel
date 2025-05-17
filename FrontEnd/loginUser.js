async function postCredentials(email, password) {
  try {
    const login = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const userAuth = await login.json();

    console.log("userAuth", userAuth);
    if (userAuth.token) {
      sessionStorage.setItem("token", userAuth.token);
      return true;
    } else {
      //console.warn("Token non trouvé dans la réponse");
      return false;
    }
  } catch (error) {
    alert("Erreur lors de la connexion :", error);
    return false;
  }
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const access = await postCredentials(email, password);

  console.log("Test token : ", access);

  if (access) {
    console.log("Accès autorisé");
    window.location.href = "./index.html";
  } else {
    alert("Échec de la connexion : email ou mot de passe incorrect");
  }
});
