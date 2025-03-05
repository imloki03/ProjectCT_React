import React from 'react';
import { Avatar } from 'primereact/avatar';

export default function ImageAvatar({ label, size, image, shape, customSize, onClick }) {
    return (
        <Avatar
            label={label} // Text-based Avatar, if no image provided
            image={image} // Image URL for the Avatar
            size={size || 'large'}  // Default size is 'large' if not provided
            shape={shape || "circle"}  // Circle shape for the Avatar
            style={{
                ...(customSize && {
                    width: customSize,
                    height: customSize,
                    fontSize: `calc(${customSize} / 2)`,
                })
            }}
            onClick={onClick}
            title={label}
        />
    );
}

