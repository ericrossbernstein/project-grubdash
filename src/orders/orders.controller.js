const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.filter((order) => order.id === orderId)[0];
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function destroy(req, res, next) {
  if (res.locals.order.status !== "pending") {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
  const index = orders.findIndex((order) => order === res.locals.order);
  const deletedOrder = orders.splice(index, 1);

  res.sendStatus(204);
}

function list(req, res) {
  res.json({ data: orders });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function deliverToIsValid(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (!deliverTo || deliverTo.length === 0) {
    next({
      status: 400,
      message: `Order must include a deliverTo`,
    });
  }
  next();
}

function mobileNumberIsValid(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (!mobileNumber || mobileNumber.length === 0) {
    next({
      status: 400,
      message: `Order must include a mobileNumber`,
    });
  }
  next();
}

function dishesIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!dishes) {
    next({
      status: 400,
      message: `Order must include a dish`,
    });
  }
  if (Array.isArray(dishes) <= 0 || dishes.length === 0) {
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  next();
}

function quantityIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    const quantity = dishes[i].quantity;
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
}

const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];

function statusIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (!status || status.length === 0 || !validStatus.includes(status)) {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
  if (status === "delivered") {
    next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  }
  next();
}

function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (orderId !== id) {
      next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      });
    }
  }
  next();
}

function update(req, res) {
  const { orderId } = req.params;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const updatedOrder = {
    id: orderId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  const originalOrder = res.locals.order;
  orders[originalOrder] = updatedOrder;
  res.status(200).json({ data: updatedOrder });
}

module.exports = {
  create: [
    deliverToIsValid,
    mobileNumberIsValid,
    dishesIsValid,
    quantityIsValid,
    create,
  ],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    idMatches,
    deliverToIsValid,
    mobileNumberIsValid,
    statusIsValid,
    dishesIsValid,
    quantityIsValid,
    update,
  ],
  delete: [orderExists, destroy],
};
