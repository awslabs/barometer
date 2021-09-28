echo '#!/bin/bash' > /tmp/run.sh
echo 'cd /tmp' >> /tmp/run.sh
echo 'LOCK_FILE=/tmp/run.lock' >> /tmp/run.sh
echo 'if test -f "$LOCK_FILE"; then' >> /tmp/run.sh
echo 'echo "Lock file present another process already running. Exiting."' >> /tmp/run.sh
echo 'exit 1' >> /tmp/run.sh
echo 'else' >> /tmp/run.sh
echo 'echo "Generating lock file $LOCK_FILE."' >> /tmp/run.sh
echo 'touch $LOCK_FILE' >> /tmp/run.sh
echo 'fi' >> /tmp/run.sh
echo 'TOOLS_PRESENT=$(aws s3 ls s3://#BUCKET#/tools/TPC-DSGen-software-code-3.2.0rc1.zip)' >> /tmp/run.sh
echo 'if test -z "$TOOLS_PRESENT"' >> /tmp/run.sh
echo 'then' >> /tmp/run.sh
echo 'echo "Tools not present on s3 bucket #BUCKET#. Retrying in 60 seconds"' >> /tmp/run.sh
echo 'rm -f $LOCK_FILE' >> /tmp/run.sh
echo 'exit 1' >> /tmp/run.sh
echo 'fi' >> /tmp/run.sh
echo 'aws s3 cp s3://#BUCKET#/tools/TPC-DSGen-software-code-3.2.0rc1.zip .' >> /tmp/run.sh
echo 'unzip TPC-DSGen-software-code-3.2.0rc1.zip' >> /tmp/run.sh
echo 'cd TPC-DSGen-software-code-3.2.0rc1' >> /tmp/run.sh
echo './generate-dataset.sh 1 #BUCKET#' >> /tmp/run.sh
echo 'echo "Data generated. Shutting down ec2 instance now."' >> /tmp/run.sh
echo 'rm -f $LOCK_FILE' >> /tmp/run.sh
echo 'sudo shutdown -h now' >> /tmp/run.sh
echo "===== Script written to /tmp/run.sh ======"
cat /tmp/run.sh
echo "===== Script written to /tmp/run.sh ======"
sudo chmod +x /tmp/run.sh
sudo chown root /tmp/run.sh
echo '* * * * * /tmp/run.sh >> /tmp/run.log' > /tmp/mycrontab
echo '* * * * * aws s3 cp /tmp/run.log s3://#BUCKET#/tools/logs/dataset-loader.log' >> /tmp/mycrontab
echo "Scheduling crontab to execute job every minute"
sudo crontab /tmp/mycrontab
sudo crontab -l