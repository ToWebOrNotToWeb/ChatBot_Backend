# Backend & API REST for the ChatBot

Côter serveur du chat bot. Utilise une Mongodb comme base de donner pour les utilisateurs et leur historiques de conversations. Llamaindex est utiliser pour rechercher des infos dans les inputs des utilisateurs et enclencher l'API de l'international monetary fund (IMF) afin d'avoir des chiffres pertinent. ChromaDB et Llamaindex sont utiliser pour l'embedding des datas et les stockers.

# Installation

Procedure d'installation de tout les éléments necesaire au projet.

## Backend

Cloner le repo git =>
`git clone https://github.com/ToWebOrNotToWeb/ChatBot_Backend.git` 

A la racine du projet =>
`npm install`

## Serveur Chroma

Python 3.11 fortement conseiller, pour voir la version =>
`python -V`

Depuis un terminal administrateur =>
`pip install chromadb`

### Si en python 3.11 et une erreur

Installer MSCV =>
`https://visualstudio.microsoft.com/visual-cpp-build-tools/`

Ouvrir Visual studio Installer, puis assurez vous d'avoir Visual Studio Build Tools 2022 
Version 17.9.6 min

Cliquez sur modifier

Dans charge de travail, selectionner =>
`Développement Desktop en C++`

Dans composent individuel, selectionner =>
`MSCV v143 - VS 2022 C++ x64/x84 build tools (Latest)`
&&
`Windows 11 SDK (10.0.22621.0)`

Cliquez sur modifier pour les installers

Redemarrer votre PC

Ouvrir Visual studio Installer et cliquer sur 'Lancer', cela ouvre un terminal

Dans le terminal =>
`pip install chromadb`

### Si a une erreur de permissions apparer en voulant installer chromadb ou run chroma
Dans le fichier sources de python, dans propriétés, puis sécurité.
S'assurez que les bonnes personnes on l'autorisation de controle total.

# Run

Procedure pour faire tourner le projet.

## variable d'environement
Penser a crée un fichier .env en suivant l'example
Penser a load la clée open ai dans l'environement (peut être pas nessesaire)


A la racine =>
`npm run index`

A chaque fois que le projet redémare toute les data sont loaded, couper, et vectoriser. Cela prend +ou- 5 minutes.

Attendre ce message : 

    Index created, the serveur and chromaDb are running fine and ready to use !


# Déploiment 

Le serveur est déploier sur render avec le plan gratuit

Url de base => 
`https://chatbot-backend-o6is.onrender.com`

# EndPoint

## Authentification 

Base => `/auth`

### Crée un compte : POST => `/register` 

    Require : 'name', 'email', 'password'

### Se connecter : POST => `/login`

    Require 'email', 'password'

## Gestion User

    Require header => `Authorization: Bearer [userToken]`

Base => `/user`

### afficher le profile : GET => `/profile`

### afficher la photo de profile : GET => `/picture`

### modifier le profile : POST => `/profile`

    Require 'name', 'email', 'password'

### modifier la photo de profile : POST => `/picture`

    Require 'picture', 'extention'

    (picture must be encoded in base64)

### suprimer le compte : POST => `/deleteProfile`

    Require 'confirm'

## Gestion Discution 

    Require header => `Authorization: Bearer [userToken]`

Base => `/api/discution`

### Crée une discution : POST => `/new`

    Require 'chatName'

### Récupérer les discutions : GET => `/get`

### Suprimer une discution : POST => `/delete`

    Require 'chatId'

## Gestion Message

    Require header => `Authorization: Bearer [userToken]`

Base => `/api/message`

### Récupérer les messages : POST => `/get`

    Require 'chatId'

### Envoyer un message : POST => `/new`

    Require 'message', 'chatId'

# Dependence 

<ul>
    <li>"bcrypt": "^5.1.1"</li>
    <li>"chromadb": "^1.8.1"</li>
    <li>"cors": "^2.8.5"</li>
    <li>"dotenv": "^16.4.5"</li>
    <li>"express": "^4.19.2"</li>
    <li>llama": "^2.1.13"</li>
    <li>"llama-node": "^0.1.6"</li>
    <li>"llamaindex": "^0.2.3"</li>
    <li>"mongodb": "6.5"</li>
    <li>"openai": "^4.29.2"</li>
</ul>