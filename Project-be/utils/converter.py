
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