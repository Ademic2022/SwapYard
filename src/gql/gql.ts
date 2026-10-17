/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment ListingCardFields on Listing {\n    id\n    category\n    title\n    priceLabel\n    status\n    distanceLabel\n    locationLabel\n    createdAt\n    photos {\n      id\n      url\n      width\n      height\n    }\n  }\n": typeof types.ListingCardFieldsFragmentDoc,
    "\n  fragment ListingDetailFields on Listing {\n    ...ListingCardFields\n    description\n    condition\n    priceNgn\n    isFree\n    isNegotiable\n    borrowFeePerDayNgn\n    borrowMaxDays\n    borrowDepositNgn\n    availabilityNotes\n    skillOfferType\n    skillRateNgn\n    skillRateUnit\n    skillTradeFor\n    url\n    isLive\n    isExpired\n    isHidden\n    isMine\n    expiresAt\n    updatedAt\n    owner {\n      id\n      displayName\n      photoUrl\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n    }\n  }\n": typeof types.ListingDetailFieldsFragmentDoc,
    "\n  fragment MeFields on Me {\n    id\n    email\n    displayName\n    photoUrl\n    bio\n    whatsappNumber\n    isOnboarded\n    hasLocation\n    safetyTipsSeen\n    isStaff\n    joinedAt\n    ratingAvg\n    ratingCount\n    place {\n      country\n      state\n      city\n      area\n      label\n    }\n  }\n": typeof types.MeFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...MeFields\n    }\n  }\n": typeof types.MeDocument,
    "\n  query PlaceFacets {\n    placeFacets {\n      country\n      state\n      city\n      count\n    }\n  }\n": typeof types.PlaceFacetsDocument,
    "\n  query Feed($filters: FeedInput, $after: String) {\n    feed(filters: $filters, first: 20, after: $after) {\n      origin\n      nextCursor\n      items {\n        ...ListingCardFields\n      }\n    }\n  }\n": typeof types.FeedDocument,
    "\n  query Listing($id: ID!) {\n    listing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n": typeof types.ListingDocument,
    "\n  query MyListings {\n    myListings {\n      ...ListingCardFields\n      isLive\n      isExpired\n      isHidden\n      expiresAt\n    }\n  }\n": typeof types.MyListingsDocument,
    "\n  query PublicUser($id: ID!) {\n    user(id: $id) {\n      id\n      displayName\n      photoUrl\n      bio\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n      activeListings {\n        ...ListingCardFields\n      }\n      reviews {\n        id\n        rating\n        comment\n        reviewerName\n        listingTitle\n        createdAt\n      }\n    }\n  }\n": typeof types.PublicUserDocument,
    "\n  query Activity {\n    pendingFollowups {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      contactedAt\n    }\n    reviewableExchanges {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      iContacted\n      contactedAt\n    }\n  }\n": typeof types.ActivityDocument,
    "\n  mutation RequestMagicLink($email: String!, $next: String) {\n    requestMagicLink(email: $email, next: $next)\n  }\n": typeof types.RequestMagicLinkDocument,
    "\n  mutation VerifyMagicLink($token: String!) {\n    verifyMagicLink(token: $token) {\n      ...MeFields\n    }\n  }\n": typeof types.VerifyMagicLinkDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  mutation UpdateProfile($input: ProfileInput!, $photo: Upload, $removePhoto: Boolean! = false) {\n    updateProfile(input: $input, photo: $photo, removePhoto: $removePhoto) {\n      ...MeFields\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation UpdateLocation($lat: Float!, $lng: Float!) {\n    updateLocation(lat: $lat, lng: $lng) {\n      ...MeFields\n    }\n  }\n": typeof types.UpdateLocationDocument,
    "\n  mutation ClearLocation {\n    clearLocation {\n      ...MeFields\n    }\n  }\n": typeof types.ClearLocationDocument,
    "\n  mutation AcknowledgeSafetyTips {\n    acknowledgeSafetyTips {\n      ...MeFields\n    }\n  }\n": typeof types.AcknowledgeSafetyTipsDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n": typeof types.DeleteAccountDocument,
    "\n  mutation CreateListing($input: ListingInput!, $photos: [Upload!]!) {\n    createListing(input: $input, photos: $photos) {\n      ...ListingDetailFields\n    }\n  }\n": typeof types.CreateListingDocument,
    "\n  mutation UpdateListing($id: ID!, $input: ListingInput!, $keepPhotoIds: [ID!], $newPhotos: [Upload!]) {\n    updateListing(id: $id, input: $input, keepPhotoIds: $keepPhotoIds, newPhotos: $newPhotos) {\n      ...ListingDetailFields\n    }\n  }\n": typeof types.UpdateListingDocument,
    "\n  mutation SetListingStatus($id: ID!, $status: ListingStatus!) {\n    setListingStatus(id: $id, status: $status) {\n      ...ListingDetailFields\n    }\n  }\n": typeof types.SetListingStatusDocument,
    "\n  mutation RenewListing($id: ID!) {\n    renewListing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n": typeof types.RenewListingDocument,
    "\n  mutation DeleteListing($id: ID!) {\n    deleteListing(id: $id)\n  }\n": typeof types.DeleteListingDocument,
    "\n  mutation ContactListing($id: ID!) {\n    contactListing(id: $id) {\n      whatsappUrl\n      contactEventId\n    }\n  }\n": typeof types.ContactListingDocument,
    "\n  mutation ReportOutcome($id: ID!, $outcome: ExchangeOutcome!) {\n    reportOutcome(contactEventId: $id, outcome: $outcome)\n  }\n": typeof types.ReportOutcomeDocument,
    "\n  mutation LeaveReview($id: ID!, $rating: Int!, $comment: String! = \"\") {\n    leaveReview(contactEventId: $id, rating: $rating, comment: $comment)\n  }\n": typeof types.LeaveReviewDocument,
    "\n  mutation Report($targetType: ReportTarget!, $targetId: ID!, $reason: ReportReason!, $details: String! = \"\") {\n    report(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details)\n  }\n": typeof types.ReportDocument,
};
const documents: Documents = {
    "\n  fragment ListingCardFields on Listing {\n    id\n    category\n    title\n    priceLabel\n    status\n    distanceLabel\n    locationLabel\n    createdAt\n    photos {\n      id\n      url\n      width\n      height\n    }\n  }\n": types.ListingCardFieldsFragmentDoc,
    "\n  fragment ListingDetailFields on Listing {\n    ...ListingCardFields\n    description\n    condition\n    priceNgn\n    isFree\n    isNegotiable\n    borrowFeePerDayNgn\n    borrowMaxDays\n    borrowDepositNgn\n    availabilityNotes\n    skillOfferType\n    skillRateNgn\n    skillRateUnit\n    skillTradeFor\n    url\n    isLive\n    isExpired\n    isHidden\n    isMine\n    expiresAt\n    updatedAt\n    owner {\n      id\n      displayName\n      photoUrl\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n    }\n  }\n": types.ListingDetailFieldsFragmentDoc,
    "\n  fragment MeFields on Me {\n    id\n    email\n    displayName\n    photoUrl\n    bio\n    whatsappNumber\n    isOnboarded\n    hasLocation\n    safetyTipsSeen\n    isStaff\n    joinedAt\n    ratingAvg\n    ratingCount\n    place {\n      country\n      state\n      city\n      area\n      label\n    }\n  }\n": types.MeFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...MeFields\n    }\n  }\n": types.MeDocument,
    "\n  query PlaceFacets {\n    placeFacets {\n      country\n      state\n      city\n      count\n    }\n  }\n": types.PlaceFacetsDocument,
    "\n  query Feed($filters: FeedInput, $after: String) {\n    feed(filters: $filters, first: 20, after: $after) {\n      origin\n      nextCursor\n      items {\n        ...ListingCardFields\n      }\n    }\n  }\n": types.FeedDocument,
    "\n  query Listing($id: ID!) {\n    listing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n": types.ListingDocument,
    "\n  query MyListings {\n    myListings {\n      ...ListingCardFields\n      isLive\n      isExpired\n      isHidden\n      expiresAt\n    }\n  }\n": types.MyListingsDocument,
    "\n  query PublicUser($id: ID!) {\n    user(id: $id) {\n      id\n      displayName\n      photoUrl\n      bio\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n      activeListings {\n        ...ListingCardFields\n      }\n      reviews {\n        id\n        rating\n        comment\n        reviewerName\n        listingTitle\n        createdAt\n      }\n    }\n  }\n": types.PublicUserDocument,
    "\n  query Activity {\n    pendingFollowups {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      contactedAt\n    }\n    reviewableExchanges {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      iContacted\n      contactedAt\n    }\n  }\n": types.ActivityDocument,
    "\n  mutation RequestMagicLink($email: String!, $next: String) {\n    requestMagicLink(email: $email, next: $next)\n  }\n": types.RequestMagicLinkDocument,
    "\n  mutation VerifyMagicLink($token: String!) {\n    verifyMagicLink(token: $token) {\n      ...MeFields\n    }\n  }\n": types.VerifyMagicLinkDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  mutation UpdateProfile($input: ProfileInput!, $photo: Upload, $removePhoto: Boolean! = false) {\n    updateProfile(input: $input, photo: $photo, removePhoto: $removePhoto) {\n      ...MeFields\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation UpdateLocation($lat: Float!, $lng: Float!) {\n    updateLocation(lat: $lat, lng: $lng) {\n      ...MeFields\n    }\n  }\n": types.UpdateLocationDocument,
    "\n  mutation ClearLocation {\n    clearLocation {\n      ...MeFields\n    }\n  }\n": types.ClearLocationDocument,
    "\n  mutation AcknowledgeSafetyTips {\n    acknowledgeSafetyTips {\n      ...MeFields\n    }\n  }\n": types.AcknowledgeSafetyTipsDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n": types.DeleteAccountDocument,
    "\n  mutation CreateListing($input: ListingInput!, $photos: [Upload!]!) {\n    createListing(input: $input, photos: $photos) {\n      ...ListingDetailFields\n    }\n  }\n": types.CreateListingDocument,
    "\n  mutation UpdateListing($id: ID!, $input: ListingInput!, $keepPhotoIds: [ID!], $newPhotos: [Upload!]) {\n    updateListing(id: $id, input: $input, keepPhotoIds: $keepPhotoIds, newPhotos: $newPhotos) {\n      ...ListingDetailFields\n    }\n  }\n": types.UpdateListingDocument,
    "\n  mutation SetListingStatus($id: ID!, $status: ListingStatus!) {\n    setListingStatus(id: $id, status: $status) {\n      ...ListingDetailFields\n    }\n  }\n": types.SetListingStatusDocument,
    "\n  mutation RenewListing($id: ID!) {\n    renewListing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n": types.RenewListingDocument,
    "\n  mutation DeleteListing($id: ID!) {\n    deleteListing(id: $id)\n  }\n": types.DeleteListingDocument,
    "\n  mutation ContactListing($id: ID!) {\n    contactListing(id: $id) {\n      whatsappUrl\n      contactEventId\n    }\n  }\n": types.ContactListingDocument,
    "\n  mutation ReportOutcome($id: ID!, $outcome: ExchangeOutcome!) {\n    reportOutcome(contactEventId: $id, outcome: $outcome)\n  }\n": types.ReportOutcomeDocument,
    "\n  mutation LeaveReview($id: ID!, $rating: Int!, $comment: String! = \"\") {\n    leaveReview(contactEventId: $id, rating: $rating, comment: $comment)\n  }\n": types.LeaveReviewDocument,
    "\n  mutation Report($targetType: ReportTarget!, $targetId: ID!, $reason: ReportReason!, $details: String! = \"\") {\n    report(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details)\n  }\n": types.ReportDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListingCardFields on Listing {\n    id\n    category\n    title\n    priceLabel\n    status\n    distanceLabel\n    locationLabel\n    createdAt\n    photos {\n      id\n      url\n      width\n      height\n    }\n  }\n"): (typeof documents)["\n  fragment ListingCardFields on Listing {\n    id\n    category\n    title\n    priceLabel\n    status\n    distanceLabel\n    locationLabel\n    createdAt\n    photos {\n      id\n      url\n      width\n      height\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListingDetailFields on Listing {\n    ...ListingCardFields\n    description\n    condition\n    priceNgn\n    isFree\n    isNegotiable\n    borrowFeePerDayNgn\n    borrowMaxDays\n    borrowDepositNgn\n    availabilityNotes\n    skillOfferType\n    skillRateNgn\n    skillRateUnit\n    skillTradeFor\n    url\n    isLive\n    isExpired\n    isHidden\n    isMine\n    expiresAt\n    updatedAt\n    owner {\n      id\n      displayName\n      photoUrl\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n    }\n  }\n"): (typeof documents)["\n  fragment ListingDetailFields on Listing {\n    ...ListingCardFields\n    description\n    condition\n    priceNgn\n    isFree\n    isNegotiable\n    borrowFeePerDayNgn\n    borrowMaxDays\n    borrowDepositNgn\n    availabilityNotes\n    skillOfferType\n    skillRateNgn\n    skillRateUnit\n    skillTradeFor\n    url\n    isLive\n    isExpired\n    isHidden\n    isMine\n    expiresAt\n    updatedAt\n    owner {\n      id\n      displayName\n      photoUrl\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MeFields on Me {\n    id\n    email\n    displayName\n    photoUrl\n    bio\n    whatsappNumber\n    isOnboarded\n    hasLocation\n    safetyTipsSeen\n    isStaff\n    joinedAt\n    ratingAvg\n    ratingCount\n    place {\n      country\n      state\n      city\n      area\n      label\n    }\n  }\n"): (typeof documents)["\n  fragment MeFields on Me {\n    id\n    email\n    displayName\n    photoUrl\n    bio\n    whatsappNumber\n    isOnboarded\n    hasLocation\n    safetyTipsSeen\n    isStaff\n    joinedAt\n    ratingAvg\n    ratingCount\n    place {\n      country\n      state\n      city\n      area\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlaceFacets {\n    placeFacets {\n      country\n      state\n      city\n      count\n    }\n  }\n"): (typeof documents)["\n  query PlaceFacets {\n    placeFacets {\n      country\n      state\n      city\n      count\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Feed($filters: FeedInput, $after: String) {\n    feed(filters: $filters, first: 20, after: $after) {\n      origin\n      nextCursor\n      items {\n        ...ListingCardFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query Feed($filters: FeedInput, $after: String) {\n    feed(filters: $filters, first: 20, after: $after) {\n      origin\n      nextCursor\n      items {\n        ...ListingCardFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Listing($id: ID!) {\n    listing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n"): (typeof documents)["\n  query Listing($id: ID!) {\n    listing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyListings {\n    myListings {\n      ...ListingCardFields\n      isLive\n      isExpired\n      isHidden\n      expiresAt\n    }\n  }\n"): (typeof documents)["\n  query MyListings {\n    myListings {\n      ...ListingCardFields\n      isLive\n      isExpired\n      isHidden\n      expiresAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PublicUser($id: ID!) {\n    user(id: $id) {\n      id\n      displayName\n      photoUrl\n      bio\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n      activeListings {\n        ...ListingCardFields\n      }\n      reviews {\n        id\n        rating\n        comment\n        reviewerName\n        listingTitle\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query PublicUser($id: ID!) {\n    user(id: $id) {\n      id\n      displayName\n      photoUrl\n      bio\n      locationLabel\n      ratingAvg\n      ratingCount\n      completedExchanges\n      emailVerified\n      isVerifiedNeighbor\n      joinedAt\n      activeListings {\n        ...ListingCardFields\n      }\n      reviews {\n        id\n        rating\n        comment\n        reviewerName\n        listingTitle\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Activity {\n    pendingFollowups {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      contactedAt\n    }\n    reviewableExchanges {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      iContacted\n      contactedAt\n    }\n  }\n"): (typeof documents)["\n  query Activity {\n    pendingFollowups {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      contactedAt\n    }\n    reviewableExchanges {\n      id\n      listingId\n      listingTitle\n      otherUserId\n      otherUserName\n      iContacted\n      contactedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestMagicLink($email: String!, $next: String) {\n    requestMagicLink(email: $email, next: $next)\n  }\n"): (typeof documents)["\n  mutation RequestMagicLink($email: String!, $next: String) {\n    requestMagicLink(email: $email, next: $next)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyMagicLink($token: String!) {\n    verifyMagicLink(token: $token) {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyMagicLink($token: String!) {\n    verifyMagicLink(token: $token) {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: ProfileInput!, $photo: Upload, $removePhoto: Boolean! = false) {\n    updateProfile(input: $input, photo: $photo, removePhoto: $removePhoto) {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: ProfileInput!, $photo: Upload, $removePhoto: Boolean! = false) {\n    updateProfile(input: $input, photo: $photo, removePhoto: $removePhoto) {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateLocation($lat: Float!, $lng: Float!) {\n    updateLocation(lat: $lat, lng: $lng) {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateLocation($lat: Float!, $lng: Float!) {\n    updateLocation(lat: $lat, lng: $lng) {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ClearLocation {\n    clearLocation {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  mutation ClearLocation {\n    clearLocation {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcknowledgeSafetyTips {\n    acknowledgeSafetyTips {\n      ...MeFields\n    }\n  }\n"): (typeof documents)["\n  mutation AcknowledgeSafetyTips {\n    acknowledgeSafetyTips {\n      ...MeFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n"): (typeof documents)["\n  mutation DeleteAccount {\n    deleteAccount\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateListing($input: ListingInput!, $photos: [Upload!]!) {\n    createListing(input: $input, photos: $photos) {\n      ...ListingDetailFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateListing($input: ListingInput!, $photos: [Upload!]!) {\n    createListing(input: $input, photos: $photos) {\n      ...ListingDetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateListing($id: ID!, $input: ListingInput!, $keepPhotoIds: [ID!], $newPhotos: [Upload!]) {\n    updateListing(id: $id, input: $input, keepPhotoIds: $keepPhotoIds, newPhotos: $newPhotos) {\n      ...ListingDetailFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateListing($id: ID!, $input: ListingInput!, $keepPhotoIds: [ID!], $newPhotos: [Upload!]) {\n    updateListing(id: $id, input: $input, keepPhotoIds: $keepPhotoIds, newPhotos: $newPhotos) {\n      ...ListingDetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetListingStatus($id: ID!, $status: ListingStatus!) {\n    setListingStatus(id: $id, status: $status) {\n      ...ListingDetailFields\n    }\n  }\n"): (typeof documents)["\n  mutation SetListingStatus($id: ID!, $status: ListingStatus!) {\n    setListingStatus(id: $id, status: $status) {\n      ...ListingDetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RenewListing($id: ID!) {\n    renewListing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n"): (typeof documents)["\n  mutation RenewListing($id: ID!) {\n    renewListing(id: $id) {\n      ...ListingDetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteListing($id: ID!) {\n    deleteListing(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteListing($id: ID!) {\n    deleteListing(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ContactListing($id: ID!) {\n    contactListing(id: $id) {\n      whatsappUrl\n      contactEventId\n    }\n  }\n"): (typeof documents)["\n  mutation ContactListing($id: ID!) {\n    contactListing(id: $id) {\n      whatsappUrl\n      contactEventId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReportOutcome($id: ID!, $outcome: ExchangeOutcome!) {\n    reportOutcome(contactEventId: $id, outcome: $outcome)\n  }\n"): (typeof documents)["\n  mutation ReportOutcome($id: ID!, $outcome: ExchangeOutcome!) {\n    reportOutcome(contactEventId: $id, outcome: $outcome)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LeaveReview($id: ID!, $rating: Int!, $comment: String! = \"\") {\n    leaveReview(contactEventId: $id, rating: $rating, comment: $comment)\n  }\n"): (typeof documents)["\n  mutation LeaveReview($id: ID!, $rating: Int!, $comment: String! = \"\") {\n    leaveReview(contactEventId: $id, rating: $rating, comment: $comment)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Report($targetType: ReportTarget!, $targetId: ID!, $reason: ReportReason!, $details: String! = \"\") {\n    report(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details)\n  }\n"): (typeof documents)["\n  mutation Report($targetType: ReportTarget!, $targetId: ID!, $reason: ReportReason!, $details: String! = \"\") {\n    report(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;