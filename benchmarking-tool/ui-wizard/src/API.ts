/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateWorkloadInput = {
  id?: string | null,
  name: string,
  dataset: string,
  loadMethod: string,
  usePartitioning: boolean,
  scalingFactor: number,
};

export type ModelWorkloadConditionInput = {
  name?: ModelStringInput | null,
  dataset?: ModelStringInput | null,
  loadMethod?: ModelStringInput | null,
  usePartitioning?: ModelBooleanInput | null,
  scalingFactor?: ModelIntInput | null,
  and?: Array< ModelWorkloadConditionInput | null > | null,
  or?: Array< ModelWorkloadConditionInput | null > | null,
  not?: ModelWorkloadConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Workload = {
  __typename: "Workload",
  id: string,
  name: string,
  dataset: string,
  loadMethod: string,
  usePartitioning: boolean,
  scalingFactor: number,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateWorkloadInput = {
  id: string,
  name?: string | null,
  dataset?: string | null,
  loadMethod?: string | null,
  usePartitioning?: boolean | null,
  scalingFactor?: number | null,
};

export type DeleteWorkloadInput = {
  id: string,
};

export type CreateExperimentInput = {
  id?: string | null,
  executionMode: string,
  concurrentSessionCount: number,
  keepInfrastructure: boolean,
  experimentWorkloadId: string,
  experimentPlatformId: string,
};

export type ModelExperimentConditionInput = {
  executionMode?: ModelStringInput | null,
  concurrentSessionCount?: ModelIntInput | null,
  keepInfrastructure?: ModelBooleanInput | null,
  and?: Array< ModelExperimentConditionInput | null > | null,
  or?: Array< ModelExperimentConditionInput | null > | null,
  not?: ModelExperimentConditionInput | null,
};

export type Experiment = {
  __typename: "Experiment",
  id: string,
  executionMode: string,
  concurrentSessionCount: number,
  keepInfrastructure: boolean,
  workload: Workload,
  platform: Platform,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type Platform = {
  __typename: "Platform",
  id: string,
  name: string,
  platformType: string,
  nodeType?: string | null,
  numberOfNodes?: number | null,
  workloadManager?: boolean | null,
  concurrencyScaling?: boolean | null,
  aqua?: boolean | null,
  spectrum?: boolean | null,
  enforceWorkgroupConfiguration?: boolean | null,
  bytesScannedCutoffPerQuery?: number | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateExperimentInput = {
  id: string,
  executionMode?: string | null,
  concurrentSessionCount?: number | null,
  keepInfrastructure?: boolean | null,
  experimentWorkloadId?: string | null,
  experimentPlatformId?: string | null,
};

export type DeleteExperimentInput = {
  id: string,
};

export type CreatePlatformInput = {
  id?: string | null,
  name: string,
  platformType: string,
  nodeType?: string | null,
  numberOfNodes?: number | null,
  workloadManager?: boolean | null,
  concurrencyScaling?: boolean | null,
  aqua?: boolean | null,
  spectrum?: boolean | null,
  enforceWorkgroupConfiguration?: boolean | null,
  bytesScannedCutoffPerQuery?: number | null,
};

export type ModelPlatformConditionInput = {
  name?: ModelStringInput | null,
  platformType?: ModelStringInput | null,
  nodeType?: ModelStringInput | null,
  numberOfNodes?: ModelIntInput | null,
  workloadManager?: ModelBooleanInput | null,
  concurrencyScaling?: ModelBooleanInput | null,
  aqua?: ModelBooleanInput | null,
  spectrum?: ModelBooleanInput | null,
  enforceWorkgroupConfiguration?: ModelBooleanInput | null,
  bytesScannedCutoffPerQuery?: ModelIntInput | null,
  and?: Array< ModelPlatformConditionInput | null > | null,
  or?: Array< ModelPlatformConditionInput | null > | null,
  not?: ModelPlatformConditionInput | null,
};

export type UpdatePlatformInput = {
  id: string,
  name?: string | null,
  platformType?: string | null,
  nodeType?: string | null,
  numberOfNodes?: number | null,
  workloadManager?: boolean | null,
  concurrencyScaling?: boolean | null,
  aqua?: boolean | null,
  spectrum?: boolean | null,
  enforceWorkgroupConfiguration?: boolean | null,
  bytesScannedCutoffPerQuery?: number | null,
};

export type DeletePlatformInput = {
  id: string,
};

export type ModelWorkloadFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  dataset?: ModelStringInput | null,
  loadMethod?: ModelStringInput | null,
  usePartitioning?: ModelBooleanInput | null,
  scalingFactor?: ModelIntInput | null,
  and?: Array< ModelWorkloadFilterInput | null > | null,
  or?: Array< ModelWorkloadFilterInput | null > | null,
  not?: ModelWorkloadFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelWorkloadConnection = {
  __typename: "ModelWorkloadConnection",
  items?:  Array<Workload | null > | null,
  nextToken?: string | null,
};

export type ModelExperimentFilterInput = {
  id?: ModelIDInput | null,
  executionMode?: ModelStringInput | null,
  concurrentSessionCount?: ModelIntInput | null,
  keepInfrastructure?: ModelBooleanInput | null,
  and?: Array< ModelExperimentFilterInput | null > | null,
  or?: Array< ModelExperimentFilterInput | null > | null,
  not?: ModelExperimentFilterInput | null,
};

export type ModelExperimentConnection = {
  __typename: "ModelExperimentConnection",
  items?:  Array<Experiment | null > | null,
  nextToken?: string | null,
};

export type ModelPlatformFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  platformType?: ModelStringInput | null,
  nodeType?: ModelStringInput | null,
  numberOfNodes?: ModelIntInput | null,
  workloadManager?: ModelBooleanInput | null,
  concurrencyScaling?: ModelBooleanInput | null,
  aqua?: ModelBooleanInput | null,
  spectrum?: ModelBooleanInput | null,
  enforceWorkgroupConfiguration?: ModelBooleanInput | null,
  bytesScannedCutoffPerQuery?: ModelIntInput | null,
  and?: Array< ModelPlatformFilterInput | null > | null,
  or?: Array< ModelPlatformFilterInput | null > | null,
  not?: ModelPlatformFilterInput | null,
};

export type ModelPlatformConnection = {
  __typename: "ModelPlatformConnection",
  items?:  Array<Platform | null > | null,
  nextToken?: string | null,
};

export type CreateWorkloadMutationVariables = {
  input: CreateWorkloadInput,
  condition?: ModelWorkloadConditionInput | null,
};

export type CreateWorkloadMutation = {
  createWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateWorkloadMutationVariables = {
  input: UpdateWorkloadInput,
  condition?: ModelWorkloadConditionInput | null,
};

export type UpdateWorkloadMutation = {
  updateWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteWorkloadMutationVariables = {
  input: DeleteWorkloadInput,
  condition?: ModelWorkloadConditionInput | null,
};

export type DeleteWorkloadMutation = {
  deleteWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateExperimentMutationVariables = {
  input: CreateExperimentInput,
  condition?: ModelExperimentConditionInput | null,
};

export type CreateExperimentMutation = {
  createExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateExperimentMutationVariables = {
  input: UpdateExperimentInput,
  condition?: ModelExperimentConditionInput | null,
};

export type UpdateExperimentMutation = {
  updateExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteExperimentMutationVariables = {
  input: DeleteExperimentInput,
  condition?: ModelExperimentConditionInput | null,
};

export type DeleteExperimentMutation = {
  deleteExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreatePlatformMutationVariables = {
  input: CreatePlatformInput,
  condition?: ModelPlatformConditionInput | null,
};

export type CreatePlatformMutation = {
  createPlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdatePlatformMutationVariables = {
  input: UpdatePlatformInput,
  condition?: ModelPlatformConditionInput | null,
};

export type UpdatePlatformMutation = {
  updatePlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeletePlatformMutationVariables = {
  input: DeletePlatformInput,
  condition?: ModelPlatformConditionInput | null,
};

export type DeletePlatformMutation = {
  deletePlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetWorkloadQueryVariables = {
  id: string,
};

export type GetWorkloadQuery = {
  getWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListWorkloadsQueryVariables = {
  filter?: ModelWorkloadFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListWorkloadsQuery = {
  listWorkloads?:  {
    __typename: "ModelWorkloadConnection",
    items?:  Array< {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetExperimentQueryVariables = {
  id: string,
};

export type GetExperimentQuery = {
  getExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListExperimentsQueryVariables = {
  filter?: ModelExperimentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListExperimentsQuery = {
  listExperiments?:  {
    __typename: "ModelExperimentConnection",
    items?:  Array< {
      __typename: "Experiment",
      id: string,
      executionMode: string,
      concurrentSessionCount: number,
      keepInfrastructure: boolean,
      workload:  {
        __typename: "Workload",
        id: string,
        name: string,
        dataset: string,
        loadMethod: string,
        usePartitioning: boolean,
        scalingFactor: number,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      platform:  {
        __typename: "Platform",
        id: string,
        name: string,
        platformType: string,
        nodeType?: string | null,
        numberOfNodes?: number | null,
        workloadManager?: boolean | null,
        concurrencyScaling?: boolean | null,
        aqua?: boolean | null,
        spectrum?: boolean | null,
        enforceWorkgroupConfiguration?: boolean | null,
        bytesScannedCutoffPerQuery?: number | null,
        createdAt: string,
        updatedAt: string,
        owner?: string | null,
      },
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetPlatformQueryVariables = {
  id: string,
};

export type GetPlatformQuery = {
  getPlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListPlatformsQueryVariables = {
  filter?: ModelPlatformFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPlatformsQuery = {
  listPlatforms?:  {
    __typename: "ModelPlatformConnection",
    items?:  Array< {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateWorkloadSubscriptionVariables = {
  owner: string,
};

export type OnCreateWorkloadSubscription = {
  onCreateWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateWorkloadSubscriptionVariables = {
  owner: string,
};

export type OnUpdateWorkloadSubscription = {
  onUpdateWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteWorkloadSubscriptionVariables = {
  owner: string,
};

export type OnDeleteWorkloadSubscription = {
  onDeleteWorkload?:  {
    __typename: "Workload",
    id: string,
    name: string,
    dataset: string,
    loadMethod: string,
    usePartitioning: boolean,
    scalingFactor: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateExperimentSubscriptionVariables = {
  owner: string,
};

export type OnCreateExperimentSubscription = {
  onCreateExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateExperimentSubscriptionVariables = {
  owner: string,
};

export type OnUpdateExperimentSubscription = {
  onUpdateExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteExperimentSubscriptionVariables = {
  owner: string,
};

export type OnDeleteExperimentSubscription = {
  onDeleteExperiment?:  {
    __typename: "Experiment",
    id: string,
    executionMode: string,
    concurrentSessionCount: number,
    keepInfrastructure: boolean,
    workload:  {
      __typename: "Workload",
      id: string,
      name: string,
      dataset: string,
      loadMethod: string,
      usePartitioning: boolean,
      scalingFactor: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    platform:  {
      __typename: "Platform",
      id: string,
      name: string,
      platformType: string,
      nodeType?: string | null,
      numberOfNodes?: number | null,
      workloadManager?: boolean | null,
      concurrencyScaling?: boolean | null,
      aqua?: boolean | null,
      spectrum?: boolean | null,
      enforceWorkgroupConfiguration?: boolean | null,
      bytesScannedCutoffPerQuery?: number | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    },
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreatePlatformSubscriptionVariables = {
  owner: string,
};

export type OnCreatePlatformSubscription = {
  onCreatePlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdatePlatformSubscriptionVariables = {
  owner: string,
};

export type OnUpdatePlatformSubscription = {
  onUpdatePlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeletePlatformSubscriptionVariables = {
  owner: string,
};

export type OnDeletePlatformSubscription = {
  onDeletePlatform?:  {
    __typename: "Platform",
    id: string,
    name: string,
    platformType: string,
    nodeType?: string | null,
    numberOfNodes?: number | null,
    workloadManager?: boolean | null,
    concurrencyScaling?: boolean | null,
    aqua?: boolean | null,
    spectrum?: boolean | null,
    enforceWorkgroupConfiguration?: boolean | null,
    bytesScannedCutoffPerQuery?: number | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
