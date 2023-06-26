# Group 1 - GreekGovMetrics
## 2023-msc-ath-1
# App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

## Third party libraries

Please use package.json / package-lock.json to install all third party libraries needed, before running the Angular server.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

docker-compose exec db psql -U myuser -c "COPY mytable(name, age, gender) FROM '/data/data.csv' DELIMITER ',' CSV HEADER;"
docker-compose up -d

# Database
The database needs to be running and filled with data, so that the backend can server that data to the frontend. 

## Setting up
To initiate the database of the project please follow the instruction found inside the `db_local_config.md` file under the `db` sub-directory of the `server` directory:
```
/server/db/db_local_config.md
```

# Backend

## Packages 
To install all of the required packages for the backend python scripts open a terminal and navigate to the `server` directory of this project:
```
.../server> pip install -r requirements.txt
```

## Starting the server
To initiate the backend server (API) part of the application, execute (directly from the main directory of the project):
``` 
...> py -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload 
```

## Downloading data
Please note that for any of the following scripts to work, the database's docker container needs to be up and running!
Also, please note that all scripts are tailored to work with the database configuration described in the `db_local_config.md` file (see the corresponding section), so make sure to apply the necessary changes to the python scripts if your environment is setup is different. 

To download data from diavgeia and load the staging environment table you have to run the `fetch.py` python script found within the `data_prep` sub-directory of the `server` directory. You can alter lines 13 and 14 to configure the start and end years respectively. Be aware that if `end_year` is earlier than `start_year`, no data will be downloaded.
```
.../server/data_prep> py fetch.py
```

## ETL
To execute the ETL pipeline for this project, execute the `etl.py` python script found within the `ETL` sub-directory of the `server` directory.

ETL can be run simulatenously with `fetch.py`, although it is suggested to first wait for the fetching process to finish downloading all of the available data.

```
.../server/ETL> py etl.py
```
