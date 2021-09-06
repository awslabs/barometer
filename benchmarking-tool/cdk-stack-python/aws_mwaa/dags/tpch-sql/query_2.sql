/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 2 - Minimum Cost Supplier */
set query_group='RSPERF TPC-H 1.2';
SELECT	/* sql-2 */ TOP 100000 
	S_ACCTBAL,
	S_NAME,
	N_NAME,
	P_PARTKEY,
	P_MFGR,
	S_ADDRESS,
	S_PHONE,
	S_COMMENT
FROM	PART,
	SUPPLIER,
	PARTSUPP,
	NATION,
	REGION
WHERE	P_PARTKEY	= PS_PARTKEY AND
	S_SUPPKEY	= PS_SUPPKEY AND
	P_SIZE		= 34 AND
	P_TYPE		LIKE '%COPPER' AND
	S_NATIONKEY	= N_NATIONKEY AND
	N_REGIONKEY	= R_REGIONKEY AND
	R_NAME		= 'MIDDLE EAST' AND
	PS_SUPPLYCOST	= (	SELECT	MIN(PS_SUPPLYCOST)
				FROM	PARTSUPP,
					SUPPLIER,
					NATION,
					REGION
				WHERE	P_PARTKEY	= PS_PARTKEY AND
					S_SUPPKEY	= PS_SUPPKEY AND
					S_NATIONKEY	= N_NATIONKEY AND
					N_REGIONKEY	= R_REGIONKEY AND
					R_NAME		= 'MIDDLE EAST'
			  )
ORDER	BY	S_ACCTBAL DESC,
		N_NAME,
		S_NAME,
		P_PARTKEY
;