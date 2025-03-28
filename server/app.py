# imports *********************************************************************************************************************
# flask
from flask import Flask, request, send_file, send_from_directory, jsonify, make_response, redirect
# cross origins
from flask_cors import CORS, cross_origin
# date and time
from pytz import timezone
from datetime import datetime, timedelta
import json
# random
import random
# string
import string
# database related imports
from database import init_db
from mongoengine import Q
from models import UserAccessTokens, Users, Farmers, Crop, FarmTypes, Location
# password encryption 
from encryption import encrypt_password
from encryption import verify_encrypted_password
# user browsing agent information
from information_on_user_browsing_device import information_on_user_browsing_device
# user access token validation
from access_token_validation import check_user_access_token_validity
# email structure validation
from email_structure_validation import is_email_structure_valid
# password structure validation
from password_structure_validation import is_password_structure_valid
# *****************************************************************************************************************************

# initialize a Flask application **********************************************************************************************
app = Flask(__name__)
# *****************************************************************************************************************************

# settings ********************************************************************************************************************
# flask debug mode
app.debug = True
# system timezone 
system_timezone = timezone('Africa/Harare')
# app roles
app_roles = ['admin', 'clerk']
# *****************************************************************************************************************************

# Cross Origins Stuff *********************************************************************************************************
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_HEADERS'] = 'Access-Control-Allow-Origin'
# app.config['CORS_RESOURCES'] = {r"/*": {"origins": ["http://localhost:3000"]}}
cors = CORS(app)
# *****************************************************************************************************************************

# function for user object password deletion ***********************************************************************************
def user_object_modification(user):
    # delete password
    del user['password']

    # return modified user object
    return user
# *****************************************************************************************************************************

# index ***********************************************************************************************************************
@app.route('/', methods=['POST', 'GET'])
def index():
    response = make_response('Farmers App API')
    response.status = 200
    
    # return response
    return response
# *****************************************************************************************************************************

# user authentication and account management functions ************************************************************************
# function for signing in *************************************************************************
@app.route('/signin', methods=['POST'])
def signin():
    # input field validation **************************************************
    # email
    try: email = request.form['email'] 
    except: response = make_response('Email field required'); response.status = 400; return response
    if email == '' or email == None: response = make_response('Email cannot be empty'); response.status = 400; return response
    # password
    try: password = request.form['password'] 
    except: response = make_response('Password field required'); response.status = 400; return response
    if password == '' or password == None: response = make_response('Password cannot be empty'); response.status = 400; return response
    # *************************************************************************

    # get user browsing device information
    user_browsing_agent, user_os, user_device, user_ip_address, user_browser = information_on_user_browsing_device(request)

    # get current datetime
    current_datetime_object = datetime.now(system_timezone)
    current_datetime = str(current_datetime_object)
    
    # calculate access token expiration date
    token_expiration_date_object = current_datetime_object + timedelta(days = 30)
    token_expiration_date = str(token_expiration_date_object)

    # get user with matching email
    matches_by_email = Users.objects.filter(email = email)
    if len(matches_by_email) > 0: match = matches_by_email[0]

    # no matches found
    if len(matches_by_email) == 0: 
        response = make_response('invalid credentials'); response.status = 401; return response

    # see if password is a match
    user_encrypted_password = match.password
    is_password_a_match = verify_encrypted_password(password, user_encrypted_password)
    if is_password_a_match == False: 
        response = make_response('invalid credentials'); response.status = 401; return response

    # create and return user access token
    def generate_access_token():
        token_length = 32
        token_characters = string.ascii_lowercase + string.digits + string.ascii_uppercase 
        token = "".join(random.choice(token_characters) for _ in range(token_length))
        return token
    generated_access_token = generate_access_token()

    # save access token details and modify original token *********************
    token_details = UserAccessTokens(
        user_id = str(match.id),
        token = generated_access_token,
        active = True,
        signin_date = current_datetime,
        signout_date = '',
        user_browsing_agent = user_browsing_agent,
        user_os = user_os,
        user_device = user_device,
        user_ip_address = user_ip_address,
        user_browser = user_browser,
        last_used_on_date = current_datetime,
        expiry_date = token_expiration_date
    )
    token_details.save()
    token_id = str(token_details.id)
    user_access_token = generated_access_token + '.' + token_id + '.' + current_datetime.replace('-', '').replace(':', '').replace('.', '').replace(' ', '')[::-1]
    UserAccessTokens.objects(id = token_id).update(token = user_access_token)
    # *************************************************************************

    # return object
    return_object = {
        'username': match.firstname + ' ' + match.lastname,
        'role': match.role,
        'token': user_access_token
    }

    # return username and user_access_token
    response = make_response(jsonify(return_object)); response.status = 202; return response
# *************************************************************************************************

# signout function ********************************************************************************
@app.route('/signout', methods=['POST'])
def signout():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # disable used access token
    token = UserAccessTokens.objects.filter(token = request.headers.get('Access-Token'))[0]
    UserAccessTokens.objects(id = token.id).update(active = False, signout_date = str(datetime.now(system_timezone)))

    # return response
    response = make_response('ok'); response.status = 200; return response
# *************************************************************************************************

# get account details function ********************************************************************
@app.route('/getAccountDetails', methods=['POST'])
def getAccountDetails():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get account details
    account_details = Users.objects.filter(id = user_id)[0]

    # return response
    response = make_response(account_details.to_json()); response.status = 200; return response
# *************************************************************************************************
# *****************************************************************************************************************************

# admin account management functions ******************************************************************************************
# admin function for adding an account ************************************************************
@app.route('/addAccount', methods=['POST'])
def addAccount():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # firstname
    try: firstname = request.form['firstname'] 
    except: response = make_response('Firstname field required'); response.status = 400; return response
    if firstname == '' or firstname == None: response = make_response('Firstname cannot be empty'); response.status = 400; return response
    if isinstance(firstname, str) == False: response = make_response('Firstname data type is invalid'); response.status = 400; return response
    # lastname
    try: lastname = request.form['lastname'] 
    except: response = make_response('Lastname field required'); response.status = 400; return response
    if lastname == '' or lastname == None: response = make_response('Lastname cannot be empty'); response.status = 400; return response
    if isinstance(lastname, str) == False: response = make_response('Lastname data type is invalid'); response.status = 400; return response
    # email
    try: email = request.form['email'] 
    except: response = make_response('Email field required'); response.status = 400; return response
    if email == '' or email == None: response = make_response('Email cannot be empty'); response.status = 400; return response
    if isinstance(email, str) == False: response = make_response('Email data type is invalid'); response.status = 400; return response
    if is_email_structure_valid(email) == False: response = make_response('invalid email structure') ; response.status = 400; return response
    # password
    try: password = request.form['password'] 
    except: response = make_response('Password field required'); response.status = 400; return response
    if password == '' or password == None: response = make_response('Password cannot be empty'); response.status = 400; return response
    if isinstance(password, str) == False: response = make_response('Password data type is invalid'); response.status = 400; return response
    if is_password_structure_valid(password) == False: response = make_response('invalid password structure'); response.status = 400; return response
    # role
    try: role = request.form['role']
    except: response = make_response('Role field required'); response.status = 400; return response
    if role == '' or role == None: response = make_response('Role cannot be empty'); response.status = 400; return response
    if isinstance(role, str) == False: response = make_response('Role data type is invalid'); response.status = 400; return response
    if role not in app_roles: response = make_response('Invalid role'); response.status = 404; return response
    # *************************************************************************

    # check if email is already in use
    if len(Users.objects.filter(email = email)) > 0: response = make_response('email in use'); response.status = 409; return response

    # encrypt submitted password
    password = encrypt_password(password)
    
    # register new user and retrieve account id 
    user_details = Users(
        firstname = firstname,
        lastname = lastname,
        email = email,
        password = password,
        role = role
    )
    user_details.save()

    # return response
    response = make_response('created'); response.status = 201; return response
# *************************************************************************************************

# get all users function **************************************************************************
@app.route('/getAllUsers', methods=['POST'])
def getAllUsers():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get all users
    all_users = Users.objects.all()

    # modify user objects... delete passwords
    all_users = json.loads(all_users.to_json())
    all_users = [user_object_modification(i) for i in all_users]


    # return response
    response = make_response(jsonify(all_users)); response.status = 200; return response
# *************************************************************************************************

# admin remove account function *******************************************************************
@app.route('/removeAccount', methods=['POST'])
def removeAccount():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # account id
    try: account_id = request.form['account_id'] 
    except: response = make_response('Account ID field required'); response.status = 400; return response
    if account_id == '' or account_id == None: response = make_response('Account ID cannot be empty'); response.status = 400; return response
    if isinstance(account_id, str) == False: response = make_response('Account ID data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # delete account
    try:
        Users.objects(id = account_id).delete()
        # return response
        response = make_response('deleted'); response.status = 200; return response
    except: response = make_response('Account does not exist'); response.status = 404; return response
# *************************************************************************************************
# *****************************************************************************************************************************

# admin functions for data collection form options configuration **************************************************************
# add crop ****************************************************************************************
@app.route('/addCrop', methods=['POST'])
def addCrop():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # name
    try: name = request.form['name'] 
    except: response = make_response('Name field required'); response.status = 400; return response
    if name == '' or name == None: response = make_response('Name cannot be empty'); response.status = 400; return response
    if isinstance(name, str) == False: response = make_response('Name data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # add new crop
    crop_details = Crop(
        name = name
    )
    crop_details.save()

    # return response
    response = make_response('ok'); response.status = 201; return response
# *************************************************************************************************

# delete crop *************************************************************************************
@app.route('/deleteCrop', methods=['POST'])
def deleteCrop():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # crop id
    try: crop_id = request.form['crop_id'] 
    except: response = make_response('Crop ID field required'); response.status = 400; return response
    if crop_id == '' or crop_id == None: response = make_response('Crop ID cannot be empty'); response.status = 400; return response
    if isinstance(crop_id, str) == False: response = make_response('Crop ID data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # delete crop
    try:
        Crop.objects(id = crop_id).delete()
        # return response
        response = make_response('deleted'); response.status = 200; return response
    except: response = make_response('Crop does not exist'); response.status = 404; return response
# *************************************************************************************************

# add farm type ***********************************************************************************
@app.route('/addFarmType', methods=['POST'])
def addFarmType():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # type
    try: type = request.form['type'] 
    except: response = make_response('Type field required'); response.status = 400; return response
    if type == '' or type == None: response = make_response('Type cannot be empty'); response.status = 400; return response
    if isinstance(type, str) == False: response = make_response('Type data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # add farm type
    farm_type_details = FarmTypes(
        type = type
    )
    farm_type_details.save()

    # return response
    response = make_response('ok'); response.status = 201; return response
# *************************************************************************************************

# delete farm type ********************************************************************************
@app.route('/deleteFarmType', methods=['POST'])
def deleteFarmType():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # farm type id
    try: farm_type_id = request.form['farm_type_id'] 
    except: response = make_response('Farm Type ID field required'); response.status = 400; return response
    if farm_type_id == '' or farm_type_id == None: response = make_response('Farm Type ID cannot be empty'); response.status = 400; return response
    if isinstance(farm_type_id, str) == False: response = make_response('Farm Type ID data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # delete farm type
    try:
        FarmTypes.objects(id = farm_type_id).delete()
        # return response
        response = make_response('deleted'); response.status = 200; return response
    except: response = make_response('Farm Type does not exist'); response.status = 404; return response
# *************************************************************************************************

# add location ************************************************************************************
@app.route('/addLocation', methods=['POST'])
def addLocation():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # name
    try: name = request.form['name'] 
    except: response = make_response('Name field required'); response.status = 400; return response
    if name == '' or name == None: response = make_response('Name cannot be empty'); response.status = 400; return response
    if isinstance(name, str) == False: response = make_response('Name data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # add location
    location_details = Location(
        name = name
    )
    location_details.save()

    # return response
    response = make_response('ok'); response.status = 201; return response
# *************************************************************************************************

# delete location *********************************************************************************
@app.route('/deleteLocation', methods=['POST'])
def deleteLocation():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # location id
    try: location_id = request.form['location_id'] 
    except: response = make_response('Location ID field required'); response.status = 400; return response
    if location_id == '' or location_id == None: response = make_response('Location ID cannot be empty'); response.status = 400; return response
    if isinstance(location_id, str) == False: response = make_response('Location ID data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # delete location
    try:
        Location.objects(id = location_id).delete()
        # return response
        response = make_response('deleted'); response.status = 200; return response
    except: response = make_response('Location does not exist'); response.status = 404; return response
# *************************************************************************************************
# *****************************************************************************************************************************

# farmers functions ***********************************************************************************************************
# add farmer function *****************************************************************************
@app.route('/addFarmer', methods=['POST'])
def addFarmer():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # name
    try: name = request.form['name'] 
    except: response = make_response('Name field required'); response.status = 400; return response
    if name == '' or name == None: response = make_response('Name cannot be empty'); response.status = 400; return response
    if isinstance(name, str) == False: response = make_response('Name data type is invalid'); response.status = 400; return response
    # national ID
    try: national_id = request.form['national_id'] 
    except: response = make_response('National ID field required'); response.status = 400; return response
    if national_id == '' or national_id == None: response = make_response('National ID cannot be empty'); response.status = 400; return response
    if isinstance(national_id, str) == False: response = make_response('National ID data type is invalid'); response.status = 400; return response
    # farm ID
    try: farm_id = request.form['farm_id'] 
    except: response = make_response('Farm ID field required'); response.status = 400; return response
    if farm_id == '' or farm_id == None: response = make_response('Farm ID cannot be empty'); response.status = 400; return response
    if isinstance(farm_id, str) == False: response = make_response('Farm ID data type is invalid'); response.status = 400; return response
    # farm type
    try: farm_type = request.form['farm_type'] 
    except: response = make_response('Farm Type field required'); response.status = 400; return response
    if farm_type == '' or farm_type == None: response = make_response('Farm Type cannot be empty'); response.status = 400; return response
    if isinstance(farm_type, str) == False: response = make_response('Farm Type data type is invalid'); response.status = 400; return response
    # crop
    try: crop = request.form['crop']
    except: response = make_response('Crop field required'); response.status = 400; return response
    if crop == '' or crop == None: response = make_response('Crop cannot be empty'); response.status = 400; return response
    if isinstance(crop, str) == False: response = make_response('Crop data type is invalid'); response.status = 400; return response
    # location
    try: location = request.form['location']
    except: response = make_response('Location field required'); response.status = 400; return response
    if location == '' or location == None: response = make_response('Location cannot be empty'); response.status = 400; return response
    if isinstance(location, str) == False: response = make_response('Location data type is invalid'); response.status = 400; return response
    # *************************************************************************
    
    # register new farmer
    farmer_details = Farmers(
        name = name,
        national_id = national_id,
        farm_id = farm_id,
        farm_type = farm_type,
        crop = crop,
        location = location
    )
    farmer_details.save()

    # return response
    response = make_response('registered'); response.status = 201; return response
# *************************************************************************************************

# get farmers function ****************************************************************************
@app.route('/getFarmers', methods=['POST'])
def getFarmers():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get all farmers
    farmers = Farmers.objects.all()

    # return response
    response = make_response(farmers.to_json()); response.status = 200; return response
# *************************************************************************************************
# *************************************************************************************************

# edit farmer function ****************************************************************************
@app.route('/editFarmer', methods=['POST'])
def editFarmer():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # farmer's id
    try: farmer_id = request.form['farmer_id'] 
    except: response = make_response('Farmer ID field required'); response.status = 400; return response
    if farmer_id == '' or farmer_id == None: response = make_response('Farmer ID cannot be empty'); response.status = 400; return response
    if isinstance(farmer_id, str) == False: response = make_response('Farmer ID data type is invalid'); response.status = 400; return response
    # name
    try: name = request.form['name'] 
    except: response = make_response('Name field required'); response.status = 400; return response
    if name == '' or name == None: response = make_response('Name cannot be empty'); response.status = 400; return response
    if isinstance(name, str) == False: response = make_response('Name data type is invalid'); response.status = 400; return response
    # national ID
    try: national_id = request.form['national_id'] 
    except: response = make_response('National ID field required'); response.status = 400; return response
    if national_id == '' or national_id == None: response = make_response('National ID cannot be empty'); response.status = 400; return response
    if isinstance(national_id, str) == False: response = make_response('National ID data type is invalid'); response.status = 400; return response
    # farm ID
    try: farm_id = request.form['farm_id'] 
    except: response = make_response('Farm ID field required'); response.status = 400; return response
    if farm_id == '' or farm_id == None: response = make_response('Farm ID cannot be empty'); response.status = 400; return response
    if isinstance(farm_id, str) == False: response = make_response('Farm ID data type is invalid'); response.status = 400; return response
    # farm type
    try: farm_type = request.form['farm_type'] 
    except: response = make_response('Farm Type field required'); response.status = 400; return response
    if farm_type == '' or farm_type == None: response = make_response('Farm Type cannot be empty'); response.status = 400; return response
    if isinstance(farm_type, str) == False: response = make_response('Farm Type data type is invalid'); response.status = 400; return response
    # crop
    try: crop = request.form['crop']
    except: response = make_response('Crop field required'); response.status = 400; return response
    if crop == '' or crop == None: response = make_response('Crop cannot be empty'); response.status = 400; return response
    if isinstance(crop, str) == False: response = make_response('Crop data type is invalid'); response.status = 400; return response
    # location
    try: location = request.form['location']
    except: response = make_response('Location field required'); response.status = 400; return response
    if location == '' or location == None: response = make_response('Location cannot be empty'); response.status = 400; return response
    if isinstance(location, str) == False: response = make_response('Location data type is invalid'); response.status = 400; return response
    # *************************************************************************
    
    # update farmer's details *************************************************
    try:
        Farmers.objects(id = farmer_id).update(
            name = name,
            national_id = national_id,
            farm_id = farm_id,
            farm_type = farm_type,
            crop = crop,
            location = location
        )
        # return response
        response = make_response('updated'); response.status = 200; return response
    except: response = make_response('Farmer does not exist'); response.status = 404; return response
    # *************************************************************************
# *************************************************************************************************

# remove farmer function **************************************************************************
@app.route('/removeFarmer', methods=['POST'])
def removeFarmer():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # input field validation **************************************************
    # farmer id
    try: farmer_id = request.form['farmer_id'] 
    except: response = make_response('Farmer ID field required'); response.status = 400; return response
    if farmer_id == '' or farmer_id == None: response = make_response('Farmer ID cannot be empty'); response.status = 400; return response
    if isinstance(farmer_id, str) == False: response = make_response('Farmer ID data type is invalid'); response.status = 400; return response
    # *************************************************************************

    # remove farmer ***********************************************************
    try:
        Farmer.objects(id = farmer_id).delete()
        # return response
        response = make_response('deleted'); response.status = 200; return response
    except: response = make_response('Farmer does not exist'); response.status = 404; return response
    # *************************************************************************
# *************************************************************************************************
# *****************************************************************************************************************************

# form options retrieval functions ********************************************************************************************
# get farm types **********************************************************************************
@app.route('/getFarmTypes', methods=['POST'])
def getFarmTypes():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get all farm types 
    farm_types = FarmTypes.objects.all()

    # return response
    response = make_response(farm_types.to_json()); response.status = 200; return response
# *************************************************************************************************

# get crops ***************************************************************************************
@app.route('/getCrops', methods=['POST'])
def getCrops():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get all crops
    crops = Crop.objects.all()

    # return response
    response = make_response(crops.to_json()); response.status = 200; return response
# *************************************************************************************************

# get locations ***********************************************************************************
@app.route('/getLocations', methods=['POST'])
def getLocations():
    # check user access token's validity
    access_token_status, user_id, user_role = check_user_access_token_validity(request, 'admin/clerk') # request data, expected user role
    if access_token_status != 'ok':  response = make_response(access_token_status); response.status = 401; return response

    # get all locations
    locations = Location.objects.all()

    # return response
    response = make_response(locations.to_json()); response.status = 200; return response
# *************************************************************************************************
# *****************************************************************************************************************************

if __name__ == '__main__':
    # initialize db ***********************************************************************************************************
    init_db()
    # *************************************************************************************************************************
    # run flask app ***********************************************************************************************************
    app.run(host='0.0.0.0', port=5000, threaded=True) # for development
    # *************************************************************************************************************************