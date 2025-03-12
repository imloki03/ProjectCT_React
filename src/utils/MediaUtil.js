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
