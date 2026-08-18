const API_URL =
    "http://localhost:5001";


let menuItems = [];

let cart = [];

let selectedCategory = "All";

let tableNumber = null;


// ---------------------------------------
// START APPLICATION
// ---------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        readTableNumber();

        await loadMenu();

        updateCart();

    }
);


// ---------------------------------------
// READ TABLE FROM URL
// ---------------------------------------

function readTableNumber() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    tableNumber =
        params.get("table");


    const tableElement =
        document.getElementById(
            "table-number"
        );


    const customerTable =
        document.getElementById(
            "customer-table"
        );


    if (tableNumber) {

        tableElement.textContent =
            tableNumber;

        customerTable.value =
            tableNumber;

    } else {

        tableElement.textContent =
            "Takeaway";

        customerTable.value =
            "Takeaway";

    }

}


// ---------------------------------------
// LOAD MENU
// ---------------------------------------

async function loadMenu() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/menu`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load menu"
            );

        }


        menuItems =
            await response.json();


        buildCategories();

        displayMenu();

    } catch (error) {

        console.error(error);


        document.getElementById(
            "menu-container"
        ).innerHTML = `

            <p>
                Unable to connect to restaurant server.
            </p>

        `;

    }

}


// ---------------------------------------
// BUILD CATEGORIES
// ---------------------------------------

function buildCategories() {

    const element =
        document.getElementById(
            "categories"
        );


    element.innerHTML = "";


    const categories = [
        "All",
        ...new Set(
            menuItems.map(
                item =>
                    item.category
            )
        )
    ];


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-button";


            if (
                category ===
                selectedCategory
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.textContent =
                category;


            button.onclick =
                () => {

                    selectedCategory =
                        category;

                    buildCategories();

                    displayMenu();

                };


            element.appendChild(
                button
            );

        }
    );

}


// ---------------------------------------
// DISPLAY MENU
// ---------------------------------------

function displayMenu() {

    const element =
        document.getElementById(
            "menu-container"
        );


    element.innerHTML = "";


    let items =
        menuItems;


    if (
        selectedCategory !==
        "All"
    ) {

        items =
            menuItems.filter(
                item =>
                    item.category ===
                    selectedCategory
            );

    }


    items.forEach(
        item => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "food-card";


            const image =
                item.image
                    ? `images/${item.image}`
                    : "images/default-food.jpg";


            card.innerHTML = `

                <img
                    class="food-image"
                    src="${image}"
                    alt="${item.name}"
                    onerror="
                        this.src =
                        'images/default-food.jpg'
                    "
                >

                <div class="food-content">

                    <h3 class="food-name">
                        ${item.name}
                    </h3>

                    <p class="food-description">
                        ${item.description}
                    </p>

                    <div class="food-bottom">

                        <span class="food-price">
                            ₹${Number(
                                item.price
                            ).toFixed(2)}
                        </span>

                        <button
                            class="add-button"
                            onclick="
                                addToCart(
                                    ${item.id}
                                )
                            "
                        >
                            Add
                        </button>

                    </div>

                </div>

            `;


            element.appendChild(
                card
            );

        }
    );

}


// ---------------------------------------
// ADD TO CART
// ---------------------------------------

function addToCart(itemId) {

    const item =
        menuItems.find(
            menuItem =>
                menuItem.id ===
                itemId
        );


    if (!item) {

        return;

    }


    const existing =
        cart.find(
            cartItem =>
                cartItem.id ===
                itemId
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: item.id,

            name: item.name,

            price:
                Number(item.price),

            quantity: 1

        });

    }


    updateCart();

}


// ---------------------------------------
// CHANGE QUANTITY
// ---------------------------------------

function changeQuantity(
    itemId,
    amount
) {

    const item =
        cart.find(
            cartItem =>
                cartItem.id ===
                itemId
        );


    if (!item) {

        return;

    }


    item.quantity += amount;


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                cartItem =>
                    cartItem.id !==
                    itemId
            );

    }


    updateCart();

    renderCart();

}


// ---------------------------------------
// CALCULATE TOTAL
// ---------------------------------------

function calculateTotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return total +
                (
                    item.price *
                    item.quantity
                );

        },
        0
    );

}


// ---------------------------------------
// UPDATE CART BAR
// ---------------------------------------

function updateCart() {

    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );


    const total =
        calculateTotal();


    document.getElementById(
        "cart-count"
    ).textContent =
        `${count} item${count === 1 ? "" : "s"}`;


    document.getElementById(
        "cart-total"
    ).textContent =
        total.toFixed(2);

}


// ---------------------------------------
// OPEN CART
// ---------------------------------------

function openCart() {

    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    renderCart();


    document.getElementById(
        "cart-modal"
    ).classList.remove(
        "hidden"
    );

}


// ---------------------------------------
// CLOSE CART
// ---------------------------------------

function closeCart() {

    document.getElementById(
        "cart-modal"
    ).classList.add(
        "hidden"
    );

}


// ---------------------------------------
// RENDER CART
// ---------------------------------------

function renderCart() {

    const element =
        document.getElementById(
            "cart-items"
        );


    const totalElement =
        document.getElementById(
            "modal-total"
        );


    element.innerHTML = "";


    cart.forEach(
        item => {

            const itemTotal =
                item.price *
                item.quantity;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "cart-row";


            row.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <br>

                    ₹${item.price.toFixed(2)}

                </div>


                <div class="quantity-controls">

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                -1
                            )
                        "
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                1
                            )
                        "
                    >
                        +
                    </button>

                </div>


                <strong>
                    ₹${itemTotal.toFixed(2)}
                </strong>

            `;


            element.appendChild(
                row
            );

        }
    );


    totalElement.textContent =
        calculateTotal().toFixed(2);

}


// ---------------------------------------
// CUSTOMER FORM
// ---------------------------------------

function showCustomerForm() {

    if (
        cart.length === 0
    ) {

        return;

    }


    closeCart();


    document.getElementById(
        "customer-modal"
    ).classList.remove(
        "hidden"
    );

}


// ---------------------------------------
// CLOSE CUSTOMER FORM
// ---------------------------------------

function closeCustomerForm() {

    document.getElementById(
        "customer-modal"
    ).classList.add(
        "hidden"
    );

}


// ---------------------------------------
// PLACE ORDER
// ---------------------------------------

async function placeOrder() {

    const name =
        document.getElementById(
            "customer-name"
        ).value.trim();


    const phone =
        document.getElementById(
            "customer-phone"
        ).value.trim();


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    if (!phone) {

        alert(
            "Please enter your phone number."
        );

        return;

    }


    const orderData = {

        customer_name:
            name,

        phone:
            phone,

        table_number:
            tableNumber ||
            "Takeaway",

        items:
            cart.map(
                item => ({

                    menu_item_id:
                        item.id,

                    quantity:
                        item.quantity

                })
            )

    };


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Order failed"
            );

        }


        closeCustomerForm();


        document.getElementById(
            "order-number"
        ).textContent =
            `#${result.order_id}`;


        document.getElementById(
            "success-total"
        ).textContent =
            Number(
                result.total
            ).toFixed(2);


        document.getElementById(
            "success-modal"
        ).classList.remove(
            "hidden"
        );


        cart = [];

        updateCart();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ---------------------------------------
// CLOSE SUCCESS
// ---------------------------------------

function closeSuccess() {

    document.getElementById(
        "success-modal"
    ).classList.add(
        "hidden"
    );

}