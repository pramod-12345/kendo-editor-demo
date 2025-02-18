import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';
import { EditorUtils } from '@progress/kendo-react-editor';
import { useDispatch } from 'react-redux';
import GenerateIcon from '../../../images/Vector.png';
import { contentGenerator } from 'middleware/chatgpt/index';
import './kendo.sass';

export const ParaGenration = (props) => {
    const { title, view, setGeneratingParagraph,
        generatingParagraph, generatingBlog } = props;
    const dispatch = useDispatch();
    // const blogTitle = getBlogTitle();
    // const [ isLoading, setLoading ] = useState(false);

    const handleSubmit = async (event, data) => {
        event?.preventDefault();
        setTimeout(() => {
            const currentHtml = EditorUtils.getHtml(view.state);
            const openingTagClippedHtmlSting = currentHtml.replace(
                '<span style="display: inline-block;background-color: #d0d0d0;padding: 0 5px;border-radius : 5px;">Writing paragraph... </span>',
                data
            );
            // const closingTagClippedHtmlString = openingTagClippedHtmlSting.replace(
            //     /<\/shortcode>/g,
            //     ''
            // );
            EditorUtils.setHtml(view, openingTagClippedHtmlSting);
            setGeneratingParagraph(false);
        }, 1000);
    };

    const handleInsertWriting = (event, data) => {
        event?.preventDefault();

        const schema = view.state.schema;
        const nodeType = schema.nodes.shortCode;
        const node = nodeType.createAndFill({ class: 'shortCode', style: '' });

        EditorUtils.insertNode(view, node);
        view.focus();

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
            EditorUtils.setHtml(view, closingTagClippedHtmlString);
        }, 1000);
    }

    const handleGenerateCallback = (res) => {
        if (res) {
            handleSubmit(null, res?.data.text);
        } else {
            setGeneratingParagraph(false);
        }
    };

    const handleGeneratepara = (event) => {
        event.preventDefault();
        const tr = view.state.tr;
        const nodesInRange = [];
        tr.doc.nodesBetween(0, tr.selection.$anchor?.pos, (node) =>
            nodesInRange.push(node)
        );
        let paraheading = null;
        for (let i = nodesInRange.length - 1; i >= 0; i--) {
            if (nodesInRange[ i ].type.name == 'heading') {
                paraheading = nodesInRange[ i ].textContent;
                break;
            }
        }
        setGeneratingParagraph(true);

        handleInsertWriting(null , '<span style="display: inline-block;background-color: #d0d0d0;padding: 0 5px;border-radius : 5px;">Writing paragraph... </span>')

        if (paraheading) {
            dispatch(
                contentGenerator(
                    `Write a paragraph about "${ paraheading }" for a blog article titled "${ title }"`,
                    handleGenerateCallback,
                    dispatch
                )
            );
        } else {
            dispatch(
                contentGenerator(
                    `Write a paragraph for a blog article titled "${ title }"`,
                    handleGenerateCallback,
                    dispatch
                )
            );
        }
    };

    return (
        <React.Fragment>
            <div
                onClick={ generatingParagraph || generatingBlog ? () => {} : handleGeneratepara }
                style={ {
                    padding: generatingParagraph ? '8px 12px' :'8px 10px',
                    cursor: generatingParagraph || generatingBlog ? 'not-allowed' :'pointer',
                    borderRadius: '5px',
                    background:
            'linear-gradient(90deg, #F87700 0%, #E32093 48.96%, #9747FF 92.19%)',
                } }
            >
                {generatingParagraph ? (
                    <Spinner animation="border" variant="light" size={ 'sm' } role="status" />
                ) : (
                    <img style={ { width: 20, height: 20 } } src={ GenerateIcon } />
                )}
            </div>
        </React.Fragment>
    );
};

ParaGenration.propTypes = {
    view: PropTypes.any,
    title: PropTypes.string,
    setGeneratingParagraph: PropTypes.bool,
    generatingBlog: PropTypes.bool,
    generatingParagraph: PropTypes.bool,
};
