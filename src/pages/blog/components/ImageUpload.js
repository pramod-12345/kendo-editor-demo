import React, { useState, useRef, useEffect } from 'react'
//import { useSelected, useFocused, useSlate } from 'slate-react';
// import { useSlate } from 'slate-react';
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap';
import useOutsideClick  from 'components/hoc/OutsideClick'
// import { Field } from 'redux-form';
import {  EditorState, AtomicBlockUtils } from 'draft-js';
import { Modal } from 'react-bootstrap';
import UploadImage from './uploadImage';
import { dataURLtoFile, getDomain, uId , debounce, getResizeImage   } from 'utils/helpers';
import { imageUpload } from 'middleware/assessments';
import { useSelector , useDispatch } from 'react-redux'
import { getUnsplash } from 'middleware/assessments'
import { change as reduxChange } from 'redux-form'

const ImageUpload = (props) => {
    const { formName, blogFormData,pageFormData, handleSubmit, setEditorState ,editorState } = props
    const inputRef = useRef(null)
    const form = useSelector((state) => state.form[ formName ] )
    const dispatch = useDispatch()
    const [ loading , setLoader ] = useState(false)
    const [ open, toggleModal ] = useState(false);
    const handleModal = () => {
        toggleModal(!open);
    }
    useEffect(() => {
        //dispatch(getUnsplash('/photos' ))
    },[ ])
    const handleSearch = (event) => {
        const query = event.target.value
        dispatch(getUnsplash('/photos',query))
    }

    const unsplashImages  = useSelector((state) => state.assessment.unsplashImages)
    const insertImage = (url) => {

        const entityData = { src:url, height: 'auto', width: 'auto', alt: url };
        const contentStateWithEntity=editorState.getCurrentContent().createEntity('IMAGE', 'IMMUTABLE', entityData);

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        let newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity },);
        newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState,entityKey,' ',);
        return newEditorState
    };
    const clearImage = () =>{
        dispatch(reduxChange(formName, 'slateImage', null))
    }
    const submitData = async () => {
        if ((pageFormData || blogFormData).slateImage && !(pageFormData || blogFormData).slateImage.match('^(http|https)://')){
            setLoader(true)
            const file = dataURLtoFile((pageFormData || blogFormData).slateImage,uId()+'.png')
            const compressedFile = await getResizeImage(file, 700, 700, 'WEBP', 'file',80);
            const newUrl = await imageUpload(getDomain(),'blog-images',compressedFile);
            const dd = (insertImage(newUrl))
            setEditorState(dd)
            setLoader(false)
            toggleModal(!open);
            clearImage()
        }
    }
    const getBase64 = (base64) =>{
        dispatch(reduxChange(formName, 'slateImage', base64))
    }

    useOutsideClick(inputRef, () => {
        inputRef.current.blur()
    });

    return (

        <>
            <Modal show={ open }  onHide={ handleModal } className="image-upload-modal new-modal" >
                <Modal.Header closeButton>
                    <div className="new-modal-header">
                        <Modal.Title> Add Image</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="image-upload-modal-search">
                        <Form.Group>
                            <input ref={ inputRef } onClick={ () => {
                                inputRef.current.focus()
                            } } onChange={ (event) => debounce(handleSearch,event,1000) } disabled={ false } name='search' className='form-control' />
                        </Form.Group>
                        <div className="powered-by-unsplash">
                            <a href="https://unsplash.com/" target="_blank"  rel="noreferrer" >Powered by Unsplash</a>
                        </div>
                    </div>
                    <UploadImage
                        loading={ loading }
                        unsplashImages={ unsplashImages }
                        getBase64={ getBase64 }
                        clearImage={ clearImage }
                        previewFile={ form?.values?.slateImage }
                        submitData={ submitData }
                        fieldName={ 'slateImage' }
                        handleSubmit={ handleSubmit }
                        title={ 'Add Image' }
                    />   </Modal.Body>
            </Modal>
            <div onClick={ toggleModal } className="rdw-image-wrapper" aria-haspopup="true" aria-expanded="false" aria-label="rdw-image-control">
                <div className="rdw-option-wrapper" title="Image">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTQuNzQxIDBILjI2Qy4xMTYgMCAwIC4xMzYgMCAuMzA0djEzLjM5MmMwIC4xNjguMTE2LjMwNC4yNTkuMzA0SDE0Ljc0Yy4xNDMgMCAuMjU5LS4xMzYuMjU5LS4zMDRWLjMwNEMxNSAuMTM2IDE0Ljg4NCAwIDE0Ljc0MSAwem0tLjI1OCAxMy4zOTFILjUxN1YuNjFoMTMuOTY2VjEzLjM5eiIvPjxwYXRoIGQ9Ik00LjEzOCA2LjczOGMuNzk0IDAgMS40NC0uNzYgMS40NC0xLjY5NXMtLjY0Ni0xLjY5NS0xLjQ0LTEuNjk1Yy0uNzk0IDAtMS40NC43Ni0xLjQ0IDEuNjk1IDAgLjkzNC42NDYgMS42OTUgMS40NCAxLjY5NXptMC0yLjc4MWMuNTA5IDAgLjkyMy40ODcuOTIzIDEuMDg2IDAgLjU5OC0uNDE0IDEuMDg2LS45MjMgMS4wODYtLjUwOSAwLS45MjMtLjQ4Ny0uOTIzLTEuMDg2IDAtLjU5OS40MTQtMS4wODYuOTIzLTEuMDg2ek0xLjgxIDEyLjE3NGMuMDYgMCAuMTIyLS4wMjUuMTcxLS4wNzZMNi4yIDcuNzI4bDIuNjY0IDMuMTM0YS4yMzIuMjMyIDAgMCAwIC4zNjYgMCAuMzQzLjM0MyAwIDAgMCAwLS40M0w3Ljk4NyA4Ljk2OWwyLjM3NC0zLjA2IDIuOTEyIDMuMTQyYy4xMDYuMTEzLjI3LjEwNS4zNjYtLjAyYS4zNDMuMzQzIDAgMCAwLS4wMTYtLjQzbC0zLjEwNC0zLjM0N2EuMjQ0LjI0NCAwIDAgMC0uMTg2LS4wOC4yNDUuMjQ1IDAgMCAwLS4xOC4xTDcuNjIyIDguNTM3IDYuMzk0IDcuMDk0YS4yMzIuMjMyIDAgMCAwLS4zNTQtLjAxM2wtNC40IDQuNTZhLjM0My4zNDMgMCAwIDAtLjAyNC40My4yNDMuMjQzIDAgMCAwIC4xOTQuMTAzeiIvPjwvZz48L3N2Zz4=" alt=""/>
                </div>
            </div>
        </>
    )
}

ImageUpload.propTypes = {
    blogFormData: PropTypes.any,
    handleSubmit: PropTypes.any,
    formName: PropTypes.string,
    setEditorState: PropTypes.func,
    editorState: PropTypes.object,
    pageFormData: PropTypes.object
}
export default ImageUpload