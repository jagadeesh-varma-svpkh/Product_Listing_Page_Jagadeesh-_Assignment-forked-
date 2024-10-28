// DOM Elements
const productGrid = document.getElementById("product-grid");
const loadMoreBtn = document.getElementById("load-more-btn");
const sortSelect = document.getElementById("sort-select");
const categoryFilters = document.getElementById("category-filters");
const priceRange = document.getElementById("price-range");
const priceOutput = document.getElementById("price-output");
const cartCount = document.getElementById("cart-count");
const breadcrumb = document.getElementById("breadcrumb");
const resultsCount = document.getElementById("results-count");
const filtersSidebar = document.getElementById("filters-sidebar");
const filterToggle = document.getElementById("filter-toggle");
const closeFilters = document.getElementById("close-filters");
const applyFilters = document.getElementById("apply-filters");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

// Global variables
let products = [];
let visibleProducts = [];
let currentPage = 1;
const productsPerPage = 10;
let categories = [];
let cart = [];

// Fetch products from API
const fetchProducts = async () => {
  try {
    productGrid.innerHTML = '<div class="shimmer"></div>'.repeat(10);
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    products = await response.json();
    categories = [...new Set(products.map((product) => product.category))];
    initializeFilters();
    updateProductGrid();
    updateBreadcrumb();
  } catch (error) {
    console.error("Error fetching products:", error);
    productGrid.innerHTML =
      '<p class="error-message">Failed to load products. Please try again later.</p>';
  }
};

// Initialize filters
const initializeFilters = () => {
  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <label>
            <input type="checkbox" value="${category}" class="category-filter"> ${category}
        </label>
    `
    )
    .join("");

  document.querySelectorAll(".category-filter").forEach((filter) => {
    filter.addEventListener("change", updateProductGrid);
  });
};

// Update product grid
const updateProductGrid = () => {
  const selectedCategories = [
    ...document.querySelectorAll(".category-filter:checked"),
  ].map((input) => input.value);
  const maxPrice = Number(priceRange.value);
  const sortOrder = sortSelect.value;

  visibleProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const matchesPrice = product.price <= maxPrice;
    return matchesCategory && matchesPrice;
  });

  if (sortOrder === "price-asc") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    visibleProducts.sort((a, b) => b.price - a.price);
  }

  currentPage = 1;
  renderProducts();
  updateResultsCount();
};

// Render products
const renderProducts = () => {
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const productsToShow = visibleProducts.slice(start, end);

  productGrid.innerHTML = productsToShow
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" alt="${
        product.title
      }" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
            <button class="favorite-btn" data-id="${product.id}">
                <svg class="favorite-icon" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        </div>
    `
    )
    .join("");

  loadMoreBtn.style.display = end < visibleProducts.length ? "block" : "none";

  // Add event listeners to favorite buttons
  document.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", toggleFavorite);
  });

  // Update breadcrumb based on the first product's category
  if (productsToShow.length > 0) {
    const category = productsToShow[0].category;
    updateBreadcrumb(category);
  }
};

// Toggle favorite
const toggleFavorite = (event) => {
  const button = event.currentTarget;
  button.classList.toggle("active");
};

// Update breadcrumb
const updateBreadcrumb = (category = "") => {
  const formattedCategory = category.toLowerCase();
  let breadcrumbHTML = '<a href="#">Home</a>';

  if (formattedCategory.includes("women's clothing")) {
    breadcrumbHTML += ` / <a href="#">Women's</a> / <span>Outerwear</span>`;
  } else if (formattedCategory.includes("men's clothing")) {
    breadcrumbHTML += ` / <a href="#">Men's</a> / <span>Outerwear</span>`;
  } else if (
    formattedCategory === "jewelry" ||
    formattedCategory === "electronics"
  ) {
    breadcrumbHTML += ` / <span>${category}</span>`;
  } else {
    breadcrumbHTML += ` / <span>${category || "Products"}</span>`;
  }

  breadcrumb.innerHTML = breadcrumbHTML;
};

// Update results count
const updateResultsCount = () => {
  const selectedCategories = [
    ...document.querySelectorAll(".category-filter:checked"),
  ].map((input) => input.value);

  let totalProducts;
  if (selectedCategories.length === 0) {
    totalProducts = products.length;
  } else {
    totalProducts = products.filter((product) =>
      selectedCategories.includes(product.category)
    ).length;
  }

  resultsCount.textContent = `${totalProducts} Products`;
};

// Event listeners
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderProducts();
});

sortSelect.addEventListener("change", updateProductGrid);

priceRange.addEventListener("input", (e) => {
  const value = e.target.value;
  priceOutput.textContent = `$${value}`;
});

filterToggle.addEventListener("click", () => {
  filtersSidebar.classList.add("show");
});

closeFilters.addEventListener("click", () => {
  filtersSidebar.classList.remove("show");
});

applyFilters.addEventListener("click", () => {
  updateProductGrid();
  filtersSidebar.classList.remove("show");
});

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// Toggle mobile menu
menuToggle.addEventListener("click", () => {
  navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
});

// Close mobile menu when window is resized to desktop view
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    navLinks.style.display = "flex";
  } else {
    navLinks.style.display = "none";
  }
});

// Close filters when clicking outside
document.addEventListener("click", (event) => {
  if (
    !filtersSidebar.contains(event.target) &&
    !filterToggle.contains(event.target)
  ) {
    filtersSidebar.classList.remove("show");
  }
});

// Initialize the page
fetchProducts();

// Implement lazy loading for images
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
};

// Call lazy loading after initial render
window.addEventListener("load", lazyLoadImages);
