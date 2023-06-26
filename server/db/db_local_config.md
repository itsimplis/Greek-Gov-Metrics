# Docker container with postgreSQL
```
docker run --name testing-postgres -e POSTGRES_PASSWORD=[your_password] -d -p 5432:5432 -v [YOUR PATH] postgres
```

## Create schema to db
```
docker cp [path_to_script]/create_schema.sql [postgres container]:/create_schema.sql
docker exec -it [postgres container] bash
psql -U [username] -d [database_name] -f create_schema.sql
```

## Insert initial data to db
```
docker cp [path_to_script]/insert_initial_data.sql [postgres container]:/insert_initial_data.sql
docker exec -it [postgres container] bash
psql -U [username] -d [database_name] -f insert_initial_data.sql
```

## Create a backup file of the database
```
docker exec -t <container_id_or_name> pg_dump -U postgres <database_name> > backup.sql
```

# Connect to DB from python
```
conn = psycopg2.connect(
    database="postgres",
    host="localhost",
    port="5432",
    user="postgres",
    password=[your_password]
)

cursor = conn.cursor()
```

## Create initial table (SQL query)
```
DROP TABLE IF EXISTS test_data_table;
CREATE TABLE test_data_table
    (
    ADA                 TEXT    PRIMARY KEY     NOT NULL,
    SUBJECT             TEXT                    NOT NULL,
    ORGANIZATION        TEXT                    NOT NULL,
    AMOUNT              TEXT,
    AMOUNT_WITH_KAE     TEXT,
    KAE                 TEXT,
    PUBLISH_DATE        TEXT
    );
'''
```

## Inserting data in database from python
```
insert_query = f"""
    INSERT INTO test_data_table 
    (ADA, SUBJECT, ORGANIZATION, AMOUNT, AMOUNT_WITH_KAE, KAE, PUBLISH_DATE)
    VALUES (%s,%s,%s,%s,%s,%s,%s);
    """
cursor.execute(insert_query, 
    (
    decision['ada'],
    str(decision['subject']),
    decision['organizationId'],
    decision['extraFieldValues']['amountWithVAT']['amount'],
    decision['extraFieldValues']['amountWithKae'][0]['amountWithVAT'],
    decision['extraFieldValues']['amountWithKae'][0]['kae'],
    datetime.datetime.fromtimestamp(decision['issueDate'] / 1000).strftime('%d-%m-%Y')
    )
)

cursor.close()
conn.close()
```

