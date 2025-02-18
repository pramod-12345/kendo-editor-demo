import React,{ useState } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { renderFileDrop, renderField } from 'utils/formUtils'
import { useSelector } from 'react-redux';
import ButtonLoader from 'components/core/loader/button-loader'
import { dataUrlToBase64, bytesToSize } from 'utils/helpers'
import _ from 'lodash'
import
{
    Button,
    Form
} from 'react-bootstrap';
const UploadImage = (props) => {
    const {
        submitData,loading,previewFile,clearImage,getBase64, unsplashImages ,fieldName,
        isAlt, fieldAltName,
    } = props
    const unsplashLoading = useSelector((state) => state.assessment.unsplashLoading)
    const [ selectedUnsplash, setSelectedUnsplash ] = useState(null);

    const handleSelect = async(id) => {
        setSelectedUnsplash(id)
        const image = unsplashImages.filter((item) => item.id == id)[ 0 ];
        image && dataUrlToBase64(image.urls.regular,function(result){
            getBase64(result)
        });
    }

    const clearImageFun = (event) => {
        clearImage(event, fieldName)
    }
    return(
        <div className="">
            <div className="image-upload-modal-unsplash-gallery">
                { unsplashLoading ?  <div className='unsplash-emtpy'><div className="small-up-loader btn-loader ">
                    <div className="lds-facebook"><div></div><div></div><div></div></div>
                </div></div> : null }
                {_.isEmpty(unsplashImages) && !unsplashLoading ? <div className='unsplash-emtpy'><p>No Records found</p></div> : <>
                    <ul className='unsplash-gallery'>
                        {unsplashImages.slice(0,10).map((item)=>{
                            return( <li onClick={ () => handleSelect(item.id) } key={ item.id } className={ `${ selectedUnsplash === item.id ? 'active' : '' }` }>
                                <img src={ item.urls.small } alt="media1" />
                            </li>)
                        })}
                    </ul>
                    <ul className='unsplash-gallery'>
                        {unsplashImages.slice(10,20).map((item)=>{
                            return( <li onClick={ () => handleSelect(item.id) } key={ item.id } className={ `${ selectedUnsplash === item.id ? 'active' : '' }` }>
                                <img src={ item.urls.small } alt="media1" />
                            </li>)
                        })}
                    </ul>
                </>
                }
            </div>
            <div className="image-upload-modal-form">
                <div className='row'>
                    <div className={ isAlt ? 'col-12 col-lg-6' : 'col-12' }>
                        <div className={ `image-upload-modal-select ${ previewFile ? 'uploaded' : '' }` }>
                            <Form onSubmit={ () => {} }>

                                <Field
                                    name={ fieldName }
                                    component={ renderFileDrop }
                                    isDrop={ ()=> {} }
                                    placeholder={ "<a><i className='fa fa-plus'/> upload your image</a>" }
                                    isDropText={ 'Drag your image' }
                                />
                                {previewFile && <div className="preview-logo">

                                    {typeof(previewFile) !== 'string' ?
                                        <span>
                                            {previewFile.name}-{bytesToSize(previewFile.size)}
                                        </span> :
                                        <img src={ previewFile } />
                                    }
                                    <span onClick={ clearImageFun } className="clear-logo">clear</span>
                                </div>}
                            </Form>
                        </div>
                    </div>
                    {isAlt && (
                        <div className='col-12 col-lg-6'>
                            <div className="alt-image-section">
                                <Form.Group>
                                    <label className='form-label'>Recommended: Image Alt-text</label>
                                    <Field
                                        name={ fieldAltName }
                                        component={ renderField }
                                        placeholder={ 'Describe this image for better SEO' }
                                        maxLength={ 125 }
                                    />
                                </Form.Group>
                                <div className="modal-btns">
                                    <ButtonLoader
                                        button={ <Button type='button' onClick={ () => submitData() } variant="primary">confirm</Button> }
                                        loadingText='Saving'
                                        loading={ loading }

                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    )
}

UploadImage.propTypes = {
    submitData: PropTypes.func,
    handleSubmit: PropTypes.func,
    onClose: PropTypes.func,
    assessmentData: PropTypes.object,
    clearImage: PropTypes.func,
    getBase64: PropTypes.func,
    handleSearch: PropTypes.func,
    unsplashImages: PropTypes.array,
    previewFile: PropTypes.any,
    fieldName: PropTypes.string,
    loading: PropTypes.bool,
    title: PropTypes.string,
    isAlt: PropTypes.bool,
    fieldAltName: PropTypes.string,
};

export default UploadImage