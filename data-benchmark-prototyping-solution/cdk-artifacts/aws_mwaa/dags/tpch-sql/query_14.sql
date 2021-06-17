/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 14 - Promotion Effect */
set query_group='RSPERF TPC-H 1.14';

SELECT	/* sql-14 */ TOP 100000 100.00 * SUM	(	CASE	WHEN P_TYPE LIKE 'PROMO%'
					THEN L_EXTENDEDPRICE*(1-L_DISCOUNT)
					ELSE 0
				END) / SUM(L_EXTENDEDPRICE*(1-L_DISCOUNT))	AS PROMO_REVENUE
FROM	LINEITEM,
	PART
WHERE	L_PARTKEY	= P_PARTKEY	AND
	L_SHIPDATE	>= '1995-01-01'		AND
        L_SHIPDATE < cast (date '1995-01-01' + interval '1 month' as date)
;
