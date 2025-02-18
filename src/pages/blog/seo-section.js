import React, { useState } from 'react';
import { Field, stopAsyncValidation, change } from 'redux-form';
import {
    renderFieldWG,
    renderFieldChangeWG,
    renderTextArea,
} from '../../utils/formUtils';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
    EditSeoIcon,
} from '../../utils/svg';
import GenerateButton from 'components/shared/GenerateButton';
import { contentGenerator } from 'middleware/chatgpt';

const TitleView = (props) => {
    const { edit, formData, setSeoErrorMessage, seoErrorMessage } = props;
    const handleChange = (value) => {
        seoErrorMessage[ 'title' ] = !value;
        setSeoErrorMessage({ ...seoErrorMessage });
    };
    const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
    if (!edit) {
        return (
            <h4 className="seoTitle">{formData?.seoTitle || 'Blog SEO title'}</h4>
        );
    } else {
        return (
            <div className="seo-form-label seo-form-label-error">
                <label>Heading</label>
                <Field
                    name="seoTitle"
                    handleChange={ handleChange }
                    maxLength={ 70 }
                    component={ renderFieldWG }
                    placeholder={ 'Blog SEO title' }
                    normalize={ capitalize }
                />
            </div>
        );
    }
};

const DescriptionView = (props) => {
    const {
        edit,
        formData,
        seoDescription,
        setSeoErrorMessage,
        seoErrorMessage,
    } = props;
    const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
    const handleChange = (value) => {
        seoErrorMessage[ 'description' ] = !value;
        setSeoErrorMessage({ ...seoErrorMessage });
    };
    const showDiscription = () => {
        const value = formData?.seoDescription || seoDescription;
        return value?.length > 230
            ? value?.substring(0, Math.min(value?.length, 230)) + '...'
            : value;
    };
    if (!edit) {
        return (
            <div className="seoContent">
                {showDiscription() || 'Blog SEO description'}
            </div>
        );
    } else {
        return (
            <div className="seo-form-label seo-form-label-description">
                <label>Description</label>
                <Field
                    name="seoDescription"
                    component={ renderTextArea }
                    maxLength={ 230 }
                    handleChange={ handleChange }
                    placeholder={ 'Blog SEO Description' }
                    normalize={ capitalize }
                />
            </div>
        );
    }
};
const SEOSection = (props) => {
    const {
        blogForm,
        site,
        seoErrorMessage,
        setSeoErrorMessage,
        slugRef,
        blog,
        setEditUrl,
        asyncChangeCallback,
        asyncLoad,
        saveData,
    } = props;
    const [ edit, setEdit ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const dispatch = useDispatch();
    const handleClick = (type) => {
        const obj1 = { ...seoErrorMessage };
        obj1[ type ] = false;
        setEdit(!edit);
        setSeoErrorMessage(obj1);
    };

    const handleUpdate = () => {
        !blogForm.values?.slug &&
      dispatch(stopAsyncValidation('blogForm', { slug: 'Required' }));
        if (
            !asyncLoad &&
      !blogForm.syncErrors.slug &&
      !blogForm?.asyncErrors?.slug &&
      blogForm.values.slug
        ) {
            saveData();
            setEditUrl && setEditUrl(false);
            setEdit(!edit);
        }
    };
    const isSeoValid = () => {
        return (
            blogForm?.values?.seoTitle &&
      blogForm.values.seoDescription &&
      blogForm?.values?.slug
        );
    };

    const handleGenerateCallback = (res) => {
        if (res) {
            dispatch(change('blogForm', 'seoDescription', res?.data.text))
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    const generateSeo = async(event) => {
        event.preventDefault();
        setLoading(true);
        dispatch(
            contentGenerator(
                `Generate SEO meta description for blog titled “${ blogForm?.values?.seoTitle }”. Limit to 155 characters`,
                handleGenerateCallback,
                dispatch
            )
        );
    }

    return (
        <div className="seoSection">
            <h3 className="seoHeading">SEO</h3>
            <div className="seoDataPreview">
                <TitleView
                    seoErrorMessage={ seoErrorMessage }
                    setSeoErrorMessage={ setSeoErrorMessage }
                    formData={ blogForm?.values }
                    edit={ edit }
                    handleUpdate={ handleUpdate }
                />
                {edit && (
                    <span className="field_error">
                        {seoErrorMessage?.title && 'Please insert title'}{' '}
                    </span>
                )}
                {!edit ? (
                    <p className="seoURL">
                        <span className="seoUrl">
                            https://{site?.customDomain || site?.domain}/blog/
                            {blogForm?.values?.slug}
                        </span>{' '}
                    </p>
                ) : (
                    <div className="seo-form-label seo-form-label-error">
                        <label>Link</label>
                        <div className={ 'blog-slug' }>
                            <span className="blog-slug-link">
                                https://{site?.customDomain || site?.domain}/blog/
                            </span>
                            <Field
                                refData={ slugRef }
                                name="slug"
                                label=""
                                type="text"
                                handleChange={ (value) => asyncChangeCallback(value, blog) }
                                component={ renderFieldChangeWG }
                                changeType={ 'slug' }
                                maxLength="150"
                                isSlug={ true }
                                withoutTouch={ true }
                                placeholder=""
                            />
                            {asyncLoad && (
                                <div className="small-up-loader">
                                    <div className="lds-facebook">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <DescriptionView
                    seoErrorMessage={ seoErrorMessage }
                    setSeoErrorMessage={ setSeoErrorMessage }
                    formData={ blogForm?.values }
                    edit={ edit }
                    handleUpdate={ handleUpdate }
                />
                {edit && (
                    <span className="field_error">
                        {seoErrorMessage?.description && 'Please insert description'}
                    </span>
                )}
                {(seoErrorMessage?.title || seoErrorMessage?.description || blogForm?.asyncErrors?.slug) && !edit && (
                    <div className="error-heading">
                        <span className="field_error">
                            {' '}
                            {(seoErrorMessage?.title && 'Please insert title') ||
                  (seoErrorMessage?.description && 'Please insert description')}
                        </span>
                        <br />
                        <span className="field_error">{blogForm?.asyncErrors?.slug}</span>
                    </div>
                )}
                <div style={ { display: 'flex', alignItems: 'center', gap: 20, marginTop: 20 } }>
                    {edit ? (
                        <button
                            className="btn btn-primary"
                            disabled={
                                asyncLoad || blogForm?.asyncErrors?.slug || !isSeoValid()
                            }
                            onClick={ () => handleUpdate() }
                        >
                            update
                        </button>
                    ) : (
                        <a
                            className="edit-btn btn btn-primary mt-0"
                            href="javascript:void(0)"
                            onClick={ handleClick }
                        >
                            <EditSeoIcon />
                            Edit
                        </a>
                    )}
                    <GenerateButton
                        text="Generate"
                        onClick={ generateSeo }
                        loading={ loading }
                        disabled={ asyncLoad || blogForm?.asyncErrors?.slug || !(blogForm?.values?.seoTitle && blogForm?.values?.slug) }
                    />
                </div>
            </div>
        </div>
    );
};

TitleView.propTypes = {
    handleClick: PropTypes.func,
    edit: PropTypes.object,
    handleUpdate: PropTypes.func,
    seoErrorMessage: PropTypes.object,
    setSeoErrorMessage: PropTypes.func,
    formData: PropTypes.object,
};

SEOSection.propTypes = {
    blogForm: PropTypes.object,
    site: PropTypes.object,
    seoErrorMessage: PropTypes.object,
    setSeoErrorMessage: PropTypes.func,
    slugRef: PropTypes.any,
    blog: PropTypes.any,
    setEditUrl: PropTypes.any,
    id: PropTypes.string,
    asyncChangeCallback: PropTypes.func,
    asyncLoad: PropTypes.bool,
    saveData: PropTypes.func,
};

DescriptionView.propTypes = {
    edit: PropTypes.object,
    formData: PropTypes.object,
    seoDescription: PropTypes.object,
    setSeoErrorMessage: PropTypes.func,
    seoErrorMessage: PropTypes.object,
};
export default SEOSection;
