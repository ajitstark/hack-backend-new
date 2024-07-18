const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


//Controllers
const userController = require('../controllers/userController.js');
const companyUserController = require('../controllers/companyUserController.js');
const roleController = require('../controllers/roleController.js');
const rightsController = require('../controllers/rightsController.js');
const rightsStatusController = require('../controllers/rightsStatusController.js');

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

router.post('/users/admin', userController.createAdminUser)

router.post('/users/login', userController.login);

//Company Routes

router.post('/company', companyUserController.createCompanyUser);
//Role Routes
router.post('/role',authMiddleware, roleController.createRoles);
router.get('/role/view',authMiddleware,roleController.ViewRoles);
router.get('/role/FindOne',authMiddleware,roleController.RoleFindOne);
router.patch('/role/update/:role_id',authMiddleware,roleController.UpdateRole);
router.delete('/role/delete/:role_id',authMiddleware,roleController.DeleteRole);

//Rights Status Routes
router.post('/rightsStatus',authMiddleware, rightsStatusController.createRightsStatus);
router.get('/rightsStatus/view',authMiddleware,rightsStatusController.ViewRightsStatus);
router.get('/rightsStatus/FindOne',authMiddleware,rightsStatusController.RightsStatusFindOne);
router.patch('/rightsStatus/update/:rights_status_id',authMiddleware,rightsStatusController.UpdateRightsStatus);
router.delete('/rightsStatus/delete/:rights_status_id',authMiddleware,rightsStatusController.DeleteRightsStatus);

//Rights Routes
router.post('/rights', authMiddleware, rightsController.createRights);
//router.get('/rights/view',authMiddleware, rightsController.ViewRights);
router.get('/rights/FineOne',authMiddleware, rightsController.RightsFindOne); 
router.patch('/rights/update/:rights_id',authMiddleware, rightsController.UpdateRights);
router.delete('/rights/delete/:rights_id',authMiddleware, rightsController.DeleteRights);



module.exports = router;
