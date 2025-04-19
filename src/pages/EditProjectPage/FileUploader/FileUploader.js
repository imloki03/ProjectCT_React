import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { Tooltip } from 'primereact/tooltip';
import { ProgressBar } from 'primereact/progressbar';

const FileUploader = ({ maxFileSize, accept, uploadHandler }) => {
    const toast = useRef(null);
    const [uploading, setUploading] = useState(false);
    const fileUploadRef = useRef(null);

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop Image Here
                </span>
            </div>
        );
    };

    const handleUpload = async (event) => {
        setUploading(true);
        toast.current.show({ severity: 'info', summary: 'Uploading', detail: 'Please wait while your file is being uploaded...', life: 3000 });

        try {
            await uploadHandler(event);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Upload failed. Please try again.', life: 3000 });
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const chooseOptions = {
        icon: 'pi pi-fw pi-images',
        iconOnly: true,
        className: 'custom-choose-btn p-button-rounded p-button-outlined',
        disabled: uploading
    };

    const uploadOptions = {
        icon: 'pi pi-fw pi-cloud-upload',
        iconOnly: true,
        className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined',
        disabled: uploading
    };

    const cancelOptions = {
        icon: 'pi pi-fw pi-times',
        iconOnly: true,
        className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined',
        disabled: uploading
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex-grow-1 ml-3 text-right">
                    {uploading && <span className="font-bold">Uploading...</span>}
                </div>
            </div>
        );
    };

    return (
        <div>
            <Toast ref={toast}></Toast>

            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            {uploading && (
                <ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom: '10px' }} />
            )}

            <FileUpload
                ref={fileUploadRef}
                name="demo"
                accept={accept}
                maxFileSize={maxFileSize}
                previewWidth={200}
                customUpload
                auto
                uploadHandler={handleUpload}
                emptyTemplate={emptyTemplate}
                headerTemplate={headerTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions}
                disabled={uploading}
            />
        </div>
    );
};

export default FileUploader;