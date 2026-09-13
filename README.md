# Prefects' Cup Website

[![About](https://img.shields.io/website-up-down-green-red/https/pc.ucc.on.ca.svg?label=pc.ucc.on.ca)](https://pc.ucc.on.ca)

Prefects' Cup is an annual competition between the houses of Upper Canada College, and this is just a simple website for keeping track of points and events.

The website itself is implemented with plain HTML, CSS, and JS. The libraries used (Bulma, Chart.js, and Firebase) are loaded from a CDN.

Firebase is used as the backend, and Github Pages is used to host, following the previous site implementation.

This repo's predecessor is at https://github.com/mattxwang/prefects-cup-website, written by [Matthew Wang](https://matthewwang.me). The code proper in this new repo was written from scratch, but I used their favicons and house colors.

## How points work

There is this notion of events: each event allows a house to earn points. Each house's points are dynamically calculated from the points they got from an event. In the case that you want to add to or subtract from a house's points, there is a hidden "Miscellaneous" event that does not show up on the events list publically but still contributes to scores.

## Data model

Everything lives under `public/` in the Firebase Realtime Database:

```
public/
  events/<id>/  { title, description, status, date, points: { bremners, howards, ... } }
  miscPoints/   { bremners, howards, ... }
  countdown     (milliseconds since epoch)
```

`status` can be one of `upcoming`, `ongoing`, or `completed`.

## Setup

1. Create [Firebase](https://firebase.google.com/) Realtime Database, turn on Email/Password and/or Google authentication, and copy your web config into `js/firebase.js`.
2. Then set the database rules such that the public can read but only whitelisted accounts can write:

   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "public": {
         ".read": true,
         ".write": "root.child('allowedUids').child(auth.uid).exists()"
       }
     }
   }
   ```

3. Create an `allowedUids` object listing each editor's UID in your database:

   ```json
   {
     "allowedUids": {
       "<UID_1>": true,
       "<UID_2>": true
     }
   }
   ```

4. A local server is needed for development (for example by running `python3 -m http.server`) because ES modules don't load using `file://`.

## Made with

- [Bulma](https://bulma.io), CSS framework
- [Chart.js](https://www.chartjs.org/), the points bar graph
- [Firebase](https://firebase.google.com/), database and authentication

## Credit

This is a complete rewrite of the original Prefects' Cup website by [Matthew Wang](https://matthewwang.me). Licensed under Apache 2.0 (see `LICENSE.md`).
