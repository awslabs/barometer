/* 
 By default, tables created without explicitly defining sort keys or distributions keys are set to AUTO
 More at https://go.aws/3Z9Fj6q
 */

CREATE TABLE IF NOT EXISTS dim_customers(
  customer_id bigint not null, 
  country varchar(50), 
  name varchar(50), 
  email varchar(50), 
  address varchar(500)
  );


CREATE TABLE IF NOT EXISTS dim_products(
  product_id int not null, 
  product_name varchar(50), 
  category int, 
  price_usd double precision 
  );


CREATE TABLE IF NOT EXISTS fact_online_transactions(
  customer_id bigint not null, 
  payment_card_provider varchar(50), 
  payment_card_number varchar(50), 
  attempts int, 
  items int, 
  purchase_date date, 
  purchase_id int not null, 
  product_id int not null, 
  in_stock varchar(20), 
  channel varchar(20), 
  ip_address varchar(20)
  );