import VeryHighIcon from '../../../assets/icons/very_high_icon.png'
import HighIcon from '../../../assets/icons/high_icon.png'
import MediumIcon from '../../../assets/icons/medium_icon.png'
import LowIcon from '../../../assets/icons/low_icon.png'
import VeryLowIcon from '../../../assets/icons/very_low_icon.png'

const priorityItemTemplate = (option) => {
    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'VERY_HIGH':
                return VeryHighIcon;
            case 'HIGH':
                return HighIcon;
            case 'MEDIUM':
                return MediumIcon;
            case 'LOW':
                return LowIcon;
            case 'VERY_LOW':
                return VeryLowIcon;
        }
    }

    return (
        <div className="flex align-items-center">
            <img alt={option.value} src={getPriorityIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
            <div>{option?.label}</div>
        </div>
    );
};

export default priorityItemTemplate;