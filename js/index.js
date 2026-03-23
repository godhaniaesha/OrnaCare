// header start
document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/category", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((categories) => {
      const categoryList = document.getElementById("categoryList");

      // Function to close all mega menus
      function closeAllMegaMenus() {
        document.querySelectorAll(".menu-item-has-children").forEach((item) => {
          item.classList.remove("active");
          const megaMenu = item.querySelector(".mega-menu2");
          const icon = item.querySelector(".dropdown-icon");
          if (megaMenu) {
            megaMenu.style.display = "none";
          }
          if (icon) {
            icon.classList.remove("bi-dash");
            icon.classList.add("bi-plus");
          }
        });
      }

      return fetch("http://localhost:3000/subcategory", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json();
        })
        .then((subcategories) => {
          categories.forEach((category) => {
            const li = document.createElement("li");
            li.classList.add("menu-item-has-children", "position-inherit");

            const a = document.createElement("a");
            a.classList.add("drop-down");
            a.href = `#${category.cat_name}`;
            a.textContent = category.cat_name;

            const icon = document.createElement("i");
            icon.classList.add("bi", "bi-plus", "dropdown-icon");

            a.appendChild(icon);
            li.appendChild(a);

            const megaMenuDiv = document.createElement("div");
            megaMenuDiv.classList.add("mega-menu2");
            megaMenuDiv.style.backgroundImage = `url('/img/home1/megamenu2-${category.cat_name.toLowerCase()}-bg.png')`;

            const megaMenuWrap = document.createElement("div");
            megaMenuWrap.classList.add("megamenu-wrap");

            const subCategoryList = document.createElement("ul");
            subCategoryList.classList.add("menu-row");

            const filteredSubcategories = subcategories.filter(
              (sub) => sub.cat_id === Number(category.id)
            );

            filteredSubcategories.forEach((sub) => {
              const subLi = document.createElement("li");
              subLi.classList.add("menu-single-item");

              const subA = document.createElement("a");
              subA.href = "shop-list.html";
              subA.textContent = sub.sub_name;

              subA.addEventListener("click", function () {
                localStorage.setItem("selectedSubcategoryId", sub.id);
                localStorage.setItem("selectedcategoryId", "");
                localStorage.removeItem("searchResultIds");
                localStorage.removeItem("searchTerm");
              });

              subLi.appendChild(subA);
              subCategoryList.appendChild(subLi);
            });

            megaMenuWrap.appendChild(subCategoryList);
            megaMenuDiv.appendChild(megaMenuWrap);
            li.appendChild(megaMenuDiv);
            categoryList.appendChild(li);

            li.addEventListener("click", function () {
              if (megaMenuDiv.style.display === "block") {
                megaMenuDiv.style.display = "none";
                icon.classList.remove("bi-plus");
                icon.classList.add("bi-dash");
              } else {
                closeAllMegaMenus();
                megaMenuDiv.style.display = "block";
                icon.classList.remove("bi-dash");
                icon.classList.add("bi-plus");
              }
            });
          });

          // Pages menu
          const pagesLi = document.createElement("li");
          pagesLi.classList.add("menu-item-has-children");

          const pagesLink = document.createElement("a");
          pagesLink.href = "#";
          pagesLink.classList.add("drop-down");
          pagesLink.textContent = "Info";

          const pagesIcon = document.createElement("i");
          pagesIcon.classList.add("bi", "bi-plus", "dropdown-icon");

          const subMenu = document.createElement("ul");
          subMenu.classList.add("sub-menu");

          const subItems = [
            { href: "about-us.html", text: "About Us" },
            { href: "contact.html", text: "Contact Us" },
            { href: "faq.html", text: "FAQ" },
          ];

          subItems.forEach((item) => {
            const subLi = document.createElement("li");
            const subA = document.createElement("a");
            subA.href = item.href;
            subA.textContent = item.text;
            subLi.appendChild(subA);
            subMenu.appendChild(subLi);
          });

          pagesLink.appendChild(pagesIcon);
          pagesLi.appendChild(pagesLink);
          pagesLi.appendChild(subMenu);
          categoryList.appendChild(pagesLi);

          // Hover events for Pages menu
          pagesLi.addEventListener("mouseenter", function () {
            closeAllMegaMenus();
            pagesLi.classList.add("active");
            subMenu.style.display = "block";
            pagesIcon.classList.remove("bi-plus");
            pagesIcon.classList.add("bi-dash");
          });

          pagesLi.addEventListener("mouseleave", function () {
            pagesLi.classList.remove("active");
            subMenu.style.display = "none";
            pagesIcon.classList.remove("bi-dash");
            pagesIcon.classList.add("bi-plus");
          });
        });
    })
    .catch((error) =>
      console.error("There was a problem with the fetch operation:", error)
    );
});
// header end

// Intercept bootstrap data-api clicks for the product-view modal so the modal
// is opened with our manual options (backdrop: 'static', keyboard: false).
// This uses a capture-phase listener to stop Bootstrap's delegated handler.
document.addEventListener(
  "click",
  function (e) {
    const trigger = e.target.closest(
      '[data-bs-toggle="modal"][data-bs-target="#product-view"]'
    );
    if (trigger) {
      // Prevent Bootstrap's data-api from handling this click
      e.preventDefault();
      e.stopImmediatePropagation();

      // Use data-product-id if present
      const productId =
        trigger.dataset.productId || trigger.getAttribute("data-product-id");
      if (productId) {
        localStorage.setItem("selectedeyeId", productId);
      }

      // Ensure modal DOM exists
      if (!document.getElementById("product-view")) {
        createProductModal();
      }

      // Fetch and display product then show modal with static backdrop and no keyboard close
      try {
        if (productId) fetchAndDisplayProduct(productId);
      } catch (err) {
        // function may not be available yet; swallow silently
        console.error("Error fetching product for modal trigger:", err);
      }

      const modalEl = document.getElementById("product-view");
      if (modalEl) {
        const productModal = new bootstrap.Modal(modalEl, {
          backdrop: "static",
          keyboard: false,
        });
        productModal.show();
      }
    }
  },
  true
);

// popular categories
document.addEventListener("DOMContentLoaded", function () {
  // Fetch categories
  fetch("http://localhost:3000/category", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((categories) => {
      console.log("Categories:", categories); // Log the fetched categories
      const categoryContainer = document.querySelector(
        ".popular-category-section .row.g-4"
      ); // Select the container for categories

      // Clear existing categories if any
      categoryContainer.innerHTML = "";

      // Iterate over each category and create HTML elements
      categories.forEach((category) => {
        const colDiv = document.createElement("div");
        colDiv.classList.add("col-lg-2", "col-md-3", "col-sm-4", "col-6");

        const categoryCard = document.createElement("div");
        categoryCard.classList.add("category-card", "style-2");

        const categoryCardImg = document.createElement("div");
        categoryCardImg.classList.add("category-card-img");
        const anchorImg = document.createElement("a");
        anchorImg.href = "shop-list.html"; // Link to the shop list
        const img = document.createElement("img");
        img.src = category.cat_img; // Assuming you have images named by category ID
        img.alt = category.cat_name; // Set alt text to category name
        anchorImg.appendChild(img);
        categoryCardImg.appendChild(anchorImg);

        const categoryCardContent = document.createElement("div");
        categoryCardContent.classList.add("category-card-content");
        const anchorContent = document.createElement("a");
        anchorContent.href = "shop-list.html"; // Link to the shop list
        anchorContent.textContent = category.cat_name; // Set the text to the category name
        categoryCardContent.appendChild(anchorContent);

        categoryCard.appendChild(categoryCardImg);
        categoryCard.appendChild(categoryCardContent);
        colDiv.appendChild(categoryCard);
        categoryContainer.appendChild(colDiv); // Append the new category card to the container

        categoryCard.addEventListener("click", () => {
          localStorage.setItem("selectedSubcategoryId", ""); // Set to blank
          localStorage.setItem("selectedcategoryId", category.id); // Store category ID
          localStorage.removeItem("searchResultIds");
          localStorage.removeItem("searchTerm");
        });
      });
    })
    .catch((error) =>
      console.error("There was a problem with the fetch operation:", error)
    );
});

document.addEventListener("DOMContentLoaded", async function () {
  // Fetch user ID from local storage
  const userId = localStorage.getItem("user_id");

  // Initialize wishlistProductIds
  let wishlistProductIds = [];
  if (userId) {
    try {
      const wishlistResponse = await fetch(
        `http://localhost:3000/wishlist?userId=${userId}`
      );
      const wishlistData = await wishlistResponse.json();
      console.log("wishlistData", wishlistData);

      // Ensure wishlistData is an object and extract productId array properly
      wishlistProductIds = wishlistData.map((v) => v.productId);
      console.log("wishlistProductIds", wishlistProductIds);
    } catch (wishlistError) {
      console.error("Error fetching wishlist:", wishlistError);
    }
  }
  console.log("wishlistProductIds", wishlistProductIds);

  fetch("http://localhost:3000/product", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("API Response:", data);

      if (!data || !Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        return;
      }

      // Function to get 4 random products from a filtered list
      function getRandomProducts(products) {
        return products.sort(() => 0.5 - Math.random()).slice(0, 4);
      }

      // Filter products by category
      let productsCat5 = getRandomProducts(
        data.filter((product) => product.cat_id === 5)
      );
      let productsCat6 = getRandomProducts(
        data.filter((product) => product.cat_id === 6)
      );

      console.log("Filtered Products (Cat 5):", productsCat5);
      console.log("Filtered Products (Cat 6):", productsCat6);

      const categoryContainer = document.getElementById("categoryContainer");
      if (!categoryContainer) {
        console.error("categoryContainer not found in DOM");
        return;
      }

      categoryContainer.innerHTML = ""; // Clear previous content

      function renderProducts(products) {
        products.forEach((product) => {
          const colDiv = document.createElement("div");
          colDiv.className = "col-lg-3 col-md-6";

          const productCard = document.createElement("div");
          productCard.className = "product-card hover-btn";

          const productCardImg = document.createElement("div");
          productCardImg.className = "product-card-img";

          const anchor = document.createElement("a");
          anchor.href = "product-default.html";

          const img = document.createElement("img");
          img.src =
            product.images && product.images.length > 0
              ? product.images[0]
              : "default.jpg";
          img.alt = product.name;

          const batchDiv = document.createElement("div");
          batchDiv.className = "batch";
          batchDiv.innerHTML = "<span>-15%</span>";

          anchor.appendChild(img);
          anchor.appendChild(batchDiv);
          productCardImg.appendChild(anchor);

          const overlayDiv = document.createElement("div");
          overlayDiv.className = "overlay";

          const cartAreaDiv = document.createElement("div");
          cartAreaDiv.className = "cart-area";
          cartAreaDiv.innerHTML = `<a href="#" class="hover-btn3 add-cart-btn" data-product-id="${product.id}"><i class="bi bi-bag-check"></i> Drop in Basket</a>`; // Use backticks for template literals

          overlayDiv.appendChild(cartAreaDiv);
          productCardImg.appendChild(overlayDiv);

          const viewFavoriteDiv = document.createElement("div");
          viewFavoriteDiv.className = "view-and-favorite-area";

          // Check if the product is in the wishlist
          const flatWishlistIds = wishlistProductIds.flat(); // Assuming wishlistProductIds is defined and contains the IDs
          const isInWishlist = flatWishlistIds.includes(product.id);

          // Update heartSVG based on wishlist status
          const heartSVG = isInWishlist
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="red" stroke-width="2"/>
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <g clip-path="url(#clip0_168_378)">
                    <path d="M16.528 2.20919C16.0674 1.71411 15.5099 1.31906 14.8902 1.04859C14.2704 0.778112 13.6017 0.637996 12.9255 0.636946C12.2487 0.637725 11.5794 0.777639 10.959 1.048C10.3386 1.31835 9.78042 1.71338 9.31911 2.20854L9.00132 2.54436L8.68352 2.20854C6.83326 0.217151 3.71893 0.102789 1.72758 1.95306C1.63932 2.03507 1.5541 2.12029 1.47209 2.20854C-0.490696 4.32565 -0.490696 7.59753 1.47209 9.71463L8.5343 17.1622C8.77862 17.4201 9.18579 17.4312 9.44373 17.1868C9.45217 17.1788 9.46039 17.1706 9.46838 17.1622L16.528 9.71463C18.4907 7.59776 18.4907 4.32606 16.528 2.20919ZM15.5971 8.82879H15.5965L9.00132 15.7849L2.40553 8.82879C0.90608 7.21113 0.90608 4.7114 2.40553 3.09374C3.76722 1.61789 6.06755 1.52535 7.5434 2.88703C7.61505 2.95314 7.68401 3.0221 7.75012 3.09374L8.5343 3.92104C8.79272 4.17781 9.20995 4.17781 9.46838 3.92104L10.2526 3.09438C11.6142 1.61853 13.9146 1.52599 15.3904 2.88767C15.4621 2.95378 15.531 3.02274 15.5971 3.09438C17.1096 4.71461 17.1207 7.2189 15.5971 8.82879Z" />
                </g>
              </svg>`;

          // Updated to include the class for wishlist functionality
          viewFavoriteDiv.innerHTML = `
          <ul>
        <li>
  <a href="#" class="wishlist-btn" data-product-id="${product.id}">
    ${heartSVG}
  </a>
</li>
        <li>
          <a href="#" class="product-view-btn" data-product-id="${product.id}">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z" />
    <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z" />
  </svg>
</a>
        </li>
        </ul>`;

          productCardImg.appendChild(viewFavoriteDiv);
          productCard.appendChild(productCardImg);

          const productCardContent = document.createElement("div");
          productCardContent.className = "product-card-content";
          productCardContent.innerHTML = `
                    <h6><a href="product-default.html" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${
                      product.id
                    }')">${product.name}</a></h6>
                    <p><a href="shop-list.html">${product.brand}</a></p>
                <p class="price">$${product.price.toFixed(2)}</p>
                
                `;

          productCard.appendChild(productCardContent);
          colDiv.appendChild(productCard);
          categoryContainer.appendChild(colDiv); // Append the new category card to the container

          // denisha
          const borderSpan = document.createElement("span");
          borderSpan.className = "for-border";
          productCard.appendChild(borderSpan);
        });
        document.querySelectorAll(".product-view-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            localStorage.setItem("selectedeyeId", productId); // Store the product ID in localStorage
            console.log("Product ID stored:", productId);

            // First create the modal if it doesn't exist
            if (!document.getElementById("product-view")) {
              createProductModal();
            }

            // Then fetch and display product data
            fetchAndDisplayProduct(productId);

            // Finally show the modal (disable backdrop and Esc-close)
            const productModal = new bootstrap.Modal(
              document.getElementById("product-view"),
              { backdrop: "static", keyboard: false }
            );
            productModal.show();
          });
        });
      }

      // Render products for category 5 and 6
      renderProducts(productsCat5);
      renderProducts(productsCat6);
    })
    .catch((error) =>
      console.error("There was a problem with the fetch operation:", error)
    );
});
// end rental products

// new releas

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch product data
    const response = await fetch("http://localhost:3000/product");
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Invalid product data format");
      return;
    }

    // Get the latest 10 products
    const latestProducts = data.slice(-10).reverse();
    const container = document.getElementById("x_new_slidecard");
    container.innerHTML = "";

    // Get user ID from local storage
    const userId = localStorage.getItem("user_id");

    let wishlistProductIds = [];
    if (userId) {
      try {
        const wishlistResponse = await fetch(
          `http://localhost:3000/wishlist?userId=${userId}`
        );
        const wishlistData = await wishlistResponse.json();
        console.log("wishlistData", wishlistData);

        // Ensure wishlistData is an object and extract productId array properly
        wishlistProductIds = wishlistData.map((v) => v.productId);
        console.log("wishlistProductIds", wishlistProductIds);
      } catch (wishlistError) {
        console.error("Error fetching wishlist:", wishlistError);
      }
    }
    console.log("wishlistProductIds", wishlistProductIds);

    latestProducts.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("swiper-slide");

      // Get product images or set default
      const image1 = product.images?.[0] || "/img/default1.jpg";
      const image2 = product.images?.[1] || "/img/default2.jpg";

      // Check if product is in the wishlist
      // const isInWishlist = wishlistProductIds.includes(product.id);
      // const InWishlist = wishlistProductIds.some(id => id === product.id);
      // console.log("InWishlist",InWishlist);

      const flatWishlistIds = wishlistProductIds.flat(); // Debug log

      const isInWishlist = flatWishlistIds.includes(product.id);

      console.log(isInWishlist, "isInWishlist");

      const heartSVG = isInWishlist
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="red" stroke-width="2"/>
    </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
            <g clip-path="url(#clip0_168_378)">
                <path d="M16.528 2.20919C16.0674 1.71411 15.5099 1.31906 14.8902 1.04859C14.2704 0.778112 13.6017 0.637996 12.9255 0.636946C12.2487 0.637725 11.5794 0.777639 10.959 1.048C10.3386 1.31835 9.78042 1.71338 9.31911 2.20854L9.00132 2.54436L8.68352 2.20854C6.83326 0.217151 3.71893 0.102789 1.72758 1.95306C1.63932 2.03507 1.5541 2.12029 1.47209 2.20854C-0.490696 4.32565 -0.490696 7.59753 1.47209 9.71463L8.5343 17.1622C8.77862 17.4201 9.18579 17.4312 9.44373 17.1868C9.45217 17.1788 9.46039 17.1706 9.46838 17.1622L16.528 9.71463C18.4907 7.59776 18.4907 4.32606 16.528 2.20919ZM15.5971 8.82879H15.5965L9.00132 15.7849L2.40553 8.82879C0.90608 7.21113 0.90608 4.7114 2.40553 3.09374C3.76722 1.61789 6.06755 1.52535 7.5434 2.88703C7.61505 2.95314 7.68401 3.0221 7.75012 3.09374L8.5343 3.92104C8.79272 4.17781 9.20995 4.17781 9.46838 3.92104L10.2526 3.09438C11.6142 1.61853 13.9146 1.52599 15.3904 2.88767C15.4621 2.95378 15.531 3.02274 15.5971 3.09438C17.1096 4.71461 17.1207 7.2189 15.5971 8.82879Z" />
            </g>
        </svg>`;

      // Create product card
      card.innerHTML = `
        <div class="product-card hover-btn">
          <div class="product-card-img double-img">
            <a href="product-default.html">
              <img src="${image1}" alt="" class="img1"/>
              <img src="${image2}" alt="" class="img2"/>
            </a>
            <div class="overlay">
              <div class="cart-area">
                <a href="cart.html" class="hover-btn3 add-cart-btn" data-product-id="${product.id}">
                  <i class="bi bi-bag-check"></i> Drop in Basket
                </a>
              </div>
            </div>
            <div class="view-and-favorite-area">
              <ul>
                <li>
                  <a href="wishlist.html" class="wishlist-btn" data-product-id="${product.id}">
                    ${heartSVG}
                  </a>
                </li>
        <li>
          <a href="#" class="product-view-btn" data-product-id="${product.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                            <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z" />
                            <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z" />
                        </svg>
                    </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="product-card-content">
            <h6><a href="product-default.html" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${product.id}')">${product.name}</a></h6>
            <p><a href="shop-list.html">${product.brand}</a></p>
             <p class="price">${product.price}</p>
        
          </div>
          <span class="for-border"></span>
        </div>`;

      container.appendChild(card);
    });
    document.querySelectorAll(".product-view-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-product-id");
        localStorage.setItem("selectedeyeId", productId); // Store the product ID in localStorage
        console.log("Product ID stored:", productId);

        // First create the modal if it doesn't exist
        if (!document.getElementById("product-view")) {
          createProductModal();
        }

        // Then fetch and display product data
        fetchAndDisplayProduct(productId);

        // Finally show the modal (disable backdrop and Esc-close)
        const productModal = new bootstrap.Modal(
          document.getElementById("product-view"),
          { backdrop: "static", keyboard: false }
        );
        productModal.show();
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});

// end new releas

// start releted
const selectedProductId3 = localStorage.getItem("selectedProductId");

// Fetch product details
// fetch(`http://localhost:3000/product/${selectedProductId3}`)
//   .then((response) => response.json())
//   .then((data) => {
//     console.log(data, "product1");

//     // Fetch category name using cat_id
//     fetch(`http://localhost:3000/category/${data.cat_id}`)
//       .then((response) => response.json())
//       .then((categoryData) => {
//         console.log(categoryData, "categoryData");
//         // Fetch products in the same category
//         fetch(`http://localhost:3000/product?cat_id=${data.cat_id}`)
//           .then((response) => response.json())
//           .then((categoryProducts) => {
//             console.log(categoryProducts, "categoryProducts");

//             // Create and append related products section
//             const relatedProductsContainer =
//               document.getElementById("x_pd_card"); // Updated ID
//             // Clear existing products
//             relatedProductsContainer.innerHTML = "";
//             let userId = localStorage.getItem("user_id");
//             let wishlistProductIds = [];

//             if (userId) {
//               try {
//                 const wishlistResponse = await fetch(`http://localhost:3000/wishlist?userId=${userId}`);
//                 const wishlistData = await wishlistResponse.json();

//                 // Get productIds from wishlist where userId matches
//                 const userWishlist = wishlistData.find(item => item.userId === userId);
//                 if (userWishlist && userWishlist.productId) {
//                   wishlistProductIds = userWishlist.productId;
//                 }
//               } catch (error) {
//                 console.error("Error fetching wishlist:", error);
//               }
//             }
//             console.log("wishlistProductIds", wishlistProductIds);
//             // Shuffle the categoryProducts array
//             categoryProducts.sort(() => 0.5 - Math.random());
//             // Select the first 8 products
//             const randomProducts = categoryProducts.slice(0, 8);
//             randomProducts.forEach((product) => {

//               const productItem = document.createElement("div");
//               productItem.className = "swiper-slide";
//               const isInWishlist = wishlistProductIds.includes(product.id.toString());

//               // Create heart SVG based on wishlist status
//               const heartSVG = isInWishlist
//                 ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
//                     <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="red" stroke-width="2"/>
//                   </svg>`
//                 : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
//                     <g clip-path="url(#clip0_168_378)">
//                       <path d="M16.528 2.20919C16.0674 1.71411 15.5099 1.31906 14.8902 1.04859C14.2704 0.778112 13.6017 0.637996 12.9255 0.636946C12.2487 0.637725 11.5794 0.777639 10.959 1.048C10.3386 1.31835 9.78042 1.71338 9.31911 2.20854L9.00132 2.54436L8.68352 2.20854C6.83326 0.217151 3.71893 0.102789 1.72758 1.95306C1.63932 2.03507 1.5541 2.12029 1.47209 2.20854C-0.490696 4.32565 -0.490696 7.59753 1.47209 9.71463L8.5343 17.1622C8.77862 17.4201 9.18579 17.4312 9.44373 17.1868C9.45217 17.1788 9.46039 17.1706 9.46838 17.1622L16.528 9.71463C18.4907 7.59776 18.4907 4.32606 16.528 2.20919ZM15.5971 8.82879H15.5965L9.00132 15.7849L2.40553 8.82879C0.90608 7.21113 0.90608 4.7114 2.40553 3.09374C3.76722 1.61789 6.06755 1.52535 7.5434 2.88703C7.61505 2.95314 7.68401 3.0221 7.75012 3.09374L8.5343 3.92104C8.79272 4.17781 9.20995 4.17781 9.46838 3.92104L10.2526 3.09438C11.6142 1.61853 13.9146 1.52599 15.3904 2.88767C15.4621 2.95378 15.531 3.02274 15.5971 3.09438C17.1096 4.71461 17.1207 7.2189 15.5971 8.82879Z" />
//                     </g>
//                   </svg>`;
//               productItem.innerHTML = `
//                                 <div class="product-card hover-btn">
//                                     <div class="product-card-img">
//                                         <a href="product-default.html?id=${product.id}">
//                                             <img src="${product.images[0]}" alt="">
//                                             <div class="batch">
//                                                 <span>-15%</span>
//                                             </div>
//                                         </a>
//                                         <div class="overlay">
//                                             <div class="cart-area">
//                                                 <a href="cart.html" class="hover-btn3 add-cart-btn" data-product-id="${product.id}"><i class="bi bi-bag-check"></i> Drop In Basket</a>
//                                             </div>
//                                         </div>
//                                         <div class="view-and-favorite-area">
//                                             <ul>
//                                                  <li>
//                   <a href="#" class="wishlist-btn" data-product-id="${product.id}">
//                     ${heartSVG}
//                   </a>
//                 </li>
//                                                 <li>
//                                                      <a href="#" class="product-view-btn" data-bs-toggle="modal" data-bs-target="#product-view" data-product-id="${product.id}">
//     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
//         <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z" />
//         <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z" />
//     </svg>
// </a>
//                                                 </li>
//                                             </ul>
//                                         </div>
//                                     </div>
//                                     <div class="product-card-content">
//                                         <h6><a href="product-default.html?id=${product.id}" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${product.id}')">${product.name}</a></h6>
//                                         <p><a href="shop-list.html">${product.brand}</a></p>
//                                         <p class="price">$${product.price} <del>$200.00</del></p>

//                                     </div>
//                                     <span class="for-border"></span>
//                                 </div>
//                             </div>
//                             `;
//               relatedProductsContainer.appendChild(productItem);
//             });
//             document.querySelectorAll(".product-view-btn").forEach((button) => {
//               button.addEventListener("click", function () {
//                 const productId = this.getAttribute("data-product-id");
//                 localStorage.setItem("selectedeyeId", productId);
//                 console.log("Product ID stored:", productId);

//                 // First create the modal if it doesn't exist
//                 if (!document.getElementById("product-view")) {
//                   createProductModal();
//                 }

//                 // Then fetch and display product data
//                 fetchAndDisplayProduct(productId);

//                 // Finally show the modal
//                 const productModal = new bootstrap.Modal(document.getElementById("product-view"));
//                 productModal.show();
//               });
//             });
//           })

//           .catch((error) => {
//             console.error("Error fetching category products:", error);
//           });
//       })
//       .catch((error) =>
//         console.error("Error fetching product details:", error)
//       );
//   });

// Fetch product details
async function fetchAndDisplayRelatedProducts() {
  try {
    const response = await fetch(
      `http://localhost:3000/product/${selectedProductId3}`
    );
    const data = await response.json();
    console.log(data, "product1");

    // Fetch category name using cat_id
    const categoryResponse = await fetch(
      `http://localhost:3000/category/${data.cat_id}`
    );
    const categoryData = await categoryResponse.json();
    console.log(categoryData, "categoryData");

    // Fetch products in the same category
    const productsResponse = await fetch(
      `http://localhost:3000/product?cat_id=${data.cat_id}`
    );
    const categoryProducts = await productsResponse.json();
    console.log(categoryProducts, "categoryProducts");

    // Create and append related products section
    const relatedProductsContainer = document.getElementById("x_pd_card");
    relatedProductsContainer.innerHTML = "";
    let userId = localStorage.getItem("user_id");
    let wishlistProductIds = [];

    if (userId) {
      try {
        const wishlistResponse = await fetch(
          `http://localhost:3000/wishlist?userId=${userId}`
        );
        const wishlistData = await wishlistResponse.json();

        // Get productIds from wishlist where userId matches
        const userWishlist = wishlistData.find(
          (item) => item.userId === userId
        );
        if (userWishlist && userWishlist.productId) {
          wishlistProductIds = userWishlist.productId;
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }

    console.log("wishlistProductIds", wishlistProductIds);
    // Shuffle the categoryProducts array
    categoryProducts.sort(() => 0.5 - Math.random());
    // Select the first 8 products
    const randomProducts = categoryProducts.slice(0, 8);
    randomProducts.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.className = "swiper-slide";
      const isInWishlist = wishlistProductIds.includes(product.id.toString());

      // Create heart SVG based on wishlist status
      const heartSVG = isInWishlist
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="red" stroke-width="2"/>
          </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
            <g clip-path="url(#clip0_168_378)">
              <path d="M16.528 2.20919C16.0674 1.71411 15.5099 1.31906 14.8902 1.04859C14.2704 0.778112 13.6017 0.637996 12.9255 0.636946C12.2487 0.637725 11.5794 0.777639 10.959 1.048C10.3386 1.31835 9.78042 1.71338 9.31911 2.20854L9.00132 2.54436L8.68352 2.20854C6.83326 0.217151 3.71893 0.102789 1.72758 1.95306C1.63932 2.03507 1.5541 2.12029 1.47209 2.20854C-0.490696 4.32565 -0.490696 7.59753 1.47209 9.71463L8.5343 17.1622C8.77862 17.4201 9.18579 17.4312 9.44373 17.1868C9.45217 17.1788 9.46039 17.1706 9.46838 17.1622L16.528 9.71463C18.4907 7.59776 18.4907 4.32606 16.528 2.20919ZM15.5971 8.82879H15.5965L9.00132 15.7849L2.40553 8.82879C0.90608 7.21113 0.90608 4.7114 2.40553 3.09374C3.76722 1.61789 6.06755 1.52535 7.5434 2.88703C7.61505 2.95314 7.68401 3.0221 7.75012 3.09374L8.5343 3.92104C8.79272 4.17781 9.20995 4.17781 9.46838 3.92104L10.2526 3.09438C11.6142 1.61853 13.9146 1.52599 15.3904 2.88767C15.4621 2.95378 15.531 3.02274 15.5971 3.09438C17.1096 4.71461 17.1207 7.2189 15.5971 8.82879Z" />
            </g>
          </svg>`;

      productItem.innerHTML = `
                                <div class="product-card hover-btn">
                                    <div class="product-card-img">
                                        <a href="product-default.html?id=${product.id}">
                                            <img src="${product.images[0]}" alt="">
                                            <div class="batch">
                                                <span>-15%</span>
                                            </div>
                                        </a>
                                        <div class="overlay">
                                            <div class="cart-area">
                                                <a href="cart.html" class="hover-btn3 add-cart-btn" data-product-id="${product.id}"><i class="bi bi-bag-check"></i> Drop In Basket</a>
                                            </div>
                                        </div>
                                        <div class="view-and-favorite-area">
                                            <ul>
                                                <li>
                            <a href="#" class="wishlist-btn" data-product-id="${product.id}">
                                ${heartSVG}
                                                    </a>
                                                </li>
                                        <li>
                                          <a href="#" class="product-view-btn" data-product-id="${product.id}">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
        <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z" />
        <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z" />
    </svg>
</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="product-card-content">
                                        <h6><a href="product-default.html?id=${product.id}" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${product.id}')">${product.name}</a></h6>
                                        <p><a href="shop-list.html">${product.brand}</a></p>
                <p class="price">$${product.price}</p>
                                    </div>
                                    <span class="for-border"></span>
                            </div>
                            `;
      relatedProductsContainer.appendChild(productItem);
    });

    // Add event listeners to product view buttons
    document.querySelectorAll(".product-view-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-product-id");
        localStorage.setItem("selectedeyeId", productId);
        console.log("Product ID stored:", productId);

        // First create the modal if it doesn't exist
        if (!document.getElementById("product-view")) {
          createProductModal();
        }

        // Then fetch and display product data
        fetchAndDisplayProduct(productId);

        // Finally show the modal (disable backdrop and Esc-close)
        const productModal = new bootstrap.Modal(
          document.getElementById("product-view"),
          { backdrop: "static", keyboard: false }
        );
        productModal.show();
      });
    });
  } catch (error) {
    console.error("Error in fetchAndDisplayRelatedProducts:", error);
  }
}

// Call the async function
fetchAndDisplayRelatedProducts();
// end releted

// start model

document.addEventListener("DOMContentLoaded", () => {
  // Check if 'selectedeyeId' is available in localStorage
  const selectedeyeId = localStorage.getItem("selectedeyeId");
  console.log(selectedeyeId);

  if (selectedeyeId) {
    console.log(selectedeyeId, "selectedeyeId");

    // If valid ID is found, proceed with modal creation and data fetching
    createProductModal();
    fetchAndDisplayProduct(selectedeyeId); // Pass the ID when fetching the product
  } else {
    console.error("No product ID found in localStorage");
  }
});

function createProductModal() {
  // First remove any existing modal and backdrop
  const existingModal = document.getElementById("product-view");
  if (existingModal) {
    existingModal.remove();
  }
  removeBackdrops(); // Remove any existing backdrops

  // Create the main modal container
  const modal = document.createElement("div");
  modal.className = "modal product-view-modal";
  modal.id = "product-view";

  // Your existing modal HTML structure
  modal.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <button type="button" class="close-btn" onclick="handleModalClose()"></button>
          <div class="shop-details-top-section">
            <div class="row gy-4">
              <!-- Left Column - Image Section -->
              <div class="col-lg-6">
                <div class="shop-details-img">
                  <div class="tab-content" id="view-tabContent">
                    <div class="tab-pane fade show active" id="view-pills-img1" role="tabpanel">
                      <div class="shop-details-tab-img">
                        <img src="" alt="" class="main-product-img"/>
                      </div>
                    </div>
                  </div>
                  <div class="nav nav-pills" id="view-tab" role="tablist" aria-orientation="vertical">
                    <!-- Thumbnail buttons will be dynamically added here -->
                  </div>
                </div>
              </div>

              <!-- Right Column - Content Section -->
              <div class="col-lg-6">
                <div class="shop-details-content">
                  <h1 class="product-title"></h1>
                  <div class="rating-review">
                    <div class="rating">
                      <div class="star">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                      </div>
                      <p>(50 customer review)</p>
                    </div>
                  </div>
                  <p class="product-description"></p>
                  <div class="price-area">
                    <p class="price">$<span class="current-price"></span> <del>$<span class="original-price"></span></del></p>
                  </div>
                  
                  
                 <div class="shop-details-btn">
      <a href="shop-list.html" class="primary-btn1 hover-btn3 ">*Shop Now*</a>
    </div>
    <ul style="display: flex;flex-wrap: wrap-;padding: 20px 0px;gap:30px;">
            
              <li>
                <svg width="13" height="11" viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z"></path>
                </svg>
                hair extension
              </li>
            
              <li>
                <svg width="13" height="11" viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z"></path>
                </svg>
                human hair
              </li>
            
          </ul>
                  <div class="product-info">
                    <ul class="product-info-list">
                      <li><span>SKU:</span> <span class="sku-value"></span></li>
                      <li>
                        <span>Brand:</span>
                        <a href="shop-4-columns.html" class="brand-value"></a>
                      </li>
                      <li>
                        <span>Category:</span>
                        <a href="shop-slider.html" class="category-value"></a>
                      </li>
                    </ul>
                  </div>
                  
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
      
      </div>
    </div>
  `;

  // Append modal to body
  document.body.appendChild(modal);

  // Initialize event listeners
  initializeModal();

  // Add event listeners for modal events
  modal.addEventListener("hidden.bs.modal", function () {
    removeBackdrops();
  });
}

// Add these new functions
function removeBackdrops() {
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.remove();
  });
}

function handleModalClose() {
  const modal = document.getElementById("product-view");
  if (modal) {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
    removeBackdrops();
  }
}

// Update initializeModal function
function initializeModal() {
  // Initialize quantity counter
  const quantityMinus = document.querySelector(".quantity__minus");
  const quantityPlus = document.querySelector(".quantity__plus");
  const quantityInput = document.querySelector(".quantity__input");

  quantityMinus.addEventListener("click", () => {
    let value = parseInt(quantityInput.value);
    if (value > 1) {
      value--;
      quantityInput.value = value.toString().padStart(2, "0");
    }
  });

  quantityPlus.addEventListener("click", () => {
    let value = parseInt(quantityInput.value);
    value++;
    quantityInput.value = value.toString().padStart(2, "0");
  });

  // Add modal show event listener
  const productModal = document.getElementById("product-view");
  productModal.addEventListener("show.bs.modal", async () => {
    const selectedeyeId = localStorage.getItem("selectedeyeId");
    if (selectedeyeId) {
      await fetchAndDisplayProduct(selectedeyeId); // Fetch and display the product on modal open
    }
  });

  // Add click event listener for close button
  const closeButton = document.querySelector(".close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      handleModalClose();
    });
  }

  // Do NOT close modal on backdrop click or Escape key.
  // Bootstrap modal is instantiated with { backdrop: 'static', keyboard: false } when shown,
  // so we only wire the explicit close button to close the modal.
  // (Leave global handlers out to avoid accidental closing of modal on outside click/Escape.)
}

// Function to fetch product data and update modal
async function fetchAndDisplayProduct(selectedeyeId) {
  try {
    const response = await fetch("http://localhost:3000/product");
    const products = await response.json();
    const product = products.find(
      (p) => p.id.toString() === selectedeyeId.toString()
    );
    // console.log(product,"product");
    alert("dvxxcdx");

    if (product) {
      // Update modal content
      document.querySelector(".product-title").textContent = product.name;
      document.querySelector(".product-description").textContent =
        product.description;
      document.querySelector(".current-price").textContent =
        product.price.toFixed(2);
      document.querySelector(".original-price").textContent = (
        product.price * 1.2
      ).toFixed(2);
      document.querySelector(".sku-value").textContent = product.sku;
      document.querySelector(".brand-value").textContent = product.brand;
      // document.querySelector(".category-value").textContent = product.category;
      document.querySelector(".main-product-img").src = product.images[0];

      // Set product ID on add-cart-btn
      // fetchAndDisplayProduct function માં add કરો
      const addCartBtn = document.querySelector(".add-cart-btn");
      if (addCartBtn) {
        addCartBtn.onclick = function (e) {
          e.preventDefault();
          console.log("Selected Product ID:", product.id);
          // અહીં તમારી cart functionality add કરી શકો છો
        };
      }

      // Create thumbnails if there are multiple images
      createThumbnails(product.images);
    } else {
      console.error("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}

function createThumbnails(images) {
  const viewTab = document.getElementById("view-tab");
  viewTab.innerHTML = ""; // Clear existing thumbnails

  images.forEach((imgSrc, index) => {
    const button = document.createElement("button");
    button.className = `nav-link ${index === 0 ? "active" : ""}`;
    button.id = `view-pills-img${index + 1}-tab`;
    button.setAttribute("data-bs-toggle", "pill");
    button.setAttribute("data-bs-target", `#view-pills-img${index + 1}`);
    button.setAttribute("type", "button");
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `view-pills-img${index + 1}`);
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = `Product thumbnail ${index + 1}`;
    button.appendChild(img);

    viewTab.appendChild(button);
  });
}

// end model

// suggested for you
document.addEventListener("DOMContentLoaded", function () {
  // API URL
  const apiUrl = "http://localhost:3000/category"; // Replace with your actual API URL

  // Get the parent <ul> element where we will append categories
  const categoryList = document.getElementById("pills-tab");

  // Fetch categories from API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((categories) => {
      // Loop through each category and create the DOM elements
      categories.forEach((category, index) => {
        const isActive = index === 0 ? "active" : ""; // Set first tab as active

        // Create the list item
        const listItem = document.createElement("li");
        listItem.className = "nav-item";
        listItem.setAttribute("role", "presentation");

        // Create the button
        const button = document.createElement("button");
        button.className = `nav-link ${isActive}`;
        button.id = `sg-${category.id}-tab`;
        button.setAttribute("data-bs-toggle", "pill");
        button.setAttribute("data-bs-target", `#sg-${category.id}`);
        button.setAttribute("type", "button");
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", `sg-${category.id}`);
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");
        button.textContent = category.cat_name; // Set category name as button text

        // Add event listener to fetch products for the selected category
        button.addEventListener("click", async function () {
          const products = await fetchProductsByCategory(category.id);
          displayProducts(products);
        });

        // Append button to list item
        listItem.appendChild(button);

        // Append list item to category list
        categoryList.appendChild(listItem);
      });
    })
    .catch((error) => console.error("Error fetching categories:", error));
});

// New function to fetch products by category
async function fetchProductsByCategory(categoryId) {
  console.log(categoryId, "categoryId");

  try {
    const response = await fetch(
      `http://localhost:3000/product?cat_id=${categoryId}`
    );
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// New function to display products
function displayProducts(products) {
  const container = document.getElementById("sg-skin");
  container.innerHTML = createProductGrid(products);
  initializeSwiper();
}

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/product");
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Function to create slider product HTML
function createSliderProduct(product) {
  return `
      <div class="swiper-slide">
        <div class="product-card2 style-2">
          <div class="batch">
            <span>Hot</span>
          </div>
          <div class="product-card-img">
            <a href="shop-list.html">
              <img src="${product.images[3]}" class="d_suggest_img" alt="${
    product.name
  }" />
            </a>
           
          </div>
          <div class="product-card-content product_text">
            <p><a href="shop-list.html">${product.brand}</a></p>
            <h6>
              <a href="product-default.html" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${
                product.id
              }')">${product.name}</a>
            </h6>
            <span>$${product.price.toFixed(2)}</span>
            
          </div>
          <div class="offer-timer">
            <p>Offer Will Be End:</p>
            <div class="countdown-timer">
              <ul data-countdown="2024-12-31 12:00:00">
                <li data-days="00">00</li>
                <li>:</li>
                <li data-hours="00">00</li>
                <li>:</li>
                <li data-minutes="00">00</li>
                <li>:</li>
                <li data-seconds="00">00</li>
              </ul>
            </div>
            <a href="shop-list.html" class="primary-btn3 black-bg hover-btn5 hover-white" onclick="clearLocalStoragedata();">Shop Now</a>
          </div>
        </div>
      </div>
    `;
}

// Function to create product card HTML (your existing function)
function createProductCard(product) {
  return `
      <div class="col-lg-12 col-sm-6">
        <div class="product-card2">  
          <div class="batch">
            <span>NEW</span>
          </div>
          <div class="product-card-img ${
            product.images.length > 1 ? "double-img" : ""
          }">
            <a href="shop-list.html">
              <img src="${product.images[0]}" alt="${product.name}" ${
    product.images.length > 1 ? 'class="img1"' : ""
  } />
              ${
                product.images.length > 1
                  ? `<img src="${product.images[1]}" alt="${product.name}" class="img2" />`
                  : ""
              }
            </a>
            <div class="cart-btn-area">
              <div class="cart-btn">
                <a href="cart.html" class="add-cart-btn2 add-cart-btn round hover-btn5" data-product-id="${
                  product.id
                }">
                  <i class="bi bi-bag-check"></i> Drop in Basket
                </a>
              </div>
            </div>
            
          </div>
          <div class="product-card-content">
            <p><a href="shop-list.html" onclick="localStorage.setItem('selectedProductId', '${
              product.id
            }')">${product.brand}</a></p>
            <h6>
              <a href="product-default.html" class="hover-underline" >${
                product.name
              }</a>
            </h6>
            <span>$${product.price.toFixed(2)}</span>
            
          </div>
        </div>
      </div>
    `;
}

// Function to create the main product grid with slider
function createProductGrid(products) {
  // Separate featured products for slider
  const featuredProducts = products.filter((product) => product.featured);
  const regularProducts = products.filter((product) => !product.featured);

  return `
      <div class="row g-4 align-items-center">
        <div class="col-lg-3">
          <div class="row g-4">
            ${regularProducts
              .slice(0, 2)
              .map((product) => createProductCard(product))
              .join("")}
          </div>
        </div>
        <div class="col-lg-6 position-relative">
          <div class="sg-slider-wrapper">
            <div class="swiper sg-slider">
              <div class="swiper-wrapper">
                ${featuredProducts
                  .map((product) => createSliderProduct(product))
                  .join("")}
                ${regularProducts
                  .slice(2) // Add remaining regular products to the Swiper
                  .map((product) => createSliderProduct(product))
                  .join("")}
              </div>
            </div>
            <div class="sg-slider-btn">
              <div class="sg-prev-btn">
                <i class="bx bxs-chevron-left"></i>
              </div>
              <div class="sg-next-btn">
                <i class="bx bxs-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3">
          <div class="row g-4">
            ${regularProducts
              .slice(4, 6)
              .map((product) => createProductCard(product))
              .join("")}
          </div>
        </div>
      </div>
    `;
}

// Function to initialize swiper
// Function to initialize swiper
// ... existing code ...
function initializeSwiper() {
  // Destroy existing swiper instance if it exists
  const existingSwiper = document.querySelector(".sg-slider")?.swiper;
  if (existingSwiper) {
    existingSwiper.destroy();
  }

  const swiper = new Swiper(".sg-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    navigation: {
      nextEl: ".sg-next-btn",
      prevEl: ".sg-prev-btn",
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    on: {
      slideChange: function () {
        document.querySelectorAll(".swiper-slide").forEach((slide) => {
          slide.classList.remove("active");
        });

        const activeSlide = document.querySelector(".swiper-slide-active");
        if (activeSlide) {
          activeSlide.classList.add("active");
        }
      },
    },
  });

  return swiper;
}

// Make sure to call this function after your DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const swiper = initializeSwiper();

  // You can also manually add event listeners if needed
  document.querySelector(".sg-next-btn").addEventListener("click", function () {
    swiper.slideNext();
  });

  document.querySelector(".sg-prev-btn").addEventListener("click", function () {
    swiper.slidePrev();
  });
});
// Function to update countdown timer
function updateCountdown() {
  const countdownElements = document.querySelectorAll("[data-countdown]");
  countdownElements.forEach((element) => {
    const endDate = new Date(element.getAttribute("data-countdown")).getTime();
    const now = new Date().getTime();
    const timeLeft = endDate - now;

    if (timeLeft > 0) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      element.querySelector("[data-days]").textContent = String(days).padStart(
        2,
        "0"
      );
      element.querySelector("[data-hours]").textContent = String(
        hours
      ).padStart(2, "0");
      element.querySelector("[data-minutes]").textContent = String(
        minutes
      ).padStart(2, "0");
      element.querySelector("[data-seconds]").textContent = String(
        seconds
      ).padStart(2, "0");
    }
  });
}

// Main function to initialize the product section
async function initializeProducts() {
  const products = await fetchProducts();
  const container = document.getElementById("sg-skin");

  if (container && products.length > 0) {
    container.innerHTML = createProductGrid(products);

    // Initialize Swiper
    const swiper = initializeSwiper();

    // Start countdown timer
    setInterval(updateCountdown, 1000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeProducts); // end suggest

// shop product
document.addEventListener("DOMContentLoaded", async function () {
  const productsPerPage = 12; // Number of products to display per page
  let currentPage = 1; // Current page number
  let totalProducts = 0; // Total number of products

  try {
    const response = await fetch("http://localhost:3000/product");
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Invalid data format");
      return;
    }

    totalProducts = data.length; // Get total number of products

    async function renderProducts(products) {
      const container = document.getElementById("productContainer");
      container.innerHTML = ""; // Clear previous content

      // Get wishlist data from localStorage
      let userId = localStorage.getItem("user_id");
      let wishlistProductIds = [];

      // If we have userId, get the wishlist data
      if (userId) {
        try {
          const wishlistResponse = await fetch(
            `http://localhost:3000/wishlist?userId=${userId}`
          );
          const wishlistData = await wishlistResponse.json();

          // Get productIds from wishlist where userId matches
          const userWishlist = wishlistData.find(
            (item) => item.userId === userId
          );
          if (userWishlist && userWishlist.productId) {
            wishlistProductIds = userWishlist.productId;
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
      console.log("wishlistProductIds", wishlistProductIds);

      // Filter products based on category/subcategory/search
      let filteredProducts = products;
      let selectedSubcategoryId = localStorage.getItem("selectedSubcategoryId");
      let selectedcategoryId = localStorage.getItem("selectedcategoryId");
      let searchResultIds = JSON.parse(
        localStorage.getItem("searchResultIds") || "[]"
      );
      let selectedOption = localStorage.getItem("priceSort");

      if (searchResultIds.length > 0) {
        filteredProducts = products.filter((product) =>
          searchResultIds.includes(product.id.toString())
        );
      } else if (selectedcategoryId === "7") {
        filteredProducts = products.filter(
          (product) => product.cat_id === 5 || product.cat_id === 6
        );
      } else if (selectedSubcategoryId) {
        filteredProducts = products.filter(
          (product) => product.sub_cat_id == selectedSubcategoryId
        );
      } else if (selectedcategoryId) {
        filteredProducts = products.filter(
          (product) => product.cat_id == selectedcategoryId
        );
      }

      switch (selectedOption) {
        case "LowToHigh":
          filteredProducts.sort(
            (a, b) => parseFloat(a.price) - parseFloat(b.price)
          );
          break;
        case "HighToLow":
          filteredProducts.sort(
            (a, b) => parseFloat(b.price) - parseFloat(a.price)
          );
          break;
        default:
          // Keep default order
          break;
      }

      // Display products
      filteredProducts.forEach((product) => {
        // Check if product is in wishlist
        const isInWishlist = wishlistProductIds.includes(product.id.toString());

        // Create heart SVG based on wishlist status
        const heartSVG = isInWishlist
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="red" stroke-width="2"/>
        </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
          <g clip-path="url(#clip0_168_378)">
            <path d="M16.528 2.20919C16.0674 1.71411 15.5099 1.31906 14.8902 1.04859C14.2704 0.778112 13.6017 0.637996 12.9255 0.636946C12.2487 0.637725 11.5794 0.777639 10.959 1.048C10.3386 1.31835 9.78042 1.71338 9.31911 2.20854L9.00132 2.54436L8.68352 2.20854C6.83326 0.217151 3.71893 0.102789 1.72758 1.95306C1.63932 2.03507 1.5541 2.12029 1.47209 2.20854C-0.490696 4.32565 -0.490696 7.59753 1.47209 9.71463L8.5343 17.1622C8.77862 17.4201 9.18579 17.4312 9.44373 17.1868C9.45217 17.1788 9.46039 17.1706 9.46838 17.1622L16.528 9.71463C18.4907 7.59776 18.4907 4.32606 16.528 2.20919ZM15.5971 8.82879H15.5965L9.00132 15.7849L2.40553 8.82879C0.90608 7.21113 0.90608 4.7114 2.40553 3.09374C3.76722 1.61789 6.06755 1.52535 7.5434 2.88703C7.61505 2.95314 7.68401 3.0221 7.75012 3.09374L8.5343 3.92104C8.79272 4.17781 9.20995 4.17781 9.46838 3.92104L10.2526 3.09438C11.6142 1.61853 13.9146 1.52599 15.3904 2.88767C15.4621 2.95378 15.531 3.02274 15.5971 3.09438C17.1096 4.71461 17.1207 7.2189 15.5971 8.82879Z" />
          </g>
        </svg>`;

        let productCard = `
            <div class="col-lg-3 col-md-4 col-sm-6 item">
              <div class="product-card style-3 hover-btn">
                <div class="product-card-img">
                  <a href="shop-list.html">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <div class="batch">
                <span>${
                  product.discount ? "-" + product.discount + "%" : "0%"
                }</span>
                    </div>
                  </a>
                  <div class="overlay">
                    <div class="cart-area">
                <a href="cart.html" class="hover-btn3 add-cart-btn" data-product-id="${
                  product.id
                }">
                  <i class="bi bi-bag-check"></i> Drop in Basket
                </a>
                    </div>
                  </div>
                  <div class="view-and-favorite-area">
                    <ul>
                      <li>
                  <a href="#" class="wishlist-btn" data-product-id="${
                    product.id
                  }">
                    ${heartSVG}
                        </a>
                      </li>
               <li>
                 <a href="#" class="product-view-btn" data-product-id="${
                   product.id
                 }">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                      <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z"/>
                      <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z"/>
    </svg>
</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="product-card-content">
                  <h6><a href="product-default.html" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${
                    product.id
                  }')">${product.name}</a></h6>
                  <p><a href="shop-list.html">${product.brand}</a></p>
            <p class="price">$${product.price}</p>
                  <span class="for-border"></span>
                </div>
              </div>
            </div>
          `;
        container.innerHTML += productCard;
      });

      // Add event listeners for product view buttons
      document.querySelectorAll(".product-view-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.getAttribute("data-product-id");
          localStorage.setItem("selectedeyeId", productId);

          if (!document.getElementById("product-view")) {
            createProductModal();
          }

          fetchAndDisplayProduct(productId);

          const productModal = new bootstrap.Modal(
            document.getElementById("product-view"),
            { backdrop: "static", keyboard: false }
          );
          productModal.show();
        });
      });
    }
    // ... existing code ...

    // Function to handle pagination
    function handlePagination(page) {
      const selectedSubcategoryId = localStorage.getItem(
        "selectedSubcategoryId"
      );
      const selectedcategoryId = localStorage.getItem("selectedcategoryId");

      // Get search result IDs from localStorage if available
      const searchResultIds = JSON.parse(
        localStorage.getItem("searchResultIds") || "[]"
      );

      let selectedOption = localStorage.getItem("priceSort");

      // Updated filtering logic for pagination
      let filteredProducts = data;

      if (searchResultIds && searchResultIds.length > 0) {
        // Filter products by the IDs in searchResultIds array
        filteredProducts = data.filter((product) =>
          searchResultIds.includes(product.id.toString())
        );
      } else if (selectedcategoryId === "7") {
        // If selected category ID is 7, filter for categories 5 and 6
        filteredProducts = data.filter(
          (product) => product.cat_id === 5 || product.cat_id === 6
        );
      } else if (selectedSubcategoryId) {
        // Filter by subcategory if available
        filteredProducts = data.filter(
          (product) => product.sub_cat_id == selectedSubcategoryId
        );
      } else if (selectedcategoryId) {
        // If no subcategory selected, filter by category
        filteredProducts = data.filter(
          (product) => product.cat_id == selectedcategoryId
        );
      }
      switch (selectedOption) {
        case "LowToHigh":
          filteredProducts.sort(
            (a, b) => parseFloat(a.price) - parseFloat(b.price)
          );
          break;
        case "HighToLow":
          filteredProducts.sort(
            (a, b) => parseFloat(b.price) - parseFloat(a.price)
          );
          break;
        default:
          // Keep default order
          break;
      }
      const start = (page - 1) * productsPerPage;
      const end = start + productsPerPage;
      const paginatedProducts = filteredProducts.slice(start, end);
      renderProducts(paginatedProducts);
      renderPaginationControls(page, filteredProducts.length); // Pass filtered length
    }

    // Function to render pagination controls
    function renderPaginationControls(currentPage, filteredLength) {
      const paginationContainer = document.querySelector(".pagination-list");
      paginationContainer.innerHTML = ""; // Clear previous pagination

      const totalPages = Math.ceil(filteredLength / productsPerPage);

      // 1) PREVIOUS BUTTON
      if (currentPage > 1) {
        const prevPageItem = document.createElement("li");
        const prevPageLink = document.createElement("a");
        prevPageLink.href = "#";
        prevPageLink.textContent = "Previous";
        prevPageLink.addEventListener("click", (e) => {
          e.preventDefault();
          currentPage--;
          handlePagination(currentPage);
        });
        prevPageItem.appendChild(prevPageLink);
        paginationContainer.appendChild(prevPageItem);
      }

      // 2) PAGE 1
      {
        const pageItem = document.createElement("li");
        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.textContent = 1;
        if (currentPage === 1) {
          pageLink.className = "active";
        }
        pageLink.addEventListener("click", (e) => {
          e.preventDefault();
          currentPage = 1;
          handlePagination(currentPage);
        });
        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
      }

      // 3) Left Ellipsis
      if (currentPage - 1 > 2) {
        const ellipsisItem = document.createElement("li");
        ellipsisItem.textContent = "...";
        paginationContainer.appendChild(ellipsisItem);
      }

      // 4) Middle Pages => (currentPage - 1), currentPage, (currentPage + 1)
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPages) {
          const pageItem = document.createElement("li");
          const pageLink = document.createElement("a");
          pageLink.href = "#";
          pageLink.textContent = i;
          if (i === currentPage) {
            pageLink.className = "active";
          }
          pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            handlePagination(currentPage);
          });
          pageItem.appendChild(pageLink);
          paginationContainer.appendChild(pageItem);
        }
      }

      // 5) Right Ellipsis
      if (currentPage + 1 < totalPages - 1) {
        const ellipsisItem = document.createElement("li");
        ellipsisItem.textContent = "...";
        paginationContainer.appendChild(ellipsisItem);
      }

      // 6) Last Page (totalPages)
      if (totalPages > 1) {
        const pageItem = document.createElement("li");
        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.textContent = totalPages;
        if (currentPage === totalPages) {
          pageLink.className = "active";
        }
        pageLink.addEventListener("click", (e) => {
          e.preventDefault();
          currentPage = totalPages;
          handlePagination(currentPage);
        });
        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
      }

      // 7) NEXT BUTTON
      if (currentPage < totalPages) {
        const nextPageItem = document.createElement("li");
        const nextPageLink = document.createElement("a");
        nextPageLink.href = "#";
        nextPageLink.textContent = "Next";
        nextPageLink.addEventListener("click", (e) => {
          e.preventDefault();
          currentPage++;
          handlePagination(currentPage);
        });
        nextPageItem.appendChild(nextPageLink);
        paginationContainer.appendChild(nextPageItem);
      }
      const startProduct = (currentPage - 1) * productsPerPage + 1;
      const endProduct = Math.min(
        currentPage * productsPerPage,
        filteredLength
      );

      const productCountInfo = document.querySelector(".product-count-info");
      if (productCountInfo) {
        productCountInfo.innerHTML = `Showing ${startProduct}–${endProduct} of ${filteredLength} results`;
      }
    }

    handlePagination(currentPage); // Initial call to render products and pagination
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// end shop product

// start review
document.addEventListener("DOMContentLoaded", async function fetchReviews() {
  try {
    const response = await fetch("http://localhost:3000/review"); // Ensure this is the correct API endpoint
    const data = await response.json();

    console.log("API Response:", data); // Debugging: Check the structure of the response

    const reviewsContainer = document.getElementById("x_testimonial");
    reviewsContainer.innerHTML = ""; // Clear previous content

    // Check if `data` is an array
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Invalid response format or no reviews found:", data);
      reviewsContainer.innerHTML = "<p>No reviews available.</p>";
      return;
    }

    data.forEach((review) => {
      // Use `data` directly since it's an array
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("swiper-slide");

      reviewElement.innerHTML = `
              <div class="say-about-card">
                  <div class="say-about-card-top">
                      <ul>
                          ${'<li><i class="bi bi-star-fill"></i></li>'.repeat(
                            review.rating || 0
                          )}
                      </ul>
                  </div>
                  <p>"${review.review || "No review text available"}"</p>
                  <div class="say-about-card-bottom">
                      <div class="author-area">
                          <div class="author-img">
                              <img src="${
                                review.author?.image || "default-avatar.png"
                              }" 
                                   alt="${
                                     review.author?.name || "Anonymous"
                                   }" />
                          </div>
                          <div class="author">
                              <h5>${review.author?.name || "Anonymous"}</h5>
                              <p>${
                                review.author?.date || "No date available"
                              }</p>
                          </div>
                      </div>
                  </div>
              </div>
          `;

      reviewsContainer.appendChild(reviewElement);
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    document.getElementById("x_testimonial").innerHTML =
      "<p>Error loading reviews. Please try again later.</p>";
  }
});
// end review

// Add event listener for product view button
document.querySelectorAll(".product-view-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const productId = this.getAttribute("data-product-id");
    localStorage.setItem("selectedeyeId", productId); // Store the product ID in local storage
    console.log("Product ID stored:", productId);

    // First create the modal if it doesn't exist
    if (!document.getElementById("product-view")) {
      createProductModal();
    }

    // Then fetch and display product data
    fetchAndDisplayProduct(productId);

    // Finally show the modal (disable backdrop and Esc-close)
    const productModal = new bootstrap.Modal(
      document.getElementById("product-view"),
      { backdrop: "static", keyboard: false }
    );
    productModal.show();
  });
});

// Add event listener for modal show event
document.addEventListener("DOMContentLoaded", () => {
  const productModal = document.getElementById("product-view");
  productModal.addEventListener("show.bs.modal", async () => {
    const selectedeyeId = localStorage.getItem("selectedeyeId");
    if (selectedeyeId) {
      await fetchAndDisplayProduct(selectedeyeId); // Fetch and display the product on modal open
    } else {
      console.error("No product ID found in localStorage");
    }
  });
});

// Function to fetch product data and update modal
async function fetchAndDisplayProduct(selectedeyeId) {
  try {
    const response = await fetch("http://localhost:3000/product");
    const products = await response.json();
    const product = products.find((p) => p.id == selectedeyeId); // Match the product ID

    if (product) {
      // Update modal content with the fetched product data
      document.querySelector(".product-title").textContent = product.name;
      document.querySelector(".product-description").textContent =
        product.description;
      document.querySelector(".current-price").textContent =
        product.price.toFixed(2);
      document.querySelector(".original-price").textContent = (
        product.price * 1.2
      ).toFixed(2);
      document.querySelector(".sku-value").textContent = product.sku;
      document.querySelector(".brand-value").textContent = product.brand;
      document.querySelector(".main-product-img").src = product.images[0];

      // Fetch category name based on cat_id
      fetchCategoryName(product.cat_id);

      // Call to create thumbnails if there are multiple images
      createThumbnails(product.images);
    } else {
      console.error("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}

// Function to fetch category name using cat_id
async function fetchCategoryName(cat_id) {
  try {
    const response = await fetch("http://localhost:3000/category");
    const categories = await response.json();
    const category = categories.find((c) => c.id == cat_id);

    if (category) {
      document.querySelector(".category-value").textContent = category.cat_name;
    } else {
      console.error("Category not found");
    }
  } catch (error) {
    console.error("Error fetching category data:", error);
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("add-cart-btn")) {
    event.preventDefault(); // Prevent default anchor behavior
    const productId = event.target.getAttribute("data-product-id");

    // Fetch product details from localStorage or API
    fetch(`http://localhost:3000/product/${productId}`)
      .then((response) => response.json())
      .then((product) => {
        // Create a unique cart ID
        const cartId = generateUniqueId(); // Generate a unique ID

        // Retrieve existing cart items from localStorage
        let cartProducts =
          JSON.parse(localStorage.getItem("cartProducts")) || [];

        // Check if the product already exists in the cart
        const existingCartItem = cartProducts.find(
          (item) => item.product_id === product.id
        );
        console.log("existingCartItem", existingCartItem);

        if (existingCartItem) {
          // Increase the quantity of the existing product in the cart
          existingCartItem.quantity += 1; // Increase quantity
          console.log("Product quantity increased in the cart."); // Log message for quantity increase

          // Update the cart in the API
          fetch(`http://localhost:3000/cart/${existingCartItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(existingCartItem), // Send the updated cart item
          })
            .then((cartResponse) => {
              if (!cartResponse.ok) {
                throw new Error("Failed to update cart");
              }
              console.log("Cart updated successfully.");
            })
            .catch((error) => console.error("Error updating cart:", error));
        } else {
          // Create a new cart item
          const cartItem = {
            id: cartId, // Add the unique cart ID
            product_id: product.id,
            time: new Date().toISOString(), // Current time in ISO format
            quantity: 1, // Default quantity, can be modified as needed
          };

          // Add product to cart API
          fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cartItem), // Send the cart item data
          })
            .then((cartResponse) => {
              if (!cartResponse.ok) {
                throw new Error("Failed to Drop In Basket");
              }
              console.log("Product added to cart:", product);
            })
            .catch((error) => console.error("Error adding to cart:", error));
          console.log("cartItem", cartItem);

          // Add the new cart item to localStorage
          cartProducts.push(cartItem.id);
          localStorage.setItem("cartProducts", JSON.stringify(cartProducts)); // Store updated array in local storage
        }

        // Update the cart count display
        updateCartCount(); // Call the function to update the cart count
      })
      .catch((error) => console.error("Error fetching product:", error));
  }
});

function updatecartcount() {
  const cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
  const cartCount = cartProducts.length;
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }
}

updatecartcount();

function generateUniqueId() {
  return "cart-" + Math.random().toString(36).substr(2, 9); // Generates a random ID
}

document.addEventListener("click", async (e) => {
  if (e.target.closest(".wishlist-btn")) {
    // Check if the clicked element is a wishlist button
    e.preventDefault(); // Prevent default action

    const productId = e.target
      .closest(".wishlist-btn")
      .getAttribute("data-product-id"); // Get product ID from the button
    const userId = localStorage.getItem("user_id"); // Get user ID from local storage
    console.log(userId, "userId");

    if (userId) {
      // Check if user exists in the API
      try {
        const userResponse = await fetch(
          `http://localhost:3000/users/${userId}`
        ); // Check user existence
        if (!userResponse.ok) {
          throw new Error("User does not exist"); // User does not exist
        }

        const wishlistResponse = await fetch("http://localhost:3000/wishlist");
        const allWishlists = await wishlistResponse.json(); // Fetch all wishlists

        // Filter the wishlists to find the one that matches the userId
        const userWishlist = allWishlists.find(
          (wishlist) => wishlist.userId === userId
        );

        if (userWishlist) {
          // Check if the user's wishlist exists
          const existingWishlist = userWishlist.productId; // Get the product IDs from the user's wishlist

          // Check if the productId already exists in the wishlist
          const productIndex = existingWishlist.indexOf(productId);
          if (productIndex !== -1) {
            // If it exists, remove it from the wishlist
            existingWishlist.splice(productIndex, 1); // Remove the productId from the existingWishlist
            // alert("Product removed from your wishlist!"); // Inform user
          } else {
            // If it doesn't exist, add it to the wishlist
            existingWishlist.push(productId); // Add the new productId to the existingWishlist
            // alert("Product added to your wishlist!"); // Inform user
          }

          const response = await fetch(
            `http://localhost:3000/wishlist/${userWishlist.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId, productId: existingWishlist }), // Send user ID and updated wishlist
            }
          );
          // Print or display the user's wishlist items
          console.log("User's Wishlist Items:", existingWishlist); // Log the items to the console
        } else {
          const response = await fetch("http://localhost:3000/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, productId: [productId] }), // Send user ID and updated wishlist
          });
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again."); // Show error alert
        sessionStorage.removeItem("user_id"); // Remove user ID from session storage
        openLoginModal(); // Open login modal
      }
    } else {
      openLoginModal();
      // No user ID, store product ID in local storage
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || []; // Retrieve existing wishlist or initialize an empty array
      if (!wishlist.includes(productId)) {
        // Check if the product ID is already in the wishlist
        wishlist.push(productId); // Add the product ID to the array
        localStorage.setItem("wishlist", JSON.stringify(wishlist)); // Store updated array in local storage
        alert("Product will be added in wishlist after login or register!");
        // Inform user
      } else {
        alert("Product is already in your wishlist!"); // Inform user if already exists
      }
    }
  }
});
// ... existing code ...
// ... existing code ...

function openLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById("user-login"));
  loginModal.show(); // Show the login/register modal
}
// ... existing code ...

// New function to transfer wishlist from localStorage to the user's wishlist in the database
async function transferWishlistToUser(userId) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || []; // Retrieve existing wishlist from localStorage

  if (wishlist.length > 0) {
    // Check if the user's wishlist exists
    const wishlistResponse = await fetch("http://localhost:3000/wishlist");
    const allWishlists = await wishlistResponse.json();
    const userWishlist = allWishlists.find(
      (wishlist) => wishlist.userId === userId
    );

    if (userWishlist) {
      // Update existing wishlist
      const updatedProductIds = [
        ...new Set([...userWishlist.productId, ...wishlist]),
      ]; // Merge and remove duplicates
      await fetch(`http://localhost:3000/wishlist/${userWishlist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId: updatedProductIds }), // Send updated wishlist
      });
    } else {
      // Create a new wishlist for the user
      await fetch("http://localhost:3000/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId: wishlist }), // Send new wishlist
      });
    }

    // Clear the wishlist from localStorage after transferring
    localStorage.removeItem("wishlist");
  }
}

// wishlist

async function checkUser() {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    // Open login modal if user_id does not exist
    openLoginModal();
  } else {
    // Check user existence via API
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`);
      const data = await response.json();
      console.log(data.exists, "data");

      if (data) {
        // Redirect if user exists
        window.location.href = "whistlist.html"; // Replace with your actual redirect URL
      } else {
        // Open login modal if user does not exist
        openLoginModal();
      }
    } catch (error) {
      console.error("Error checking user:", error);
      // Open login modal on error
      openLoginModal();
    }
  }
}

// Add event listener for wishlist button click
document.querySelectorAll(".save-btn a").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    checkUser(); // Call checkUser function
  });
});

// wishlist page data
// ... existing code ...

// ... existing code ...

async function displayWishlistProducts() {
  const userId = localStorage.getItem("user_id"); // Get user ID from local storage
  if (!userId) {
    console.error("User ID not found in local storage.");
    return;
  }

  try {
    // Fetch wishlist data for the user
    const wishlistResponse = await fetch(
      `http://localhost:3000/wishlist?userId=${userId}`
    );
    const wishlistData = await wishlistResponse.json();

    if (!Array.isArray(wishlistData) || wishlistData.length === 0) {
      console.log("No wishlist data found for this user.");
      return;
    }

    const productIds = wishlistData[0].productId; // Get product IDs from the wishlist
    const productsResponse = await fetch(`http://localhost:3000/product`);
    const allProducts = await productsResponse.json();

    // Filter products based on the IDs in the wishlist
    const wishlistProducts = allProducts.filter((product) =>
      productIds.includes(product.id)
    );

    // Display the products in the desired format
    const container = document.getElementById("wishlist-container"); // Ensure you have a container in your HTML
    container.innerHTML = ""; // Clear existing content

    wishlistProducts.forEach((product) => {
      const productRow = `
              <tr>
                  <td>
                      <div class="delete-icon" data-id="${product.id}">
                          <i class="bi bi-x-lg"></i>
                      </div>
                  </td>
                  <td data-label="Product" class="table-product">
                      <div class="product-img">
                          <img src="${product.images[0]}" alt="${product.name}">
                      </div>
                      <div class="product-content">
                          <h6><a href="product-default.html?id=${
                            product.id
                          }" onclick="localStorage.setItem('selectedProductId', '${
        product.id
      }')">${product.name}</a></h6>
                      </div>
                  </td>
                  <td data-label="Price">
                      <p class="price">
                        -+
                          $${product.price.toFixed(2)}
                      </p>
                  </td>
              
                  <td>
                      <a href="cart.html" class="add-cart-btn hover-btn2" data-product-id="${
                        product.id
                      }"><i class="bi bi-bag-check"></i>Drop in Basket</a>
                  </td>
              </tr>
          `;
      container.insertAdjacentHTML("beforeend", productRow); // Insert the new row into the table
    });
  } catch (error) {
    console.error("Error fetching wishlist products:", error);
  }
}

// Call the function to display wishlist products
document.addEventListener("DOMContentLoaded", displayWishlistProducts);
document.addEventListener("click", async (event) => {
  if (event.target.closest(".delete-icon")) {
    const productRow = event.target.closest("tr"); // Get the closest row
    const productId = event.target
      .closest(".delete-icon")
      .getAttribute("data-id"); // Get product ID directly from data-id attribute
    // Log the product ID

    const userId = localStorage.getItem("user_id"); // Get user ID from local storage

    if (userId) {
      try {
        // Fetch the user's wishlist
        const wishlistResponse = await fetch(
          `http://localhost:3000/wishlist?userId=${userId}`
        );
        const wishlistData = await wishlistResponse.json();

        if (wishlistData.length > 0) {
          const userWishlist = wishlistData[0];

          const updatedProductIds = userWishlist.productId.filter(
            (id) => id !== productId
          ); // Remove the product ID

          // Update the wishlist in the API
          if (updatedProductIds.length > 0) {
            await fetch(`http://localhost:3000/wishlist/${userWishlist.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId, productId: updatedProductIds }), // Send updated wishlist
            });
          } else {
            // If the array is empty, delete the wishlist
            await fetch(`http://localhost:3000/wishlist/${userWishlist.id}`, {
              method: "DELETE",
            });
          }

          // Remove the product row from the DOM
          productRow.remove();
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
      }
    }
  }
});

// ... existing code ...

// ... existing code ...console.log(productId, "productId");`
// redirect shop-list search

async function searchProductByName(productName) {
  try {
    const response = await fetch("http://localhost:3000/product");
    const products = await response.json();

    // If search input is empty, return all products
    if (!productName.trim()) {
      console.log("No search term - showing all products:", products);
      return products;
    }

    // Filter products based on the name if search term exists
    const relatedProducts = products.filter((product) =>
      product.name.toLowerCase().includes(productName.toLowerCase())
    );

    console.log("Related Products:", relatedProducts);
    return relatedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array in case of error
  }
}

// Add event listener to the submit button
document
  .querySelector(".form-inner2 button[type='submit']")
  .addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the input value
    const productName = document.querySelector(
      ".form-inner2 input[type='text']"
    ).value;

    // Get filtered or all products based on search term
    const products = await searchProductByName(productName);

    // Redirect to shop-list.html
    window.location.href = "shop-list.html";

    // Get the container where products will be displayed
    const container = document.getElementById("productContainer");

    // Clear existing products
    container.innerHTML = "";

    // Display products or "no results" message
    if (products.length > 0) {
      products.forEach((product) => {
        // Create product card HTML
        const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 item">
                    <div class="product-card st768pxyle-3 hover-btn">
                        <div class="product-card-img">
                            <a href="shop-list.html">
                                <img src="${product.images[0]}" alt="${
          product.name
        }">
                                <div class="batch">
                                    <span>${
                                      product.discount
                                        ? "-" + product.discount + "%"
                                        : "0%"
                                    }</span>
                                </div>
                            </a>
                            <div class="overlay">
                                <div class="cart-area">
                                    <a href="cart.html" class="hover-btn3 add-cart-btn" data-product-id="${
                                      product.id
                                    }">
                                        <i class="bi bi-bag-check"></i> Drop in Basket
                                    </a>
                                </div>
                            </div>
                            <div class="view-and-favorite-area">
                                <ul>
                                    <li>
                                        <a href="whistlist.html" class="wishlist-btn" data-product-id="${
                                          product.id
                                        }">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13">
                                                <g clip-path="url(#clip0_1106_270)">
                                                    <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735Z"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </li>
                  <li>
                    <a href="#" class="product-view-btn" data-product-id="${
                      product.id
                    }">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                                                <path d="M21.8601 10.5721C21.6636 10.3032 16.9807 3.98901 10.9999 3.98901C5.019 3.98901 0.335925 10.3032 0.139601 10.5718C0.0488852 10.6961 0 10.846 0 10.9999C0 11.1537 0.0488852 11.3036 0.139601 11.4279C0.335925 11.6967 5.019 18.011 10.9999 18.011C16.9807 18.011 21.6636 11.6967 21.8601 11.4281C21.951 11.3039 21.9999 11.154 21.9999 11.0001C21.9999 10.8462 21.951 10.6963 21.8601 10.5721ZM10.9999 16.5604C6.59432 16.5604 2.77866 12.3696 1.64914 10.9995C2.77719 9.62823 6.58487 5.43955 10.9999 5.43955C15.4052 5.43955 19.2206 9.62969 20.3506 11.0005C19.2225 12.3717 15.4149 16.5604 10.9999 16.5604Z"/>
                                                <path d="M10.9999 6.64832C8.60039 6.64832 6.64819 8.60051 6.64819 11C6.64819 13.3994 8.60039 15.3516 10.9999 15.3516C13.3993 15.3516 15.3515 13.3994 15.3515 11C15.3515 8.60051 13.3993 6.64832 10.9999 6.64832ZM10.9999 13.9011C9.40013 13.9011 8.09878 12.5997 8.09878 11C8.09878 9.40029 9.40017 8.0989 10.9999 8.0989C12.5995 8.0989 13.9009 9.40029 13.9009 11C13.9009 12.5997 12.5996 13.9011 10.9999 13.9011Z"/>
                                            </svg>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="product-card-content">
                            <h6>
                                <a href="product-default.html" class="hover-underline" onclick="localStorage.setItem('selectedProductId', '${
                                  product.id
                                }')">${product.name}</a>
                            </h6>
                            <p><a href="shop-list.html">${product.brand}</a></p>
                            <p class="price">$${product.price.toFixed(2)}</p>
                        </div>
                        <span class="for-border"></span>
                    </div>
                </div>
            `;
        container.innerHTML += productCard;
      });
    } else {
      // Display "no results found" message
      container.innerHTML = `
            <div class="col-12 text-center">
                <h3>No products found matching your search.</h3>
            </div>
        `;
    }
  });

// Top-bar
// ... existing code ...
// ... existing code ...
// ... existing code ...

// ... existing code ...
