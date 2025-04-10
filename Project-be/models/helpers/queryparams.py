from pydantic import BaseModel, Field, field_validator


class QueryParams(BaseModel):
    search: str = Field(None)
    limit: int = Field(25, min=0, max=100)
    offset: int = Field(0, min=0)

    
    @field_validator("limit", mode="before")
    @classmethod
    def validate_limit(cls, v):
        if v is None or v < 1:
            return 20
        return v

    @field_validator("offset", mode="before")
    @classmethod
    def validate_offset(cls, v):
        if v is None or v < 0:
            return 0
        return v
    
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "search": "", #Ez alapján szűrjön
                "limit": 25, #Ennyit itemet fog visszaadni
                "offset": 0 #Ennyit hagy ki
            }
        }
