import React, {useEffect} from 'react';
import './index.css'
import Avatar from "../../../components/Avatar";
import { Avatar as PrimeAvatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';

const TypingIndicator = ({ queue }) => {
    return (
        <div className={"typing-indicator-container"}>
            <div className='avatar-typing-indicator'>
                <div className="avatar-typing-indicator">
                    {queue.length > 0 && (
                        <>
                            {queue.slice(0, 5).reverse().map((user) => (
                                <Avatar
                                    key={user.userInfor?.user?.username}
                                    label={user.userInfor?.user?.name}
                                    customSize={"2.3rem"}
                                    image={user.userInfor?.user?.avatarURL}
                                />
                            ))}
                            {queue.length > 5 && (
                                <>
                                    <PrimeAvatar
                                        key="remaining-users"
                                        label={`+${queue.length - 5}`}
                                        style={{ width: '2.3rem', height: '2.3rem', fontSize: '1rem' }}
                                        shape="circle"
                                        data-pr-tooltip={queue.slice(5).map(user => user.userInfor?.user?.name).join(', ')}
                                    />
                                    <Tooltip target=".p-avatar" />
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="chat-bubble">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </div>
    );
};

export default TypingIndicator;