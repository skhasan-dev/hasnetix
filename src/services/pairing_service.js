import crypto from 'crypto';
import { User, Device } from '../models/index.js';
import { Pairing } from '../models/pairing.js';
import { sendSilentPush, sendSilentPushToMany } from './fcm_service.js';
import { AppError } from '../utils/app_error.js';
import { PAIRING_STATUS, DEVICE_TYPE } from '../utils/const/enums.js';

const PENDING_TTL_MS = 10 * 60 * 1000;      // 10 min — unclaimed code window
const ACTIVE_TTL_MS  = 24 * 60 * 60 * 1000; // 24 hr — active pair lifetime
const MAX_RECEIVERS  = 5;                    // max devices per initiator session

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateUniqueCode() {
  let attempts = 0;
  while (attempts < 10) {
    const code = String(100000 + crypto.randomInt(900000));
    const exists = await Pairing.exists({ code });
    if (!exists) return code;
    attempts++;
  }
  throw new AppError(500, 'Could not generate a unique pairing code. Try again.');
}

// ─── Create (Initiator) ───────────────────────────────────────────────────────

/**
 * Initiator calls this to generate a pairing code.
 * Idempotent — returns the existing pending session if one exists for this device.
 */
export async function createPairingService({ userId, deviceId, deviceName, deviceType, fcmToken }) {
  // Return existing session whether PENDING or ACTIVE — so the initiator's code screen stays valid after the first device joins
  const existing = await Pairing.findOne({
    'initiator.deviceId': deviceId,
    status: { $in: [PAIRING_STATUS.PENDING, PAIRING_STATUS.ACTIVE] },
  });
  if (existing) return existing;
 
  const code      = await generateUniqueCode();
  const expiresAt = new Date(Date.now() + PENDING_TTL_MS);
 
  const pairing = await Pairing.create({
    code,
    initiator: { userId: userId ?? null, deviceId, deviceName, deviceType, fcmToken },
    receivers: [],
    expiresAt,
  });
 
  return pairing;
}

// ─── Claim (Receiver) ─────────────────────────────────────────────────────────

/**
 * Receiver claims a pairing code. Multiple devices can claim the same code.
 * The session status moves to ACTIVE on first claim and stays active.
 *
 * FIX: was using Pairing.find() (returns array) — changed to findOne().
 * FIX: AppError argument order corrected throughout.
 */export async function claimPairingService({
  code,
  userId,
  deviceId,
  deviceName,
  deviceType,
  fcmToken,
}) {

  const pairing = await Pairing.findOne({
    code,
    status: {
      $in: [
        PAIRING_STATUS.PENDING,
        PAIRING_STATUS.ACTIVE,
      ],
    },
  });

  if (!pairing) {
    throw new AppError(
      404,
      'Invalid or expired pairing code.',
    );
  }

  // Prevent pairing with self
  if (pairing.initiator.deviceId === deviceId) {
    throw new AppError(
      400,
      'A device cannot pair with itself.',
    );
  }

  // Validate device type
  if (!Object.values(DEVICE_TYPE).includes(deviceType)) {
    throw new AppError(
      400,
      'deviceType must be mobile or desktop.',
    );
  }

  // Prevent duplicate joins
  const alreadyJoined = pairing.receivers.some(
    (receiver) => receiver.deviceId === deviceId,
  );

  if (alreadyJoined) {
    throw new AppError(
      409,
      'This device has already claimed this pairing code.',
    );
  }

  // Limit receiver count
  if (pairing.receivers.length >= MAX_RECEIVERS) {
    throw new AppError(
      400,
      `This session already has the maximum of ${MAX_RECEIVERS} paired devices.`,
    );
  }

  // ─────────────────────────────────────────────
  // Find users
  // ─────────────────────────────────────────────

  const initiatorUser = pairing.initiator.userId
    ? await User.findOne({
        userId: pairing.initiator.userId,
      })
    : null;

  const receiverUser = userId
    ? await User.findOne({
        userId,
      })
    : null;

  // ─────────────────────────────────────────────
  // Find devices
  // ─────────────────────────────────────────────

  const initiatorDevice = await Device.findOne({
    deviceId: pairing.initiator.deviceId,
  });

  const receiverDevice = await Device.findOne({
    deviceId,
  });

  // ─────────────────────────────────────────────
  // Add receiver device to initiator user
  // ─────────────────────────────────────────────

  if (initiatorUser && receiverDevice) {

    const alreadyPaired =
      initiatorUser.pairedDevices.some(
        (id) =>
          id.toString() ===
          receiverDevice._id.toString(),
      );

    if (!alreadyPaired) {

      initiatorUser.pairedDevices.push(
        receiverDevice._id,
      );

      await initiatorUser.save();
    }
  }

  // ─────────────────────────────────────────────
  // Add initiator device to receiver user
  // ─────────────────────────────────────────────

  if (receiverUser && initiatorDevice) {

    const alreadyPaired =
      receiverUser.pairedDevices.some(
        (id) =>
          id.toString() ===
          initiatorDevice._id.toString(),
      );

    if (!alreadyPaired) {

      receiverUser.pairedDevices.push(
        initiatorDevice._id,
      );

      await receiverUser.save();
    }
  }

  // ─────────────────────────────────────────────
  // Add receiver to pairing session
  // ─────────────────────────────────────────────

  pairing.receivers.push({
    userId: userId ?? null,
    deviceId,
    deviceName,
    deviceType,
    fcmToken,
  });

  pairing.status = PAIRING_STATUS.ACTIVE;

  pairing.expiresAt = new Date(
    Date.now() + ACTIVE_TTL_MS,
  );

  await pairing.save();

  // ─────────────────────────────────────────────
  // Notify initiator
  // ─────────────────────────────────────────────

  sendSilentPush({
    fcmToken: pairing.initiator.fcmToken,
    data: {
      type: 'PAIRING_CONFIRMED',
      pairingId: pairing._id.toString(),
      deviceName,
      deviceType,
    },
  }).catch((e) => {
    console.error(
      '[FCM] PAIRING_CONFIRMED error:',
      e,
    );
  });

  return pairing;
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Returns the active pairing session for a device — whether it's the initiator
 * or one of the receivers.
 */
export async function getActivePairingService(deviceId) {
  return Pairing.findOne({
    status: PAIRING_STATUS.ACTIVE,
    $or: [
      { 'initiator.deviceId': deviceId },
      { 'receivers.deviceId': deviceId },
    ],
  });
}

/**
 * Returns all active pairing sessions for a device.
 * A device can be a receiver in multiple sessions (joined multiple initiators).
 */
export async function getAllActivePairingsService(deviceId) {
  return Pairing.find({
    status: PAIRING_STATUS.ACTIVE,
    $or: [
      { 'initiator.deviceId': deviceId },
      { 'receivers.deviceId': deviceId },
    ],
  });
}

// ─── Unpair ───────────────────────────────────────────────────────────────────

/**
 * Unpair a specific receiver from the session.
 * If deviceId is the initiator → dissolve entire session (notify all receivers).
 * If deviceId is a receiver → remove only that receiver from the session.
 */export async function unpairService(
  deviceId,
  targetDeviceId = null
) {

  const pairing =
    await getActivePairingService(deviceId);

  if (!pairing) {
    throw new AppError(
      404,
      'No active pairing found.'
    );
  }

  const isInitiator =
    pairing.initiator.deviceId === deviceId;

  //
  // INITIATOR ACTIONS
  //

  if (isInitiator) {

    //
    // REMOVE SPECIFIC RECEIVER
    //

    if (targetDeviceId) {

      const removed =
        pairing.receivers.find(
          (r) =>
            r.deviceId === targetDeviceId
        );

      if (!removed) {
        throw new AppError(
          404,
          'Target device not found in this pairing session.'
        );
      }

      pairing.receivers =
        pairing.receivers.filter(
          (r) =>
            r.deviceId !== targetDeviceId
        );

      //
      // NOTIFY REMOVED DEVICE
      //

      if (removed.fcmToken) {

        sendSilentPush({
          fcmToken: removed.fcmToken,

          data: {
            type: 'PAIRING_DISSOLVED',
          },
        }).catch((e) =>
          console.error(
            '[FCM] remove receiver:',
            e
          )
        );
      }

      //
      // EXPIRE SESSION IF EMPTY
      //

      if (
        pairing.receivers.length === 0
      ) {

        pairing.status =
          PAIRING_STATUS.EXPIRED;

        pairing.expiresAt =
          new Date();
      }

      await pairing.save();

      return {
        message:
          'Device removed from pairing session.',
      };
    }

    //
    // DISSOLVE ENTIRE SESSION
    //

    pairing.status =
      PAIRING_STATUS.EXPIRED;

    pairing.expiresAt =
      new Date();

    await pairing.save();

    const allTokens =
      pairing.receivers
        .map((r) => r.fcmToken)
        .filter(Boolean);

    if (allTokens.length) {

      sendSilentPushToMany({
        fcmTokens: allTokens,

        data: {
          type: 'PAIRING_DISSOLVED',
        },
      }).catch((e) =>
        console.error(
          '[FCM] dissolve session:',
          e
        )
      );
    }

    return {
      message:
        'Pairing session dissolved.',
    };
  }

  //
  // RECEIVER REMOVES ITSELF
  //

  const receiver =
    pairing.receivers.find(
      (r) => r.deviceId === deviceId
    );

  if (!receiver) {
    throw new AppError(
      404,
      'Receiver device not found.'
    );
  }

  pairing.receivers =
    pairing.receivers.filter(
      (r) => r.deviceId !== deviceId
    );

  //
  // EXPIRE SESSION IF EMPTY
  //

  if (
    pairing.receivers.length === 0
  ) {

    pairing.status =
      PAIRING_STATUS.EXPIRED;

    pairing.expiresAt =
      new Date();
  }

  await pairing.save();

  //
  // NOTIFY INITIATOR
  //

  if (pairing.initiator?.fcmToken) {

    sendSilentPush({
      fcmToken:
        pairing.initiator.fcmToken,

      data: {
        type: 'PAIRING_DISSOLVED',

        deviceId,
      },
    }).catch((e) =>
      console.error(
        '[FCM] receiver left:',
        e
      )
    );
  }

  return {
    message:
      'Unpaired successfully.',
  };
}

// ─── Token resolution (used by upload service) ────────────────────────────────

/**
 * Returns FCM tokens of ALL paired devices for a sender — used to notify
 * all paired devices when a file is ready.
 *
 * If sender is initiator → return all receiver tokens.
 * If sender is a receiver → return initiator token only.
 */
export async function getPairedDeviceTokensService(senderDeviceId) {
  const pairing = await getActivePairingService(senderDeviceId);
  if (!pairing) return [];

  if (pairing.initiator.deviceId === senderDeviceId) {
    // Sender is the initiator — notify all receivers
    return pairing.receivers.map((r) => r.fcmToken).filter(Boolean);
  } else {
    // Sender is a receiver — notify only the initiator
    return pairing.initiator.fcmToken ? [pairing.initiator.fcmToken] : [];
  }
}