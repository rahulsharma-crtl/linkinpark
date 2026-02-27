import React from "react";
import { AVATAR_COLORS, POPULAR_EMOJIS } from "../utils/constants";

export default function Avatar({ user, config, className = "w-12 h-12 text-lg" }) {
    if (!user) return null;

    // Default fallback styles if no config is present
    const defaultColor = AVATAR_COLORS[0];

    // Use user's saved config or derive deterministic defaults based on email
    let colorTheme = defaultColor;
    let displayContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : "?";

    if (config) {
        if (config.colorId) {
            const foundTheme = AVATAR_COLORS.find(c => c.id === config.colorId);
            if (foundTheme) colorTheme = foundTheme;
        }
        if (config.emoji) {
            displayContent = config.emoji;
        }
    } else {
        // Deterministic fallback color based on email length
        const charCode = user.email ? user.email.charCodeAt(0) : 0;
        const colorIndex = charCode % AVATAR_COLORS.length;
        colorTheme = AVATAR_COLORS[colorIndex];
    }

    return (
        <div
            className={`flex items-center justify-center rounded-2xl font-black shadow-sm ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border} border-2 ${className}`}
            title={user.displayName}
        >
            {displayContent}
        </div>
    );
}
