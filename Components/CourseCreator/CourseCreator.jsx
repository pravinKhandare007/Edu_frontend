import React, { useEffect, useState } from 'react';
import './CourseCreator.css'
import Heading from './DraggableItems/Heading';
import Text from './DraggableItems/Text';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Droppable } from './Droppable';
import Pagination from '../Pagination/Pagination';
import Image from './DraggableItems/Image';
import Video from './DraggableItems/VideoDraggable';
import { SortableItem } from './SortableItem/SortableItem';
import { Item } from './SortableItem/Item';
import Editor from './Editor_Component/Editor';
import QuizDraggable from './DraggableItems/QuizDraggable';
import VideoComponent from './Video_Component/VideoComponent';
import { v4 as uuidv4 } from 'uuid';
import McqComponent from './MCQ_Component/McqComponent';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Resizable } from 're-resizable';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import SaveDataModal from '../SideBar/SaveDataModal';
import { Tooltip } from "react-tooltip";
import DeleteSlideModal from './DeleteSlideModal';

const CourseCreator = ({ selectedSectionId, selectedChapterId, selectedSemId, mainCourseData, setMainCourseData, selectedQuizId, setSlideId,
    slideId, type, isDeleted, showPreview, setShowPreview, setPreviewIds, setIsDataSaved, courseInfo, setShowSaveDataModal,
    showSaveDataModal, isDataSaved, setImagesArray, imagesArray, fetchedImageIdArray, setFetchedImageIdArray }) => {

    //console.log('rendering course creator');
    //console.log("mcd set by sidebar" , mainCourseData);  

    //to store the imformation of which images are fetched already do not fetch them again
    const [imageIdArray, setImageIdArray] = useState([]) //used to map image to a semester,chapter,section,chapterTest or semesterTest.
    const [activeId, setActiveId] = useState(null);
    const [currentSlideId, setCurrentSlideId] = useState(null); // will contain the id of the current slide
    const [showDeleteSlideModal, setShowDeleteSlideModal] = useState(false);
    //rename slidesData
    //api we need to send sectionID and body -- sildesData.
    //sample api endpoint = /api/section/:sectionId 
    //api body = slidesData

    const [slidesData, setSlidesData] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [numberOfQuestionToShow, setNumberOfQuestionToShow] = useState(0);
    const [isDragging, setIsDragging] = useState("");
    const [loadingImage, setLoadingImage] = useState(false);
    const firstSlide = {
        id: uuidv4(), content: []
    }
    //below state is need to re-render nested components when sorting happens 
    const [isSorted, setIsSorted] = useState(false);
    const notify = () => toast.success("semester successfully saved !!");
    const location = useLocation();
    //console.log("slides data after section click", slidesData);
    function getDataFromParent(semId, chapId, secId, quizId) {

        const semester = mainCourseData?.semesters ? mainCourseData['semesters'].find(semObj => semObj.id === semId) : null
        const chapter = semester ? semester['chapters'].find(chapObj => chapObj.id === chapId) : null
        const section = chapter ? chapter['sections'].find(sectionObj => sectionObj.id === secId) : null
        const chapterTest = chapter?.chapterTest ? chapter['chapterTest'].find(chapterTestObj => chapterTestObj.id === quizId) : null
        const semesterTest = semester?.semesterTest ? semester['semesterTest'].find(semesterTestObj => semesterTestObj.id === quizId) : null
        //executed after deletion of a semester or chapter , section
        if (!semester || !chapter || !section || !chapterTest || !semesterTest) {
            setSlidesData(null);
            setCurrentSlideId(null);
            setImageIdArray([]);
        }
        if (type === 'semesters') {
            if (semester) {
                setSlidesData(semester?.content ? semester.content : { slides: [firstSlide] });
                setCurrentSlideId(semester.content ? semester.content.slides[0].id : firstSlide.id);
                setImageIdArray(semester.imageIdArray ? semester.imageIdArray : []);
            }
        }
        if (type === 'chapters') {
            if (chapter) {
                setSlidesData(chapter.content ? chapter.content : { slides: [firstSlide] });
                setCurrentSlideId(chapter.content ? chapter.content.slides[0].id : firstSlide.id);
                setImageIdArray(chapter.imageIdArray ? chapter.imageIdArray : []);
            };
        }
        if (type === 'sections') {
            //console.log("section clicked")
            if (section) {
                setSlidesData(section.content ? section.content : { slides: [firstSlide] });
                setCurrentSlideId(section.content ? section.content.slides[0].id : firstSlide.id);
                setImageIdArray(section.imageIdArray ? section.imageIdArray : []);
            }
        }
        if (type === 'chapterTest') {
            if (chapterTest) {
                setSlidesData(chapterTest.content ? chapterTest.content : { slides: [{ id: uuidv4(), content: [{ id: uuidv4(), type: "Quiz", data: null }] }] })
                setCurrentSlideId(chapterTest.content ? chapterTest.content?.slides[0].id : firstSlide.id);
                setNumberOfQuestionToShow(chapterTest.numberOfQuestions ? chapterTest.numberOfQuestions : 0);
                setTimeLimit(chapterTest.timeLimit ? chapterTest.timeLimit : null);
                setImageIdArray(chapterTest.imageIdArray ? chapterTest.imageIdArray : []);
            }
        }
        if (type === 'semesterTest') {
            if (semesterTest) {
                //console.log('inside get data from parent of semesterTest' , semesterTest);
                setSlidesData(semesterTest.content ? semesterTest.content : { slides: [{ id: uuidv4(), content: [{ id: uuidv4(), type: "Quiz", data: null }] }] })
                setCurrentSlideId(semesterTest.content ? semesterTest.content.slides[0].id : firstSlide.id);
                //console.log("semesterTest.content.slides[0].id" , semesterTest.content.slides[0].id);
                setNumberOfQuestionToShow(semesterTest.numberOfQuestions ? semesterTest.numberOfQuestions : 0);
                setTimeLimit(semesterTest.timeLimit ? semesterTest.timeLimit : null);
                setImageIdArray(semesterTest.imageIdArray ? semesterTest.imageIdArray : []);
            }
        }
    }

    function setDataToParent(semId, chapId, secId, quizId) {
        if (!mainCourseData) {
            return;
        }
        if (type === 'semesters') {
            setMainCourseData((mainCourseData) => {
                const newMainCourseData = {
                    ...mainCourseData, semesters: mainCourseData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, content: slidesData, imageIdArray: imageIdArray
                            }
                        } else {
                            return {
                                ...semester
                            }
                        }
                    })
                }
                return newMainCourseData;
            })
        }
        if (type === 'chapters') {
            setMainCourseData((mainCourseData) => {
                const newMainCourseData = {
                    ...mainCourseData, semesters: mainCourseData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, chapters: semester.chapters.map((chapter) => {
                                    if (chapter.id === chapId) {
                                        return {
                                            ...chapter, content: slidesData, imageIdArray: imageIdArray
                                        }
                                    } else {
                                        return {
                                            ...chapter
                                        }
                                    }
                                })
                            }
                        } else {
                            return {
                                ...semester
                            }
                        }
                    })
                }
                return newMainCourseData;
            })
        }
        if (type === "sections") {
            setMainCourseData((mainCourseData) => {
                return {
                    ...mainCourseData, semesters: [...mainCourseData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, chapters: [...semester.chapters.map((chapter) => {
                                    if (chapter.id === chapId) {
                                        return {
                                            ...chapter, sections: [...chapter.sections.map((section) => {
                                                if (section.id == secId) {
                                                    return {
                                                        ...section, content: slidesData, imageIdArray: imageIdArray
                                                    }
                                                } else {
                                                    return { ...section }
                                                }
                                            })]
                                        }
                                    } else {
                                        return { ...chapter }
                                    }
                                })]
                            }
                        } else {
                            return { ...semester }
                        }
                    })]
                }
            })
        }
        if (type === "chapterTest") {
            setMainCourseData({
                semesters: mainCourseData.semesters.map((semester) => {
                    if (semester.id === semId) {
                        return {
                            ...semester, chapters: semester.chapters.map((chapter) => {
                                if (chapter.id === chapId) {
                                    return {
                                        ...chapter, chapterTest: chapter.chapterTest.map((q) => {
                                            if (q.id === quizId) {
                                                return {
                                                    ...q, content: slidesData, timeLimit: timeLimit, numberOfQuestions: numberOfQuestionToShow, imageIdArray: imageIdArray
                                                }
                                            } else {
                                                return {
                                                    ...q
                                                }
                                            }
                                        })
                                    }
                                } else {
                                    return {
                                        ...chapter
                                    }
                                }
                            })
                        }
                    } else {
                        return {
                            ...semester
                        }
                    }
                })
            })
        }
        if (type === "semesterTest") {
            setMainCourseData({
                semesters: mainCourseData.semesters.map((semester) => {
                    if (semester.id === semId) {
                        return {
                            ...semester, semesterTest: semester.semesterTest.map((q) => {
                                if (q.id === quizId) {
                                    return {
                                        ...q, content: slidesData, timeLimit: timeLimit, numberOfQuestions: numberOfQuestionToShow, imageIdArray: imageIdArray
                                    }
                                } else {
                                    return {
                                        ...q
                                    }
                                }
                            })
                        }
                    } else {
                        return {
                            ...semester
                        }
                    }
                })
            })
        }
    }

    useEffect(() => {
        getDataFromParent(selectedSemId, selectedChapterId, selectedSectionId, selectedQuizId);
    }, [selectedSectionId, selectedSemId, selectedChapterId, selectedQuizId, isDeleted])

    useEffect(() => {
        setDataToParent(selectedSemId, selectedChapterId, selectedSectionId, selectedQuizId);
    }, [slidesData, timeLimit, numberOfQuestionToShow, imageIdArray])

    useEffect(() => {
        if (slidesData) {
            const slideArray = slidesData.slides.filter(slide => slide.id === currentSlideId);
            slideArray[0].content.forEach((contentObj) => {
                if (contentObj.type === 'Image' && !fetchedImageIdArray.includes(contentObj.id) && contentObj.data.imgData) {
                    setLoadingImage(true);
                }
            })
        }
    }, [currentSlideId])

    // useEffect(()=>{
    //     axios.get('http://localhost:3001/api/fetch-course-creator-data' , {
    //         params: {
    //             courseId: courseId,
    //             semesterId:semesterId, 
    //             chapterId:chapterId , 
    //             semesterTestId:semesterTestId,
    //             sectionId:sectionId,
    //             chapterTestId:chapterTestId
    //         }
    //     })
    //     .then((response)=>{
    //         //console.log(response.data);
    //         if(response.data.status === 'initial mount'){
    //             setSlidesData(null);
    //         }
    //         else if(response.data.status === 'no data'){
    //             //no content is there set the sildes data to an empty slide 
    //             setSlidesData({
    //                 slides:[
    //                     firstSlide
    //                 ]
    //             });
    //             setCurrentSlideId(firstSlide.id);
    //         }else{
    //             setSlidesData(response.data.content);
    //             setCurrentSlideId(response.data.content?.slides[0].id);
    //         }

    //     })
    // },[location.pathname])
    // useEffect(() => {
    //     getDataFromParent(selectedSemId, selectedChapterId, selectedSectionId, selectedQuizId);
    // }, [selectedSectionId, selectedSemId, selectedChapterId, selectedQuizId, isDeleted])

    // useEffect(() => {
    //     setDataToParent(selectedSemId, selectedChapterId, selectedSectionId, selectedQuizId);
    // }, [slidesData, timeLimit, numberOfQuestionToShow])

    //below useEffect stores currentSlideId value into parent so when user goes into preview we can show that exact slide in preview as well 

    useEffect(() => {
        setSlideId(currentSlideId);
    }, [currentSlideId])
    //below useEffect is used to set the currentSlideId to the id it was before going into preview

    useEffect(() => {
        if (slideId) {
            setCurrentSlideId(slideId);
        }
    }, [])

    function handleDragStart(event) {
        //console.log("drag start", event);
        //based on this we render the required overlay
        setIsDragging(event.active.id);
    }

    function handleSortEnd(event, currentSlideId) {
        //console.log("sort start", event);
        if (event.over === null) return;
        const { active, over } = event;
        setSlidesData((slidesData) => {
            const newSlidesData = { ...slidesData };

            const oldIndex = slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content.findIndex(contentObject => contentObject.id === active.id);
            const newIndex = slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content.findIndex(contentObject => contentObject.id === over.id);
            //arrayMove is provided by DnD kit sortable library 
            const newContent = arrayMove(slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content, oldIndex, newIndex);
            //we changed the arrangement and then set the parent state
            newSlidesData.slides = newSlidesData.slides.map((slide) => {
                if (slide.id === currentSlideId) {
                    return {
                        id: slide.id,
                        content: newContent
                    }
                } else {
                    return { ...slide }
                }
            })
            //console.log("after sort end: ", newSlidesData);
            return newSlidesData;
        })
        setActiveId(null);
        setIsSorted(!isSorted);
        setIsDataSaved(false);
    }

    function handleDragEnd(event) {
        //console.log("drag end", event)
        setIsDragging(null);
        if (event.over === null) return;
        //the droppable component is passed the silde Id i.e which slide we are currenty on 
        //we compare that id with the id's of all the slides in the parent state and update the content when matched
        if (event.over && event.over.id !== null) {
            const newSlides = slidesData.slides.map((slide) => {
                if (event.over.id === slide.id) {
                    //update the content of that slide 
                    return {
                        id: slide.id,
                        content: [...slide.content, { id: uuidv4(), type: event.active.id, data: event.active.id === "Image" ? { imgData: '', width: '800px', height: '500px' } : "" }]
                    }
                } else {
                    return slide;
                }
            })

            setSlidesData((slidesData) => {
                const newSlidesData = { ...slidesData, slides: newSlides };
                //console.log(newSlidesData);
                return newSlidesData;
            });

            //console.log("dropped on ", event.over.id);
        }
    }

    function addSlide() {
        const newSlideId = uuidv4();
        setSlidesData((slidesData) => {
            const newSlidesData = { ...slidesData, slides: [...slidesData.slides, { id: newSlideId, content: [] }] }
            return newSlidesData;
        })
        setCurrentSlideId(newSlideId);
        //console.log("add slide slidesData, ", slidesData);
        //setCurrentSlideId(slideId);
    }

    function handleSortStart(event) {
        const { active } = event;
        setActiveId(active.id)
        //console.log("sort end", event)
    }

    function paginate(id) {
        setCurrentSlideId(id);
    }
    //takes slide id and content id ,adds e.target.value to the data property
    function handleOnChange(e, contentId, id) {
        //console.log("handleOnChange called , its for heading");
        setSlidesData((slidesData) => {
            const newSlidesData = {
                ...slidesData, slides: [...slidesData.slides.map((slide) => {
                    if (slide.id === id) {
                        //console.log("slide.slideId: ", slide.id);
                        return {
                            id: slide.id,
                            content: [...slide.content.map((contentObject) => {
                                if (contentObject.id === contentId) {
                                    return {
                                        id: contentObject.id,
                                        type: contentObject.type,
                                        data: e.target.value
                                    }
                                }
                                return {
                                    ...contentObject
                                }
                            })]
                        }
                    } else {
                        return { ...slide }
                    }
                })]
            }
            return newSlidesData;
        })
    }

    function handleImageChange(event, slideId, contentId) {
        const image = event.target.files[0];
        const url = URL.createObjectURL(image);
        //console.log("---------------------------image onChange start---------------------------------------");
        setFetchedImageIdArray((fetchedImageIdArray) => {
            const newFetchedImageIdArray = [...fetchedImageIdArray];
            newFetchedImageIdArray.push(contentId);
            //console.log("fetchedImageIdArray", newFetchedImageIdArray);
            return newFetchedImageIdArray;
        })
        setImageIdArray((imageIdArray) => {
            const newImageIdArray = [...imageIdArray];
            newImageIdArray.push(contentId);
            //console.log("ImageIdArray", newImageIdArray);
            return newImageIdArray;
        });
        setImagesArray((imagesArray) => {
            //console.log("called setImages")
            const newImagesArray = imagesArray;
            newImagesArray.push({ id: contentId, data: image });
            //console.log("ImagesArray", newImagesArray);
            return newImagesArray;
        })
        setSlidesData((slidesData) => {
            const newSlidesData = {
                ...slidesData, slides: [...slidesData.slides.map((slide) => {
                    if (slide.id === slideId) {
                        //console.log("slide.slideId: ", slide.id);
                        return {
                            id: slide.id,
                            content: [...slide.content.map((contentObject) => {
                                if (contentObject.id === contentId) {
                                    return {
                                        id: contentObject.id,
                                        type: contentObject.type,
                                        data: { ...contentObject.data, imgData: url }
                                    }
                                }
                                return {
                                    ...contentObject
                                }
                            })]
                        }
                    } else {
                        return { ...slide }
                    }
                })]
            }
            //console.log("slidesData", newSlidesData);
            return newSlidesData;
        })
        //console.log("---------------------------------------image onchange finish--------------------------------------------")
    }

    function addQuestion() {
        const newSlideId = uuidv4();
        setSlidesData((slidesData) => {
            const newSlidesData = {
                ...slidesData, slides: [...slidesData.slides, {
                    id: newSlideId, content: [{
                        id: uuidv4(), type: "Quiz", data: null
                    }]
                }]
            }
            return newSlidesData;
        })
        setCurrentSlideId(newSlideId);
        //console.log("add slide slidesData, ", slidesData);
    }

    function handleResize(e, d, ref, delta, element) {
        setSlidesData({
            ...slidesData, slides: slidesData.slides.map((slide) => {
                if (slide.id === currentSlideId) {
                    return {
                        ...slide, content: slide.content.map((obj) => {
                            if (obj.id === element.id) {
                                return {
                                    ...obj, data: {
                                        ...obj.data, width: ref.style.width,
                                        height: ref.style.height,
                                    }
                                }
                            } else {
                                return {
                                    ...obj
                                }
                            }
                        })
                    }
                } else {
                    return {
                        ...slide
                    }
                }
            })
        })
    }

    function handleSaveCourse() {
        try {
            // const courseId = localStorage.getItem('courseId');
            // const token = localStorage.getItem("auth");
            const formdata = new FormData();
            //another branchgit 
            imagesArray.forEach((imageObject, index) => {
                formdata.append('images', imageObject.data);
                //console.log(imageObject, imageObject.data, imageObject.id);
                formdata.append(`ids`, imageObject.id);
            });

            const semesterData = JSON.stringify(mainCourseData);
            formdata.append('semesterData', semesterData);
            //console.log("form data ", formdata);
            axios.post('http://localhost:3001/api/save-course', formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => { //need to change the response and check for success message 
                    //console.log('course saved' , response);
                    if (response.data.status === 'success') {
                        setIsDataSaved(true);
                        setImagesArray([]);
                        notify();
                    }
                })
        } catch (error) {
            //console.log('error saving the course')
        }
    }

    async function getImage(imgId, currentSlideId) {

        //console.log('sdfsadfsafsadf ', imgId);
        await axios.get('http://localhost:3001/api/get-image', {
            params: {
                imageId: imgId
            }
        }).then((response) => {
            setLoadingImage(false);
            setFetchedImageIdArray((fetchedImageIdArray) => {
                fetchedImageIdArray.push(imgId);
                return fetchedImageIdArray;
            })
            setSlidesData((slidesData) => {
                const newSlidesArray = slidesData.slides.map((slide) => {
                    if (slide.id === currentSlideId) {
                        return {
                            ...slide, content: slide.content.map((contentObj) => {
                                if (contentObj.id === imgId) {
                                    return {
                                        ...contentObj, data: { ...contentObj.data, imgData: response.data.dataUrl }
                                    }
                                } else {
                                    return contentObj;
                                }
                            })
                        }
                    } else {
                        return slide;
                    }
                })
                return { slides: newSlidesArray }
            })
            //loading false
        })
    }

    function handleImagesWhenSlideIsDeleted(newlyAddedImagesArray, imagesToBeDeletedFromS3Bucket) {
        if (newlyAddedImagesArray.length !== 0) {
            //update the mapping and remove from imagesArray
            setImageIdArray((imageIdArray) => {
                return imageIdArray.filter(imageId => !newlyAddedImagesArray.includes(imageId));
            });
            setImagesArray((imagesArray) => {
                return imagesArray.filter(imageObj => !newlyAddedImagesArray.includes(imageObj.id));
            });
        }
        if (imagesToBeDeletedFromS3Bucket.length !== 0) {
            const stringImageIdArray = JSON.stringify(imagesToBeDeletedFromS3Bucket);
            axios.post('http://localhost:3001/api/delete-image-bulk', {
                imageIdArray: imagesToBeDeletedFromS3Bucket
            }).then((response) => {
                if (response.data.status === 'success') {
                    //remove the images ids from the mapping
                    setImageIdArray((imageIdArray) => {
                        return imageIdArray.filter(imageId => !imagesToBeDeletedFromS3Bucket.includes(imageId));
                    });
                }
            })
        }
    }

    function deleteSlide() {
        //we have global variables slidesData , currentSlideId , imagesArray , fetchedImageIdArray , imageIdArray
        //if there is only one slide and has no content then delete the slide but immediatly add a new one and set currentSlideId to the new id of the new slide 
        //or if there is only one slide then dont show the delete button 
        //lets go with the latter  
        //lets say there is no image present in the slide then we can delete it directly 
        const currentSlide = slidesData.slides.filter(slide => slide.id === currentSlideId)[0];

        let imagesToBeDeletedFromS3Bucket = [];
        let newlyAddedImagesArray = [];
        //checking wether there are images in the slide 
        currentSlide.content.forEach(element => {
            if (element.type === 'Image' && element.data.imgData) {
                //image is present 

                if (!imagesArray.some(imgObj => imgObj.id === element.id)) {
                    //if imagesArray.some(imgObj => imgObj.id === element.id returns true that means iamge is not in s3 bucket
                    //if false that means we have to delete from s3 bucket
                    imagesToBeDeletedFromS3Bucket.push(element.id);
                } else {
                    //image is present but not saved in s3 bucket
                    newlyAddedImagesArray.push(element.id);
                }
            }
            if (element.type === 'Quiz' && element.data.imageData.image) {
                if (!imagesArray.some(imgObj => imgObj.id === element.id)) {
                    //if imagesArray.some(imgObj => imgObj.id === element.id returns true that means iamge is not in s3 bucket
                    //if false that means we have to delete from s3 bucket
                    imagesToBeDeletedFromS3Bucket.push(element.id);
                } else {
                    //this means that image is present but was not saved to s3 bucket 
                    //we have to delete this image id from imagesArray and also from fetchImageIdArray
                    //also from the imagesIdArray which is mapping the images to perticular section, chapter or semester.

                    newlyAddedImagesArray.push(element.id);
                }
            }
        });

        if (slidesData.slides.length === 1) {
            //user is deleting the only slide present 
            //create a new slide 
            handleImagesWhenSlideIsDeleted(newlyAddedImagesArray, imagesToBeDeletedFromS3Bucket);
            const newSlide = { id: uuidv4(), content: [] };
            setSlidesData(() => {
                //as there is only one slide that we are deleting just set the slides array to empty slide
                const newSlides = [];
                newSlides.push(newSlide);
                return { slides: newSlides }
            })
            setCurrentSlideId(newSlide.id);
        } else {
            //if user is deleting first slide then move him to the next slide 
            if (slidesData.slides[0].id === currentSlideId) {
                handleImagesWhenSlideIsDeleted(newlyAddedImagesArray, imagesToBeDeletedFromS3Bucket);
                //means he is deleting the first slide and there are many slides
                setSlidesData((slidesData) => {
                    const newSlides = slidesData.slides.filter(slide => slide.id !== currentSlideId);
                    return { slides: newSlides };
                });
                setCurrentSlideId(() => {
                    //when user deletes the slide its only possible to delete a slide when there is more than one slide 
                    const currentSlideIndex = 0;
                    const nextSlideId = slidesData.slides[currentSlideIndex + 1].id;
                    return nextSlideId;
                })
            } else {
                handleImagesWhenSlideIsDeleted(newlyAddedImagesArray, imagesToBeDeletedFromS3Bucket);
                //below code will execute when user is deleting other than the first slide
                setSlidesData((slidesData) => {
                    const newSlides = slidesData.slides.filter(slide => slide.id !== currentSlideId);
                    return { slides: newSlides };
                });
                //how do we get the slide id of the previous slide ??
                setCurrentSlideId(() => {
                    //when user deletes the slide its only possible to delete a slide when there is more than one slide 
                    const currentSlideIndex = slidesData.slides.findIndex(slide => slide.id === currentSlideId);
                    const previousSlideId = slidesData.slides[currentSlideIndex - 1].id;
                    return previousSlideId;
                })
            }
        }
        //how is the data saved that this slide is deleted well they have to click on save
        setIsDataSaved(false);
    }

    return (<>
        <SaveDataModal showSaveDataModal={showSaveDataModal} setShowSaveDataModal={setShowSaveDataModal} handleSaveCourse={handleSaveCourse} />
        <DeleteSlideModal showDeleteSlideModal={showDeleteSlideModal} setShowDeleteSlideModal={setShowDeleteSlideModal} deleteSlide={deleteSlide} />
        {
            slidesData ? (
                <div className='course_creator_container'>
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
                        <div className='slides_container'>
                            <div style={{ padding: "1em 2em" }}>
                                <span><strong>Course Name:</strong>{courseInfo.course_name}</span><br></br>
                                <span><strong>Subject:</strong> {courseInfo.subject_name}</span><br></br>
                                <span><strong>Description:</strong>{courseInfo.course_description ? courseInfo.course_description : 'description not added'}</span>
                            </div>

                            {
                                selectedQuizId &&
                                (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px', gap: '1em' }}>
                                    <span>No. of question to display: <input type='number' style={{ width: '50px' }} value={numberOfQuestionToShow} onChange={(e) => { setIsDataSaved(false); setNumberOfQuestionToShow(parseInt(e.target.value)) }}></input></span>
                                    <span>Time Limit:</span>
                                    <input style={{ width: '50px' }} value={timeLimit ? timeLimit.hours : 0} type='number' onChange={(e) => { setIsDataSaved(false); setTimeLimit((timeLimit) => { return { ...timeLimit, hours: e.target.value } }) }}></input>


                                    <span>Hr</span><input style={{ width: '50px' }} value={timeLimit ? timeLimit.minutes : 0} type='number' onChange={(e) => { setIsDataSaved(false); setTimeLimit((timeLimit) => { return { ...timeLimit, minutes: e.target.value } }) }}></input><span>Minutes</span>
                                </div>)
                            }
                            <div className='slide'>
                                {
                                    <i class="fa-solid fa-trash" onClick={() => { setShowDeleteSlideModal(true) }} id='delete-slide-icon'></i>
                                }
                                {
                                    <Droppable id={currentSlideId} selectedQuizId={selectedQuizId} content={slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content}>
                                        {/* <span style={{ textAlign: "right" }}>slide No: {slidesData.slides.findIndex((slide) => slide.id === currentSlideId) + 1}</span> */}
                                        <DndContext onDragStart={handleSortStart} onDragEnd={(event) => handleSortEnd(event, currentSlideId)}>

                                            <SortableContext items={slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content} strategy={verticalListSortingStrategy}>
                                                {
                                                    slidesData.slides.filter(slide => slide.id === currentSlideId)[0].content.map((element, index) => {
                                                        if (element.type === 'Heading') {
                                                            return <SortableItem setIsDataSaved={setIsDataSaved} imagesArray={imagesArray} setImagesArray={setImagesArray} element={element} key={index} setSlidesData={setSlidesData} slideId={currentSlideId} setIsSorted={setIsSorted}>
                                                                <div className='heading_form_top border p-1'>
                                                                    <input type='text' value={element.data} onChange={(e) => { setIsDataSaved(false); handleOnChange(e, element.id, currentSlideId) }} placeholder='Heading...' className='heading_form_top_name'></input>
                                                                </div>
                                                            </SortableItem>;
                                                        }
                                                        if (element.type === 'Text') {
                                                            return <SortableItem setIsDataSaved={setIsDataSaved} imagesArray={imagesArray} setImagesArray={setImagesArray} element={element} key={index} setSlidesData={setSlidesData} slideId={currentSlideId} setIsSorted={setIsSorted}>
                                                                <Editor slidesData={slidesData} setSlidesData={setSlidesData} data={element.data} slideId={currentSlideId} contentId={element.id} isSorted={isSorted} setIsDataSaved={setIsDataSaved} />
                                                            </SortableItem>;
                                                        }
                                                        if (element.type === 'Image') {
                                                            //element = {id , type , imgData: { w: , h: , image:url // {}  }, }
                                                            // setLoding 
                                                            //getImage(element.id , currentSlideId);
                                                            if (element.data.imgData) {
                                                                if (!fetchedImageIdArray.includes(element.id)) {
                                                                    getImage(element.id, currentSlideId);
                                                                    return;
                                                                }
                                                            }
                                                            if (loadingImage) {
                                                                return (
                                                                    <div class="d-flex justify-content-center">
                                                                        <div class="spinner-border" role="status">
                                                                            <span class="visually-hidden">Loading...</span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                            return <SortableItem setIsDataSaved={setIsDataSaved} imageIdArray={imageIdArray} setImageIdArray={setImageIdArray} imagesArray={imagesArray} setImagesArray={setImagesArray} element={element} key={index} setSlidesData={setSlidesData} slideId={currentSlideId} setIsSorted={setIsSorted}>
                                                                {element.data.imgData ? (
                                                                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                                                        <Resizable
                                                                            size={{
                                                                                width: element.data.width,
                                                                                height: element.data.height
                                                                            }}
                                                                            maxWidth='100%'
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                            }}
                                                                            lockAspectRatio={false}
                                                                            onResizeStop={(e, d, ref, delta) => handleResize(e, d, ref, delta, element)}
                                                                            className='border'
                                                                        >
                                                                            {
                                                                                <img src={element.data.imgData} style={{ height: "100%", width: "100%" }}></img>
                                                                            }
                                                                        </Resizable>
                                                                    </div>
                                                                ) : null}
                                                                {element.data.imgData ? null : <div style={{ width: "100%", height: "150px", textAlign: "center", display: "flex", border: "2px dashed #E5E4E2", borderRadius: '12px', justifyContent: "center", alignItems: "center" }}>
                                                                    <label htmlFor={`${element.id}`} style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', justifyContent: "center", alignItems: "center", flexDirection: 'column' }} ><i style={{ fontSize: '34px', color: '#7393B3' }} className="fa-solid fa-file-image"></i><span style={{ color: "#7393B3" }}>upload image</span></label>
                                                                </div>}
                                                                <input type='file' accept='image/*' id={`${element.id}`} onChange={(event) => { setIsDataSaved(false); handleImageChange(event, currentSlideId, element.id) }} style={{ display: "none" }}></input>
                                                            </SortableItem>;


                                                        }
                                                        if (element.type === 'Video') {
                                                            return (
                                                                <SortableItem setIsDataSaved={setIsDataSaved} imagesArray={imagesArray} setImagesArray={setImagesArray} element={element} key={index} setSlidesData={setSlidesData} slideId={currentSlideId} setIsSorted={setIsSorted}>
                                                                    <VideoComponent slidesData={slidesData} setSlidesData={setSlidesData} slideId={currentSlideId} contentId={element.id} data={element.data} isSorted={isSorted} setIsDataSaved={setIsDataSaved} />
                                                                </SortableItem>
                                                            )
                                                        }
                                                        if (element.type === 'Quiz') {
                                                            console.log('parent data passed to mcq', element.data);
                                                            return (
                                                                <SortableItem setIsDataSaved={setIsDataSaved} imagesArray={imagesArray} setImagesArray={setImagesArray} element={element} key={index} setSlidesData={setSlidesData} slideId={currentSlideId} selectedQuizId={selectedQuizId} setIsSorted={setIsSorted}>
                                                                    <McqComponent setImageIdArray={setImageIdArray} imageIdArray={imageIdArray} imagesArray={imagesArray} setFetchedImageIdArray={setFetchedImageIdArray} fetchedImageIdArray={fetchedImageIdArray} setSlidesData={setSlidesData} slideId={currentSlideId} contentId={element.id} slidesData={slidesData} data={element.data} isSorted={isSorted} setIsDataSaved={setIsDataSaved} setImagesArray={setImagesArray} />
                                                                </SortableItem>
                                                            )
                                                        }
                                                    })
                                                }
                                            </SortableContext>
                                            <DragOverlay>
                                                {activeId ? <Item id={activeId}><i className="fa-solid fa-sort" style={{ fontSize: "30px" }}></i></Item> : null}
                                            </DragOverlay>
                                        </DndContext>
                                    </Droppable>
                                }
                            </div>
                            <div className='pagination_addSlide_container'>
                                <div style={{ position: 'relative' }} className='pagination_container'>
                                    <Pagination slides={slidesData.slides} paginate={paginate} currentSlideId={currentSlideId} setCurrentSlideId={setCurrentSlideId}></Pagination>
                                    {
                                        selectedQuizId ? (<button className='custom-button' style={{ position: 'absolute', top: '5px', right: '20px' }} onClick={() => addQuestion()}>Add Question</button>) :
                                            (<button className='custom-button' style={{ position: 'absolute', top: '5px', right: '0px' }} onClick={() => addSlide()}>Add Slide</button>)
                                    }
                                </div>

                            </div>
                        </div>
                        <div className='draggables_container'>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', marginBottom: '1em', justifyContent: 'center', alignItems: 'center', marginBottom: '2em' }}>
                                {
                                    showPreview ? (
                                        <button className="custom-button" onClick={() => { setShowPreview((showPreview) => !showPreview) }}>Go Back</button>) : (
                                        <>
                                            <button onClick={handleSaveCourse} className="custom-button">Save Course</button>
                                            <button data-tooltip-id="my-tooltip" data-tooltip-content='Previews the current silde' data-tooltip-place="left-start" onClick={() => { setShowPreview((showPreview) => !showPreview); setPreviewIds(); }} className='custom-button'>Quick Preview</button>
                                            <Tooltip id="my-tooltip" />
                                        </>
                                    )
                                }
                            </div>
                            <div style={{ border: '1px solid grey', borderRadius: '20px', backgroundColor: 'white', paddingBottom: '1em' }}>
                                <div className='widgets'>WIDGETS</div>
                                <div className='draggables'>
                                    <>
                                        <Heading disabled={selectedQuizId ? true : false} />
                                        <Text disabled={selectedQuizId ? true : false} />
                                        <Image disabled={selectedQuizId ? true : false} />
                                        <Video disabled={selectedQuizId ? true : false} />
                                        <QuizDraggable disabled={selectedQuizId ? true : false} />
                                    </>
                                </div>
                            </div>

                        </div>
                        <DragOverlay>
                            {
                                isDragging === "Text" ? (
                                    <div className="draggable">
                                        <i className="fa-regular fa-pen-to-square" ></i>
                                        <p>Text</p>
                                    </div>
                                ) : null
                            }
                            {
                                isDragging === "Heading" ? (
                                    <div className="draggable" >
                                        <i className="fa-solid fa-heading"></i>
                                        <p>Heading</p>
                                    </div>
                                ) : null
                            }
                            {
                                isDragging === "Image" ? (
                                    <div className="draggable">
                                        <i className="fa-regular fa-image image"></i>
                                        <p>Info-Graphic</p>
                                    </div>
                                ) : null
                            }
                            {
                                isDragging === "Quiz" ? (
                                    <div className="draggable">
                                        <i class="fa-solid fa-q"></i>
                                        <p>Quiz</p>
                                    </div>
                                ) : null
                            }
                            {
                                isDragging === "Video" ? (
                                    <div className="draggable">
                                        <i className="fa-solid fa-video"></i>
                                        <p>Video</p>
                                    </div>
                                ) : null
                            }
                        </DragOverlay>
                    </DndContext>
                </div>
            ) : <div className='content-note'>Add Semester,chapter,section and click on the name to start adding content</div>

        }
    </>);
}

export default CourseCreator;