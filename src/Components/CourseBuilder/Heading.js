import { useDraggable } from "@dnd-kit/core";
// import {FaHeading} from 'react-icons/fa';

export default function Heading(props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'Heading',
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} className="heading" style={style} {...listeners} {...attributes}>
            <i className="fa-solid fa-heading "></i>
            <p>Heading</p>
        </div>

    )
}   