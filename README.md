# pet-clinic

Create virtual environment:
python -m venv .venv
activate the environment:
In DOS:
cd .venv\Scripts -> activate

run the environment:
python -m pip install --upgrade pip

If you are in vscode:
Select the .venv python interpreter* (Ctrl+Shit+P)
run project:
*Note that you have to use the proper python, maybe in your environment variable it is called python instead of python3.
cd Project-be/
python3 uvicorn main:app --reload

Database connection:
For the project have to set the proper MongoDB database connection string. Which is for me in the .env file and the connection string variable is: MONGO_URI

