import socketService from './services/socket';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Initialize Socket.io
    socketService.init(strapi);

    try {
      // Automate permissions for JoinRequest
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (authenticatedRole) {
        const permissions = [
          'api::join-request.join-request.create',
          'api::join-request.join-request.find',
          'api::join-request.join-request.findOne',
          'api::join-request.join-request.update',
          'api::join-request.join-request.delete',
          'api::notification.notification.create',
          'api::notification.notification.find',
          'api::notification.notification.findOne',
          'api::notification.notification.update',
          'api::notification.notification.delete',
          'api::rating.rating.create',
          'api::rating.rating.find',
          'api::rating.rating.findOne',
          'api::rating.rating.update',
          'api::rating.rating.delete',
        ];

        for (const permission of permissions) {
          const [api, ct, action] = permission.split('.');
          const existing = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action: permission,
                role: authenticatedRole.id,
              },
            });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: permission,
                role: authenticatedRole.id,
              },
            });
            console.log(`Added permission: ${permission}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to automate Strapi permissions:', error);
    }
  },
};
