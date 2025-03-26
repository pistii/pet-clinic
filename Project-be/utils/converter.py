
from datetime import datetime
from typing import Any
from bson import ObjectId

@staticmethod
def convert_object_ids(data):
    #Returns objectId as string. Independent of the data structure.
    if isinstance(data, dict):
        return {k: convert_object_ids(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_object_ids(v) for v in data]
    elif isinstance(data, ObjectId):
        return str(data) 
    else:
        return data
    
@staticmethod
def datetime_converter(date):
  if isinstance(date, datetime):
    return date.isoformat()
  elif isinstance(date, list):
    return [datetime_converter(v) for v in date]
  return date

@staticmethod
def convert_document(doc: Any):
    """ Rekurzív átalakító függvény JSON kompatibilis formátumra. """
    if isinstance(doc, datetime):
        return doc.isoformat()  # "2024-03-13T12:34:56"
    elif isinstance(doc, ObjectId):
        return str(doc)  # BSON ObjectId átalakítása stringgé
    elif isinstance(doc, dict):
        return {key: convert_document(value) for key, value in doc.items()}
    elif isinstance(doc, list):
        return [convert_document(item) for item in doc]
    return doc  # Egyéb típusokat változatlanul hagy
