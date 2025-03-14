import os
from dotenv import load_dotenv

from typing import Annotated
from passlib.context import CryptContext # type: ignore
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError 
from jose import JWTError, jwt

from utils.hasher import Hasher
from models import User
from repositories.user_repository import UserRepository
from repositories.token import get_refresh_token

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

#src: https://dev.to/hirushafernando/fastapi-role-base-access-control-with-jwt-4jan
def authenticate_user(email: str, password: str):
    user = UserRepository.get_user_by_email(email)
    if not user:
        return False
    if not Hasher.passwordMatch(password, user.password):
        return False
    return user

def create_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    #Decode validate, then return the token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = UserRepository.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

async def current_user_is_active(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def validate_refresh_token(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        if get_refresh_token(token) is not None:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("email")
            role: str = payload.get("role")
            if email is None or role is None:
                raise credentials_exception
        else:
            raise credentials_exception

    except (JWTError, ValidationError):
        raise credentials_exception

    user = UserRepository.get_user_by_email(email)

    if user is None:
        raise credentials_exception

    return user, token

def create_token_pair(user: User):
    
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_MINUTES) #TODO: the expire time should be minutes, not days. This is only for development
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_MINUTES)

    access_token = create_token(data={"email": user.email, "role": user.role}, expires_delta=access_token_expires)
    refresh_token = create_token(data={"email": user.email, "role": user.role}, expires_delta=refresh_token_expires)

    return access_token, refresh_token