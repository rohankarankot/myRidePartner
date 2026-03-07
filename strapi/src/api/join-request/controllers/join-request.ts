/**
 * join-request controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::join-request.join-request', ({ strapi }) => ({
    async create(ctx) {
        console.log('JoinRequest create request received:', ctx.request.body);
        const response = await super.create(ctx);
        console.log('JoinRequest create response:', response);
        return response;
    },
}));
