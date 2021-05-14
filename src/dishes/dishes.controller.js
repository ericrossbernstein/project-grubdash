const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.filter((dish) => dish.id === dishId)[0];
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function nameIsValid(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (!name || name.length === 0) {
    next({
      status: 400,
      message: `Dish must include a name`,
    });
  }
  next();
}

function descriptionIsValid(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (!description || description.length === 0) {
    next({
      status: 400,
      message: `Dish must include a description`,
    });
  }
  next();
}

function priceIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    next({
      status: 400,
      message: `Dish must include a price`,
    });
  }
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  next();
}

function imageIsValid(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (!image_url || image_url.length === 0) {
    next({
      status: 400,
      message: `Dish must include a image_url`,
    });
  }
  next();
}
function idMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (dishId !== id) {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  }
  next();
}

function update(req, res) {
  const { dishId } = req.params;
  const { data: { name, description, price, image_url } = {} } = req.body;
  const updatedDish = {
    id: dishId,
    name,
    description,
    price,
    image_url,
  };
  const originalDish = res.locals.dish;
  dishes[originalDish] = updatedDish;
  res.json({ data: updatedDish });
}

module.exports = {
  create: [nameIsValid, descriptionIsValid, priceIsValid, imageIsValid, create],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    idMatches,
    nameIsValid,
    descriptionIsValid,
    priceIsValid,
    imageIsValid,
    update,
  ],
};
