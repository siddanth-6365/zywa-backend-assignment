import { Router } from "express";
import { getCardStatus } from "../controllers/cardController";
import { query, validationResult } from "express-validator";
import express from "express";

const router = Router();

router.get(
  "/get_card_status",
  [
    query("phoneNumber").optional().isNumeric().withMessage("Must be a number"),
    query("cardId").optional().isString().withMessage("Must be a string"),
  ],
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  getCardStatus
);

export default router;
