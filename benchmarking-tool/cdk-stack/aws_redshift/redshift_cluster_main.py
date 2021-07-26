from aws_redshift.redshift_helpers import get_products
from aws_cdk import (
    core,
    aws_redshift as rs,
    aws_iam as iam,
    aws_secretsmanager as secret
)


class RedshiftClusterStack(core.Stack):

    def __init__(self, scope: core.Construct, construct_id: str, input_subnets, input_vpc_sg,
                 input_load_fn_role, input_aws_account_id, input_aws_region,
                 input_rs_cluster_identifier, input_rs_node_type, input_rs_number_of_nodes, input_rs_region_full_name,
                 input_rs_service_code, input_rs_contract_service_term, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Secret for Redshift credentials
        self.rs_secret = secret.Secret(
            self, "secret-redshift-benchmark-tool-cluster",
            description="Benchmark tool Redshift Cluster Secret",
            secret_name="secret-redshift-benchmark-tool-cluster-01",
            generate_secret_string=secret.SecretStringGenerator(exclude_punctuation=True),
            removal_policy=core.RemovalPolicy.DESTROY
        )

        """
        IAM Role to be attached to the RS cluster
        Security notes:
        - To remove S3 read-only access. To limit access to data bucket.
        """
        # noinspection PyTypeChecker
        self.rs_iam_role = iam.Role(
            self, "redshift_benchmark_tool_iam_role",
            assumed_by=iam.ServicePrincipal("redshift.amazonaws.com"),
            managed_policies=[iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3ReadOnlyAccess")]
        )

        # Grant role to retrieve password:
        self.rs_secret.grant_read(self.rs_iam_role)

        # Redshift cluster subnet creation
        rs_subnet_group = rs.CfnClusterSubnetGroup(
            self, "redshift_benchmark_tool_subnet_grp",
            subnet_ids=input_subnets.split(','),
            description="Redshift Subnet for Benchmark Tool cluster"
        )

        # Redshift cluster creation
        self.rs_cluster = rs.CfnCluster(
            self, "rs_cluster_creation_1",
            cluster_type="multi-node",
            cluster_identifier=input_rs_cluster_identifier,
            number_of_nodes=input_rs_number_of_nodes,
            db_name="benchmark_db",
            master_username="dwh_benchmark_admin",
            master_user_password=self.rs_secret.secret_value.to_string(),
            iam_roles=[self.rs_iam_role.role_arn],
            node_type=input_rs_node_type,
            cluster_subnet_group_name=rs_subnet_group.ref,
            vpc_security_group_ids=[input_vpc_sg.security_group_id]
        )

        # Retrieving ARN for cluster, database and dbuser:
        # - Redshift does not provide cluster ARN via API, e.g. boto3, CDK, etc. This needs to be built,
        #   as in the documentation says: https://amzn.to/3y1gs8b
        rs_cluster_arn = 'arn:aws:redshift:{}:{}:cluster:{}'.format(input_aws_region, input_aws_account_id, self.rs_cluster.cluster_identifier)
        rs_db_name_arn = 'arn:aws:redshift:{}:{}:dbname:{}/{}'.format(input_aws_region, input_aws_account_id, self.rs_cluster.cluster_identifier, self.rs_cluster.db_name)
        rs_db_user_arn = 'arn:aws:redshift:{}:{}:dbuser:{}/{}'.format(input_aws_region, input_aws_account_id, self.rs_cluster.cluster_identifier, self.rs_cluster.master_username)

        # Grant Lambda function to query Redshift, using the RS cluster ARN built previously:
        lambda_role = iam.Role.from_role_arn(self, "Role", input_load_fn_role)
        lambda_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            resources=[rs_cluster_arn],
            actions=["redshift-data:DescribeTable",
                     "redshift-data:GetStatementResult",
                     "redshift-data:CancelStatement",
                     "redshift-data:DescribeStatement",
                     "redshift-data:ListSchemas",
                     "redshift-data:ExecuteStatement",
                     "redshift-data:ListDatabases"
                     ]
        ))

        """
        Grant Lambda to create temporary credentials, to connect securely against the database:
        
        Follow-up: 
        - To change the ADMIN db user, for one with limited privileges. 
        """
        lambda_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            resources=[rs_db_name_arn, rs_db_user_arn],
            actions=["redshift:GetClusterCredentials"]
        ))

        """
        Follow-up: 
        - To investigate why this extra action is needed on ALL resources. Otherwise, the Lambda function fails.
        """
        lambda_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            resources=["*"],
            actions=["redshift-data:DescribeStatement"]
        ))

        # Get pricing for cluster:
        self.price_products = get_products(region=input_rs_region_full_name,
                                           service_code=input_rs_service_code,
                                           instance_type=input_rs_node_type,
                                           term=input_rs_contract_service_term)

        """
        @ Output begin
        Example:
            core.CfnOutput(self, "Output-1", value=rs_secret.secret_value.to_string())
        """

        # Output Redshift endpoint:
        core.CfnOutput(self, "rs-cluster-endpoint", value=self.rs_cluster.attr_endpoint_address)

        # Output Redshift role, with access to Amazon S3:
        core.CfnOutput(self, "iam-role-arn", value=self.rs_iam_role.role_arn)

        # Output Redshift cluster name:
        core.CfnOutput(self, "rs-cluster-identifier", value=self.rs_cluster.cluster_identifier)

        # Output Redshift database name:
        core.CfnOutput(self, "rs-db-name", value=self.rs_cluster.db_name)

        # Output Secrets Manager ARN:
        core.CfnOutput(self, "rs-master-user", value=self.rs_cluster.master_username)

        # Output Pricing details:
        core.CfnOutput(self, "price-products", value=self.price_products)
