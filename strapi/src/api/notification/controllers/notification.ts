import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notification.notification', ({ strapi }) => ({
    async triggerTest(ctx) {
        const { userId } = ctx.params;

        const notification = await strapi.documents('api::notification.notification').create({
            data: {
                title: "Test Notification 🚀",
                message: "Hello! This is a manual test from the AI assistant.",
                type: "SYSTEM",
                user: parseInt(userId, 10),
                data: { test: true }
            }
        });

        return { success: true, notification };
    }
}));
