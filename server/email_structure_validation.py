# import for regular expressions
import re

# email structure validation
def is_email_structure_valid(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if re.match(pattern, email):
        return True
    else:
        return False