import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const SaveDataModal = ({ showSaveDataModal, setShowSaveDataModal, handleSaveCourse }) => {

  function handleCloseSaveDataModal() {
    setShowSaveDataModal(false);
  }


  return (<>
    <Modal show={showSaveDataModal} onHide={handleCloseSaveDataModal}>
      <Modal.Header closeButton>
        <Modal.Title>Save Changes</Modal.Title>
      </Modal.Header>
      <Modal.Body>Save Changes first or cancel </Modal.Body>
      <Modal.Footer>
        {/* we will save changes , then redirect ? to that new sem? */}
        <Button variant="primary" onClick={() => { handleCloseSaveDataModal(); handleSaveCourse() }}>
          Save Changes
        </Button>
        <Button variant="secondary" onClick={()=>{handleCloseSaveDataModal();}}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  </>);
}

export default SaveDataModal;