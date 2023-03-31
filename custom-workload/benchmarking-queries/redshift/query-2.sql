/* Disable results caching */
set enable_result_cache_for_session to off;

/* Tagging  query for better monitoring */
SET query_group='barometer-q2';

/* Barometer Query 2 - Sales by preferred bank and by country */
select 
  cust.country, 
  sales.payment_card_provider, 
  count(1) total_transactions 
from 
  fact_online_transactions as sales 
  inner join dim_customers as cust on (
    sales.customer_id = cust.customer_id
  ) 
group by 
  cust.country, 
  sales.payment_card_provider 
order by 
  cust.country, 
  sales.payment_card_provider;