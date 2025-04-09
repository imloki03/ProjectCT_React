export const getMessageClass = (olderMsg, currentMsg, newerMsg) => {
    const currentSender = currentMsg.sender?.username;
    const prevSender = olderMsg?.sender?.username;
    const nextSender = newerMsg?.sender?.username;

    const prevTimeGap =
        olderMsg &&
        Math.abs(new Date(currentMsg.sentTime) - new Date(olderMsg.sentTime)) >
        15 * 60 * 1000;
    const nextTimeGap =
        newerMsg &&
        Math.abs(new Date(newerMsg.sentTime) - new Date(currentMsg.sentTime)) >
        15 * 60 * 1000;

    if (
        (prevSender !== currentSender && nextSender !== currentSender) ||
        (prevTimeGap && nextTimeGap) ||
        (prevSender !== currentSender && nextTimeGap) ||
        (nextSender !== currentSender && prevTimeGap)
    ) {
        return "m-lone";
    } else if (
        (prevSender !== currentSender && nextSender === currentSender) ||
        (prevTimeGap && !nextTimeGap) ||
        (prevSender === currentSender && prevTimeGap)
    ) {
        return "m-first";
    } else if (
        prevSender === currentSender &&
        nextSender === currentSender &&
        !prevTimeGap &&
        !nextTimeGap
    ) {
        return "m-mid";
    } else if (
        (prevSender === currentSender && nextSender !== currentSender) ||
        (!prevTimeGap && nextTimeGap)
    ) {
        return "m-last";
    }
    return "";
};