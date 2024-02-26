import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CardHeader } from 'react-bootstrap';
import { Car } from 'lucide-react';

const NewPreviewSideBar = ({ sidebarData, mainCourseData, setMainCourseData,
    resetSelectedIds, semesterDropdownInfo, chapterDropdownInfo, setSemesterDropdownInfo, setChapterDropdownInfo,
    handleSlectedIds, setIsDeleted, isDataSaved, setShowSaveDataModal, setHighlight, highlight,semesterDropdown,setSemesterDropdown,
    chapterDropdown,setChapterDropdown
}) => {
    //console.log("rendering child sidebar");

    //below state is used to store semester name input from user and the adding semester takes that name

    //below states store the semester or chapter id then match those to open or close the dropdowns
    

    //below state is used to store the id of either one of sem, chap, sec , test then based on id we show edit or delete icons
    //below state is used to show user appropriate errors 
    //below state stored the sectionId and matches that id to change background color of selected section. Also used for changing bg-color of selected chapterTest 
    const [currentSection, setCurrentSection] = useState("");
    const { courseId } = useParams();
    //state variable to store the users input then on click of update button we change the semesters state
    //same state variable will be used to update sem name , chap name , section name.
    //we have the courseId in url we need to fetch the sidebar data when the sidebar mounts

    //below useEffect sets parents variable that is passed to preview so the dropdowns should be open in preview as well
    // useEffect(() => {
    //     setSemesterDropdownInfo(semesterDropdown);
    // }, [semesterDropdown])

    // useEffect(() => {
    //     setChapterDropdownInfo(chapterDropdown);
    // }, [chapterDropdown])

    // useEffect(() => {
    //     if (semesterDropdownInfo === '') {
    //         return
    //     } else {
    //         setSemesterDropdown(semesterDropdownInfo);
    //     }
    // }, [])

    //below useEffect checks for dropdown info for chapter. 
    // useEffect(() => {
    //     if (chapterDropdownInfo === '') {
    //         return
    //     } else {
    //         setChapterDropdown(chapterDropdownInfo);
    //     }
    // }, [])


    //make a word document for the component also start styling this also domo knowledge required.

    function CustomToggle({ children, eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey, () =>
            console.log('totally custom!'),
        );

        return (
            <button
                type="button"
                style={{ border: 'none', backgroundColor: '#f8f9fa', padding: '0', }}
                onClick={decoratedOnClick}
            >
                <i className="fa-solid fa-caret-down"></i>
            </button>
        );
    }
    //sub branch


    function handleSemesterClick(semId, type) {
        // if parent data is not present fetch the data
        console.log(mainCourseData);
        if (!mainCourseData) {
            setHighlight(`semester${semId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, null, 'semesters');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            setHighlight(`semester${semId}`);
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, null, null, null, 'semesters');
        } else if (semId !== mainCourseData?.semesters[0].id) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            setHighlight(`semester${semId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, null, 'semesters');
                }
            })
        }
        //check wether its the current sem or not
        console.log("semester click handler")
        //set the selected semester parent state before that fetch the parent data


    }

    function handleChapterClick(semId, chapId) {
        console.log(mainCourseData);
        setHighlight(`chapter${chapId}`);
        if (!mainCourseData) {
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, chapId, null, null, 'chapters');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, chapId, null, null, 'chapters');
        } else if (semId !== mainCourseData?.semesters[0].id) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.'

            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, chapId, null, null, 'chapters');
                }
            })
        }
    }

    function handleSectionClick(semId, chapId, secId) {
        setHighlight(`section${secId}`);
        if (!mainCourseData) {
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, chapId, secId, null, 'sections')
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, chapId, secId, null, 'sections')
        } else if (semId !== mainCourseData?.semesters[0].id) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, chapId, secId, null, 'sections')
                }
            })
        }
    }

    function handleChapterTestClick(semId, chapId, quizId) {
        setHighlight(`chapterTest${quizId}`);
        if (!mainCourseData) {
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    console.log(response.data);
                    handleSlectedIds(semId, chapId, null, quizId, 'chapterTest');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, chapId, null, quizId, 'chapterTest');
        } else if (semId !== mainCourseData?.semesters[0].id) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, chapId, null, quizId, 'chapterTest');
                }
            })
        }
    }

    function handleSemesterTestClick(semId, quizId) {
        setHighlight(`semesterTest${quizId}`)
        if (!mainCourseData) {
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, quizId, 'semesterTest');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, null, null, quizId, 'semesterTest');
        } else if (semId !== mainCourseData?.semesters[0].id) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
                console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    console.log("response.data", response.data);
                    handleSlectedIds(semId, null, null, quizId, 'semesterTest');
                }
            })
        }
    }


    return (
        <>
            <div style={{ overflow: 'auto', height: '85%' }}>
                {
                    sidebarData && <Accordion>
                        {
                            sidebarData.semesters?.map((semester, semIndex) => (
                                <Card>
                                    <Card.Header className={highlight === `semester${semester.id}` ? 'highlight' : ''}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}
                                            title={`${semester.name}`}
                                        >
                                            <label onClick={() => { handleSemesterClick(semester.id, 'semester'); }}
                                                style={{ cursor: 'pointer', maxWidth: '70%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {semester.name}
                                            </label>
                                            <span>
                                                <CustomToggle eventKey={`semester${semester.id}`} />
                                            </span>

                                        </div>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey={`semester${semester.id}`}>
                                        <Card.Body className='testing'>
                                            <Accordion>
                                                {
                                                    semester.chapters.map((chapter, chapIndex) => (
                                                        <Card>
                                                            <Card.Header className={highlight === `chapter${chapter.id}` ? 'highlight' : ''}>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between'
                                                                    }}
                                                                    title={`${chapter.name}`}
                                                                >
                                                                    <label onClick={() => { handleChapterClick(semester.id, chapter.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{chapter.name}</label>
                                                                    <span>
                                                                        <CustomToggle eventKey={`chapter${chapter.id}`}>Click me!</CustomToggle>
                                                                    </span>
                                                                </div>
                                                            </Card.Header>
                                                            <Accordion.Collapse eventKey={`chapter${chapter.id}`}>
                                                                <Card.Body className='testing-2'>
                                                                    {
                                                                        chapter.sections?.map((section, secIndex) => (
                                                                            <Card>
                                                                                <Card.Header className={highlight === `section${section.id}` ? 'highlight' : ''}>
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            justifyContent: "space-between",
                                                                                            alignContent: "center",
                                                                                        }}
                                                                                        title={section.name}
                                                                                    >
                                                                                        <label onClick={() => { handleSectionClick(semester.id, chapter.id, section.id); setCurrentSection(section.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{section.name}</label>
                                                                                    </div>
                                                                                </Card.Header>
                                                                            </Card>
                                                                        ))
                                                                    }
                                                                    {
                                                                        chapter.chapterTest.map((q) => (
                                                                            <Card>
                                                                                <Card.Header className={highlight === `chapterTest${q.id}` ? 'highlight' : ''}>
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            justifyContent: "space-between",
                                                                                            alignContent: "center",
                                                                                        }}
                                                                                        title={`${q.name}`}
                                                                                    >
                                                                                        <label onClick={() => { handleChapterTestClick(semester.id, chapter.id, q.id); setCurrentSection(q.id) }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
                                                                                    </div>
                                                                                </Card.Header>
                                                                            </Card>
                                                                        ))
                                                                    }
                                                                </Card.Body>
                                                            </Accordion.Collapse>
                                                        </Card>
                                                    ))
                                                }
                                            </Accordion>
                                            {
                                                semester.semesterTest.map((q) => (
                                                    <Card>
                                                        <Card.Header className={highlight === `semesterTest${q.id}` ? 'highlight' : ''}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between'
                                                                }}
                                                                title={q.name}
                                                            >
                                                                <label onClick={() => { handleSemesterTestClick(semester.id, q.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
                                                            </div>
                                                        </Card.Header>
                                                    </Card>
                                                ))
                                            }
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            ))
                        }
                    </Accordion>
                }
            </div>
        </>);
}

export default NewPreviewSideBar;