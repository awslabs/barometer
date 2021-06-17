/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 17 - Small-Quantity-Order Revenue */
set query_group='RSPERF TPC-H 1.17';
SELECT	/* sql-17 */ TOP 100000 SUM(L_EXTENDEDPRICE)/7.0	AS AVG_YEARLY
FROM	LINEITEM,
	PART
WHERE	P_PARTKEY	= L_PARTKEY	AND
	P_BRAND		= 'Brand#32'		AND
	P_CONTAINER	= 'SM CASE'		AND
	L_QUANTITY	<	(	SELECT	0.2 * AVG(L_QUANTITY)
					FROM	LINEITEM
					WHERE	L_PARTKEY	= P_PARTKEY
				)
;