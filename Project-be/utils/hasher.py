from passlib.context import CryptContext # type: ignore

# Jelszó titkosítás
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Hasher():
    def hashPassword(password):
        return pwd_context.hash(password)
    
    def passwordMatch(original_password, to):
        return pwd_context.verify(original_password, to)