import {Dialog} from "primereact/dialog";

const InputDialog = ({ visible, onHide, children, header, footer, className }) => {
    return (
        <Dialog visible={visible} onHide={onHide} header={header} footer={footer} className="custom-dialog">
            <div className={className}>{children}</div>
        </Dialog>
    );
};

export default InputDialog ;