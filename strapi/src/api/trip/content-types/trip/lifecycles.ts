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

        // If trip is marked as COMPLETED, increment captain's completedTripsCount
        // Use params.data.status to check if it WAS changed to COMPLETED in this update
        if (status === 'COMPLETED' && params.data.status === 'COMPLETED') {
            if (!creator || !creator.id) return;

            const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
                filters: { userId: { id: creator.id } }
            });

            if (userProfiles.length > 0) {
                const profile = userProfiles[0];
                const currentCount = profile.completedTripsCount || 0;

                await strapi.documents('api::user-profile.user-profile').update({
                    documentId: profile.documentId,
                    data: {
                        completedTripsCount: currentCount + 1
                    }
                });
                console.log(`Incremented completedTripsCount for user ${creator.id} to ${currentCount + 1}`);
            }

            // Also, we could automatically notify passengers here
            const tripWithRequests = await strapi.documents('api::trip.trip').findOne({
                documentId,
                populate: ['joinRequests.passenger']
            });

            if (tripWithRequests && tripWithRequests.joinRequests) {
                const approvedRequests = tripWithRequests.joinRequests.filter(r => r.status === 'APPROVED');

                for (const request of approvedRequests) {
                    if (request.passenger) {
                        await strapi.documents('api::notification.notification').create({
                            data: {
                                title: 'Trip Completed',
                                message: `Your trip from ${tripWithRequests.startingPoint} to ${tripWithRequests.destination} is completed. Please rate your captain!`,
                                type: 'TRIP_COMPLETED',
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
    }
};
