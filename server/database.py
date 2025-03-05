from models import Users
import mongoengine
from mongoengine import connect, connection, get_connection, disconnect
from mongomock import MongoClient
import dns
import urllib
from encryption import encrypt_password, verify_encrypted_password
from datetime import datetime
import os

# get live database credentials from environment variables
live_db_username = os.environ.get('LIVE_DB_USERNAME')
live_db_password = os.environ.get('LIVE_DB_PASSWORD')
live_db_url = os.environ.get('LIVE_DB_URL')

# get development database credentials from environment variables (Optional, can work without this)
# development_db_username = os.environ.get('DEVELOPMENT_DB_USERNAME')
# development_db_password = os.environ.get('DEVELOPMENT_DB_PASSWORD')
development_db_username = 'admin'
development_db_password = 'test@1234!'

# get selected database ... mock / development / live
selected_database = 'development'

# function to connect to the database *****************************************************************************************************
def connect_to_database():
    if selected_database == 'mock':
        # mock db connection
        client = MongoClient(mongo_client_class=MongoClient, db_name="eport-farmers-app-mock")
        port = client.address[1]
        connect(host=f"localhost:{port}", mongo_client_class=MongoClient)
    elif selected_database == 'development':
        # development db connection
        connect_url = 'mongodb://'+development_db_username+':'+urllib.parse.quote(development_db_password)+'@localhost:27017/eport-farmers-app-development'
        connect(host=connect_url)
    elif selected_database == 'live':
        # live db connection
        connect_url = 'mongodb+srv://'+live_db_username+':'+urllib.parse.quote(live_db_password)+live_db_url
        connect(host=connect_url, ssl=True, ssl_cert_reqs='CERT_NONE')
    else:
        print('UNKNOWN DATABASE SELECTION:', selected_database)
# *****************************************************************************************************************************************

# connect to db ***************************************************************************************************************************
# get the MongoDB client from the MongoEngine connection
try:
    # client
    client = get_connection()
    # check if the connection is already established
    if client is None:
        print("\n\nNo client connection available. Attempting to connect...")
        connect_to_database()
        print("New database connection established.")
    else:
        print("\n\nClient connection retrieved.")
        # if client is not None, check if it's primary
        if client.is_primary:
            print("Already connected to the primary database.")
        else:
            print("Connected to a secondary node.")
except mongoengine.connection.ConnectionFailure as e:
    print(f'\n\nConnection failed: {e}')
    print('Establishing new database connection.')
    connect_to_database()
    print("New database connection established.")
except Exception as e:
    print(f"\n\nAn unexpected error occurred: {e}")
    connect_to_database()
# *****************************************************************************************************************************************

# initialize database *********************************************************************************************************************
def init_db():
    # get all users *************************************************************************************************************
    users = Users.objects.all()
    # ***************************************************************************************************************************
# *****************************************************************************************************************************************

# close database connection ***************************************************************************************************************
def close_db():
    # disconnect from connection url
    disconnect()
# *****************************************************************************************************************************************