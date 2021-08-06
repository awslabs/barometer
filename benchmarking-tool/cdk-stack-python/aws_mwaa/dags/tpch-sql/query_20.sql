/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 20 - Potential Part Promotion */
set query_group='RSPERF TPC-H 1.20';
SELECT	/* sql-20 */ TOP 100000 S_NAME,
	S_ADDRESS
FROM	SUPPLIER,
	NATION
WHERE	S_SUPPKEY	IN	(	SELECT	PS_SUPPKEY
					FROM	PARTSUPP
					WHERE	PS_PARTKEY in	(	SELECT	P_PARTKEY
									FROM	PART
									WHERE	P_NAME like 'olive%'
								)	AND
					PS_AVAILQTY	>	(	SELECT	0.5 * sum(L_QUANTITY)
									FROM	LINEITEM
									WHERE	L_PARTKEY	= PS_PARTKEY	AND
										L_SUPPKEY 	= PS_SUPPKEY	AND
										L_SHIPDATE	>= '1996-01-01'		AND
										L_SHIPDATE	< cast (date '1996-01-01' + interval '1 year' as date)
								)
				)	AND
	S_NATIONKEY	= N_NATIONKEY	AND
	N_NAME		= 'RUSSIA'
ORDER	BY	S_NAME
;
