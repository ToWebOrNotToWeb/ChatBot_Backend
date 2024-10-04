# Backend & API REST for the ChatBot

ChatBot spécialiser en e-export / e-commerce. Framework : Node.js; Database : MongoDB; Vector Base : Pinecone; LLM : gpt4o; 

# Installation

Dans un terminal :

=>
`git clone https://github.com/ToWebOrNotToWeb/ChatBot_Backend.git`

=>
`cd ChatBot_Backend`

=>
`npm install`

## Variable d'environement

Crée un fichier .env en suivant le .env.example


# Run

=>
`npm run build`



# Déploiment 

=>
`git add .`

=>
`git commit -m "<name of the commit>"`

=>
`git push`

Le serveur est déploier sur render avec le plan gratuit. 
Ce rendre sur le <a href="https://dashboard.render.com/">Dashboard</a> puis déployer le dernier commit github. 

Url de base => 
`https://chatbot-backend-o6is.onrender.com`



<hr>

# EndPoint

Documentation de l'API. 
Url de base => 
`https://chatbot-backend-o6is.onrender.com`

<hr>

## Route d'Authentification 

Path => `/auth`

### Crée un compte : 

Méthodes: `POST`,

Endpoint: `/register`,

Header attendue: `'Content-Type': 'application/json'`,

Body attendue: `JSON.stringify({
            name: <name variable>,
            email: <email variable>,
            password: <pw variable>
        })`,

Return: `res.status(200).json({ 'token': token });`,

Erreur: 
- 406 => Une des valeurs du body est incorecte
- 409 => L'utilisateur à déja un compte
- 500 => Erreur inatendue 



### Se connecter : 

Méthodes: `POST`,

Endpoint: `/login`,

Header attendue: `'Content-Type': 'application/json'`,

Body attendue: `JSON.stringify({
            email: <email variable>,
            password: <pw variable>
        })`,

Return: `res.status(200).json({ 'token': token });`,

Erreur: 
- 401 => L'email ou le mot de passe est invalide
- 500 => Erreur inatendue 




<hr>

## Gestion User

Path => `/user`

### Afficher le profile :

Méthodes: `GET`,

Endpoint: `/profile`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Return: `res.status(200).json({ name: user.name, email: user.email });`,

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue 


### Afficher la photo de profile :

Méthodes: `GET`,

Endpoint: `/picture`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Return: `res.status(200).json({result: pp.imgBase64, extention: pp.extention});`,

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue 


### Modifier le profile : 

Méthodes: `PUT`,

Endpoint: `/profile`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            name: <name variable>,
            email: <email variable>,
            password: <pw variable>
        })`,
(au minimun une string vide = '')

Return: `res.status(200).json({ status: 'success' });` || Si l'email est modifier `res.status(200).json({ token: newToken });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 406 => Une valeur est incorecte 
- 409 => 
- 500 => Erreur inatendue


### Modifier la photo de profile : 

Méthodes: `POST`,

Endpoint: `/picture`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            imgBase64: <your base 64 image>,
            extention: <the extenssion>
        })`

Return: `res.status(200).json({ status: 'success' });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Suprimer le compte :

Méthodes: `DELETE`,

Endpoint: `/deleteProfile`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Return: `res.status(200).json({ status: 'success' });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Suprimer la photo de profile :

Méthodes: `DELETE`,

Endpoint: `/deletePicture`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Return: `res.status(200).json({ status: 'success' });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue



<hr>

## Gestion Discution 

Path => `/api/discution`

### Crée une discution :

Méthodes: `POST`,

Endpoint: `/new`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatName: <name variable>
        })`

Return: `res.status(200).json({ chatName: chatName, chatId: chat.insertedId });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Récupérer les discutions : 

Méthodes: `GET`,

Endpoint: `/get`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Return: `res.status(200).json({ chats });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Modifier une discution :

Méthodes: `PUT`,

Endpoint: `/update`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatId: <id variable>,
            chatName: <name variable>
        })`

Return: `res.status(200).json({ status: 'success' });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Suprimer une discution : 

Méthodes: `DELETE`,

Endpoint: `/delete`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatId: <id variable>
        })`

Return: `res.status(200).json({ status: 'success' });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue



<hr>

## Gestion Message

Path => `/api/message`

### Récupérer les messages d'un chat:

Méthodes: `POST`,

Endpoint: `/post`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatId: <id variable>
        })`

Return: `res.json({ messages });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Envoyer un message : 

Méthodes: `POST`,

Endpoint: `/pipeline`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatId: <id variable>, 
            message: <message variable>
        })`

Return: During the answer => `res.status(200).write(chunk);`, One the answer is finish => `res.status(200).end(chatId);`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


### Sauvegarder le message recu en stream :

Méthodes: `POST`,

Endpoint: `/fix`,

Header attendue: 
- `'Content-Type': 'application/json'`,
- 'Authorization': `Bearer ${token}`

Body attendue: `JSON.stringify({
            chatId: <id variable>, 
            message: [<innitial user message>, <full response of the bot>]
        })`

Return: `res.status(200).json({ id: chatId });`

Erreur: 
- 401 => Token expirer
- 403 => L'utilisateur n'existe pas / Token invalid
- 500 => Erreur inatendue


<hr>

# Dependence 

<ul>
    <li>"bcrypt": "^5.1.1"</li>
    <li>"cors": "^2.8.5"</li>
    <li>"dotenv": "^16.4.5"</li>
    <li>"express": "^4.19.2"</li>
    <li>"fs": "^0.0.1-security"</li>
    <li>"image-to-base64": "^2.2.0"</li>
    <li>"jsonwebtoken": "^9.0.2"</li>
    <li>"llama": "^2.1.13"</li>
    <li>"llama-node": "^0.1.6"</li>
    <li>"llamaindex": "^0.2.3"</li>
    <li>"mongodb": "6.5"</li>
    <li>"openai": "^4.29.2"</li>
</ul>
