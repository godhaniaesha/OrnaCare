// start auth

async function populateCategories() {
  try {
    const response = await fetch("http://localhost:3000/category");
    const categories = await response.json();
    console.log(categories, "header-search-cat");

    const categorySelect = document.getElementById("categorySelect");
    // Clear existing options
    categorySelect.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "All Category";
    defaultOption.value = ""; // Set value for the default option
    categorySelect.appendChild(defaultOption);

    // Populate the select with categories
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id; // Assuming category has an id
      option.textContent = category.cat_name; // Assuming category has a cat_name
      categorySelect.appendChild(option);
    });

    // Update the nice-select display
    const niceSelect = document.querySelector('.nice-select');
    niceSelect.querySelector('.current').textContent = defaultOption.textContent; // Set the current display text
    const list = niceSelect.querySelector('.list');
    list.innerHTML = ''; // Clear existing list items
    categories.forEach(category => {
      const listItem = document.createElement('li');
      listItem.className = 'option';
      listItem.setAttribute('data-value', category.cat_name);
      listItem.textContent = category.cat_name;
      list.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// Call the function to populate categories when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", populateCategories);
// ... existing code ...
// Function to populate quick search options dynamically
async function populateQuickSearch() {
  try {
    const response = await fetch("http://localhost:3000/category"); // Fetch categories
    const categories = await response.json();

    const quickSearchList = document.querySelector('.quick-search ul');
    quickSearchList.innerHTML = ''; // Clear existing items

    categories.forEach(category => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<a href="shop-list.html?category=${category.cat_name}" onclick="setCategory('${category.id}')">${category.cat_name}</a>`;
      quickSearchList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching categories for quick search:", error);
  }
}
function setCategory(categoryId) {
  localStorage.setItem("selectedcategoryId", categoryId); // Store the selected category ID
  localStorage.setItem("selectedSubcategoryId", ""); // Clear the selected subcategory ID
  localStorage.removeItem('searchResultIds');
  localStorage.removeItem('searchTerm');
}

// Call the function to populate quick search on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  populateQuickSearch(); // Populate quick search options
  // ... existing code ...
});

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector('.search-input form');  // Changed selector to target the correct form
  const searchInput = searchForm.querySelector('.form-inner2 input');

  searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
      try {
        // Fetch products from API
        const response = await fetch(`http://localhost:3000/product`);
        const products = await response.json();

        // Filter products based on search term
        const filteredProducts = products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Extract product IDs
        const productIds = filteredProducts.map(product => product.id);

        // Store search results and term in localStorage
        localStorage.setItem('searchResultIds', JSON.stringify(productIds));  // Fixed variable name
        localStorage.setItem('searchTerm', searchTerm);

        // Redirect to shop page
        window.location.href = 'shop-list.html';
      } catch (error) {
        console.error("Error searching products:", error);
      }
    }
  });
}); 

const apiUrl = "http://localhost:3000/users";
const currentOTP = "123456"; // Default OTP
const resetEmail = ""; // To store the email for password reset

// Function to register user
async function registerUser() {
  const username = document
    .querySelector("#profile input[placeholder='User Name *']")
    .value.trim();
  const email = document
    .querySelector("#profile input[placeholder='Email Here *']")
    .value.trim();
  const password = document.querySelector("#password2").value.trim();
  const confirmPassword = document.querySelector("#password3").value.trim();

  if (!username || !email || !password || !confirmPassword) {
    alert("All fields are required.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    // Check if the email already exists
    const response = await fetch(apiUrl);
    const users = await response.json();

    if (users.some((user) => user.email === email)) {
      alert("Email already registered.");
      return;
    }

    // New user object
    const newUser = { username, email, password };

    // Send data to API
    const registerResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (registerResponse.ok) {
      const registeredUser = await registerResponse.json();

      // Store user ID in localStorage
      localStorage.setItem("user_id", registeredUser.id);

      // Store email in localStorage for auto-fill on next login
      localStorage.setItem("user_email", email);

      // Log the email registration
      console.log("User registered with email:", email);

      // You can also send this log to your server
      logUserActivity(email, "registration");

      alert("Registration successful!");

      // Transfer wishlist from localStorage to the user's wishlist in the database
      await transferWishlistToUser(registeredUser.id);

      window.location.href = "index.html"; // Redirect to index page
    } else {
      alert("Registration failed. Try again.");
    }
  } catch (error) {
    console.error("Error registering user:", error);
  }
}

// Function to log in user
async function loginUser() {
  const emailField = document.querySelector("#home input[placeholder='User name or Email *']");

  // Auto-fill the email field if available in localStorage
  if (localStorage.getItem("user_email") && emailField.value === "") {
    emailField.value = localStorage.getItem("user_email");
  }

  const usernameOrEmail = emailField.value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!usernameOrEmail || !password) {
    alert("Please enter username/email and password.");
    return;
  }

  try {
    const response = await fetch(apiUrl);
    const users = await response.json();

    const user = users.find(
      (user) =>
        (user.username === usernameOrEmail || user.email === usernameOrEmail) &&
        user.password === password
    );

    if (user) {
      localStorage.setItem("user_id", user.id);

      // Update the stored email in case they logged in with username
      localStorage.setItem("user_email", user.email);

      // Log the login activity with email
      console.log("User logged in with email:", user.email);

      // You can also send this log to your server
      logUserActivity(user.email, "login");

      // alert("Login successful!");

      // Transfer wishlist from localStorage to the user's wishlist in the database
      await transferWishlistToUser(user.id);

      window.location.href = "index.html"; // Redirect after login
    } else {
      alert("Invalid username/email or password.");

      // Log failed login attempt
      console.log("Failed login attempt with:", usernameOrEmail);
      logUserActivity(usernameOrEmail, "failed_login");
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
}

// Function to log user activity
async function logUserActivity(email, action) {
  try {
    const logEntry = {
      email: email,
      action: action,
      timestamp: new Date().toISOString()
    };

    // Send log to server
    await fetch("/api/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}


// Add this function to auto-fill email when the login form loads
function initLoginForm() {
  const emailField = document.querySelector("#home input[placeholder='User name or Email *']");
  if (emailField && localStorage.getItem("user_email")) {
    emailField.value = localStorage.getItem("user_email");
  }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", initLoginForm);

// Event Listeners
document
  .querySelector("#profile .primary-btn1")
  .addEventListener("click", (e) => {
    e.preventDefault();
    registerUser();
  });

document.querySelector("#home .primary-btn1").addEventListener("click", (e) => {
  e.preventDefault();
  loginUser();
});

// Toggle Password Visibility
document.querySelectorAll(".bi-eye-slash").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  });
});
// end auth

document.addEventListener('DOMContentLoaded', function () {
  const topBarSection = document.getElementById('topBarSection');

  // Get the stored search term if it exists
  const storedSearchTerm = localStorage.getItem('searchTerm') || '';

  const topBarHTML = `
        <div class="container">
            <div class="row">
                <div class="col-lg-12 d-flex align-items-center justify-content-between gap-3">
                    <div class="top-bar-left">
                        <p>*New Winter Product 2025 <a href="shop-list.html">Shop Now*</a></p>
                    </div>
                    <div class="company-logo">
                        <a href="index.html"><img src="/img/brand.png" alt=""></a>
                    </div>
                    <div class="search-area">
                        <form id="searchForm">
                            <div class="form-inner">
                                <input type="text" id="searchInput" placeholder="Search..." value="${storedSearchTerm}">
                                <button type="submit"><i class='bx bx-search'></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

  topBarSection.innerHTML = topBarHTML;

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  // Set cursor position to end of input
  if (storedSearchTerm) {
    searchInput.focus();
    searchInput.setSelectionRange(storedSearchTerm.length, storedSearchTerm.length);
  }

  searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === '') {
        console.log('Please enter a search term');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/product');
        const products = await response.json();

        // Create an array to hold category names
        const categoryPromises = products.map(async (product) => {
            // Fetch category name based on cat_id
            const categoryResponse = await fetch(`http://localhost:3000/category/${product.cat_id}`);
            const categoryData = await categoryResponse.json();
            return {
                ...product,
                categoryName: categoryData.cat_name // Assuming categoryData has a 'cat_name' field
            };
        });

        // Wait for all category fetches to complete
        const productsWithCategories = await Promise.all(categoryPromises);

        // Filter products and get their IDs
        const searchResults = productsWithCategories.filter(product => {
            return (
                product.name?.toLowerCase()?.includes(searchTerm) ||
                product.categoryName?.toLowerCase()?.includes(searchTerm) // Use category name for search
            );
        });

        // Extract IDs from search results
        const resultIds = searchResults.map(product => product.id);

        // Store search term and result IDs in localStorage
        localStorage.setItem('searchTerm', searchTerm);
        localStorage.setItem('searchResultIds', JSON.stringify(resultIds));

        // Clear category and subcategory selections
        localStorage.removeItem('selectedCategoryId');
        localStorage.removeItem('selectedSubcategoryId');

        // Log for debugging
        console.log('Search Results IDs:', resultIds);
        console.log(`Found ${resultIds.length} products matching "${searchTerm}"`);
        console.log('Cleared category and subcategory selections');

        // Redirect to shop-list.html
        window.location.href = 'shop-list.html';

    } catch (error) {
        console.error('Error searching products:', error);
    }
});

  // Function to display search results (optional)

});
// password show start
document.getElementById("togglePassword").addEventListener("click", function () {
  const passwordField = document.getElementById("password");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    this.classList.remove("bi-eye-slash");
    this.classList.add("bi-eye");
  } else {
    passwordField.type = "password";
    this.classList.remove("bi-eye");
    this.classList.add("bi-eye-slash");
  }
});
// password show end

// price filter start
document.addEventListener("DOMContentLoaded", function () {
  const niceSelect = document.querySelector(".nice-select");
  const options = document.querySelectorAll(".nice-select .option");
  const current = document.querySelector(".nice-select .current");

  if (!niceSelect || options.length === 0 || !current) {
    console.error("Custom select dropdown not found!");
    return;
  }

  // Load the saved value from localStorage (if available)
  const savedSort = localStorage.getItem("priceSort");
  if (savedSort) {
    // Set the selected value in UI
    options.forEach(option => {
      if (option.getAttribute("data-value") === savedSort) {
        options.forEach(opt => opt.classList.remove("selected")); // Remove existing selection
        option.classList.add("selected"); // Add selected class
        current.textContent = option.textContent; // Update UI
      }
    });
  }

  // Event listener for clicking on options
  options.forEach(option => {
    option.addEventListener("click", function () {
      const selectedValue = this.getAttribute("data-value");

      // Update localStorage
      localStorage.setItem("priceSort", selectedValue);
      location.reload();
      console.log("Sorting Preference Saved:", selectedValue);

      // Update UI
      options.forEach(opt => opt.classList.remove("selected"));
      this.classList.add("selected");
      current.textContent = this.textContent;
    });
  });
});
function clearLocalStoragedata() {
  localStorage.removeItem('selectedcategoryId');
  localStorage.removeItem('selectedSubcategoryId');
  localStorage.removeItem('searchResultIds');
  localStorage.removeItem('searchTerm');
}

async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTerm === '') {
    console.log('Please enter a search term');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/product');
    const products = await response.json();

    // Filter products and get their IDs
    const searchResults = products.filter(product => {
      return (
        (product.name?.toLowerCase()?.includes(searchTerm)) ||
        (product.description?.toLowerCase()?.includes(searchTerm)) ||
        (product.category?.toLowerCase()?.includes(searchTerm))
      );
    });

    // Extract IDs from search results
    const resultIds = searchResults.map(product => product.id);

    // Store search term and result IDs in localStorage
    localStorage.setItem('searchTerm', searchTerm);
    localStorage.setItem('searchResultIds', JSON.stringify(resultIds));

    // Clear category and subcategory selections
    localStorage.removeItem('selectedCategoryId');
    localStorage.removeItem('selectedSubcategoryId');

    // Log for debugging
    console.log('Search Results IDs:', resultIds);
    console.log(`Found ${resultIds.length} products matching "${searchTerm}"`);
    console.log('Cleared category and subcategory selections');

    // Redirect to shop-list.html
    window.location.href = 'shop-list.html';

  } catch (error) {
    console.error('Error searching products:', error);
  }
}
$(document).ready(function () {
  $(".shop-details-tab-img").mousemove(function (event) {
    let $image = $(this).find("img");
    let offset = $(this).offset();
    let x = ((event.pageX - offset.left) / $(this).width()) * 100;
    let y = ((event.pageY - offset.top) / $(this).height()) * 100;

    $image.css({
      "transform": "scale(1.4)",
      "transform-origin": x + "% " + y + "%"
    });
  });

  $(".shop-details-tab-img").mouseleave(function () {
    $(this).find("img").css({
      "transform": "scale(1)",
      "transform-origin": "center center"
    });
  });
});
document.addEventListener('click', function (e) {
  if (e.target.closest('.shop-now-btn')) {
    e.preventDefault();

    const userId = localStorage.getItem('user_id');

    if (!userId) {
      // If no user_id, show login modal
      openLoginModal();
      return;
    }

    // Check if user exists in API
    fetch(`http://localhost:3000/users?id=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(users => {
        if (users.length === 0) {
          // User not found in API
          localStorage.removeItem('user_id'); // Clear invalid user_id
          openLoginModal();
          return;
        }

        // User exists, proceed with shop now functionality
        const shopNowBtn = e.target.closest('.shop-now-btn');
        const productId = shopNowBtn.getAttribute('data-product-id');

        if (productId) {
          localStorage.setItem('shopnow-id', productId);
          window.location.href = 'checkout.html';
        }
      })
      .catch(error => {
        console.error('Error checking user:', error);
        openLoginModal();
      });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const niceSelect = document.querySelector(".nice-select");
  const options = document.querySelectorAll(".nice-select .option");
  const current = document.querySelector(".nice-select .current");

  if (!niceSelect || options.length === 0 || !current) {
    console.error("Custom select dropdown not found!");
    return;
  }

  // Load the saved value from localStorage (if available)
  const savedSort = localStorage.getItem("priceSort");
  if (savedSort) {
    // Set the selected value in UI
    options.forEach(option => {
      if (option.getAttribute("data-value") === savedSort) {
        options.forEach(opt => opt.classList.remove("selected")); // Remove existing selection
        option.classList.add("selected"); // Add selected class
        current.textContent = option.textContent; // Update UI
      }
    });
  }

  // Event listener for clicking on options
  options.forEach(option => {
    option.addEventListener("click", function () {
      const selectedValue = this.getAttribute("data-value");

      // Update localStorage
      localStorage.setItem("priceSort", selectedValue);
      console.log("Sorting Preference Saved:", selectedValue);

      // Update UI
      options.forEach(opt => opt.classList.remove("selected"));
      this.classList.add("selected");
      current.textContent = this.textContent;
    });
  });
});




// logout start
document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("user_id");
  const log_in = document.querySelector(".user-btn");
  const log_out = document.querySelector(".user-btnout");

  if (userId) {
    // Show the logout button and hide the login button
    log_out.style.display = "block";
    log_in.style.display = "none";
  } else {
    // Show the login button and hide the logout button
    log_in.style.display = "block";
    log_out.style.display = "none";
  }

  // Event listener for logout button
  log_out.addEventListener("click", function () {
    localStorage.removeItem("user_id"); // Remove user_id from localStorage
    location.reload(); // Reload the page to update UI
  });
});
// logout end
