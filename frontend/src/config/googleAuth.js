const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services";

export const getGoogleClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const loadGoogleIdentityScript = () => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Google sign-in is only available in the browser."));
    }

    if (window.google?.accounts?.oauth2) {
        return Promise.resolve(window.google);
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(window.google));
            existingScript.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")));
            return;
        }

        const script = document.createElement("script");
        script.id = GOOGLE_IDENTITY_SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error("Failed to load Google sign-in."));
        document.head.appendChild(script);
    });
};
