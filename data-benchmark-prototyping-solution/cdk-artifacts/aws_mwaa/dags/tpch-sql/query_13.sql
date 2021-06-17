/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 13 - Customer Distribution */
set query_group='RSPERF TPC-H 1.13';

SELECT	/* sql-13 */ TOP 100000 C_COUNT,
	COUNT(*)	AS CUSTDIST
FROM	(	SELECT	C_CUSTKEY,
			COUNT(O_ORDERKEY)
		FROM	CUSTOMER left outer join ORDERS on
			C_CUSTKEY	= O_CUSTKEY		AND
			O_COMMENT	not like '%special%requests%'
		GROUP	BY	C_CUSTKEY
	)	AS C_ORDERS (C_CUSTKEY, C_COUNT)
GROUP	BY	C_COUNT
ORDER	BY	CUSTDIST	DESC,
		C_COUNT		DESC
;