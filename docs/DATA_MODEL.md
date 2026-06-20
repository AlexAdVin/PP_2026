# StickerSmash Data Model & Backend Architecture

## Data Model Overview

The application uses a comprehensive GraphQL data model with the following entities:

### Core Entities

#### 1. **Host** (Parking Location Provider)
- `id`: Unique identifier
- `hostSub`: AWS Cognito Subject (user identifier)
- `hostName`: Display name of host
- **Relations**: Has many Locations

#### 2. **Location** (Parking Facility)
- `id`: Unique identifier
- `locName`: Friendly name (e.g., "Aarhus Central")
- `type`: Type of facility (Secured garage, Car port, Open space)
- `addrLoc`: Full address
- `lat`, `lng`: GPS coordinates
- `hrPrice`: Hourly rate in DKK
- `nrOfLots`: Number of parking spots
- `dyPrice`: Boolean for dynamic pricing
- `description`: Facility description
- `rating`: Average rating (0-5)
- `img`: Featured image URL
- **Relations**: Belongs to Host (many-to-one), Has many Lots

#### 3. **Lot** (Individual Parking Spot)
- `id`: Unique identifier
- `lotNr`: Spot number
- `avlBool`: Availability flag
- `chargerBool`: Whether spot has charger
- `startAvl`, `endAvl`: Availability date range
- `img`: Photo of the lot
- `rules`: Specific rules for this lot
- **Relations**: Belongs to Location, Has Transactions, Has optional Charger, Has AvlDaysNTimes

#### 4. **Transactions** (Booking/Reservation)
- `id`: Transaction ID
- `lotID`, `driverID`: Foreign keys
- `driverName`: Name of person booking
- `startBooking`, `endBooking`: Booking time range (AWSDateTime)
- `agreedPriceHR`: Final negotiated price per hour
- `surge`: Surge pricing multiplier (if any)
- **Relations**: Belongs to Lot (many-to-one), Belongs to Driver

#### 5. **AvlDaysNTime** (Availability Schedule)
- `id`: Unique identifier
- `day`: Day of week (Monday-Sunday)
- `sT`, `eT`: Start and end time
- `bool`: Whether available on that day/time
- **Relations**: Belongs to Lot (many-to-one)

#### 6. **Charger** (EV Charging Station)
- `id`: Charger identifier
- `chargerNr`: Sequential number
- `plugType`: Connector type (Type 1, Type 2, CCS, etc.)
- `power`: Power output in kW
- `usageFee`: Fixed usage fee
- `pricekWh`: Price per kilowatt-hour
- **Relations**: Belongs to Lot (one-to-one)

#### 7. **Driver** (User/Buyer)
- `id`: User identifier
- `sub`: AWS Cognito Subject
- `driverName`: Display name
- **Relations**: Has many Cars, Has many Transactions

#### 8. **Car** (Vehicle)
- `id`: Unique identifier
- `brand`: Manufacturer
- `model`: Model name
- `variant`: Specific variant
- `capacity`: Battery capacity (kWh) for EVs
- `regNr`: Registration number/plate
- `connType`: Connector type supported
- **Relations**: Belongs to Driver

## Host Data Sourcing Split

The host flow now separates database-backed locations from locally persisted listing drafts:

- `model/mockLocations.json` represents the simulated database payload for host locations.
- `src/adapters/hostDatabaseAdapter.ts` is the adapter boundary that reads that JSON and returns a cloned payload shaped like a backend fetch.
- `src/hostStore.js` stores only the resumable `Save & Exit` draft in AsyncStorage.
- `app/(drawer)/host/(tabs)/index.tsx` hydrates locations from the adapter and then layers any saved draft into the UI without merging the draft into the simulated database dataset.

This mirrors production behavior where listed locations come from a server-side source while incomplete listing progress remains local until the host explicitly finishes publishing.

## Intro Flow Routing

The app now treats onboarding splashes as standalone routes instead of embedding them inside the destination screens.

- `app/(drawer)/welcome.tsx` is the first-launch app intro shown before Landing.
- `app/(drawer)/host/start-listing-intro.tsx` introduces the host metadata wizard before `app/(drawer)/host/start-listing.tsx`.
- `app/(drawer)/host/create-listing-intro.tsx` introduces lot-level settings before `app/(drawer)/host/create-listing.tsx`.
- `components/hostHub/shared/FlowSplashScreen.tsx` is the shared standalone splash surface used by all of those routes.
- `src/adapters/appIntroAdapter.ts` persists the first-launch completion flag in AsyncStorage so the app intro is only shown before Landing until the user finishes or skips it once.

## Listing Creation Flow

Host listing creation is now a two-stage process:

- `app/(drawer)/host/start-listing.tsx` collects listing metadata such as location type, address, lot count, hourly price, and listing name.
- `app/(drawer)/host/create-listing.tsx` edits the per-lot draft created from that metadata. This migrated stage replaces the old Recoil-based `CreateListingNew` flow with Zustand-backed `listingLotDraft` state.
- Each lot draft contains availability dates, weekly availability times, charger configuration, rules, and transaction placeholders.
- Listing creation is preceded by two standalone intro routes so the actual editing screens stay focused on form and settings responsibilities only.
- Final save calls `src/adapters/hostListingPersistenceAdapter.ts`, which upserts the host profile and creates the full location graph in Supabase through `public.create_host_listing(jsonb)`. The store then hydrates the canonical persisted location back into local host state.

This keeps Expo 54-compatible UI flow and state management in place while leaving the actual backend write contract behind a single adapter boundary.

## Data Structure for Mock Data

### Mock Locations JSON Structure

```json
{
  "hostSub": "string",
  "hostName": "string",
  "locations": [
    {
      "id": "string",
      "locName": "string",
      "type": "string",
      "lat": "number",
      "lng": "number",
      "hrPrice": "number",
      "nrOfLots": "number",
      "description": "string",
      "rating": "number",
      "img": "string (URL)",
      "Lots": {
        "items": [
          {
            "id": "string",
            "lotNr": "number",
            "avlBool": "boolean",
            "chargerBool": "boolean",
            "Transactions": {
              "items": [
                {
                  "id": "string",
                  "lotID": "string",
                  "driverID": "string",
                  "driverName": "string",
                  "startBooking": "ISO8601DateTime",
                  "endBooking": "ISO8601DateTime",
                  "agreedPriceHR": "number"
                }
              ]
            },
            "AvlDaysNTimes": {
              "items": [
                {
                  "id": "string",
                  "day": "string",
                  "sT": "ISO8601DateTime",
                  "eT": "ISO8601DateTime",
                  "bool": "boolean"
                }
              ]
            },
            "Charger": {
              "id": "string",
              "chargerNr": "number",
              "plugType": "string",
              "power": "number",
              "usageFee": "number",
              "pricekWh": "number"
            }
          }
        ]
      }
    }
  ]
}
```

## Backend Options & Recommendations

### 1. **AWS Amplify (Current Choice)**

**Pros:**
- ✅ Integrated infrastructure (compute, database, auth, API)
- ✅ GraphQL DataStore with automatic sync
- ✅ Built-in authentication with Cognito
- ✅ Real-time subscriptions support
- ✅ Auto-generated backend from schema
- ✅ Expo-compatible
- ✅ Serverless (no infrastructure management)

**Cons:**
- ❌ Vendor lock-in to AWS ecosystem
- ❌ Cost scaling unclear (usage-based)
- ❌ Limited customization of business logic
- ❌ GraphQL API constraints
- ❌ Cold starts on Lambda (minimal impact with Amplify)

**Best For:** Rapid MVP development, auto-syncing needs, real-time features

### 2. **Firebase/Firestore**

**Pros:**
- ✅ Simple real-time database
- ✅ Built-in authentication
- ✅ Great documentation
- ✅ Predictable pricing
- ✅ Easy to use with React Native

**Cons:**
- ❌ No GraphQL out-of-box (requires Cloud Functions)
- ❌ Reduced control over data relationships
- ❌ Can get expensive at scale
- ❌ Limited offline sync

**Best For:** Real-time collaboration, simple data structures

### 3. **Supabase (PostgreSQL + RLS)**

**Pros:**
- ✅ Open-source (self-hostable)
- ✅ PostgreSQL power and reliability
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Row-level security (RLS)
- ✅ REST + GraphQL APIs
- ✅ Cost-effective at scale
- ✅ No vendor lock-in

**Cons:**
- ❌ More complex setup than AWS Amplify
- ❌ Self-hosting requires DevOps knowledge
- ❌ Smaller community than AWS

**Best For:** Complex queries, cost-sensitive, long-term sustainability

**Recommendation**: **Supabase** for this project because:
- Complex relational data (Locations → Lots → Transactions)
- Cost predictability important for scaling
- No vendor lock-in critical for business viability
- PostgreSQL expertise widely available

### 4. **Custom REST API (Node.js + Express + PostgreSQL)**

**Pros:**
- ✅ Maximum flexibility
- ✅ Complete control
- ✅ Cost predictable
- ✅ No vendor lock-in

**Cons:**
- ❌ Requires backend development
- ❌ More maintenance overhead
- ❌ Slower initial development

**Best For:** Long-term production apps with specific requirements

## Expo Compatibility

**AWS Amplify & Expo:**
- ✅ Excellent compatibility
- ✅ `amplify-ios` and `amplify-android` libraries work with Expo
- ✅ Real-time subscriptions supported
- ✅ Authentication flows support OAuth redirects
- ✅ Large ecosystem of community plugins

**Migration Path:**
1. Development: Use mock JSON data (current approach) ✅
2. MVP: Integrate AWS Amplify with auto-generated backend
3. Scale: Consider migration to Supabase for cost/flexibility

## Current Implementation

- **Status**: Using mock data from `model/mockLocations.json`
- **Next Step**: Implement AWS Amplify GraphQL backend
- **Alternative**: Implement REST API with Supabase

## Component Usage of Data Model

### EMap.js
- Displays all Locations on map
- Shows price (``hrPrice``) on markers
- Uses mock data from `mockLocations.json`

### LotsCarousel.js
- Shows individual Lots for selected Location
- Displays availability based on active Transactions
- Shows Charger info if available

### PlaceDetail.tsx
- Renders full Location details
- Shows all Lots with availability
- Displays Transactions history
- Time selection for booking

### Zustand Store
- Manages user location (origin/destination)
- Manages time settings for booking
- Manages map bounds

## Schema Validation

The full schema is defined in `src/models/schema.js` and matches the GraphQL types for AWS Amplify integration.

## Future Enhancements

1. **Real Database Integration**
   - Replace mock data with AWS Amplify API calls
   - Implement subscription for real-time availability

2. **Search & Filtering**
   - Filter by location, price, amenities
   - Sorting by rating, distance, availability

3. **Payment Integration**
   - Stripe integration for bookings
   - Secure transaction handling

4. **User Authentication**
   - Cognito integration
   - OAuth provider support

5. **Notifications**
   - Booking confirmations
   - Availability alerts
   - Price notifications