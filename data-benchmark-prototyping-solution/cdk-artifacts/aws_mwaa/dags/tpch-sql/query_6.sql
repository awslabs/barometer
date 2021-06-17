/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 6 - Forecasting Revenue Change */
set query_group='RSPERF TPC-H 1.6';
SELECT	/* sql-6 */ TOP 100000 SUM(L_EXTENDEDPRICE*L_DISCOUNT)	AS REVENUE
FROM	LINEITEM
WHERE	L_SHIPDATE	>= '1994-01-01' AND
	L_SHIPDATE	< cast (date '1994-01-01' + interval '1 year' as date)	 AND
	L_DISCOUNT	BETWEEN 0.09 - 0.01 AND 0.09 + 0.01 AND
	L_QUANTITY	< 24
;