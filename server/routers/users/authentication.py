import json
import collections
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from ..decisions.models import PostgresConnector

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


class RegisterData(BaseModel):
    email: str
    username: str
    password: str
    password2: str


class UserListDecision(BaseModel):
    username: str
    ada: str
    note: str
    note_tag: str


class LoginData(BaseModel):
    username: str
    password: str


# Secret key for JWT authentication signing
JWT_SECRET_KEY = "7f59da32cdeef05ac9ec8a5da22b9f120c152bccfc1a02a57b96db5c14db52a5"

# ===============================================================================================

# Endpoint to register as a new user
@router.post("/register")
async def register(data: RegisterData):
    connector.connect()

    # Case check - Blank username or white-space
    if not data.username.strip():
        raise HTTPException(
            status_code=400, detail="Το όνομα χρήστη δε μπορεί να είναι κενό!")

    # Case check - Blank password or white-space
    if not data.password.strip():
        raise HTTPException(
            status_code=400, detail="Ο κωδικός πρόσβασης δε μπορεί να είναι κενός!")

    # Case check - Blank email or white-space
    if not data.email.strip():
        raise HTTPException(
            status_code=400, detail="Το email δε μπορεί να είναι κενό!")

    # Case check - Password validation failed
    if (data.password != data.password2):
        raise HTTPException(
            status_code=400, detail="Οι κωδικοί πρόσβασης δεν είναι ίδιοι!")

    # Case check - Username already exists
    result = connector.execute(
        "SELECT prd.user.username FROM prd.user WHERE prd.user.username = %s", (
            data.username,)
    )
    if result:
        raise HTTPException(
            status_code=400, detail=f"Ο χρήστης '{data.username}' υπάρχει ήδη!")

    # Hash the password before storing
    hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt())

    connector.execute(
        "INSERT INTO prd.user (username, mail_address, password) VALUES (%s, %s, %s)",
        (data.username, data.email, hashed_password.decode('utf-8'),)
    )

    connector.commit()
    return {"message": "Επιτυχής δημιουργία λογαριασμού!"}

# ===============================================================================================

# Endpoint to login as an existing user
@router.post("/login")
async def login(data: LoginData):
    connector.connect()

    result = connector.execute(
        "SELECT * FROM prd.user WHERE prd.user.username = %s", (data.username,)
    )

    if result:
        user = result[0]
    else:
        user = None

    # Case check - Incorrect username or password
    if user is None or not bcrypt.checkpw(data.password.encode(), user[2].encode('utf-8')):
        raise HTTPException(
            status_code=400, detail="Λάθος όνομα χρήστη ή κωδικός πρόσβασης!")

    # Generate JWT access token
    access_token = generate_access_token(user[0])
    return {"access_token": access_token, "username": user[0], "message": "Επιτυχής είσοδος στο λογαριασμό!"}

# ===============================================================================================

# Endpoint to retrieve full data of a single decision
@router.get("/listdecision")
async def get_data(username: str):
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
        WHERE prd.decision.ada IN (SELECT prd.user_decision.ada FROM prd.user_decision WHERE prd.user_decision.username = '{username}');
    """)
    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# ===============================================================================================


# Endpoint to add a decision to user list
@router.post("/listdecision/add")
async def register(data: UserListDecision):
    connector.connect()

    # Case check - Username already exists
    result = connector.execute(
        "SELECT prd.user_decision.username, prd.user_decision.ada FROM prd.user_decision WHERE prd.user_decision.username = %s AND prd.user_decision.ada = %s", (
            data.username, data.ada)
    )
    if result:
        raise HTTPException(
            status_code=400, detail=f"Η πράξη '{data.ada}' υπάρχει ήδη στη λίστα σας!")

    connector.execute(
        "INSERT INTO prd.user_decision (username, ada) VALUES (%s, %s)",
        (data.username, data.ada)
    )

    connector.commit()
    return {"message": f"Η πράξη '{data.ada}' προστέθηκε στη λίστα σας!"}

# ===============================================================================================

# Endpoint to remove a decision from user list


@router.post("/listdecision/remove")
async def register(data: UserListDecision):
    connector.connect()

    # Case check - decision already exists in user list
    result = connector.execute("SELECT prd.user_decision.username, prd.user_decision.ada FROM prd.user_decision WHERE prd.user_decision.username = %s AND prd.user_decision.ada = %s", (data.username, data.ada)
                               )
    if result:
        connector.execute(
            "DELETE FROM prd.user_decision WHERE prd.user_decision.username = %s AND prd.user_decision.ada = %s", (
                data.username, data.ada)
        )
    else:
        raise HTTPException(
            status_code=400, detail=f"Η πράξη '{data.ada}' δεν υπάρχει στη λίστα σας!")

    connector.commit()
    return {"message": f"Η πράξη '{data.ada}' αφαιρέθηκε απ'τη λίστα σας!"}

# ===============================================================================================

# Endpoint to remove a decision from user list
@router.post("/listdecision/removeAll")
async def register(data: UserListDecision):
    connector.connect()

    # Case check - decision already exists in user list
    result = connector.execute("SELECT prd.user_decision.username, prd.user_decision.ada FROM prd.user_decision WHERE prd.user_decision.username = %s", (data.username)
                               )
    if result:
        connector.execute(
            "DELETE FROM prd.user_decision WHERE prd.user_decision.username = %s", (
                data.username)
        )
    else:
        raise HTTPException(
            status_code=400, detail=f"Δεν υπάρχουν πράξεις στη λίστα σας!")

    connector.commit()
    return {"message": f"Όλες οι πράξεις αφαιρέθηκαν απ'τη λίστα σας!"}

# ===============================================================================================

# Endpoint to retrieve all notes of a user, sorted by highest importance
@router.get("/notes")
async def getNotes(username: str):
    connector.connect()
    keys = ["username", "ada", "note", "note_tag"]
    result = connector.execute(
        f"""SELECT prd.user_decision.username, prd.user_decision.ada, prd.user_decision.note, prd.user_decision.note_tag 
        FROM prd.user_decision 
        WHERE prd.user_decision.username = '{username}' AND prd.user_decision.note <> ''
        ORDER BY note_tag DESC"""
    )

    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# ===============================================================================================

# Endpoint to get a note from a decision in user list
@router.get("/listdecision/note")
async def getNote(username: str, ada: str):
    connector.connect()
    keys = ["username", "ada", "note", "note_tag"]
    result = connector.execute(
        f"""SELECT prd.user_decision.username, prd.user_decision.ada, prd.user_decision.note, prd.user_decision.note_tag
        FROM prd.user_decision 
        WHERE prd.user_decision.username = '{username}' AND prd.user_decision.ada = '{ada}'"""
    )

    data = [collections.OrderedDict(zip(keys, row)) for row in result]
    json_data = json.dumps(data, cls=DecimalEncoder)
    connector.disconnect()
    return json.loads(json_data)

# ===============================================================================================

# Endpoint to add a note to a decision in user list
@router.post("/listdecision/note/add")
async def editNote(data: UserListDecision):
    connector.connect()

    # Case check - note exists for the given ada and username
    result = connector.execute(
        "SELECT prd.user_decision.username, prd.user_decision.ada FROM prd.user_decision WHERE prd.user_decision.username = %s AND prd.user_decision.ada = %s",
        (data.username, data.ada)
    )

    if result:
        # If the note exists, update it
        connector.execute(
            "UPDATE prd.user_decision SET note = %s, note_tag = %s WHERE prd.user_decision.ada = %s AND prd.user_decision.username = %s",
            (data.note, data.note_tag, data.ada, data.username)
        )
        connector.commit()
        if (data.note == ""):
            return {"message": f"Η σημείωση της πράξης '{data.ada}' αφαιρέθηκε!"}
        else:
            return {"message": f"Η σημείωση της πράξης '{data.ada}' ενημερώθηκε!"}

    else:
        # If the note doesn't exist, add it
        connector.execute(
            "INSERT INTO prd.user_decision (username, ada, note) VALUES (%s, %s, %s)",
            (data.username, data.ada, data.note)
        )
        connector.commit()
        return {"message": f"Η σημείωση προστέθηκε στη πράξη '{data.ada}'!"}

# ===============================================================================================

# Define JWT payload and generate JWT token (token expiration days: 1)
def generate_access_token(username):

    payload = {
        "username": username,
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    # Generate JWT token
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")

    return token
