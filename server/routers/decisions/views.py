import json
import collections
from fastapi import APIRouter, Depends
from .models import PostgresConnector
from decimal import Decimal

PROD_SCHEMA = "prd"
STG_SCHEMA = "stg"

router = APIRouter()

connector = PostgresConnector(
    host="localhost",
    port=5432,
    database="postgres",
    user="postgres",
    password="password",
)


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


@router.get("/")
async def get_data(type: str):
    connector.connect()
    column_names = connector.execute(
        f"SELECT column_name FROM information_schema.columns WHERE table_name = '{type}'"
    )
    keys = [column[0] for column in column_names]
    columns = ", ".join(keys)
    result = connector.execute(f"SELECT {columns} FROM {type}")
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data, object_pairs_hook=collections.OrderedDict)


# =============================================================================================


# Endpoint to retrieve full data of a single decision
@router.get("/decision/")
async def get_data(id: str):
    connector.connect()
    keys = ["ada", "subject", "organization", "publish_date", "kae", "thematic_category",
            "decision_type", "pdf_url", "status", "protocol_number", "signer", "suspicious", "amount"]
    result = connector.execute(f"""
        SELECT prd.decision.ada, prd.decision.subject, prd.municipality.label, prd.decision.publish_date, prd.kae.label, prd.thematic_category.label , prd.decision_type.label, prd.decision.pdf_url, prd.decision.status, prd.decision.protocol_number, prd.signer.label, prd.decision.suspicious, prd.decision.amount 
        FROM prd.decision
        LEFT JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        LEFT JOIN prd.kae ON prd.decision.kae = prd.kae.uid
        LEFT JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        LEFT JOIN prd.decision_type ON prd.decision.decision_type = prd.decision_type.uid
        LEFT JOIN prd.signer ON prd.decision.signer = prd.signer.uid
        WHERE prd.decision.ada = '{id}'
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# =============================================================================================


# Endpoint to only retrieve regions, that have municipalities that exist in decisions table
@router.get("/regions/")
async def get_data():
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(
        f"""
        SELECT DISTINCT(prd.region.uid), prd.region.label
        FROM prd.region
        INNER JOIN prd.municipality ON prd.region.uid = prd.municipality.region
        INNER JOIN prd.decision ON prd.municipality.uid = prd.decision.organization
        ORDER BY prd.region.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint to only retrieve municipalities that exist in decisions table
@router.get("/municipalities/")
async def get_data():
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(f"""
        SELECT DISTINCT(prd.municipality.uid), prd.municipality.label
        FROM prd.municipality
        INNER JOIN prd.decision ON prd.municipality.uid = prd.decision.organization
        ORDER BY prd.municipality.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# =============================================================================================

# Endpoint to only retrieve thematic categories of a specific region


@router.get("/regions/thematic/")
async def get_data(region: str):
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(f"""
        SELECT DISTINCT(prd.thematic_category.uid), prd.thematic_category.label
        FROM prd.thematic_category
        INNER JOIN prd.decision ON prd.thematic_category.uid = prd.decision.thematic_category
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        WHERE prd.region.uid = '{region}'
        ORDER BY prd.thematic_category.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint to only retrieve kaes of a specific region
@router.get("/regions/kaes/")
async def get_data(region: str):
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(f"""
        SELECT DISTINCT(prd.kae.uid), prd.kae.label
        FROM prd.kae
        INNER JOIN prd.decision ON prd.kae.uid = prd.decision.kae
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        WHERE prd.region.uid = '{region}'
        ORDER BY prd.kae.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# =============================================================================================


# Endpoint to only retrieve thematic categories of a specific municipality
@router.get("/municipalities/thematic/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(f"""
        SELECT DISTINCT(prd.thematic_category.uid), prd.thematic_category.label
        FROM prd.thematic_category
        INNER JOIN prd.decision ON prd.thematic_category.uid = prd.decision.thematic_category
        WHERE prd.decision.organization = '{municipality}'
        ORDER BY prd.thematic_category.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint to only retrieve kaes of a specific municipality
@router.get("/municipalities/kaes/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["uid", "label"]
    result = connector.execute(f"""
        SELECT DISTINCT(prd.kae.uid), prd.kae.label
        FROM prd.kae
        INNER JOIN prd.decision ON prd.kae.uid = prd.decision.kae
        WHERE prd.decision.organization = '{municipality}'
        ORDER BY prd.kae.label ASC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# =============================================================================================


# Endpoint for sum of expenses for each thematic category, per municipality
@router.get("/municiplities/expensesAllThematic/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["thematic_category_uid", "thematic_category", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.thematic_category.uid, prd.thematic_category.label, sum(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid 
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid 
        WHERE prd.decision.organization = '{municipality}'
        GROUP BY prd.thematic_category.uid
        HAVING SUM(prd.decision.amount) >= 0;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for expenses per thematic category, per municipality
@router.get("/municiplities/expensesPerThematic/")
async def get_data(municipality: str, thematic_category: str):
    connector.connect()
    keys = ["ada", "amount", "organization", "thematic_category",
            "publish_date", "pdf_url", "subject", "signer", "suspicious"]
    result = connector.execute(f"""
        SELECT prd.decision.ada, prd.decision.amount, prd.municipality.label, prd.thematic_category.label, prd.decision.publish_date, prd.decision.pdf_url, prd.decision.subject, prd.signer.label, prd.decision.suspicious
        FROM prd.decision 
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid 
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid 
        INNER JOIN prd.signer ON prd.decision.signer = prd.signer.uid
        WHERE prd.decision.organization = '{municipality}' AND prd.decision.thematic_category = '{thematic_category}'
        ORDER BY prd.decision.amount DESC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for sum of expenses for each Kae, per municipality
@router.get("/municiplities/expensesAllKae/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["kae_uid", "kae", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.kae.uid, prd.kae.label, sum(prd.decision.amount) AS sum_amount
        FROM prd.decision 
        INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid 
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid 
        WHERE prd.decision.organization = '{municipality}'
        GROUP BY prd.kae.uid
        HAVING SUM(prd.decision.amount) >= 0;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for expenses per kae, per municipality
@router.get("/municiplities/expensesPerKae/")
async def get_data(municipality: str, kae: str):
    connector.connect()
    keys = ["ada", "amount", "organization", "kae",
            "publish_date", "pdf_url", "subject", "signer", "suspicious"]
    result = connector.execute(f"""
        SELECT prd.decision.ada, prd.decision.amount, prd.municipality.label, prd.kae.label, prd.decision.publish_date, prd.decision.pdf_url, prd.decision.subject, prd.signer.label, prd.decision.suspicious
        FROM prd.decision 
        INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid 
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.signer ON prd.decision.signer = prd.signer.uid 
        WHERE prd.decision.organization = '{municipality}' AND prd.decision.kae = '{kae}'
        ORDER BY prd.decision.amount DESC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# =============================================================================================


# Endpoint for sum of expenses for each thematic category, per region
@router.get("/regions/expensesAllThematic/")
async def get_data(region: str):
    connector.connect()
    keys = ["thematic_category_uid", "thematic_category", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.thematic_category.uid, prd.thematic_category.label, SUM(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        WHERE prd.region.uid = '{region}'
        GROUP BY prd.thematic_category.uid
        HAVING SUM(prd.decision.amount) >= 0;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for expenses per thematic category, per region
@router.get("/regions/expensesPerThematic/")
async def get_data(region: str, thematic_category: str):
    connector.connect()
    keys = ["ada", "region", "thematic_category", "amount",
            "publish_date", "pdf_url", "subject", "signer", "suspicious"]
    result = connector.execute(f"""
        SELECT prd.decision.ada, prd.region.label, prd.thematic_category.label, prd.decision.amount, prd.decision.publish_date, prd.decision.pdf_url, prd.decision.subject, prd.signer.label, prd.decision.suspicious
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        INNER JOIN prd.signer ON prd.decision.signer = prd.signer.uid
        WHERE prd.region.uid = '{region}' AND prd.decision.thematic_category = '{thematic_category}'
        ORDER BY prd.decision.amount DESC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for sum of expenses for each kae, per region
@router.get("/regions/expensesAllKae/")
async def get_data(region: str):
    connector.connect()
    keys = ["kae_uid", "kae", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.kae.uid, prd.kae.label, SUM(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
        WHERE prd.region.uid = '{region}'
        GROUP BY prd.kae.uid
        HAVING SUM(prd.decision.amount) >= 0;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for expenses per kae, per region
@router.get("/regions/expensesPerKae/")
async def get_data(region: str, kae: str):
    connector.connect()
    keys = ["ada", "region", "kae", "publish_date",
            "amount", "pdf_url", "subject", "signer", "suspicious"]
    result = connector.execute(f"""
        SELECT prd.decision.ada, prd.region.label, prd.kae.label, prd.decision.publish_date, prd.decision.amount, prd.decision.pdf_url, prd.decision.subject, prd.signer.label, prd.decision.suspicious
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
        INNER JOIN prd.signer ON prd.decision.signer = prd.signer.uid
        WHERE prd.region.uid = '{region}' AND prd.decision.kae = '{kae}'
        ORDER BY prd.decision.amount DESC;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# =============================================================================================


# Endpoint for top 10 regions in thematic expenses
@router.get("/region/topThematic/")
async def get_data():
    connector.connect()
    keys = ["region_uid", "region", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.region.uid, prd.region.label, SUM(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        GROUP BY prd.region.uid
        ORDER BY sum_amount DESC
        LIMIT 10;
        
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for top 10 regions in kae expenses
@router.get("/region/topKae/")
async def get_data():
    connector.connect()
    keys = ["region_uid", "region", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.region.uid, prd.region.label,SUM(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        GROUP BY prd.region.uid
        ORDER BY sum_amount DESC
        LIMIT 10;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for top 10 regions in expenses
@router.get("/region/totalThematicExpenses/")
async def get_data():
    connector.connect()
    keys = ["region_uid", "region", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.region.uid, prd.region.label, TRUNC(SUM(prd.decision.amount)) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        GROUP BY prd.region.uid
        LIMIT 10;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# =============================================================================================


# Endpoint for top 10 municipalities in thematic expenses
@router.get("/municipality/topThematic/")
async def get_data():
    connector.connect()
    keys = ["municipality_uid", "municipality", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.municipality.uid, prd.municipality.label, TRUNC(SUM(prd.decision.amount)) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        GROUP BY prd.municipality.uid
        ORDER BY sum_amount DESC
        LIMIT 10;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for top 10 municipalities in kae expenses
@router.get("/municipality/topKae/")
async def get_data():
    connector.connect()
    keys = ["municipality_uid", "municipality", "sum_amount"]
    result = connector.execute(f"""
SELECT prd.municipality.uid,prd.municipality.label,TRUNC(SUM(prd.decision.amount)) AS sum_amount
FROM prd.decision
INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
WHERE prd.decision.amount IS NOT NULL
GROUP BY prd.municipality.uid
ORDER BY sum_amount DESC
LIMIT 10
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for top 10 municipalities in thematic expenses
@router.get("/municipality/totalThematicExpenses/")
async def get_data():
    connector.connect()
    keys = ["municipality_uid", "municipality", "sum_amount"]
    result = connector.execute(f"""
        SELECT prd.municipality.uid, prd.municipality.label, SUM(prd.decision.amount) AS sum_amount
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        GROUP BY prd.municipality.uid
        LIMIT 10;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# =======================================================================

# Endpoint for total municipality expenses compared to its region


@router.get("/municipality/municipalityOfRegionsExpenses/")
async def get_data(municipality: str):
    connector.connect()
    keys_mun = ["mun_uid", "mun_label", "mun_total_sum"]
    result_mun = connector.execute(f"""
        SELECT prd.municipality.uid as mun_uid, prd.municipality.label AS mun_label, SUM(prd.decision.amount) AS mun_total_sum
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        WHERE prd.municipality.uid = '{municipality}'
        GROUP BY prd.municipality.uid
    """)
    data_mun = collections.OrderedDict(
        zip(keys_mun, result_mun[0])) if result_mun else {}

    keys_reg = ["reg_uid", "reg_label", "reg_total_sum"]
    result_reg = connector.execute(f"""
        SELECT prd.region.uid as reg_uid, prd.region.label as reg_label, SUM(prd.decision.amount) AS reg_total_sum
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        WHERE prd.region.uid IN (SELECT prd.municipality.region FROM prd.municipality WHERE prd.municipality.uid = '{municipality}')
        GROUP BY prd.region.uid
    """)
    data_reg = collections.OrderedDict(
        zip(keys_reg, result_reg[0])) if result_reg else {}

    connector.disconnect()

    if not data_mun and not data_reg:
        return []

    combined_data = {**data_mun, **data_reg}
    json_data = json.dumps([combined_data], cls=DecimalEncoder)
    return json.loads(json_data)

# =======================================================================


# Endpoint to retrieve full data of a single municipality
@router.get("/municipalityData/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["municipality_uid", "label", "amount", "population",
            "total_decisions", "first_date", "last_date"]
    result = connector.execute(f"""
		SELECT prd.decision.organization, prd.municipality.label,  SUM(prd.decision.amount) as total_amount, prd.municipality.population, count(prd.decision.ada) as total_decisions, TO_CHAR(MIN(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')), 'DD-MM-YYYY') as first_date, TO_CHAR(MAX(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')), 'DD-MM-YYYY') as last_date
        FROM prd.decision
        LEFT JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        LEFT JOIN prd.kae ON prd.decision.kae = prd.kae.uid
        LEFT JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
        LEFT JOIN prd.decision_type ON prd.decision.decision_type = prd.decision_type.uid
        LEFT JOIN prd.signer ON prd.decision.signer = prd.signer.uid
        WHERE prd.decision.organization IN (SELECT prd.municipality.uid FROM prd.municipality WHERE prd.municipality.label = '{municipality}')
        GROUP BY prd.municipality.label,prd.decision.organization,prd.municipality.population
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

    # Endpoint to retrieve KAE expenses per year for a single municipality


@router.get("/municipality/kaeexpensesperyear/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["year","total_expenses"]
    result = connector.execute(f"""
SELECT EXTRACT(YEAR FROM TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')) AS year, SUM(prd.decision.amount) AS total_expenses
FROM prd.decision
INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
WHERE prd.municipality.uid = '{municipality}'
GROUP BY year
ORDER BY year
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)



    
# Endpoint to retrieve THEMATIC expenses per year for a single municipality

@router.get("/municipality/thematicexpensesperyear/")
async def get_data(municipality: str):
    connector.connect()
    keys = ["year","total_expenses"]
    result = connector.execute(f"""
SELECT EXTRACT(YEAR FROM TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')) AS year, SUM(prd.decision.amount) AS total_expenses
FROM prd.decision
INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
WHERE prd.municipality.uid = '{municipality}'
GROUP BY year
ORDER BY year
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# ========================================================================================================================

# Endpoint to retrieve KAE expenses per year for a single region


@router.get("/region/kaeexpensesperyear/")
async def get_data(region: str):
    connector.connect()
    keys = ["year","total_expenses"]
    result = connector.execute(f"""
SELECT EXTRACT(YEAR FROM TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')) AS year, SUM(prd.decision.amount) AS total_expenses
FROM prd.decision
INNER JOIN prd.kae ON prd.decision.kae = prd.kae.uid
INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
WHERE prd.region.uid = '{region}'
GROUP BY year
ORDER BY year
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)



    
# Endpoint to retrieve THEMATIC expenses per year for a single region


@router.get("/region/thematicexpensesperyear/")
async def get_data(region: str):
    connector.connect()
    keys = ["year","total_expenses"]
    result = connector.execute(f"""
SELECT EXTRACT(YEAR FROM TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')) AS year, SUM(prd.decision.amount) AS total_expenses
FROM prd.decision
INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
WHERE prd.region.uid = '{region}'
GROUP BY year
ORDER BY year
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)



# Endpoint to retrieve full data of a single region
@router.get("/regionData/")
async def get_data(region: str):
    connector.connect()
    keys = ["region_uid", "label", "amount",
            "total_decisions", "first_date", "last_date", "population"]
    result = connector.execute(f"""
SELECT
    prd.region.uid,
    prd.region.label,
    SUM(prd.decision.amount) AS sum_amount,
    COUNT(prd.decision.ada),
    TO_CHAR(MIN(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')), 'DD-MM-YYYY') AS first_date,
    TO_CHAR(MAX(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')), 'DD-MM-YYYY') AS last_date,
    pop.population
FROM
    prd.decision
    INNER JOIN prd.thematic_category ON prd.decision.thematic_category = prd.thematic_category.uid
    INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
    INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
    INNER JOIN (
        SELECT
            SUM(CAST(mun.population AS FLOAT)) AS population,
            reg.label AS region_label
        FROM
            prd.region reg
            JOIN prd.municipality mun ON reg.uid = mun.region
        WHERE
            reg.label = '{region}'
        GROUP BY
            reg.label
    ) AS pop ON prd.region.label = pop.region_label
WHERE
    prd.region.label = '{region}'
GROUP BY
    prd.region.uid,
    prd.region.label,
    pop.population;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# Endpoint for top 5 municipalities with most decisions


@router.get("/municipality/top5decisions/")
async def get_data():
    connector.connect()
    keys = ["municipality_uid", "municipality", "total_decisions"]
    result = connector.execute(f"""
		SELECT prd.decision.organization, prd.municipality.label, count(prd.decision.ada) as total_decisions 
        FROM prd.decision
        LEFT JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        GROUP BY prd.municipality.label,prd.decision.organization
		ORDER BY total_decisions DESC
		LIMIT 5  
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# Endpoint for top 5 regions with most decisions


@router.get("/region/top5decisions/")
async def get_data():
    connector.connect()
    keys = ["region_uid", "region", "total_decisions"]
    result = connector.execute(f"""
		SELECT prd.region.uid, prd.region.label, count(prd.decision.ada) as total_decisions 
        FROM prd.decision
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
		INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        GROUP BY prd.region.label,prd.region.uid
		ORDER BY total_decisions DESC
		LIMIT 5
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# Endpoint for top 5 THEMATIC categories


@router.get("/statistics/top5thematic/")
async def get_data():
    connector.connect()
    keys = ["thematic_uid", "thematic_label", "thematic_total_decisions"]
    result = connector.execute(f"""
        SELECT prd.thematic_category.uid, prd.thematic_category.label, COUNT(*) AS category_count
        FROM prd.thematic_category
        INNER JOIN prd.decision ON prd.thematic_category.uid = prd.decision.thematic_category
        INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
        INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
        GROUP BY prd.thematic_category.uid, prd.thematic_category.label
        ORDER BY category_count DESC
        LIMIT 5;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for top 5 kae


@router.get("/statistics/top5kae/")
async def get_data():
    connector.connect()
    keys = ["kae_uid", "kae_label", "kae_total_decisions"]
    result = connector.execute(f"""
    SELECT prd.kae.uid, prd.kae.label, COUNT(*) AS kae_count
    FROM prd.kae
    INNER JOIN prd.decision ON prd.kae.uid = prd.decision.kae
    GROUP BY prd.kae.uid, prd.kae.label
    ORDER BY kae_count DESC
    LIMIT 5;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)



@router.get("/statistics/top5signers/")
async def get_data():
    connector.connect()
    keys = ["signer", "signer_municipality", "signer_total_decisions"]
    result = connector.execute(f"""
    SELECT prd.signer.label, prd.municipality.label, COUNT(*) AS count
    FROM prd.decision
    INNER JOIN prd.signer ON prd.decision.signer = prd.signer.uid
    LEFT JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
    GROUP BY prd.signer.label, prd.municipality.label
    ORDER BY count DESC
    LIMIT 5;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


# Endpoint for getting the count of decisions that are between 0 and 1 euro


@router.get("/statistics/decisionsunder1euro/")
async def get_data():
    connector.connect()
    keys = ["amount","total_records_checked"]
    result = connector.execute(f"""
SELECT
    COUNT(CASE WHEN PRD.DECISION.AMOUNT > 0 AND PRD.DECISION.AMOUNT <= 1 THEN 1 END) AS amount_up_to_1,
    COUNT(*) AS total_records_checked
FROM
    PRD.DECISION;    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

    # Endpoint for getting the count of decisions that are over 10 million euros


@router.get("/statistics/decisionsover1millioneuro/")
async def get_data():
    connector.connect()
    keys = ["amount","total_records_checked"]
    result = connector.execute(f"""
SELECT
    COUNT(CASE WHEN PRD.DECISION.AMOUNT > 10000000 THEN 1 END) AS amount_over_1mil,
    COUNT(*) AS total_records_checked
FROM
    PRD.DECISION;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

    # Endpoint for getting the last update in our database


@router.get("/statistics/latestupdate/")
async def get_data():
    connector.connect()
    keys = ["last_date"]
    result = connector.execute(f"""
	    SELECT TO_CHAR(MAX(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')),'DD-MM-YYYY') as last_date 
        FROM prd.decision
		ORDER BY last_date DESC
		LIMIT 1
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)
        # Endpoint for getting the first date in our database(Exlude dates before 2015)


@router.get("/statistics/firstupdate/")
async def get_data():
    connector.connect()
    keys = ["first_date"]
    result = connector.execute(f"""
SELECT TO_CHAR(min(TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY')), 'DD-MM-YYYY') as first_date 
FROM prd.decision
WHERE TO_DATE(prd.decision.publish_date, 'DD-MM-YYYY') >= TO_DATE('01-01-2015', 'DD-MM-YYYY')
ORDER BY first_date desc
LIMIT 1;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)



    # Endpoint for getting the number of decisions in the last year


@router.get("/statistics/decisionscurrentyear/")
async def get_data():
    connector.connect()
    keys = ["last_year"]
    result = connector.execute(f"""
    SELECT count(*) 
    FROM prd.decision
    WHERE EXTRACT(YEAR FROM TO_DATE(publish_date, 'DD-MM-YYYY')) = EXTRACT(YEAR FROM CURRENT_DATE)
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

@router.get("/statistics/region/mostexpenses/")
async def get_data():
    connector.connect()
    keys = ["region.uid","region","amount"]
    result = connector.execute(f"""
SELECT
    prd.region.uid,
    prd.region.label,
    TRUNC(SUM(prd.decision.amount)) AS sum_amount
FROM
    prd.decision
    INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
    INNER JOIN prd.region ON prd.municipality.region = prd.region.uid
GROUP BY
    prd.region.uid,
    prd.region.label
ORDER BY
    sum_amount DESC
LIMIT 1;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

@router.get("/statistics/municipality/mostexpenses/")
async def get_data():
    connector.connect()
    keys = ["municipality.uid","municipality","amount"]
    result = connector.execute(f"""
SELECT
    prd.municipality.uid,
    prd.municipality.label,
    TRUNC(SUM(prd.decision.amount)) AS sum_amount
FROM
    prd.decision
    INNER JOIN prd.municipality ON prd.decision.organization = prd.municipality.uid
GROUP BY
    prd.municipality.uid,
    prd.municipality.label
ORDER BY
    sum_amount DESC
LIMIT 1;

    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# GEORGE WAS HERE
#==================================================================================================================#

# decisions per user 
@router.get("/statistics/decisionspercitizen/")
async def get_data():
    connector.connect()
    keys = ["decisions_per_citizen"]
    result = connector.execute(f"""
        SELECT
            org.label AS organization,
            COUNT(dec.ada) / CAST(org.population AS DECIMAL) AS decisions_per_citizen
        FROM
            prd.municipality org
            JOIN prd.decision dec ON org.uid = dec.organization
        WHERE
            status = 'PUBLISHED'
        GROUP BY
            org.label, org.population, dec.organization;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# amount per user 
@router.get("/statistics/amount_per_citizen/")
async def get_data():
    connector.connect()
    keys = ["amount_per_citizen"]
    result = connector.execute(f"""
        SELECT
            org.label AS organization,
            SUM(dec.amount) / CAST(org.population AS DECIMAL) AS average_amount_per_citizen
        FROM
            prd.municipality org
            JOIN prd.decision dec ON org.uid = dec.organization
        WHERE
            status = 'PUBLISHED'
        GROUP BY
            org.label, org.population, dec.organization;
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# amount per thematic category
@router.get("/statistics/amount_per_thematic_category/")
async def get_data():
    connector.connect()
    keys = ["amount_per_thematic_category"]
    result = connector.execute(f"""
        SELECT
            them.label AS category,
            SUM(dec.amount) AS total_amount
        FROM
            prd.thematic_category them
            JOIN prd.decision dec ON them.uid = dec.thematic_category
        where
            status = 'PUBLISHED'
        GROUP BY
            them.label, dec.thematic_category;

    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)


#==================================================================================================================#
