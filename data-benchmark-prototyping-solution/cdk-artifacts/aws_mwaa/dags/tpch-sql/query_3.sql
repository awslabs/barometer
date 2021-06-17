/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 3 - Shipping Priority */
set query_group='RSPERF TPC-H 1.3';
SELECT	/* sql-3 */ TOP 100000 
	L_ORDERKEY,
	SUM(L_EXTENDEDPRICE*(1-L_DISCOUNT))	AS REVENUE,
	O_ORDERDATE,
	O_SHIPPRIORITY
FROM	CUSTOMER,
	ORDERS,
	LINEITEM
WHERE	C_MKTSEGMENT	= 'FURNITURE' AND
	C_CUSTKEY	= O_CUSTKEY AND
	L_ORDERKEY	= O_ORDERKEY AND
	O_ORDERDATE	< '1995-03-28' AND
	L_SHIPDATE	> '1995-03-28'
GROUP	BY	L_ORDERKEY,
		O_ORDERDATE,
		O_SHIPPRIORITY
ORDER	BY	REVENUE DESC,
		O_ORDERDATE
;