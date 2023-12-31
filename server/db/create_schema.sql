DROP TABLE IF EXISTS stg.DECISION;

DROP TABLE IF EXISTS prd.DECISION;

DROP TABLE IF EXISTS prd.KAE;

DROP TABLE IF EXISTS prd.THEMATIC_CATEGORY;

DROP TABLE IF EXISTS prd.MUNICIPALITY;

DROP TABLE IF EXISTS prd.REGION;

DROP TABLE IF EXISTS prd.DECISION_TYPE;

DROP TABLE IF EXISTS prd.USER;

DROP TABLE IF EXISTS prd.USER_DECISION;

DROP TABLE IF EXISTS prd.SIGNER;

DROP SCHEMA IF EXISTS stg;

DROP SCHEMA IF EXISTS prd;

CREATE SCHEMA stg;

CREATE SCHEMA prd;

CREATE TABLE stg.DECISION (
    ADA VARCHAR(100),
    SUBJECT TEXT,
    PROTOCOL_NUMBER TEXT,
    PUBLISH_DATE TEXT,
    ORGANIZATION VARCHAR(100),
    DECISION_TYPE VARCHAR(100),
    AMOUNT FLOAT,
    THEMATIC_CATEGORY VARCHAR(100),
    KAE VARCHAR(100),
    PDF_URL TEXT,
    SIGNER VARCHAR(100),
    STATUS TEXT
);

CREATE TABLE prd.DECISION (
    ADA VARCHAR(100),
    SUBJECT TEXT,
    PROTOCOL_NUMBER TEXT,
    PUBLISH_DATE TEXT,
    ORGANIZATION VARCHAR(100),
    DECISION_TYPE VARCHAR(100),
    AMOUNT FLOAT,
    THEMATIC_CATEGORY VARCHAR(100),
    KAE VARCHAR(100),
    PDF_URL TEXT,
    SIGNER VARCHAR(100),
    STATUS TEXT,
    SUSPICIOUS INT
);

CREATE TABLE prd.USER (
    USERNAME VARCHAR(100),
    MAIL_ADDRESS TEXT,
    PASSWORD VARCHAR(100)

);

CREATE TABLE prd.USER_DECISION (
    USERNAME VARCHAR(100),
    ADA VARCHAR(20),
    NOTE TEXT,
    NOTE_TAG VARCHAR(100)
);

CREATE TABLE prd.MUNICIPALITY (
    UID VARCHAR(15) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL,
    SUPERVISOR_LABEL TEXT NOT NULL,
    REGION VARCHAR(8) NOT NULL,
    POPULATION VARCHAR(20)
);

CREATE TABLE prd.REGION (
    UID VARCHAR(8) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL,
    POPULATION VARCHAR(20)
);

CREATE TABLE prd.KAE (
    UID VARCHAR(8) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL
);

CREATE TABLE prd.THEMATIC_CATEGORY (
    UID VARCHAR(8) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL
);

CREATE TABLE prd.DECISION_TYPE (
    UID VARCHAR(10) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL
);

CREATE TABLE prd.SIGNER (
    UID VARCHAR(30) PRIMARY KEY NOT NULL,
    LABEL TEXT NOT NULL
);