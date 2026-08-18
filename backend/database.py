import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "restaurant.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            available INTEGER DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT,
            table_number TEXT,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
        )
    """)

    connection.commit()
    connection.close()


def seed_menu():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM menu_items")
    count = cursor.fetchone()[0]

    if count > 0:
        connection.close()
        return

    menu_items = [
        (
            "Chicken Biryani",
            "Aromatic basmati rice with spicy chicken and traditional spices",
            "Biryani",
            220,
            "chicken-biryani.jpg",
        ),
        (
            "Mutton Biryani",
            "Traditional mutton biryani cooked with aromatic basmati rice",
            "Biryani",
            280,
            "mutton-biryani.jpg",
        ),
        (
            "Paneer Biryani",
            "Flavorful vegetarian biryani with paneer and basmati rice",
            "Biryani",
            200,
            "paneer-biryani.jpg",
        ),
        (
            "Chicken 65",
            "Crispy spicy fried chicken starter",
            "Starters",
            180,
            "chicken-65.jpg",
        ),
        (
            "Paneer Tikka",
            "Grilled paneer with vegetables and Indian spices",
            "Starters",
            160,
            "paneer-tikka.jpg",
        ),
        (
            "Chicken Curry",
            "Traditional Indian chicken curry",
            "Main Course",
            220,
            "chicken-curry.jpg",
        ),
        (
            "Paneer Butter Masala",
            "Creamy paneer cooked in tomato butter gravy",
            "Main Course",
            190,
            "paneer-butter-masala.jpg",
        ),
        (
            "Butter Naan",
            "Soft Indian bread topped with butter",
            "Main Course",
            45,
            "butter-naan.jpg",
        ),
        (
            "Masala Coke",
            "Chilled soft drink with Indian masala flavor",
            "Drinks",
            60,
            "masala-coke.jpg",
        ),
        (
            "Fresh Lime Soda",
            "Refreshing sweet and salty lime soda",
            "Drinks",
            70,
            "lime-soda.jpg",
        ),
        (
            "Gulab Jamun",
            "Soft sweet dumplings served warm",
            "Desserts",
            90,
            "gulab-jamun.jpg",
        ),
        (
            "Ice Cream",
            "Two scoops of your choice",
            "Desserts",
            100,
            "ice-cream.jpg",
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO menu_items
        (name, description, category, price, image)
        VALUES (?, ?, ?, ?, ?)
        """,
        menu_items,
    )

    connection.commit()
    connection.close()