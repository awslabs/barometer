# Step function helper lambda function

## Input

### listS3Directories

```json
{
  "method": "listS3Directories",
  "parameters": {
    "basePath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl"
  }
}
```

### listS3Paths

```json
{
  "method": "listS3Paths",
  "parameters": {
    "extension": ".sql",
    "basePath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl"
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
    "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/sub-dir-1",
    "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/sub-dir-2"
  ]
}
```

### listS3Paths

```json
{
  "paths": [
    "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/1.sql",
    "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/2.sql"
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