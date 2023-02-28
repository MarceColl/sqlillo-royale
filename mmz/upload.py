import os
import sys
import psycopg as pg

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://mmz:mmz@localhost:5432/mmz')

account = sys.argv[1]
with open(sys.argv[2], 'r') as f:
    code = f.read()

query = """
INSERT INTO code (account, code)
"""
