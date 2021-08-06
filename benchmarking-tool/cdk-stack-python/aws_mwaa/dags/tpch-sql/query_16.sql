/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 16 - Parts/Supplier Relationship */
set query_group='RSPERF TPC-H 1.16';
SELECT	/* sql-16 */ TOP 100000 P_BRAND,
	P_TYPE,
	P_SIZE,
	COUNT(DISTINCT PS_SUPPKEY)	AS SUPPLIER_CNT
FROM	PARTSUPP,
	PART
WHERE	P_PARTKEY	= PS_PARTKEY				AND
	P_BRAND		<> 'Brand#23'					AND
	P_TYPE		NOT LIKE 'MEDIUM ANODIZED%'				AND
	P_SIZE		IN (1, 32, 33, 46, 7, 42, 21, 40)	AND
	PS_SUPPKEY	NOT IN	(	SELECT	S_SUPPKEY
					FROM	SUPPLIER
					WHERE	S_COMMENT	LIKE '%Customer%Complaints%'
				)
GROUP	BY	P_BRAND,
		P_TYPE,
		P_SIZE
ORDER	BY	SUPPLIER_CNT	DESC,
		P_BRAND,
		P_TYPE,
		P_SIZE
;