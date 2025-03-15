import React from 'react';
import { Avatar } from 'primereact/avatar';

export default function TextAvatar({ label, size, customSize, onClick, shape }) {
    // Function to extract initials from the last two words of the label
    const getInitials = (label) => {
        if (!label) return "?";

        const words = label.split(' ');

        if (words.length === 1) {
            // If it's a single word and shorter than 2 characters
            return label.length < 2 ? label.toUpperCase() : label.slice(0, 2).toUpperCase();
        }

        const Word = words[0]; // Last word
        const secondWord = words[1] || ""; // Second last word, fallback to empty string
        return (
            (Word.charAt(0) + secondWord.charAt(0)).toUpperCase()
        );
    };

    // Generate HSL color based on name
    const generateColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate HSL values
        const h = Math.abs(hash % 360); // Hue: 0-360
        const s = 65 + (hash % 20); // Saturation: 65-85%
        const l = 45 + (hash % 10); // Lightness: 45-55%

        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const initials = getInitials(label);
    const backgroundColor = generateColor(initials);

    return (
        <Avatar
            label={initials}  // Use the initials as the label
            size={size || 'large'}  // Default size is 'large' if no size is provided, example normal, large, xlarge
            style={{
                backgroundColor: initials === "?" ? "#ffffff" : backgroundColor,
                color: initials === "?" ? "#000000" : "#ffffff",
                border: initials === "?" ? `${customSize ? parseFloat(customSize) * 0.07 : 0.5}rem solid black` : "none", //default 0.5rem
                ...(customSize && {
                    width: customSize,
                    height: customSize,
                    fontSize: `calc(${customSize} / 2)`,
                })
            }}
            shape={shape || "circle"}
            onClick={onClick}
            title={label}
        />
    );
}