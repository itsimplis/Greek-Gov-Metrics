import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.decisions.views import router as decision_router
from .routers.users.authentication import router as user_router

app = FastAPI()

# Cross-Origin related configuration
# ------------------------------------------------------------

# Add CORS middleware to allow CORS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decision_router, prefix="/decisions")
app.include_router(user_router, prefix="/users")

@app.get("/")
def get_data():
    return {"result": "API works !"}
