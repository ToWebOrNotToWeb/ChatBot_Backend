import express from 'express';
import AuthController from '../controllers/authController.js';
import UserController from '../controllers/userControllers.js';
import DiscussionController from '../controllers/discutionController.js';
import MessageController from '../controllers/messageController.js';


const router = express.Router();

/* Base route */
router.get('/', (req, res) => {

    res.set('Content-Type', 'text/html');
    // console.log('The serveur is running');
    res.status(200);
    res.send('Welcome !');

});

/* Authentification route */

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
  
/* User route */
 
router.get('/user/profile', UserController.showProfile);
router.get('/user/picture', UserController.showPicture);
router.put('/user/profile', UserController.updateProfile);
router.post('/user/picture', UserController.updatePicture);
router.delete('/user/deleteProfile', UserController.deleteProfile);
router.delete('/user/deletePicture', UserController.deletePicture);

/* Discution route */

router.post('/api/discution/new', DiscussionController.new);
router.get('/api/discution/get', DiscussionController.get);
router.put('/api/discution/update', DiscussionController.update);
router.delete('/api/discution/delete', DiscussionController.delete);

/* Message route */

router.post('/api/message/get', MessageController.get);
router.post('/api/message/new', MessageController.new);
router.post('/api/message/pipeline', MessageController.pipeline);
router.post('/api/message/fix', MessageController.saveMessage);

/* 404 */ 

router.use('*', (req, res) => {
    console.log('404');
    res.status(404).json({ error: 'Page not found' });
});

export default router;