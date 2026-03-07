export default {
    async afterCreate(event) {
        const { result, params } = event;
        const { ratee, stars } = result;

        if (!ratee || !ratee.id) return;

        // Fetch the user profile for the ratee
        const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
            filters: { userId: { id: ratee.id } }
        });

        if (userProfiles.length === 0) return;

        const profile = userProfiles[0];

        // Calculate new average rating
        // Current stars sum + new stars / current count + 1
        const currentRating = profile.rating || 0;
        const currentCount = profile.ratingsCount || 0;

        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + stars) / newCount;

        // Update the profile
        await strapi.documents('api::user-profile.user-profile').update({
            documentId: profile.documentId,
            data: {
                rating: newRating,
                ratingsCount: newCount
            }
        });

        console.log(`Updated rating for user ${ratee.id}: ${newRating} (${newCount} ratings)`);
    }
};
