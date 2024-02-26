import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom";
import NewPreviewSideBar from "./NewPreviewSideBar";
import NewPreviewCourseCreator from "./NewPreviewCourseCreator";
import axios from "axios";

function NewPreviewComponent() {
    
    const [mainCourseData, setMainCourseData] = useState(null);
    const [sidebarData, setSidebarData] = useState(null);
    const [highlight , setHighlight ] = useState(``);

    //mechanism to show sildes data needs ids 
    const [selectedSemId, setSelectedSemId] = useState(null);
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [type, setType] = useState('');

    //cousre info to pass to course creator
    const [courseInfo, setCourseInfo] = useState(null);
    const { courseId } = useParams();

    const [semesterDropdown, setSemesterDropdown] = useState('');
    const [chapterDropdown, setChapterDropdown] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3001/api/fetch-sidebar-data', {
            params: {
                courseId: courseId
            }
        }).then((response) => {
            console.log(response.data);
            if (response.data.status === 'no data') {
                setSidebarData({ semesters: [] });
            } else {
                axios.get('http://localhost:3001/api/get-parent-data', {
                    params: {
                        semesterId: response.data.semesters[0].id,
                    }
                }).then((res) => {
                    setSidebarData(response.data);
                    setMainCourseData(res.data);
                    handleSlectedIds(res.data.semesters[0].id, null, null, null, 'semesters');
                    setHighlight(`semester${res.data.semesters[0].id}`);
                    setSemesterDropdown(`semester${res.data.semesters[0].id}`);
                })
            }
        })
    }, [])

    useEffect(() => {
        axios.get('http://localhost:3001/api/fetch-course-info', {
            params: {
                courseId: courseId
            }
        }).then((res) => {
            console.log(res.data.rows, res.data);
            setCourseInfo(res.data.rows)
        })
    }, [])

    const handleSlectedIds = (semId, chapId, secId, quizId, type) => {
        setType(type);
        setSelectedSemId(semId);
        setSelectedChapterId(chapId);
        setSelectedSectionId(secId);
        setSelectedQuizId(quizId);
    }

    return <>
        <div className="builder_container">
            <div className="sidebar_container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: "0.3rem", justifyContent: 'center', padding: '1em', alignItems: 'center', height: '15%' }}>
                    <Link to='/courses'><button className="all-courses-button"><span><i className="fa-solid fa-arrow-left-long"></i></span> All Courses</button></Link>
                </div>
                <NewPreviewSideBar
                    sidebarData={sidebarData}
                    setSidebarData={setSidebarData}
                    mainCourseData={mainCourseData}
                    setMainCourseData={setMainCourseData}
                    handleSlectedIds={handleSlectedIds}
                    highlight={highlight}
                    setHighlight={setHighlight}
                    semesterDropdown={semesterDropdown}
                    setSemesterDropdown={setSemesterDropdown}
                    chapterDropdown={chapterDropdown}
                    setChapterDropdown={setChapterDropdown}
                />
            </div>
            <div className="slides-container">
                <NewPreviewCourseCreator
                    mainCourseData={mainCourseData}
                    selectedSemId={selectedSemId}
                    selectedChapterId={selectedChapterId}
                    selectedSectionId={selectedSectionId}
                    selectedQuizId={selectedQuizId}
                    type={type}
                    courseInfo={courseInfo}
                />
            </div>
        </div>
    </>
}

export default NewPreviewComponent;