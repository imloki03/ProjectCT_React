import React from 'react';
import TextAvatar from "../TextAvatar";
import ImageAvatar from "../ImageAvatar";

const Avatar = ({ label, size, image, shape, customSize, onClick }) => {
    return (
        <div>
            {image ? (
                <div className="project-avatar">
                    <ImageAvatar
                        label={label}
                        image={image}
                        size={size}
                        shape={shape}
                        customSize={customSize}
                        onClick={onClick}
                    />
                </div>
            ) : (
                <div className="project-avatar">
                    <TextAvatar
                        label={label}
                        size={size}
                        shape={shape}
                        customSize={customSize}
                        onClick={onClick}
                    />
                </div>
            )}
        </div>
    )
}

export default Avatar;