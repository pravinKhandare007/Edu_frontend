import { useEffect, useState } from "react";
import { Resizable } from 're-resizable';
import './McqComponent.css'
import axios from "axios";

const McqComponent = ({ setImageIdArray, imageIdArray, setFetchedImageIdArray, setImagesArray, fetchedImageIdArray, setSlidesData,
    slideId, contentId, slidesData, data, isSorted, setIsDataSaved, imagesArray }) => {
    //isSorted is toggled when there is a sort opration, isSorted is required because McqComponent was not setting the data from the parent after the sort happend 
    //console.log("rendering mcq component")
    const [mcq, setMcq] = useState(null);
   console.log("------------------------------------data passed by react " , mcq);
    useEffect(() => {
       console.log('1st useEfect setting mcq data');
        if (data) {
           console.log("data exists ", data);
            setMcq(data);
        } else {
            console.log("data does not exists ", data);
            setMcq({
                question: '',
                options: [''],
                correctAnswer: { option0: false },
                type: 'single',
                imageData: { image: '', width: '400px', height: '' }
            });
        }
    }, [slideId, isSorted]);

    useEffect(() => {
        //for this component check if image was uploaded
        console.log('2nd useEffect image useEffect');
        if (mcq?.imageData?.image) {
            console.log('step 1 image data exists ' , )
            //means image was uploaded
            //now check if it is in s3 or not 
            if (!imagesArray.includes(contentId)) {
                console.log('step 2 image exists in s3 ' , )
                //that means the image is in s3
               //console.log('step 2' ,!imagesArray.includes(contentId) )
                //now check if image was fetched from s3
                if (!fetchedImageIdArray.includes(contentId)) {
                    console.log('step 3 fetching image ' , )
                   //console.log('step 3' , !fetchedImageIdArray.includes(contentId))
                    //that means image was not fetched from s3
                    getImage();
                } else {
                    //means it was fetched from s3
                    //do nothing
                }
            } else {
                //image was just added so no need to do anything
            }
        }
    },[mcq]) //dependency array not given was the mistake 

    useEffect(() => {
        console.log("useEffect 3 setting parent data to ", mcq);
        setSlidesData((slidesData) => {
            const newSlidesData = { ...slidesData };
            newSlidesData.slides = slidesData.slides.map((slide) => {
                //console.log("slide id : ", slideId);
                if (slide.id === slideId) {
                    return {
                        ...slide, content: slide.content.map((contentObj) => {
                            if (contentId === contentObj.id) {
                                return {
                                    ...contentObj, data: mcq
                                }
                            } else {
                                return {
                                    ...contentObj
                                }
                            }
                        })
                    }
                } else {
                    return {
                        ...slide
                    }
                }
            })

            return newSlidesData;

        })
    }, [mcq])

    function getImage() {
        console.log('inside getImage function')
        axios.get('http://localhost:3001/api/get-image', {
            params: {
                imageId: contentId
            }
        }).then((response) => {
            if(response.data.status === 'success'){
                console.log('get image function is setting mcq data');
                setFetchedImageIdArray((fetchedImageIdArray) => {
                    fetchedImageIdArray.push(contentId);
                    return fetchedImageIdArray;
                })
                setMcq((mcq) => {
                    const newMcq = { ...mcq, imageData: { ...mcq.imageData, image: response.data.dataUrl } };
                    return newMcq;
                })
            }else{
               //console.log('response was not ok');
            }
        })
    }

    function updateQuestion(e) {
        setMcq({ ...mcq, question: e.target.value });
        setIsDataSaved(false);
    }

    function saveCorrectAnswer(e, optionIndex) {
        if (mcq.type === 'single') {
            const newCorrectAnswer = { ...mcq.correctAnswer };//new obj option0 option1
            //console.log("newCorrectAnswer 1", newCorrectAnswer)
            newCorrectAnswer[`option${optionIndex}`] = true;
            //console.log("newCorrectAnswer 2", newCorrectAnswer)
            for (let option in newCorrectAnswer) {
                if (option !== `option${optionIndex}`) {
                    //console.log("key : ", option, "mathched with ", `option${optionIndex}`);
                    newCorrectAnswer[option] = false; //one word takes 2 hours to debug 
                }
                //console.log("newCorrectAnswer", newCorrectAnswer)
            }
            //console.log("newCorrectAnswer last", newCorrectAnswer)
            setMcq({ ...mcq, correctAnswer: newCorrectAnswer });
        }
        if (mcq.type === "multiple") {
            if (e.target.checked) {
                const newCorrectAnswer = { ...mcq.correctAnswer };
                newCorrectAnswer[`option${optionIndex}`] = true;
                setMcq({ ...mcq, correctAnswer: newCorrectAnswer });
            } else {
                const newCorrectAnswer = { ...mcq.correctAnswer };
                newCorrectAnswer[`option${optionIndex}`] = false;
                setMcq({ ...mcq, correctAnswer: newCorrectAnswer });
            }
        }
        setIsDataSaved(false);
    }

    function saveOption(e, optionIndex) {
        const newMcq = { ...mcq };
        newMcq.options[optionIndex] = e.target.value;
        const newCorrectAnswer = { ...newMcq.correctAnswer }
        if (!e.target.value) {
            newCorrectAnswer[`option${optionIndex}`] = false;
            //console.log(newCorrectAnswer);
        }
        newMcq.correctAnswer = newCorrectAnswer;
        setMcq(newMcq);
        setIsDataSaved(false);
    }

    function addOption() {
        const newMcq = { ...mcq };
        newMcq.options.push('');
        newMcq.correctAnswer[`option${newMcq.options.length - 1}`] = false;
        setMcq(newMcq);
        setIsDataSaved(false);
    }

    function deleteOption(optIndex) {
        setMcq({ ...mcq, options: mcq.options.filter((option, index) => index !== optIndex) });
        setIsDataSaved(false);
    }

    function handleSingleOrMultiple(e) {
        const newCorrectAnswer = { ...mcq.correctAnswer };
        for (let option in newCorrectAnswer) {
            newCorrectAnswer[option] = false;
        }
        setMcq({ ...mcq, type: e.target.value, correctAnswer: newCorrectAnswer });
        setIsDataSaved(false);
    }

    function handleImageUpload(event) {
        const image = event.target.files[0];
        const url = URL.createObjectURL(image);
        //console.log("asdfsadfsdf" , url);
        event.target.value = null;
        setImageIdArray((imageIdArray) => {
           //console.log("imageIdArray", imageIdArray); //printing undefined. 
            if (imageIdArray.includes(contentId)) {
                //that means the image id is already present we dont update the array. 
                return;
            }
            const newImageIdArray = [...imageIdArray];
            newImageIdArray.push(contentId)
            return newImageIdArray;
        })
        setFetchedImageIdArray((fetchedImageIdArray) => {
            const newFetchedImageIdArray = [...fetchedImageIdArray];
            newFetchedImageIdArray.push(contentId);
           //console.log(newFetchedImageIdArray);
            return newFetchedImageIdArray;
        })
        setImagesArray((imagesArray) => {
            //check necessary -- if user is uploading different image after uploading a image.
            //so if an oabject already exist for that image we need to update its data property
            if (imagesArray.some(imgObj => imgObj.id === contentId)) {
                //we are inside this block means an image was alreay uploaded we need to re-write the data
                //any cases to handle wrt imageIdArray 
                //lets say user uploads an image that means it is pushed in the imageIdArray ,
                //now he uploads another image without deleting the previous in that case we dont update imageIdArray 
                //now if he deletes the image and then uploads another then we dont need to handle anything
                return imagesArray.map((imageObject) => {
                    if (imageObject.id === contentId) {
                        return {
                            ...imageObject, data: image
                        }
                    } else {
                        return imageObject;
                    }
                })

            }
            const newImagesArray = [...imagesArray];
            newImagesArray.push({ id: contentId, data: image });
           //console.log(newImagesArray);
            return newImagesArray;
        })
        setMcq({ ...mcq, imageData: { ...mcq.imageData, image: url } });
        setIsDataSaved(false);
    }

    function handleResize(e, d, ref, delta) {
        setMcq({ ...mcq, imageData: { ...mcq.imageData, width: ref.style.width, height: ref.style.height, } });
        setIsDataSaved(false);
    }

    function handleDeleteImage() {
        //make an api call to delete from s3 bucket 
        //on save empty the imagesArray so after that if user deletes we know to make api call
        //and if on delete the image is in array we dont make an api call we just remove from ImagesArray.

        if (!imagesArray.some(obj => obj.id === contentId)) {
            //make an api call to remove the image from s3 bucket and also remove it from mcq
            axios.delete('http://localhost:3001/api/delete-image', {
                data: {
                    key: contentId
                }
            }).then((response) => {
                if (response.data.message === 'deleted successfully') {
                    setMcq({ ...mcq, imageData: { ...mcq.imageData, image: '', width: '400px', height: '300px' } });
                    setImageIdArray((imageIdArray) => {
                        if (imageIdArray.length !== 0) {
                            return imageIdArray.filter(imageId => imageId !== contentId);
                        }
                    })
                }
            })
        } else {
            setImagesArray((imagesArray) => {
                const newImagesArray = [...imagesArray];
                if (newImagesArray.length !== 0) {
                    return newImagesArray.filter((obj) => obj.id !== contentId);
                }
            })
            setImageIdArray((imageIdArray) => {
                if (imageIdArray.length !== 0) {
                    return imageIdArray.filter(imageId => imageId !== contentId);
                }
            })
            setMcq({ ...mcq, imageData: { ...mcq.imageData, image: '', width: '400px', height: '300px' } });
        }
        setIsDataSaved(false);
    }

   //console.log('%%%%%%%%%%%%%%%%%%%%%' , mcq?.imageData.image);

    return (
        <>
            {
                mcq &&
                <div className="border p-3">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <span>Q{')'}</span>
                        <textarea rows={3} type="text" placeholder="Question" value={mcq.question} onChange={(e) => { updateQuestion(e) }} style={{ width: '90%', marginBottom: '10px', resize: 'none' }}></textarea>
                        <div>
                            <label htmlFor={`mcq-image${contentId}`}><i style={{ cursor: 'pointer' }} className="fa-regular fa-image"></i></label>
                            <input type='file' accept='image/*' id={`mcq-image${contentId}`} onChange={(event) => handleImageUpload(event)} style={{ display: "none" }}></input>
                        </div>

                    </div>
                    {
                        mcq.imageData.image ? (
                            fetchedImageIdArray.includes(contentId) ? (
                                <div style={{ width: "100%", display: "flex", justifyContent: "start", paddingLeft: '22px', justifyContent: 'space-between' }}>
                                    <Resizable
                                        size={{
                                            width: mcq.imageData.width,
                                            height: mcq.imageData.height
                                        }}
                                        maxWidth='100%'
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                        lockAspectRatio={false}
                                        onResizeStop={(e, d, ref, delta) => handleResize(e, d, ref, delta)}
                                    >
                                        <img src={mcq.imageData.image} style={{ height: "100%", width: "100%" }}></img>
                                    </Resizable>
                                    <i style={{ cursor: 'pointer' }} onClick={handleDeleteImage} className="fa-regular fa-circle-xmark"></i>
                                </div>
                            ) : null
                        ) : null
                    }
                    <select style={{ marginLeft: '22px', marginTop: '10px' }} onChange={handleSingleOrMultiple} value={mcq.type}>
                        <option value={"single"}>Single correct</option>
                        <option value={"multiple"}>Multiple correct</option>
                    </select>
                    {
                        mcq.type === "single" ? (
                            mcq.options.map((option, optionIndex) => {
                                return (
                                    <div key={optionIndex} style={{ marginLeft: '22px', marginTop: '10px', display: 'flex', gap: '5px' }}>
                                        <input type="radio" value={option} checked={mcq.correctAnswer[`option${optionIndex}`]} name="radio" onChange={(e) => { saveCorrectAnswer(e, optionIndex) }} />
                                        <span>{`${String.fromCharCode(65 + optionIndex)})`}</span>
                                        <input type="text" placeholder={`option ${optionIndex + 1}`} value={option} onChange={(e) => { saveOption(e, optionIndex) }} style={{ width: '90%', border: 'none', outline: "none" }} />
                                        <i onClick={() => { deleteOption(optionIndex) }} style={{ cursor: "pointer" }} className="fa-regular fa-circle-xmark"></i>
                                    </div>
                                )
                            })) : (
                            mcq.options.map((option, optionIndex) => {
                                return (
                                    <div key={optionIndex} style={{ marginLeft: '22px', marginTop: '10px', display: 'flex', gap: '5px' }}>
                                        <input type="checkbox" value={option} checked={mcq.correctAnswer[`option${optionIndex}`]} disabled={!option} name="radio" onChange={(e) => { saveCorrectAnswer(e, optionIndex) }} />
                                        <span>{`${String.fromCharCode(65 + optionIndex)})`}</span>
                                        <input type="text" placeholder={`option ${optionIndex + 1}`} value={option} onChange={(e) => { saveOption(e, optionIndex) }} style={{ width: '90%', border: 'none', outline: "none" }} />
                                        <i onClick={() => { deleteOption(optionIndex) }} style={{ cursor: "pointer" }} className="fa-regular fa-circle-xmark"></i>
                                    </div>
                                )
                            }
                            ))
                    }
                    <button style={{ marginLeft: '22px', marginTop: '10px' }} onClick={addOption} className="add-option">Add Option</button>
                    <div style={{ padding: '0.5rem' }}>
                        <span>Note: Mark the correct answer/answers for the question.</span>
                    </div>
                </div>

            }
        </>
    );
}

export default McqComponent;