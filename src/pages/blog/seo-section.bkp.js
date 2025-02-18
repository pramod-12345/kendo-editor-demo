import React,{ useState } from 'react'
import { Field } from 'redux-form';
import { renderFieldWG, renderTextArea } from '../../utils/formUtils'
import PropTypes from 'prop-types';
import {
    SEOUrlIcon,
} from '../../utils/svg';

const TitleView = (props) => {
    const { handleClick, edit, formData, handleUpdate } = props
    const capitalize = value => value.charAt(0).toUpperCase() + value.slice(1)
    if(!edit.title){
        return <h4 className="seoTitle">{ formData?.seoTitle || 'Blog SEO title' } &nbsp;
            <a href='javascript:void(0)' onClick={ () => handleClick('title') } className="editLink">Edit</a></h4>
    }else{
        return (
            <div className="seo-form">
                <Field
                    name="seoTitle"
                    component={ renderFieldWG }
                    placeholder={ 'Blog SEO title' }
                    normalize={ capitalize }
                />
                <button className='btn btn-primary' onClick={ () => handleUpdate('title') }> update </button>
            </div>
        )
    }
}

const DescriptionView  = (props) => {
    const { handleClick, edit,formData, seoDescription, handleUpdate } = props
    const capitalize = value => value.charAt(0).toUpperCase() + value.slice(1)
    if(!edit.description){
        return <div className="seoContent">{ formData?.seoDescription || seoDescription || 'Blog SEO description' } &nbsp;
            <a href='javascript:void(0)' onClick={ () => handleClick('description') } className="editLink">Edit</a></div>
    }else{
        return (
            <div className="seo-form">
                <Field
                    name="seoDescription"
                    component={ renderTextArea }
                    placeholder={ 'Blog SEO Description' }
                    normalize={ capitalize }
                />
                <button className='btn btn-primary' onClick={ () => handleUpdate('description') }> update </button>

            </div>
        )
    }
}
const SEOSection = (props) => {
    const { blogForm, site, seoErrorMessage ,setSeoErrorMessage  } = props
    const [ edit, setEdit ] = useState({ title: false, description: false })

    const handleClick = (type) => {
        const obj1 = { ...seoErrorMessage }
        const obj = { ...edit }
        obj[ type ] = !obj[ type ]
        obj1[ type ] = false
        setEdit(obj)
        setSeoErrorMessage(obj1)
    }

    const handleUpdate = ( type ) => {
        handleClick( type)
    }
    return( <div className="seoSection">
        <h3 className="seoHeading">SEO</h3>
        <div className="seoDataPreview">
            <TitleView formData={ blogForm?.values }  edit={ edit }  handleUpdate={ handleUpdate } handleClick={ handleClick } />
            <span className='field_error'>{ seoErrorMessage?.title && 'please insert title' }</span>
            <p className="seoURL"><a href="javascript:void(0)" className="url">https://{site?.domain}/blog/{ blogForm.values?.slug} <SEOUrlIcon /></a> </p>
            <DescriptionView  formData={ blogForm?.values }  edit={ edit } handleUpdate={ handleUpdate } handleClick={ handleClick } />
            <span className='field_error'>{ seoErrorMessage?.description && 'Please insert description' }</span>
        </div>
    </div>)
}

TitleView.propTypes = {
    handleClick: PropTypes.func,
    edit: PropTypes.object,
    handleUpdate: PropTypes.func,
    formData: PropTypes.object
};

SEOSection.propTypes = {
    blogForm: PropTypes.object,
    site: PropTypes.object,
    seoErrorMessage: PropTypes.object,
    setSeoErrorMessage: PropTypes.func
};
export default SEOSection