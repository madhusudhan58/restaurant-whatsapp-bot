let menuItems = [];

let cart = [];

let selectedCategory = "All";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMenu();

    }
);


// ------------------------------------
// LOAD MENU
// ------------------------------------

async function loadMenu() {

    try {

        const response =
            await fetch("/api/menu");

        menuItems =
            await response.json();

        createCategories();

        displayMenu();

    } catch (error) {

        console.error(
            "Failed to load menu:",
            error
        );

    }
}


// ------------------------------------
// CREATE CATEGORIES
// ------------------------------------

function createCategories() {

    const categoriesElement =
        document.getElementById(
            "categories"
        );

    categoriesElement.innerHTML = "";


    const categories = [
        "All",
        ...new Set(
            menuItems.map(
                item => item.category
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

            button.textContent =
                category;

            button.onclick =
                () => {

                    selectedCategory =
                        category;

                    displayMenu();

                };


            categoriesElement.appendChild(
                button
            );

        }
    );
}


// ------------------------------------
// DISPLAY MENU
// ------------------------------------

function displayMenu() {

    const menuElement =
        document.getElementById(
            "menu"
        );

    menuElement.innerHTML = "";


    let filteredItems =
        menuItems;


    if (
        selectedCategory !== "All"
    ) {

        filteredItems =
            menuItems.filter(
                item =>
                    item.category ===
                    selectedCategory
            );

    }


    filteredItems.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "menu-card";


            card.innerHTML = `

                <h3>
                    ${item.name}
                </h3>

                <p class="description">
                    ${item.description}
                </p>

                <div class="price">
                    ₹${item.price.toFixed(2)}
                </div>

                <button
                    class="add-button"
                    onclick="addToCart(${item.id})"
                >
                    Add to Cart
                </button>

            `;


            menuElement.appendChild(
                card
            );

        }
    );
}


// ------------------------------------
// ADD TO CART
// ------------------------------------

function addToCart(itemId) {

    const item =
        menuItems.find(
            menuItem =>
                menuItem.id === itemId
        );


    if (!item) {

        return;

    }


    const existing =
        cart.find(
            cartItem =>
                cartItem.id === itemId
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });

    }


    displayCart();
}


// ------------------------------------
// CHANGE QUANTITY
// ------------------------------------

function changeQuantity(
    itemId,
    change
) {

    const item =
        cart.find(
            cartItem =>
                cartItem.id === itemId
        );


    if (!item) {

        return;

    }


    item.quantity += change;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                cartItem =>
                    cartItem.id !== itemId
            );

    }


    displayCart();
}


// ------------------------------------
// DISPLAY CART
// ------------------------------------

function displayCart() {

    const cartElement =
        document.getElementById(
            "cart"
        );

    const totalElement =
        document.getElementById(
            "total"
        );


    cartElement.innerHTML = "";


    if (cart.length === 0) {

        cartElement.innerHTML =
            "<p>Your cart is empty.</p>";

        totalElement.textContent =
            "0.00";

        return;

    }


    let total = 0;


    cart.forEach(
        item => {

            const itemTotal =
                item.price *
                item.quantity;


            total += itemTotal;


            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "cart-item";


            element.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <br>

                    ₹${item.price.toFixed(2)}

                </div>

                <div
                    class="cart-controls"
                >

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                -1
                            )
                        "
                    >
                        -
                    </button>

                    ${item.quantity}

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

                <div>

                    ₹${itemTotal.toFixed(2)}

                </div>

            `;


            cartElement.appendChild(
                element
            );

        }
    );


    totalElement.textContent =
        total.toFixed(2);
}


// ------------------------------------
// CHECKOUT BUTTON
// ------------------------------------

document.getElementById(
    "checkout-button"
).addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "Please add food to your cart."
            );

            return;

        }


        document.getElementById(
            "customer-section"
        ).style.display =
            "block";


        window.scrollTo({
            top:
                document.body.scrollHeight,
            behavior:
                "smooth"
        });

    }
);


// ------------------------------------
// CONFIRM ORDER
// ------------------------------------

document.getElementById(
    "confirm-button"
).addEventListener(
    "click",
    async () => {

        const customerName =
            document.getElementById(
                "customer-name"
            ).value.trim();


        const phone =
            document.getElementById(
                "customer-phone"
            ).value.trim();


        const tableNumber =
            document.getElementById(
                "table-number"
            ).value.trim();


        if (!customerName) {

            alert(
                "Please enter your name."
            );

            return;

        }


        const order = {

            customer_name:
                customerName,

            phone:
                phone,

            table_number:
                tableNumber,

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
                    "/api/orders",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                order
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


            document.getElementById(
                "order-result"
            ).innerHTML = `

                <div class="success">

                    <h2>
                        ✅ Order Confirmed
                    </h2>

                    <p>
                        Thank you,
                        ${result.customer_name}.
                    </p>

                    <p>
                        Order Number:
                        <strong>
                            #${result.order_id}
                        </strong>
                    </p>

                    <p>
                        Total:
                        <strong>
                            ₹${result.total.toFixed(2)}
                        </strong>
                    </p>

                    <p>
                        Status:
                        ${result.status}
                    </p>

                </div>

            `;


            cart = [];

            displayCart();


            document.getElementById(
                "customer-section"
            ).style.display =
                "none";


        } catch (error) {

            document.getElementById(
                "order-result"
            ).innerHTML = `

                <div class="error">

                    ❌ ${error.message}

                </div>

            `;

        }

    }
);