import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item } from "./Item";

export default function SortableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    function removeElement(){
        console.log("delete called");

        props.setFinalCourseData((finalCourseData)=>{
            return finalCourseData.filter(element => element.id !== props.id);
        })
        // props.setFinalCourseData((finalCourseData)=>{
        //     const newFinalCourseData = [...finalCourseData];
        //     const index = newFinalCourseData.findIndex(element => element.id === props.id);
        //     newFinalCourseData[index] =
        // })
    }
    return (
        <Item ref={setNodeRef} style={style} className="def">
            <div style={{ textAlign: "center",padding:"10px"}}><i  {...attributes} {...listeners} style={{ cursor: "pointer"}} className="fa-solid fa-grip-lines-vertical"></i></div>
            <div style={{ width: "100%" }} className={"default"}>{props.children}</div>
            <div><i className="fa-regular fa-circle-xmark" onClick={removeElement} style={{cursor:"pointer"}}></i></div>
            
        </Item>
    )
}