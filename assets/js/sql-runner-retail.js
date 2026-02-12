// ============================================
// SQL Runner - Retail Sales - In-Browser SQLite via sql.js
// ============================================
(function () {

  // Sample data that mirrors the normalized retail sales schema
  const SCHEMA_AND_DATA = `
    CREATE TABLE customers (
      customer_id INTEGER PRIMARY KEY,
      gender TEXT NOT NULL,
      name TEXT NOT NULL,
      city TEXT,
      state_code TEXT,
      state TEXT,
      zip TEXT,
      country TEXT,
      continent TEXT,
      dob TEXT
    );
    CREATE TABLE stores (
      store_id INTEGER PRIMARY KEY,
      country TEXT NOT NULL,
      state TEXT,
      sq_meters INTEGER,
      open_date TEXT
    );
    CREATE TABLE product_categories (
      category_id INTEGER PRIMARY KEY,
      category_name TEXT NOT NULL
    );
    CREATE TABLE product_subcategories (
      subcategory_id INTEGER PRIMARY KEY,
      category_id INTEGER NOT NULL,
      subcategory_name TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
    );
    CREATE TABLE products (
      product_id INTEGER PRIMARY KEY,
      subcategory_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      color TEXT,
      cost REAL NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (subcategory_id) REFERENCES product_subcategories(subcategory_id)
    );
    CREATE TABLE orders (
      order_number INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      delivery_date TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (store_id) REFERENCES stores(store_id)
    );
    CREATE TABLE order_line_items (
      transaction_id INTEGER PRIMARY KEY,
      order_number INTEGER NOT NULL,
      line_item INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (order_number) REFERENCES orders(order_number),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    -- Product Categories (8)
    INSERT INTO product_categories VALUES (1, 'Computers');
    INSERT INTO product_categories VALUES (2, 'Cell phones');
    INSERT INTO product_categories VALUES (3, 'TV and Video');
    INSERT INTO product_categories VALUES (4, 'Home Appliances');
    INSERT INTO product_categories VALUES (5, 'Cameras and camcorders');
    INSERT INTO product_categories VALUES (6, 'Audio');
    INSERT INTO product_categories VALUES (7, 'Music, Movies and Audio Books');
    INSERT INTO product_categories VALUES (8, 'Games and Toys');

    -- Product Subcategories (12 sample)
    INSERT INTO product_subcategories VALUES (1, 1, 'Desktops');
    INSERT INTO product_subcategories VALUES (2, 1, 'Laptops');
    INSERT INTO product_subcategories VALUES (3, 2, 'Smartphones');
    INSERT INTO product_subcategories VALUES (4, 2, 'Cell phones Accessories');
    INSERT INTO product_subcategories VALUES (5, 3, 'Televisions');
    INSERT INTO product_subcategories VALUES (6, 3, 'Home Theater System');
    INSERT INTO product_subcategories VALUES (7, 4, 'Refrigerators');
    INSERT INTO product_subcategories VALUES (8, 4, 'Washing Machines');
    INSERT INTO product_subcategories VALUES (9, 5, 'Digital SLR Cameras');
    INSERT INTO product_subcategories VALUES (10, 6, 'Bluetooth Headphones');
    INSERT INTO product_subcategories VALUES (11, 7, 'Movie DVD');
    INSERT INTO product_subcategories VALUES (12, 8, 'Recording Pen');

    -- Stores (8 sample)
    INSERT INTO stores VALUES (0, 'Online', 'Online', NULL, '2005-01-01');
    INSERT INTO stores VALUES (1, 'United States', 'California', 1500, '2010-03-15');
    INSERT INTO stores VALUES (2, 'United States', 'New York', 2200, '2008-07-20');
    INSERT INTO stores VALUES (3, 'Germany', 'Bavaria', 1800, '2012-01-10');
    INSERT INTO stores VALUES (4, 'United Kingdom', 'England', 1200, '2015-06-01');
    INSERT INTO stores VALUES (5, 'Canada', 'Ontario', 1600, '2011-09-25');
    INSERT INTO stores VALUES (6, 'Australia', 'New South Wales', 1400, '2014-02-14');
    INSERT INTO stores VALUES (7, 'France', 'Ile-de-France', 1900, '2013-11-30');

    -- Products (20 sample)
    INSERT INTO products VALUES (1, 1, 'Contoso Desktop 5.0 E500 White', 'Contoso', 'White', 450.00, 699.99);
    INSERT INTO products VALUES (2, 2, 'Adventure Works Laptop 15.4', 'Adventure Works', 'Silver', 600.00, 999.99);
    INSERT INTO products VALUES (3, 3, 'Fabrikam Smartphone 200 Gray', 'Fabrikam', 'Gray', 350.00, 599.99);
    INSERT INTO products VALUES (4, 4, 'Contoso USB-C Charger E100', 'Contoso', 'Black', 15.00, 29.99);
    INSERT INTO products VALUES (5, 5, 'Wide World 55 inch LCD TV', 'Wide World Importers', 'Black', 400.00, 749.99);
    INSERT INTO products VALUES (6, 6, 'Litware Home Theater System', 'Litware', 'Black', 500.00, 899.99);
    INSERT INTO products VALUES (7, 7, 'Contoso Refrigerator 16cf E700', 'Contoso', 'White', 350.00, 649.99);
    INSERT INTO products VALUES (8, 8, 'Fabrikam Washing Machine 6kg', 'Fabrikam', 'Silver', 280.00, 499.99);
    INSERT INTO products VALUES (9, 9, 'Northwind Traders Digital SLR', 'Northwind Traders', 'Black', 500.00, 899.99);
    INSERT INTO products VALUES (10, 10, 'Contoso Bluetooth Headphones', 'Contoso', 'Black', 80.00, 149.99);
    INSERT INTO products VALUES (11, 1, 'Litware Desktop Elite D900', 'Litware', 'Silver', 550.00, 849.99);
    INSERT INTO products VALUES (12, 2, 'Contoso Laptop Air 13', 'Contoso', 'Gold', 700.00, 1199.99);
    INSERT INTO products VALUES (13, 3, 'Northwind Phone Z3 Plus', 'Northwind Traders', 'Black', 280.00, 449.99);
    INSERT INTO products VALUES (14, 5, 'Fabrikam 65 inch OLED TV', 'Fabrikam', 'Black', 800.00, 1499.99);
    INSERT INTO products VALUES (15, 10, 'Proseware Wireless Earbuds', 'Proseware', 'White', 45.00, 89.99);
    INSERT INTO products VALUES (16, 4, 'Wide World Phone Case Pro', 'Wide World Importers', 'Clear', 5.00, 14.99);
    INSERT INTO products VALUES (17, 11, 'Adventure Works Movie Collection', 'Adventure Works', 'N/A', 12.00, 24.99);
    INSERT INTO products VALUES (18, 12, 'Fabrikam Recording Pen 8GB', 'Fabrikam', 'Black', 25.00, 49.99);
    INSERT INTO products VALUES (19, 7, 'A. Datum Refrigerator 20cf', 'A. Datum', 'Stainless', 450.00, 799.99);
    INSERT INTO products VALUES (20, 9, 'Contoso Digital SLR X500', 'Contoso', 'Black', 600.00, 1099.99);

    -- Customers (20 sample)
    INSERT INTO customers VALUES (10001, 'Male', 'John Smith', 'Los Angeles', 'CA', 'California', '90001', 'United States', 'North America', '1985-03-15');
    INSERT INTO customers VALUES (10002, 'Female', 'Emma Johnson', 'New York', 'NY', 'New York', '10001', 'United States', 'North America', '1990-07-22');
    INSERT INTO customers VALUES (10003, 'Male', 'Liam Weber', 'Munich', NULL, 'Bavaria', '80331', 'Germany', 'Europe', '1988-11-05');
    INSERT INTO customers VALUES (10004, 'Female', 'Olivia Brown', 'London', NULL, 'England', 'EC1A', 'United Kingdom', 'Europe', '1992-02-14');
    INSERT INTO customers VALUES (10005, 'Male', 'Noah Davis', 'Toronto', 'ON', 'Ontario', 'M5V', 'Canada', 'North America', '1987-09-30');
    INSERT INTO customers VALUES (10006, 'Female', 'Sophia Miller', 'Sydney', 'NSW', 'New South Wales', '2000', 'Australia', 'Australia', '1995-04-18');
    INSERT INTO customers VALUES (10007, 'Male', 'James Dupont', 'Paris', NULL, 'Ile-de-France', '75001', 'France', 'Europe', '1983-12-01');
    INSERT INTO customers VALUES (10008, 'Female', 'Isabella Moore', 'Houston', 'TX', 'Texas', '77001', 'United States', 'North America', '1991-06-25');
    INSERT INTO customers VALUES (10009, 'Male', 'Benjamin Taylor', 'Chicago', 'IL', 'Illinois', '60601', 'United States', 'North America', '1986-08-10');
    INSERT INTO customers VALUES (10010, 'Female', 'Mia Fischer', 'Berlin', NULL, 'Berlin', '10115', 'Germany', 'Europe', '1993-01-20');
    INSERT INTO customers VALUES (10011, 'Male', 'Lucas Thomas', 'Vancouver', 'BC', 'British Columbia', 'V6B', 'Canada', 'North America', '1989-05-12');
    INSERT INTO customers VALUES (10012, 'Female', 'Charlotte Lee', 'Melbourne', 'VIC', 'Victoria', '3000', 'Australia', 'Australia', '1994-10-08');
    INSERT INTO customers VALUES (10013, 'Male', 'Henry White', 'San Francisco', 'CA', 'California', '94102', 'United States', 'North America', '1982-07-14');
    INSERT INTO customers VALUES (10014, 'Female', 'Amelia Harris', 'Manchester', NULL, 'England', 'M1', 'United Kingdom', 'Europe', '1996-03-27');
    INSERT INTO customers VALUES (10015, 'Male', 'Alexander Clark', 'Dallas', 'TX', 'Texas', '75201', 'United States', 'North America', '1984-11-19');
    INSERT INTO customers VALUES (10016, 'Female', 'Harper Martin', 'Lyon', NULL, 'Auvergne', '69001', 'France', 'Europe', '1991-09-02');
    INSERT INTO customers VALUES (10017, 'Male', 'Daniel Garcia', 'Miami', 'FL', 'Florida', '33101', 'United States', 'North America', '1988-04-06');
    INSERT INTO customers VALUES (10018, 'Female', 'Evelyn Robinson', 'Brisbane', 'QLD', 'Queensland', '4000', 'Australia', 'Australia', '1993-12-15');
    INSERT INTO customers VALUES (10019, 'Male', 'Matthew Tremblay', 'Montreal', 'QC', 'Quebec', 'H2X', 'Canada', 'North America', '1987-02-28');
    INSERT INTO customers VALUES (10020, 'Female', 'Abigail Lewis', 'Seattle', 'WA', 'Washington', '98101', 'United States', 'North America', '1990-08-03');

    -- Orders (30 sample)
    INSERT INTO orders VALUES (100001, 10001, 1, '2024-01-05', '2024-01-09');
    INSERT INTO orders VALUES (100002, 10002, 2, '2024-01-12', '2024-01-16');
    INSERT INTO orders VALUES (100003, 10003, 3, '2024-01-20', '2024-01-26');
    INSERT INTO orders VALUES (100004, 10004, 4, '2024-02-03', '2024-02-08');
    INSERT INTO orders VALUES (100005, 10005, 5, '2024-02-14', '2024-02-19');
    INSERT INTO orders VALUES (100006, 10006, 6, '2024-02-28', '2024-03-05');
    INSERT INTO orders VALUES (100007, 10007, 7, '2024-03-10', '2024-03-15');
    INSERT INTO orders VALUES (100008, 10008, 0, '2024-03-22', '2024-03-27');
    INSERT INTO orders VALUES (100009, 10009, 1, '2024-04-01', '2024-04-05');
    INSERT INTO orders VALUES (100010, 10010, 3, '2024-04-15', '2024-04-21');
    INSERT INTO orders VALUES (100011, 10001, 1, '2024-04-28', '2024-05-02');
    INSERT INTO orders VALUES (100012, 10011, 5, '2024-05-10', '2024-05-15');
    INSERT INTO orders VALUES (100013, 10012, 6, '2024-05-20', '2024-05-26');
    INSERT INTO orders VALUES (100014, 10013, 1, '2024-06-01', '2024-06-05');
    INSERT INTO orders VALUES (100015, 10014, 4, '2024-06-15', '2024-06-20');
    INSERT INTO orders VALUES (100016, 10015, 0, '2024-07-01', '2024-07-06');
    INSERT INTO orders VALUES (100017, 10002, 2, '2024-07-12', '2024-07-16');
    INSERT INTO orders VALUES (100018, 10016, 7, '2024-07-25', '2024-07-30');
    INSERT INTO orders VALUES (100019, 10017, 1, '2024-08-05', '2024-08-10');
    INSERT INTO orders VALUES (100020, 10018, 6, '2024-08-18', '2024-08-23');
    INSERT INTO orders VALUES (100021, 10003, 3, '2024-08-30', '2024-09-04');
    INSERT INTO orders VALUES (100022, 10019, 5, '2024-09-10', '2024-09-15');
    INSERT INTO orders VALUES (100023, 10020, 1, '2024-09-22', '2024-09-26');
    INSERT INTO orders VALUES (100024, 10005, 5, '2024-10-05', '2024-10-10');
    INSERT INTO orders VALUES (100025, 10008, 0, '2024-10-18', '2024-10-23');
    INSERT INTO orders VALUES (100026, 10004, 4, '2024-11-01', '2024-11-06');
    INSERT INTO orders VALUES (100027, 10013, 1, '2024-11-15', '2024-11-19');
    INSERT INTO orders VALUES (100028, 10007, 7, '2024-11-28', '2024-12-03');
    INSERT INTO orders VALUES (100029, 10009, 2, '2024-12-10', '2024-12-15');
    INSERT INTO orders VALUES (100030, 10015, 0, '2024-12-20', '2024-12-24');

    -- Order Line Items (50 sample)
    INSERT INTO order_line_items VALUES (1, 100001, 1, 1, 1);
    INSERT INTO order_line_items VALUES (2, 100001, 2, 4, 2);
    INSERT INTO order_line_items VALUES (3, 100002, 1, 2, 1);
    INSERT INTO order_line_items VALUES (4, 100002, 2, 15, 1);
    INSERT INTO order_line_items VALUES (5, 100003, 1, 5, 1);
    INSERT INTO order_line_items VALUES (6, 100003, 2, 10, 2);
    INSERT INTO order_line_items VALUES (7, 100004, 1, 3, 1);
    INSERT INTO order_line_items VALUES (8, 100004, 2, 16, 3);
    INSERT INTO order_line_items VALUES (9, 100005, 1, 12, 1);
    INSERT INTO order_line_items VALUES (10, 100005, 2, 17, 2);
    INSERT INTO order_line_items VALUES (11, 100006, 1, 14, 1);
    INSERT INTO order_line_items VALUES (12, 100006, 2, 18, 1);
    INSERT INTO order_line_items VALUES (13, 100007, 1, 7, 1);
    INSERT INTO order_line_items VALUES (14, 100007, 2, 19, 1);
    INSERT INTO order_line_items VALUES (15, 100008, 1, 8, 1);
    INSERT INTO order_line_items VALUES (16, 100008, 2, 6, 1);
    INSERT INTO order_line_items VALUES (17, 100009, 1, 11, 1);
    INSERT INTO order_line_items VALUES (18, 100009, 2, 4, 1);
    INSERT INTO order_line_items VALUES (19, 100010, 1, 3, 1);
    INSERT INTO order_line_items VALUES (20, 100010, 2, 20, 1);
    INSERT INTO order_line_items VALUES (21, 100011, 1, 13, 1);
    INSERT INTO order_line_items VALUES (22, 100011, 2, 10, 1);
    INSERT INTO order_line_items VALUES (23, 100012, 1, 2, 1);
    INSERT INTO order_line_items VALUES (24, 100013, 1, 9, 1);
    INSERT INTO order_line_items VALUES (25, 100014, 1, 1, 1);
    INSERT INTO order_line_items VALUES (26, 100014, 2, 15, 2);
    INSERT INTO order_line_items VALUES (27, 100015, 1, 5, 1);
    INSERT INTO order_line_items VALUES (28, 100015, 2, 17, 1);
    INSERT INTO order_line_items VALUES (29, 100016, 1, 8, 2);
    INSERT INTO order_line_items VALUES (30, 100016, 2, 18, 1);
    INSERT INTO order_line_items VALUES (31, 100017, 1, 14, 1);
    INSERT INTO order_line_items VALUES (32, 100017, 2, 4, 3);
    INSERT INTO order_line_items VALUES (33, 100018, 1, 6, 1);
    INSERT INTO order_line_items VALUES (34, 100019, 1, 3, 1);
    INSERT INTO order_line_items VALUES (35, 100019, 2, 16, 2);
    INSERT INTO order_line_items VALUES (36, 100020, 1, 12, 1);
    INSERT INTO order_line_items VALUES (37, 100021, 1, 5, 1);
    INSERT INTO order_line_items VALUES (38, 100021, 2, 10, 1);
    INSERT INTO order_line_items VALUES (39, 100022, 1, 7, 1);
    INSERT INTO order_line_items VALUES (40, 100022, 2, 19, 1);
    INSERT INTO order_line_items VALUES (41, 100023, 1, 11, 1);
    INSERT INTO order_line_items VALUES (42, 100024, 1, 2, 1);
    INSERT INTO order_line_items VALUES (43, 100024, 2, 15, 1);
    INSERT INTO order_line_items VALUES (44, 100025, 1, 9, 1);
    INSERT INTO order_line_items VALUES (45, 100026, 1, 3, 1);
    INSERT INTO order_line_items VALUES (46, 100026, 2, 20, 1);
    INSERT INTO order_line_items VALUES (47, 100027, 1, 14, 1);
    INSERT INTO order_line_items VALUES (48, 100028, 1, 7, 1);
    INSERT INTO order_line_items VALUES (49, 100029, 1, 1, 1);
    INSERT INTO order_line_items VALUES (50, 100030, 1, 8, 1);
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
