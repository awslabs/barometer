echo "cd /tmp" > /tmp/run.sh
echo 'while test -z "$TOOLS_PRESENT"' >> /tmp/run.sh
echo 'do' >> /tmp/run.sh
echo 'TOOLS_PRESENT=$(aws s3 ls s3://#BUCKET#/tools/TPC-DSGen-software-code-3.2.0rc1.zip)' >> /tmp/run.sh
echo 'echo "Tools not present on s3 bucket #BUCKET#. Retrying in 10 seconds."' >> /tmp/run.sh
echo "sleep 10" >> /tmp/run.sh
echo "done" >> /tmp/run.sh
echo "aws s3 cp s3://#BUCKET#/tools/TPC-DSGen-software-code-3.2.0rc1.zip ." >> /tmp/run.sh
echo "unzip TPC-DSGen-software-code-3.2.0rc1.zip" >> /tmp/run.sh
echo "cd TPC-DSGen-software-code-3.2.0rc1" >> /tmp/run.sh
echo "sh generate-dataset.sh 1 #BUCKET#" >> /tmp/run.sh
echo 'echo "Data generated. Shutting down ec2 instance after 2 minutes"' >> /tmp/run.sh
echo 'sleep 2m' >> /tmp/run.sh
echo 'sudo shutdown -h now' >> /tmp/run.sh
chmod +x /tmp/run.sh
nohup /tmp/run.sh &