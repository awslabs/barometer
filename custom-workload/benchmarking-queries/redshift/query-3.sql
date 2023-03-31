/* Disable results caching */
set enable_result_cache_for_session to off;

/* Tagging  query for better monitoring */
SET query_group='barometer-q3';

/* Barometer Query 3 - Sales by country all Time */ 
select 
  cust.country, 
  sum(prods.price_usd) total_sales 
from 
  fact_online_transactions as sales 
  inner join dim_customers as cust on (sales.customer_id = cust.customer_id) 
  inner join dim_products as prods on (sales.product_id = prods.product_id)
group by 
  cust.country
order by 
  cust.country;
