from mongoengine import connect
from mongoengine import Q
from models import Users
from pytz import timezone
from datetime import datetime, timedelta
from encryption import encrypt_password, verify_encrypted_password
import dns
import urllib
import os
import ssl

# database to use *************************************************************************************************************
database_to_use = 'development' # mock / development / production
# *****************************************************************************************************************************

# db connection ***************************************************************************************************************
# mock db
if database_to_use == 'mock':
    # mongo mock import
    from mongomock import MongoClient
    # mongo mock client
    client = MongoClient(mongo_client_class=MongoClient, db_name="eport-farmers-app")
    # port
    port = client.address[1]
    # connect
    connect(host=f"localhost:{port}", mongo_client_class=MongoClient)

# development db
if database_to_use == 'development':
    # connect
    connect('eport-farmers-app', host='localhost', port=27017, alias='default')

if database_to_use == 'production':
    # get live database credentials from environment variables
    live_db_username = os.environ.get('LIVE_DB_USERNAME')
    live_db_password = os.environ.get('LIVE_DB_PASSWORD')
    live_db_url = '@'
    # connection url
    connect_url = 'mongodb+srv://'+live_db_username+':'+urllib.parse.quote(live_db_password)+live_db_url
    # connect
    connect(host=connect_url, ssl=True, alias='default')
# *****************************************************************************************************************************

def init_db():

    # get all users *************************************************************************************************************
    all_users = list(Users.objects.all())
    # ***************************************************************************************************************************
    # initialize admin and clerk accounts ***************************************************************************************
    if len(all_users) == 0:
        # admin
        admin_details = Users(
            firstname = 'System',
            lastname = 'Administrator',
            email = 'sysadmin@farmersapp.com',
            password = str(encrypt_password('Initial@1234')),
            role = 'admin'
        )
        admin_details.save()
        
        # clerk
        clerk_details = Users(
            firstname = 'Michael',
            lastname = 'Mudimbu',
            email = 'michaelmudimbu@gmail.com',
            password = str(encrypt_password('Test@1234')),
            role = 'clerk'
        )
        clerk_details.save()
    # ***************************************************************************************************************************
    # *************************************************************************************************************************