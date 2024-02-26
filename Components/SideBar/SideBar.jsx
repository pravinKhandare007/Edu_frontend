import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from "uuid";
import MyModal from './MyModal';
import './SideBar.css';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SideBar = ({ mainCourseData, setMainCourseData,
    resetSelectedIds, semesterDropdownInfo, chapterDropdownInfo, setSemesterDropdownInfo, setChapterDropdownInfo,
    handleSlectedIds, setIsDeleted, isDataSaved, setShowSaveDataModal, selectedSemId, selectedChapterId, sidebarData, setSidebarData,
    highlight, setHighlight, semesterDropdown, setSemesterDropdown, chapterDropdown, setChapterDropdown
}) => {
    //console.log("rendering child sidebar");

    //below state is used to store semester name input from user and the adding semester takes that name
    const [semesterName, setSemesterName] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [quizName, setQuizName] = useState('');
    const { courseId } = useParams();
    //below states store the semester or chapter id then match those to open or close the dropdowns



    //below state is used to store the id of either one of sem, chap, sec , test then based on id we show edit or delete icons
    const [isHovering, setIsHovering] = useState("");

    //below state is used to show user appropriate errors 
    const [error, setError] = useState(false);
    //below state stored the sectionId and matches that id to change background color of selected section. Also used for changing bg-color of selected chapterTest 
    const [currentSection, setCurrentSection] = useState("");

    const [showModal, setShowModal] = useState({
        semId: '',
        chapId: '',
        secId: '',
        chapTestId: '',
        semTestId: '',
        semIndex: '',
        chapIndex: '',
        type: '',
        show: false,
        action: '',
        title: '',
        name: ''
    });

    //state variable to store the users input then on click of update button we change the semesters state
    //same state variable will be used to update sem name , chap name , section name.
    const [newName, setNewName] = useState("");
    //const {semesterId , chapterId , sectionId } = useparams();
    const navigate = useNavigate();
    const [lastActive , setLastActive] = useState(new Date());
    const timeOutDuration = 1000 * 60 * 60;  // 1hour in milliseconds

    useEffect(()=>{
        document.addEventListener('keydown' , handleUserActivity);
        document.addEventListener('mousemove' , handleUserActivity);

        return   ()=>{
            document.removeEventListener('keydown' , handleUserActivity);
            document.removeEventListener('mousemove' , handleUserActivity);
        }
    },[])

    useEffect(()=>{
        const timeOutId = setTimeout(()=>{
            //user inActive for an hour log him out i.e delete the token and route the user to login page 
            //also save his data 
            const token = localStorage.getItem('auth');
            localStorage.removeItem('auth');
            
            navigate('/login');
        }, timeOutDuration - (new Date() - lastActive));

        return () => {clearTimeout(timeOutId)}
    },[lastActive])
    
    function handleUserActivity(){
        setLastActive(new Date());
    }
    //we have the courseId in url we need to fetch the sidebar data when the sidebar mounts

   //console.log("&&&&&&&&&*^&*^*&", semesterDropdown);

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

    const addSemester = () => {
        //--------------------------------------------------    
        if (!semesterName) {
            setError(true);
            return
        }
        setError(false)
        axios.post('http://localhost:3001/api/add-semester', {
            name: semesterName,
            courseId: courseId
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData((sidebarData) => {
                    let newSidebarData = sidebarData;
                    newSidebarData.semesters.push({
                        id: response.data.insertId, name: semesterName, content: null,
                        chapters: [],
                        semesterTest: []
                    })
                    return newSidebarData;
                });
                setSemesterName("");
                setShowModal((showModal) => { return { ...showModal, show: false } })
            } else {
                setError('adding semester failed try again');
                setSemesterName("");
                setShowModal((showModal) => { return { ...showModal, show: false } })
            }
            // handleSlectedIds(response.data.insertId , null , null , null , 'semesters');
        })
    };

    function addChapter(semesterId) {
        if (!chapterName) {
            setError(true);
            return
        }

        if (!mainCourseData) {
            axios.post('http://localhost:3001/api/add-chapter', {
                name: chapterName,
                courseId: courseId,
                semesterId: semesterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                               //console.log(semester.id, semesterId);
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: [...semester.chapters, {
                                            id: response.data.insertId,
                                            name: chapterName,
                                            sections: [],
                                            chapterTest: []
                                        }]
                                    }
                                } else {
                                    return semester;
                                }
                            })
                           //console.log("semesters", newSemesters)
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setChapterName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })
                } else {
                    setError('adding chapter failed try again');
                    setChapterName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && isDataSaved) {
            axios.post('http://localhost:3001/api/add-chapter', {
                name: chapterName,
                courseId: courseId,
                semesterId: semesterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                               //console.log(semester.id, semesterId);
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: [...semester.chapters, {
                                            id: response.data.insertId,
                                            name: chapterName,
                                            sections: [],
                                            chapterTest: []
                                        }]
                                    }
                                } else {
                                    return semester;
                                }
                            })
                           //console.log("semesters", newSemesters)
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setChapterName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })
                } else {
                    setError('adding chapter failed try again');
                    setChapterName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && !isDataSaved) {
            setShowSaveDataModal(true);
        } else {
            //sem data is present in parent then add normally
            axios.post('http://localhost:3001/api/add-chapter', {
                name: chapterName,
                courseId: courseId,
                semesterId: semesterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                           //console.log(semester.id, semesterId);
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: [...semester.chapters, {
                                        id: response.data.insertId,
                                        name: chapterName,
                                        sections: [],
                                        chapterTest: []
                                    }]
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: [...semester.chapters, {
                                        id: response.data.insertId,
                                        name: chapterName,
                                        content: null,
                                        sections: [],
                                        chapterTest: [],
                                        imageIdArray:[]
                                    }]
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                    setChapterName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                    setError(false)
                } else {
                    setError('adding chapter failed try again');
                    setChapterName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        }
    }

    function addSection(semesterId, chapterId) {
        if (!sectionName) {
            setError(true);
            return
        }
        if (!mainCourseData) {
            axios.post('http://localhost:3001/api/add-section', {
                name: sectionName,
                courseId: courseId,
                semesterId: semesterId,
                chapterId: chapterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: semester.chapters.map((chapter) => {
                                            if (chapter.id === chapterId) {
                                                return {
                                                    ...chapter, sections: [...chapter.sections, {
                                                        id: response.data.insertId,
                                                        name: sectionName,
                                                    }]
                                                }
                                            } else {
                                                return chapter
                                            }
                                        })
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setSectionName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })
                } else {
                    setError('adding section failed try again');
                    setSectionName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && isDataSaved) {
            axios.post('http://localhost:3001/api/add-section', {
                name: sectionName,
                courseId: courseId,
                semesterId: semesterId,
                chapterId: chapterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: semester.chapters.map((chapter) => {
                                            if (chapter.id === chapterId) {
                                                return {
                                                    ...chapter, sections: [...chapter.sections, {
                                                        id: response.data.insertId,
                                                        name: sectionName,
                                                    }]
                                                }
                                            } else {
                                                return chapter
                                            }
                                        })
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setSectionName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })
                } else {
                    setError('adding section failed try again');
                    setSectionName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && !isDataSaved) {
            setShowSaveDataModal(true);
        } else {
            //parent data is present and sem id is also same 
            axios.post('http://localhost:3001/api/add-section', {
                name: sectionName,
                courseId: courseId,
                semesterId: semesterId,
                chapterId: chapterId
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapterId) {
                                            return {
                                                ...chapter, sections: [...chapter.sections, {
                                                    id: response.data.insertId,
                                                    name: sectionName,
                                                }]
                                            }
                                        } else {
                                            return chapter
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapterId) {
                                            return {
                                                ...chapter, sections: [...chapter.sections, {
                                                    id: response.data.insertId,
                                                    name: sectionName,
                                                    content: null,
                                                    imageIdArray:[]
                                                }]
                                            }
                                        } else {
                                            return chapter
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                    setSectionName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                    setError(false)
                } else {
                    setError('adding section failed try again');
                    setSectionName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }

            })
        }
    }

    function addSectionLevelQuiz(semesterId, chapterId) {
        if (!quizName) {
            setError(true);
            return;
        }
        if (!mainCourseData) {
            axios.post('http://localhost:3001/api/add-chapter-test', {
                name: quizName,
                chapterId: chapterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: semester.chapters.map((chapter) => {
                                            if (chapter.id === chapterId) {
                                                return {
                                                    ...chapter, chapterTest: [...chapter.chapterTest, {
                                                        id: response.data.insertId,
                                                        name: quizName,
                                                    }]
                                                }
                                            } else {
                                                return chapter
                                            }
                                        })
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data)
                        setQuizName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })


                } else {
                    setError('adding chapter test failed try again');
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && isDataSaved) {
            axios.post('http://localhost:3001/api/add-chapter-test', {
                name: quizName,
                chapterId: chapterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, chapters: semester.chapters.map((chapter) => {
                                            if (chapter.id === chapterId) {
                                                return {
                                                    ...chapter, chapterTest: [...chapter.chapterTest, {
                                                        id: response.data.insertId,
                                                        name: quizName,
                                                    }]
                                                }
                                            } else {
                                                return chapter
                                            }
                                        })
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data)
                        setQuizName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })


                } else {
                    setError('adding chapter test failed try again');
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }
            })

        } else if (semesterId !== mainCourseData.semesters[0].id && !isDataSaved) {
            setShowSaveDataModal(true);
        } else {
            axios.post('http://localhost:3001/api/add-chapter-test', {
                name: quizName,
                chapterId: chapterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapterId) {
                                            return {
                                                ...chapter, chapterTest: [...chapter.chapterTest, {
                                                    id: response.data.insertId,
                                                    name: quizName,
                                                }]
                                            }
                                        } else {
                                            return chapter
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapterId) {
                                            return {
                                                ...chapter, chapterTest: [...chapter.chapterTest, {
                                                    id: response.data.insertId,
                                                    name: quizName,
                                                    numberOfQuestions: 5,
                                                    timeLimit: {
                                                        hours: 1,
                                                        minutes: 30
                                                    },
                                                    content: { slides: [{ id: uuidv4(), content: [{ id: uuidv4(), type: 'Quiz', data: null }] }] },
                                                    imageIdArray:[]
                                                }]
                                            }
                                        } else {
                                            return chapter
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                    setError(false)
                } else {
                    setError('adding chapter test failed try again');
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }

            })
        }
    }

    function addQuizBelowChapters(semesterId) {
        if (!quizName) {
            setError(true);
            return
        }
        if (!mainCourseData) {
            axios.post('http://localhost:3001/api/add-semester-test', {
                name: quizName,
                semesterId: semesterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, semesterTest: [...semester.semesterTest, {
                                            id: response.data.insertId,
                                            name: quizName,
                                        }]
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setQuizName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })

                }
            })
        } else if (semesterId !== mainCourseData.semesters[0].id && isDataSaved) {
            axios.post('http://localhost:3001/api/add-semester-test', {
                name: quizName,
                semesterId: semesterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    axios.get("http://localhost:3001/api/get-parent-data", {
                        params: {
                            semesterId: semesterId,
                            courseId: courseId
                        }
                    }).then((res) => {
                        setSidebarData((sidebarData) => {
                            const newSemesters = sidebarData.semesters.map((semester) => {
                                if (semester.id === semesterId) {
                                    return {
                                        ...semester, semesterTest: [...semester.semesterTest, {
                                            id: response.data.insertId,
                                            name: quizName,
                                        }]
                                    }
                                } else {
                                    return semester;
                                }
                            })
                            return { semesters: newSemesters }
                        });
                        setMainCourseData(res.data);
                        setQuizName("");
                        setShowModal((showModal) => { return { ...showModal, show: false } })
                        setError(false)
                    })

                }
            })

        } else if (semesterId !== mainCourseData.semesters[0].id && !isDataSaved) {
            setShowSaveDataModal(true);
        } else {
            axios.post('http://localhost:3001/api/add-semester-test', {
                name: quizName,
                semesterId: semesterId,
                content: {
                    slides: [
                        {
                            id: uuidv4(),
                            content: [
                                { id: uuidv4(), type: 'Quiz', data: null }
                            ]
                        },
                    ]
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, semesterTest: [...semester.semesterTest, {
                                        id: response.data.insertId,
                                        name: quizName,
                                    }]
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semesterId) {
                                return {
                                    ...semester, semesterTest: [...semester.semesterTest, {
                                        id: response.data.insertId,
                                        name: quizName,
                                        numberOfQuestions: 5,
                                        timeLimit: {
                                            hours: 1,
                                            minutes: 30
                                        },//can we do timeLimit null? {hours: , minutes : } these are used as value=timeLimit.hours
                                        content: {
                                            slides: [
                                                {
                                                    id: uuidv4(),
                                                    content: [
                                                        { id: uuidv4(), type: 'Quiz', data: null }
                                                    ]
                                                },
                                            ]
                                        },
                                        imageIdArray:[]
                                    }]
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                    setError(false)
                } else {
                    setError('adding chapter test failed try again');
                    setQuizName("");
                    setShowModal((showModal) => { return { ...showModal, show: false } })
                }

            })
        }
    }

    function deleteSemester(semId) {

        if (!mainCourseData) {
           //console.log({ semesterId: semId, });
            axios.delete('http://localhost:3001/api/delete-semester', {
                data: {
                    semesterId: semId,
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.filter(semester => semester.id !== semId);
                        return { semesters: newSemesters };
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } })
            })

        } else if (semId !== mainCourseData.semesters[0].id) {

            axios.delete('http://localhost:3001/api/delete-semester', {
                data: {
                    semesterId: semId,
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.filter(semester => semester.id !== semId);
                        return { semesters: newSemesters };
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } })
            })
        } else {
           //console.log('inside last option');
            axios.delete('http://localhost:3001/api/delete-semester', {
                data: {
                    semesterId: semId,
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.filter(semester => semester.id !== semId);
                        return { semesters: newSemesters };
                    })
                    setMainCourseData(null);
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } })
            })
        }
    }

    function editSemesterName(semId) {
        if (!newName) {
            setError(true);
            return;
        }
        axios.put('http://localhost:3001/api/edit-semester-name', {
            semesterId: semId,
            name: newName
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData((sidebarData) => {
                    const newSemesters = sidebarData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, name: newName
                            }
                        } else {
                            return semester;
                        }
                    })
                    return {
                        semesters: newSemesters
                    }
                })
            } else {
                //handle the failed name update query
            }

            setShowModal((showModal) => { return { ...showModal, show: false } });
            setError(false);
            setNewName("");
        })
    }

    function deleteChapter(semId, chapId) {
        if (!mainCourseData) {
            axios.delete('http://localhost:3001/api/delete-chapter', {
                data: {
                    chapterId: chapId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.filter(chapter => chapter.id !== chapId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
                setShowModal((showModal) => { return { ...showModal, show: false } });
                setIsDeleted((isDeleted) => !isDeleted);
            })
        } else if (semId !== mainCourseData.semesters[0].id) {
            axios.delete('http://localhost:3001/api/delete-chapter', {
                data: {
                    chapterId: chapId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.filter(chapter => chapter.id !== chapId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
                setShowModal((showModal) => { return { ...showModal, show: false } });
                setIsDeleted((isDeleted) => !isDeleted);
            })
        } else {
            //semID is same for parent and also mainCD is present
            axios.delete('http://localhost:3001/api/delete-chapter', {
                data: {
                    chapterId: chapId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.filter(chapter => chapter.id !== chapId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.filter(chapter => chapter.id !== chapId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
                setShowModal((showModal) => { return { ...showModal, show: false } });
                setIsDeleted((isDeleted) => !isDeleted);
            })
        }
        // setMainCourseData({
        //     semesters: mainCourseData.semesters.map((semester) => {
        //         if (semester.id === semId) {
        //             return {
        //                 ...semester, chapters: semester.chapters.filter((chapter) => chapter.id !== chapId)
        //             }
        //         } else {
        //             return {
        //                 ...semester
        //             }
        //         }
        //     })
        // });

    }

    function deleteSection(semId, chapId, sectionId) {

        if (!mainCourseData) {
            //direclty delete from sidebarData only
            axios.delete('http://localhost:3001/api/delete-section', {
                data: {
                    sectionId: sectionId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, sections: chapter.sections.filter(section => section.id !== sectionId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
            })

            setIsDeleted((isDeleted) => !isDeleted);
            setShowModal((showModal) => { return { ...showModal, show: false } });
        } else if (semId !== mainCourseData.semesters[0].id) {
            axios.delete('http://localhost:3001/api/delete-section', {
                data: {
                    sectionId: sectionId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, sections: chapter.sections.filter(section => section.id !== sectionId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
            })

            setIsDeleted((isDeleted) => !isDeleted);
            setShowModal((showModal) => { return { ...showModal, show: false } });
        } else {
            axios.delete('http://localhost:3001/api/delete-section', {
                data: {
                    sectionId: sectionId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, sections: chapter.sections.filter(section => section.id !== sectionId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters }
                    })
                }
            })
            setMainCourseData({
                semesters: mainCourseData.semesters.map((semester) => {
                    if (semester.id === semId) {
                        return {
                            ...semester, chapters: semester.chapters.map((chapter) => {
                                if (chapter.id === chapId) {
                                    return {
                                        ...chapter, sections: chapter.sections.filter(section => section.id !== sectionId)
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
            });
            setIsDeleted((isDeleted) => !isDeleted);
            setShowModal((showModal) => { return { ...showModal, show: false } });
        }
    }

    function editChapterName(semId, chapId) {
        if (!newName) {
            setError(true);
            return;
        }
        axios.put('http://localhost:3001/api/edit-chapter-name', {
            chapterId: chapId,
            name: newName
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData((sidebarData) => {
                    const newSemesters = sidebarData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, chapters: semester.chapters.map((chapter) => {
                                    if (chapter.id === chapId) {
                                        return {
                                            ...chapter, name: newName
                                        }
                                    } else {
                                        return chapter;
                                    }
                                })
                            }
                        } else {
                            return semester;
                        }
                    })
                    return { semesters: newSemesters };
                })
            }
            setShowModal((showModal) => { return { ...showModal, show: false } });
            setNewName("");
            setError(false);
        })

    }

    function editSectionName(semId, chapId, sectionId) {
        if (!newName) {
            setError(true);
            return;
        }

        axios.put('http://localhost:3001/api/edit-section-name', {
            sectionId: sectionId,
            name: newName
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData({
                    semesters: sidebarData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, chapters: semester.chapters.map((chapter) => {
                                    if (chapter.id === chapId) {
                                        return {
                                            ...chapter, sections: chapter.sections.map((section) => {
                                                if (section.id === sectionId) {
                                                    return {
                                                        ...section, name: newName
                                                    }
                                                } else {
                                                    return section;
                                                }
                                            })
                                        }
                                    } else {
                                        return chapter;
                                    }
                                })
                            }
                        } else {
                            return semester;
                        }
                    })
                })
            }
            setError(false);
            setShowModal((showModal) => { return { ...showModal, show: false } })
            setNewName("");
        })

    }

    function editChapterLevelQuizName(semId, quizId) {
        if (!newName) {
            setError(true);
            return;
        }

        axios.put('http://localhost:3001/api/edit-semesterTest-name', {
            semesterTestId: quizId,
            name: newName
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData({
                    semesters: sidebarData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, semesterTest: semester.semesterTest.map((q) => {
                                    if (q.id === quizId) {
                                        return {
                                            ...q, name: newName
                                        }
                                    } else {
                                        return q;
                                    }
                                })
                            }
                        } else {
                            return semester;
                        }
                    })
                })
            }
            setShowModal((showModal) => { return { ...showModal, show: false } });
            setNewName("");
            setError(false);
        })
        // setMainCourseData({
        //     semesters: mainCourseData.semesters.map((semester) => {
        //         if (semester.id === semId) {
        //             return {
        //                 ...semester, semesterTest: semester.semesterTest.map((q) => {
        //                     if (q.id === quizId) {
        //                         return {
        //                             ...q, name: newName
        //                         }
        //                     } else {
        //                         return {
        //                             ...q
        //                         }
        //                     }
        //                 })
        //             }
        //         } else {
        //             return {
        //                 ...semester
        //             }
        //         }
        //     })
        // })

    }

    function editQuizName(semId, chapId, quizId) {
        if (!newName) {
            setError(true);
            return;
        }

        axios.put('http://localhost:3001/api/edit-chapterTest-name', {
            chapterTestId: quizId,
            name: newName
        }).then((response) => {
            if (response.data.status === 'success') {
                setSidebarData({
                    semesters: sidebarData.semesters.map((semester) => {
                        if (semester.id === semId) {
                            return {
                                ...semester, chapters: semester.chapters.map((chapter) => {
                                    if (chapter.id === chapId) {
                                        return {
                                            ...chapter, chapterTest: chapter.chapterTest.map((q) => {
                                                if (q.id === quizId) {
                                                    return {
                                                        ...q, name: newName
                                                    }
                                                } else {
                                                    return q;
                                                }
                                            })
                                        }
                                    } else {
                                        return chapter;
                                    }
                                })
                            }
                        } else {
                            return semester;
                        }
                    })
                })
            }
            setShowModal((showModal) => { return { ...showModal, show: false } });
            setNewName("");
            setError(false)
        })
        // setMainCourseData({
        //     semesters: mainCourseData.semesters.map((semester) => {
        //         if (semester.id === semId) {
        //             return {
        //                 ...semester, chapters: semester.chapters.map((chapter) => {
        //                     if (chapter.id === chapId) {
        //                         return {
        //                             ...chapter, chapterTest: chapter.chapterTest.map((q) => {
        //                                 if (q.id === quizId) {
        //                                     return {
        //                                         ...q, name: newName
        //                                     }
        //                                 } else {
        //                                     return {
        //                                         ...q
        //                                     }
        //                                 }
        //                             })
        //                         }
        //                     } else {
        //                         return {
        //                             ...chapter
        //                         }
        //                     }
        //                 })
        //             }
        //         } else {
        //             return {
        //                 ...semester
        //             }
        //         }
        //     })
        // })
    }

    function deleteChapterLevelQuiz(semId, quizId) {

        if (!mainCourseData) {
            axios.delete('http://localhost:3001/api/delete-semesterTest', {
                data: {
                    semesterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, semesterTest: semester.semesterTest.filter(semesterTest => semesterTest.id !== quizId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters };
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        } else if (semId !== mainCourseData.semesters[0].id) {
            axios.delete('http://localhost:3001/api/delete-semesterTest', {
                data: {
                    semesterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, semesterTest: semester.semesterTest.filter(semesterTest => semesterTest.id !== quizId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters };
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        } else {
            axios.delete('http://localhost:3001/api/delete-semesterTest', {
                data: {
                    semesterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemesters = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, semesterTest: semester.semesterTest.filter(semesterTest => semesterTest.id !== quizId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters };
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemesters = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, semesterTest: semester.semesterTest.filter(semesterTest => semesterTest.id !== quizId)
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemesters };
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        }
        // setMainCourseData({
        //     semesters: mainCourseData.semesters.map((semester) => {
        //         if (semester.id === semId) {
        //             return {
        //                 ...semester, semesterTest: semester.semesterTest.filter((q) => q.id !== quizId)
        //             }
        //         } else {
        //             return {
        //                 ...semester
        //             }
        //         }
        //     })
        // });

    }

    function deleteSectionLevelQuiz(semId, chapId, quizId) {

        if (!mainCourseData) {
            axios.delete('http://localhost:3001/api/delete-chapterTest', {
                data: {
                    chapterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemestrs = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, chapterTest: chapter.chapterTest.filter(chapterTest => chapterTest.id !== quizId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemestrs }
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        } else if (semId !== mainCourseData.semesters[0].id) {
            axios.delete('http://localhost:3001/api/delete-chapterTest', {
                data: {
                    chapterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemestrs = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, chapterTest: chapter.chapterTest.filter(chapterTest => chapterTest.id !== quizId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemestrs }
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        } else {
            axios.delete('http://localhost:3001/api/delete-chapterTest', {
                data: {
                    chapterTestId: quizId
                }
            }).then((response) => {
                if (response.data.status === 'success') {
                    setSidebarData((sidebarData) => {
                        const newSemestrs = sidebarData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, chapterTest: chapter.chapterTest.filter(chapterTest => chapterTest.id !== quizId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemestrs }
                    });
                    setMainCourseData((mainCourseData) => {
                        const newSemestrs = mainCourseData.semesters.map((semester) => {
                            if (semester.id === semId) {
                                return {
                                    ...semester, chapters: semester.chapters.map((chapter) => {
                                        if (chapter.id === chapId) {
                                            return {
                                                ...chapter, chapterTest: chapter.chapterTest.filter(chapterTest => chapterTest.id !== quizId)
                                            }
                                        } else {
                                            return chapter;
                                        }
                                    })
                                }
                            } else {
                                return semester;
                            }
                        })
                        return { semesters: newSemestrs }
                    })
                }
                setIsDeleted((isDeleted) => !isDeleted);
                setShowModal((showModal) => { return { ...showModal, show: false } });
            })
        }
        // setMainCourseData({
        //     semesters: mainCourseData.semesters.map((semester) => {
        //         if (semester.id === semId) {
        //             return {
        //                 ...semester, chapters: semester.chapters.map((chapter) => {
        //                     if (chapter.id === chapId) {
        //                         return {
        //                             ...chapter, chapterTest: chapter.chapterTest.filter((q) => q.id !== quizId)
        //                         }
        //                     } else {
        //                         return {
        //                             ...chapter
        //                         }
        //                     }
        //                 })
        //             }
        //         } else {
        //             return {
        //                 ...semester
        //             }
        //         }
        //     })
        // })

    }

    function handleDropdownClick(eventKey, type) {
       //console.log(semesterDropdown);
        if (type === 'semester') {
            setSemesterDropdown(semesterDropdown === eventKey ? '' : eventKey);
        } else if (type === 'chapter') {
            setChapterDropdown(chapterDropdown === eventKey ? '' : eventKey);
        }
    }

    function CustomToggle({ eventKey, type }) {
        const decoratedOnClick = useAccordionButton(eventKey, () =>
           console.log('totally custom!'),
        );

        return (
            <button
                type="button"
                style={{ border: 'none', backgroundColor: '#f8f9fa', padding: '0', }}
                onClick={() => { decoratedOnClick(); handleDropdownClick(eventKey, type); }}
            >
                <i className="fa-solid fa-caret-down"></i>
            </button>
        );
    }
    //sub branch


    function handleSemesterClick(semId, type) {

        // if parent data is not present fetch the data
       //console.log(mainCourseData);
        if (!mainCourseData) {
            setHighlight(`semester${semId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, null, 'semesters');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            setHighlight(`semester${semId}`);
            handleSlectedIds(semId, null, null, null, 'semesters');
        } else if (semId !== mainCourseData?.semesters[0].id && !isDataSaved) { //semid is diff and data is not saved
            //if parent data is present and user clicks on another sem and the data is not saved prompt to save

            setShowSaveDataModal(true);
        } else if (semId !== mainCourseData?.semesters[0].id && isDataSaved) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            setHighlight(`semester${semId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, null, 'semesters');
                }
            })
        }
        //check wether its the current sem or not
       //console.log("semester click handler")
        //set the selected semester parent state before that fetch the parent data


    }

    function handleChapterClick(semId, chapId) {
       //console.log(mainCourseData);
        if (!mainCourseData) {
            setHighlight(`chapter${chapId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
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
            setHighlight(`chapter${chapId}`);
        } else if (semId !== mainCourseData?.semesters[0].id && !isDataSaved) { //semid is diff and data is not saved
            //if parent data is present and user clicks on another sem and the data is not saved prompt to save
            setShowSaveDataModal(true);
        } else if (semId !== mainCourseData?.semesters[0].id && isDataSaved) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.'
            setHighlight(`chapter${chapId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
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
        if (!mainCourseData) {
            setHighlight(`section${secId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
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
            setHighlight(`section${secId}`);
            handleSlectedIds(semId, chapId, secId, null, 'sections')
        } else if (semId !== mainCourseData?.semesters[0].id && !isDataSaved) { //semid is diff and data is not saved
            //if parent data is present and user clicks on another sem and the data is not saved prompt to save
            setShowSaveDataModal(true);
        } else if (semId !== mainCourseData?.semesters[0].id && isDataSaved) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            setHighlight(`section${secId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
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
        if (!mainCourseData) {
            setHighlight(`chapterTest${quizId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                   //console.log(response.data);
                    handleSlectedIds(semId, chapId, null, quizId, 'chapterTest');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            setHighlight(`chapterTest${quizId}`);
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, chapId, null, quizId, 'chapterTest');
        } else if (semId !== mainCourseData?.semesters[0].id && !isDataSaved) { //semid is diff and data is not saved
            //if parent data is present and user clicks on another sem and the data is not saved prompt to save
            setShowSaveDataModal(true);
        } else if (semId !== mainCourseData?.semesters[0].id && isDataSaved) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            setHighlight(`chapterTest${quizId.id}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
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
        if (!mainCourseData) {
            setHighlight(`semesterTest${quizId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
                if (response.data.status === 'no data') {
                    //i.e semester row is not there 
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                    handleSlectedIds(semId, null, null, quizId, 'semesterTest');
                }
            })
        } else if (semId === mainCourseData?.semesters[0].id) {
            setHighlight(`semesterTest${quizId}`);
            //if parent data is present and semester is clicked then dont fetch data only change the local ids
            handleSlectedIds(semId, null, null, quizId, 'semesterTest');
        } else if (semId !== mainCourseData?.semesters[0].id && !isDataSaved) { //semid is diff and data is not saved
            //if parent data is present and user clicks on another sem and the data is not saved prompt to save
            setShowSaveDataModal(true);
        } else if (semId !== mainCourseData?.semesters[0].id && isDataSaved) { //semid is diff and data is saved
            //then make axios call to fetch new sem data and dont show the save data first prompt.
            setHighlight(`semesterTest${quizId}`);
            axios.get("http://localhost:3001/api/get-parent-data", {
                params: {
                    semesterId: semId,
                    courseId: courseId
                }
            }).then((response) => {
               //console.log("response", response)
                if (response.data.status === 'no data') {
                } else {
                    //there is semester row 
                    setMainCourseData(response.data);
                   //console.log("response.data", response.data);
                    handleSlectedIds(semId, null, null, quizId, 'semesterTest');
                }
            })
        }
    }


    return (
        <>
            <div style={{ overflow: 'auto', height: '90%' }}>
                {
                    <>
                        <MyModal showModal={showModal} setShowModal={setShowModal}
                            setSemesterName={setSemesterName} semesterName={semesterName}
                            chapterName={chapterName} setChapterName={setChapterName}
                            sectionName={sectionName} setSectionName={setSectionName}
                            quizName={quizName} setQuizName={setQuizName}
                            newName={newName} setNewName={setNewName}
                            error={error} setError={setError}
                            addSemester={addSemester} editSemesterName={editSemesterName} deleteSemester={deleteSemester}
                            addChapter={addChapter} editChapterName={editChapterName} deleteChapter={deleteChapter}
                            addSection={addSection} editSectionName={editSectionName} deleteSection={deleteSection}
                            addSectionLevelQuiz={addSectionLevelQuiz} editChapterLevelQuizName={editChapterLevelQuizName} deleteSectionLevelQuiz={deleteSectionLevelQuiz}
                            addQuizBelowChapters={addQuizBelowChapters} editQuizName={editQuizName} deleteChapterLevelQuiz={deleteChapterLevelQuiz}
                        ></MyModal>
                    </>
                }
                {sidebarData && <Accordion defaultActiveKey={semesterDropdown}>

                    {sidebarData.semesters?.map((semester, semIndex) => (
                        <Card>
                            <Card.Header className={highlight === `semester${semester.id}` ? 'highlight' : ''}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                    onMouseEnter={() => { setIsHovering(`sem${semester.id}`) }}
                                    onMouseLeave={() => { setIsHovering(null) }}
                                    title={`${semester.name}`}
                                > 
                                    
                                    <label onClick={() => { handleSemesterClick(semester.id, 'semester'); setSemesterDropdown(`${semIndex}`); }}
                                        style={{ cursor: 'pointer', maxWidth: '70%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {semester.name}
                                    </label>
                                    <span>
                                        {isHovering === `sem${semester.id}` && <i className="fa-solid fa-pen me-2"
                                            onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, type: 'semester', action: 'edit', show: true, title: `Edit Semester Name`, name: semester.name } })}
                                            style={{ cursor: "pointer" }}
                                        ></i>}
                                        {isHovering === `sem${semester.id}` && <i className="fa-regular fa-circle-xmark me-2"
                                            onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, type: 'semester', action: 'delete', show: true, title: 'delete semseter', name: semester.name } })}
                                            style={{ cursor: 'pointer', marginRight: "3px" }}></i>}
                                        <CustomToggle eventKey={`semester${semester.id}`} type={`semester`} />
                                    </span>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey={`semester${semester.id}`}>
                                <Card.Body className='testing'>
                                    <Accordion defaultActiveKey={chapterDropdown}>
                                        {
                                            semester.chapters.map((chapter, chapIndex) => (
                                                <Card>
                                                    <Card.Header className={highlight === `chapter${chapter.id}` ? 'highlight' : ''}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                            }}
                                                            onMouseEnter={() => { setIsHovering(`chapter${chapter.id}`) }}
                                                            onMouseLeave={() => { setIsHovering(null) }}
                                                            title={`${chapter.name}`}
                                                        >
                                                            <label onClick={() => { handleChapterClick(semester.id, chapter.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{chapter.name}</label>
                                                            <span>
                                                                {isHovering === `chapter${chapter.id}` && <i className="fa-solid fa-pen me-1"
                                                                    onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, chapId: chapter.id, action: 'edit', type: 'chapter', name: chapter.name, show: true, title: 'Edit Chapter' } })}
                                                                    style={{ cursor: 'pointer' }}></i>}
                                                                {isHovering === `chapter${chapter.id}` && <i className="fa-regular fa-circle-xmark me-1"
                                                                    onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, chapId: chapter.id, type: 'chapter', action: 'delete', show: true, title: 'Delete Chapter', name: chapter.name } })}
                                                                    style={{ cursor: 'pointer', marginRight: "3px" }}></i>}
                                                                <CustomToggle eventKey={`chapter${chapter.id}`} type={`chapter`} ></CustomToggle>
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
                                                                                onMouseEnter={() => { setIsHovering(`section${section.id}`) }}
                                                                                onMouseLeave={() => { setIsHovering(null) }}
                                                                                title={section.name}
                                                                            >

                                                                                <label onClick={() => { handleSectionClick(semester.id, chapter.id, section.id); setCurrentSection(section.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{section.name}</label>

                                                                                <span>{isHovering === `section${section.id}` && <i className="fa-solid fa-pen me-0" onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, chapId: chapter.id, secId: section.id, name: section.name, type: 'section', action: 'edit', show: true, title: 'Edit Section' } })} style={{ cursor: 'pointer' }}></i>}
                                                                                    {isHovering === `section${section.id}` && <i className="fa-regular fa-circle-xmark me-0" onClick={() => setShowModal((showModal) => { return { ...showModal, semId: semester.id, chapId: chapter.id, secId: section.id, name: section.name, type: 'section', action: 'delete', show: true, title: 'Delete Section' } })} style={{ cursor: 'pointer', marginRight: "3px" }}></i>}
                                                                                </span>
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
                                                                                onMouseEnter={() => { setIsHovering(`chapterTest${q.id}`) }}
                                                                                onMouseLeave={() => { setIsHovering(null) }}
                                                                                title={`${q.name}`}
                                                                            >
                                                                                <i class="fa-solid fa-clipboard-question test-icon"></i>
                                                                                <label onClick={() => { handleChapterTestClick(semester.id, chapter.id, q.id); setCurrentSection(q.id);}} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
                                                                                <span>{isHovering === `chapterTest${q.id}` && <i className="fa-solid fa-pen me-0" onClick={() => setShowModal((showModal) => { return { ...showModal, chapTestId: q.id, semId: semester.id, chapId: chapter.id, name: q.name, type: 'chapTest', action: 'edit', show: true, title: 'Edit Test' } })} style={{ cursor: 'pointer' }}></i>}
                                                                                    {isHovering === `chapterTest${q.id}` && <i className="fa-regular fa-circle-xmark me-0" onClick={() => setShowModal((showModal) => { return { ...showModal, chapTestId: q.id, semId: semester.id, chapId: chapter.id, name: q.name, type: 'chapTest', action: 'delete', show: true, title: 'Delete Test' } })} style={{ cursor: 'pointer', marginRight: "3px" }}></i>}
                                                                                </span>
                                                                            </div>
                                                                        </Card.Header>
                                                                    </Card>
                                                                ))
                                                            }
                                                            <div >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0px' }}>
                                                                    <span>Add Section</span><i style={{ marginLeft: "7px", cursor: 'pointer' }} onClick={() => { setShowModal({ ...showModal, semId: semester.id, chapId: chapter.id, semIndex: semIndex, chapIndex: chapIndex, type: 'section', action: 'add', show: true, title: 'Add Section' }) }} className="fa-solid fa-plus"></i>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0px' }}>
                                                                    <span>Add Test</span><i style={{ marginLeft: "7px", cursor: 'pointer' }} onClick={() => { setShowModal({ ...showModal, semId: semester.id, chapId: chapter.id, semIndex: semIndex, chapIndex: chapIndex, type: 'chapTest', action: 'add', show: true, title: 'Add Test' }) }} className="fa-solid fa-plus"></i>
                                                                </div>

                                                            </div>
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
                                                        onMouseEnter={() => { setIsHovering(`semesterTest${q.id}`) }}
                                                        onMouseLeave={() => { setIsHovering(null) }}
                                                        title={q.name}
                                                    >
                                                        <i class="fa-solid fa-clipboard-question test-icon"></i>
                                                        <label onClick={() => { handleSemesterTestClick(semester.id, q.id); }} style={{ cursor: 'pointer', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
                                                        <span>
                                                            {isHovering === `semesterTest${q.id}` && <i className="fa-solid fa-pen me-1"
                                                                onClick={() => setShowModal((showModal) => { return { ...showModal, type: 'semTest', action: 'edit', semId: semester.id, semTestId: q.id, show: true, title: 'Edit Test' } })}
                                                                style={{ cursor: 'pointer' }}></i>}
                                                            {isHovering === `semesterTest${q.id}` && <i className="fa-regular fa-circle-xmark me-1"
                                                                onClick={() => setShowModal((showModal) => { return { ...showModal, type: 'semTest', action: 'delete', semId: semester.id, semTestId: q.id, show: true, title: 'Delete Test' } })}
                                                                style={{ cursor: 'pointer', marginRight: "3px" }}></i>
                                                            }
                                                        </span>
                                                    </div>
                                                </Card.Header>
                                            </Card>
                                        ))
                                    }
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 7px' }}>
                                            <span>Add Chapter</span><i style={{ marginLeft: "7px", cursor: 'pointer' }} onClick={() => { setShowModal({ ...showModal, semId: semester.id, semIndex: semIndex, show: true, type: 'chapter', action: 'add', title: 'Add Chapter' }) }} className="fa-solid fa-plus"></i>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px  7px' }}>
                                            <span>Add Test</span><i style={{ marginLeft: "7px", cursor: 'pointer' }} onClick={() => { setShowModal({ ...showModal, semId: semester.id, semIndex: semIndex, show: true, type: 'semTest', action: 'add', title: 'Add Test' }) }} className="fa-solid fa-plus"></i>
                                        </div>

                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    ))
                    }
                </Accordion>
                }
                <div className="add-semester-button-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 10px' }}>
                        <span>Add Semester</span><i style={{ cursor: 'pointer' }} onClick={() => { setShowModal({ ...showModal, type: 'semester', action: 'add', show: true, title: 'Add Semester' }) }} className="fa-solid fa-plus bg-glow"></i>
                    </div>
                </div>
            </div>
        </>);
}

export default SideBar;