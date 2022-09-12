/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/user', 'AuthController.user').as('user')
Route.post('/login', 'AuthController.login').as('login')
Route.post('/register', 'AuthController.register').as('register')
Route.post('/logout', 'AuthController.logout').as('logout')
Route.patch('/update-user-general-information', 'AuthController.updateGeneralInformation').as('update-user-general-information')
Route.delete('/remove-profile-photo', 'AuthController.removeProfilePhoto').as('remove-profile-photo')
Route.patch('/update-user-password', 'AuthController.updatePassword').as('update-user-password')

Route.group(() => {
  Route.group(() => {
    Route.get('/', 'Superuser/PermissionController.index').as('index')
    Route.post('/', 'Superuser/PermissionController.store').as('store')
    Route.patch('/:permission', 'Superuser/PermissionController.update').as('update')
    Route.delete('/:permission', 'Superuser/PermissionController.destroy').as('destroy')
  }).prefix('/permission').as('permission')

  Route.group(() => {
    Route.get('/', 'Superuser/RoleController.index').as('index')
    Route.post('/', 'Superuser/RoleController.store').as('store')
    Route.patch('/:role', 'Superuser/RoleController.update').as('update')
    Route.delete('/:role', 'Superuser/RoleController.destroy').as('destroy')
    Route.post('/paginate', 'Superuser/RoleController.paginate').as('paginate')
  }).prefix('/role').as('role')

  Route.group(() => {
    Route.post('/', 'Superuser/UserController.store').as('store')
    Route.patch('/:user', 'Superuser/UserController.update').as('update')
    Route.delete('/:user', 'Superuser/UserController.destroy').as('destroy')
    Route.post('/paginate', 'Superuser/UserController.index').as('index')
  }).prefix('/user').as('user')

  Route.group(() => {
    Route.get('/', 'Superuser/MenuController.index').as('index')
    Route.post('/', 'Superuser/MenuController.store').as('store')
    Route.patch('/save', 'Superuser/MenuController.save').as('save')
    Route.patch('/:menu', 'Superuser/MenuController.update').as('update')
    Route.delete('/:menu', 'Superuser/MenuController.destroy').as('destroy')
  }).prefix('/menu').as('menu')
}).prefix('/superuser').as('superuser').middleware('auth')

Route.get('/menu', 'Superuser/MenuController.index').as('menu.index').middleware('auth')