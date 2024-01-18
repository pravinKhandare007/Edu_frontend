import { useEffect, useState } from 'react';
import { useQuill } from 'react-quilljs';
import BlotFormatter from 'quill-blot-formatter';
import 'quill/dist/quill.snow.css';

const Editor = ({finalCourseData , setFinalCourseData , id }) => {
  const [editorContents , setEditorContents] = useState("");
  const { quill, quillRef, Quill } = useQuill({
    modules: { blotFormatter: {} , toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        ['image', 'video'],
        ['clean']
      ]}
  });

  if (Quill && !quill) {
    // const BlotFormatter = require('quill-blot-formatter');
    Quill.register('modules/blotFormatter', BlotFormatter);
  }

  useEffect(() => {
    
    if (quill) {
      
      if(finalCourseData[id]){
        quill.root.innerHTML = finalCourseData[id].content;
      }
      
      quill.on('text-change', (delta, oldContents) => {
        quill.clipboard.dangerouslyPasteHTML();
        // console.log('Text change!');
        // console.log("delta:" ,delta);
        // console.log(quill.root.innerHTML);
        // console.log(editorContents);
        setEditorContents(quill.root.innerHTML);
        setFinalCourseData((prev)=>{
          const newFinalCourseData = prev.map((element)=>{
            if(id === element.id){
              return {...element , content:quill.root.innerHTML};
            }
            else{
              return element;
            }
          })
          return newFinalCourseData;
        })
        // let currrentContents = quill.getContents();
        // console.log(currrentContents.diff(oldContents));
      });
    }
  }, [quill, Quill,finalCourseData]);

  return (
    <div>
      <div ref={quillRef} />
    </div>
  );
};

export default Editor;
