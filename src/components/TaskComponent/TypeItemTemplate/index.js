import TaskIcon from '../../../assets/icons/task_icon.png'
import StoryIcon from '../../../assets/icons/story_icon.png'
import BugIcon from '../../../assets/icons/bug_icon.png'

const typeItemTemplate = (option) => {
    const getTypeIcon = (type) => {
        switch(type) {
            case 'STORY':
                return StoryIcon;
            case 'TASK':
                return TaskIcon;
            case 'BUG':
                return BugIcon;
        }
    }

    return (
        <div className="flex align-items-center">
            <img alt={option.value} src={getTypeIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
            <div>{option?.label}</div>
        </div>
    );
};

export default typeItemTemplate;