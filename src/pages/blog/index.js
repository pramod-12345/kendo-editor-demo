import React, {
    useState,
    useEffect,
    useCallback,
    useContext,
    useRef,
} from 'react';
// import RichTextEditor from './rte';
import { Field, change } from 'redux-form';
import { renderFieldWG } from '../../utils/formUtils';
import {
    getSite,
    getSlugFromPath,
    getTour,
    setTour,
    bodyScrollLock,
    getMaxTokensCount,
    getPendingTokensCount,
} from 'utils/helpers';
import { AddImgIcon } from '../../utils/svg';
import SEOSection from './seo-section';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import TableOfContent from '../../components/core/table-of-content';
import { reduxForm, stopAsyncValidation, reset } from 'redux-form';
import PropTypes from 'prop-types';
//import ListGroup from 'react-bootstrap/ListGroup';
import { Link, useHistory } from 'react-router-dom';
import { getCurrentUser } from '../../middleware/auth';
import { createBlog, getBlogById } from '../../middleware/blog';
import { getUnsplash } from '../../middleware/assessments';
import { change as reduxChange } from 'redux-form';
import {
    trimStringLength,
    changeTitleToSlug,
    useOutsideClick,
} from 'utils/helpers';
import { asyncValidateBlogSlug } from 'utils/asyncValidate';
import { blogValidate as validate } from '../../utils/validates';
import UploadImageModal from '../../components/assessment/shared/UploadImageModal';
import ButtonLoader from 'components/core/loader/button-loader';
import { BLOG_STATUS, MESSAGE, DISCLOSURETEXT } from 'constants/app';
import { blogTour } from 'constants/tour-config';
//import ShortAddImg from '../../images/add-img.png';
//import ShortAddImg1 from '../../images/add1.png';
//import ShortAddImg2 from '../../images/add2.png';
//import ShortAddImg3 from '../../images/add3.png';
//import ShortAddImg4 from '../../images/add4.png';
import Category from './category';
// import { Node } from 'slate'
import { mixpanelCommonData } from 'utils/helpers';
import { SkeletonTheme } from 'react-loading-skeleton';
import Tour from 'reactour';
import { MixpanelContext } from 'utils/tracking';
// import WsEditor from './ws-editor'
import KendoEditor from '../../components/core/editor/kendo-editor';
import Discloser from 'components/core/disclosure';
import { contentGenerator } from 'middleware/chatgpt';
import _ from  'lodash';

const BlogPage = (props) => {
    const ideas = props?.location?.state?.idea ?? '';
    const dispatch = useDispatch();
    const history = useHistory();
    const [ asyncLoad, setAsyncLoad ] = useState(false);
    const [ seoDescription, setSeoDescription ] = useState(null);
    const [ availableBlog, setAvailableBlog ] = useState(false);
    const [ isTourOpen, setTourOpen ] = useState(false);
    const [ errorMessageUrl, setErrorMessageUrl ] = useState(false);
    const [ errorMessageContent, setErrorMessageContent ] = useState(false);
    const [ seoErrorMessage, setSeoErrorMessage ] = useState({});
    const [ errorCategories, setCategoryError ] = useState(false);
    const [ openModal, setModalOpen ] = useState(false);
    const blogForm = useSelector((state) => state.form.blogForm);
    const loading = useSelector((state) => state.blog.createLoading);
    const statusLoading = useSelector((state) => state.blog.status);
    const blog = useSelector((state) => state.blog.blog);
    const unsplashImages = useSelector(
        (state) => state.assessment.unsplashImages
    );
    const id = getSlugFromPath(history.location.pathname);
    const [ isEditUrl, setEditUrl ] = useState(id ? false : true);
    const slugRef = useRef();
    const site = getSite();
    const [ htmlData, setHtmlData ] = useState('');
    const [ tableOfContentData, setTableContentData ] = useState(null);
    const [ isTableContent, setTableContent ] = useState(false);
    const mixpanel = useContext(MixpanelContext);
    //const isReadyPublish = useSelector((state) => state.blog.isReadyPublish)
    const [ isDisclosureEnabled, setDisclosureEnabled ] = useState(false);
    const [ disclosure, setDisclosure ] = useState(DISCLOSURETEXT);
    const [ isDisclosureEditable, setDisclosureEditable ] = useState(false);

    const [ keyword, setKeyword ] = useState('');
    const [ keywordIdeas, setKeywordsIdeas ] = useState([]);
    const [ generating, setGenerating ] = useState(false);
    // const [ inputHasFocus,setInputFocus ] = useState(false);
    const [ isIdeasVisible, setIdeasVisble ] = useState(false);
    const [ keywordError, setKeywordError ] = useState(false);
    const dropdownRef = useRef(null);

    const initialValue = '';

    const { initialize } = props;

    const handleEvent = (eventName, data) => {
        mixpanel.track(eventName, mixpanelCommonData(data));
    };
    // const serialize = nodes => {
    //     return nodes.map(n => Node.string(n)).join('\n')
    // }

    useOutsideClick(
        dropdownRef,
        isIdeasVisible ? () => setIdeasVisble(false) : () => {}
    );
    const getPercentage = () => {
        const rt = getPendingTokensCount()
            ? getPendingTokensCount().replace(/,/g, '')
            : '';
        const tt = getMaxTokensCount().replace(/,/g, '');
        return (Number(rt) / Number(tt)) * 100;
    };

    const submitData = async (formData, status) => {
        const obj = { ...seoErrorMessage };
        const dataHtml = htmlData || initialValue;
        // if (!formData.blogUrl) {
        //     setErrorMessageUrl(true);
        //     return;
        // }
        if (!dataHtml || dataHtml === '<p></p>') {
            setErrorMessageContent(true);
            return;
        }
        if (!formData?.seoDescription) {
            obj[ 'description' ] = true;
            setSeoErrorMessage(obj);
        }
        if (!formData?.seoTitle) {
            obj[ 'title' ] = true;
            setSeoErrorMessage(obj);
        }

        const data = {
            siteId: site?.id,
            type: 'blog',
            content: dataHtml,
            imageUrl: formData.blogUrl,
            title: formData.title,
            slug: formData.slug,
            categories: formData?.categories,
            seoTitle: formData?.seoTitle,
            seoDescription: formData?.seoDescription,
            status: status,
            imageAltText: formData?.imageAltText,
            tableOfContents: tableOfContentData
                ? JSON.stringify(tableOfContentData)
                : null,
            disclosureEnabled: isDisclosureEnabled,
            disclosure: disclosure,
            // isTableOfContentEnabled: isTableContent,
        };

        if (id && blog.title === formData.title) {
            delete data.title;
        }
        if (_.isEmpty(formData?.categories)) {
            setCategoryError(MESSAGE.VALID_SELECT('category'));
        } else if (
            formData?.categories &&
      _.isEmpty(formData?.categories.filter((item) => item.isDefault))
        ) {
            setCategoryError(MESSAGE.SET_DEFAULT_CATEGORY);
        } else {
            formData?.seoDescription &&
        formData?.seoTitle &&
        dispatch(
            createBlog(
                site?.domain,
                data,
                blog?.id,
                id,
                blog?.slug,
                blog?.status,
                handleEvent
            )
        );
        }
    };

    useEffect(() => {
        const timer1 = setTimeout(
            () => setTourOpen(getTour('newBlog')),
            3.5 * 1000
        );
        const query = 'blogs';
        if (id) {
            dispatch(getBlogById(id, site?.id));
        }
        dispatch(getUnsplash('/photos', query));
        dispatch(getCurrentUser());
        dispatch({
            type: 'SET_ACTIVE_SIDEBAR',
            payload: '/blog-content',
        });
        return () => {
            clearTimeout(timer1);
            dispatch(reset('blogForm'));
            dispatch({
                type: 'CLEAR_BLOG_FORM',
            });
        };
    }, []);

    // const [ , setRTEData ] = useState(initialValue)
    const asyncSlugValidate = (value) => {
        asyncValidateBlogSlug(site, value).then((result) => {
            if (!result.status) {
                setEditUrl(true);
                dispatch(stopAsyncValidation('blogForm', { slug: result.message }));
                setAvailableBlog(false);
            } else {
                setEditUrl(false);
                setAvailableBlog(true);
            }
            setAsyncLoad(false);
        });
    };

    useEffect(() => {
        if (blog && ((blog.home && blog.slugHome) || (!blog.home && blog.slug))) {
            blog[ 'blogUrl' ] = blog.imageUrl;
            blog[ 'data' ] = blog.content;
            setHtmlData(blog.content);
            setTableContent(
                blog.tableOfContents && blog.tableOfContents?.length > 0 ? true : false
            );
            setDisclosureEnabled(blog.disclosureEnabled);
            setDisclosure(blog.disclosure);
            delete blog.imageUrl;
            initialize(blog);
            !id && asyncSlugValidate(blog?.home ? blog?.slugHome : blog?.slug);
        }
    }, [ blog ]);

    const handleRTEdata = (data, str) => {
        if (data && !id) {
            setSeoErrorMessage({ description: false });
            setSeoDescription(trimStringLength(str, 230));
        }
        setErrorMessageContent(_.isEmpty(data));
    };
    useEffect(() => {
        if (
            blogForm?.values?.seoDescription === undefined ||
      blogForm?.values?.seoDescription !== seoDescription
        ) {
            dispatch(change('blogForm', 'seoDescription', seoDescription));
        }
    }, [ seoDescription ]);

    const clearImage = () => {
        setErrorMessageUrl(false);
    // dispatch(reduxChange('blogForm', 'blogUrl', null))
    };

    const handleToggleModal = (type) => {
        setModalOpen(!openModal);
        if (type !== 'confirm') {
            clearImage();
        }
    };
    const handleSearch = (event) => {
        const query = event.target.value || 'cat';
        dispatch(getUnsplash('/photos', query));
    };

    const getBase64 = (base64) => {
        setErrorMessageUrl(false);
        dispatch(reduxChange('blogForm', 'blogUrl', base64));
    };

    const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
    const disableBody = () => {
        bodyScrollLock(true);
    };
    const enableBody = () => {
        bodyScrollLock(false);
    };

    const closeTour = () => {
        const tour = getTour();
        tour[ 'newBlog' ] = false;
        setTour(tour);
        setTourOpen(false);
    };
    const handleChange = (value, blogData) => {
        const dd = id ? blogData?.slug !== value : true;
        if (value && dd) {
            setAsyncLoad(true);
            asyncSlugValidate(value);
        } else if (!value) {
            dispatch(stopAsyncValidation('blogForm', { slug: 'Required' }));
        }
    };
    const saveData = async () => {
        if (blogForm?.values?.slug) {
            setEditUrl(!availableBlog);
            slugRef.current?.focus();
            const validSlug = id ? blog.slug !== blogForm?.values?.slug : true;
            !validSlug && setEditUrl(false);
            !availableBlog &&
        validSlug &&
        dispatch(
            stopAsyncValidation('blogForm', {
                slug: 'Blog post URL not available. Try another.',
            })
        );
        } else {
            setEditUrl(true);
            dispatch(stopAsyncValidation('blogForm', { slug: 'Required' }));
        }
    };

    const handleTitleChange = (value) => {
        dispatch(reduxChange('blogForm', 'seoTitle', trimStringLength(value, 70)));
        if (!id) {
            dispatch(
                reduxChange(
                    'blogForm',
                    'slug',
                    changeTitleToSlug(trimStringLength(value, 70))
                )
            );
        }
        if (value) {
            asyncSlugValidate(changeTitleToSlug(value));
        }
    };

    const handleGenerateCallback = (res) => {
        const TempideaArr = res?.data.text.split('\n');
        const headings = TempideaArr.map(
            (o) =>
                /^([IVXLCDM]+|[0-9]+)\./.test(o) &&
        o
            .replace(/^([IVXLCDM]+|[0-9]+)\.\s*/, '')
            .replace(/^[^\w]+|[^\w]+$/g, '')
        )?.filter((i) => i);
        setKeywordsIdeas(headings);
        setGenerating(false);
        setIdeasVisble(true);
    };

    const handleGenerateIdea = (event) => {
        event?.preventDefault();
        if (!isIdeasVisible && keywordIdeas?.length) {
            setGenerating(false);
            setIdeasVisble(true);
        } else {
            if (!keyword) {
                setKeywordError(true);
                return;
            }
            setGenerating(true);
            dispatch(
                contentGenerator(
                    `Generate 5 unique SEO-optimized blog article titles on "${ keyword }". Each title should: include the exact match keyword "${ keyword }". be less than 60 characters. include a number`,
                    handleGenerateCallback,
                    dispatch
                )
            );
        }
    };

    const ideaSelectHandler = (idea) => {
        dispatch(change('blogForm', 'title', idea));
        handleTitleChange(idea);
        setIdeasVisble(false);
    // setInputFocus(false);
    };

    useEffect(() => {
        if (ideas) {
            dispatch(change('blogForm', 'title', ideas));
            handleTitleChange(ideas);
        }
    }, [ ideas ]);

    const asyncValidateFunc = _.debounce(handleChange, 800);
    const asyncChangeCallback = useCallback(asyncValidateFunc, []);

    const asyncValidateTitle = _.debounce(handleTitleChange, 800);
    const asyncChangeTitleCallback = useCallback(asyncValidateTitle, []);
    return (
        <main className="dashboard-data createNewBlog createNewPage">
            <Tour
                closeWithMask={ false }
                onRequestClose={ () => closeTour(false) }
                steps={ blogTour() }
                isOpen={ isTourOpen }
                maskClassName="mask"
                disableInteraction={ true }
                disableFocusLock={ true }
                onAfterOpen={ disableBody }
                onBeforeClose={ enableBody }
                className="helper"
                rounded={ 5 }
                update="5"
                updateDelay={ 5 }
            />
            <section data-tut="reactour__iso" className="dashboard-body">
                <SkeletonTheme color="lightGray">
                    <div className="blog-creation">
                        <Form onSubmit={ () => {} }>
                            <div className="blog-creation-head">
                                <div className="blog-creation-head-left">
                                    {/* <div className="blog-btns mb-3" data-tut="reactour__button">
                                    <ButtonLoader
                                        button={  <Button disabled={ isEditUrl } type='button' onClick={ () => !isEditUrl && submitData(blogForm?.values,BLOG_STATUS.DRAFT) } variant="outline-primary" className="mr-3">Save As Draft</Button> }
                                        loadingText={ 'Save As Draft' }
                                        visible={ statusLoading === BLOG_STATUS.DRAFT }
                                        loading={ loading }
                                        variant="outline-primary"
                                        className="mr-3"
                                    />
                                    <ButtonLoader
                                        button={  <Button disabled={ isEditUrl } type='button' onClick={ () => !isEditUrl && submitData(blogForm?.values,BLOG_STATUS.PUBLISHED) } variant="primary">Publish</Button> }
                                        loadingText={ 'Publish' }
                                        visible={ statusLoading === BLOG_STATUS.PUBLISHED }
                                        loading={ loading }
                                        className="mr-3"
                                    />
                                </div> */}
                                    <Form.Group
                                        data-tut="reactour__title"
                                        className="blog-title-group "
                                    >
                                        <div>
                                            <Field
                                                id="title-blog"
                                                name="title"
                                                component={ renderFieldWG }
                                                placeholder={ 'Blog post title' }
                                                normalize={ capitalize }
                                                handleChange={ asyncChangeTitleCallback }
                                                // onFocus={ () => {setIdeasVisble(true); setInputFocus(true)} }
                                                // onBlur={ ()=>setInputFocus(false) }
                                            />
                                            <div
                                                className="d-flex justify-content-end generate-text"
                                                onClick={ handleGenerateIdea }
                                            >
                                                {generating ? (
                                                    <Spinner
                                                        animation="border"
                                                        size={ 'sm' }
                                                        role="status"
                                                        className="mr-2"
                                                    />
                                                ) : null}
                                                {keywordIdeas?.length && isIdeasVisible
                                                    ? 'Try Again'
                                                    : 'Generate'}
                                            </div>
                                            {isIdeasVisible && keywordIdeas?.length ? (
                                                <div
                                                    ref={ dropdownRef }
                                                    style={ {
                                                        backgroundColor: 'white',
                                                        height: '275px',
                                                        borderRadius: 5,
                                                        border: '1px solid lightgrey',
                                                        position: 'absolute',
                                                        zIndex: 100,
                                                        width: '100%',
                                                        whiteSpace: 'nowrap',
                                                    } }
                                                >
                                                    <div style={ { height: '100px', width: '100%' } }>
                                                        {keywordIdeas.map((heading) => {
                                                            return (
                                                                <div
                                                                    className="title-list-items"
                                                                    style={ {
                                                                        width: '100%',
                                                                        textOverflow: 'ellipsis',
                                                                        overflow: 'hidden',
                                                                        padding: '15px',
                                                                        whiteSpace: 'nowrap',
                                                                        cursor: 'pointer',
                                                                    } }
                                                                    key={ heading }
                                                                    onClick={ () => {
                                                                        ideaSelectHandler(heading);
                                                                    } }
                                                                >
                                                                    {heading}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div
                                            className="blog-creation-author-box"
                                            data-tut="reactour__image"
                                        >
                                            <div className="upload-feature-img-wrap">
                                                <div
                                                    className="upload-feature-img"
                                                    onClick={ () => handleToggleModal('toggleImageModal') }
                                                >
                                                    <div className="innerChanges">
                                                        <AddImgIcon />
                                                        {blogForm?.values?.blogUrl ? (
                                                            <img src={ blogForm?.values?.blogUrl } />
                                                        ) : (
                                                            'Featured Image: 652 (Width) by 301 (Height) OR aspect ratio of 2.16:1'
                                                        )}
                                                        {/* !blogForm?.values?.blogUrl && (
                                                            <ListGroup className={ 'addImgList' }>
                                                                <ListGroup.Item>
                                                                    <img src={ ShortAddImg } alt="" />
                                                                </ListGroup.Item>
                                                                <ListGroup.Item>
                                                                    <img src={ ShortAddImg1 } alt="" />
                                                                </ListGroup.Item>
                                                                <ListGroup.Item>
                                                                    <img src={ ShortAddImg2 } alt="" />
                                                                </ListGroup.Item>
                                                                <ListGroup.Item>
                                                                    <img src={ ShortAddImg3 } alt="" />
                                                                </ListGroup.Item>
                                                                <ListGroup.Item>
                                                                    <img src={ ShortAddImg4 } alt="" />
                                                                </ListGroup.Item>
                                                            </ListGroup>
                                                        )*/}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Form.Group>
                                </div>
                                <div className="blog-categories right-side">
                                    <div className="dflexBox">
                                        <Category
                                            blogForm={ blogForm }
                                            defaultCategories={ blogForm?.values?.categories || [] }
                                            site={ site }
                                            setCategoryError={ setCategoryError }
                                            error={ errorCategories }
                                        />
                                        <div className="target-keyword-input-wrapper d-flex flex-column mb-3">
                                            <input
                                                type="text"
                                                placeholder="Write your target keyword here"
                                                value={ keyword }
                                                className="target-keyword-input mb-0"
                                                onChange={ (e) => setKeyword(e.target.value) }
                                            />
                                            {keywordError && !keyword ? (
                                                <span className="field_error">
                                                    {'Please enter keyword'}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="gradient-wrapper">
                                            <div className="left-section">
                                                <div className="left-section-white-space">
                                                    <div
                                                        className="left-section-gradient"
                                                        style={ { width: `${ getPercentage() }%` } }
                                                    ></div>
                                                </div>
                                                <div style={ { fontSize: 16 } }>
                                                    <b>{getPendingTokensCount()}</b>
                                                    {` / ${ getMaxTokensCount() } tokens`}
                                                    <Link to="/plan-selection" className="add-more pl-2">
                                                        Get More Tokens
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="blog-btns mb-3" data-tut="reactour__button">
                                            {errorMessageUrl && (
                                                <p>
                                                    <span className="field_error">
                                                        Please insert image
                                                    </span>
                                                </p>
                                            )}
                                            {errorMessageContent && (
                                                <p>
                                                    <span className="field_error">
                                                        Please insert content
                                                    </span>
                                                </p>
                                            )}
                                            <ButtonLoader
                                                button={
                                                    <Button
                                                        disabled={ isEditUrl }
                                                        type="button"
                                                        onClick={ () =>
                                                            !isEditUrl &&
                              submitData(blogForm?.values, BLOG_STATUS.DRAFT)
                                                        }
                                                        variant="secondary"
                                                        className="mr-3 btn-secondary"
                                                    >
                                                        Save As Draft
                                                    </Button>
                                                }
                                                loadingText={ 'Save As Draft' }
                                                visible={ statusLoading === BLOG_STATUS.DRAFT }
                                                loading={ loading }
                                                variant="secondary"
                                                className=""
                                            />
                                            <ButtonLoader
                                                button={
                                                    <Button
                                                        disabled={ isEditUrl }
                                                        type="button"
                                                        onClick={ () =>
                                                            !isEditUrl &&
                              submitData(
                                  blogForm?.values,
                                  BLOG_STATUS.PUBLISHED
                              )
                                                        }
                                                        variant="primary"
                                                    >
                                                        Publish
                                                    </Button>
                                                }
                                                loadingText={ 'Publish' }
                                                visible={ statusLoading === BLOG_STATUS.PUBLISHED }
                                                loading={ loading }
                                                className=""
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="blog-creation-content mt-2">
                                <div className="blog-editor" data-tut="reactour__rte">
                                    <KendoEditor
                                        htmlData={ htmlData }
                                        handleSubmit={ props.handleSubmit }
                                        setHtmlData={ setHtmlData }
                                        formName={ 'blogForm' }
                                        blogFormData={ blogForm?.values }
                                        readOnly={ false }
                                        handleRTEdata={ handleRTEdata }
                                        initialValue={ blog && blog.content }
                                        title={ blogForm?.values?.title }
                                    />
                                    {/* {id && blog && blog.content &&  <RichTextEditor formName={ 'blogForm' } blogFormData={ blogForm.values } readOnly={ false } setRTEData={ handleRTEdata } initialValue={ blog && deserializeFromHtml(blog.content) || initialValue } /> }
                                    {!id && !rteLoading  &&  <RichTextEditor formName={ 'blogForm' } blogFormData={ blogForm.values } readOnly={ false } setRTEData={ handleRTEdata } initialValue={ blogForm?.values?.data || initialValue } />} */}
                                </div>
                            </div>

                            <UploadImageModal
                                formName={ 'blogForm' }
                                fieldName={ 'blogUrl' }
                                clearImage={ clearImage }
                                previewFile={ blogForm?.values?.blogUrl }
                                getBase64={ getBase64 }
                                handleSearch={ handleSearch }
                                unsplashImages={ unsplashImages }
                                openModal={ openModal }
                                handleToggleModal={ handleToggleModal }
                                isAlt={ true }
                                fieldAltName="imageAltText"
                            />
                        </Form>
                    </div>
                </SkeletonTheme>

                <div className="dashboard-bottom-section">
                    <div className="seo">
                        <SEOSection
                            slugRef={ slugRef }
                            id={ id }
                            isEditUrl={ isEditUrl }
                            blog={ blog }
                            saveData={ saveData }
                            asyncLoad={ asyncLoad }
                            asyncChangeCallback={ asyncChangeCallback }
                            setSeoErrorMessage={ setSeoErrorMessage }
                            site={ site }
                            seoErrorMessage={ seoErrorMessage }
                            blogForm={ blogForm }
                        />
                    </div>
                    <div className="table-of-content">
                        <TableOfContent
                            htmlData={ htmlData }
                            setTableContentData={ setTableContentData }
                            setTableContent={ setTableContent }
                            isTableContent={ isTableContent }
                        />
                    </div>
                </div>
                <div className="dashboard-discloser-section">
                    <Discloser
                        isDisclosureEnabled={ isDisclosureEnabled }
                        setDisclosureEnabled={ setDisclosureEnabled }
                        disclosure={ disclosure }
                        setDisclosure={ setDisclosure }
                        isDisclosureEditable={ isDisclosureEditable }
                        setDisclosureEditable={ setDisclosureEditable }
                    />
                </div>
            </section>
        </main>
    );
};

BlogPage.propTypes = {
    handleSubmit: PropTypes.func,
    initialize: PropTypes.object,
    location: PropTypes.any
};
String.prototype.toUsername = function () {
    return this?.split('@') && this?.split('@')[ 0 ];
};
export default reduxForm({
    form: 'blogForm',
    validate,
    asyncValidateBlogSlug,
    asyncChangeFields: [ 'slug' ],
})(BlogPage);
