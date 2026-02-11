"""
Data Normalization and MySQL Database Loader
Transforms denormalized e-commerce data into a normalized relational database
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DB_CONFIG = {
    'host': 'localhost',      # Change to your MySQL host
    'user': 'root',           # Change to your MySQL username
    'password': '',   # Change to your MySQL password
    'database': 'ecommerce_db'
}

# ============================================================================
# 1. DATABASE CONNECTION
# ============================================================================

def create_connection(config):
    """Create MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=config['host'],
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
    """Create all normalized tables"""
    
    tables = {
        'customers': """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id VARCHAR(50) PRIMARY KEY,
                customer_type ENUM('New', 'Returning') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_customer_type (customer_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'products': """
            CREATE TABLE IF NOT EXISTS products (
                sku VARCHAR(50) PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_price (unit_price)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'locations': """
            CREATE TABLE IF NOT EXISTS locations (
                location_id INT AUTO_INCREMENT PRIMARY KEY,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_city_state (city, state),
                INDEX idx_state (state)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'discounts': """
            CREATE TABLE IF NOT EXISTS discounts (
                discount_id INT AUTO_INCREMENT PRIMARY KEY,
                discount_code VARCHAR(50) UNIQUE,
                discount_percentage DECIMAL(5, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_discount_code (discount_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'orders': """
            CREATE TABLE IF NOT EXISTS orders (
                order_id VARCHAR(50) PRIMARY KEY,
                customer_id VARCHAR(50) NOT NULL,
                location_id INT NOT NULL,
                discount_id INT NULL,
                order_date DATE NOT NULL,
                order_month INT NOT NULL,
                order_week INT NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                discount_amount DECIMAL(10, 2) DEFAULT 0.00,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                source VARCHAR(50) NOT NULL,
                status ENUM('Delivered', 'RTO', 'Cancelled') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
                FOREIGN KEY (location_id) REFERENCES locations(location_id),
                FOREIGN KEY (discount_id) REFERENCES discounts(discount_id),
                INDEX idx_order_date (order_date),
                INDEX idx_customer (customer_id),
                INDEX idx_status (status),
                INDEX idx_source (source)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'order_items': """
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) NOT NULL,
                sku VARCHAR(50) NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                line_total DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                FOREIGN KEY (sku) REFERENCES products(sku),
                INDEX idx_order (order_id),
                INDEX idx_product (sku)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'deliveries': """
            CREATE TABLE IF NOT EXISTS deliveries (
                delivery_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                warehouse VARCHAR(100) NOT NULL,
                delivery_date DATE NULL,
                days_to_delivery INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                INDEX idx_warehouse (warehouse),
                INDEX idx_delivery_date (delivery_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """,
        
        'returns': """
            CREATE TABLE IF NOT EXISTS returns (
                return_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                return_date DATE NULL,
                return_reason VARCHAR(100) NULL,
                refund_status ENUM('Processed', 'Pending', 'Not Applicable') NOT NULL,
                return_window_days INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                INDEX idx_return_reason (return_reason),
                INDEX idx_refund_status (refund_status)
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
    
    # Load data
    df = pd.read_excel(file_path, sheet_name='Sheet2')
    print(f"✓ Loaded {len(df)} rows from Excel file")
    
    # Convert date columns
    df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')
    df['Del Date'] = pd.to_datetime(df['Del Date'], errors='coerce')
    df['Ret Rec'] = pd.to_datetime(df['Ret Rec'], errors='coerce')
    
    return df

def extract_customers(df):
    """Extract unique customers"""
    customers = df[['Customer ID', 'Type']].drop_duplicates()
    customers.columns = ['customer_id', 'customer_type']
    print(f"✓ Extracted {len(customers)} unique customers")
    return customers

def extract_products(df):
    """Extract unique products"""
    products = df[['SKU', 'Product Name', 'Category', 'Unit Price']].drop_duplicates(subset=['SKU'])
    products.columns = ['sku', 'product_name', 'category', 'unit_price']
    print(f"✓ Extracted {len(products)} unique products")
    return products

def extract_locations(df):
    """Extract unique locations"""
    locations = df[['City', 'State']].drop_duplicates()
    locations.columns = ['city', 'state']
    # Create location_id mapping
    locations['location_id'] = range(1, len(locations) + 1)
    print(f"✓ Extracted {len(locations)} unique locations")
    return locations

def extract_discounts(df):
    """Extract unique discounts"""
    discounts = df[df['Discount Code'].notna()][['Discount Code', 'Discount Code %']].drop_duplicates()
    discounts.columns = ['discount_code', 'discount_percentage']
    discounts['discount_id'] = range(1, len(discounts) + 1)
    print(f"✓ Extracted {len(discounts)} unique discount codes")
    return discounts

def extract_orders(df, locations, discounts):
    """Extract order information"""
    
    # Merge to get location_id
    df_with_loc = df.merge(locations, left_on=['City', 'State'], right_on=['city', 'state'], how='left')
    
    # Merge to get discount_id
    df_with_disc = df_with_loc.merge(
        discounts[['discount_code', 'discount_id']], 
        left_on='Discount Code', 
        right_on='discount_code', 
        how='left'
    )
    
    orders = df_with_disc[[
        'Order ID', 'Customer ID', 'location_id', 'discount_id',
        'Order Date', 'Order Month', 'Order Week',
        'Total', 'Discounted Total', 'Payment', 'Source', 'Status'
    ]].copy()
    
    orders.columns = [
        'order_id', 'customer_id', 'location_id', 'discount_id',
        'order_date', 'order_month', 'order_week',
        'subtotal', 'total_amount', 'payment_method', 'source', 'status'
    ]
    
    # Calculate discount amount
    orders['discount_amount'] = orders['subtotal'] - orders['total_amount']
    orders['discount_amount'] = orders['discount_amount'].fillna(0)
    
    print(f"✓ Extracted {len(orders)} orders")
    return orders

def extract_order_items(df):
    """Extract order items"""
    order_items = df[['Order ID', 'SKU', 'Qty', 'Unit Price', 'Total']].copy()
    order_items.columns = ['order_id', 'sku', 'quantity', 'unit_price', 'line_total']
    print(f"✓ Extracted {len(order_items)} order items")
    return order_items

def extract_deliveries(df):
    """Extract delivery information"""
    deliveries = df[['Order ID', 'Warehouse', 'Del Date', 'No. Of Days To Delivery']].copy()
    deliveries.columns = ['order_id', 'warehouse', 'delivery_date', 'days_to_delivery']
    print(f"✓ Extracted {len(deliveries)} delivery records")
    return deliveries

def extract_returns(df):
    """Extract return information"""
    returns = df[df['Return?'] == 'Yes'][['Order ID', 'Ret Rec', 'Reason', 'Refund', 'Ret Window']].copy()
    returns.columns = ['order_id', 'return_date', 'return_reason', 'refund_status', 'return_window_days']
    print(f"✓ Extracted {len(returns)} return records")
    return returns

# ============================================================================
# 4. INSERT DATA INTO DATABASE
# ============================================================================

def insert_customers(connection, customers):
    """Insert customers into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO customers (customer_id, customer_type)
        VALUES (%s, %s)
    """
    
    data = customers.values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} customers")
    cursor.close()

def insert_products(connection, products):
    """Insert products into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO products (sku, product_name, category, unit_price)
        VALUES (%s, %s, %s, %s)
    """
    
    data = products.values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} products")
    cursor.close()

def insert_locations(connection, locations):
    """Insert locations into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO locations (city, state)
        VALUES (%s, %s)
    """
    
    data = locations[['city', 'state']].values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} locations")
    cursor.close()

def insert_discounts(connection, discounts):
    """Insert discounts into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO discounts (discount_code, discount_percentage)
        VALUES (%s, %s)
    """
    
    data = discounts[['discount_code', 'discount_percentage']].values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} discounts")
    cursor.close()

def insert_orders(connection, orders):
    """Insert orders into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO orders 
        (order_id, customer_id, location_id, discount_id, order_date, order_month, 
         order_week, subtotal, discount_amount, total_amount, payment_method, source, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # Convert DataFrame to list, handling NaN values
    data = []
    for _, row in orders.iterrows():
        data.append([
            row['order_id'],
            row['customer_id'],
            int(row['location_id']) if pd.notna(row['location_id']) else None,
            int(row['discount_id']) if pd.notna(row['discount_id']) else None,
            row['order_date'].date() if pd.notna(row['order_date']) else None,
            int(row['order_month']),
            int(row['order_week']),
            float(row['subtotal']),
            float(row['discount_amount']),
            float(row['total_amount']),
            row['payment_method'],
            row['source'],
            row['status']
        ])
    
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} orders")
    cursor.close()

def insert_order_items(connection, order_items):
    """Insert order items into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT INTO order_items (order_id, sku, quantity, unit_price, line_total)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    data = order_items.values.tolist()
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} order items")
    cursor.close()

def insert_deliveries(connection, deliveries):
    """Insert deliveries into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO deliveries (order_id, warehouse, delivery_date, days_to_delivery)
        VALUES (%s, %s, %s, %s)
    """
    
    data = []
    for _, row in deliveries.iterrows():
        data.append([
            row['order_id'],
            row['warehouse'],
            row['delivery_date'].date() if pd.notna(row['delivery_date']) else None,
            int(row['days_to_delivery']) if pd.notna(row['days_to_delivery']) else None
        ])
    
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} deliveries")
    cursor.close()

def insert_returns(connection, returns):
    """Insert returns into database"""
    cursor = connection.cursor()
    
    query = """
        INSERT IGNORE INTO returns (order_id, return_date, return_reason, refund_status, return_window_days)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    data = []
    for _, row in returns.iterrows():
        data.append([
            row['order_id'],
            row['return_date'].date() if pd.notna(row['return_date']) else None,
            row['return_reason'] if pd.notna(row['return_reason']) else None,
            row['refund_status'],
            int(row['return_window_days']) if pd.notna(row['return_window_days']) else None
        ])
    
    cursor.executemany(query, data)
    connection.commit()
    
    print(f"✓ Inserted {cursor.rowcount} returns")
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
    
    tables = ['customers', 'products', 'locations', 'discounts', 
              'orders', 'order_items', 'deliveries', 'returns']
    
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
            o.order_id,
            c.customer_id,
            c.customer_type,
            p.product_name,
            p.category,
            oi.quantity,
            o.total_amount,
            l.city,
            l.state,
            o.status
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.sku = p.sku
        JOIN locations l ON o.location_id = l.location_id
        LIMIT 5
    """
    cursor.execute(query1)
    for row in cursor.fetchall():
        print(f"   {row}")
    
    # Query 2: Revenue by category
    print("\n2. Revenue by Category:")
    query2 = """
        SELECT 
            p.category,
            COUNT(DISTINCT o.order_id) as order_count,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.sku = p.sku
        GROUP BY p.category
        ORDER BY total_revenue DESC
    """
    cursor.execute(query2)
    for row in cursor.fetchall():
        print(f"   {row}")
    
    # Query 3: Top customers
    print("\n3. Top 5 Customers by Spending:")
    query3 = """
        SELECT 
            c.customer_id,
            c.customer_type,
            COUNT(o.order_id) as total_orders,
            SUM(o.total_amount) as lifetime_value
        FROM customers c
        JOIN orders o ON c.customer_id = o.customer_id
        GROUP BY c.customer_id, c.customer_type
        ORDER BY lifetime_value DESC
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
    print("E-COMMERCE DATA NORMALIZATION & MYSQL LOADER")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # File path
    file_path = 'Data\Data Analysis.xlsx'
    
    # Step 1: Connect to MySQL
    print("\n[STEP 1] Connecting to MySQL...")
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
    products = extract_products(df)
    locations = extract_locations(df)
    discounts = extract_discounts(df)
    orders = extract_orders(df, locations, discounts)
    order_items = extract_order_items(df)
    deliveries = extract_deliveries(df)
    returns = extract_returns(df)
    
    # Step 5: Insert data (order matters due to foreign keys)
    print("\n[STEP 5] Inserting data into database...")
    insert_customers(connection, customers)
    insert_products(connection, products)
    insert_locations(connection, locations)
    insert_discounts(connection, discounts)
    insert_orders(connection, orders)
    insert_order_items(connection, order_items)
    insert_deliveries(connection, deliveries)
    insert_returns(connection, returns)
    
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