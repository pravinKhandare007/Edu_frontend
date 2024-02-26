import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from './Item';
import axios from 'axios';

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function deleteContent() {
    if (props.element.type === 'Image') {
      if (props.element.data.imgData) {
        if (props.imagesArray.some(obj => obj.id === props.element.id)) {
          //if image data is present and image is in imagesArray that means image was not saved in backend simply delete the image from frontend
          //array.some returns a boolean value.
          //also update the imageIdArray for that component
          props.setImagesArray((imagesArray) => {
            return imagesArray.filter(imageObj => imageObj.id !== props.element.id);
          });
          props.setSlidesData((slidesData) => {
            const newSlidesData = {
              ...slidesData, slides: [...slidesData.slides.map((slide) => {
                if (slide.id === props.slideId) {
                  return {
                    id: slide.id,
                    content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
                  }
                } else {
                  return { ...slide }
                }
              })]
            }
            return newSlidesData;
          });
          props.setImageIdArray((imageIdArray) => {
            return imageIdArray.filter(id => id !== props.element.id);
          })
        } else {
          //we dont need to setImagesArray to null because imagesArray only contins images that have not been saved.
          //the image is in s3 bucket need to make delete API call
          console.log("props.element.id", props.element.id);
          axios.delete('http://localhost:3001/api/delete-image', {
            data: {
              key: props.element.id
            }
          }).then((response) => {
            if (response.data.message === 'deleted successfully') {
              //also set slides data as well
              props.setSlidesData((slidesData) => {
                const newSlidesData = {
                  ...slidesData, slides: [...slidesData.slides.map((slide) => {
                    if (slide.id === props.slideId) {
                      return {
                        id: slide.id,
                        content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
                      }
                    } else {
                      return { ...slide }
                    }
                  })]
                }
                return newSlidesData;
              });
              props.setImageIdArray((imageIdArray) => {
                return imageIdArray.filter(id => id !== props.element.id);
              })
            }
          })
        }

      } else {
        props.setSlidesData((slidesData) => {
          const newSlidesData = {
            ...slidesData, slides: [...slidesData.slides.map((slide) => {
              if (slide.id === props.slideId) {
                return {
                  id: slide.id,
                  content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
                }
              } else {
                return { ...slide }
              }
            })]
          }
          return newSlidesData;
        });
      }
    } else if (props.element.type === 'Quiz') {
      //if image is uploaded then do futher processing if image was not uploaded directlt delete the component
      if (props.element.data.imageData.image) {
        //this means that image is there check if it is in s3 bucket or not 
        if (props.imagesArray.some(imageObj => imageObj.id === props.element.id)) {
          //means image was not saved to s3 bucket
          //just delete the component and image object from imagesArray 
          props.setImagesArray((imagesArray) => {
            return imagesArray.filter(imageObj => imageObj.id === props.element.id);
          });
          props.setSlidesData((slidesData) => {
            const newSlides = slidesData.slides.map((slide) => {
              if (slide.id === props.slideId) {
                return {
                  ...slide, content: slide.content.filter(contentObj => contentObj.id !== props.element.id)
                }
              } else {
                return slide;
              }
            })
            return { slides: newSlides }
          })
        } else {
          //means image is saved to s3 bucket delete it and remove it from frontend 
          axios.delete('http://localhost:3001/api/delete-image', {
            data: {
              key: props.element.id
            }
          }).then((response) => {
            if (response.data.message === 'deleted successfully') {
              //also set slides data as well
              props.setSlidesData((slidesData) => {
                const newSlidesData = {
                  ...slidesData, slides: [...slidesData.slides.map((slide) => {
                    if (slide.id === props.slideId) {
                      return {
                        id: slide.id,
                        content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
                      }
                    } else {
                      return { ...slide }
                    }
                  })]
                }
                return newSlidesData;
              });
            }
          })
        }
      } else {
        //simply delete the component
        props.setSlidesData((slidesData) => {
          const newSlidesData = {
            ...slidesData, slides: [...slidesData.slides.map((slide) => {
              if (slide.id === props.slideId) {
                return {
                  id: slide.id,
                  content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
                }
              } else {
                return { ...slide }
              }
            })]
          }
          return newSlidesData;
        });
      }
    } else {
      //for all the content other than image and quiz hmm....
      console.log("last condition")
      props.setSlidesData((slidesData) => {
        const newSlidesData = {
          ...slidesData, slides: [...slidesData.slides.map((slide) => {
            if (slide.id === props.slideId) {
              return {
                id: slide.id,
                content: [...slide.content.filter((contentObj) => contentObj.id !== props.element.id)]
              }
            } else {
              return { ...slide }
            }
          })]
        }
        return newSlidesData;
      });
    }
    props.setIsSorted((isSorted) => !isSorted);//why is this state here?
    props.setIsDataSaved(false);
  }

  return (
    <Item ref={setNodeRef} style={style} >
      <div className='drag_activator' {...attributes} {...listeners}><i class="fa-solid fa-grip-lines-vertical"></i></div>
      <div style={{ width: "100%" }}>{props.children}</div>
      {
        props.selectedQuizId ? null : (<div><i onClick={deleteContent} style={{ cursor: "pointer" }} className="fa-regular fa-circle-xmark"></i></div>)
      }
    </Item>
  );
}