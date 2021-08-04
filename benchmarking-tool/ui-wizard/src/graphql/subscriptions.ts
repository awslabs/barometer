/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateWorkload = /* GraphQL */ `
  subscription OnCreateWorkload($owner: String!) {
    onCreateWorkload(owner: $owner) {
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
export const onUpdateWorkload = /* GraphQL */ `
  subscription OnUpdateWorkload($owner: String!) {
    onUpdateWorkload(owner: $owner) {
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
export const onDeleteWorkload = /* GraphQL */ `
  subscription OnDeleteWorkload($owner: String!) {
    onDeleteWorkload(owner: $owner) {
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
export const onCreateExperiment = /* GraphQL */ `
  subscription OnCreateExperiment($owner: String!) {
    onCreateExperiment(owner: $owner) {
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
export const onUpdateExperiment = /* GraphQL */ `
  subscription OnUpdateExperiment($owner: String!) {
    onUpdateExperiment(owner: $owner) {
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
export const onDeleteExperiment = /* GraphQL */ `
  subscription OnDeleteExperiment($owner: String!) {
    onDeleteExperiment(owner: $owner) {
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
export const onCreatePlatform = /* GraphQL */ `
  subscription OnCreatePlatform($owner: String!) {
    onCreatePlatform(owner: $owner) {
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
export const onUpdatePlatform = /* GraphQL */ `
  subscription OnUpdatePlatform($owner: String!) {
    onUpdatePlatform(owner: $owner) {
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
export const onDeletePlatform = /* GraphQL */ `
  subscription OnDeletePlatform($owner: String!) {
    onDeletePlatform(owner: $owner) {
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
