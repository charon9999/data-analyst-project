"""
Retail Sales Data Normalization and MySQL Database Loader
Transforms denormalized retail sales data into a normalized relational database
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import sys
import warnings
warnings.filterwarnings('ignore')

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '$2davarkhali',
    'database': 'sales_analysis_db'
}

# ============================================================================
# 1. DATABASE CONNECTION
# ============================================================================

def create_connection(config):
    """Create MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        if connection.is_connected():
            print(f"✓ Connected to MySQL Server version {connection.get_server_info()}")
            return connection
    except Error as e:
        print(f"✗ Error connecting to MySQL: {e}")
        return None

def create_database(connection, db_name):
    """Create database if it doesn't exist"""
    try:
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")
        print(f"✓ Database '{db_name}' created/selected successfully")
        cursor.close()
        return True
    except Error as e:
        print(f"✗ Error creating database: {e}")
        return False

# ============================================================================
# 2. CREATE TABLES
# ============================================================================

def create_tables(connection):
    """Create all 7 normalized tables"""

    tables = {
        'customers': """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id INT PRIMARY KEY,
                gender VARCHAR(10) NOT NULL,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(100),
                state_code VARCHAR(10),
                state VARCHAR(100),
                zip VARCHAR(20),
                country VARCHAR(100),
                continent VARCHAR(50),
                dob DATE NULL,
                INDEX idx_gender (gender),
                INDEX idx_country (country),
                INDEX idx_state (state)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'stores': """
            CREATE TABLE IF NOT EXISTS stores (
                store_id INT PRIMARY KEY,
                country VARCHAR(100) NOT NULL,
                state VARCHAR(100),
                sq_meters INT,
                open_date DATE NULL,
                INDEX idx_country (country)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'product_categories': """
            CREATE TABLE IF NOT EXISTS product_categories (
                category_id INT PRIMARY KEY,
                category_name VARCHAR(100) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'product_subcategories': """
            CREATE TABLE IF NOT EXISTS product_subcategories (
                subcategory_id INT PRIMARY KEY,
                category_id INT NOT NULL,
                subcategory_name VARCHAR(100) NOT NULL,
                FOREIGN KEY (category_id) REFERENCES product_categories(category_id),
                INDEX idx_category (category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'products': """
            CREATE TABLE IF NOT EXISTS products (
                product_id INT PRIMARY KEY,
                subcategory_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(100),
                color VARCHAR(50),
                cost DECIMAL(10, 2) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (subcategory_id) REFERENCES product_subcategories(subcategory_id),
                INDEX idx_subcategory (subcategory_id),
                INDEX idx_brand (brand),
                INDEX idx_price (price)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'orders': """
            CREATE TABLE IF NOT EXISTS orders (
                order_number INT PRIMARY KEY,
                customer_id INT NOT NULL,
                store_id INT NOT NULL,
                order_date DATE NOT NULL,
                delivery_date DATE NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
                FOREIGN KEY (store_id) REFERENCES stores(store_id),
                INDEX idx_customer (customer_id),
                INDEX idx_store (store_id),
                INDEX idx_order_date (order_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,

        'order_line_items': """
            CREATE TABLE IF NOT EXISTS order_line_items (
                transaction_id INT PRIMARY KEY,
                order_number INT NOT NULL,
                line_item INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                FOREIGN KEY (order_number) REFERENCES orders(order_number),
                FOREIGN KEY (product_id) REFERENCES products(product_id),
                UNIQUE KEY unique_order_line (order_number, line_item),
                INDEX idx_order (order_number),
                INDEX idx_product (product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """
    }

    cursor = connection.cursor()

    try:
        for table_name, create_statement in tables.items():
            cursor.execute(create_statement)
            print(f"✓ Table '{table_name}' created successfully")

        connection.commit()
        print("\n✓ All tables created successfully!")
        return True

    except Error as e:
        print(f"✗ Error creating tables: {e}")
        return False
    finally:
        cursor.close()

# ============================================================================
# 3. DATA TRANSFORMATION & NORMALIZATION
# ============================================================================

def load_and_transform_data(file_path):
    """Load data from Excel and transform for normalization"""

    print("\n" + "="*80)
    print("LOADING AND TRANSFORMING DATA")
    print("="*80)

    df = pd.read_excel(file_path)
    print(f"✓ Loaded {len(df)} rows from Excel file")

    # Convert date columns
    df['OrderDate'] = pd.to_datetime(df['OrderDate'], errors='coerce')
    df['DeliveryDate'] = pd.to_datetime(df['DeliveryDate'], errors='coerce')
    df['CustomerDOB'] = pd.to_datetime(df['CustomerDOB'], errors='coerce')
    df['StoreOpenDate'] = pd.to_datetime(df['StoreOpenDate'], errors='coerce')

    return df

def extract_customers(df):
    """Extract unique customers"""
    cols = ['CustomerID', 'CustomerGender', 'CustomerName', 'CustomerCity',
            'CustomerStateCode', 'CustomerState', 'CustomerZip',
            'CustomerCountry', 'CustomerContinent', 'CustomerDOB']
    customers = df[cols].drop_duplicates(subset=['CustomerID'])
    customers.columns = ['customer_id', 'gender', 'name', 'city', 'state_code',
                         'state', 'zip', 'country', 'continent', 'dob']
    print(f"✓ Extracted {len(customers)} unique customers")
    return customers

def extract_stores(df):
    """Extract unique stores"""
    cols = ['StoreID', 'StoreCountry', 'StoreState', 'StoreSqMeters', 'StoreOpenDate']
    stores = df[cols].drop_duplicates(subset=['StoreID'])
    stores.columns = ['store_id', 'country', 'state', 'sq_meters', 'open_date']
    print(f"✓ Extracted {len(stores)} unique stores")
    return stores

def extract_product_categories(df):
    """Extract unique product categories"""
    cats = df[['ProductCategoryID', 'ProductCategory']].drop_duplicates()
    cats.columns = ['category_id', 'category_name']
    print(f"✓ Extracted {len(cats)} unique product categories")
    return cats

def extract_product_subcategories(df):
    """Extract unique product subcategories"""
    subcats = df[['ProductSubcategoryID', 'ProductCategoryID', 'ProductSubcategory']].drop_duplicates(subset=['ProductSubcategoryID'])
    subcats.columns = ['subcategory_id', 'category_id', 'subcategory_name']
    print(f"✓ Extracted {len(subcats)} unique product subcategories")
    return subcats

def extract_products(df):
    """Extract unique products"""
    cols = ['ProductID', 'ProductSubcategoryID', 'ProductName', 'ProductBrand',
            'ProductColor', 'ProductCost', 'ProductPrice']
    products = df[cols].drop_duplicates(subset=['ProductID'])
    products.columns = ['product_id', 'subcategory_id', 'name', 'brand', 'color', 'cost', 'price']
    print(f"✓ Extracted {len(products)} unique products")
    return products

def extract_orders(df):
    """Extract unique orders"""
    cols = ['OrderNumber', 'CustomerID', 'StoreID', 'OrderDate', 'DeliveryDate']
    orders = df[cols].drop_duplicates(subset=['OrderNumber'])
    orders.columns = ['order_number', 'customer_id', 'store_id', 'order_date', 'delivery_date']
    print(f"✓ Extracted {len(orders)} unique orders")
    return orders

def extract_order_line_items(df):
    """Extract all line items"""
    cols = ['TransactionID', 'OrderNumber', 'LineItem', 'ProductID', 'Quantity']
    items = df[cols].copy()
    items.columns = ['transaction_id', 'order_number', 'line_item', 'product_id', 'quantity']
    print(f"✓ Extracted {len(items)} order line items")
    return items

# ============================================================================
# 4. INSERT DATA INTO DATABASE
# ============================================================================

def insert_customers(connection, customers):
    """Insert customers into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO customers
        (customer_id, gender, name, city, state_code, state, zip, country, continent, dob)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    data = []
    for _, row in customers.iterrows():
        data.append([
            int(row['customer_id']),
            row['gender'],
            row['name'],
            row['city'] if pd.notna(row['city']) else None,
            row['state_code'] if pd.notna(row['state_code']) else None,
            row['state'] if pd.notna(row['state']) else None,
            str(row['zip']).strip() if pd.notna(row['zip']) else None,
            row['country'] if pd.notna(row['country']) else None,
            row['continent'] if pd.notna(row['continent']) else None,
            row['dob'].date() if pd.notna(row['dob']) else None
        ])

    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} customers")
    cursor.close()

def insert_stores(connection, stores):
    """Insert stores into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO stores (store_id, country, state, sq_meters, open_date)
        VALUES (%s, %s, %s, %s, %s)
    """

    data = []
    for _, row in stores.iterrows():
        data.append([
            int(row['store_id']),
            row['country'],
            row['state'] if pd.notna(row['state']) else None,
            int(row['sq_meters']) if pd.notna(row['sq_meters']) else None,
            row['open_date'].date() if pd.notna(row['open_date']) else None
        ])

    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} stores")
    cursor.close()

def insert_product_categories(connection, categories):
    """Insert product categories into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO product_categories (category_id, category_name)
        VALUES (%s, %s)
    """

    data = categories.values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} product categories")
    cursor.close()

def insert_product_subcategories(connection, subcategories):
    """Insert product subcategories into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO product_subcategories (subcategory_id, category_id, subcategory_name)
        VALUES (%s, %s, %s)
    """

    data = subcategories.values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} product subcategories")
    cursor.close()

def insert_products(connection, products):
    """Insert products into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO products
        (product_id, subcategory_id, name, brand, color, cost, price)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    data = []
    for _, row in products.iterrows():
        data.append([
            int(row['product_id']),
            int(row['subcategory_id']),
            row['name'],
            row['brand'] if pd.notna(row['brand']) else None,
            row['color'] if pd.notna(row['color']) else None,
            float(row['cost']),
            float(row['price'])
        ])

    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} products")
    cursor.close()

def insert_orders(connection, orders):
    """Insert orders into database"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO orders
        (order_number, customer_id, store_id, order_date, delivery_date)
        VALUES (%s, %s, %s, %s, %s)
    """

    data = []
    for _, row in orders.iterrows():
        data.append([
            int(row['order_number']),
            int(row['customer_id']),
            int(row['store_id']),
            row['order_date'].date() if pd.notna(row['order_date']) else None,
            row['delivery_date'].date() if pd.notna(row['delivery_date']) else None
        ])

    cursor.executemany(query, data)
    connection.commit()
    print(f"✓ Inserted {cursor.rowcount} orders")
    cursor.close()

def insert_order_line_items(connection, items):
    """Insert order line items into database (batched for performance)"""
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO order_line_items
        (transaction_id, order_number, line_item, product_id, quantity)
        VALUES (%s, %s, %s, %s, %s)
    """

    data = []
    for _, row in items.iterrows():
        data.append([
            int(row['transaction_id']),
            int(row['order_number']),
            int(row['line_item']),
            int(row['product_id']),
            int(row['quantity'])
        ])

    # Batch insert for large dataset
    BATCH_SIZE = 5000
    total_inserted = 0
    for i in range(0, len(data), BATCH_SIZE):
        batch = data[i:i + BATCH_SIZE]
        cursor.executemany(query, batch)
        connection.commit()
        total_inserted += cursor.rowcount
        print(f"  Batch {i//BATCH_SIZE + 1}: inserted {cursor.rowcount} rows")

    print(f"✓ Inserted {total_inserted} order line items total")
    cursor.close()

# ============================================================================
# 5. VERIFICATION QUERIES
# ============================================================================

def verify_data(connection):
    """Verify data was inserted correctly"""

    print("\n" + "="*80)
    print("DATA VERIFICATION")
    print("="*80)

    cursor = connection.cursor()

    tables = ['customers', 'stores', 'product_categories',
              'product_subcategories', 'products', 'orders', 'order_line_items']

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"✓ {table.upper()}: {count} records")

    cursor.close()

def run_sample_queries(connection):
    """Run sample queries to demonstrate the normalized structure"""

    print("\n" + "="*80)
    print("SAMPLE QUERIES")
    print("="*80)

    cursor = connection.cursor()

    # Query 1: Order with full details
    print("\n1. Sample Order with Full Details:")
    query1 = """
        SELECT
            o.order_number,
            c.name AS customer_name,
            c.country AS customer_country,
            s.country AS store_country,
            p.name AS product_name,
            pc.category_name,
            li.quantity,
            p.price,
            (li.quantity * p.price) AS line_total
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN stores s ON o.store_id = s.store_id
        JOIN order_line_items li ON o.order_number = li.order_number
        JOIN products p ON li.product_id = p.product_id
        JOIN product_subcategories ps ON p.subcategory_id = ps.subcategory_id
        JOIN product_categories pc ON ps.category_id = pc.category_id
        LIMIT 5
    """
    cursor.execute(query1)
    for row in cursor.fetchall():
        print(f"   {row}")

    # Query 2: Revenue by category
    print("\n2. Revenue by Category:")
    query2 = """
        SELECT
            pc.category_name,
            COUNT(DISTINCT li.order_number) AS order_count,
            SUM(li.quantity * p.price) AS total_revenue,
            ROUND(AVG(li.quantity * p.price), 2) AS avg_item_value
        FROM order_line_items li
        JOIN products p ON li.product_id = p.product_id
        JOIN product_subcategories ps ON p.subcategory_id = ps.subcategory_id
        JOIN product_categories pc ON ps.category_id = pc.category_id
        GROUP BY pc.category_name
        ORDER BY total_revenue DESC
    """
    cursor.execute(query2)
    for row in cursor.fetchall():
        print(f"   {row}")

    # Query 3: Top stores by revenue
    print("\n3. Top 5 Stores by Revenue:")
    query3 = """
        SELECT
            s.store_id,
            s.country,
            s.state,
            COUNT(DISTINCT o.order_number) AS total_orders,
            SUM(li.quantity * p.price) AS total_revenue
        FROM stores s
        JOIN orders o ON s.store_id = o.store_id
        JOIN order_line_items li ON o.order_number = li.order_number
        JOIN products p ON li.product_id = p.product_id
        GROUP BY s.store_id, s.country, s.state
        ORDER BY total_revenue DESC
        LIMIT 5
    """
    cursor.execute(query3)
    for row in cursor.fetchall():
        print(f"   {row}")

    cursor.close()

# ============================================================================
# 6. MAIN EXECUTION
# ============================================================================

def main():
    """Main function to orchestrate the entire ETL process"""

    print("\n" + "="*80)
    print("RETAIL SALES DATA NORMALIZATION & MYSQL LOADER")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # File path
    file_path = r'Data\Retail Sales Dataset.xlsx'

    # Step 1: Connect to MySQL
    print("\n[STEP 1] Connecting to MySQL on port 3307...")
    connection = create_connection(DB_CONFIG)
    if not connection:
        return

    # Step 2: Create database
    print("\n[STEP 2] Creating database...")
    if not create_database(connection, DB_CONFIG['database']):
        return

    # Step 3: Create tables
    print("\n[STEP 3] Creating tables...")
    if not create_tables(connection):
        return

    # Step 4: Load and transform data
    print("\n[STEP 4] Loading and transforming data...")
    df = load_and_transform_data(file_path)

    customers = extract_customers(df)
    stores = extract_stores(df)
    categories = extract_product_categories(df)
    subcategories = extract_product_subcategories(df)
    products = extract_products(df)
    orders = extract_orders(df)
    line_items = extract_order_line_items(df)

    # Step 5: Insert data (order matters due to foreign keys)
    print("\n[STEP 5] Inserting data into database...")
    insert_customers(connection, customers)
    insert_stores(connection, stores)
    insert_product_categories(connection, categories)
    insert_product_subcategories(connection, subcategories)
    insert_products(connection, products)
    insert_orders(connection, orders)
    insert_order_line_items(connection, line_items)

    # Step 6: Verify data
    verify_data(connection)

    # Step 7: Run sample queries
    run_sample_queries(connection)

    # Close connection
    connection.close()
    print("\n" + "="*80)
    print("✓ PROCESS COMPLETED SUCCESSFULLY!")
    print("="*80)
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
