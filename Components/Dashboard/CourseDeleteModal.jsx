import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function CourseDeleteModal({showDeleteModal,handleCloseDeleteModal , deleteCourse}) {

  return (
    <>
      <Modal show={showDeleteModal.state} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the course</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>{ deleteCourse(showDeleteModal.courseId);handleCloseDeleteModal();}}>
            Yes
          </Button>
          <Button variant="primary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CourseDeleteModal;