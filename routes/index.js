// Import our Controllers
const controller = require('../controllers/api-controller')


const routes = [
  {
    method: "GET",
    url: "/api/v1/sessions",
    handler: controller.getCars,
  },
  {
    method: "GET",
    url: "/api/v1/sessions/:sessionId",
    handler: controller.getSingleCar,
  },
  {
    method: "DELETE",
    url: "/api/v1/sessions/:sessionId",
    handler: controller.deleteCar,
  },
  {
    method: "GET",
    url: "/api/v1/vast",
    handler: controller.getSingleCar,
  },
  {
    method: "GET",
    url: "/api/v1/users/:userId",
    handler: controller.getSingleCar,
  },
];
