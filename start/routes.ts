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
  }).prefix('/permission').as('permission.')
}).prefix('/superuser').as('superuser.')