# database imports
from models import UserAccessTokens, Users
# user browsing agent information
from information_on_user_browsing_device import information_on_user_browsing_device
# traceback
import traceback
# datetime
from pytz import timezone
from datetime import datetime, timedelta

# database initialization ******************************************************************************************************
from database import init_db
init_db()
# *****************************************************************************************************************************

# function for checking a user access token's validity
def check_user_access_token_validity(request_data, expected_user_role):
    try:
        # get user access token
        user_access_token = request_data.headers.get('Access-Token')

        # get information on user's browsing device
        user_browsing_agent, user_os, user_device, user_ip_address, user_browser = information_on_user_browsing_device(request_data)
        
        # check token's validity while trying to retrieve the user's system id
        token_details = UserAccessTokens.objects.filter(
            token = user_access_token, 
            user_browsing_agent = user_browsing_agent
        )[0]

        # get user id
        user_id = token_details.user_id

        # get user details
        user = Users.objects.filter(id = user_id)[0]

        # get user role
        user_role = user.role

        # get current date and time
        current_datetime = str(datetime.now(timezone('Africa/Harare')))

        # get access token status ********************************
        # check if access token is still active
        if token_details.active == False:
            access_token_status = 'access token disabled via signout' 
        # check access token expiration status
        elif current_datetime > token_details.expiry_date:
            access_token_status = 'access token expired'
        # check if user account's role matches expected user role
        elif user_role not in expected_user_role.split('/'): 
            access_token_status = 'not authorized to access this'
        # if everything checks out, set access token status to 'ok'
        else:
            access_token_status = 'ok'

        # show that access token was last used now
        UserAccessTokens.objects(id = str(token_details.id)).update(last_used_on_date = current_datetime)

        # return access_token_status, user_id, user_role
        return access_token_status, user_id, user_role
        
    except Exception as e:
        # print the type of exception and a custom message
        print(f"An exception of type {type(e).__name__} occurred: {str(e)}")

        # print the traceback details
        traceback.print_exc()

        return 'invalid token', None, None