/* Disable results caching */
set enable_result_cache_for_session to off;

/* Tagging  query for better monitoring */
SET query_group='barometer-q5';

/* Barometer Query 5 - Stock analysis sales by country and channel */ 
select 
  cust.country,
  sales.channel,
  sales.attempts,
  (case 
  	when sales.attempts = 1 then 'Successful purchase'
  	when sales.attempts = 2 then 'Warning: errors in purchase'
  	when sales.attempts = 3 then 'Critical: confirm purchase happened in Sales system'
  end
  ),
  sum(prods.price_usd) total_sales 
from 
  fact_online_transactions as sales 
  inner join dim_customers as cust on (sales.customer_id = cust.customer_id) 
  inner join dim_products as prods on (sales.product_id = prods.product_id)
group by 
  cust.country, sales.channel, sales.attempts
order by 
  cust.country, sales.channel, sales.attempts;
