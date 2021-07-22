/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 10 - Returned Item Reporting */
set query_group='RSPERF TPC-H 1.10';
SELECT	/* sql-10 */ TOP 100000 
	C_CUSTKEY,
	C_NAME,
	SUM(L_EXTENDEDPRICE*(1-L_DISCOUNT))	AS REVENUE,
	C_ACCTBAL,
	N_NAME,
	C_ADDRESS,
	C_PHONE,
	C_COMMENT
FROM	CUSTOMER,
	ORDERS,
	LINEITEM,
	NATION
WHERE	C_CUSTKEY	= O_CUSTKEY		AND
	L_ORDERKEY	= O_ORDERKEY		AND
	O_ORDERDATE	>= '1994-01-01'			AND
	O_ORDERDATE < cast (date '1994-01-01' + interval '3 months' as date) AND
	L_RETURNFLAG	= 'R'			AND
	C_NATIONKEY	= N_NATIONKEY
GROUP	BY	C_CUSTKEY,
		C_NAME,
		C_ACCTBAL,
		C_PHONE,
		N_NAME,
		C_ADDRESS,
		C_COMMENT
ORDER	BY	REVENUE	DESC
;-- using 821113222 as a seed to the RNG