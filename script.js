const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

const categoriesMenu = document.getElementById('categories-menu');
const productsList = document.getElementById('products-list');
const noMoreText = document.getElementById('no-more');
const pagination = document.getElementById('pagination');
const cartOverlay = document.getElementById('cart-overlay');

const limit = 36;
let currentPage = 1;
let allProducts = [];
let currentSlug = 'all';
let searchQuery = '';

function highlightSelected(selectedButton) {
    document.querySelectorAll('.category-btn, .subcategory-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'font-bold', 'text-blue-800');
    });
    selectedButton.classList.add('bg-blue-100', 'font-bold', 'text-blue-800');
}

function formatPrice(price) {
    if (!price && price !== 0) return 'Цена не указана';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' сум';
}

// Корзина
const cart = document.getElementById('cart');
const cartCloseBtn = document.getElementById('cart-close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

let cartItems = {};

cartCloseBtn.addEventListener('click', () => {
    cart.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
});

cartOverlay.addEventListener('click', () => {
    cart.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
});

function updateCart() {
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    const entries = Object.values(cartItems);
    if (entries.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Корзина пуста</p>';
        cartTotal.textContent = '0 сум';
        return;
    }

    entries.forEach(({ product, quantity }) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center mb-3';

        const title = document.createElement('span');
        title.textContent = product.title;
        title.className = 'flex-1 truncate';

        const qty = document.createElement('span');
        qty.textContent = `x${quantity}`;
        qty.className = 'mx-2';

        const price = document.createElement('span');
        price.textContent = formatPrice(Math.floor(product.price) * quantity);
        price.className = 'font-semibold text-blue-600';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'ml-2 text-red-500 hover:text-red-700 font-bold';
        removeBtn.onclick = () => {
            removeFromCart(product.id);
        };

        itemDiv.appendChild(title);
        itemDiv.appendChild(qty);
        itemDiv.appendChild(price);
        itemDiv.appendChild(removeBtn);

        cartItemsContainer.appendChild(itemDiv);

        totalPrice += Math.floor(product.price) * quantity;
    });

    cartTotal.textContent = formatPrice(totalPrice);
}

function addToCart(product) {
    if (cartItems[product.id]) {
        cartItems[product.id].quantity += 1;
    } else {
        cartItems[product.id] = { product, quantity: 1 };
    }
    updateCart();
    cart.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
}

function removeFromCart(productId) {
    if (!cartItems[productId]) return;
    cartItems[productId].quantity -= 1;
    if (cartItems[productId].quantity <= 0) {
        delete cartItems[productId];
    }
    updateCart();
}

const cartOpenBtn = document.getElementById('cart-open');
if (cartOpenBtn) {
    cartOpenBtn.addEventListener('click', () => {
        cart.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
    });
}

function renderProductsPage(page = 1, products = allProducts) {
    window.scroll({ top: 0, behavior: 'smooth' });
    productsList.innerHTML = '';
    noMoreText.classList.add('hidden');

    currentPage = page;

    const start = (page - 1) * limit;
    const end = start + limit;
    const pageProducts = products.slice(start, end);

    if (!pageProducts.length) {
        productsList.innerHTML = '<p class="col-span-full text-gray-500 text-center">Нет книг для отображения</p>';
        noMoreText.classList.remove('hidden');
        pagination.innerHTML = '';
        return;
    }

    pageProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white/90 backdrop-blur rounded-xl shadow-md p-6 flex flex-col hover:shadow-lg transition h-[24rem]';

        if (product.preview) {
            const img = document.createElement('img');
            img.src = product.preview.startsWith('/') ? `https://volshebnik.uz/site${product.preview}` : product.preview;
            img.alt = product.title;
            img.className = 'w-full h-56 object-cover mb-4 rounded-md';
            card.appendChild(img);
        }

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-gray-800 mb-2';
        title.textContent = product.title;
        card.appendChild(title);

        const footer = document.createElement('div');
        footer.className = 'mt-auto flex justify-between items-center';

        const price = document.createElement('span');
        price.className = 'font-bold text-blue-600';
        price.textContent = formatPrice(Math.floor(product.price));

        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition font-medium';
        detailsBtn.textContent = 'Подробнее';

        detailsBtn.onclick = () => {
            const id = product.slug || product.id;
            window.location.href = `detail.html?id=${encodeURIComponent(id)}`;
        };

        footer.appendChild(price);
        footer.appendChild(detailsBtn);
        card.appendChild(footer);
        productsList.appendChild(card);
    });

    renderPagination(products);
}

function renderPagination(products = allProducts) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(products.length / limit);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `px-3 py-1 rounded-md text-sm font-medium transition ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-blue-100'}`;
        pageBtn.addEventListener('click', () => {
            renderProductsPage(i, products);
        });
        pagination.appendChild(pageBtn);
    }
}

function filterProductsBySlug(slug) {
    currentSlug = slug || 'all';
    let filtered = allProducts;

    if (currentSlug !== 'all') {
        filtered = filtered.filter(product => product.subcategory?.slug === currentSlug);
    }

    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    renderProductsPage(1, filtered);
}

function resetToAllBooks() {
    currentSlug = 'all';
    currentPage = 1;
    searchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('.category-btn, .subcategory-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'font-bold', 'text-blue-800');
    });
    const allBtn = document.querySelector('.category-btn:first-child');
    if (allBtn) highlightSelected(allBtn);
    filterProductsBySlug('all');
}

const searchWrapper = document.createElement('div');
searchWrapper.className = 'mb-4';
searchWrapper.innerHTML = `
  <input
    id="search-input"
    type="text"
    placeholder="Поиск по названию..."
    class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
`;
productsList.parentNode.insertBefore(searchWrapper, productsList);

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterProductsBySlug(currentSlug);
});

fetch('https://volshebnik.uz/site/api/products/all/')
    .then(res => res.json())
    .then(data => {
        allProducts = data;
        renderProductsPage(1);
    })
    .catch(() => {
        productsList.innerHTML = '<p class="text-red-500 text-center">Не удалось загрузить книги</p>';
    });

fetch('https://volshebnik.uz/site/api/categories/')
    .then(res => res.json())
    .then(categories => {
        categoriesMenu.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn w-full px-4 py-2 rounded hover:bg-gray-100 transition font-medium';
        allBtn.textContent = 'Все книги';
        allBtn.addEventListener('click', () => {
            resetToAllBooks();
        });
        categoriesMenu.appendChild(allBtn);

        categories.forEach(cat => {
            const categoryDiv = document.createElement('div');

            const categoryButton = document.createElement('button');
            categoryButton.className = 'category-btn w-full flex justify-between items-center px-4 py-2 text-left rounded hover:bg-gray-100 transition font-medium';
            categoryButton.textContent = cat.name;
            categoryButton.dataset.slug = cat.slug;

            const arrow = document.createElement('span');
            arrow.innerHTML = '&#9656;';
            arrow.className = 'ml-2 transition-transform';
            categoryButton.appendChild(arrow);

            const subList = document.createElement('div');
            subList.className = 'mt-1 ml-4 space-y-1 hidden';

            if (cat.subcategories && cat.subcategories.length) {
                cat.subcategories.forEach(sub => {
                    const subLink = document.createElement('button');
                    subLink.className = 'subcategory-btn block w-full text-left px-4 py-1 rounded hover:bg-gray-100 transition';
                    subLink.textContent = sub.name;
                    subLink.dataset.slug = sub.slug;
                    subLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentSlug = sub.slug;
                        currentPage = 1;
                        highlightSelected(subLink);
                        filterProductsBySlug(currentSlug);
                    });
                    subList.appendChild(subLink);
                });
                categoryButton.addEventListener('click', () => {
                    const hidden = subList.classList.contains('hidden');
                    subList.classList.toggle('hidden');
                    arrow.style.transform = hidden ? 'rotate(90deg)' : 'rotate(0deg)';
                });
            } else {
                arrow.remove();
                categoryButton.addEventListener('click', () => {
                    currentSlug = cat.slug;
                    currentPage = 1;
                    highlightSelected(categoryButton);
                    filterProductsBySlug(currentSlug);
                });
            }

            categoryDiv.appendChild(categoryButton);
            if (cat.subcategories && cat.subcategories.length) {
                categoryDiv.appendChild(subList);
            }

            categoriesMenu.appendChild(categoryDiv);
        });

        resetToAllBooks();
    })
    .catch(() => {
        categoriesMenu.innerHTML = '<p class="text-red-500">Не удалось загрузить категории</p>';
    });
