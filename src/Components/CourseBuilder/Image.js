import { useDraggable } from "@dnd-kit/core";
// import {FaHeading} from 'react-icons/fa';

export default function Image(props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'Image',
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} className="heading" style={style} {...listeners} {...attributes}>
            <i className="fa-regular fa-image image"></i>
            <p>Image</p>
        </div>
    )
}   