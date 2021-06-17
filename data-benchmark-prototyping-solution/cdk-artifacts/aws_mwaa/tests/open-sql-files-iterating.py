sql_dir = 'C:\\Users\\carcarre\\Documents\\Projects\\Reusable Assets\\TPCH_Benchmark_Redshift_v1\\src\\data-benchmark-prototyping-solution\\src\\aws-mwaa\\dags\\tpch-sql\\'
queries_dict = {}
key = 1

while key < 23:
    sql_file = '{}query_{}.sql'.format(sql_dir, key)
    sql_query = open(sql_file).read()
    key_dict = 'sql_{}'.format(key)
    queries_dict[key_dict] = sql_query
    # print(queries_dict[key_dict])
    key += 1

for k, v in queries_dict.items():
    print(k, v)
