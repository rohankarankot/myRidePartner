export default {
    async afterCreate(event) {
        const { result } = event;
        const { title, message, user, data, type } = result;

        if (user && user.id) {
            try {
                // @ts-ignore
                await strapi.service('api::notification.push').sendPushNotification(
                    user.id,
                    title,
                    message,
                    { ...data, type }
                );
            } catch (error) {
                console.error('Failed to send push notification in lifecycle:', error);
            }
        }
    }
};
