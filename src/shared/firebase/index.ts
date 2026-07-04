// Public API — client SDK only. Server code must import "./admin" directly
// (never re-exported here) so client bundles can never pull in admin code.
export { auth, db, firebaseApp, appCheck } from "./client";
