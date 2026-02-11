# E-Commerce Database Schema - Normalized Model

## Database: ecommerce_db

## Schema Overview (3NF - Third Normal Form)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE NORMALIZED DATABASE SCHEMA                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   CUSTOMERS      │
├──────────────────┤
│ PK customer_id   │
│    customer_type │
│    created_at    │
└────────┬─────────┘
         │
         │ 1:N
         ↓
┌──────────────────┐         ┌──────────────────┐
│   PRODUCTS       │         │   LOCATIONS      │
├──────────────────┤         ├──────────────────┤
│ PK sku           │         │ PK location_id   │
│    product_name  │         │    city          │
│    category      │         │    state         │
│    unit_price    │         └──────────────────┘
│    created_at    │                   ↑
└────────┬─────────┘                   │ N:1
         │                             │
         │ 1:N                         │
         ↓                             │
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   ORDER_ITEMS    │         │     ORDERS       │         │   DISCOUNTS      │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ PK order_item_id │◄─┐  ┌──│ PK order_id      │         │ PK discount_id   │
│ FK order_id      │  │  │  │ FK customer_id   │         │    discount_code │
│ FK sku           │  │  │  │ FK location_id   │         │    discount_pct  │
│    quantity      │  │  │  │ FK discount_id   │──────►  │    created_at    │
│    unit_price    │  │  │  │    order_date    │         └──────────────────┘
│    line_total    │  │  │  │    order_month   │
│    created_at    │  │  │  │    order_week    │
└──────────────────┘  │  │  │    subtotal      │
                      │  │  │    discount_amt  │
                      │  │  │    total_amount  │
                      │  │  │    payment_method│
                      │  │  │    source        │
                      │  │  │    status        │
                      │  │  │    created_at    │
                      │  │  └────────┬─────────┘
                      │  │           │
                      │  │           │ 1:1 (optional)
                      │  │           ↓
                      │  │  ┌──────────────────┐
                      │  │  │   DELIVERIES     │
                      │  │  ├──────────────────┤
                      │  │  │ PK delivery_id   │
                      │  └──│ FK order_id      │
                      │     │    warehouse     │
                      │     │    delivery_date │
                      │     │    days_to_deliver│
                      │     │    created_at    │
                      │     └────────┬─────────┘
                      │              │
                      │              │ 1:1 (optional)
                      │              ↓
                      │     ┌──────────────────┐
                      │     │    RETURNS       │
                      │     ├──────────────────┤
                      │     │ PK return_id     │
                      └─────│ FK order_id      │
                            │    return_date   │
                            │    return_reason │
                            │    refund_status │
                            │    return_window │
                            │    created_at    │
                            └──────────────────┘
```

## Table Definitions

### 1. CUSTOMERS
```sql
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_type ENUM('New', 'Returning') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_type (customer_type)
);
```

### 2. PRODUCTS
```sql
CREATE TABLE products (
    sku VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (unit_price)
);
```

### 3. LOCATIONS
```sql
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_city_state (city, state),
    INDEX idx_state (state)
);
```

### 4. DISCOUNTS
```sql
CREATE TABLE discounts (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    discount_code VARCHAR(50) UNIQUE,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_discount_code (discount_code)
);
```

### 5. ORDERS
```sql
CREATE TABLE orders (
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
);
```

### 6. ORDER_ITEMS
```sql
CREATE TABLE order_items (
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
);
```

### 7. DELIVERIES
```sql
CREATE TABLE deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    warehouse VARCHAR(100) NOT NULL,
    delivery_date DATE NULL,
    days_to_delivery INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_warehouse (warehouse),
    INDEX idx_delivery_date (delivery_date)
);
```

### 8. RETURNS
```sql
CREATE TABLE returns (
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
);
```

## Normalization Benefits

### Before (Denormalized - 1 Table):
- 345 rows × 37 columns = 12,765 data points
- Redundant data (customer info, product info repeated)
- Update anomalies
- Difficult to maintain data integrity

### After (Normalized - 8 Tables):
- **Customers**: ~343 rows (one per customer)
- **Products**: ~335 rows (one per product)
- **Locations**: ~39 rows (unique city-state combinations)
- **Discounts**: ~6 rows (unique discount codes)
- **Orders**: 345 rows (one per order)
- **Order_Items**: 345 rows (one per order in this dataset)
- **Deliveries**: ~327 rows (orders with delivery info)
- **Returns**: ~180 rows (orders with returns)

**Total**: ~1,920 rows across 8 tables (more efficient storage)

## Key Improvements

1. **Eliminates Redundancy**: Customer, product, and location info stored once
2. **Data Integrity**: Foreign keys enforce referential integrity
3. **Flexibility**: Easy to add new customers, products, or orders
4. **Query Performance**: Indexes on foreign keys and frequently queried columns
5. **Scalability**: Can handle millions of records efficiently
6. **Maintainability**: Updates to product prices or customer info in one place

## Common Queries Examples

### 1. Get Order Details with Customer and Product Info
```sql
SELECT 
    o.order_id,
    c.customer_id,
    c.customer_type,
    p.product_name,
    p.category,
    oi.quantity,
    o.total_amount,
    l.city,
    l.state
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.sku = p.sku
JOIN locations l ON o.location_id = l.location_id
WHERE o.order_id = 'UT-100001';
```

### 2. Revenue by Category
```sql
SELECT 
    p.category,
    SUM(o.total_amount) as total_revenue,
    COUNT(DISTINCT o.order_id) as order_count,
    AVG(o.total_amount) as avg_order_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.sku = p.sku
GROUP BY p.category
ORDER BY total_revenue DESC;
```

### 3. Return Analysis
```sql
SELECT 
    r.return_reason,
    COUNT(*) as return_count,
    AVG(o.total_amount) as avg_order_value,
    SUM(o.total_amount) as total_refunded
FROM returns r
JOIN orders o ON r.order_id = o.order_id
WHERE r.refund_status = 'Processed'
GROUP BY r.return_reason
ORDER BY return_count DESC;
```

### 4. Customer Lifetime Value
```sql
SELECT 
    c.customer_id,
    c.customer_type,
    COUNT(o.order_id) as total_orders,
    SUM(o.total_amount) as lifetime_value,
    AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_type
ORDER BY lifetime_value DESC
LIMIT 10;
```
