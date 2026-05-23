import admin from '../../config/firebase_admin.js';

const MAX_TOKENS_PER_BATCH = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunkArray(array, size) {

  const result = [];

  for (
    let i = 0;
    i < array.length;
    i += size
  ) {

    result.push(
      array.slice(i, i + size)
    );
  }

  return result;
}

// ─── Push Notification ───────────────────────────────────────────────────────

export async function sendPushNotification({
  fcmTokens = [],
  notification = {},
  data = {},
}) {

  try {

    if (!fcmTokens.length) {

      return {
        success: false,
        message: 'No FCM tokens found.',
      };
    }

    const tokenChunks =
      chunkArray(
        fcmTokens,
        MAX_TOKENS_PER_BATCH
      );

    const responses = [];

    for (const chunk of tokenChunks) {

      const message = {

        tokens: chunk,

        notification: {
          title:
            notification.title || '',

          body:
            notification.body || '',
        },

        data: Object.entries(data).reduce(
          (acc, [key, value]) => {

            acc[key] =
              typeof value === 'string'
                ? value
                : JSON.stringify(value);

            return acc;
          },
          {}
        ),

        android: {
          priority: 'high',
        },

        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response =
        await admin
          .messaging()
          .sendEachForMulticast(
            message
          );

      responses.push(response);
    }

    return {
      success: true,
      responses,
    };

  } catch (error) {

    console.error(
      '[FCM ERROR]',
      error
    );

    throw error;
  }
}