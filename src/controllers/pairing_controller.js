import {
  createPairingService,
  claimPairingService,
  getActivePairingService,
  getAllActivePairingsService,
  unpairService,
} from '../services/pairing_service.js';
import { AppError } from '../utils/app_error.js';
import { DEVICE_TYPE, PAIRING_STATUS } from '../utils/const/enums.js';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPairing(req, res, next) {
  try {
    const { userId, deviceId, deviceName, deviceType, fcmToken } = req.body;

    if (!deviceId || !deviceName || !deviceType || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'deviceId, deviceName, deviceType and fcmToken are required.',
      });
    }
    if (!Object.values(DEVICE_TYPE).includes(deviceType)) {
      return res.status(400).json({
        success: false,
        error: "deviceType must be 'mobile' or 'desktop'.",
      });
    }

    const pairing = await createPairingService({
      userId: userId ?? null,
      deviceId,
      deviceName,
      deviceType,
      fcmToken,
    });

    res.status(201).json({
      success: true,
      data: {
        pairingId: pairing._id,
        code:      pairing.code,
        expiresAt: pairing.expiresAt,
        status:    pairing.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Claim ────────────────────────────────────────────────────────────────────

export async function claimPairing(req, res, next) {
  try {
    const { code, deviceId, deviceName, deviceType, fcmToken, userId } = req.body;

    if (!code || !deviceId || !deviceName || !deviceType || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'code, deviceId, deviceName, deviceType and fcmToken are required.',
      });
    }

    const pairing = await claimPairingService({
      code,
      userId: userId ?? null,
      deviceId,
      deviceName,
      deviceType,
      fcmToken,
    });

    res.status(200).json({
      success: true,
      data: {
        pairingId:  pairing._id,
        status:     pairing.status,
        pairedWith: {
          deviceName: pairing.initiator.deviceName,
          deviceType: pairing.initiator.deviceType,
        },
        receivers: pairing.receivers.map((r) => ({
          deviceName: r.deviceName,
          deviceType: r.deviceType,
          deviceId:   r.deviceId,
        })),
        expiresAt: pairing.expiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

export async function getPairingStatus(req, res, next) {
  try {
    const { deviceId } = req.query;
    if (!deviceId) throw new AppError(400, 'deviceId is required.');

    const pairings = await getAllActivePairingsService(deviceId);

    if (!pairings.length) {
      return res.status(200).json({
        success: true,
        data: { status: PAIRING_STATUS.PENDING, pairings: [] },
      });
    }

    // Shape each pairing from this device's perspective
    const shaped = pairings.map((pairing) => {
      const isInitiator = pairing.initiator.deviceId === deviceId;

      if (isInitiator) {
        // Initiator sees all their receivers
        return {
          pairingId:   pairing._id,
          role:        'initiator',
          status:      pairing.status,
          receivers:   pairing.receivers.map((r) => ({
            deviceId:   r.deviceId,
            deviceName: r.deviceName,
            deviceType: r.deviceType,
          })),
          expiresAt:   pairing.expiresAt,
        };
      } else {
        // Receiver sees only the initiator
        return {
          pairingId:  pairing._id,
          role:       'receiver',
          status:     pairing.status,
          pairedWith: {
            deviceId:   pairing.initiator.deviceId,
            deviceName: pairing.initiator.deviceName,
            deviceType: pairing.initiator.deviceType,
          },
          expiresAt: pairing.expiresAt,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        status:   PAIRING_STATUS.ACTIVE,
        pairings: shaped,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Unpair ───────────────────────────────────────────────────────────────────
export async function unpair(req, res, next) {
  try {
    const { deviceId, targetDeviceId } = req.body;
    if (!deviceId) throw new AppError(400, 'deviceId is required.');

    const result = await unpairService(deviceId, targetDeviceId ?? null);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}