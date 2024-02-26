import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../Styles/PublishCourse.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import CourseDeleteModal from "./CourseDeleteModal";


const AllCourses = () => {
  const [userCourses, setUserCourses] = useState([]);
  const [showPopUp, setShowPopUp] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState({state:false , courseId:null});
  
  const navigate = useNavigate();
  useEffect(() => {
    try {
      // Retrieve the JWT token from localStorage
      const userId = localStorage.getItem("auth");
      //we can send only the userId 
      if (userId) {
        axios
          .post("http://localhost:3001/api/fetch-user-data", {
            user_id: userId,
          })
          .then((res) => {
            setUserCourses(res.data.userData || []);
            console.log(res.data.userData);
          })
          .catch((error) => {
            console.error("Error fetching user courses:", error);
          });
      }
    } catch (error) {
      console.error("Error parsing JWT token:", error);
    }
  }, []); // Empty dependency array to trigger the effect once on mount

  // useEffect(()=>{
  //   document.addEventListener('click' , ()=>{
  //     console.log('clicked')
  //     setShowPopUp('');
  //   })

  //   return ()=>{
  //     document.removeEventListener('click',(e)=>{

  //       console.log("removed");
  //     })
  //   }
  // },[])
  // JSX rendering of the component
  function deleteCourse(courseId){
    axios.delete('http://localhost:3001/api/delete-course',{
      data:{
        courseId:courseId
      }
    }).then((response)=>{
      if(response.data.status === 'success'){
        setUserCourses((userCourses)=>{
          const newUserCourses = userCourses.filter(userCourse => userCourse.course_id !== courseId );
          return newUserCourses;
        })
      }
    })
  }

  function handleDelete(courseId){
    setShowDeleteModal({state:true , courseId:courseId });
  }

  function handleCloseDeleteModal(){
    setShowDeleteModal({state:false , courseId:null});
  }
  return (
    <>
      <CourseDeleteModal showDeleteModal={showDeleteModal} handleCloseDeleteModal={handleCloseDeleteModal} deleteCourse={deleteCourse}/>
      <section className="publish__course"> 
        <div className="publish__course-header">
          <h3 className="publish__course-heading h-text ">Courses</h3>

          <div className="buttons">
            <div class="container-input">
              <input
                type="text"
                placeholder="Search"
                name="text"
                class="search-input"
              />
              <svg
                fill="#000000"
                width="20px"
                height="20px"
                viewBox="0 0 1920 1920"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="icons">
              <div className="filter-icon">
                <i class="bx bx-filter-alt "></i>
              </div>
              <div className="order-icon">
                <i class="bx bx-objects-vertical-bottom"></i>
              </div>
            </div>

            <Link to="/create-course"> <button className="cta_button">Create Course</button></Link>

          </div>
        </div>

        <div className="publish__course-details">
          <div className="content__card-full-length"></div>
          <div className="cards">
            <table className="content__card-table">
              <tbody>
                <tr>
                  <th className="content__table-col-heading">S.No.</th>
                  <th className="content__table-col-heading">Subject</th>
                  <th className="content__table-col-heading">Course Name</th>
                  <th className="content__table-col-heading">Total Chapters</th>
                  <th className="content__table-col-heading">Status</th>
                  <th className="content__table-col-heading"></th>
                </tr>
                {userCourses.map((course, index) => (
                  
                  <tr key={index} className="content__table" onClick={(e) => { console.log("course.course_id", course.course_id); navigate(`/preview/${course.course_id}`) }}>
                    <td className="content__table-data">{index + 1}</td>
                    <td className="content__table-data">{course.subject_name}</td>
                    <td className="content__table-data">{course.course_name}</td>
                    <td className="content__table-data">
                      {course.total_chapters}
                    </td>
                    <td className="content__table-data">{course.status}</td>
                    <td style={{ position: 'relative' }} className="content__table-data" onClick={(e) => {
                      e.stopPropagation();
                      setShowPopUp((showPopUp) => {
                        if (showPopUp) {
                          return '';
                        } else {
                          return course.course_id
                        }
                      })
                    }}>
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                      <div className={`${(showPopUp === course.course_id) ? "show-pop-up" : 'hide-pop-up'}`}>
                        <span  onClick={(e) => { navigate(`/course-builder/${course.course_id}`) }}>edit</span>
                        <span onClick={(e) => { navigate(`/preview/${course.course_id}`) }}>preview</span>
                        <span onClick={()=>{handleDelete(course.course_id)}}>delete</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>

  );
};

export default AllCourses;