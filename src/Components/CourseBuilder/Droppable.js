import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
  });
 
  
  
  return (
    <div ref={setNodeRef} className='item' >
      {props.children}
    </div>
  );
}