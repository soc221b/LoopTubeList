import React from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/styles.css";

// Intentionally avoid auto-mounting the application here.
// Tests render the App component directly; mounting here causes duplicate
// DOM nodes during unit tests.
// If running the app in development/production, use a custom bootstrap.
