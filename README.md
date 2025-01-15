# Multiplayer Chess Game
This repository contains the codebase for  multiplayer chess game.


## Technology Stack

### Frontend Tech Stack
ReactJS, TypeScript, react-router, chess.js, react-toastify, readt-redux, axios, tailwindcss

### Backend Tech Stack
Django, Django Channels, Django Rest Framework, SqLite3, django-allauth



## Installation Instructions

### Prerequisites:
You need the following things installed on your system to play the game.
1) Server :
	• Python 3.10 and above
	• SqLite3 Database (default with Python Django - no need to install it explicitly)
2) Client :
	• NodeJS 
    Download and install LTS 20.11.0 for Windows (x64).

### Steps to run the application
1) Clone the Project
   
2) Start Django Server for Backend
   1) Create Virtual Env
      - Navigate to backend folder using `cd backend`
      - create virtual environment using `python -m venv venv` in backend folder itself
      - activate that virtualenv using `venv/scripts/activate`(Windows) / `source venv/bin/activate`(Ubuntu)
   2) Do some prerequisit stuff
      - install all required dependencies using `pip install -r requirements.txt`
      - create superuser using `python manage.py createsuperuser` if you want to.
      - make migrations using `python manage.py makemigrations`
      - apply migrations using `python manage.py migrate`
    3) Start Server
       - start django dev server using `python manage.py runserver`
         
3) Start Frontend Project
   - Open new terminal and Navigate to frontend folder.
   - install dependencies using `npm i`
   - start dev server using `npm run dev`
   
4) Open your browser and run the localhost http://localhost:5173/ to see the chess681 web app running.


## Playing instructions and game rules
This game can be played by multiple users, 2 users per game room. A user needs to first register or log in using google login. Write Now only "Sign In with Google" is in wokring state.
Some screen shots of game are attched below for reference.


<img src="" width="500px" height="350px"/>

<img src="" width="500px" height="350px"/>
