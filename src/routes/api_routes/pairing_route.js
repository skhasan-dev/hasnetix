import { Router } from 'express';
import {
  createPairing,
  claimPairing,
  getPairingStatus,
  unpair,
} from '../../controllers/pairing_controller.js';
import { optionalAuth } from '../../middlewares/optional_auth_middleware.js';

const pairingRouter = Router();

// Initiator: generate code + QR data
pairingRouter.post('/create', optionalAuth, createPairing);

// Receiver: enter code or scan QR to pair
pairingRouter.post('/claim', optionalAuth, claimPairing);

// Poll current pairing state (used by both devices)
pairingRouter.get('/status', getPairingStatus);

// Either device can dissolve the pair
pairingRouter.delete('/unpair', optionalAuth, unpair);

export default pairingRouter;
