import vkBridge from './node_modules/@vkontakte/vk-bridge';
console.log(typeof vkBridge); // Ожидается "object"

console.log('VKWebAppInit is being called...');
vkBridge.send('VKWebAppInit')
  .then(() => console.log('VKWebAppInit successfully initialized!'))
  .catch((error) => console.error('Error initializing VKWebAppInit:', error));


const cartLink = document.getElementById("cart-link");

cartLink.addEventListener("click", function (event) {
event.preventDefault();

cartLink.classList.add("active");
});

function showPage(clickedLink, pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');

        if (pageId === 'menu') {
            showBreakfastCategory();
        }

        if (pageId !== 'order') {
            cartLink.classList.remove("active");
        }
    }

    const navLinks = document.querySelectorAll('.header-button');
    navLinks.forEach(link => link.classList.remove('active'));

    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    updateCartIcon();

}

function goToMenu() {
    const menuButton = document.querySelector('nav a:nth-child(2)'); // Вторая кнопка "Меню"
    showPage(menuButton, 'menu');
}

document.addEventListener('DOMContentLoaded', () => {
    showPage(document.querySelector('.header-button'), 'home');
});

function showBreakfastCategory() {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => category.classList.remove('active'));

    const breakfastCategory = document.getElementById('breakfast');
    if (breakfastCategory) {
        breakfastCategory.classList.add('active');
    }

    const categoryButtons = document.querySelectorAll('.menu-buttons a');
    categoryButtons.forEach(button => button.classList.remove('active'));

    const breakfastButton = document.querySelector('.menu-buttons a[data-category="breakfast"]');
    if (breakfastButton) {
        breakfastButton.classList.add('active');
    }
}

function showCategory(categoryId) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => category.classList.remove('active'));

    const targetCategory = document.getElementById(categoryId);
    if (targetCategory) {
        targetCategory.classList.add('active');
    }

    const categoryButtons = document.querySelectorAll('.menu-buttons a');
    categoryButtons.forEach(button => button.classList.remove('active'));

    const activeButton = document.querySelector(`.menu-buttons a[data-category="${categoryId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

let totalPrice = 0;
const orderList = document.getElementById('order-list');
const totalPriceElement = document.getElementById('total-price');
const itemsCount = {};

function updateOrderList() {
    orderList.innerHTML = ''; // Очистка списка
    for (const [itemName, data] of Object.entries(itemsCount)) {
        if (data.count > 0) {
            const listItem = document.createElement('li');
            listItem.classList.add('order-item'); // Добавляем класс для стиля
            listItem.innerHTML = `
                <img src="${data.img}" alt="${itemName}">
                <span class="item-name">${itemName}</span>
                <span class="item-quantity">${data.count} шт.</span>
                <span class="item-price">${(data.price * data.count).toFixed(0)} ₽</span>
            `;
            orderList.appendChild(listItem);
        }
    }
}


function addItem(button, itemName, itemPrice, itemImg) {
    const controls = button.parentElement;
    const counter = controls.querySelector('.counter');

    if (!itemsCount[itemName]) {
        itemsCount[itemName] = { count: 0, price: itemPrice, img: itemImg };
    }

    itemsCount[itemName].count++; // Увеличиваем количество блюда

    button.style.display = 'none'; // Скрываем кнопку "Добавить"
    counter.style.display = 'flex'; // Показываем счетчик
    counter.querySelector('span').textContent = itemsCount[itemName].count;

    addToOrder(itemPrice);
    updateOrderList();
}



function incrementItem(button, itemName, itemPrice) {
    itemsCount[itemName].count++; // Увеличиваем количество порций
    const countSpan = button.previousElementSibling;
    countSpan.textContent = itemsCount[itemName].count; // Обновляем отображение количества

    addToOrder(itemPrice);
    updateOrderList();
}


function decrementItem(button, itemName, itemPrice) {
    const countSpan = button.nextElementSibling;
    const controls = button.closest('.controls');
    const addButton = controls.querySelector('.add-btn');
    const counter = controls.querySelector('.counter');

    if (itemsCount[itemName].count > 1) {
        itemsCount[itemName].count--; // Уменьшаем количество
        countSpan.textContent = itemsCount[itemName].count;
        removeFromOrder(itemPrice);
    } else {
        // Если количество = 0, сбрасываем интерфейс
        itemsCount[itemName].count = 0;
        counter.style.display = 'none'; // Скрываем счётчик
        addButton.style.display = 'inline-block'; // Показываем кнопку "Добавить"
        removeFromOrder(itemPrice);
    }

    updateOrderList();
}

function addToOrder(itemPrice) {
    totalPrice += itemPrice; // Добавляем стоимость блюда
    totalPriceElement.textContent = totalPrice.toFixed(0); // Обновляем отображение общей стоимости
    updateCartIcon();
}


function removeFromOrder(itemPrice) {
    totalPrice -= itemPrice; // Уменьшаем общую стоимость
    if (totalPrice < 0) totalPrice = 0; // Защита от отрицательной стоимости
    totalPriceElement.textContent = totalPrice.toFixed(0); // Обновляем отображение общей стоимости
    updateCartIcon();
}


let isCartClicked = false; // Флаг нажатия на корзину

function updateCartIcon() {
    const cartIcon = document.getElementById('cart-icon'); 
    const isCartFilled = totalPrice > 0; // Проверка: корзина заполнена или нет

    // Сбрасываем старые события
    const newCartIcon = cartIcon.cloneNode(true);
    cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);

    // Обновляем состояние иконки по умолчанию
    if (isCartFilled) {
        newCartIcon.src = isCartClicked 
            ? "assets/logos/cart_full_orange.svg" 
            : "assets/logos/cart_full.svg";
    } else {
        newCartIcon.src = isCartClicked 
            ? "assets/logos/cart_empty_orange.svg" 
            : "assets/logos/cart_empty.svg";
    }

    // Обработчик наведения
    newCartIcon.addEventListener("mouseenter", () => {
        if (!isCartClicked) { // Если корзина не нажата
            newCartIcon.src = isCartFilled 
                ? "assets/logos/cart_full_green.svg" 
                : "assets/logos/cart_empty_green.svg";
        }
    });

    // Обработчик ухода мыши
    newCartIcon.addEventListener("mouseleave", () => {
        if (!isCartClicked) { // Если корзина не нажата
            newCartIcon.src = isCartFilled 
                ? "assets/logos/cart_full.svg" 
                : "assets/logos/cart_empty.svg";
        }
    });

    // Обработчик клика
    newCartIcon.addEventListener("click", () => {
        isCartClicked = true; // Зафиксировать состояние "нажата"
        newCartIcon.src = isCartFilled 
            ? "assets/logos/cart_full_orange.svg" 
            : "assets/logos/cart_empty_orange.svg";
    });

    // Событие для сброса состояния при смене страницы
    document.addEventListener("click", (event) => {
        if (!event.target.closest("#cart-icon")) { 
            isCartClicked = false; // Сбрасываем состояние
            newCartIcon.src = isCartFilled 
                ? "assets/logos/cart_full.svg" 
                : "assets/logos/cart_empty.svg";
        }
    });
}

function clearCart() {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = ''; // Очищаем список товаров

    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.textContent = '0'; // Обнуляем сумму

    totalPrice = 0; // Сбрасываем общую стоимость
    for (const key in itemsCount) {
        itemsCount[key] = 0; // Обнуляем счетчик всех товаров
    }

    updateCartIcon(); // Обновляем иконку корзины

    // Возвращаем кнопки "Добавить" для всех товаров в меню
    const allItems = document.querySelectorAll('.controls'); 
    allItems.forEach((controls) => {
        const addButton = controls.querySelector('.add-btn');
        const counter = controls.querySelector('.counter');

        if (addButton && counter) {
            addButton.style.display = 'inline-block'; // Показываем кнопку "Добавить"
            counter.style.display = 'none'; // Скрываем счетчик
            counter.querySelector('span').textContent = '0'; // Сбрасываем значение счётчика
        }
    });
}






