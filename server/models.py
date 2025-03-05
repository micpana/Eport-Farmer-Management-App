from datetime import datetime
from mongoengine import Document, EmbeddedDocument
from mongoengine.fields import (
    DateTimeField, EmbeddedDocumentField,
    ListField, ReferenceField, StringField,
    ObjectIdField, IntField, BooleanField, FloatField
)

class UserAccessTokens(Document):
    meta = {'collection': 'useraccesstokens'}
    user_id = StringField(required=True)
    token = StringField(required=True)
    active = BooleanField(required=True)
    signin_date = StringField(required=True)
    signout_date = StringField(required=False)
    user_browsing_agent = StringField(required=True)
    user_os = StringField(required=True)
    user_device = StringField(required=True)
    user_ip_address = StringField(required=True)
    user_browser = StringField(required=True)
    last_used_on_date = StringField(required=True)
    expiry_date = StringField(required=True)

class Users(Document):
    meta = {'collection': 'users'}
    firstname = StringField(required=True)
    lastname = StringField(required=True)
    email = StringField(required=True)
    password = StringField(required=True)
    role = StringField(required=True)

class Farmers(Document):
    meta = {'collection': 'farmers'}
    name = StringField(required=True)
    national_id = StringField(required=True)
    farm_id = StringField(required=True)
    farm_type = StringField(required=True)
    crop = StringField(required=True)
    location = StringField(required=True)

class Crop(Document):
    meta = {'collection': 'crop'}
    name = StringField(required=True)

class FarmTypes(Document):
    meta = {'collection': 'farmtypes'}
    type = StringField(required=True)

class Location(Document):
    meta = {'collection': 'location'}
    name = StringField(required=True)