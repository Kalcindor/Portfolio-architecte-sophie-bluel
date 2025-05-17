async function getFromApi(endPoint) {
  const response = await fetch(`http://localhost:5678/api/${endPoint}`, {
    method: "GET",
  });
  return await response.json();
}

const works = await getFromApi("works");
console.log("Tableau des projets", works);

const categories = await getFromApi("categories");
console.log("Tableau des categories", categories);

function generateGallery(works) {
  works.forEach((figure) => {
    const figureElement = document.createElement("figure");
    const imageElement = document.createElement("img");
    imageElement.src = figure.imageUrl;
    const captionElement = document.createElement("figcaption");
    captionElement.innerText = figure.title;

    // Rattachement des balises
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

//Functions calling
generateGallery(works);
generateFiltersBtn(categories);
displayFilteredWorks();
