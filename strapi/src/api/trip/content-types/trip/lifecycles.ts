export default {
    async beforeCreate(event) {
        const { data } = event.params;
        let creatorId = data.creator;

        // Strapi v5 may normalize relations into a { set: [{ id }] } structure
        if (typeof creatorId === 'object' && creatorId?.set?.[0]?.id) {
            console.log('Strapi v5 normalization detected, extracting ID from set:', creatorId.set[0].id);
            creatorId = creatorId.set[0].id;
        }

        if (!creatorId) {
            console.error('Error: Trip creator is missing or invalid format:', data.creator);
            throw new Error('Trip creator is required');
        }

        // Fetch the user profile for the creator
        const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
            filters: { userId: { id: creatorId } }
        });

        if (userProfiles.length === 0) {
            console.error('Error: No profile found for creatorId:', creatorId);
            throw new Error('Please complete your profile (Name, Phone, Gender) before creating a trip.');
        }

        const profile = userProfiles[0];
        if (!profile.fullName || !profile.phoneNumber || !profile.gender) {
            console.error('Error: Profile incomplete for creatorId:', creatorId);
            throw new Error('Your profile is incomplete. Please update your Name, Phone, and Gender to create a trip.');
        }
        console.log('Success: Trip creation verified for creatorId:', creatorId);
    },

    async afterUpdate(event) {
        const { result, params } = event;
        const { status, creator, documentId } = result;

        console.log(`--- trip afterUpdate: status=${status}, documentId=${documentId} ---`);

        // 1. Handle COMPLETED status specifically for stats
        if (status === 'COMPLETED' && params.data.status === 'COMPLETED') {
            const tripWithCreator = await strapi.documents('api::trip.trip').findOne({
                documentId,
                populate: ['creator']
            });
            const dbCreator = tripWithCreator?.creator;
            
            if (dbCreator && dbCreator.id) {
                const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
                    filters: { userId: { id: dbCreator.id } }
                });

                if (userProfiles.length > 0) {
                    const profile = userProfiles[0];
                    const currentCount = profile.completedTripsCount || 0;

                    await strapi.documents('api::user-profile.user-profile').update({
                        documentId: profile.documentId,
                        data: { completedTripsCount: currentCount + 1 }
                    });

                    await strapi.documents('api::user-profile.user-profile').publish({
                        documentId: profile.documentId
                    });
                    console.log(`Incremented completedTripsCount for user ${dbCreator.id}`);
                }
            }
        }

        // 2. Comprehensive Notifications for status changes (STARTED, COMPLETED, CANCELLED)
        const statusChanged = params.data.status !== undefined;
        if (statusChanged) {
            const tripWithRequests = await strapi.documents('api::trip.trip').findOne({
                documentId,
                populate: ['joinRequests.passenger']
            });

            if (tripWithRequests && tripWithRequests.joinRequests) {
                const approvedRequests = tripWithRequests.joinRequests.filter(r => r.status === 'APPROVED');

                for (const request of approvedRequests) {
                    if (request.passenger) {
                        let title = 'Trip Update';
                        let message = `Your trip to ${tripWithRequests.destination} has been updated.`;
                        let type: any = 'TRIP_UPDATE';

                        if (status === 'STARTED') {
                            title = 'Trip Started';
                            message = `Your trip to ${tripWithRequests.destination} has started! Be ready.`;
                            type = 'TRIP_STARTED';
                        } else if (status === 'COMPLETED') {
                            title = 'Trip Completed';
                            message = `Your trip to ${tripWithRequests.destination} is completed. Please rate your captain!`;
                            type = 'TRIP_COMPLETED';
                        } else if (status === 'CANCELLED') {
                            title = 'Trip Cancelled';
                            message = `The trip to ${tripWithRequests.destination} has been cancelled by the captain.`;
                            type = 'TRIP_CANCELLED';
                        }

                        await strapi.documents('api::notification.notification').create({
                            data: {
                                title,
                                message,
                                type,
                                read: false,
                                user: request.passenger.id,
                                data: {
                                    relatedId: documentId,
                                    relatedType: 'trip',
                                    tripId: documentId
                                }
                            }
                        });
                    }
                }
            }
        }

        // 3. Emit socket event for ANY update (status or details)
        // @ts-ignore
        if (strapi.io) {
            // @ts-ignore
            strapi.io.to(`trip_${documentId}`).emit('trip_updated', {
                documentId,
                status,
                creatorId: creator?.id,
                detailsUpdated: !statusChanged
            });
            console.log(`[Socket] Emitted trip_updated to trip_${documentId} (status: ${status})`);
        }
    }
};
