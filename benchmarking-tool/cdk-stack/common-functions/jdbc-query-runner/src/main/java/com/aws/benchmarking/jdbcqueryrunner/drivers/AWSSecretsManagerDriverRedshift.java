
package com.aws.benchmarking.jdbcqueryrunner.drivers;

import com.amazonaws.secretsmanager.caching.SecretCache;
import com.amazonaws.secretsmanager.caching.SecretCacheConfiguration;
import com.amazonaws.secretsmanager.sql.AWSSecretsManagerDriver;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.util.StringUtils;

import java.sql.SQLException;

/**
 * <p>
 * Provides support for accessing Redshift databases using credentials stored within AWS Secrets Manager.
 * </p>
 *
 * <p>
 * Configuration properties are specified using the "redshift" subprefix (e.g drivers.redshift.realDriverClass).
 * </p>
 */
public final class AWSSecretsManagerDriverRedshift extends AWSSecretsManagerDriver {

    /**
     * The PostgreSQL error code for when a user logs in using an invalid password.
     * <p>
     * See <a href="https://www.postgresql.org/docs/9.6/static/errcodes-appendix.html">PostgreSQL documentation</a>.
     */
    public static final String ACCESS_DENIED_FOR_USER_USING_PASSWORD_TO_DATABASE = "28P01";

    /**
     * Set to postgresql.
     */
    public static final String SUBPREFIX = "redshift";

    static {
        AWSSecretsManagerDriver.register(new AWSSecretsManagerDriverRedshift());
    }

    /**
     * Constructs the driver setting the properties from the properties file using system properties as defaults.
     * Instantiates the secret cache with default options.
     */
    public AWSSecretsManagerDriverRedshift() {
        super();
    }

    /**
     * Constructs the driver setting the properties from the properties file using system properties as defaults.
     * Uses the passed in SecretCache.
     *
     * @param cache Secret cache to use to retrieve secrets
     */
    public AWSSecretsManagerDriverRedshift(SecretCache cache) {
        super(cache);
    }

    /**
     * Constructs the driver setting the properties from the properties file using system properties as defaults.
     * Instantiates the secret cache with the passed in client builder.
     *
     * @param builder Builder used to instantiate cache
     */
    public AWSSecretsManagerDriverRedshift(AWSSecretsManagerClientBuilder builder) {
        super(builder);
    }

    /**
     * Constructs the driver setting the properties from the properties file using system properties as defaults.
     * Instantiates the secret cache with the provided AWS Secrets Manager client.
     *
     * @param client AWS Secrets Manager client to instantiate cache
     */
    public AWSSecretsManagerDriverRedshift(AWSSecretsManager client) {
        super(client);
    }

    /**
     * Constructs the driver setting the properties from the properties file using system properties as defaults.
     * Instantiates the secret cache with the provided cache configuration.
     *
     * @param cacheConfig Cache configuration to instantiate cache
     */
    public AWSSecretsManagerDriverRedshift(SecretCacheConfiguration cacheConfig) {
        super(cacheConfig);
    }

    @Override
    public String getPropertySubprefix() {
        return SUBPREFIX;
    }

    @Override
    public boolean isExceptionDueToAuthenticationError(Exception e) {
        if (e instanceof SQLException) {
            SQLException sqle = (SQLException) e;
            String sqlState = sqle.getSQLState();
            return sqlState.equals(ACCESS_DENIED_FOR_USER_USING_PASSWORD_TO_DATABASE);
        }
        return false;
    }

    @Override
    public String constructUrlFromEndpointPortDatabase(String endpoint, String port, String dbname) {
        String url = "jdbc:redshift://" + endpoint;
        if (!StringUtils.isNullOrEmpty(port)) {
            url += ":" + port;
        }
        if (!StringUtils.isNullOrEmpty(dbname)) {
            url += "/" + dbname;
        }
        return url;
    }

    @Override
    public String getDefaultDriverClass() {
        return "com.amazon.redshift.Driver";
    }
}

