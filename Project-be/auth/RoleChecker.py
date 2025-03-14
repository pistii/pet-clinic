from typing import Annotated
from fastapi import Depends, HTTPException
from models.User import User
from auth.auth import get_current_user

class RoleChecker:
    def __init__(self, required_role: str):
        self.required_role = required_role

    def __call__(self, current_user: Annotated[User, Depends(get_current_user)]):
        if current_user.role not in self.required_role:
            raise HTTPException(status_code=401, detail="Permission denied")
        return current_user
