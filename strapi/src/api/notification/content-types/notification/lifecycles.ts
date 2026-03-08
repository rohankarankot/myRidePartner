export default {
    async afterCreate(event) {
        const { result, params } = event;
        const { title, message, user, data, type } = result;

        // In Strapi v5, relations might be in params.data but not in result
        const userFromParams = params?.data?.user;
        let userId = typeof user === 'object' ? user?.id : user;

        if (!userId && userFromParams) {
            if (typeof userFromParams === 'object') {
                if (userFromParams.id) userId = userFromParams.id;
                else if (Array.isArray(userFromParams.set) && userFromParams.set.length > 0) {
                    userId = userFromParams.set[0].id;
                } else if (Array.isArray(userFromParams.connect) && userFromParams.connect.length > 0) {
                    userId = userFromParams.connect[0].id;
                }
            } else {
                userId = userFromParams;
            }
        }

        if (userId) {
            try {
                // @ts-ignore
                const strapiInstance = typeof strapi !== 'undefined' ? strapi : (global as any).strapi;

                if (strapiInstance) {
                    await strapiInstance.service('api::notification.push').sendPushNotification(
                        userId,
                        title,
                        message,
                        { ...data, type }
                    );

                    if (strapiInstance.io) {
                        strapiInstance.io.to(`user_${userId}`).emit('new_notification', {
                            title,
                            message,
                            type,
                            data
                        });
                        console.log(`[Socket] Emitted new_notification to user_${userId}`);
                    }
                }
            } catch (error) {
                console.error('Failed to send push notification in lifecycle:', error);
            }
        } else {
            console.warn('Notification has no user associated, skipping push notification');
        }
    }
};
