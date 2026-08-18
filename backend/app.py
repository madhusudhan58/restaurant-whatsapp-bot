from flask import Flask, jsonify, render_template, request

from database import get_connection, init_database, seed_menu


app = Flask(__name__)


# --------------------------------------------------
# STARTUP
# --------------------------------------------------

init_database()
seed_menu()


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "project": "Restaurant WhatsApp Ordering Bot",
        "status": "running",
        "version": "1.0.0"
    })


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


# --------------------------------------------------
# RESTAURANT MENU PAGE
# --------------------------------------------------

@app.route("/menu")
def menu_page():
    return render_template("menu.html")


# --------------------------------------------------
# GET ALL MENU ITEMS
# --------------------------------------------------

@app.route("/api/menu", methods=["GET"])
def get_menu():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            name,
            description,
            category,
            price,
            image,
            available
        FROM menu_items
        WHERE available = 1
        ORDER BY category, name
    """)

    items = cursor.fetchall()

    connection.close()

    menu = []

    for item in items:
        menu.append({
            "id": item["id"],
            "name": item["name"],
            "description": item["description"],
            "category": item["category"],
            "price": item["price"],
            "image": item["image"],
            "available": bool(item["available"])
        })

    return jsonify(menu)


# --------------------------------------------------
# GET MENU CATEGORIES
# --------------------------------------------------

@app.route("/api/categories", methods=["GET"])
def get_categories():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT DISTINCT category
        FROM menu_items
        WHERE available = 1
        ORDER BY category
    """)

    categories = cursor.fetchall()

    connection.close()

    return jsonify([
        category["category"]
        for category in categories
    ])


# --------------------------------------------------
# CREATE ORDER
# --------------------------------------------------

@app.route("/api/orders", methods=["POST"])
def create_order():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    customer_name = data.get("customer_name")
    phone = data.get("phone")
    table_number = data.get("table_number")
    items = data.get("items", [])

    if not customer_name:
        return jsonify({
            "error": "Customer name is required"
        }), 400

    if not items:
        return jsonify({
            "error": "Order must contain at least one item"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    total = 0
    order_items = []

    for item in items:

        menu_item_id = item.get("menu_item_id")
        quantity = item.get("quantity", 1)

        if not menu_item_id or quantity <= 0:
            connection.close()

            return jsonify({
                "error": "Invalid order item"
            }), 400

        cursor.execute("""
            SELECT id, name, price
            FROM menu_items
            WHERE id = ?
            AND available = 1
        """, (menu_item_id,))

        menu_item = cursor.fetchone()

        if not menu_item:
            connection.close()

            return jsonify({
                "error": f"Menu item {menu_item_id} not found"
            }), 404

        item_total = menu_item["price"] * quantity

        total += item_total

        order_items.append({
            "menu_item_id": menu_item["id"],
            "quantity": quantity,
            "price": menu_item["price"]
        })

    # Create order

    cursor.execute("""
        INSERT INTO orders
        (
            customer_name,
            phone,
            table_number,
            total,
            status
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        customer_name,
        phone,
        table_number,
        total,
        "pending"
    ))

    order_id = cursor.lastrowid

    # Create order items

    for item in order_items:

        cursor.execute("""
            INSERT INTO order_items
            (
                order_id,
                menu_item_id,
                quantity,
                price
            )
            VALUES (?, ?, ?, ?)
        """, (
            order_id,
            item["menu_item_id"],
            item["quantity"],
            item["price"]
        ))

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "order_id": order_id,
        "customer_name": customer_name,
        "total": total,
        "status": "pending"
    }), 201


# --------------------------------------------------
# GET ORDERS
# --------------------------------------------------

@app.route("/api/orders", methods=["GET"])
def get_orders():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            customer_name,
            phone,
            table_number,
            total,
            status,
            created_at
        FROM orders
        ORDER BY created_at DESC
    """)

    orders = cursor.fetchall()

    connection.close()

    result = []

    for order in orders:

        result.append({
            "id": order["id"],
            "customer_name": order["customer_name"],
            "phone": order["phone"],
            "table_number": order["table_number"],
            "total": order["total"],
            "status": order["status"],
            "created_at": order["created_at"]
        })

    return jsonify(result)


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )