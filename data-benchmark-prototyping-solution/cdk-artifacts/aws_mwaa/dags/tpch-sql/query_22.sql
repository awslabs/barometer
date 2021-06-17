/* Disable results caching */
set enable_result_cache_for_session to off;

/* TPC_H  Query 22 - Global Sales Opportunity */
set query_group='RSPERF TPC-H 1.22';
SELECT	/* sql-22 */ TOP 100000 CNTRYCODE,
	COUNT(*)	AS NUMCUST,
	SUM(C_ACCTBAL)	AS TOTACCTBAL
FROM	(	SELECT	SUBSTRING(C_PHONE,1,2)	AS CNTRYCODE,
			C_ACCTBAL
		FROM	CUSTOMER
		WHERE	SUBSTRING(C_PHONE,1,2)	IN	('32', '12', '30', '20', '29', '16', '13')	AND
			C_ACCTBAL		>	(	SELECT	AVG(C_ACCTBAL)
								FROM	CUSTOMER
								WHERE	C_ACCTBAL	> 0.00	AND
									SUBSTRING(C_PHONE,1,2)	IN	('32', '12', '30', '20', '29', '16', '13')
							)	AND
			NOT EXISTS	(	SELECT	*
						FROM	ORDERS
						WHERE	O_CUSTKEY	= C_CUSTKEY
					)
	)	AS CUSTSALE
GROUP	BY	CNTRYCODE
ORDER	BY	CNTRYCODE;