/*
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

*/
async function postCredentials(email, password) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const status = response.status;
    const userAuth = await response.json();

    if (status === 200 && userAuth.token) {
      sessionStorage.setItem("token", userAuth.token);
      return { success: true };
    } else {
      return { success: false, status };
    }
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return { success: false, status: "network" };
  }
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  //Messages set to empty
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  const globalMessage = document.getElementById("globalMessage");
  globalMessage.textContent = "";
  globalMessage.className = "message";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const result = await postCredentials(email, password);

  if (result.success) {
    //Redirect to index page
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } else {
    if (result.status === 401) {
      document.getElementById("passwordError").textContent =
        "Mot de passe incorrect";
    } else if (result.status === 404) {
      document.getElementById("emailError").textContent =
        "Utilisateur incorrect";
    } else {
      globalMessage.textContent =
        "Erreur de connexion. Veuillez vérifier vos identifiants";
      globalMessage.classList.add("error");
    }
  }
});
