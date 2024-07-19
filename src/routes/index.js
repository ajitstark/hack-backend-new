const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


//Controllers
const userController = require('../controllers/userController.js');
const companyUserController = require('../controllers/companyUserController.js');
const roleController = require('../controllers/roleController.js');
const rightsController = require('../controllers/rightsController.js');
const rightsStatusController = require('../controllers/rightsStatusController.js');
const projectController = require('../controllers/projectController.js');
const epicController = require('../controllers/epicController.js');
const taskController = require('../controllers/taskController.js')
const userPermissionController = require('../controllers/permissionsController.js');
const userReports = require('../controllers/reportController.js');


router.get('/users', authMiddleware, userController.getUsers);
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
router.post('/rights', authMiddleware, rightsController.createUserRights);
//router.get('/rights/view',authMiddleware, rightsController.ViewRights);
router.get('/rights/FineOne',authMiddleware, rightsController.userRightsFindOne); 
router.patch('/rights/update/:rights_id',authMiddleware, rightsController.UpdateUserRights);
router.delete('/rights/delete/:rights_id',authMiddleware, rightsController.DeleteUserRights);

//Project Routes
router.post('/project',authMiddleware, projectController.createProject);
router.get('/project/view',authMiddleware,projectController.ViewProjects);
router.get('/project/FindOne',authMiddleware,projectController.projectFindOne);
router.patch('/project/update/:project_id',authMiddleware,projectController.UpdateProject);
router.delete('/project/delete/:project_id',authMiddleware,projectController.DeleteProject);

//Epic Routes
router.post('/epic', authMiddleware, epicController.createEpic);
router.get('/epic/view', authMiddleware, epicController.ViewEpics);
router.get('/epic/findone', authMiddleware, epicController.epicFindOne);
router.patch('/epic/update/:epic_id', authMiddleware, epicController.UpdateEpic);
router.delete('/epic/delete/:epic_id', authMiddleware, epicController.DeleteEpic);

//Task Routes
router.post('/task', authMiddleware, taskController.createTask);
router.get('/task/view', authMiddleware, taskController.ViewTasks);
router.get('/task/findone', authMiddleware, taskController.taskFindOne);
router.patch('/task/update/:task_id', authMiddleware, taskController.UpdateTask);
router.delete('/task/delete/:task_id', authMiddleware, taskController.DeleteTask);
router.post('/task/update_rights_status', authMiddleware, taskController.updateRightsStatus);
router.post('/task_time_tracker', authMiddleware, taskController.createTaskTimeTracker);
router.get('/task_time_tracker/view', authMiddleware, taskController.ViewTaskTimeTrackers);

//user_permission Routes
router.post('/user_permission', authMiddleware, userPermissionController.createUserPermission);
router.get('/user_permission/view', authMiddleware, userPermissionController.viewUserPermissions);
router.get('/user_permission/findone', authMiddleware, userPermissionController.findOneUserPermission);
router.patch('/user_permission/update/:user_permission_id', authMiddleware, userPermissionController.updateUserPermission);
router.delete('/user_permission/delete/:user_permission_id', authMiddleware, userPermissionController.deleteUserPermission);


//Reports Routes 
router.get('/report/taskList', authMiddleware, userReports.TaskList);
router.get('/report/statusList', authMiddleware, userReports.listRightsStatus);
router.get('/report/total_time_spent_on_tasks', authMiddleware, userReports.getTotalTimeSpentOnTasks);
router.get('/report/time_spent_by_each_user', authMiddleware, userReports.getTimeSpentByEachUser);
router.get('/report/tasks_with_most_time_spent', authMiddleware, userReports.getTasksWithMostTimeSpent);
router.get('/report/task_status_changes_over_time', authMiddleware, userReports.getTaskStatusChangesOverTime);
router.get('/report/time_spent_on_tasks_by_project', authMiddleware, userReports.getTimeSpentOnTasksByProject);
router.get('/report/overall_project', authMiddleware, userReports.getOverallProjectReport);


module.exports = router;
