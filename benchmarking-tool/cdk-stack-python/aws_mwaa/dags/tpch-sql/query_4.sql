/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 4 - Order Priority Checking */
set query_group='RSPERF TPC-H 1.4';
SELECT	/* sql-4 */ TOP 100000 O_ORDERPRIORITY,
	COUNT(*)		AS ORDER_COUNT
FROM	ORDERS
WHERE	O_ORDERDATE	>= '1997-04-01' AND
	O_ORDERDATE	< cast (date '1997-04-01' + interval '3 months' as date) AND
	EXISTS		(	SELECT	*
				FROM	LINEITEM
				WHERE	L_ORDERKEY	= O_ORDERKEY AND
					L_COMMITDATE	< L_RECEIPTDATE
			)
GROUP	BY	O_ORDERPRIORITY
ORDER	BY	O_ORDERPRIORITY
;