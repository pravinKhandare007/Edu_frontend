import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from "uuid";
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';

const SideBarPreview = ({ mainCourseData, handleSlectedPreviewIds, previewChapterDropdown, previewSemesterDropdown ,
    previewHighlight,  setPreviewHighlight
}) => {

    console.log("maincourseData : ", mainCourseData);

    const [currentSection, setCurrentSection] = useState("");

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

    return (
        <>
            <div style={{ overflow: 'auto', height: '90%' }}>
                <Accordion defaultActiveKey={previewSemesterDropdown}>
                    {
                        mainCourseData.semesters.map((semester, semIndex) => (
                            <Card>
                                <Card.Header className={previewHighlight === `semester${semester.id}` ? 'highlight':''}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                        title={`${semester.name}`}
                                    >
                                        <label onClick={() => { handleSlectedPreviewIds(semester.id, null, null, null, 'semesters'); setPreviewHighlight(`semester${semester.id}`) }}
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
                                        <Accordion defaultActiveKey={previewChapterDropdown}>
                                            {
                                                semester.chapters.map((chapter, chapIndex) => (
                                                    <Card>
                                                        <Card.Header className={previewHighlight === `chapter${chapter.id}` ? 'highlight':''}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between'
                                                                }}
                                                                title={`${chapter.name}`}
                                                            >
                                                                <label onClick={() => { handleSlectedPreviewIds(semester.id, chapter.id, null, null, 'chapters');setPreviewHighlight(`chapter${chapter.id}`) }} style={{ cursor: 'pointer', maxWidth: '63%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{chapter.name}</label>
                                                                <span>
                                                                    <CustomToggle eventKey={`chapter${chapter.id}`}>Click me!</CustomToggle>
                                                                </span>

                                                            </div>
                                                        </Card.Header>
                                                        <Accordion.Collapse eventKey={`chapter${chapter.id}`}>
                                                            <Card.Body className='testing-2'>
                                                                {
                                                                    chapter.sections.map((section, secIndex) => (
                                                                        <Card>
                                                                            <Card.Header className={previewHighlight === `section${section.id}` ? 'highlight':''}>
                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignContent: "center",
                                                                                    }}
                                                                                    title={section.name}
                                                                                >

                                                                                    <label onClick={() => { handleSlectedPreviewIds(semester.id, chapter.id, section.id, null, 'sections');setPreviewHighlight(`section${section.id}`) }} style={{ cursor: 'pointer', maxWidth: '63%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{section.name}</label>
                                                                                </div>
                                                                            </Card.Header>
                                                                        </Card>
                                                                    ))
                                                                }
                                                                {
                                                                    chapter.chapterTest.map((q) => (
                                                                        <Card>
                                                                            <Card.Header className={previewHighlight === `chapterTest${q.id}` ? 'highlight':''}>
                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignContent: "center",
                                                                                    }}
                                                                                    title={`${q.name}`}
                                                                                >
                                                                                    <label onClick={() => { handleSlectedPreviewIds(semester.id, chapter.id, null, q.id, 'chapterTest'); setPreviewHighlight(`chapterTest${q.id}`) }} style={{ cursor: 'pointer', maxWidth: '63%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
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
                                                    <Card.Header className={previewHighlight === `semesterTest${q.id}` ? 'highlight':''}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between'
                                                            }}
                                                            title={q.name}
                                                        >
                                                            <label onClick={() => { handleSlectedPreviewIds(semester.id, null, null, q.id, 'semesterTest');setPreviewHighlight(`semesterTest${q.id}`); }} style={{ cursor: 'pointer', maxWidth: '63%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{q.name}</label>
                                                            <span>
                                                            </span>
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

            </div>

        </>);
}

export default SideBarPreview;