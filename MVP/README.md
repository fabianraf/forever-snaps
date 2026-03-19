# Forever Snaps

A simple, mobile-first web app for collecting event photos from guests through a QR code flow, storing them in AWS S3, and displaying them in a private mosaic gallery.

## MVP Goal

Deliver a working MVP with three core capabilities:

1. Upload photos to an S3 bucket.
2. Let visitors scan a QR code that opens a landing page where they:
   - select the upload photos widget,
   - enter their name,
   - upload one or multiple photos.
3. Provide a gallery page that is only accessible via direct URL, where all uploaded photos are displayed in a mosaic layout.

## Product Concept

Forever Snaps is designed for events (starting with weddings) where guests can contribute photos instantly, without friction.  
The experience is fast, intuitive, and optimized for mobile devices.

## Core User Flow

1. Guest scans QR code.
2. Guest lands on the upload page.
3. Guest enters name.
4. Guest uploads one or multiple photos.
5. Photos are stored in S3.
6. Hosts access a private direct-link gallery.
7. Gallery renders photos in a mosaic grid.

## Tech Requirements

- **Language:** JavaScript first (TypeScript optional).
- **UI:** Modern UI patterns, mobile-first design.
- **Cloud Storage:** AWS S3 for image uploads.
- **Deployment:** Vercel.

## MVP Scope

### In Scope
- QR-to-landing-page entry point.
- Name field + multi-photo upload flow.
- Upload to S3 bucket.
- Private gallery page via direct URL.
- Mosaic-style photo display.

### Out of Scope (for MVP)
- Full authentication/authorization system.
- Advanced moderation tools.
- Native mobile app.
- Complex admin dashboard.

## UX Principles

- No account creation required for guests.
- Clear primary action at every step.
- Complete upload flow in seconds.
- Friendly and elegant interface.
- Strong mobile usability (large touch targets, low friction).

## Deployment

The project is intended to be deployed on **Vercel**.

## Next Step

After this README, we will break the MVP into execution cards on GitHub Projects (board-based planning).