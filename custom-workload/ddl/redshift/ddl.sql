create table if not exists table_1
(
    id   int        not null,
    name varchar(3) not null,
    primary key (id)
) distkey (id);

create table if not exists table_2
(
    id  int not null,
    age int not null,
    primary key (id)
) distkey (id);