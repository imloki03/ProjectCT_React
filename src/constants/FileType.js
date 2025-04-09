export const allowedFileExtensions = [
    ".mp4", ".avi", ".mkv", ".jpg", ".jpeg", ".png", ".gif",
    ".doc", ".docx", ".pdf", ".ppt", ".pptx", ".xls", ".xlsx"
]

export const categorizeExtensions = () => {
    return {
        media: allowedFileExtensions.filter(ext => [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".avi", ".mkv"].includes(ext))
            .map(ext => ext.replace(".", "")),
        others: allowedFileExtensions.filter(ext => [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext))
            .map(ext => ext.replace(".", ""))
    };
};