import mediaType from "../assets/images/media_file_type.png";
import pdfType from "../assets/images/pdf_file_type.png";
import docType from "../assets/images/docx_file_type.png";
import pptType from "../assets/images/ppt_file_type.png";
import xlsType from "../assets/images/xls_file_type.png";

export const downloadMedia = async (media) => {
    try {
        const response = await fetch(media.link, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = media.name || 'downloaded_file';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again later.');
    }
};

export const countFileTypes = (files) => {
    let counts = {
        total: files.length,
        documents: 0,
        images: 0,
        videos: 0,
        audios: 0,
    };

    files.forEach(file => {
        const ext = file.name.split(".").pop().toLowerCase();
        if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
            counts.documents++;
        } else if (["jpg", "png", "gif"].includes(ext)) {
            counts.images++;
        } else if (["mp4"].includes(ext)) {
            counts.videos++;
        } else if (["mp3"].includes(ext)) {
            counts.audios++;
        }
    });

    return counts;
};

export const formatFileSize = (size) => {
    if (!size || isNaN(size)) return "N/A";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const getFileType = (filename) => {
    if (!filename) return "UNKNOWN";

    const extension = filename.split(".").pop().toLowerCase();

    switch (extension) {
        case "mp4":
        case "avi":
        case "mkv":
            return "VIDEO";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return "IMAGE";
        case "doc":
        case "docx":
        case "pdf":
            return "DOC";
        case "ppt":
        case "pptx":
            return "PRESENTATION";
        case "xls":
        case "xlsx":
            return "WORKBOOK";
        default:
            return "UNKNOWN";
    }
};

export const getIconForType = (file) => {
    const fileExtension = file.filename.split(".").pop().toLowerCase();
    switch (file.type) {
        case "VIDEO":
        case "IMAGE":
            return mediaType;
        case "DOC":
            return fileExtension === "pdf" ? pdfType : docType;
        case "PRESENTATION":
            return pptType;
        case "WORKBOOK":
            return xlsType;
        default:
            return docType;
    }
};