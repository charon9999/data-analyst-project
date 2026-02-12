# Retail Sales Database Schema - Normalized Model
## Database: sales_analysis_db (MySQL, port 3307)

## Tables (7):
  1. customers              - PK: customer_id (INT)
  2. stores                 - PK: store_id (INT)
  3. product_categories     - PK: category_id (INT)
  4. product_subcategories  - PK: subcategory_id (INT), FK -> product_categories
  5. products               - PK: product_id (INT), FK -> product_subcategories
  6. orders                 - PK: order_number (INT), FKs -> customers, stores
  7. order_line_items       - PK: transaction_id (INT), FKs -> orders, products

## Foreign Key Relationships:
  product_subcategories.category_id   -> product_categories.category_id
  products.subcategory_id             -> product_subcategories.subcategory_id
  orders.customer_id                  -> customers.customer_id
  orders.store_id                     -> stores.store_id
  order_line_items.order_number       -> orders.order_number
  order_line_items.product_id         -> products.product_id

## Indexes:
  customers:              idx_gender, idx_country, idx_state
  stores:                 idx_country
  product_subcategories:  idx_category
  products:               idx_subcategory, idx_brand, idx_price
  orders:                 idx_customer, idx_store, idx_order_date
  order_line_items:       idx_order, idx_product, unique_order_line

## Record Counts:
  customers:              11,887
  stores:                 58
  product_categories:     8
  product_subcategories:  32
  products:               2,492
  orders:                 26,326
  order_line_items:       62,884
  TOTAL:                  ~103,689

## Normalization: Before vs After
  Before: 62,884 rows x 31 columns = 1,949,404 data points
  After:  ~103,689 rows across 7 tables (efficient normalized storage)

## Source Data:
  File: Retail Sales Dataset.xlsx
  Records: 62,884 transaction line items
  Countries: US, Canada, UK, Germany, France, Australia, Italy, Netherlands, Online
  Brands: Contoso, Adventure Works, Fabrikam, Litware, Northwind Traders, etc.
  Categories: Computers, Cell phones, TV and Video, Home Appliances,
              Cameras and camcorders, Audio, Music/Movies, Games and Toys
