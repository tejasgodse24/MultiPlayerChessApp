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

## Game Flow 

1) Login Page at Start
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/login.png" width="550px" height="300px"/>

2) Home page to go to chess Board
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/after_login.png" width="550px" height="300px"/>

3) When Both players click on "Start Game" button then game starts
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/game_start.png" width="550px" height="300px"/>

4) player makes random moves
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/move.png" width="550px" height="300px"/>

5) If player make invalid move
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/invalid_move.png" width="550px" height="300px"/>

6) After Game Over
<img src="https://raw.githubusercontent.com/tejasgodse24/MultiPlayerChessApp/refs/heads/main/frontend/src/assets/game_screenshots/game_over.png" width="500px" height="350px"/>

