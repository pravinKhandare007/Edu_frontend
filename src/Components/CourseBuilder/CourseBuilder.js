import React, { useEffect, useRef, useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Droppable } from './Droppable';
import { Draggable } from './Draggable';
import './CourseBuilder.css';
import Heading from './Heading';
import Image from './Image';
import { arrayMove, rectSortingStrategy, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from './SortableItem';
import Video from './Video';
import Editor from './Editor';
import { Item } from './Item';
// import 'react-image-crop/dist/ReactCrop.css';
import { Resizable } from "react-resizable";
import 'react-resizable/css/styles.css';
//react-list draggable list

let nextId = 1; 
export default function CourseBuilder() {
  console.log("app re-render started");
  const [finalCourseData, setFinalCourseData] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    console.log(finalCourseData);
  })

  function handleOnChange(e, index) {
    console.log("handleOnChange called , its for heading");
    const updatedCourseData = [...finalCourseData]; // Create a copy of the state array
    updatedCourseData[index] = { ...updatedCourseData[index], content: e.target.value }; // Update the specific element in the copied array
    setFinalCourseData(updatedCourseData); // Update the state with the new array
  }

  function handleImageChange(event, index, id) {
    console.log("handleImageChange called");   //sdfsdfsdf
    const newFinalCourseData = [...finalCourseData];
    newFinalCourseData[index].content = event.target.files[0];
    setFinalCourseData(newFinalCourseData);
  }

  //pravin branch
  function handleDragStart(e) {
    console.log("handleDragStart for sort called");
    const { active } = e;
    setActiveId(active.id);
  }

  function sortEnd(event) {
    console.log("sortEnd called");
    setActiveId(null);
    console.log("data before sort end: ", finalCourseData);
    // console.log(event);
    const { active, over } = event;
    if (active && over) {
      console.log(over.id);
      if (active.id !== over.id) {
        setFinalCourseData((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const arr = arrayMove(items, oldIndex, newIndex);
          console.log("after sort end: ", arr);
          return arr;
        });
      }
    }
  }

  function handleDragEnd(event) {
    console.log("handeDragEnd called");
    if (event.over && event.over.id === 'droppable') {
      if (event.active.id === 'Text') {
        const newFinalCourseData = [...finalCourseData, { id: nextId++, type: event.active.id, content: "" }];
        setFinalCourseData(newFinalCourseData);
      }
      if (event.active.id === 'Heading') {
        const newFinalCourseData = [...finalCourseData, { id: nextId++, type: event.active.id, content: "" }];
        setFinalCourseData(newFinalCourseData);
      }
      if (event.active.id === 'Image') {
        const newFinalCourseData = [...finalCourseData, { id: nextId++, type: event.active.id, content: "", width: 500, height: 500 }];
        setFinalCourseData(newFinalCourseData);
      }
    }
    if (event.over === null) return;
  }

  function resizeHandler(event , index , node , size , handle){
    console.log("event object passed to resize handler: ", event);
    // setState((state) => {
    //     const newState = { ...state, width: size.width, height: size.height };
    //     return newState;
    // })
    setFinalCourseData((finalCourseData)=>{
      const newFinalCourseData = [...finalCourseData];
      newFinalCourseData[index] = {...newFinalCourseData[index] , width: size.width , height: size.height};
      return newFinalCourseData;
    })
}

  return (
    <DndContext onDragEnd={handleDragEnd} >
      <div>
        <h1 style={{ textAlign: "center" , fontFamily:"Montserrat" ,color:"#2F4F4F" }}>Course Builder</h1>
      </div>
      {/* <hr style={{margin:"0"}}></hr> */}
      <div className='drag_drop_container'>
        <div style={{width:"15%" , }}>
          <ul style={{margin:"0" , listStyle:"none" , padding:"0"}}>
            <li><span style={{display:"block" , width:"100%" , border:"1px solid rgb(196, 195, 195)" , color:"#696969" , padding:"0.5em" ,fontFamily:"Montserrat"}}>Term</span></li>
            <li><span style={{display:"block" , width:"100%" , border:"1px solid rgb(196, 195, 195)" , color:"#696969", padding:"0.5em" , borderTop:"none",fontFamily:"Montserrat"}}>Chapter</span></li>
            <li><span style={{display:"block" , width:"100%" , border:"1px solid rgb(196, 195, 195)" , color:"#696969", padding:"0.5em", borderTop:"none",fontFamily:"Montserrat"}}>Section</span></li>
            <li><span style={{display:"block" , width:"100%" , border:"1px solid rgb(196, 195, 195)" , color:"#696969", padding:"0.5em", borderTop:"none",fontFamily:"Montserrat"}}>Quiz</span></li>
          </ul>
        </div>
        <Droppable>
          <DndContext onDragStart={handleDragStart} onDragEnd={sortEnd}>
            <SortableContext items={finalCourseData} strategy={verticalListSortingStrategy}>
              {
                finalCourseData ? (
                  finalCourseData.map((element, index) => {
                    if (element.type === 'Text') {
                      return (<SortableItem id={element.id} key={index} setFinalCourseData={setFinalCourseData}>
                        <Editor finalCourseData={finalCourseData} setFinalCourseData={setFinalCourseData} index={index} content={element.content} />
                      </SortableItem>)
                    }
                    if (element.type === 'Heading') {
                      return (<SortableItem id={element.id} key={index} setFinalCourseData={setFinalCourseData}>
                        <div className='question_form'>
                          <div className='section'>
                            <div className='question_title_section'>
                              <div className='question_form_top'>
                                <input type='text' value={element.content} onChange={(e) => { handleOnChange(e, index) }} placeholder='Heading...' className='question_form_top_name'></input>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SortableItem>)
                    }
                    if (element.type === 'Image') {
                      console.log("app id: ", element.id);
                      return (
                        <SortableItem id={element.id} key={index} setFinalCourseData={setFinalCourseData}>
                          {/* <div style={element.content ? { width: "100%", height: "300px" } : null}>
                            {element.content ? <img src={URL.createObjectURL(element.content)} className='upload_image'></img> : null}
                          </div> */}
                          {element.content ? (
                            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                              <Resizable
                                width={element.width}
                                height={element.height}
                                onResize={(event , {node , size , handle })=>{resizeHandler(event , index , node , size , handle )}}
                                maxConstraints={[600, 600]}
                              >
                                <div className="box" style={{ width: `${element.width}px`, height: `${element.height}px`}}>
                                  <span style={{ width: `${element.width}px`, height: `${element.height}px`, display: "block" }}><img src={URL.createObjectURL(element.content)} style={{ width: '100%', height: '100%' }}></img></span>
                                </div>
                              </Resizable>
                            </div>
                          ) : null}
                          {element.content ? null : <div><label for={`${element.id}`} style={{ width: "100%", height: "50px", textAlign: "center", display: "block", border: "1px dotted grey" }}>upload image</label></div>}
                          <input type='file' accept='image/*' id={`${element.id}`} onChange={(event) => handleImageChange(event, index, element.id)} style={{ display: "none" }}></input>
                        </SortableItem>
                      )
                    }
                  })
                ) : null
              }
              <div style={{ display: "flex", alignItems: "center", height: "100px" }}><i className="fa-solid fa-plus" style={{ color: "grey" }}></i></div>
            </SortableContext>
            <DragOverlay>
              {activeId ? <Item id={activeId}><i className="fa-solid fa-sort" style={{ fontSize: "30px" }}></i></Item> : null}
            </DragOverlay>
          </DndContext>

        </Droppable>
        <div style={{width:"15%" , border:"1px solid rgb(196, 195, 195)"}}>
          <div style={{padding:"1em", borderBottom:"1px solid rgb(196, 195, 195)" , fontFamily:"Montserrat" , color:"		#696969"}}>
            WIDGETS
          </div>
          <div className='draggable_container' >
              <Heading/>
              <Draggable/>
              <Image/>
              <Video/>
          </div>

        </div>
      </div>
    </DndContext>
  );

}
