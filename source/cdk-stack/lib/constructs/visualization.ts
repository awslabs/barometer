import {Aws, Construct, Duration} from "@aws-cdk/core";
import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {Cluster} from "@aws-cdk/aws-ecs/lib/cluster";
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import {FargateService,FargateTaskDefinition,ContainerImage,LogDrivers,Volume,Secret}  from '@aws-cdk/aws-ecs';
//import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as efs from '@aws-cdk/aws-efs'; 

import * as assets from '@aws-cdk/assets';
import * as ecr_assets from '@aws-cdk/aws-ecr-assets';
import { DockerImageAsset, Platform } from '@aws-cdk/aws-ecr-assets';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs'; 
//import * as r53 from '@aws-cdk/aws-route53';  
//import {Code, FileSystem,DockerImageCode, DockerImageFunction, Function, Runtime} from "@aws-cdk/aws-lambda";
import * as cr from '@aws-cdk/custom-resources';
//import * as iot from '@aws-cdk/aws-iot';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import {ApplicationProtocol,IListenerCertificate,ListenerCertificate,ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";
//import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2"; 
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
//import { TagParameterContainerImage } from '@aws-cdk/aws-ecs';
import path = require('path');
import {AccessPoint,FileSystem} from '@aws-cdk/aws-efs'; 
import { platform } from "process";

interface VisualizationProps {
    vpc: Vpc;
    cluster:Cluster;
    filesystem: FileSystem;
    accesspoint : AccessPoint; 
}

/**
 * Defines benchmark runner workflow
 */
export class Visualization extends Construct { 
    //public readonly accesspoint: FargateService;
    public readonly service: FargateService;
    public readonly applicationloadbalancer: ApplicationLoadBalancer;
    public readonly grafanaadminpasswordarn : string;
    constructor(scope: Construct, id: string, props: VisualizationProps) {
        const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');
        super(scope, id);

        //props.vpc.addInterfaceEndpoint('CWEndpoint',  {service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH});
        props.vpc.addInterfaceEndpoint('EFSEndpoint', {service: ec2.InterfaceVpcEndpointAwsService.ELASTIC_FILESYSTEM});
        //props.vpc.addInterfaceEndpoint('SMEndpoint',  {service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER});
    
        // task log group
        const logGroup = new logs.LogGroup(this, 'taskLogGroup', {
            retention: logs.RetentionDays.ONE_MONTH
        });

        // container log driver
        const containerLogDriver = LogDrivers.awsLogs({
            streamPrefix: 'fargate-grafana', //cdk.Stack.stackName,
            logGroup: logGroup
        });

        // task Role
        const taskRole = new iam.Role(this, 'taskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        taskRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'cloudwatch:DescribeAlarmsForMetric',
              'cloudwatch:DescribeAlarmHistory',
              'cloudwatch:DescribeAlarms',
              'cloudwatch:ListMetrics',
              'cloudwatch:GetMetricStatistics',
              'cloudwatch:GetMetricData',
              'ec2:DescribeTags',
              'ec2:DescribeInstances',
              'ec2:DescribeRegions',
              'tag:GetResources'
            ],
            resources: ['*']
          }));
      
        // execution Role
        const executionRole = new iam.Role(this, 'executionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });
    
        executionRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: [
                logGroup.logGroupArn
            ]
        }));

        const volumeName = 'efsGrafanaVolume';

        const volumeConfig: Volume = {
          name: volumeName,
          efsVolumeConfiguration: {
            fileSystemId: props.filesystem.fileSystemId,
            transitEncryption: 'ENABLED',
            authorizationConfig: { accessPointId: props.accesspoint.accessPointId}
          },
        };
    
        // https://aws.amazon.com/blogs/aws/amazon-ecs-supports-efs/
        const task_definition = new FargateTaskDefinition(this, "TaskDef",{
          taskRole: taskRole,
          executionRole: executionRole,
          volumes: [volumeConfig],
          runtimePlatform : {
            operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
            cpuArchitecture: ecs.CpuArchitecture.X86_64,
          }
        });

        // Grafana Admin Password
        const grafanaadminpasswordarn = new secretsmanager.Secret(this, 'grafanaAdminPassword');
        // Allow Task to access Grafana Admin Password
        grafanaadminpasswordarn.grantRead(taskRole); 
        // Web Container
        const container_web = task_definition.addContainer("web", {
                //image:  new ecs.AssetImage(commonFunctionsDirPath + "visualization"),//DockerImageCode.fromImageAsset(commonFunctionsDirPath + "visualization"),//ContainerImage.fromRegistry('grafana/grafana'),
                image:  new ecs.AssetImage(commonFunctionsDirPath + "visualization",{ platform :Platform.LINUX_AMD64 }),//DockerImageCode.fromImageAsset(commonFunctionsDirPath + "visualization"),//ContainerImage.fromRegistry('grafana/grafana'),
                logging: containerLogDriver,
                secrets: {
                    GF_SECURITY_ADMIN_PASSWORD: Secret.fromSecretsManager(grafanaadminpasswordarn)
                },
                environment: {
                    //'GF_SERVER_ROOT_URL' : `https://${domainZone.zoneName}`,
                } 
            }
        );
        this.grafanaadminpasswordarn = grafanaadminpasswordarn.secretFullArn! ;
        // set port mapping
        container_web.addPortMappings({
            containerPort: 3000
        });
        container_web.addMountPoints({
            sourceVolume: volumeConfig.name,
            containerPath: '/var/lib/grafana',
            readOnly: false
        });

        const iotCreateKeysAndCertificateCall: cr.AwsSdkCall = { 
            service: "Iot", 
            action: "createKeysAndCertificate", 
            parameters: { 
              setAsActive: true, 
            }, 
            physicalResourceId: cr.PhysicalResourceId.of(`IoTCertificate`), //
          }; 

        const iotCreateKeysAndCertificateCr = new cr.AwsCustomResource( 
            this, 
            "CreateKeysAndCertificate", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                new iam.PolicyStatement({ 
                    effect: iam.Effect.ALLOW, 
                    resources: ["*"], 
                    actions: ["iot:CreateKeysAndCertificate"], 
                }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onCreate: iotCreateKeysAndCertificateCall, 
            } 
        ); 
        const iotCertificatePem = iotCreateKeysAndCertificateCr.getResponseField("certificatePem");  
        //const iotPublicKey =iotCreateKeysAndCertificateCr.getResponseField("keyPair.PublicKey");
        const iotPrivateKey =iotCreateKeysAndCertificateCr.getResponseField("keyPair.PrivateKey"); 
        // const cfnCertificate = new iot.CfnCertificate(this, 'MyCfnCertificate', {
        //   status: 'ACTIVE', 
        //   //// the properties below are optional
        //   // caCertificatePem: 'caCertificatePem',
        //   // certificateMode: 'certificateMode',
        //   // certificatePem: 'certificatePem',
        //   // certificateSigningRequest: 'certificateSigningRequest',
        // }); 
        const cfnServerCertificate = new iam.CfnServerCertificate(this, 'MyCfnServerCertificate', /* all optional props */ {
            certificateBody: iotCertificatePem,
            //certificateChain: 'certificateChain',
            //path: 'path',
            privateKey: iotPrivateKey,
            serverCertificateName: 'grafanalocalcertificate', 
        });
    
        const arrayPrivateCertificate: Array<IListenerCertificate> =[ListenerCertificate.fromArn(cfnServerCertificate.attrArn)]
        this.applicationloadbalancer = new elbv2.ApplicationLoadBalancer(this, "LB", {
            vpc : props.vpc, 
            internetFacing: true,  
        }); 

        this.service = new FargateService(this, 'FargateService', {
            cluster: props.cluster,
            taskDefinition: task_definition,
            desiredCount: 1,
            serviceName: 'FargateService',
            vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        })
    
        // Add a listener on port 443 for and use the certificate for HTTPS
        const listenerHTTPS = this.applicationloadbalancer.addListener("HTTPSListener", {
            port: 443, 
            certificates: [ListenerCertificate.fromArn(cfnServerCertificate.attrArn)],
        });
        
        const fargateService = new elbv2.ApplicationTargetGroup(this, 'TG1', {
            targetType: elbv2.TargetType.IP,
            port: 80,
            stickinessCookieDuration: Duration.minutes(5),
            vpc : props.vpc,
            //targetGroupName:"grafanatargetgroup2" 
        });  
        
        // Add a target with the AWS Lambda function to the listener
        listenerHTTPS.addTargets("HTTPSListenerTargets", {
            targets:[ this.service],
            protocol : ApplicationProtocol.HTTP,  
            //targetGroupName:"grafanatargetgroup2",
            healthCheck: {
                enabled: true, 
                path:"/api/health"
            }, 
        });
    
        //fargateService. 
        fargateService.configureHealthCheck({
            path: '/api/health'
        });
    
        // Allow Task to access EFS
        //fileSystem.connections.allowDefaultPortFrom(service);
    
        // const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');
        // const dashboardBuilder = new Function(this, "grafanadashboardBuilder", {
        // code: Code.fromAsset(commonFunctionsDirPath + "dashboard-builder"),
        // handler: "app.lambda_handler",
        // runtime: Runtime.PYTHON_3_8,
        // vpc: props.vpc,
        // filesystem: FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/grafana'),
        // //environment: {
        // //     SummaryDashboardName: "BenchmarkingExperimentsSummary",
        // //     ExperimentDashboardPrefix: "BenchmarkingExperiment-"
        // // },
        // timeout: Duration.minutes(1)
        // });
        // dashboardBuilder.addToRolePolicy(new iam.PolicyStatement({
        //     actions: ["cloudwatch:GetDashboard", "cloudwatch:PutDashboard"],
        //     resources: ["arn:aws:cloudwatch::" + Aws.ACCOUNT_ID + ":dashboard/BenchmarkingExperimentsSummary", "arn:aws:cloudwatch::" + Aws.ACCOUNT_ID + ":dashboard/BenchmarkingExperiment-*"]
        // }));
    }
}