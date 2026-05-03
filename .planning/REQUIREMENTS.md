# myRidePartner Requirements

## v1 Requirements

### Authentication & Identity
- [ ] **AUTH-01**: User can log in via Google OAuth across mobile and web clients.
- [ ] **AUTH-02**: System manages user sessions mapped to specific app sources (`myridepartner`, `interport`).
- [ ] **AUTH-03**: User can view and edit their profile.

### Trip Management
- [ ] **TRIP-01**: User can create a new trip with start, destination, and details.
- [ ] **TRIP-02**: User can discover and browse available trips.
- [ ] **TRIP-03**: User can request to join an existing trip.
- [ ] **TRIP-04**: Trip creator can approve or deny join requests.

### Community Groups
- [ ] **COMM-01**: User can create community groups based on shared interests/locations.
- [ ] **COMM-02**: User can join and view community groups.

### Real-time Chat
- [ ] **MSG-01**: Users can chat in real-time within a trip context.
- [ ] **MSG-02**: Users can chat in real-time within a community group.
- [ ] **MSG-03**: Users can upload and share media in chats via Cloudinary.

### Push Notifications
- [ ] **NOTF-01**: Users receive push notifications for new messages, trip requests, and approvals.
- [ ] **NOTF-02**: System routes notifications using Expo Server SDK or FCM directly.

### Backoffice Admin
- [ ] **ADMN-01**: Admin can view system overview metrics.
- [ ] **ADMN-02**: Admin can manage users and view individual user logs.
- [ ] **ADMN-03**: Admin can oversee trips and community groups.
- [ ] **ADMN-04**: Admin can handle moderation reports and ratings.

### Monetization
- [ ] **AD-01**: Mobile application displays AdMob units based on configuration.

## Future / v2 Requirements

- Additional advanced analytics for the backoffice.
- More granular notification settings for users.
- Automated matchmaking algorithms for trips.

## Out of Scope

- Native billing/payment processing (trips are community coordinated, no platform fee).
- Third-party social logins other than Google (for now).

## Traceability

*(To be filled by roadmap generator)*
