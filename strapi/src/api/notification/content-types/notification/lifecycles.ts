export default {
    async afterCreate(event) {
        const { result } = event;
        const { title, message, user, data, type } = result;

        console.log(`--- notification afterCreate: type=${type}, user=${user?.id || user} ---`);

        // In Strapi v5, relations can be just the numeric id or the full object
        const userId = typeof user === 'object' ? user?.id : user;

        if (userId) {
            try {
                // @ts-ignore
                await strapi.service('api::notification.push').sendPushNotification(
                    userId,
                    title,
                    message,
                    { ...data, type }
                );
            } catch (error) {
                console.error('Failed to send push notification in lifecycle:', error);
            }
        } else {
            console.warn('Notification has no user associated, skipping push notification');
        }
    }
};
