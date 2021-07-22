/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 15 - Create View for Top Supplier Query */
set query_group='RSPERF TPC-H 1.15';
WITH /* sql-15 */ revenue1 AS (
    select
        l_suppkey as supplier_no,
        sum(l_extendedprice * (1 - l_discount)) as total_revenue
    from
        lineitem
    where
        L_SHIPDATE	>= '1995-02-01' AND
	L_SHIPDATE	< cast (date '1995-02-01' + interval '3 months' as date)
    group by
        l_suppkey)
select TOP 100000 
    s_suppkey,
    s_name,
    s_address,
    s_phone,
    total_revenue
from
    supplier,
    revenue1
where
    s_suppkey = supplier_no
    and total_revenue = (
        select
            max(total_revenue)
        from
            revenue1
    )
order by
    s_suppkey;
