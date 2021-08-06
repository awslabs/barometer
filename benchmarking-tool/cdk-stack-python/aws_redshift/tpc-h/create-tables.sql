CREATE TABLE IF NOT EXISTS region (
    r_regionkey int4 not null,
    r_name char(25) not null,
    r_comment varchar(152) not null,
    Primary Key(R_REGIONKEY)
    )
    DISTKEY(r_regionkey) SORTKEY(r_regionkey);
