/* Disable results caching */
SET enable_result_cache_for_session to off;

/* Tagging  query for better monitoring */
SET query_group='barometer-q1';

/* Barometer Query 1 - Sales by customers demography */
select 
  cust.customer_id, 
  cust.country, 
  sales.channel, 
  count(1)
from 
  fact_online_transactions as sales 
  inner join dim_customers as cust on (
    sales.customer_id = cust.customer_id
  )
group by cust.customer_id, 
  cust.country, 
  sales.channel
order by cust.customer_id, 
  cust.country, 
  sales.channel;