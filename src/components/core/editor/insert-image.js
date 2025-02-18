import React, { useState, useRef, useEffect } from 'react'
//import { useSelected, useFocused, useSlate } from 'slate-react';
// import { useSlate } from 'slate-react';
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap';
import useOutsideClick  from 'components/hoc/OutsideClick'
// import { Field } from 'redux-form';
import { Modal } from 'react-bootstrap';
import UploadImage from 'pages/blog/components/uploadImage';
import { dataURLtoFile, getDomain, uId , debounce, getResizeImage } from 'utils/helpers';
import { imageUpload } from 'middleware/assessments';
import { useSelector , useDispatch } from 'react-redux'
import { getUnsplash } from 'middleware/assessments'
import { change as reduxChange } from 'redux-form'
import { Button } from '@progress/kendo-react-buttons';
import { EditorUtils, EditorToolsSettings } from '@progress/kendo-react-editor';
const imageSettings = EditorToolsSettings.image;

const InsertImage = (props) => {
    const { view, dir } = props
    const { formName, formData ,handleSubmit } = dir
    const state = view && view.state;
    const nodeType = state ? state.schema.nodes[ imageSettings.node ] : undefined;
    const inputRef = useRef(null)
    const form = useSelector((st) => st.form[ formName ] )
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

    const unsplashImages  = useSelector((st) => st.assessment.unsplashImages)
    const insertImage = (url, imgAltText) => {
        const id = new Date().getTime();
        const data = {
            src: url,
            title: `blog-img-${ new Date().getTime() }`,
            alt: imgAltText || ' ',
            minWidth: 'auto',
            minHeight: 'auto',
            id: id
        };
        const attrs = Object.keys(data).filter(key => data[ key ] !== null && data[ key ] !== '').reduce((acc, curr) => Object.assign(acc, {
            [ curr ]: data[ curr ]
        }), {});
        const newImage = nodeType.createAndFill(attrs);
        EditorUtils.insertNode(view, newImage, true);

        setTimeout(()=>{
            const elements = document.querySelector('.k-editor-content').getElementsByTagName('img');

            if(elements){
                let elementWithId = null;
                for (const el of elements) {
                    if(el.id == id){
                        elementWithId = el;
                    }
                }
                if (elementWithId) {
                    const rect = elementWithId.getBoundingClientRect();
                    const offset = 200;
                    const scrollPosition = window.scrollY + rect.top - offset;
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'smooth',
                    });
                }
            }
        },1000)
    };
    const clearImage = () =>{
        dispatch(reduxChange(formName, 'slateImage', null))
        dispatch(reduxChange(formName, 'imageAltTextEditor', ''))
    }
    const submitData = async () => {
        if (formData.slateImage && !formData.slateImage.match('^(http|https)://')){
            setLoader(true)
            const file = dataURLtoFile(formData.slateImage,uId()+'.png')
            const compressedFile = await getResizeImage(file, 624, 650, 'WEBP', 'file',80);
            const newUrl = await imageUpload(getDomain(),'blog-images',compressedFile);
            const imgAltText = formData?.imageAltTextEditor;
            insertImage(newUrl, imgAltText)
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
            <Button onClick={ () => toggleModal(nodeType) } disabled={ !nodeType || !state || !EditorUtils.canInsert(state, nodeType) } onMouseDown={ e => e.preventDefault() } onPointerDown={ e => e.preventDefault() } title="Insert Image" { ...imageSettings.props } />

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
                        isAlt = { true }
                        fieldAltName = 'imageAltTextEditor'
                    />   </Modal.Body>
            </Modal>
        </>
    )
}

InsertImage.propTypes = {
    view: PropTypes.any,
    handleSubmit: PropTypes.any,
    formName: PropTypes.string,
    formData: PropTypes.object,
    dir: PropTypes.object
}
export { InsertImage }