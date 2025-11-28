from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database.connect import Database
from src.api.api_user import router as api_user
from src.api.api_auth import router as api_auth
from src.api.api_memo import router as api_memo

from dotenv import load_dotenv
import os
import uvicorn

app = FastAPI()

db_con = Database()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_BASE_URL")],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

################################ ตัวจัดการ API Router ################################
app.include_router(api_user)
app.include_router(api_auth)
app.include_router(api_memo)


####################################################################################


@app.get("/")
def read_root():
    return {"message": "Hello AxionSync API"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80, reload=True)
