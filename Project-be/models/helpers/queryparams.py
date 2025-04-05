from pydantic import BaseModel, Field


class QueryParams(BaseModel):
    search: str = Field(None)
    limit: int = Field(25, min=0, max=100)
    offset: int = Field(0, min=0)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "search": "", #Ez alapján szűrjön
                "limit": 25, #Ennyit itemet fog visszaadni
                "offset": 0 #Ennyit hagy ki
            }
        }
