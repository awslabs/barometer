/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 5 - Local Supplier Volume */
set query_group='RSPERF TPC-H 1.5';
SELECT	/* sql-5 */ TOP 100000 N_NAME,
	SUM(L_EXTENDEDPRICE*(1-L_DISCOUNT))	AS REVENUE
FROM	CUSTOMER,
	ORDERS,
	LINEITEM,
	SUPPLIER,
	NATION,
	REGION
WHERE	C_CUSTKEY	= O_CUSTKEY AND
	L_ORDERKEY	= O_ORDERKEY AND
	L_SUPPKEY	= S_SUPPKEY AND
	C_NATIONKEY	= S_NATIONKEY AND
	S_NATIONKEY	= N_NATIONKEY AND
	N_REGIONKEY	= R_REGIONKEY AND
	R_NAME		= 'MIDDLE EAST' AND
        o_orderdate >= date '1994-01-01' and 
     o_orderdate < cast (date '1994-01-01' + interval '1 year' as date)
GROUP	BY	N_NAME
ORDER	BY	REVENUE DESC;
