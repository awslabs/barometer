import json
import os
import fcntl
import sqlite3
from datetime import datetime
import random
import string

MSG_FILE_PATH = '/mnt/grafana'
con = sqlite3.connect("/mnt/grafana/grafana.db") 

def lambda_handler(event, context): 
    
    # printing lowercase
    letters = string.ascii_lowercase 
    datasource_uid  = ''.join(random.choice(letters) for i in range(9)) 
    dashboard_uid  = 'barometer1'#''.join(random.choice(letters) for i in range(9)) 
    sql_created_updated_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    dashboard_name='Barometer'
    
    cur = con.cursor() 
    
    # list tables
    #res = cur.execute("SELECT name FROM sqlite_master WHERE type='table'")#"SELECT title FROM dashboard")#cur.execute("PRAGMA table_info(dashboard)")#where title='TestVincent3'
    #print(res.fetchall())
    
    #data_source
    res = cur.execute("SELECT COUNT(*) FROM data_source") 
    count = cur.fetchone()[0]
    print(count) 
    if count == 0 :
        print('no data source')
        json_auth='{"authType":"default"}'
        # https://pynative.com/python-sqlite-blob-insert-and-retrieve-digital-data/
        stringinsertsource = "INSERT INTO data_source ('org_id', 'version', 'type', 'name', 'access', 'url', 'password', 'user', 'database', 'basic_auth','basic_auth_user', 'basic_auth_password', 'is_default', 'json_data', 'created', 'updated', 'with_credentials', 'secure_json_data',  'read_only',   'uid' ) VALUES ( ? , ? , ? , ? , ? ,  ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?  );"
        data_tuple = ( 1, 2, 'cloudwatch', 'CloudWatch', 'proxy', '', '', '', '', 0, '', '', 0, b'{"authType":"default"}', '2022-09-28 10:12:16', '2022-09-28 10:12:23', 0, '{}', 0, 'kWLxJG44z')
        cur.execute("BEGIN;")
        result=cur.execute(stringinsertsource, data_tuple)
        cur.execute("COMMIT;")
        
        configPath = os.environ['LAMBDA_TASK_ROOT'] + "/templates/grafana_dashboard.json"
        dashboard_dump= open(configPath).read()
        stringinsert = "INSERT INTO dashboard ('uid','version','slug','title','data','org_id','created','updated','gnet_id','plugin_id','folder_id', 'is_folder','has_acl','is_public') VALUES('" + dashboard_uid + "', 0, '" + dashboard_name + "','" + dashboard_name + "','" + dashboard_dump + "',   1,'" + sql_created_updated_date + "','" + sql_created_updated_date + "',0,'',0,0,0,0);"
        cur.execute("BEGIN;")
        result=cur.execute(stringinsert)
        cur.execute("COMMIT;")
    else :
        res = cur.execute("SELECT * FROM data_source")
        print(res.fetchall())
        #res = cur.execute("PRAGMA table_info(data_source)")
        #print(res.fetchall())
        
        # stringinsert = "INSERT INTO dashboard ('uid','version','slug','title','data','org_id','created','updated','gnet_id','plugin_id','folder_id', 'is_folder','has_acl','is_public') VALUES('OBNcCx7Vz', 0, '" + dashboardname + "','" + dashboardname + "','" + json_object_docker + "',   1,'2022-09-21 13:52:09','2022-09-21 13:52:09',0,'', 0, 0, 0,0);"
        # cur.execute("BEGIN;")
        # result=cur.execute(stringinsert)
        # cur.execute("COMMIT;")
        
    #res = cur.execute("SELECT title FROM dashboard")
    #res = cur.execute("PRAGMA table_info(api_key)")
    #res = cur.execute("SELECT id, org_id, name, key,role,created,updated, expires,service_account_id,last_used_at FROM api_key")
    
    #eyJrIjoiUGR4ODJhY2d0OEJqelc5cmlQUUJYc3FJZkpqSDNTTXgiLCJuIjoibGFtYmRhIiwiaWQiOjF9
    #decode https://emn178.github.io/online-tools/base64_decode.html
    #Base64
    #{"k":"Pdx82acgt8BjzW9riPQBXsqIfJjH3SMx","n":"lambda","id":1}
    #key value : eyJrIjoiUGR4ODJhY2d0OEJqelc5cmlQUUJYc3FJZkpqSDNTTXgiLCJuIjoibGFtYmRhIiwiaWQiOjF9
    #print(res.fetchall())
    #res = cur.execute("SELECT name FROM user")
   # print(res.fetchall())
    # for root, dirs, files in os.walk(MSG_FILE_PATH):
    #     for filename in files:
    #         print(filename)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
