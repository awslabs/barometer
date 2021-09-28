BASE_PATH=/home/ec2-user/DSGen-software-code-3.2.0rc1
BENCHMARKING_QUERY_BUCKET=aws-prototype-solution-data-benchmark
echo "Creating required directories for queries & templates"
mkdir $BASE_PATH/queries
mkdir $BASE_PATH/templates
echo "Copying all templates & variants"
cp $BASE_PATH/query_templates/*.tpl $BASE_PATH/templates
cp $BASE_PATH/query_variants/*.tpl $BASE_PATH/templates
echo "Adding _END sub"
sed -i '1 i\define _END = "";' $BASE_PATH/templates/query*.tpl
echo "Building tools using makefile"
cd $BASE_PATH/tools
make
echo "Generating queries from all templates & variants"
for tpl in "$BASE_PATH"/templates/query*.tpl; do
    query_tpl=$(basename $tpl)
    ./dsqgen -DIRECTORY $BASE_PATH/templates -INPUT $BASE_PATH/templates/templates.lst -VERBOSE Y -QUALIFY Y -SCALE 1 -DIALECT netezza -OUTPUT_DIR $BASE_PATH/queries -TEMPLATE "$query_tpl"
    mv $BASE_PATH/queries/query_0.sql $BASE_PATH/queries/"$query_tpl".sql
done
echo "Overwriting variants queries on original ones"
for tpl in "$BASE_PATH"/templates/query*a.tpl; do
  query_tpl=$(basename $tpl)
  mv $BASE_PATH/queries/"$query_tpl".sql "$BASE_PATH/queries/${query_tpl//a/}".sql
done
sed -i -e 's/substr/substring/g' $BASE_PATH/queries/*.sql
aws s3 cp $BASE_PATH/queries s3://$BENCHMARKING_QUERY_BUCKET/datasets/tpc-data/tpc-ds-v3/benchmarking-queries --recursive