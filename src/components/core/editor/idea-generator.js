import React, { useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { EditorUtils } from '@progress/kendo-react-editor';
import PropTypes from 'prop-types';
import GenerateIcon from '../../../images/generateStickIcon.png';
import './kendo.sass';
import {
    contentGenerator,
    longContentGenerator,
} from 'middleware/chatgpt/index';
import { useDispatch } from 'react-redux';
import GenerateButton from 'components/shared/GenerateButton';
import { getSite } from 'utils/helpers';

const WRITING_TONS = [
    'Professional',
    'Conversational',
    'Witty',
    'Friendly',
    'Opinionated',
];

// let longBlogObjectStore = [];

export const IdeaGenerator = (props) => {
    const { title, view, generatingParagraph } = props;
    const dispatch = useDispatch();
    // const blogTitle = getBlogTitle();
    const [ open, setOpen ] = useState(false);
    const [ activeTab, setActiveTab ] = useState(0);
    const [ generatedContent, setGeneratedContent ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ seachWords, setSearchWords ] = useState('');
    const [ writingTone, setWritingTone ] = useState('Professional');
    const [ value, setValue ] = useState(7);

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const blogQueryGenerator = (params) => {
        return `Blog article titled “${ params }” with ${ writingTone } writing tone. Must include intro and conclusion paragraph. Use active voice instead of passive voice. All sentences under 20 words each. Must be over 700 words. Headings with <H2> HTML tags`;
    // return `${ params } ideas`
    };

    const outlineQueryGenerator = (params) => {
        return `Blog article outline on a blog titled "${ params }" , only the main points. in html formatting.`;
    };

    const outlineQueryGeneratorForLongPost = (params) => {
        return `Blog article outline on a blog titled "${ params }" , only the main points.`;
    };

    const longPostGenerator = (params) => {
        return `based on outline below write an article addressing each token point with atlease 800 word paragraph (${ params }).Headings with <H2> , subheading with <H3> and paragraph with <p> HTML tags`;
    };

    const generateors = {
        0: blogQueryGenerator,
        1: outlineQueryGenerator,
        2: longPostGenerator,
        3: outlineQueryGeneratorForLongPost,
    };

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    const toggleModal = () => {
        setOpen(!open);
    };

    const handleModal = () => {
        setOpen(!open);
    };

    const handleSubmit = async (event, data) => {
        event?.preventDefault();

        const schema = view.state.schema;
        const nodeType = schema.nodes.shortCode;
        const node = nodeType.createAndFill({ class: 'shortCode', style: '' });

        EditorUtils.insertNode(view, node);
        view.focus();

        setLoading(true);
        setTimeout(() => {
            const currentHtml = EditorUtils.getHtml(view.state);
            const openingTagClippedHtmlSting = currentHtml.replace(
                /<shortcode class="" style="">/g,
                data
            );
            const closingTagClippedHtmlString = openingTagClippedHtmlSting.replace(
                /<\/shortcode>/g,
                ''
            );

            const clippedStartingSpace = closingTagClippedHtmlString.replace(
                /^<p style="font-size: 16pt"><\/p>/,
                ''
            );

            EditorUtils.setHtml(view, clippedStartingSpace);
            setOpen(!open);
            // setFormData(null);
            setLoading(false);
            setLoading(false);
        }, 1000);
    };

    const handleGenerateCallback = (res) => {
        if (res?.data?.allText && activeTab === 2) {
            let blogHtml = '';

            res.data.allText.map((para, i) => {
                const formattedPara = para.replace(/\n{2,}/g, '<p></p>');
                // eslint-disable-next-line
        blogHtml += i === 0 ? formattedPara : `<p></p> ${formattedPara} `;
                // eslint-disable-next-line
      });

            handleSubmit(null, blogHtml);
            // longBlogObjectStore = [];
        } else if (res?.data.text) {
            if (activeTab === 0) {
                handleSubmit(null, res?.data.text);
            } else {
                setGeneratedContent(res?.data.text);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const handleGenerateIdea = (event) => {
        event.preventDefault();
        setGeneratedContent(null);
        setLoading(true);
        if (activeTab === 2) {
            dispatch(
                contentGenerator(
                    generateors[ 3 ](seachWords),
                    longPostCallback,
                    dispatch,
                    value,
                    false
                )
            );
        } else {
            dispatch(
                contentGenerator(
                    generateors[ activeTab ](seachWords),
                    handleGenerateCallback,
                    dispatch,
                    value
                )
            );
        }
    };

    async function longPostCallback(res) {
        try {
            const outlinePoints = res?.data.text.split('\n');
            if (outlinePoints?.length > 1) {
                const outlineHeadings = outlinePoints
                    .map(
                        (o) =>
                            /^([IVXLCDM]+|[0-9]+)\./.test(o) &&
              o.replace(/^([IVXLCDM]+|[0-9]+)\.\s*/, '')
                    )
                    ?.filter((i) => i);

                const topFiveHeadings =
          outlineHeadings.length < 10
              ? outlineHeadings
              : outlineHeadings?.slice(0, 9).concat(outlineHeadings.slice(-2));

                // longBlogObjectStore = topFiveHeadings

                const request = {
                    title: seachWords,
                    headings: topFiveHeadings,
                    userSiteId: getSite()?.id,
                    temperature: value / 10,
                    writingTone: writingTone,
                };

                dispatch(
                    longContentGenerator(request, handleGenerateCallback, dispatch)
                );
            } else {
                // setGeneratedContent(res?.data.text);
                setLoading(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        setSearchWords(title);
    }, [ title ]);

    return (
        <React.Fragment>
            <Modal
                show={ open }
                onHide={ handleModal }
                className="image-upload-modal new-modal embed-link-modal"
            >
                <Modal.Header closeButton>
                    <div className="new-modal-header">
                        <Modal.Title>Content Generator</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="content-generator-wrapper">
                    <div className="writing-tone-wrapper">
                        <div className="writing-tone"> Writing Tone</div>
                        <div className="writing-tone-tabs">
                            {WRITING_TONS.map((tones, i) => {
                                return (
                                    <div
                                        key={ `${ tones }-${ i }` }
                                        className={
                                            writingTone === tones
                                                ? 'writing-tab active-writing-tab'
                                                : 'writing-tab'
                                        }
                                        onClick={ !loading ? () => setWritingTone(tones) : () => {} }
                                    >
                                        {tones}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        className="writing-tone-wrapper mt-4"
                        style={ { alignItems: 'center' } }
                    >
                        <div className="writing-tone">Creativity</div>
                        <div
                            className="writing-tone-tabs"
                            style={ {
                                width: '77%',
                                alignItems: 'center',
                                flexDirection: 'column',
                            } }
                        >
                            <div
                                style={ {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '10px',
                                    width: '100%',
                                } }
                            >
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                                <span>6</span>
                                <span>7</span>
                                <span>8</span>
                                <span>9</span>
                                <span>10</span>
                            </div>
                            <input
                                style={ { width: '100%' } }
                                type="range"
                                min="1"
                                max="10"
                                value={ value }
                                step="1"
                                className="custom-range mt-n1"
                                id="customRange"
                                onChange={ handleChange }
                            />
                        </div>
                    </div>

                    <div className="content-generator-tabs-container">
                        <div className="content-generator-tabs">
                            <div
                                className={ activeTab === 2 ? 'active-tab' : 'content-tab' }
                                onClick={ !loading ? () => handleTabClick(2) : () => {} }
                            >
                                {' '}
                                Blog Post{' '}
                            </div>
                            <div
                                className={ activeTab === 0 ? 'active-tab' : 'content-tab' }
                                onClick={ !loading ? () => handleTabClick(0) : () => {} }
                            >
                                {' '}
                                Blog Draft{' '}
                            </div>
                            <div
                                className={ activeTab === 1 ? 'active-tab' : 'content-tab' }
                                onClick={ !loading ? () => handleTabClick(1) : () => {} }
                            >
                                {' '}
                                Outline{' '}
                            </div>
                        </div>
                    </div>

                    <input
                        className="blog-post-title-input"
                        onChange={ (e) => setSearchWords(e.target.value) }
                        value={ seachWords }
                        disabled={ loading }
                    />
                    {/* {activeTab === 2 ? (
                        <ProgressBar now={ 60 } label={ `${ 60 }%` }/>
                    ):null} */}
                    <div className="mt-4 mb-4">
                        <GenerateButton
                            text="Generate"
                            onClick={ handleGenerateIdea }
                            loading={ loading }
                            disabled={ !seachWords }
                        />
                    </div>

                    {generatedContent && activeTab !== 0 ? (
                        <div className="custom-generate-area-wrapper">
                            <div
                                className="custom-generate-area"
                                dangerouslySetInnerHTML={ { __html: generatedContent } }
                            />
                        </div>
                    ) : null}

                    <div className="content-btn-wrapper">
                        <button
                            onClick={ () => {
                                toggleModal();
                            } }
                            className="content-generator-cancel-confirm-btn"
                        >
                            Close
                        </button>
                        {generatedContent && activeTab !== 0 && (
                            <button
                                onClick={ (e) => {
                                    handleSubmit(e, generatedContent);
                                } }
                                className="content-generator-cancel-confirm-btn"
                            >
                                {loading ? (
                                    <Spinner animation="border" size={ 'sm' } role="status" />
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            <div
                onClick={
                    generatingParagraph
                        ? () => {}
                        : () => {
                            toggleModal();
                        }
                }
                style={ {
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px 10px',
                    width: '10%',
                    minWidth: 150,
                    height: 38,
                    borderRadius: 10,
                    gap: 10,
                    whiteSpace: 'nowrap',
                    cursor: generatingParagraph ? 'not-allowed' : 'pointer',
                    background:
            'linear-gradient(90deg, #F87700 0%, #E32093 48.96%, #9747FF 92.19%)',
                } }
            >
                <img style={ { width: 20, height: 20 } } src={ GenerateIcon } />
                Generate
            </div>
        </React.Fragment>
    );
};

IdeaGenerator.propTypes = {
    view: PropTypes.any,
    title: PropTypes.string,
    generatingParagraph: PropTypes.bool
};
