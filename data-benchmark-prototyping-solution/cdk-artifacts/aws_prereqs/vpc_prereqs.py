from aws_cdk import (
    core,
    aws_ec2 as ec2
)


class CdkVpcPrereqsStack(core.Stack):

    def __init__(self, scope: core.Construct, construct_id: str, input_vpc_id, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # VPC settings:
        if input_vpc_id:
            # Using existing VPC
            self.vpc = ec2.Vpc.from_lookup(self, "VPC", vpc_id=input_vpc_id)

            # Fetching private subnets, from existing VPC.
            # Follow-up note: Pending to query for possible Isolated subnets.
            private_subnets_select = self.vpc.select_subnets(subnet_type=ec2.SubnetType.PRIVATE).subnet_ids
            self.vpc_subnets = ",".join(str(x) for x in private_subnets_select)
        else:
            # Create VPC if none provided
            print('Creating new VPC')
            self.vpc = ec2.Vpc(self, "VPC",
                               max_azs=2,
                               cidr="10.10.0.0/16",
                               # configuration will create 3 groups in 2 AZs = 6 subnets.
                               subnet_configuration=[ec2.SubnetConfiguration(
                                   subnet_type=ec2.SubnetType.PUBLIC,
                                   name="Public",
                                   cidr_mask=24
                               ), ec2.SubnetConfiguration(
                                   subnet_type=ec2.SubnetType.PRIVATE,
                                   name="Private",
                                   cidr_mask=24
                               ), ec2.SubnetConfiguration(
                                   subnet_type=ec2.SubnetType.ISOLATED,
                                   name="DB",
                                   cidr_mask=24
                               )
                               ],
                               # nat_gateway_provider=ec2.NatProvider.gateway(),
                               nat_gateways=2,
                               )

            # Fetching Isolated subnets, from newly cerated VPC:
            isolated_subnets_select = self.vpc.select_subnets(subnet_type=ec2.SubnetType.ISOLATED).subnet_ids
            self.vpc_subnets = ",".join(str(x) for x in isolated_subnets_select)

        # VPC Security Group:
        self.sg_benchmark_tool_01 = ec2.SecurityGroup(
            self,
            id="sg_benchmark_tool_01",
            vpc=self.vpc,
            security_group_name="security-grp-benchmark-tool-1"
        )

        # Security Inbound rules:
        """
        1) Granting all TCP communication (self-reference in/rule), among the resources added to this Security Group.        
        2) A different approach/example, using specific ingress network IP / Port:
        - input_network_cidr = ['54.240.198.0/24', '81.106.30.139/32']
        - for ip in input_network_cidr: 
        -     sg_benchmark_tool_01.add_ingress_rule(peer=ec2.Peer.ipv4(ip), connection=ec2.Port.tcp(8182))
        """
        self.sg_benchmark_tool_01.add_ingress_rule(peer=self.sg_benchmark_tool_01,
                                                   connection=ec2.Port.all_tcp(),
                                                   description="self-reference rule, to allow all TCP within same group")

        """
        @ Output begin
        """

        # Output: VPC ID
        core.CfnOutput(self, "Output-1", value=self.vpc.vpc_id)

        # Output: Security Group
        core.CfnOutput(self, "Output-2", value=self.sg_benchmark_tool_01.security_group_id)

        # Output: VPC Subnets
        core.CfnOutput(self, "Output-3", value=self.vpc_subnets)
