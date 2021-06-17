from aws_cdk import (
    core,
    aws_ec2 as ec2
)


class CdkVpcPrereqsStack(core.Stack):

    def __init__(self, scope: core.Construct, construct_id: str, input_vpc_id, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # VPC settings:
        # input_vpc_id = 'vpc-36cdd450'
        self.vpc = ec2.Vpc.from_lookup(self, "VPC", vpc_id=input_vpc_id)

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

        # VPC Private Subnets, list as string:
        private_subnets_select = self.vpc.select_subnets(subnet_type=ec2.SubnetType.PRIVATE).subnet_ids
        self.private_subnets = ",".join(str(x) for x in private_subnets_select)

        """
        @ Output begin
        """

        # Output: VPC ID
        core.CfnOutput(self, "Output-1", value=self.vpc.vpc_id)

        # Output: Security Group
        core.CfnOutput(self, "Output-2", value=self.sg_benchmark_tool_01.security_group_id)

        # Output: VPC Subnets
        core.CfnOutput(self, "Output-3", value=self.private_subnets)
