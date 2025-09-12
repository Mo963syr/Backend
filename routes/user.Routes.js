const express = require('express');
const router = express.Router();

const {addUser,viewsellerprands,putprands ,getAllUsers ,updateUserLocation,getAllUsersforAdmin,deleteUser } = require('../controllers/user.Controller');
const {register,login } = require('../controllers/auth.controller');

router.post('/add',addUser);
router.post('/updateUserLocation/:userId',updateUserLocation);
router.get('/getAllUsers',getAllUsers);
router.post('/register',register);
router.post('/login',login);
router.put('/putprands/:userId',putprands);
router.get('/viewsellerprands/:userId', viewsellerprands);
router.get('/getAllUsersforAdmin', getAllUsersforAdmin);
router.delete('/deleteUser/:id', deleteUser);

module.exports = router;