# pet-clinic

## Purpose of the project
This system aims to modernize the digital background of a pet clinic. It allows registered and unregistered users to request appointments, it allows assistant and admin users to administrate and organize appointments, assign permissions, monitor appointments and animals. Admins are capable to modify user and pet information, and delete users. 
Users (owners) can view their data, request and review appointments.

## Recommended audience
Veterinary practices that want to digitize data management.
- Small development teams that want to learn or improve a FastAPI-based REST backend. 
- Frontend developers who looking for a simple well-organized API to practice with.
- Anyone who is looking for a demo application which can be easily developed it further, or practice with it.

## Development status
The system is roughly 90 percent done yet, several modules are still missing or under development, or waiting to be tested.

- Permission handling and views are practically working.
- The basis of the appointment booking system is working, but ut is not yet validated.
- Permission based route protection and middleware is working.
- Testing is currently done manually, or with Postman.
- UI for some functions is not fully tested, and can be developed further.

## Stack of the project
I've stick to simplicity and used plain HTML+CSS+Javascript+Bootsrap for the frontend. Most of the HTML code is extracted from functions and mainly 'Injected into code' with 
`document.getElementById().innerHTML` <br/>
**Advantages and disadvantages:**
- there is no third party framework, thus the system is more secure and no code needs to be maintained.
- The code is not flexible, not easily reusable and not well-readable.
- The main components however seperated for their functions. For example: the navigation bar, or for the searcbar for admins. Some elements this way can be solved like an SPA application and can be pretty fancy for their purpose.
**User requested an appointment:**
![User is requested an appointment and waiting for its approval.](https://github.com/pistii/docs/blob/main/assets/images/pet-clinic-project/Screenshot%20from%202025-05-12%2012-23-55.png)
![In this image the assistant can confirm the appointment depending on the pet's conditional severity.](https://github.com/pistii/docs/blob/main/assets/images/pet-clinic-project/Screenshot%20from%202025-05-12%2012-14-36.png)

### Process of making an appointment
If you wish to try the application it is important to sees through the appointment making processes. <br/>
<img float="left" src="/../../../../pistii/docs/blob/main/assets/images/pet-clinic-project/appointment_making_process.drawio.svg" alt="Appointment making process">
<img float="right" width="80%" src="https://github.com/pistii/docs/blob/main/assets/images/pet-clinic-project/Screenshot%20from%202025-05-12%2012-14-58.png" alt="A lots of available appointment">


### Database connection:
For the project you have to set the proper MongoDB database connection string. Which is in default the .env file and the connection string variable is: MONGO_URI. For security reasons I do not appended the connection strings to the github, if you want to try out the project you have to create a MongoDB database and set up the connection.

## Setup
### Backend
In order to try the application you have to run it locally. For this, you have to install Python, and node for frontend.
**Create virtual environment:** 
```
python -m venv .venv
```
**Activate the environment:** <br/>
In command line:
```
cd .venv/Scripts
```
Then just simply enter:
```
activate
```
OR: <br/>
```
source .venv/bin/activate
```

### Install necessary dependencies:
```
pip install -r Project-be/requirements.txt
```

### Run the environment:
```
python -m pip install --upgrade pip
```

If you are in vscode:
Select the .venv python interpreter* (Ctrl+Shit+P)<br/>
**Run project:**<br/>
```
cd Project-be/
python3 uvicorn main:app --reload
```
_Note that you have to use the proper python, maybe in your environment variable it is called python instead of python3._ <br/>

### Frontend
Install node_modules 
```
npm install
```
Run project from frontend root folder:
```
npm run dev
```
