/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWorkload = /* GraphQL */ `
  query GetWorkload($id: ID!) {
    getWorkload(id: $id) {
      id
      name
      dataset
      loadMethod
      usePartitioning
      scalingFactor
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listWorkloads = /* GraphQL */ `
  query ListWorkloads(
    $filter: ModelWorkloadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkloads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        dataset
        loadMethod
        usePartitioning
        scalingFactor
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getExperiment = /* GraphQL */ `
  query GetExperiment($id: ID!) {
    getExperiment(id: $id) {
      id
      executionMode
      concurrentSessionCount
      keepInfrastructure
      workload {
        id
        name
        dataset
        loadMethod
        usePartitioning
        scalingFactor
        createdAt
        updatedAt
        owner
      }
      platform {
        id
        name
        platformType
        nodeType
        numberOfNodes
        workloadManager
        concurrencyScaling
        aqua
        spectrum
        enforceWorkgroupConfiguration
        bytesScannedCutoffPerQuery
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listExperiments = /* GraphQL */ `
  query ListExperiments(
    $filter: ModelExperimentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExperiments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        executionMode
        concurrentSessionCount
        keepInfrastructure
        workload {
          id
          name
          dataset
          loadMethod
          usePartitioning
          scalingFactor
          createdAt
          updatedAt
          owner
        }
        platform {
          id
          name
          platformType
          nodeType
          numberOfNodes
          workloadManager
          concurrencyScaling
          aqua
          spectrum
          enforceWorkgroupConfiguration
          bytesScannedCutoffPerQuery
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getPlatform = /* GraphQL */ `
  query GetPlatform($id: ID!) {
    getPlatform(id: $id) {
      id
      name
      platformType
      nodeType
      numberOfNodes
      workloadManager
      concurrencyScaling
      aqua
      spectrum
      enforceWorkgroupConfiguration
      bytesScannedCutoffPerQuery
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listPlatforms = /* GraphQL */ `
  query ListPlatforms(
    $filter: ModelPlatformFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPlatforms(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        platformType
        nodeType
        numberOfNodes
        workloadManager
        concurrencyScaling
        aqua
        spectrum
        enforceWorkgroupConfiguration
        bytesScannedCutoffPerQuery
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
