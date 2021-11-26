/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createWorkload = /* GraphQL */ `
  mutation CreateWorkload(
    $input: CreateWorkloadInput!
    $condition: ModelWorkloadConditionInput
  ) {
    createWorkload(input: $input, condition: $condition) {
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
export const updateWorkload = /* GraphQL */ `
  mutation UpdateWorkload(
    $input: UpdateWorkloadInput!
    $condition: ModelWorkloadConditionInput
  ) {
    updateWorkload(input: $input, condition: $condition) {
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
export const deleteWorkload = /* GraphQL */ `
  mutation DeleteWorkload(
    $input: DeleteWorkloadInput!
    $condition: ModelWorkloadConditionInput
  ) {
    deleteWorkload(input: $input, condition: $condition) {
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
export const createExperiment = /* GraphQL */ `
  mutation CreateExperiment(
    $input: CreateExperimentInput!
    $condition: ModelExperimentConditionInput
  ) {
    createExperiment(input: $input, condition: $condition) {
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
export const updateExperiment = /* GraphQL */ `
  mutation UpdateExperiment(
    $input: UpdateExperimentInput!
    $condition: ModelExperimentConditionInput
  ) {
    updateExperiment(input: $input, condition: $condition) {
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
export const deleteExperiment = /* GraphQL */ `
  mutation DeleteExperiment(
    $input: DeleteExperimentInput!
    $condition: ModelExperimentConditionInput
  ) {
    deleteExperiment(input: $input, condition: $condition) {
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
export const createPlatform = /* GraphQL */ `
  mutation CreatePlatform(
    $input: CreatePlatformInput!
    $condition: ModelPlatformConditionInput
  ) {
    createPlatform(input: $input, condition: $condition) {
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
export const updatePlatform = /* GraphQL */ `
  mutation UpdatePlatform(
    $input: UpdatePlatformInput!
    $condition: ModelPlatformConditionInput
  ) {
    updatePlatform(input: $input, condition: $condition) {
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
export const deletePlatform = /* GraphQL */ `
  mutation DeletePlatform(
    $input: DeletePlatformInput!
    $condition: ModelPlatformConditionInput
  ) {
    deletePlatform(input: $input, condition: $condition) {
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
