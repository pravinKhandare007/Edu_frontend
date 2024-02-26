import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

const DeleteSlideModal = ({ showDeleteSlideModal, setShowDeleteSlideModal, deleteSlide }) => {
  const [ isDisabled , setIsDisabled ] = useState(false);
  function handleCloseDeleteModal() {
    setShowDeleteSlideModal(false);
  }


  return (<>
    <Modal show={showDeleteSlideModal} onHide={handleCloseDeleteModal}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Slide</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete the slide? </Modal.Body>
      <Modal.Footer>
        {/* we will save changes , then redirect ? to that new sem? */}
        <Button variant="secondary" onClick={()=>{handleCloseDeleteModal();}}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => { handleCloseDeleteModal(); deleteSlide(); }}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  </>);
}

export default DeleteSlideModal;