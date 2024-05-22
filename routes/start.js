import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { UserController } from '../controllers/userController.js';
import { DiscussionController } from '../controllers/discussionController.js';
import { MessageController } from '../controllers/messageController.js';


const router = express.Router();


/* Base route */
router.get('/', (req, res) => {

    res.set('Content-Type', 'text/html');
    console.log('The serveur is running');
    res.status(200);
    res.send('Welcome !');

});

/* Authentification route */

router.post('/auth/register', AuthController.register);

router.post('/auth/login', AuthController.login);
  

/* User route */

router.get('/user/profile', UserController.showProfile);

router.get('/user/picture', UserController.showPicture);

router.post('/user/profile', UserController.updateProfile);

router.post('/user/picture', UserController.updatePicture);

router.post('/user/deleteProfile', UserController.deleteProfile);

/* Discution route */

router.post('/api/discution/new', DiscussionController.new);

router.get('/api/discution/get', DiscussionController.get);

router.post('/api/discution/delete', DiscussionController.delete);

/* Message route */

router.post('/api/message/get', MessageController.get);

router.post('/api/message/new', MessageController.new);

/* 404 */ 

// router.get('*', (req, res) => {
//     res.status(404).json({ error: 'Page not found' });
// });

export { router };