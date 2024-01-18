import React from "react";
import "../../Styles/CreateCourse.css";
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const CreateCourse = () => {
    const notify = () => toast.success('Successfully created !!');

  return (
    <section className="create__course">
      <div className="container">
        <div className="h-text create__course-heading">Create Course</div>
        <div className="content">
          <form action="#">
            <div className="user-details">
              <div className="input-box">
                <span className="details">Course Name</span>
                <input
                  type="text"
                  placeholder="Ex: Chemistry Basics"
                  required
                />
              </div>
              <div className="input-box">
                <span className="details">Subject Name</span>
                <input type="text" placeholder="Ex: Science" required />
              </div>
              <div className="input-box">
                <span className="details">Chapter Name</span>
                <input
                  type="text"
                  placeholder="Ex: Chemical Reactions Overview"
                  required
                />
              </div>
              <div className="input-box">
                <span className="details">Class</span>
                <input type="text" placeholder="Ex: 10" required />
              </div>
              <div className="input-box">
                <span className="details">Term</span>
                <input type="number" placeholder="Ex: 2 " min="1" max="3" required />
              </div>
              <div
                className="input-box"
                style= {{ display: "block", width: "100%", marginTop: "1rem" }}
              >
                <span className="details">Chapter Overview</span>
                <input
                  type="text"
                  placeholder="Ex: Understanding chemical reactions"
                  maxlength = "255"
                  required
                />
              </div>
            </div>
            <Link to="/course-builder">
              <button className="primary_cta_button" onClick={notify}>Create Course</button>
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateCourse;
