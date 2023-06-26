import numpy as np
from datetime import datetime, timedelta
import re
import psycopg2
from psycopg2 import extras
from tqdm import tqdm


# Date
def normalized_date(unix_date):

    norm_date = datetime.fromtimestamp(
        int(unix_date)/1000).strftime("%d-%m-%Y")

    return norm_date

# Suspicious
# Simple IQR implementation
def iqr(data):
    # Calculate Q1, Q3, and IQR
    q1 = np.percentile(data, 25)
    q3 = np.percentile(data, 75)
    iqr = q3 - q1

    # Calculate the lower and upper bounds for outliers
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    # Find the outliers
    outliers = [x for x in data if x < lower_bound or x > upper_bound]

    return outliers


def find_suspicious(amount):
    suspicious = 0

    if amount != None:

        if amount > 1000000000:
            suspicious = 1
        elif amount < 1:
            suspicious = 1
        elif "." not in str(amount):
            suspicious = 1

    return suspicious

# KAE


def normalzied_kae(raw_kae):
    if raw_kae != None:
        regex = re.findall("\d\d\d\d", raw_kae)
        if regex != []:
            return regex[0]
        else:
            return None
    else:
        return None


# Get list of adas
def get_ada_list(conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("""
        SELECT DISTINCT ADA FROM prd.decision;
    """)

    adas = cur.fetchall()
    adas = [ada[0] for ada in adas]
    return adas 

# Insert To DB
def insert_db(conn, ada, subject, protocol_number, publish_date, organization,
              decision_type, amount, thematic_category, kae, pdf_url, signer, status, suspicious):
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("""
    INSERT INTO prd.decision (ada, subject, protocol_number, publish_date, organization, decision_type, amount,
                          thematic_category, kae, pdf_url, signer, status, suspicious)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (ada, subject, protocol_number, publish_date, organization, decision_type, amount,
                 thematic_category, kae, pdf_url, signer, status, suspicious))

    # Commit the transaction to persist the changes
    conn.commit()


# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    database="postgres",
    user="postgres",
    password="password"
)

# Create a cursor object to interact with the database
cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

# Loop per municipality
cur.execute("SELECT DISTINCT ORGANIZATION FROM stg.decision")
db_municipalities = cur.fetchall()

adas = get_ada_list(conn)
duplicates = 0
new_entries = 0
for municipality in tqdm(db_municipalities):
    cur.execute(
        f"SELECT * FROM stg.decision WHERE ORGANIZATION = '{municipality[0]}'")
    # print(municipality[0])
    municipality_result = cur.fetchall()
    for row in municipality_result:
        # Example data to insert
        ada = row['ada']
        subject = row['subject']
        protocol_number = row['protocol_number']
        publish_date = normalized_date(row['publish_date'])
        organization = row['organization']
        decision_type = row['decision_type']
        amount = row['amount']
        thematic_category = row['thematic_category']
        kae = normalzied_kae(row['kae'])
        pdf_url = row['pdf_url']
        signer = row['signer']
        status = row['status']
        suspicious = find_suspicious(row['amount'])

        if ada not in adas:
            insert_db(conn, ada, subject, protocol_number, publish_date, organization,
                      decision_type, amount, thematic_category, kae, pdf_url, signer, status, suspicious)
            new_entries += 1

        else:
            duplicates +=1 

conn.close()

print(f"Number of new entries: {new_entries}")
print(f"Number of entries skipped: {duplicates}")