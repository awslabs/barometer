# Step function helper lambda function

## Input

### listS3Paths

```json
{
  "method": "listS3Paths",
  "parameters": {
    "basePath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/",
    "extension": ".sql"
  }
}
```

### getUserSessionAsMapItems

```json
{
  "method": "getUserSessionAsMapItems",
  "parameters": {
    "sessionCount": "3",
    "userSecrets": [
      "secretId.user1",
      "secretId.user2"
    ]
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