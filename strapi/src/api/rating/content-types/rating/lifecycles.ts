export default {
    async afterCreate(event) {
        const { result } = event;
        const { ratee, stars } = result;

        // Strapi v5: ratee might be an ID or an object
        const userId = typeof ratee === 'object' ? ratee?.id : ratee;

        if (!userId) {
            console.warn('[RatingLifecycle] No ratee found in result, skipping profile update');
            return;
        }

        // Fetch the user profile for the ratee
        const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
            filters: { userId: { id: userId } }
        });

        if (userProfiles.length === 0) {
            console.warn(`[RatingLifecycle] No profile found for user ${userId}`);
            return;
        }

        const profile = userProfiles[0];

        // Calculate new average rating
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

        // CRITICAL for Strapi v5: Publish the document so changes are visible to clients
        await strapi.documents('api::user-profile.user-profile').publish({
            documentId: profile.documentId
        });

        console.log(`[RatingLifecycle] Updated and published rating for user ${userId}: ${newRating} (${newCount} ratings)`);
    }
};
