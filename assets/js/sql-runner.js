// ============================================
// SQL Runner - In-Browser SQLite via sql.js
// ============================================
(function () {

  // Sample data that mirrors the normalized e-commerce schema
  const SCHEMA_AND_DATA = `
    CREATE TABLE customers (
      customer_id TEXT PRIMARY KEY,
      customer_type TEXT NOT NULL
    );
    CREATE TABLE products (
      sku TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit_price REAL NOT NULL
    );
    CREATE TABLE locations (
      location_id INTEGER PRIMARY KEY,
      city TEXT NOT NULL,
      state TEXT NOT NULL
    );
    CREATE TABLE discounts (
      discount_id INTEGER PRIMARY KEY,
      discount_code TEXT,
      discount_percentage REAL NOT NULL
    );
    CREATE TABLE orders (
      order_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      location_id INTEGER NOT NULL,
      discount_id INTEGER,
      order_date TEXT NOT NULL,
      order_month INTEGER NOT NULL,
      order_week INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (location_id) REFERENCES locations(location_id)
    );
    CREATE TABLE order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      line_total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (sku) REFERENCES products(sku)
    );
    CREATE TABLE deliveries (
      delivery_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      warehouse TEXT NOT NULL,
      delivery_date TEXT,
      days_to_delivery INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );
    CREATE TABLE returns (
      return_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      return_date TEXT,
      return_reason TEXT,
      refund_status TEXT NOT NULL,
      return_window_days INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );

    -- Customers
    INSERT INTO customers VALUES ('CUST-001','Returning');
    INSERT INTO customers VALUES ('CUST-002','New');
    INSERT INTO customers VALUES ('CUST-003','Returning');
    INSERT INTO customers VALUES ('CUST-004','New');
    INSERT INTO customers VALUES ('CUST-005','Returning');
    INSERT INTO customers VALUES ('CUST-006','New');
    INSERT INTO customers VALUES ('CUST-007','Returning');
    INSERT INTO customers VALUES ('CUST-008','Returning');
    INSERT INTO customers VALUES ('CUST-009','New');
    INSERT INTO customers VALUES ('CUST-010','Returning');
    INSERT INTO customers VALUES ('CUST-011','New');
    INSERT INTO customers VALUES ('CUST-012','Returning');
    INSERT INTO customers VALUES ('CUST-013','New');
    INSERT INTO customers VALUES ('CUST-014','Returning');
    INSERT INTO customers VALUES ('CUST-015','New');

    -- Products
    INSERT INTO products VALUES ('SKU-1001','Wireless Mouse','Electronics',899.00);
    INSERT INTO products VALUES ('SKU-1002','USB-C Hub','Electronics',1499.00);
    INSERT INTO products VALUES ('SKU-1003','Bluetooth Speaker','Electronics',2199.00);
    INSERT INTO products VALUES ('SKU-1004','Yoga Mat','Fitness',599.00);
    INSERT INTO products VALUES ('SKU-1005','Resistance Bands','Fitness',349.00);
    INSERT INTO products VALUES ('SKU-1006','Running Shoes','Footwear',3499.00);
    INSERT INTO products VALUES ('SKU-1007','Cotton T-Shirt','Clothing',499.00);
    INSERT INTO products VALUES ('SKU-1008','Denim Jeans','Clothing',1299.00);
    INSERT INTO products VALUES ('SKU-1009','Face Cream','Beauty',799.00);
    INSERT INTO products VALUES ('SKU-1010','Shampoo','Beauty',450.00);
    INSERT INTO products VALUES ('SKU-1011','Notebook Set','Stationery',199.00);
    INSERT INTO products VALUES ('SKU-1012','Backpack','Accessories',1899.00);

    -- Locations
    INSERT INTO locations VALUES (1,'Mumbai','Maharashtra');
    INSERT INTO locations VALUES (2,'Pune','Maharashtra');
    INSERT INTO locations VALUES (3,'Bangalore','Karnataka');
    INSERT INTO locations VALUES (4,'Delhi','Delhi');
    INSERT INTO locations VALUES (5,'Chennai','Tamil Nadu');
    INSERT INTO locations VALUES (6,'Hyderabad','Telangana');
    INSERT INTO locations VALUES (7,'Kolkata','West Bengal');
    INSERT INTO locations VALUES (8,'Nagpur','Maharashtra');
    INSERT INTO locations VALUES (9,'Jaipur','Rajasthan');
    INSERT INTO locations VALUES (10,'Ahmedabad','Gujarat');

    -- Discounts
    INSERT INTO discounts VALUES (1,'SAVE10',10.00);
    INSERT INTO discounts VALUES (2,'FLAT15',15.00);
    INSERT INTO discounts VALUES (3,'MEGA20',20.00);
    INSERT INTO discounts VALUES (4,'NEW5',5.00);

    -- Orders (30 sample orders)
    INSERT INTO orders VALUES ('UT-100001','CUST-001',1,1,'2024-01-15',1,3,2398.00,239.80,2158.20,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100002','CUST-002',3,NULL,'2024-01-18',1,3,3499.00,0,3499.00,'Credit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100003','CUST-003',4,2,'2024-01-22',1,4,1299.00,194.85,1104.15,'Debit Card','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100004','CUST-004',2,NULL,'2024-02-05',2,6,599.00,0,599.00,'COD','App','RTO');
    INSERT INTO orders VALUES ('UT-100005','CUST-005',6,3,'2024-02-10',2,6,4398.00,879.60,3518.40,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100006','CUST-006',5,NULL,'2024-02-14',2,7,799.00,0,799.00,'Credit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100007','CUST-007',1,1,'2024-02-20',2,8,1499.00,149.90,1349.10,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100008','CUST-008',7,NULL,'2024-03-01',3,9,349.00,0,349.00,'COD','App','Cancelled');
    INSERT INTO orders VALUES ('UT-100009','CUST-009',3,4,'2024-03-05',3,10,1899.00,94.95,1804.05,'Debit Card','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100010','CUST-010',8,NULL,'2024-03-12',3,11,2199.00,0,2199.00,'UPI','App','Delivered');
    INSERT INTO orders VALUES ('UT-100011','CUST-001',1,2,'2024-03-18',3,12,899.00,134.85,764.15,'Credit Card','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100012','CUST-011',9,NULL,'2024-04-02',4,14,499.00,0,499.00,'COD','App','Delivered');
    INSERT INTO orders VALUES ('UT-100013','CUST-003',4,1,'2024-04-08',4,15,3499.00,349.90,3149.10,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100014','CUST-012',10,NULL,'2024-04-15',4,16,450.00,0,450.00,'Debit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100015','CUST-002',3,3,'2024-04-22',4,17,1299.00,259.80,1039.20,'Credit Card','Website','RTO');
    INSERT INTO orders VALUES ('UT-100016','CUST-013',6,NULL,'2024-05-01',5,18,599.00,0,599.00,'UPI','App','Delivered');
    INSERT INTO orders VALUES ('UT-100017','CUST-005',2,1,'2024-05-10',5,19,1899.00,189.90,1709.10,'COD','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100018','CUST-014',1,NULL,'2024-05-15',5,20,2199.00,0,2199.00,'Credit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100019','CUST-007',7,2,'2024-05-22',5,21,899.00,134.85,764.15,'UPI','Website','Cancelled');
    INSERT INTO orders VALUES ('UT-100020','CUST-015',5,NULL,'2024-06-01',6,22,3499.00,0,3499.00,'Debit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100021','CUST-010',8,4,'2024-06-08',6,23,799.00,39.95,759.05,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100022','CUST-004',2,NULL,'2024-06-15',6,24,349.00,0,349.00,'COD','App','Delivered');
    INSERT INTO orders VALUES ('UT-100023','CUST-001',1,1,'2024-07-01',7,27,1499.00,149.90,1349.10,'Credit Card','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100024','CUST-008',7,NULL,'2024-07-10',7,28,499.00,0,499.00,'UPI','App','RTO');
    INSERT INTO orders VALUES ('UT-100025','CUST-006',5,3,'2024-07-18',7,29,1299.00,259.80,1039.20,'Debit Card','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100026','CUST-009',3,NULL,'2024-08-02',8,31,450.00,0,450.00,'COD','App','Delivered');
    INSERT INTO orders VALUES ('UT-100027','CUST-012',10,2,'2024-08-12',8,33,3499.00,524.85,2974.15,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100028','CUST-011',9,NULL,'2024-08-20',8,34,599.00,0,599.00,'Credit Card','App','Delivered');
    INSERT INTO orders VALUES ('UT-100029','CUST-003',4,1,'2024-09-05',9,36,2199.00,219.90,1979.10,'UPI','Website','Delivered');
    INSERT INTO orders VALUES ('UT-100030','CUST-014',1,NULL,'2024-09-15',9,37,899.00,0,899.00,'Debit Card','App','Delivered');

    -- Order Items
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100001','SKU-1001',1,899.00,899.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100001','SKU-1002',1,1499.00,1499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100002','SKU-1006',1,3499.00,3499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100003','SKU-1008',1,1299.00,1299.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100004','SKU-1004',1,599.00,599.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100005','SKU-1003',2,2199.00,4398.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100006','SKU-1009',1,799.00,799.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100007','SKU-1002',1,1499.00,1499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100008','SKU-1005',1,349.00,349.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100009','SKU-1012',1,1899.00,1899.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100010','SKU-1003',1,2199.00,2199.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100011','SKU-1001',1,899.00,899.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100012','SKU-1007',1,499.00,499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100013','SKU-1006',1,3499.00,3499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100014','SKU-1010',1,450.00,450.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100015','SKU-1008',1,1299.00,1299.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100016','SKU-1004',1,599.00,599.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100017','SKU-1012',1,1899.00,1899.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100018','SKU-1003',1,2199.00,2199.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100019','SKU-1001',1,899.00,899.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100020','SKU-1006',1,3499.00,3499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100021','SKU-1009',1,799.00,799.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100022','SKU-1005',1,349.00,349.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100023','SKU-1002',1,1499.00,1499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100024','SKU-1007',1,499.00,499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100025','SKU-1008',1,1299.00,1299.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100026','SKU-1010',1,450.00,450.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100027','SKU-1006',1,3499.00,3499.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100028','SKU-1004',1,599.00,599.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100029','SKU-1003',1,2199.00,2199.00);
    INSERT INTO order_items (order_id,sku,quantity,unit_price,line_total) VALUES ('UT-100030','SKU-1001',1,899.00,899.00);

    -- Deliveries
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100001','Mumbai Hub','2024-01-19',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100002','Bangalore Hub','2024-01-22',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100003','Delhi Hub','2024-01-27',5);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100005','Hyderabad Hub','2024-02-14',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100006','Chennai Hub','2024-02-18',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100007','Mumbai Hub','2024-02-24',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100009','Bangalore Hub','2024-03-09',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100010','Nagpur Hub','2024-03-17',5);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100011','Mumbai Hub','2024-03-21',3);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100012','Jaipur Hub','2024-04-06',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100013','Delhi Hub','2024-04-12',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100014','Ahmedabad Hub','2024-04-19',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100016','Hyderabad Hub','2024-05-05',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100017','Pune Hub','2024-05-15',5);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100018','Mumbai Hub','2024-05-19',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100020','Chennai Hub','2024-06-05',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100021','Nagpur Hub','2024-06-12',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100022','Pune Hub','2024-06-19',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100023','Mumbai Hub','2024-07-04',3);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100025','Chennai Hub','2024-07-23',5);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100026','Bangalore Hub','2024-08-06',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100027','Ahmedabad Hub','2024-08-16',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100028','Jaipur Hub','2024-08-24',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100029','Delhi Hub','2024-09-09',4);
    INSERT INTO deliveries (order_id,warehouse,delivery_date,days_to_delivery) VALUES ('UT-100030','Mumbai Hub','2024-09-18',3);

    -- Returns
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100003','2024-02-01','Size Issue','Processed',10);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100006','2024-02-25','Product Damaged','Processed',11);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100011','2024-03-28','Changed Mind','Processed',10);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100014','2024-04-25','Wrong Product','Processed',10);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100017','2024-05-22','Size Issue','Pending',12);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100022','2024-06-25','Product Damaged','Processed',10);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100025','2024-07-30','Changed Mind','Processed',12);
    INSERT INTO returns (order_id,return_date,return_reason,refund_status,return_window_days) VALUES ('UT-100030','2024-09-25','Size Issue','Pending',10);
  `;

  let db = null;

  async function initDB() {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    db = new SQL.Database();
    db.run(SCHEMA_AND_DATA);
    // Update status badges
    document.querySelectorAll('.sql-runner-status').forEach(el => {
      el.textContent = 'Ready';
    });
    return db;
  }

  function runQuery(sql) {
    if (!db) return { error: 'Database not loaded yet. Please wait...' };
    try {
      const results = db.exec(sql);
      if (results.length === 0) return { columns: [], rows: [], message: 'Query executed. No results returned.' };
      return { columns: results[0].columns, rows: results[0].values };
    } catch (e) {
      return { error: e.message };
    }
  }

  function renderResult(container, result) {
    container.innerHTML = '';
    if (result.error) {
      container.innerHTML = `<div class="sql-error">${result.error}</div>`;
      return;
    }
    if (result.message) {
      container.innerHTML = `<div class="sql-result-info">${result.message}</div>`;
      return;
    }
    const info = document.createElement('div');
    info.className = 'sql-result-info';
    info.textContent = `${result.rows.length} row(s) returned`;
    container.appendChild(info);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    result.columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    result.rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell === null ? 'NULL' : cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Initialize on page load if SQL runners exist
  const runners = document.querySelectorAll('.sql-runner');
  if (runners.length > 0) {
    initDB().then(() => {
      runners.forEach(runner => {
        const textarea = runner.querySelector('textarea');
        const resultDiv = runner.querySelector('.sql-result');
        const runBtn = runner.querySelector('.sql-run-btn');
        const clearBtn = runner.querySelector('.sql-clear-btn');

        // Run button
        runBtn.addEventListener('click', () => {
          const sql = textarea.value.trim();
          if (!sql) return;
          const result = runQuery(sql);
          renderResult(resultDiv, result);
          resultDiv.style.display = 'block';
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
          textarea.value = '';
          resultDiv.style.display = 'none';
          resultDiv.innerHTML = '';
        });

        // Ctrl+Enter to run
        textarea.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runBtn.click();
          }
        });

        // Preset buttons
        runner.querySelectorAll('.sql-preset-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            textarea.value = btn.dataset.query;
            runBtn.click();
          });
        });
      });
    });
  }

})();
