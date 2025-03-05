# import for regular expressions
import re

# password structure validation ... 8 characters at minimum, with at least 1: uppercase letter, lowercase letter, number, special character
def is_password_structure_valid(password):
	if len(password) < 8: # password length
		return False
	if not re.search(r"[!@#$%^&*(),.?\":{}|<>/'`~]", password): # special characters
		return False
	if not re.search(r'[A-Z]', password): # uppercase letters
		return False
	if not re.search(r'[a-z]', password): # lowercase letters
		return False
	if not re.search(r'\d', password): # numbers
		return False
	# if all conditions are met, password is valid
	return True