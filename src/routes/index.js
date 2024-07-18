const express = require('express');
const router = express.Router();


//Controllers
const userController = require('../controllers/userController.js');
const companyUserController = require('../controllers/companyUserController.js')

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

router.post('/users/admin', userController.createAdminUser)

router.post('/users/login', userController.login);

//Company Routes

router.post('/company', companyUserController.createCompanyUser)


module.exports = router;
