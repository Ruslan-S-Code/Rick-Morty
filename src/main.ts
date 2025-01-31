// ✅ Ждем загрузки DOM перед обращением к элементам
document.addEventListener("DOMContentLoaded", () => {
  loadCharacters(); // Загружаем персонажей при загрузке страницы
  setupEventListeners(); // Настроим обработчики событий
});

// 🧩 **Интерфейс для персонажей**
interface Character {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  origin: { name: string };
}

// const cart = [];

// 🔍 **Функция загрузки персонажей с API**
async function loadCharacters(searchTerm: string = "") {
  try {
    // Отправляем запрос к API
    const response = await fetch(
      "https://rickandmortyapi.com/api/character/?page=1"
    );

    // Проверяем, успешно ли загрузились данные
    if (!response.ok) throw new Error("Ошибка загрузки API");

    // Получаем JSON-данные из ответа API
    const data = await response.json();

    // Извлекаем максимум 50 персонажей из ответа
    let characters: Character[] = data.results.slice(0, 50);

    // Приводим введенный текст поиска к нижнему регистру и убираем лишние пробелы
    searchTerm = searchTerm.toLowerCase().trim();

    // Фильтруем персонажей, проверяя их основные характеристики на соответствие поисковому запросу
    characters = characters.filter(
      (character) =>
        [
          character.name, // Имя персонажа
          character.status, // Статус (жив/мертв/неизвестно)
          character.species, // Вид (человек, инопланетянин и т. д.)
          character.gender, // Пол (мужской/женский)
          character.origin.name, // Родная планета
        ].some((field) => field.toLowerCase().includes(searchTerm)) || // Если хоть одно поле содержит запрос
        character.id.toString().includes(searchTerm) // Либо если введён ID персонажа
    );

    // Сортируем найденных персонажей по имени в алфавитном порядке для удобства
    characters.sort((a, b) => a.name.localeCompare(b.name));

    // Получаем контейнер для карточек персонажей
    const thumbnailsDiv = document.getElementById("thumbnails")!;

    // Очищаем контейнер перед добавлением новых карточек
    thumbnailsDiv.innerHTML = "";

    // Создаём элементы для каждого найденного персонажа и добавляем их в контейнер
    characters.forEach((character: Character) => {
      const img = document.createElement("img"); // Создаем HTML-элемент <img>
      img.src = character.image || "/src/img/placeholder.png"; // Устанавливаем изображение персонажа
      img.classList.add(
        "rounded-md",
        "cursor-pointer",
        "w-32",
        "h-32",
        "border-2",
        "border-transparent",
        "hover:border-green-400",
        "hover:scale-110",
        "transition-transform",
        "duration-200"
      );

      // Добавляем обработчик клика на изображение персонажа
      img.onclick = () => selectCharacter(character);

      // Добавляем изображение в контейнер
      thumbnailsDiv.appendChild(img);
    });
  } catch (error) {
    // Выводим ошибку в консоль, если что-то пошло не так
    console.error("❌ Ошибка загрузки персонажей:", error);
  }
}

// 🏷️ **Функция выбора персонажа**
function selectCharacter(character: Character) {
  const overlayImage = document.getElementById(
    "overlayImage"
  ) as HTMLImageElement;
  const characterName = document.getElementById("characterName") as HTMLElement;
  const selectedCharacterName = document.getElementById(
    "selectedCharacterName"
  ) as HTMLElement;

  // Проверяем, существуют ли все элементы
  if (!characterName || !selectedCharacterName) {
    console.error("❌ Ошибка: Один из элементов не найден");
    return;
  }

  // 📌 Обновляем текст на задней части футболки
  characterName.textContent = character.name;
  characterName.classList.remove("hidden");

  // ✅ Добавляем кастомный шрифт для имени на футболке
  characterName.classList.add(
    "text-2xl",
    "font-bold",
    "text-green-500",
    "font-schwifty"
  );

  // 📌 Обновляем содержимое фиксированного контейнера (имя + информация)
  selectedCharacterName.innerHTML = `
    <p class="text-xl font-bold">${character.name}</p>
    <p class="text-sm"><strong>Status:</strong> ${character.status}</p>
    <p class="text-sm"><strong>Species:</strong> ${character.species}</p>
    <p class="text-sm"><strong>Gender:</strong> ${character.gender}</p>
    <p class="text-sm"><strong>Origin:</strong> ${character.origin.name}</p>
    <p class="text-sm"><strong>ID:</strong> ${character.id}</p>
  `;

  // ✅ Показываем изображение персонажа
  overlayImage.src = character.image || "/src/img/placeholder.png";
  overlayImage.classList.remove("hidden");
}

// 🚀 **Настройка обработчиков событий**
function setupEventListeners() {
  const searchInput = document.querySelector(
    "#search-input input"
  ) as HTMLInputElement;
  searchInput.addEventListener("input", () =>
    loadCharacters(searchInput.value)
  );

  document.getElementById("cart-button")?.addEventListener("click", () => {
    document.getElementById("cart-sidebar")!.style.right = "0";
    document
      .getElementById("cart-overlay")!
      .classList.remove("opacity-0", "invisible");
  });

  document.getElementById("close-cart")?.addEventListener("click", () => {
    document.getElementById("cart-sidebar")!.style.right = "-100%";
    document
      .getElementById("cart-overlay")!
      .classList.add("opacity-0", "invisible");
  });

  document.getElementById("cart-overlay")?.addEventListener("click", () => {
    document.getElementById("cart-sidebar")!.style.right = "-100%";
    document
      .getElementById("cart-overlay")!
      .classList.add("opacity-0", "invisible");
  });

  const sizeButtons = document.querySelectorAll(".size-button");
  const selectedPriceElement = document.getElementById(
    "selected-price"
  ) as HTMLElement;
  let selectedSize: string | null = null;
  let selectedPrice: number = 0;

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sizeButtons.forEach((btn) =>
        btn.classList.remove("bg-green-500", "text-white")
      );
      button.classList.add("bg-green-500", "text-white");

      selectedSize = button.getAttribute("data-size");
      selectedPrice = parseFloat(button.getAttribute("data-price")!);
      selectedPriceElement.textContent = selectedPrice.toFixed(2);
    });
  });

  // ✅ Добавляем обработчик для кнопки "AB IN DEN WARENKORB"
  const addToCartButton = document.getElementById("add-to-cart") as HTMLElement;
  addToCartButton.addEventListener("click", () => {
    if (!selectedSize) {
      alert("Bitte wählen Sie eine Größe!");
      return;
    }

    const selectedCharacterName = document.getElementById(
      "selectedCharacterName"
    ) as HTMLElement;
    const characterName =
      selectedCharacterName.textContent || "Unbekannter Charakter";

    const cartItemsContainer = document.getElementById(
      "cart-items"
    ) as HTMLElement;

    const cartItem = document.createElement("li");

    cartItem.classList.add(
      "flex",
      "justify-between",
      "border-b",
      "py-2",
      "items-center"
    );
    cartItem.innerHTML = `
      <span class="w-3/5">${characterName} (${selectedSize})</span>
      <span class="text-right w-1/5 item-price">${selectedPrice.toFixed(
        2
      )}€</span>
      <button class="remove-item text-red-500 hover:text-red-700 text-xl font-bold ml-4">❌</button>
    `;
    cartItemsContainer.appendChild(cartItem);
    cartItem.querySelector(".remove-item")!.addEventListener("click", () => {
      cartItem.remove();
      updateCartTotal();
    });
    updateCartTotal();

    // ✅ Сброс выбора размера
    selectedSize = null;
    selectedPrice = 0;
    selectedPriceElement.textContent = "0.00";

    // ✅ Убираем выделение с кнопок размеров
    sizeButtons.forEach((btn) =>
      btn.classList.remove("bg-green-500", "text-white")
    );

    // ✅ Скрываем имя персонажа на футболке
    const characterNameElement = document.getElementById(
      "characterName"
    ) as HTMLElement;
    characterNameElement.textContent = "";
    characterNameElement.classList.add("hidden");

    // ✅ Скрываем изображение персонажа
    const overlayImage = document.getElementById(
      "overlayImage"
    ) as HTMLImageElement;
    overlayImage.src = "";
    overlayImage.classList.add("hidden");

    // ✅ Сбрасываем текст в `selectedCharacterName`
    selectedCharacterName.innerHTML = "Wählen Sie einen Charakter!";
  });
}

// 🏷️ **Обновление суммы в корзине**
let discountApplied = false; // Флаг, указывающий, был ли применен купон

function updateCartTotal() {
  const cartItemsContainer = document.getElementById("cart-items")!;
  const cartTotalElement = document.getElementById("cart-total")!;
  const cartCountElement = document.getElementById("cart-count")!;
  const couponMessage = document.getElementById("couponMessage")!;
  const couponError = document.getElementById("couponError")!;
  const cartItems = cartItemsContainer.querySelectorAll("li");

  let total = 0;

  cartItems.forEach((item) => {
    const priceText = item.querySelector(".item-price")?.textContent; // Изменено на 4-й span (где цена)
    console.log(priceText);
    if (priceText) {
      total += parseFloat(priceText.replace("€", "").trim());
    }
  });

  // ✅ Применяем скидку, если активирован купон
  let discount = 0;
  if (discountApplied) {
    discount = total * 0.5; // Скидка 50%
    total -= discount;
  }

  // ✅ Обновляем отображение итоговой суммы
  cartTotalElement.innerHTML = `
    <span>${total.toFixed(2)}€</span>
    ${
      discount > 0
        ? `<span class="text-sm text-green-600">(-50% Rabatt: -${discount.toFixed(
            2
          )}€)</span>`
        : ""
    }
  `;

  // ✅ Обновляем количество товаров в значке корзины
  cartCountElement.textContent = cartItems.length.toString();

  // ✅ Показываем сообщение о примененной скидке
  if (discountApplied) {
    couponMessage.classList.remove("hidden");
    couponError.classList.add("hidden");
  } else {
    couponMessage.classList.add("hidden");
  }
}

document.getElementById("applyCoupon")?.addEventListener("click", () => {
  const couponInput = document.getElementById("couponCode") as HTMLInputElement;
  const couponMessage = document.getElementById("couponMessage")!;
  const couponError = document.getElementById("couponError")!;

  if (couponInput.value.trim().toUpperCase() === "SUPER-SALE") {
    discountApplied = true; // ✅ Активируем скидку
    couponMessage.classList.remove("hidden");
    couponError.classList.add("hidden");
  } else {
    discountApplied = false; // ❌ Купон не сработал
    couponError.classList.remove("hidden");
    couponMessage.classList.add("hidden");
  }

  updateCartTotal(); // Пересчитываем сумму с учетом скидки
});

/* // 🏷️ ** Обновление суммы в корзине со скидкой 20% **
function updateCartTotal() {
  const cartItemsContainer = document.getElementById("cart-items")!;
  const cartTotalElement = document.getElementById("cart-total")!;
  const cartCountElement = document.getElementById("cart-count")!;
  let total = 0;
  let itemCount = 0;

  cartItemsContainer.querySelectorAll("li").forEach((item) => {
    const priceText = item.querySelector("span:nth-child(3)")?.textContent;
    if (priceText) {
      total += parseFloat(priceText.replace("€", ""));
      itemCount++;
    }
  });

  // ✅ Если в корзине 3+ футболки, даём скидку 20%
  let discount = 0;
  if (itemCount >= 3) {
    discount = total * 0.2; // 20% скидка
    total -= discount;
  }

  // ✅ Обновляем отображение итоговой суммы
  cartTotalElement.innerHTML = `
    <span>${total.toFixed(2)}€</span>
    ${
      discount > 0
        ? `<span class="text-sm text-green-600">(-20% Rabatt: -${discount.toFixed(
            2
          )}€)</span>`
        : ""
    }
  `;

  // ✅ Обновляем количество товаров
  cartCountElement.textContent = itemCount.toString();
} */

document.getElementById("checkout-button")?.addEventListener("click", () => {
  // Получаем контейнер корзины
  const cartItems = document.getElementById("cart-items") as HTMLElement;

  // Если корзина пуста – показываем сообщение и выходим
  if (cartItems.children.length === 0) {
    alert(
      "🛒 Ihr Warenkorb ist leer. Bitte fügen Sie Artikel hinzu, bevor Sie den Kauf abschließen!"
    );
    return;
  }

  // Подтверждение покупки
  const confirmPurchase = confirm("💳 Möchten Sie den Kauf bestätigen?");

  if (confirmPurchase) {
    // Очищаем корзину
    cartItems.innerHTML = "";
    document.getElementById("cart-total")!.textContent = "0.00€";
    document.getElementById("cart-count")!.textContent = "0";

    // Показываем сообщение об успешной покупке
    alert(
      "🎉 Vielen Dank für Ihren Einkauf! Ihre Bestellung wurde erfolgreich aufgegeben."
    );

    // (Опционально) Закрываем корзину после покупки
    document.getElementById("cart-sidebar")!.style.right = "-100%";
    document
      .getElementById("cart-overlay")!
      .classList.add("opacity-0", "invisible");

    // Перенаправляем пользователя на страницу подтверждения
    window.location.href = "/success.html";
  }
});

// Меняем цвет футболки

document.addEventListener("DOMContentLoaded", () => {
  // Получаем элементы
  const frontTshirt = document.getElementById(
    "frontTshirt"
  ) as HTMLImageElement;
  const backTshirt = document.getElementById("backTshirt") as HTMLImageElement;
  const toggleButton = document.getElementById(
    "toggleColor"
  ) as HTMLButtonElement;

  if (frontTshirt && backTshirt && toggleButton) {
    toggleButton.addEventListener("click", () => {
      // 🔄 Инвертируем цвет футболок
      frontTshirt.classList.toggle("invert");
      backTshirt.classList.toggle("invert");

      // 🎨 Переключаем цвет кнопки
      toggleButton.classList.toggle("bg-gray-800"); // Чёрный фон
      toggleButton.classList.toggle("bg-white"); // Белый фон
      toggleButton.classList.toggle("text-white"); // Белый текст
      toggleButton.classList.toggle("text-black"); // Чёрный текст
      toggleButton.classList.toggle("border"); // Добавляем границу
      toggleButton.classList.toggle("border-gray-800"); // Чёрная граница
    });
  }
});
