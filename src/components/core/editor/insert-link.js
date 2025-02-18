import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
// const { TextSelection } = ProseMirror;
import { EditorUtils } from '@progress/kendo-react-editor';
// const { Selection } = ProseMirror;
import { Modal, Row } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
// import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
// import { useDispatch } from 'react-redux';

export const InsertLinkTool = (props) => {
    // const dispatch = useDispatch()
    const { view } = props;

    const [ open, setOpen ] = useState(false);
    const [ values, setValues ] = useState({
        webAddress: '',
        title: '',
        openInNewTab: false,
        noFollow: false,
        sponsored: false,
    });

    const resetValues = () => {
        setValues({
            webAddress: '',
            title: '',
            openInNewTab: false,
            noFollow: false,
            sponsored: false,
        })
    }

    const toggleModal = () => {
        setOpen(!open);
        resetValues()
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const state = view && view.state;
        const selectionText = state?.doc?.cut(
            state.selection.from,
            state.selection.to
        )?.textContent;
        const schema = view.state.schema;
        const nodeType = schema.nodes.a;
        const textNode = schema.text(selectionText);
        const rel = values.noFollow && values.sponsored ? 'nofollow sponsored': values.noFollow ? 'nofollow' : values.sponsored ? 'sponsored' : '' ;
        const target = values.openInNewTab ? '_BLANK' : ''
        const node = nodeType.createAndFill(
            { href: values.webAddress, target : target, title : values.title, rel: rel },
            textNode
        );
        const transaction = state.tr;
        transaction.replaceSelectionWith(node);
        view.dispatch(transaction);

        toggleModal();
        resetValues();
    };

    // const handleChange = (event) => {
    //     // setFormData(event.target.value)
    // }
    const handleModal = () => {
        setOpen(!open);
        resetValues()
        // setFormData(null)
    };

    const state = view && view.state;
    const schema = state && state.schema;
    const nodeType = schema ? schema.nodes.text : undefined;
    const canInsert = view && EditorUtils.canInsert(view.state, nodeType);
    const selectionText = state?.doc?.cut(
        state.selection.from,
        state.selection.to
    )?.textContent;

    return (
        <React.Fragment>
            <Modal
                show={ open }
                onHide={ handleModal }
                className="image-upload-modal new-modal embed-link-modal"
            >
                {/* <div className="" style={ { background: 'red', opacity: '0.5', width: '100%', height: '100%', position: 'absolute' } }>
                <Loader size="large" type="infinite-spinner" />
            </div> */}
                <Modal.Header closeButton>
                    <div className="new-modal-header">
                        <Modal.Title>Insert hyperlink</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={ (event) => handleSubmit(event) } className="pl-2">
                        <Form.Group>
                            <Form.Label>Web address <sup className='text-danger'>*</sup></Form.Label>
                            <input
                                className="form-control"
                                value={ values.webAddress }
                                name="data"
                                onChange={ (e) =>
                                    setValues({ ...values, webAddress: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <input
                                className="form-control"
                                value={ values.title }
                                name="data"
                                onChange={ (e) =>
                                    setValues({ ...values, title: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group>
                            <label>
                                <input
                                    type="checkbox"
                                    name={ 'openInNewTab' }
                                    checked={ values.openInNewTab }
                                    onChange={ (event) => {
                                        if (event.target.checked) {
                                            setValues({ ...values, openInNewTab: true });
                                        } else {
                                            setValues({ ...values, openInNewTab: false });
                                        }
                                    } }
                                />
                                {' Open link in new window'}
                            </label>
                        </Form.Group>
                        <Form.Group>
                            <label>
                                <input
                                    type="checkbox"
                                    name={ 'noFollow' }
                                    checked={ values.noFollow }
                                    onChange={ (event) => {
                                        if (event.target.checked) {
                                            setValues({ ...values, noFollow: true });
                                        } else {
                                            setValues({ ...values, noFollow: false });
                                        }
                                    } }
                                />
                                {' No-Follow'}
                            </label>
                        </Form.Group>
                        <Form.Group>
                            <label>
                                <input
                                    type="checkbox"
                                    name={ 'sponsored' }
                                    checked={ values.sponsored }
                                    onChange={ (event) => {
                                        if (event.target.checked) {
                                            setValues({ ...values, sponsored: true });
                                        } else {
                                            setValues({ ...values, sponsored: false });
                                        }
                                    } }
                                />
                                {' Sponsored'}
                            </label>
                        </Form.Group>
                        <Row className="justify-content-center">
                            <button
                                type="reset"
                                className="btn btn-primary mr-4"
                                onClick={ toggleModal }
                                // disabled={ isLoading }
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary ml-4"
                                disabled={ !values.webAddress }
                            >
                                Insert
                            </button>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
            <Button
                title="Paste Html"
                className="short-code-button pt-2 pb-2"
                onClick={ () => {
                    toggleModal();
                } }
                disabled={ !selectionText || !nodeType || !canInsert }
                type="button"
                size="small"
            >
                <span className="k-icon k-i-link-horizontal" />
            </Button>
        </React.Fragment>
    );
};

InsertLinkTool.propTypes = {
    view: PropTypes.any,
};
