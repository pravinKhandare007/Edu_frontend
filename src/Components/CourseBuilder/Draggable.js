import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export function Draggable(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'Text',
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    // <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
    //   Text Field
    // </button>
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className='text'>
      <i  className="fa-regular fa-pen-to-square" ></i>
      <p>Text</p>
    </div>
    
    // <AiOutlineFileText  ref={setNodeRef} style={style} {...listeners} {...attributes} className='text'></AiOutlineFileText>
  );
}