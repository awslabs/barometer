/* Disable results caching */
set enable_result_cache_for_session to off;

/* Tagging  query for better monitoring */
SET query_group='barometer-q4';

/* Barometer Query 4 - Stock analysis sales by country */ 
select 
  cust.country, 
  sales.in_stock, 
  count(1) count_total 
from 
  fact_online_transactions as sales 
  inner join dim_customers as cust on (
    sales.customer_id = cust.customer_id
  ) 
group by 
  cust.country,
  sales.in_stock
order by 
  cust.country,
 sales.in_stock;
