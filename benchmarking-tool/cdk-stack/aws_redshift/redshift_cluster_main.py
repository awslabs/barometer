from aws_redshift.redshift_helpers import get_products
from aws_cdk import (
    core,
    aws_redshift as rs,
    aws_iam as iam,
    aws_secretsmanager as secret
)


class RedshiftClusterStack(core.Stack):

    def __init__(self, scope: core.Construct, construct_id: str, input_subnets, input_vpc_sg,
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
        core.CfnOutput(self, "Output-1", value=self.rs_cluster.attr_endpoint_address)

        # Output Redshift role, with access to Amazon S3:
        core.CfnOutput(self, "Output-2", value=self.rs_iam_role.role_arn)

        # Output Redshift cluster name:
        core.CfnOutput(self, "Output-3", value=self.rs_cluster.cluster_identifier)

        # Output Redshift database name:
        core.CfnOutput(self, "Output-4", value=self.rs_cluster.db_name)

        # Output Secrets Manager ARN:
        core.CfnOutput(self, "Output-5", value=self.rs_cluster.master_username)

        # Output Pricing details:
        core.CfnOutput(self, "Output-6", value=self.price_products)
