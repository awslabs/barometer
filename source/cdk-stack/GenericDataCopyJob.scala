import com.amazonaws.services.glue.GlueContext
import com.amazonaws.services.glue.util.GlueArgParser
import com.amazonaws.services.glue.util.Job
import java.util.Calendar
import org.apache.spark.SparkContext
import org.apache.spark.sql.Dataset
import org.apache.spark.sql.Row
import org.apache.spark.sql.SaveMode
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.from_json
import org.apache.spark.sql.streaming.Trigger
import scala.collection.JavaConverters._

object GenericDataCopyJob {
  def main(sysArgs: Array[String]): Unit = {
    val spark: SparkContext = new SparkContext()
    val glueContext: GlueContext = new GlueContext(spark)
    val sparkSession: SparkSession = glueContext.getSparkSession
    import sparkSession.implicits._

    // @params: [JOB_NAME, SECRET_ID, TABLE_DATA_PATH]
    val args = GlueArgParser.getResolvedOptions(sysArgs, Seq("JOB_NAME", "DRIVER_CLASS", "SECRET_ID", "TABLE_DATA_PATH").toArray)
    Job.init(args("JOB_NAME"), glueContext, args.asJava)
    val driverClass = args("DRIVER_CLASS")
    val secretId = args("SECRET_ID")
    val tableDataPath = args("TABLE_DATA_PATH")
    Class.forName(driverClass)

    val df = sparkSession.read.parquet(tableDataPath)
    val splits = tableDataPath.split('/')
    df.write
      .mode("overwrite")
      .format("jdbc")
      .option("url", secretId)
      .option("driver", driverClass)
      .option("dbtable", splits(splits.length - 2))
      .option("user", secretId)
      .save()
  }
}