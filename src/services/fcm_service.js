import admin from 'firebase-admin';

export async function sendSilentPush({ fcmToken, data }) {
  if (!fcmToken) return;

  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  try {
    await admin.messaging().send({
      token: fcmToken,
      data:  stringData,
      android: { priority: 'high' },
      apns: {
        headers: { 'apns-priority': '5' },
        payload: { aps: { 'content-available': 1 } },
      },
    });
  } catch (err) {
    console.error('[FCM] sendSilentPush failed:', err?.message);
  }
}

export async function sendSilentPushToMany({ fcmTokens, data }) {
  if (!fcmTokens?.length) return;

  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  const messages = fcmTokens.map((token) => ({
    token,
    data: stringData,
    android: { priority: 'high' },
    apns: {
      headers: { 'apns-priority': '5' },
      payload: { aps: { 'content-available': 1 } },
    },
  }));

  try {
    const batchResponse = await admin.messaging().sendEach(messages);

    // Log any per-token failures without throwing
    batchResponse.responses.forEach((resp, i) => {
      if (!resp.success) {
        console.error(
          `[FCM] Failed for token ${fcmTokens[i]?.slice(0, 12)}...:`,
          resp.error?.message
        );
      }
    });

    return {
      successCount: batchResponse.successCount,
      failureCount: batchResponse.failureCount,
    };
  } catch (err) {
    console.error('[FCM] sendSilentPushToMany failed:', err?.message);
  }
}