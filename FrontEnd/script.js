let works = [];

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  const authLink = document.getElementById("auth-link");
  const editionBanner = document.querySelector(".edition-mode-banner");
  const editProjects = document.getElementById("edit-projects");
  const filterBtnList = document.querySelector(".category-filters");
  const header = document.querySelector("header");

  if (token) {
    if (editionBanner) {
      editionBanner.style.display = "flex";
      header.style.margin = "110px 0";
    }
    if (authLink) {
      authLink.textContent = "logout";
      authLink.href = "#";
      authLink.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        window.location.reload();
      });
    }

    if (filterBtnList) {
      filterBtnList.style.display = "none";
    }
  } else {
    if (editionBanner) editionBanner.style.display = "none";
    if (authLink) {
      authLink.textContent = "login";
      authLink.href = "./loginPage.html";
    }
    if (editProjects) {
      editProjects.style.display = "none";
    }
  }

  //let works = [];
  let categories = [];

  //API calls for getting works and categories
  works = await getFromApi("works");
  categories = await getFromApi("categories");

  console.log("Tableau des projets", works);
  console.log("Tableau des catégories", categories);

  /*TEST reader */
  /*
  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;

      // Masquer le bouton d'upload
      uploadInput.style.display = "none";

      // Afficher le conteneur de prévisualisation
      imagePreview.style.display = "block";
      document.getElementById("image-preview").style.display = "block";
    };

    reader.readAsDataURL(file);
  });
*/

  const uploadInput = document.getElementById("upload-btn");
  const imagePreview = document.getElementById("image-preview");
  const imagePlaceholder = document.getElementById("image-placeholder");
  const uploadWrapper = document.querySelector(".upload-wrapper");

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block"; // Affiche l'image uploadée
      imagePlaceholder.style.display = "none"; // Cache le placeholder
      uploadWrapper.style.display = "none"; // Cache le bouton et le texte
    };

    reader.readAsDataURL(file);
  });

  //Functions call to manage the gallery
  generateGallery(works);
  generateFiltersBtn(categories);
  displayFilteredWorks();
  setupModal();
  setupModalSwitch();
  setupAddImageForm(categories);
});

async function getFromApi(endPoint) {
  const response = await fetch(`http://localhost:5678/api/${endPoint}`, {
    method: "GET",
  });
  return await response.json();
}

async function postNewImage(imageFile, title, category) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", category);

  const token = sessionStorage.getItem("token");

  const response = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Erreur ${response.status} : ${message}`);
  }

  return await response.json();
}

//Generating the gallery
function generateGallery(works) {
  works.forEach((figure) => {
    //Creating the html elements for each work
    const figureElement = document.createElement("figure");
    const imageElement = document.createElement("img");
    imageElement.src = figure.imageUrl;
    imageElement.classList.add("img");
    const captionElement = document.createElement("figcaption");
    captionElement.innerText = figure.title;

    //Linking the html elements to the gallery section
    const sectionGallery = document.querySelector(".gallery");
    figureElement.dataset.categoryId = figure.categoryId;
    figureElement.append(imageElement, captionElement);
    sectionGallery.appendChild(figureElement);
  });
}

function generateFiltersBtn(categories) {
  const filterBtnList = document.querySelector(".category-filters");

  //All categories display button
  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn";
  allBtn.innerText = "Tous";
  filterBtnList.appendChild(allBtn);

  categories.forEach((btn) => {
    const btnElement = document.createElement("button");
    btnElement.className = "filter-btn";
    btnElement.innerText = btn.name;
    btnElement.dataset.categoryId = btn.id;

    filterBtnList.appendChild(btnElement);
  });

  console.log("Filtres ", filterBtnList);
}

function displayFilteredWorks() {
  const categoryFilters = document.querySelectorAll(".filter-btn");
  const allFigures = document.querySelectorAll(".gallery figure");

  categoryFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCategoryId = btn.dataset.categoryId || "0";

      allFigures.forEach((figure) => {
        const figureCategoryId = figure.dataset.categoryId;

        if (selectedCategoryId === "0") {
          figure.style.display = "block";
        } else if (figureCategoryId === selectedCategoryId) {
          figure.style.display = "block";
        } else {
          figure.style.display = "none";
        }
      });
    });
  });
}

function generateModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");

  if (!modalGallery) return;

  modalGallery.innerHTML = "";

  works.forEach((work) => {
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src = work.imageUrl;
    let div = document.createElement("div");
    div.classList.add("black-square");
    let icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can");
    div.appendChild(icon);

    figure.append(img, div);
    modalGallery.appendChild(figure);
    figure.dataset.categoryId = work.categoryId;
    figure.dataset.id = work.id;

    // add manage image deletion
    icon.addEventListener("click", async () => {
      if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
        try {
          await deleteImageById(work.id);
          alert("Image supprimée avec succès !");
          // Update
          works = works.filter((w) => w.id !== work.id);
          document.querySelector(".gallery").innerHTML = "";
          generateGallery(works);
          generateModalGallery(works);
        } catch (error) {
          console.log("Erreur lors de la suppression : " + error.message);
        }
      }
    });
  });
}

function setupModal() {
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("edit-projects-btn");
  const closeModalBtn = document.getElementById("close-btn");

  console.log("aaa1", { modal, openModalBtn, closeModalBtn });

  if (!modal || !openModalBtn || !closeModalBtn) return;

  console.log("aaa2", { modal, openModalBtn, closeModalBtn });

  openModalBtn.addEventListener("click", function (e) {
    e.preventDefault();
    generateModalGallery(works);
    modal.style.display = "flex";
  });

  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

function setupModalSwitch() {
  const addPictureBtn = document.getElementById("add-picture-btn");
  const modalGallery = document.querySelector(".modal-gallery");
  const addImageForm = document.getElementById("add-image-form");
  const leftArrow = document.querySelector(".fa-arrow-left");
  const modalContenttitle = document.getElementById("modal-content-title");

  if (!addPictureBtn || !modalGallery || !addImageForm || !leftArrow) return;

  //Manage modal content when clicking on adding a new photo
  addPictureBtn.addEventListener("click", () => {
    leftArrow.style.display = "flex";
    modalGallery.style.display = "none";
    addPictureBtn.style.display = "none";
    addImageForm.style.display = "flex";
    modalContenttitle.innerText = "Ajout photo";
  });

  // Au clic sur la flèche "Retour"
  leftArrow.addEventListener("click", () => {
    modalGallery.style.display = "flex";
    addPictureBtn.style.display = "flex";
    addImageForm.style.display = "none";
    leftArrow.style.display = "none";
    modalContenttitle.innerText = "Galerie photo";
  });
}

function setupAddImageForm(categories) {
  const form = document.getElementById("add-image-form");
  const fileInput = document.getElementById("upload-btn");
  const titleInput = document.getElementById("title-input");
  const categorySelect = document.getElementById("category-input");
  const validateBtn = document.getElementById("validate-upload-btn");

  //Manage select categories
  categorySelect.innerHTML = '<option value=""></option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  //Activate button when all the fields are filled
  function checkFormValidity() {
    const isValid =
      fileInput.files.length > 0 &&
      titleInput.value.trim() !== "" &&
      categorySelect.value !== "";
    if (isValid) {
      validateBtn.disabled = false;
      validateBtn.classList.add("active");
    } else {
      validateBtn.disabled = true;
      validateBtn.classList.remove("active");
    }
  }

  fileInput.addEventListener("change", checkFormValidity);
  titleInput.addEventListener("input", checkFormValidity);
  categorySelect.addEventListener("change", checkFormValidity);

  //Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const image = fileInput.files[0];
      const title = titleInput.value.trim();
      const category = categorySelect.value;

      const newWork = await postNewImage(image, title, category);

      // Add images and generate gallery
      works.push(newWork);
      generateGallery([newWork]);
      generateModalGallery(works);
      console.log("Image ajoutée avec succès !");
      form.reset();
      validateBtn.disabled = true;

      // Retour à la galerie modale
      document.querySelector(".fa-arrow-left").click();
    } catch (error) {
      console.error("Erreur ajout image :", error);
      alert("Échec de l'envoi de l'image.");
    }
  });
}

async function deleteImageById(id) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Erreur ${response.status} : ${message}`);
    }

    return true;
  } catch (error) {
    console.error("Erreur suppression image :", error);
    throw error;
  }
}
