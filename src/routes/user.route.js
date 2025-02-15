const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { user_role } = require("../enums/common.enum");

router.use(protect);
router.use(authorize([user_role.ADMIN]));

router.route("/")
  .get(getUsers)
  .post(addUser);

router.route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
