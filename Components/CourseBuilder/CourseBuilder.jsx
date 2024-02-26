import { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import CourseCreator from "../CourseCreator/CourseCreator";
import './CourseBuilder.css'
import axios from "axios";
import SideBarPreview from "../Preview_Component/SideBarPreview";
import CourseCreatorPreview from "../Preview_Component/CourseCreatorPreview";
import { Link, useParams } from "react-router-dom";


const CourseBuilder = () => {

    console.count('parent');
    const [fetchedImageIdArray , setFetchedImageIdArray ] = useState([]);
    const [imagesArray, setImagesArray] = useState([]);
    const [courseInfo, setCourseInfo] = useState(null);
    const [sidebarData, setSidebarData] = useState(null);
    const [highlight, setHighlight] = useState('');
    //useParam 
    const [selectedSemId, setSelectedSemId] = useState(null);
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [mainCourseData, setMainCourseData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [type, setType] = useState('');

    //ids for preview components 
    const [selectedSemPreviewId, setSelectedSemPreviewId] = useState(null);
    const [selectedChapterPreviewId, setSelectedChapterPreviewId] = useState(null);
    const [selectedSectionPreviewId, setSelectedSectionPreviewId] = useState(null);
    const [selectedQuizPreviewId, setSelectedQuizPreviewId] = useState(null);
    const [previewType, setPreviewType] = useState("");

    //below state is to store the information about which slide the teacher is on so on app re-render we have the same slide 
    const [slideId, setSlideId] = useState('')

    //below state is to store information about the open dropdowns. which is passed to preview component 
    const [semesterDropdownInfo, setSemesterDropdownInfo] = useState('');
    const [chapterDropdownInfo, setChapterDropdownInfo] = useState('');
    const [semesterDropdown, setSemesterDropdown] = useState('');
    const [chapterDropdown, setChapterDropdown] = useState('');

    const [previewSemesterDropdown, setPreviewSemesterDropdown] = useState('');
    const [previewChapterDropdown, setPreviewChapterDropdown] = useState('');
    const [previewHighlight, setPreviewHighlight] = useState('');

    //below state is used to execute the useEffect in course creator component which sets slidesData state when a semster is deleted.
    const [isDeleted, setIsDeleted] = useState(false);

    //to toggle sidebar
    const [toggle, setToggle] = useState(false);
    //flag to store if data is saved or not
    const [isDataSaved, setIsDataSaved] = useState(true);
    const [showSaveDataModal, setShowSaveDataModal] = useState(false);
    const { courseId } = useParams();

    useEffect(() => {
        axios.get('http://localhost:3001/api/fetch-course-info', {
            params: {
                courseId: courseId
            }
        }).then((res) => {
            //console.log(res.data.rows, res.data);
            setCourseInfo(res.data.rows)
        })
    }, [])
    useEffect(() => {
       //console.log('parents data ', mainCourseData);
       //console.log('imagesArray ' , imagesArray);
    }, [mainCourseData])
    useEffect(() => {
        axios.get('http://localhost:3001/api/fetch-sidebar-data', {
            params: {
                courseId: courseId
            }
        }).then((response) => {
            //console.log(response.data);
            if (response.data.status === 'no data') {
                setSidebarData({ semesters: [] });
            } else {
                axios.get("http://localhost:3001/api/get-parent-data", {
                    params: {
                        semesterId: response.data.semesters[0].id,
                        courseId: courseId
                    }
                }).then((res) => {
                    if (res.data.status === 'no data') {
                        setMainCourseData(null);
                    } else {
                        setSidebarData(response.data);
                        setMainCourseData(res.data);
                        handleSlectedIds(res.data.semesters[0].id, null, null, null, 'semesters');
                        setHighlight(`semester${res.data.semesters[0].id}`);
                        setSemesterDropdown(`semester${res.data.semesters[0].id}`);
                    }

                    //console.log(`semester${res.data.semesters[0].id}`);
                    //console.log('sem id', response.data.semesters[0].id);
                })

            }
        })
    }, [])

    useEffect(() => {
        //console.log("last parent render : , ", mainCourseData);
    })

    const handleSlectedIds = (semId, chapId, secId, quizId, type) => {
        setType(type);
        setSelectedSemId(semId);
        setSelectedChapterId(chapId);
        setSelectedSectionId(secId);
        setSelectedQuizId(quizId);
    }

    const resetSelectedIds = () => {
        setSelectedSemId(null);
        setSelectedChapterId(null);
        setSelectedSectionId(null);
        setSelectedQuizId(null);
        setType(null);
        setSlideId(null); //if not setted to null then when user deletes a sem, chap, sec. adds a new sem chap or sec and clicks on that. currentSlideId is set to the deleted slides Id.
    }

    function setPreviewIds() {
        setPreviewSemesterDropdown(semesterDropdown);
        setPreviewChapterDropdown(chapterDropdown);
        setSelectedSemPreviewId(selectedSemId);
        setSelectedChapterPreviewId(selectedChapterId);
        setSelectedSectionPreviewId(selectedSectionId);
        setSelectedQuizPreviewId(selectedQuizId);
        setPreviewType(type);
        setPreviewHighlight(highlight);
    }

    const handleSlectedPreviewIds = (semId, chapId, secId, quizId, type) => {
        setSelectedSemPreviewId(semId);
        setSelectedChapterPreviewId(chapId);
        setSelectedSectionPreviewId(secId);
        setSelectedQuizPreviewId(quizId);
        setPreviewType(type);
    }

    function handleToggle() {
        setToggle(!toggle);
    }

    function handleAllCoursesClick(e) {
        if (!isDataSaved) {
            e.preventDefault();
            setShowSaveDataModal(true);
            return;
        }
    }
    return (<>
        <div className="builder_container">
            {
                showPreview ? (
                    <>
                        <div className={toggle ? 'active-sidebar' : 'sidebar_container'}>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1em', alignItems: 'center', height: '10%' }}>
                                <button onClick={() => { setShowPreview((showPreview) => !showPreview) }} className="all-courses-button"><span><i className="fa-solid fa-arrow-left-long"></i></span> Back</button>
                            </div>
                            <SideBarPreview
                                handleSlectedPreviewIds={handleSlectedPreviewIds}
                                mainCourseData={mainCourseData}
                                sidebarData={sidebarData}
                                previewSemesterDropdown={previewSemesterDropdown}
                                previewChapterDropdown={previewChapterDropdown}
                                setPreviewHighlight={setPreviewHighlight}
                                previewHighlight={previewHighlight}
                            />
                        </div>
                        <CourseCreatorPreview
                            mainCourseData={mainCourseData}
                            selectedSemPreviewId={selectedSemPreviewId}
                            selectedChapterPreviewId={selectedChapterPreviewId}
                            selectedSectionPreviewId={selectedSectionPreviewId}
                            selectedQuizPreviewId={selectedQuizPreviewId}
                            slideId={slideId}
                            previewType={previewType}
                            courseInfo={courseInfo}
                        />
                    </>) : (
                    <>
                        <div className={toggle ? 'active-sidebar' : 'sidebar_container'}>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1em', alignItems: 'center', height: '10%' }}>
                                <Link to='/courses' onClick={handleAllCoursesClick}><button className="all-courses-button"><span><i className="fa-solid fa-arrow-left-long"></i></span> All Courses</button></Link>
                            </div>
                            <SideBar
                                mainCourseData={mainCourseData}
                                setMainCourseData={setMainCourseData}
                                resetSelectedIds={resetSelectedIds}
                                semesterDropdownInfo={semesterDropdownInfo}
                                chapterDropdownInfo={chapterDropdownInfo}
                                setSemesterDropdownInfo={setSemesterDropdownInfo}
                                setChapterDropdownInfo={setChapterDropdownInfo}
                                handleSlectedIds={handleSlectedIds}
                                setIsDeleted={setIsDeleted}
                                isDataSaved={isDataSaved}
                                setShowSaveDataModal={setShowSaveDataModal}
                                selectedSemId={selectedSemId}
                                selectedChapterId={selectedChapterId}
                                sidebarData={sidebarData}
                                setSidebarData={setSidebarData}
                                highlight={highlight}
                                setHighlight={setHighlight}
                                semesterDropdown={semesterDropdown}
                                setSemesterDropdown={setSemesterDropdown}
                                chapterDropdown={chapterDropdown}
                                setChapterDropdown={setChapterDropdown}
                            />
                        </div>
                        <div className="slides-container">
                            <CourseCreator
                                mainCourseData={mainCourseData} setMainCourseData={setMainCourseData}
                                selectedChapterId={selectedChapterId}
                                selectedSectionId={selectedSectionId}
                                selectedSemId={selectedSemId}
                                resetSelectedIds={resetSelectedIds}
                                selectedQuizId={selectedQuizId}
                                setSlideId={setSlideId}
                                slideId={slideId}
                                type={type}
                                isDeleted={isDeleted}
                                showPreview={showPreview}
                                setShowPreview={setShowPreview}
                                setPreviewIds={setPreviewIds}
                                setIsDataSaved={setIsDataSaved}
                                courseInfo={courseInfo}
                                setShowSaveDataModal={setShowSaveDataModal}
                                showSaveDataModal={showSaveDataModal}
                                isDataSaved={isDataSaved}
                                setImagesArray={setImagesArray}
                                imagesArray={imagesArray}
                                fetchedImageIdArray={fetchedImageIdArray}
                                setFetchedImageIdArray={setFetchedImageIdArray}
                            />
                        </div>
                    </>
                )
            }
        </div >
    </>
    );
}

export default CourseBuilder;

{/* <div className="title">

<div>
    <span><strong>Course Name:</strong> {name}</span><br></br>
    <span><strong>Subject:</strong> {subject}</span><br></br>
    <span><strong>Description:</strong> {discription}</span>
</div>
<div style={{ textAlign: "right", marginBottom: "10px" }}>
    {
        showPreview ? (<button className="primary_cta_button" onClick={() => { setShowPreview((showPreview) => !showPreview) }}>Go Back</button>) : (
            <><button className="primary_cta_button" style={{ marginRight: "5px" }}>Save Course</button>
                <button onClick={() => { setShowPreview((showPreview) => !showPreview); setPreviewIds() }} className='primary_cta_button'>Preview</button></>
        )
    }
</div>
</div>
<div className="toggle"><i onClick={handleToggle} className="fa-solid fa-bars"></i></div>
<div className="course_builder_container">
{
    showPreview ? (
        <>
            <div className={toggle ? 'active-sidebar':'sidebar_container'}>     
                <SideBarPreview
                    handleSlectedPreviewIds={handleSlectedPreviewIds}
                    mainCourseData={mainCourseData}
                />
            </div>
            <CourseCreatorPreview
                mainCourseData={mainCourseData}
                selectedSemPreviewId={selectedSemPreviewId}
                selectedChapterPreviewId={selectedChapterPreviewId}
                selectedSectionPreviewId={selectedSectionPreviewId}
                selectedQuizPreviewId={selectedQuizPreviewId}
                slideId={slideId}
                previewType={previewType}
            />
        </>
    ) : (
        <>
            <div className={toggle ? 'active-sidebar':'sidebar_container'}>
                <SideBar
                    mainCourseData={mainCourseData}
                    setMainCourseData={setMainCourseData}
                    resetSelectedIds={resetSelectedIds}
                    semesterDropdownInfo={semesterDropdownInfo}
                    chapterDropdownInfo={chapterDropdownInfo}
                    setSemesterDropdownInfo={setSemesterDropdownInfo}
                    setChapterDropdownInfo={setChapterDropdownInfo}
                    handleSlectedIds={handleSlectedIds}
                    setIsDeleted={setIsDeleted}
                />
            </div>
            <CourseCreator
                mainCourseData={mainCourseData} setMainCourseData={setMainCourseData}
                selectedChapterId={selectedChapterId}
                selectedSectionId={selectedSectionId}
                selectedSemId={selectedSemId}
                resetSelectedIds={resetSelectedIds}
                selectedQuizId={selectedQuizId}
                setSlideId={setSlideId}
                slideId={slideId}
                type={type}
                isDeleted={isDeleted}
            />

        </>
    )
}
</div> */}

