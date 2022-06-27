# Step function helper lambda function

## Input

### listS3Directories

```json
{
  "method": "listS3Directories",
  "parameters": {
    "basePath": "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl"
  }
}
```

### listS3Paths

```json
{
  "method": "listS3Paths",
  "parameters": {
    "extension": ".sql",
    "basePath": "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl"
  }
}
```

### getUserSessionAsMapItems

```json
{
  "method": "getUserSessionAsMapItems",
  "parameters": {
    "sessionCount": 3,
    "userSecrets": {
      "secretIds": [
        "user1.SecretId",
        "user2.SecretId"
      ]
    }
  }
}
```

### getS3BucketRegion

```json
{
  "method": "getS3BucketRegion",
  "parameters": {
    "path": "s3://my-bucket/my-folder"
  }
}
```

## Environment variables

## Process

1. Takes method & parameters.
2. Invokes given method by passing parameters to it & returns output.

### Supported Methods

1. `listS3Paths`: Takes s3 `basePath`, lists all object paths ending with `extension`

## Output

### listS3Directories

```json
{
  "paths": [
    "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl/sub-dir-1",
    "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl/sub-dir-2"
  ]
}
```

### listS3Paths

```json
{
  "paths": [
    "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl/1.sql",
    "s3://benchmarkingstack-databuckete3889a50/tpc/tpc-h/ddl/2.sql"
  ]
}
```

### getUserSessionAsMapItems

```json
{
  "userSessions": [
    {
      "secretId": "secretId.user1",
      "sessionId": "1"
    },
    {
      "secretId": "secretId.user1",
      "sessionId": "2"
    },
    {
      "secretId": "secretId.user1",
      "sessionId": "3"
    },
    {
      "secretId": "secretId.user2",
      "sessionId": "1"
    },
    {
      "secretId": "secretId.user2",
      "sessionId": "2"
    },
    {
      "secretId": "secretId.user2",
      "sessionId": "3"
    }
  ]
}
```

### getS3BucketRegion

```json
{
  "path": "s3://my-bucket/my-folder",
  "region": "us-east-1",
  "bucket": "my-bucket"
}
```