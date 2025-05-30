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

  //Functions call to manage the gallery
  generateGallery(works);
  generateFiltersBtn(categories);
  displayFilteredWorks();
  setupModal();
});

async function getFromApi(endPoint) {
  const response = await fetch(`http://localhost:5678/api/${endPoint}`, {
    method: "GET",
  });
  return await response.json();
}

//Generating the gallery
function generateGallery(works) {
  works.forEach((figure) => {
    //Creating the html elements for each work
    const figureElement = document.createElement("figure");
    const imageElement = document.createElement("img");
    imageElement.src = figure.imageUrl;
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
  const modalGalleryDisplay = document.querySelector(".modal-gallery-display");

  if (!modalGalleryDisplay) return;

  modalGalleryDisplay.innerHTML = "";

  works.forEach((work) => {
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src = work.imageUrl;
    let div = document.createElement("div");
    div.classList.add("black-square");
    let i = document.createElement("i");
    i.classList.add("fa-solid", "fa-trash-can");
    div.appendChild(i);

    figure.append(img, div);
    modalGalleryDisplay.appendChild(figure);
  });
}

function setupModal() {
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("edit-projects-btn");
  const closeModalBtn = modal.querySelector(".close-btn");

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
