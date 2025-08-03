
import express from "express";
import { authenticate } from "../middelware/auth.js";
import { createTicket, getTicket, getTickets, checkAIConfig, testAI, updateTicketStatus } from "../controllers/ticket.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);
router.put("/:ticketId/status", authenticate, updateTicketStatus);
router.get("/ai/config", authenticate, checkAIConfig);
router.get("/ai/test", authenticate, testAI);

export default router;
