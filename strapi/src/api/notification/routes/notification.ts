import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::notification.notification');

export default {
    get routes() {
        // @ts-ignore
        const coreRoutes = typeof defaultRouter.routes === 'function' ? defaultRouter.routes() : defaultRouter.routes;
        return [
            ...coreRoutes,
            {
                method: 'GET',
                path: '/notifications/test/:userId',
                handler: 'api::notification.notification.triggerTest',
                config: {
                    auth: false,
                },
            },
        ];
    }
};
