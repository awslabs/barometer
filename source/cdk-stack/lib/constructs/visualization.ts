import {Aws, Construct, Duration, Environment} from "@aws-cdk/core";
//import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
//import {Cluster} from "@aws-cdk/aws-ecs/lib/cluster";
//import * as ec2 from '@aws-cdk/aws-ec2';
//import * as ecs from '@aws-cdk/aws-ecs';
//import {FargateService,FargateTaskDefinition,ContainerImage,LogDrivers,Volume,Secret}  from '@aws-cdk/aws-ecs';
//import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
//import * as efs from '@aws-cdk/aws-efs';  
import * as assets from '@aws-cdk/assets';
//import * as ecr_assets from '@aws-cdk/aws-ecr-assets';
//import { DockerImageAsset, Platform } from '@aws-cdk/aws-ecr-assets';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs'; 
//import * as r53 from '@aws-cdk/aws-route53';  
//import {Code, FileSystem,DockerImageCode, DockerImageFunction, Function, Runtime} from "@aws-cdk/aws-lambda";
import * as cr from '@aws-cdk/custom-resources';
//import * as iot from '@aws-cdk/aws-iot';
//import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
//import {ApplicationProtocol,IListenerCertificate,ListenerCertificate,ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";
//import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2"; 
//import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
//import { TagParameterContainerImage } from '@aws-cdk/aws-ecs';
import path = require('path');
import {AccessPoint,FileSystem} from '@aws-cdk/aws-efs'; 
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as firehose from '@aws-cdk/aws-kinesisfirehose';
import * as s3 from '@aws-cdk/aws-s3';
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations';
import * as glue from '@aws-cdk/aws-glue';
import * as quicksight from '@aws-cdk/aws-quicksight';

export class Visualization extends Construct { 

    public readonly metricsbucket : string;
    public readonly dashboardid : string;
    constructor(scope: Construct, id: string, props: {} ) { 
        const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');
        super(scope, id);
        
        // QuickSight Dashbaord
        const database =new glue.Database(this, 'barometerdatabase', {
          databaseName: 'barometer',
        });
       
        const bucketmetrics = new s3.Bucket(this, 'BucketMetricsCloudWatch');
        this.metricsbucket=bucketmetrics.bucketName;
        const gluemetrictablename = 'cloudwatchmetrics';
        new glue.Table(this, 'cloudwatchmetricstable', {
          database: database,
          tableName: gluemetrictablename,
          bucket: bucketmetrics,
          columns: [{
            name: 'metric_stream_name',
            type: glue.Schema.STRING,
          },{
            name: 'account_id',
            type: glue.Schema.STRING,
          },{
            name: 'region',
            type: glue.Schema.STRING,
          },{
            name: 'namespace',
            type: glue.Schema.STRING,
          },{
            name: 'metric_name',
            type: glue.Schema.STRING,
          },{
            name: 'dimensions',
            type: glue.Schema.struct([{ 
                    name: 'SCRIPT_PATH',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'SECRET_ID',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'SESSION_ID',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'STACK_NAME',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'EXPERIMENT_NAME',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'PLATFORM_CONFIG_NAME',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'PLATFORM_CONFIG_PLATFORM_TYPE',
                    type: glue.Schema.STRING,
                  },{ 
                    name: 'WORKLOAD_CONFIG_NAME',
                    type: glue.Schema.STRING,
                  }]) 
          },{
            name: 'timestamp',
            type: glue.Schema.BIG_INT,
          },{
            name: 'value',
            type: glue.Schema.struct([{ 
                    name: 'min',
                    type: glue.Schema.DOUBLE,
                  },{
                    name: 'max',
                    type: glue.Schema.DOUBLE,
                  },{
                    name: 'count',
                    type: glue.Schema.DOUBLE,
                  },{
                    name: 'sum',
                    type: glue.Schema.DOUBLE,
                  }]) 
          },{
            name: 'unit',
            type: glue.Schema.STRING,
          }], 
          dataFormat: glue.DataFormat.JSON,
        });  
        
        const cfnMetricStreamFirehose = new firehose.DeliveryStream(this, 'CloudWatchMetricsDeliveryStream', {
            destinations: [new destinations.S3Bucket(bucketmetrics, { bufferingInterval: Duration.minutes(1)  })]//,
            //dataOutputPrefix: 'BarometerMetrics',
            //errorOutputPrefix: 'BarometerFailures'
        });
        const metricStreamRole = new iam.Role(this, 'MetricStreamRole', {
            assumedBy: new iam.ServicePrincipal('streams.metrics.cloudwatch.amazonaws.com'),
        });
        metricStreamRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'firehose:PutRecord',
              'firehose:PutRecordBatch'
            ],
            resources: ['*']
          }));
        const cfnMetricStream = new cloudwatch.CfnMetricStream(this, 'MyCfnMetricStream', {
          firehoseArn: cfnMetricStreamFirehose.deliveryStreamArn,
          outputFormat: 'json',
          roleArn: metricStreamRole.roleArn,
          includeFilters: [{
            namespace: 'Benchmarking',
          }],
          name: 'BarometerStream'
        });
        
        const QuickSightGroupName='barometer'
        const quicksightCreateGroupCall: cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "createGroup", 
            parameters: {  AwsAccountId: Aws.ACCOUNT_ID ,
                          GroupName: QuickSightGroupName, 
                          Namespace: 'default', }, 
            physicalResourceId: cr.PhysicalResourceId.of(`quicksightcreategroupname`), //
          }; 

        const quicksightCreategroup = new cr.AwsCustomResource( 
            this, 
            "QuickSightCreateGroup", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                new iam.PolicyStatement({ 
                    effect: iam.Effect.ALLOW, 
                    resources: ["*"], 
                    actions: ["quicksight:CreateGroup"], 
                }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onCreate: quicksightCreateGroupCall, 
            } 
        ) ; 
        
         const quicksightDeleteGroupCall: cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "deleteGroup", 
            parameters: {  AwsAccountId: Aws.ACCOUNT_ID , 
                          GroupName: QuickSightGroupName, 
                          Namespace: 'default',}, 
            physicalResourceId: cr.PhysicalResourceId.of(`quicksightdeletegroupname`), //
          }; 

        const quicksightDeletegroup = new cr.AwsCustomResource( 
            this, 
            "QuickSightDeleteGroup", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                new iam.PolicyStatement({ 
                    effect: iam.Effect.ALLOW, 
                    resources: ["*"], 
                    actions: ["quicksight:DeleteGroup"], 
                }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onDelete: quicksightDeleteGroupCall, 
            } 
        ) ; 
        
        const cfnDataSource = new quicksight.CfnDataSource(this, 'MyCfnDataSource',  {
                  awsAccountId: Aws.ACCOUNT_ID ,//props.accountid,
                  type: 'ATHENA',
                  dataSourceId: 'AthenaBarometer',
                  // dataSourceParameters: {
                  //   athenaParameters: {
                  //     workGroup: 'AthenaV2',
                  //   }
                  // }, 
                  name: 'AthenaBarometer',
                  permissions: [{
                    actions: [  
                          "quicksight:UpdateDataSourcePermissions",
                          "quicksight:DescribeDataSourcePermissions",
                          "quicksight:PassDataSource",
                          "quicksight:DescribeDataSource",
                          "quicksight:DeleteDataSource",
                          "quicksight:UpdateDataSource" 
                      ],     
                    principal:"arn:aws:quicksight:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":group/default/barometer",// ":namespace/default",//":user/default/Admin/hennette-Isengard",// + userArn.split("/")[1] ,//Admin/hennette-Isengard",//userArn
                  } ],
        });
        cfnDataSource.node.addDependency(quicksightCreategroup);
        const datasetidentifier = 'barometermetricscdk'
        const cfnDataSet = new quicksight.CfnDataSet(this, 'MyCfnDataSet', /* all optional props */ {
                  awsAccountId: Aws.ACCOUNT_ID , 
                  dataSetId: datasetidentifier, 
                  importMode: 'DIRECT_QUERY', 
                  name: datasetidentifier,
                  permissions: [{
                    actions: [                
                      "quicksight:CreateIngestion",
                      "quicksight:PassDataSet",
                      "quicksight:DescribeIngestion",
                      "quicksight:UpdateDataSet",
                      "quicksight:DeleteDataSet",
                      "quicksight:DescribeDataSet",
                      "quicksight:CancelIngestion",
                      "quicksight:ListIngestions",
                      "quicksight:DescribeDataSetPermissions",
                      "quicksight:UpdateDataSetPermissions"
                      ],
                    principal: "arn:aws:quicksight:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":group/default/barometer",//":user/default/Admin/hennette-Isengard",
                  } ],
                  physicalTableMap: {
                    physicalTableMapKey: {
                      customSql: {
                        columns: [{
                          name: 'datetime',
                          type: 'DATETIME',
                        },{
                          name: 'namespace',
                          type: 'STRING',
                        },{
                          name: 'stack_name',
                          type: 'STRING',
                        },{
                          name: 'experiment_name',
                          type: 'STRING',
                        },{
                          name: 'platform_config_name',
                          type: 'STRING',
                        },{
                          name: 'platform_config_platform_type',
                          type: 'STRING',
                        },{
                          name: 'workload_config_name',
                          type: 'STRING',
                        },{
                          name: 'script_name',
                          type: 'STRING',
                        },{
                          name: 'script_path',
                          type: 'STRING',
                        },{
                          name: 'metric_name',
                          type: 'STRING',
                        },{
                          name: 'runTimeMillis',
                          type: 'DECIMAL',
                        },{
                          name: 'unit',
                          type: 'STRING',
                        },{
                          name: 'datetimerelative',
                          type: 'DATETIME',
                        }],
                        dataSourceArn: cfnDataSource.attrArn,
                        name: 'BarometerMetrics',
                        sqlQuery: 'SELECT datetime,namespace,stack_name,experiment_name,platform_config_name,platform_config_platform_type,workload_config_name,script_name,script_path,metric_name,runTimeMillis, unit, DATE_ADD(\'millisecond\', cast(SUM(runTimeMillis) OVER (PARTITION BY  experiment_name ORDER BY script_name) as bigint), cast(date(\'1970-01-01\') as timestamp)) as datetimerelative from (SELECT timestamp, from_unixtime("timestamp"/1000) as datetime,  namespace, dimensions.stack_name, dimensions.experiment_name, dimensions.platform_config_name, dimensions.platform_config_platform_type, dimensions.workload_config_name, try(reverse(regexp_extract_all(dimensions.script_path, \'([^\/]+$)\'))[1]) as script_name, dimensions.script_path,metric_name, value.sum as runTimeMillis, unit FROM "barometer".' + gluemetrictablename + ' where metric_name=\'runTimeMillis\' and dimensions.experiment_name is not null  and strpos(dimensions.script_path, \'ddl.sql\') = 0) order by  experiment_name,  script_name,datetime',
                      }, 
                    },
                  }, 
                });
 
        this.dashboardid = "434f642e-zzzz-4df8-810b-1124ee8f50d2" + '-' + Aws.ACCOUNT_ID ;
        const quicksightCreateDashboardCall : cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "createDashboard", 
            parameters: {
                          "AwsAccountId": Aws.ACCOUNT_ID,
                          "DashboardId": this.dashboardid,
                          "Name": "barometer",
                          "Permissions": [
                              {
                                  "Principal": "arn:aws:quicksight:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":group/default/barometer",
                                  "Actions": [
                                      "quicksight:DescribeDashboard",
                                      "quicksight:ListDashboardVersions",
                                      "quicksight:UpdateDashboardPermissions",
                                      "quicksight:QueryDashboard",
                                      "quicksight:UpdateDashboard",
                                      "quicksight:DeleteDashboard",
                                      "quicksight:DescribeDashboardPermissions",
                                      "quicksight:UpdateDashboardPublishedVersion"
                                  ]
                              },
                              {
                                "Principal": "arn:aws:quicksight:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":namespace/default",
                                "Actions": [
                                    "quicksight:DescribeDashboard",
                                    "quicksight:ListDashboardVersions",
                                    "quicksight:QueryDashboard"
                                ]
                             },
                          ],
                          "DashboardPublishOptions": {
                              "AdHocFilteringOption": {
                                  "AvailabilityStatus": "ENABLED"
                              },
                              "ExportToCSVOption": {
                                  "AvailabilityStatus": "ENABLED"
                              },
                              "SheetControlsOption": {
                                  "VisibilityState": "EXPANDED"
                              },
                              "VisualPublishOptions": {
                                  "ExportHiddenFieldsOption": {
                                      "AvailabilityStatus": "ENABLED"
                                  }
                              }
                          },
                          "Definition": {
                              "DataSetIdentifierDeclarations": [
                                  {
                                      "Identifier": datasetidentifier,
                                      "DataSetArn": cfnDataSet.attrArn
                                  }
                              ],
                              "Sheets": [
                                  {
                                      "SheetId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_0c49fdcf-4344-448c-bdcf-ea7f699214cb",
                                      "Name": "Barometer Results",
                                      "ParameterControls": [
                                          {
                                              "Dropdown": {
                                                  "ParameterControlId": "35714e3c-zzzz-47c4-8527-0a6944d083ec",
                                                  "Title": "experiment name",
                                                  "SourceParameterName": "experimentname",
                                                  "DisplayOptions": {
                                                      "SelectAllOptions": {
                                                          "Visibility": "VISIBLE"
                                                      },
                                                      "TitleOptions": {
                                                          "Visibility": "VISIBLE",
                                                          "FontConfiguration": {
                                                              "FontSize": {
                                                                  "Relative": "MEDIUM"
                                                              }
                                                          }
                                                      }
                                                  },
                                                  "Type": "MULTI_SELECT",
                                                  "SelectableValues": {
                                                      "LinkToDataSetColumn": {
                                                          "DataSetIdentifier": datasetidentifier,
                                                          "ColumnName": "experiment_name"
                                                      }
                                                  }
                                              }
                                          }
                                      ],
                                      "Visuals": [
                                          {
                                              "BarChartVisual": {
                                                  "VisualId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_fc1d1dd7-dee4-461c-97ec-e12ea89205a4",
                                                  "Title": {
                                                      "Visibility": "VISIBLE",
                                                      "FormatText": {
                                                          "RichText": "<visual-title>\n  <b>Vertical stacked bar charts - Runtime in milliseconds by script and experiment name</b>\n</visual-title>"
                                                      }
                                                  },
                                                  "Subtitle": {
                                                      "Visibility": "HIDDEN"
                                                  },
                                                  "ChartConfiguration": {
                                                      "FieldWells": {
                                                          "BarChartAggregatedFieldWells": {
                                                              "Category": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.0.1670505989030",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "script_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Values": [
                                                                  {
                                                                      "NumericalMeasureField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670506001520",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "runTimeMillis"
                                                                          },
                                                                          "AggregationFunction": {
                                                                              "SimpleNumericalAggregation": "SUM"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Colors": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670506931894",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "experiment_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      },
                                                      "SortConfiguration": {
                                                          "CategorySort": [
                                                              {
                                                                  "FieldSort": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670506001520",
                                                                      "Direction": "DESC"
                                                                  }
                                                              }
                                                          ],
                                                          "CategoryItemsLimit": {
                                                              "OtherCategories": "INCLUDE"
                                                          },
                                                          "ColorItemsLimit": {
                                                              "OtherCategories": "INCLUDE"
                                                          },
                                                          "SmallMultiplesLimitConfiguration": {
                                                              "OtherCategories": "INCLUDE"
                                                          }
                                                      },
                                                      "Orientation": "VERTICAL",
                                                      "BarsArrangement": "STACKED",
                                                      "CategoryLabelOptions": {
                                                          "AxisLabelOptions": [
                                                              {
                                                                  "CustomLabel": "script name",
                                                                  "ApplyTo": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.0.1670505989030",
                                                                      "Column": {
                                                                          "DataSetIdentifier": datasetidentifier,
                                                                          "ColumnName": "script_name"
                                                                      }
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      "ValueLabelOptions": {
                                                          "AxisLabelOptions": [
                                                              {
                                                                  "CustomLabel": "runtime in milliseconds",
                                                                  "ApplyTo": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670506001520",
                                                                      "Column": {
                                                                          "DataSetIdentifier": datasetidentifier,
                                                                          "ColumnName": "runTimeMillis"
                                                                      }
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      "Legend": {
                                                          "Visibility": "VISIBLE",
                                                          "Title": {
                                                              "Visibility": "VISIBLE"
                                                          },
                                                          "Position": "BOTTOM"
                                                      },
                                                      "DataLabels": {
                                                          "Visibility": "VISIBLE",
                                                          "Overlap": "DISABLE_OVERLAP"
                                                      },
                                                      "Tooltip": {
                                                          "TooltipVisibility": "VISIBLE",
                                                          "SelectedTooltipType": "DETAILED",
                                                          "FieldBasedTooltip": {
                                                              "AggregationVisibility": "HIDDEN",
                                                              "TooltipTitleType": "PRIMARY_VALUE",
                                                              "TooltipFields": [
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.0.1670505989030",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670506001520",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670506931894",
                                                                          "Label": "experiment name",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  },
                                                  "Actions": [],
                                                  "ColumnHierarchies": []
                                              }
                                          },
                                          {
                                              "TableVisual": {
                                                  "VisualId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_d47c24e5-cd43-4249-97a6-b61380dc0599",
                                                  "Title": {
                                                      "Visibility": "VISIBLE",
                                                      "FormatText": {
                                                          "RichText": "<visual-title>\n  <b>Raw data</b>\n</visual-title>"
                                                      }
                                                  },
                                                  "Subtitle": {
                                                      "Visibility": "VISIBLE"
                                                  },
                                                  "ChartConfiguration": {
                                                      "FieldWells": {
                                                          "TableAggregatedFieldWells": {
                                                              "GroupBy": [
                                                                  {
                                                                      "DateDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetime.0.1670506145423",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "datetime"
                                                                          },
                                                                          "DateGranularity": "MINUTE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.stack_name.2.1670506169676",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "stack_name"
                                                                          }
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.workload_config_name.4.1670506185249",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "workload_config_name"
                                                                          }
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.3.1670506179024",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "experiment_name"
                                                                          }
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.5.1670506649695",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "script_name"
                                                                          }
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.platform_config_platform_type.7.1670579210052",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "platform_config_platform_type"
                                                                          }
                                                                      }
                                                                  },
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.platform_config_name.6.1670579207195",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "platform_config_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Values": [
                                                                  {
                                                                      "NumericalMeasureField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.4.1670506619910",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "runTimeMillis"
                                                                          },
                                                                          "AggregationFunction": {
                                                                              "SimpleNumericalAggregation": "SUM"
                                                                          }
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      },
                                                      "SortConfiguration": {
                                                          "RowSort": [
                                                              {
                                                                  "FieldSort": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.4.1670506619910",
                                                                      "Direction": "DESC"
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      "TableOptions": {
                                                          "CellStyle": {
                                                              "FontConfiguration": {
                                                                  "FontSize": {
                                                                      "Relative": "LARGE"
                                                                  }
                                                              }
                                                          }
                                                      }
                                                  },
                                                  "Actions": []
                                              }
                                          },
                                          {
                                              "PieChartVisual": {
                                                  "VisualId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_fbff4d4d-b47a-46ac-8e6c-dd0e447714b1",
                                                  "Title": {
                                                      "Visibility": "VISIBLE",
                                                      "FormatText": {
                                                          "RichText": "<visual-title>\n  <b>Pie Chart - Runtime by script name and experiment</b>\n</visual-title>"
                                                      }
                                                  },
                                                  "Subtitle": {
                                                      "Visibility": "HIDDEN"
                                                  },
                                                  "ChartConfiguration": {
                                                      "FieldWells": {
                                                          "PieChartAggregatedFieldWells": {
                                                              "Category": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.0.1670577956096",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "script_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Values": [
                                                                  {
                                                                      "NumericalMeasureField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670577959955",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "runTimeMillis"
                                                                          },
                                                                          "AggregationFunction": {
                                                                              "SimpleNumericalAggregation": "SUM"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "SmallMultiples": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670577963539",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "experiment_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      },
                                                      "SortConfiguration": {
                                                          "CategorySort": [
                                                              {
                                                                  "FieldSort": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670577959955",
                                                                      "Direction": "DESC"
                                                                  }
                                                              }
                                                          ],
                                                          "CategoryItemsLimit": {
                                                              "OtherCategories": "INCLUDE"
                                                          },
                                                          "SmallMultiplesLimitConfiguration": {
                                                              "OtherCategories": "INCLUDE"
                                                          }
                                                      },
                                                      "DonutOptions": {
                                                          "ArcOptions": {
                                                              "ArcThickness": "WHOLE"
                                                          }
                                                      },
                                                      "SmallMultiplesOptions": {
                                                          "PanelConfiguration": {
                                                              "Title": {
                                                                  "FontConfiguration": {
                                                                      "FontSize": {},
                                                                      "FontDecoration": "NONE",
                                                                      "FontWeight": {
                                                                          "Name": "BOLD"
                                                                      },
                                                                      "FontStyle": "NORMAL"
                                                                  }
                                                              },
                                                              "GutterVisibility": "VISIBLE",
                                                              "BackgroundVisibility": "VISIBLE"
                                                          }
                                                      },
                                                      "Legend": {
                                                          "Position": "BOTTOM"
                                                      },
                                                      "DataLabels": {
                                                          "Visibility": "VISIBLE",
                                                          "MeasureLabelVisibility": "VISIBLE",
                                                          "Position": "OUTSIDE",
                                                          "Overlap": "DISABLE_OVERLAP"
                                                      },
                                                      "Tooltip": {
                                                          "TooltipVisibility": "VISIBLE",
                                                          "SelectedTooltipType": "DETAILED",
                                                          "FieldBasedTooltip": {
                                                              "AggregationVisibility": "HIDDEN",
                                                              "TooltipTitleType": "PRIMARY_VALUE",
                                                              "TooltipFields": [
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.0.1670577956096",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670577959955",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670577963539",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  },
                                                  "Actions": [],
                                                  "ColumnHierarchies": []
                                              }
                                          },
                                          {
                                              "TreeMapVisual": {
                                                  "VisualId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_7b709ccc-fe3d-4469-8fc6-87fd37002973",
                                                  "Title": {
                                                      "Visibility": "VISIBLE",
                                                      "FormatText": {
                                                          "RichText": "<visual-title>\n  <b>Treemap - sum of runtime by script_name</b>\n</visual-title>"
                                                      }
                                                  },
                                                  "Subtitle": {
                                                      "Visibility": "HIDDEN"
                                                  },
                                                  "ChartConfiguration": {
                                                      "FieldWells": {
                                                          "TreeMapAggregatedFieldWells": {
                                                              "Groups": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.1.1670578410541",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "script_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Sizes": [
                                                                  {
                                                                      "NumericalMeasureField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.2.1670578501689",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "runTimeMillis"
                                                                          },
                                                                          "AggregationFunction": {
                                                                              "SimpleNumericalAggregation": "SUM"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Colors": []
                                                          }
                                                      },
                                                      "SortConfiguration": {
                                                          "TreeMapSort": [
                                                              {
                                                                  "FieldSort": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.2.1670578501689",
                                                                      "Direction": "DESC"
                                                                  }
                                                              }
                                                          ],
                                                          "TreeMapGroupItemsLimitConfiguration": {
                                                              "OtherCategories": "INCLUDE"
                                                          }
                                                      },
                                                      "SizeLabelOptions": {
                                                          "AxisLabelOptions": [
                                                              {
                                                                  "CustomLabel": "runtime in milliseconds",
                                                                  "ApplyTo": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.2.1670578501689",
                                                                      "Column": {
                                                                          "DataSetIdentifier": datasetidentifier,
                                                                          "ColumnName": "runTimeMillis"
                                                                      }
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      "DataLabels": {
                                                          "Visibility": "VISIBLE",
                                                          "LabelFontConfiguration": {
                                                              "FontSize": {
                                                                  "Relative": "LARGE"
                                                              }
                                                          },
                                                          "Overlap": "DISABLE_OVERLAP"
                                                      },
                                                      "Tooltip": {
                                                          "TooltipVisibility": "VISIBLE",
                                                          "SelectedTooltipType": "DETAILED",
                                                          "FieldBasedTooltip": {
                                                              "AggregationVisibility": "HIDDEN",
                                                              "TooltipTitleType": "PRIMARY_VALUE",
                                                              "TooltipFields": [
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.2.1670578501689",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.script_name.1.1670578410541",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  },
                                                  "Actions": [],
                                                  "ColumnHierarchies": []
                                              }
                                          },
                                          {
                                              "LineChartVisual": {
                                                  "VisualId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_30a3c412-bfd4-4091-9b22-3c238f5593d5",
                                                  "Title": {
                                                      "Visibility": "VISIBLE",
                                                      "FormatText": {
                                                          "RichText": "<visual-title>\n  <b>Line charts - relative time experiment runtime</b>\n</visual-title>"
                                                      }
                                                  },
                                                  "Subtitle": {
                                                      "Visibility": "HIDDEN"
                                                  },
                                                  "ChartConfiguration": {
                                                      "FieldWells": {
                                                          "LineChartAggregatedFieldWells": {
                                                              "Category": [
                                                                  {
                                                                      "DateDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetimerelative.2.1670582861747",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "datetimerelative"
                                                                          },
                                                                          "DateGranularity": "SECOND",
                                                                          "HierarchyId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetimerelative.2.1670582861747",
                                                                      }
                                                                  }
                                                              ],
                                                              "Values": [
                                                                  {
                                                                      "NumericalMeasureField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670581368545",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "runTimeMillis"
                                                                          },
                                                                          "AggregationFunction": {
                                                                              "SimpleNumericalAggregation": "SUM"
                                                                          }
                                                                      }
                                                                  }
                                                              ],
                                                              "Colors": [
                                                                  {
                                                                      "CategoricalDimensionField": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670582857008",
                                                                          "Column": {
                                                                              "DataSetIdentifier": datasetidentifier,
                                                                              "ColumnName": "experiment_name"
                                                                          }
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      },
                                                      "SortConfiguration": {
                                                          "CategorySort": [
                                                              {
                                                                  "FieldSort": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetimerelative.2.1670582861747",
                                                                      "Direction": "DESC"
                                                                  }
                                                              }
                                                          ],
                                                          "CategoryItemsLimitConfiguration": {
                                                              "ItemsLimit": 200,
                                                              "OtherCategories": "INCLUDE"
                                                          },
                                                          "ColorItemsLimitConfiguration": {
                                                              "OtherCategories": "INCLUDE"
                                                          },
                                                          "SmallMultiplesLimitConfiguration": {
                                                              "OtherCategories": "INCLUDE"
                                                          }
                                                      },
                                                      "Type": "LINE",
                                                      "XAxisDisplayOptions": {
                                                          "TickLabelOptions": {
                                                              "LabelOptions": {
                                                                  "Visibility": "HIDDEN"
                                                              }
                                                          },
                                                          "AxisLineVisibility": "VISIBLE"
                                                      },
                                                      "PrimaryYAxisLabelOptions": {
                                                          "AxisLabelOptions": [
                                                              {
                                                                  "CustomLabel": "runtime in milliseconds",
                                                                  "ApplyTo": {
                                                                      "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670581368545",
                                                                      "Column": {
                                                                          "DataSetIdentifier": datasetidentifier,
                                                                          "ColumnName": "runTimeMillis"
                                                                      }
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      "Legend": {
                                                          "Position": "BOTTOM"
                                                      },
                                                      "DataLabels": {
                                                          "Visibility": "VISIBLE",
                                                          "Overlap": "DISABLE_OVERLAP"
                                                      },
                                                      "Tooltip": {
                                                          "TooltipVisibility": "VISIBLE",
                                                          "SelectedTooltipType": "DETAILED",
                                                          "FieldBasedTooltip": {
                                                              "AggregationVisibility": "HIDDEN",
                                                              "TooltipTitleType": "PRIMARY_VALUE",
                                                              "TooltipFields": [
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.runTimeMillis.1.1670581368545",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.experiment_name.2.1670582857008",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  },
                                                                  {
                                                                      "FieldTooltipItem": {
                                                                          "FieldId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetimerelative.2.1670582861747",
                                                                          "Visibility": "VISIBLE"
                                                                      }
                                                                  }
                                                              ]
                                                          }
                                                      }
                                                  },
                                                  "Actions": [],
                                                  "ColumnHierarchies": [
                                                      {
                                                          "DateTimeHierarchy": {
                                                              "HierarchyId": "ddff879d-zzzz-4b79-a382-f045e446db8f.datetimerelative.2.1670582861747",
                                                          }
                                                      }
                                                  ]
                                              }
                                          }
                                      ],
                                      "Layouts": [
                                          {
                                              "Configuration": {
                                                  "GridLayout": {
                                                      "Elements": [
                                                          {
                                                              "ElementId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_fc1d1dd7-dee4-461c-97ec-e12ea89205a4",
                                                              "ElementType": "VISUAL",
                                                              "ColumnIndex": 0,
                                                              "ColumnSpan": 36,
                                                              "RowIndex": 0,
                                                              "RowSpan": 12
                                                          },
                                                          {
                                                              "ElementId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_30a3c412-bfd4-4091-9b22-3c238f5593d5",
                                                              "ElementType": "VISUAL",
                                                              "ColumnIndex": 0,
                                                              "ColumnSpan": 36,
                                                              "RowIndex": 12,
                                                              "RowSpan": 12
                                                          },
                                                          {
                                                              "ElementId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_fbff4d4d-b47a-46ac-8e6c-dd0e447714b1",
                                                              "ElementType": "VISUAL",
                                                              "ColumnIndex": 0,
                                                              "ColumnSpan": 36,
                                                              "RowIndex": 24,
                                                              "RowSpan": 12
                                                          },
                                                          {
                                                              "ElementId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_7b709ccc-fe3d-4469-8fc6-87fd37002973",
                                                              "ElementType": "VISUAL",
                                                              "ColumnIndex": 0,
                                                              "ColumnSpan": 36,
                                                              "RowIndex": 36,
                                                              "RowSpan": 12
                                                          },
                                                          {
                                                              "ElementId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_d47c24e5-cd43-4249-97a6-b61380dc0599",
                                                              "ElementType": "VISUAL",
                                                              "ColumnIndex": 0,
                                                              "ColumnSpan": 36,
                                                              "RowIndex": 48,
                                                              "RowSpan": 12
                                                          }
                                                      ]
                                                  }
                                              }
                                          }
                                      ],
                                      "ContentType": "INTERACTIVE"
                                  }
                              ],
                              "CalculatedFields": [],
                              "ParameterDeclarations": [
                                  {
                                      "StringParameterDeclaration": {
                                          "ParameterValueType": "MULTI_VALUED",
                                          "Name": "experimentname",
                                          "DefaultValues": {},
                                          "ValueWhenUnset": {
                                              "ValueWhenUnsetOption": "RECOMMENDED_VALUE"
                                          }
                                      }
                                  }
                              ],
                              "FilterGroups": [
                                  {
                                      "FilterGroupId": "9a39b8f6-zzzz-4757-99e8-01f7cbde4b8d",
                                      "Filters": [
                                          {
                                              "CategoryFilter": {
                                                  "FilterId": "3b193638-zzzz-4fbe-a341-cb1aca70fadd",
                                                  "Column": {
                                                      "DataSetIdentifier": datasetidentifier,
                                                      "ColumnName": "experiment_name"
                                                  },
                                                  "Configuration": {
                                                      "CustomFilterConfiguration": {
                                                          "MatchOperator": "EQUALS",
                                                          "ParameterName": "experimentname",
                                                          "NullOption": "NON_NULLS_ONLY"
                                                      }
                                                  }
                                              }
                                          }
                                      ],
                                      "ScopeConfiguration": {
                                          "SelectedSheets": {
                                              "SheetVisualScopingConfigurations": [
                                                  {
                                                      "SheetId": "434f642e-zzzz-4df8-810b-1124ee8f50d2_0c49fdcf-4344-448c-bdcf-ea7f699214cb",
                                                      "Scope": "ALL_VISUALS"
                                                  }
                                              ]
                                          }
                                      },
                                      "Status": "ENABLED",
                                      "CrossDataset": "ALL_DATASETS"
                                  }
                              ],
                              "AnalysisDefaults": {
                                  "DefaultNewSheetConfiguration": {
                                      "InteractiveLayoutConfiguration": {
                                          "Grid": {
                                              "CanvasSizeOptions": {
                                                  "ScreenCanvasSizeOptions": {
                                                      "ResizeOption": "FIXED",
                                                      "OptimizedViewPortWidth": "1600px"
                                                  }
                                              }
                                          }
                                      },
                                      "SheetContentType": "INTERACTIVE"
                                  }
                              }
                          }
                      }, 
            physicalResourceId: cr.PhysicalResourceId.of(`BarometerDashboard`), //
          }; 

        const quicksightCreateDashBoardResponce = new cr.AwsCustomResource( 
            this, 
            "CreateQuickSightDashBoard2", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                  new iam.PolicyStatement({ 
                      effect: iam.Effect.ALLOW, 
                      resources: ["*"], 
                      actions: ["quicksight:CreateDashboard","quicksight:PassDataSet"], 
                  }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onCreate: quicksightCreateDashboardCall, 
            } 
        ) ;  
 
        const quicksightDeleteDashboardCall : cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "deleteDashboard", 
            parameters: {
                          "AwsAccountId": Aws.ACCOUNT_ID,
                          "DashboardId": this.dashboardid, 
                      }, 
            physicalResourceId: cr.PhysicalResourceId.of(`BarometerDashboard`), //
          }; 

        const quicksightDeleteDashBoardResponce = new cr.AwsCustomResource( 
            this, 
            "DeleteQuickSightDashBoard", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                  new iam.PolicyStatement({ 
                      effect: iam.Effect.ALLOW, 
                      resources: ["*"], 
                      actions: ["quicksight:DeleteDashboard"], 
                  }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onDelete: quicksightDeleteDashboardCall, 
            } 
        ) ;  

 
    }
}