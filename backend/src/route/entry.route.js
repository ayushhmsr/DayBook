import { Router } from "express";
import * as entryController from "../controllers/entry.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const entryRouter = Router();

// All entry endpoints are protected with JWT authentication
entryRouter.use(authenticate);

entryRouter.get("/", entryController.listEntries);
entryRouter.post("/", entryController.createEntry);
entryRouter.post("/bulk", entryController.bulkCreateEntries);
entryRouter.delete("/:id", entryController.deleteEntry);

export default entryRouter;
