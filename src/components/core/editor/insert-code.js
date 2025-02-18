import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { EditorUtils } from '@progress/kendo-react-editor';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'

export const InsertShortcodeTool = props => {
    const {
        view
    } = props;

    const [ open, setOpen ] = useState(false)
    const [ formData, setFormData ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(false)

    const toggleModal = () => {
        setOpen(!open)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const schema = view.state.schema;
        const nodeType = schema.nodes.shortCode;
        const node = nodeType.createAndFill(
            { class: 'shortCode', style: '' },
        );

        EditorUtils.insertNode(view, node);
        view.focus();

        setIsLoading(true);
        setTimeout(() => {
            const currentHtml = EditorUtils.getHtml(view.state);
            const openingTagClippedHtmlSting = currentHtml.replace(/<shortcode class="" style="">/g, formData);
            const closingTagClippedHtmlString = openingTagClippedHtmlSting.replace(/<\/shortcode>/g, '')
            EditorUtils.setHtml(view, closingTagClippedHtmlString)
            setOpen(!open);
            setFormData(null);
            setIsLoading(false);
        }, 1000)

    }

    const handleChange = (event) => {
        setFormData(event.target.value)
    }
    const handleModal = () => {
        setOpen(!open)
        setFormData(null)
    }

    const state = view && view.state;
    const schema = state && state.schema;
    const nodeType = schema ? schema.nodes.text : undefined;
    const canInsert = view && EditorUtils.canInsert(view.state, nodeType);

    return <React.Fragment>
        <Modal show={ open } onHide={ handleModal } className="image-upload-modal new-modal embed-link-modal" >
            {/* <div className="" style={ { background: 'red', opacity: '0.5', width: '100%', height: '100%', position: 'absolute' } }>
                <Loader size="large" type="infinite-spinner" />
            </div> */}
            <Modal.Header closeButton>
                <div className="new-modal-header">
                    <Modal.Title>Add Code Snippet</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={ (event) => handleSubmit(event) }>
                    <Form.Group>
                        <textarea
                            rows='8'
                            className='form-control'
                            value={ formData }
                            name='data'
                            onChange={ handleChange }
                            disabled={ isLoading }
                        />
                    </Form.Group>
                    <button type='submit' className='btn btn-primary' disabled={ isLoading }>{isLoading ? <Spinner animation="border" size={ 'sm' } role="status"></Spinner> : 'Add'}</button>
                </Form>
                <div id='tweetsample' style={ { height: '0px', width: '100%' } }></div>
            </Modal.Body>
        </Modal>
        <Button
            title="Paste Html"
            className='short-code-button'
            onClick={ () => { toggleModal() } }
            disabled={ !nodeType || !canInsert }
            type="button"
            size='small'
        >
            {/* <span className="k-icon k-i-paste-html" /> */}
            <span><img src={ require('../../../images/html-embed-icon.png') } alt="Short Code" /></span>
        </Button>
    </React.Fragment>;
};

InsertShortcodeTool.propTypes = {
    view: PropTypes.any
}