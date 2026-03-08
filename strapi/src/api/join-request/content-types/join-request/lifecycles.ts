/**
 * join-request lifecycle hooks
 */

export default {
    async afterCreate(event: any) {
        const { result, params } = event;
        console.log('--- afterCreate Join Request ---');
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('Params Data:', JSON.stringify(params.data, null, 2));

        // In afterCreate, the 'result' often doesn't contain the relation fields
        // We should look into 'params.data' which contains the input
        let tripIdData = result.trip?.documentId || result.trip || params.data?.trip;

        let queryFilter: any = {};

        // Handle Strapi v5 normalization if present in params.data
        if (typeof tripIdData === 'object' && tripIdData?.set?.[0]) {
            const firstItem = tripIdData.set[0];
            if (firstItem.documentId) {
                queryFilter = { documentId: firstItem.documentId };
                console.log('Extracted documentId from set:', firstItem.documentId);
            } else if (firstItem.id) {
                queryFilter = { id: firstItem.id };
                console.log('Extracted numeric ID from set:', firstItem.id);
            }
        } else if (typeof tripIdData === 'object' && tripIdData?.connect?.[0]) {
            const firstItem = tripIdData.connect[0];
            if (firstItem.documentId) {
                queryFilter = { documentId: firstItem.documentId };
                console.log('Extracted documentId from connect:', firstItem.documentId);
            } else if (firstItem.id) {
                queryFilter = { id: firstItem.id };
                console.log('Extracted numeric ID from connect:', firstItem.id);
            }
        } else if (typeof tripIdData === 'string') {
            queryFilter = { documentId: tripIdData };
            console.log('Using string as documentId:', tripIdData);
        } else if (typeof tripIdData === 'number') {
            queryFilter = { id: tripIdData };
            console.log('Using number as numeric ID:', tripIdData);
        }

        if (Object.keys(queryFilter).length === 0) {
            console.warn('Warning: Could not extract trip identifier from result or params.data');
            return;
        }

        try {
            // Use findMany with filters to handle both numeric id and documentId
            const trips = await strapi.documents('api::trip.trip').findMany({
                filters: queryFilter,
                populate: ['creator']
            });

            const trip = trips.length > 0 ? trips[0] : null;

            console.log('Trip found:', !!trip, trip?.documentId);
            if (trip && trip.creator) {
                console.log('Trip creator found:', trip.creator.id);

                await strapi.documents('api::notification.notification').create({
                    data: {
                        title: 'New Join Request',
                        message: `${result.requestedSeats} seat(s) requested for your trip to ${trip.destination}.`,
                        type: 'JOIN_REQUEST',
                        read: false,
                        user: trip.creator.id,
                        data: {
                            relatedId: result.documentId,
                            relatedType: 'join-request',
                            tripId: trip.documentId
                        }
                    }
                });
                console.log(`Created notification for user ${trip.creator.id} for new join request ${result.documentId}`);

                // Emitting real-time socket event to trip creator
                // @ts-ignore
                if (strapi.io) {
                    // @ts-ignore
                    strapi.io.to(`user_${trip.creator.id}`).emit('join_request_created', {
                        tripId: trip.documentId,
                        requestId: result.documentId
                    });
                }
            } else {
                console.warn('Trip or trip creator not found for filter:', queryFilter);
            }
        } catch (error) {
            console.error('Failed to create notification in afterCreate:', error);
        }
    },

    async afterUpdate(event: any) {
        const { result } = event;

        // If status was updated, notify the passenger
        if (result.status === 'APPROVED' || result.status === 'REJECTED') {
            try {
                const entry = await strapi.documents('api::join-request.join-request').findOne({
                    documentId: result.documentId,
                    populate: ['trip', 'passenger'],
                });

                if (entry && entry.passenger) {
                    await strapi.documents('api::notification.notification').create({
                        data: {
                            title: `Request ${result.status.toLowerCase()}`,
                            message: `Your request for the trip to ${entry.trip.destination} has been ${result.status.toLowerCase()}.`,
                            type: 'JOIN_REQUEST',
                            read: false,
                            user: entry.passenger.id,
                            data: {
                                relatedId: result.documentId,
                                relatedType: 'join-request',
                                tripId: entry.trip.documentId
                            }
                        }
                    });
                    console.log(`Created status notification for passenger ${entry.passenger.id}`);

                    // Emitting real-time socket event to passenger
                    // @ts-ignore
                    if (strapi.io) {
                        // @ts-ignore
                        strapi.io.to(`user_${entry.passenger.id}`).emit('join_request_updated', {
                            requestId: result.documentId,
                            status: result.status,
                            tripId: entry.trip.documentId
                        });
                    }
                }

                // Seat management if approved
                if (result.status === 'APPROVED') {
                    const tripDocumentId = entry?.trip?.documentId;
                    if (tripDocumentId) {
                        await updateSeats(tripDocumentId, result.requestedSeats);
                    }
                }
            } catch (error) {
                console.error('Failed to process join-request update notification:', error);
            }
        }
    },
};

async function updateSeats(tripDocumentId: string, seatsToSubtract: number) {
    try {
        const trip = await strapi.documents('api::trip.trip').findOne({
            documentId: tripDocumentId
        });

        if (trip && trip.availableSeats >= seatsToSubtract) {
            await strapi.documents('api::trip.trip').update({
                documentId: tripDocumentId,
                data: {
                    availableSeats: trip.availableSeats - seatsToSubtract,
                },
            });

            // In Strapi v5, update() only modifies the draft.
            // We must publish() so the live/published version reflects the new seat count.
            await strapi.documents('api::trip.trip').publish({
                documentId: tripDocumentId,
            });

            console.log(`Updated and published trip ${tripDocumentId} seats: -${seatsToSubtract}`);
        }
    } catch (error) {
        console.error('Failed to update seats:', error);
    }
}
