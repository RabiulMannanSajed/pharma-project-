const userService = require('./user.service');
const asyncHandler = require('../../Utils/asyncHandler');
const ApiResponse = require('../../Utils/ApiResponse');

const createSalesman = asyncHandler(async (req, res) => {
  const user = await userService.createUser({ ...req.body, role: req.body.role || 'salesman' });
  res.status(201).json(new ApiResponse(201, user, 'Salesman created successfully'));
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users fetched'));
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive(req.params.id, true);
  res.status(200).json(new ApiResponse(200, user, 'User activated'));
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive(req.params.id, false);
  res.status(200).json(new ApiResponse(200, user, 'User deactivated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User deleted'));
});

module.exports = {
  createSalesman,
  listUsers,
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
};