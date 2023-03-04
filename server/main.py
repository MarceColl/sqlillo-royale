import os
import psycopg as pg
from fastapi import FastAPI, Body, HTTPException, Request, Depends
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel 
from psycopg_pool import ConnectionPool

from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login import LoginManager 
from fastapi_login.exceptions import InvalidCredentialsException



app = FastAPI()

SECRET = "asdf4321asdf4321"
manager = LoginManager(SECRET, "/login")
manager.useRequest(app)

pool = ConnectionPool(os.getenv("DATABASE_URL", "postgresql://mmz:mzz@localhost:5432/mmz"))
templates = Jinja2Templates(directory="templates")


def is_logged(request: Request):
    user = request.state.user
    if user is None:
        raise HTTPException(401)
    else:
        return user


def migrate():
    with pool.connection() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            mid SERIAL PRIMARY KEY,
            applied_at TIMESTAMPTZ
        )
        """)

    for root, _, files in os.walk('migrations'):
        for file in sorted(files):
            mid = int(file.split("_")[0])

            with pool.connection() as conn, conn.cursor() as cur:
                cur.execute("""
                SELECT * FROM _migrations
                WHERE mid = %(mid)s
                """, dict(mid=mid))

                db_mid = cur.fetchone()

                if db_mid:
                    print(f"Migration {file} already applied. Skipping")
                    continue

                with open(f"{root}/{file}", "r") as f:
                    cur.execute(f.read())

                cur.execute("""
                INSERT INTO _migrations (mid, applied_at) VALUES (%(mid)s, now())
                """, dict(mid=mid))

                print(f"Applied {file}")


class NewCode(BaseModel):
    code: str


@app.post("/user/{account_id}/code")
def new_account_code(account_id: str, new_code: NewCode = Body(embed=True), user=Depends(manager)):
    print("user", user)
    insert_code_query = """
    INSERT INTO code (account, code) VALUES (%(account)s, %(code)s)
    """

    query_data = {
        "account": account_id,
        "code": new_code.code,
    }

    with pool.connection() as conn:
        conn.execute(insert_code_query, query_data)

    return {"status": "OK"}


@app.post("/login")
def login(data: OAuth2PasswordRequestForm = Depends()):
    username = data.username
    password = data.password

    user = query_user(username)

    if not user:
        raise InvalidCredentialsException
    elif password != user['password']:
        raise InvalidCredentialsException

    access_token = manager.create_access_token(
        data={'sub': username}
    )

    return {'access_token': access_token}


@app.get("/")
def root(request: Request):
    query = """
    SELECT code FROM 
    """
    print("user", request.state.user)
    return templates.TemplateResponse("home.html", {"request": request, "user": request.state.user})


@manager.user_loader()
def query_user(username: str):
    query = """
    SELECT username, password FROM accounts
    WHERE username = %(username)s
    """

    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute(query, dict(username=username))
        user = cur.fetchone()

    if user:
        return {
            "name": user[0],
            "password": user[1]
        }
    else:
        return None


@app.on_event("startup")
def init():
    migrate()


@app.on_event("shutdown")
def shutdown():
    pool.close()

