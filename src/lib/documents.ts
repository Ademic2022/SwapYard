import { graphql } from "@/gql";

export const ListingCardFields = graphql(`
  fragment ListingCardFields on Listing {
    id
    category
    title
    priceLabel
    status
    distanceLabel
    locationLabel
    createdAt
    photos {
      id
      url
      width
      height
    }
  }
`);

export const ListingDetailFields = graphql(`
  fragment ListingDetailFields on Listing {
    ...ListingCardFields
    description
    condition
    priceNgn
    isFree
    isNegotiable
    borrowFeePerDayNgn
    borrowMaxDays
    borrowDepositNgn
    availabilityNotes
    skillOfferType
    skillRateNgn
    skillRateUnit
    skillTradeFor
    url
    isLive
    isExpired
    isHidden
    isMine
    expiresAt
    updatedAt
    state
    city
    area
    owner {
      id
      displayName
      photoUrl
      locationLabel
      ratingAvg
      ratingCount
      completedExchanges
      emailVerified
      isVerifiedNeighbor
      joinedAt
    }
  }
`);

export const MeFields = graphql(`
  fragment MeFields on Me {
    id
    email
    displayName
    photoUrl
    bio
    whatsappNumber
    isOnboarded
    hasLocation
    safetyTipsSeen
    isStaff
    joinedAt
    ratingAvg
    ratingCount
    place {
      country
      state
      city
      area
      label
    }
  }
`);

export const MeQuery = graphql(`
  query Me {
    me {
      ...MeFields
    }
  }
`);

export const NigeriaStatesQuery = graphql(`
  query NigeriaStates {
    nigeriaStates {
      name
      lgas
    }
  }
`);

export const ListingIndexQuery = graphql(`
  query ListingIndex {
    listingIndex {
      id
      updatedAt
    }
  }
`);

export const PlaceFacetsQuery = graphql(`
  query PlaceFacets {
    placeFacets {
      country
      state
      city
      count
    }
  }
`);

export const FeedQuery = graphql(`
  query Feed($filters: FeedInput, $after: String) {
    feed(filters: $filters, first: 20, after: $after) {
      origin
      nextCursor
      items {
        ...ListingCardFields
      }
    }
  }
`);

export const ListingQuery = graphql(`
  query Listing($id: ID!) {
    listing(id: $id) {
      ...ListingDetailFields
    }
  }
`);

export const MyListingsQuery = graphql(`
  query MyListings {
    myListings {
      ...ListingCardFields
      isLive
      isExpired
      isHidden
      expiresAt
    }
  }
`);

export const UserQuery = graphql(`
  query PublicUser($id: ID!) {
    user(id: $id) {
      id
      displayName
      photoUrl
      bio
      locationLabel
      ratingAvg
      ratingCount
      completedExchanges
      emailVerified
      isVerifiedNeighbor
      joinedAt
      activeListings {
        ...ListingCardFields
      }
      reviews {
        id
        rating
        comment
        reviewerName
        listingTitle
        createdAt
      }
    }
  }
`);

export const ActivityQuery = graphql(`
  query Activity {
    pendingFollowups {
      id
      listingId
      listingTitle
      otherUserId
      otherUserName
      contactedAt
    }
    reviewableExchanges {
      id
      listingId
      listingTitle
      otherUserId
      otherUserName
      iContacted
      contactedAt
    }
  }
`);

export const RequestMagicLinkMutation = graphql(`
  mutation RequestMagicLink($email: String!, $next: String) {
    requestMagicLink(email: $email, next: $next)
  }
`);

export const MagicLinkPreviewQuery = graphql(`
  query MagicLinkPreview($token: String!) {
    magicLinkPreview(token: $token) {
      email
      isNewAccount
    }
  }
`);

export const VerifyMagicLinkMutation = graphql(`
  mutation VerifyMagicLink($token: String!) {
    verifyMagicLink(token: $token) {
      ...MeFields
    }
  }
`);

export const LogoutMutation = graphql(`
  mutation Logout {
    logout
  }
`);

export const SignOutEverywhereMutation = graphql(`
  mutation SignOutEverywhere {
    signOutEverywhere
  }
`);

export const UpdateProfileMutation = graphql(`
  mutation UpdateProfile($input: ProfileInput!, $photo: Upload, $removePhoto: Boolean! = false) {
    updateProfile(input: $input, photo: $photo, removePhoto: $removePhoto) {
      ...MeFields
    }
  }
`);

export const UpdateLocationMutation = graphql(`
  mutation UpdateLocation($lat: Float!, $lng: Float!) {
    updateLocation(lat: $lat, lng: $lng) {
      ...MeFields
    }
  }
`);

export const ClearLocationMutation = graphql(`
  mutation ClearLocation {
    clearLocation {
      ...MeFields
    }
  }
`);

export const AcknowledgeSafetyTipsMutation = graphql(`
  mutation AcknowledgeSafetyTips {
    acknowledgeSafetyTips {
      ...MeFields
    }
  }
`);

export const DeleteAccountMutation = graphql(`
  mutation DeleteAccount {
    deleteAccount
  }
`);

export const CreateListingMutation = graphql(`
  mutation CreateListing($input: ListingInput!, $photos: [Upload!]!) {
    createListing(input: $input, photos: $photos) {
      ...ListingDetailFields
    }
  }
`);

export const GenerateListingDescriptionMutation = graphql(`
  mutation GenerateListingDescription($input: ListingInput!) {
    generateListingDescription(input: $input)
  }
`);

export const UpdateListingMutation = graphql(`
  mutation UpdateListing($id: ID!, $input: ListingInput!, $keepPhotoIds: [ID!], $newPhotos: [Upload!]) {
    updateListing(id: $id, input: $input, keepPhotoIds: $keepPhotoIds, newPhotos: $newPhotos) {
      ...ListingDetailFields
    }
  }
`);

export const SetListingStatusMutation = graphql(`
  mutation SetListingStatus($id: ID!, $status: ListingStatus!) {
    setListingStatus(id: $id, status: $status) {
      ...ListingDetailFields
    }
  }
`);

export const RenewListingMutation = graphql(`
  mutation RenewListing($id: ID!) {
    renewListing(id: $id) {
      ...ListingDetailFields
    }
  }
`);

export const DeleteListingMutation = graphql(`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id)
  }
`);

export const ContactListingMutation = graphql(`
  mutation ContactListing($id: ID!) {
    contactListing(id: $id) {
      whatsappUrl
      contactEventId
    }
  }
`);

export const ReportOutcomeMutation = graphql(`
  mutation ReportOutcome($id: ID!, $outcome: ExchangeOutcome!) {
    reportOutcome(contactEventId: $id, outcome: $outcome)
  }
`);

export const LeaveReviewMutation = graphql(`
  mutation LeaveReview($id: ID!, $rating: Int!, $comment: String! = "") {
    leaveReview(contactEventId: $id, rating: $rating, comment: $comment)
  }
`);

export const ReportMutation = graphql(`
  mutation Report($targetType: ReportTarget!, $targetId: ID!, $reason: ReportReason!, $details: String! = "") {
    report(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details)
  }
`);
