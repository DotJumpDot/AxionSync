# fastapi dev main.py
# uvicorn main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.conn import Database

import uvicorn

app = FastAPI()

db_con = Database() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello AxionSync API"}

@app.get("/users")
def get_users():
    return db_con.fetch_users()



if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=80, reload=True)
