from pydantic import BaseModel, Field


class QueryParams(BaseModel):
    search: str = Field()
    limit: int = Field(0, min=0)
    offset: int = Field(50, min=0, max=100)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "search": "username",
                "limit": 0,
                "offset": 50
            }
        }
